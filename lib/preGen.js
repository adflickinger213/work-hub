// lib/preGen.js — the Friday-batch / Monday-serve cache logic for Sage's
// weekly plan. The idea: generate the upcoming week on Friday afternoon, cache
// it, and serve it instantly on Monday morning instead of making Lexy wait.

import { saveStore, loadStore, STORAGE_KEYS } from "./storage.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const STALE_MS = 4 * DAY_MS; // cache is considered stale after 4 days

/**
 * shouldPreGenerate() — true on Friday after 3pm local time.
 */
export function shouldPreGenerate() {
  const now = new Date();
  return now.getDay() === 5 && now.getHours() >= 15;
}

/**
 * shouldServeFromCache() — true on Monday when a valid (fresh) cache exists.
 */
export function shouldServeFromCache() {
  const now = new Date();
  if (now.getDay() !== 1) return false;
  return getPreGenCache() !== null;
}

/**
 * getPreGenCache() — returns the cached weekPlan payload, or null if missing
 * or stale (older than 4 days).
 */
export function getPreGenCache() {
  const cached = loadStore(STORAGE_KEYS.preGenCache);
  if (!cached || typeof cached !== "object") return null;
  const ts = Number(cached.timestamp);
  if (!Number.isFinite(ts)) return null;
  if (Date.now() - ts > STALE_MS) return null;
  return cached;
}

/**
 * savePreGenCache(weekPlan, capacityState) — store the plan with metadata.
 */
export function savePreGenCache(weekPlan, capacityState) {
  return saveStore(STORAGE_KEYS.preGenCache, {
    weekPlan,
    timestamp: Date.now(),
    capacityState: capacityState || null,
    generatedBy: "sage",
  });
}

/**
 * isPreGenCacheStale() — true if a cache exists and is older than 4 days
 * (or if no cache exists at all).
 */
export function isPreGenCacheStale() {
  const cached = loadStore(STORAGE_KEYS.preGenCache);
  if (!cached || typeof cached !== "object") return true;
  const ts = Number(cached.timestamp);
  if (!Number.isFinite(ts)) return true;
  return Date.now() - ts > STALE_MS;
}
