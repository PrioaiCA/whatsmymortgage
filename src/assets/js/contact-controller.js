import { renderContactCard, renderContactThanks, canSubmitFields } from './lib/contactCard.js';
import { getAttribution } from './attribution.js';
import { getLeadContext } from './leadContext.js';
import { track } from './lib/analytics.js';

// Per-placement in-memory field state, keyed by data-contact-id. Lets the
// homepage's general form and a calculator's embedded form live on the same
// page (they never do today, but keeps placements isolated regardless).
const fieldState = new Map();

function getFields(id) {
  if (!fieldState.has(id)) fieldState.set(id, { firstName: '', city: '', email: '', phone: '', consent: false, qualifier: '' });
  return fieldState.get(id);
}

function syncButton(container) {
  const btn = container.querySelector('[data-action="contactSubmit"]');
  if (btn) btn.disabled = !canSubmitFields(getFields(container.dataset.contactId));
}

async function submit(container) {
  const id = container.dataset.contactId;
  const fields = getFields(id);
  if (!canSubmitFields(fields)) return;

  // Honeypot: a real visitor never fills this hidden field.
  const honeypot = container.querySelector('[data-contact-field="company"]');
  if (honeypot && honeypot.value.trim()) return;

  const btn = container.querySelector('[data-action="contactSubmit"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

  const { firstTouch, lastTouch } = getAttribution();
  const leadCtx = getLeadContext();

  const payload = {
    firstName: fields.firstName,
    city: fields.city,
    email: fields.email,
    phone: fields.phone,
    consent: true,
    consentText: "MortgageMath.ca and the licensed mortgage agent it connects me with may contact me about mortgage options. I can withdraw consent at any time.",
    intentQualifier: fields.qualifier || null,
    calculator: container.dataset.calcName || 'unknown',
    urgency: container.dataset.urgency || 'unspecified',
    calculatorInputs: leadCtx ? leadCtx.inputs : null,
    calculatorResult: leadCtx ? leadCtx.result : null,
    pageUrl: window.location.href,
    referrer: document.referrer || '',
    firstTouch,
    lastTouch,
    timestamp: new Date().toISOString(),
    company: honeypot ? honeypot.value : ''
  };

  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('request failed');
    track('lead_submit', { placement: id, calculator: container.dataset.calcName || 'unknown', path: location.pathname });
    container.outerHTML = renderContactThanks(id);
  } catch (e) {
    const fresh = document.createElement('div');
    fresh.innerHTML = renderContactCard({
      id,
      calculatorName: container.dataset.calcName,
      urgency: container.dataset.urgency,
      fields,
      error: "That didn't go through. Please try again in a moment."
    });
    container.replaceWith(fresh.firstElementChild);
  }
}

export function initContactForms(root) {
  root = root || document.body;

  root.addEventListener('input', (e) => {
    const t = e.target;
    if (!t.matches('[data-contact-field]')) return;
    const container = t.closest('[data-contact-id]');
    if (!container) return;
    getFields(container.dataset.contactId)[t.dataset.contactField] = t.value;
    syncButton(container);
  });

  root.addEventListener('change', (e) => {
    const t = e.target;
    const container = t.closest('[data-contact-id]');
    if (!container) return;
    if (t.matches('[data-contact-consent]')) {
      getFields(container.dataset.contactId).consent = t.checked;
      syncButton(container);
    } else if (t.matches('[data-contact-field]')) {
      getFields(container.dataset.contactId)[t.dataset.contactField] = t.value;
      syncButton(container);
    }
  });

  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="contactSubmit"]');
    if (!btn) return;
    e.preventDefault();
    const container = btn.closest('[data-contact-id]');
    if (container) submit(container);
  });
}
