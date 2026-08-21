// The Calculators nav dropdown is a plain <details> — works with zero JS.
// This only adds the closes-on-outside-click/Escape polish.
export function initNavDropdown(root) {
  root = root || document.body;
  const dropdown = root.querySelector('.nav-dropdown');
  if (!dropdown) return;

  document.addEventListener('click', (e) => {
    if (dropdown.open && !e.composedPath().includes(dropdown)) dropdown.open = false;
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdown.open) {
      dropdown.open = false;
      dropdown.querySelector('summary').focus();
    }
  });
}
