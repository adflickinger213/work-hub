// api/snapshot.js — EOD snapshot persistence.
//   POST  upserts the day's snapshot (keyed by ISO date).
//   GET   returns the most recent snapshot.
//
// Session-gated like every other data endpoint: the browser calls it with the
// httpOnly session cookie (credentials:"same-origin"), so only the logged-in
// user can read or write snapshots. DB access is centralized in
// lib/snapshotStore.js. Never log the snapshot payload.
//
// SETUP: add POSTGRES_URL to the Vercel project env (see lib/snapshotStore.js).

import { requireSession } from "../lib/auth.js";
import { getLatestSnapshot, upsertSnapshot } from "../lib/snapshotStore.js";

// Accept only YYYY-MM-DD.
function isValidISODate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export default async function handler(req, res) {
  // Method + auth are checked BEFORE any DB work so unauthenticated or
  // wrong-method requests never touch Postgres.
  if (req.method !== "POST" && req.method !== "GET") {
    res.status(405).json({ ok: false, error: "method_not_allowed" });
    return;
  }
  if (!requireSession(req)) {
    res.status(401).json({ ok: false, error: "not_authorized" });
    return;
  }

  if (req.method === "POST") {
    const {
      date,
      completedTasks,
      incompleteTasks,
      waitingOn,
      updatedWeekPlan,
      slots,
      sageNote,
      ivyNote,
    } = req.body || {};

    if (!isValidISODate(date)) {
      res.status(400).json({ ok: false, error: "invalid_date" });
      return;
    }

    const payload = {
      completedTasks,
      incompleteTasks,
      waitingOn,
      updatedWeekPlan,
      slots,
      sageNote,
      ivyNote,
    };

    try {
      await upsertSnapshot(date, payload);
      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(500).json({ ok: false, error: "save_failed" });
    }
    return;
  }

  // GET — latest snapshot (or null).
  try {
    const snapshot = await getLatestSnapshot();
    res.status(200).json({ ok: true, snapshot });
  } catch (err) {
    res.status(500).json({ ok: false, error: "fetch_failed" });
  }
}
