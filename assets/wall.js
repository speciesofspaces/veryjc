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
      if (upright.matches) openSingle(members(held)[0], held);
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
    if (open && window.matchMedia("(max-width: 820px), (max-height: 500px)").matches) window.scrollTo(0, 0);
  }

  function showSingle(dir) {
    current = (current + series.length) % series.length;
    fill(series[current]);
    // On an upright phone the new photograph slides in from the way it came.
    big.classList.remove("from-below", "from-above");
    if (dir) { void big.offsetWidth; big.classList.add(dir > 0 ? "from-below" : "from-above"); }
    say(current + 1 + " / " + series.length);
    if (upArrow) upArrow.classList.toggle("disabled", current === 0);
    if (downArrow) downArrow.classList.toggle("disabled", current === series.length - 1);
  }

  // A photograph always opens inside its own series, whatever was held on the
  // wall — `held` is left alone so the arrow can go back to the wall as it was.
  // On an upright phone there is no wall: the page always shows one
  // photograph, stepping through whatever is held — all of Studies, or one
  // series picked in the menu.
  function openSingle(tile, group) {
    var g = group || tile.dataset.g;
    series = members(g);
    current = Math.max(0, series.indexOf(tile));
    setSingle(true);
    mark(g);
    showSingle();
  }
  var upright = window.matchMedia("(max-width: 820px) and (orientation: portrait)");
  function uprightStart() {
    if (upright.matches) openSingle(members(held)[0], held);
    else closeSingle();
  }
  if (upright.addEventListener) upright.addEventListener("change", uprightStart);

  function closeSingle() {
    if (single.hidden || upright.matches) return;
    setSingle(false);
    showGroup(held);
  }

  // On a phone the series has two ends (the arrows grey out); on a wide
  // screen it goes round.
  var narrow = window.matchMedia("(max-width: 820px), (max-height: 500px)");
  var upArrow = single.querySelector(".nav-arrow.up");
  var downArrow = single.querySelector(".nav-arrow.down");
  function step(by) {
    var was = current;
    current = narrow.matches ? Math.max(0, Math.min(series.length - 1, current + by)) : current + by;
    if (current !== was) showSingle(by);
  }

  // Swipe: up or down on an upright phone, sideways anywhere.
  var x0 = 0, y0 = 0;
  single.addEventListener("touchstart", function (e) {
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
  }, { passive: true });
  single.addEventListener("touchend", function (e) {
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (upright.matches && Math.abs(dy) > 44 && Math.abs(dy) > Math.abs(dx)) step(dy < 0 ? 1 : -1);
    else if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
  });
  if (upArrow) upArrow.addEventListener("click", function () { step(-1); });
  if (downArrow) downArrow.addEventListener("click", function () { step(1); });

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
    single.hidden = true;
    stage.classList.remove("viewing");
    showGroup(held);
    if (upright.matches) openSingle(members(held)[0], held);
  }
  window.addEventListener("hashchange", fromAddress);

  fromAddress();
})();
