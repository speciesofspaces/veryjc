// Shop: clicking a tote opens its large picture over the page (no new page).
// Click anywhere, press Esc or "Close" to go back. Without JavaScript the
// thumbnail is a plain link to the large JPEG.
(function () {
  var items = document.querySelectorAll(".shop-items a.item-pic[data-full]");
  if (!items.length) return;

  var box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Large picture");
  box.hidden = true;
  box.innerHTML =
    '<button class="lb-close" type="button">Close</button>' +
    '<figure class="lb-fig"><picture>' +
    '<source type="image/avif"><source type="image/webp"><img alt="">' +
    '</picture><figcaption class="lb-cap"></figcaption></figure>';
  document.body.appendChild(box);

  var srcs = box.querySelectorAll("source"), img = box.querySelector("img"),
      cap = box.querySelector(".lb-cap"), closeBtn = box.querySelector(".lb-close"),
      opener = null;

  function open(a) {
    var base = a.getAttribute("data-full");
    srcs[0].srcset = base + "-1086.avif";
    srcs[1].srcset = base + "-1086.webp";
    img.src = base + "-900.jpg";
    var thumb = a.querySelector("img");
    img.alt = thumb ? thumb.alt : "";
    var fig = a.closest(".item"), name = fig.querySelector(".item-name"),
        lines = fig.querySelectorAll("figcaption span:not(.item-name)"),
        mail = a.getAttribute("data-mail");
    cap.innerHTML = "";
    var n = document.createElement("span"); n.className = "lb-name"; n.textContent = name ? name.textContent : ""; cap.appendChild(n);
    lines.forEach(function (s) { var x = document.createElement("span"); x.textContent = s.textContent; cap.appendChild(x); });
    if (mail) { var m = document.createElement("a"); m.href = mail; m.textContent = "Email to order"; cap.appendChild(m); }
    opener = a;
    box.hidden = false;
    requestAnimationFrame(function () { box.classList.add("on"); });
    document.documentElement.classList.add("lb-open");
    closeBtn.focus();
  }

  function close() {
    if (box.hidden) return;
    box.classList.remove("on");
    document.documentElement.classList.remove("lb-open");
    setTimeout(function () { box.hidden = true; img.removeAttribute("src"); }, 200);
    if (opener) opener.focus();
  }

  items.forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;   // let "open in new tab" work
      e.preventDefault();
      open(a);
    });
  });
  box.addEventListener("click", function (e) { if (!e.target.closest(".lb-cap a")) close(); });
  document.addEventListener("keydown", function (e) {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "Tab") {                       // keep focus inside
      var f = [closeBtn].concat([].slice.call(cap.querySelectorAll("a")));
      var i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
    }
  });
})();
