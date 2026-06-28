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
      const instruction =
        `Build Lexy's week plan (Mon-Fri).\n` +
        `Current capacity: ${capacityState || "unspecified"}.\n` +
        `Peak focus window: ${peakFocusWindow || "unspecified"}.\n` +
        `Return JSON: { weekPlan: { mon, tue, wed, thu, fri }, ` +
        `taskDecompositions, capacityNotes, sageNote }.`;

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
