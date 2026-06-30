// api/morning-brief.js
// GET handler — returns the latest EOD snapshot formatted as a morning brief.
// This reads the latest EOD snapshot written by Sprint B.
// Works on first deploy after Postgres is configured.
// No auth — brief is private by deployment.
//
// curl -X GET https://your-vercel-url.vercel.app/api/morning-brief
// Expected (empty DB): {"ok":true,"brief":null}
// Expected (after EOD): {"ok":true,"brief":{"date":"2026-06-30","completedTasks":[...],...}}

import { getMorningBrief } from "../lib/morning-brief.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "method_not_allowed" }));
    return;
  }

  const result = await getMorningBrief();

  if (!result.ok) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: result.error }));
    return;
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: true, brief: result.brief }));
}
