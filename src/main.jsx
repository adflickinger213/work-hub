// main.jsx — boots the app behind a password gate.
// The shim must load before the app. The gate shows a login screen and only
// renders <App/> after api/login accepts the password. The real protection is
// the httpOnly cookie that api/login sets and api/rosie checks server-side;
// the sessionStorage flag here is just UI state.
import "./storage-shim.js";
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "../dist/work-hub.bundle.jsx";
import WeekPrepLauncher from "./components/WeekPrepLauncher.jsx";
import { migrateFromV4, saveStore, loadStore, STORAGE_KEYS } from "../lib/storage.js";
import { runEODChain } from "../lib/agentOrchestrator.js";

// Self-heal stale/invalid sessions. The login "unlocked" flag lives in
// sessionStorage (UI state), but the real auth is the httpOnly cookie checked
// server-side. If the cookie is missing, expired, or left over from an older
// version (e.g. the pre-HMAC cookie that stored the raw password), every
// /api/* call returns 401 while the UI still looks logged in — a confusing
// dead end. This wrapper watches for that: on any same-origin /api/* 401 (other
// than the login call itself), it drops the unlock flag and bounces to the login
// screen, where a fresh login mints a valid token that overwrites the stale
// cookie. Installed before the app boots so it covers every fetch.
if (typeof window !== "undefined" && typeof window.fetch === "function" && !window.__whAuthHeal) {
  window.__whAuthHeal = true;
  const realFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const res = await realFetch(...args);
    try {
      const input = args[0];
      const url = typeof input === "string" ? input : (input && input.url) || "";
      const isApi = url.includes("/api/") && !url.includes("/api/login");
      if (res.status === 401 && isApi && sessionStorage.getItem("wh_unlocked") === "1") {
        sessionStorage.removeItem("wh_unlocked");
        if (!window.__whReloading) { window.__whReloading = true; location.reload(); }
      }
    } catch {}
    return res;
  };
}

// One-time, idempotent migration of the old work-hub-v4 blob into the new
// storage schema. Safe to call on every boot.
migrateFromV4();

// Bridge the new ESM storage helpers to the concatenated artifact, which can't
// import modules (golden rule: the bundle is one shared scope, no imports). The
// artifact persists Rosie chat sessions by calling window.__workhub.saveSession.
if (typeof window !== "undefined") {
  window.__workhub = window.__workhub || {};

  // Expose the app's real, active items as Sage-friendly tasks. Reads the live
  // snapshot published by App (window.__workhub.currentData). Active = not done,
  // not parked/cancelled. Keeps the agent layer working off real data instead
  // of the empty lib/storage key.
  window.__workhub.getTasks = function getTasks() {
    try {
      const d = window.__workhub.currentData;
      const items = (d && Array.isArray(d.items)) ? d.items : [];
      return items
        .filter((it) => {
          const s = (it.status || "todo").toLowerCase();
          return s !== "done" && s !== "complete" && s !== "completed" && s !== "parked" && s !== "cancelled";
        })
        .map((it) => ({
          id: it.id,
          name: it.title || it.name || "Untitled",
          why: it.why || "",
          status: it.status || "todo",
          subtasks: Array.isArray(it.tasks) ? it.tasks : [],
        }));
    } catch {
      return [];
    }
  };

  // The end-of-day chain (Sage rebalance -> Ivy synthesis -> Postgres snapshot).
  // Lives in lib/ (ESM) so the concatenated artifact can't import it directly;
  // the bundle reaches it through this bridge and calls it fire-and-forget when
  // the day is wrapped. Runs in the browser against the app's own /api/* routes.
  window.__workhub.runEODChain = function runEODChainBridge(todayData) {
    return runEODChain(todayData || {});
  };

  window.__workhub.saveSession = function saveSession(session) {
    try {
      const prev = loadStore(STORAGE_KEYS.sessions) || [];
      const list = Array.isArray(prev) ? prev : [];
      list.push(session);
      // Keep the log bounded so storage never balloons.
      const trimmed = list.slice(-200);
      return saveStore(STORAGE_KEYS.sessions, trimmed);
    } catch {
      return false;
    }
  };
}

function AuthGate() {
  const [unlocked, setUnlocked] = useState(
    () => typeof sessionStorage !== "undefined" && sessionStorage.getItem("wh_unlocked") === "1"
  );
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (r.ok) {
        try { sessionStorage.setItem("wh_unlocked", "1"); } catch {}
        setUnlocked(true);
      } else {
        setErr("That doesn't look right. Try again.");
      }
    } catch {
      setErr("Something went wrong. Give it another moment.");
    } finally {
      setBusy(false);
    }
  }

  if (unlocked) return (
    <>
      <App />
      <WeekPrepLauncher />
    </>
  );

  const wrap = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(160deg, #fdf6f0 0%, #f7ede9 100%)",
    fontFamily: "'Jost', system-ui, sans-serif",
    padding: 24,
  };
  const card = {
    background: "#fffaf6",
    borderRadius: 24,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 380,
    boxShadow: "0 12px 40px rgba(120, 80, 90, 0.12)",
    textAlign: "center",
  };
  const input = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #e7d6cf",
    background: "#fff",
    fontSize: 15,
    fontFamily: "'Jost', system-ui, sans-serif",
    marginBottom: 12,
    outline: "none",
  };
  const button = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "none",
    background: busy ? "#d9b8c0" : "#c98ba0",
    color: "#fff",
    fontSize: 15,
    fontFamily: "'Jost', system-ui, sans-serif",
    cursor: busy ? "default" : "pointer",
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ fontSize: 30, marginBottom: 6 }}>🌸</div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 30,
            fontStyle: "italic",
            color: "#5a4049",
            marginBottom: 4,
          }}
        >
          Welcome back
        </div>
        <div style={{ fontSize: 13, color: "rgba(90,64,73,0.6)", marginBottom: 22 }}>
          Enter your password to open your space.
        </div>
        <form onSubmit={submit}>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            aria-label="Password"
            autoFocus
            style={input}
          />
          <button type="submit" disabled={busy} style={button}>
            {busy ? "Opening…" : "Enter"}
          </button>
        </form>
        {err && (
          <div role="alert" style={{ fontSize: 12, color: "#b8607c", marginTop: 12 }}>{err}</div>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AuthGate />);
