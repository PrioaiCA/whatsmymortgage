// Pure HTML-string helper for the info-dot glossary button — shared between
// build-time page rendering and nothing else (the interactive tooltip
// itself is browser-only; see assets/js/tooltip.js). It's a real anchor to
// the term's glossary entry, not just a JS tooltip trigger: a real internal
// link for crawlers and no-JS visitors, progressively enhanced with a
// hover/click preview by tooltip.js.
export function termButton(term) {
  if (!term) return '';
  return `<a href="/mortgage-glossary/#${term}" class="term-btn" data-term="${term}" aria-label="Definition">i</a>`;
}
