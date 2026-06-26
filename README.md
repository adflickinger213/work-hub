# work-hub 🌸

Personal productivity app for FFCU implementation work. The app itself is a
large React single-file artifact (Rosie, roadmap builder, meetings, tasks,
reminders, follow-ups). This repo holds the **modular source** plus the tooling
that bundles it back into one pasteable artifact and verifies it before ship.

## Layout

```
src/                  the app, split into numbered module files (00-, 01-, ...)
bundle.js             concatenates src/ modules -> dist/work-hub.bundle.jsx
check-landmines.js    strict-parses the bundle + checks landmine baselines
landmines.baseline.json   recorded counts of fragile patterns (auto-created)
package.json          scripts + the one dependency (@babel/parser)
```

`src/` starts empty. The actual module split happens as a working session —
one module at a time, each bundled and verified before the next.

## Commands

```
npm install        once, to pull @babel/parser
npm run bundle     glue src/ modules into dist/work-hub.bundle.jsx
npm run check      strict parse + landmine baseline comparison
npm run ship       bundle then check (the gate before pasting back to the artifact)
```

## Landmines

These are fragile spots we don't want a refactor to silently change. The
checker counts each one and compares to `landmines.baseline.json`. First run
records the baseline; later runs fail on drift. To intentionally re-baseline,
delete the baseline file and run `npm run check` again.

Tracked: `currentMinutes`, `if (!loaded) return;` guards, `linkPickerForSlot`,
pipe characters, and standalone `sec`. We confirm the real counts against
`work-hub.jsx` when the first modules land.

## Workflow

1. Edit (or add) a module in `src/`.
2. `npm run ship` to bundle + verify.
3. Commit and sync.
4. Paste `dist/work-hub.bundle.jsx` back into the Claude.ai artifact when you
   want the live app updated.
