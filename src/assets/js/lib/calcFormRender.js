import { termButton } from './terms.js';
import { formatDisplay } from './format.js';

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function renderCalcForm(view, s, fields, sourcesHref) {
  return `
    ${fields.sliders.map(f => `
      <div class="slider-row">
        <div class="slider-row-head">
          <label class="slider-label">${esc(f.label)}${f.term ? termButton(f.term) : ''}</label>
          <span class="slider-value" id="disp-${f.key}">${formatDisplay(f.format, s[f.key])}</span>
        </div>
        <input type="range" min="${f.min}" max="${f.max}" step="${f.step}" value="${s[f.key]}"
          data-slider data-calc-view="${view}" data-key="${f.key}" data-format="${f.format}"
          aria-label="${esc(f.label)}"/>
      </div>`).join('')}
    ${fields.toggles.map(t => `
      <div class="toggle-row">
        <div class="toggle-label">${esc(t.label)}${t.term ? termButton(t.term) : ''}</div>
        <div class="seg">
          ${t.options.map(opt => `
            <label class="seg-opt">
              <input type="radio" name="toggle-${view}-${t.key}" ${String(s[t.key]) === String(opt.value) ? 'checked' : ''}
                data-toggle data-calc-view="${view}" data-key="${t.key}" data-value="${opt.value}" ${t.numeric ? 'data-numeric' : ''}/>${esc(opt.label)}
            </label>`).join('')}
        </div>
      </div>`).join('')}
    <p style="font-size:11px;opacity:.55;margin:var(--space-4) 0 0">Last reviewed August 2026 · rates and rules from <a href="${sourcesHref || '/sources/'}">Sources &amp; method</a></p>`;
}
