// check-landmines.js
// Verification gate for Work Hub. Two jobs:
//   1. Strict-parse the bundled code (catches syntax errors before you paste
//      it back into the artifact).
//   2. Count the "landmine" patterns and compare them to a saved baseline so
//      we notice if a refactor silently added or dropped one of the fragile
//      spots we care about.
//
// Run with:  npm run check   (or  node check-landmines.js)
//
// First run with no baseline: it records the current counts as the baseline
// and passes. Every run after that: it compares and fails on any drift.
// To intentionally re-baseline (e.g. a feature legitimately changed a count),
// delete landmines.baseline.json and run again.

import fs from "node:fs";
import path from "node:path";
import { parse } from "@babel/parser";

const BUNDLE = path.join("dist", "work-hub.bundle.jsx");
const SRC_DIR = "src";
const BASELINE = "landmines.baseline.json";

// The fragile patterns we track. Each is a plain regex counted across the
// whole source. We re-confirm these against the real work-hub.jsx in Stage 4.
const LANDMINES = {
  currentMinutes: /currentMinutes/g,
  loadedGuards: /if \(!loaded\) return;/g,
  linkPickerForSlotDecl: /const \[linkPickerForSlot/g,
  pipeInDquotes: /"\|"/g,
  secWord: /\bsec\b/g,
};

function loadSource() {
  if (fs.existsSync(BUNDLE)) {
    return { code: fs.readFileSync(BUNDLE, "utf8"), from: BUNDLE };
  }
  if (fs.existsSync(SRC_DIR)) {
    const files = fs
      .readdirSync(SRC_DIR)
      .filter((f) => f.endsWith(".js") || f.endsWith(".jsx"))
      .sort();
    if (files.length) {
      const code = files
        .map((f) => fs.readFileSync(path.join(SRC_DIR, f), "utf8"))
        .join("\n");
      return { code, from: `${SRC_DIR}/ (${files.length} files)` };
    }
  }
  return null;
}

function countLandmines(code) {
  const counts = {};
  for (const [name, re] of Object.entries(LANDMINES)) {
    const m = code.match(re);
    counts[name] = m ? m.length : 0;
  }
  return counts;
}

function main() {
  const src = loadSource();
  if (!src) {
    console.error(
      "Nothing to check yet — no dist/ bundle and no files in src/.\n" +
        "Run `npm run bundle` first, or add module files to src/."
    );
    process.exit(1);
  }

  console.log(`Checking: ${src.from}\n`);

  // 1. Strict parse
  try {
    parse(src.code, {
      sourceType: "module",
      strictMode: true,
      plugins: ["jsx"],
    });
    console.log("Parse: OK (no syntax errors)");
  } catch (err) {
    console.error("Parse: FAILED");
    console.error(`  ${err.message}`);
    process.exit(1);
  }

  // 2. Landmine counts vs baseline
  const counts = countLandmines(src.code);

  if (!fs.existsSync(BASELINE)) {
    fs.writeFileSync(BASELINE, JSON.stringify(counts, null, 2) + "\n", "utf8");
    console.log(`\nNo baseline found — recorded current counts to ${BASELINE}:`);
    for (const [k, v] of Object.entries(counts)) console.log(`  ${k}: ${v}`);
    console.log("\nBaseline established. PASS.");
    return;
  }

  const baseline = JSON.parse(fs.readFileSync(BASELINE, "utf8"));
  let drift = false;
  console.log("\nLandmines (current vs baseline):");
  for (const [k, v] of Object.entries(counts)) {
    const b = baseline[k] ?? "—";
    const flag = b === v ? "ok" : "DRIFT";
    if (b !== v) drift = true;
    console.log(`  ${k}: ${v} (baseline ${b}) ${flag}`);
  }

  if (drift) {
    console.error(
      "\nFAILED: landmine drift detected.\n" +
        "If the change was intentional, delete landmines.baseline.json and re-run to re-baseline."
    );
    process.exit(1);
  }

  console.log("\nAll landmines match baseline. PASS.");
}

main();
