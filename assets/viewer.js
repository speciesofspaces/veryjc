function qs(name, fallback = null) {
  const p = new URLSearchParams(window.location.search);
  return p.get(name) ?? fallback;
}

const type = (qs("type", "project") || "project").toLowerCase();
const slug = qs("slug", "the-meadow");
let i = Math.max(0, parseInt(qs("i", "0"), 10) || 0);

// Optional override (still supported), but we won't rely on it anymore
let n = parseInt(qs("n", ""), 10);
if (Number.isNaN(n)) n = null;

const MAX_CAP = 300; // safety cap

function pad2(x) {
  return String(x).padStart(2, "0");
}

function srcFor(idx) {
  const file = pad2(idx + 1) + ".jpg";
  if (type === "studies") return `assets/images/studies/${file}`;
  return `assets/images/projects/${slug}/${file}`;
}

function titleFor() {
  if (type === "studies") return "Studies";
  if (slug === "the-meadow") return "The Meadow";
  if (slug === "project2") return "Project 2";
  return slug.replace(/-/g, " ");
}

function backHref() {
  return type === "studies" ? "studies.html" : "projects.html";
}

function setUICount(total) {
  const counter = document.getElementById("counter");
  counter.textContent = `${i + 1} / ${total}`;
}

function render(total) {
  const img = document.getElementById("viewerImg");
  const title = document.getElementById("viewerTitle");
  const back = document.getElementById("backLink");

  img.src = srcFor(i);
  img.alt = titleFor();

  title.textContent = titleFor();
  back.href = backHref();
  setUICount(total);

  // update URL without reloading
  const p = new URLSearchParams(window.location.search);
  p.set("i", String(i));
  history.replaceState(null, "", `${window.location.pathname}?${p.toString()}`);
}

// Auto-detect how many images exist by loading sequentially until the first miss.
async function detectCount() {
  if (n && n > 0) return Math.min(n, MAX_CAP);

  // We detect by probing the next image until it fails.
  // We start at 1 and stop at the first missing file.
  for (let k = 1; k <= MAX_CAP; k++) {
    const testSrc = srcFor(k - 1);

    const ok = await new Promise((resolve) => {
      const test = new Image();
      test.onload = () => resolve(true);
      test.onerror = () => resolve(false);
      test.src = testSrc + `?v=${Date.now()}`; // bypass cache
    });

    if (!ok) return k - 1; // count is previous
  }
  return MAX_CAP;
}

let total = 1;

function next() {
  i = (i + 1) % total;
  render(total);
}

function prev() {
  i = (i - 1 + total) % total;
  render(total);
}

document.getElementById("nextBtn")?.addEventListener("click", next);
document.getElementById("prevBtn")?.addEventListener("click", prev);

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft") prev();
});

// Init
(async function init() {
  total = await detectCount();
  if (total < 1) total = 1;
  i = Math.max(0, Math.min(total - 1, i));
  render(total);
})();
