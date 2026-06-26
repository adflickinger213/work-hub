// 02-helpers-tasks-items.js
// Imports, storage layer, app-wide constants, subtask helpers, parseHierarchicalList, sprint timer helpers.

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Sparkles, MessageCircle, BookOpen, Copy, Check, RefreshCw, Play, ChevronLeft, ChevronRight, Heart, Battery, Zap, Star, Flame, Trophy, History as HistoryIcon, AlertCircle, X, Award, LogOut, CheckSquare, Square, Shield, MoreHorizontal, Trash2, FileText, ListChecks, HelpCircle, AlertTriangle, Calendar, Search, ChevronDown, Send, RotateCcw, Settings, Mic, Gavel, ArrowRight, Users, ClipboardList, Loader2, Tag, MessageSquare, Wand2, User, Printer, Mail, FileDown } from "lucide-react";

// ── Storage ───────────────────────────────────────────────────────────────────
const STORAGE_KEY = "work-hub-v4";
const defaultData = {
  items: [], parkingLot: [], spirals: [], lastCheckIn: null, energy: null, mood: null, checkInNote: "",
  xp: 0, streak: 0, lastStreakDate: null,
  oneOnOneHistory: [], // [{ id, date, summary, items: [{title,status}], topics: [], note }]
  reminders: [], // [{ id, text, type: "quick"|"item"|"recurring", itemId?, recurring?, time?, dismissed: false, createdAt, suggested: bool }]
  lastReminderScan: 0, // timestamp of last AI scan
  dismissedReminderSuggestions: [], // lowercased texts the user said no to (don't re-suggest)
  roadmapHistory: [], // [{ id, date: "YYYY-MM-DD", energy, mood, headline, greeting, slots: [...], todayAdvice, protectedTime, completedSlots: [idx], capturedAt }]
  meetings: [], // [{ id, slotLabel, title, date, vibe, energy, situation, whoWith, generated, notes, createdAt, completedAt }]
  recurringMeetings: [], // [{ id, title, dayOfWeek: 0-6 | "daily", startTime: "HH:MM", durationMin, note }]
  scheduledMeetings: [], // [{ id, title, date: "YYYY-MM-DD", startTime: "HH:MM", durationMin, note, createdAt }] — one-off meetings the user has logged ahead of time
  threads: [
    // Running threads with key people — capture ideas/updates between sync points.
    // Tagging happens at REVIEW time (batched, before 1:1) to keep API usage low.
    // Shape per entry: { id, text, createdAt, tag?, urgency?, reviewedAt?, action?: "send"|"discuss"|"skip", urgentSelf?: bool, linkedItemId? }
    { id: "thread-josh", name: "Josh", role: "Manager (1:1 every 2 weeks)", entries: [], lastReviewedAt: null, createdAt: Date.now() },
  ],
  // AI Policy compliance — Fort Financial Acceptable Use Policy (Lexy co-authored)
  // tracks daily banner dismissal so it shows once per day max.
  policyBannerLastDismissed: null,
  // Agent activity log — populated when agents arrive. Each entry:
  // { id, agentType, taskId, taskTitle, ranAt, status: "draft"|"copied"|"discarded", outputSummary, hadReviewNotes }
  // Kept capped at 200 most recent by pruneDataForStorage so it stays small.
  agentLog: [],
  // Weekly observations — populated by Rosie each Monday morning, surfaced
  // until user dismisses or week rolls over. Shape: { weekOf: "YYYY-MM-DD", observations: [{ id, text, category, severity }], generatedAt, dismissed }
  weeklyObservations: null,
};

// One-time seed items — added on load if not already present (match by title).
// Safe to re-run; won't duplicate.
const SEED_ITEMS = [
  {
    title: "Build backlog / project status flow",
    priority: "low",
    status: "todo",
    why: "Need a clear automated path for Not Moving Forward, On Hold, and Deferred statuses",
    tasks: [
      "Map out all 3 status branches (Not Moving Forward, On Hold, Deferred) from Visio",
      "Set up automated email for 'Not Moving Forward' with team comments included",
      "Build 'On Hold' flow: move to backlog, create backlog record, link to request record",
      "Set up automated email to requestor for On Hold items",
      "Build auto-trigger reminder sent on Next Review Date",
      "Build 'Deferred' flow: stay queued, admin sets new review date, update backlog notes",
      "Set up automated email to requestor for Deferred items",
      "Build auto-escalation alert to admin when review date passes",
      "Build admin review screen to change project status from backlog",
      "Test each status path end-to-end",
    ],
  },
  {
    title: "Portal license mapping",
    priority: "low",
    status: "todo",
    why: "",
    tasks: [],
  },
];

function seedItemsIfMissing(data) {
  let working = [...(data.items || [])];
  let migrated = false;

  // Dedup items with identical titles — keep the first occurrence (often the one with most data)
  const seenTitles = new Set();
  const deduped = [];
  for (const item of working) {
    const key = String(item.title || "").trim().toLowerCase();
    if (!key || !seenTitles.has(key)) {
      seenTitles.add(key);
      deduped.push(item);
    } else {
      migrated = true; // force a save so dedup sticks
    }
  }
  working = deduped;

  // Migrate per-item parking lots into the global parking lot, then strip from items
  const migratedParkings = [];
  working = working.map(i => {
    if (Array.isArray(i.parkingLot) && i.parkingLot.length) {
      migrated = true;
      i.parkingLot.forEach(idea => migratedParkings.push(idea));
      const { parkingLot, ...rest } = i;
      return rest;
    }
    return i;
  });
  const globalParking = migratedParkings.length
    ? [...(data.parkingLot || []), ...migratedParkings.filter(x => !(data.parkingLot || []).includes(x))]
    : (data.parkingLot || []);

  // Migrate per-item spirals into global spirals (strip itemId so they surface in Brain Dump)
  let globalSpirals = data.spirals || [];
  if (globalSpirals.some(s => s.itemId)) {
    migrated = true;
    globalSpirals = globalSpirals.map(s => s.itemId ? { ...s, itemId: null } : s);
  }

  // Back-fill dates for any existing active items that lack one (skip TBD items — they have no date on purpose)
  let backfilled = false;
  working = working.map(i => {
    if (isActiveStatus(i.status) && !i.scheduledDate && !i.tbd) {
      backfilled = true;
      const d = estimateDateForNewItem(i.priority || "medium", working);
      return { ...i, scheduledDate: d, dateSource: "estimated", dateFixed: !!i.dateFixed };
    }
    return i;
  });

  const norm = t => String(t || "").trim().toLowerCase();
  const existingTitles = new Set(working.map(i => norm(i.title)));
  const deletedSeedTitles = new Set((data.deletedSeedTitles || []).map(norm));
  const toAdd = SEED_ITEMS
    .filter(s => !existingTitles.has(norm(s.title)))
    .filter(s => !deletedSeedTitles.has(norm(s.title)))
    .map(s => ({
      id: uid(),
      title: s.title,
      priority: s.priority,
      status: s.status,
      why: s.why,
      tasks: s.tasks,
      taskTimes: s.tasks.map(() => 15),
      completedTasks: [],
      noteLog: [],        // B2 — task-level timestamped note log (detour tracking)
      taskNoteLogs: {},   // C  — per-subtask note logs, keyed by subtask text
      category: "",
      done: "",
      outOfScope: "",
      notes: "",
      timeEstimate: "",
      scheduledDate: "",
      dateFixed: false,
      dateSource: "",
      createdAt: Date.now(),
    }));
  if (!toAdd.length && !backfilled && !migrated) return { ...data, deletedSeedTitles: data.deletedSeedTitles || [] };
  // Assign dates to new seeded items, spreading them out (they are added to `working` once)
  toAdd.forEach(item => {
    const d = estimateDateForNewItem(item.priority || "medium", working);
    working.push({ ...item, scheduledDate: d, dateSource: "estimated" });
  });
  return { ...data, items: working, parkingLot: globalParking, spirals: globalSpirals, deletedSeedTitles: data.deletedSeedTitles || [] };
}

// Data version + migration framework. Each save stamps data.dataVersion;
// each load runs migrations from the stored version up to CURRENT. Add
// entries to migrationTable only when actual field shapes change (not
// every release). This prevents silent data loss when shapes evolve.
const CURRENT_DATA_VERSION = 1;
const migrationTable = {
  // Example for future use:
  // 1: (data) => ({ ...data, newField: derivedFromOld(data.oldField) }),
};
function migrateData(rawData) {
  if (!rawData || typeof rawData !== "object") return rawData;
  let data = rawData;
  const fromVersion = data.dataVersion || 0;
  for (let v = fromVersion; v < CURRENT_DATA_VERSION; v++) {
    const migrate = migrationTable[v + 1];
    if (typeof migrate === "function") {
      try {
        data = migrate(data) || data;
      } catch (e) {
        console.error(`[work-hub] migration v${v} → v${v+1} FAILED:`, e);
      }
    }
  }
  data.dataVersion = CURRENT_DATA_VERSION;
  return data;
}

async function loadFromStorage() {
  try {
    const r = await window.storage.get(STORAGE_KEY);
    if (!r) return { ...defaultData, dataVersion: CURRENT_DATA_VERSION };
    const parsed = JSON.parse(r.value);
    const migrated = migrateData(parsed);
    return { ...defaultData, ...migrated };
  } catch (e) { console.error("[work-hub] loadFromStorage FAILED:", e); return { ...defaultData, dataVersion: CURRENT_DATA_VERSION }; }
}

// ── Dev tooling: exportHubBackup ──
// Downloads a dated JSON snapshot of the full hub state. Wired to a window
// hook below so it can be called from the browser console as exportHubBackup().
// Useful as a one-call backup before destructive changes or as a sanity check.
function exportHubBackup(data) {
  try {
    const json = JSON.stringify(data, null, 2);
    const date = new Date().toISOString().slice(0, 10);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `work-hub-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("[work-hub] exportHubBackup FAILED:", e);
  }
}
// In-memory cache of the last-saved items array (for bulletproof protection).
// We use this to detect when a save would unexpectedly drop a lot of items.
let __lastSavedItemsCount = null;

// Prunes unbounded arrays so the persisted blob doesn't grow forever.
// These are all "history-style" collections that accumulate over months
// of use. We keep enough recent context for the app to feel continuous
// (recent meetings, recent journal entries, recent chats) without storing
// every detail forever. Tunables are at the top so they can be loosened if
// any limit feels too aggressive.
function pruneDataForStorage(data) {
  if (!data || typeof data !== "object") return data;
  const PRUNE_LIMITS = {
    meetings: 150,                  // most recent N meeting logs
    scheduledOneOffsDays: 90,       // how many days back to keep one-off meetings/appointments
    spirals: 100,                   // most recent N spiral journal entries
    chatMessagesPerEntry: 60,       // last N back-and-forth messages per thread entry
    reviewedThreadEntries: 200,     // reviewed entries kept per thread (unreviewed always kept)
    agentLog: 200,                  // most recent N agent activity entries
  };
  const cutoffMs = Date.now() - PRUNE_LIMITS.scheduledOneOffsDays * 24 * 60 * 60 * 1000;
  const next = { ...data };

  // meetings — sort by date desc, keep top N
  if (Array.isArray(next.meetings) && next.meetings.length > PRUNE_LIMITS.meetings) {
    next.meetings = [...next.meetings]
      .sort((a, b) => {
        const ta = a?.startedAt || a?.createdAt || (a?.date ? new Date(a.date).getTime() : 0);
        const tb = b?.startedAt || b?.createdAt || (b?.date ? new Date(b.date).getTime() : 0);
        return tb - ta;
      })
      .slice(0, PRUNE_LIMITS.meetings);
  }

  // scheduledMeetings — drop entries older than the cutoff
  if (Array.isArray(next.scheduledMeetings)) {
    next.scheduledMeetings = next.scheduledMeetings.filter(m => {
      if (!m?.date) return true; // no date = today's, keep
      const t = new Date(m.date).getTime();
      return !Number.isFinite(t) || t >= cutoffMs;
    });
  }

  // spirals — keep last N (assuming append order is chronological)
  if (Array.isArray(next.spirals) && next.spirals.length > PRUNE_LIMITS.spirals) {
    next.spirals = next.spirals.slice(-PRUNE_LIMITS.spirals);
  }

  // runningThreads — per-entry chat history + per-thread reviewed entry cap
  if (Array.isArray(next.runningThreads)) {
    next.runningThreads = next.runningThreads.map(t => {
      if (!Array.isArray(t?.entries)) return t;
      // Cap reviewed entries per thread; always keep unreviewed.
      const reviewed = t.entries.filter(e => e?.reviewedAt);
      const unreviewed = t.entries.filter(e => !e?.reviewedAt);
      const keepReviewed = reviewed.length > PRUNE_LIMITS.reviewedThreadEntries
        ? reviewed
            .sort((a, b) => (b.reviewedAt || 0) - (a.reviewedAt || 0))
            .slice(0, PRUNE_LIMITS.reviewedThreadEntries)
        : reviewed;
      const allEntries = [...unreviewed, ...keepReviewed];
      // Cap chat history per entry
      const prunedEntries = allEntries.map(e => {
        if (!Array.isArray(e?.chat) || e.chat.length <= PRUNE_LIMITS.chatMessagesPerEntry) return e;
        return { ...e, chat: e.chat.slice(-PRUNE_LIMITS.chatMessagesPerEntry) };
      });
      return { ...t, entries: prunedEntries };
    });
  }

  // agentLog — keep last N entries (chronological order)
  if (Array.isArray(next.agentLog) && next.agentLog.length > PRUNE_LIMITS.agentLog) {
    next.agentLog = next.agentLog.slice(-PRUNE_LIMITS.agentLog);
  }

  return next;
}

async function saveToStorage(data) {
  try {
    // ── BULLETPROOF ITEMS PROTECTION ──
    // Before saving, check if this save would drop more than 1 item compared to
    // the last-known-good state. If so, write the prior state to a backup key
    // first so the user can recover from accidental data loss.
    const newItemsCount = Array.isArray(data?.items) ? data.items.length : 0;
    if (typeof window !== "undefined" && window.storage) {
      try {
        const lastKnown = __lastSavedItemsCount;
        const wouldDropManyItems = lastKnown !== null && (lastKnown - newItemsCount) > 1;

        if (wouldDropManyItems) {
          // Read the CURRENT stored data and snapshot it as a backup before overwriting
          try {
            const current = await window.storage.get(STORAGE_KEY);
            if (current && current.value) {
              const backupKey = `${STORAGE_KEY}-items-backup-${Date.now()}`;
              await window.storage.set(backupKey, current.value);
              console.warn(`[items guard] save would drop ${lastKnown - newItemsCount} items — backed up prior state to ${backupKey}`);
            }
          } catch (e) { /* backup is best-effort */ }
        }

        // Always write a "rolling latest backup" of items only — small, fast,
        // gives us a recovery target if the main store gets corrupted.
        if (Array.isArray(data?.items) && data.items.length > 0) {
          await window.storage.set(`${STORAGE_KEY}-items-rolling-backup`, JSON.stringify({
            items: data.items,
            savedAt: Date.now(),
            count: data.items.length,
          }));
        }

        // Rolling backup for meetings (recurring + scheduled). Mirrors the
        // items backup logic: only writes when at least one collection has
        // entries, so a transient empty state doesn't overwrite a known-good
        // backup. The RecurringMeetingsModal + scheduled meetings UI can
        // read this to detect + restore lost data.
        const hasRecurring = Array.isArray(data?.recurringMeetings) && data.recurringMeetings.length > 0;
        const hasScheduled = Array.isArray(data?.scheduledMeetings) && data.scheduledMeetings.length > 0;
        if (hasRecurring || hasScheduled) {
          await window.storage.set(`${STORAGE_KEY}-meetings-rolling-backup`, JSON.stringify({
            recurringMeetings: data.recurringMeetings || [],
            scheduledMeetings: data.scheduledMeetings || [],
            savedAt: Date.now(),
          }));
        }

        // Backup coverage gap fix — also back up reminders and preferences.
        // These can be lost silently same way IT Sync was. Recovery target
        // for any future silent wipe. Same non-empty gating as other backups.
        const hasReminders = Array.isArray(data?.reminders) && data.reminders.length > 0;
        const hasPreferences = data?.preferences && Object.keys(data.preferences).length > 0;
        if (hasReminders || hasPreferences) {
          await window.storage.set(`${STORAGE_KEY}-misc-rolling-backup`, JSON.stringify({
            reminders: data.reminders || [],
            preferences: data.preferences || {},
            savedAt: Date.now(),
          }));
        }
      } catch (e) { /* backup never blocks main save */ }
    }
    // Prune unbounded collections before serializing the main blob. The
    // rolling backups above intentionally use the un-pruned data so nothing
    // is lost — pruning only affects the live working state going forward.
    const prunedData = pruneDataForStorage(data);
    await window.storage.set(STORAGE_KEY, JSON.stringify(prunedData));
    __lastSavedItemsCount = newItemsCount;
    // Dispatch a global event so the storage health indicator can update
    // its "saved Xs ago" display. Catch in case CustomEvent isn't available.
    try {
      if (typeof window !== "undefined" && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent("work-hub-autosaved", { detail: { at: Date.now() } }));
      }
    } catch (e) { /* event dispatch best-effort */ }
  } catch (e) { console.error("[work-hub] saveToStorage FAILED:", e); }
}

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUSES = [
  { key: "todo",       label: "To Do",             color: "#c4a882", bg: "rgba(196,168,130,0.15)" },
  { key: "inprogress", label: "In Progress",       color: "#d4829a", bg: "rgba(212,130,154,0.15)" },
  { key: "blocked",    label: "Blocked",           color: "#c47e8a", bg: "rgba(196,126,138,0.15)" },
  { key: "hold",       label: "On Hold",           color: "#9878b8", bg: "rgba(184,160,212,0.15)" },
  { key: "waiting",    label: "Waiting on Reply",  color: "#9a7850", bg: "rgba(196,168,130,0.2)" },
  { key: "parked",     label: "Parked",            color: "#7d9aaf", bg: "rgba(125,154,175,0.15)" },
  { key: "done",       label: "Done",              color: "#9eb89a", bg: "rgba(158,184,154,0.18)" },
  { key: "cancelled",  label: "Cancelled",         color: "#a89e94", bg: "rgba(168,158,148,0.18)" },
];
// Terminal statuses — items in these states aren't actionable and should be
// excluded from "active" views. Centralized here so future terminal statuses
// (parked, archived, etc.) get added once instead of in 15+ filter sites.
// Note: 'parked' is NOT terminal — parked items have a return date and resurface
// when that date arrives. Treated as a deferred-active status.
const TERMINAL_STATUSES = new Set(["done", "cancelled"]);
function isTerminalStatus(status) { return TERMINAL_STATUSES.has(status); }
function isActiveStatus(status) { return !TERMINAL_STATUSES.has(status); }
const statusMap = Object.fromEntries(STATUSES.map(s => [s.key, s]));

const ENERGY_LEVELS = [
  { key: "high",   label: "High Energy", emoji: "⚡",  color: "#d4829a", desc: "Feeling sharp and capable" },
  { key: "medium", label: "Steady",      emoji: "🌸", color: "#c4a882", desc: "Okay, getting through it" },
  { key: "low",    label: "Low Energy",  emoji: "🌿", color: "#9eb89a", desc: "Running on fumes today" },
  { key: "rough",  label: "Rough Day",   emoji: "🌧️", color: "#a09ab8", desc: "Just surviving right now" },
];

const MOODS = [
  { key: "focused",     emoji: "🎯", label: "Focused" },
  { key: "anxious",     emoji: "🌀", label: "Anxious" },
  { key: "overwhelmed", emoji: "🌊", label: "Overwhelmed" },
  { key: "motivated",   emoji: "✨", label: "Motivated" },
  { key: "flat",        emoji: "😶", label: "Flat" },
  { key: "scattered",   emoji: "💨", label: "Scattered" },
  { key: "frustrated",  emoji: "😤", label: "Frustrated" },
  { key: "tired",       emoji: "💤", label: "Tired" },
  { key: "quiet",       emoji: "🌙", label: "Quiet" },
  { key: "foggy",       emoji: "🌫️", label: "Foggy" },
];

const ENCOURAGEMENTS = [
  "You're doing better than you think 🌸",
  "One thing at a time. That's enough.",
  "Finished > perfect. Always.",
  "Your brain works differently. That's a feature.",
  "You showed up today. That counts.",
  "Small wins stack up. Keep going ✦",
  "KISS: Keep it simple, stay sane 🌿",
  "Done is done. Move on with pride.",
  "You're not behind. You're exactly where you are.",
  "Clarity > complexity. Every time.",
  "Rest is productive. Don't forget that.",
  "You handled hard things before. You'll handle this.",
];

const XP_REWARDS = { task: 10, item: 50, checkin: 20, streak: 30 };

let _id = Date.now();
const uid = () => (++_id).toString(36);
const fmtMins = (m) => m >= 60 ? `${Math.floor(m/60)}h${m%60>0?` ${m%60}m`:""}` : `${m}m`;
const fmtTime = (date) => date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const xpForLevel = (xp) => { const lvl = Math.floor(Math.sqrt(xp/50))+1; return { level: lvl, progress: (xp%(lvl*50))/(lvl*50) }; };

// Move element at `from` to `to` in array, return new array
const arrayMove = (arr, from, to) => {
  const next = [...arr];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

// Reorder tasks AND their parallel arrays (taskTimes) inside an item
const reorderItemTasks = (item, from, to) => {
  if (from === to) return item;
  const tasks = arrayMove(item.tasks || [], from, to);
  const taskTimes = item.taskTimes && item.taskTimes.length === (item.tasks || []).length
    ? arrayMove(item.taskTimes, from, to)
    : item.taskTimes;
  // taskParents references original indices, so when we move tasks we need to
  // rewrite parent pointers to track the new positions.
  let taskParents = item.taskParents;
  if (Array.isArray(taskParents) && taskParents.length === (item.tasks || []).length) {
    // Build old→new index map
    const order = (item.tasks || []).map((_, i) => i);
    const newOrder = arrayMove(order, from, to);
    const oldToNew = {};
    newOrder.forEach((oldIdx, newIdx) => { oldToNew[oldIdx] = newIdx; });
    // Reorder the array AND remap parent indices
    taskParents = arrayMove(taskParents, from, to).map(p => p == null ? null : (oldToNew[p] ?? null));
  }
  return { ...item, tasks, taskTimes, ...(taskParents ? { taskParents } : {}) };
};

// ── Subtask helpers ──
// Tasks live in a flat array; subtask relationships are tracked via a parallel
// taskParents array. taskParents[i] === null (or undefined) means top-level;
// taskParents[i] === <number> means it's a subtask of the task at that index.
// We only support ONE level of nesting (no sub-subtasks) to keep the UI simple.

// Returns null for top-level, or the parent's array index for a subtask
function getTaskParent(item, i) {
  const parents = item?.taskParents || [];
  const p = parents[i];
  return (typeof p === "number" && p >= 0 && p < (item.tasks || []).length) ? p : null;
}

// Returns array of original indices that are children of parentIdx
function getTaskChildren(item, parentIdx) {
  const tasks = item?.tasks || [];
  const parents = item?.taskParents || [];
  const out = [];
  for (let i = 0; i < tasks.length; i++) {
    if (parents[i] === parentIdx) out.push(i);
  }
  return out;
}

// Ensures item.taskParents has the same length as item.tasks. New entries are
// added as null (top-level) by default. Used after bulk-add operations like
// paste-list, brain-dump → task conversion, AI task suggestions, etc., which
// append to tasks/taskTimes/taskDates but don't know about taskParents.
function alignTaskParents(item) {
  const tasks = item?.tasks || [];
  const oldParents = item?.taskParents || [];
  if (oldParents.length === tasks.length && oldParents.every(p => p === null || typeof p === "number")) {
    return item; // already aligned
  }
  const taskParents = [];
  for (let i = 0; i < tasks.length; i++) {
    const p = oldParents[i];
    taskParents.push(typeof p === "number" ? p : null);
  }
  return { ...item, taskParents };
}

// Returns true if task at index i is a subtask of any other task
function isSubtask(item, i) {
  return getTaskParent(item, i) !== null;
}

// Adds a new subtask under parent (returns updated item).
// New subtask is appended to the END of the tasks array; rendering groups it
// under its parent regardless of position.
function addSubtaskToItem(item, parentIdx, title, defaultMinutes = 15) {
  const tasks = [...(item.tasks || []), title];
  const taskTimes = [...(item.taskTimes || []), defaultMinutes];
  const taskDates = [...(item.taskDates || []), { date: "", notToday: false, fixed: false }];
  // Pad existing taskParents to length of old tasks, then append parentIdx
  const oldParents = item.taskParents || [];
  const taskParents = [];
  for (let i = 0; i < (item.tasks || []).length; i++) {
    taskParents.push(typeof oldParents[i] === "number" ? oldParents[i] : null);
  }
  taskParents.push(parentIdx);
  return { ...item, tasks, taskTimes, taskDates, taskParents };
}

// Remove a task AND all its descendants. Returns updated item with parallel
// arrays + parent index references repaired.
function removeTaskWithDescendants(item, idx) {
  const tasks = item?.tasks || [];
  const parents = item?.taskParents || [];
  // Find all indices to remove (the task + any direct children)
  const toRemove = new Set([idx]);
  for (let i = 0; i < tasks.length; i++) {
    if (parents[i] === idx) toRemove.add(i);
  }
  // Remove from tasks/taskTimes/taskDates/taskParents (preserve parallel order)
  const newTasks = []; const newTimes = []; const newDates = []; const newParents = [];
  // Build old→new index map (for remapping remaining parent pointers)
  const oldToNew = {};
  let nIdx = 0;
  for (let i = 0; i < tasks.length; i++) {
    if (toRemove.has(i)) continue;
    oldToNew[i] = nIdx;
    nIdx++;
  }
  for (let i = 0; i < tasks.length; i++) {
    if (toRemove.has(i)) continue;
    newTasks.push(tasks[i]);
    newTimes.push((item.taskTimes || [])[i] ?? 15);
    newDates.push((item.taskDates || [])[i] ?? { date: "", notToday: false, fixed: false });
    const p = parents[i];
    newParents.push(typeof p === "number" && p in oldToNew ? oldToNew[p] : null);
  }
  // completedTasks is a string array — drop any titles that match removed tasks
  const removedTitles = new Set([...toRemove].map(i => tasks[i]));
  const newCompleted = (item.completedTasks || []).filter(t => !removedTitles.has(t));
  // Drop completion-date stamps for removed tasks too
  const newDateMap = Object.fromEntries(
    Object.entries(item.completedTaskDates || {}).filter(([k]) => !removedTitles.has(k))
  );
  // Drop note-logs for removed subtasks too
  const newNoteLogs = Object.fromEntries(
    Object.entries(item.taskNoteLogs || {}).filter(([k]) => !removedTitles.has(k))
  );
  return { ...item, tasks: newTasks, taskTimes: newTimes, taskDates: newDates, taskParents: newParents, completedTasks: newCompleted, completedTaskDates: newDateMap, taskNoteLogs: newNoteLogs };
}

// Self-healing hook: if an item has tasks without matching taskTimes (legacy data),
// pad with defaults immediately so UI renders, and silently ask Rosie to estimate
// the missing ones in the background. Runs once per item id.
function useTaskTimeHeal(item, onUpdate) {
  const healedRef = useRef(new Set());
  useEffect(() => {
    if (!item?.id || !item.tasks?.length) return;
    const tasks = item.tasks;
    const times = item.taskTimes || [];
    if (times.length >= tasks.length) return;
    if (healedRef.current.has(item.id)) return;
    healedRef.current.add(item.id);

    // Step 1: pad with 15m placeholders immediately so UI shows something
    const padded = [...times];
    while (padded.length < tasks.length) padded.push(15);
    const missingIdxs = [];
    for (let i = times.length; i < tasks.length; i++) missingIdxs.push(i);
    onUpdate({ ...item, taskTimes: padded });

    // Step 2: in the background, ask Rosie to estimate just the missing tasks
    (async () => {
      try {
        const missingTasks = missingIdxs.map(i => tasks[i]);
        const estimates = await estimateTaskTimes(missingTasks, item.title);
        const finalTimes = [...padded];
        missingIdxs.forEach((idx, j) => {
          const v = Number(estimates?.[j]);
          if (v && v > 0) finalTimes[idx] = v;
        });
        onUpdate({ ...item, taskTimes: finalTimes });
      } catch {}
    })();
  }, [item?.id, item?.tasks?.length, item?.taskTimes?.length]);
}

// ── Parse pasted list into structured items ───────────────────────────────────
// Detect hierarchy in pasted text. Returns array of {title, date?, subtasks: []}
// where subtasks is itself array of {title, date?}.
//
// Supported markup the user might use:
//   "Task title: Foo"     → new TOP-LEVEL task "Foo"
//   "Task: Bar"           → new TOP-LEVEL task "Bar" (treated as another top-level,
//                           since we only support 1 level of nesting in the data model)
//   "Tasks:" / "Sub Tasks:" / "Sub tasks:"  → header marker — following bullets
//                           become children of the current top-level
//   "- item" / "* item" / "• item"  → bullet, child of current top-level
//   plain line under a "Tasks:" header → child of current top-level
//   plain line with NO context → treated as a top-level
//
// Returns flat-compatible shape: callers that ignore .subtasks still get titles.
// Pulls trailing date + duration metadata out of a raw pasted task title,
// leaving a clean title. Returns { cleanTitle, date, durationMin }.
// Handles patterns like:
//   "Send invite — 5/31/2026"            → date 2026-05-31
//   "Draft agenda — 45 min, 6/30/2026"   → durationMin 45, date 2026-06-30
//   "Review (1h, due 7/15)"              → durationMin 60, date <currentYear>-07-15
//   "Status meeting 1:30"                → durationMin 90
// Conservative: only extracts when clearly delimited; if extraction would empty
// the title, falls back to the raw string unchanged.
function extractDateAndDuration(rawTitle) {
  let t = String(rawTitle || "").trim();
  if (!t) return { cleanTitle: t, date: null, durationMin: null };

  let date = null;
  let durationMin = null;

  // ── DATE: M/D/YYYY, M-D-YYYY, M/D/YY, with optional "due" / "by" prefix ──
  // We scan for the LAST occurrence so titles with embedded month names
  // (e.g. "May: Create Charter — 5/31/2026") still extract correctly.
  const dateRe = /(?:^|[\s,;:—\-(])(?:due\s+|by\s+)?(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?(?=\s|$|[,;)])/gi;
  let lastDateMatch = null;
  let m;
  while ((m = dateRe.exec(t)) !== null) {
    lastDateMatch = { match: m, start: m.index, end: m.index + m[0].length };
  }
  if (lastDateMatch) {
    const [whole, mm, dd, yy] = lastDateMatch.match;
    const month = parseInt(mm, 10);
    const day = parseInt(dd, 10);
    let year = yy ? parseInt(yy, 10) : new Date().getFullYear();
    if (year < 100) year += 2000;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2020 && year <= 2099) {
      date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      // Strip the matched substring (preserve any leading space char if it was the delimiter)
      const leading = whole.match(/^\s/) ? " " : "";
      t = (t.substring(0, lastDateMatch.start) + leading + t.substring(lastDateMatch.end)).trim();
    }
  }

  // ── DURATION: "45 min", "45min", "1 hr", "1h", "2h15m", "1:30" ──
  // Anchored to word boundary + unit word, or to HH:MM with a clear delimiter.
  const hmRe = /\b(\d+)\s*h(?:r|our|ours)?\s*(\d+)\s*m(?:in|inutes)?\b/i; // "2h15m"
  const hOnlyRe = /\b(\d+(?:\.\d+)?)\s*h(?:r|our|ours)?\b/i;              // "1 hr" / "2h"
  const mOnlyRe = /\b(\d+(?:\.\d+)?)\s*(?:m|min|minute|minutes)\b/i;       // "45 min"
  const colonRe = /(?:^|[\s—\-,;:])(\d{1,2}):(\d{2})\b/;                   // " 1:30"

  let durMatch = t.match(hmRe);
  if (durMatch) {
    durationMin = parseInt(durMatch[1], 10) * 60 + parseInt(durMatch[2], 10);
    t = t.replace(durMatch[0], " ");
  } else if ((durMatch = t.match(hOnlyRe))) {
    durationMin = Math.round(parseFloat(durMatch[1]) * 60);
    t = t.replace(durMatch[0], " ");
  } else if ((durMatch = t.match(mOnlyRe))) {
    durationMin = Math.round(parseFloat(durMatch[1]));
    t = t.replace(durMatch[0], " ");
  } else if ((durMatch = t.match(colonRe))) {
    const h = parseInt(durMatch[1], 10);
    const mins = parseInt(durMatch[2], 10);
    if (h <= 12 && mins < 60) {
      durationMin = h * 60 + mins;
      t = t.replace(durMatch[0], durMatch[0].startsWith(" ") || /^[—\-,;:]/.test(durMatch[0]) ? " " : "");
    }
  }

  // ── Cleanup: strip leftover separators, collapse whitespace ──
  t = t.replace(/\s+/g, " ").trim();
  // Trim trailing separator/punctuation runs left behind by the extraction
  t = t.replace(/[\s—\-–,;:|()]+$/g, "").trim();
  // Same for leading (unlikely but defensive)
  t = t.replace(/^[\s—\-–,;:|()]+/g, "").trim();

  // Safety: if we accidentally stripped everything, fall back to raw
  if (!t || t.length < 2) {
    return { cleanTitle: rawTitle.trim(), date: null, durationMin: null };
  }

  return { cleanTitle: t, date, durationMin };
}

function parseHierarchicalList(text) {
  const lines = String(text || "").split("\n").map(l => l.replace(/\r$/, "").trimEnd());
  const result = [];
  let currentTopLevel = null;
  let inListContext = false;

  // Strip a leading bullet/number marker ("- ", "* ", "• ", "1. ") and trim.
  // The number-marker regex requires at least one whitespace AFTER the period
  // or paren, so section-numbered titles like "1.8 Compare and contrast..."
  // or "4.2 Explain..." don't get their "1." / "4." prefix mangled into the
  // following digit. Only true bullet markers ("1. Task", "10) Task") strip.
  const stripBullet = (s) => s.replace(/^\s*[-*•]\s*/, "").replace(/^\s*\d+[.)]\s+/, "").trim();
  // Wrap any raw title we're about to push so trailing date/duration metadata
  // gets pulled into structured fields instead of being left in the title.
  const enrich = (rawTitle) => {
    const { cleanTitle, date, durationMin } = extractDateAndDuration(rawTitle);
    const out = { title: cleanTitle };
    if (date) out.date = date;
    if (durationMin) out.durationMin = durationMin;
    return out;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      // Blank line — end current sub-list context but keep the top-level open
      // in case more bullets follow without a re-header
      continue;
    }

    // "Task title: <name>" — clear top-level marker
    const titleMatch = line.match(/^Task\s*title\s*[:\-]\s*(.+)$/i);
    if (titleMatch) {
      currentTopLevel = { ...enrich(titleMatch[1].trim()), subtasks: [] };
      result.push(currentTopLevel);
      inListContext = false;
      continue;
    }

    // "Task: <name>" (without "title") — also a top-level (data model is 1 level deep,
    // so any "Task:" subgroup gets promoted to top-level too)
    const taskMatch = line.match(/^Task\s*[:\-]\s*(.+)$/i);
    if (taskMatch) {
      currentTopLevel = { ...enrich(taskMatch[1].trim()), subtasks: [] };
      result.push(currentTopLevel);
      inListContext = false;
      continue;
    }

    // Header lines like "Tasks:", "Sub Tasks:", "Sub tasks:", "Subtasks:" — switches
    // us into list context so following plain lines become children
    if (/^(Sub\s*)?Tasks?\s*:?\s*$/i.test(line)) {
      inListContext = true;
      continue;
    }

    // Bullet line — child of current top-level (or its own top-level if none)
    const bulletMatch = rawLine.match(/^\s*[-*•]\s+(.+)$/) || rawLine.match(/^\s*\d+[.)]\s+(.+)$/);
    if (bulletMatch) {
      const childTitle = bulletMatch[1].trim();
      if (currentTopLevel) {
        currentTopLevel.subtasks.push(enrich(childTitle));
      } else {
        // No parent — treat as top-level
        currentTopLevel = { ...enrich(childTitle), subtasks: [] };
        result.push(currentTopLevel);
      }
      inListContext = true;
      continue;
    }

    // Plain text line — depends on context
    const cleaned = stripBullet(line);
    if (!cleaned || cleaned.length < 2) continue;
    if (inListContext && currentTopLevel) {
      // Under a "Tasks:" header, treat as subtask
      currentTopLevel.subtasks.push(enrich(cleaned));
    } else {
      // Otherwise, treat as a new top-level
      currentTopLevel = { ...enrich(cleaned), subtasks: [] };
      result.push(currentTopLevel);
      inListContext = false;
    }
  }

  // Filter: drop top-levels with empty/garbage titles
  return result.filter(t => t.title && t.title.length >= 2 && t.title.length <= 200);
}

// Parse a pasted list into SUBTASKS (legacy flat shape) — used by FocusView's
// existing paste flow. Returns array of {title, date} only — no hierarchy.
// New callers should use parseHierarchicalList directly.
// Post-processor for parsed list output: detects entries that are just
// time estimates (e.g. "32 min", "1.5 hour", "45 minutes") and folds them
// into the previous entry's durationMin instead of leaving them as their
// own subtask. Common when pasting study guides / project plans where time
// estimates sit on their own line under each task. Recursively processes
// subtasks for hierarchical output.
function mergeTimeEstimates(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return entries;
  // Pure time pattern — must be ONLY a number + unit, no surrounding words.
  // Accepts: "32 min", "45 mins", "30 minutes", "1 hr", "1.5 hours", "2h", "30m".
  const TIME_RE = /^(\d+(?:\.\d+)?)\s*(min|mins|minutes?|hr|hrs|hour|hours|h|m)\.?\s*$/i;
  const result = [];
  for (const entry of entries) {
    const title = ((entry && entry.title) || "").trim();
    const match = title.match(TIME_RE);
    if (match && result.length > 0) {
      // Pure time entry — attach to the previous (non-time) entry.
      const num = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      const isHour = unit === "h" || unit.startsWith("hr") || unit.startsWith("hour");
      const minutes = Math.max(1, Math.round(isHour ? num * 60 : num));
      const prev = result[result.length - 1];
      // Only overwrite if previous doesn't already have a durationMin (the
      // first time-line wins; subsequent stray time-lines get ignored).
      if (!prev.durationMin) {
        result[result.length - 1] = { ...prev, durationMin: minutes };
      }
      continue;
    }
    // Not a time entry — keep it, and recursively merge any nested subtasks.
    const out = { ...entry };
    if (Array.isArray(entry.subtasks) && entry.subtasks.length > 0) {
      out.subtasks = mergeTimeEstimates(entry.subtasks);
    }
    result.push(out);
  }
  return result;
}

// ── parsePasteList — shared parse pipeline for both paste modals ──────────────
// Single entry point used by PasteListModal (all three modes) and
// PasteTaskListModal (tasks mode). Error copy stays in the modals; this only
// parses.
//   mode "items"     → parseListToItems
//   mode "reminders" → parseListToTasks with reminder-flavored context
//                      (no hierarchical pass, no time-estimate merge)
//   mode "tasks"     → hierarchical-first, flat fallback (normalized with
//                      empty .subtasks), then mergeTimeEstimates to fold pure
//                      "32 min"-style lines into the previous entry.
async function parsePasteList(text, mode, parentTitle = "") {
  if (mode === "items") {
    return await parseListToItems(text);
  }
  if (mode === "reminders") {
    return await parseListToTasks(text, "(reminders to remember, not action items)");
  }
  // mode === "tasks"
  const hier = parseHierarchicalList(text);
  let tasks;
  if (hier.length >= 1) {
    // Use hierarchical structure directly (each entry has .subtasks)
    tasks = hier;
  } else {
    // Fall back to flat parsing for ambiguous input
    const flat = await parseListToTasks(text, parentTitle || "");
    tasks = flat.map(t => ({ ...t, subtasks: [] }));
  }
  return mergeTimeEstimates(tasks);
}

async function parseListToTasks(pastedText, parentItemTitle = "") {
  // Try hierarchical first — if there's clear structure, flatten to top-level only
  const hier = parseHierarchicalList(pastedText);
  if (hier.length >= 2) {
    // Flatten: top-level only (subtasks are dropped in flat mode for backward compat)
    return hier.map(t => ({ title: t.title, date: null }));
  }

  // Otherwise fall back to the original list parser
  const det = detectAndParseList(pastedText);
  if (det && det.entries && det.entries.length >= 2) {
    return det.entries.map(e => ({ title: e.taskTitle, date: e.date || null }));
  }

  // AI fallback for messier/free-form lists
  const systemPrompt = [
    "You parse a messy pasted list into clean subtasks for Lexy (Project Coordinator, Implementation team at Fort Financial Credit Union).",
    parentItemTitle ? `These subtasks belong to the parent item: "${parentItemTitle}"` : "",
    "",
    "Return ONLY a JSON array of strings, no markdown, no preamble. Example:",
    '["Review draft", "Send to Josh for approval", "Schedule kickoff"]',
    "",
    "RULES:",
    "- Each subtask: action-oriented, under 70 chars, clear.",
    "- If the input has lead-in phrases like 'add tasks for:' or 'sub tasks here;', strip them — only return the actual list items.",
    "- Split on natural separators: newlines, commas, semicolons, 'and'.",
    "- Don't invent tasks the user didn't mention.",
    "- Don't merge multiple subtasks into one — keep them separate.",
    "- Skip empty/single-character entries.",
  ].filter(Boolean).join("\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 800,
        system: systemPrompt,
        messages: [{ role: "user", content: pastedText }],
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const text = data.content?.find(b => b.type === "text")?.text || "[]";
    const cleaned = text.replace(/```json\s*|```\s*/g, "").trim();
    const arr = JSON.parse(cleaned);
    if (!Array.isArray(arr)) return [];
    return arr
      .map(s => typeof s === "string" ? { title: s.trim(), date: null } : null)
      .filter(t => t && t.title.length >= 2 && t.title.length <= 100);
  } catch (err) {
    console.warn("[parseListToTasks] failed:", err);
    return [];
  }
}

async function parseListToItems(pastedText) {
  const systemPrompt = [
    "You parse messy pasted work lists into structured items for Lexy (Project Coordinator, Implementation team at Fort Financial Credit Union). She works on Verafin, Zoho, Arkatechture, Movemint, and similar systems.",
    "",
    "Return ONLY a JSON array, no markdown fences. Each item:",
    '{"title":"short clear title","category":"optional 1-3 word category","priority":"high|medium|low","why":"optional 1-line context","tasks":["subtask 1","subtask 2"]}',
    "",
    "RULES:",
    "- Split multi-step items into tasks (e.g. 'review X then check Y then update Z' becomes 3 tasks).",
    "- Keep titles under 70 chars, clear and action-oriented.",
    "- If the item has 1 natural step, omit the tasks array.",
    "",
    "PRIORITY INFERENCE:",
    "- HIGH: urgent/blocker/deadline/ASAP/member-facing/compliance language",
    "- LOW: nice-to-have/eventually/someday/explore/cleanup language",
    "- MEDIUM: default when unclear",
    "",
    "CATEGORY INFERENCE (pick one when the work TYPE is clear):",
    "- 'Implementation' for system rollouts, new tool setup",
    "- 'Meeting Prep' for kickoffs, 1:1s, presentations",
    "- 'Training' for teaching/onboarding work",
    "- 'Documentation' for writing SOPs, guides, charters",
    "- 'Vendor Review' for evaluations, contracts, comparisons",
    "- 'Integration' for connecting systems",
    "- 'Process Improvement' for workflow cleanup",
    "- 'Reporting' for data pulls, metrics, dashboards",
    "- 'Testing' for QA, UAT, validation",
    "- Skip category if unclear — don't force a label.",
  ].join("\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: `Parse this into work items:\n\n${pastedText}` }],
    }),
  });
  const data = await res.json();
  const text = data.content?.find(b => b.type === "text")?.text || "[]";
  try {
    const arr = JSON.parse(text.replace(/```json|```/g, "").trim());
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

// ── Sprint Start Time Helpers ─────────────────────────────────────────────────
// Returns total ms elapsed while running (across resume cycles)
function sprintElapsedMs(item) {
  const accum = item.sprintPausedAccumMs || 0;
  if (item.sprintStartTime) return accum + (Date.now() - item.sprintStartTime);
  return accum;
}
// The *effective* moment the run would have started if time ran continuously
function sprintEffectiveStart(item) {
  return Date.now() - sprintElapsedMs(item);
}
function isSprintActive(item) { return !!item.sprintStartTime; }
function isSprintPaused(item) { return !item.sprintStartTime && (item.sprintPausedAccumMs || 0) > 0; }
function isSprintRunning(item) { return isSprintActive(item) || isSprintPaused(item); }

// ── Per-Subtask Timer Helpers ────────────────────────────────────────────────
// Mirrors the sprint timer pattern (startTime + pausedAccumMs) but per-subtask
// index. Stored on item.subtaskTimers[idx] = { startTime, pausedAccumMs,
// finalDurationMs }. finalDurationMs is frozen the moment a subtask is marked
// complete — even if the subtask is later unchecked, the recorded time stays.
// Only one subtask timer should be running at a time per item (enforced in
// the start handler), so switching subtasks auto-pauses whichever was active.
function getSubtaskTimer(item, idx) {
  return (item?.subtaskTimers && item.subtaskTimers[idx]) || null;
}
function subtaskElapsedMs(item, idx) {
  const t = getSubtaskTimer(item, idx);
  if (!t) return 0;
  if (typeof t.finalDurationMs === "number") return t.finalDurationMs;
  const accum = t.pausedAccumMs || 0;
  if (t.startTime) return accum + (Date.now() - t.startTime);
  return accum;
}
function isSubtaskTimerActive(item, idx) {
  const t = getSubtaskTimer(item, idx);
  return !!(t && t.startTime && typeof t.finalDurationMs !== "number");
}
function isSubtaskTimerPaused(item, idx) {
  const t = getSubtaskTimer(item, idx);
  return !!(t && !t.startTime && (t.pausedAccumMs || 0) > 0 && typeof t.finalDurationMs !== "number");
}
function isSubtaskTimerRunning(item, idx) {
  return isSubtaskTimerActive(item, idx) || isSubtaskTimerPaused(item, idx);
}
function hasFinalSubtaskTime(item, idx) {
  const t = getSubtaskTimer(item, idx);
  return !!(t && typeof t.finalDurationMs === "number");
}
// Format ms as a compact "Xh Ym" / "Ym Xs" / "Xs" display
function formatSubtaskDuration(ms) {
  if (!ms || ms < 1000) return "0s";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

function getTaskStartTime(item, idx) {
  if (!isSprintRunning(item)) return null;
  const effStart = sprintEffectiveStart(item);
  let offset = 0;
  for (let i = 0; i < idx; i++) offset += (item.taskTimes?.[i] || 15);
  return fmtTime(new Date(effStart + offset * 60000));
}
