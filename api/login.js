// api/login.js — the password gate. On a correct password it issues an HMAC
// session token (signed with JWT_SECRET) and sets it as an httpOnly cookie the
// browser can't read from JS. api/agent and api/rosie verify that token before
// doing any work, so this is a real server-side gate, not a front-end check.
//
// Requires APP_PASSWORD and JWT_SECRET environment variables in Vercel.
// On failure it returns { ok: false } with no detail — nothing to probe.
//
// Brute-force protection: an IP is locked out after 10 failed attempts within
// a rolling 24-hour window. Every failed attempt is logged with a timestamp.

import crypto from "node:crypto";
import { signSession, sessionCookie } from "../lib/auth.js";

const SECLOG = "[work-hub][security]";
const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_FAILS = 10;

// Module-level map: ip -> number[] of failed-attempt timestamps. In-memory only;
// a production multi-instance deployment would need a shared store.
const failures = new Map();

function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function recentFails(ip) {
  const now = Date.now();
  return (failures.get(ip) || []).filter((t) => now - t < WINDOW_MS);
}

function recordFail(ip) {
  const fails = recentFails(ip);
  fails.push(Date.now());
  failures.set(ip, fails);
  return fails.length;
}

// Constant-time password check. Hashing both sides first equalizes lengths so
// neither the comparison time nor a length mismatch leaks anything.
function passwordMatches(candidate, expected) {
  if (typeof candidate !== "string") return false;
  const a = crypto.createHash("sha256").update(candidate).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false });
    return;
  }

  const ip = clientIp(req);

  // Locked out?
  if (recentFails(ip).length >= MAX_FAILS) {
    console.warn(`${SECLOG} login locked ip=${ip} at ${new Date().toISOString()}`);
    res.status(429).json({ ok: false });
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
  if (!passwordMatches(password, expected)) {
    const count = recordFail(ip);
    console.warn(`${SECLOG} failed login ip=${ip} attempt=${count} at ${new Date().toISOString()}`);
    res.status(401).json({ ok: false });
    return;
  }

  // Success — clear any prior failures and issue the session. The token lives
  // ONLY in the httpOnly cookie; it is never echoed in the body, so script
  // running in the page (XSS) has nothing to steal.
  failures.delete(ip);
  const token = signSession(secret);
  res.setHeader("Set-Cookie", sessionCookie(token));
  res.status(200).json({ ok: true });
}
