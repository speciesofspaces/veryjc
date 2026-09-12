# juechen.uk

Static photography site, published by GitHub Pages from `main`.

The design, copy and CSS are hand-written and stay that way. What's automated is
the tedious part: turning a folder of JPEGs into properly sized, modern-format
images, and keeping the galleries, sitemap and page metadata in step with them.

---

## Adding photographs

1. Put JPEGs in the right folder under `upload/`:

   | Folder | Appears on |
   |---|---|
   | `upload/studies/` | Studies |
   | `upload/projects/the-meadow/` | The Meadow |
   | `upload/projects/empty-room/` | Empty Room |

2. Commit and push.

That's the whole job. File names don't matter — they're renumbered on from the
last photograph in that set. Within about five minutes the build will have:

- generated AVIF, WebP and JPEG at every useful width
- rewritten the gallery grid on the relevant page
- updated `sitemap.xml`
- emptied `upload/` and committed the lot back to `main`

Upload the biggest files you have — at least 2048px on the long side. Nothing is
ever upscaled, so a small original stays small.

**Removing** a photograph: delete it from `assets/images/…` and renumber the rest
so there are no gaps. The build deletes the orphaned variants for you.

---

## Alt text

`assets/data/alt.json` maps each photograph to its description:

```json
{ "assets/images/studies/01.jpg": "A hand against a pale sky, fingers half closed." }
```

Anything left blank falls back to "Studies — photograph 3", which works but is
worth replacing. The build warns about how many are still empty; it never fails
on them.

---

## Changing the site

| To change | Edit |
|---|---|
| Page titles, descriptions, social preview images | `tools/config.mjs` → `pages` |
| Domain, your name, email, Instagram | `tools/config.mjs` → `site` |
| Image widths and compression quality | `tools/config.mjs` → `widths`, `formats` |
| A new project | `tools/config.mjs` → `projects`, then add `upload/projects/<slug>/` |
| Viewer captions (place, year) | `assets/viewer.js` → `CAPTIONS` |
| Anything visual | `assets/style.css` and the pages themselves |

The build only ever rewrites what sits between a marker pair:

```html
<!-- build:studies start -->
<!-- build:studies end -->
```

Everything outside those markers is yours and is never touched.

---

## Running it locally

```bash
npm install          # once — installs sharp
npm run build        # images, pages, sitemap, checks
npm run serve        # preview at http://localhost:3000
```

Individual steps: `npm run images`, `npm run pages`, `npm run sitemap`,
`npm run check`.

`npm run check` fails the build on a broken link, a missing image variant, a
missing `alt` attribute, a page with no canonical or description, or a `CNAME`
that disagrees with `site.url` in the config. It warns, without failing, about
empty alt text.

---

## How publishing works

`.github/workflows/build-site.yml` runs on every push to `main`, does the work
above, and commits the result back with `[skip ci]` so it doesn't retrigger
itself. GitHub Pages then publishes `main` exactly as it did before — the Pages
source stays on "Deploy from a branch", and no repository settings need changing.

If the workflow ever fails, the site stays as it was; nothing is published from a
failed run.

---

## Layout

```
index.html  projects.html  studies.html  about.html  viewer.html  404.html
assets/
  style.css          hand-written
  nav.js             mobile menu
  viewer.js          full-screen viewer, reads the manifest below
  images/            originals (NN.jpg) + generated variants (NN-960.avif …)
  data/
    gallery.json     generated — what exists, how big, what it's called
    alt.json         hand-written descriptions
    .image-cache.json  generated — lets the build skip unchanged photographs
tools/
  config.mjs         everything configurable
  build-images.mjs   ingest, resize, encode, prune
  build-pages.mjs    rewrite galleries and <head> metadata
  build-sitemap.mjs  sitemap.xml + robots.txt
  check-site.mjs     pre-publication checks
upload/              drop new photographs here
```
