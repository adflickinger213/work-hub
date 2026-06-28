// FernInput.jsx — a small note box that lives on a task's detail/focus view.
// Lexy types a quick note; Fern sorts it. Fern's reply is routed but NEVER
// auto-applied silently: task updates are applied through the parent's handler,
// new subtasks ask for confirmation, flags raise a toast, clarifications show
// inline, and a "complete" reads back a soft confirmation.

import React, { useState, useCallback } from "react";
import { wrapExternalContent } from "../../lib/safeWrap.js";

const sans = "'Jost', system-ui, sans-serif";

// A tiny spinning leaf for the loading state.
function SpinningLeaf() {
  return (
    <span
      aria-hidden
      style={{ display: "inline-block", animation: "fernspin 1s linear infinite" }}
    >
      🍃
    </span>
  );
}

export default function FernInput({
  task,
  onApplyTaskUpdate,
  onAddSubtask,
  onPoppyFlag,
  onHazelFlag,
}) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clarify, setClarify] = useState("");
  const [pendingSubtask, setPendingSubtask] = useState(null);
  const [toast, setToast] = useState("");

  const flash = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }, []);

  const submit = useCallback(async () => {
    const text = note.trim();
    if (!text || loading) return;
    setLoading(true);
    setError("");
    setClarify("");
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          agentName: "fern",
          instruction:
            `Sort this note about the current task and decide what to do with it. ` +
            `Note: "${text}". Return JSON with one of: ` +
            `{ taskUpdate }, { newSubtask }, { poppyFlag }, { hazelFlag }, ` +
            `{ action: "clarify", question }, { action: "complete" }.`,
          externalContent: wrapExternalContent({ task: task || null, note: text }, "task + note"),
        }),
      });

      if (!res.ok) {
        setError("Fern is quiet right now — try again in a moment.");
        return;
      }
      const payload = await res.json();
      if (!payload || !payload.ok || payload.anomalous) {
        setError("Fern is quiet right now — try again in a moment.");
        return;
      }
      const data = payload.data || {};

      // Route Fern's response. Never auto-apply a subtask without confirming.
      if (data.action === "clarify" && data.question) {
        setClarify(data.question);
      } else if (data.action === "complete") {
        flash("Fern recorded that");
        setNote("");
      } else if (data.newSubtask) {
        setPendingSubtask(data.newSubtask);
      } else if (data.taskUpdate) {
        if (typeof onApplyTaskUpdate === "function") onApplyTaskUpdate(data.taskUpdate);
        flash("Fern updated the task");
        setNote("");
      } else if (data.poppyFlag) {
        if (typeof onPoppyFlag === "function") onPoppyFlag(data.poppyFlag);
        flash("Flagged for Poppy");
        setNote("");
      } else if (data.hazelFlag) {
        if (typeof onHazelFlag === "function") onHazelFlag(data.hazelFlag);
        flash("Flagged for Hazel");
        setNote("");
      } else {
        setError("Fern wasn't sure what to do with that — try rephrasing.");
      }
    } catch (err) {
      console.error("[work-hub] FernInput failed:", err?.message ?? err);
      setError("Fern is quiet right now — try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, [note, loading, task, onApplyTaskUpdate, onPoppyFlag, onHazelFlag, flash]);

  function confirmSubtask() {
    if (pendingSubtask && typeof onAddSubtask === "function") onAddSubtask(pendingSubtask);
    setPendingSubtask(null);
    flash("Subtask added");
    setNote("");
  }

  const subtaskLabel = pendingSubtask
    ? typeof pendingSubtask === "string"
      ? pendingSubtask
      : pendingSubtask.title || pendingSubtask.name || "New subtask"
    : "";

  return (
    <div style={{ marginTop: 10 }}>
      <style>{`@keyframes fernspin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder="Add a note — Fern will sort it"
          disabled={loading}
          style={{
            flex: 1,
            boxSizing: "border-box",
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #e7d6cf",
            background: "#fffaf6",
            fontFamily: sans,
            fontSize: 13.5,
            color: "#5a4049",
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={submit}
          disabled={loading || !note.trim()}
          style={{ fontFamily: sans, fontSize: 13, padding: "10px 14px", borderRadius: 12, border: "none", background: loading ? "#cdd9cb" : "#9eb89a", color: "#fff", cursor: loading || !note.trim() ? "default" : "pointer", minWidth: 56 }}
        >
          {loading ? <SpinningLeaf /> : "Sort"}
        </button>
      </div>

      {error && <div style={{ fontFamily: sans, fontSize: 12.5, color: "#b8607c", marginTop: 8 }}>{error}</div>}

      {clarify && (
        <div style={{ fontFamily: sans, fontSize: 13, fontStyle: "italic", color: "#6a4e54", background: "rgba(158,184,154,0.1)", borderRadius: 10, padding: "8px 12px", marginTop: 8 }}>
          {clarify}
        </div>
      )}

      {pendingSubtask && (
        <div style={{ background: "#fffaf6", border: "1px solid rgba(158,184,154,0.4)", borderRadius: 12, padding: 12, marginTop: 8 }}>
          <div style={{ fontFamily: sans, fontSize: 13, color: "#5a4049", marginBottom: 8 }}>Add this subtask?</div>
          <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 500, color: "#6a4e54", marginBottom: 10 }}>{subtaskLabel}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={confirmSubtask} style={{ fontFamily: sans, fontSize: 12.5, padding: "6px 14px", borderRadius: 999, border: "none", background: "#9eb89a", color: "#fff", cursor: "pointer" }}>Add it</button>
            <button type="button" onClick={() => setPendingSubtask(null)} style={{ fontFamily: sans, fontSize: 12.5, padding: "6px 14px", borderRadius: 999, border: "1px solid #e7d6cf", background: "#fffaf6", color: "#7a5d63", cursor: "pointer" }}>Not now</button>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ fontFamily: sans, fontSize: 12, color: "#7a9e78", background: "rgba(158,184,154,0.12)", borderRadius: 999, padding: "6px 12px", marginTop: 8, display: "inline-block" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
