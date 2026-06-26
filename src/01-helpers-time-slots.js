// ─────────────────────────────────────────────────────────────────────────────
// LANDMINE BASELINE — verify after every edit session. Patterns use [x]
// brackets so this doc block never matches its own greps.
//   1. Strict Babel parse: OK (sourceType module, jsx plugin)
//   2. Hook order violations: 0
//   3. grep -c 'curr[e]ntMinutes'            → 6  (was 4 pre-SlotRow extraction, 2026-06-11: +1 signature, +1 call site)
//   4. grep -c 'if (!l[o]aded) return;'      → 4
//   5. grep -c 'const \[linkP[i]ckerForSlot' → 1  (was 2 pre-LinkPicker refactor, 2026-06-10)
//   6. grep -c '"[|]"'  (pipe in dquotes)    → 9
//   7. grep -cow 's[e]c' (standalone word)   → 4
// If any count drifts unexpectedly mid-refactor: STOP, diagnose, then continue.
// ─────────────────────────────────────────────────────────────────────────────

// 01-helpers-time-slots.js
// Time/date helpers, meeting parsing, slot math, and the healSlots/canonicalizeSlots/ensure* pipeline.


// ── Morning Roadmap Generator ─────────────────────────────────────────────────
const TZ = "America/Indiana/Indianapolis"; // Fort Wayne EST

function getNowEST() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
}

function fmtTimeEST(date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: TZ });
}

// ── Work hours scheduling (9am-4:30pm EST, Mon-Fri) ──────────────────────────
const WORK_START_HOUR = 9; // 9:00 AM
const WORK_START_MIN = 0;
const WORK_END_HOUR = 16; // 4:30 PM
const WORK_END_MIN = 30;

function isWeekend(date) {
  const d = date.getDay();
  return d === 0 || d === 6; // Sunday or Saturday
}
function minutesSinceMidnight(date) {
  return date.getHours() * 60 + date.getMinutes();
}
// Minutes remaining in today's work window (0 if outside)
function workMinsLeftToday(estNow) {
  if (isWeekend(estNow)) return 0;
  const nowMins = minutesSinceMidnight(estNow);
  const startMins = WORK_START_HOUR * 60 + WORK_START_MIN;
  const endMins = WORK_END_HOUR * 60 + WORK_END_MIN;
  if (nowMins >= endMins) return 0;
  if (nowMins < startMins) return endMins - startMins; // before work: full day available
  return endMins - nowMins;
}
// Given current EST time and minutes of work needed, return when it will actually finish
// (only counts time during work hours; skips evenings, weekends)
function predictFinishEST(minsNeeded) {
  if (!minsNeeded || minsNeeded <= 0) return null;
  let cursor = new Date(getNowEST().getTime());
  let remaining = minsNeeded;

  // If currently outside work hours, advance cursor to next work-window start
  const advanceToNextWorkStart = () => {
    // If weekend or after end-of-day, jump to next weekday 9am
    if (isWeekend(cursor) || minutesSinceMidnight(cursor) >= (WORK_END_HOUR * 60 + WORK_END_MIN)) {
      cursor.setDate(cursor.getDate() + 1);
      while (isWeekend(cursor)) cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(WORK_START_HOUR, WORK_START_MIN, 0, 0);
    } else if (minutesSinceMidnight(cursor) < (WORK_START_HOUR * 60 + WORK_START_MIN)) {
      // Before work: jump to today 9am
      cursor.setHours(WORK_START_HOUR, WORK_START_MIN, 0, 0);
    }
  };

  advanceToNextWorkStart();

  // Consume minutes day-by-day until remaining is 0
  let safety = 0;
  while (remaining > 0 && safety < 60) {
    safety++;
    const mLeftToday = workMinsLeftToday(cursor);
    if (mLeftToday <= 0) { advanceToNextWorkStart(); continue; }
    if (remaining <= mLeftToday) {
      cursor = new Date(cursor.getTime() + remaining * 60000);
      remaining = 0;
    } else {
      remaining -= mLeftToday;
      // Jump to end of today (which advances to next work day next iteration)
      cursor.setHours(WORK_END_HOUR, WORK_END_MIN, 0, 0);
      advanceToNextWorkStart();
    }
  }
  return cursor;
}
// Nice label for a predicted finish Date — "ETA 2:15 PM", "ETA tomorrow 11 AM", "ETA Fri 10 AM"
function fmtFinishLabel(finish) {
  if (!finish) return "";
  const est = getNowEST();
  const sameDay = finish.toDateString() === est.toDateString();
  const tomorrow = new Date(est); tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = finish.toDateString() === tomorrow.toDateString();
  const timePart = finish.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (sameDay) return `ETA ${timePart}`;
  if (isTomorrow) return `ETA tomorrow ${timePart}`;
  // Within the next week: show weekday
  const diffDays = Math.round((finish - est) / 86400000);
  if (diffDays < 7) {
    const wd = finish.toLocaleDateString("en-US", { weekday: "short" });
    return `ETA ${wd} ${timePart}`;
  }
  const md = finish.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `ETA ${md} ${timePart}`;
}

// ── Date helpers (scheduled dates, grouping, auto-estimation) ────────────────
// All dates stored as YYYY-MM-DD strings (no timezone ambiguity for calendar dates)
function todayStr() {
  const n = getNowEST();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

// Count business days (Mon-Fri) elapsed since a timestamp. Used for "Waiting on Reply"
// status — we don't want to count weekend days when the recipient probably wasn't working.
// Returns 0 if waitingSince is in the future or invalid.
function businessDaysSince(timestamp) {
  if (!timestamp) return 0;
  const start = new Date(timestamp);
  if (isNaN(start)) return 0;
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (today <= start) return 0;
  let days = 0;
  const cursor = new Date(start);
  while (cursor < today) {
    cursor.setDate(cursor.getDate() + 1);
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) days++; // skip Sat (6) and Sun (0)
  }
  return days;
}

// Returns the recurring meetings that match TODAY's day of week.
// dayOfWeek can be 0-6 (Sun-Sat), or "daily" (all weekdays Mon-Fri).
// Format a recurring meeting's dayOfWeek field into a human-readable cadence
// label. Handles all the cadence types: daily, weekly, biweekly, monthly-by-day,
// monthly-by-weekday-ordinal. Used in both the main and overview recurring
// modals so the cadence shows consistently everywhere.
function formatRecurringDayOfWeek(dow) {
  if (dow === "daily") return "Daily (M-F)";
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (typeof dow === "string" && dow.startsWith("biweekly-")) {
    const n = Number(dow.split("-")[1]);
    return `Every other ${dayNames[n] || "?"}`;
  }

  if (typeof dow === "string" && dow.startsWith("monthly-day-")) {
    const part = dow.split("-")[2];
    if (part === "last") return "Last day of month";
    const n = Number(part);
    if (n === 1) return "1st of each month";
    if (n === 2) return "2nd of each month";
    if (n === 3) return "3rd of each month";
    return `${n}th of each month`;
  }

  if (typeof dow === "string" && dow.startsWith("monthly-")) {
    const parts = dow.split("-");
    if (parts.length === 3) {
      const ordinal = parts[1];
      const n = Number(parts[2]);
      const ordLabels = { first: "1st", second: "2nd", third: "3rd", fourth: "4th", last: "Last" };
      return `${ordLabels[ordinal] || ordinal} ${dayNames[n] || "?"} of month`;
    }
  }

  // Numeric / fallback — every week on this day
  return `Every ${dayNames[Number(dow)] || "?"}`;
}

// Returns true if a recurring meeting fires on the given date (Date object).
// Mirrors the logic of getRecurringMeetingsForToday, parameterized by date so
// it can be reused for forward-looking workload calculations.
function recurringMeetingFiresOn(m, dateObj) {
  if (!m || !dateObj || isNaN(dateObj)) return false;
  const dow = dateObj.getDay(); // 0=Sun..6=Sat
  const dayOfMonth = dateObj.getDate();
  const isoStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;

  if (m.notBefore && isoStr < m.notBefore) return false;
  if (m.anchorDate && isoStr < m.anchorDate) return false;
  if (m.dayOfWeek === "daily") return dow >= 1 && dow <= 5;

  if (typeof m.dayOfWeek === "string" && m.dayOfWeek.startsWith("biweekly-")) {
    const targetDow = Number(m.dayOfWeek.split("-")[1]);
    if (dow !== targetDow) return false;
    if (!m.anchorDate) return true;
    const anchor = new Date(m.anchorDate + "T00:00:00");
    if (isNaN(anchor)) return true;
    const diffDays = Math.floor((dateObj - anchor) / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    return diffWeeks >= 0 && diffWeeks % 2 === 0;
  }

  if (typeof m.dayOfWeek === "string" && m.dayOfWeek.startsWith("monthly-day-")) {
    const part = m.dayOfWeek.split("-")[2];
    if (part === "last") {
      const lastOfMonth = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();
      return dayOfMonth === lastOfMonth;
    }
    return dayOfMonth === Number(part);
  }

  if (typeof m.dayOfWeek === "string" && m.dayOfWeek.startsWith("monthly-")) {
    const parts = m.dayOfWeek.split("-");
    if (parts.length !== 3) return false;
    const ordinal = parts[1];
    const targetDow = Number(parts[2]);
    if (dow !== targetDow) return false;
    const ordMap = { first: 1, second: 2, third: 3, fourth: 4 };
    if (ordinal === "last") {
      const lastOfMonth = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();
      return dayOfMonth + 7 > lastOfMonth;
    }
    const n = ordMap[ordinal];
    if (!n) return false;
    return dayOfMonth >= (n - 1) * 7 + 1 && dayOfMonth <= n * 7;
  }

  return Number(m.dayOfWeek) === dow;
}

function getRecurringMeetingsForToday(recurringMeetings) {
  if (!Array.isArray(recurringMeetings) || recurringMeetings.length === 0) return [];
  const now = getNowEST();
  return recurringMeetings.filter(m => recurringMeetingFiresOn(m, now));
}

// Builds a per-date workload summary for Rosie's AI planner. For each weekday
// (Mon-Fri) between fromDateStr and toDateStr (inclusive, YYYY-MM-DD), counts:
//   - Items: active items already scheduled for that date (excluding the item
//     being planned, to avoid double-counting Rosie's own work)
//   - Meetings: recurring meetings that fire on that date
// Returned as: { "YYYY-MM-DD": { items: N, meetings: M } }
function buildWorkloadByDate(items, recurringMeetings, fromDateStr, toDateStr, excludeItemId) {
  const out = {};
  if (!fromDateStr || !toDateStr) return out;
  const fromObj = new Date(fromDateStr + "T12:00:00");
  const toObj = new Date(toDateStr + "T12:00:00");
  if (isNaN(fromObj) || isNaN(toObj) || toObj < fromObj) return out;
  const cursor = new Date(fromObj);
  let safety = 0;
  while (cursor <= toObj && safety++ < 90) {
    const dow = cursor.getDay();
    if (dow >= 1 && dow <= 5) {
      const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
      const itemsOnDay = (items || []).filter(i =>
        i && isActiveStatus(i.status) && i.status !== "hold" && i.scheduledDate === iso && i.id !== excludeItemId
      ).length;
      const meetingsOnDay = (recurringMeetings || []).filter(m => recurringMeetingFiresOn(m, cursor)).length;
      out[iso] = { items: itemsOnDay, meetings: meetingsOnDay };
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

// Format a recurring meeting as a one-line string for the Outlook paste box.
// Format: "9:00 AM - 9:30 AM | Daily IT Sync"
function formatRecurringForPaste(rm) {
  if (!rm || !rm.startTime) return "";
  const [h, mm] = rm.startTime.split(":").map(Number);
  const dur = Number(rm.durationMin) || 30;
  const endMin = h * 60 + mm + dur;
  const endH = Math.floor(endMin / 60), endM = endMin % 60;
  const fmt = (hr, mn) => {
    const ampm = hr >= 12 ? "PM" : "AM";
    const hr12 = hr % 12 === 0 ? 12 : hr % 12;
    return `${hr12}:${String(mn).padStart(2, "0")} ${ampm}`;
  };
  return `${fmt(h, mm)} - ${fmt(endH, endM)} | ${rm.title}`;
}

// Returns scheduled (one-off) meetings logged for today's date.
function getScheduledMeetingsForToday(scheduledMeetings) {
  if (!Array.isArray(scheduledMeetings) || scheduledMeetings.length === 0) return [];
  const today = todayStr();
  return scheduledMeetings.filter(m => m && m.date === today);
}

// Filter scheduled meetings to upcoming (today and future), sorted ascending.
function getUpcomingScheduledMeetings(scheduledMeetings) {
  if (!Array.isArray(scheduledMeetings)) return [];
  const today = todayStr();
  return scheduledMeetings
    .filter(m => m && m.date && m.date >= today)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return (a.startTime || "").localeCompare(b.startTime || "");
    });
}
function addDaysToDateStr(dateStr, days) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}
function daysBetween(aStr, bStr) {
  const [ay, am, ad] = aStr.split("-").map(Number);
  const [by, bm, bd] = bStr.split("-").map(Number);
  const a = new Date(ay, am - 1, ad);
  const b = new Date(by, bm - 1, bd);
  return Math.round((b - a) / 86400000);
}
function fmtDateLabel(dateStr) {
  if (!dateStr) return "";
  const diff = daysBetween(todayStr(), dateStr);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const currentYear = new Date().getFullYear();
  if (diff < 0) return `${Math.abs(diff)}d ago`;
  // Within the next 7 days: "Tuesday, May 28"
  if (diff <= 6) {
    return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  }
  // Future (same year): "Tue, May 28"
  if (y === currentYear) {
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }
  // Different year: "Tue, May 28, 2027"
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
function dateBucket(dateStr) {
  if (!dateStr) return "nodate";
  const diff = daysBetween(todayStr(), dateStr);
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  // "This week" = remaining days in the CURRENT calendar week (Mon-Sun).
  // Previously this was "next 6 days" — which on Thursday meant Mon/Tue/Wed of NEXT
  // week incorrectly fell under "this week". Now we anchor to the actual week boundary.
  // E.g. on Thursday, only Fri/Sat/Sun remain → those are "thisweek"; Mon onwards is "nextweek".
  const todayDate = new Date(todayStr() + "T12:00:00");
  const todayDow = todayDate.getDay(); // 0=Sun, 6=Sat
  // Days remaining until next Sunday (inclusive). If today is Sunday, week ends today → 0 days remain.
  const daysUntilEndOfWeek = (7 - todayDow) % 7;
  if (diff <= daysUntilEndOfWeek) return "thisweek";
  // "Next week" = the calendar week immediately after this one (Mon-Sun).
  if (diff <= daysUntilEndOfWeek + 7) return "nextweek";
  return "later";
}
// Priority → default lead time in days
const PRIORITY_LEAD = { high: 0, medium: 2, low: 5 };
// Is a YYYY-MM-DD date string a weekend?
function isDateStrWeekend(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return dow === 0 || dow === 6;
}
// Nudge a date forward off weekends (Sat → Mon, Sun → Mon)
function shiftOffWeekend(dateStr) {
  let d = dateStr;
  while (isDateStrWeekend(d)) d = addDaysToDateStr(d, 1);
  return d;
}

// Cascade task dates after a date edit at index `editedIdx`.
// Preserves the ORIGINAL gaps between subsequent tasks: if task N moved by X days,
// every following unlocked task with a date shifts by the same delta (then
// weekend-shifted). Locked (fixed) tasks stay anchored. After a locked anchor,
// remaining tasks recompute their gaps relative to that anchor.
//
// Args:
//   originalTaskDates — the taskDates BEFORE the edit (so we can compute gaps)
//   newTaskDates     — the taskDates AFTER the edit (with editedIdx already updated)
//   editedIdx        — which task was edited
function cascadeTaskDates(originalTaskDates, newTaskDates, editedIdx) {
  if (!Array.isArray(newTaskDates) || newTaskDates.length === 0) return newTaskDates;
  const result = newTaskDates.map(td => ({ ...td }));
  const original = (originalTaskDates || []).map(td => td ? { ...td } : { date: "", notToday: false, fixed: false });

  // Compute the delta in days from old→new for the edited task
  const oldEdited = original[editedIdx];
  const newEdited = result[editedIdx];
  if (!oldEdited || !oldEdited.date || !newEdited || !newEdited.date) return result;
  const deltaDays = daysBetween(oldEdited.date, newEdited.date);
  if (deltaDays === 0) return result;

  // Walk forward, applying delta while respecting locks
  // We track the "anchor date" — the date that subsequent unlocked tasks compute gaps from
  let anchorOriginal = oldEdited.date;
  let anchorNew = newEdited.date;
  for (let i = editedIdx + 1; i < result.length; i++) {
    const cur = result[i];
    const orig = original[i];
    if (!cur) continue;
    if (cur.notToday) continue; // deferred — leave alone

    if (cur.fixed) {
      // Locked anchor — keep its current date, but use it as the new anchor for following tasks
      if (cur.date) {
        anchorOriginal = (orig && orig.date) ? orig.date : cur.date;
        anchorNew = cur.date;
      }
      continue;
    }

    if (!orig || !orig.date) {
      // Wasn't dated before — leave alone
      continue;
    }

    // Compute the original gap (in days) from the anchor's original date
    const originalGap = daysBetween(anchorOriginal, orig.date);
    if (originalGap < 0) continue; // weird ordering, skip

    // Apply the same gap from the new anchor date, then shift off weekends
    let newDate = addDaysToDateStr(anchorNew, originalGap);
    newDate = shiftOffWeekend(newDate);

    // Safety check: never let it land BEFORE the anchor
    if (newDate < anchorNew) newDate = shiftOffWeekend(anchorNew);

    result[i] = { ...cur, date: newDate };

    // This task becomes the new anchor for the NEXT iteration
    anchorOriginal = orig.date;
    anchorNew = newDate;
  }
  return result;
}
// Spread N tasks evenly between two dates (inclusive), skipping weekends
function spreadTaskDates(startDate, endDate, count) {
  if (!startDate || !endDate || count < 1) return [];
  // Build the list of weekday dates in the span (inclusive)
  const weekdays = [];
  let cursor = startDate;
  for (let i = 0; i < 365; i++) {
    if (!isDateStrWeekend(cursor)) weekdays.push(cursor);
    if (cursor === endDate) break;
    cursor = addDaysToDateStr(cursor, 1);
  }
  if (!weekdays.length) return Array(count).fill(startDate);
  if (count === 1) return [weekdays[weekdays.length - 1]];
  // If we have fewer weekdays than tasks, stack extras on the final day
  if (weekdays.length < count) {
    const out = [];
    for (let i = 0; i < count; i++) {
      out.push(weekdays[Math.min(i, weekdays.length - 1)]);
    }
    return out;
  }
  // Otherwise spread evenly using floor so first task = start, last task = end
  const result = [];
  const step = (weekdays.length - 1) / (count - 1);
  for (let i = 0; i < count; i++) {
    const idx = i === count - 1 ? weekdays.length - 1 : Math.floor(i * step);
    result.push(weekdays[idx]);
  }
  return result;
}
// Estimate a date for an item based on priority + existing load (skips weekends)
function estimateDateForNewItem(priority, existingItems) {
  // Minimum +1 day — never schedule a new item for today (Lexy needs lead
  // time, even for high-priority items). High-priority still gets the closest
  // available weekday by way of the loop below.
  const lead = Math.max(1, PRIORITY_LEAD[priority] ?? 2);
  let baseDate = shiftOffWeekend(addDaysToDateStr(todayStr(), lead));
  // If 3+ non-fixed items already on that day, push forward until lighter day (still skipping weekends)
  let candidate = baseDate;
  let tries = 0;
  while (tries < 14) {
    const count = (existingItems || []).filter(i => i.scheduledDate === candidate && isActiveStatus(i.status)).length;
    if (count < 3) return candidate;
    candidate = shiftOffWeekend(addDaysToDateStr(candidate, 1));
    tries++;
  }
  return candidate;
}
// Auto-cascade: when a new high-priority item is placed, bump non-fixed items forward
function cascadeDates(items, priorityItemId) {
  const pItem = items.find(i => i.id === priorityItemId);
  if (!pItem || !pItem.scheduledDate) return items;
  const targetDate = pItem.scheduledDate;
  // Find non-fixed items on same day that are lower priority — bump them forward by 1 day
  const po = { high: 0, medium: 1, low: 2 };
  return items.map(i => {
    if (i.id === priorityItemId) return i;
    if (i.status === "done") return i;
    if (i.dateFixed) return i;
    if (i.scheduledDate !== targetDate) return i;
    if ((po[i.priority] ?? 1) <= (po[pItem.priority] ?? 1)) return i;
    return { ...i, scheduledDate: shiftOffWeekend(addDaysToDateStr(i.scheduledDate, 1)), dateSource: "estimated" };
  });
}

// Deterministic parser for the meetings text that gets passed via check-in.
// Parse meetings from free-form text. Handles many input formats so users can
// type meetings naturally without worrying about exact format. The parser is
// LINE-AWARE (one meeting per line, mostly) but also scans for inline mentions
// in longer text. Always produces structured { startMin, endMin, durationMin, label }.
//
// Supported patterns (case-insensitive, flexible whitespace + dashes):
//   1. "9:00 AM - 9:30 AM | Daily IT Sync"      ← canonical (from Schedule UI)
//   2. "9:00 AM - 9:30 AM Daily IT Sync"        ← no pipe
//   3. "Demo 2-3 PM"                            ← label first, compact times
//   4. "Demo 2-3pm"                             ← lowercase ampm
//   5. "Demo from 2 to 3 PM"                    ← natural words
//   6. "Demo 2:00 PM - 3:00 PM"                 ← label first, full times
//   7. "Demo at 2pm for 1 hour" / "for 60 min"  ← duration-based
//   8. "I have a Demo from 2-3 PM with vendor"  ← inline in sentence
//
// AM/PM inference for times without ampm:
//   - If only one time has ampm, the other inherits (assume same AM/PM unless start>end)
//   - If neither has ampm: hours 1-7 → PM (afternoon work hours), 8-11 → AM, 12 → noon (PM)
//
// Returns: [{ startMin, endMin, durationMin, label }] sorted chronologically.
function parseMeetingsFromText(text) {
  if (!text) return [];
  const meetings = [];

  // Helper: parse a single time string like "2pm", "2:30 PM", "14:00"
  // Returns { mins, hadAmpm } or null. `assumePM` hints inference when ampm missing.
  const parseTime = (s, assumePM) => {
    if (!s) return null;
    const m = s.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?$/i);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const mins = parseInt(m[2] || "0", 10);
    const ampm = (m[3] || "").toLowerCase().replace(/\./g, "");
    if (h > 23 || mins > 59) return null;
    let hadAmpm = !!ampm;
    if (ampm === "pm" && h < 12) h += 12;
    else if (ampm === "am" && h === 12) h = 0;
    else if (!ampm) {
      // Infer from context. If assumePM hint, use it. Otherwise: 1-7 → PM, 8-11 → AM, 12 → noon, 0 → AM
      if (assumePM === true && h >= 1 && h <= 11) h += 12;
      else if (assumePM === false && h === 12) h = 0;
      else if (h >= 1 && h <= 7) h += 12;       // afternoon
      else if (h === 12) {} // noon, leave at 12
      // else 8-11 stay as AM
    }
    return { mins: h * 60 + mins, hadAmpm };
  };

  // Helper: clean up a label extracted from natural language.
  // Strips filler prefixes ("I have a", "we have", "there's a") and trailing
  // connective words ("from", "at", "for"), normalizes whitespace, capitalizes.
  const cleanLabel = (raw) => {
    if (!raw) return "";
    let s = String(raw).trim();
    // Strip surrounding punctuation
    s = s.replace(/^[\-:|.,;]+\s*/, "").replace(/\s*[\-:|.,;]+$/, "").trim();
    // Strip filler prefixes
    s = s.replace(/^(?:i\s+(?:have|need|got|gotta)|i'?ve\s+got|we\s+have|we\s+need|we'?ve\s+got|there'?s|there\s+is)\s+(?:a\s+|an\s+|the\s+)?/i, "");
    s = s.replace(/^(?:got|need|have)\s+(?:a\s+|an\s+|the\s+)?/i, "");
    // Strip connective suffixes
    s = s.replace(/\s+(?:from|at|for|starting|going)\s*$/i, "");
    s = s.replace(/\s+(?:from|at|for)\s+the\s*$/i, "");
    // Normalize whitespace
    s = s.replace(/\s+/g, " ").trim();
    // Capitalize first letter
    if (s.length > 0) s = s[0].toUpperCase() + s.slice(1);
    return s;
  };

  // Helper: build a meeting from start, end (or duration), label
  const tryAdd = (startInfo, endInfo, durationMin, label) => {
    if (!startInfo || (!endInfo && !durationMin)) return false;
    let startMin = startInfo.mins;
    let endMin;
    if (endInfo) {
      endMin = endInfo.mins;
      // If end < start, end likely PM that we mis-inferred. Try flipping.
      if (endMin <= startMin && !endInfo.hadAmpm) {
        endMin += 12 * 60;
      }
      // If still bad, try flipping start instead
      if (endMin <= startMin && !startInfo.hadAmpm) {
        startMin -= 12 * 60;
        if (startMin < 0) return false;
      }
      if (endMin <= startMin) return false;
    } else {
      endMin = startMin + durationMin;
    }
    const cleaned = cleanLabel(label);
    if (!cleaned) return false;
    // Sanity: meeting durations should be 5 min - 8 hours
    const dur = endMin - startMin;
    if (dur < 5 || dur > 8 * 60) return false;
    meetings.push({ startMin, endMin, durationMin: dur, label: cleaned });
    return true;
  };

  // ── Process line by line ──
  for (const rawLine of String(text).split("\n")) {
    // Strip trailing punctuation that would break the regex (.,;!?)
    const line = rawLine.trim().replace(/[.,;!?]+\s*$/, "").trim();
    if (!line) continue;

    // Pattern 1+2: "TIME - TIME [|] LABEL" (canonical or no-pipe)
    const p1 = line.match(/^(\d{1,2}(?::\d{2})?\s*(?:[AP]\.?M\.?)?)\s*[-–—to]+\s*(\d{1,2}(?::\d{2})?\s*(?:[AP]\.?M\.?)?)\s*[\|:]\s*(.+)$/i);
    if (p1) {
      const endInfo = parseTime(p1[2]);
      const startInfo = parseTime(p1[1], endInfo && endInfo.mins >= 12 * 60);
      if (tryAdd(startInfo, endInfo, null, p1[3])) continue;
    }
    // Pattern 2 alt: "TIME - TIME LABEL" (no separator)
    const p2 = line.match(/^(\d{1,2}(?::\d{2})?\s*(?:[AP]\.?M\.?)?)\s*[-–—]\s*(\d{1,2}(?::\d{2})?\s*(?:[AP]\.?M\.?)?)\s+(\S.*)$/i);
    if (p2) {
      const endInfo = parseTime(p2[2]);
      const startInfo = parseTime(p2[1], endInfo && endInfo.mins >= 12 * 60);
      if (tryAdd(startInfo, endInfo, null, p2[3])) continue;
    }

    // Pattern 3: "LABEL TIME - TIME" or "LABEL TIME-TIME"
    const p3 = line.match(/^(.+?)\s+(\d{1,2}(?::\d{2})?\s*(?:[AP]\.?M\.?)?)\s*[-–—]\s*(\d{1,2}(?::\d{2})?\s*(?:[AP]\.?M\.?)?)\s*$/i);
    if (p3) {
      const endInfo = parseTime(p3[3]);
      const startInfo = parseTime(p3[2], endInfo && endInfo.mins >= 12 * 60);
      if (tryAdd(startInfo, endInfo, null, p3[1])) continue;
    }

    // Pattern 4: "LABEL from TIME to TIME"
    const p4 = line.match(/^(.+?)\s+from\s+(\d{1,2}(?::\d{2})?\s*(?:[AP]\.?M\.?)?)\s+to\s+(\d{1,2}(?::\d{2})?\s*(?:[AP]\.?M\.?)?)/i);
    if (p4) {
      const endInfo = parseTime(p4[3]);
      const startInfo = parseTime(p4[2], endInfo && endInfo.mins >= 12 * 60);
      if (tryAdd(startInfo, endInfo, null, p4[1])) continue;
    }

    // Pattern 5: "LABEL at TIME for N (hr|min)"
    const p5 = line.match(/^(.+?)\s+at\s+(\d{1,2}(?::\d{2})?\s*(?:[AP]\.?M\.?)?)\s+for\s+(\d+)\s*(hr|hrs|hour|hours|min|mins|minute|minutes)?/i);
    if (p5) {
      const startInfo = parseTime(p5[2]);
      let durationMin = parseInt(p5[3], 10);
      const unit = (p5[4] || "min").toLowerCase();
      if (unit.startsWith("h")) durationMin *= 60;
      if (tryAdd(startInfo, null, durationMin, p5[1])) continue;
    }

    // Pattern 6: inline scan — "...meeting/demo/sync/call ... TIME-TIME..."
    // Look for any "TIME [-to] TIME" pattern and grab nearby words as label.
    const inlineRange = line.match(/(\d{1,2}(?::\d{2})?\s*(?:[AP]\.?M\.?)?)\s*[-–—to]+\s*(\d{1,2}(?::\d{2})?\s*(?:[AP]\.?M\.?)?)/i);
    if (inlineRange) {
      // Find the portion of line BEFORE the time range as the label
      const idx = line.indexOf(inlineRange[0]);
      const before = line.slice(0, idx).trim();
      // Strip filler words from before
      const label = before
        .replace(/^(i\s+have\s+(?:a\s+|an\s+)?|there's\s+(?:a\s+|an\s+)?|we\s+have\s+(?:a\s+|an\s+)?)/i, "")
        .replace(/\s+(at|from)\s*$/i, "")
        .trim();
      const endInfo = parseTime(inlineRange[2]);
      const startInfo = parseTime(inlineRange[1], endInfo && endInfo.mins >= 12 * 60);
      if (label && tryAdd(startInfo, endInfo, null, label)) continue;
    }
  }

  // Sort chronologically
  meetings.sort((a, b) => a.startMin - b.startMin);
  return meetings;
}

// Build the slot triplet (prep + meeting + breather) for a parsed meeting.
// Returns 1-3 slots depending on what fits in the timeline. All locked.
function buildMeetingSlots(parsedMeeting) {
  const { startMin, durationMin, label } = parsedMeeting;
  const shortLabel = label.split(" ").slice(0, 4).join(" ");
  const slots = [];
  // Prep buffer 10 min before — only if there's room
  if (startMin >= 10) {
    slots.push({
      time: formatSlotMinutes(startMin - 10),
      label: `Prep for ${shortLabel}`,
      type: "buffer",
      note: "Quick mental warm-up before the meeting.",
      locked: true,
      durationMin: 10,
    });
  }
  // The meeting itself
  slots.push({
    time: formatSlotMinutes(startMin),
    label,
    type: "meeting",
    note: `Locked — ${durationMin} min.`,
    locked: true,
    durationMin,
  });
  // Breather 15 min after
  slots.push({
    time: formatSlotMinutes(startMin + durationMin),
    label: `Buffer after ${shortLabel}`,
    type: "buffer",
    note: "Decompress, jot notes while fresh.",
    locked: true,
    durationMin: 15,
  });
  return slots;
}


// Heuristic: detect meeting/call/sync slots and auto-lock them so they don't shift
// when the user re-balances or runs over on other blocks. Looks at label and note
// for clear meeting signals.
// Enforce Lexy's hard break requirements — runs as a post-processor on any
// generated/refined roadmap. Guarantees these always exist:
//   1. 15-min morning brain break, start time between 10:00 and 11:00 AM
//   2. 60-min lunch, start time between 12:00 PM and 1:30 PM
//   3. 15-min afternoon brain break, start time between 3:00 and 4:00 PM
// If Rosie missed one or sized it wrong, we inject/correct it deterministically.
function ensureRequiredBreaks(slots) {
  if (!Array.isArray(slots) || slots.length === 0) return slots;

  const result = slots.map(s => ({ ...s }));

  const isInRange = (timeStr, fromMin, toMin) => {
    const m = parseSlotTimeMinutes(timeStr);
    return m >= fromMin && m <= toMin;
  };

  // Helper: find an existing break slot whose START time falls in a window.
  // Accepts either type === "break" OR a label that matches the given keywords —
  // this catches cases where Rosie generated the slot with type "buffer" or
  // no type at all (still a lunch break, just mistyped).
  const findBreakInWindow = (fromMin, toMin, labelKeywords = []) => {
    return result.findIndex(s => {
      if (!isInRange(s.time, fromMin, toMin)) return false;
      if (s.type === "break") return true;
      const lab = (s.label || "").toLowerCase();
      return labelKeywords.some(kw => lab.includes(kw));
    });
  };

  // Helper: find a drifted break with the given label keyword that's OUTSIDE the
  // canonical window. Used to relocate Rosie's mis-placed breaks. Same permissive
  // matching — type "break" OR label keyword.
  const findDriftedBreak = (labelKeywords, fromMin, toMin) => {
    return result.findIndex(s => {
      const t = parseSlotTimeMinutes(s.time);
      // Outside the canonical window
      const inWindow = t >= fromMin && t <= toMin;
      if (inWindow) return false;
      const lab = (s.label || "").toLowerCase();
      const labelMatches = labelKeywords.some(kw => lab.includes(kw));
      // Must match by either type OR label keyword
      if (s.type === "break" && labelMatches) return true;
      if (labelMatches) return true; // any slot whose label matches even with wrong type
      return false;
    });
  };

  // Helper: insert or fix a break slot
  // - If a matching slot exists in the window, set its duration correctly
  //   (UNLESS preserveDuration=true — then leave duration alone, just normalize type/lock)
  // - If a drifted break with matching label exists, RELOCATE it into the window
  // - If neither, insert a new one at the target time, displacing other slots
  // - `shouldLock`: if true, the slot is created/preserved as locked (cascade-proof)
  // - `preserveDuration`: if true, an existing slot's duration is left alone. Used for
  //   slots like Lunch where the user may want to adjust the length.
  const ensureBreak = (windowFromMin, windowToMin, targetMin, durationMin, label, driftLabelKeywords, shouldLock = false, preserveDuration = false) => {
    const existingIdx = findBreakInWindow(windowFromMin, windowToMin, driftLabelKeywords || []);
    if (existingIdx >= 0) {
      // Found a break in the window — make sure its type, duration, and lock are correct.
      // Force type="break" because Rosie sometimes generates lunch with type="buffer".
      result[existingIdx] = {
        ...result[existingIdx],
        type: "break",
        ...(shouldLock ? { locked: true } : {}),
      };
      // If preserveDuration is set, leave the existing duration alone (user-adjustable).
      if (preserveDuration) return;
      const startMin = parseSlotTimeMinutes(result[existingIdx].time);
      const nextSlot = result[existingIdx + 1];
      const nextStart = nextSlot ? parseSlotTimeMinutes(nextSlot.time) : null;
      const currentDuration = nextStart !== null ? nextStart - startMin : durationMin;

      if (currentDuration === durationMin) return; // already correct

      if (nextSlot && nextSlot.locked) {
        // Next slot is locked (meeting/anchor). We can't push it. Instead, shift the
        // BREAK'S START EARLIER so the break has its full duration before the lock.
        const idealStart = nextStart - durationMin;
        // Only shift if the new start is still within the allowed window
        if (idealStart >= windowFromMin && idealStart <= windowToMin) {
          result[existingIdx] = { ...result[existingIdx], time: formatSlotMinutes(idealStart) };
          // Also shift the slot BEFORE the break if it would now collide
          // (i.e. if its start time + duration runs past the new break start).
          // Keep that prev slot's start, just acknowledge its duration shrinks.
          // (We don't track explicit durations, so this is implicit.)
        } else {
          // Can't fit the break in the window before this lock — leave as best-effort.
          // (User will see the smaller break, but at least it's there.)
        }
        return;
      }

      if (nextSlot && !nextSlot.locked) {
        // Adjust next slot to enforce correct duration
        result[existingIdx + 1] = { ...nextSlot, time: formatSlotMinutes(startMin + durationMin) };
      }
      return;
    }

    // BEFORE inserting a NEW slot, check for a DRIFTED break with matching label
    // that's outside the window — relocate it instead of duplicating.
    if (driftLabelKeywords && driftLabelKeywords.length > 0) {
      const driftedIdx = findDriftedBreak(driftLabelKeywords, windowFromMin, windowToMin);
      if (driftedIdx >= 0) {
        // Remove the drifted break, then insert it (relabeled correctly) at the target time
        result.splice(driftedIdx, 1);
        const relocated = { time: formatSlotMinutes(targetMin), label, type: "break", note: result[driftedIdx]?.note || "", ...(shouldLock ? { locked: true } : {}) };
        let insertAt = result.findIndex(s => parseSlotTimeMinutes(s.time) > targetMin);
        if (insertAt < 0) insertAt = result.length;
        result.splice(insertAt, 0, relocated);
        // Cascade-shift collisions using prevTime tracker (avoids dumping
        // multiple colliding slots to the same time). Final rebalance corrects gaps.
        let prevTime = targetMin + durationMin;
        for (let i = insertAt + 1; i < result.length; i++) {
          const s = result[i];
          if (s.locked) break;
          const sMin = parseSlotTimeMinutes(s.time);
          if (sMin < prevTime) {
            result[i] = { ...s, time: formatSlotMinutes(prevTime) };
            prevTime = prevTime + 1;
          } else {
            prevTime = sMin + 1;
          }
        }
        return;
      }
    }

    // No break exists in the window — insert one at the target time.
    const newSlot = { time: formatSlotMinutes(targetMin), label, type: "break", note: "", ...(shouldLock ? { locked: true } : {}) };
    let insertAt = result.findIndex(s => parseSlotTimeMinutes(s.time) > targetMin);
    if (insertAt < 0) insertAt = result.length;
    result.splice(insertAt, 0, newSlot);

    // After inserting, cascade-shift subsequent unlocked slots forward.
    // Each slot pushed to max(its time, prevTime + 1) to avoid duplicates.
    let prevTime = targetMin + durationMin;
    for (let i = insertAt + 1; i < result.length; i++) {
      const s = result[i];
      if (s.locked) break;
      const sMin = parseSlotTimeMinutes(s.time);
      if (sMin < prevTime) {
        result[i] = { ...s, time: formatSlotMinutes(prevTime) };
        prevTime = prevTime + 1;
      } else {
        prevTime = sMin + 1;
      }
    }
  };

  // ✱ Morning brain break: 15 min, between 10:00 and 11:00 AM
  ensureBreak(10 * 60, 11 * 60, 10 * 60 + 30, 15, "Morning brain break", ["morning brain", "morning break", "morning stretch", "stretch", "morning reset"]);

  // ✱ Lunch: starts between 12:00 PM and 1:30 PM — LOCKED (real-world non-negotiable).
  // Default 60 min on initial generation, but preserveDuration=true means once the
  // slot exists, the user can shorten it (e.g. to 30 min) and we won't override.
  ensureBreak(12 * 60, 13 * 60 + 30, 12 * 60, 60, "Lunch", ["lunch"], true, true);

  // ✱ Afternoon brain break: 15 min, between 3:00 and 4:00 PM
  ensureBreak(15 * 60, 16 * 60, 15 * 60 + 30, 15, "Afternoon brain break", ["afternoon brain", "afternoon break", "afternoon stretch", "afternoon reset", "walk", "afternoon walk"]);

  return result;
}

// Detects whether a slot is a meeting (used by auto-lock, prep-block insertion, etc.)
// IMPORTANT:
//  - Only checks the LABEL, not the note (notes can mention "meeting" descriptively)
//  - EXCLUDES prep/breather slots whose labels REFERENCE a meeting (e.g.
//    "Prep for Alkami Meeting" or "Breather after Alkami Meeting") — those are
//    helper slots, not meetings themselves.
function isMeetingSlot(slot) {
  if (!slot || typeof slot !== "object") return false;
  const label = (slot.label || "").toLowerCase().trim();
  // Hard exclusions: prep/buffer/breather/wrap/close slots are not meetings, even if
  // their label references a meeting name.
  if (label.startsWith("prep for")) return false;
  if (label.startsWith("breather after") || label.startsWith("breather for")) return false;
  if (label.startsWith("buffer after") || label.startsWith("buffer for")) return false;
  if (label.startsWith("decompress")) return false;
  if (label.includes("wrap") && label.includes("tomorrow")) return false;
  if (label.includes("close for the day") || label.includes("close out") ||
      label.includes("end of day") || label.includes("end-of-day")) return false;
  // type-based exclusions: buffers, breaks, work, and blocked are NEVER meetings.
  // Trust the explicit type tag — labels alone are too ambiguous (e.g. "Add Zoho
  // demo to kick-off" is work, not a meeting, even though it contains "demo").
  if (slot.type === "buffer" || slot.type === "break") return false;
  if (slot.type === "work" || slot.type === "blocked") return false;

  // ── EXPLICIT TYPE — the ONLY reliable signal. enforceUserMeetings sets type
  // to "meeting" for user-provided meetings; Rosie is instructed to do the same.
  if (slot.type === "meeting" || slot.type === "locked-meeting") return true;

  // Fallback for slots with NO type field — only match VERY strong patterns
  // ("X with Y", standup, all-hands) to avoid catching task labels like
  // "Demo Zoho integration" or "Review Q3 numbers".
  const strongMeetingPatterns = [
    /\bmeeting with\b/, /\bsync with\b/, /\bcall with\b/, /\b1:1 with\b/,
    /\bone-on-one with\b/, /\bcheck-in with\b/, /\breview with\b/,
    /\bkickoff with\b/, /\bhuddle with\b/, /\binterview with\b/,
    /\ball hands\b/, /\ball-hands\b/, /\bstand-?\s?up\b/,
    /\bteam meeting\b/, /\bvendor (call|meeting|sync)\b/,
    /\bclient (call|meeting|sync)\b/, /\bpresentation to\b/,
  ];
  return strongMeetingPatterns.some(re => re.test(label));
}

// Detects whether a slot label refers to lunch.
function isLunchSlot(slot) {
  if (!slot || typeof slot !== "object") return false;
  const label = (slot.label || "").toLowerCase();
  return label.includes("lunch");
}

// Detects whether a slot is a brain break (15-min standalone breaks, NOT lunch and
// NOT a breather/meeting prep buffer).
function isBrainBreakSlot(slot) {
  if (!slot || typeof slot !== "object") return false;
  if (slot.type !== "break") return false;
  if (isLunchSlot(slot)) return false;
  const label = (slot.label || "").toLowerCase();
  // Skip post-meeting breathers — those have their own behavior
  if (label.includes("breather") || label.includes("decompress") || label.startsWith("after ")) return false;
  // Match labels like "morning brain break", "afternoon brain break", "stretch & reset", etc.
  return label.includes("break") || label.includes("stretch") || label.includes("reset") ||
    label.includes("walk") || label.includes("breathe");
}

// Finds the best-matching active work item for a given roadmap slot label.
// Uses keyword overlap with title + tasks. Used by warnings to route to FocusView.
function findMatchingItemForLabel(label, items) {
  if (!label || !Array.isArray(items)) return null;
  const ignoreWords = new Set([
    "draft", "start", "starts", "continue", "continues", "review", "reviewing",
    "work", "session", "block", "time", "morning", "afternoon", "evening", "break",
    "stretch", "reset", "settle", "wrap", "and", "the", "for", "with", "from",
    "into", "on", "to", "a", "an", "is", "of", "as", "at", "by", "polish",
    "first", "next", "last", "early", "late", "mid", "small", "big", "real",
    "your", "you", "still", "even", "more", "less", "this", "that",
  ]);
  const tokenize = (s) => (s || "").toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length >= 3 && !ignoreWords.has(w));
  const labelTokens = new Set(tokenize(label));
  if (!labelTokens.size) return null;
  let best = null;
  let bestScore = 0;
  for (const i of items) {
    if (i.status === "done") continue;
    const titleTokens = tokenize(i.title);
    const taskTokens = (i.tasks || []).flatMap(t => tokenize(t));
    const allTokens = new Set([...titleTokens, ...taskTokens]);
    let score = 0;
    for (const t of labelTokens) if (allTokens.has(t)) score++;
    const titleOverlap = titleTokens.filter(t => labelTokens.has(t)).length;
    score += titleOverlap;
    if (score > bestScore) { bestScore = score; best = i; }
  }
  return bestScore >= 1 ? best : null;
}

// Inserts a 10-min "prep" buffer slot directly before each meeting slot.
// - Skips meetings that already have a prep slot before them (matched by "prep" in
//   the previous slot's label).
// - Skips if it would overlap a locked slot or push past the day boundary.
// - Prep slot is type 'buffer', label "Prep for [meeting label]".
// Inserts a 30-min "Prep for today's meetings" buffer slot in the morning
// when there's at least one meeting on the day. Helps Lexy mentally prep
// for everything before the day picks up.
// - Inserts at the start of the work window (after morning buffer if present),
//   no later than 9:30 AM.
// - Idempotent: skips if a similar prep block already exists.
// - Type 'buffer'.
function ensureMorningMeetingPrep(slots) {
  if (!Array.isArray(slots) || slots.length === 0) return slots;
  // Only inject if there's at least one meeting on the day
  const hasMeeting = slots.some(s => isMeetingSlot(s));
  if (!hasMeeting) return slots;

  // Idempotent: skip if any existing slot looks like a "prep for today's meetings" block
  const alreadyHasMorningPrep = slots.some(s => {
    const label = (s.label || "").toLowerCase();
    return (s.type === "buffer" || s.type === "break") &&
      (label.includes("prep for today") || label.includes("prep for the day") ||
       label.includes("meetings prep") || label.includes("daily meeting prep") ||
       (label.includes("prep") && label.includes("meeting") && label.includes("today")));
  });
  if (alreadyHasMorningPrep) return slots;

  const result = [...slots];

  // Find the position after the morning buffer (if any) — insert right after it.
  // If no morning buffer, insert at start.
  let insertAt = 0;
  for (let i = 0; i < result.length; i++) {
    const s = result[i];
    const label = (s.label || "").toLowerCase();
    if (s.type === "buffer" && (label.includes("morning") || label.includes("settle") || label.includes("buffer"))) {
      insertAt = i + 1;
      break;
    }
  }

  // Compute start time — should align with the actual insertion position, not
  // an absolute time. The previous version clamped to 9:30 AM, which broke late
  // check-ins (where the work day starts after lunch): the prep block got time
  // 9:30 AM but was inserted at the post-lunch position, corrupting array order.
  let startMin;
  if (insertAt === 0) {
    // No morning buffer found — start at first slot's time, or default 9:00 AM
    startMin = result[0] ? parseSlotTimeMinutes(result[0].time) : 9 * 60;
  } else {
    // Insert right after the previous slot (use its end time as our start).
    // For fixed-duration slots (like settle-in), "end" = start + intended duration.
    const prev = result[insertAt - 1];
    const prevStart = parseSlotTimeMinutes(prev.time);
    const fixedDur = intendedFixedDuration(prev);
    if (fixedDur != null) {
      startMin = prevStart + fixedDur;
    } else {
      const next = result[insertAt];
      const nextStart = next ? parseSlotTimeMinutes(next.time) : -1;
      // If there's a next slot and it's reachable in <60min, use that as the
      // anchor (means previous slot's natural end). Otherwise fall back to +15.
      if (nextStart > prevStart && nextStart - prevStart <= 60) {
        startMin = nextStart;
      } else {
        startMin = prevStart + 15;
      }
    }
  }

  // Sanity bounds: never before 7 AM
  if (startMin < 7 * 60) startMin = 7 * 60;

  // If insertion would put the prep block too close to a meeting (less than 35
  // min before), skip it entirely. Better to have no morning prep block than to
  // create a colliding/squeezed slot. The per-meeting "Prep for X" buffers from
  // ensureMeetingPrepBlocks will handle warm-up needs.
  const firstMeetingIdx = result.findIndex(s => isMeetingSlot(s));
  if (firstMeetingIdx >= 0) {
    const firstMeetingStart = parseSlotTimeMinutes(result[firstMeetingIdx].time);
    if (firstMeetingStart >= 0 && (firstMeetingStart - startMin) < 35) {
      // Not enough room — skip the morning prep block. The per-meeting prep
      // buffer will still get added by ensureMeetingPrepBlocks.
      return result;
    }
  }

  // Skip if a per-meeting prep ("Prep for X") already covers our intended start
  // time. This prevents the case where buildMeetingSlots pre-placed "Prep for
  // Strum Demo" at 9:50 AND we'd add "Prep for today's meetings" also at 9:50,
  // producing two overlapping locked prep blocks.
  const existingPrepCovers = result.some(s => {
    const sLabel = (s.label || "").toLowerCase();
    if ((s.type !== "buffer" && s.type !== "break") || !sLabel.startsWith("prep for")) return false;
    const sStart = parseSlotTimeMinutes(s.time);
    if (sStart < 0) return false;
    // Within ±20 minutes of our intended start = same prep window
    return Math.abs(sStart - startMin) <= 20;
  });
  if (existingPrepCovers) return result;

  const prepSlot = {
    time: formatSlotMinutes(startMin),
    label: "Prep for today's meetings",
    type: "buffer",
    note: "Skim agendas, review notes, mental warm-up.",
  };

  result.splice(insertAt, 0, prepSlot);

  // Cascade-shift subsequent unlocked slots forward.
  // Each colliding slot gets pushed to max(its time, prevTime + 1) so duplicates
  // resolve and slots stay in order. Final rebalance corrects any phantom gaps.
  let prevTime = startMin + 30; // prep block ends at startMin + 30
  for (let i = insertAt + 1; i < result.length; i++) {
    const s = result[i];
    if (s.locked) {
      // Hit a locked anchor — stop cascading
      break;
    }
    const sMin = parseSlotTimeMinutes(s.time);
    if (sMin < prevTime) {
      result[i] = { ...s, time: formatSlotMinutes(prevTime) };
      prevTime = prevTime + 1;
    } else {
      // Already in order — track current end and continue
      prevTime = sMin + 1;
    }
  }
  return result;
}

function ensureMeetingPrepBlocks(slots) {
  if (!Array.isArray(slots) || slots.length === 0) return slots;
  const result = [...slots];
  // Walk from end to start so insertions don't shift indices we haven't processed
  for (let i = result.length - 1; i >= 0; i--) {
    const slot = result[i];
    if (!isMeetingSlot(slot)) continue;
    const meetingStartMin = parseSlotTimeMinutes(slot.time);
    if (meetingStartMin < 10) continue; // 10 min prep wouldn't fit before midnight wraparound
    const prepStartMin = meetingStartMin - 10;

    // Skip if a prep buffer for THIS meeting already exists within the
    // 30 minutes before its start (handles pre-placed meetings where the prep
    // was inserted by buildMeetingSlots, even if a Rosie-generated work block
    // ended up between them).
    // Also catches:
    //  - "Prep for X" canonical naming
    //  - "X prep" suffix naming (AI-generated variants)
    //  - "pre-arrival window" / blocked-type pre-meeting blocks (older data)
    //  - GENERAL "prep for today's meetings" block covering the same window
    // The bar is: any buffer/break/blocked slot whose label suggests "prep" /
    // "warmup" / "pre-" OR that sits immediately adjacent to the meeting.
    const meetingLabelLow = (slot.label || "").toLowerCase();
    const meetingShortKey = meetingLabelLow.split(" ").slice(0, 4).join(" ");
    let prepAlreadyExists = false;
    for (let k = i - 1; k >= 0; k--) {
      const s = result[k];
      const sStart = parseSlotTimeMinutes(s.time);
      if (sStart < 0 || meetingStartMin - sStart > 30) break;
      const sLabel = (s.label || "").toLowerCase();
      const isBufferish = s.type === "buffer" || s.type === "break" || s.type === "blocked";
      if (!isBufferish) continue;
      // Match 1: canonical "Prep for X" — and the X matches THIS meeting
      if (sLabel.startsWith("prep for")) {
        if (sLabel.includes(meetingShortKey) || sLabel.includes(meetingLabelLow)
            || sLabel.includes("today") || sLabel.includes("the day") || sLabel.includes("daily meeting")) {
          prepAlreadyExists = true; break;
        }
      }
      // Match 2: suffix "X prep" naming style — slot label ends with " prep"
      // OR contains "prep" + the meeting's short key
      if (sLabel.endsWith(" prep") || (sLabel.includes("prep") && sLabel.includes(meetingShortKey.split(" ")[0]))) {
        prepAlreadyExists = true; break;
      }
      // Match 3: any prep-coded label keywords
      if (sLabel.includes("warm-up") || sLabel.includes("warmup")
          || sLabel.includes("pre-meeting") || sLabel.includes("premeeting")
          || sLabel.includes("pre-arrival") || sLabel.includes("arrival window")) {
        prepAlreadyExists = true; break;
      }
      // Match 4: a buffer/break/blocked slot that ENDS right at the meeting
      // start (within 2 min tolerance) — it's clearly serving as prep
      // regardless of what it's named.
      const sDur = Number(s.durationMin) || 10;
      const sEnd = sStart + sDur;
      if (Math.abs(meetingStartMin - sEnd) <= 2) {
        prepAlreadyExists = true; break;
      }
    }
    if (prepAlreadyExists) continue;

    // Build a clean prep label, trimmed under 6 words
    const meetingLabel = (slot.label || "Meeting").trim();
    const shortMeeting = meetingLabel.split(" ").slice(0, 4).join(" ");
    const prepLabel = `Prep for ${shortMeeting}`;
    const prepSlot = {
      time: formatSlotMinutes(prepStartMin),
      label: prepLabel.length > 50 ? prepLabel.slice(0, 47) + "..." : prepLabel,
      type: "buffer",
      note: "Quick mental warm-up before the meeting.",
    };

    // Determine where to insert. The prep should come right before the meeting at i.
    if (i > 0) {
      const prev = result[i - 1];
      const prevStart = parseSlotTimeMinutes(prev.time);
      if (prevStart >= prepStartMin) {
        // Previous slot starts AT or AFTER the prep slot — would create a collision.
        // Skip insertion to avoid breaking the chain.
        continue;
      }
    }

    result.splice(i, 0, prepSlot);
  }
  return result;
}

// Inserts a 10-min "breather" break slot AFTER each meeting slot.
// - Skips meetings that already have a 10-min-ish break/buffer right after them.
// - Skips if it would push past the day boundary.
// - Breather is type 'break', label "Breather after [meeting name]".
// Pushes a slot's start time forward by `deltaMin` minutes and cascades unlocked
// subsequent slots forward by the same delta. Locked slots stay anchored. If a
// shifted slot would collide with a locked slot (start past or at the lock's start),
// the shifted slot is clamped to end JUST BEFORE the lock, naturally shortening
// the duration of any work block sitting between the pushed slot and the lock.
//
// Returns a new slots array. No-op if slotIdx is out of bounds or deltaMin <= 0.
function pushBackSlot(slots, slotIdx, deltaMin) {
  if (!Array.isArray(slots) || slotIdx < 0 || slotIdx >= slots.length || deltaMin <= 0) return slots;
  const result = slots.map(s => ({ ...s }));

  // Shift the target slot itself (only if not locked — though the caller should
  // never push back a locked slot)
  const target = result[slotIdx];
  if (target.locked) return result; // can't move locked slots

  const oldStart = parseSlotTimeMinutes(target.time);
  if (oldStart < 0) return result;
  result[slotIdx] = { ...target, time: formatSlotMinutes(oldStart + deltaMin) };

  // Cascade forward — shift unlocked slots by deltaMin; clamp at locks
  for (let i = slotIdx + 1; i < result.length; i++) {
    const s = result[i];
    if (s.locked) continue; // anchor stays put

    const originalStart = parseSlotTimeMinutes(s.time);
    if (originalStart < 0) continue;
    let shifted = originalStart + deltaMin;

    // Look ahead for the next locked slot — clamp shifted time so this slot
    // doesn't push past it.
    let nextLockedTime = null;
    for (let j = i + 1; j < result.length; j++) {
      if (result[j].locked) {
        const t = parseSlotTimeMinutes(result[j].time);
        if (t >= 0) { nextLockedTime = t; break; }
      }
    }
    if (nextLockedTime !== null && shifted >= nextLockedTime) {
      // Clamp so this slot ends just before the lock (5 min buffer for transition)
      shifted = Math.max(originalStart, nextLockedTime - 5);
    }

    // Don't let shifted go before the previous slot's start (avoid negative durations)
    const prevStart = parseSlotTimeMinutes(result[i - 1].time);
    if (prevStart >= 0 && shifted < prevStart) shifted = prevStart;

    // Day boundary clamps (5am–11pm)
    if (shifted < 5 * 60) shifted = 5 * 60;
    if (shifted > 23 * 60) shifted = 23 * 60;

    result[i] = { ...s, time: formatSlotMinutes(shifted) };
  }
  return result;
}

function ensureMeetingBreathers(slots) {
  if (!Array.isArray(slots) || slots.length === 0) return slots;
  const result = [...slots];
  // Walk from end to start so insertions don't shift indices we haven't processed
  for (let i = result.length - 1; i >= 0; i--) {
    const slot = result[i];
    if (!isMeetingSlot(slot)) continue;
    // Find the meeting's end time (= next slot's start, or +30 if last)
    const meetingStart = parseSlotTimeMinutes(slot.time);
    if (meetingStart < 0) continue;
    const next = result[i + 1];
    const nextStart = next ? parseSlotTimeMinutes(next.time) : meetingStart + 30;
    if (nextStart < 0) continue;

    // Skip if a buffer-after slot for THIS meeting already exists anywhere
    // within the next 90 minutes (handles pre-placed meetings where the buffer
    // was inserted by buildMeetingSlots, even if a Rosie-generated work block
    // ended up at the same time).
    const meetingLabelLow = (slot.label || "").toLowerCase();
    const meetingShortKey = meetingLabelLow.split(" ").slice(0, 4).join(" ");
    let bufferAlreadyExists = false;
    for (let k = i + 1; k < result.length; k++) {
      const s = result[k];
      const sStart = parseSlotTimeMinutes(s.time);
      if (sStart < 0 || sStart - meetingStart > 90) break;
      const sLabel = (s.label || "").toLowerCase();
      if ((s.type === "buffer" || s.type === "break") &&
          (sLabel.startsWith("buffer after") || sLabel.startsWith("breather") || sLabel.startsWith("decompress")) &&
          (sLabel.includes(meetingShortKey) || sLabel.includes(meetingLabelLow))) {
        bufferAlreadyExists = true;
        break;
      }
    }
    if (bufferAlreadyExists) continue;

    // Don't insert if there's no room — if next slot is locked and starts very soon,
    // skip insertion to avoid pushing the locked slot.
    if (next && next.locked && (nextStart - meetingStart) < 15) continue;

    // Build buffer slot — 15 min, type "buffer", label "Buffer after [meeting name]"
    const meetingLabel = (slot.label || "Meeting").trim();
    const shortMeeting = meetingLabel.split(" ").slice(0, 4).join(" ");
    const bufferLabel = `Buffer after ${shortMeeting}`;
    const bufferSlot = {
      time: formatSlotMinutes(nextStart),
      label: bufferLabel.length > 50 ? bufferLabel.slice(0, 47) + "..." : bufferLabel,
      type: "buffer",
      note: "Catch up notes, breath, decompress before the next thing.",
    };

    // Insert after the meeting at i+1
    result.splice(i + 1, 0, bufferSlot);

    // Cascade-shift subsequent unlocked slots forward.
    // Each slot's time is set to max(its current time, prev slot's time + 1 min),
    // so duplicates resolve and slots maintain chronological order. The final
    // rebalance pass after all inserters compresses the gaps to correct durations.
    let prevTime = nextStart + 15; // buffer end as initial floor
    for (let j = i + 2; j < result.length; j++) {
      const s = result[j];
      if (s.locked) {
        // Hit a locked slot — stop cascading (locks are anchors)
        break;
      }
      const sMin = parseSlotTimeMinutes(s.time);
      if (sMin < prevTime) {
        // Push forward by AT LEAST 1 min so it doesn't collide; rebalance will
        // tighten this up to the correct duration after.
        result[j] = { ...s, time: formatSlotMinutes(prevTime) };
        prevTime = prevTime + 1;
      } else {
        // Already in order — but advance prevTime so the next iteration tracks correctly
        prevTime = sMin + 1;
        // Don't break — there might still be later collisions with this new prevTime
        // if a duplicate exists further down. Continue scanning conservatively.
      }
    }
  }
  return result;
}

// Enforces the daily end-of-day pair: EXACTLY 4:30 PM "Wrap & tomorrow prep" +
// EXACTLY 4:45 PM "Close for the day". Both slots are LOCKED so they cannot be
// cascaded over.
//
// - Any wrap/close-keyword slots are REMOVED first (regardless of their current time)
// - Then canonical 4:30 + 4:45 slots are inserted
// - Anything past 5:00 PM is stripped
// - Anything in 4:30–5:00 that's not the canonical pair is dropped
function ensureEndOfDayBlocks(slots) {
  if (!Array.isArray(slots)) return slots;
  let result = [...slots];

  // ── STEP 1: REMOVE ALL wrap/close-related slots regardless of time.
  // We always replace them with canonical versions to guarantee exact times.
  const wrapKeywords = ["wrap", "tomorrow prep"];
  const closeKeywords = ["close for the day", "close out", "closeout", "end of day", "end-of-day", "shutdown", "logoff", "log off"];
  result = result.filter(s => {
    const lab = (s.label || "").toLowerCase();
    const isWrap = wrapKeywords.some(kw => lab.includes(kw));
    const isClose = closeKeywords.some(kw => lab.includes(kw));
    return !isWrap && !isClose;
  });

  // ── STEP 2: STRIP any slots that start at or after 5:00 PM (workday is over)
  result = result.filter(s => {
    const t = parseSlotTimeMinutes(s.time);
    return t < 0 || t < 17 * 60;
  });

  // ── STEP 3: STRIP any unlocked slots whose start is in the 4:30–5:00 PM window
  // (they would overlap our canonical wrap/close blocks).
  result = result.filter(s => {
    if (s.locked) return true; // keep locked slots regardless (e.g., real meeting)
    const t = parseSlotTimeMinutes(s.time);
    if (t < 0) return true;
    return t < 16 * 60 + 30; // keep only slots starting before 4:30 PM
  });

  // ── STEP 4: Insert canonical wrap at EXACTLY 4:30 PM
  const wrapSlot = {
    time: formatSlotMinutes(16 * 60 + 30),
    label: "Wrap & tomorrow prep",
    type: "buffer",
    note: "Close tabs, jot tomorrow's first thing, send any final messages.",
    locked: true,
  };
  let wrapInsertAt = result.findIndex(s => parseSlotTimeMinutes(s.time) > 16 * 60 + 30);
  if (wrapInsertAt < 0) wrapInsertAt = result.length;
  result.splice(wrapInsertAt, 0, wrapSlot);

  // ── STEP 5: Insert canonical close at EXACTLY 4:45 PM
  const closeSlot = {
    time: formatSlotMinutes(16 * 60 + 45),
    label: "Close for the day",
    type: "break",
    note: "You did the thing. Step away. 🌙",
    locked: true,
  };
  let closeInsertAt = result.findIndex(s => parseSlotTimeMinutes(s.time) > 16 * 60 + 45);
  if (closeInsertAt < 0) closeInsertAt = result.length;
  result.splice(closeInsertAt, 0, closeSlot);

  // ── STEP 6: If there's a LOCKED meeting after 4:30 PM (real-world calendar
  // conflict), the wrap/close still need to coexist. We don't currently handle
  // that elegantly — meetings should be scheduled before EOD anyway. If this
  // becomes an issue, add late-meeting handling here.

  return result;
}

// Detects gaps > 30 min between consecutive slots (where current slot's intended
// END is more than 30 min before next slot's start) and inserts an "Open work
// time" placeholder so the user sees the unscheduled time explicitly. Without
// this, lunch (or any fixed-duration slot) followed by a locked meeting prep
// could leave a 50-min visual hole in the day.
//
// The placeholder is type:"work", unlocked, with a friendly editable label.
// User can rename, retype, or repurpose it. On the next refine/regenerate it
// will be replaced or merged based on what Rosie generates.
function fillPhantomGaps(slots) {
  if (!Array.isArray(slots) || slots.length < 2) return slots;
  const result = [...slots];
  const GAP_THRESHOLD = 30; // min — insert placeholder for gaps strictly greater than this
  const MAX_REASONABLE_GAP = 8 * 60; // 8 hours — anything larger is corrupted data, don't fill
  // Walk from end to start so insertions don't shift indices we haven't processed
  for (let i = result.length - 2; i >= 0; i--) {
    const slot = result[i];
    const next = result[i + 1];
    const startMin = parseSlotTimeMinutes(slot.time);
    const nextMin = parseSlotTimeMinutes(next.time);
    if (startMin < 0 || nextMin < 0) continue;
    // Determine current slot's actual end based on intended duration (or gap if no fixed duration)
    const fixedDur = intendedFixedDuration(slot);
    let slotEnd;
    if (fixedDur != null) {
      slotEnd = startMin + fixedDur;
    } else {
      // No fixed duration — slot fills to next, so no phantom gap by definition
      continue;
    }
    const gap = nextMin - slotEnd;
    // Sanity: skip negative gaps (next is before current end — array order
    // corruption, the heal needs to fix that first) AND skip absurdly-large
    // gaps (>8 hrs means the data is broken, not a real schedule gap).
    if (gap <= 0 || gap > MAX_REASONABLE_GAP) continue;
    if (gap > GAP_THRESHOLD) {
      // Insert "Open work time" placeholder spanning the gap
      const placeholder = {
        time: formatSlotMinutes(slotEnd),
        label: "Open work time",
        type: "work",
        note: "Unscheduled — pull in something from your task list, or rename this block.",
        locked: false,
      };
      result.splice(i + 1, 0, placeholder);
    }
  }
  return result;
}

// ── rebalanceRoadmap ─────────────────────────────────────────────────────
// User-triggered "fix the timing" repair. Two passes:
//   1. Align: pull every UNLOCKED slot to start exactly when the previous
//      slot ends (where "ends" = prev.start + intendedFixedDuration(prev),
//      or for flexible work blocks just prev's existing position since
//      they fill to next by definition). Eliminates gaps where movable
//      slots could be slid backward.
//   2. Fill: for any remaining gap > 5 min between a fixed-duration slot
//      and a LOCKED slot (the case pass 1 can't fix — neither side can
//      move), insert an "Open work time" placeholder spanning the gap.
//
// Conservative on purpose: doesn't change slot durations, doesn't delete
// slots, doesn't reorder. The user keeps full control — if there are 5-min
// fragment slots from past snoozes, those stay (with their times realigned)
// and the user can delete them manually via the row × if they want.
function rebalanceRoadmap(slots) {
  if (!Array.isArray(slots) || slots.length < 2) return slots;
  const PLACEHOLDER_GAP_MIN = 5; // min gap that triggers a placeholder

  // ── Pass 1: alignment ──
  let result = slots.map(s => ({ ...s }));
  for (let i = 1; i < result.length; i++) {
    const prev = result[i - 1];
    const cur = result[i];
    const prevStart = parseSlotTimeMinutes(prev.time);
    if (prevStart < 0) continue;
    const prevFixedDur = intendedFixedDuration(prev);
    // prev's end: explicit if known, else use current cur.start (flexible prev
    // ends where cur begins — no information about a "different intended end").
    const prevEnd = prevFixedDur != null
      ? prevStart + prevFixedDur
      : parseSlotTimeMinutes(cur.time);
    const curStart = parseSlotTimeMinutes(cur.time);
    if (curStart < 0) continue;
    if (cur.locked) {
      // Locked: anchor. If prev's fixed-duration end overlaps it, truncate prev.
      if (prevFixedDur != null && prevEnd > curStart && !prev.locked) {
        prev.durationMin = Math.max(0, curStart - prevStart);
      }
      // else: gap remains (handled in pass 2) or no overlap.
    } else {
      // Unlocked: slide to prev's end.
      cur.time = formatSlotMinutes(prevEnd);
    }
  }

  // ── Heal pass (between alignment and gap-fill) ──
  // CRITICAL: heal must run BEFORE the placeholder insertion in pass 2, NOT
  // after. healSlots step 2 drops unlocked "Open work time" placeholders —
  // if we healed after inserting them, we'd silently delete the work we just
  // did, and the button would look like it did nothing. (This is exactly the
  // bug Lexy hit on the first rev: rebalance ran, then healSlots wiped it.)
  // Running heal here cleans up the alignment result (sort, dedup, etc.)
  // without touching the placeholders, which don't exist yet.
  result = healSlots(result);

  // ── Pass 2: fill remaining gaps before locked slots ──
  // Walk back-to-front so insertions don't shift indices we haven't visited.
  // No further heal call after — the splice keeps order intact and the
  // placeholders need to survive in the final output.
  for (let i = result.length - 1; i >= 1; i--) {
    const cur = result[i];
    const prev = result[i - 1];
    if (!cur.locked) continue;
    const prevStart = parseSlotTimeMinutes(prev.time);
    const curStart = parseSlotTimeMinutes(cur.time);
    if (prevStart < 0 || curStart < 0) continue;
    const prevFixedDur = intendedFixedDuration(prev);
    if (prevFixedDur == null) continue; // flexible prev — fills naturally
    const prevEnd = prevStart + prevFixedDur;
    const gap = curStart - prevEnd;
    if (gap >= PLACEHOLDER_GAP_MIN) {
      const placeholder = {
        time: formatSlotMinutes(prevEnd),
        label: "Open work time",
        type: "work",
        note: "Filled by rebalance — rename this block or delete if not needed.",
        locked: false,
      };
      result.splice(i, 0, placeholder);
    }
  }

  return result;
}

function autoLockMeetingSlot(slot) {
  if (!slot || typeof slot !== "object") return slot;
  if (slot.locked) return slot; // already locked
  if (isMeetingSlot(slot)) {
    return { ...slot, locked: true };
  }
  if (slot.type === "blocked") {
    return { ...slot, locked: true };
  }
  return slot;
}

// ── Reconciliation data model ────────────────────────────────────────────
// Tracks how each past slot actually went — separate from the binary
// "completedSlots" because we want richer signal: did you do it, do part of
// it, skip it, or do something else entirely? This drives the reconciliation
// prompts (3 surfaces: on-transition, gentle card, end-of-day) and the small
// status dot shown next to past slots in the roadmap.
//
// Data shape (added to the roadmap object):
//   completedSlots: number[]        — UNCHANGED. Indices marked done OR partial.
//                                     Anything reconciled as "done" or "partial"
//                                     goes here so existing math/progress UI
//                                     still works without refactor across the
//                                     8+ read sites.
//   partialSlots: { [idx]: number } — NEW. idx → percent (1-99). Only entries
//                                     reconciled as "partial". 100% would just
//                                     be "done", 0% would just be "skipped".
//   slotReconciliation: { [idx]: {  — NEW. The full reconciliation entry.
//     status: "done"|"partial"|"skipped"|"elsewhere",
//     percent?: number,             — only for "partial"
//     actualWork?: string,          — only for "elsewhere" — what they did
//     actualWorkItemId?: string,    — only for "elsewhere" — picked from items
//     ts: number,                   — when reconciled
//   }}

const RECON_STATUSES = {
  done:      { label: "Did it",                emoji: "✓", color: "#7a9e78", bg: "rgba(158,184,154,0.18)", border: "rgba(158,184,154,0.45)" },
  partial:   { label: "Partial",               emoji: "◐", color: "#a8855c", bg: "rgba(196,168,130,0.18)", border: "rgba(196,168,130,0.45)" },
  skipped:   { label: "Skipped",               emoji: "⊘", color: "rgba(74,53,64,0.55)", bg: "rgba(74,53,64,0.06)", border: "rgba(74,53,64,0.18)" },
  elsewhere: { label: "Did something else",    emoji: "🔀", color: "#9878b8", bg: "rgba(184,160,212,0.15)", border: "rgba(184,160,212,0.4)" },
};

// Shift the reconciliation maps (completedSlots, partialSlots, slotReconciliation)
// atomically when a slot is inserted or deleted. Returns a partial roadmap
// object you can spread into the existing onUpdateRoadmap call. This replaces
// the ~8 ad-hoc places in the file that previously only shifted completedSlots —
// they'd silently desync partialSlots/slotReconciliation otherwise.
function shiftSlotMaps(roadmap, action, atIdx) {
  const completed = roadmap.completedSlots || [];
  const partial = roadmap.partialSlots || {};
  const recon = roadmap.slotReconciliation || {};
  if (action === "delete") {
    const newCompleted = completed.filter(i => i !== atIdx).map(i => i > atIdx ? i - 1 : i);
    const newPartial = {};
    for (const [k, v] of Object.entries(partial)) {
      const i = Number(k);
      if (i === atIdx) continue;
      newPartial[i > atIdx ? i - 1 : i] = v;
    }
    const newRecon = {};
    for (const [k, v] of Object.entries(recon)) {
      const i = Number(k);
      if (i === atIdx) continue;
      newRecon[i > atIdx ? i - 1 : i] = v;
    }
    return { completedSlots: newCompleted, partialSlots: newPartial, slotReconciliation: newRecon };
  }
  // action === "insert"
  const newCompleted = completed.map(i => i >= atIdx ? i + 1 : i);
  const newPartial = {};
  for (const [k, v] of Object.entries(partial)) {
    const i = Number(k);
    newPartial[i >= atIdx ? i + 1 : i] = v;
  }
  const newRecon = {};
  for (const [k, v] of Object.entries(recon)) {
    const i = Number(k);
    newRecon[i >= atIdx ? i + 1 : i] = v;
  }
  return { completedSlots: newCompleted, partialSlots: newPartial, slotReconciliation: newRecon };
}

// Find past slots whose end time has passed and which haven't been either
// completed OR reconciled (status entry exists). These are the candidates
// for the reconciliation prompts.
function getUnreconciledPastSlots(roadmap, nowMin) {
  if (!roadmap || !Array.isArray(roadmap.slots)) return [];
  const recon = roadmap.slotReconciliation || {};
  const completed = new Set(roadmap.completedSlots || []);
  const result = [];
  for (let idx = 0; idx < roadmap.slots.length; idx++) {
    const slot = roadmap.slots[idx];
    const startMin = parseSlotTimeMinutes(slot.time);
    if (startMin < 0) continue;
    const fixedDur = intendedFixedDuration(slot);
    const next = roadmap.slots[idx + 1];
    const nextStart = next ? parseSlotTimeMinutes(next.time) : -1;
    const endMin = fixedDur != null
      ? startMin + fixedDur
      : (nextStart > startMin ? nextStart : startMin + 30);
    if (endMin > nowMin) continue; // not past yet
    if (completed.has(idx)) continue; // already marked done
    if (recon[idx]) continue; // already explicitly reconciled
    result.push({ idx, slot, startMin, endMin });
  }
  return result;
}

// General-purpose remap for arbitrary index changes (e.g. drag reorder).
// idxMap is a Map<oldIdx, newIdx>; entries mapped to undefined or -1 are dropped.
function remapSlotMaps(roadmap, idxMap) {
  const completed = roadmap.completedSlots || [];
  const newCompleted = completed.map(i => idxMap.get(i)).filter(i => i !== undefined && i !== -1);
  const partial = roadmap.partialSlots || {};
  const newPartial = {};
  for (const [k, v] of Object.entries(partial)) {
    const newK = idxMap.get(Number(k));
    if (newK !== undefined && newK !== -1) newPartial[newK] = v;
  }
  const recon = roadmap.slotReconciliation || {};
  const newRecon = {};
  for (const [k, v] of Object.entries(recon)) {
    const newK = idxMap.get(Number(k));
    if (newK !== undefined && newK !== -1) newRecon[newK] = v;
  }
  return { completedSlots: newCompleted, partialSlots: newPartial, slotReconciliation: newRecon };
}

// Apply a reconciliation choice to a roadmap. Returns the new roadmap object
// to pass to onUpdateRoadmap. Centralizes the data-model writes so the three
// surfaces (transition modal, gentle card, EOD) all behave identically.
function applyReconciliation(roadmap, idx, choice) {
  const next = { ...roadmap };
  const completed = new Set(next.completedSlots || []);
  const partial = { ...(next.partialSlots || {}) };
  const recon = { ...(next.slotReconciliation || {}) };
  const ts = Date.now();

  // Clean previous state for this index (any of these maps might have it)
  completed.delete(idx);
  delete partial[idx];

  if (choice.status === "done") {
    completed.add(idx);
    recon[idx] = { status: "done", ts };
  } else if (choice.status === "partial") {
    // Partials count toward completedSlots so existing progress/math is preserved
    completed.add(idx);
    partial[idx] = Math.max(1, Math.min(99, Math.round(choice.percent || 50)));
    recon[idx] = { status: "partial", percent: partial[idx], ts };
  } else if (choice.status === "skipped") {
    recon[idx] = { status: "skipped", ts };
  } else if (choice.status === "elsewhere") {
    recon[idx] = {
      status: "elsewhere",
      actualWork: (choice.actualWork || "").trim() || null,
      actualWorkItemId: choice.actualWorkItemId || null,
      ts,
    };
  }

  next.completedSlots = Array.from(completed);
  next.partialSlots = partial;
  next.slotReconciliation = recon;
  return next;
}

// ── Overview ──────────────────────────────────────────────────────────────────
// ── Embedded Roadmap Card (in Overview) ──────────────────────────────────────
// ── Slot Helpers (time math + rebalancing) ────────────────────────────────────
// Convert "9:30 AM" / "10:00 AM" / "1:15 PM" to minutes since midnight
function parseSlotTimeMinutes(timeStr) {
  if (!timeStr) return -1;
  const m = String(timeStr).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return -1;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = (m[3] || "").toUpperCase();
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

// Convert minutes back to "9:30 AM" format
function formatSlotMinutes(mins) {
  if (mins < 0) mins = 0;
  if (mins >= 24 * 60) mins = 24 * 60 - 15;
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

// Shift the roadmap forward by `mins` minutes starting at (and including) the
// given slot. Used when a break/lunch "Snooze" extends time, or when a
// transition-modal snooze defers the next slot. Behavior:
//   1. Extends the snoozed slot's durationMin by `mins`.
//   2. Pushes every SUBSEQUENT non-locked slot's start time forward by `mins`.
//      Locked slots stay put.
//   3. If a non-locked slot now overlaps a LATER locked slot (because the
//      locked slot didn't move), truncates the non-locked slot's duration so
//      it ends right when the locked slot starts. We never overlap locked
//      time, and we never push locked slots.
//   4. Caps any slot at end-of-day (24:00). Slots that get pushed past
//      midnight have their duration zeroed (caller can decide what to do
//      with that — heal pipeline will clean up).
// Pure function: returns a new slots array, doesn't mutate the input.
function shiftRoadmapAfterSnooze(slots, snoozeSlotIdx, mins) {
  if (!Array.isArray(slots) || snoozeSlotIdx < 0 || snoozeSlotIdx >= slots.length || !mins || mins <= 0) {
    return slots;
  }
  const DAY_END_MIN = 24 * 60;
  const result = slots.map(s => ({ ...s }));

  // 1. Extend the snoozed slot. CRITICAL: only set durationMin explicitly for
  //    slots that ALREADY have a fixed duration (breaks, lunch, meetings, etc.
  //    — anything intendedFixedDuration returns a number for). For flexible
  //    work blocks, leaving durationMin unset means the cascade in step 2 will
  //    naturally extend the slot's displayed duration (which is gap-to-next).
  //    Setting durationMin on a flexible work block FREEZES it at that value —
  //    e.g. a 30-min work block snoozed by 5 used to become "5 min fixed" (its
  //    durationMin was undefined, so `(undefined || 0) + 5 = 5`), creating the
  //    fragment-and-gap mess.
  const snoozed = result[snoozeSlotIdx];
  const snoozedFixedDur = intendedFixedDuration(snoozed);
  if (snoozedFixedDur != null) {
    snoozed.durationMin = snoozedFixedDur + mins;
  }
  // For flexible slots, do nothing — the push in step 2 widens its gap-to-next.

  // 2. Push subsequent non-locked slots forward.
  for (let i = snoozeSlotIdx + 1; i < result.length; i++) {
    if (!result[i].locked) {
      const oldStart = parseSlotTimeMinutes(result[i].time);
      if (oldStart >= 0) {
        result[i].time = formatSlotMinutes(oldStart + mins);
      }
    }
  }

  // 3. Resolve collisions where a non-locked slot now overlaps a locked one.
  for (let i = 0; i < result.length - 1; i++) {
    const cur = result[i];
    const next = result[i + 1];
    const curStart = parseSlotTimeMinutes(cur.time);
    const nextStart = parseSlotTimeMinutes(next.time);
    if (curStart < 0 || nextStart < 0) continue;
    const curEnd = curStart + (cur.durationMin || 0);
    if (curEnd > nextStart && next.locked && !cur.locked) {
      cur.durationMin = Math.max(0, nextStart - curStart);
    }
  }

  // 4. Cap at end-of-day.
  for (let i = 0; i < result.length; i++) {
    const s = result[i];
    const start = parseSlotTimeMinutes(s.time);
    if (start < 0) continue;
    if (start >= DAY_END_MIN) {
      s.durationMin = 0;
    } else if (start + (s.durationMin || 0) > DAY_END_MIN) {
      s.durationMin = DAY_END_MIN - start;
    }
  }

  // 5. Run the heal pipeline as a defensive final pass. The algorithm above
  //    shouldn't produce broken/duplicate slots, but if a caller passes a
  //    pre-corrupted array this ensures we don't return one.
  return healSlots(result);
}

// Returns the intended fixed duration in minutes for slots that should always
// have a known length regardless of the gap to the next slot. Used by the
// display formatters so that brain breaks always show 15m, "Close for the day"
// always shows 15m, etc. — even when the underlying time gap drifts.
// Returns null for slots without a fixed intended duration (work blocks, lunch,
// meetings — those use the natural gap-to-next-slot).
function intendedFixedDuration(slot) {
  if (!slot) return null;
  // EXPLICIT durationMin field takes priority — set when meetings are pre-placed
  // by parseMeetingsFromText / buildMeetingSlots, or when user specifies via UI.
  if (typeof slot.durationMin === "number" && slot.durationMin > 0) {
    return slot.durationMin;
  }
  const label = (slot.label || "").toLowerCase();
  // Close for the day — always 15 min, ends at 5:00 PM
  if (label.includes("close for the day") || label.includes("close out") ||
      label.includes("closeout") || label.includes("end of day") ||
      label.includes("end-of-day") || label.includes("shutdown") ||
      label.includes("logoff") || label.includes("log off")) return 15;
  // Brain breaks (morning + afternoon) — always 15 min
  if (label.includes("brain break") || label.includes("morning brain") ||
      label.includes("afternoon brain") || label.includes("morning stretch") ||
      label.includes("afternoon stretch") || label.includes("morning reset") ||
      label.includes("afternoon reset") || label.includes("morning break") ||
      label.includes("afternoon break") || label.includes("stretch & reset") ||
      label.includes("walk & reset")) return 15;
  // Wrap & tomorrow prep — always 15 min
  if (label.includes("wrap") && label.includes("tomorrow")) return 15;
  // Morning meeting prep block — always 30 min (set by ensureMorningMeetingPrep).
  // Must come BEFORE the generic "prep for" check below since this label also
  // starts with "prep for".
  if (label.includes("prep for today") || label.includes("prep for the day") ||
      label.includes("daily meeting prep") || label.includes("meetings prep")) return 30;
  // Meeting prep buffers — always 10 min (set by ensureMeetingPrepBlocks)
  if (label.startsWith("prep for ")) return 10;
  // Post-meeting breather buffers — always 15 min (set by ensureMeetingBreathers)
  if (label.startsWith("buffer after ") || label.startsWith("breather") ||
      label.startsWith("decompress")) return 15;
  // Morning settle-in buffer — always 15 min (per Rosie's prompt: "Always start with a 15-min morning buffer")
  // Matches: "Morning buffer", "Morning buffer & settle in", "Settle in", "Morning settle in", "Reorient & settle in"
  if (label.startsWith("morning buffer") || label.startsWith("settle in") ||
      label.startsWith("morning settle") || label.includes("settle in") ||
      label.startsWith("reorient")) return 15;
  // Lunch — default 60 min unless user has explicitly shortened it via end-time
  // edit (which sets slot.durationMin, handled at the top of this function).
  // Without this, lunch's display duration grew to fill any phantom gap to the
  // next slot (e.g. 1h 50m if Prep for Demo was locked at 1:50 PM).
  if (label === "lunch" || label.startsWith("lunch ") || label.startsWith("lunch:")) return 60;
  return null;
}

// Returns "9:00–10:00 AM" style range from a slot's start time and the next slot's start time.
// If next is in same AM/PM, collapses to "9:00–10:00 AM". If different (10:00 AM → 1:00 PM),
// keeps both: "10:00 AM–1:00 PM". If no next slot, defaults to start + 30 min
// (or the slot's intended fixed duration if it has one — e.g. close-out is 15m).
function formatSlotTimeRange(slots, idx) {
  if (!slots || !slots[idx]) return "";
  const startMin = parseSlotTimeMinutes(slots[idx].time);
  if (startMin < 0) return slots[idx].time || "";
  let endMin;
  // Fixed-duration slots use their intended length, BUT cap at next slot's start
  // if a later locked slot would create an overlap.
  const fixedDur = intendedFixedDuration(slots[idx]);
  const nextMin = idx + 1 < slots.length ? parseSlotTimeMinutes(slots[idx + 1].time) : -1;
  if (fixedDur != null) {
    endMin = startMin + fixedDur;
    if (nextMin >= 0 && endMin > nextMin) endMin = nextMin;
  } else if (nextMin >= 0) {
    endMin = nextMin;
  } else {
    endMin = startMin + 30;
  }
  if (endMin <= startMin) endMin = startMin + 15;
  const startTime = formatSlotMinutes(startMin);
  const endTime = formatSlotMinutes(endMin);
  const startMatch = startTime.match(/^(.+?)\s*(AM|PM)$/i);
  const endMatch = endTime.match(/^(.+?)\s*(AM|PM)$/i);
  if (startMatch && endMatch && startMatch[2].toUpperCase() === endMatch[2].toUpperCase()) {
    return `${startMatch[1]}–${endTime}`;
  }
  return `${startTime}–${endTime}`;
}

// Reorder a slots array AND rebalance unlocked times based on durations.
// Locked slots (slot.locked === true) keep their original time, others flow around them.
// Returns "1h", "45m", "1h 30m" — the duration of slot at idx based on next slot's start
function formatSlotDuration(slots, idx) {
  if (!slots || !slots[idx]) return "";
  const startMin = parseSlotTimeMinutes(slots[idx].time);
  if (startMin < 0) return "";
  let endMin;
  // Fixed-duration slots (brain breaks, close-out, wrap) usually show their
  // intended length. BUT if a later locked slot is placed BEFORE this slot's
  // natural end, we cap at that boundary — otherwise the duration label
  // would visually overlap the next slot.
  const fixedDur = intendedFixedDuration(slots[idx]);
  const nextMin = idx + 1 < slots.length ? parseSlotTimeMinutes(slots[idx + 1].time) : -1;
  if (fixedDur != null) {
    endMin = startMin + fixedDur;
    if (nextMin >= 0 && endMin > nextMin) endMin = nextMin;
  } else if (nextMin >= 0) {
    endMin = nextMin;
  } else {
    endMin = startMin + 30;
  }
  if (endMin <= startMin) return "";
  const total = endMin - startMin;
  const hrs = Math.floor(total / 60);
  const mins = total % 60;
  if (hrs && mins) return `${hrs}h ${mins}m`;
  if (hrs) return `${hrs}h`;
  return `${mins}m`;
}

function reorderAndRebalanceSlots(originalSlots, fromIdx, toIdx) {
  if (fromIdx === toIdx) return originalSlots;
  // Reorder first
  const reordered = originalSlots.slice();
  const [moved] = reordered.splice(fromIdx, 1);
  reordered.splice(toIdx, 0, moved);
  // Then run full rebalance pass
  return rebalanceSlotTimes(reordered, originalSlots);
}

// Pure rebalance pass — recomputes times for all slots based on:
//   - The first slot's time (or 9:00 AM default) as the anchor start
//   - Each slot's natural duration (computed from the ORIGINAL pre-change ordering when available)
//   - Locked slots stay anchored to their explicit time
// Used after drag, delete, or any operation that changes slot count/order.
function rebalanceSlotTimes(slots, originalSlotsForDurations) {
  if (!slots || slots.length === 0) return slots;
  const reference = originalSlotsForDurations || slots;

  // Compute duration of each slot from the reference (chronologically sorted).
  // Priority order:
  //   1. slot.durationMin field (set explicitly by buildMeetingSlots for pre-placed meetings)
  //   2. intendedFixedDuration (brain breaks 15m, prep buffers 10m, breathers 15m, etc.)
  //   3. gap to next slot (for flexible work blocks)
  const sortedRef = reference.slice().sort((a, b) => parseSlotTimeMinutes(a.time) - parseSlotTimeMinutes(b.time));
  const durationByLabel = new Map();
  sortedRef.forEach((s, i) => {
    const start = parseSlotTimeMinutes(s.time);
    let dur;
    if (typeof s.durationMin === "number" && s.durationMin > 0) {
      // PRE-PLACED slot with explicit duration (meetings, locked anchor blocks)
      dur = s.durationMin;
    } else {
      const fixedDur = intendedFixedDuration(s);
      if (fixedDur != null) {
        dur = fixedDur;
      } else {
        const next = i + 1 < sortedRef.length ? parseSlotTimeMinutes(sortedRef[i + 1].time) : start + 30;
        dur = Math.max(15, next - start);
      }
    }
    durationByLabel.set(`${s.label}|${s.type}|${s.time}`, dur);
  });

  // Process slots in INPUT ORDER (preserves drag-drop and manual reorders).
  // Cursor flows forward from the first slot. Locked slots HARD-RESPECT their
  // assigned times (snap cursor to lockedTime regardless of direction) so
  // meetings, lunch, and EOD blocks can't drift.
  let cursor = parseSlotTimeMinutes(slots[0].time);
  if (cursor < 0) cursor = 9 * 60;

  const result = slots.map((slot, i) => {
    const key = `${slot.label}|${slot.type}|${slot.time}`;
    const dur = durationByLabel.get(key) ?? 30;
    if (slot.locked) {
      // HARD-RESPECT locked time: snap cursor to lockedTime regardless of direction.
      // Protects meetings, lunch, and EOD blocks from being bumped forward when
      // prior slots run over (the prior slot just gets visually squeezed).
      const lockedTime = parseSlotTimeMinutes(slot.time);
      if (lockedTime >= 0) cursor = lockedTime;
      const out = { ...slot, time: formatSlotMinutes(cursor) };
      cursor += dur;
      return out;
    }
    // First slot anchors at its original time
    if (i === 0) {
      const t = parseSlotTimeMinutes(slot.time);
      if (t >= 0) cursor = t;
      cursor += dur;
      return { ...slot };
    }
    // Other slots: flow from cursor (resolves duplicates and phantom gaps)
    const out = { ...slot, time: formatSlotMinutes(cursor) };
    cursor += dur;
    return out;
  });
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// CANONICAL SLOT TRANSFORMS
// ─────────────────────────────────────────────────────────────────────────────
// Two principled functions that REPLACE the scattered ad-hoc pipeline:
//
//   healSlots(slots)         — minimal corruption fixes only.
//                              Drops broken auto-placeholders, dedups duplicate
//                              locked preps, sorts by time, rebalances. Preserves
//                              user content & user-locked state. Idempotent.
//                              Used by the on-render self-heal — runs every time
//                              the slot array changes, no-op if already clean.
//
//   canonicalizeSlots(slots) — full rule enforcement.
//                              Runs heal, then applies all the rule helpers
//                              (required breaks, EOD blocks, meeting prep/breather
//                              buffers, morning prep). Used by Generate / Refine /
//                              "Re-apply rules". Treats input as INTENT, regenerates
//                              auto-artifacts deterministically. Idempotent.
//
// Invariants both functions guarantee on output:
//   • Sorted by time (ascending)
//   • No two slots at the same time + same role (preps deduped)
//   • Every slot has a valid parseable time and non-empty label
//   • All user-locked slots preserved
//   • Output array is freshly allocated (input not mutated)

// HEAL — minimal fixes, no new content. Idempotent.
// Normalize a slot.time that may have been incorrectly stored as a range
// (e.g. "3:30 — 4:00 PM" from the old follow-ups slot bug). All slots should
// store only their START time. Range format breaks parseSlotTimeMinutes,
// which then breaks the whole timing cascade.
function normalizeSlotTime(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return timeStr;
  // Range pattern: "H:MM [AM|PM] – H:MM AM|PM" (any of -, –, —)
  const rangeMatch = timeStr.match(/^\s*(\d{1,2}):(\d{2})\s*(AM|PM)?\s*[–—\-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s*$/i);
  if (!rangeMatch) return timeStr;
  const [, startH, startM, startAmPm, endH, , endAmPm] = rangeMatch;
  // If start already has AM/PM explicitly, trust it.
  if (startAmPm) return `${startH}:${startM} ${startAmPm.toUpperCase()}`;
  const startHN = parseInt(startH, 10);
  const endHN = parseInt(endH, 10);
  const endAmPmU = endAmPm.toUpperCase();
  // Noon-crossover heuristic: end is PM and start hour > end hour →
  // start is AM (e.g. "11:30 — 1:00 PM" means 11:30 AM).
  let inheritedAmPm = endAmPmU;
  if (endAmPmU === "PM" && startHN > endHN) inheritedAmPm = "AM";
  return `${startH}:${startM} ${inheritedAmPm}`;
}

function healSlots(rawSlots) {
  if (!Array.isArray(rawSlots) || rawSlots.length === 0) return [];

  // STEP 0: Normalize range-format slot.time values (e.g. "3:30 — 4:00 PM" → "3:30 PM").
  // Self-heals any slots saved during the follow-ups range-bug window before
  // downstream pipeline steps run parseSlotTimeMinutes on them.
  rawSlots = rawSlots.map(s => {
    if (!s || typeof s !== "object" || !s.time) return s;
    const normalized = normalizeSlotTime(s.time);
    return normalized === s.time ? s : { ...s, time: normalized };
  });

  // STEP 1: Filter out structurally invalid slots (no time, no label)
  let slots = rawSlots.filter(s => {
    if (!s || typeof s !== "object") return false;
    if (parseSlotTimeMinutes(s.time) < 0) return false;
    if (!s.label || typeof s.label !== "string") return false;
    return true;
  });

  // STEP 2: Drop auto-generated "Open work time" placeholders unless user-locked.
  // These are derived from gaps — we'll regenerate them later via fillPhantomGaps.
  // If a user explicitly locked one (renamed it, set duration, etc.), preserve it.
  slots = slots.filter(s => {
    if (s.userLocked) return true;
    const lbl = (s.label || "").toLowerCase();
    return !(lbl === "open work time" && s.type === "work" && !s.locked);
  });

  // STEP 3: Dedup duplicate-time prep slots. When two locked "Prep for X" slots
  // collide at the same minute, keep the more SPECIFIC one. The generic
  // "Prep for today's meetings" loses to specific "Prep for [Meeting Name]".
  const seenPreps = new Map(); // startMin → array index in result
  const deduped = [];
  for (const s of slots) {
    const lbl = (s.label || "").toLowerCase();
    const isPrep = (s.type === "buffer" || s.type === "break") && lbl.startsWith("prep for");
    const start = parseSlotTimeMinutes(s.time);
    if (isPrep && seenPreps.has(start)) {
      // Conflict — pick more specific
      const existingIdx = seenPreps.get(start);
      const existing = deduped[existingIdx];
      const existingLbl = (existing.label || "").toLowerCase();
      const existingIsGeneric = existingLbl.includes("today") || existingLbl.includes("the day") || existingLbl.includes("daily meeting");
      const newIsGeneric = lbl.includes("today") || lbl.includes("the day") || lbl.includes("daily meeting");
      if (existingIsGeneric && !newIsGeneric) {
        deduped[existingIdx] = s; // replace generic with specific
      }
      // else: keep existing, drop new
      continue;
    }
    if (isPrep) seenPreps.set(start, deduped.length);
    deduped.push(s);
  }
  slots = deduped;

  // STEP 4: Sort by time. Single source of truth for chronology.
  slots = slots.slice().sort((a, b) => parseSlotTimeMinutes(a.time) - parseSlotTimeMinutes(b.time));

  // STEP 5: Rebalance — flow cursor through unlocked, hard-respect locks.
  // This resolves any remaining time inconsistencies.
  slots = rebalanceSlotTimes(slots, slots);

  return slots;
}

// CANONICALIZE — full rule enforcement, regenerates auto-artifacts. Idempotent.
function canonicalizeSlots(rawSlots) {
  if (!Array.isArray(rawSlots)) return [];

  // PHASE A: Start with healed input — clean foundation.
  let slots = healSlots(rawSlots);

  // PHASE B: Lock meetings (must come before helpers that shift unlocked slots).
  slots = slots.map(s => autoLockMeetingSlot(s));

  // PHASE C: Apply each rule. Each helper is idempotent on its own — running
  // them in sequence on clean input produces a complete schedule.
  slots = ensureRequiredBreaks(slots);
  slots = ensureMorningMeetingPrep(slots);
  slots = ensureMeetingPrepBlocks(slots);
  // CLEANUP: drop any squeezed prep buffers (<3 min duration) — these are
  // leftovers from before the dedup logic was tightened. A 1-min "prep" slot
  // doesn't serve any purpose and clutters the timeline. We compute duration
  // from the next slot's start time minus this slot's start time.
  slots = slots.filter((s, idx) => {
    const sLabel = (s.label || "").toLowerCase();
    const isPrepBuffer = (s.type === "buffer" || s.type === "break") &&
      (sLabel.startsWith("prep for") || sLabel.endsWith(" prep"));
    if (!isPrepBuffer) return true;
    // Effective duration = next slot's start - this slot's start (or
    // s.durationMin if last in list)
    const sStart = parseSlotTimeMinutes(s.time);
    const nextStart = idx + 1 < slots.length ? parseSlotTimeMinutes(slots[idx + 1].time) : sStart + (Number(s.durationMin) || 10);
    const effectiveDur = nextStart - sStart;
    return effectiveDur >= 3;
  });
  slots = ensureMeetingBreathers(slots);
  slots = ensureEndOfDayBlocks(slots);

  // PHASE D: Final lock pass + sort + rebalance + gap fill.
  slots = slots.map(s => autoLockMeetingSlot(s));
  slots = slots.slice().sort((a, b) => parseSlotTimeMinutes(a.time) - parseSlotTimeMinutes(b.time));
  slots = rebalanceSlotTimes(slots, slots);
  slots = fillPhantomGaps(slots);

  // PHASE E: Defensive final sort. rebalanceSlotTimes can pull the cursor
  // backward when a locked slot has an earlier time than the current
  // cursor (see lines ~1945-1950) — that's by design for drag-reordered
  // schedules, but it can re-introduce chronological disorder if upstream
  // emitted a locked work block with a bad time. fillPhantomGaps doesn't
  // sort either. So we sort once more here and re-rebalance to guarantee
  // the array we hand back is strictly chronological. Cheap insurance.
  slots = slots.slice().sort((a, b) => parseSlotTimeMinutes(a.time) - parseSlotTimeMinutes(b.time));
  slots = rebalanceSlotTimes(slots, slots);

  return slots;
}

// ── FOLLOW-UPS FEATURE ────────────────────────────────────────────────────────
// Identifies items that need a check-in message today and generates pre-drafted
// templates. Sources: (A) waiting/hold items with check-in reminder due, (B)
// active subtasks/notes containing follow-up verbs. Dedupes per (item, recipient)
// and suppresses items sent in last 3 business days.

// Extract a recipient name from text containing a follow-up verb. Returns null
// if no name can be confidently extracted.
function extractRecipient(text) {
  if (!text) return null;
  const s = String(text).trim();
  const patterns = [
    /\b(?:email|ping|message|dm|text|call|contact)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
    /\b(?:follow\s*up|followup|reach out|circle back|touch base|check in)\s+(?:with\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /\b(?:send|reply|respond)\s+(?:to\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m && m[1]) {
      const name = m[1].trim();
      // Skip generic capitalized words that might appear at sentence start
      if (!["The", "Project", "Team", "Group", "Status", "Today", "Tomorrow", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(name)) {
        return name;
      }
    }
  }
  return null;
}

// Recent-send suppression — after marking sent, don't re-suggest the item
// for 3 business days. Avoids the "I just emailed you yesterday" nag loop.
function isWithinRecentSendWindow(item) {
  if (!item || !item.lastFollowUpSentAt) return false;
  const sent = new Date(item.lastFollowUpSentAt);
  const now = new Date();
  let businessDays = 0;
  const cursor = new Date(sent);
  while (cursor < now) {
    cursor.setDate(cursor.getDate() + 1);
    const dow = cursor.getDay();
    if (dow >= 1 && dow <= 5) businessDays++;
    if (businessDays >= 3) return false; // window expired
  }
  return businessDays < 3;
}

// Business days between two YYYY-MM-DD strings (used for "waiting since" age).
function businessDaysBetweenISO(fromISO, toISO) {
  if (!fromISO || !toISO) return 0;
  const from = new Date(fromISO + "T00:00:00");
  const to = new Date(toISO + "T00:00:00");
  if (from >= to) return 0;
  let days = 0;
  const cursor = new Date(from);
  while (cursor < to) {
    cursor.setDate(cursor.getDate() + 1);
    const dow = cursor.getDay();
    if (dow >= 1 && dow <= 5) days++;
  }
  return days;
}

// Identify follow-ups for today.
// Sources:
//   A) Items in waiting/hold with check-in reminder due today/overdue,
//      OR no reminder but waitingSince/holdSince > 3 business days ago.
//   B) Subtasks (incomplete) or notes containing follow-up verbs.
// Dedup: one follow-up per (itemId, recipient). Source B can attach a
// recipient (extracted from text); source A leaves recipient null for the
// user to fill in. Reasons get merged across sources for the same key.
function identifyFollowUps(items, reminders, todayISO) {
  if (!Array.isArray(items)) return [];
  const today = todayISO || new Date().toISOString().slice(0, 10);
  const FOLLOWUP_VERBS = /\b(follow.?up|email|ping|message|reach out|circle back|touch base|check in with|send to|reply to|respond to|contact|dm)\b/i;

  // Index reminders by itemId for fast lookup
  const remindersByItem = {};
  for (const r of (reminders || [])) {
    if (r && r.type === "item" && r.itemId && r.date && !r.dismissed) {
      (remindersByItem[r.itemId] = remindersByItem[r.itemId] || []).push(r);
    }
  }

  // Dedup map: key = `${itemId}::${recipient || ""}`
  const dedupe = new Map();
  const addFollowUp = (key, fu) => {
    const existing = dedupe.get(key);
    if (existing) {
      // Same item+recipient already added — merge reasons + sources
      const merged = new Set([...existing.reasons, ...fu.reasons]);
      existing.reasons = Array.from(merged);
      for (const src of fu.sources) {
        if (!existing.sources.includes(src)) existing.sources.push(src);
      }
    } else {
      dedupe.set(key, fu);
    }
  };

  for (const item of items) {
    if (!item || item.status === "done" || item.status === "cancelled") continue;
    if (isWithinRecentSendWindow(item)) continue;

    // Source A: waiting/hold items with due reminder or stale since-timestamp
    if (item.status === "waiting" || item.status === "hold") {
      const itemReminders = remindersByItem[item.id] || [];
      const dueReminder = itemReminders.find(r => r.date && r.date <= today);
      const since = item.status === "waiting" ? item.waitingSince : item.holdSince;
      const sinceISO = since ? new Date(since).toISOString().slice(0, 10) : null;
      const sinceBizDays = sinceISO ? businessDaysBetweenISO(sinceISO, today) : 0;
      const isStale = !dueReminder && sinceBizDays >= 3;

      if (dueReminder || isStale) {
        const reason = item.status === "waiting"
          ? `Waiting on reply for ${sinceBizDays || "?"} business day${sinceBizDays === 1 ? "" : "s"}`
          : `On hold for ${sinceBizDays || "?"} business day${sinceBizDays === 1 ? "" : "s"}`;
        addFollowUp(`${item.id}::`, {
          id: uid(),
          itemId: item.id,
          source: "status",
          sources: ["status"],
          title: item.title,
          why: item.why || "",
          recipient: null,
          reasons: [reason],
          sinceBizDays,
          status: "pending",
        });
      }
    }

    // Source B: verb-tagged incomplete subtasks
    const tasks = Array.isArray(item.tasks) ? item.tasks : [];
    const completedTasks = new Set(Array.isArray(item.completedTasks) ? item.completedTasks : []);
    tasks.forEach((task, idx) => {
      if (typeof task !== "string") return;
      if (completedTasks.has(idx)) return;
      if (!FOLLOWUP_VERBS.test(task)) return;
      const recipient = extractRecipient(task);
      addFollowUp(`${item.id}::${recipient || ""}`, {
        id: uid(),
        itemId: item.id,
        source: "task",
        sources: ["task"],
        title: item.title,
        why: item.why || "",
        recipient,
        reasons: [task],
        status: "pending",
      });
    });

    // Source B (cont): notes scanning — pull just the verb-containing sentence
    if (typeof item.notes === "string" && item.notes && FOLLOWUP_VERBS.test(item.notes)) {
      const sentences = item.notes.split(/[.!?\n]+/).map(s => s.trim()).filter(Boolean);
      const verbSentence = sentences.find(s => FOLLOWUP_VERBS.test(s));
      if (verbSentence) {
        const recipient = extractRecipient(verbSentence);
        addFollowUp(`${item.id}::${recipient || ""}`, {
          id: uid(),
          itemId: item.id,
          source: "notes",
          sources: ["notes"],
          title: item.title,
          why: item.why || "",
          recipient,
          reasons: [verbSentence],
          status: "pending",
        });
      }
    }
  }

  return Array.from(dedupe.values());
}

// Generate a heuristic message draft for a follow-up. Phase 2 will replace
// this with an AI-generated personalized draft. For now: short templated
// drafts that get the user 80% of the way there.
function makeHeuristicDraft(followUp) {
  if (!followUp) return "";
  const recipient = followUp.recipient || "[Name]";
  const topic = followUp.title || "this";

  const reasonsBlock = followUp.reasons && followUp.reasons.length > 1
    ? "\n\n" + followUp.reasons.map(r => `• ${r}`).join("\n")
    : followUp.reasons && followUp.reasons.length === 1 && followUp.source !== "status"
      ? `\n\n${followUp.reasons[0]}`
      : "";

  if (followUp.sources.includes("status")) {
    return `Hi ${recipient},\n\nJust circling back on "${topic}" — wondering if you've had a chance to look at this?${reasonsBlock}\n\nThanks!\nLexy`;
  }
  return `Hi ${recipient},\n\nFollowing up on "${topic}":${reasonsBlock}\n\nLet me know your thoughts when you get a chance.\n\nThanks,\nLexy`;
}

// Phase 2 of the follow-ups feature — AI-generated personalized drafts.
// Lazy/on-demand: only fired when user clicks "✨ Improve with Rosie" on a
// follow-up row. Returns {draft} on success or {error} on failure. Caller
// stores the result on the follow-up so we don't re-fetch.
async function suggestFollowUpDraft(followUp, parentItem) {
  if (!followUp) return { error: "empty" };
  const system = `You're Rosie helping Lexy (a Project Coordinator at Fort Financial Federal Credit Union) draft a professional but warm follow-up message.

Rules:
- Tone: professional, friendly, brief — Lexy is warm in writing but not overly casual at work.
- Length: 3-6 short sentences. No throat-clearing.
- Format depends on the source:
  • If "waiting": gentle nudge, acknowledge any time that's passed naturally without making it weird.
  • If "task" or "notes": forward-looking, action-oriented — name what you need.
- Always sign off as "Thanks," / "Lexy"
- If no recipient is known, use "[Name]" as a placeholder.
- Output ONLY the message body — no markdown, no preamble, no explanation, no quotation marks around it.`;

  const reasonsBlock = (followUp.reasons || []).map((r, i) => `${i + 1}. ${r}`).join("\n");
  const userMsg = `Draft a follow-up message:

Recipient: ${followUp.recipient || "[Name]"}
Source: ${followUp.sources.includes("status") ? "waiting on reply (status)" : followUp.sources.includes("task") ? "from a task on this item" : "from notes on this item"}
Item title: "${followUp.title || ""}"
Why it matters: ${parentItem?.why || followUp.why || "(not specified)"}
${followUp.sinceBizDays ? `Days waiting: ${followUp.sinceBizDays} business days` : ""}
Reason${(followUp.reasons || []).length > 1 ? "s" : ""}:
${reasonsBlock}

Draft the message:`;

  let res;
  try {
    res = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        system,
        messages: [{ role: "user", content: userMsg }],
      }),
    }, 20000);
  } catch (e) {
    if (e.name === "AbortError") return { error: "timeout" };
    return { error: "network" };
  }
  if (!res.ok) return { error: "http" };
  let data;
  try { data = await res.json(); } catch { return { error: "badformat" }; }
  const text = data?.content?.[0]?.text?.trim();
  if (!text) return { error: "badformat" };
  // Strip code fences if Rosie wrapped the output
  const cleaned = text.replace(/^```\s*\n?/g, "").replace(/```\s*$/g, "").trim();
  if (!cleaned || cleaned.length < 10) return { error: "badformat" };
  return { draft: cleaned };
}

// Scan free-form meeting notes for follow-up cues. Returns an array of
// candidate sentences that look like commitments to follow up. Used after
// a meeting is marked complete to surface "did you mean to track these?"
// without auto-creating follow-ups (those are noisy if wrong).
function scanMeetingNotesForFollowUps(notes, meeting) {
  if (!notes || typeof notes !== "string") return [];
  // Split into sentences — handle both period+space and line breaks
  const sentences = notes
    .split(/(?<=[.!?])\s+|[\n\r]+/)
    .map(s => s.trim())
    .filter(s => s.length > 8 && s.length < 240); // ignore noise + huge paragraphs
  const verbPatterns = [
    /\bI\s+(?:need to|should|have to|gotta|will|'ll|am going to)\s+(send|email|message|ask|check|tell|reply|reach out|follow up|ping|update|notify|inform|share|write|forward|circle back|loop|get back|chase)/i,
    /\bfollow\s+up\s+(with|on)\b/i,
    /\bcheck\s+(in|back)\s+with\b/i,
    /\b(email|message|ping|text|slack)\s+[A-Z][\w]+/i,
    /\b(ask|tell|update|inform|notify|loop|cc)\s+[A-Z][\w]+/i,
    /\breach\s+out\s+to\b/i,
    /\bcircle\s+back\b/i,
    /\bget\s+back\s+to\s+(them|him|her|me|us|[A-Z][\w]+)/i,
    /\b(send|share)\s+(?:the|that|over)?\s*\w+\s+(to|with)\s+\w+/i,
    /\bwaiting\s+(on|for)\s+[A-Z][\w]+/i,
  ];
  const seen = new Set();
  const candidates = [];
  for (const sentence of sentences) {
    if (seen.has(sentence.toLowerCase())) continue;
    for (const pattern of verbPatterns) {
      if (pattern.test(sentence)) {
        seen.add(sentence.toLowerCase());
        candidates.push({
          id: `mtgfu-${Date.now()}-${candidates.length}`,
          text: sentence.replace(/\s+/g, " ").trim(),
          source: "meeting-notes",
          meetingId: meeting?.id || null,
          meetingTitle: meeting?.title || meeting?.slotLabel || "Meeting",
        });
        break;
      }
    }
  }
  return candidates.slice(0, 10); // cap to avoid overwhelming UI
}

// Insert a follow-up slot into the roadmap's slot array. Targets ~3:30 PM
// (after the afternoon brain break, before wrap & prep tomorrow). If 3:30 PM
// is occupied or unavailable, finds the closest 30-min open window between
// 3:00 PM and 4:15 PM. Returns updated slots array. Does NOT insert if a
// follow-up slot already exists.
function insertFollowUpSlot(slots, followUps) {
  if (!Array.isArray(slots) || !Array.isArray(followUps) || followUps.length === 0) return slots;
  // Already has a follow-up slot? Skip (caller is responsible for refresh logic).
  if (slots.some(s => s && s.type === "followups")) return slots;

  const followUpIds = followUps.map(fu => fu.id);
  const newSlot = {
    time: "3:30 PM",
    type: "followups",
    label: "Follow-ups & loose ends",
    note: "Pre-drafted messages ready to copy + send.",
    durationMin: 30,
    locked: false,
    followUpIds,
  };

  // Find insertion point: just before "Wrap & tomorrow prep" / "Close for the day".
  let insertAt = slots.length;
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    const lbl = (s && s.label) ? String(s.label).toLowerCase() : "";
    if (lbl.includes("wrap") || lbl.includes("close for the day")) {
      insertAt = i;
      break;
    }
  }
  const out = slots.slice(0, insertAt).concat([newSlot]).concat(slots.slice(insertAt));
  return out;
}


// produced a different result and we should persist the canonical version.
function slotsArrayEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i], y = b[i];
    if (x.time !== y.time) return false;
    if (x.label !== y.label) return false;
    if (x.type !== y.type) return false;
    if (!!x.locked !== !!y.locked) return false;
    if (!!x.userLocked !== !!y.userLocked) return false;
  }
  return true;
}
