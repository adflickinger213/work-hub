// IvyProposals.jsx — the (quiet, tucked-into-settings) review surface for Ivy's
// weekly synthesis. Shows pending scroll proposals as a review stack, plus any
// conflicts Ivy flagged and prune warnings when a scroll nears its 50-learning
// cap.

import React, { useState, useCallback } from "react";
import { useIvy } from "../hooks/useIvy.js";
import { loadStore, STORAGE_KEYS } from "../../lib/storage.js";

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Jost', system-ui, sans-serif";

export default function IvyProposals() {
  const ivy = useIvy();
  const [proposals, setProposals] = useState(() => ivy.getPendingProposals());
  const [conflicts, setConflicts] = useState([]);
  const [pruneWarnings, setPruneWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(() => setProposals(ivy.getPendingProposals()), [ivy]);

  const run = useCallback(async () => {
    setLoading(true);
    setError("");
    const scrolls = loadStore(STORAGE_KEYS.agentScrolls) || {};
    const result = await ivy.runWeeklySynthesis(scrolls, []);
    if (result) {
      refresh();
      setConflicts(Array.isArray(result.conflicts) ? result.conflicts : []);
      setPruneWarnings(Array.isArray(result.pruneWarnings) ? result.pruneWarnings : []);
    } else {
      setError("Ivy is quiet right now — try again in a moment.");
    }
    setLoading(false);
  }, [ivy, refresh]);

  function approve(id) {
    ivy.approveProposal(id);
    refresh();
  }
  function skip(id) {
    ivy.rejectProposal(id);
    refresh();
  }

  return (
    <div style={{ padding: "8px 4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontFamily: serif, fontSize: 22, fontStyle: "italic", color: "#5a4049" }}>Ivy's proposals</div>
        <button type="button" onClick={run} disabled={loading} style={{ fontFamily: sans, fontSize: 13, padding: "8px 16px", borderRadius: 999, border: "1px solid #e7d6cf", background: loading ? "#efe6df" : "#fbf4ec", color: "#7a5d63", cursor: loading ? "default" : "pointer" }}>
          {loading ? "Ivy is synthesizing…" : "Run Ivy synthesis"}
        </button>
      </div>

      {error && <div style={{ fontFamily: sans, fontSize: 12.5, color: "#b8607c", marginBottom: 10 }}>{error}</div>}

      {pruneWarnings.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {pruneWarnings.map((w, i) => (
            <div key={i} style={{ fontFamily: sans, fontSize: 12.5, color: "#9a7b3d", background: "rgba(217,179,106,0.12)", borderRadius: 10, padding: "8px 12px", marginBottom: 6 }}>
              {typeof w === "string" ? w : w.note || "A scroll is nearing its 50-learning cap."}
            </div>
          ))}
        </div>
      )}

      {proposals.length === 0 ? (
        <div style={{ fontFamily: sans, fontSize: 13.5, fontStyle: "italic", color: "rgba(90,64,73,0.6)", background: "#fbf4ec", borderRadius: 14, padding: "22px 18px", textAlign: "center" }}>
          No proposals this week — Ivy is watching.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {proposals.map((p) => (
            <div key={p.id} style={{ background: "#fffaf6", border: "1px solid rgba(180,150,200,0.25)", borderRadius: 14, padding: 14 }}>
              <div style={{ fontFamily: sans, fontSize: 11.5, color: "#8a6fa0", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                {p.scroll || "general"} scroll
              </div>
              <div style={{ fontFamily: sans, fontSize: 14, color: "#5a4049", marginBottom: 4 }}>{p.change || p.learning}</div>
              {p.why && <div style={{ fontFamily: sans, fontSize: 12.5, fontStyle: "italic", color: "rgba(90,64,73,0.7)", marginBottom: 10 }}>{p.why}</div>}
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => approve(p.id)} style={{ fontFamily: sans, fontSize: 12.5, padding: "6px 14px", borderRadius: 999, border: "none", background: "#a98fc0", color: "#fff", cursor: "pointer" }}>Approve</button>
                <button type="button" onClick={() => skip(p.id)} style={{ fontFamily: sans, fontSize: 12.5, padding: "6px 14px", borderRadius: 999, border: "1px solid #e7d6cf", background: "#fffaf6", color: "#7a5d63", cursor: "pointer" }}>Skip</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {conflicts.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontFamily: serif, fontSize: 18, fontStyle: "italic", color: "#6a4e54", marginBottom: 8 }}>Conflicts</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {conflicts.map((c, i) => (
              <div key={i} style={{ background: "rgba(207,127,134,0.08)", border: "1px solid rgba(207,127,134,0.25)", borderRadius: 12, padding: "10px 12px" }}>
                <div style={{ fontFamily: sans, fontSize: 13, color: "#5a4049" }}>{c.summary || (typeof c === "string" ? c : "")}</div>
                {c.resolution && <div style={{ fontFamily: sans, fontSize: 12.5, fontStyle: "italic", color: "rgba(90,64,73,0.7)", marginTop: 4 }}>Suggested: {c.resolution}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
