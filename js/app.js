import { defaultCalcState, computers } from './calculators.js';
import { routeFromTranscript } from './content.js';
import { formatDisplay } from './format.js';
import { renderResultMetrics } from './resultCard.js';
import { setContactField, canSubmitForm, submitContactForm, resetContactForms, renderContactCard } from './contactCard.js';
import { initTooltips } from './tooltip.js';
import { renderPage, renderDigDeeper, renderJargonList, renderVoicePanel } from './views.js';

const VALID_VIEWS = new Set([
  'home', 'afford', 'renew', 'equity', 'penalty', 'rent',
  'jargon', 'basics', 'questionnaire', 'voice', 'sources',
  'about', 'contact', 'privacy', 'terms', 'ad'
]);
const CALC_VIEWS = new Set(Object.keys(computers));

const state = {
  view: 'home',
  qStep: 0, qBranch: null, qTarget: null, qUrgency: null,
  jargonQuery: '', askError: false, homeTab: 'learn',
  voice: { listening: false, transcript: '', matched: null, error: null },
  speechSupported: typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  ...defaultCalcState()
};

const root = document.getElementById('app');
let recognition = null;

function fullRender() {
  root.innerHTML = renderPage(state);
  window.scrollTo(0, 0);
}

function parseView(hash) {
  const v = (hash || '').replace(/^#\/?/, '');
  return VALID_VIEWS.has(v) ? v : 'home';
}

function onHashChange() {
  const next = parseView(location.hash);
  const prev = state.view;
  state.view = next;
  if (next === 'questionnaire' && prev !== 'questionnaire') {
    state.qStep = 0; state.qBranch = null; state.qTarget = null; state.qUrgency = null;
  }
  if (next === 'voice' && prev !== 'voice') {
    if (recognition) { try { recognition.stop(); } catch (e) { /* already stopped */ } recognition = null; }
    state.voice = { listening: false, transcript: '', matched: null, error: null };
  }
  if (next !== prev) resetContactForms();
  fullRender();
}

// ───────────────────────── ask + voice ─────────────────────────

function submitAsk(text) {
  if (!text || !text.trim()) return;
  const lower = text.toLowerCase();
  if (/what (is|does|are)|meaning of|define/.test(lower)) {
    state.jargonQuery = text.replace(/what (is|does|are)|meaning of|define/gi, '').trim();
    location.hash = '#/jargon';
    return;
  }
  const calc = routeFromTranscript(text);
  if (calc) { location.hash = '#/' + calc; return; }
  state.askError = true;
  fullRender();
}

function patchVoicePanel() {
  const el = document.getElementById('voice-panel');
  if (el) el.innerHTML = renderVoicePanel(state);
}

function startVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    state.voice = { ...state.voice, error: "Voice input isn't supported in this browser." };
    patchVoicePanel();
    return;
  }
  const rec = new SR();
  rec.continuous = false; rec.interimResults = true; rec.lang = 'en-CA';
  rec.onresult = (e) => {
    let t = '';
    for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
    state.voice = { ...state.voice, transcript: t };
    patchVoicePanel();
  };
  rec.onerror = () => {
    state.voice = { ...state.voice, listening: false, error: "Didn't catch that. Try again or pick manually." };
    patchVoicePanel();
  };
  rec.onend = () => {
    state.voice = { ...state.voice, listening: false, matched: routeFromTranscript(state.voice.transcript) };
    patchVoicePanel();
  };
  recognition = rec;
  state.voice = { listening: true, transcript: '', matched: null, error: null };
  patchVoicePanel();
  rec.start();
}

function stopVoice() {
  if (recognition) recognition.stop();
}

// ───────────────────────── calculator live updates ─────────────────────────

function patchCalcResult() {
  const view = state.view;
  if (!CALC_VIEWS.has(view)) return;
  const metricsEl = document.getElementById('result-metrics');
  if (!metricsEl) return;
  const openStates = Array.from(metricsEl.querySelectorAll('details')).map(d => d.open);
  const result = computers[view](state[view]);
  metricsEl.innerHTML = renderResultMetrics(result);
  metricsEl.querySelectorAll('details').forEach((d, i) => { if (openStates[i]) d.open = true; });
}

function syncContactButton(container) {
  const btn = container.querySelector('[data-action="contactSubmit"]');
  if (btn) btn.disabled = !canSubmitForm(container.dataset.contactId);
}

// ───────────────────────── click actions ─────────────────────────

const actions = {
  qSetBranch(btn) { state.qBranch = btn.dataset.branch; state.qStep = 1; fullRender(); },
  qSetTarget(btn) { state.qTarget = btn.dataset.target; state.qStep = 2; fullRender(); },
  qSetUrgency(btn) { state.qUrgency = btn.dataset.urgency; location.hash = '#/' + state.qTarget; },
  qBack() { state.qStep = Math.max(0, state.qStep - 1); fullRender(); },
  qGotoBasics() { location.hash = '#/basics'; },
  setHomeTab(btn) {
    state.homeTab = btn.dataset.tab;
    const el = document.getElementById('dig-deeper-content');
    if (el) el.innerHTML = renderDigDeeper(state);
  },
  askSubmit(btn) { submitAsk(btn.dataset.query); },
  askJargon(btn) { state.jargonQuery = btn.dataset.term; location.hash = '#/jargon'; },
  askSubmitBox() {
    const el = document.getElementById('ask-input');
    submitAsk(el ? el.value : '');
  },
  voiceToggle() { if (state.voice.listening) stopVoice(); else startVoice(); },
  contactSubmit(btn) {
    const container = btn.closest('[data-contact-id]');
    if (!container) return;
    const id = container.dataset.contactId;
    const ok = submitContactForm(id, container.dataset.calcName, container.dataset.urgency);
    if (ok) container.outerHTML = renderContactCard(id, container.dataset.calcName, container.dataset.urgency);
  }
};

// ───────────────────────── event delegation ─────────────────────────

root.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const handler = actions[el.dataset.action];
  if (!handler) return;
  e.preventDefault();
  handler(el, e);
});

root.addEventListener('input', (e) => {
  const t = e.target;
  if (t.matches('[data-slider]')) {
    const { calcView, key, format } = t.dataset;
    state[calcView][key] = parseFloat(t.value);
    const disp = document.getElementById('disp-' + key);
    if (disp) disp.textContent = formatDisplay(format, state[calcView][key]);
    patchCalcResult();
    return;
  }
  if (t.id === 'jargon-search') {
    state.jargonQuery = t.value;
    const list = document.getElementById('jargon-list');
    if (list) list.innerHTML = renderJargonList(state);
    return;
  }
  if (t.matches('[data-contact-field]')) {
    const container = t.closest('[data-contact-id]');
    if (!container) return;
    setContactField(container.dataset.contactId, t.dataset.contactField, t.value);
    syncContactButton(container);
  }
});

root.addEventListener('change', (e) => {
  const t = e.target;
  if (t.matches('[data-toggle]')) {
    const { calcView, key } = t.dataset;
    const value = t.hasAttribute('data-numeric') ? Number(t.dataset.value) : t.dataset.value;
    state[calcView][key] = value;
    patchCalcResult();
    return;
  }
  if (t.matches('[data-contact-consent]')) {
    const container = t.closest('[data-contact-id]');
    if (!container) return;
    setContactField(container.dataset.contactId, 'consent', t.checked);
    syncContactButton(container);
  }
});

root.addEventListener('keydown', (e) => {
  if (e.target.id === 'ask-input' && e.key === 'Enter') {
    e.preventDefault();
    submitAsk(e.target.value);
  }
});

// ───────────────────────── boot ─────────────────────────

initTooltips(root);
window.addEventListener('hashchange', onHashChange);
onHashChange();
