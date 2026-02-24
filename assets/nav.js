(() => {
  const header = document.querySelector(".header");
  if (!header) return;

  const btn = header.querySelector(".nav-toggle");
  const panel = header.querySelector(".nav-panel");
  if (!btn || !panel) return;

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

  // click outside closes
  document.addEventListener("click", (e) => {
    if (!header.classList.contains("menu-open")) return;
    if (panel.contains(e.target) || btn.contains(e.target)) return;
    close();
  });

  // escape closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // if resizing to desktop, close
  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 721px)").matches) close();
  });
})();
