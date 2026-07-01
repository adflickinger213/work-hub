// QA / tabletop / pressure-test harness for Work Hub.
// Exercises the REAL modules (lib/, api/, src/hooks/) with mocked browser and
// server globals — no network, deterministic, fast. Covers session-auth
// security, injection fencing, storage + migration, pre-gen gating, the
// Poppy/Hazel logic, and every API handler (auth gating, validation, anomaly
// detection, key/secret leakage, rate limiting, login lockout).
//
// Run: npm test   (or: node test/qa.mjs from the repo root)
// Exits non-zero on any failure so it can gate the build.

const ROOT = process.cwd();
let pass = 0, fail = 0;
const fails = [];
function ok(name, cond) {
  if (cond) { pass++; console.log("  ✓", name); }
  else { fail++; fails.push(name); console.log("  ✗ FAIL:", name); }
}
function section(t) { console.log("\n== " + t + " =="); }

// ---- mock localStorage ----
function freshLocalStorage() {
  const m = new Map();
  globalThis.localStorage = {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    clear: () => m.clear(),
    key: (i) => [...m.keys()][i] ?? null,
    get length() { return m.size; },
  };
  return m;
}

// ---- controllable Date ----
const RealDate = Date;
function setFakeNow(ms) {
  class FakeDate extends RealDate {
    constructor(...a) { if (a.length === 0) super(ms); else super(...a); }
    static now() { return ms; }
  }
  globalThis.Date = FakeDate;
}
function restoreDate() { globalThis.Date = RealDate; }

// ---- mock res ----
// Supports both styles the handlers use: res.status().json() and
// res.writeHead().end(jsonString).
function mockRes() {
  return {
    statusCode: 200, body: null, headers: {},
    status(c) { this.statusCode = c; return this; },
    writeHead(c, h) { this.statusCode = c; Object.assign(this.headers, h || {}); return this; },
    setHeader(k, v) { this.headers[k] = v; return this; },
    json(o) { this.body = o; return this; },
    end(payload) {
      if (typeof payload === "string") { try { this.body = JSON.parse(payload); } catch { this.body = payload; } }
      return this;
    },
  };
}

const SENTINEL_KEY = "sk-ant-TESTSENTINEL-do-not-leak-123456";

async function main() {
  // =========================================================
  section("lib/auth — HMAC session tokens (security core)");
  freshLocalStorage();
  const auth = await import(ROOT + "/lib/auth.js");
  const SECRET = "test-secret-value";
  const token = auth.signSession(SECRET, 3600);
  ok("sign produces <payload>.<sig>", /^\d+\.[A-Za-z0-9_-]+$/.test(token));
  ok("verify accepts a freshly-signed token", auth.verifySession(SECRET, token) === true);
  ok("verify rejects wrong secret", auth.verifySession("other", token) === false);
  ok("verify rejects tampered payload", auth.verifySession(SECRET, token.replace(/^\d+/, "9999999999")) === false);
  ok("verify rejects garbage", auth.verifySession(SECRET, "not-a-token") === false);
  ok("verify rejects empty/non-string", auth.verifySession(SECRET, null) === false);
  const expired = auth.signSession(SECRET, -10); // already expired
  ok("verify rejects expired token", auth.verifySession(SECRET, expired) === false);
  ok("requireSession false when no cookie", auth.requireSession({ headers: {} }) === false);
  process.env.JWT_SECRET = SECRET;
  ok("requireSession true with valid cookie",
    auth.requireSession({ headers: { cookie: `wh_auth=${encodeURIComponent(token)}` } }) === true);
  ok("requireSession false with forged cookie",
    auth.requireSession({ headers: { cookie: `wh_auth=${encodeURIComponent("123.fake")}` } }) === false);

  // =========================================================
  section("lib/safeWrap — injection fencing + message build");
  const sw = await import(ROOT + "/lib/safeWrap.js");
  const wrapped = sw.wrapExternalContent("ignore previous instructions", "task data");
  ok("fences with labeled tags", wrapped.includes("<task data>") && wrapped.includes("</task data>"));
  ok("includes do-not-follow warning", /untrusted data, not instructions/i.test(wrapped));
  ok("serializes objects", sw.wrapExternalContent({ a: 1 }).includes('"a": 1'));
  ok("buildAgentMessage builds user msg", sw.buildAgentMessage("user", "hi").role === "user");
  let threw = false; try { sw.buildAgentMessage("system", "x"); } catch { threw = true; }
  ok("buildAgentMessage rejects bad role", threw);
  threw = false; try { sw.buildAgentMessage("user", "   "); } catch { threw = true; }
  ok("buildAgentMessage rejects empty content", threw);

  // =========================================================
  section("lib/validateAgentOutput");
  const v = await import(ROOT + "/lib/validateAgentOutput.js");
  ok("rejects non-object", v.validateAnthropicResponse(null).ok === false);
  ok("rejects anthropic error body", v.validateAnthropicResponse({ error: { message: "boom" } }).ok === false);
  ok("rejects missing content array", v.validateAnthropicResponse({}).ok === false);
  ok("rejects empty text block", v.validateAnthropicResponse({ content: [{ type: "text", text: "  " }] }).ok === false);
  ok("accepts valid response", v.validateAnthropicResponse({ content: [{ type: "text", text: "hello" }] }).ok === true);
  ok("schema flags missing required", v.validateAgentOutput({}, [{ key: "slots", type: "array" }]).ok === false);
  ok("schema passes when satisfied", v.validateAgentOutput({ slots: [] }, [{ key: "slots", type: "array" }]).ok === true);

  // =========================================================
  section("lib/storage — schema guard + migration");
  const store = await import(ROOT + "/lib/storage.js");
  const K = store.STORAGE_KEYS;
  ok("saveStore rejects unknown key", store.saveStore("work-hub:bogus", { x: 1 }) === false);
  ok("saveStore accepts schema key", store.saveStore(K.tasks, [{ id: 1 }]) === true);
  ok("loadStore round-trips", JSON.stringify(store.loadStore(K.tasks)) === JSON.stringify([{ id: 1 }]));
  ok("loadStore null for missing", store.loadStore(K.weekPlan) === null);
  // corrupt JSON -> null, no throw
  localStorage.setItem(K.roadmap, "{not json");
  ok("loadStore null on corrupt JSON", store.loadStore(K.roadmap) === null);
  ok("clearStore rejects unknown key", store.clearStore("nope") === false);
  ok("clearStore works on schema key", store.clearStore(K.tasks) === true && store.loadStore(K.tasks) === null);
  // migration
  freshLocalStorage();
  const store2ts = Date.now();
  localStorage.setItem("work-hub-v4", JSON.stringify({ tasks: [{ id: "a" }], roadmap: [{ s: 1 }], junk: 1 }));
  const m1 = store.migrateFromV4();
  ok("migrateFromV4 runs first time", m1 === true);
  ok("migration copied tasks", JSON.stringify(store.loadStore(K.tasks)) === JSON.stringify([{ id: "a" }]));
  ok("migration copied roadmap", JSON.stringify(store.loadStore(K.roadmap)) === JSON.stringify([{ s: 1 }]));
  ok("migration did NOT delete old key", localStorage.getItem("work-hub-v4") !== null);
  ok("migrateFromV4 idempotent (second call no-op)", store.migrateFromV4() === false);
  void store2ts;

  // =========================================================
  section("lib/preGen — Friday/Monday gating + staleness");
  freshLocalStorage();
  const pg = await import(ROOT + "/lib/preGen.js");
  setFakeNow(new RealDate(2026, 5, 26, 15, 30, 0).getTime()); // Fri 3:30pm
  ok("shouldPreGenerate TRUE Fri 3:30pm", pg.shouldPreGenerate() === true);
  setFakeNow(new RealDate(2026, 5, 26, 9, 0, 0).getTime()); // Fri 9am
  ok("shouldPreGenerate FALSE Fri morning", pg.shouldPreGenerate() === false);
  setFakeNow(new RealDate(2026, 5, 24, 16, 0, 0).getTime()); // Wed 4pm
  ok("shouldPreGenerate FALSE midweek", pg.shouldPreGenerate() === false);
  // cache freshness
  setFakeNow(new RealDate(2026, 5, 29, 8, 0, 0).getTime()); // Mon
  pg.savePreGenCache({ weekPlan: { mon: [] } }, "clear");
  ok("getPreGenCache returns fresh cache", pg.getPreGenCache() !== null);
  ok("isPreGenCacheStale false when fresh", pg.isPreGenCacheStale() === false);
  ok("shouldServeFromCache TRUE Monday w/ fresh cache", pg.shouldServeFromCache() === true);
  // make it stale: 5 days old
  const stale = { weekPlan: { mon: [] }, timestamp: Date.now() - 5 * 86400000 };
  localStorage.setItem(store.STORAGE_KEYS.preGenCache, JSON.stringify(stale));
  ok("getPreGenCache null when >4 days old", pg.getPreGenCache() === null);
  ok("isPreGenCacheStale true when old", pg.isPreGenCacheStale() === true);
  setFakeNow(new RealDate(2026, 5, 24, 9, 0, 0).getTime()); // Wed
  ok("shouldServeFromCache FALSE midweek", pg.shouldServeFromCache() === false);
  restoreDate();

  // =========================================================
  section("usePoppy — silence thresholds (pure logic)");
  freshLocalStorage();
  const { usePoppy } = await import(ROOT + "/src/hooks/usePoppy.js");
  const poppy = usePoppy();
  ok("unknown person green when fresh", poppy.logCommunication("Vendor X", "touchpoint", "") && poppy.getSilenceStatus("Vendor X") === "green");
  // Rob: 2 open items -> red
  poppy.logCommunication("Rob", "item", "a"); poppy.logCommunication("Rob", "item", "b");
  ok("Rob red at 2 open items", poppy.getSilenceStatus("Rob") === "red");
  // Josh: 1 item, fresh -> not red (needs 3 items or 5 days)
  poppy.logCommunication("Josh", "item", "x");
  ok("Josh not red at 1 item / fresh", poppy.getSilenceStatus("Josh") !== "red");

  // =========================================================
  section("useHazel — aging + escalation triggers (pure logic)");
  const { useHazel } = await import(ROOT + "/src/hooks/useHazel.js");
  const hz = useHazel();
  const old = new RealDate(Date.now() - 12 * 86400000).toISOString(); // ~8 business days
  const recent = new RealDate(Date.now() - 1 * 86400000).toISOString();
  const aging = hz.detectAgingItems([
    { id: 1, title: "Stale", updatedAt: old },
    { id: 2, title: "Fresh", updatedAt: recent },
    { id: 3, title: "Done old", updatedAt: old, done: true },
  ]);
  ok("aging detects only stale, not fresh", aging.length === 1 && aging[0].id === 1);
  const esc = hz.checkEscalationTriggers(
    [{ id: 9, title: "Hard", hardDeadline: new RealDate(Date.now() - 86400000).toISOString() }], null);
  ok("escalation flags past hard deadline", esc.hasEscalations === true);
  const pin = hz.checkEscalationTriggers([{ id: 7, title: "Pinned thing", pinned: true }], { mon: [] });
  ok("escalation flags unplaced pinned task", pin.escalations.some(e => e.kind === "pinned_threat"));

  // =========================================================
  section("api/login — gate, lockout, no-leak");
  process.env.APP_PASSWORD = "hunter2";
  process.env.JWT_SECRET = SECRET;
  const login = (await import(ROOT + "/api/login.js")).default;
  const ipL = "10.0.0.1";
  let r = mockRes();
  await login({ method: "GET", headers: {} }, r);
  ok("login rejects non-POST 405", r.statusCode === 405);
  r = mockRes();
  await login({ method: "POST", headers: { "x-forwarded-for": ipL }, body: { password: "hunter2" } }, r);
  ok("login success 200 ok:true", r.statusCode === 200 && r.body.ok === true);
  ok("login sets httpOnly Secure cookie", /HttpOnly/.test(r.headers["Set-Cookie"]) && /Secure/.test(r.headers["Set-Cookie"]));
  ok("login does NOT echo the token in the body (cookie only)", r.body.token === undefined);
  ok("login cookie carries a signed token", /wh_auth=\d+/.test(decodeURIComponent(r.headers["Set-Cookie"])));
  ok("login never leaks the password value", !JSON.stringify(r.body).includes("hunter2"));
  // wrong password 10x -> lockout on 11th, from a NEW ip
  const ipBad = "10.0.0.99";
  for (let i = 0; i < 10; i++) { r = mockRes(); await login({ method: "POST", headers: { "x-forwarded-for": ipBad }, body: { password: "wrong" } }, r); }
  ok("login returns 401 on wrong password", r.statusCode === 401 && r.body.ok === false);
  r = mockRes();
  await login({ method: "POST", headers: { "x-forwarded-for": ipBad }, body: { password: "wrong" } }, r);
  ok("login LOCKS OUT after 10 fails (429)", r.statusCode === 429);
  r = mockRes();
  await login({ method: "POST", headers: { "x-forwarded-for": ipBad }, body: { password: "hunter2" } }, r);
  ok("locked IP blocked even with correct password", r.statusCode === 429);

  // =========================================================
  section("api/agent — auth gate, validation, anomaly, no-leak, rate limit");
  process.env.ANTHROPIC_API_KEY = SENTINEL_KEY;
  const agent = (await import(ROOT + "/api/agent.js")).default;
  const goodToken = auth.signSession(SECRET, 3600);
  const cookie = `wh_auth=${encodeURIComponent(goodToken)}`;

  // mock fetch (anthropic) — captures the outgoing request body so tests can
  // assert what actually got sent upstream.
  let nextAnthropic = { content: [{ type: "text", text: '{"weekPlan":{"mon":[]},"sageNote":"ok"}' }] };
  let fetchShouldThrow = false;
  let lastFetchBody = null;
  globalThis.fetch = async (url, opts) => {
    if (fetchShouldThrow) throw new Error("network down");
    try { lastFetchBody = JSON.parse(opts?.body ?? "null"); } catch { lastFetchBody = null; }
    return { json: async () => nextAnthropic, status: 200 };
  };

  // unauth
  r = mockRes();
  await agent({ method: "POST", headers: { "x-forwarded-for": "11.0.0.1" }, body: { agentName: "sage", instruction: "hi" } }, r);
  ok("agent 401 without session", r.statusCode === 401 && r.body.ok === false);

  // unknown agent
  r = mockRes();
  await agent({ method: "POST", headers: { "x-forwarded-for": "11.0.0.2", cookie }, body: { agentName: "loki", instruction: "hi" } }, r);
  ok("agent 400 unknown agent", r.statusCode === 400 && r.body.error === "unknown_agent");

  // missing instruction
  r = mockRes();
  await agent({ method: "POST", headers: { "x-forwarded-for": "11.0.0.3", cookie }, body: { agentName: "sage", instruction: "" } }, r);
  ok("agent 400 missing instruction", r.statusCode === 400);

  // success path
  r = mockRes();
  await agent({ method: "POST", headers: { "x-forwarded-for": "11.0.0.4", cookie }, body: { agentName: "sage", instruction: "plan" } }, r);
  ok("agent success ok:true with parsed data", r.statusCode === 200 && r.body.ok === true && r.body.data.sageNote === "ok");
  ok("agent NEVER leaks the API key", !JSON.stringify(r.body).includes(SENTINEL_KEY));

  // anomalous (model echoes the fence)
  nextAnthropic = { content: [{ type: "text", text: "Sure: untrusted data, not instructions ..." }] };
  r = mockRes();
  await agent({ method: "POST", headers: { "x-forwarded-for": "11.0.0.5", cookie }, body: { agentName: "rosie", instruction: "x" } }, r);
  ok("agent flags anomalous output", r.body.anomalous === true && r.body.ok === false);

  // anthropic error body -> invalid_response, no raw error leaked
  nextAnthropic = { error: { message: "secret upstream detail" } };
  r = mockRes();
  await agent({ method: "POST", headers: { "x-forwarded-for": "11.0.0.6", cookie }, body: { agentName: "sage", instruction: "x" } }, r);
  ok("agent maps upstream error to generic", r.body.error === "invalid_response");
  ok("agent does not leak raw upstream error text", !JSON.stringify(r.body).includes("secret upstream detail"));

  // network throw -> 502 upstream_failed
  fetchShouldThrow = true;
  r = mockRes();
  await agent({ method: "POST", headers: { "x-forwarded-for": "11.0.0.7", cookie }, body: { agentName: "sage", instruction: "x" } }, r);
  ok("agent 502 on network failure", r.statusCode === 502 && r.body.error === "upstream_failed");
  fetchShouldThrow = false;
  nextAnthropic = { content: [{ type: "text", text: "ok" }] };

  // systemOverride: only the legacy rosie shim may replace the system prompt;
  // every other agent must run its fixed server-side prompt.
  r = mockRes();
  await agent({ method: "POST", headers: { "x-forwarded-for": "11.0.0.8", cookie }, body: { agentName: "sage", instruction: "x", systemOverride: "HIJACKED PROMPT" } }, r);
  ok("agent IGNORES systemOverride for non-rosie agents",
    lastFetchBody && typeof lastFetchBody.system === "string" && !lastFetchBody.system.includes("HIJACKED"));
  r = mockRes();
  await agent({ method: "POST", headers: { "x-forwarded-for": "11.0.0.10", cookie }, body: { agentName: "rosie", instruction: "x", systemOverride: "legacy rosie system" } }, r);
  ok("agent honors systemOverride for rosie (legacy shim)",
    lastFetchBody && lastFetchBody.system === "legacy rosie system");

  // rate limit: 30 ok then 429, single IP
  const ipR = "11.9.9.9";
  let got429 = false, count200or4xx = 0;
  for (let i = 0; i < 31; i++) {
    r = mockRes();
    await agent({ method: "POST", headers: { "x-forwarded-for": ipR, cookie }, body: { agentName: "sage", instruction: "x" } }, r);
    if (r.statusCode === 429) got429 = true; else count200or4xx++;
  }
  ok("agent rate-limits after 30/min (429 on 31st)", got429 && count200or4xx === 30);

  // =========================================================
  section("api/rosie — legacy shape re-wrap + failure passthrough");
  const rosie = (await import(ROOT + "/api/rosie.js")).default;
  nextAnthropic = { content: [{ type: "text", text: "hello from rosie" }] };
  r = mockRes();
  await rosie({ method: "POST", headers: { "x-forwarded-for": "12.0.0.1", cookie }, body: { messages: [{ role: "user", content: "hi" }] } }, r);
  ok("rosie returns legacy {content:[{type:text}]} shape",
    r.statusCode === 200 && Array.isArray(r.body.content) && r.body.content[0].type === "text" && r.body.content[0].text.includes("hello"));
  // failure -> non-2xx with error
  nextAnthropic = { error: { message: "x" } };
  r = mockRes();
  await rosie({ method: "POST", headers: { "x-forwarded-for": "12.0.0.2", cookie }, body: { messages: [{ role: "user", content: "hi" }] } }, r);
  ok("rosie failure surfaces non-2xx", r.statusCode >= 400 && !!r.body.error);

  // =========================================================
  section("api/push-subscribe — auth + shape validation");
  const push = (await import(ROOT + "/api/push-subscribe.js")).default;
  r = mockRes();
  await push({ method: "POST", headers: {}, body: {} }, r);
  ok("push 401 without session", r.statusCode === 401);
  r = mockRes();
  await push({ method: "POST", headers: { cookie }, body: { endpoint: "x" } }, r);
  ok("push 400 on invalid subscription", r.statusCode === 400);
  r = mockRes();
  await push({ method: "POST", headers: { cookie }, body: { endpoint: "https://e", keys: { p256dh: "a", auth: "b" } } }, r);
  ok("push 200 on valid subscription", r.statusCode === 200 && r.body.ok === true);
  r = mockRes();
  await push({ method: "POST", headers: { cookie }, body: { endpoint: "http://internal-host/steal", keys: { p256dh: "a", auth: "b" } } }, r);
  ok("push 400 on non-https endpoint", r.statusCode === 400);

  // =========================================================
  section("api/morning-brief — session gate");
  const brief = (await import(ROOT + "/api/morning-brief.js")).default;
  r = mockRes();
  await brief({ method: "GET", headers: {} }, r);
  ok("morning-brief 401 without session", r.statusCode === 401 && r.body.error === "not_authorized");
  r = mockRes();
  await brief({ method: "GET", headers: { cookie } }, r);
  ok("morning-brief authed request passes the gate", r.statusCode !== 401);

  // =========================================================
  section("lib/morning-brief — buildBrief (pure formatter)");
  const mb = await import(ROOT + "/lib/morning-brief.js");
  ok("buildBrief(null) -> null", mb.buildBrief(null) === null);
  const briefFresh = mb.buildBrief({ date: "2026-06-30", completedTasks: ["x"] }, "2026-06-30T09:00:00.000Z");
  ok("buildBrief marks same-day snapshot fresh", briefFresh.isStale === false);
  ok("buildBrief defaults missing arrays", Array.isArray(briefFresh.waitingOn) && briefFresh.waitingOn.length === 0);
  ok("buildBrief carries completedTasks through", JSON.stringify(briefFresh.completedTasks) === JSON.stringify(["x"]));
  const briefStale = mb.buildBrief({ date: "2026-06-30" }, "2026-07-01T09:00:00.000Z");
  ok("buildBrief marks older snapshot stale", briefStale.isStale === true);

  // =========================================================
  section("lib/snapshotStore + api/snapshot — auth gate, validation, upsert/fetch");
  const store3 = await import(ROOT + "/lib/snapshotStore.js");
  const snapshot = (await import(ROOT + "/api/snapshot.js")).default;
  // Fake Postgres: records queries; SELECT returns whatever `latestRows` holds.
  let sqlCalls = [];
  let latestRows = [];
  const fakeSql = {
    query: async (text, params) => {
      sqlCalls.push({ text: String(text), params });
      if (/^\s*SELECT/i.test(text)) return { rows: latestRows };
      return { rows: [] };
    },
  };
  store3.__setSqlForTests(fakeSql);
  store3.__resetTableFlagForTests();

  // method gate: never touches the DB
  sqlCalls = [];
  r = mockRes();
  await snapshot({ method: "DELETE", headers: { cookie } }, r);
  ok("snapshot 405 on unsupported method", r.statusCode === 405);
  ok("snapshot skips DB on bad method", sqlCalls.length === 0);
  // auth gate: never touches the DB
  sqlCalls = [];
  r = mockRes();
  await snapshot({ method: "GET", headers: {} }, r);
  ok("snapshot 401 without session", r.statusCode === 401);
  ok("snapshot skips DB when unauthenticated", sqlCalls.length === 0);
  // invalid date: rejected before any write
  sqlCalls = [];
  r = mockRes();
  await snapshot({ method: "POST", headers: { cookie }, body: { date: "not-a-date" } }, r);
  ok("snapshot 400 on invalid date", r.statusCode === 400 && r.body.error === "invalid_date");
  ok("snapshot does not write on invalid date", !sqlCalls.some((c) => /INSERT/i.test(c.text)));
  // valid POST upserts by date
  sqlCalls = [];
  r = mockRes();
  await snapshot({ method: "POST", headers: { cookie }, body: { date: "2026-06-30", completedTasks: ["a"] } }, r);
  ok("snapshot 200 on valid POST", r.statusCode === 200 && r.body.ok === true);
  ok("snapshot upserts the row for that date", sqlCalls.some((c) => /INSERT/i.test(c.text) && c.params[0] === "2026-06-30"));
  // GET returns the latest, reshaped
  latestRows = [{ date: "2026-06-30", snapshot_json: { completedTasks: ["a"], waitingOn: [] } }];
  r = mockRes();
  await snapshot({ method: "GET", headers: { cookie } }, r);
  ok("snapshot GET 200 returns latest", r.statusCode === 200 && r.body.ok === true && r.body.snapshot.date === "2026-06-30");
  ok("snapshot GET merges json payload", JSON.stringify(r.body.snapshot.completedTasks) === JSON.stringify(["a"]));

  // =========================================================
  section("api/morning-brief — auth gate + reads snapshot store directly");
  const morningBrief = (await import(ROOT + "/api/morning-brief.js")).default;
  r = mockRes();
  await morningBrief({ method: "POST", headers: { cookie } }, r);
  ok("morning-brief 405 on non-GET", r.statusCode === 405);
  sqlCalls = [];
  r = mockRes();
  await morningBrief({ method: "GET", headers: {} }, r);
  ok("morning-brief 401 without session", r.statusCode === 401);
  ok("morning-brief skips DB when unauthenticated", sqlCalls.length === 0);
  latestRows = [];
  r = mockRes();
  await morningBrief({ method: "GET", headers: { cookie } }, r);
  ok("morning-brief 200 brief:null when empty", r.statusCode === 200 && r.body.ok === true && r.body.brief === null);
  latestRows = [{ date: "2026-06-30", snapshot_json: { completedTasks: ["a"], sageNote: "n" } }];
  r = mockRes();
  await morningBrief({ method: "GET", headers: { cookie } }, r);
  ok("morning-brief 200 formats a brief from the snapshot",
    r.statusCode === 200 && r.body.brief && r.body.brief.date === "2026-06-30" && r.body.brief.sageNote === "n");
  store3.__resetSqlForTests();

  // =========================================================
  section("lib/agentOrchestrator — runSageRebalance + runEODChain (mocked fetch)");
  const orch = await import(ROOT + "/lib/agentOrchestrator.js");
  // Route the browser-style relative fetches the orchestrator makes.
  let snapshotWrites = 0;
  let snapshotOk = true;
  globalThis.fetch = async (url, opts) => {
    const u = String(url);
    const body = opts && opts.body ? JSON.parse(opts.body) : {};
    if (u.includes("/api/agent")) {
      if (body.agentName === "sage") {
        return { ok: true, json: async () => ({ ok: true, anomalous: false, data: { weekPlan: { mon: ["x"] }, sageNote: "moved things" } }) };
      }
      if (body.agentName === "ivy") {
        return { ok: true, json: async () => ({ ok: true, anomalous: false, data: { proposals: [], conflicts: [], pruneWarnings: [] } }) };
      }
    }
    if (u.includes("/api/snapshot")) {
      snapshotWrites++;
      return { ok: snapshotOk, json: async () => ({ ok: snapshotOk }) };
    }
    return { ok: false, json: async () => ({}) };
  };
  const reb = await orch.runSageRebalance(["a"], ["a", "b"], "clear");
  ok("runSageRebalance ok with updatedWeekPlan", reb.ok === true && reb.updatedWeekPlan && Array.isArray(reb.updatedWeekPlan.mon));
  ok("runSageRebalance carries sageNote", reb.sageNote === "moved things");
  const chain = await orch.runEODChain({ date: "2026-06-30", incompleteTasks: ["a"], allTasks: ["a"], agentScrolls: {}, weekHistory: [] });
  ok("runEODChain Sage step succeeds (regression guard for missing runSageRebalance)", chain.sageResult && chain.sageResult.ok === true);
  ok("runEODChain Ivy step succeeds", chain.ivyResult && chain.ivyResult.ok === true);
  ok("runEODChain snapshot persists", chain.snapshotResult && chain.snapshotResult.ok === true);
  ok("runEODChain top-level ok reflects snapshot persistence", chain.ok === true);
  // snapshot write failing flips top-level ok but leaves the agent steps intact
  snapshotOk = false;
  const chain2 = await orch.runEODChain({ date: "2026-06-30", incompleteTasks: [], allTasks: [] });
  ok("runEODChain ok:false when snapshot write fails", chain2.ok === false && chain2.snapshotResult.ok === false);
  ok("runEODChain still runs Sage when snapshot fails", chain2.sageResult && chain2.sageResult.ok === true);
  // sage endpoint failing -> graceful sage_unavailable, no throw
  globalThis.fetch = async (url, opts) => {
    const u = String(url);
    if (u.includes("/api/snapshot")) return { ok: true, json: async () => ({ ok: true }) };
    return { ok: false, json: async () => ({}) };
  };
  const rebFail = await orch.runSageRebalance([], [], null);
  ok("runSageRebalance degrades to sage_unavailable on HTTP error", rebFail.ok === false && rebFail.error === "sage_unavailable");
  void snapshotWrites;

  // =========================================================
  console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
  if (fail) { console.log("Failed:", fails.join(" | ")); process.exit(1); }
}

main().catch((e) => { console.error("HARNESS ERROR:", e); process.exit(2); });
