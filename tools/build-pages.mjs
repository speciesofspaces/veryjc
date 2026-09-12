// Rewrites the marked blocks in the HTML pages from assets/data/gallery.json:
// every gallery, every project cover, the hero, and the <head> metadata.
//
// Run: node tools/build-pages.mjs   (after tools/build-images.mjs)
//
// Only content between <!-- build:NAME start --> and <!-- build:NAME end -->
// is touched. Everything else in the page is left exactly as written.

import fs from "node:fs/promises";
import path from "node:path";

import {
  site,
  galleries,
  projects,
  projectsPage,
  singles,
  pages,
  fallbackWidth,
} from "./config.mjs";

const root = path.resolve(import.meta.dirname, "..");
const manifest = JSON.parse(
  await fs.readFile(path.join(root, "assets", "data", "gallery.json"), "utf8"),
);

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const abs = (rel) => `${site.url.replace(/\/$/, "")}/${String(rel).replace(/^\//, "")}`;

function srcset(image, ext) {
  return image.widths.map((w) => `${image.base}-${w}.${ext} ${w}w`).join(", ");
}

function picture(image, { sizes, alt, eager = false, indent = "  " }) {
  const jpegWidths = image.jpegWidths ?? image.widths;
  const fallback = jpegWidths.includes(fallbackWidth)
    ? fallbackWidth
    : jpegWidths[jpegWidths.length - 1];
  const loading = eager
    ? 'loading="eager" fetchpriority="high"'
    : 'loading="lazy"';
  const i = indent;

  // The JPEG only carries a srcset when the full ladder was generated; with a
  // single fallback file a srcset would just repeat the src.
  const jpegSrcset =
    jpegWidths.length > 1
      ? `\n${i}       srcset="${jpegWidths.map((w) => `${image.base}-${w}.jpg ${w}w`).join(", ")}" sizes="${esc(sizes)}"`
      : "";

  return [
    `${i}<picture>`,
    `${i}  <source type="image/avif" srcset="${srcset(image, "avif")}" sizes="${esc(sizes)}">`,
    `${i}  <source type="image/webp" srcset="${srcset(image, "webp")}" sizes="${esc(sizes)}">`,
    `${i}  <img src="${image.base}-${fallback}.jpg"${jpegSrcset}`,
    `${i}       width="${image.width}" height="${image.height}"`,
    `${i}       alt="${esc(alt)}" ${loading} decoding="async">`,
    `${i}</picture>`,
  ].join("\n");
}

function replaceBlock(html, name, body, file) {
  const start = `<!-- build:${name} start -->`;
  const end = `<!-- build:${name} end -->`;
  const a = html.indexOf(start);
  const b = html.indexOf(end);
  if (a === -1 || b === -1 || b < a) {
    throw new Error(`${file}: missing or malformed "build:${name}" marker pair`);
  }
  return html.slice(0, a + start.length) + "\n" + body + "\n" + html.slice(b);
}

// ------------------------------------------------------------------ head ----

// Every photograph in the manifest, keyed by its base path.
const imagesByBase = new Map();
for (const image of [
  ...Object.values(manifest.galleries).flatMap((g) => g.images),
  ...Object.values(manifest.projects).flatMap((p) =>
    [p.cover, ...p.images].filter(Boolean),
  ),
  ...Object.values(manifest.singles),
]) {
  imagesByBase.set(image.base, image);
}

// Resolves a config `ogImage` to a JPEG that actually exists. A width written by
// hand in the config would silently 404 the moment a photograph is smaller than
// it, so the width is chosen from the manifest, not trusted from the config.
function ogImageUrl(spec, file) {
  const base = String(spec)
    .replace(/\.(jpe?g|avif|webp)$/i, "")
    .replace(/-\d{3,4}$/, "");
  const image = imagesByBase.get(base);
  if (!image) {
    throw new Error(
      `${file}: ogImage "${spec}" does not match any photograph in the manifest`,
    );
  }
  const jpegWidths = image.jpegWidths ?? image.widths;
  return abs(`${base}-${jpegWidths[jpegWidths.length - 1]}.jpg`);
}

function headBlock(page) {
  const canonical = abs(page.path === "/" ? "" : page.path.replace(/^\//, ""));
  const image = ogImageUrl(page.ogImage, page.file);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": page.path === "/" ? "WebSite" : "WebPage",
    name: page.title,
    description: page.description,
    url: canonical,
    inLanguage: site.lang,
    author: {
      "@type": "Person",
      name: site.author,
      email: site.email,
      sameAs: [site.instagram],
    },
  };
  return [
    `  <title>${esc(page.title)}</title>`,
    `  <meta name="description" content="${esc(page.description)}">`,
    `  <meta name="author" content="${esc(site.author)}">`,
    `  <meta name="robots" content="index,follow,max-image-preview:large">`,
    `  <link rel="canonical" href="${canonical}">`,
    `  <meta property="og:type" content="website">`,
    `  <meta property="og:site_name" content="${esc(site.title)}">`,
    `  <meta property="og:title" content="${esc(page.title)}">`,
    `  <meta property="og:description" content="${esc(page.description)}">`,
    `  <meta property="og:url" content="${canonical}">`,
    `  <meta property="og:image" content="${image}">`,
    `  <meta name="twitter:card" content="summary_large_image">`,
    `  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
  ].join("\n");
}

// --------------------------------------------------------------- galleries --

function galleryBlock(gallery) {
  const data = manifest.galleries[gallery.id];
  if (!data) throw new Error(`no manifest entry for gallery "${gallery.id}"`);
  const n = data.images.length;
  return data.images
    .map((image, idx) => {
      const alt = image.alt || `${gallery.title} — photograph ${idx + 1}`;
      const href =
        `viewer.html?type=${gallery.viewerType}&amp;i=${idx}` +
        `&amp;from=${gallery.page}&amp;n=${n}`;
      return [
        `    <a class="thumb" href="${href}" aria-label="${esc(alt)}">`,
        picture(image, { sizes: data.sizes, alt, indent: "      " }),
        `    </a>`,
      ].join("\n");
    })
    .join("\n\n");
}

function projectsBlock() {
  return projects
    .map((p) => {
      const data = manifest.projects[p.slug];
      if (!data || !data.cover) return "";
      const n = data.images.length;
      const alt = data.cover.alt || `${p.title} — cover photograph`;
      const href =
        `viewer.html?type=project&amp;slug=${p.slug}&amp;i=0` +
        `&amp;from=${projectsPage.page}&amp;n=${n}`;
      return [
        `    <a class="thumb" href="${href}" aria-label="Open ${esc(p.title)}">`,
        picture(data.cover, { sizes: data.sizes, alt, indent: "      " }),
        `      <div class="caption">${esc(p.title)}</div>`,
        `    </a>`,
      ].join("\n");
    })
    .filter(Boolean)
    .join("\n\n");
}

function singleBlock(single) {
  const data = manifest.singles[single.marker];
  if (!data) throw new Error(`no manifest entry for single "${single.marker}"`);
  const alt = data.alt || site.description;
  const body = picture(data, {
    sizes: data.sizes,
    alt,
    eager: true,
    indent: single.link ? "      " : "    ",
  });
  if (!single.link) return body;
  return [
    `    <a href="${single.link}" aria-label="${esc(single.linkLabel || "Continue")}">`,
    body,
    `    </a>`,
  ].join("\n");
}

// ------------------------------------------------------------------ main ----

const blocksByPage = new Map();
const add = (file, name, body) => {
  if (!blocksByPage.has(file)) blocksByPage.set(file, []);
  blocksByPage.get(file).push({ name, body });
};

for (const g of galleries) add(g.page, g.marker, galleryBlock(g));
add(projectsPage.page, projectsPage.marker, projectsBlock());
for (const s of singles) add(s.page, s.marker, singleBlock(s));
for (const p of pages) add(p.file, "head", headBlock(p));

let changed = 0;
for (const [file, blocks] of blocksByPage) {
  const abspath = path.join(root, file);
  const before = await fs.readFile(abspath, "utf8");
  let html = before;
  for (const { name, body } of blocks) html = replaceBlock(html, name, body, file);
  if (html !== before) {
    await fs.writeFile(abspath, html);
    changed += 1;
    console.log(`updated ${file} (${blocks.map((b) => b.name).join(", ")})`);
  } else {
    console.log(`unchanged ${file}`);
  }
}

console.log(`\nDone. ${changed} page(s) rewritten.`);
