// Ingests anything dropped in upload/, then generates AVIF / WebP / JPEG
// variants for every photograph and writes assets/data/gallery.json.
//
// Run: node tools/build-images.mjs
// Safe to run repeatedly — unchanged images are skipped.

import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import {
  galleries,
  projects,
  projectsPage,
  singles,
  widths,
  formats,
  fallbackWidth,
  jpegLadder,
} from "./config.mjs";

// The single width written as JPEG when the full ladder is switched off.
const jpegWidthFor = (usable) =>
  usable.includes(fallbackWidth) ? fallbackWidth : usable[usable.length - 1];

const root = path.resolve(import.meta.dirname, "..");
const cachePath = path.join(root, "assets", "data", ".image-cache.json");
const manifestPath = path.join(root, "assets", "data", "gallery.json");
const altPath = path.join(root, "assets", "data", "alt.json");

const SOURCE_RE = /^(\d{1,3})\.jpe?g$/i;
const VARIANT_RE = /-(\d{3,4})\.(avif|webp|jpg)$/i;

const log = (...a) => console.log(...a);

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function listFiles(dir) {
  try {
    return await fs.readdir(dir);
  } catch {
    return [];
  }
}

async function fingerprint(file) {
  const buf = await fs.readFile(file);
  return createHash("sha1").update(buf).digest("hex").slice(0, 16);
}

// ---------------------------------------------------------------- ingest ----

// Moves upload/<section>/*.jpg into the matching gallery folder, numbered on
// from the highest existing file. upload/ is emptied afterwards.
async function ingestUploads() {
  const targets = new Map();
  for (const g of galleries) targets.set(g.id, path.join(root, g.dir));
  for (const p of projects) {
    targets.set(`projects/${p.slug}`, path.join(root, projectsPage.dir, p.slug));
  }

  let moved = 0;
  for (const [key, destDir] of targets) {
    const srcDir = path.join(root, "upload", key);
    const entries = (await listFiles(srcDir))
      .filter((f) => SOURCE_RE.test(f) || /\.jpe?g$/i.test(f))
      .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
    if (!entries.length) continue;

    await fs.mkdir(destDir, { recursive: true });
    const existing = (await listFiles(destDir))
      .map((f) => SOURCE_RE.exec(f))
      .filter(Boolean)
      .map((m) => Number(m[1]));
    let next = existing.length ? Math.max(...existing) + 1 : 1;

    for (const entry of entries) {
      const dest = path.join(destDir, `${String(next).padStart(2, "0")}.jpg`);
      await fs.rename(path.join(srcDir, entry), dest);
      log(`  ingested ${entry} -> ${path.relative(root, dest)}`);
      next += 1;
      moved += 1;
    }
  }
  if (moved) log(`Ingested ${moved} new photograph(s) from upload/.`);
  return moved;
}

// --------------------------------------------------------------- variants ---

async function buildVariants(relSource, cache) {
  const abs = path.join(root, relSource);
  const hash = await fingerprint(abs);
  const meta = await sharp(abs).metadata();
  const base = relSource.replace(/\.jpe?g$/i, "");
  // Every configured width the source can actually supply, plus the source's own
  // width as the top step — so a 900px original still gets 480 and 720 for phones.
  const cap = Math.min(meta.width, widths[widths.length - 1]);
  const usable = [...new Set([...widths.filter((w) => w < cap), cap])].sort(
    (a, b) => a - b,
  );

  const jpegWidths = jpegLadder ? usable : [jpegWidthFor(usable)];

  const record = {
    base,
    hash,
    width: meta.width,
    height: meta.height,
    widths: usable,
    jpegWidths,
  };

  if (cache[relSource]?.hash === hash) {
    const expected = [
      ...usable.flatMap((w) =>
        ["avif", "webp"].map((ext) => path.join(root, `${base}-${w}.${ext}`)),
      ),
      ...jpegWidths.map((w) => path.join(root, `${base}-${w}.jpg`)),
    ];
    const present = await Promise.all(
      expected.map((f) => fs.access(f).then(() => true).catch(() => false)),
    );
    if (present.every(Boolean)) return { record, built: 0 };
  }

  let built = 0;
  for (const w of usable) {
    const pipeline = sharp(abs).rotate().resize({
      width: w,
      withoutEnlargement: true,
    });
    const jobs = [
      pipeline.clone().avif(formats.avif).toFile(path.join(root, `${base}-${w}.avif`)),
      pipeline.clone().webp(formats.webp).toFile(path.join(root, `${base}-${w}.webp`)),
    ];
    if (jpegWidths.includes(w)) {
      jobs.push(
        pipeline.clone().jpeg(formats.jpeg).toFile(path.join(root, `${base}-${w}.jpg`)),
      );
    }
    await Promise.all(jobs);
    built += jobs.length;
  }
  log(`  built ${built} variants for ${relSource} (${meta.width}x${meta.height})`);
  return { record, built };
}

// Deletes variants whose source photograph no longer exists.
async function pruneOrphans(dirs, keepBases) {
  let removed = 0;
  for (const dir of dirs) {
    for (const file of await listFiles(path.join(root, dir))) {
      if (!VARIANT_RE.test(file)) continue;
      const base = path.join(dir, file.replace(VARIANT_RE, ""));
      if (keepBases.has(base)) continue;
      await fs.rm(path.join(root, dir, file));
      removed += 1;
    }
  }
  if (removed) log(`Removed ${removed} orphaned variant(s).`);
  return removed;
}

// ---------------------------------------------------------------- collect ---

async function galleryImages(dir) {
  return (await listFiles(path.join(root, dir)))
    .filter((f) => SOURCE_RE.test(f))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
    .map((f) => path.posix.join(dir, f));
}

async function main() {
  await fs.mkdir(path.join(root, "assets", "data"), { recursive: true });
  await ingestUploads();

  const cache = await readJson(cachePath, {});
  const alt = await readJson(altPath, {});
  const nextCache = {};
  const keepBases = new Set();
  const dirsTouched = new Set();
  let totalBuilt = 0;

  const attach = (record) => ({
    src: `${record.base}.jpg`,
    base: record.base,
    width: record.width,
    height: record.height,
    widths: record.widths,
    jpegWidths: record.jpegWidths,
    alt: alt[`${record.base}.jpg`] || alt[record.base] || "",
  });

  // The cache is written after every photograph, not once at the end, so a run
  // that is interrupted resumes where it stopped instead of starting over.
  const remember = async (rel, record) => {
    nextCache[rel] = { hash: record.hash };
    await fs.writeFile(cachePath, JSON.stringify(nextCache, null, 2) + "\n");
  };

  const manifest = { generatedAt: new Date().toISOString(), galleries: {}, projects: {}, singles: {} };

  for (const g of galleries) {
    const sources = await galleryImages(g.dir);
    dirsTouched.add(g.dir);
    const images = [];
    for (const rel of sources) {
      const { record, built } = await buildVariants(rel, cache);
      totalBuilt += built;
      await remember(rel, record);
      keepBases.add(record.base);
      images.push(attach(record));
    }
    manifest.galleries[g.id] = { title: g.title, sizes: g.sizes, images };
    log(`${g.id}: ${images.length} photograph(s)`);
  }

  for (const p of projects) {
    const dir = path.posix.join(projectsPage.dir, p.slug);
    dirsTouched.add(dir);
    const sources = await galleryImages(dir);
    const images = [];
    for (const rel of sources) {
      const { record, built } = await buildVariants(rel, cache);
      totalBuilt += built;
      await remember(rel, record);
      keepBases.add(record.base);
      images.push(attach(record));
    }

    let cover = null;
    const coverRel = path.posix.join(dir, "cover.jpg");
    if (await fs.access(path.join(root, coverRel)).then(() => true).catch(() => false)) {
      const { record, built } = await buildVariants(coverRel, cache);
      totalBuilt += built;
      await remember(coverRel, record);
      keepBases.add(record.base);
      cover = attach(record);
    } else if (images.length) {
      cover = images[0];
    }

    manifest.projects[p.slug] = { title: p.title, sizes: projectsPage.sizes, cover, images };
    log(`${p.slug}: ${images.length} photograph(s)`);
  }

  for (const s of singles) {
    dirsTouched.add(path.posix.dirname(s.src));
    const { record, built } = await buildVariants(s.src, cache);
    totalBuilt += built;
    await remember(s.src, record);
    keepBases.add(record.base);
    manifest.singles[s.marker] = { ...attach(record), sizes: s.sizes };
  }

  await pruneOrphans(dirsTouched, keepBases);
  await fs.writeFile(cachePath, JSON.stringify(nextCache, null, 2) + "\n");
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

  if (!(await fs.access(altPath).then(() => true).catch(() => false))) {
    const stub = {};
    for (const key of keepBases) stub[`${key}.jpg`] = "";
    await fs.writeFile(altPath, JSON.stringify(stub, null, 2) + "\n");
    log("Created assets/data/alt.json — fill in the descriptions.");
  }

  log(`\nDone. ${totalBuilt} variant file(s) written this run.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
