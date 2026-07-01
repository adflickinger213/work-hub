// lib/morning-brief.js — turns the latest EOD snapshot into a morning brief.
//
// Runs SERVER-SIDE. It reads Postgres directly through lib/snapshotStore.js
// (NOT by fetching /api/snapshot — a relative URL can't be fetched from Node).
// buildBrief() is a pure, side-effect-free formatter so it's easy to unit test.

import { getLatestSnapshot } from "./snapshotStore.js";

/**
 * buildBrief(snapshot, nowISO)
 * Pure formatter: shapes a raw snapshot row into the brief the client renders,
 * marking it stale when the snapshot isn't from `nowISO`'s day. Returns null for
 * a null snapshot.
 */
export function buildBrief(snapshot, nowISO) {
  if (!snapshot) return null;
  const now = nowISO || new Date().toISOString();
  const today = now.slice(0, 10);
  return {
    date: snapshot.date ?? null,
    completedTasks: snapshot.completedTasks ?? [],
    incompleteTasks: snapshot.incompleteTasks ?? [],
    waitingOn: snapshot.waitingOn ?? [],
    updatedWeekPlan: snapshot.updatedWeekPlan ?? null,
    slots: snapshot.slots ?? [],
    sageNote: snapshot.sageNote ?? null,
    ivyNote: snapshot.ivyNote ?? null,
    fetchedAt: now,
    isStale: snapshot.date !== today,
  };
}

/**
 * getMorningBrief()
 * Reads the latest snapshot from Postgres and formats it. Returns
 * { ok: true, brief } (brief is null when there's no snapshot yet) or
 * { ok: false, error } if the DB read fails.
 */
export async function getMorningBrief() {
  let snapshot;
  try {
    snapshot = await getLatestSnapshot();
  } catch (err) {
    return { ok: false, error: "snapshot_unavailable" };
  }
  return { ok: true, brief: buildBrief(snapshot) };
}

export default getMorningBrief;
