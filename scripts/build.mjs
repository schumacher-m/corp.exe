#!/usr/bin/env bun
/**
 * Bundle src/main.js → dist/game.js, copy static assets (incl. muffledCall ogg).
 */
import { $ } from "bun";
import { cpSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, basename } from "path";

const ROOT = join(import.meta.dir, "..");
const OUT = join(ROOT, "dist");

function copyTree(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src)) {
    if (name === "__pycache__" || name === "preview" || name.endsWith(".py") || name.endsWith(".bak")) continue;
    const from = join(src, name);
    const to = join(dest, name);
    const st = statSync(from);
    if (st.isDirectory()) copyTree(from, to);
    else cpSync(from, to);
  }
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

console.log("[build] bundling src/main.js …");
const result = await Bun.build({
  entrypoints: [join(ROOT, "src/main.js")],
  outdir: OUT,
  target: "browser",
  format: "esm",
  naming: "game.js",
  external: [
    "three",
    "three/*",
    "three/addons/*",
    "three/addons/loaders/GLTFLoader.js",
  ],
  minify: false,
  sourcemap: "none",
});
if (!result.success) {
  console.error(result.logs);
  process.exit(1);
}

const indexSrc = readFileSync(join(ROOT, "index.html"), "utf8");
const indexOut = indexSrc
  .replace(/<script src="boot\.js"><\/script>\s*/g, "")
  .replace(
    /<script type="module" src="game\.js"><\/script>/g,
    '<script type="module" src="./game.js"></script>'
  );
writeFileSync(join(OUT, "index.html"), indexOut);
cpSync(join(ROOT, "style.css"), join(OUT, "style.css"));

copyTree(join(ROOT, "assets"), join(OUT, "assets"));
copyTree(join(ROOT, "copy"), join(OUT, "copy"));
mkdirSync(join(OUT, "audio"), { recursive: true });
for (const name of readdirSync(join(ROOT, "audio"))) {
  if (/\.(ogg|wav|mp3)$/i.test(name)) {
    cpSync(join(ROOT, "audio", name), join(OUT, "audio", name));
  }
}
if (existsSync(join(ROOT, "README.md"))) {
  cpSync(join(ROOT, "README.md"), join(OUT, "README.md"));
}
writeFileSync(join(OUT, ".nojekyll"), "");

const muffled = join(OUT, "audio/sfx-muffled-call.ogg");
if (!existsSync(muffled)) {
  console.error("[build] MISSING audio/sfx-muffled-call.ogg in dist");
  process.exit(1);
}

const count = Number((await $`find ${OUT} -type f | wc -l`.text()).trim());
console.log(`[build] dist/ ready (${count} files), muffledCall OK`);
