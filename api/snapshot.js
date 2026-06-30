// api/snapshot.js
// EOD snapshot persistence. POST upserts a daily snapshot; GET returns the latest.
// No auth — snapshots are private by deployment (no multi-user data here).
// Never log snapshot_json.
//
// SETUP REQUIRED: Add POSTGRES_URL to Vercel project environment variables.
// Vercel Dashboard → Project → Settings → Environment Variables → Add POSTGRES_URL.
// Get the connection string from: Vercel Dashboard → Storage → your Postgres database → .env.local tab.

import { sql } from "@vercel/postgres";

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS work_hub_snapshots (
    date        TEXT        PRIMARY KEY,
    snapshot_json JSONB     NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

async function ensureTable() {
  await sql.query(CREATE_TABLE);
}

function isValidISODate(value) {
  if (typeof value !== "string") return false;
  // Accept YYYY-MM-DD
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export default async function handler(req, res) {
  try {
    await ensureTable();
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "db_init_failed" }));
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
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "invalid_date" }));
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
      await sql.query(
        `INSERT INTO work_hub_snapshots (date, snapshot_json, created_at, updated_at)
         VALUES ($1, $2::jsonb, NOW(), NOW())
         ON CONFLICT (date) DO UPDATE
           SET snapshot_json = EXCLUDED.snapshot_json,
               updated_at    = NOW()`,
        [date, JSON.stringify(payload)]
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "save_failed" }));
    }
    return;
  }

  if (req.method === "GET") {
    try {
      const result = await sql.query(
        `SELECT date, snapshot_json
         FROM work_hub_snapshots
         ORDER BY date DESC
         LIMIT 1`
      );

      const row = result.rows[0] || null;
      const snapshot = row
        ? { date: row.date, ...row.snapshot_json }
        : null;

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, snapshot }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "fetch_failed" }));
    }
    return;
  }

  res.writeHead(405, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: false, error: "method_not_allowed" }));
}

// -----------------------------------------------------------------------------
// Manual smoke test (run after deploying to Vercel):
//
// GET — empty DB returns null snapshot:
//   curl -X GET https://your-vercel-url.vercel.app/api/snapshot
//   Expected: {"ok":true,"snapshot":null}
//
// GET — after first EOD completes returns the snapshot:
//   curl -X GET https://your-vercel-url.vercel.app/api/snapshot
//   Expected: {"ok":true,"snapshot":{"date":"2026-06-30","completedTasks":[...],...}}
// -----------------------------------------------------------------------------
