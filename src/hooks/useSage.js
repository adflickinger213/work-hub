// useSage.js — hook for Sage, the strategic weekly-planning agent.
//
// generateWeekPlan(capacityState, tasks, peakFocusWindow)
//   Calls POST /api/agent with agentName "sage", fencing task data with
//   wrapExternalContent. Returns parsed Sage JSON, or null on any error.
// getFromCache()  — reads the pre-gen cache; null if missing or older than 7 days.
// saveToCache(weekPlan) — writes the plan to the cache with a timestamp.

import { saveStore, loadStore, STORAGE_KEYS } from "../../lib/storage.js";
import { wrapExternalContent } from "../../lib/safeWrap.js";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

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

  function getFromCache() {
    const cached = loadStore(STORAGE_KEYS.preGenCache);
    if (!cached || typeof cached !== "object") return null;
    const ts = Number(cached.timestamp);
    if (!Number.isFinite(ts)) return null;
    if (Date.now() - ts > SEVEN_DAYS_MS) return null; // expired
    return cached.weekPlan || null;
  }

  function saveToCache(weekPlan) {
    return saveStore(STORAGE_KEYS.preGenCache, {
      weekPlan,
      timestamp: Date.now(),
      generatedBy: "sage",
    });
  }

  return { generateWeekPlan, getFromCache, saveToCache };
}

export default useSage;
