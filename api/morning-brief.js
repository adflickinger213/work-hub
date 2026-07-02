// api/morning-brief.js
// GET — returns the latest EOD snapshot formatted as a morning brief.
// Reads Postgres directly (via lib/morning-brief -> lib/snapshotStore); it does
// NOT self-fetch /api/snapshot. Session-gated like the other data endpoints.
//
// Empty DB : { ok: true, brief: null }
// After EOD: { ok: true, brief: { date, completedTasks, ..., isStale } }

import { getMorningBrief } from "../lib/morning-brief.js";
import { requireSession } from "../lib/auth.js";

export default async function handler(req, res) {
  // Method + auth are checked before any DB work.
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "method_not_allowed" });
    return;
  }
  if (!requireSession(req)) {
    res.status(401).json({ ok: false, error: "not_authorized" });
    return;
  }

  const result = await getMorningBrief();
  if (!result.ok) {
    res.status(500).json({ ok: false, error: result.error });
    return;
  }
  res.status(200).json({ ok: true, brief: result.brief });
}
