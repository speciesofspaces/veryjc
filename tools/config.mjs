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

// Projects each get a cover on projects.html and their own run of images.
// `page` is the project's own page; a project without one still gets a cover,
// which falls back to the old full-screen viewer.
export const projects = [
  { slug: "the-meadow", title: "The Meadow", page: "the-meadow.html" },
  { slug: "empty-room", title: "Empty Room", page: null },
];

// The header menu, generated into every page so a new project appears
// everywhere at once. Project pages are inserted directly after Projects.
export const nav = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "projects.html" },
  { label: "Studies", href: "studies.html" },
  { label: "About", href: "about.html" },
];

export const projectsPage = {
  page: "projects.html",
  marker: "projects",
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
    link: "projects.html",
    linkLabel: "Enter projects",
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
    file: "projects.html",
    path: "/projects.html",
    priority: "0.9",
    title: "Projects — Jué Chen",
    description:
      "Photographic series by Jué Chen, including The Meadow and Empty Room.",
    ogImage: "assets/images/projects/the-meadow/cover-1440.jpg",
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
  owner: site.author,
  links: [{ label: "Instagram", href: site.instagram }],
};
