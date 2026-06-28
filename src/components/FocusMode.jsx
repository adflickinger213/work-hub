// FocusMode.jsx — a full-screen, candlelit overlay for focused work on one
// task. A hand-drawn SVG candle burns down over the session: the flame
// flickers, the wax melts proportionally to elapsed time. When it burns out, a
// soft Web Audio chime plays and Rosie asks how it went. Snooze adds 10 min;
// or mark the task complete. Escape exits.

import React, { useState, useEffect, useRef, useCallback } from "react";

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Jost', system-ui, sans-serif";
const DEFAULT_MINUTES = 25;

// Parse a duration estimate like "30", "30 min", "1h" into minutes.
function minutesFromEstimate(est) {
  if (typeof est === "number" && est > 0) return est;
  if (typeof est === "string") {
    const h = est.match(/(\d+(?:\.\d+)?)\s*h/i);
    if (h) return Math.round(parseFloat(h[1]) * 60);
    const m = est.match(/(\d+)/);
    if (m) return parseInt(m[1], 10);
  }
  return DEFAULT_MINUTES;
}

function playChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    // Two soft sine tones, a gentle fifth.
    [528, 792].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.18;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 1.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 1.7);
    });
    setTimeout(() => { try { ctx.close(); } catch {} }, 2200);
  } catch {
    // Audio is a nicety; never let it break focus mode.
  }
}

export default function FocusMode({ task, onClose, onComplete, onOpenRosie }) {
  const totalMinutes = minutesFromEstimate(task?.duration || task?.estimate);
  const [totalMs, setTotalMs] = useState(totalMinutes * 60 * 1000);
  const [elapsed, setElapsed] = useState(0);
  const [burnedOut, setBurnedOut] = useState(false);
  const [checked, setChecked] = useState({});
  const startRef = useRef(Date.now());
  const baseRef = useRef(0); // elapsed carried over across snoozes

  // Tick the timer.
  useEffect(() => {
    if (burnedOut) return undefined;
    const id = setInterval(() => {
      const e = baseRef.current + (Date.now() - startRef.current);
      setElapsed(e);
      if (e >= totalMs) {
        setBurnedOut(true);
        playChime();
      }
    }, 250);
    return () => clearInterval(id);
  }, [burnedOut, totalMs]);

  // Escape to exit.
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const remaining = Math.max(0, totalMs - elapsed);
  const fraction = Math.max(0, Math.min(1, 1 - elapsed / totalMs)); // wax remaining
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  const snooze = useCallback(() => {
    baseRef.current = 0;
    startRef.current = Date.now();
    setElapsed(0);
    setTotalMs(10 * 60 * 1000); // extend by 10 minutes
    setBurnedOut(false);
  }, []);

  const subtasks = Array.isArray(task?.subtasks)
    ? task.subtasks
    : Array.isArray(task?.tasks)
      ? task.tasks
      : [];

  // Candle geometry: full wax is 150px tall from y=70 down to y=220.
  const waxTop = 220 - 150 * fraction;
  const waxHeight = 150 * fraction;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "radial-gradient(circle at 50% 38%, #fdf3e6 0%, #f3e2cf 60%, #e9d4bb 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <style>{`
        @keyframes flame-flicker {
          0%,100% { transform: scaleY(1) translateX(0); opacity: 0.95; }
          25% { transform: scaleY(1.08) translateX(-0.4px); opacity: 1; }
          50% { transform: scaleY(0.94) translateX(0.5px); opacity: 0.9; }
          75% { transform: scaleY(1.04) translateX(-0.2px); opacity: 0.97; }
        }
      `}</style>

      <button
        type="button"
        onClick={onClose}
        aria-label="Exit focus mode"
        style={{ position: "absolute", top: 18, right: 20, fontFamily: sans, fontSize: 13, color: "#7a5d63", background: "transparent", border: "none", cursor: "pointer" }}
      >
        Esc to exit
      </button>

      {onOpenRosie && (
        <button
          type="button"
          onClick={onOpenRosie}
          aria-label="Open Rosie"
          title="Talk to Rosie"
          style={{ position: "absolute", bottom: 22, right: 22, fontSize: 22, background: "#fffaf6", border: "1px solid rgba(212,130,154,0.25)", borderRadius: "50%", width: 48, height: 48, cursor: "pointer", boxShadow: "0 4px 16px rgba(150,110,95,0.15)" }}
        >
          🌸
        </button>
      )}

      <div style={{ fontFamily: serif, fontSize: 30, fontStyle: "italic", color: "#5a4049", textAlign: "center", maxWidth: 520, marginBottom: 4 }}>
        {task?.title || task?.name || "Focus"}
      </div>
      {(task?.why || task?.reason) && (
        <div style={{ fontFamily: sans, fontSize: 14, fontStyle: "italic", color: "rgba(90,64,73,0.65)", textAlign: "center", maxWidth: 460, marginBottom: 14 }}>
          {task.why || task.reason}
        </div>
      )}

      {/* Candle */}
      <svg width="160" height="240" viewBox="0 0 160 240" aria-hidden style={{ margin: "8px 0" }}>
        {/* glow */}
        {!burnedOut && <circle cx="80" cy="48" r="34" fill="#ffe6b0" opacity="0.35" />}
        {/* flame */}
        {!burnedOut && (
          <g style={{ transformOrigin: "80px 60px", animation: "flame-flicker 1.1s ease-in-out infinite" }}>
            <path d="M80 30 C70 46, 70 60, 80 68 C90 60, 90 46, 80 30 Z" fill="#f6a623" />
            <path d="M80 40 C74 50, 74 60, 80 66 C86 60, 86 50, 80 40 Z" fill="#ffd873" />
          </g>
        )}
        {/* wick */}
        <rect x="79" y="64" width="2" height="8" fill="#5a4039" />
        {/* wax (melts down) */}
        <rect x="55" y={waxTop} width="50" height={waxHeight} rx="10" fill="#f0dcc2" stroke="#e3c9a8" strokeWidth="1.5" />
        {/* holder */}
        <rect x="48" y="216" width="64" height="14" rx="6" fill="#d9b894" />
      </svg>

      <div style={{ fontFamily: serif, fontSize: 34, color: "#6a4e54", letterSpacing: 1 }}>
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </div>

      {/* Subtasks */}
      {subtasks.length > 0 && !burnedOut && (
        <div style={{ marginTop: 16, width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 6 }}>
          {subtasks.map((s, i) => {
            const labelText = typeof s === "string" ? s : s.title || s.name || "Step";
            return (
              <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: sans, fontSize: 13.5, color: "#5a4049", cursor: "pointer" }}>
                <input type="checkbox" checked={!!checked[i]} onChange={() => setChecked((c) => ({ ...c, [i]: !c[i] }))} />
                <span style={{ textDecoration: checked[i] ? "line-through" : "none", opacity: checked[i] ? 0.55 : 1 }}>{labelText}</span>
              </label>
            );
          })}
        </div>
      )}

      {burnedOut && (
        <div style={{ marginTop: 18, textAlign: "center", maxWidth: 420 }}>
          <div style={{ fontFamily: serif, fontSize: 22, fontStyle: "italic", color: "#5a4049", marginBottom: 12 }}>
            Time's up — how did it go?
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button type="button" onClick={snooze} style={{ fontFamily: sans, fontSize: 13.5, padding: "9px 18px", borderRadius: 999, border: "1px solid #e7d6cf", background: "#fffaf6", color: "#7a5d63", cursor: "pointer" }}>
              Snooze 10 min
            </button>
            <button type="button" onClick={() => { onComplete?.(task); onClose?.(); }} style={{ fontFamily: sans, fontSize: 13.5, padding: "9px 18px", borderRadius: 999, border: "none", background: "#9eb89a", color: "#fff", cursor: "pointer" }}>
              Mark complete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
