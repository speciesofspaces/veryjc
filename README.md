# juechen.uk

Photographs by Jué Chen. A static site: plain HTML, CSS and a little
JavaScript, published by GitHub Pages.

## Adding or changing photographs

All photographs live in numbered folders in `assets/images/`. The number is a
code that never appears on the site: the first digit is the section, the rest
set the order in the menu.

| Code | Section |
|---|---|
| `000-home` | the hero on the home page |
| `1xx-name` | Projects — each folder is a project with its own page |
| `2xx-name` | Studies — each folder is a series on the wall |

The name after the code becomes the name on the site: `102-the-meadow` is
"The Meadow", `201-dream` is "Dream". Keep folder names lowercase, with hyphens.

Inside a folder, files end up named `<code>-00.jpg` (the cover; for a project,
its picture on the Projects page), then `<code>-01.jpg`, `<code>-02.jpg` … in
viewing order. You do not have to name them yourself:

1. Drop the photographs into the folder. Name the cover so it starts with `00`.
2. Commit and push in GitHub Desktop.
3. The build on GitHub renames them, makes the sizes the pages use, and
   rewrites the pages. Wait a minute or two, then **Fetch origin** in GitHub
   Desktop to bring its changes down before you change anything else.

New photographs go after the ones already numbered. To reorder, swap the
numbers in the file names. To add a project or a series, add a folder with the
next free code. To remove a photograph, delete it; its sizes are removed for
you.

Use the largest files you have — 2048px or more on the long side. Nothing is
enlarged, so a small file stays small on the page.

## What is where

| File | |
|---|---|
| `index.html`, `about.html` | written by hand (the build only updates their menu, and the hero) |
| `projects.html`, `studies.html`, one page per project | written by the build — do not edit |
| `tools/config.mjs` | names, descriptions of photographs (alt text), image sizes |
| `tools/build.mjs` | the build |
| `assets/site.css` | all the styling |
| `assets/wall.js`, `viewer.js`, `nav.js`, `cursor.js` | behaviour of Studies, a project page, the menu, the pointer |
| `.github/workflows/build.yml` | runs the build on GitHub after each push |

## Running it on your own computer (optional)

```bash
npm install      # once
npm run build    # rename, make sizes, write pages
npm run serve    # preview at http://localhost:3000
```
