// lib/agentOrchestrator.js — coordinates the weekly Sage cycle, the Monday
// morning serve, and the end-of-day (EOD) chain. Kept framework-free (no React)
// so it can be called from hooks, the orchestration UI, or a scheduled pre-gen.
//
// RUNS IN THE BROWSER. Every function here talks to the app's own serverless
// endpoints with relative-URL fetch("/api/...") + credentials:"same-origin",
// which only resolve in a browser. Do NOT import these into a Node/Vercel
// serverless handler and call them there — a relative URL throws in Node. The
// EOD chain (runEODChain) is meant to be invoked client-side from the reflection
// flow, exactly like runWeeklyCycle is invoked from the weekly-plan UI.

import { wrapExternalContent } from "./safeWrap.js";
import { savePreGenCache, getPreGenCache } from "./preGen.js";

/**
 * callAgent(agentName, instruction, externalContent, label)
 * Shared browser->/api/agent call. Returns the agent's parsed `data`, or null
 * on any HTTP error, anomalous output, or thrown exception. One place for the
 * fetch boilerplate every agent step below reuses.
 */
async function callAgent(agentName, instruction, externalContent, label) {
  try {
    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ agentName, instruction, externalContent }),
    });
    if (!res.ok) return null;
    const payload = await res.json();
    if (!payload || !payload.ok || payload.anomalous) return null;
    return payload.data || null;
  } catch (err) {
    console.error(`[work-hub] ${label || agentName} call failed:`, err?.message ?? err);
    return null;
  }
}

/**
 * callSage(tasks, capacityState, peakFocusWindow)
 * Asks Sage to build the week plan. Returns parsed JSON or null.
 */
async function callSage(tasks, capacityState, peakFocusWindow) {
  const instruction =
    `Build Lexy's week plan (Mon-Fri).\n` +
    `Current capacity: ${capacityState || "unspecified"}.\n` +
    `Peak focus window: ${peakFocusWindow || "unspecified"}.\n` +
    `There are ${Array.isArray(tasks) ? tasks.length : 0} tasks/items in the task list below. ` +
    `Distribute ALL of them across the five weekdays — every task must appear in at least one day's array. ` +
    `For each task include a realistic duration estimate (e.g. "30m", "1h", "2h"). ` +
    `Return ONLY a raw JSON object (no markdown fences, no preamble) matching this exact schema: ` +
    `{ "weekPlan": { "mon": [...], "tue": [...], "wed": [...], "thu": [...], "fri": [...] }, ` +
    `"taskDecompositions": { "<task name>": ["step1", "step2"] }, ` +
    `"capacityNotes": { "<day>": "<optional note>" }, ` +
    `"sageNote": "<1-2 sentence strategic observation>" }.`;
  return callAgent(
    "sage",
    instruction,
    wrapExternalContent({ tasks: tasks || [] }, "task data"),
    "callSage"
  );
}

/**
 * runWeeklyCycle(tasks, capacityState, peakFocusWindow)
 * Generates a fresh week plan via Sage and caches it. Returns
 * { ok, weekPlan, sageNote, error }.
 */
export async function runWeeklyCycle(tasks, capacityState, peakFocusWindow) {
  try {
    const plan = await callSage(tasks, capacityState, peakFocusWindow);
    if (!plan) {
      return { ok: false, weekPlan: null, sageNote: "", error: "sage_unavailable" };
    }
    savePreGenCache(plan, capacityState);
    return { ok: true, weekPlan: plan, sageNote: plan.sageNote || "", error: null };
  } catch (err) {
    console.error("[work-hub] runWeeklyCycle failed:", err?.message ?? err);
    return { ok: false, weekPlan: null, sageNote: "", error: "cycle_failed" };
  }
}

/**
 * runSageRebalance(incompleteTasks, allTasks, capacityState)
 * The EOD Sage step: given what didn't get done today, ask Sage to re-spread the
 * remaining work across the rest of the week. Returns
 * { ok, updatedWeekPlan, sageNote, error }.
 */
export async function runSageRebalance(incompleteTasks, allTasks, capacityState) {
  const incomplete = Array.isArray(incompleteTasks) ? incompleteTasks : [];
  const all = Array.isArray(allTasks) ? allTasks : [];
  const instruction =
    `It's end of day. Rebalance the rest of this week (the remaining weekdays).\n` +
    `Current capacity: ${capacityState || "unspecified"}.\n` +
    `${incomplete.length} task(s) did not get finished today and need to be re-placed, ` +
    `alongside the ${all.length} task(s) already in the plan. ` +
    `Redistribute the unfinished work across the remaining weekdays without overloading any single day. ` +
    `Return ONLY a raw JSON object (no markdown fences, no preamble) matching this exact schema: ` +
    `{ "weekPlan": { "mon": [...], "tue": [...], "wed": [...], "thu": [...], "fri": [...] }, ` +
    `"capacityNotes": { "<day>": "<optional note>" }, ` +
    `"sageNote": "<1-2 sentence note on what moved and why>" }.`;
  const data = await callAgent(
    "sage",
    instruction,
    wrapExternalContent(
      { incompleteTasks: incomplete, allTasks: all, capacityState: capacityState || null },
      "eod rebalance data"
    ),
    "runSageRebalance"
  );
  if (!data) {
    return { ok: false, updatedWeekPlan: null, sageNote: "", error: "sage_unavailable" };
  }
  return {
    ok: true,
    updatedWeekPlan: data.weekPlan || data.updatedWeekPlan || null,
    sageNote: data.sageNote || "",
    error: null,
  };
}

/**
 * runWeeklySynthesis(agentScrolls, weekHistory)
 * The EOD Ivy step: synthesize the week into scroll proposals. Returns Ivy's
 * parsed data or null. (The interactive, proposal-persisting version lives in
 * src/hooks/useIvy.js; this one is the fire-and-forget step inside the chain.)
 */
export async function runWeeklySynthesis(agentScrolls, weekHistory) {
  return callAgent(
    "ivy",
    "Synthesize the week. Return JSON: { proposals: [...], conflicts: [...], pruneWarnings: [] }.",
    wrapExternalContent(
      { agentScrolls: agentScrolls || {}, weekHistory: weekHistory || [] },
      "scrolls + history"
    ),
    "runWeeklySynthesis"
  );
}

/**
 * writeEODSnapshot(todayData, updatedWeekPlan)
 * Persists the day's snapshot via POST /api/snapshot (browser -> serverless ->
 * Postgres). Returns { ok, error }.
 */
export async function writeEODSnapshot(todayData, updatedWeekPlan) {
  try {
    const res = await fetch("/api/snapshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        date: todayData.date || null,
        completedTasks: todayData.completedTasks || [],
        incompleteTasks: todayData.incompleteTasks || [],
        waitingOn: todayData.waitingOn || [],
        updatedWeekPlan: updatedWeekPlan || null,
        slots: todayData.slots || [],
        sageNote: todayData.sageNote || null,
        ivyNote: todayData.ivyNote || null,
      }),
    });
    if (!res.ok) return { ok: false, error: "snapshot_http_error" };
    const payload = await res.json();
    return payload && payload.ok
      ? { ok: true, error: null }
      : { ok: false, error: (payload && payload.error) || "snapshot_write_failed" };
  } catch (err) {
    console.error("[work-hub] writeEODSnapshot failed:", err?.message ?? err);
    return { ok: false, error: "snapshot_write_failed" };
  }
}

/**
 * runEODChain(todayData)
 * The end-of-day chain, run from the browser: Sage rebalance -> Ivy synthesis ->
 * snapshot write. Each step is isolated so one failing doesn't sink the others.
 *
 * The top-level `ok` reflects whether the day's snapshot actually PERSISTED
 * (the chain's durable job). Sage and Ivy are best-effort assists — their
 * outcomes are surfaced in sageResult / ivyResult so the caller can react
 * without conflating "the plan got saved" with "every agent had something to say".
 */
export async function runEODChain(todayData) {
  const data = todayData || {};
  const results = { ok: false, sageResult: null, ivyResult: null, snapshotResult: null };
  let updatedWeekPlan = null;

  try {
    const sageRes = await runSageRebalance(
      data.incompleteTasks || [],
      data.allTasks || [],
      data.capacityState
    );
    results.sageResult = sageRes;
    if (sageRes.ok) updatedWeekPlan = sageRes.updatedWeekPlan;
  } catch (err) {
    results.sageResult = { ok: false, updatedWeekPlan: null, sageNote: "", error: "sage_exception" };
  }

  try {
    const ivyData = await runWeeklySynthesis(data.agentScrolls || {}, data.weekHistory || []);
    results.ivyResult = ivyData
      ? { ok: true, data: ivyData, error: null }
      : { ok: false, data: null, error: "ivy_failed" };
  } catch (err) {
    results.ivyResult = { ok: false, data: null, error: "ivy_exception" };
  }

  try {
    results.snapshotResult = await writeEODSnapshot(data, updatedWeekPlan);
  } catch (err) {
    results.snapshotResult = { ok: false, error: "snapshot_exception" };
  }

  results.ok = !!(results.snapshotResult && results.snapshotResult.ok);
  return results;
}

/**
 * runMorningServe()
 * If a valid cache exists, return it; otherwise signal that a fresh run is
 * needed. Returns { fromCache: true, weekPlan, generatedAt } or
 * { fromCache: false }.
 */
export function runMorningServe() {
  const cached = getPreGenCache();
  if (cached && cached.weekPlan) {
    return { fromCache: true, weekPlan: cached.weekPlan, generatedAt: cached.timestamp };
  }
  return { fromCache: false };
}
