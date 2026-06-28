// api/login.js — the password gate. On a correct password it issues an HMAC
// session token (signed with JWT_SECRET) and sets it as an httpOnly cookie the
// browser can't read from JS. api/agent and api/rosie verify that token before
// doing any work, so this is a real server-side gate, not a front-end check.
//
// Requires APP_PASSWORD and JWT_SECRET environment variables in Vercel.
// On failure it returns { ok: false } with no detail — nothing to probe.

import { signSession, sessionCookie } from "../lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false });
    return;
  }

  const expected = process.env.APP_PASSWORD;
  const secret = process.env.JWT_SECRET;
  if (!expected || !secret) {
    // Misconfiguration — don't leak which piece is missing.
    res.status(500).json({ ok: false });
    return;
  }

  const { password } = req.body || {};
  if (typeof password !== "string" || password !== expected) {
    res.status(401).json({ ok: false });
    return;
  }

  const token = signSession(secret);
  res.setHeader("Set-Cookie", sessionCookie(token));
  res.status(200).json({ ok: true, token });
}
