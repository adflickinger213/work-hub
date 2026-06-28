// NotificationsToggle.jsx — a settings toggle for push notifications. Off by
// default. Turning it on requests permission; if the user declines, it stays
// off. The preference is persisted through lib/storage (settings key).

import React, { useState, useCallback } from "react";
import { requestPermission } from "../../lib/notifications.js";
import { saveStore, loadStore, STORAGE_KEYS } from "../../lib/storage.js";

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Jost', system-ui, sans-serif";

function readEnabled() {
  const s = loadStore(STORAGE_KEYS.settings);
  return !!(s && s.notificationsEnabled);
}

function writeEnabled(value) {
  const s = loadStore(STORAGE_KEYS.settings) || {};
  return saveStore(STORAGE_KEYS.settings, { ...s, notificationsEnabled: value });
}

export default function NotificationsToggle() {
  const [enabled, setEnabled] = useState(readEnabled); // off by default
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const toggle = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setNote("");
    if (!enabled) {
      const ok = await requestPermission();
      if (ok) {
        setEnabled(true);
        writeEnabled(true);
      } else {
        setNote("Notifications stayed off — your browser didn't grant permission.");
      }
    } else {
      setEnabled(false);
      writeEnabled(false);
    }
    setBusy(false);
  }, [busy, enabled]);

  return (
    <div style={{ background: "#fffaf6", border: "1px solid rgba(212,130,154,0.15)", borderRadius: 14, padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontFamily: serif, fontSize: 18, fontStyle: "italic", color: "#5a4049" }}>Notifications</div>
          <div style={{ fontFamily: sans, fontSize: 12.5, color: "rgba(90,64,73,0.65)", marginTop: 2 }}>
            Gentle reminders before tasks, and Hazel's heads-ups.
          </div>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          role="switch"
          aria-checked={enabled}
          aria-label="Toggle notifications"
          style={{
            width: 52,
            height: 30,
            borderRadius: 999,
            border: "none",
            background: enabled ? "#9eb89a" : "#e2d5cd",
            position: "relative",
            cursor: busy ? "default" : "pointer",
            transition: "background 0.2s ease",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 3,
              left: enabled ? 25 : 3,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#fffaf6",
              transition: "left 0.2s ease",
              boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
            }}
          />
        </button>
      </div>
      {note && <div style={{ fontFamily: sans, fontSize: 12, color: "#b8607c", marginTop: 8 }}>{note}</div>}
    </div>
  );
}
