// bundle.js
// Concatenates the numbered module files in src/ (00-..., 01-..., etc.)
// into a single file you can paste back as the Claude.ai artifact.
//
// Run with:  npm run bundle   (or  node bundle.js)
//
// It reads every .js / .jsx file in src/, sorts them by filename so the
// numeric prefixes control order, glues them together with a labeled
// separator between each, and writes the result to dist/work-hub.bundle.jsx.

import fs from "node:fs";
import path from "node:path";

const SRC_DIR = "src";
const OUT_DIR = "dist";
const OUT_FILE = path.join(OUT_DIR, "work-hub.bundle.jsx");

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(
      `No "${SRC_DIR}/" folder yet. Create it and add your module files first.`
    );
    process.exit(1);
  }

  const files = fs
    .readdirSync(SRC_DIR)
    .filter((f) => f.endsWith(".js") || f.endsWith(".jsx"))
    .sort(); // filenames like 00-, 01-, 02- sort into the right order

  if (files.length === 0) {
    console.error(`No .js/.jsx module files found in "${SRC_DIR}/" yet.`);
    process.exit(1);
  }

  const parts = [];
  let totalLines = 0;

  for (const file of files) {
    const full = path.join(SRC_DIR, file);
    const code = fs.readFileSync(full, "utf8");
    const lines = code.split("\n").length;
    totalLines += lines;
    parts.push(
      `// ===== ${file} (${lines} lines) =====\n${code.trimEnd()}\n`
    );
  }

  const bundled = parts.join("\n");

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, bundled, "utf8");

  console.log(`Bundled ${files.length} module(s):`);
  for (const f of files) console.log(`  - ${f}`);
  console.log(`\nWrote ${OUT_FILE}`);
  console.log(`Total source lines (pre-bundle): ${totalLines}`);
  console.log(`Bundle lines: ${bundled.split("\n").length}`);
}

main();
