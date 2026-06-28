// HazelAlert.jsx — a dismissible banner that surfaces Hazel's escalations and
// aging items. Amber for minor adjustments, soft red when there are real
// escalations. Aging items get their own quiet section. The API call only runs
// on explicit request (or when the parent passes in trigger-detected
// escalations); on load we only do the cheap client-side aging scan.

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useHazel } from "../hooks/useHazel.js";
import { loadStore, STORAGE_KEYS } from "../../lib/storage.js";

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Jost', system-ui, sans-serif";

function EscalationRow({ esc }) {
  const [open, setOpen] = useState(false);
  const detail = esc.detail || esc.summary;
  const hasDetail = detail && detail !== esc.summary;
  return (
    <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)", padding: "8px 0" }}>
      <button
        type="button"
        onClick={() => hasDetail && setOpen((o) => !o)}
        style={{ all: "unset", cursor: hasDetail ? "pointer" : "default", display: "flex", width: "100%", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}
      >
        <span style={{ fontFamily: sans, fontSize: 13.5, color: "#5a4049" }}>{esc.summary}</span>
        {hasDetail && <span style={{ fontFamily: sans, fontSize: 12, color: "rgba(90,64,73,0.5)" }}>{open ? "▾" : "▸"}</span>}
      </button>
      {open && hasDetail && (
        <div style={{ fontFamily: sans, fontSize: 12.5, color: "rgba(90,64,73,0.75)", marginTop: 6, lineHeight: 1.5 }}>{detail}</div>
      )}
    </div>
  );
}

export default function HazelAlert({ tasks, weekPlan, capacityState }) {
  const hazel = useHazel();
  const taskList = useMemo(() => tasks || loadStore(STORAGE_KEYS.tasks) || [], [tasks]);

  const [dismissed, setDismissed] = useState(false);
  const [aging, setAging] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [hazelNote, setHazelNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // On load: cheap client-side scans only. No API call.
  useEffect(() => {
    setAging(hazel.detectAgingItems(taskList));
    const { escalations: trig } = hazel.checkEscalationTriggers(taskList, weekPlan);
    setEscalations(trig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskList, weekPlan]);

  const runReview = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await hazel.runReview(taskList, weekPlan, capacityState);
    if (result) {
      if (Array.isArray(result.escalations)) setEscalations(result.escalations);
      if (Array.isArray(result.agingItems) && result.agingItems.length) setAging(result.agingItems);
      setHazelNote(result.hazelNote || "");
      setDismissed(false);
    } else {
      setError("Hazel couldn't run the review just now — try again in a moment.");
    }
    setLoading(false);
  }, [hazel, taskList, weekPlan, capacityState]);

  const hasEscalations = escalations.length > 0;
  const nothingToShow = !hasEscalations && aging.length === 0 && !hazelNote && !error;

  if (dismissed) return null;

  // Soft red when escalations exist; amber otherwise.
  const tone = hasEscalations
    ? { bg: "rgba(207,127,134,0.12)", border: "rgba(207,127,134,0.35)" }
    : { bg: "rgba(217,179,106,0.12)", border: "rgba(217,179,106,0.35)" };

  return (
    <div style={{ background: tone.bg, border: `1px solid ${tone.border}`, borderRadius: 16, padding: "14px 16px", marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div style={{ fontFamily: serif, fontSize: 20, fontStyle: "italic", color: "#5a4049" }}>
          {hasEscalations ? "Hazel has something for you" : "A few things to watch"}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={runReview} disabled={loading} style={{ fontFamily: sans, fontSize: 12.5, padding: "6px 12px", borderRadius: 999, border: "1px solid #e7d6cf", background: "#fffaf6", color: "#7a5d63", cursor: loading ? "default" : "pointer" }}>
            {loading ? "Reviewing…" : "Run Hazel review"}
          </button>
          <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss" style={{ fontFamily: sans, fontSize: 16, padding: "2px 8px", borderRadius: 999, border: "none", background: "transparent", color: "rgba(90,64,73,0.5)", cursor: "pointer" }}>×</button>
        </div>
      </div>

      {error && <div style={{ fontFamily: sans, fontSize: 12.5, color: "#b8607c", marginTop: 8 }}>{error}</div>}

      {nothingToShow && !loading && (
        <div style={{ fontFamily: sans, fontSize: 13, fontStyle: "italic", color: "rgba(90,64,73,0.65)", marginTop: 6 }}>
          Nothing pressing right now. Hazel will speak up when something needs you.
        </div>
      )}

      {hasEscalations && (
        <div style={{ marginTop: 8 }}>
          {escalations.map((e, i) => <EscalationRow key={i} esc={typeof e === "string" ? { summary: e } : e} />)}
        </div>
      )}

      {aging.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: sans, fontSize: 12.5, fontWeight: 500, color: "#6a4e54", marginBottom: 4 }}>
            These haven't moved in 5+ days
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {aging.map((t, i) => (
              <div key={t.id || i} style={{ fontFamily: sans, fontSize: 12.5, color: "rgba(90,64,73,0.8)" }}>
                · {t.title || t.name || (typeof t === "string" ? t : "Untitled")}
              </div>
            ))}
          </div>
        </div>
      )}

      {hazelNote && (
        <div style={{ fontFamily: sans, fontSize: 12.5, fontStyle: "italic", color: "rgba(90,64,73,0.7)", marginTop: 12, lineHeight: 1.5 }}>
          {hazelNote}
        </div>
      )}
    </div>
  );
}
