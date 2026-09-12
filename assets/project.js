// Project page viewer. The photographs are already in the HTML as <picture>
// elements — this only decides which one is visible and how wide the frame is.
// If it never runs, the first photograph still shows (see .no-js in project.css).
//
// Below STACK_BELOW the page stops being a viewer and becomes a scroll: every
// photograph in the flow, one under the other, paged by the browser. This file
// stands down there — it clears the sizes it wrote and ignores every gesture —
// and project.css does the rest. The two numbers must stay in step.

(function () {
  var frame = document.querySelector(".frame");
  var stage = document.querySelector(".stage");
  if (!frame || !stage) return;

  document.documentElement.classList.remove("no-js");

  var plates = [].slice.call(frame.querySelectorAll(".plate"));
  if (plates.length < 1) return;

  var counter = document.querySelector(".counter");
  var index = 0;

  var STACK_BELOW = 820; // keep in step with the media query in project.css
  var stackQuery = window.matchMedia("(max-width:" + STACK_BELOW + "px)");
  function stacked() { return stackQuery.matches; }

  // The closing plate is a statement, not a photograph, so it is not counted
  // when the count is spelled out.
  var photographs = plates.filter(function (p) {
    return !p.classList.contains("plate-statement");
  }).length;

  var sizes = plates.map(function (p) {
    return { w: +p.dataset.w || 1, h: +p.dataset.h || 1 };
  });

  // The widest photograph in the series sets the height, so a landscape and a
  // portrait sit at exactly the same height and the frame never moves
  // vertically. Below 1024px that would shrink everything to suit the widest
  // frame, so there it simply fills the space available.
  var widest = sizes.reduce(function (m, s) { return Math.max(m, s.w / s.h); }, 0);

  // Both set in project.css, so the sizing is tunable without touching this file.
  function cssNumber(name, fallback) {
    var n = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(name),
    );
    return isFinite(n) && n > 0 ? n : fallback;
  }

  function layout() {
    // In the stack the browser does the sizing. The width and height this
    // function wrote inline while the viewer was running would override it, so
    // they have to go rather than merely be ignored.
    if (stacked()) {
      frame.style.width = "";
      frame.style.height = "";
      return;
    }

    var s = sizes[index];
    var cs = getComputedStyle(stage);
    var availH = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    var availW = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (availH <= 0 || availW <= 0) return;

    // Three limits, whichever is smallest: a share of the height available, the
    // width the widest frame in the series needs, and the ceiling.
    var byHeight = availH * cssNumber("--plate-height-ratio", 1);
    var byWidth = availW / widest;
    var height = Math.min(byHeight, byWidth, cssNumber("--plate-max-height", Infinity));
    var scale = Math.min(height / s.h, availW / s.w);

    frame.style.width = Math.round(s.w * scale) + "px";
    frame.style.height = Math.round(s.h * scale) + "px";
  }

  function updateCounter() {
    if (!counter) return;
    counter.textContent = stacked()
      ? photographs + " photographs"
      : index + 1 + " / " + plates.length;
  }

  function show(n) {
    if (stacked()) return; // they are all on screen; there is nothing to show
    index = (n + plates.length) % plates.length;
    plates.forEach(function (p, k) { p.classList.toggle("on", k === index); });
    updateCounter();
    layout();
  }

  // Called at startup and whenever the window crosses the breakpoint, so a
  // rotation or a resized desktop window lands in the right mode rather than
  // keeping the other one's inline styles.
  function sync() {
    if (stacked()) {
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

  document.addEventListener("keydown", function (e) {
    if (stacked()) return; // the arrow keys belong to the scroll
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    var t = e.target;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (e.key === "ArrowLeft") { show(index - 1); e.preventDefault(); }
    else if (e.key === "ArrowRight") { show(index + 1); e.preventDefault(); }
  });

  var tx = 0, ty = 0;
  stage.addEventListener("touchstart", function (e) {
    if (stacked()) return;
    tx = e.touches[0].clientX;
    ty = e.touches[0].clientY;
  }, { passive: true });

  stage.addEventListener("touchend", function (e) {
    if (stacked()) return; // a sideways swipe must not steal the scroll
    var dx = e.changedTouches[0].clientX - tx;
    var dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy)) show(dx > 0 ? index - 1 : index + 1);
  });

  var pending;
  window.addEventListener("resize", function () {
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(layout);
  });

  if (stackQuery.addEventListener) stackQuery.addEventListener("change", sync);
  else stackQuery.addListener(sync); // Safari before 14

  sync();
})();
