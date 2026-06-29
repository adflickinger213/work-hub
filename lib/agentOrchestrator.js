// lib/agentOrchestrator.js — coordinates the weekly Sage cycle and the Monday
// morning serve. Kept framework-free (no React) so it can be called from hooks,
// the orchestration UI, or a scheduled pre-gen.

import { wrapExternalContent } from "./safeWrap.js";
import { savePreGenCache, getPreGenCache } from "./preGen.js";
import { runWeeklySynthesis } from "../src/hooks/useIvy.js";

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

/**
 * runSageRebalance(completedToday, allTasks, capacityState)
 * EOD step 1 — asks Sage to redistribute incomplete tasks across the remaining
 * weekdays only (never today or past days). Returns
 * { ok, updatedWeekPlan, sageNote, error }.
 */
export async function runSageRebalance(completedToday, allTasks, capacityState) {
  try {
    const completedSet = new Set((completedToday || []).map((id) => String(id)));
    const remainingTasks = (allTasks || []).filter(
      (t) => t && !completedSet.has(String(t.id ?? t))
    );

    const dayOfWeek = new Date().getDay();
    const weekDayKeys = ["mon", "tue", "wed", "thu", "fri"];
    const todayIdx = dayOfWeek >= 1 && dayOfWeek <= 5 ? dayOfWeek - 1 : -1;
    const remainingDays = weekDayKeys.slice(todayIdx + 1);

    if (remainingDays.length === 0) {
      return { ok: false, updatedWeekPlan: null, sageNote: "", error: "no_remaining_days" };
    }

    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        agentName: "sage",
        instruction:
          `Rebalance Lexy's remaining week.\n` +
          `Today's work is done — do NOT touch today or any past days.\n` +
          `Remaining weekdays to fill: ${remainingDays.join(", ")}.\n` +
          `Current capacity: ${capacityState || "unspecified"}.\n` +
          `Distribute the ${remainingTasks.length} remaining task(s) across only these days.\n` +
          `Return ONLY a raw JSON object (no markdown fences, no preamble): ` +
          `{ "weekPlan": { ${remainingDays.map((d) => `"${d}": []`).join(", ")} }, ` +
          `"sageNote": "<1-2 sentence note>" }.`,
        externalContent: wrapExternalContent(
          { tasks: remainingTasks },
          "remaining task data"
        ),
      }),
    });

    if (!res.ok) {
      return { ok: false, updatedWeekPlan: null, sageNote: "", error: "sage_unavailable" };
    }
    const payload = await res.json();
    if (!payload || !payload.ok || payload.anomalous) {
      return { ok: false, updatedWeekPlan: null, sageNote: "", error: "sage_unavailable" };
    }

    const plan = payload.data || {};
    return {
      ok: true,
      updatedWeekPlan: plan.weekPlan || null,
      sageNote: plan.sageNote || "",
      error: null,
    };
  } catch (err) {
    console.error("[work-hub] EOD chain step 1 failed:", err?.message ?? err);
    return { ok: false, updatedWeekPlan: null, sageNote: "", error: "rebalance_failed" };
  }
}

/**
 * writeEODSnapshot(todayData, updatedWeekPlan)
 * Sprint B stub — will persist a daily snapshot of completed work and the
 * rebalanced plan. Returns { ok, stub }.
 */
async function writeEODSnapshot(todayData, updatedWeekPlan) {
  // Sprint B: implement snapshot persistence
  return { ok: true, stub: true };
}

/**
 * runEODChain(todayData)
 * Fires after Rosie's reflection completes. Runs three steps in sequence:
 *   1. Sage rebalances remaining weekdays
 *   2. Ivy synthesises the week (success or graceful failure)
 *   3. EOD snapshot written (stubbed until Sprint B)
 * Never throws — every step catches its own errors and the chain always
 * completes. Returns { ok, sageResult, ivyResult, snapshotResult }.
 */
export async function runEODChain(todayData) {
  const allTasks = todayData.incompleteTasks || [];

  let sageResult = { ok: false, updatedWeekPlan: null, sageNote: "", error: "not_run" };
  try {
    sageResult = await runSageRebalance(
      todayData.completedTasks || [],
      allTasks,
      todayData.capacityState
    );
  } catch (err) {
    console.error("[work-hub] EOD chain step 1 failed:", err?.message ?? err);
  }

  let ivyResult = null;
  try {
    ivyResult = await runWeeklySynthesis();
  } catch (err) {
    console.error("[work-hub] EOD chain step 2 failed:", err?.message ?? err);
  }

  let snapshotResult = null;
  try {
    snapshotResult = await writeEODSnapshot(todayData, sageResult.updatedWeekPlan);
  } catch (err) {
    console.error("[work-hub] EOD chain step 3 failed:", err?.message ?? err);
  }

  return {
    ok: !!(sageResult.ok || ivyResult !== null),
    sageResult,
    ivyResult,
    snapshotResult,
  };
}
