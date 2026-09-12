// Replaces the pointer with a small ring that reacts to what is under it:
// it fills coral over anything clickable, and becomes a directional pill over
// the two halves of a project photograph.
//
// Desktop only. Anything without a fine pointer keeps its native cursor, and
// the ring is never the only signal — the underlying elements are still real
// links and buttons.

(function () {
  var FINE = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1025px)");
  if (!FINE.matches) return;

  var dot = document.createElement("div");
  dot.className = "custom-cursor";
  dot.setAttribute("aria-hidden", "true");
  document.body.appendChild(dot);
  document.documentElement.classList.add("has-custom-cursor");

  var x = 0, y = 0, queued = false;

  function place() {
    queued = false;
    dot.style.transform = "translate(" + x + "px, " + y + "px)";
  }

  document.addEventListener("mousemove", function (e) {
    x = e.clientX;
    y = e.clientY;
    if (!queued) {
      queued = true;
      requestAnimationFrame(place);
    }
    if (!dot.classList.contains("visible")) dot.classList.add("visible");
  }, { passive: true });

  document.addEventListener("mouseleave", function () {
    dot.classList.remove("visible");
  });

  // What is under the pointer decides the shape.
  var CLICKABLE = 'a[href], button, [role="button"], summary, label[for], input, select, textarea';

  function update(target) {
    if (!target || !target.closest) return;

    var zone = target.closest(".zone");
    if (zone) {
      dot.classList.remove("active");
      dot.classList.add("directional");
      dot.classList.toggle("left", zone.classList.contains("prev"));
      dot.classList.toggle("right", zone.classList.contains("next"));
      return;
    }

    dot.classList.remove("directional", "left", "right");
    dot.classList.toggle("active", !!target.closest(CLICKABLE));
  }

  document.addEventListener("mouseover", function (e) { update(e.target); });
  document.addEventListener("mousemove", function (e) { update(e.target); }, { passive: true });

  // A click should register as one.
  document.addEventListener("mousedown", function () { dot.classList.add("pressed"); });
  document.addEventListener("mouseup", function () { dot.classList.remove("pressed"); });

  // Give the ring back if the pointer stops being a mouse.
  FINE.addEventListener("change", function (e) {
    if (!e.matches) {
      dot.remove();
      document.documentElement.classList.remove("has-custom-cursor");
    }
  });
})();
