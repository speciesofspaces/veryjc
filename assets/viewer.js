function qs(name, fallback = null) {
  const p = new URLSearchParams(window.location.search);
  return p.get(name) ?? fallback;
}

const type = (qs("type", "project") || "project").toLowerCase();
const slug = qs("slug", "the-meadow");
let i = Math.max(0, parseInt(qs("i", "0"), 10) || 0);

// Optional override (still supported)
let n = parseInt(qs("n", ""), 10);
if (Number.isNaN(n)) n = null;

const MAX_CAP = 300;
const CACHE_BUST = String(Date.now()); // one per page load (not per image)

const CATALOG = {
  studies: {
    title: "Studies",
    place: "London + UK",
    years: "2015–2018",
    descriptor: "Fragments",
  },
  projects: {
    "the-meadow": {
      title: "The Meadow",
      place: "Edinburgh, UK",
      years: "2012",
      descriptor: "",
    },
    project2: {
      title: "Project 2",
      place: "",
      years: "",
      descriptor: "",
    },
  },
};

function metaFor() {
  if (type === "studies") return CATALOG.studies;

  const p = CATALOG.projects?.[slug];
  if (p) return p;

  return {
    title: slug.replace(/-/g, " "),
    place: "",
    years: "",
    descriptor: "",
  };
}

function pad2(x) {
  return String(x).padStart(2, "0");
}

function srcFor(idx) {
  const file = pad2(idx + 1) + ".jpg";
  if (type === "studies") return `assets/images/studies/${file}`;
  return `assets/images/projects/${slug}/${file}`;
}

function backHref() {
  return type === "studies" ? "studies.html" : "projects.html";
}

// Cache DOM nodes once
const el = {
  img: document.getElementById("viewerImg"),
  capTitle: document.getElementById("capTitle"),
  capSub: document.getElementById("capSub"),
  counter: document.getElementById("counter"),
  back: document.getElementById("backLink"),
  nextBtn: document.getElementById("nextBtn"),
  prevBtn: document.getElementById("prevBtn"),
};

function setUICount(total) {
  if (!el.counter) return;
  el.counter.textContent = `${i + 1} / ${total}`;
}

function render(total) {
  const meta = metaFor();

  if (el.img) {
    el.img.src = srcFor(i);
    el.img.alt = meta.title;
  }

  if (el.capTitle) el.capTitle.textContent = meta.title;

  if (el.capSub) {
    const parts = [meta.place, meta.years, meta.descriptor].filter(Boolean);
    el.capSub.textContent = parts.join(" — ");
  }

  if (el.back) {
    el.back.href = backHref();
    el.back.textContent = "⧉ Grid"; // or "⧉"
    el.back.setAttribute("aria-label", "Back to grid");
  }

  setUICount(total);

  // update URL without reloading
  const p = new URLSearchParams(window.location.search);
  p.set("i", String(i));
  history.replaceState(null, "", `${window.location.pathname}?${p.toString()}`);
}

// Auto-detect how many images exist by loading sequentially until the first miss.
async function detectCount() {
  if (n && n > 0) return Math.min(n, MAX_CAP);

  for (let k = 1; k <= MAX_CAP; k++) {
    const testSrc = srcFor(k - 1);

    const ok = await new Promise((resolve) => {
      const test = new Image();
      test.onload = () => resolve(true);
      test.onerror = () => resolve(false);
      test.src = `${testSrc}?v=${CACHE_BUST}`;
    });

    if (!ok) return k - 1;
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

el.nextBtn?.addEventListener("click", next);
el.prevBtn?.addEventListener("click", prev);
// Click image: left half = prev, right half = next
el.img?.addEventListener("click", (e) => {
  const rect = el.img.getBoundingClientRect();
  const x = e.clientX - rect.left;
  if (x < rect.width / 2) prev();
  else next();
});

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
