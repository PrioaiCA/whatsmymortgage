// Pure HTML-string helper for the info-dot glossary button — shared between
// build-time page rendering and nothing else (the interactive tooltip
// itself is browser-only; see assets/js/tooltip.js).
export function termButton(term) {
  if (!term) return '';
  return `<button type="button" class="term-btn" data-term="${term}" aria-label="Definition">i</button>`;
}
