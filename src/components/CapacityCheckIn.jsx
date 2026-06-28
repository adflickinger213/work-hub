// CapacityCheckIn.jsx — a soft, four-state "how's your capacity today" selector.
//
// States map to the values the agents reason about:
//   "Low tap"     -> low_tap
//   "Heavy"       -> heavy
//   "Running hot" -> running_hot
//   "Clear"       -> clear
//
// Saves the chosen value to STORAGE_KEYS.capacityState and calls
// onCapacityChange(value). Renders cottagecore: warm cream, dusty-rose selected
// state, Cormorant Garamond label (per CLAUDE.md — the house serif). No API
// call here; the Rosie note beneath is static and gentle.

import React, { useState } from "react";
import { saveStore, loadStore, STORAGE_KEYS } from "../../lib/storage.js";

const OPTIONS = [
  { value: "low_tap", label: "Low tap" },
  { value: "heavy", label: "Heavy" },
  { value: "running_hot", label: "Running hot" },
  { value: "clear", label: "Clear" },
];

// A quiet, Rosie-voiced line per state. Acknowledge first, no hustle.
const ROSIE_NOTES = {
  low_tap: "Low tap is okay. We'll keep today small and kind.",
  heavy: "Heavy days are real. Let's protect your edges and pick one true thing.",
  running_hot: "Running hot — let's slow the pace before it slows you.",
  clear: "Clear is a gift. Let's use it gently, not greedily.",
  none: "No pressure. Name where you are when you're ready.",
};

export default function CapacityCheckIn({ value, onCapacityChange }) {
  const [selected, setSelected] = useState(
    () => value || loadStore(STORAGE_KEYS.capacityState) || null
  );

  function choose(next) {
    setSelected(next);
    saveStore(STORAGE_KEYS.capacityState, next);
    if (typeof onCapacityChange === "function") onCapacityChange(next);
  }

  const wrap = {
    background: "#fbf4ec",
    borderRadius: 20,
    padding: "18px 20px",
    boxShadow: "0 6px 22px rgba(150, 110, 95, 0.08)",
  };
  const label = {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 22,
    fontStyle: "italic",
    color: "#6a4e54",
    marginBottom: 12,
  };
  const row = { display: "flex", flexWrap: "wrap", gap: 8 };

  function pill(active) {
    return {
      flex: "1 1 auto",
      minWidth: 92,
      padding: "10px 14px",
      borderRadius: 999,
      border: active ? "1px solid #c98ba0" : "1px solid #e7d6cf",
      background: active ? "#d99bae" : "#fffaf6",
      color: active ? "#fff" : "#7a5d63",
      fontFamily: "'Jost', system-ui, sans-serif",
      fontSize: 14,
      cursor: "pointer",
      transition: "all 0.2s ease",
    };
  }

  return (
    <div style={wrap}>
      <div style={label}>How's your capacity today?</div>
      <div style={row}>
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => choose(o.value)}
            style={pill(selected === o.value)}
            aria-pressed={selected === o.value}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div
        style={{
          marginTop: 12,
          fontFamily: "'Jost', system-ui, sans-serif",
          fontSize: 13,
          fontStyle: "italic",
          color: "rgba(106, 78, 84, 0.7)",
          lineHeight: 1.5,
        }}
      >
        {ROSIE_NOTES[selected] || ROSIE_NOTES.none}
      </div>
    </div>
  );
}
