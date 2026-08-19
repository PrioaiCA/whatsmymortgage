import {
  PERSONA_NAME, TRUST_BADGES, CALC_CARDS, CALC_TITLES, SITUATION_CARDS, BASICS_PREVIEW,
  DOC_GROUPS, PROCESS_STEPS, RATE_NOTE, MISTAKES, SOURCE_NAMES, ROADMAP, SOURCE_GROUPS,
  METHOD_NOTES, ASK_CHIPS, BASICS_ITEMS, JARGON, MATCHED_LABELS
} from './content.js';
import { termButton } from './tooltip.js';
import { computers } from './calculators.js';
import { getCalcFields } from './calcFields.js';
import { formatDisplay } from './format.js';
import { renderResultCard } from './resultCard.js';
import { renderContactCard } from './contactCard.js';

export function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ───────────────────────── nav + footer ─────────────────────────

export function renderNav(state) {
  return `
  <div class="nav">
    <a class="nav-brand" href="#/">
      <span class="brand-mark">?</span>
      <span>What's My Mortgage<span style="color:var(--color-neutral-500);font-weight:400">.ca</span></span>
    </a>
    <div class="nav-links">
      <a href="#/jargon" ${state.view === 'jargon' ? "aria-current='page'" : ''}>Jargon, decoded</a>
      <a href="#/sources" ${state.view === 'sources' ? "aria-current='page'" : ''}>Sources &amp; method</a>
    </div>
  </div>`;
}

export function renderFooter() {
  return `
  <div class="site-footer">
    <div class="footer-grid">
      <div>
        <div class="footer-brand">
          <span class="brand-mark" style="width:22px;height:22px;font-size:13px">?</span>
          <span>What's My Mortgage<span style="color:var(--color-neutral-500);font-weight:400">.ca</span></span>
        </div>
        <p style="font-size:13px;opacity:.65;max-width:36ch;margin:0">Free calculators that run the same math a lender runs. Built for Ontario homebuyers and homeowners, not for ad clicks.</p>
      </div>
      <div>
        <h5 class="footer-heading">Calculators</h5>
        <div class="footer-links">
          <a href="#/afford">What you can afford</a>
          <a href="#/renew">Your renewal options</a>
          <a href="#/equity">Using your home equity</a>
          <a href="#/penalty">Leaving a mortgage early</a>
          <a href="#/rent">Renting compared to buying</a>
        </div>
      </div>
      <div>
        <h5 class="footer-heading">Company</h5>
        <div class="footer-links">
          <a href="#/about">About</a>
          <a href="#/sources">Sources &amp; method</a>
          <a href="#/jargon">Jargon, decoded</a>
          <a href="#/contact">Contact</a>
        </div>
      </div>
      <div>
        <h5 class="footer-heading">Legal</h5>
        <div class="footer-links">
          <a href="#/privacy">Privacy Policy</a>
          <a href="#/terms">Terms of Service</a>
        </div>
      </div>
    </div>
    <div class="footer-legal">
      <div class="footer-legal-inner">
        <p style="font-size:11px;opacity:.55;margin:0 0 6px;max-width:70ch">Disclaimer: this site provides calculators for informational purposes only and should not be considered financial advice. Consult a licensed mortgage professional for personalized guidance. Calculations are estimates and may vary based on lender-specific terms.</p>
        <p style="font-size:11px;opacity:.45;margin:0">© 2026 WhatsMyMortgage.ca. All rights reserved.</p>
        <p style="font-size:10px;opacity:.35;margin:6px 0 0"><a href="#/ad" style="color:inherit">Ad landing page (preview)</a></p>
      </div>
    </div>
  </div>`;
}

// ───────────────────────── home ─────────────────────────

export function renderDigDeeper(state) {
  const tab = state.homeTab;
  let body = '';
  if (tab === 'learn') {
    body = `
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-4)">
        <h3 style="margin:0">Learn the basics</h3>
        <a href="#/basics" style="font-size:13px;font-weight:800;font-family:var(--font-heading)">See everything →</a>
      </div>
      <div class="grid-auto-md" style="margin-bottom:var(--space-6)">
        ${BASICS_PREVIEW.map(b => `
          <div class="card" style="padding:var(--space-4);border:1px solid var(--color-divider);background:var(--color-bg)">
            <div class="card-title" style="font-size:15px">${esc(b.title)}</div>
            <p class="card-body" style="margin:6px 0 0">${esc(b.readTime)}</p>
          </div>`).join('')}
      </div>
      <h3 style="margin:0 0 var(--space-4)">What you'll need</h3>
      <div class="grid-auto-md">
        ${DOC_GROUPS.map(g => `
          <div class="card" style="padding:var(--space-4);border:1px solid var(--color-divider);background:var(--color-bg)">
            <div class="card-title" style="font-size:15px;margin-bottom:8px">${esc(g.title)}</div>
            ${g.items.map(item => `<div style="font-size:13px;padding:5px 0;border-bottom:1px solid var(--color-divider);opacity:.8">${esc(item)}</div>`).join('')}
          </div>`).join('')}
      </div>`;
  } else if (tab === 'process') {
    body = `
      <h3 style="margin:0 0 var(--space-2)">What happens next</h3>
      <p style="font-size:14px;opacity:.65;margin:0 0 var(--space-4);max-width:56ch">The actual sequence, start to finish.</p>
      <div class="process-strip">
        ${PROCESS_STEPS.map(step => `
          <div class="process-step">
            <div class="process-n">${esc(step.n)}</div>
            <div class="process-title">${esc(step.title)}</div>
            <p class="process-blurb">${esc(step.blurb)}</p>
            <div class="process-timing">${esc(step.timing)}</div>
          </div>`).join('')}
      </div>`;
  } else if (tab === 'rates') {
    body = `
      <div class="card elev-sm" style="padding:var(--space-6);display:flex;flex-wrap:wrap;gap:var(--space-4);justify-content:space-between;align-items:flex-start;background:var(--color-bg);margin-bottom:var(--space-6)">
        <div style="flex:1 1 320px">
          <h3 style="margin:0 0 6px">Rates, translated</h3>
          <p style="font-size:14px;opacity:.75;margin:0;max-width:56ch">${esc(RATE_NOTE)}</p>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;opacity:.5;margin-bottom:4px">Last updated</div>
          <div style="font-family:var(--font-heading);font-weight:800;font-size:14px">August 2026</div>
        </div>
      </div>
      <h3 style="margin:0 0 var(--space-4)">Common mistakes</h3>
      <div class="grid-auto-md">
        ${MISTAKES.map(m => `
          <div class="mistake">
            <div class="mistake-title">${esc(m.title)}</div>
            <p class="mistake-body">${esc(m.body)}</p>
          </div>`).join('')}
      </div>`;
  } else {
    body = `
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-3)">
        <h3 style="margin:0">Built on published sources</h3>
        <a href="#/sources" style="font-size:13px;font-weight:800;font-family:var(--font-heading)">Full methodology →</a>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:var(--space-3);margin-bottom:var(--space-6)">
        ${SOURCE_NAMES.map(src => `<span style="font-size:13px;padding:8px 12px;border:1px solid var(--color-divider);background:var(--color-bg)">${esc(src)}</span>`).join('')}
      </div>
      <h3 style="margin:0 0 var(--space-4)">What's live, what's coming</h3>
      <div style="border-top:1px solid var(--color-divider)">
        ${ROADMAP.map(r => `
          <div class="roadmap-row">
            <span>${esc(r.label)}</span>
            <span class="tag ${r.tagClass}">${esc(r.status)}</span>
          </div>`).join('')}
      </div>`;
  }
  return body;
}

export function renderHome(state) {
  return `
    <div class="hero container-mid">
      <h1>What's my mortgage?</h1>
      <p>Answers about buying, renewing, refinancing, or renting, worked out with the same math a lender uses. Tap the <span class="info-dot">i</span> beside any term you don't recognize.</p>
      <div style="display:flex;flex-wrap:wrap;gap:var(--space-3);margin-top:var(--space-6)">
        <a class="btn btn-primary" href="#/questionnaire">Answer a few quick questions</a>
        <a class="btn btn-secondary" href="#/voice">Just tell me what's going on</a>
        <a class="btn btn-secondary" href="#/basics">Start from the beginning</a>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:var(--space-6)">
        ${TRUST_BADGES.map(b => `<span class="tag tag-outline">${esc(b)}</span>`).join('')}
      </div>
    </div>

    <div class="section-shaded">
      <div class="section container">
        <h2 style="margin:0 0 6px">Where are you right now?</h2>
        <p style="font-size:14px;opacity:.65;margin:0 0 var(--space-4);max-width:56ch">Pick the sentence closest to your situation. It opens the right calculator and the right reading.</p>
        <div class="grid-auto">
          ${SITUATION_CARDS.map(s => `
            <a href="#/${s.view}" class="card elev-sm click-card" style="padding:var(--space-4)">
              <div class="card-title" style="margin-bottom:6px">${esc(s.title)}</div>
              <p class="card-body" style="margin:0">${esc(s.desc)}</p>
            </a>`).join('')}
        </div>

        <div style="margin-top:var(--space-8)">
          <h2 style="margin:0 0 6px">Ask ${esc(PERSONA_NAME)}</h2>
          <p style="font-size:14px;opacity:.65;margin:0 0 var(--space-4);max-width:56ch">${esc(PERSONA_NAME)} explains anything on this site in plain language, and points you at the right calculator. Available on every page.</p>
          <div class="card elev-sm" style="padding:var(--space-6);background:var(--color-bg)">
            <div style="display:flex;gap:var(--space-2);flex-wrap:wrap">
              <input id="ask-input" class="input" style="flex:1 1 260px" placeholder='Ask a question, like "what is loan-to-value?"' value="${esc(state.askQuery || '')}"/>
              <button type="button" class="btn btn-primary" data-action="askSubmitBox">Ask</button>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:var(--space-4)">
              ${ASK_CHIPS.map(chip => chip.jargon
                ? `<button type="button" class="tag tag-neutral" style="cursor:pointer;border:none" data-action="askJargon" data-term="${esc(chip.jargon)}">${esc(chip.label)}</button>`
                : `<button type="button" class="tag tag-neutral" style="cursor:pointer;border:none" data-action="askSubmit" data-query="${esc(chip.query)}">${esc(chip.label)}</button>`
              ).join('')}
            </div>
            ${state.askError ? `<p style="font-size:13px;opacity:.65;margin:var(--space-4) 0 0">${esc(PERSONA_NAME)} isn't sure about that one yet. Try the <a href="#/questionnaire">quick questionnaire</a> instead.</p>` : ''}
          </div>
        </div>
      </div>
    </div>

    <div class="section container" id="calc-grid">
      <h2 style="margin:0 0 var(--space-4)">Every calculator</h2>
      <div class="grid-auto-lg">
        ${CALC_CARDS.map(c => `
          <a href="#/${c.view}" class="card elev-sm click-card" style="padding:var(--space-4)">
            <span class="calc-glyph">${esc(c.glyph)}</span>
            <div class="card-title">${esc(c.title)}</div>
            <p class="card-body">${esc(c.desc)}</p>
            <div class="calc-open">Open →</div>
          </a>`).join('')}
      </div>
    </div>

    <div class="section-shaded">
      <div class="section container">
        <h2 style="margin:0 0 var(--space-4)">Dig deeper</h2>
        <div class="seg" style="margin-bottom:var(--space-6);display:inline-flex">
          <label class="seg-opt"><input type="radio" name="hometab" ${state.homeTab === 'learn' ? 'checked' : ''} data-action="setHomeTab" data-tab="learn"/>Learn</label>
          <label class="seg-opt"><input type="radio" name="hometab" ${state.homeTab === 'process' ? 'checked' : ''} data-action="setHomeTab" data-tab="process"/>Process</label>
          <label class="seg-opt"><input type="radio" name="hometab" ${state.homeTab === 'rates' ? 'checked' : ''} data-action="setHomeTab" data-tab="rates"/>Rates &amp; mistakes</label>
          <label class="seg-opt"><input type="radio" name="hometab" ${state.homeTab === 'sources' ? 'checked' : ''} data-action="setHomeTab" data-tab="sources"/>Sources &amp; roadmap</label>
        </div>
        <div id="dig-deeper-content">${renderDigDeeper(state)}</div>
      </div>
    </div>

    <div class="section container-narrow">
      <h2 style="margin:0 0 6px">Talk to a person</h2>
      <p style="font-size:14px;opacity:.65;margin:0 0 var(--space-4);max-width:56ch">Optional, and separate from every tool on this site. No calculator result ever requires this.</p>
      <div id="home-contact">${renderContactCard('home', 'General inquiry', '')}</div>
    </div>`;
}

// ───────────────────────── ad landing ─────────────────────────

export function renderAdLanding() {
  return `
    <div style="min-height:80vh;display:flex;align-items:center">
      <div style="max-width:640px;margin:0 auto;padding:var(--space-8) var(--space-4);text-align:left;width:100%">
        <h1 style="font-size:clamp(30px,5.2vw,46px);letter-spacing:-.03em;margin:0 0 var(--space-3)">What's my mortgage?</h1>
        <p style="font-size:16px;opacity:.75;max-width:52ch;margin:0 0 var(--space-6)">Three quick questions, then a real number, worked out with the same math a lender uses. Free, no signup.</p>
        <a class="btn btn-primary" href="#/questionnaire" style="justify-content:center;text-align:center;padding-inline:var(--space-6)">Get my number →</a>
      </div>
    </div>`;
}

// ───────────────────────── jargon ─────────────────────────

export function renderJargonList(state) {
  const q = (state.jargonQuery || '').toLowerCase();
  const list = JARGON.filter(j => !q || j.label.toLowerCase().includes(q) || j.def.toLowerCase().includes(q))
    .sort((a, b) => a.label.localeCompare(b.label));
  return list.map(j => `
    <div class="jargon-item">
      <div class="jargon-term">${esc(j.label)}</div>
      <p class="jargon-def">${esc(j.def)}</p>
    </div>`).join('') || `<p style="font-size:13px;opacity:.6">No terms match "${esc(state.jargonQuery)}".</p>`;
}

export function renderJargon(state) {
  return `
    <div class="container-narrow" style="padding-top:var(--space-6);padding-bottom:var(--space-8)">
      <a class="back-link" href="#/">← All calculators</a>
      <h2 style="margin:var(--space-3) 0 var(--space-3)">Jargon, decoded</h2>
      <input id="jargon-search" class="input" placeholder="Search a term" value="${esc(state.jargonQuery || '')}" style="margin-bottom:var(--space-6)"/>
      <div id="jargon-list">${renderJargonList(state)}</div>
    </div>`;
}

// ───────────────────────── basics ─────────────────────────

export function renderBasics() {
  return `
    <div style="max-width:760px;margin:0 auto;padding:var(--space-6) var(--space-4) var(--space-8)">
      <a class="back-link" href="#/">← All calculators</a>
      <h2 style="margin:var(--space-3) 0 var(--space-3)">Get to know mortgages</h2>
      <p style="font-size:15px;opacity:.75;max-width:60ch;margin:0 0 var(--space-6)">Five ideas worth knowing before you touch a calculator. Tap the <span class="info-dot">i</span> on any term for more.</p>
      <div>
        ${BASICS_ITEMS.map(b => `
          <div class="basics-item">
            <div class="basics-item-head">
              <h4 style="margin:0">${esc(b.title)}</h4>
              ${b.term ? termButton(b.term) : ''}
            </div>
            <p class="basics-body">${esc(b.body)}</p>
          </div>`).join('')}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:var(--space-3);margin-top:var(--space-6)">
        <a class="btn btn-primary" href="#/questionnaire">Take the quick questionnaire</a>
        <a class="btn btn-ghost" href="#/">Pick a calculator myself</a>
      </div>
    </div>`;
}

// ───────────────────────── questionnaire ─────────────────────────

export function getCurrentQuestion(state) {
  if (state.qStep === 0) {
    return {
      text: 'Do you already have a mortgage?',
      options: [
        { label: "No, I'm buying", action: 'qSetBranch', data: { branch: 'no' } },
        { label: 'Yes, I already own', action: 'qSetBranch', data: { branch: 'yes' } }
      ]
    };
  }
  if (state.qStep === 1) {
    if (state.qBranch === 'no') {
      return {
        text: 'What do you want to figure out?',
        options: [
          { label: 'How much I could afford', action: 'qSetTarget', data: { target: 'afford' } },
          { label: 'Whether renting or buying makes more sense', action: 'qSetTarget', data: { target: 'rent' } },
          { label: "I'm not sure yet, explain the basics first", action: 'qGotoBasics', data: {} }
        ]
      };
    }
    return {
      text: "What's going on with your mortgage?",
      options: [
        { label: 'My term is renewing soon', action: 'qSetTarget', data: { target: 'renew' } },
        { label: 'I want to access equity or pay off other debt', action: 'qSetTarget', data: { target: 'equity' } },
        { label: "I'm thinking about breaking it early", action: 'qSetTarget', data: { target: 'penalty' } },
        { label: 'Just curious how renting compares', action: 'qSetTarget', data: { target: 'rent' } }
      ]
    };
  }
  return {
    text: 'When are you looking to make a move?',
    options: [
      { label: 'Right now, actively working on it', action: 'qSetUrgency', data: { urgency: 'now' } },
      { label: 'In the next few months', action: 'qSetUrgency', data: { urgency: 'soon' } },
      { label: 'Just researching for now', action: 'qSetUrgency', data: { urgency: 'later' } }
    ]
  };
}

export function renderQuestionnaire(state) {
  const q = getCurrentQuestion(state);
  const backLabel = state.qStep > 0 ? 'Back' : 'All calculators';
  const back = state.qStep > 0
    ? `<button type="button" class="back-link" style="background:none;border:none;cursor:pointer" data-action="qBack">← ${backLabel}</button>`
    : `<a class="back-link" href="#/">← ${backLabel}</a>`;
  return `
    <div class="container-narrow" style="padding-top:var(--space-6);padding-bottom:var(--space-8)">
      ${back}
      <p class="q-eyebrow">Question ${state.qStep + 1} of 3</p>
      <h2 style="margin:0 0 var(--space-6)">${esc(q.text)}</h2>
      <div style="display:flex;flex-direction:column;gap:var(--space-3)">
        ${q.options.map(opt => `
          <button type="button" class="btn btn-secondary btn-block" style="padding:var(--space-4)" data-action="${opt.action}" ${Object.entries(opt.data).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ')}>${esc(opt.label)}</button>`).join('')}
      </div>
    </div>`;
}

// ───────────────────────── voice ─────────────────────────

export function renderVoicePanel(state) {
  const v = state.voice;
  if (!state.speechSupported) {
    return `
      <div class="card" style="padding:var(--space-6);text-align:center">
        <p style="font-size:14px;opacity:.75;margin:0 0 var(--space-4)">Voice input isn't supported in this browser. Try the questionnaire instead.</p>
        <a class="btn btn-primary" href="#/questionnaire">Answer a few questions</a>
      </div>`;
  }
  const btnClass = v.listening ? 'btn-secondary' : 'btn-primary';
  const btnLabel = v.listening ? 'Stop listening' : 'Start speaking';
  const transcriptDisplay = v.transcript || (v.listening ? 'Listening…' : 'Tap to speak.');
  return `
    <div class="card elev-sm" style="padding:var(--space-6);text-align:center">
      <button type="button" class="btn ${btnClass}" style="justify-content:center;text-align:center;width:100%" data-action="voiceToggle">${esc(btnLabel)}</button>
      <p class="voice-transcript">${esc(transcriptDisplay)}</p>
      ${v.error ? `<p style="color:var(--color-accent-700);font-size:13px;margin:var(--space-3) 0 0">${esc(v.error)}</p>` : ''}
      ${v.matched ? `
        <div style="margin-top:var(--space-6);padding-top:var(--space-6);border-top:1px solid var(--color-divider)">
          <p style="font-size:13px;opacity:.65;margin:0 0 var(--space-3)">Sounds like: <strong>${esc(MATCHED_LABELS[v.matched])}</strong></p>
          <a class="btn btn-primary" href="#/${v.matched}" style="justify-content:center;text-align:center;width:100%">Open it →</a>
        </div>` : ''}
      ${(!v.listening && v.transcript && !v.matched && !v.error) ? `<p style="font-size:13px;opacity:.65;margin:var(--space-4) 0 0">Didn't quite catch that. Try again, or <a href="#/questionnaire">answer a few questions instead</a>.</p>` : ''}
    </div>`;
}

export function renderVoice(state) {
  return `
    <div class="container-narrow" style="padding-top:var(--space-6);padding-bottom:var(--space-8)">
      <a class="back-link" href="#/">← All calculators</a>
      <h2 style="margin:var(--space-3) 0 var(--space-3)">Just tell me what's going on</h2>
      <p style="font-size:14px;opacity:.75;margin:0 0 var(--space-6)">Describe your situation in a sentence, like "my mortgage renews in three months" or "I want to know how much I can afford," and we'll open the right calculator.</p>
      <div id="voice-panel">${renderVoicePanel(state)}</div>
    </div>`;
}

// ───────────────────────── calculator ─────────────────────────

export function renderCalcForm(view, s, fields) {
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
    <p style="font-size:11px;opacity:.55;margin:var(--space-4) 0 0">Last reviewed August 2026 · rates and rules from <a href="#/sources">Sources &amp; method</a></p>`;
}

export function renderCalculator(state) {
  const view = state.view;
  const s = state[view];
  const fields = getCalcFields(view, s);
  const result = computers[view](s);
  return `
    <div class="container" style="padding-top:var(--space-6);padding-bottom:var(--space-8)">
      <a class="back-link" href="#/">← All calculators</a>
      <h2 style="margin:var(--space-3) 0 var(--space-6)">${esc(CALC_TITLES[view])}</h2>
      <div class="calc-layout">
        <div class="card elev-sm calc-form" id="calc-form">
          ${renderCalcForm(view, s, fields)}
        </div>
        <div class="calc-result-col" id="calc-result">
          ${renderResultCard(result, 'calc', CALC_TITLES[view], state.qUrgency || '')}
        </div>
      </div>
    </div>`;
}

// ───────────────────────── sources & static pages ─────────────────────────

export function renderSources() {
  return `
    <div class="container-narrow" style="padding-top:var(--space-6);padding-bottom:var(--space-8)">
      <a class="back-link" href="#/">← All calculators</a>
      <h2 style="margin:var(--space-3) 0 6px">Sources &amp; method</h2>
      <p style="font-size:11px;opacity:.55;margin:0 0 var(--space-3)">Last reviewed August 2026</p>
      <p style="font-size:15px;opacity:.8;max-width:60ch">Every rule on this site comes from a published federal or provincial source. Nothing is proprietary and nothing is guessed. Where a figure depends on something only a lender can confirm, the calculator says so instead of inventing precision.</p>
      <hr class="hr"/>
      ${SOURCE_GROUPS.map(g => `
        <div style="margin-bottom:var(--space-6)">
          <h4 style="margin:0 0 4px">${esc(g.title)}</h4>
          <p style="font-size:12px;opacity:.6;margin:0 0 var(--space-2)">${esc(g.note)}</p>
          ${g.links.map(l => `<div style="padding:6px 0;border-bottom:1px solid var(--color-divider);font-size:14px">${esc(l)}</div>`).join('')}
        </div>`).join('')}
      <hr class="hr"/>
      <h4 style="margin:0 0 var(--space-3)">Methodology notes</h4>
      ${METHOD_NOTES.map(m => `<div style="padding:8px 0;border-bottom:1px solid var(--color-divider);font-size:13px;line-height:1.5"><strong style="font-family:var(--font-heading)">${esc(m.t)}</strong> ${esc(m.d)}</div>`).join('')}
      <hr class="hr"/>
      <p style="font-size:11px;opacity:.55;line-height:1.6;max-width:64ch">WhatsMyMortgage.ca is an independent educational resource operated by [Legal Entity Name]. It is not a mortgage brokerage, lender, or insurer, and does not arrange, negotiate, or advise on mortgages. Asking to speak with someone connects you with a licensed mortgage agent, with no obligation. Confirm any agent's licence on FSRA's public registry before sharing financial documents. Every figure here is an estimate from the numbers you enter and published guidelines, not an approval, a rate guarantee, or personal advice. Penalties can only be confirmed by your current lender. Rates last reviewed August 2026.</p>
    </div>`;
}

export function renderAbout() {
  return `
    <div class="container-narrow" style="padding-top:var(--space-6);padding-bottom:var(--space-8)">
      <a class="back-link" href="#/">← All calculators</a>
      <h2 style="margin:var(--space-3) 0 var(--space-4)">About WhatsMyMortgage.ca</h2>
      <div style="display:flex;flex-direction:column;gap:var(--space-4);font-size:15px;line-height:1.7;opacity:.85;max-width:62ch">
        <p style="margin:0">We built this because most mortgage calculators online either oversimplify the math or exist to collect your information before showing you anything useful. Ours run the actual formulas a lender runs, in full, before asking for anything.</p>
        <p style="margin:0">WhatsMyMortgage.ca is an independent educational resource. We are not a mortgage brokerage, lender, or insurer, and we don't arrange or negotiate mortgages ourselves. When you ask to speak with someone, we connect you with a licensed mortgage agent, with no obligation and no cost to you.</p>
        <p style="margin:0">Every rule and formula behind these calculators is published, not proprietary. See exactly where the numbers come from on the <a href="#/sources">Sources &amp; method</a> page.</p>
      </div>
    </div>`;
}

export function renderContactPage() {
  return `
    <div class="container-narrow" style="padding-top:var(--space-6);padding-bottom:var(--space-8)">
      <a class="back-link" href="#/">← All calculators</a>
      <h2 style="margin:var(--space-3) 0 var(--space-4)">Contact</h2>
      <div style="display:flex;flex-direction:column;gap:var(--space-4);font-size:15px;line-height:1.7;opacity:.85;max-width:62ch">
        <p style="margin:0">Found an error in a calculator, have a question about how something is calculated, or want to report a broken link? Email us at <a href="mailto:hello@whatsmymortgage.ca">hello@whatsmymortgage.ca</a> and we'll get back to you.</p>
        <p style="margin:0">Looking to talk through your specific situation with a person instead? Open any calculator and use the "Connect me with an agent" form at the bottom of your results. That reaches a licensed mortgage agent directly, not us.</p>
      </div>
    </div>`;
}

export function renderPrivacy() {
  return `
    <div class="container-narrow" style="padding-top:var(--space-6);padding-bottom:var(--space-8)">
      <a class="back-link" href="#/">← All calculators</a>
      <h2 style="margin:var(--space-3) 0 6px">Privacy Policy</h2>
      <p style="font-size:11px;opacity:.55;margin:0 0 var(--space-4)">Last updated August 2026</p>
      <div style="display:flex;flex-direction:column;gap:var(--space-4);font-size:14px;line-height:1.7;opacity:.85;max-width:62ch">
        <p style="margin:0">There's no account and no signup. The numbers you enter into a calculator stay in your browser. We don't see them, store them, or send them anywhere unless you choose to submit the contact form.</p>
        <p style="margin:0">If you submit the "Connect me with an agent" form, we collect your first name, email, city, and phone number if you provide one, along with which calculator you were using. That information is shared with one licensed mortgage agent so they can follow up with you. We don't sell it, and we don't share it with anyone else.</p>
        <p style="margin:0">We use basic, aggregated analytics to understand which calculators are useful and where the site can improve. This does not identify you personally.</p>
        <p style="margin:0">To ask a question about this policy or request that your information be deleted, email <a href="mailto:privacy@whatsmymortgage.ca">privacy@whatsmymortgage.ca</a>.</p>
      </div>
    </div>`;
}

export function renderTerms() {
  return `
    <div class="container-narrow" style="padding-top:var(--space-6);padding-bottom:var(--space-8)">
      <a class="back-link" href="#/">← All calculators</a>
      <h2 style="margin:var(--space-3) 0 6px">Terms of Service</h2>
      <p style="font-size:11px;opacity:.55;margin:0 0 var(--space-4)">Last updated August 2026</p>
      <div style="display:flex;flex-direction:column;gap:var(--space-4);font-size:14px;line-height:1.7;opacity:.85;max-width:62ch">
        <p style="margin:0">WhatsMyMortgage.ca provides free calculators for informational and educational purposes only. Nothing on this site is financial, legal, or tax advice, and using it does not create an advisory relationship of any kind.</p>
        <p style="margin:0">Every figure produced by a calculator is an estimate based on the numbers you enter and publicly available guidelines. It is not an approval, a rate quote, or a guarantee, and actual results from a lender will differ. Confirm anything that matters, including penalties and exact eligibility, directly with your lender or a licensed mortgage professional.</p>
        <p style="margin:0">We do our best to keep the underlying rates and rules current, but we make no warranty as to accuracy and are not liable for decisions made based on these tools.</p>
        <p style="margin:0">These terms are governed by the laws of Ontario, Canada.</p>
      </div>
    </div>`;
}

const CALC_VIEWS = new Set(['afford', 'renew', 'equity', 'penalty', 'rent']);

export function renderMain(state) {
  const view = state.view;
  if (CALC_VIEWS.has(view)) return renderCalculator(state);
  switch (view) {
    case 'jargon': return renderJargon(state);
    case 'basics': return renderBasics();
    case 'questionnaire': return renderQuestionnaire(state);
    case 'voice': return renderVoice(state);
    case 'sources': return renderSources();
    case 'about': return renderAbout();
    case 'contact': return renderContactPage();
    case 'privacy': return renderPrivacy();
    case 'terms': return renderTerms();
    case 'home':
    default: return renderHome(state);
  }
}

export function renderPage(state) {
  if (state.view === 'ad') return renderAdLanding();
  return `${renderNav(state)}<div id="main-view">${renderMain(state)}</div>${renderFooter()}`;
}
