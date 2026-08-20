// One shared line-icon set (24x24 grid, round caps/joins, 1.75 stroke) so
// every icon on the site — nav, hero, journey cards, calculator headings —
// reads as the same family. Colour comes from CSS via currentColor.
const PATHS = {
  home: '<path d="M3 9.5 12 2l9 7.5"/><path d="M5 8v12a1 1 0 0 0 1 1h4v-7h4v7h4a1 1 0 0 0 1-1V8"/>',
  refresh: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  'trending-up': '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>',
  swap: '<path d="M6 8h13l-3.5-3.5"/><path d="M18 16H5l3.5 3.5"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  'chevron-down': '<polyline points="6 9 12 15 18 9"/>',
  shield: '<path d="M12 21.5s7.5-3.8 7.5-9.5V5.3L12 2.5 4.5 5.3V12c0 5.7 7.5 9.5 7.5 9.5z"/>',
  menu: '<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>'
};

export function iconSvg(name, size = 20) {
  const paths = PATHS[name] || '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;
}
