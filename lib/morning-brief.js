// lib/morning-brief.js
// This reads the latest EOD snapshot written by Sprint B.
// Works on first deploy after Postgres is configured.

export async function getMorningBrief() {
  let raw;
  try {
    const res = await fetch("/api/snapshot", {
      method: "GET",
      credentials: "same-origin",
    });
    if (!res.ok) {
      return { ok: false, error: "snapshot_fetch_failed" };
    }
    raw = await res.json();
  } catch (err) {
    return { ok: false, error: "snapshot_unavailable" };
  }

  if (!raw || !raw.ok) {
    return { ok: false, error: raw?.error || "snapshot_error" };
  }

  const snapshot = raw.snapshot;
  if (!snapshot) {
    return { ok: true, brief: null };
  }

  const today = new Date().toISOString().slice(0, 10);
  const isStale = snapshot.date !== today;

  const brief = {
    date:            snapshot.date            ?? null,
    completedTasks:  snapshot.completedTasks  ?? [],
    incompleteTasks: snapshot.incompleteTasks ?? [],
    waitingOn:       snapshot.waitingOn       ?? [],
    updatedWeekPlan: snapshot.updatedWeekPlan ?? null,
    slots:           snapshot.slots           ?? [],
    sageNote:        snapshot.sageNote        ?? null,
    ivyNote:         snapshot.ivyNote         ?? null,
    fetchedAt:       new Date().toISOString(),
    isStale,
  };

  return { ok: true, brief };
}

export default getMorningBrief;
