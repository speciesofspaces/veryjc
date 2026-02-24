(() => {
  const header = document.querySelector(".header");
  const btn = document.querySelector(".nav-toggle");
  const panel = document.querySelector(".nav-panel");

  if (!header || !btn || !panel) return;

  const close = () => {
    header.classList.remove("menu-open");
    btn.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
  };

  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const open = header.classList.toggle("menu-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    panel.setAttribute("aria-hidden", open ? "false" : "true");
  };

  btn.addEventListener("click", toggle);

  document.addEventListener("click", (e) => {
    if (!header.classList.contains("menu-open")) return;
    if (panel.contains(e.target) || btn.contains(e.target)) return;
    close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();
