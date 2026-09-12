// Full-screen viewer. Reads assets/data/gallery.json, so it knows the length of
// a set and every image's dimensions up front — no probing, no layout shift.

// Matches .viewer-wrap { max-width: 980px } in assets/style.css.
const SIZES = "(max-width: 1020px) 100vw, 980px";

const params = new URLSearchParams(window.location.search);
const type = (params.get("type") || "project").toLowerCase();
const slug = params.get("slug") || "the-meadow";
let index = Math.max(0, parseInt(params.get("i") || "0", 10) || 0);

// Captions. Edit freely — the build never rewrites this.
const CAPTIONS = {
  studies: { place: "London + UK", years: "2015–2018", descriptor: "Fragments" },
  projects: {
    "the-meadow": { place: "Edinburgh, UK", years: "2012", descriptor: "" },
    "empty-room": { place: "", years: "", descriptor: "" },
  },
};

const el = {
  stage: document.querySelector(".viewer-stage"),
  capTitle: document.getElementById("capTitle"),
  capSub: document.getElementById("capSub"),
  counter: document.getElementById("counter"),
  back: document.getElementById("backLink"),
  nextBtn: document.getElementById("nextBtn"),
  prevBtn: document.getElementById("prevBtn"),
};

let images = [];
let title = "";
let caption = {};

function srcset(image, ext) {
  return image.widths.map((w) => `${image.base}-${w}.${ext} ${w}w`).join(", ");
}

function fallbackSrc(image) {
  const jpegWidths = image.jpegWidths ?? image.widths;
  const w = jpegWidths.includes(1440) ? 1440 : jpegWidths[jpegWidths.length - 1];
  return `${image.base}-${w}.jpg`;
}

// A fresh <picture> per frame: changing <source srcset> in place is unreliable
// once the browser has committed to a candidate.
function buildPicture(image, alt, { interactive = true } = {}) {
  const picture = document.createElement("picture");
  for (const [ext, mime] of [["avif", "image/avif"], ["webp", "image/webp"]]) {
    const source = document.createElement("source");
    source.type = mime;
    source.srcset = srcset(image, ext);
    source.sizes = SIZES;
    picture.append(source);
  }
  const img = document.createElement("img");
  img.id = "viewerImg";
  img.src = fallbackSrc(image);
  const jpegWidths = image.jpegWidths ?? image.widths;
  if (jpegWidths.length > 1) {
    img.srcset = jpegWidths.map((w) => `${image.base}-${w}.jpg ${w}w`).join(", ");
    img.sizes = SIZES;
  }
  img.width = image.width;
  img.height = image.height;
  img.alt = alt;
  img.decoding = "async";
  if (interactive) {
    img.addEventListener("click", (event) => {
      const rect = img.getBoundingClientRect();
      if (event.clientX - rect.left < rect.width / 2) step(-1);
      else step(1);
    });
  }
  picture.append(img);
  return picture;
}

const prefetched = new Set();

// Warms the next and previous frames. It appends a real, hidden <picture> rather
// than guessing a URL, so the browser runs its own format and width negotiation
// and caches exactly the file the visible render will ask for a moment later.
function preload(i) {
  const image = images[i];
  if (!image || prefetched.has(image.base)) return;
  prefetched.add(image.base);

  const picture = buildPicture(image, "", { interactive: false });
  picture.style.cssText =
    "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;left:-9999px";
  const img = picture.querySelector("img");
  img.loading = "eager";
  img.addEventListener("load", () => picture.remove(), { once: true });
  img.addEventListener("error", () => picture.remove(), { once: true });
  document.body.append(picture);
}

function render() {
  const image = images[index];
  if (!image || !el.stage) return;

  const alt = image.alt || `${title} — photograph ${index + 1}`;
  el.stage.replaceChildren(buildPicture(image, alt));

  if (el.capTitle) el.capTitle.textContent = title;
  if (el.capSub) {
    el.capSub.textContent = [caption.place, caption.years, caption.descriptor]
      .filter(Boolean)
      .join(" — ");
  }
  if (el.counter) el.counter.textContent = `${index + 1} / ${images.length}`;
  if (el.back) {
    el.back.href = type === "studies" ? "studies.html" : "projects.html";
    el.back.textContent = "⧉ Grid";
    el.back.setAttribute("aria-label", "Back to grid");
  }

  params.set("i", String(index));
  history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);

  preload((index + 1) % images.length);
  preload((index - 1 + images.length) % images.length);
}

function step(delta) {
  if (!images.length) return;
  index = (index + delta + images.length) % images.length;
  render();
}

el.nextBtn?.addEventListener("click", () => step(1));
el.prevBtn?.addEventListener("click", () => step(-1));
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") step(1);
  if (event.key === "ArrowLeft") step(-1);
  if (event.key === "Escape" && el.back) window.location.href = el.back.href;
});

(async function init() {
  try {
    const response = await fetch("assets/data/gallery.json", { cache: "no-cache" });
    const manifest = await response.json();

    if (type === "studies") {
      const gallery = manifest.galleries?.studies;
      images = gallery?.images ?? [];
      title = gallery?.title ?? "Studies";
      caption = CAPTIONS.studies ?? {};
    } else {
      const project = manifest.projects?.[slug];
      images = project?.images ?? [];
      title = project?.title ?? slug.replace(/-/g, " ");
      caption = CAPTIONS.projects?.[slug] ?? {};
    }
  } catch (error) {
    console.error("Could not load the gallery manifest.", error);
  }

  if (!images.length) {
    if (el.capTitle) el.capTitle.textContent = "Nothing to show";
    if (el.counter) el.counter.textContent = "";
    return;
  }

  index = Math.min(index, images.length - 1);
  render();
})();
