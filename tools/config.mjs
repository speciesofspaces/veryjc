// Everything about the site that is a choice rather than a fact found on disk.
// The groups themselves — what is in Projects and Studies, in what
// order — come from the numbered folders in assets/images/, not from here.

export const site = {
  name: "Jué Chen",
  chinese: "陳覺",
  year: 2026,
  description: "Photographs by Jué Chen. How silence looks, and breaks.",
};

// The three sections, by the first digit of a folder's code.
export const sections = {
  0: { key: "home" },
  // index: false — the Projects page (one cover per project) is still built but
  // not linked: "Projects" in the menu only opens the list of projects.
  1: { key: "projects", title: "Projects", page: "projects.html", index: true },
  2: { key: "fleeting", title: "Studies", page: "studies.html" },
};

// Folders left off the site for now — no page, not in the menu, not on the
// wall. Keyed by the part of the folder name after the code. The folders and
// their photographs are kept.
export const hidden = ["grain"];

// A group's name on the site is made from its folder name — 102-the-meadow
// becomes "The Meadow". Put a name here only when that comes out wrong.
// Keyed by the part of the folder name after the code.
export const names = {
  // "an-empty-room": "An Empty Room",
};

// A line beside a project's name on the Projects page.
export const meta = {
  "margin": "Ongoing",
  "cosa": "London. 2026",
  "the-meadow": "Edinburgh · 2012",
};

// What each photograph shows, for anyone who cannot see it. Keyed by file
// name without the extension. A photograph with none here is described as
// "<group>, photograph <n>", which works but is worth replacing. An empty
// description ("") is kept empty: screen readers then pass over the picture.
export const alt = {
  "000-00": "",
  "103-00": "Double exposure of two framed mirrors of sky held up in a field, a chair in the foreground.",
  "103-01": "A figure seated in a field, holding a mirror that shows sky where the head and body would be.",
  "103-02": "Double exposure of a standing figure, a chair and a mirror on grass.",
  "103-03": "Double exposure of two framed mirrors of sky held up in a field, a chair in the foreground.",
  "103-04": "Double exposure of trees and a hillside in yellow-green light.",
  "103-05": "A figure on a chair in parkland, holding a mirror of sky in front of the face.",
  "103-06": "A small mirror lying in red-toned grass, reflecting the sky.",
};

// The sizes each photograph is made in, in pixels wide. Nothing is enlarged:
// a photograph smaller than the largest size gets its own width instead.
export const widths = [480, 720, 960, 1440, 2048];
// The one size also made as a JPEG, for browsers that read neither AVIF nor WebP.
export const fallbackWidth = 1440;
export const encode = {
  avif: { quality: 52, effort: 5 },
  webp: { quality: 78 },
  jpeg: { quality: 82, mozjpeg: true, progressive: true },
};
