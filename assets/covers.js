// The Projects page. Pointing at a project — its name in the menu or its
// row — keeps that row and fades the rest, the way Studies does,
// and moves the pink in the menu from "Projects" to the project's name.

(function () {
  var covers = [].slice.call(document.querySelectorAll(".prow[data-p]"));
  var links = [].slice.call(document.querySelectorAll("#nav a[data-p]"));
  if (!covers.length || !window.matchMedia("(hover: hover)").matches) return;

  var ALL = "*";
  var restore = null;

  function show(p) {
    covers.forEach(function (c) { c.classList.toggle("out", p !== ALL && c.dataset.p !== p); });
    links.forEach(function (a) {
      a.classList.toggle(a.dataset.p === ALL ? "here" : "on", a.dataset.p === p);
    });
  }
  function preview(p) { clearTimeout(restore); show(p); }
  function end() {
    clearTimeout(restore);
    restore = setTimeout(function () { show(ALL); }, 140);
  }

  links.concat(covers).forEach(function (el) {
    if (el.dataset.p === ALL) return;
    el.addEventListener("mouseenter", function () { preview(el.dataset.p); });
    el.addEventListener("mouseleave", end);
  });
})();
