// AgentStatus.jsx — a settings panel showing the six agents, their last run,
// a one-line result summary, and a status dot. "Run weekly cycle" runs them
// sequentially (Sage → Poppy → Hazel → Fern → Ivy → Rosie summary), updating
// each row as it goes. Anomalous output raises an amber flag; errors offer a
// retry.

import React, { useState, useCallback } from "react";
import { runWeeklyCycle } from "../../lib/agentOrchestrator.js";
import { wrapExternalContent } from "../../lib/safeWrap.js";
import { saveStore, loadStore, STORAGE_KEYS } from "../../lib/storage.js";

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Jost', system-ui, sans-serif";

const ORDER = ["sage", "poppy", "hazel", "fern", "ivy", "rosie"];
const LABELS = { sage: "Sage", poppy: "Poppy", hazel: "Hazel", fern: "Fern", ivy: "Ivy", rosie: "Rosie" };

const DOT = {
  idle: "#cdbfae",
  running: "#d9b36a",
  ok: "#9eb89a",
  error: "#cf7f86",
  anomalous: "#d9853d",
};

function loadInitial() {
  const s = loadStore(STORAGE_KEYS.settings) || {};
  const saved = s.agentStatus || {};
  const out = {};
  for (const key of ORDER) {
    out[key] = saved[key] || { status: "idle", lastRun: null, summary: "" };
  }
  return out;
}

function persist(statuses) {
  const s = loadStore(STORAGE_KEYS.settings) || {};
  saveStore(STORAGE_KEYS.settings, { ...s, agentStatus: statuses });
}

// Generic single-agent call for the non-Sage agents in the cycle.
async function callAgent(agentName, instruction, externalContent) {
  const res = await fetch("/api/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ agentName, instruction, externalContent }),
  });
  if (res.status === 200) {
    const payload = await res.json();
    if (payload.anomalous) return { state: "anomalous", summary: "Output flagged as anomalous." };
    if (payload.ok) {
      const data = payload.data || {};
      const summary = data.sageNote || data.hazelNote || data.summary || data.text || "Completed.";
      return { state: "ok", summary: String(summary).slice(0, 120) };
    }
    return { state: "error", summary: payload.error || "Failed." };
  }
  return { state: "error", summary: `HTTP ${res.status}` };
}

export default function AgentStatus() {
  const [statuses, setStatuses] = useState(loadInitial);
  const [running, setRunning] = useState(false);

  const update = useCallback((key, patch) => {
    setStatuses((prev) => {
      const next = { ...prev, [key]: { ...prev[key], ...patch } };
      persist(next);
      return next;
    });
  }, []);

  const runOne = useCallback(async (key) => {
    update(key, { status: "running" });
    const tasks = loadStore(STORAGE_KEYS.tasks) || [];
    const capacity = loadStore(STORAGE_KEYS.capacityState);
    const stamp = new Date().toISOString();
    try {
      if (key === "sage") {
        const r = await runWeeklyCycle(tasks, capacity, null);
        update(key, r.ok
          ? { status: "ok", lastRun: stamp, summary: (r.sageNote || "Week planned.").slice(0, 120) }
          : { status: "error", lastRun: stamp, summary: r.error || "Failed." });
        return;
      }
      const ctx = wrapExternalContent({ tasks, capacity }, "context");
      const instructions = {
        poppy: "Check communication cadence and summarize who's overdue. Return JSON { summary }.",
        hazel: "Scan for overload and aging items. Return JSON { hazelNote }.",
        fern: "Summarize loose notes into one line. Return JSON { summary }.",
        ivy: "Note one synthesis observation. Return JSON { summary }.",
        rosie: "Give a one-line warm summary of the week's plan. Return JSON { summary }.",
      };
      const r = await callAgent(key, instructions[key], ctx);
      update(key, { status: r.state, lastRun: stamp, summary: r.summary });
    } catch (err) {
      update(key, { status: "error", lastRun: stamp, summary: err?.message || "Failed." });
    }
  }, [update]);

  const runCycle = useCallback(async () => {
    setRunning(true);
    for (const key of ORDER) {
      // Sequential — each agent finishes before the next begins.
      // eslint-disable-next-line no-await-in-loop
      await runOne(key);
    }
    setRunning(false);
  }, [runOne]);

  return (
    <div style={{ padding: "8px 4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontFamily: serif, fontSize: 22, fontStyle: "italic", color: "#5a4049" }}>The council</div>
        <button type="button" onClick={runCycle} disabled={running} style={{ fontFamily: sans, fontSize: 13, padding: "8px 16px", borderRadius: 999, border: "none", background: running ? "#cdd9cb" : "#9eb89a", color: "#fff", cursor: running ? "default" : "pointer" }}>
          {running ? "Running cycle…" : "Run weekly cycle"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ORDER.map((key) => {
          const s = statuses[key];
          return (
            <div key={key} style={{ background: "#fffaf6", border: "1px solid rgba(212,130,154,0.12)", borderRadius: 12, padding: "10px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: DOT[s.status] || DOT.idle, flexShrink: 0 }} />
                <span style={{ fontFamily: sans, fontSize: 14, color: "#5a4049", flex: 1 }}>{LABELS[key]}</span>
                <span style={{ fontFamily: sans, fontSize: 11, color: "rgba(90,64,73,0.5)" }}>
                  {s.lastRun ? new Date(s.lastRun).toLocaleString() : "never run"}
                </span>
              </div>
              {s.summary && (
                <div style={{ fontFamily: sans, fontSize: 12.5, color: "rgba(90,64,73,0.75)", marginTop: 6, marginLeft: 20 }}>
                  {s.summary}
                </div>
              )}
              {s.status === "anomalous" && (
                <div style={{ fontFamily: sans, fontSize: 12, color: "#9a6326", background: "rgba(217,133,61,0.12)", borderRadius: 8, padding: "5px 9px", marginTop: 6, marginLeft: 20 }}>
                  Output flagged as anomalous and was not applied.
                </div>
              )}
              {s.status === "error" && (
                <button type="button" onClick={() => runOne(key)} style={{ fontFamily: sans, fontSize: 12, padding: "5px 12px", borderRadius: 999, border: "1px solid #e7d6cf", background: "#fbf4ec", color: "#7a5d63", cursor: "pointer", marginTop: 8, marginLeft: 20 }}>
                  Retry
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
