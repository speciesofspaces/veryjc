// Writes sitemap.xml and robots.txt from tools/config.mjs.
// Last-modified dates come from the file's last git commit, falling back to mtime.

import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

import { site, pages } from "./config.mjs";

const root = path.resolve(import.meta.dirname, "..");
const base = site.url.replace(/\/$/, "");

function lastModified(file) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (out) return out.slice(0, 10);
  } catch {
    /* not a git checkout, or the file is untracked */
  }
  return null;
}

const entries = [];
for (const page of pages) {
  const absFile = path.join(root, page.file);
  let date = lastModified(page.file);
  if (!date) {
    const stat = await fs.stat(absFile);
    date = stat.mtime.toISOString().slice(0, 10);
  }
  const loc = page.path === "/" ? `${base}/` : `${base}${page.path}`;
  entries.push(
    [
      "  <url>",
      `    <loc>${loc}</loc>`,
      `    <lastmod>${date}</lastmod>`,
      `    <priority>${page.priority}</priority>`,
      "  </url>",
    ].join("\n"),
  );
}

const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  entries.join("\n") +
  "\n</urlset>\n";

await fs.writeFile(path.join(root, "sitemap.xml"), sitemap);

const robots = [
  "User-agent: *",
  "Allow: /",
  "Disallow: /viewer.html",
  "",
  `Sitemap: ${base}/sitemap.xml`,
  "",
].join("\n");

await fs.writeFile(path.join(root, "robots.txt"), robots);

console.log(`sitemap.xml written with ${entries.length} URL(s)`);
console.log("robots.txt written");
