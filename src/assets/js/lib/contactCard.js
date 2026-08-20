// Pure, environment-agnostic renderer for the "Connect me with an agent"
// lead form. Runs at 11ty build time (to server-render the empty form so
// crawlers see real markup) and is re-used by the browser controller
// (assets/js/contact-controller.js) to redraw the form after an error.
// Consent wording and the "no result is ever gated" rule are unchanged —
// only an optional intent-qualifier field and honeypot are new.
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export const CONSENT_TEXT = "What's My Mortgage and the licensed mortgage agent it connects me with may contact me about mortgage options. I can withdraw consent at any time.";

const DEFAULT_FIELDS = { firstName: '', city: '', email: '', phone: '', consent: false, qualifier: '' };

export function canSubmitFields(f) {
  return !!(f.firstName && f.firstName.trim() && f.email && f.email.trim() && f.consent);
}

/**
 * @param {object} opts
 * @param {string} opts.id           unique placement id (e.g. "home", "calc")
 * @param {string} opts.calculatorName
 * @param {string} [opts.urgency]
 * @param {{key:string,label:string,options:string[]}} [opts.qualifier] one extra intent-qualifying field
 * @param {string} [opts.intro]      copy shown above the fields, varies by intent tier
 * @param {string} [opts.ctaLabel]   button label — make it specific to the situation, not generic
 * @param {object} [opts.fields]     current field values (defaults to empty)
 * @param {string} [opts.error]      inline error to display, if any
 */
export function renderContactCard(opts) {
  const { id, calculatorName = '', urgency = '', qualifier = null, intro, ctaLabel, error } = opts;
  const f = { ...DEFAULT_FIELDS, ...(opts.fields || {}) };
  const disabled = canSubmitFields(f) ? '' : 'disabled';
  const introText = intro || "These figures use one rate and general guidelines. Every lender sets its own rules on income type, credit, and property, and products differ well beyond rate. What's My Mortgage can connect you with a licensed mortgage agent who will say which lenders would actually take your file.";
  const buttonLabel = ctaLabel || 'Connect me with an agent';
  return `
    <div class="contact-card" data-contact-id="${id}" data-calc-name="${esc(calculatorName)}" data-urgency="${esc(urgency)}">
      <div>
        <h2 style="margin:0 0 6px;font-size:var(--text-21);letter-spacing:var(--track-21)">Want a person to look at it?</h2>
        <p style="font-size:var(--text-13);opacity:.75;margin:0;max-width:56ch">${esc(introText)}</p>
      </div>
      <div class="contact-fields">
        <div class="field"><label for="${id}-firstName">First name</label><input id="${id}-firstName" class="input" data-contact-field="firstName" value="${esc(f.firstName)}" autocomplete="given-name"/></div>
        <div class="field"><label for="${id}-city">City</label><input id="${id}-city" class="input" data-contact-field="city" value="${esc(f.city)}" autocomplete="address-level2"/></div>
        <div class="field"><label for="${id}-email">Email</label><input id="${id}-email" class="input" type="email" data-contact-field="email" value="${esc(f.email)}" autocomplete="email"/></div>
        <div class="field"><label for="${id}-phone">Phone (optional)</label><input id="${id}-phone" class="input" data-contact-field="phone" value="${esc(f.phone)}" autocomplete="tel"/></div>
      </div>
      ${qualifier ? `
      <div class="field">
        <label for="${id}-qualifier">${esc(qualifier.label)}</label>
        <select id="${id}-qualifier" class="input" data-contact-field="qualifier">
          <option value="" ${f.qualifier === '' ? 'selected' : ''}>Prefer not to say</option>
          ${qualifier.options.map(opt => `<option value="${esc(opt)}" ${f.qualifier === opt ? 'selected' : ''}>${esc(opt)}</option>`).join('')}
        </select>
      </div>` : ''}
      <label class="contact-consent" for="${id}-consent">
        <input id="${id}-consent" type="checkbox" data-contact-consent ${f.consent ? 'checked' : ''} style="margin-top:2px"/>
        <span>${esc(CONSENT_TEXT)}</span>
      </label>
      <div aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden">
        <label for="${id}-company">Leave this field blank</label><input id="${id}-company" type="text" tabindex="-1" autocomplete="off" data-contact-field="company"/>
      </div>
      ${error ? `<p style="font-size:var(--text-13);color:var(--color-accent-700);margin:0" role="alert">${esc(error)}</p>` : ''}
      <button type="button" class="btn btn-primary btn-block" data-action="contactSubmit" ${disabled} style="justify-content:center;text-align:center">${esc(buttonLabel)}</button>
      <p class="trust-note">Optional. Free either way. Nothing beyond this submission is stored, it goes to one licensed agent — not a list — and every rule this site uses is <a href="/sources/">published</a>.</p>
    </div>`;
}

export function renderContactThanks(id) {
  return `
    <div class="contact-card" data-contact-id="${id}">
      <div style="text-align:center;padding:var(--space-4) 0">
        <h2 style="margin:0 0 6px;font-size:var(--text-21);letter-spacing:var(--track-21)">That's on its way.</h2>
        <p style="font-size:var(--text-13);opacity:.75;margin:0">A licensed mortgage agent will reach out soon.</p>
      </div>
    </div>`;
}
