// lib/agentOrchestrator.js — coordinates the weekly Sage cycle and the Monday
// morning serve. Kept framework-free (no React) so it can be called from hooks,
// the orchestration UI, or a scheduled pre-gen.

import { wrapExternalContent } from "./safeWrap.js";
import { savePreGenCache, getPreGenCache } from "./preGen.js";

/**
 * callSage(tasks, capacityState, peakFocusWindow)
 * Plain fetch to the agent endpoint for Sage. Returns parsed JSON or null.
 */
async function callSage(tasks, capacityState, peakFocusWindow) {
  const res = await fetch("/api/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      agentName: "sage",
      instruction:
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
        `"sageNote": "<1-2 sentence strategic observation>" }.`,
      externalContent: wrapExternalContent({ tasks: tasks || [] }, "task data"),
    }),
  });
  if (!res.ok) return null;
  const payload = await res.json();
  if (!payload || !payload.ok || payload.anomalous) return null;
  return payload.data || null;
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
