// PoppyHub.jsx — communications hub. Shows tracked contacts with their silence
// status, and lets Lexy request Poppy-drafted nudges. Poppy never sends
// anything; every draft is copy-only.

import React, { useState, useMemo, useCallback } from "react";
import { usePoppy } from "../hooks/usePoppy.js";
import { loadStore, STORAGE_KEYS } from "../../lib/storage.js";

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Jost', system-ui, sans-serif";

const STATUS_COLOR = {
  green: { dot: "#9eb89a", label: "in rhythm" },
  amber: { dot: "#d9b36a", label: "getting quiet" },
  red: { dot: "#cf7f86", label: "overdue" },
};

const URGENCY_COLOR = {
  high: "#cf7f86",
  medium: "#d9b36a",
  low: "#9eb89a",
};

function lastTouchLabel(log, person) {
  const entries = (Array.isArray(log) ? log : []).filter(
    (e) => String(e.person || "").toLowerCase() === String(person).toLowerCase()
  );
  const last = entries
    .map((e) => new Date(e.at).getTime())
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => b - a)[0];
  if (!last) return "no contact logged";
  const days = Math.floor((Date.now() - last) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

function DraftCard({ draft }) {
  const [copied, setCopied] = useState(false);
  const body = draft.body || "";
  const truncated = body.length > 180 ? body.slice(0, 180) + "…" : body;

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${draft.subject || ""}\n\n${body}`.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  const u = (draft.urgency || "low").toLowerCase();
  return (
    <div style={{ background: "#fffaf6", border: "1px solid rgba(212,130,154,0.15)", borderRadius: 14, padding: 14, boxShadow: "0 2px 10px rgba(150,110,95,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontFamily: serif, fontSize: 18, color: "#5a4049" }}>{draft.person || "Someone"}</span>
        <span style={{ fontFamily: sans, fontSize: 10.5, color: "#fff", background: URGENCY_COLOR[u] || URGENCY_COLOR.low, borderRadius: 999, padding: "2px 9px", textTransform: "lowercase" }}>{u}</span>
      </div>
      {draft.subject && (
        <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 500, color: "#6a4e54", marginBottom: 4 }}>{draft.subject}</div>
      )}
      <div style={{ fontFamily: sans, fontSize: 13, color: "rgba(90,64,73,0.78)", lineHeight: 1.5, marginBottom: 10 }}>{truncated}</div>
      <button type="button" onClick={copy} style={{ fontFamily: sans, fontSize: 12.5, padding: "6px 14px", borderRadius: 999, border: "1px solid #e7d6cf", background: copied ? "#9eb89a" : "#fbf4ec", color: copied ? "#fff" : "#7a5d63", cursor: "pointer" }}>
        {copied ? "Copied" : "Copy draft"}
      </button>
    </div>
  );
}

export default function PoppyHub() {
  const poppy = usePoppy();
  const log = useMemo(() => loadStore(STORAGE_KEYS.communicationLog) || [], []);
  const [drafts, setDrafts] = useState(null);
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Unique contacts from the log.
  const contacts = useMemo(() => {
    const seen = new Map();
    for (const e of log) {
      const name = e.person;
      if (name && !seen.has(name)) seen.set(name, name);
    }
    return [...seen.values()];
  }, [log]);

  const request = useCallback(async () => {
    setLoading(true);
    setError("");
    const taskContext = loadStore(STORAGE_KEYS.tasks) || [];
    const result = await poppy.requestDrafts(log, taskContext);
    if (result) {
      setDrafts(Array.isArray(result.drafts) ? result.drafts : []);
      setFlags(Array.isArray(result.communicationFlags) ? result.communicationFlags : []);
    } else {
      setError("Poppy is quiet right now — try again in a moment.");
    }
    setLoading(false);
  }, [poppy, log]);

  return (
    <div style={{ padding: "8px 4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontFamily: serif, fontSize: 28, fontStyle: "italic", color: "#5a4049" }}>Keeping in touch</div>
        <button type="button" onClick={request} disabled={loading} style={{ fontFamily: sans, fontSize: 14, padding: "9px 18px", borderRadius: 999, border: "none", background: loading ? "#e2c6cd" : "#c98ba0", color: "#fff", cursor: loading ? "default" : "pointer" }}>
          {loading ? "Poppy is drafting…" : "Request drafts"}
        </button>
      </div>

      {contacts.length === 0 ? (
        <div style={{ fontFamily: sans, fontSize: 14, fontStyle: "italic", color: "rgba(90,64,73,0.6)", background: "#fbf4ec", borderRadius: 16, padding: "24px 20px", textAlign: "center" }}>
          No one tracked yet — log a touchpoint and Poppy will start watching the rhythm.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {contacts.map((name) => {
            const status = STATUS_COLOR[poppy.getSilenceStatus(name)] || STATUS_COLOR.green;
            return (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fffaf6", border: "1px solid rgba(212,130,154,0.12)", borderRadius: 12, padding: "10px 14px" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: status.dot, flexShrink: 0 }} />
                <span style={{ fontFamily: sans, fontSize: 14, color: "#5a4049", flex: 1 }}>{name}</span>
                <span style={{ fontFamily: sans, fontSize: 11.5, color: "rgba(90,64,73,0.55)" }}>{lastTouchLabel(log, name)} · {status.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {error && <div style={{ fontFamily: sans, fontSize: 13, color: "#b8607c", marginBottom: 12 }}>{error}</div>}

      {drafts && drafts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          {drafts.map((d, i) => <DraftCard key={i} draft={d} />)}
        </div>
      )}
      {drafts && drafts.length === 0 && !loading && (
        <div style={{ fontFamily: sans, fontSize: 13, fontStyle: "italic", color: "rgba(90,64,73,0.6)", marginBottom: 18 }}>
          Poppy didn't find anyone overdue — you're keeping good rhythm.
        </div>
      )}

      {flags.length > 0 && (
        <div>
          <div style={{ fontFamily: serif, fontSize: 20, fontStyle: "italic", color: "#6a4e54", marginBottom: 8 }}>Worth noticing</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {flags.map((f, i) => (
              <div key={i} style={{ fontFamily: sans, fontSize: 13, color: "rgba(90,64,73,0.8)", background: "rgba(217,179,106,0.1)", borderRadius: 10, padding: "8px 12px" }}>
                {typeof f === "string" ? f : f.note || JSON.stringify(f)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
