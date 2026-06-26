# Working on Work Hub — quick reference 🌸

Everything happens in the Codespace (browser). Nothing installs on your work machine.

## Launch Claude Code

Open the repo's Codespace, then in the terminal:

```
claude --model claude-opus-4-8
```

Use `--model claude-opus-4-8` until Fable 5 is available again, otherwise it
errors on the unavailable default.

## The edit loop

1. Tell Claude Code what you want in plain English. It already knows the 8
   modules from `CLAUDE.md`, so you don't have to say which file.
   - e.g. *"make the brain-break blocks a softer sage"*
   - e.g. *"have Rosie's EOD reflection ask one gentler follow-up"*
2. It edits, then the **verify agent** runs `npm run ship` (parse + landmine
   check). Wait for **PASS** before trusting the change.
3. Review the diff right in the editor.
4. Commit:
   ```
   git add . && git commit -m "what changed" && git push
   ```

## Putting a change into the LIVE app you actually use

The source bundles to `dist/work-hub.bundle.jsx`. To update the real app:

1. Open `dist/work-hub.bundle.jsx`, copy the whole file.
2. Paste it into your **existing** Work Hub artifact — the chat where your data
   already lives.

⚠️ **Do NOT paste into a new chat/artifact.** Your roadmaps, tasks, and meetings
live in that one artifact's `window.storage`. A new artifact starts empty.
Same artifact = your data is preserved.

Backup habit: hit **Export** in Work Hub's Settings before any big change;
**Import** restores it.

## Agents (auto-trigger, or call by name)

- **verify** — bundles + checks landmines before anything's "done." Your net.
- **design-aesthetic** — cottagecore palette, Cormorant Garamond + Jost, Rosie's voice.
- **refactor** — move/extract code without changing behavior.
- **rosie-ai** — Rosie's prompts, the Claude API call, JSON parsing.
- **data-keeper** — storage schema, migrations, backup/restore safety.

Call one explicitly: *"have the design-aesthetic agent review this."*

## Manual commands (if you skip Claude Code)

```
npm run ship      bundle + verify (the gate)
npm run bundle    just rebuild dist/work-hub.bundle.jsx
npm run check     just run the parse + landmine check
```

## Don'ts

- Don't commit `dist/` or `node_modules/` (already gitignored).
- Don't add `import`/`export` between the 8 modules — they're concatenated into
  one shared scope. A name defined in one is visible in all.
- Don't change the API model or add an API key in the app code.
