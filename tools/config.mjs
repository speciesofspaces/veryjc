// Site configuration. Edit this file, not the build scripts.

export const site = {
  url: "https://juechen.uk",
  title: "Jué Chen",
  author: "Jué Chen",
  description:
    "Fine art photography — minimal stills of light, distance and absence. London.",
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
// `statement` becomes the last plate of the series — text shown in the same
// square the photographs occupy. Each string in `body` is one paragraph; leave
// the array empty and only the title and place are shown.
export const projects = [
  {
    slug: "the-meadow",
    title: "The Meadow",
    page: "the-meadow.html",
    statement: {
      meta: "Edinburgh · 2012",
      body: [],
    },
  },
  {
    slug: "species-of-spaces",
    title: "Species of Spaces",
    page: "species-of-spaces.html",
    statement: {
      meta: "",
      body: [],
    },
  },
  {
    slug: "photo-poetry",
    title: "Photo Poetry",
    page: "photo-poetry.html",
    statement: {
      meta: "",
      body: [],
    },
  },
];

// The side menu on project pages. Projects above are listed automatically;
// one without a `page` yet is shown as plain text rather than a dead link.
// `placeholders` are names reserved in the menu before any photographs exist.
export const sideMenu = {
  // The mark is the identity now, with the tagline under it. Either of these
  // can be empty and the build leaves that line out altogether rather than
  // writing an empty span — put a string back and the line returns.
  name: "",
  role: "fine art photography",
  // Names held in the menu before any photographs exist. Empty now that every
  // project has a page of its own.
  placeholders: [],
  hideFromMenu: [],
  // Everything after the projects, in the same list. Studies is deliberately
  // not here for now — it is still reachable from the top bar on Home, Studies
  // and About. Add it back as a second entry when it should return.
  extra: [
    { label: "About", href: "about.html" },
  ],
  contact: [
    { label: site.email, href: `mailto:${site.email}` },
    { label: "instagram", href: site.instagram },
  ],
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
export const brand = "陳";
export const brandPath =
  "M40.01 32.33V61.63H51.34C46.39 68.85 38.83 75.48 31.28 78.92C33.04 80.44 35.39 83.29 36.57 85.14C44.21 80.94 51.68 73.64 56.88 65.41V88.92H64.61V64.99C69.14 73.05 75.61 80.44 82.41 84.63C83.58 82.7 86.02 79.85 87.7 78.42C80.9 75.06 74.18 68.6 69.73 61.63H82.16V32.33H64.61V26.11H85.43V19.31H64.61V11H56.88V19.31H36.73V26.11H56.88V32.33ZM46.98 49.62H56.88V55.84H46.98ZM64.61 49.62H74.85V55.84H64.61ZM46.98 38.04H56.88V44.16H46.98ZM64.61 38.04H74.85V44.16H64.61ZM12.3 14.61V89H19.27V21.75H28.34C26.66 27.46 24.56 34.93 22.46 40.72C27.92 46.85 29.26 52.39 29.26 56.59C29.26 59.11 28.93 61.04 27.75 61.96C27.08 62.47 26.16 62.64 25.23 62.72C23.97 62.72 22.63 62.72 20.87 62.64C21.96 64.57 22.63 67.59 22.71 69.44C24.64 69.52 26.66 69.52 28.25 69.35C30.02 69.02 31.61 68.51 32.79 67.67C35.31 65.91 36.31 62.38 36.31 57.51C36.31 52.48 35.05 46.6 29.35 39.88C32.03 33.25 34.97 24.35 37.32 17.3L32.12 14.27L30.94 14.61Z";

// The header menu, generated into every page so a new project appears
// everywhere at once. Project pages are inserted directly after Projects.
export const nav = [
  { label: "Home", href: "/" },
  { label: "Studies", href: "studies.html" },
  { label: "About", href: "about.html" },
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
    page: "index.html",
    marker: "hero",
    sizes: "(max-width: 1100px) 100vw, 1100px",
    link: "the-meadow.html",
    linkLabel: "Enter The Meadow",
  },
];

// Pages listed in sitemap.xml, in order. `title` and `description` drive the
// <title>, meta description, Open Graph and canonical tags on each page.
export const pages = [
  {
    file: "index.html",
    path: "/",
    priority: "1.0",
    title: "Jué Chen — fine art photography",
    description:
      "Fine art photography by Jué Chen. Minimal stills of light, distance and absence. Based in London.",
    ogImage: "assets/images/hero-1440.jpg",
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
    file: "species-of-spaces.html",
    path: "/species-of-spaces.html",
    priority: "0.7",
    title: "Species of Spaces — Jué Chen",
    description:
      "Species of Spaces — a photographic series by Jué Chen.",
    ogImage: "assets/images/projects/species-of-spaces/01-1440.jpg",
  },
  {
    file: "photo-poetry.html",
    path: "/photo-poetry.html",
    priority: "0.7",
    title: "Photo Poetry — Jué Chen",
    description:
      "Photo Poetry — a photographic series by Jué Chen.",
    ogImage: "assets/images/projects/photo-poetry/01-1440.jpg",
  },
  {
    file: "studies.html",
    path: "/studies.html",
    priority: "0.8",
    title: "Studies — Jué Chen",
    description:
      "Fragments and experiments — a running set of photographic studies by Jué Chen, London and the UK.",
    ogImage: "assets/images/studies/01-1440.jpg",
  },
  {
    file: "about.html",
    path: "/about.html",
    priority: "0.5",
    title: "About — Jué Chen",
    description:
      "Jué Chen is a fine art photographer based in London, working in minimal stills of light, distance and absence.",
    ogImage: "assets/images/hero-1440.jpg",
  },
];

// Files that carry an image but should never be crawled or listed.
export const excludedPages = ["viewer.html", "404.html"];

// Pages with no top bar and no footer — the photograph and its line of text and
// nothing else. The build generates neither block for these, so the markup has
// to be absent from the file as well.
export const barePages = ["index.html"];

// The 陳 mark. Generated once from Noto Sans CJK TC Medium with the outline
// embedded, so no font has to be present on the reader's machine. The SVG is
// listed first because every current browser prefers it; the .ico is the
// fallback for old ones and for the bare /favicon.ico request browsers make on
// their own. Regenerate only if the mark itself changes.
export const icons = [
  { rel: "icon", href: "/assets/icons/favicon.svg", type: "image/svg+xml" },
  { rel: "icon", href: "/favicon.ico", sizes: "48x48 32x32 16x16" },
  { rel: "apple-touch-icon", href: "/assets/icons/apple-touch-icon.png" },
  { rel: "manifest", href: "/site.webmanifest" },
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
