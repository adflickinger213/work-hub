# CLAUDE.md — Work Hub

Persistent context for Claude Code. Read this before making any changes.

## What this is

**Work Hub** is Lexy's personal productivity app for FFCU implementation work:
a daily roadmap generator (powered by Claude API, companion **Rosie**),
slot-based scheduling, tasks/items, meetings, reminders, follow-ups, parked
items, brain dump, and an end-of-day reflection flow.

It ships as a **single React artifact** pasted into Claude.ai. The source lives
here split into 8 module files for sane editing, and a bundler stitches them
back into one file.

## The golden rule: modules are CONCATENATED, not imported

The 8 files in `src/` are glued together **in filename order** into one file.
They are NOT ES modules.

- **Do NOT add `import`/`export` between the module files.** They share one
  scope. A `const` in `01-...` is visible in `08-...` because after bundling
  they're literally the same file.
- React and hooks come from the artifact runtime — don't add React imports.
- The only `export default` is `App()`, in `08-app-main.js`. Keep it that way.
- If you add a helper, put it in the module where it belongs and just use it
  elsewhere by name.

## Module map (`src/`)

| File | Holds |
|------|-------|
| `01-helpers-time-slots.js` | time/date helpers, meeting parsing, slot math, the heal/canonicalize/ensure pipeline. Also carries the **landmine baseline header** at the very top. |
| `02-helpers-tasks-items.js` | task + item helpers |
| `03-api-rosie.js` | Claude API calls + Rosie prompt construction / JSON parsing |
| `04-components-roadmap.js` | the roadmap card, timeline/list/edit views, slot rows, drag/resize |
| `05-components-items.js` | item components |
| `06-components-modals.js` | shared modals |
| `07-components-misc.js` | everything else (largest file) |
| `08-app-main.js` | top-level `App()`, state wiring, the default export |

## The dev loop (do this every time)

1. Edit the relevant module in `src/`.
2. `npm run ship` — bundles to `dist/work-hub.bundle.jsx` and runs the verify
   gate (strict parse + landmine baseline). **Must say PASS before you're done.**
3. `git add . && git commit -m "..." && git push`.
4. When you want the live app updated: copy `dist/work-hub.bundle.jsx` and paste
   it back into the Claude.ai artifact.

`dist/` and `node_modules/` are gitignored — never commit them.

## The verify gate (landmines)

`check-landmines.js` strict-parses the bundle and counts fragile patterns
against `landmines.baseline.json`. Current baseline (occurrence counts):

- `currentMinutes`: 7
- `if (!loaded) return;` guards: 4
- `const [linkPickerForSlot` declaration: 1
- `"|"` (pipe in double-quotes): 21
- standalone `sec`: 4

If a count drifts unexpectedly: **STOP, diagnose, explain why, baseline only if
the change was intentional** (delete `landmines.baseline.json` and re-run to
re-record). Drift usually means something was accidentally added or dropped.

> Note: `src/01-...` also has an older human-readable header block using
> `grep -c` line counts (6/4/1/9/4). That's stale documentation, not the live
> baseline. The file above is the source of truth.

## How the app actually works (don't "modernize" these)

- **Styling:** inline `style={{}}` + in-file `<style>` blocks. **Not Tailwind.**
  Match the existing approach — don't introduce Tailwind utility classes.
- **Persistence:** `window.storage` (the artifact storage API). There is **no**
  `localStorage` here, and `window.storage` does **not** exist in plain Vite,
  so the app is edited+verified here, not run here. It runs in the Claude.ai
  artifact. Use the existing Export/Import backup flow to move data.
- **AI:** direct calls to `https://api.anthropic.com`, model
  `claude-sonnet-4-20250514`. In the artifact sandbox the call is **keyless**
  (the runtime injects auth). Don't add an API key. Don't change the model
  unless asked.

## Aesthetic (boho-feminine cottagecore — do not drift)

Warm, soft, lived-in. Never corporate, never sterile, never hustle-coded.

- **Palette:** ivory / cream / warm beige base; dusty rose, terracotta, sage
  green, muted gold accents; soft lavender + mushroom brown. Avoid pure white,
  pure black, corporate blue, slate gray, neon, bright primaries.
- **Type:** headers in **Cormorant Garamond** (soft serif); body in **Jost**
  (with Inter where already used). Italic for quotes/labels/microcopy.
- **UI:** rounded corners (generous), soft shadows not hard borders, lots of
  breathing room, thin-stroke line icons. Cats welcome where it fits.

## Rosie's voice

Warm, plain, conversational. Quiet-wisdom energy (Maya Angelou, not motivational
poster). Short sentences, real talk. Acknowledge feelings before solutions.
Never "let's crush it!", never manic, never emoji-stuffed.

## Working norms with Lexy

- She likes momentum and working code over option menus — make the sensible
  call and tell her what you did, rather than presenting a buffet.
- Approve-before-big-changes for anything risky or wide-reaching; small surgical
  edits can just be done + verified.
- Keep stable code untouched. Touch only what the task needs.
- Always run the verify gate before declaring anything done.
- Her style: direct, concise, warm, no exclamation points, no em-dashes.
