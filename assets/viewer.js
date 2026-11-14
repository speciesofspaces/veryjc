// A project page: one photograph at a time. Every plate is already in the
// page; this only decides which one shows. The left and right halves of the
// picture, the ← → keys and a sideways swipe step through them; the count in
// the menu column says where you are. Without it the first photograph shows.

(function () {
  var viewer = document.getElementById("viewer");
  if (!viewer) return;
  var plates = [].slice.call(viewer.querySelectorAll(".plate"));
  var count = document.getElementById("count");
  if (!plates.length) return;
  var index = 0;

  function show(n) {
    index = (n + plates.length) % plates.length;
    plates.forEach(function (p, k) { p.classList.toggle("on", k === index); });
    if (count) count.textContent = index + 1 + " / " + plates.length;
    // The address says which photograph is showing — the-meadow.html#3 — so a
    // link from the Projects page can open a project at a given photograph.
    history.replaceState(null, "", location.pathname + location.search + (index ? "#" + (index + 1) : ""));
    // Start loading the neighbours before they are asked for.
    [index + 1, index - 1].forEach(function (k) {
      var img = plates[(k + plates.length) % plates.length].querySelector("img");
      if (img && img.loading === "lazy") img.loading = "eager";
    });
  }

  viewer.querySelector(".prev").addEventListener("click", function () { show(index - 1); });
  viewer.querySelector(".next").addEventListener("click", function () { show(index + 1); });

  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "ArrowRight") show(index + 1);
  });

  var x0 = 0, y0 = 0;
  viewer.addEventListener("touchstart", function (e) {
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
  }, { passive: true });
  viewer.addEventListener("touchend", function (e) {
    var dx = e.changedTouches[0].clientX - x0;
    var dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy)) show(dx < 0 ? index + 1 : index - 1);
  });

  var asked = parseInt(location.hash.slice(1), 10);
  show(asked > 0 && asked <= plates.length ? asked - 1 : 0);
})();
