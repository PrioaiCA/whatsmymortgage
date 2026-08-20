import { routeFromTranscript } from '../lib/content.js';

const SLUGS = { afford: 'mortgage-affordability-calculator', renew: 'mortgage-renewal-calculator', equity: 'mortgage-refinance-calculator', penalty: 'mortgage-penalty-calculator', rent: 'rent-vs-buy-calculator' };

function submitAsk(text) {
  const errorEl = document.getElementById('ask-error');
  if (!text || !text.trim()) return;
  const lower = text.toLowerCase();
  if (/what (is|does|are)|meaning of|define/.test(lower)) {
    const term = text.replace(/what (is|does|are)|meaning of|define/gi, '').trim();
    window.location.href = '/mortgage-glossary/?q=' + encodeURIComponent(term);
    return;
  }
  const calc = routeFromTranscript(text);
  if (calc) { window.location.href = '/' + SLUGS[calc] + '/'; return; }
  if (errorEl) errorEl.hidden = false;
}

const input = document.getElementById('ask-input');
const submitBtn = document.getElementById('ask-submit');
if (submitBtn) submitBtn.addEventListener('click', () => submitAsk(input.value));
if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submitAsk(input.value); } });
document.querySelectorAll('[data-ask-query]').forEach((btn) => {
  btn.addEventListener('click', () => submitAsk(btn.dataset.askQuery));
});
