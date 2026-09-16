// Project page viewer. The photographs are already in the HTML as <picture>
// elements; this only decides which one is showing and how the frame is sized.
// If it never runs, the first photograph still shows (see .no-js in project.css).
//
// Three modes, matching the three blocks in project.css:
//
//   viewer  wide   the frame is one fixed window for the whole series and the
//                  photographs slide through it sideways, the arriving one
//                  pushing the last out; you click the halves or press ← →.
//   pager   narrow the stage is a window and the frame is a track; the
//                  photographs are a column moved a whole screen at a time,
//                  by an upward or downward swipe, a tap, or ↑ ↓.
//   stack   narrow and short — a phone on its side, or any window too short
//                  to give the picture a usable box. The page becomes an
//                  ordinary scroll and this file does nothing at all.
//
// The breakpoints below must stay in step with project.css.

(function () {
  var frame = document.querySelector(".frame");
  var stage = document.querySelector(".stage");
  if (!frame || !stage) return;

  document.documentElement.classList.remove("no-js");

  var counter = document.querySelector(".counter");
  var index = 0;

  var plates = [].slice.call(frame.querySelectorAll(".plate"));
  if (plates.length < 1) {
    // A project that exists in the menu but has no photographs yet. The count is
    // written into the page as a placeholder, and "1 / 1" against an empty
    // stage reads like a fault rather than an empty room.
    if (counter) counter.textContent = "";
    return;
  }

  var NARROW = 820;
  var SHORT = 560;
  var narrowQuery = window.matchMedia("(max-width:" + NARROW + "px)");
  var shortQuery = window.matchMedia(
    "(max-width:" + NARROW + "px) and (max-height:" + SHORT + "px)",
  );

  function mode() {
    if (shortQuery.matches) return "stack";
    return narrowQuery.matches ? "pager" : "viewer";
  }

  var sizes = plates.map(function (p) {
    return { w: +p.dataset.w || 1, h: +p.dataset.h || 1 };
  });

  // The widest photograph in the series sets the height, so a landscape and a
  // portrait sit at exactly the same height and the frame never moves
  // vertically. Only used in viewer mode.
  var widest = sizes.reduce(function (m, s) { return Math.max(m, s.w / s.h); }, 0);

  // Both set in project.css, so the sizing is tunable without touching this file.
  function cssNumber(name, fallback) {
    var n = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(name),
    );
    return isFinite(n) && n > 0 ? n : fallback;
  }

  function layout() {
    var m = mode();

    if (m !== "viewer") {
      // The width and height written inline while the viewer was running would
      // override the stylesheet, so they are cleared rather than ignored. So
      // would the transforms the slide leaves on the plates — in the pager the
      // plates are flex items in a track and must sit at the origin.
      frame.style.width = "";
      frame.style.height = "";
      clearSlide();
    }
    if (m === "pager") {
      frame.style.setProperty("--i", String(index));
      return;
    }
    frame.style.removeProperty("--i");
    if (m === "stack") return;

    var cs = getComputedStyle(stage);
    var availH = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    var availW = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (availH <= 0 || availW <= 0) return;

    // One window for the whole series, not a box that takes each photograph's
    // own shape. A slide needs somewhere to slide through: if the window
    // changed size as the plates moved, the arriving photograph would be
    // re-fitted while it was still travelling. So the window is sized once,
    // from the widest photograph in the series, and every plate is contained
    // inside it — a portrait in a series that also holds a landscape simply
    // leaves air either side.
    //
    // Three limits, whichever is smallest: a share of the height available,
    // the width the widest photograph needs, and the ceiling.
    var byHeight = availH * cssNumber("--plate-height-ratio", 1);
    var byWidth = availW / widest;
    var height = Math.min(byHeight, byWidth, cssNumber("--plate-max-height", Infinity));

    frame.style.width = Math.round(height * widest) + "px";
    frame.style.height = Math.round(height) + "px";
  }

  // ---------------------------------------------------------------- slide ---
  // Only two plates ever move: the one leaving and the one arriving. They
  // travel together by a whole window width, so the window is always full.
  // Everything else is parked at the origin with nothing showing.
  var SLIDE_MS = 480;
  var SLIDE_EASE = "cubic-bezier(.22,.68,.28,1)";
  var slideTimer = null;
  var reduceQuery = window.matchMedia("(prefers-reduced-motion:reduce)");

  // Puts every plate back to rest: no inline transition, no transform, and
  // only the current one showing. Called when the slide finishes, when a new
  // slide starts (so a fast second click cannot strand the first one's
  // outgoing plate half way across), and when the viewer hands over to the
  // pager, whose plates must sit at the origin to stack into a track.
  function clearSlide(except) {
    clearTimeout(slideTimer);
    slideTimer = null;
    plates.forEach(function (p, k) {
      if (except && except.indexOf(k) !== -1) return;
      p.style.transition = "none";
      p.style.transform = "";
      p.classList.toggle("on", k === index);
    });
  }

  function slide(from, dir) {
    var out = plates[from];
    var into = plates[index];
    if (!out || !into || out === into) return;

    clearSlide([from, index]);

    // The arriving plate is placed off the edge it is coming from, made
    // visible, and only then given a transition — otherwise it would animate
    // in from wherever it happened to be.
    into.style.transition = "none";
    into.style.transform = "translateX(" + dir * 100 + "%)";
    into.classList.add("on");
    void into.offsetWidth;

    into.style.transition = "transform " + SLIDE_MS + "ms " + SLIDE_EASE;
    out.style.transition = "transform " + SLIDE_MS + "ms " + SLIDE_EASE;
    into.style.transform = "translateX(0%)";
    out.style.transform = "translateX(" + -dir * 100 + "%)";

    slideTimer = setTimeout(function () { clearSlide(); }, SLIDE_MS);
  }

  // In the pager the other plates are genuinely off screen, so a lazy image
  // would not start loading until it had already been swiped to and the frame
  // would land blank. Promoting the neighbours to eager as the index moves
  // keeps a swipe ahead of the reader. In the viewer every plate sits at
  // inset:0 and counts as in view, so this never mattered there.
  function preload(n) {
    var plate = plates[(n + plates.length) % plates.length];
    if (!plate) return;
    var img = plate.querySelector("img");
    if (img && img.loading === "lazy") img.loading = "eager";
  }

  // The chevrons above and below the photo space. Built here rather than written
  // into every project page's markup, and placed as siblings of the stage so
  // they sit outside the transformed track — anything inside it slides away with
  // the photographs. project.css shows them only in the pager.
  var arrows = null;
  function buildArrows() {
    var parent = stage.parentNode;
    if (arrows || !parent) return;

    var up = document.createElement("button");
    up.type = "button";
    up.className = "nav-arrow up";
    up.setAttribute("aria-label", "Previous photograph");
    up.innerHTML = '<span aria-hidden="true"></span>';

    var down = up.cloneNode(true);
    down.className = "nav-arrow down";
    down.setAttribute("aria-label", "Next photograph");

    parent.insertBefore(up, stage);
    parent.insertBefore(down, stage.nextSibling);

    up.addEventListener("click", function () { show(index - 1); });
    down.addEventListener("click", function () { show(index + 1); });

    arrows = { up: up, down: down };
  }

  function refreshArrows() {
    if (!arrows) return;
    arrows.up.classList.toggle("disabled", index === 0);
    arrows.down.classList.toggle("disabled", index === plates.length - 1);
  }

  // The count is drawn as one hairline rule per photograph rather than "3/7".
  // The rules are built once and then only their class changes, so nothing
  // reflows as the viewer moves. Screen readers get the position in words from
  // the visually-hidden span, which is what the aria-live region announces —
  // a row of rules says nothing out loud.
  var rules = null;
  var counterText = null;

  function buildCounter() {
    if (!counter || rules) return;
    counter.textContent = "";
    var row = document.createElement("span");
    row.className = "rules";
    row.setAttribute("aria-hidden", "true");
    rules = [];
    for (var i = 0; i < plates.length; i++) {
      var r = document.createElement("span");
      r.className = "rule";
      row.appendChild(r);
      rules.push(r);
    }
    counterText = document.createElement("span");
    counterText.className = "counter-text";
    counter.appendChild(row);
    counter.appendChild(counterText);
  }

  function updateCounter() {
    if (!counter) return;
    buildCounter();
    var stacked = mode() === "stack";
    counter.classList.toggle("counter-stacked", stacked);
    if (stacked) {
      counterText.textContent = plates.length + " photographs";
      return;
    }
    counterText.textContent = index + 1 + " of " + plates.length;
    for (var i = 0; i < rules.length; i++) {
      rules[i].classList.toggle("on", i === index);
    }
  }

  function show(n) {
    var m = mode();
    if (m === "stack") return; // they are all on screen already
    var was = index;

    // The pager is bounded, not looping: an arrow that greys out at the end
    // implies an end, and the reference site works the same way. The wide
    // viewer keeps wrapping, as it always has.
    index =
      m === "pager"
        ? Math.max(0, Math.min(plates.length - 1, n))
        : (n + plates.length) % plates.length;

    if (m === "viewer" && index !== was && !reduceQuery.matches) {
      // Which way the photographs travel. Every caller moves by one, so the
      // only jumps are the two ends meeting: last to first reads forward,
      // first to last reads back.
      var step = index - was;
      if (step === plates.length - 1) step = -1;
      else if (step === -(plates.length - 1)) step = 1;
      slide(was, step > 0 ? 1 : -1);
    } else {
      clearSlide();
    }
    updateCounter();
    refreshArrows();
    layout();
    preload(index + 1);
    preload(index - 1);
  }

  // Run at startup and whenever the window crosses a breakpoint, so a rotation
  // or a resized desktop window lands in the right mode rather than keeping the
  // previous one's inline styles.
  function sync() {
    if (mode() === "stack") {
      layout();
      updateCounter();
    } else {
      show(index);
    }
  }

  var prev = stage.querySelector(".zone.prev");
  var next = stage.querySelector(".zone.next");
  if (prev) prev.addEventListener("click", function () { show(index - 1); });
  if (next) next.addEventListener("click", function () { show(index + 1); });

  // The tap halves are hidden in the pager: they live inside the frame, and a
  // transformed element is the containing block for everything inside it, so
  // they would slide away with the track. The stage does not move, so the tap
  // is read off it instead.
  var swipedAt = 0;
  stage.addEventListener("click", function (e) {
    if (mode() !== "pager") return;
    if (Date.now() - swipedAt < 400) return; // the tail of a swipe, not a tap
    var box = stage.getBoundingClientRect();
    show(e.clientY < box.top + box.height / 2 ? index - 1 : index + 1);
  });

  document.addEventListener("keydown", function (e) {
    var m = mode();
    if (m === "stack") return; // the arrow keys belong to the scroll
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    var t = e.target;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;

    var back = e.key === "ArrowLeft" || (m === "pager" && e.key === "ArrowUp");
    var on = e.key === "ArrowRight" || (m === "pager" && e.key === "ArrowDown");
    if (back) { show(index - 1); e.preventDefault(); }
    else if (on) { show(index + 1); e.preventDefault(); }
  });

  var tx = 0, ty = 0;
  stage.addEventListener("touchstart", function (e) {
    if (mode() === "stack") return;
    tx = e.touches[0].clientX;
    ty = e.touches[0].clientY;
  }, { passive: true });

  stage.addEventListener("touchend", function (e) {
    var m = mode();
    if (m === "stack") return; // a swipe must not steal the scroll
    var dx = e.changedTouches[0].clientX - tx;
    var dy = e.changedTouches[0].clientY - ty;

    if (m === "pager") {
      // Up moves on, the way a scroll would.
      if (Math.abs(dy) > 44 && Math.abs(dy) > Math.abs(dx)) {
        swipedAt = Date.now();
        show(dy < 0 ? index + 1 : index - 1);
      }
      return;
    }
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy)) show(dx > 0 ? index - 1 : index + 1);
  });

  var pending;
  window.addEventListener("resize", function () {
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(layout);
  });

  [narrowQuery, shortQuery].forEach(function (q) {
    if (q.addEventListener) q.addEventListener("change", sync);
    else q.addListener(sync); // Safari before 14
  });

  buildArrows();
  sync();
})();
