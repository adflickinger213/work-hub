// WeekPrepLauncher.jsx — a discreet, on-brand entry point into the weekly
// planner that lives OUTSIDE the concatenated artifact (rendered by main.jsx
// alongside App). A small bottom-left pill opens an overlay with WeeklyPlan,
// whose "Generate this week" button runs Sage's weekly batch as a one-off on
// any day (this is the same job that's meant to run Friday) and caches it so
// Monday serves from cache automatically.

import React, { useState, useEffect } from "react";
import WeeklyPlan from "./WeeklyPlan.jsx";

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Jost', system-ui, sans-serif";

export default function WeekPrepLauncher() {
  const [open, setOpen] = useState(false);

  // Escape closes the planner overlay, matching the click-outside behavior.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Plan your week"
        style={{
          position: "fixed",
          left: 16,
          bottom: 16,
          zIndex: 9000,
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: 16,
          color: "#5a4049",
          background: "rgba(255,250,246,0.95)",
          border: "1px solid rgba(212,130,154,0.25)",
          borderRadius: 999,
          padding: "8px 16px",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(150,110,95,0.15)",
        }}
      >
        🌱 This week
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="week-prep-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9500,
            background: "rgba(90,64,73,0.28)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "24px 12px",
            overflowY: "auto",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            style={{
              background: "linear-gradient(160deg, #fdf6f0 0%, #f7ede9 100%)",
              borderRadius: 22,
              padding: "18px 18px 26px",
              width: "100%",
              maxWidth: 880,
              boxShadow: "0 18px 50px rgba(120,80,90,0.22)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div id="week-prep-title" style={{ fontFamily: sans, fontSize: 12.5, fontStyle: "italic", color: "rgba(90,64,73,0.6)" }}>
                Run this any day — it does Friday's prep and serves Monday from the saved plan.
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                style={{ fontFamily: sans, fontSize: 20, border: "none", background: "transparent", color: "rgba(90,64,73,0.5)", cursor: "pointer", padding: "0 4px" }}
              >
                ×
              </button>
            </div>
            <WeeklyPlan />
          </div>
        </div>
      )}
    </>
  );
}
