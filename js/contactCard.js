// The "Connect me with an agent" lead-capture card. Each placement (the
// homepage's general form, or the one nested in a calculator's result) keeps
// its own local state, keyed by a placement id, so switching calculators
// doesn't leak values between forms. Submitting only logs a placeholder
// record — there is no backend wired up yet.
const forms = new Map();

function freshForm() {
  return { fields: { firstName: '', city: '', email: '', phone: '', consent: false }, submitted: false };
}

export function resetContactForms() {
  forms.clear();
}

function getForm(id) {
  if (!forms.has(id)) forms.set(id, freshForm());
  return forms.get(id);
}

export function canSubmitForm(id) {
  const f = getForm(id).fields;
  return !!(f.firstName.trim() && f.email.trim() && f.consent);
}

export function setContactField(id, key, value) {
  getForm(id).fields[key] = value;
}

export function submitContactForm(id, calculatorName, urgency) {
  const form = getForm(id);
  if (!canSubmitForm(id)) return false;
  const record = {
    ...form.fields,
    calculator: calculatorName || 'unknown',
    urgency: urgency || 'unspecified',
    consentText: 'MortgageMath.ca and the licensed mortgage agent it connects me with may contact me about mortgage options. I can withdraw consent at any time.',
    consent: true,
    timestamp: new Date().toISOString()
  };
  // Placeholder for the real lead-intake webhook.
  console.log('lead submission (webhook placeholder)', record);
  form.submitted = true;
  return true;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function renderContactCard(id, calculatorName, urgency) {
  const form = getForm(id);
  if (form.submitted) {
    return `
      <div class="contact-card" data-contact-id="${id}">
        <div style="text-align:center;padding:var(--space-4) 0">
          <h4 style="margin:0 0 6px">That's on its way.</h4>
          <p style="font-size:13px;opacity:.75;margin:0">A licensed mortgage agent will reach out soon.</p>
        </div>
      </div>`;
  }
  const f = form.fields;
  const disabled = canSubmitForm(id) ? '' : 'disabled';
  return `
    <div class="contact-card" data-contact-id="${id}" data-calc-name="${esc(calculatorName || '')}" data-urgency="${esc(urgency || '')}">
      <div>
        <h4 style="margin:0 0 6px">Want a person to look at it?</h4>
        <p style="font-size:13px;opacity:.75;margin:0;max-width:56ch">These figures use one rate and general guidelines. Every lender sets its own rules on income type, credit, and property, and products differ well beyond rate. MortgageMath can connect you with a licensed mortgage agent who will say which lenders would actually take your file.</p>
      </div>
      <div class="contact-fields">
        <div class="field"><label>First name</label><input class="input" data-contact-field="firstName" value="${esc(f.firstName)}"/></div>
        <div class="field"><label>City</label><input class="input" data-contact-field="city" value="${esc(f.city)}"/></div>
        <div class="field"><label>Email</label><input class="input" type="email" data-contact-field="email" value="${esc(f.email)}"/></div>
        <div class="field"><label>Phone (optional)</label><input class="input" data-contact-field="phone" value="${esc(f.phone)}"/></div>
      </div>
      <label class="contact-consent">
        <input type="checkbox" data-contact-consent ${f.consent ? 'checked' : ''} style="margin-top:2px"/>
        <span>MortgageMath.ca and the licensed mortgage agent it connects me with may contact me about mortgage options. I can withdraw consent at any time.</span>
      </label>
      <button type="button" class="btn btn-primary btn-block" data-action="contactSubmit" ${disabled} style="justify-content:center;text-align:center">Connect me with an agent</button>
      <p style="font-size:11px;opacity:.55;margin:0">Optional. Everything above stays on your screen either way — we send your details to one licensed agent, not a list of them.</p>
    </div>`;
}
