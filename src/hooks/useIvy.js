// useIvy.js — hook for Ivy, the weekly synthesis / scroll-keeper agent. Ivy
// reads the other agents' scrolls and the week's history and proposes small
// updates to those scrolls. Proposals are never auto-applied — Lexy approves
// or skips each one.

import { saveStore, loadStore, STORAGE_KEYS } from "../../lib/storage.js";
import { wrapExternalContent } from "../../lib/safeWrap.js";

const LEARNING_CAP = 50;

function loadProposals() {
  const p = loadStore(STORAGE_KEYS.ivyProposals);
  return Array.isArray(p) ? p : [];
}

function loadScrolls() {
  const s = loadStore(STORAGE_KEYS.agentScrolls);
  return s && typeof s === "object" ? s : {};
}

export function useIvy() {
  async function runWeeklySynthesis(agentScrolls, weekHistory) {
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          agentName: "ivy",
          instruction:
            "Synthesize the week. Review the agent scrolls and week history and " +
            "propose small scroll updates. Return JSON: { proposals: [{ id, " +
            "scroll, change, why, learning }], conflicts: [{ summary, " +
            "resolution }], pruneWarnings: [] }.",
          externalContent: wrapExternalContent(
            { agentScrolls: agentScrolls || loadScrolls(), weekHistory: weekHistory || [] },
            "scrolls + history"
          ),
        }),
      });
      if (!res.ok) return null;
      const payload = await res.json();
      if (!payload || !payload.ok || payload.anomalous) return null;
      const data = payload.data || {};

      // Persist any returned proposals so they survive a reload.
      if (Array.isArray(data.proposals)) {
        const existing = loadProposals();
        const merged = [...existing];
        for (const p of data.proposals) {
          if (p && p.id && !merged.some((e) => e.id === p.id)) merged.push(p);
        }
        saveStore(STORAGE_KEYS.ivyProposals, merged);
      }
      return data;
    } catch (err) {
      console.error("[work-hub] runWeeklySynthesis failed:", err?.message ?? err);
      return null;
    }
  }

  function getPendingProposals() {
    return loadProposals();
  }

  function approveProposal(proposalId) {
    const proposals = loadProposals();
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal) return false;

    // Apply the scroll update: append the learning to the named scroll.
    const scrolls = loadScrolls();
    const scrollKey = proposal.scroll || "general";
    const scroll = scrolls[scrollKey] && typeof scrolls[scrollKey] === "object"
      ? scrolls[scrollKey]
      : { learnings: [] };
    const learnings = Array.isArray(scroll.learnings) ? scroll.learnings : [];
    const entry = proposal.learning || proposal.change || "";
    if (entry) learnings.push({ text: entry, addedAt: new Date().toISOString() });
    scrolls[scrollKey] = { ...scroll, learnings: learnings.slice(-LEARNING_CAP) };
    saveStore(STORAGE_KEYS.agentScrolls, scrolls);

    // Remove from pending.
    saveStore(STORAGE_KEYS.ivyProposals, proposals.filter((p) => p.id !== proposalId));
    return true;
  }

  function rejectProposal(proposalId) {
    const proposals = loadProposals();
    saveStore(STORAGE_KEYS.ivyProposals, proposals.filter((p) => p.id !== proposalId));
    return true;
  }

  return { runWeeklySynthesis, getPendingProposals, approveProposal, rejectProposal, LEARNING_CAP };
}

export default useIvy;
