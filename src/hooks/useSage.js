// useSage.js — hook for Sage, the strategic weekly-planning agent.
//
// generateWeekPlan(capacityState, tasks, peakFocusWindow)
//   Calls POST /api/agent with agentName "sage", fencing task data with
//   wrapExternalContent. Returns parsed Sage JSON, or null on any error.
// getFromCache()  — reads the pre-gen cache; null if missing or older than 7 days.
// saveToCache(weekPlan) — writes the plan to the cache with a timestamp.

import { wrapExternalContent } from "../../lib/safeWrap.js";
import {
  getPreGenCache,
  savePreGenCache,
  shouldPreGenerate,
} from "../../lib/preGen.js";
import { loadStore, STORAGE_KEYS } from "../../lib/storage.js";

export function useSage() {
  async function generateWeekPlan(capacityState, tasks, peakFocusWindow) {
    try {
      const taskCount = Array.isArray(tasks) ? tasks.length : 0;
      const instruction =
        `Build Lexy's week plan (Mon-Fri).\n` +
        `Current capacity: ${capacityState || "unspecified"}.\n` +
        `Peak focus window: ${peakFocusWindow || "unspecified"}.\n` +
        `There are ${taskCount} tasks/items in the task list below. ` +
        `Distribute ALL of them across the five weekdays — every task must appear in at least one day's array. ` +
        `For each task include a realistic duration estimate (e.g. "30m", "1h", "2h"). ` +
        `Return ONLY a raw JSON object (no markdown fences, no preamble) matching this exact schema: ` +
        `{ "weekPlan": { "mon": [...], "tue": [...], "wed": [...], "thu": [...], "fri": [...] }, ` +
        `"taskDecompositions": { "<task name>": ["step1", "step2"] }, ` +
        `"capacityNotes": { "<day>": "<optional note>" }, ` +
        `"sageNote": "<1-2 sentence strategic observation>" }.`;

      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          agentName: "sage",
          instruction,
          externalContent: wrapExternalContent(
            { tasks: tasks || [] },
            "task data"
          ),
        }),
      });

      if (!res.ok) return null;
      const payload = await res.json();
      if (!payload || !payload.ok || payload.anomalous) return null;
      return payload.data || null;
    } catch (err) {
      console.error("[work-hub] generateWeekPlan failed:", err?.message ?? err);
      return null;
    }
  }

  // Cache logic now lives in lib/preGen.js (4-day Friday-batch/Monday-serve).
  function getFromCache() {
    const cached = getPreGenCache();
    return cached ? cached.weekPlan || null : null;
  }

  function saveToCache(weekPlan) {
    const capacity = loadStore(STORAGE_KEYS.capacityState);
    return savePreGenCache(weekPlan, capacity);
  }

  return { generateWeekPlan, getFromCache, saveToCache, shouldPreGenerate };
}

export default useSage;
