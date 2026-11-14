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
export const hidden = ["an-empty-room", "grain"];

// A group's name on the site is made from its folder name — 102-the-meadow
// becomes "The Meadow". Put a name here only when that comes out wrong.
// Keyed by the part of the folder name after the code.
export const names = {
  // "an-empty-room": "An Empty Room",
};

// A line under a project's name on the Projects page, before the count.
export const meta = {
  "the-meadow": "Edinburgh · 2012",
};

// What each photograph shows, for anyone who cannot see it. Keyed by file
// name without the extension. A photograph with none here is described as
// "<group>, photograph <n>", which works but is worth replacing.
export const alt = {
  "000-00": "An outstretched arm in a pale blue sleeve against a soft sky, fingers pinched together.",
  "102-01": "Double exposure of two framed mirrors of sky held up in a field, a chair in the foreground.",
  "102-02": "A figure seated in a field, holding a mirror that shows sky where the head and body would be.",
  "102-03": "Double exposure of a standing figure, a chair and a mirror on grass.",
  "102-04": "Double exposure of trees and a hillside in yellow-green light.",
  "102-05": "A figure on a chair in parkland, holding a mirror of sky in front of the face.",
  "102-06": "A mirror on the grass reflecting clouds and the photographer looking down with a camera.",
  "102-07": "A small mirror lying in red-toned grass, reflecting the sky.",
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
