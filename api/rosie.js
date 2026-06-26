// api/rosie.js — the proxy for Rosie's AI calls. It does two jobs:
//   1. Confirms the request carries the valid auth cookie (set by api/login).
//   2. Forwards the request to Anthropic with the secret API key attached
//      server-side, so the key is never in the browser.
//
// The app calls this exactly like it used to call Anthropic directly — same
// JSON body ({ model, max_tokens, system, messages }) — and gets Anthropic's
// response back unchanged, so the app's existing parsing keeps working.
//
// Requires APP_PASSWORD and ANTHROPIC_API_KEY environment variables in Vercel.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // --- auth check (cookie set by api/login) ---
  const expected = process.env.APP_PASSWORD;
  const cookie = req.headers.cookie || "";
  const found = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("wh_auth="));
  const token = found ? decodeURIComponent(found.slice("wh_auth=".length)) : null;

  if (!expected || token !== expected) {
    res.status(401).json({ error: "Not authorized" });
    return;
  }

  // --- forward to Anthropic with the secret key ---
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY" });
    return;
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(502).json({ error: "Upstream request to Anthropic failed" });
  }
}
