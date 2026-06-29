// Browser smoke test for Work Hub.
// Boots the real app (vite dev), bypasses only the UI login flag, and verifies
// at 390px mobile width that: the app renders with no unhandled JS errors, the
// weekly-prep launcher opens the planner, and Generate degrades gracefully to a
// soft error when the agent API isn't reachable (instead of crashing).
//
// Self-contained: it starts and stops its own dev server. It SKIPS cleanly
// (exit 0) when playwright-core or a Chromium build isn't available, so it
// never falsely fails in a browserless environment. Real UI breakage exits 1.
//
// Run: npm run test:smoke

import { spawn } from "node:child_process";
import { existsSync, readdirSync, mkdtempSync } from "node:fs";
import os from "node:os";
import path from "node:path";

function skip(msg) { console.log("SKIP (browser smoke):", msg); process.exit(0); }

let chromium;
try {
  const pw = await import("playwright-core");
  chromium = pw.chromium || (pw.default && pw.default.chromium);
} catch {
  skip("playwright-core not installed — run `npm i` to enable it.");
}
if (!chromium) skip("chromium API unavailable.");

// Discover a Chromium binary if launch() can't find one on its own.
function findChrome() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!base || !existsSync(base)) return null;
  for (const d of readdirSync(base)) {
    if (d.startsWith("chromium-") && !d.includes("headless")) {
      const p = path.join(base, d, "chrome-linux", "chrome");
      if (existsSync(p)) return p;
    }
  }
  return null;
}

// --- start the dev server, capture its URL ---
const dev = spawn("npm", ["run", "dev"], { stdio: ["ignore", "pipe", "pipe"] });
let url = null;
try {
  url = await new Promise((resolve, reject) => {
    const to = setTimeout(() => reject(new Error("dev server did not start in 60s")), 60000);
    dev.stdout.on("data", (b) => {
      const m = b.toString().match(/Local:\s+(http:\/\/localhost:\d+)/);
      if (m) { clearTimeout(to); resolve(m[1]); }
    });
    dev.on("exit", () => { clearTimeout(to); reject(new Error("dev server exited early")); });
  });
} catch (e) {
  try { dev.kill("SIGTERM"); } catch {}
  console.error("FAIL:", e.message);
  process.exit(1);
}

function stopDev() { try { dev.kill("SIGTERM"); } catch {} }

let browser;
const pageErrors = [];
const result = { rendered: false, launcher: false, overlay: false, generateBtn: false, gracefulError: false };
try {
  try {
    browser = await chromium.launch({ args: ["--no-sandbox"] });
  } catch {
    const exe = findChrome();
    if (!exe) { stopDev(); skip("no Chromium binary found."); }
    browser = await chromium.launch({ executablePath: exe, args: ["--no-sandbox"] });
  }

  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => pageErrors.push(String(e)));
  await page.addInitScript(() => { try { sessionStorage.setItem("wh_unlocked", "1"); } catch {} });

  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2500);

  result.rendered = (await page.locator("#root").innerHTML()).length > 200;

  const launcher = page.getByRole("button", { name: /this week/i });
  result.launcher = (await launcher.count()) > 0;

  const shotDir = mkdtempSync(path.join(os.tmpdir(), "wh-smoke-"));
  await page.screenshot({ path: path.join(shotDir, "app.png") });

  if (result.launcher) {
    await launcher.first().click();
    await page.waitForTimeout(800);
    result.overlay = (await page.getByText(/Run this any day|This Week/i).count()) > 0;
    const gen = page.getByRole("button", { name: /generate this week/i });
    result.generateBtn = (await gen.count()) > 0;
    await page.screenshot({ path: path.join(shotDir, "planner.png") });
    if (result.generateBtn) {
      await gen.first().click();
      await page.waitForTimeout(2500);
      result.gracefulError =
        (await page.getByText(/Sage couldn't shape the week|try again in a moment/i).count()) > 0;
      await page.screenshot({ path: path.join(shotDir, "after-generate.png") });
    }
  }
  console.log("Screenshots:", shotDir);
} catch (e) {
  console.error("INTERACTION ERROR:", String(e));
} finally {
  try { await browser?.close(); } catch {}
  stopDev();
}

// Page must render with zero unhandled JS errors; the flow must work end to end.
const checks = [
  ["app renders, no unhandled JS errors", result.rendered && pageErrors.length === 0],
  ["weekly-prep launcher present", result.launcher],
  ["planner overlay opens", result.overlay],
  ["Generate button present", result.generateBtn],
  ["graceful soft-error when API unreachable", result.gracefulError],
];
let failed = 0;
console.log("\n== browser smoke ==");
for (const [name, pass] of checks) { console.log((pass ? "  ✓ " : "  ✗ FAIL: ") + name); if (!pass) failed++; }
if (pageErrors.length) { console.log("PAGE ERRORS:"); pageErrors.slice(0, 10).forEach((e) => console.log("  -", e.slice(0, 200))); }
console.log(`\n=== SMOKE: ${checks.length - failed}/${checks.length} passed ===`);
process.exit(failed ? 1 : 0);
