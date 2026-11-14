// The wall. Every photograph is already in the page; this only decides which
// ones are faded, and opens one large when it is clicked. Without it the wall
// still shows — the menu's series names simply do nothing.
//
//   hover a series name   its photographs stay, the rest fade (see --wall-fade
//                         in site.css); moving away puts the wall back
//   click a series name   the same, but it stays until it is clicked again or
//                         the section name is
//   hover a photograph    the same as hovering its series name
//   click a photograph    opens it large, inside its series: the menu marks the
//                         series, the count is the series' count, and ← → or
//                         the photograph's two halves step through it. Esc goes
//                         back to the wall as it was; so does any menu name.
//
// A series can be asked for in the address — studies.html#margin —
// which is how the menu on every other page links to one; holding a series
// here writes it into the address the same way, so a reload keeps it.
//
// Pink in the menu marks one thing at a time: the section name while the whole
// wall is showing, otherwise the series that is held or being pointed at.

(function () {
  var wall = document.getElementById("wall");
  var nav = document.getElementById("nav");
  var count = document.getElementById("count");
  var single = document.getElementById("single");
  if (!wall || !nav || !single) return;

  document.documentElement.classList.remove("no-js");

  var tiles = [].slice.call(wall.querySelectorAll(".tile"));
  var links = [].slice.call(nav.querySelectorAll("a[data-g]"));

  var ALL = "*";
  var held = ALL;        // the series that stays when nothing is pointed at

  function inGroup(tile, g) { return g === ALL || tile.dataset.g === g; }
  function members(g) { return tiles.filter(function (t) { return inGroup(t, g); }); }
  function say(text) { if (count) count.textContent = text; }

  // Move the pink to series g, or to the section name when g is the whole wall.
  function mark(g) {
    links.forEach(function (a) {
      var isSection = a.dataset.g === ALL;
      var on = a.dataset.g === g;
      a.classList.toggle(isSection ? "here" : "on", on);
      if (!isSection) {
        if (on) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      }
    });
  }

  // Fade everything outside series g and mark it in the menu. The wall shows
  // no count; the count line is only used while one photograph is open.
  function showGroup(g) {
    tiles.forEach(function (t) { t.classList.toggle("out", !inGroup(t, g)); });
    mark(g);
    say("");
  }

  // Where there is a real pointer, pointing previews; a short wait before the
  // wall is put back stops it blinking as the pointer crosses a gap.
  var canHover = window.matchMedia("(hover: hover)").matches;
  var restore = null;

  function preview(g) {
    if (!single.hidden) return;
    clearTimeout(restore);
    showGroup(g);
  }
  function endPreview() {
    if (!single.hidden) return;
    clearTimeout(restore);
    restore = setTimeout(function () { showGroup(held); }, 140);
  }

  links.forEach(function (a) {
    if (canHover) {
      a.addEventListener("mouseenter", function () { preview(a.dataset.g); });
      a.addEventListener("mouseleave", endPreview);
    }
    a.addEventListener("click", function (e) {
      e.preventDefault();
      clearTimeout(restore);
      // A second click on the series that is already held lets it go.
      held = held === a.dataset.g ? ALL : a.dataset.g;
      setSingle(false);
      showGroup(held);
      remember();
    });
  });

  tiles.forEach(function (t) {
    if (canHover) {
      t.addEventListener("mouseenter", function () { preview(t.dataset.g); });
      t.addEventListener("mouseleave", endPreview);
    }
    t.addEventListener("click", function () {
      clearTimeout(restore);
      openSingle(t);
    });
  });

  // ------------------------------------------------- one photograph, large
  var avif = single.querySelector('source[type="image/avif"]');
  var webp = single.querySelector('source[type="image/webp"]');
  var big = single.querySelector("img");
  var SIZES = "(max-width: 820px) 92vw, 80vh";
  var series = [];       // the photographs being stepped through
  var current = 0;

  function fill(tile) {
    var base = tile.dataset.base;
    var widths = tile.dataset.widths.split(",");
    function set(ext) {
      return widths.map(function (w) { return base + "-" + w + "." + ext + " " + w + "w"; }).join(", ");
    }
    if (avif) { avif.srcset = set("avif"); avif.sizes = SIZES; }
    if (webp) { webp.srcset = set("webp"); webp.sizes = SIZES; }
    big.width = +tile.dataset.w;
    big.height = +tile.dataset.h;
    big.alt = tile.querySelector("img").alt;
    big.classList.toggle("tall", tile.classList.contains("tall"));   // shown 3:4, as on the wall
    big.src = base + "-" + tile.dataset.jpg + ".jpg";
  }

  // On a phone the photograph takes the wall's place (.viewing, in site.css),
  // so the page is taken back to the top where it starts.
  var stage = single.parentNode;
  function setSingle(open) {
    single.hidden = !open;
    stage.classList.toggle("viewing", open);
    if (open && window.matchMedia("(max-width: 820px)").matches) window.scrollTo(0, 0);
  }

  function showSingle() {
    current = (current + series.length) % series.length;
    fill(series[current]);
    say(current + 1 + " / " + series.length);
  }

  // A photograph always opens inside its own series, whatever was held on the
  // wall — `held` is left alone so the arrow can go back to the wall as it was.
  function openSingle(tile) {
    series = members(tile.dataset.g);
    current = series.indexOf(tile);
    setSingle(true);
    mark(tile.dataset.g);
    showSingle();
  }

  function closeSingle() {
    if (single.hidden) return;
    setSingle(false);
    showGroup(held);
  }

  function step(by) { current += by; showSingle(); }

  single.querySelector(".prev").addEventListener("click", function () { step(-1); });
  single.querySelector(".next").addEventListener("click", function () { step(1); });

  document.addEventListener("keydown", function (e) {
    if (single.hidden) return;
    if (e.key === "Escape") closeSingle();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  // ------------------------------------------------- the address
  function linkFor(g) {
    return links.filter(function (a) { return a.dataset.g === g; })[0];
  }
  function remember() {
    var a = linkFor(held);
    var hash = held === ALL || !a ? "" : a.getAttribute("href");
    history.replaceState(null, "", location.pathname + location.search + hash);
  }
  function fromAddress() {
    held = ALL;
    links.forEach(function (a) {
      if (a.dataset.g !== ALL && a.getAttribute("href") === location.hash) held = a.dataset.g;
    });
    setSingle(false);
    showGroup(held);
  }
  window.addEventListener("hashchange", fromAddress);

  fromAddress();
})();
