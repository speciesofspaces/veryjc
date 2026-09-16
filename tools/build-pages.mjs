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
  icons,
  themeColor,
  excludedPages,
  barePages,
  sidebarPages,
  nav,
  navProjectsAfter,
  footer,
  brand,
  brandPath,
  sideMenu,
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

// The mark, inlined. Inline rather than <img> so it costs no request, inherits
// currentColor and can be sized by CSS; the accessible name is the character
// itself, so a screen reader still reads it as 陳.
function markSvg(cls) {
  return (
    `<svg class="${cls}" viewBox="0 0 100 100" role="img" ` +
    `aria-label="${esc(brand)}" focusable="false"><path d="${brandPath}"/></svg>`
  );
}

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

// ------------------------------------------------------------------- nav ----

// Menu items in order, with each project page slotted in after the entry named
// by `navProjectsAfter`. They sit beside the other entries rather than under a
// Projects parent, so there is no child level any more.
function navItems() {
  const items = [];
  for (const entry of nav) {
    items.push({ label: entry.label, href: entry.href });
    if (entry.href === navProjectsAfter) {
      for (const project of projects) {
        // A project that *is* the front page is already in the bar as Home.
        if (project.page && project.page !== "index.html") {
          items.push({ label: project.title, href: project.page });
        }
      }
    }
  }
  return items;
}

// The whole menu — desktop row, hamburger and mobile panel — generated per page
// so "active" lands on the right item and a new project appears site-wide.
function navBlock(file) {
  const items = navItems();
  const isActive = (href) => (href === "/" ? "index.html" : href) === file;

  const link = (item, indent) => {
    const attr = isActive(item.href) ? ' class="active"' : "";
    return `${indent}<a${attr} href="${item.href}">${esc(item.label)}</a>`;
  };

  return [
    `    <a class="brand" href="/">${markSvg("mark")}</a>`,
    ``,
    `    <!-- Desktop links -->`,
    `    <div class="nav-links">`,
    ...items.map((it) => link(it, "      ")),
    `    </div>`,
    ``,
    `    <!-- Mobile hamburger -->`,
    `    <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false">`,
    `      <span></span><span></span><span></span>`,
    `    </button>`,
    ``,
    `    <!-- Mobile dropdown -->`,
    `    <div class="nav-panel" aria-hidden="true">`,
    ...items.map((it) => link(it, "      ")),
    `    </div>`,
  ].join("\n");
}

// ---------------------------------------------------------- side menu ----

// The menu on a project page: identity, the list of projects, the frame
// counter, contact. Built from `projects` and `sideMenu` in config.mjs, so a
// new project appears on every project page at once.
function sideBlock(file, { counter = true } = {}) {
  const items = [];
  for (const project of projects) {
    if (sideMenu.hideFromMenu.includes(project.slug)) continue;
    items.push({ label: project.title, href: project.page });
  }
  for (const label of sideMenu.placeholders) items.push({ label, href: null });
  // Studies and About close the same list — a project page used to have no
  // route to either.
  for (const entry of sideMenu.extra) items.push(entry);

  const line = (item) => {
    if (!item.href) {
      // No page yet — a name held in the menu, not a link that 404s.
      return `        <span><span class="pending">${esc(item.label)}</span></span>`;
    }
    const current = item.href === file ? ' aria-current="page"' : "";
    return `        <span><a href="${esc(item.href)}"${current}>${esc(item.label)}</a></span>`;
  };

  return [
    `      <div class="ident">`,
    `        <a class="ident-mark" href="/">${markSvg("mark")}</a>`,
    // The name and the tagline are one line and one link. They keep separate
    // spans because they are set differently, but the anchor is around both so
    // the whole line is clickable rather than just the tagline.
    ...(() => {
      const parts = [
        ...(sideMenu.name ? [`<span class="ident-name">${esc(sideMenu.name)}</span>`] : []),
        ...(sideMenu.role ? [`<span class="ident-role">${esc(sideMenu.role)}</span>`] : []),
      ];
      if (!parts.length) return [];
      const line = parts.join(" ");
      return sideMenu.identHref
        ? [`        <a class="ident-line" href="${esc(sideMenu.identHref)}">${line}</a>`]
        : [`        <span class="ident-line">${line}</span>`];
    })(),
    `      </div>`,
    ``,
    // A page without a count still reserves the line, so the menu below starts
    // at the same height on every page.
    `      ${counter
      ? '<div class="counter" aria-live="polite">1 / 1</div>'
      : '<div class="counter-space" aria-hidden="true"></div>'}`,
    ``,
    `      <div class="side-nav">`,
    ...items.map(line),
    `      </div>`,
    ``,
    `      <div class="side-contact">`,
    ...sideMenu.contact.map((c) =>
      c.href
        ? `        <span><a href="${esc(c.href)}"${
            c.href.startsWith("http") ? ' target="_blank" rel="me noreferrer"' : ""
          }>${esc(c.label)}</a></span>`
        : `        <span>${esc(c.label)}</span>`,
    ),
    `      </div>`,
  ].join("\n");
}

// The run of photographs on a project page. Until now these were written into
// the page by hand, which meant uploading a photograph did not actually change
// the page it belonged to. Generated from the manifest like everything else, so
// a new project only needs an empty file with the markers in it.
function platesBlock(project) {
  const data = manifest.projects[project.slug];
  const images = data ? data.images : [];
  if (!images.length) return ""; // nothing uploaded yet

  const sizes = projectsPage.plateSizes;
  const n = images.length;

  return images
    .map((image, idx) => {
      const alt = image.alt || `${project.title}, photograph ${idx + 1} of ${n}`;
      const jpegWidths = image.jpegWidths ?? image.widths;
      const fallback = jpegWidths.includes(fallbackWidth)
        ? fallbackWidth
        : jpegWidths[jpegWidths.length - 1];
      // The first is what the reader waits for; the rest can arrive late.
      const loading = idx === 0 ? 'fetchpriority="high"' : 'loading="lazy"';

      return [
        `      <picture class="plate${idx === 0 ? " on" : ""}" data-w="${image.width}" data-h="${image.height}">`,
        `        <source type="image/avif" srcset="${srcset(image, "avif")}" sizes="${esc(sizes)}">`,
        `        <source type="image/webp" srcset="${srcset(image, "webp")}" sizes="${esc(sizes)}">`,
        `        <img src="${image.base}-${fallback}.jpg" width="${image.width}" height="${image.height}"`,
        `             alt="${esc(alt)}"`,
        `             ${loading} decoding="async">`,
        `      </picture>`,
      ].join("\n");
    })
    .join("\n\n");
}

// The stacked credit at the foot of a project page's menu.
function sideFootBlock() {
  const year = new Date().getFullYear();
  return `      <span>${esc(footer.credit.replace("{year}", String(year)))}</span>`;
}

// ---------------------------------------------------------------- footer ----

// One footer for the whole site, year included, so it cannot drift between
// pages and nobody has to remember to change it in January.
function footerBlock() {
  const year = new Date().getFullYear();
  const links = footer.links.map(
    (l) =>
      `    <a class="footer-right" href="${esc(l.href)}" target="_blank" rel="noreferrer">${esc(l.label)}</a>`,
  );
  return [
    `  <div class="footer-inner">`,
    `    <div class="footer-left">${esc(footer.credit.replace("{year}", String(year)))}</div>`,
    ...links,
    `  </div>`,
  ].join("\n");
}

// The favicon links, shared by every page including the ones kept out of the
// sitemap — a 404 or the viewer should still show the mark.
function iconBlock(indent = "  ") {
  const lines = icons.map((icon) => {
    const attrs = Object.entries(icon)
      .map(([key, value]) => `${key}="${esc(value)}"`)
      .join(" ");
    return `${indent}<link ${attrs}>`;
  });
  lines.push(`${indent}<meta name="theme-color" content="${esc(themeColor)}">`);
  // Every page comes through here — the generated heads call iconBlock too — so
  // this is the one place the guard belongs. Without it, iOS Safari and some
  // Android browsers detect the address in the page and make it tappable
  // anyway, opening the mail client even though nothing here is a link.
  lines.push(
    `${indent}<meta name="format-detection" content="telephone=no,address=no,email=no,date=no">`,
  );
  return lines.join("\n");
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
    iconBlock(),
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
      // A project with its own page goes there; otherwise the old viewer.
      const href = p.page
        ? p.page
        : `viewer.html?type=project&amp;slug=${p.slug}&amp;i=0` +
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

// Pages with the vertical menu column: every project, plus any page that
// borrows the same chrome.
const projectPages = projects.map((p) => p.page).filter(Boolean);
const sidePages = [...projectPages, ...sidebarPages];
// Pages with the horizontal top bar. A project page is listed in `pages` so it
// gets a generated <head> and a sitemap entry, but it has no top bar to fill,
// and a bare page has neither bar nor footer by design.
const navPages = [...pages.map((p) => p.file), ...excludedPages].filter(
  (file) => !sidePages.includes(file) && !barePages.includes(file),
);

const blocksByPage = new Map();
const add = (file, name, body) => {
  if (!blocksByPage.has(file)) blocksByPage.set(file, []);
  blocksByPage.get(file).push({ name, body });
};

for (const g of galleries) add(g.page, g.marker, galleryBlock(g));
// Only when there is still an index page to put the covers on.
if (projectsPage.page) add(projectsPage.page, projectsPage.marker, projectsBlock());
for (const s of singles) add(s.page, s.marker, singleBlock(s));
for (const p of pages) add(p.file, "head", headBlock(p));
// Pages with no generated <head> still get the mark.
for (const file of excludedPages) add(file, "icons", iconBlock());
// Pages with the top bar get the horizontal menu and the wide footer.
for (const file of navPages) add(file, "nav", navBlock(file));
for (const file of navPages) add(file, "footer", footerBlock());
// Project pages have their own column instead.
for (const file of sidePages) {
  add(file, "side", sideBlock(file, {
    counter: projectPages.includes(file) && !sideMenu.hideCounterOn.includes(file),
  }));
  add(file, "sidefoot", sideFootBlock());
}
for (const project of projects) {
  if (!project.page) continue;
  add(project.page, "plates", platesBlock(project));
}

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
