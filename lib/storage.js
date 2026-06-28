// lib/storage.js — the single front door to persisted Work Hub data.
//
// Everything the app stores goes through here so we have one schema, one set
// of key names, and one place that handles JSON + error safety. No component
// should touch localStorage directly.
//
// Note: the legacy artifact build uses window.storage (async). This module is
// the localStorage-backed schema for the Vite/Vercel build and the newer
// agent features. All functions are wrapped in try/catch and never throw.

/**
 * STORAGE_KEYS — canonical key names for every persisted slice of state.
 * Pass these values into loadStore / saveStore / clearStore.
 */
export const STORAGE_KEYS = {
  tasks: "work-hub:tasks",
  roadmap: "work-hub:roadmap",
  weekPlan: "work-hub:weekPlan",
  agentScrolls: "work-hub:agentScrolls",
  preGenCache: "work-hub:preGenCache",
  capacityState: "work-hub:capacityState",
  communicationLog: "work-hub:communicationLog",
  sessions: "work-hub:sessions",
  ivyProposals: "work-hub:ivyProposals",
};

// Internal meta key (migration flags etc.). Not part of the public schema.
const META_KEY = "work-hub:meta";
// The pre-migration localStorage blob we may need to read from once.
const V4_KEY = "work-hub-v4";

const VALID_KEYS = new Set(Object.values(STORAGE_KEYS));

function hasLocalStorage() {
  return typeof localStorage !== "undefined" && localStorage !== null;
}

/**
 * loadStore(key)
 * Reads and JSON-parses a value. Returns null on missing key or any error.
 */
export function loadStore(key) {
  try {
    if (!hasLocalStorage()) return null;
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("[work-hub] loadStore failed:", key, err?.message ?? err);
    return null;
  }
}

/**
 * saveStore(key, data)
 * Validates the key, stringifies, and saves. Returns true on success.
 */
export function saveStore(key, data) {
  try {
    if (!VALID_KEYS.has(key)) {
      console.error("[work-hub] saveStore rejected unknown key:", key);
      return false;
    }
    if (!hasLocalStorage()) return false;
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error("[work-hub] saveStore failed:", key, err?.message ?? err);
    return false;
  }
}

/**
 * clearStore(key)
 * Removes a value — but only for keys in the known schema. Returns boolean.
 */
export function clearStore(key) {
  try {
    if (!VALID_KEYS.has(key)) {
      console.error("[work-hub] clearStore rejected unknown key:", key);
      return false;
    }
    if (!hasLocalStorage()) return false;
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error("[work-hub] clearStore failed:", key, err?.message ?? err);
    return false;
  }
}

/**
 * loadMeta() / saveMeta(patch) — internal flags (migration state, etc.).
 */
function loadMeta() {
  try {
    if (!hasLocalStorage()) return {};
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMeta(patch) {
  try {
    if (!hasLocalStorage()) return false;
    const next = { ...loadMeta(), ...patch };
    localStorage.setItem(META_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

/**
 * migrateFromV4()
 * One-time, idempotent migration from the old `work-hub-v4` blob. If that key
 * exists and we haven't migrated yet, copy its tasks/roadmap arrays into the
 * new schema keys and record { migrated: true } in meta. The old key is left
 * in place as a safety net. Returns true if a migration ran, false otherwise.
 */
export function migrateFromV4() {
  try {
    if (!hasLocalStorage()) return false;

    const meta = loadMeta();
    if (meta.migrated) return false; // already done

    const rawOld = localStorage.getItem(V4_KEY);
    if (!rawOld) {
      // Nothing to migrate, but mark so we don't keep checking.
      saveMeta({ migrated: true, migratedFromV4: false });
      return false;
    }

    let old;
    try {
      old = JSON.parse(rawOld);
    } catch {
      saveMeta({ migrated: true, migratedFromV4: false });
      return false;
    }

    if (old && Array.isArray(old.tasks)) {
      saveStore(STORAGE_KEYS.tasks, old.tasks);
    }
    if (old && Array.isArray(old.roadmap)) {
      saveStore(STORAGE_KEYS.roadmap, old.roadmap);
    }

    // Do NOT delete V4_KEY — leave the old data as a backup.
    saveMeta({ migrated: true, migratedFromV4: true });
    return true;
  } catch (err) {
    console.error("[work-hub] migrateFromV4 failed:", err?.message ?? err);
    return false;
  }
}
