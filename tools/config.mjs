// Site configuration. Edit this file, not the build scripts.

export const site = {
  url: "https://juechen.uk",
  title: "Jué Chen",
  author: "Jué Chen",
  description:
    "Photographs by Jué Chen. How silence looks, and breaks.",
  lang: "en",
  instagram: "https://instagram.com/veryjc",
  email: "contact@juechen.uk",
};

// Widths generated for every photograph, in CSS pixels. Anything wider than the
// source is skipped rather than upscaled; the source's own width is always kept
// as the largest step so nothing is lost.
export const widths = [480, 720, 960, 1440, 2048];

// Encoder settings. AVIF first, WebP second, JPEG as the universal fallback.
export const formats = {
  avif: { quality: 52, effort: 5 },
  webp: { quality: 78 },
  jpeg: { quality: 82, mozjpeg: true, progressive: true },
};

// Width used for the plain <img src> fallback inside each <picture>.
export const fallbackWidth = 1440;

// Every browser in use has supported WebP since 2020, so the JPEG copies exist
// only as a last resort for something very old. Generating one per width would
// add about a third to the size of the repository for traffic that rounds to
// zero, so by default only the fallback width is written as JPEG.
// Set this to true to generate the full JPEG ladder as well.
export const jpegLadder = false;

// Galleries. `dir` is the folder of source JPEGs; `page` is the HTML file whose
// gallery block gets rewritten; `marker` matches the comment pair in that file.
export const galleries = [
  {
    id: "studies",
    title: "Studies",
    dir: "assets/images/studies",
    page: "studies.html",
    marker: "studies",
    viewerType: "studies",
    sizes: "(max-width: 720px) 50vw, (max-width: 1100px) 33vw, 25vw",
  },
];

// Each project has its own page and its own run of images. The cover is still
// built, because it is the page's Open Graph image; a project without a `page`
// of its own falls back to the full-screen viewer.
// The order here is the order of both menus — the column on a project page
// and the top bar on the others. Newest first.
export const projects = [
  {
    slug: "dream",
    title: "Dream",
    page: "dream.html",
  },
  {
    slug: "margins",
    title: "Margins",
    page: "margins.html",
  },
  {
    slug: "species-of-spaces",
    title: "Species of Spaces",
    page: "species-of-spaces.html",
  },
  {
    slug: "the-meadow",
    title: "The Meadow",
    page: "the-meadow.html",
  },
];

// The side menu on project pages. Projects above are listed automatically;
// one without a `page` yet is shown as plain text rather than a dead link.
// `placeholders` are names reserved in the menu before any photographs exist.
export const sideMenu = {
  // The mark is the identity now, with the tagline under it. Either of these
  // can be empty and the build leaves that line out altogether rather than
  // writing an empty span — put a string back and the line returns.
  name: "Jué Chen",
  role: "",
  // The name and the tagline are wrapped in one link when this is set — the
  // whole line is the target, not just the last two words. It is how the front
  // page is reached from everywhere else.
  identHref: "/",
  // Names held in the menu before any photographs exist. Empty now that every
  // project has a page of its own.
  placeholders: [],
  // The selected photographs are the front page and is reached through the tagline, so it is
  // not repeated in the list.
  hideFromMenu: [],
  // Everything after the projects, in the same list. About is linked; Studies
  // is deliberately unlinked for now — the page is still built and still
  // reachable by URL, it simply is not advertised. Add an entry here to put it
  // in the menu again.
  extra: [{ label: "About", href: "about.html" }],
  // Pages that carry the menu but no frame counter.
  hideCounterOn: ["index.html"],
  // An entry with no `href` is printed as plain text. The address is there to
  // be read and copied, not to launch a mail client — give it a
  // `href: \`mailto:${site.email}\`` to make it a link again.
  // Empty: contact details live on the About page only. Add entries back
  // ({ label, href }) to return them to the column.
  contact: [],
};

// The mark. `brand` is the character itself, used as the accessible name;
// `brandPath` is the same glyph as an outline, taken from assets/icons/favicon.svg
// and inlined into every page by build-pages.mjs.
//
// It has to be a path, not the character: Inter carries no CJK, so a typed 陳
// falls back to PingFang on a Mac, Microsoft YaHei on Windows and Noto on
// Android — a different letterform for every reader, and font-weight on it gets
// synthesised into a fake bold. The outline looks the same everywhere, scales,
// and takes its colour from currentColor.
export const brand = "覺";
export const brandPath =
  "M27.2 58.75H73.1V64.75H27.2ZM27.2 68.25H73.1V74.35H27.2ZM27.2 49.45H73.1V55.35H27.2ZM22.6 45.85V77.85H35.4C31.8 85.85 23.3 89.75 4.7 91.65C5.5 92.55 6.6 94.45 7 95.45C27.1 93.05 36.5 88.25 40.3 77.85H57.2V87.45C57.2 93.05 59.5 94.15 67.7 94.15C69.4 94.15 84.4 94.15 86.3 94.15C93.1 94.15 94.8 91.65 95.3 80.35C94 80.05 92.1 79.35 91 78.55C90.7 88.75 90 89.95 85.8 89.95C82.6 89.95 70.2 89.95 67.9 89.95C62.9 89.95 62 89.55 62 87.45V77.85H77.8V45.85ZM41.9 23.75C44 24.85 46.2 26.25 48.2 27.75C45.2 30.05 41.8 32.15 38.5 33.85C39.3 34.35 40.5 35.35 41 36.05H22.6L22.4 30.65H37.1V26.95H22.2L22 21.65H36.2V18.05H21.8L21.6 13.25C26.6 11.65 32.6 9.55 37.1 7.05L34.1 4.55C29.8 6.65 22.2 9.95 16.8 11.65L16.9 11.75L18.1 36.05H8.7V49.95H13.3V39.95H87.1V49.95H91.8V36.05H82.6C83.1 28.55 83.6 17.45 83.9 8.85H63.5V12.65H79.4L79.2 18.05H64.7V21.65H79L78.7 26.95H63.9V30.65H78.5L78.1 36.05H42.1C45.1 34.35 48.2 32.15 51.1 29.85C53.4 31.65 55.4 33.45 56.8 35.05L59.4 32.45C58.1 30.95 56.1 29.25 53.8 27.45C56 25.45 58 23.25 59.6 20.95L56 20.05C54.6 21.95 52.9 23.75 51 25.45C48.8 24.05 46.5 22.65 44.4 21.45ZM40.8 8.65C42.8 9.75 45 11.05 47 12.45C44.5 14.35 41.7 16.05 39 17.45C39.9 17.95 41.4 19.35 41.9 19.95C44.5 18.45 47.3 16.65 49.8 14.55C51.9 16.15 53.8 17.75 55 19.15L57.6 16.55C56.4 15.25 54.6 13.75 52.6 12.25C54.7 10.25 56.7 8.25 58.2 6.15L54.6 5.15C53.3 6.85 51.6 8.65 49.7 10.25C47.6 8.85 45.4 7.45 43.4 6.45Z";

// The header menu, generated into every page so a new project appears
// everywhere at once. Project pages are inserted directly after Projects.
export const nav = [
  { label: "Home", href: "/" },
  { label: "Studies", href: "studies.html" },
];

// Project pages are slotted into the menu directly after this entry, so a new
// project appears site-wide without touching `nav`.
export const navProjectsAfter = "/";

// There is no longer a Projects index — a project is reached from the menu
// directly. `page` is null, which switches the cover grid off; `dir` and `sizes`
// stay because build-images.mjs still reads them to find and size the
// photographs, and the covers are still used as Open Graph images.
export const projectsPage = {
  page: null,
  marker: "projects",
  // How a photograph is measured on a project page itself: nearly the full
  // width of a phone, and a share of the window height on a wide screen.
  plateSizes: "(max-width: 1023px) 92vw, 80vh",
  dir: "assets/images/projects",
  sizes: "(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 40vw",
};

// Standalone images that are not part of a gallery.
export const singles = [
  {
    src: "assets/images/hero.jpg",
    page: "entry.html",
    marker: "hero",
    sizes: "(max-width: 1100px) 100vw, 1100px",
    link: "/",
    linkLabel: "Enter",
  },
  // The same photograph behind the line on the front page. It fills the stage
  // and is cropped about its centre (object-fit: cover), so the width it is
  // drawn at follows the window's height as much as its width — hence the vh.
  {
    src: "assets/images/hero.jpg",
    page: "index.html",
    marker: "home-hero",
    sizes: "(max-width: 820px) 120vh, max(72vw, 145vh)",
  },
];

// Pages listed in sitemap.xml, in order. `title` and `description` drive the
// <title>, meta description, Open Graph and canonical tags on each page.
export const pages = [
  {
    file: "index.html",
    path: "/",
    priority: "1.0",
    title: "Jué Chen — Photography",
    description:
      "Photographs by Jué Chen. How silence looks, and breaks.",
    ogImage: "assets/images/projects/dream/05-1440.jpg",
  },
  {
    file: "the-meadow.html",
    path: "/the-meadow.html",
    priority: "0.7",
    title: "The Meadow — Jué Chen",
    description:
      "The Meadow — a photographic series by Jué Chen made in Edinburgh, 2012.",
    ogImage: "assets/images/projects/the-meadow/cover-1440.jpg",
  },
  {
    file: "dream.html",
    path: "/dream.html",
    priority: "0.7",
    title: "Dream — Jué Chen",
    description:
      "Dream — photographs by Jué Chen.",
    ogImage: "assets/images/projects/dream/01-1440.jpg",
  },
  {
    file: "species-of-spaces.html",
    path: "/species-of-spaces.html",
    priority: "0.7",
    title: "Species of Spaces — Jué Chen",
    description:
      "Species of Spaces — a photographic series by Jué Chen.",
    ogImage: "assets/images/projects/species-of-spaces/01-1440.jpg",
  },
  {
    file: "margins.html",
    path: "/margins.html",
    priority: "0.7",
    title: "Margins — Jué Chen",
    description:
      "Margins — a photographic series by Jué Chen.",
    ogImage: "assets/images/projects/margins/01-1440.jpg",
  },
  {
    file: "studies.html",
    path: "/studies.html",
    priority: "0.8",
    title: "Studies — Jué Chen",
    description:
      "Fragments and experiments — a running set of photographic studies by Jué Chen.",
    ogImage: "assets/images/studies/01-1440.jpg",
  },
  {
    file: "about.html",
    path: "/about.html",
    priority: "0.5",
    title: "About — Jué Chen",
    description:
      "About Jué Chen, photographer. How silence looks, and breaks.",
    ogImage: "assets/images/hero-1440.jpg",
  },
];

// Files that carry an image but should never be crawled or listed.
export const excludedPages = ["viewer.html", "404.html", "entry.html"];

// Pages that wear a project page's chrome — the menu column and the stage —
// without being a project. They get `side` and `sidefoot` but no photographs,
// no top bar and no wide footer, and no frame counter: there is nothing to
// count.
export const sidebarPages = ["about.html", "index.html"];

// Pages with no top bar and no footer — the photograph and its line of text and
// nothing else. The build generates neither block for these, so the markup has
// to be absent from the file as well.
export const barePages = ["entry.html"];

// The 覺 mark. The page mark is Noto Sans CJK TC Light; the favicon and app
// icons are Regular, so they stay legible at 16px. Generated once with the outline
// embedded, so no font has to be present on the reader's machine. The SVG is
// listed first because every current browser prefers it; the .ico is the
// fallback for old ones and for the bare /favicon.ico request browsers make on
// their own. Regenerate only if the mark itself changes.
//
// The `?v=` is a cache-buster. Browsers hold on to a favicon far longer than
// anything else on a page, so after the mark changed from 陳 to 覺 they kept
// showing the old one from cache. Bump the number whenever the icon files change.
export const icons = [
  { rel: "icon", href: "/assets/icons/favicon.svg?v=2", type: "image/svg+xml" },
  { rel: "icon", href: "/favicon.ico?v=2", sizes: "48x48 32x32 16x16" },
  { rel: "apple-touch-icon", href: "/assets/icons/apple-touch-icon.png?v=2" },
  { rel: "manifest", href: "/site.webmanifest?v=2" },
];

// Browser chrome colour on mobile. Matches --bg in assets/style.css.
export const themeColor = "#ffffff";

// The footer, generated into every page so it stays identical everywhere and
// the year looks after itself.
export const footer = {
  credit: `\u00a9 {year} ${site.author} \u00b7 \u9673\u89ba`,
  // Nothing but the credit, so every page's footer reads exactly as the one on
  // a project page does. Instagram lives in the project pages' contact block;
  // put an entry back here to return it to the wide footer.
  links: [],
};
