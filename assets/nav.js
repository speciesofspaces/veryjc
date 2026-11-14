// The menu. A section that is not a page of its own ("Projects") is a button:
// pointing at it opens its list (site.css), and on a touch screen, where there
// is no pointing, tapping it opens and closes the list instead.

(function () {
  [].forEach.call(document.querySelectorAll("#nav button.nav-top"), function (button) {
    button.addEventListener("click", function () {
      var group = button.closest(".nav-group");
      var open = !group.classList.contains("open");
      group.classList.toggle("open", open);
      button.setAttribute("aria-expanded", String(open));
    });
  });
})();
