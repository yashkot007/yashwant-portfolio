(() => {
  const root = document.getElementById('portfolio');
  const button = root?.querySelector('[data-toggle-theme]');
  if (!root || !button) return;
  const label = button.querySelector('[data-theme-label]');
  const icon = button.querySelector('[data-theme-icon]');
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const action = theme === 'dark' ? 'Light mode' : 'Dark mode';
    label.textContent = action;
    button.setAttribute('aria-label', `Switch to ${action.toLowerCase()}`);
    icon.textContent = theme === 'dark' ? '☼' : '☾';
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#181A18' : '#F5F3EA';
  }
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  button.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
    try { localStorage.setItem('yk-portfolio-theme', theme); } catch {}
  });
  window.addEventListener('storage', event => {
    if (event.key === 'yk-portfolio-theme') applyTheme(event.newValue === 'dark' ? 'dark' : 'light');
  });
  function openHashTarget() {
    const id = location.hash.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (target?.tagName === 'DETAILS') target.open = true;
  }
  root.querySelectorAll('[data-open-resume]').forEach(link => link.addEventListener('click', () => {
    const target = document.getElementById(link.hash.slice(1));
    if (target?.tagName === 'DETAILS') target.open = true;
  }));
  window.addEventListener('hashchange', openHashTarget);
  openHashTarget();
})();
