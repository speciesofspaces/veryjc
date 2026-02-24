(() => {
  const header = document.querySelector('.header');
  if (!header) return;

  const btn = header.querySelector('.nav-toggle');
  const panel = header.querySelector('#navPanel');
  if (!btn || !panel) return;

  const open = () => {
    document.documentElement.classList.add('nav-open');
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    const firstLink = panel.querySelector('a');
    if (firstLink) firstLink.focus({ preventScroll: true });
  };

  const close = () => {
    document.documentElement.classList.remove('nav-open');
    btn.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
    btn.focus({ preventScroll: true });
  };

  const isOpen = () => document.documentElement.classList.contains('nav-open');

  btn.addEventListener('click', () => (isOpen() ? close() : open()));

  panel.addEventListener('click', (e) => {
    const t = e.target;
    if (t && t.closest && t.closest('a')) close();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) close();
  });

  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 721px)').matches && isOpen()) close();
  });
})();
