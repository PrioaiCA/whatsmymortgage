import { renderContactCard } from './contactCard.js';

// Severity reads through value (how dark), not hue — accent is reserved
// for the page's one primary action, not multiplied across every note.
const NOTE_COLOR = { watch: 'var(--color-neutral-900)', good: 'var(--color-neutral-600)', context: 'var(--color-neutral-400)' };

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function renderResultMetrics(result) {
  // The header is always ink, never accent — a bad-news result reads through
  // the number and wording (already negative/framed as such), not a colored
  // panel. Accent stays reserved for the page's one primary action.
  const headerBg = 'var(--color-neutral-900)';
  const notes = result.notes || [];
  const tiles = result.tiles || [];
  const ledgerGroups = result.ledgerGroups || [];
  const assumptions = result.assumptions || [];

  return `
    <div class="result-header" style="background:${headerBg};color:#fff">
      <div class="result-kicker">${esc(result.label || '')}</div>
      <div class="result-big">${esc(result.bigValue || '')}</div>
      <div class="result-subtitle">${esc(result.subtitle || '')}</div>
    </div>
    <div class="result-tiles">
      ${tiles.map(t => `
        <div class="result-tile">
          <div class="result-tile-label">${esc(t.label)}</div>
          <div class="result-tile-value">${esc(t.value)}</div>
        </div>`).join('')}
    </div>
    ${notes.length ? `
      <div class="result-notes">
        ${notes.map(n => `<div class="result-note" style="border-left:2px solid ${NOTE_COLOR[n.tone] || NOTE_COLOR.context}">${esc(n.text)}</div>`).join('')}
      </div>` : ''}
    <details class="result-details">
      <summary>See every line</summary>
      ${ledgerGroups.map(grp => `
        <div class="ledger-group">
          <div class="ledger-header">${esc(grp.header)}</div>
          ${grp.rows.map(row => `
            <div class="ledger-row"><span>${esc(row.label)}</span><span>${esc(row.value)}</span></div>`).join('')}
        </div>`).join('')}
    </details>
    <details class="result-details">
      <summary>What this assumed</summary>
      <div class="ledger-group">
        ${assumptions.map(a => `
          <div class="assumption-row"><span>${esc(a.label)}</span><span>${esc(a.value)}</span></div>`).join('')}
      </div>
    </details>`;
}

/**
 * @param {object} result          output of a calc-math compute()
 * @param {object} contactOpts     forwarded to renderContactCard: {id, calculatorName, urgency, qualifier, intro}
 */
export function renderResultCard(result, contactOpts) {
  return `
    <div class="result-card">
      <div id="result-metrics">${renderResultMetrics(result)}</div>
      <div class="result-details" id="result-contact" style="padding:var(--space-4)">
        ${renderContactCard(contactOpts)}
      </div>
    </div>`;
}
