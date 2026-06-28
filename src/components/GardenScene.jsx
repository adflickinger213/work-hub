// GardenScene.jsx — an ambient, non-interactive SVG garden that mirrors Lexy's
// capacity. It sits at the top of the dashboard as a soft header.
//   low_tap / running_hot -> wilted (drooping, muted)
//   heavy                 -> budding (a few open, morning light)
//   clear                 -> blooming (full garden, warm light)
// Crossfades gently when the state changes. Reads capacityState from storage
// unless a value is passed in. Inline SVG only — no libraries.

import React, { useState, useEffect } from "react";
import { loadStore, STORAGE_KEYS } from "../../lib/storage.js";

const serif = "'Cormorant Garamond', Georgia, serif";

function sceneFor(state) {
  if (state === "low_tap" || state === "running_hot") return "wilted";
  if (state === "heavy") return "budding";
  if (state === "clear") return "blooming";
  return "budding";
}

const PALETTES = {
  wilted: { sky: ["#e7e0e4", "#dcd3d6"], ground: "#cdbfae", bloom: "#bda6a0", stem: "#94997f", glow: "#e3dadd" },
  budding: { sky: ["#fdf3e6", "#f6e7d4"], ground: "#d8c7a8", bloom: "#e3a9b8", stem: "#9eb89a", glow: "#ffeccf" },
  blooming: { sky: ["#fdeede", "#fce0d0"], ground: "#e0cda4", bloom: "#e58aa3", stem: "#8fb389", glow: "#ffe2b8" },
};

// A single flower. `openness` 0..1 controls petal spread; droop tilts it.
function Flower({ x, openness, droop, palette }) {
  const petals = openness > 0.2;
  const tilt = droop ? 14 : 0;
  return (
    <g transform={`translate(${x},150) rotate(${tilt})`}>
      <path d={`M0,0 C-6,-30 -6,-${30 + openness * 20} 0,-${40 + openness * 22}`} stroke={palette.stem} strokeWidth="3" fill="none" />
      {petals ? (
        <g transform={`translate(0,-${42 + openness * 20})`}>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx="0" cy="-8" rx={3 + openness * 3} ry={6 + openness * 5} fill={palette.bloom} transform={`rotate(${a})`} opacity={0.85} />
          ))}
          <circle cx="0" cy="0" r={4 + openness * 2} fill={palette.glow} />
        </g>
      ) : (
        <ellipse cx="0" cy={`-${42}`} rx="5" ry="9" fill={palette.bloom} opacity="0.7" />
      )}
    </g>
  );
}

export default function GardenScene({ capacityState, onCheckInClick }) {
  const [state, setState] = useState(
    () => capacityState || loadStore(STORAGE_KEYS.capacityState) || null
  );

  // Keep in sync if the prop changes.
  useEffect(() => {
    if (capacityState !== undefined) setState(capacityState);
  }, [capacityState]);

  const scene = sceneFor(state);
  const p = PALETTES[scene];

  // Flower layout per scene: openness + droop.
  const config = {
    wilted: [
      { x: 40, openness: 0.1, droop: true },
      { x: 90, openness: 0.05, droop: true },
      { x: 150, openness: 0.15, droop: true },
      { x: 210, openness: 0.08, droop: true },
      { x: 260, openness: 0.12, droop: true },
    ],
    budding: [
      { x: 40, openness: 0.4, droop: false },
      { x: 90, openness: 0.2, droop: false },
      { x: 150, openness: 0.6, droop: false },
      { x: 210, openness: 0.3, droop: false },
      { x: 260, openness: 0.5, droop: false },
    ],
    blooming: [
      { x: 40, openness: 1, droop: false },
      { x: 90, openness: 0.9, droop: false },
      { x: 150, openness: 1, droop: false },
      { x: 210, openness: 0.95, droop: false },
      { x: 260, openness: 1, droop: false },
    ],
  }[scene];

  return (
    <div style={{ position: "relative", width: "100%", borderRadius: 20, overflow: "hidden", boxShadow: "0 6px 22px rgba(150,110,95,0.08)" }}>
      <svg
        key={scene}
        viewBox="0 0 300 170"
        preserveAspectRatio="xMidYMid slice"
        style={{ display: "block", width: "100%", height: 150, transition: "opacity 0.8s ease", opacity: 1, animation: "gardenfade 0.8s ease" }}
        aria-label={`Garden — ${scene}`}
      >
        <style>{`@keyframes gardenfade{from{opacity:0}to{opacity:1}}`}</style>
        <defs>
          <linearGradient id={`sky-${scene}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.sky[0]} />
            <stop offset="100%" stopColor={p.sky[1]} />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="300" height="170" fill={`url(#sky-${scene})`} />
        {/* soft sun/light */}
        <circle cx="248" cy="42" r="26" fill={p.glow} opacity={scene === "wilted" ? 0.3 : 0.6} />
        {/* ground */}
        <path d="M0,150 Q150,128 300,150 L300,170 L0,170 Z" fill={p.ground} />
        {config.map((f, i) => (
          <Flower key={i} x={f.x} openness={f.openness} droop={f.droop} palette={p} />
        ))}
      </svg>

      <button
        type="button"
        onClick={onCheckInClick}
        style={{
          position: "absolute",
          left: 14,
          bottom: 12,
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: 16,
          color: "#5a4049",
          background: "rgba(255,250,246,0.78)",
          border: "none",
          borderRadius: 999,
          padding: "5px 14px",
          cursor: onCheckInClick ? "pointer" : "default",
        }}
      >
        How are you feeling today?
      </button>
    </div>
  );
}
