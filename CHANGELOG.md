# Changelog — Work Hub

All notable changes for the v1.0.0 build. Phases 0–17.

## v1.0.0 — full agent council, weekly planning, focus mode, PWA

### Phase 0 — Foundation (pre-existing scaffolding)
The starting point: the single-artifact React app split into eight concatenated
`src/` modules with the bundle + landmine verify gate (`npm run ship`), the
password-gated Vite/Vercel shell (`api/login.js`, `api/rosie.js`,
`src/main.jsx`, `storage-shim.js`), the agent groundwork in `lib/`
(`agentPermissions.js`, `safeWrap.js`, `validateAgentOutput.js`), and the six
agent system prompts in `prompts/`.

### Phase 1 — API routes: agent endpoint and login gate
- Added `api/agent.js`: one serverless entry for all six agents. Validates
  `agentName` against `AGENT_PERMISSIONS`, fences external content, calls
  Anthropic with `AGENT_MODELS[agentName]`, validates the response, and returns
  a normalized `{ ok, data, error, anomalous }` — never the raw Anthropic body
  or the API key. Anomalous output is logged with a `[work-hub]` prefix.
- Added `lib/auth.js` and reworked `api/login.js` to issue an HMAC session token
  (signed with `JWT_SECRET`) in an httpOnly cookie; failures return `{ ok:false }`
  with no detail.
- Refactored `api/rosie.js` into a compatibility shim that delegates to
  `api/agent.js`.
- Added `wrapExternalContent()` to `lib/safeWrap.js` for prompt-injection fencing.

### Phase 2 — Storage schema + v4 migration
- Added `lib/storage.js`: `STORAGE_KEYS`, safe `loadStore` / `saveStore` /
  `clearStore`, and an idempotent `migrateFromV4()` that copies the old
  `work-hub-v4` blob into the new schema without deleting the original.

### Phase 3 — Rosie wired to agent API
- All `/api/rosie` traffic now routes through `api/agent.js` (the shim re-wraps
  the response so the 40+ existing call sites keep working).
- `migrateFromV4()` runs once on boot in `main.jsx`, which also exposes a
  `window.__workhub.saveSession` bridge so the import-free artifact can persist
  Rosie chat sessions to `STORAGE_KEYS.sessions`.

### Phase 4 — Capacity check-in + Sage hook
- Added `src/components/CapacityCheckIn.jsx` (four-state soft pill selector) and
  `src/hooks/useSage.js` (`generateWeekPlan`, cache read/write).

### Phase 5 — Weekly plan UI
- Added `src/components/WeeklyPlan.jsx`: Mon–Fri grid, expandable task
  decompositions, per-day capacity banners, Sage note, Monday cache serve,
  skeleton loading, and an empty state.

### Phase 6 — Poppy communications hub
- Added `src/components/PoppyHub.jsx` and `src/hooks/usePoppy.js`:
  contact silence status (green/amber/red against per-person thresholds),
  copy-only draft cards, and communication flags.

### Phase 7 — Hazel review surface
- Added `src/hooks/useHazel.js` (client-side aging detection + escalation
  triggers, plus the API review) and `src/components/HazelAlert.jsx`
  (dismissible banner, amber/soft-red tone, aging-items section).

### Phase 8 — Fern note input on tasks
- Added `src/components/FernInput.jsx`: a note box that routes Fern's reply
  (task update / new subtask / Poppy flag / Hazel flag / clarify / complete),
  never auto-applying without showing the change.

### Phase 9 — Pre-generation pipeline (Friday batch / Monday serve)
- Added `lib/preGen.js` and `lib/agentOrchestrator.js`
  (`runWeeklyCycle`, `runMorningServe`). `useSage` and `WeeklyPlan` now use the
  4-day cache, with a "Generated Friday" badge on Monday serves.

### Phase 10 — Ivy synthesis + scroll viewer
- Added `src/hooks/useIvy.js` (synthesis, approve/reject with scroll updates and
  a 50-learning cap) and `src/components/IvyProposals.jsx` (review stack,
  conflicts, prune warnings).

### Phase 11 — Focus Mode + candle timer
- Added `src/components/FocusMode.jsx`: full-screen overlay with an SVG candle
  that melts down over the session, a flickering flame, a Web Audio chime on
  burnout, snooze/complete, and Escape to exit.

### Phase 12 — Cottagecore garden scene
- Added `src/components/GardenScene.jsx`: an ambient SVG garden (wilted /
  budding / blooming) that crossfades with capacity state.

### Phase 13 — PWA manifest + service worker
- Added `public/manifest.json`, `public/sw.js` (cache-first static,
  network-first `/api/*`, offline fallback), `public/offline.html`, rosebud SVG
  icons, and service-worker registration in `index.html`.

### Phase 14 — Security hardening
- Added CSP + `X-Frame-Options` / `X-Content-Type-Options` / `Referrer-Policy` /
  `Permissions-Policy` headers in `vercel.json`; externalized SW registration so
  the CSP can forbid inline scripts.
- Added a 30 req/min/IP rate limiter to `api/agent.js` and a 10-failures/24h IP
  lockout to `api/login.js`, both logged with `[work-hub][security]`.
- Note: `Permissions-Policy` keeps `microphone=(self)` so the live-listen
  transcription feature still works; camera and geolocation are fully disabled.

### Phase 15 — Push notifications (VAPID + service worker)
- Added `lib/notifications.js` (`requestPermission`, `scheduleTaskReminder`,
  `scheduleHazelAlert`, `cancelReminder`), push + notificationclick handlers in
  `public/sw.js`, `api/push-subscribe.js` (in-memory store; production needs a
  real DB), and `src/components/NotificationsToggle.jsx` (off by default).

### Phase 16 — Agent orchestration UI + scroll viewer
- Added `src/components/AgentStatus.jsx` (sequential Sage → Poppy → Hazel →
  Fern → Ivy → Rosie cycle with per-agent status, anomalous flags, retry) and
  `src/components/AgentScrollViewer.jsx` (read-only scrolls with learning counts,
  reusing `IvyProposals`).

### Phase 17 — Final audit + v1.0.0 release
- `npm run ship`: all five landmines match baseline.
- `npm run build`: zero errors, zero warnings (chunk-size advisory silenced for
  the intentional single-artifact bundle).
- Audited: every new component has empty/error/loading states; no component
  reads or writes `localStorage` directly (all access via `lib/storage.js`); no
  hardcoded API keys or secrets; all 27 ESM modules parse cleanly; PWA manifest
  valid and service worker registers cleanly.
- Added this `CHANGELOG.md`; tagged `v1.0.0`.

### Security audit — endpoint auth + login hardening (post-v1.0.0)
- `api/snapshot.js` and `api/morning-brief.js` now require the HMAC session
  cookie. Both previously answered without any auth, exposing read (and for
  snapshot, write) access to the EOD work data to anyone with the URL.
- `api/eod-chain.js` answers a failed session check with an explicit 401
  instead of returning silently (the request used to hang with no response),
  and no longer throws on a missing request body.
- `api/agent.js` honors `systemOverride` only for the legacy rosie shim;
  every other agent always runs its fixed server-side system prompt.
- `api/login.js` compares passwords in constant time
  (`crypto.timingSafeEqual` over sha256 digests) and no longer echoes the
  session token in the response body — the httpOnly cookie is the only copy,
  so page script (XSS) has nothing to steal.
- `api/push-subscribe.js` only accepts `https:` push endpoints.
- `test/qa.mjs` grew matching coverage: session gates on snapshot/eod-chain/
  morning-brief, the systemOverride restriction (asserted against the captured
  upstream request), token-not-in-body, and https-endpoint validation.

#### Architecture note
The eight `src/NN-*.js` modules are concatenated into one artifact bundle (the
golden rule: no imports between them). The new agent features ship as ES modules
under `src/components/`, `src/hooks/`, and `lib/`, wired at the Vite/Vercel layer
(`main.jsx`, the `api/` routes, and the `window.__workhub` bridge). Deep
in-artifact wiring of the new panels was intentionally left to a follow-up so
the stable concatenated modules stay untouched.
