// lib/auth.js — HMAC session tokens for the password gate.
//
// On a correct password, api/login signs a short token with JWT_SECRET and
// drops it in an httpOnly cookie. api/agent and api/rosie verify that token
// server-side before doing any work. The secret never leaves the server and
// the token is tamper-evident (any edit breaks the signature).

import crypto from "node:crypto";

const COOKIE_NAME = "wh_auth";
// 30 days, in seconds.
const MAX_AGE = 60 * 60 * 24 * 30;

function b64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function hmac(secret, data) {
  return b64url(crypto.createHmac("sha256", secret).update(data).digest());
}

// Timing-safe string compare.
function safeEqual(a, b) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/**
 * signSession(secret, ttlSeconds)
 * Returns a signed token of the form `<expiry>.<signature>`.
 */
export function signSession(secret, ttlSeconds = MAX_AGE) {
  if (!secret) throw new Error("signSession: missing secret");
  // Expiry is passed in by the caller (serverless can't use Date.now freely in
  // some sandboxes, but here it's a normal Node runtime, so this is fine).
  const expiry = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = String(expiry);
  return `${payload}.${hmac(secret, payload)}`;
}

/**
 * verifySession(secret, token)
 * Returns true if the token is well-formed, correctly signed, and unexpired.
 */
export function verifySession(secret, token) {
  if (!secret || typeof token !== "string") return false;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!safeEqual(sig, hmac(secret, payload))) return false;
  const expiry = Number(payload);
  if (!Number.isFinite(expiry)) return false;
  return Math.floor(Date.now() / 1000) < expiry;
}

/**
 * sessionCookie(token)
 * Builds the Set-Cookie header value for the session token.
 */
export function sessionCookie(token) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${MAX_AGE}`;
}

/**
 * readSessionToken(req)
 * Pulls the session token out of the request cookies, or null.
 */
export function readSessionToken(req) {
  const cookie = req.headers.cookie || "";
  const found = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  return found ? decodeURIComponent(found.slice(COOKIE_NAME.length + 1)) : null;
}

/**
 * requireSession(req)
 * Convenience guard: true if the request carries a valid session cookie.
 */
export function requireSession(req) {
  return verifySession(process.env.JWT_SECRET, readSessionToken(req));
}
