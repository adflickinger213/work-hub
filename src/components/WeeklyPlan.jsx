// WeeklyPlan.jsx — the "This Week" view. Renders Sage's weekly plan as a
// five-column Mon-Fri grid, each task card expandable to show its decomposition.
//
// Sage JSON shape:
//   { weekPlan: { mon, tue, wed, thu, fri }, taskDecompositions,
//     capacityNotes, sageNote }
// Each day is an array of tasks ({ name, duration } or a string).
// taskDecompositions maps a task name -> array of step strings.
// capacityNotes maps a day key -> a soft note string.

import React, { useState, useEffect, useCallback } from "react";
import { useSage } from "../hooks/useSage.js";
import { loadStore, STORAGE_KEYS } from "../../lib/storage.js";

const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
];

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Jost', system-ui, sans-serif";
const SAGE = "#7a9e78";

function normalizeTask(t) {
  if (typeof t === "string") return { name: t, duration: "" };
  return { name: t?.name || t?.title || "Untitled", duration: t?.duration || t?.estimate || "" };
}

function TaskCard({ task, steps }) {
  const [open, setOpen] = useState(false);
  const hasSteps = Array.isArray(steps) && steps.length > 0;
  return (
    <div
      style={{
        background: "#fffaf6",
        border: "1px solid rgba(212,130,154,0.15)",
        borderRadius: 14,
        padding: "10px 12px",
        boxShadow: "0 2px 10px rgba(150,110,95,0.06)",
      }}
    >
      <button
        type="button"
        onClick={() => hasSteps && setOpen((o) => !o)}
        style={{
          all: "unset",
          cursor: hasSteps ? "pointer" : "default",
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 8,
        }}
      >
        <span style={{ fontFamily: sans, fontSize: 14, color: "#5a4049" }}>{task.name}</span>
        <span style={{ fontFamily: sans, fontSize: 11, color: "rgba(90,64,73,0.55)", whiteSpace: "nowrap" }}>
          {task.duration}
          {hasSteps ? (open ? " ▾" : " ▸") : ""}
        </span>
      </button>
      {open && hasSteps && (
        <ul style={{ margin: "8px 0 2px", paddingLeft: 18 }}>
          {steps.map((s, i) => (
            <li key={i} style={{ fontFamily: sans, fontSize: 12.5, color: "rgba(90,64,73,0.8)", lineHeight: 1.5 }}>
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SkeletonColumn() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            height: 52,
            borderRadius: 14,
            background: "linear-gradient(90deg,#f3e7df,#faf2ec,#f3e7df)",
            animation: "whpulse 1.4s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  );
}

function isMonday() {
  return new Date().getDay() === 1;
}

export default function WeeklyPlan({ weekPlan: weekPlanProp }) {
  const sage = useSage();
  const [plan, setPlan] = useState(weekPlanProp || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // On Monday, try the pre-gen cache before anything else.
  useEffect(() => {
    if (weekPlanProp) return;
    if (isMonday()) {
      const cached = sage.getFromCache();
      if (cached) setPlan(cached);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = useCallback(async () => {
    setLoading(true);
    setError("");
    const capacity = loadStore(STORAGE_KEYS.capacityState);
    const tasks = loadStore(STORAGE_KEYS.tasks) || [];
    const result = await sage.generateWeekPlan(capacity, tasks, null);
    if (result) {
      setPlan(result);
      sage.saveToCache(result);
    } else {
      setError("Sage couldn't shape the week just now — try again in a moment.");
    }
    setLoading(false);
  }, [sage]);

  const days = plan?.weekPlan || {};
  const decomp = plan?.taskDecompositions || {};
  const capacityNotes = plan?.capacityNotes || {};

  return (
    <div style={{ padding: "8px 4px" }}>
      <style>{`@keyframes whpulse{0%,100%{opacity:0.55}50%{opacity:0.9}}`}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontFamily: serif, fontSize: 28, fontStyle: "italic", color: "#5a4049" }}>This Week</div>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          style={{
            fontFamily: sans,
            fontSize: 14,
            padding: "9px 18px",
            borderRadius: 999,
            border: "none",
            background: loading ? "#cdd9cb" : "#9eb89a",
            color: "#fff",
            cursor: loading ? "default" : "pointer",
          }}
        >
          {loading ? "Sage is planning…" : "Generate this week"}
        </button>
      </div>

      {plan?.sageNote && (
        <div style={{ fontFamily: sans, fontSize: 13, fontStyle: "italic", color: SAGE, marginBottom: 14 }}>
          {plan.sageNote}
        </div>
      )}

      {error && (
        <div style={{ fontFamily: sans, fontSize: 13, color: "#b8607c", marginBottom: 12 }}>{error}</div>
      )}

      {!plan && !loading && (
        <div
          style={{
            fontFamily: sans,
            fontSize: 14,
            fontStyle: "italic",
            color: "rgba(90,64,73,0.6)",
            background: "#fbf4ec",
            borderRadius: 16,
            padding: "28px 22px",
            textAlign: "center",
          }}
        >
          Sage hasn't planned this week yet — tap Generate when you're ready.
        </div>
      )}

      {(plan || loading) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(140px, 1fr))",
            gap: 12,
            overflowX: "auto",
          }}
        >
          {DAYS.map((d) => {
            const list = Array.isArray(days[d.key]) ? days[d.key].map(normalizeTask) : [];
            return (
              <div key={d.key} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontFamily: serif, fontSize: 18, color: "#6a4e54", borderBottom: "1px solid #e7d6cf", paddingBottom: 4 }}>
                  {d.label}
                </div>
                {capacityNotes[d.key] && (
                  <div style={{ fontFamily: sans, fontSize: 11.5, fontStyle: "italic", color: SAGE, background: "rgba(158,184,154,0.12)", borderRadius: 10, padding: "6px 9px" }}>
                    {capacityNotes[d.key]}
                  </div>
                )}
                {loading ? (
                  <SkeletonColumn />
                ) : list.length ? (
                  list.map((t, i) => <TaskCard key={i} task={t} steps={decomp[t.name]} />)
                ) : (
                  <div style={{ fontFamily: sans, fontSize: 12, color: "rgba(90,64,73,0.4)", fontStyle: "italic", padding: "6px 2px" }}>
                    Open space.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
