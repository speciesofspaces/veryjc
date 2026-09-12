// Project page viewer. The photographs are already in the HTML as <picture>
// elements — this only decides which one is visible and how wide the frame is.
// If it never runs, the first photograph still shows (see .no-js in project.css).

(function () {
  var frame = document.querySelector(".frame");
  var stage = document.querySelector(".stage");
  if (!frame || !stage) return;

  document.documentElement.classList.remove("no-js");

  var plates = [].slice.call(frame.querySelectorAll(".plate"));
  if (plates.length < 1) return;

  var counter = document.querySelector(".counter");
  var ticksEl = document.querySelector(".ticks");
  var index = 0;

  var sizes = plates.map(function (p) {
    return { w: +p.dataset.w || 1, h: +p.dataset.h || 1 };
  });

  // The widest photograph in the series sets the height, so a landscape and a
  // portrait sit at exactly the same height and the frame never moves
  // vertically. Below 1024px that would shrink everything to suit the widest
  // frame, so there it simply fills the space available.
  var widest = sizes.reduce(function (m, s) { return Math.max(m, s.w / s.h); }, 0);

  function layout() {
    var s = sizes[index];
    var cs = getComputedStyle(stage);
    var availH = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    var availW = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (availH <= 0 || availW <= 0) return;

    var height = window.innerWidth >= 1024 ? Math.min(availH, availW / widest) : availH;
    var scale = Math.min(height / s.h, availW / s.w);

    frame.style.width = Math.round(s.w * scale) + "px";
    frame.style.height = Math.round(s.h * scale) + "px";
  }

  function show(n) {
    index = (n + plates.length) % plates.length;
    plates.forEach(function (p, k) { p.classList.toggle("on", k === index); });
    if (counter) counter.textContent = (index + 1) + " / " + plates.length;
    if (ticksEl) {
      [].forEach.call(ticksEl.children, function (t, k) {
        t.classList.toggle("on", k === index);
      });
    }
    layout();
  }

  if (ticksEl) {
    ticksEl.replaceChildren.apply(ticksEl, plates.map(function () {
      var t = document.createElement("span");
      t.className = "tick";
      return t;
    }));
  }

  var prev = stage.querySelector(".zone.prev");
  var next = stage.querySelector(".zone.next");
  if (prev) prev.addEventListener("click", function () { show(index - 1); });
  if (next) next.addEventListener("click", function () { show(index + 1); });

  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    var t = e.target;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (e.key === "ArrowLeft") { show(index - 1); e.preventDefault(); }
    else if (e.key === "ArrowRight") { show(index + 1); e.preventDefault(); }
  });

  var tx = 0, ty = 0;
  stage.addEventListener("touchstart", function (e) {
    tx = e.touches[0].clientX;
    ty = e.touches[0].clientY;
  }, { passive: true });

  stage.addEventListener("touchend", function (e) {
    var dx = e.changedTouches[0].clientX - tx;
    var dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy)) show(dx > 0 ? index - 1 : index + 1);
  });

  var pending;
  window.addEventListener("resize", function () {
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(layout);
  });

  show(0);
})();
