// A single shared floating tooltip for every info-dot term button on the
// page (`<button class="term-btn" data-term="...">`). Hover to preview,
// click to pin, Escape/outside-click/scroll to dismiss.
import { TERMS } from './lib/content.js';

let pinnedTerm = null;
let hoveredTerm = null;
let el = null;

function ensureEl() {
  if (el) return el;
  el = document.createElement('div');
  el.className = 'term-tooltip';
  el.setAttribute('role', 'tooltip');
  el.hidden = true;
  document.body.appendChild(el);
  return el;
}

function activeTerm() {
  return pinnedTerm || hoveredTerm;
}

function render() {
  const node = ensureEl();
  const key = activeTerm();
  if (!key) {
    node.hidden = true;
    return;
  }
  const entry = TERMS[key] || ['Term', 'Definition coming soon.'];
  node.innerHTML = `<div class="term-tooltip-title">${escapeHtml(entry[0])}</div><div class="term-tooltip-def">${escapeHtml(entry[1])}</div>`;
  node.hidden = false;
  const btn = document.querySelector(`.term-btn[data-term="${cssEscape(key)}"]`);
  if (!btn) { node.hidden = true; return; }
  const r = btn.getBoundingClientRect();
  const flipAbove = window.innerHeight - r.bottom < 170;
  node.style.left = Math.max(8, Math.min(r.left, window.innerWidth - 310 - 8)) + 'px';
  if (flipAbove) {
    node.style.top = 'auto';
    node.style.bottom = (window.innerHeight - r.top + 5) + 'px';
  } else {
    node.style.bottom = 'auto';
    node.style.top = (r.bottom + 5) + 'px';
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function cssEscape(s) {
  return String(s).replace(/["\\]/g, '\\$&');
}

function close() {
  pinnedTerm = null;
  hoveredTerm = null;
  render();
}

export function initTooltips(root) {
  root = root || document.body;
  root.addEventListener('mouseover', (e) => {
    const btn = e.target.closest('.term-btn');
    if (!btn) return;
    hoveredTerm = btn.dataset.term;
    render();
  });
  root.addEventListener('mouseout', (e) => {
    const btn = e.target.closest('.term-btn');
    if (!btn) return;
    if (btn.contains(e.relatedTarget)) return;
    hoveredTerm = null;
    render();
  });
  root.addEventListener('focusin', (e) => {
    const btn = e.target.closest('.term-btn');
    if (!btn) return;
    hoveredTerm = btn.dataset.term;
    render();
  });
  root.addEventListener('focusout', (e) => {
    const btn = e.target.closest('.term-btn');
    if (!btn) return;
    hoveredTerm = null;
    render();
  });
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('.term-btn');
    if (!btn) return;
    pinnedTerm = pinnedTerm === btn.dataset.term ? null : btn.dataset.term;
    render();
  });
  document.addEventListener('mousedown', (e) => {
    if (!pinnedTerm) return;
    if (e.target.closest('.term-btn') || e.target.closest('.term-tooltip')) return;
    close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && (pinnedTerm || hoveredTerm)) close();
  });
  window.addEventListener('scroll', () => { if (pinnedTerm || hoveredTerm) close(); }, true);
}
