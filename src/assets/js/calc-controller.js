import { renderResultMetrics } from './lib/resultCard.js';
import { formatDisplay } from './lib/format.js';
import { setLeadContext } from './leadContext.js';
import { track } from './lib/analytics.js';

/**
 * Wires one calculator page's already-server-rendered form to live updates.
 * @param {string} view                e.g. "afford"
 * @param {() => object} makeDefaultState  returns a fresh mutable copy of the calculator's default inputs
 * @param {(state: object) => object} compute
 */
export function initCalcPage(view, makeDefaultState, compute) {
  const form = document.getElementById('calc-form');
  const metricsEl = document.getElementById('result-metrics');
  if (!form || !metricsEl) return;

  const state = makeDefaultState();
  let completed = false;

  function trackCompletion() {
    if (completed) return;
    completed = true;
    track('calculator_complete', { calculator: view, path: location.pathname });
  }

  function publishContext(result) {
    setLeadContext({ calculator: view, inputs: { ...state }, result: { label: result.label, bigValue: result.bigValue, subtitle: result.subtitle } });
  }

  function patchResult() {
    const openStates = Array.from(metricsEl.querySelectorAll('details')).map(d => d.open);
    const result = compute(state);
    metricsEl.innerHTML = renderResultMetrics(result);
    metricsEl.querySelectorAll('details').forEach((d, i) => { if (openStates[i]) d.open = true; });
    publishContext(result);
  }

  publishContext(compute(state));

  form.addEventListener('input', (e) => {
    const t = e.target;
    if (!t.matches('[data-slider]')) return;
    const { key, format } = t.dataset;
    state[key] = parseFloat(t.value);
    const disp = document.getElementById('disp-' + key);
    if (disp) disp.textContent = formatDisplay(format, state[key]);
    patchResult();
    trackCompletion();
  });

  form.addEventListener('change', (e) => {
    const t = e.target;
    if (!t.matches('[data-toggle]')) return;
    const { key } = t.dataset;
    state[key] = t.hasAttribute('data-numeric') ? Number(t.dataset.value) : t.dataset.value;
    patchResult();
    trackCompletion();
  });
}
