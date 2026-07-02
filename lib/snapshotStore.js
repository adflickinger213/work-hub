// lib/snapshotStore.js — the one place EOD snapshots touch Postgres.
//
// Both api/snapshot.js and api/morning-brief.js read/write through here so the
// SQL, the table shape, and the JSONB (de)serialization live in a single spot.
// This runs SERVER-SIDE only (Vercel serverless) — never import it into the
// browser bundle.
//
// SETUP REQUIRED: add POSTGRES_URL to the Vercel project's environment
// variables (Vercel Dashboard -> Storage -> your Postgres DB -> .env.local tab,
// then Settings -> Environment Variables). @vercel/postgres reads it on the
// first query, so importing this module never opens a connection.
//
// Never log snapshot_json — it holds Lexy's task/note data.

import { sql } from "@vercel/postgres";

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS work_hub_snapshots (
    date          TEXT        PRIMARY KEY,
    snapshot_json JSONB       NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

// The active DB client. Defaults to @vercel/postgres' `sql`; tests swap in a
// fake via __setSqlForTests so qa.mjs can exercise the handlers without a real
// database (mirrors how the suite mocks globalThis.fetch / localStorage).
let client = sql;

/** __setSqlForTests(fake) — override the DB client. Test-only. */
export function __setSqlForTests(fake) {
  client = fake;
}

/** __resetSqlForTests() — restore the real @vercel/postgres client. Test-only. */
export function __resetSqlForTests() {
  client = sql;
}

// The table is created lazily on first use; CREATE TABLE IF NOT EXISTS is a
// no-op once it exists. Kept off the request hot path by only calling it from
// the read/write helpers (not on every stray request).
let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await client.query(CREATE_TABLE);
  tableReady = true;
}

// Reset the memoized ensureTable flag — test-only, pairs with __setSqlForTests.
export function __resetTableFlagForTests() {
  tableReady = false;
}

/**
 * upsertSnapshot(date, payload)
 * Inserts (or overwrites) the snapshot row for `date`. `payload` is any
 * JSON-serializable object; it is stored as JSONB. Throws on DB failure.
 */
export async function upsertSnapshot(date, payload) {
  await ensureTable();
  await client.query(
    `INSERT INTO work_hub_snapshots (date, snapshot_json, created_at, updated_at)
     VALUES ($1, $2::jsonb, NOW(), NOW())
     ON CONFLICT (date) DO UPDATE
       SET snapshot_json = EXCLUDED.snapshot_json,
           updated_at    = NOW()`,
    [date, JSON.stringify(payload)]
  );
}

/**
 * getLatestSnapshot()
 * Returns the most recent snapshot as { date, ...payload }, or null if none.
 * Throws on DB failure.
 */
export async function getLatestSnapshot() {
  await ensureTable();
  const result = await client.query(
    `SELECT date, snapshot_json
     FROM work_hub_snapshots
     ORDER BY date DESC
     LIMIT 1`
  );
  const row = result && result.rows && result.rows[0];
  if (!row) return null;
  return { date: row.date, ...row.snapshot_json };
}
