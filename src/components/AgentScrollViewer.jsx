// AgentScrollViewer.jsx — a read-only look at each agent's scroll (its
// accumulated learnings), with a count against the 50-learning cap. Ivy's
// pending proposals are surfaced beneath via the reused IvyProposals component.

import React, { useState } from "react";
import IvyProposals from "./IvyProposals.jsx";
import { loadStore, STORAGE_KEYS } from "../../lib/storage.js";

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Jost', system-ui, sans-serif";
const CAP = 50;

function learningsOf(scroll) {
  if (!scroll) return [];
  if (Array.isArray(scroll.learnings)) return scroll.learnings;
  if (Array.isArray(scroll)) return scroll;
  return [];
}

function ScrollSection({ name, scroll }) {
  const [open, setOpen] = useState(false);
  const learnings = learningsOf(scroll);
  const count = learnings.length;
  const near = count >= CAP - 5;

  return (
    <div style={{ background: "#fffaf6", border: "1px solid rgba(212,130,154,0.12)", borderRadius: 12, overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ all: "unset", cursor: "pointer", display: "flex", width: "100%", boxSizing: "border-box", justifyContent: "space-between", alignItems: "center", padding: "10px 14px" }}
      >
        <span style={{ fontFamily: sans, fontSize: 14, color: "#5a4049", textTransform: "capitalize" }}>{name}</span>
        <span style={{ fontFamily: sans, fontSize: 12, color: near ? "#9a6326" : "rgba(90,64,73,0.55)" }}>
          {count}/{CAP} learnings {open ? "▾" : "▸"}
        </span>
      </button>
      {open && (
        <div style={{ padding: "0 14px 12px" }}>
          {count === 0 ? (
            <div style={{ fontFamily: sans, fontSize: 12.5, fontStyle: "italic", color: "rgba(90,64,73,0.5)" }}>
              Nothing recorded yet.
            </div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {learnings.map((l, i) => (
                <li key={i} style={{ fontFamily: sans, fontSize: 12.5, color: "rgba(90,64,73,0.8)", lineHeight: 1.5 }}>
                  {typeof l === "string" ? l : l.text || JSON.stringify(l)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function AgentScrollViewer() {
  const scrolls = loadStore(STORAGE_KEYS.agentScrolls) || {};
  const names = Object.keys(scrolls);

  return (
    <div style={{ padding: "8px 4px" }}>
      <div style={{ fontFamily: serif, fontSize: 22, fontStyle: "italic", color: "#5a4049", marginBottom: 12 }}>
        Scrolls
      </div>

      {names.length === 0 ? (
        <div style={{ fontFamily: sans, fontSize: 13.5, fontStyle: "italic", color: "rgba(90,64,73,0.6)", background: "#fbf4ec", borderRadius: 14, padding: "20px 18px", textAlign: "center", marginBottom: 18 }}>
          No scrolls yet — they fill in as the agents learn.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {names.map((name) => (
            <ScrollSection key={name} name={name} scroll={scrolls[name]} />
          ))}
        </div>
      )}

      <IvyProposals />
    </div>
  );
}
