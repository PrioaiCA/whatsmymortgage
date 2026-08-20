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
    ${fields.toggles.map(t => t.select ? `
      <div class="toggle-row">
        <label class="toggle-label" for="select-${view}-${t.key}">${esc(t.label)}${t.term ? termButton(t.term) : ''}</label>
        <select class="input" id="select-${view}-${t.key}"
          data-toggle data-calc-view="${view}" data-key="${t.key}" ${t.numeric ? 'data-numeric' : ''}>
          ${(() => { let matched = false; return t.options.map(opt => {
            const isSelected = !matched && String(s[t.key]) === String(opt.value);
            if (isSelected) matched = true;
            return `<option value="${opt.value}" ${isSelected ? 'selected' : ''}>${esc(opt.label)}</option>`;
          }).join(''); })()}
        </select>
      </div>` : `
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
    <p style="font-size:var(--text-13);margin:var(--space-4) 0 0"><span style="color:color-mix(in srgb, var(--color-text) 70%, transparent)">Last reviewed August 2026 · rates and rules from</span> <a href="${sourcesHref || '/sources/'}">Sources &amp; method</a></p>`;
}
