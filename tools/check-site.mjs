// Checks the built site before it goes live.
// Errors fail the build; warnings are printed but do not.
//
// Run: node tools/check-site.mjs

import fs from "node:fs/promises";
import path from "node:path";

import { site, pages, excludedPages } from "./config.mjs";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];
const warnings = [];

const exists = (rel) =>
  fs.access(path.join(root, rel)).then(() => true).catch(() => false);

const htmlFiles = [...pages.map((p) => p.file), ...excludedPages];

// --------------------------------------------------------- link integrity ---

const ATTR_RE = /(?:src|href)="([^"]+)"/g;
const SRCSET_RE = /srcset="([^"]+)"/g;
// content="…" values that are image URLs (og:image, twitter:image).
const CONTENT_URL_RE = /content="([^"]*\.(?:avif|webp|jpe?g|png))"/gi;
const base = site.url.replace(/\/$/, "");

for (const file of htmlFiles) {
  if (!(await exists(file))) {
    errors.push(`${file}: page is missing`);
    continue;
  }
  const html = await fs.readFile(path.join(root, file), "utf8");
  const refs = new Set();

  for (const [, value] of html.matchAll(ATTR_RE)) refs.add(value);

  // og:image and friends live in content="…" and are written as absolute URLs,
  // so they escape the checks below unless they are turned back into paths.
  for (const [, value] of html.matchAll(CONTENT_URL_RE)) {
    if (value.startsWith(base)) refs.add(value.slice(base.length).replace(/^\//, ""));
    else if (/^https?:/.test(value)) errors.push(`${file}: off-site image ${value}`);
  }
  for (const [, value] of html.matchAll(SRCSET_RE)) {
    for (const part of value.split(",")) {
      const url = part.trim().split(/\s+/)[0];
      if (url) refs.add(url);
    }
  }

  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|data:|#|\/\/)/.test(ref)) continue;
    const clean = ref.split("?")[0].split("#")[0].replace(/&amp;/g, "&");
    if (!clean) continue;
    const target = clean.startsWith("/") ? clean.slice(1) || "index.html" : clean;
    if (!(await exists(target))) {
      errors.push(`${file}: broken reference -> ${ref}`);
    }
  }

  // Head hygiene — indexed pages only.
  if (!excludedPages.includes(file)) {
    if (!html.includes('rel="canonical"')) errors.push(`${file}: no canonical link`);
    if (!/<meta name="description"/.test(html)) {
      errors.push(`${file}: no meta description`);
    }
  }
  if (/<img(?![^>]*\balt=)/.test(html)) errors.push(`${file}: an <img> has no alt attribute`);
  if (/<img[^>]*\balt=""/.test(html)) warnings.push(`${file}: an <img> has an empty alt`);

  // Nothing should point at an unoptimised original any more.
  for (const ref of refs) {
    if (/^assets\/images\/.*(?<!-\d{3,4})\.jpe?g$/i.test(ref)) {
      warnings.push(`${file}: still references the full-size original ${ref}`);
    }
  }
}

// ------------------------------------------------------------- variants -----

const manifestPath = path.join(root, "assets", "data", "gallery.json");
if (!(await exists("assets/data/gallery.json"))) {
  errors.push("assets/data/gallery.json is missing — run tools/build-images.mjs");
} else {
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const all = [
    ...Object.values(manifest.galleries).flatMap((g) => g.images),
    ...Object.values(manifest.projects).flatMap((p) =>
      [p.cover, ...p.images].filter(Boolean),
    ),
    ...Object.values(manifest.singles),
  ];

  let missingAlt = 0;
  for (const image of all) {
    for (const w of image.widths) {
      for (const ext of ["avif", "webp"]) {
        const rel = `${image.base}-${w}.${ext}`;
        if (!(await exists(rel))) errors.push(`missing variant ${rel}`);
      }
    }
    for (const w of image.jpegWidths ?? image.widths) {
      const rel = `${image.base}-${w}.jpg`;
      if (!(await exists(rel))) errors.push(`missing variant ${rel}`);
    }
    if (!image.alt) missingAlt += 1;
  }
  if (missingAlt) {
    warnings.push(
      `${missingAlt} photograph(s) have no alt text in assets/data/alt.json`,
    );
  }
  console.log(`checked ${all.length} photograph(s)`);
}

// --------------------------------------------------------------- config -----

if (!/^https:\/\//.test(site.url)) errors.push("site.url must be an https URL");
if (await exists("CNAME")) {
  const cname = (await fs.readFile(path.join(root, "CNAME"), "utf8")).trim();
  const host = new URL(site.url).host;
  if (cname !== host) {
    errors.push(`CNAME is "${cname}" but site.url points at "${host}"`);
  }
}

// ---------------------------------------------------------------- report ----

for (const w of warnings) console.warn(`warning  ${w}`);
for (const e of errors) console.error(`error    ${e}`);

console.log(
  `\n${errors.length} error(s), ${warnings.length} warning(s), ${htmlFiles.length} page(s) checked.`,
);
if (errors.length) process.exit(1);
