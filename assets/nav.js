// The menu.
//
// A section that is not a page of its own is a button: pointing at it opens
// its list (site.css), and on a touch screen tapping it opens and closes it.
//
// On a phone held upright the menu has one line per section and opens
// sideways: the first tap on Projects or Studies lays its pages out on that
// line (site.css greys the word); a second tap goes to the section's page.

(function () {
  [].forEach.call(document.querySelectorAll("#nav button.nav-top"), function (button) {
    button.addEventListener("click", function () {
      var group = button.closest(".nav-group");
      var open = !group.classList.contains("open");
      group.classList.toggle("open", open);
      button.setAttribute("aria-expanded", String(open));
    });
  });

  var upright = window.matchMedia("(max-width: 820px) and (orientation: portrait)");
  [].forEach.call(document.querySelectorAll("#nav a.nav-top"), function (link) {
    var group = link.closest(".nav-group");
    if (!group.querySelector(".nav-sub a")) return;
    link.addEventListener("click", function (e) {
      if (!upright.matches || group.classList.contains("open")) return;
      e.preventDefault();
      // Only one section opened by a tap at a time; the one you are in stays.
      [].forEach.call(document.querySelectorAll("#nav .nav-group.tapped"), function (g) {
        g.classList.remove("open", "tapped");
      });
      group.classList.add("open", "tapped");
    });
  });
})();
