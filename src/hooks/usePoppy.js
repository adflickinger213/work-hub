// usePoppy.js — hook for Poppy, the communications-cadence companion.
//
// logCommunication(person, type, note) — append an entry to the comm log.
// getSilenceStatus(person) — green / amber / red against per-person thresholds:
//     external vendors : 5 days of silence
//     Josh             : 3 open items OR 5 days
//     Rob, Aaron       : 2 open items
// requestDrafts(communicationLog, taskContext) — asks Poppy for nudge drafts.

import { saveStore, loadStore, STORAGE_KEYS } from "../../lib/storage.js";
import { wrapExternalContent } from "../../lib/safeWrap.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// Per-person rules. `days` = silence threshold; `items` = open-item threshold.
// null means that dimension doesn't apply to this contact.
const THRESHOLDS = {
  josh: { days: 5, items: 3 },
  rob: { days: null, items: 2 },
  aaron: { days: null, items: 2 },
  __default: { days: 5, items: null }, // external vendors
};

function rulesFor(person) {
  const key = String(person || "").trim().toLowerCase();
  return THRESHOLDS[key] || THRESHOLDS.__default;
}

function entriesFor(log, person) {
  const key = String(person || "").trim().toLowerCase();
  return (Array.isArray(log) ? log : []).filter(
    (e) => String(e.person || "").trim().toLowerCase() === key
  );
}

export function usePoppy() {
  function readLog() {
    return loadStore(STORAGE_KEYS.communicationLog) || [];
  }

  function logCommunication(person, type, note) {
    const log = readLog();
    const list = Array.isArray(log) ? log : [];
    list.push({
      person,
      type: type || "touchpoint",
      note: note || "",
      at: new Date().toISOString(),
    });
    return saveStore(STORAGE_KEYS.communicationLog, list);
  }

  function getSilenceStatus(person) {
    const log = readLog();
    const entries = entriesFor(log, person);
    const rules = rulesFor(person);

    // Days since the last touchpoint (anything counts as contact).
    let daysSilent = Infinity;
    const lastTouch = entries
      .map((e) => new Date(e.at).getTime())
      .filter((t) => Number.isFinite(t))
      .sort((a, b) => b - a)[0];
    if (lastTouch) daysSilent = Math.floor((Date.now() - lastTouch) / DAY_MS);

    // Open items: entries flagged as owed/pending and not yet resolved.
    const openItems = entries.filter(
      (e) => e.type === "item" || e.type === "owed" || e.type === "pending"
    ).length;

    let level = "green";
    if (rules.days != null) {
      if (daysSilent >= rules.days) level = "red";
      else if (daysSilent >= rules.days - 2) level = "amber";
    }
    if (rules.items != null) {
      if (openItems >= rules.items) level = "red";
      else if (openItems >= rules.items - 1 && level !== "red") level = "amber";
    }
    return level;
  }

  async function requestDrafts(communicationLog, taskContext) {
    try {
      const log = communicationLog || readLog();
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          agentName: "poppy",
          instruction:
            "Review the communication log and draft short, warm nudge messages " +
            "for anyone who's gone quiet past their threshold. Return JSON: " +
            "{ drafts: [{ person, subject, body, urgency }], communicationFlags: [] }.",
          externalContent: wrapExternalContent(
            { communicationLog: log, taskContext: taskContext || null },
            "communication log"
          ),
        }),
      });
      if (!res.ok) return null;
      const payload = await res.json();
      if (!payload || !payload.ok || payload.anomalous) return null;
      return payload.data || null;
    } catch (err) {
      console.error("[work-hub] requestDrafts failed:", err?.message ?? err);
      return null;
    }
  }

  return { logCommunication, getSilenceStatus, requestDrafts };
}

export default usePoppy;
