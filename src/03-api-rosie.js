// 03-api-rosie.js
// Claude API integration: Rosie chat, planTaskDatesWithAI, ROSIE_TOOLS, generateRoadmap, refineRoadmap.


// ── Claude API (Rosie) ────────────────────────────────────────────────────────
async function askRosie(messages, systemPrompt, maxTokens = 1000) {
  const res = await fetch("/api/rosie", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens, system: systemPrompt, messages }),
  });
  const data = await res.json();
  return data.content?.find(b => b.type === "text")?.text || "Still here with you 🌸 — Rosie";
}

// Build a compact summary string of Lexy's pacing history for Rosie. Used
// to ground time estimates in actual measured performance instead of pure
// rules-of-thumb. Returns "" when there isn't enough data — caller can
// safely concat with no effect. Top 5 categories with ≥3 data points;
// keeps the prompt small (~10 lines max). Mirrors the leaderboard analyzer.
function summarizeTimingHistoryForRosie(timingHistory) {
  if (!Array.isArray(timingHistory) || timingHistory.length < 5) return "";
  // Stop-word list matches the leaderboard categorizer
  const filler = new Set(["the","a","an","and","or","but","with","for","to","on","in","of","at","by","is","are","was","were","be","been","being","have","has","had","do","does","did","this","that","these","those","my","your","work","task","block","time","session","quick","brief","short","long","start","starts","continue","continues","wrap","finish","finishing","doing"]);
  const categorize = (label) => {
    if (!label) return "other";
    const words = String(label).toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w && w.length >= 4 && !filler.has(w));
    return words[0] || "other";
  };
  const buckets = {};
  let totalEst = 0, totalActual = 0, totalCount = 0;
  for (const entry of timingHistory) {
    if (!entry || !entry.estimatedMin || !entry.actualMin) continue;
    const cat = categorize(entry.slotLabel);
    if (!buckets[cat]) buckets[cat] = { category: cat, count: 0, est: 0, actual: 0 };
    buckets[cat].count++;
    buckets[cat].est += entry.estimatedMin;
    buckets[cat].actual += entry.actualMin;
    totalEst += entry.estimatedMin;
    totalActual += entry.actualMin;
    totalCount++;
  }
  if (totalCount < 5 || totalEst === 0) return "";
  const overallPct = Math.round(((totalActual - totalEst) / totalEst) * 100);
  const rows = Object.values(buckets)
    .filter(b => b.count >= 3 && b.est > 0)
    .map(b => ({ ...b, pct: Math.round(((b.actual - b.est) / b.est) * 100), avgEst: Math.round(b.est / b.count), avgActual: Math.round(b.actual / b.count) }))
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
    .slice(0, 5);
  const lines = [];
  lines.push(`LEXY'S MEASURED PACING (last ${totalCount} tracked tasks, weight your estimates accordingly):`);
  lines.push(`- Overall: ${overallPct > 0 ? "+" : ""}${overallPct}% vs plan (${overallPct > 0 ? "tends to run over" : overallPct < 0 ? "tends to come in under" : "on plan"}).`);
  if (rows.length > 0) {
    lines.push("- By category (keyword):");
    for (const r of rows) {
      const sign = r.pct > 0 ? "+" : "";
      lines.push(`  • "${r.category}": avg ${r.avgEst}m planned → ${r.avgActual}m actual (${sign}${r.pct}%, n=${r.count})`);
    }
    lines.push("- When a new task contains one of these keywords, lean toward the measured average.");
  }
  return lines.join("\n");
}

async function estimateTaskTimes(tasks, itemTitle, opts = {}) {
  const historySummary = opts.historySummary || "";
  const systemPrompt = [
    "You estimate realistic focused-work time for Lexy (Project Coordinator, Implementation team at Fort Financial Credit Union). She works on Verafin (fraud), Zoho (CRM), Arkatechture (analytics), Movemint (lending), and similar systems.",
    "",
    "Return ONLY a JSON array of numbers (minutes per task). Example: [15,30,45,20]",
    "",
    "TIME BANDS (for ADHD-aware focused work):",
    "- Quick coordination (send email, schedule meeting, confirm): 10-15 min",
    "- Review/respond to existing material: 15-30 min",
    "- Meetings themselves: 30-60 min typical",
    "- Drafting documents from scratch: 30-60 min",
    "- Complex technical work (config, testing, integrations): 45-90 min",
    "- Training/presenting to a group: 45-90 min",
    "",
    "CALIBRATION RULES:",
    "- Be REALISTIC, not optimistic. Tasks usually take longer than people think.",
    "- If a task sounds vague (\"work on X\"), lean longer — the scope is probably bigger than stated.",
    "- If a task involves another person responding, estimate only Lexy's active time (not the waiting).",
    "- Cap any single task at 90 min — anything bigger should be split.",
    "- Default to 15 when genuinely unclear.",
    historySummary ? "" : null,
    historySummary || null,
  ].filter(s => s !== null).join("\n");

  const res = await fetch("/api/rosie", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: `Item: "${itemTitle}"\nTasks:\n${tasks.map((t,i)=>`${i+1}. ${t}`).join("\n")}` }],
    }),
  });
  const data = await res.json();
  const text = data.content?.find(b => b.type === "text")?.text || "[]";
  try { const arr = JSON.parse(text.replace(/```json|```/g,"").trim()); return Array.isArray(arr)?arr.map(n=>Number(n)||15):tasks.map(()=>15); }
  catch { return tasks.map(()=>15); }
}

// ── fetchWithTimeout ──────────────────────────────────────────────────
// Wraps fetch with an AbortController so a stalled request can't hang
// forever. On timeout the promise rejects with a clearly-named error
// (err.name === "AbortError") so callers can show a "took too long" message
// instead of spinning indefinitely. Default 30s — generous enough for a
// real model call, short enough that a dead request gives up on its own.
//
// Reusable on purpose: there are ~20 raw API fetches in this file with no
// timeout. This helper is the pattern to migrate them to over time; for now
// planTaskDatesWithAI (the one Lexy hits) uses it.
async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// AI-powered task date planning — respects dependencies, response cadence, workday realities
async function planTaskDatesWithAI(itemTitle, tasks, taskTimes, startDate, dueDate, taskDates = [], itemContext = {}, workloadByDate = null) {
  // Identify which tasks are locked to a specific date — Rosie should plan AROUND them
  const fixedTasks = tasks.map((t, i) => {
    const td = taskDates[i];
    if (td?.fixed && td?.date) return { idx: i, title: t, date: td.date };
    return null;
  }).filter(Boolean);

  // ── Clamp startDate to tomorrow at earliest ──
  // If the caller passed a past/today startDate (often happens on older items
  // with stale ranges), bump it forward so Rosie never returns past dates.
  // The bump is mentioned in the returned note so Lexy knows what happened.
  const today = todayStr();
  const tomorrow = shiftOffWeekend(addDaysToDateStr(today, 1));
  const originalStart = startDate;
  let effectiveStart = startDate;
  let startWasBumped = false;
  if (!effectiveStart || effectiveStart <= today) {
    effectiveStart = tomorrow;
    startWasBumped = true;
  }
  // If due ends up before the bumped start, push due forward by a sensible
  // default (1 week from start). Better than failing silently.
  let effectiveDue = dueDate;
  if (!effectiveDue || effectiveDue < effectiveStart) {
    effectiveDue = addDaysToDateStr(effectiveStart, 7);
  }

  const systemPrompt = [
    "You are Rosie, a realistic project planner helping Lexy (Project Coordinator, Implementation team at a credit union) sequence her tasks across a date range AND suggest any missing subtasks she'll need.",
    "",
    "RULES:",
    "- Return ONLY a JSON object, no markdown, no preamble.",
    '- Shape: {"dates": ["YYYY-MM-DD", ...], "note": "one-sentence explanation", "suggestedNewTasks": [{"title": "...", "estimateMin": 30}, ...]}',
    '- The dates array MUST have exactly the same length as the number of EXISTING tasks given.',
    "- Use only weekdays (Mon-Fri). Never schedule on Sat/Sun.",
    `- HARD RULE: ALL dates must be ${tomorrow} or later. NEVER schedule for ${today} (today) or any past date. Lexy needs lead time.`,
    "- First date must be >= start date. Last date must be <= due date.",
    "- 🔒 LOCKED tasks have a fixed date that you MUST NOT change. Output their exact date. Plan all other tasks AROUND them.",
    "- Respect DEPENDENCIES: parenthetical hints like (after X is created) or obvious sequencing.",
    "- Respect RESPONSE CADENCE: if someone has to review/reply, leave 1-2 business days before the next dependent task.",
    "- WEIGHT by time estimate: give longer tasks more breathing room.",
    "- Cluster quick prep tasks early; leave the final day for the main-event task.",
    "",
    "SUGGESTING NEW TASKS:",
    "- ALWAYS evaluate whether the existing task list is COMPLETE for what the item describes. The item title + 'why' fields tell you the goal.",
    "- If steps are MISSING (common ones for the work type, follow-ups, prep work, validation, testing, communication), suggest 1-5 new subtasks via the 'suggestedNewTasks' array.",
    "- If existing tasks already cover the work well, return an empty array for suggestedNewTasks.",
    "- Each suggested task: title under 12 words, estimateMin between 5 and 90.",
    "- Suggested tasks should be CONCRETE actions, not vague ('Review notes' bad, 'Pull license list from Zoho admin' good).",
    "- Don't duplicate what's already in the task list.",
    "",
    "- The note should be 1 sentence max in a warm, ADHD-aware voice. If you suggested new tasks, briefly mention what's missing (e.g. 'Spread these out and added a few prep steps you'll likely need').",
  ].join("\n");

  // ── Workload context ──
  // Show Rosie a per-weekday view of what's ALREADY on Lexy's calendar across
  // the planning range — other active items + recurring meetings. Helps Rosie
  // avoid piling on already-busy days. Only included if the caller passed data.
  const workloadLines = [];
  if (workloadByDate && typeof workloadByDate === "object") {
    const entries = Object.entries(workloadByDate).sort(([a], [b]) => a < b ? -1 : 1);
    if (entries.length > 0) {
      workloadLines.push("");
      workloadLines.push("LEXY'S CURRENT WORKLOAD across the planning range (excluding this item):");
      workloadLines.push("Aim for ≤2 new tasks per day on days with 3+ existing commitments. Spread tasks toward lighter days.");
      for (const [date, { items, meetings }] of entries) {
        const dt = new Date(date + "T12:00:00");
        const weekday = dt.toLocaleString("en-US", { weekday: "short" });
        const total = items + meetings;
        const label = total === 0 ? "open" : `${items} item${items === 1 ? "" : "s"}${meetings > 0 ? ` + ${meetings} recurring meeting${meetings === 1 ? "" : "s"}` : ""}`;
        workloadLines.push(`  ${weekday} ${date}: ${label}`);
      }
    }
  }

  const contextLines = [];
  if (itemContext.why) contextLines.push(`Why: ${itemContext.why}`);
  if (itemContext.done) contextLines.push(`Done when: ${itemContext.done}`);

  const userMsg = [
    `Item: ${itemTitle}`,
    ...contextLines,
    `Start date: ${effectiveStart}${startWasBumped ? ` (bumped from ${originalStart || "empty"} — past/today not allowed)` : ""}`,
    `Due date: ${effectiveDue}`,
    `Today's date (do NOT schedule here or earlier): ${today}`,
    ...workloadLines,
    "",
    "Existing tasks (title — time estimate):",
    ...tasks.map((t, i) => {
      const fixed = fixedTasks.find(f => f.idx === i);
      const lockTag = fixed ? ` 🔒 LOCKED to ${fixed.date} (cannot change)` : "";
      return `${i + 1}. ${t} — ${taskTimes[i] || 15}m${lockTag}`;
    }),
    fixedTasks.length ? "" : null,
    fixedTasks.length ? `IMPORTANT: ${fixedTasks.length} task(s) are LOCKED to specific dates. Output those EXACT dates and plan the other tasks around them respecting dependencies.` : null,
    "",
    "Plan realistic dates for each EXISTING task. Also evaluate whether new subtasks are needed to fully accomplish this work — suggest them in 'suggestedNewTasks'.",
  ].filter(l => l !== null).join("\n");

  let res;
  try {
    res = await fetchWithTimeout("/api/rosie", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: "user", content: userMsg }],
      }),
    }, 30000);
  } catch (e) {
    // AbortError = our 30s timeout fired. Anything else = network failure.
    // Either way, return a typed result so the caller can show a real message
    // instead of leaving the button spinning forever.
    if (e && e.name === "AbortError") {
      console.error("[planTaskDatesWithAI] timed out after 30s");
      return { error: "timeout" };
    }
    console.error("[planTaskDatesWithAI] network error:", e);
    return { error: "network" };
  }
  if (!res.ok) {
    console.error("[planTaskDatesWithAI] HTTP error:", res.status, await res.text().catch(() => ""));
    return { error: "http" };
  }
  let data;
  try {
    data = await res.json();
  } catch (e) {
    // Response wasn't valid JSON at the HTTP level — distinct from Rosie
    // returning text that isn't the JSON shape we want (handled below).
    console.error("[planTaskDatesWithAI] response body not JSON:", e);
    return { error: "badformat" };
  }
  const text = data.content?.find(b => b.type === "text")?.text || "{}";
  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    if (!Array.isArray(parsed.dates)) {
      console.error("[planTaskDatesWithAI] no dates array in response:", parsed);
      return { error: "badformat" };
    }
    // Pad/trim to match task length — more forgiving than strict equality
    const dates = [...parsed.dates];
    while (dates.length < tasks.length) dates.push(dueDate);
    if (dates.length > tasks.length) dates.length = tasks.length;
    // Hard-enforce weekday-only — shift any Sat/Sun → Mon
    let cleanDates = dates.map(d => d ? shiftOffWeekend(d) : d);

    // ── No-past-or-today guard ──
    // Even with the system-prompt rule, Rosie sometimes returns past dates
    // (especially when the requested range straddled today). Post-process to
    // shift any date <= today forward to tomorrow at earliest. Locked-task
    // dates are preserved as-is even if past, since they're user intent.
    const lockedIdxSet = new Set(fixedTasks.map(f => f.idx));
    cleanDates = cleanDates.map((d, i) => {
      if (lockedIdxSet.has(i)) return d; // honor user-locked dates verbatim
      if (!d) return d;
      if (d <= today) return tomorrow;
      return d;
    });

    // Validate suggested new tasks
    const existingTitles = new Set(tasks.map(t => t.toLowerCase().trim()));
    const suggestedNewTasks = Array.isArray(parsed.suggestedNewTasks)
      ? parsed.suggestedNewTasks
        .filter(s => s && typeof s.title === "string" && s.title.trim().length >= 3)
        .filter(s => !existingTitles.has(s.title.toLowerCase().trim())) // dedup against existing
        .slice(0, 5) // cap at 5 suggestions
        .map(s => ({
          title: s.title.trim(),
          estimateMin: Math.max(5, Math.min(90, Number(s.estimateMin) || 30)),
        }))
      : [];

    // Layer the bumped-start nudge onto Rosie's note so Lexy knows what happened
    let finalNote = parsed.note || "";
    if (startWasBumped) {
      const prefix = "Bumped your start to tomorrow since today's already in motion 🌸";
      finalNote = finalNote ? `${prefix} ${finalNote}` : prefix;
    }

    return { dates: cleanDates, note: finalNote, suggestedNewTasks };
  } catch (e) {
    console.error("[planTaskDatesWithAI] JSON parse error:", e, "text was:", text);
    return { error: "badformat" };
  }
}

// ── reshapeNoteToSubtaskTitle ──────────────────────────────────────────
// Turns a free-text detour note into a clean, action-oriented subtask title.
// Used when the user clicks "→ subtask" on a note: Rosie reshapes the note,
// the result is pre-filled in an inline confirm dialog, the user tweaks and
// confirms. Errors are typed (timeout/network/http/badformat) so the caller
// can show a clear message and offer the raw note text as a fallback.
async function reshapeNoteToSubtaskTitle(noteText, parentTaskTitle = "", parentTaskWhy = "") {
  if (!noteText || !noteText.trim()) return { error: "empty" };

  const system = `You're Rosie — a warm ADHD-aware buddy helping turn detour notes into actionable subtasks.

The user logged a note about a task and wants to convert it into a clean subtask title.

Rules:
- Keep it under 12 words
- Start with a verb when possible ("Get feedback on...", "Follow up with...", "Check...")
- Don't add explanations, hedging, or apologies — just the title
- If the note already reads as an action, just tidy it minimally
- Return ONLY the title text — no JSON, no quotes, no preamble, no period at the end`;

  const userMsg = `${parentTaskTitle ? `Parent task: "${parentTaskTitle}"\n` : ""}${parentTaskWhy ? `Why it matters: ${parentTaskWhy}\n` : ""}Note: "${noteText.trim()}"

Subtask title:`;

  let res;
  try {
    res = await fetchWithTimeout("/api/rosie", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 80,
        system,
        messages: [{ role: "user", content: userMsg }],
      }),
    }, 25000);
  } catch (e) {
    if (e && e.name === "AbortError") {
      console.error("[reshapeNoteToSubtaskTitle] timed out");
      return { error: "timeout" };
    }
    console.error("[reshapeNoteToSubtaskTitle] network error:", e);
    return { error: "network" };
  }
  if (!res.ok) {
    console.error("[reshapeNoteToSubtaskTitle] HTTP error:", res.status);
    return { error: "http" };
  }
  let data;
  try {
    data = await res.json();
  } catch (e) {
    console.error("[reshapeNoteToSubtaskTitle] response body not JSON:", e);
    return { error: "badformat" };
  }
  const text = data.content?.find(b => b.type === "text")?.text?.trim() || "";
  if (!text) return { error: "badformat" };
  // Strip any stray quotes / trailing punctuation Rosie might add
  const cleaned = text.replace(/^["'`]+|["'`.]+$/g, "").trim();
  if (!cleaned) return { error: "badformat" };
  return { title: cleaned };
}

// ── suggestFollowupsFromNotes ──────────────────────────────────────────
// Reads ALL notes on a task (task-level + every subtask's log) and suggests
// 1-5 concrete follow-up subtasks. Used by the "✨ Suggest follow-ups"
// button on the FocusView "All notes on this task" summary. Returns up to
// five action-oriented strings. Empty array is a valid result ("nothing
// meaningful to suggest"). Typed errors as usual.
async function suggestFollowupsFromNotes(item, allNotes) {
  if (!item || !Array.isArray(allNotes) || allNotes.length === 0) {
    return { error: "empty" };
  }

  const system = `You're Rosie — a warm ADHD-aware buddy reviewing a project's note log.

Based on the notes logged on a task, suggest 1-5 concrete follow-up subtasks the user should add. Be selective — only suggest things genuinely implied by the notes.

Rules:
- Each suggestion: under 12 words, action-oriented (start with a verb)
- Skip notes that are pure status updates ("Kelly replied") with no clear next action
- Don't invent context — if the notes don't imply something, leave it out
- Don't suggest things that read as already-done

For EACH suggestion, identify which note(s) it came from and report the
source so the user's app can nest the new subtask under the right parent:
- If the suggestion came from a note attached to a subtask, set "source" to
  that subtask's exact text (copy verbatim from the "on subtask:" labels below).
- If the suggestion came from a task-level note (no "on subtask" label), set
  "source" to null.
- If a suggestion synthesizes multiple notes, pick the most directly-relevant
  subtask as the source (or null if it spans the whole task).

Return JSON: { "suggestions": [{ "title": "...", "source": "..." | null }, ...] }
Empty array is fine if nothing actionable jumps out.`;

  const noteSummary = allNotes.map(n => {
    const stamp = n.ts ? new Date(n.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
    const source = n.source ? ` (on subtask: "${n.source}")` : "";
    return `- [${stamp}]${source} ${n.text}`;
  }).join("\n");

  const userMsg = `Task: "${item.title}"
${item.why ? `Why: ${item.why}\n` : ""}${item.done ? `Done when: ${item.done}\n` : ""}
Notes logged:
${noteSummary}

Return JSON only with a "suggestions" array. Each suggestion is an object with "title" and "source" (subtask text or null). 1-5 items, or empty array if nothing actionable.`;

  let res;
  try {
    res = await fetchWithTimeout("/api/rosie", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        system,
        messages: [{ role: "user", content: userMsg }],
      }),
    }, 30000);
  } catch (e) {
    if (e && e.name === "AbortError") {
      console.error("[suggestFollowupsFromNotes] timed out");
      return { error: "timeout" };
    }
    console.error("[suggestFollowupsFromNotes] network error:", e);
    return { error: "network" };
  }
  if (!res.ok) {
    console.error("[suggestFollowupsFromNotes] HTTP error:", res.status);
    return { error: "http" };
  }
  let data;
  try {
    data = await res.json();
  } catch (e) {
    console.error("[suggestFollowupsFromNotes] response body not JSON:", e);
    return { error: "badformat" };
  }
  const text = data.content?.find(b => b.type === "text")?.text || "{}";
  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    if (!Array.isArray(parsed.suggestions)) {
      console.error("[suggestFollowupsFromNotes] no suggestions array:", parsed);
      return { error: "badformat" };
    }
    // Accept both the new object shape {title, source} and the legacy plain
    // string shape — defensive in case the model regresses or Lexy retries
    // mid-deploy. Plain strings get source = null (treated as task-level).
    const cleaned = parsed.suggestions
      .map(s => {
        if (typeof s === "string") {
          const t = s.replace(/^["'`]+|["'`.]+$/g, "").trim();
          return t ? { title: t, source: null } : null;
        }
        if (s && typeof s === "object" && typeof s.title === "string") {
          const t = s.title.replace(/^["'`]+|["'`.]+$/g, "").trim();
          if (!t) return null;
          const src = (typeof s.source === "string" && s.source.trim()) ? s.source.trim() : null;
          return { title: t, source: src };
        }
        return null;
      })
      .filter(Boolean)
      .slice(0, 5);
    return { suggestions: cleaned };
  } catch (e) {
    console.error("[suggestFollowupsFromNotes] JSON parse error:", e, "text was:", text);
    return { error: "badformat" };
  }
}

// Suggest a new task item to create for an unmatched work block. Called when
// the user clicks the "✨ Create task for this?" pill on a slot that has no
// matching item (and the user hasn't explicitly unlinked it). Returns
// {title, priority, why} on success or {error} on failure — caller falls
// back to a heuristic (label as title, medium priority) if the AI is
// unavailable.
async function suggestTaskFromSlot(slot, existingItems = []) {
  if (!slot || !slot.label) return { error: "empty" };

  const system = `You're Rosie — a warm ADHD-aware buddy at Fort Financial Credit Union, helping Lexy turn an unmatched roadmap block into a new task to track.

The roadmap has a work block with no matching item on Lexy's list yet. Suggest a NEW task that captures what this block is for.

Rules:
- Title: 3-12 words, clear and specific. Start with a verb when natural ("Draft...", "Review...", "Build..."). Avoid generic titles like "Work session" or "Focus time."
- Priority: "high", "medium", or "low" based on the block's context. Default to medium if unclear.
- Why: optional one-line reason this matters (≤15 words). Can be empty string.
- Output ONLY a JSON object — no markdown, no preamble, no explanation.
- Don't duplicate existing items — if the slot's intent matches something already on her list, pick a title that's clearly distinct.`;

  const activeList = (existingItems || [])
    .filter(i => i && i.status !== "done" && i.status !== "cancelled")
    .slice(0, 20)
    .map(i => `- ${i.title}${i.priority === "high" ? " (high)" : ""}`)
    .join("\n") || "(no items yet)";

  const userMsg = `Roadmap block:
- Time: ${slot.time || "(unknown)"}
- Label: "${slot.label}"
- Note: ${slot.note ? `"${slot.note}"` : "(none)"}
- Duration: ${slot.durationMin ? `${slot.durationMin} min` : "(unknown)"}

Lexy's existing active items:
${activeList}

Suggest the NEW task:`;

  let res;
  try {
    res = await fetchWithTimeout("/api/rosie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 250,
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

  // Strip ```json fences if Rosie included them
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (!parsed || typeof parsed !== "object") return { error: "badformat" };
    const title = (parsed.title || "").toString().trim();
    if (!title) return { error: "badformat" };
    const priority = ["high", "medium", "low"].includes(parsed.priority) ? parsed.priority : "medium";
    const why = (parsed.why || "").toString().trim();
    return { title, priority, why };
  } catch (e) {
    console.error("[suggestTaskFromSlot] JSON parse error:", e, "text was:", text);
    return { error: "badformat" };
  }
}

// Suggest a "park until" date for an item being moved to parked status.
// Rosie considers the item's title, why, priority, and last activity to
// suggest a sensible resurface date. Returns {date: "YYYY-MM-DD", reason}
// on success or {error} on failure. Caller falls back to "+2 weeks" if
// the AI is unavailable.
async function suggestParkUntilDate(item) {
  if (!item || !item.title) return { error: "empty" };
  const system = `You're Rosie helping Lexy park a task. Lexy is choosing NOT to work on this right now (not blocked — just deferred by choice). Suggest a sensible "park until" date for it to resurface.

Rules:
- Date format: "YYYY-MM-DD" (must be a future date)
- Default: 2 weeks out, mid-week (Tuesday-Thursday) to avoid Monday/Friday pile-ups
- Adjust shorter (1 week) for high-priority items
- Adjust longer (4-6 weeks) for low-priority or "someday" items
- Reason: one short sentence explaining why this timing makes sense
- Output ONLY a JSON object — no markdown, no preamble`;
  const todayISO = new Date().toISOString().slice(0, 10);
  const userMsg = `Item to park:
- Title: "${item.title}"
- Why it matters: ${item.why || "(not specified)"}
- Priority: ${item.priority || "medium"}
- Status before parking: ${item.status || "todo"}
- Today's date: ${todayISO}

Suggest the park-until date:`;
  let res;
  try {
    res = await fetchWithTimeout("/api/rosie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        system,
        messages: [{ role: "user", content: userMsg }],
      }),
    }, 15000);
  } catch (e) {
    if (e.name === "AbortError") return { error: "timeout" };
    return { error: "network" };
  }
  if (!res.ok) return { error: "http" };
  let data;
  try { data = await res.json(); } catch { return { error: "badformat" }; }
  const text = data?.content?.[0]?.text?.trim();
  if (!text) return { error: "badformat" };
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    const date = (parsed.date || "").toString().trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "badformat" };
    if (date <= todayISO) return { error: "badformat" };
    return { date, reason: (parsed.reason || "").toString().trim() };
  } catch (e) {
    return { error: "badformat" };
  }
}

// Expand a meeting action item into a fleshed-out Work Hub item. Takes
// the raw action item (owner/task/due) + lightweight meeting context, and
// asks Rosie to produce title, why, subtasks, suggested date, priority.
// Returns the structured proposal on success or {error} on failure.
// Heuristic fallback at the caller — this is the "good path" only.
async function expandActionItemToWorkHubItem(actionItem, meetingContext) {
  if (!actionItem || !actionItem.task) return { error: "empty" };
  const todayISO = new Date().toISOString().slice(0, 10);
  const system = `You're Rosie helping Lexy (Project Coordinator at Fort Financial Credit Union) turn a meeting action item into a structured Work Hub task.

OUTPUT ONLY a JSON object with this exact shape — no markdown, no preamble:
{
  "title": "short, action-oriented title (start with a verb, ≤60 chars)",
  "why": "one sentence linking this to the meeting context — why it matters",
  "subtasks": ["concrete step 1", "step 2", "step 3"],
  "taskTimes": [15, 30, 20],
  "suggestedDate": "YYYY-MM-DD or empty string if unclear",
  "priority": "low|medium|high"
}

RULES:
- title: Imperative + specific. "Audit Zoho project list" not "Zoho stuff".
- why: Tie it back to the meeting decision/context. One sentence, no fluff.
- subtasks: 2-5 concrete steps. Real verbs. No subtasks if the task is itself one step.
- taskTimes: One number per subtask in minutes. ADHD-aware: cap any single step at 90 min.
- suggestedDate: Parse the due field intelligently. "End of next week" + today's date = compute it. "TBD" or vague → "". Never set a date in the past. Default to mid-week (Tue-Thu) when ambiguous.
- priority: high if explicit urgency or named risk; medium for most action items; low for nice-to-haves.`;

  const ctx = [
    `Today: ${todayISO}`,
    meetingContext?.title ? `Meeting: "${meetingContext.title}"` : "",
    meetingContext?.date ? `Meeting date: ${meetingContext.date}` : "",
    meetingContext?.summary ? `Meeting summary: ${meetingContext.summary.slice(0, 400)}` : "",
    "",
    "Action item to expand:",
    `- Owner: ${actionItem.owner || "Unassigned"}`,
    `- Task: ${actionItem.task}`,
    `- Due: ${actionItem.due || "TBD"}`,
  ].filter(Boolean).join("\n");

  let res;
  try {
    res = await fetchWithTimeout("/api/rosie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        system,
        messages: [{ role: "user", content: ctx }],
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
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    const result = {
      title: String(parsed.title || actionItem.task).slice(0, 100).trim(),
      why: String(parsed.why || "").trim(),
      subtasks: Array.isArray(parsed.subtasks) ? parsed.subtasks.map(s => String(s).trim()).filter(Boolean).slice(0, 8) : [],
      taskTimes: [],
      suggestedDate: "",
      priority: ["low", "medium", "high"].includes(parsed.priority) ? parsed.priority : "medium",
    };
    // Sanitize taskTimes — must match subtasks length, cap at 90, default 15
    if (Array.isArray(parsed.taskTimes)) {
      result.taskTimes = result.subtasks.map((_, i) => {
        const n = Number(parsed.taskTimes[i]);
        return (Number.isFinite(n) && n > 0) ? Math.min(90, Math.round(n)) : 15;
      });
    } else {
      result.taskTimes = result.subtasks.map(() => 15);
    }
    // Sanitize suggestedDate — must be future
    const d = String(parsed.suggestedDate || "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(d) && d >= todayISO) result.suggestedDate = d;
    return result;
  } catch (e) {
    return { error: "badformat" };
  }
}

// Bulk gap-filling helper — looks at a single Work Hub item that's missing
// fields (why, subtasks, taskTimes) and asks Rosie to fill them based on the
// title + historical timing patterns. Deliberately does NOT propose
// scheduledDate — that's a planning decision, not a gap-fill. Returns the
// proposal or {error}. Heuristic fallback lives at the caller.
async function proposeTaskFills(item, historySummary) {
  if (!item || !item.title) return { error: "empty" };
  const gaps = {
    why: !item.why || !item.why.trim(),
    subtasks: !Array.isArray(item.tasks) || item.tasks.length === 0,
    doneCriteria: !item.done || !item.done.trim(),
    outOfScope: !item.outOfScope || !item.outOfScope.trim(),
    taskTimes: false, // set below — only relevant if subtasks exist
  };
  // Need at least ONE field to be missing to bother calling Rosie
  if (!gaps.why && !gaps.subtasks && !gaps.doneCriteria && !gaps.outOfScope) {
    return { error: "complete" };
  }
  const todayISO = new Date().toISOString().slice(0, 10);
  const system = `You're Rosie helping Lexy (Project Coordinator at Fort Financial Credit Union) fill in MISSING fields on her existing Work Hub tasks. She's done bulk add and now needs the gaps filled.

OUTPUT ONLY a JSON object with this exact shape — no markdown, no preamble:
{
  "why": "one sentence — what's the goal / why this matters (or empty string if already set)",
  "subtasks": ["concrete step 1", "step 2", "step 3"],
  "taskTimes": [15, 30, 20],
  "doneCriteria": "one short phrase — what makes this 'done'",
  "outOfScope": "one short phrase — what's explicitly NOT being done"
}

RULES:
- Only fill fields that are missing. If a field is already set, return empty string / empty array for it (do NOT rewrite existing content).
- why: One concrete sentence linking to a likely goal. No fluff. Use the item title + context.
- subtasks: 2-5 concrete steps, real verbs, in execution order. Empty array if the task is itself a single step.
- taskTimes: One number per subtask in minutes. ADHD-aware: cap at 90 each. Use historical patterns if provided.
- doneCriteria: Short phrase (3-10 words) for the success signal. "Document approved by manager", "all 5 reports filed", "vendor confirmed in writing". Empty if the task is too small to need it.
- outOfScope: Short phrase (3-10 words) naming what's deliberately NOT in scope — to prevent scope creep. "Not redesigning the workflow", "not training the team yet", "no automation this round". Empty if the scope is unambiguous.`;

  const ctxLines = [
    `Today: ${todayISO}`,
    "",
    "Task to fill:",
    `- Title: ${item.title}`,
    `- Status: ${item.status || "todo"}`,
    `- Priority: ${item.priority || "medium"}`,
    item.scheduledDate ? `- Scheduled: ${item.scheduledDate}` : "- Scheduled: TBD",
    `- Current why: ${item.why || "(empty — needs filling)"}`,
    `- Current subtasks: ${gaps.subtasks ? "(none — needs filling)" : item.tasks.map(t => `"${t}"`).join(", ")}`,
    `- Current done-when: ${item.done || "(empty — needs filling)"}`,
    `- Current not-doing: ${item.outOfScope || "(empty — needs filling)"}`,
  ];
  if (historySummary) ctxLines.push("", "Historical patterns:", historySummary.slice(0, 500));

  let res;
  try {
    res = await fetchWithTimeout("/api/rosie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system,
        messages: [{ role: "user", content: ctxLines.join("\n") }],
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
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    const result = {
      why: gaps.why ? String(parsed.why || "").trim() : "",
      subtasks: gaps.subtasks && Array.isArray(parsed.subtasks)
        ? parsed.subtasks.map(s => String(s).trim()).filter(Boolean).slice(0, 8)
        : [],
      taskTimes: [],
      doneCriteria: gaps.doneCriteria ? String(parsed.doneCriteria || "").trim().slice(0, 200) : "",
      outOfScope: gaps.outOfScope ? String(parsed.outOfScope || "").trim().slice(0, 200) : "",
    };
    if (result.subtasks.length > 0) {
      result.taskTimes = result.subtasks.map((_, i) => {
        const n = Number(Array.isArray(parsed.taskTimes) ? parsed.taskTimes[i] : null);
        return (Number.isFinite(n) && n > 0) ? Math.min(90, Math.round(n)) : 15;
      });
    }
    // If we have nothing to actually contribute, treat as failure
    if (!result.why && result.subtasks.length === 0 && !result.doneCriteria && !result.outOfScope) {
      return { error: "empty-proposal" };
    }
    return result;
  } catch (e) {
    return { error: "badformat" };
  }
}

// Bulk audit helper — analyzes an EXISTING Work Hub task (with subtasks,
// dates, history already populated) and proposes adjustments. Different from
// proposeTaskFills (which only fills empty fields) — this looks at what's
// there and suggests what's missing or off. Returns the proposal or {error}.
//   - additionalSubtasks: NEW subtasks to APPEND (empty if existing looks complete)
//   - additionalTaskTimes: per-additional-subtask minute estimates
//   - newDate: suggested new date if current is overdue + stale (empty otherwise)
//   - newDateReason: short why for the date move
//   - concern: one sentence if something's worth flagging but not auto-fixable
async function auditTask(item, historySummary) {
  if (!item || !item.title) return { error: "empty" };
  const todayISO = new Date().toISOString().slice(0, 10);
  const lastUpdatedDaysAgo = item.lastUpdatedAt
    ? Math.floor((Date.now() - item.lastUpdatedAt) / (24 * 60 * 60 * 1000))
    : null;
  const completedCount = Array.isArray(item.completedTasks) ? item.completedTasks.length : 0;
  const subtaskCount = Array.isArray(item.tasks) ? item.tasks.length : 0;
  const isOverdue = item.scheduledDate && item.scheduledDate < todayISO;
  const daysOverdue = isOverdue
    ? Math.floor((new Date(todayISO).getTime() - new Date(item.scheduledDate).getTime()) / (24 * 60 * 60 * 1000))
    : 0;
  const system = `You're Rosie, auditing Lexy's existing Work Hub tasks. Your job: look at what's there and propose ADJUSTMENTS where helpful. Don't propose changes if everything already looks fine.

OUTPUT ONLY a JSON object with this exact shape — no markdown, no preamble:
{
  "additionalSubtasks": ["new subtask 1", "new subtask 2"],
  "additionalTaskTimes": [15, 30],
  "newDate": "YYYY-MM-DD or empty",
  "newDateReason": "short why or empty",
  "dateKeepReason": "short why to keep current date — only set for OVERDUE items where the date should stick",
  "timeAdjustments": [{"subtaskIndex": 0, "newTime": 45, "reason": "based on similar past tasks"}],
  "concern": "one sentence to flag or empty"
}

RULES:
- additionalSubtasks: ONLY if existing subtask list is clearly missing key steps. 0-3 new subtasks. Empty array if existing looks complete.
- additionalTaskTimes: one number per additional subtask, capped at 90.
- newDate: Set in any of these cases:
    (a) Item is TBD/undated — propose a sensible date based on priority + workload patterns. Default to mid-week (Tue-Thu) within next 1-2 weeks for medium priority, sooner for high.
    (b) Clearly overdue with no signs of recent activity — propose a realistic new date.
    (c) Current date mismatched with the work (e.g. "Q4 task" scheduled for Q1).
   Must be future. Empty if (a/b/c) don't apply.
- newDateReason: 5-10 word reason. Empty if not setting.
- dateKeepReason: ONLY for OVERDUE items where the date should STAY put — gives Lexy explicit reassurance. 5-12 words. Empty if (a) not overdue, OR (b) you're recommending a move (use newDateReason instead), OR (c) you don't have a clear view.
- timeAdjustments: Per-existing-subtask time tweaks. Only suggest when the current estimate looks materially wrong (>50% off) compared to historical patterns. Each entry: {subtaskIndex (0-based), newTime (minutes, ≤90), reason (5-10 words)}. Empty array if existing times look fine. NEVER suggest adjustments without a reason grounded in historical data.
- concern: ONE short sentence flagging something that needs Lexy's attention but isn't auto-fixable. Examples: "60 days overdue with zero progress — consider parking", "scope feels too big — split?", "depends on Aaron, hasn't responded yet". Empty if nothing to flag.
- When everything looks fine, return all empty fields — that's the right answer.`;

  const ctxLines = [
    `Today: ${todayISO}`,
    "",
    "Task to audit:",
    `- Title: ${item.title}`,
    `- Why: ${item.why || "(empty)"}`,
    `- Status: ${item.status || "todo"}`,
    `- Priority: ${item.priority || "medium"}`,
    `- Scheduled: ${item.scheduledDate || "TBD"}${isOverdue ? ` (${daysOverdue}d overdue)` : ""}`,
    `- Subtasks (${subtaskCount}, ${completedCount} done): ${subtaskCount > 0 ? item.tasks.map((t, i) => `\n    ${(item.completedTasks || []).includes(t) ? "✓" : "○"} ${t}${item.taskTimes?.[i] ? ` (${item.taskTimes[i]}m)` : ""}`).join("") : "(none)"}`,
    lastUpdatedDaysAgo != null ? `- Last edited: ${lastUpdatedDaysAgo}d ago` : "",
  ].filter(Boolean);
  if (historySummary) ctxLines.push("", "Historical patterns:", historySummary.slice(0, 500));

  let res;
  try {
    res = await fetchWithTimeout("/api/rosie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system,
        messages: [{ role: "user", content: ctxLines.join("\n") }],
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
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    const result = {
      additionalSubtasks: Array.isArray(parsed.additionalSubtasks)
        ? parsed.additionalSubtasks.map(s => String(s).trim()).filter(Boolean).slice(0, 5)
        : [],
      additionalTaskTimes: [],
      newDate: "",
      newDateReason: "",
      dateKeepReason: "",
      timeAdjustments: [],
      concern: String(parsed.concern || "").trim(),
    };
    if (result.additionalSubtasks.length > 0) {
      result.additionalTaskTimes = result.additionalSubtasks.map((_, i) => {
        const n = Number(Array.isArray(parsed.additionalTaskTimes) ? parsed.additionalTaskTimes[i] : null);
        return (Number.isFinite(n) && n > 0) ? Math.min(90, Math.round(n)) : 15;
      });
    }
    // newDate must be a valid future ISO date
    const d = String(parsed.newDate || "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(d) && d > todayISO) {
      result.newDate = d;
      result.newDateReason = String(parsed.newDateReason || "").trim();
    } else if (isOverdue) {
      // Overdue + no move proposed → use the keep-date reason (if Rosie set one).
      // This is the "stick with current date" affirmation Lexy asked for.
      result.dateKeepReason = String(parsed.dateKeepReason || "").trim();
    }
    // timeAdjustments: validate each entry and sanitize
    if (Array.isArray(parsed.timeAdjustments)) {
      const subtaskLen = Array.isArray(item.tasks) ? item.tasks.length : 0;
      result.timeAdjustments = parsed.timeAdjustments
        .map(ta => {
          const idx = Number(ta?.subtaskIndex);
          const newTime = Number(ta?.newTime);
          if (!Number.isInteger(idx) || idx < 0 || idx >= subtaskLen) return null;
          if (!Number.isFinite(newTime) || newTime <= 0) return null;
          // Skip if the new time is the same (or extremely close) to current — Rosie's not actually suggesting a change
          const currentTime = Number(item.taskTimes?.[idx]) || 0;
          if (currentTime > 0 && Math.abs(newTime - currentTime) < 5) return null;
          return {
            subtaskIndex: idx,
            currentTime,
            newTime: Math.min(90, Math.round(newTime)),
            reason: String(ta?.reason || "").trim().slice(0, 100),
          };
        })
        .filter(Boolean)
        .slice(0, 6);
    }
    // If nothing was proposed, treat as a "no-op" audit (still useful info, not an error)
    const hasAnyProposal = result.additionalSubtasks.length > 0
      || result.newDate
      || result.dateKeepReason
      || result.timeAdjustments.length > 0
      || result.concern;
    if (!hasAnyProposal) return { error: "no-proposals" };
    return result;
  } catch (e) {
    return { error: "badformat" };
  }
}

// Classify a running-thread entry — Lexy drops a quick note for someone
// (e.g. Josh), and Rosie tags it with urgency + type so urgent ones can
// route to the reminder card while the rest accumulate for the 1:1.
//   - urgency: "today" | "thisweek" | "wait" (default: wait for the 1:1)
//   - type: "idea" | "update" | "question" | "issue"
//   - summary: short headline for the digest (max 80 chars)
// Weekly observations — Rosie reviews the past 7 days of activity and surfaces
// 2-3 useful observations. Runs once per week, typically Monday morning,
// gated by data.weeklyObservations?.weekOf so we don't re-fire. Conservative:
// returns empty observations if nothing notable. NEVER suggests new tools or
// agents — those decisions belong to Lexy, not auto-proposals.
//
// Input shape gathered by caller:
//   activitySummary: {
//     completedCount, completedTitles[], staleItems[], overdueCount,
//     threadCaptures, focusMinutes, mostFrequentProject?, etc.
//   }
//
// Output: { observations: [{ id, text, category, severity }], summary? }
//   category: "pattern" | "concern" | "win" | "note"
//   severity: "info" | "warn"
// ── Agent System ────────────────────────────────────────────────────────────
// General-purpose agent infrastructure. Each agent is a focused AI helper
// that drafts SOMETHING for Lexy to review — never auto-acts, never connects
// to external systems, always produces output Lexy reviews + uses manually.
//
// Architecture:
//   - AGENT_REGISTRY: defines available agents (id, label, icon, prompt, output schema)
//   - runAgent: universal runner — handles API call, structured parsing, logging
//   - Output shape: { fields: {...}, reviewNotes: [...], rawText? }
//   - Logging: every run writes to data.agentLog (capped at 200 by pruner)
//
// HARD RULES (built into the system, not optional):
//   1. Every output includes reviewNotes — things to double-check before using
//   2. No agent ever auto-sends, auto-saves, or auto-acts. Output is draft only.
//   3. No agent connects to external systems. Pure text in, pure text out.
//   4. Per Fort Financial AUP: agents never prompt for NPI, never accept
//      member data, and never store sensitive internal info.
//
// Each agent has its own prompt + output schema. Adding a new agent = adding
// one entry to AGENT_REGISTRY + writing the prompt. No infrastructure work needed.

const AGENT_REGISTRY = {
  // Generic task summary — Phase 1 placeholder agent. Proves the system end-to-end.
  // Works on any task. Saturday we register real ones (drafter, etc).
  "task-summary": {
    id: "task-summary",
    label: "Quick task summary",
    icon: "📋",
    description: "A short summary of this task — useful for status updates or recall",
    inputLabel: "Optional — any extra context to include (or leave empty to use task fields alone)",
    inputPlaceholder: "e.g. 'Focus on the vendor side, this is for Josh's update'",
    inputMinLength: 0, // can run without input
    fields: [
      { id: "summary", label: "Summary", type: "textarea", editable: true },
      { id: "currentState", label: "Current state", type: "text", editable: true },
    ],
    systemPrompt: `You're Rosie, Lexy's AI sidekick. She wants a short, accurate summary of a task — concise enough for a status update, honest enough that she can trust it.

OUTPUT ONLY JSON — no markdown, no preamble:
{
  "fields": {
    "summary": "2-3 sentences describing what the task is and where it stands. Past tense for completed parts, present tense for in-flight.",
    "currentState": "one short phrase capturing today's state (e.g. 'Blocked on vendor', 'In progress', 'Waiting on Josh review')"
  },
  "reviewNotes": [
    { "id": "rn-<random>", "field": "summary" | "currentState", "concern": "what to double-check before using this", "severity": "info" | "warn" }
  ]
}

TONE:
- Casual, factual, no hype. Like a colleague summarizing for another colleague.
- Skip throat-clearing. Get to the substance.

REVIEW NOTES RULES (the important part — Lexy explicitly asked for these):
- Flag any name you mention as "warn" — "Verify Aaron is the right Aaron and the spelling is correct."
- Flag any date or deadline as "warn" — "I said 'next Friday' — confirm that's the right week."
- Flag any assumption you made as "info" — "I assumed this is for Verafin based on the title."
- Flag uncertain status as "warn" — "I said 'in progress' — verify against your latest notes."
- If there's truly nothing to flag, return reviewNotes: []. Don't manufacture concerns.
- 2-4 review notes max.

CONSTRAINTS:
- Stay factual. Don't invent. If task context is vague, your summary stays vague.
- Never mention members, account numbers, balances, or anything that looks like NPI.
- If task context contains anything that looks like sensitive data, flag it as a "warn" review note and use a placeholder in the field.`,
  },

};

// Universal agent runner. Called from any agent UI — handles the API call,
// logs the run, returns structured output. Errors return { error } so the UI
// can show retry/fallback UX.
//
// Optional 4th arg `onLog` is a callback invoked with an audit log entry
// when the agent runs (success or fallback). Compliance-friendly — every
// agent run produces an auditable trail in data.agentLog.
async function runAgent(agentId, userInput, taskContext, onLog) {
  const agent = AGENT_REGISTRY[agentId];
  if (!agent) return { error: "unknown-agent" };
  if ((agent.inputMinLength || 0) > 0 && (!userInput || userInput.trim().length < agent.inputMinLength)) {
    return { error: "input-too-short" };
  }
  // Build the message — agent's system prompt + Lexy's input + optional task context
  const inputContent = (userInput && userInput.trim()) || "Run the agent now using the task context provided.";
  const userMessage = taskContext
    ? `Task context: ${taskContext}\n\n---\n\nInput:\n${inputContent}`
    : inputContent;
  let res;
  try {
    res = await fetchWithTimeout("/api/rosie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: agent.systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    }, 30000);
  } catch (e) {
    if (e.name === "AbortError") return { error: "timeout" };
    return { error: "network" };
  }
  if (!res.ok) return { error: "http" };
  let data;
  try { data = await res.json(); } catch { return { error: "badformat" }; }
  const out = data?.content?.[0]?.text?.trim();
  if (!out) return { error: "badformat" };
  // Parse JSON — agent's response shape: { fields, reviewNotes }
  const cleaned = out.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  try {
    const parsed = JSON.parse(cleaned);
    const fields = parsed.fields && typeof parsed.fields === "object" ? parsed.fields : {};
    const reviewNotes = Array.isArray(parsed.reviewNotes) ? parsed.reviewNotes.slice(0, 8).map(rn => ({
      id: rn.id || `rn-${Math.random().toString(36).slice(2, 8)}`,
      field: String(rn.field || "").trim(),
      concern: String(rn.concern || "").trim().slice(0, 240),
      severity: ["info", "warn"].includes(rn.severity) ? rn.severity : "info",
    })).filter(rn => rn.concern) : [];
    const result = {
      agentId,
      fields,
      reviewNotes,
      generatedAt: Date.now(),
      rawText: out,
      logId,
    };
    if (typeof onLog === "function") {
      try {
        onLog({
          id: logId,
          agentId,
          ranAt: result.generatedAt,
          status: "draft",
          hadReviewNotes: reviewNotes.length > 0,
          parseFailed: false,
        });
      } catch { /* logging never blocks the result */ }
    }
    return result;
  } catch {
    // Couldn't parse JSON — return raw text as a fallback so Lexy still gets something
    const fallback = {
      agentId,
      fields: { _raw: out },
      reviewNotes: [{
        id: "rn-parse-fallback",
        field: "_raw",
        concern: "Agent didn't return clean structured output — review the raw text carefully.",
        severity: "warn",
      }],
      generatedAt: Date.now(),
      rawText: out,
      parseFailed: true,
      logId,
    };
    if (typeof onLog === "function") {
      try {
        onLog({
          id: logId,
          agentId,
          ranAt: fallback.generatedAt,
          status: "draft",
          hadReviewNotes: true,
          parseFailed: true,
        });
      } catch { /* */ }
    }
    return fallback;
  }
}

// Refine an existing agent draft based on user feedback. Multi-turn — preserves
// the conversation history so successive refinements build on each other.
// 
// KEY ANTI-DRIFT BEHAVIOR: The refine agent returns ONLY fields that should
// CHANGE — not all fields. Unchanged fields stay untouched. This prevents
// the agent from silently "improving" things the user didn't ask about.
//
// Signature: refineAgent(agentId, currentDraft, userFeedback, chatHistory, taskContext, onLog)
//   - currentDraft: { fields, reviewNotes } — the existing state
//   - userFeedback: string — what user just said
//   - chatHistory: array of prior { role, content } turns (excludes current userFeedback)
// Returns: { changedFields, newReviewNotes, agentReply, error? }
async function refineAgent(agentId, currentDraft, userFeedback, chatHistory, taskContext, onLog) {
  const agent = AGENT_REGISTRY[agentId];
  if (!agent) return { error: "unknown-agent" };
  if (!userFeedback || !userFeedback.trim()) return { error: "empty-feedback" };
  if (!currentDraft || !currentDraft.fields) return { error: "no-draft" };

  // Build the refinement system prompt — different from initial generation.
  // Emphasizes: return only changes, preserve unchanged fields, explain edits.
  const fieldsList = agent.fields.map(f => `  - "${f.id}" (${f.label})`).join("\n");
  const currentFieldsJson = JSON.stringify(currentDraft.fields, null, 2);
  const system = `You're Rosie helping Lexy refine an agent draft. She has feedback — your job is to UPDATE the draft based on her ask, then explain briefly what you changed.

AGENT TYPE: ${agent.label} — ${agent.description}

CURRENT DRAFT FIELDS:
${currentFieldsJson}

AVAILABLE FIELDS (only these can be updated):
${fieldsList}

OUTPUT ONLY JSON — no markdown, no preamble:
{
  "changedFields": {
    "fieldId": "new value (full replacement, not a diff)"
    // ONLY include fields you actually changed.
    // If you didn't change a field, OMIT it from this object.
  },
  "newReviewNotes": [
    { "id": "rn-<random>", "field": "fieldId", "concern": "what to double-check", "severity": "info" | "warn" }
    // Fresh review notes for THIS revision. Replaces the prior set.
    // Empty array is fine if nothing flag-worthy.
  ],
  "agentReply": "1-2 sentence message back to Lexy explaining what you changed and why. Skip throat-clearing. Be direct."
}

CRITICAL RULES (this is the part that matters most):
1. ONLY change what she asked about. Don't silently "improve" other fields.
2. If she says "make the summary shorter," only return the summary field. Don't touch currentState.
3. If you're unsure what she wants changed, ASK in agentReply — return changedFields: {} and put your question in agentReply.
4. If she's pushing the draft in a direction you think is wrong, PUSH BACK in agentReply. Don't just comply.
5. New reviewNotes should reflect the REVISED draft. If the original had a name-flag and you removed the name, drop that note.
6. Tone in agentReply: casual, direct, like a colleague. No "Great question!" or "I'd be happy to."

POLICY:
- Never accept or include NPI, account numbers, or sensitive internal info in any field.
- If user feedback asks you to include sensitive info, refuse in agentReply and leave fields unchanged.`;

  // Conversation history as messages — prior turns + new user feedback
  const messages = [
    ...(chatHistory || []).map(m => ({ role: m.role, content: m.content })),
    { role: "user", content: userFeedback },
  ];

  let res;
  try {
    res = await fetchWithTimeout("/api/rosie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        system,
        messages,
      }),
    }, 30000);
  } catch (e) {
    if (e.name === "AbortError") return { error: "timeout" };
    return { error: "network" };
  }
  if (!res.ok) return { error: "http" };
  let data;
  try { data = await res.json(); } catch { return { error: "badformat" }; }
  const out = data?.content?.[0]?.text?.trim();
  if (!out) return { error: "badformat" };

  const cleaned = out.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  let parsed;
  try { parsed = JSON.parse(cleaned); } catch { return { error: "badformat", rawText: out }; }

  // Normalize the response
  const changedFields = parsed.changedFields && typeof parsed.changedFields === "object" ? {} : {};
  if (parsed.changedFields && typeof parsed.changedFields === "object") {
    for (const f of agent.fields) {
      if (parsed.changedFields[f.id] !== undefined) {
        changedFields[f.id] = String(parsed.changedFields[f.id] || "").trim();
      }
    }
  }
  const newReviewNotes = Array.isArray(parsed.newReviewNotes)
    ? parsed.newReviewNotes.slice(0, 8).map(rn => ({
        id: rn.id || `rn-${Math.random().toString(36).slice(2, 8)}`,
        field: String(rn.field || "").trim(),
        concern: String(rn.concern || "").trim().slice(0, 240),
        severity: ["info", "warn"].includes(rn.severity) ? rn.severity : "info",
      })).filter(rn => rn.concern)
    : [];
  const agentReply = String(parsed.agentReply || "").trim().slice(0, 500) || "(updated)";

  // Audit log entry — every refinement also logs
  if (typeof onLog === "function") {
    try {
      onLog({
        id: `log-refine-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        agentId,
        ranAt: Date.now(),
        status: "refined",
        hadReviewNotes: newReviewNotes.length > 0,
        fieldsChanged: Object.keys(changedFields),
      });
    } catch { /* */ }
  }

  return {
    changedFields,
    newReviewNotes,
    agentReply,
    rawText: out,
  };
}

async function generateWeeklyObservations(activitySummary, lastWeekObservations) {
  if (!activitySummary || typeof activitySummary !== "object") return { error: "empty" };
  const todayISO = new Date().toISOString().slice(0, 10);
  const system = `You're Rosie, Lexy's AI sidekick. Once a week (Monday morning) you review her past 7 days and surface 2-3 useful observations.

YOUR ROLE:
- Notice patterns she might miss when she's heads-down.
- Celebrate genuine wins (don't fake it).
- Flag concerns gently — drift, stale items, lopsided workload.
- NEVER propose new tools, features, or agents. That's her call, not yours.
- NEVER moralize or lecture. You're a colleague, not a coach.

TONE:
- Casual, warm, direct. Like a colleague who's been paying attention.
- 1-2 sentences per observation, max.
- Specific over generic. "You closed 4 Verafin tasks this week" > "You were productive."
- Skip throat-clearing. No "Great week!" openers.

CONSTRAINTS:
- If nothing notable, return an empty observations array. Don't manufacture noise.
- Don't repeat observations from last week unless the pattern persists meaningfully.
- Don't flag anything as a "concern" unless it actually warrants attention.

OUTPUT ONLY JSON — no markdown, no preamble:
{
  "observations": [
    {
      "id": "obs-<random>",
      "text": "one specific observation, 1-2 sentences",
      "category": "pattern | concern | win | note",
      "severity": "info | warn"
    }
  ],
  "summary": "optional one-line frame for the week, or empty string"
}

CATEGORIES:
- "pattern": You noticed something repeated (good or neutral). "Three Verafin tasks closed this week — that backlog is finally moving."
- "concern": Something worth attention. "The Movemint task has been on-hold for 12 days — worth a check-in?"
- "win": Something to genuinely celebrate. "You finished the Strum kickoff prep ahead of schedule. 🌸"
- "note": General observation. "Heavy meeting week — 11 meetings vs. your usual 6."

CONTEXT:
- Today: ${todayISO}
- Last week's observations (don't repeat unless still relevant): ${lastWeekObservations ? JSON.stringify(lastWeekObservations) : "none"}`;

  const ctx = `Past 7 days activity:
${JSON.stringify(activitySummary, null, 2)}`;

  let res;
  try {
    res = await fetchWithTimeout("/api/rosie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        system,
        messages: [{ role: "user", content: ctx }],
      }),
    }, 25000);
  } catch (e) {
    if (e.name === "AbortError") return { error: "timeout" };
    return { error: "network" };
  }
  if (!res.ok) return { error: "http" };
  let data;
  try { data = await res.json(); } catch { return { error: "badformat" }; }
  const out = data?.content?.[0]?.text?.trim();
  if (!out) return { error: "badformat" };
  const cleaned = out.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    const observations = Array.isArray(parsed.observations) ? parsed.observations.slice(0, 4).map(o => ({
      id: o.id || `obs-${Math.random().toString(36).slice(2, 8)}`,
      text: String(o.text || "").trim().slice(0, 280),
      category: ["pattern", "concern", "win", "note"].includes(o.category) ? o.category : "note",
      severity: ["info", "warn"].includes(o.severity) ? o.severity : "info",
    })).filter(o => o.text) : [];
    return {
      observations,
      summary: String(parsed.summary || "").trim().slice(0, 140),
    };
  } catch {
    return { error: "badformat" };
  }
}

async function classifyThreadEntry(text, personName, linkedTaskTitle) {
  if (!text || !text.trim()) return { error: "empty" };
  const todayISO = new Date().toISOString().slice(0, 10);
  const system = `You're Rosie. Lexy (Project Coordinator at Fort Financial Credit Union) just dropped a quick note she wants to share with ${personName || "someone"} later. Your job: classify the urgency + type so it routes correctly.

OUTPUT ONLY a JSON object with this exact shape — no markdown, no preamble:
{
  "urgency": "today | thisweek | wait",
  "type": "idea | update | question | issue",
  "summary": "short headline, max 80 chars"
}

URGENCY RULES (be conservative — default to "wait"):
- "today": ONLY if genuinely time-sensitive — decision blocker, time-critical FYI ("happening in 2 hours"), or someone is actively waiting on this RIGHT NOW. Rare.
- "thisweek": Worth sending soon-ish but not blocking — a heads-up that has a "before Friday" feel, or a quick question that could unblock work next week.
- "wait": Most things. Ideas, status updates, non-urgent questions, things that pair well with face-to-face discussion. THIS IS THE DEFAULT.

TYPE RULES:
- "idea": A thought, suggestion, brainstorm
- "update": A status report, FYI, "here's what happened"
- "question": Needs an answer from them
- "issue": A problem, blocker, or concern

SUMMARY RULES:
- Headline form (not full sentence). 80 chars max.
- Strip filler ("just thinking that…", "wanted to mention…").
- Preserve the actual subject.`;

  const ctx = [
    `Today: ${todayISO}`,
    `Sharing with: ${personName || "(unspecified)"}`,
    linkedTaskTitle ? `Related task: "${linkedTaskTitle}"` : "",
    "",
    "Entry text:",
    text.slice(0, 800),
  ].filter(Boolean).join("\n");

  let res;
  try {
    res = await fetchWithTimeout("/api/rosie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 250,
        system,
        messages: [{ role: "user", content: ctx }],
      }),
    }, 15000);
  } catch (e) {
    if (e.name === "AbortError") return { error: "timeout" };
    return { error: "network" };
  }
  if (!res.ok) return { error: "http" };
  let data;
  try { data = await res.json(); } catch { return { error: "badformat" }; }
  const out = data?.content?.[0]?.text?.trim();
  if (!out) return { error: "badformat" };
  const cleaned = out.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    const urgency = ["today", "thisweek", "wait"].includes(parsed.urgency) ? parsed.urgency : "wait";
    const type = ["idea", "update", "question", "issue"].includes(parsed.type) ? parsed.type : "update";
    const summary = String(parsed.summary || "").trim().slice(0, 80) || text.slice(0, 60).trim();
    return { urgency, type, summary };
  } catch {
    return { error: "badformat" };
  }
}

// Per-entry Rosie chat — Lexy can bounce ideas on a thread entry before
// deciding to send/discuss. Phase 2 design (locked in chat):
//   - Sparring partner, not yes-machine. Pushes back, asks clarifying Qs.
//   - Conversational, NOT performative. Skips the throat-clearing.
//   - Aware of context: linked task, urgency, active focus state, meetings.
//   - SOFT CHECKPOINT at 5 min — Direction A wording. Never cuts off.
//   - SECOND CHECKPOINT at 10 min — Direction B wording. Acknowledges.
//   - ON-TRACK NUDGE if in focus block + >3 min — 👀 + Direction A wording.
//   - MEETING-SOON NUDGE if meeting in <10 min — ⏳ + Direction C wording.
// All trigger flags are computed by the caller (the chat component); this
// helper just knows what reminder to add to the system prompt.
// Returns { text } or { error }.
async function chatAboutThreadEntry({
  entry,
  threadName,
  linkedItem,
  priorMessages,
  userMessage,
  activeFocusContext, // { itemTitle, minutesElapsed } | null
  upcomingMeeting,    // { title, minutesUntil } | null
  triggers,           // { checkpoint, secondCheckpoint, onTrackNudge, meetingNudge }
  chatDurationMin,
}) {
  if (!userMessage || !userMessage.trim()) return { error: "empty" };
  const t = triggers || {};

  // Build the nudge instructions Rosie weaves into her response. EXACT
  // wording from Lexy's design session — these are the lines she picked.
  const nudgeBlocks = [];
  if (t.checkpoint) {
    nudgeBlocks.push(`SOFT CHECKPOINT (5 min mark — first time):
At the END of your response, after your actual reply, add a NEW paragraph with this EXACT line (do not paraphrase):
🌸 We've covered a lot — want me to bundle this up so we don't lose it?
Make it feel like a friendly offer, not a buzzer. She can ignore it and keep going. Do NOT pressure her to stop.`);
  } else if (t.secondCheckpoint) {
    nudgeBlocks.push(`SECOND CHECKPOINT (10 min mark — she ignored the first):
At the END of your response, add a NEW paragraph with this EXACT line (do not paraphrase):
🌸 We've been at this a while. Want me to save what we've got so you can come back to it?
Acknowledges time without re-asking the same question. Tone: friendly, no nag.`);
  }
  if (t.onTrackNudge && activeFocusContext?.itemTitle) {
    nudgeBlocks.push(`ON-TRACK NUDGE (focus block running + chat >3 min):
At the END of your response (BEFORE any checkpoint line), add a NEW paragraph with this EXACT pattern:
👀 Quick check — you've been chatting for ${Math.round(chatDurationMin || 0)} min, and your "${activeFocusContext.itemTitle}" block is still going. Want me to save this and head back, or stay here?
Use the 👀 emoji. Don't change the framing — this is a "noticing" not a "stop."`);
  }
  if (t.meetingNudge && upcomingMeeting?.title) {
    nudgeBlocks.push(`MEETING-SOON NUDGE (meeting in <10 min):
At the END of your response, add a NEW paragraph with this EXACT pattern:
⏳ ${upcomingMeeting.minutesUntil} min until ${upcomingMeeting.title}. Want me to save where we are?
Tone: practical heads-up, not alarm.`);
  }

  const system = `You're Rosie — Lexy's AI sidekick in her Work Hub app. She's bouncing ideas with you about a note she might share with ${threadName || "someone"} later (probably at their next 1:1).

YOUR ROLE: Be a sparring partner. Help her think it through. Push back when something doesn't add up. Ask clarifying questions when the idea is fuzzy. Help her see angles she's missed. Be honest — don't just agree.

TONE:
- Casual, warm, direct. Talk like a colleague, not a coach.
- NEVER preachy. Don't start with "Great question!" or similar throat-clearing.
- It's OK to disagree. It's OK to say "I don't think that's right because X."
- 1-3 short paragraphs typically. Sometimes one sentence is enough.

CONSTRAINTS:
- DO NOT moralize or lecture about productivity, focus, etc.
- DO NOT suggest she "take a break" or "check in with herself."
- DO NOT use therapy language ("how does that make you feel?").
- DO be a useful thinking partner.

CONTEXT YOU HAVE:
- Original note for ${threadName || "the recipient"}: "${entry.text}"
- Note tagged as: ${entry.type} (${entry.urgency} urgency)
- ${linkedItem ? `Related task: "${linkedItem.title}"` : "Not linked to a specific task."}
${nudgeBlocks.length > 0 ? "\n" + nudgeBlocks.join("\n\n") : ""}`;

  const messages = [
    ...(priorMessages || []).map(m => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  let res;
  try {
    res = await fetchWithTimeout("/api/rosie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 700,
        system,
        messages,
      }),
    }, 25000);
  } catch (e) {
    if (e.name === "AbortError") return { error: "timeout" };
    return { error: "network" };
  }
  if (!res.ok) return { error: "http" };
  let data;
  try { data = await res.json(); } catch { return { error: "badformat" }; }
  const text = data?.content?.[0]?.text?.trim();
  if (!text) return { error: "badformat" };
  return { text };
}

// Summarize a thread-entry chat AND detect if anything actionable surfaced.
// Called when Lexy hits "bundle this up" at a checkpoint. Returns:
//   { summary: "...", taskProposal: null | { title, why, subtasks, taskTimes } }
// taskProposal is null if nothing concrete came out — Rosie's call, not always.
async function summarizeChatAndProposeTask({ entry, threadName, priorMessages, linkedItem }) {
  if (!Array.isArray(priorMessages) || priorMessages.length === 0) return { error: "empty" };
  const system = `You're Rosie wrapping up a chat with Lexy. She was bouncing ideas with you about something to share with ${threadName || "someone"}.

YOUR JOB: Output ONLY a JSON object — no markdown, no preamble:
{
  "summary": "2-4 sentence recap of where you both landed. Past tense. Captures the conclusion, not the back-and-forth.",
  "taskProposal": null OR { "title": "concrete task title", "why": "one-sentence why", "subtasks": ["step 1", "step 2"], "taskTimes": [15, 30] }
}

SUMMARY RULES:
- Capture WHERE YOU LANDED, not the whole conversation.
- If she had an insight or made a decision, name it.
- If she stayed undecided, say that honestly ("Still weighing X vs Y").
- Tone: matter-of-fact, conversational. NOT bullet points.

TASK PROPOSAL RULES (be conservative — null is the default):
- Only propose a task if the chat clearly surfaced an actionable next step Lexy would benefit from having on her list.
- "She might think about it" → null. "She decided to email Aaron about X" → propose.
- "She's still figuring it out" → null. "We landed on: she needs to document the issue first" → propose.
- If you propose: title is concrete + verb-first ("Document Verafin sandbox issue"), why is one short sentence, subtasks are 0-3 items max (empty array is fine), taskTimes match subtasks length (in minutes, ≤90 each).
- When in doubt → null. Better to skip than to over-task.

ORIGINAL NOTE: "${entry.text}"
${linkedItem ? `RELATED TASK: "${linkedItem.title}"` : ""}`;

  let res;
  try {
    res = await fetchWithTimeout("/api/rosie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system,
        messages: priorMessages.map(m => ({ role: m.role, content: m.content })),
      }),
    }, 20000);
  } catch (e) {
    if (e.name === "AbortError") return { error: "timeout" };
    return { error: "network" };
  }
  if (!res.ok) return { error: "http" };
  let data;
  try { data = await res.json(); } catch { return { error: "badformat" }; }
  const out = data?.content?.[0]?.text?.trim();
  if (!out) return { error: "badformat" };
  const cleaned = out.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    const summary = String(parsed.summary || "").trim();
    if (!summary) return { error: "badformat" };
    let taskProposal = null;
    if (parsed.taskProposal && typeof parsed.taskProposal === "object" && parsed.taskProposal.title) {
      const tp = parsed.taskProposal;
      taskProposal = {
        title: String(tp.title || "").trim().slice(0, 120),
        why: String(tp.why || "").trim().slice(0, 200),
        subtasks: Array.isArray(tp.subtasks)
          ? tp.subtasks.map(s => String(s).trim()).filter(Boolean).slice(0, 5)
          : [],
        taskTimes: [],
      };
      if (taskProposal.subtasks.length > 0) {
        taskProposal.taskTimes = taskProposal.subtasks.map((_, i) => {
          const n = Number(Array.isArray(tp.taskTimes) ? tp.taskTimes[i] : null);
          return (Number.isFinite(n) && n > 0) ? Math.min(90, Math.round(n)) : 15;
        });
      }
    }
    return { summary, taskProposal };
  } catch {
    return { error: "badformat" };
  }
}

// Mid-chat: Lexy explicitly asks Rosie to turn the conversation into a task.
// Different from the auto-detect at checkpoint — this fires when she says
// something like "make this a task" or "actually I should track this."
// Returns { taskProposal } or { error }.
async function detectTaskFromChat({ entry, threadName, priorMessages, linkedItem, userRequest }) {
  if (!userRequest || !userRequest.trim()) return { error: "empty" };
  const system = `You're Rosie. Lexy just explicitly asked you to turn this conversation into a Work Hub task. Build the proposal from what you both discussed.

OUTPUT ONLY JSON — no markdown:
{
  "title": "concrete task title, verb-first",
  "why": "one-sentence why",
  "subtasks": ["step 1", "step 2"],
  "taskTimes": [15, 30]
}

RULES:
- Title concrete + actionable ("Email Aaron about Verafin sandbox creds"), not vague ("Think about Aaron's issue").
- why = one short sentence linking to the chat's conclusion.
- subtasks: 0-4 items, only if real steps exist. Empty array is fine.
- taskTimes match subtasks length in minutes (≤90 each).

CONTEXT:
- Original note: "${entry.text}"
${linkedItem ? `- Related task: "${linkedItem.title}"` : ""}
- Her ask: "${userRequest}"`;

  let res;
  try {
    res = await fetchWithTimeout("/api/rosie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        system,
        messages: priorMessages.map(m => ({ role: m.role, content: m.content })),
      }),
    }, 20000);
  } catch (e) {
    if (e.name === "AbortError") return { error: "timeout" };
    return { error: "network" };
  }
  if (!res.ok) return { error: "http" };
  let data;
  try { data = await res.json(); } catch { return { error: "badformat" }; }
  const out = data?.content?.[0]?.text?.trim();
  if (!out) return { error: "badformat" };
  const cleaned = out.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    const title = String(parsed.title || "").trim().slice(0, 120);
    if (!title) return { error: "empty-title" };
    const subtasks = Array.isArray(parsed.subtasks)
      ? parsed.subtasks.map(s => String(s).trim()).filter(Boolean).slice(0, 5)
      : [];
    const taskTimes = subtasks.length > 0
      ? subtasks.map((_, i) => {
          const n = Number(Array.isArray(parsed.taskTimes) ? parsed.taskTimes[i] : null);
          return (Number.isFinite(n) && n > 0) ? Math.min(90, Math.round(n)) : 15;
        })
      : [];
    return {
      taskProposal: {
        title,
        why: String(parsed.why || "").trim().slice(0, 200),
        subtasks,
        taskTimes,
      },
    };
  } catch {
    return { error: "badformat" };
  }
}

// AI-powered single-field auto-fill — for quickly populating form fields from the title
async function suggestFieldWithAI(fieldKey, itemTitle, category, existingValues = {}) {
  const fieldPrompts = {
    project: [
      "Suggest the PROJECT or workstream this item belongs to — typically a system, initiative, or vendor name.",
      "Common projects at Fort Financial: 'Zoho', 'Verafin', 'Movemint', 'Arkatechture', 'Compliance', 'Internal Process', 'Member Experience'.",
      "Look at the title for system/vendor/initiative names. 'Zoho Forms Field Updates' → 'Zoho'. 'Verafin Project Charter' → 'Verafin'. 'Build backlog/project status flow' → 'Internal Process'.",
      "If the work isn't clearly tied to one project, return an empty string — better blank than wrong.",
      "Return ONLY the project name (1-2 words max), no quotes, no explanation, no prefix.",
    ].join(" "),
    category: [
      "Suggest a SHORT (1-3 words) category tag for this work item — describing the TYPE of work, not who it's with.",
      "Think: what KIND of project work is this? Common categories: 'Implementation', 'Training', 'Documentation', 'Automation', 'Compliance', 'Vendor Review', 'Project Planning', 'Integration', 'Meeting Prep', 'Process Improvement', 'Reporting', 'Testing', 'Configuration'.",
      "AVOID generic labels like 'Vendor Mgmt' unless the work is specifically about vendor relationship management (contracts, evaluations, procurement).",
      "A 'kickoff meeting for a new system' is 'Project Planning' or 'Implementation', NOT 'Vendor Mgmt'.",
      "A 'training session' is 'Training', not 'Documentation'.",
      "CRITICAL OUTPUT FORMAT:",
      "- Return ONLY the bare category name, nothing else.",
      "- Do NOT write 'Category:', 'Suggested:', 'Recommended:', or any prefix.",
      "- Do NOT write 'Here's a...' or any explanation.",
      "- Just the 1-3 word category. Example correct output: Implementation",
      "- Example WRONG output: 'Suggested Category: Implementation' (has a prefix)",
    ].join(" "),
    why: [
      "Write a CONCISE (8-15 words) 'why this matters' statement.",
      "This is a context anchor Lexy re-reads when brain-foggy — it should reconnect her to the REAL-WORLD impact, not abstract corporate value.",
      "GOOD examples: 'Members need fraud alerts working before the holiday shopping surge.' | 'Without this, the whole lending workflow stays manual.' | 'Josh needs this data for the board report next month.'",
      "AVOID generic platitudes like 'This is important for stakeholders' or 'Drives business value'.",
      "Focus on: who's affected, what breaks if we don't, or what specific outcome it enables.",
      "Return ONLY the sentence, no quotes, no preamble.",
    ].join(" "),
    done: [
      "Write a CONCISE (10-20 words) definition of what 'done' actually looks like — the MINIMUM version that counts as complete.",
      "Be OBSERVABLE and specific. Someone should be able to look at the output and say 'yes, that's done'.",
      "GOOD examples: 'Charter approved by Josh, PM tool updated, kickoff scheduled.' | 'All fraud rules migrated, test transactions pass, team trained.' | 'Vendor response sent, meeting on calendar.'",
      "AVOID circular phrases like 'The work is complete' or vague ones like 'Goals achieved'.",
      "Don't aim for perfection — aim for 'good enough to ship'. This should feel REACHABLE.",
      "Return ONLY the sentence, no quotes.",
    ].join(" "),
    outOfScope: [
      "Write a CONCISE (10-20 words) 'out of scope' note — what is explicitly NOT included.",
      "Focus on SCOPE CREEP traps: what would be tempting to add, but shouldn't be done now.",
      "GOOD examples: 'Not retraining the full team — that's Phase 2.' | 'Not fixing the Zoho API errors — separate ticket.' | 'No vendor renegotiation — just current contract review.'",
      "AVOID trivial exclusions like 'not doing unrelated tasks' or obvious ones.",
      "Think: what's the closest related work that might sneak in? That's what belongs here.",
      "Return ONLY the sentence, no quotes.",
    ].join(" "),
    notes: [
      "Write 1-2 short practical notes about this item — ADHD-useful context.",
      "Focus on: gotchas, dependencies on other people, access/credentials needed, past context worth remembering, or specific contact names.",
      "GOOD examples: 'Need portal admin access from IT before starting. Josh prefers Slack over email for approvals.' | 'Verafin rep is Colby — cc Rob on all emails.' | 'Last time this was attempted it failed because of the naming convention — check with Lori first.'",
      "AVOID generic reminders like 'Stay organized' or 'Check in regularly'.",
      "Think of this as Future Lexy's cheat sheet for when she picks this up cold.",
      "Return ONLY the notes, no quotes, no preamble.",
    ].join(" "),
  };
  const prompt = fieldPrompts[fieldKey];
  if (!prompt) return "";
  const context = [
    `Item title: ${itemTitle}`,
    category ? `Category already set: ${category}` : "",
    existingValues.why ? `Why it matters: ${existingValues.why}` : "",
    existingValues.done ? `Done looks like: ${existingValues.done}` : "",
  ].filter(Boolean).join("\n");
  try {
    const res = await fetch("/api/rosie", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 150,
        system: `You help Lexy (Project Coordinator, Implementation team at Fort Financial Credit Union) fill in a work item form. She implements fraud detection, lending, and financial systems (Verafin, Zoho, Arkatechture, Movemint, etc). Be concise, practical, and accurate. ${prompt}`,
        messages: [{ role: "user", content: context }],
      }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    let text = data.content?.find(b => b.type === "text")?.text || "";

    // Multi-pass aggressive cleanup — strip markdown, preambles, label prefixes
    // Run multiple times so stripping one layer exposes the next
    const clean = s => {
      let out = s.trim();
      // Run cleanup 4 times to handle deeply layered prefixes
      for (let i = 0; i < 4; i++) {
        out = out
          .replace(/^```[a-z]*\s*|\s*```$/g, "")  // code fences
          .replace(/\*\*/g, "")                     // bold markdown
          .replace(/^(suggested|recommended|proposed|suggestion|recommendation)\s*[:：-]\s*/gi, "") // "Suggested:" / "Recommended:" pattern
          .replace(/^(suggested|recommended|proposed|here's|here is|my|the|answer|response)\s+/gi, "") // leading adjectives/articles
          .replace(/^(category|why|done|done looks like|out of scope|notes|title|priority|answer|response)\s*[:：-]\s*/gi, "") // field label prefixes
          .replace(/^["'`]+|["'`]+$/g, "")          // wrapping quotes
          .trim();
      }
      return out;
    };
    text = clean(text);

    // For single-value fields (category), take only the first line/sentence
    if (fieldKey === "category" || fieldKey === "project") {
      text = text.split(/[\n,—–-]/)[0].trim();
      // Strip any remaining "X is..." pattern
      text = text.replace(/\s+(is|would be|should be)\s+.+$/i, "").trim();
      // Cap to 3 words max — these are short labels
      const words = text.split(/\s+/);
      if (words.length > 3) text = words.slice(0, 3).join(" ");
      // Project: also strip lingering "project" suffix
      if (fieldKey === "project") text = text.replace(/\s+project$/i, "").trim();
    }
    return text;
  } catch { return ""; }
}

// AI-powered form refinement — takes user feedback and updates fields accordingly
// AI-powered task detection — scans free text for hidden action items
async function detectTasksInText(itemTitle, fieldName, fieldText, existingTasks = []) {
  if (!fieldText || fieldText.trim().length < 15) return [];
  const systemPrompt = [
    "You scan free-text fields for hidden action items that should be standalone tasks for Lexy (Project Coordinator at Fort Financial Credit Union).",
    "",
    "Return ONLY a JSON array of task titles (strings). No preamble. Empty array if nothing found.",
    'Shape: ["Task 1 title", "Task 2 title"]',
    "",
    "WHAT COUNTS AS A HIDDEN TASK:",
    "- Imperative phrases ('call Josh', 'email vendor', 'check legal', 'follow up with...')",
    "- Conditional actions ('after Josh approves, deploy it' → 'Deploy after Josh approves')",
    "- 'Need to / Don't forget to / Remember to' phrases",
    "- Specific people-actions ('ask Lori about...', 'CC Rob on emails')",
    "",
    "WHAT DOES NOT COUNT:",
    "- Context/background statements ('Members will benefit', 'This is high priority')",
    "- Definitions of done or scope ('Charter approved by Josh' is NOT a task)",
    "- General observations ('This is complex', 'Tight timeline')",
    "- Things that describe WHY something matters",
    "",
    "RULES:",
    "- Each task should start with a concrete verb (Call, Email, Check, Confirm, Schedule, Follow up, Review, Send).",
    "- Keep titles under 60 chars, action-oriented.",
    "- Skip tasks that overlap with the existing task list (case-insensitive partial match).",
    "- Return at most 5 tasks. Be conservative — only flag CLEAR action items.",
    "- If nothing genuinely actionable is found, return [].",
  ].join("\n");

  const userMsg = [
    `Item: ${itemTitle}`,
    `Field being scanned: ${fieldName}`,
    "",
    `Field text: "${fieldText}"`,
    "",
    `Existing tasks (don't suggest duplicates): ${existingTasks.length ? existingTasks.join(", ") : "(none)"}`,
    "",
    "What action items, if any, should be added as standalone tasks?",
  ].join("\n");

  try {
    const res = await fetch("/api/rosie", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: "user", content: userMsg }],
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const text = data.content?.find(b => b.type === "text")?.text || "[]";
    const cleaned = text.trim().replace(/```json|```/g, "").trim();
    const arr = JSON.parse(cleaned);
    if (!Array.isArray(arr)) return [];
    // Filter dupes vs existing tasks (case-insensitive partial match)
    const existingLower = existingTasks.map(t => t.toLowerCase());
    return arr
      .filter(t => typeof t === "string" && t.trim().length > 3 && t.length < 80)
      .filter(t => !existingLower.some(e => e.includes(t.toLowerCase()) || t.toLowerCase().includes(e)))
      .slice(0, 5);
  } catch { return []; }
}

async function refineFormFieldsWithAI(currentForm, userFeedback) {
  const systemPrompt = [
    "You help Lexy (Project Coordinator, Implementation team at Fort Financial Credit Union) refine a work item form based on her natural-language feedback. She implements Verafin, Zoho, Arkatechture, Movemint.",
    "",
    "You receive the CURRENT form state and her FEEDBACK (e.g. 'make the why more specific' or 'the done is too ambitious, simplify' or 'add a note about Josh needing to approve first').",
    "",
    "Return ONLY a JSON object with the fields that should change. Do NOT include fields that don't need updating.",
    'Shape: {"category": "...", "why": "...", "done": "...", "outOfScope": "...", "notes": "...", "changeNote": "1 sentence about what you changed"}',
    "",
    "RULES:",
    "- Only include fields in the response that actually need updating based on feedback.",
    "- If feedback says 'make the why more specific', only return {\"why\": \"...\", \"changeNote\": \"...\"}.",
    "- If feedback is vague (e.g. 'make it better'), improve all fields that could use tightening.",
    "- Keep the same length/format as the existing field (concise why, observable done, etc.).",
    "- changeNote should be 1 warm sentence explaining what you adjusted and why.",
    "- Return ONLY valid JSON, no markdown fences, no preamble.",
  ].join("\n");

  const userMsg = [
    "CURRENT FORM STATE:",
    `Title: ${currentForm.title || "(empty)"}`,
    `Category: ${currentForm.category || "(empty)"}`,
    `Why: ${currentForm.why || "(empty)"}`,
    `Done: ${currentForm.done || "(empty)"}`,
    `Out of scope: ${currentForm.outOfScope || "(empty)"}`,
    `Notes: ${currentForm.notes || "(empty)"}`,
    "",
    `FEEDBACK: ${userFeedback}`,
  ].join("\n");

  try {
    const res = await fetch("/api/rosie", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        system: systemPrompt,
        messages: [{ role: "user", content: userMsg }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.content?.find(b => b.type === "text")?.text || "{}";
    const cleaned = text.trim().replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch { return null; }
}

// AI-powered priority evaluation — returns 'high' | 'medium' | 'low'
async function suggestPriorityWithAI(itemTitle, why, category) {
  const context = [
    `Title: ${itemTitle}`,
    category ? `Category: ${category}` : "",
    why ? `Why: ${why}` : "",
  ].filter(Boolean).join("\n");
  try {
    const res = await fetch("/api/rosie", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 40,
        system: [
          "You assess work item priority for Lexy (Project Coordinator, Implementation team at Fort Financial Credit Union).",
          "Return ONLY one word: 'high', 'medium', or 'low'. No explanation.",
          "",
          "HIGH priority when:",
          "- Members are directly affected (fraud, lending, online banking issues)",
          "- Compliance/regulatory deadline",
          "- Has a stakeholder waiting (Josh, leadership, external vendor on a clock)",
          "- Blocks someone else from doing their job",
          "- Named meeting/kickoff with a scheduled date",
          "",
          "MEDIUM priority when:",
          "- Meaningful project work with flexible timing",
          "- Internal improvement that's valued but not urgent",
          "- Planning/prep for future work",
          "- Documentation or training that supports active projects",
          "",
          "LOW priority when:",
          "- Nice-to-have cleanup or polish",
          "- Annual/routine maintenance without a specific trigger",
          "- Exploration or research with no deadline",
          "- Organizational housekeeping",
          "",
          "When uncertain, default to 'medium' — don't over-label everything as high.",
        ].join("\n"),
        messages: [{ role: "user", content: context }],
      }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    const text = (data.content?.find(b => b.type === "text")?.text || "").toLowerCase().trim().replace(/[^a-z]/g, "");
    if (["high", "medium", "low"].includes(text)) return text;
    return "";
  } catch { return ""; }
}

// AI-powered date suggestion — returns { startDate, dueDate } based on title + scope
async function suggestDatesWithAI(itemTitle, why, done, priority) {
  const today = new Date().toISOString().slice(0, 10);
  const dayOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];
  const context = [
    `Today is ${dayOfWeek}, ${today}`,
    `Title: ${itemTitle}`,
    priority ? `Priority: ${priority}` : "Priority: (not set, assume medium)",
    why ? `Why: ${why}` : "",
    done ? `Done looks like: ${done}` : "",
  ].filter(Boolean).join("\n");
  try {
    const res = await fetch("/api/rosie", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 150,
        system: [
          "You suggest realistic start + due dates for Lexy's work items at Fort Financial Credit Union.",
          "Return ONLY a JSON object, no preamble.",
          'Shape: {"startDate": "YYYY-MM-DD", "dueDate": "YYYY-MM-DD"}',
          "",
          "HARD RULES:",
          "- Use weekdays (Mon-Fri) only. Never Sat/Sun.",
          "- Dates must be today or future.",
          "- Start date ≤ Due date.",
          "",
          "PRIORITY → SPAN GUIDELINES:",
          "- High: start today or next business day, 3-7 day span",
          "- Medium: start 2-5 business days out, 7-14 day span",
          "- Low: start 1-2 weeks out, 14-30 day span",
          "",
          "WORK-TYPE ADJUSTMENTS:",
          "- MEETINGS/calls: need 3-5 business days lead time for calendar coordination. Due = meeting date.",
          "- INTEGRATIONS/technical rollouts: add extra span for testing (14-21 days even at medium).",
          "- DOCUMENTATION/training materials: can compress to 3-5 days if scope is clear.",
          "- VENDOR REVIEWS/contracts: 7-14 days to leave room for back-and-forth.",
          "- REPORTS/submissions: back-time from deadline mentioned in title or why.",
          "",
          "CONTEXT:",
          "- If title mentions a specific date or deadline, honor it as the due date.",
          "- If someone else is the primary driver (external vendor, boss scheduling), span allows for their response time.",
          "- Avoid starting high-priority work on a Friday — it'll linger over the weekend.",
        ].join("\n"),
        messages: [{ role: "user", content: context }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.content?.find(b => b.type === "text")?.text || "{}";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    if (parsed.startDate && parsed.dueDate) {
      // Hard-enforce weekday-only — Rosie sometimes ignores this rule, so we shift Sat/Sun → Mon
      let start = shiftOffWeekend(parsed.startDate);
      let due = shiftOffWeekend(parsed.dueDate);
      // Make sure start <= due after shift
      if (start > due) start = due;
      return { startDate: start, dueDate: due };
    }
    return null;
  } catch { return null; }
}

// AI-powered task generation — breaks an item into realistic subtasks with time estimates
async function generateTasksWithAI(itemTitle, why, done, notes) {
  const systemPrompt = [
    "You are Rosie, helping Lexy (Project Coordinator on the Implementation team at Fort Financial Credit Union) break down a work item into realistic, actionable subtasks.",
    "She implements systems like Verafin (fraud), Zoho (CRM/workflow), Arkatechture (analytics), Movemint (lending) — so tasks often involve vendor coordination, internal stakeholders, and member-facing impact.",
    "",
    "RULES:",
    "- Return ONLY a JSON object, no markdown, no preamble.",
    '- Shape: {"tasks": [{"title": "...", "mins": number}], "note": "one-sentence explanation"}',
    "- Generate 3-7 subtasks that, completed in order, would actually accomplish the item.",
    "",
    "TASK QUALITY:",
    "- Start each task with a concrete verb: Research, Draft, Send, Review, Update, Schedule, Test, Document, Confirm, Follow up, Present, Deploy.",
    "- Be specific enough that Lexy knows what to DO when she reads it. 'Review charter' is weak — 'Review charter draft with Josh for final approval' is strong.",
    "- Avoid generic placeholder tasks like 'Kickoff meeting' — describe what's actually done IN the meeting.",
    "",
    "TIME ESTIMATES (realistic for ADHD-aware focused work):",
    "- Quick coordination (send email, schedule meeting): 10-15 min",
    "- Reviewing/responding to something existing: 15-30 min",
    "- Drafting documents/charters from scratch: 30-60 min",
    "- Meetings themselves: 30-60 min typical",
    "- Complex technical work (testing, configuration): 45-90 min",
    "- If a task feels like 90+ min, SPLIT it into smaller chunks.",
    "",
    "SEQUENCE + DEPENDENCIES:",
    "- Order tasks so each naturally follows the previous one.",
    "- For anything involving REVIEW or APPROVAL, include both 'Send X for review' AND 'Incorporate feedback' as separate tasks.",
    "- When external people are involved (vendors, leadership), build in their response time — don't stack tasks that assume instant replies.",
    "- Put coordination/setup tasks FIRST, deep-work tasks in the middle, wrap-up/communication tasks LAST.",
    "",
    "CREDIT UNION CONTEXT (when applicable):",
    "- Vendor work often needs a sponsor approval before proceeding.",
    "- Anything member-facing likely needs compliance review.",
    "- New system implementations should include a training/handoff task near the end.",
    "",
    "The 'note' should be 1 sentence max in a warm, ADHD-aware voice explaining the sequencing logic (e.g. 'Started with the foundational charter so feedback has time to come back before kickoff prep').",
  ].join("\n");

  const userMsg = [
    `Item: ${itemTitle}`,
    why ? `Why it matters: ${why}` : "",
    done ? `Done looks like: ${done}` : "",
    notes ? `Notes: ${notes}` : "",
    "",
    "Break this into 3-7 realistic subtasks with time estimates.",
  ].filter(Boolean).join("\n");

  const res = await fetch("/api/rosie", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: "user", content: userMsg }],
    }),
  });
  const data = await res.json();
  const text = data.content?.find(b => b.type === "text")?.text || "{}";
  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    if (Array.isArray(parsed.tasks) && parsed.tasks.length) {
      return {
        tasks: parsed.tasks.map(t => ({
          title: String(t.title || "").trim(),
          mins: Math.max(5, Math.min(120, Number(t.mins) || 15)),
        })).filter(t => t.title),
        note: parsed.note || "",
      };
    }
    return null;
  } catch { return null; }
}

async function generate1on1Summary(items, savedHistory = [], daysWindow = 14) {
  const cutoff = Date.now() - (daysWindow * 24 * 60 * 60 * 1000);
  // "This week" = last 7 days, used to flag items recently active
  const thisWeekCutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const isActiveThisWeek = (i) => {
    if (i.status === "inprogress") return true;
    if (i.lastUpdatedAt && i.lastUpdatedAt >= thisWeekCutoff) return true;
    if (i.completedAt && i.completedAt >= thisWeekCutoff) return true;
    return false;
  };

  // Completed: only within window. Items without completedAt are assumed pre-tracking —
  // fall back to including them so nothing gets silently dropped during migration.
  const done = items.filter(i => {
    if (i.status !== "done") return false;
    if (!i.completedAt) return true;
    return i.completedAt >= cutoff;
  });
  const blocked = items.filter(i => i.status === "blocked");
  const waiting = items.filter(i => i.status === "waiting");
  const inProg = items.filter(i => i.status === "inprogress");
  const todo = items.filter(i => i.status === "todo");
  // "Recently touched" = items updated in last 7 days that aren't done — gives Rosie a "what's currently moving" signal
  const activeThisWeek = items.filter(i => isActiveStatus(i.status) && isActiveThisWeek(i));

  // Helpful "stuck since" hint for older blocked/waiting items
  const stuckLabel = (i) => {
    if (!i.createdAt && !i.lastUpdatedAt) return "";
    const ageMs = Date.now() - (i.lastUpdatedAt || i.createdAt);
    const days = Math.floor(ageMs / (24 * 60 * 60 * 1000));
    if (days >= 14) return ` (stuck ${days}d)`;
    if (days >= 7) return ` (stuck 1+ wk)`;
    return "";
  };

  const summarizeItem = (i) => {
    const parts = [`- ${i.title}`];
    if (i.priority === "high") parts[0] += " ⚠️";
    if (i.scheduledDate) parts[0] += ` (due ${i.scheduledDate})`;
    if (i.timeEstimate) parts[0] += ` (~${i.timeEstimate})`;
    if (i.status === "blocked" || i.status === "waiting") parts[0] += stuckLabel(i);
    if (i.why) parts.push(`  why: ${i.why}`);
    if (i.notes && (i.status === "blocked" || i.status === "waiting")) parts.push(`  notes: ${i.notes}`);
    const taskCount = (i.tasks || []).length;
    const completedCount = (i.completedTasks || []).length;
    if (taskCount > 0) parts.push(`  progress: ${completedCount}/${taskCount} subtasks done`);
    return parts.join("\n");
  };

  const lastPrep = savedHistory.length ? savedHistory[savedHistory.length - 1] : null;

  const periodLabel = daysWindow === 7 ? "last week" : daysWindow === 14 ? "last 2 weeks" : daysWindow === 30 ? "last month" : `last ${daysWindow} days`;

  const userMsg = [
    `Generate 1:1 talking points for my meeting with Josh (my boss). This 1:1 covers the ${periodLabel}.`,
    "",
    `✅ COMPLETED in the ${periodLabel} (${done.length}):\n${done.length ? done.map(summarizeItem).join("\n") : "- (nothing marked done in this period)"}`,
    "",
    `🔥 ACTIVE THIS WEEK — items I've touched in the last 7 days (${activeThisWeek.length}):\n${activeThisWeek.length ? activeThisWeek.map(summarizeItem).join("\n") : "- (nothing actively touched this week)"}`,
    "",
    `🚧 IN PROGRESS — currently flagged active (${inProg.length}):\n${inProg.length ? inProg.map(summarizeItem).join("\n") : "- (nothing flagged in progress)"}`,
    "",
    `📋 TO DO — open items not started yet (${todo.length}):\n${todo.length ? todo.map(summarizeItem).join("\n") : "- (nothing in queue)"}`,
    "",
    `💬 WAITING ON REPLY — including older items still pending (${waiting.length}):\n${waiting.length ? waiting.map(summarizeItem).join("\n") : "- (nothing)"}`,
    "",
    `🚫 BLOCKED — including older items still stuck (${blocked.length}):\n${blocked.length ? blocked.map(summarizeItem).join("\n") : "- (nothing)"}`,
    "",
    lastPrep ? `Last 1:1 prep was on ${lastPrep.date}. Key topics covered then: ${(lastPrep.topics || []).join(", ") || "(no topics noted)"}` : "",
    "",
    "Format the response as:",
    "✅ WINS (what got done in this period)",
    "🔥 ACTIVE THIS WEEK (what I'm pushing on right now — current momentum, even if not fully done)",
    "📋 UPCOMING / IN QUEUE (high-priority to-do items worth flagging — capacity, sequencing, or sponsor decisions Josh should weigh in on)",
    "💬 WAITING ON REPLY (who owes me a response, useful if Josh can nudge them — flag any that have been waiting a long time)",
    "🚫 BLOCKERS (specific asks or decisions needed from Josh — flag stuck-for-weeks items as urgent)",
    "💭 DISCUSSION POINTS (2-3 things genuinely worth Josh's attention)",
  ].filter(Boolean).join("\n");

  const systemPrompt = [
    "You draft 1:1 talking points for Lexy (Project Coordinator, Implementation team at Fort Financial Credit Union). Her boss is Josh. She implements systems like Verafin, Zoho, Arkatechture, Movemint.",
    "",
    "VOICE:",
    "- Professional but human — Josh and Lexy have a working relationship, not a corporate script.",
    "- Concise: he's busy. One line per item max.",
    "- Action-oriented: for blockers, make it clear what decision/help is needed.",
    "",
    "WHAT TO EMPHASIZE:",
    "- Wins should feel earned but not bragging — name what's actually done.",
    "- For TO DO / UPCOMING items: only surface ones where Josh's input would help (high-priority, capacity questions, sponsor decisions, sequencing trade-offs). Don't list every queued item.",
    "- Group related items if there's a theme (e.g. 'Three Zoho-related items in flight — want your read on sequencing').",
    "",
    "GOOD EXAMPLES:",
    '- ✅ "Charter drafted and approved — kickoff on Friday as planned"',
    '- 🚧 "Verafin config ~60% done, on track for 5/15"',
    '- 📋 "Movemint kickoff in queue for next week — want your read on Phase 1 vs Phase 2 scope before I schedule"',
    '- 💬 "Waiting on Colby (Arkatechture) for demo slots — might nudge Friday"',
    '- 🚫 "Need your call on whether to onboard Movemint in Phase 1 or 2"',
    '- 💭 "Team capacity feels tight with 3 active implementations — want your read"',
    "",
    "AVOID:",
    "- Filler phrases like 'Just wanted to touch base'",
    "- Generic status updates without context",
    '- Stating everything as "completed" — mix in wins, challenges, open questions',
    "- Adding items just to fill space — if there's truly nothing for a section, keep it minimal or skip it.",
    "- Don't list every to-do item; only the ones worth Josh's attention.",
    "",
    "Return PLAIN TEXT formatted with the emoji headers as shown. No JSON, no markdown code fences.",
  ].join("\n");

  return askRosie([{ role: "user", content: userMsg }], systemPrompt, 1100);
}

// Refine 1:1 talking points based on Lexy's natural-language feedback
async function refine1on1Summary(currentSummary, items, feedback) {
  const done = items.filter(i => i.status === "done");
  const blocked = items.filter(i => i.status === "blocked");
  const waiting = items.filter(i => i.status === "waiting");
  const inProg = items.filter(i => i.status === "inprogress");

  const systemPrompt = [
    "You revise 1:1 talking points for Lexy (Project Coordinator at Fort Financial Credit Union, boss = Josh) based on her natural-language feedback.",
    "",
    "RULES:",
    "- Keep what's working. Only change what the feedback addresses.",
    "- Maintain the same emoji-header structure (✅ WINS, 🚧 IN PROGRESS, 💬 WAITING ON REPLY, 🚫 BLOCKERS, 💭 DISCUSSION POINTS) unless feedback explicitly says to change format.",
    "- Stay concise and professional but human.",
    "- If feedback asks to add an item that isn't in her current data, ask her to clarify or add it loosely with a note like '(add details)'.",
    "- Return ONLY the revised talking points text. No preamble like 'Here's the revised version:'. No markdown code fences.",
    "",
    "VOICE:",
    "- Same as the original: warm but professional, concise, action-oriented for blockers.",
  ].join("\n");

  const userMsg = [
    "CURRENT TALKING POINTS:",
    currentSummary,
    "",
    "HER CURRENT WORK ITEMS (for reference):",
    `- Done: ${done.map(i=>i.title).join(", ") || "none"}`,
    `- In progress: ${inProg.map(i=>i.title).join(", ") || "none"}`,
    `- Waiting on reply: ${waiting.map(i=>i.title).join(", ") || "none"}`,
    `- Blocked: ${blocked.map(i=>i.title).join(", ") || "none"}`,
    "",
    `LEXY'S FEEDBACK: ${feedback}`,
    "",
    "Return the revised talking points only.",
  ].join("\n");

  return askRosie([{ role: "user", content: userMsg }], systemPrompt, 900);
}

async function classifySpiral(title, notes, links, relatedItemTitle) {
  const res = await fetch("/api/rosie", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 220,
      system: `You are Rosie, a warm ADHD-aware work buddy for Lexy (Project Coordinator, Implementation team at Fort Financial Credit Union in Fort Wayne, IN). She's capturing a hyperfocus rabbit hole so she doesn't lose it when the interest fades. Return ONLY a JSON object, no markdown: {"verdict":"work|tangent|mixed","confidence":"high|medium|low","line":"1 warm honest sentence, max 20 words"}. "work"=directly useful for her job (system implementation, fraud, lending, workflow automation, vendor management). "tangent"=genuine interest but unrelated to her role. "mixed"=could spark something useful but drifted from the original target. Be kind, not judgmental. Hyperfocus is a superpower, and tangents are valid — they sometimes become the next project. Use warm honest language like you'd use with a friend, not a corporate coach.`,
      messages: [{ role: "user", content: `Spiral title: "${title}"${relatedItemTitle ? `\nRelated work item: "${relatedItemTitle}"` : ""}\nNotes: ${notes || "(none)"}\nLinks: ${links.join(", ") || "(none)"}` }],
    }),
  });
  const data = await res.json();
  const text = data.content?.find(b => b.type === "text")?.text || "{}";
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
  catch { return null; }
}
// ── Rosie Tools — real actions she can take ───────────────────────────────────
const ROSIE_TOOLS = [
  {
    name: "create_item",
    description: "Create a new work item. Use when user asks to add/create a task, item, or to-do. IMPORTANT: if the item involves multiple steps or sub-actions (e.g. 'review tickets then check sponsor then update status'), break it into a `tasks` array of subtasks. Most real work items have 2-6 subtasks. Only skip the tasks array for truly single-step items like 'ask Tyler about X'.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Short clear title (under 70 chars)" },
        priority: { type: "string", enum: ["high", "medium", "low"], description: "Priority level" },
        why: { type: "string", description: "Optional 1-line context for why this matters" },
        tasks: { type: "array", items: { type: "string" }, description: "Subtasks / steps to complete this item. Include whenever the item has multiple steps." },
      },
      required: ["title"],
    },
  },
  {
    name: "create_items_bulk",
    description: "Create multiple work items at once. Use when user pastes a list or asks to add several things. IMPORTANT: for each item, break multi-step work into a `tasks` array. If an item says 'do X then Y then Z', those are 3 subtasks. Don't lose the detail — the user is counting on you to capture the sub-steps they mentioned.",
    input_schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string", description: "Short clear title (under 70 chars)" },
              priority: { type: "string", enum: ["high", "medium", "low"] },
              why: { type: "string", description: "Optional 1-line why-it-matters" },
              tasks: { type: "array", items: { type: "string" }, description: "Subtasks. Include whenever the item has 2+ steps mentioned." },
            },
            required: ["title"],
          },
        },
      },
      required: ["items"],
    },
  },
  {
    name: "add_to_parking_lot",
    description: "Drop a thought into the parking lot. Use for quick ideas that don't need structure yet.",
    input_schema: {
      type: "object",
      properties: { text: { type: "string" } },
      required: ["text"],
    },
  },
  {
    name: "update_item_status",
    description: "Change status of an existing item. Match by title (case-insensitive partial match ok).",
    input_schema: {
      type: "object",
      properties: {
        titleMatch: { type: "string", description: "Title or partial title to match" },
        status: { type: "string", enum: ["todo", "inprogress", "blocked", "done"] },
      },
      required: ["titleMatch", "status"],
    },
  },
  {
    name: "add_task_to_item",
    description: "Add a NEW subtask to an EXISTING work item. Use when user asks to add a task, step, or to-do under a specific item (e.g. 'add a task to prep the kickoff' or 'add to my Verafin item'). Match the item by title.",
    input_schema: {
      type: "object",
      properties: {
        itemTitleMatch: { type: "string", description: "Title or partial title of the existing item to add the task to" },
        taskTitle: { type: "string", description: "The new subtask to add" },
        estimatedMinutes: { type: "number", description: "Optional time estimate in minutes (default 15)" },
      },
      required: ["itemTitleMatch", "taskTitle"],
    },
  },
  {
    name: "check_off_task",
    description: "Mark a subtask as complete within an item.",
    input_schema: {
      type: "object",
      properties: {
        itemTitleMatch: { type: "string" },
        taskMatch: { type: "string", description: "Task name or partial match" },
      },
      required: ["itemTitleMatch", "taskMatch"],
    },
  },
  {
    name: "catch_spiral",
    description: "Capture a hyperfocus rabbit hole / spiral before the interest fades.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        notes: { type: "string" },
      },
      required: ["title"],
    },
  },
];

// Execute a tool call against current data, return new data + a confirmation message
function executeRosieTool(toolName, input, data) {
  if (toolName === "create_item") {
    const newItem = {
      id: uid(),
      title: input.title,
      priority: input.priority || "medium",
      status: "todo",
      why: input.why || "",
      tasks: input.tasks || [],
      taskTimes: (input.tasks || []).map(() => 15),
      completedTasks: [],
      category: "",
      done: "",
      outOfScope: "",
      notes: "",
      timeEstimate: "",
      createdAt: Date.now(),
    };
    return {
      data: { ...data, items: [...data.items, newItem] },
      result: `✓ Added "${input.title}"`,
    };
  }
  if (toolName === "create_items_bulk") {
    const newItems = (input.items || []).map(it => ({
      id: uid(),
      title: it.title,
      priority: it.priority || "medium",
      status: "todo",
      why: it.why || "",
      tasks: it.tasks || [],
      taskTimes: (it.tasks || []).map(() => 15),
      completedTasks: [],
      category: "",
      done: "",
      outOfScope: "",
      notes: "",
      timeEstimate: "",
      createdAt: Date.now(),
    }));
    return {
      data: { ...data, items: [...data.items, ...newItems] },
      result: `✓ Added ${newItems.length} item${newItems.length === 1 ? "" : "s"}: ${newItems.map(i => i.title).join(", ")}`,
    };
  }
  if (toolName === "add_to_parking_lot") {
    return {
      data: { ...data, parkingLot: [...(data.parkingLot || []), input.text] },
      result: `🌿 Parked: "${input.text}"`,
    };
  }
  if (toolName === "update_item_status") {
    const match = data.items.find(i => i.title.toLowerCase().includes(input.titleMatch.toLowerCase()));
    if (!match) return { data, result: `✗ Couldn't find an item matching "${input.titleMatch}"` };
    return {
      data: { ...data, items: data.items.map(i => i.id === match.id ? { ...i, status: input.status } : i) },
      result: `✓ Moved "${match.title}" → ${statusMap[input.status]?.label || input.status}`,
    };
  }
  if (toolName === "add_task_to_item") {
    const match = data.items.find(i => i.title.toLowerCase().includes(input.itemTitleMatch.toLowerCase()));
    if (!match) return { data, result: `✗ Couldn't find an item matching "${input.itemTitleMatch}"` };
    const newTaskTitle = input.taskTitle.trim();
    if (!newTaskTitle) return { data, result: `✗ Empty task title` };
    // Don't dupe — case-insensitive check
    const existingTasks = match.tasks || [];
    if (existingTasks.some(t => t.toLowerCase() === newTaskTitle.toLowerCase())) {
      return { data, result: `That task already exists in "${match.title}" 🌸` };
    }
    const mins = Number.isFinite(input.estimatedMinutes) ? Math.max(5, Math.min(120, input.estimatedMinutes)) : 15;
    const updated = alignTaskParents({
      ...match,
      tasks: [...existingTasks, newTaskTitle],
      taskTimes: [...(match.taskTimes || existingTasks.map(() => 15)), mins],
      lastUpdatedAt: Date.now(),
    });
    return {
      data: { ...data, items: data.items.map(i => i.id === match.id ? updated : i) },
      result: `✓ Added "${newTaskTitle}" as a task under "${match.title}" (~${mins}m)`,
    };
  }
  if (toolName === "check_off_task") {
    const match = data.items.find(i => i.title.toLowerCase().includes(input.itemTitleMatch.toLowerCase()));
    if (!match) return { data, result: `✗ Couldn't find item "${input.itemTitleMatch}"` };
    const taskMatch = (match.tasks || []).find(t => t.toLowerCase().includes(input.taskMatch.toLowerCase()));
    if (!taskMatch) return { data, result: `✗ Couldn't find task "${input.taskMatch}" in "${match.title}"` };
    const done = match.completedTasks || [];
    if (done.includes(taskMatch)) return { data, result: `Already checked off "${taskMatch}" 🌸` };
    const newCompleted = [...done, taskMatch];
    const newDateMap = { ...(match.completedTaskDates || {}), [taskMatch]: Date.now() };
    const tasks = match.tasks || [];
    const allDone = tasks.length > 0 && newCompleted.length === tasks.length;
    const wasDone = match.status === "done";
    const updatedItem = {
      ...match,
      completedTasks: newCompleted,
      completedTaskDates: newDateMap,
      status: allDone ? "done" : match.status,
      completedAt: allDone && !wasDone ? Date.now() : match.completedAt,
    };
    return {
      data: { ...data, items: data.items.map(i => i.id === match.id ? updatedItem : i) },
      result: allDone
        ? `✓ Checked off "${taskMatch}" — that was the last one, "${match.title}" is DONE! ✦`
        : `✓ Checked off "${taskMatch}" in "${match.title}"`,
    };
  }
  if (toolName === "catch_spiral") {
    const newSpiral = {
      id: uid(),
      title: input.title,
      notes: input.notes || "",
      links: [],
      itemId: null,
      createdAt: Date.now(),
      aiRead: null,
    };
    return {
      data: { ...data, spirals: [newSpiral, ...(data.spirals || [])] },
      result: `🌀 Caught spiral: "${input.title}"`,
    };
  }
  return { data, result: `✗ Unknown tool: ${toolName}` };
}

// Chat with Rosie that can use tools. Runs a tool-use loop up to maxSteps.
// Uses a functional updater (getLatestData) so each tool call operates on the
// most recent data — not a stale snapshot — and writes are never overwritten.
// ── Deterministic list parser ─────────────────────────────────────────────────
// When user's chat message looks like a structured list (multiple lines, bullets,
// or "Month: Item1, Item2" format), parse it WITHOUT relying on the LLM to make
// tool calls. Returns parsed entries or null if not a list-shaped message.
function detectAndParseList(message) {
  if (!message) return null;
  const text = message.trim();

  // Heuristic: must have at least 3 lines OR at least 3 commas/bullets to count as a list
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const bulletLines = lines.filter(l => /^[-•*·]\s|^\d+[.)]\s/.test(l));
  const monthLineRegex = /^[-•*·]?\s*(Jan(uary)?|Feb(ruary)?|Mar(ch)?|Apr(il)?|May|Jun(e)?|Jul(y)?|Aug(ust)?|Sep(t(ember)?)?|Oct(ober)?|Nov(ember)?|Dec(ember)?)\s*[:\-–]\s*(.+)$/i;
  const monthLines = lines.filter(l => monthLineRegex.test(l));

  // PATTERN A: "Month: items, items" lines — parse to month-keyed entries with end-of-month due dates
  if (monthLines.length >= 3) {
    const entries = [];
    const monthIdx = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
    const today = new Date();
    monthLines.forEach(line => {
      const m = line.match(monthLineRegex);
      if (!m) return;
      const monthName = m[1].toLowerCase().slice(0, 3);
      const monthNum = monthIdx[monthName];
      if (monthNum === undefined) return;
      // Last group is the items text
      const itemsText = m[m.length - 1];
      // Split on commas, "and", or semicolons
      const items = itemsText.split(/,|\sand\s|;/).map(s => s.trim()).filter(s => s.length >= 2 && s.length <= 100);
      // End of month date
      let year = today.getFullYear();
      // If the month is in the past for this year, assume next year
      if (monthNum < today.getMonth()) year++;
      const lastDay = new Date(year, monthNum + 1, 0).getDate();
      const monthEndDate = `${year}-${String(monthNum + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      // Shift weekend dates
      const safeDate = shiftOffWeekend(monthEndDate);
      items.forEach(taskTitle => {
        entries.push({ taskTitle, date: safeDate, monthName: m[1] });
      });
    });
    if (entries.length >= 3) return { kind: "monthly_tasks", entries };
  }

  // PATTERN B: Bullet/numbered list with at least 3 items
  if (bulletLines.length >= 3) {
    const entries = bulletLines.map(line => {
      const cleaned = line.replace(/^[-•*·]\s+|^\d+[.)]\s+/, "").trim();
      // Try to extract a date from the end (e.g. "Item — May 30" or "Item (5/30)")
      let taskTitle = cleaned;
      let date = null;
      const dateMatch = cleaned.match(/[\u2014\u2013\-—]\s*(.+)$|\(([^)]+)\)\s*$/);
      if (dateMatch) {
        const datePart = (dateMatch[1] || dateMatch[2] || "").trim();
        const parsed = tryParseLooseDate(datePart);
        if (parsed) {
          taskTitle = cleaned.slice(0, dateMatch.index).trim();
          date = parsed;
        }
      }
      return { taskTitle, date };
    }).filter(e => e.taskTitle.length >= 2);
    if (entries.length >= 3) return { kind: "bullet_tasks", entries };
  }

  return null;
}

// Try to parse loose date strings like "May 30", "5/30", "May 30 2026", "end of May"
function tryParseLooseDate(s) {
  if (!s) return null;
  const today = new Date();
  const yr = today.getFullYear();
  // "MM/DD" or "MM/DD/YY"
  const slash = s.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (slash) {
    const month = parseInt(slash[1], 10) - 1;
    const day = parseInt(slash[2], 10);
    let year = slash[3] ? parseInt(slash[3], 10) : yr;
    if (year < 100) year += 2000;
    if (month < today.getMonth()) year++;
    return shiftOffWeekend(`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  }
  // "Month Day" or "Month Day Year"
  const monthIdx = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  const monthDay = s.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:[, ]+(\d{4}))?$/i);
  if (monthDay) {
    const month = monthIdx[monthDay[1].toLowerCase().slice(0, 3)];
    const day = parseInt(monthDay[2], 10);
    let year = monthDay[3] ? parseInt(monthDay[3], 10) : yr;
    if (!monthDay[3] && month < today.getMonth()) year++;
    return shiftOffWeekend(`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  }
  // "end of May" → last day of May
  const endOf = s.match(/^end\s+of\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);
  if (endOf) {
    const month = monthIdx[endOf[1].toLowerCase().slice(0, 3)];
    let year = yr;
    if (month < today.getMonth()) year++;
    const lastDay = new Date(year, month + 1, 0).getDate();
    return shiftOffWeekend(`${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`);
  }
  return null;
}

// Helper for the fallback parser: maps loose primary/parent text into the right tool input shape
function buildFallbackInput(toolName, primary, parent) {
  const p = (primary || "").trim();
  const pa = (parent || "").trim();
  if (!p) return null;
  if (toolName === "add_task_to_item") return pa ? { itemTitleMatch: pa, taskTitle: p } : null;
  if (toolName === "check_off_task")   return pa ? { itemTitleMatch: pa, taskMatch: p } : null;
  if (toolName === "create_item")      return { title: p };
  if (toolName === "add_to_parking_lot") return { text: p };
  if (toolName === "catch_spiral")     return { title: p };
  if (toolName === "update_item_status") return pa ? { titleMatch: p, status: pa.toLowerCase() } : null;
  return null;
}

async function askRosieWithTools({ messages, systemPrompt, getLatestData, onDataUpdate, maxSteps = 5, focusedItemId = null }) {
  let currentMessages = [...messages];
  const actionsLog = [];

  // Helper: when fallback parses a tool call without a parent, default to the
  // focused item's title (if we're in a focus context). Without this, parsed
  // calls like [Calling add_task_to_item for "X"] return null because no parent
  // is specified, and the task silently fails to be added.
  const focusedItemTitle = (() => {
    if (!focusedItemId) return null;
    const data = getLatestData();
    const it = (data?.items || []).find(i => i.id === focusedItemId);
    return it?.title || null;
  })();

  for (let step = 0; step < maxSteps; step++) {
    const res = await fetch("/api/rosie", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: systemPrompt,
        tools: ROSIE_TOOLS,
        tool_choice: { type: "auto" }, // explicit — model decides whether to use tools
        messages: currentMessages,
      }),
    });
    const resp = await res.json();
    const contentBlocks = resp.content || [];
    const toolUses = contentBlocks.filter(b => b.type === "tool_use");
    const textBlocks = contentBlocks.filter(b => b.type === "text");

    // If no tools called, return final text response
    if (toolUses.length === 0) {
      let text = textBlocks.map(b => b.text).join("\n").trim() || "Done 🌸";

      // FALLBACK: Rosie has multiple ways of faking tool calls in text.
      // We try to parse all known patterns and run the real tools.
      const fallbackActions = [];
      const latestData = getLatestData();
      let workingData = latestData;

      // PATTERN 1: [calling tool_name: "X" under "Y"]  (case-insensitive)
      const bracketRegex = /\[calling\s+(\w+):\s*["']([^"']+)["'](?:\s+under\s+["']?([^"'\]]+?)["']?)?\s*\]/gi;
      let m;
      while ((m = bracketRegex.exec(text)) !== null) {
        const [, toolName, primary, parent] = m;
        const parentResolved = parent || focusedItemTitle;
        const input = buildFallbackInput(toolName, primary, parentResolved);
        if (input) {
          const { data: newData, result } = executeRosieTool(toolName, input, workingData);
          workingData = newData;
          fallbackActions.push(result);

        }
      }

      // PATTERN 1b: [calling/invoking/using tool_name (for/with/to) "X" (under/in "Y")]
      // This catches Rosie's looser narration like:
      //   [Calling add_task_to_item for "Review"]
      //   [Invoking add_task_to_item with "Presentation"]
      //   [add_task_to_item: "X"] (no leading verb)
      // When in focus mode, the parent defaults to the focused item's title.
      const bracketLooseRegex = /\[\s*(?:calling|invoking|running|using|use)?\s*(\w+)(?:\s+(?:for|with|to|on|named|called))?\s*[:\-]?\s*["']([^"']+)["'](?:\s+(?:under|to|on|in|for)\s+["']?([^"'\]]+?)["']?)?\s*\]/gi;
      while ((m = bracketLooseRegex.exec(text)) !== null) {
        const [, toolName, primary, parent] = m;
        // Only run if it's a recognized Rosie tool name — skip random bracketed text
        const knownTools = new Set(["add_task_to_item", "check_off_task", "create_item", "add_to_parking_lot", "catch_spiral", "update_item_status"]);
        if (!knownTools.has(toolName)) continue;
        // Skip if PATTERN 1 already matched this exact span (avoid double-add)
        const parentResolved = parent || focusedItemTitle;
        const input = buildFallbackInput(toolName, primary, parentResolved);
        if (input) {
          const { data: newData, result } = executeRosieTool(toolName, input, workingData);
          workingData = newData;
          fallbackActions.push(result);

        }
      }

      // PATTERN 2: <function_calls><invoke name="X">...</invoke></function_calls>
      // Sometimes the invoke is empty; sometimes it has <parameter name="title">value</parameter>
      const xmlRegex = /<invoke\s+name=["'](\w+)["']\s*>([\s\S]*?)<\/invoke>/gi;
      while ((m = xmlRegex.exec(text)) !== null) {
        const [, toolName, body] = m;
        // Try to extract <parameter name="X">value</parameter>
        const params = {};
        const paramRegex = /<parameter\s+name=["'](\w+)["']\s*>([\s\S]*?)<\/parameter>/gi;
        let pm;
        while ((pm = paramRegex.exec(body)) !== null) {
          params[pm[1]] = pm[2].trim();
        }
        // If no params extracted, try to infer from surrounding text (e.g. "create_item — Personal SMART Goal")
        let input = null;
        if (Object.keys(params).length) {
          input = params;
        } else {
          // Look for a quoted string near the tag in the surrounding text
          const quoted = text.match(/["“']([^"”']{3,80})["”']/);
          if (quoted) {
            input = buildFallbackInput(toolName, quoted[1], null);
          }
        }
        if (input && Object.keys(input).length) {
          const { data: newData, result } = executeRosieTool(toolName, input, workingData);
          workingData = newData;
          fallbackActions.push(result);
        }
      }

      if (fallbackActions.length) {
        onDataUpdate(workingData);
        // Strip the fake call syntax from the displayed text
        text = text
          .replace(bracketRegex, "")
          .replace(bracketLooseRegex, "")
          .replace(/<function_calls>[\s\S]*?<\/function_calls>/g, "")
          .replace(/<invoke[\s\S]*?<\/invoke>/g, "")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
        return { text, actions: [...actionsLog, ...fallbackActions] };
      }

      return { text, actions: actionsLog };
    }

    // Append assistant turn (with tool_use blocks) to messages
    currentMessages.push({ role: "assistant", content: contentBlocks });

    // Execute each tool call against the LATEST data, and persist immediately
    const toolResults = [];
    for (const tu of toolUses) {
      const latest = getLatestData();
      const { data: newData, result } = executeRosieTool(tu.name, tu.input, latest);

      onDataUpdate(newData); // persist right away so nothing gets lost
      actionsLog.push(result);
      toolResults.push({
        type: "tool_result",
        tool_use_id: tu.id,
        content: result,
      });
    }

    // Append tool results as user turn
    currentMessages.push({ role: "user", content: toolResults });
  }

  return { text: "All set 🌸", actions: actionsLog };
}
async function generateRoadmap(items, energy, mood, note) {
  const now = getNowEST();
  const timeStr = fmtTimeEST(now);
  const active = items.filter(i => isActiveStatus(i.status));
  const energyObj = ENERGY_LEVELS.find(e => e.key === energy) || ENERGY_LEVELS[1];
  const moodObj = MOODS.find(m => m.key === mood);

  // ── DETERMINISTIC MEETING PARSING ──
  // Parse meetings from the formatted lines in `note` (format: "9:00 AM - 9:30 AM | Title").
  // Pre-build their slots (prep + meeting + breather) with explicit durationMin and locks.
  // This eliminates Rosie's guesswork — she just plans WORK around these immutable anchors.
  const parsedMeetings = parseMeetingsFromText(note);
  const preplacedSlots = parsedMeetings.flatMap(buildMeetingSlots);
  const preplacedSummary = parsedMeetings.length > 0
    ? parsedMeetings.map(m => `  - ${formatSlotMinutes(m.startMin)}–${formatSlotMinutes(m.endMin)} (${m.durationMin} min): ${m.label}`).join("\n")
    : null;

  const systemPrompt = [
    "You are Rosie, building a realistic morning work roadmap for Lexy (Project Coordinator, Implementation team at Fort Financial Credit Union in Fort Wayne, IN). Lexy has ADHD/autism/bipolar and needs structured but forgiving days.",
    "",
    "Return ONLY a JSON object, no markdown, no preamble. Shape:",
    `{
  "greeting": "warm 1-sentence greeting naming her energy/mood by feel, not label",
  "headline": "short punchy headline like 'Steady focus day' or 'Protect your energy'",
  "slots": [{"time":"9:00 AM","label":"short label","type":"work|break|buffer|blocked","note":"optional short tip, max 12 words"}],
  "todayAdvice": "1-2 sentences of ADHD-aware advice grounded in her actual energy/mood",
  "protectedTime": "1 specific thing to NOT schedule today, with reason"
}`,
    "",
    "SCHEDULING RULES (HARD REQUIREMENTS — never skip these):",
    "- Work window: current time to 5:00 PM EST",
    "- Always start with a 15-min morning buffer (reorient, coffee, notifications, settle in)",
    "- ✱ MORNING BRAIN BREAK: 15 minutes, scheduled BETWEEN 10:00 AM and 11:00 AM. Type: 'break'. Label something like 'Morning brain break' or 'Stretch & reset'.",
    "- ✱ LUNCH: 30–60 min (default to 60 unless the user asks for shorter). Start time MUST be between 12:00 PM and 1:30 PM (inclusive of 1:30 PM as latest start). Type: 'break'. Label 'Lunch'.",
    "- ✱ AFTERNOON BRAIN BREAK: 15 minutes, scheduled BETWEEN 3:00 PM and 4:00 PM. Type: 'break'. Label something like 'Afternoon brain break' or 'Walk & reset'.",
    preplacedSummary
      ? "- ✱ MEETINGS ARE PRE-PLACED — DO NOT generate slots with type:'meeting'. The system will inject the meetings (and their prep/breather buffers) AFTER your output. Just plan WORK around these times (listed below). Treat those time ranges as UNAVAILABLE."
      : "- ✱ MEETINGS: If the user mentions a meeting freely in their notes (not in the structured list), create it with type:'meeting' at the EXACT start/duration they stated, with a 'Prep for X' buffer 10 min before and 'Buffer after X' 15 min after.",
    "- ✱ END-OF-DAY WRAP: 4:30 PM (16:30), 15 minutes. Type: 'buffer'. Label 'Wrap & tomorrow prep'. This is for closing tabs, jotting tomorrow's first thing, sending final messages.",
    "- ✱ CLOSE FOR THE DAY: 4:45 PM (16:45), 15 minutes. Type: 'break'. Label 'Close for the day'.",
    "- These break/buffer/wrap slots above are NON-NEGOTIABLE. Build the work blocks around them.",
    "- All work blocks must end no later than 4:30 PM.",
    "- 8-12 slots total max — don't over-stuff the day",
    "- Slot labels under 6 words",
    "",
    "ENERGY CALIBRATION:",
    "- LOW / ROUGH: max 2-3 work items, lots of buffer, frequent breaks, name the hard days with warmth",
    "- MEDIUM: balanced realistic day, 4-5 work items, normal cadence",
    "- HIGH / SHARP: fuller day okay, BUT warn about scope creep at end — high energy is when things get over-committed",
    "",
    "MOOD SENSITIVITY:",
    "- Anxious/overwhelmed: protect time, fewer transitions, clear wins first",
    "- Frustrated: get a hard thing moved early so the day gets easier from there. Maybe a parking-lot block first to dump the irritation.",
    "- Excited/motivated: great, but still include breaks — hyperfocus burnout is real",
    "- Tired: shorter work blocks (30-45m), more frequent breaks, body-first morning (water, walk, sunlight)",
    "- Foggy: do not start with cognitively heavy work. Open with something concrete and easy to build momentum. Suggest 'wake up the brain' tasks first (review notes, tidy inbox).",
    "- Quiet: protect deep solo focus. No suggestions for collaborative or social blocks unless required. Less chatty Rosie tone.",
    "- Flat: don't try to perk her up. Steady predictable schedule. Validate that flat days still count.",
    "- Scattered: small atomic blocks (15-20m), one thing at a time, lots of micro-wins",
    "- Neutral: just run a normal day",
    "",
    "ITEM PRIORITIZATION:",
    "- BLOCKED items: show in schedule but mark type as 'blocked' — still visible, not hidden",
    "- HIGH priority: earlier in the day when focus is freshest",
    "- IN PROGRESS: continue where she left off when possible, don't always reset",
    "- MEDIUM/LOW: fill around the high-priority + in-progress work",
    "",
    "VOICE:",
    "- Warm and human, like a trusted friend who knows her patterns",
    "- Not corporate, not clinical",
    "- Concrete > vague ('Protect your morning for the Verafin charter' > 'Focus on important work')",
    "- Acknowledge hard days without rescuing or fixing — just witness",
  ].filter(Boolean).join("\n");

  const userMsg = [
    `Current time (EST): ${timeStr}`,
    `Energy: ${energyObj.label} ${energyObj.emoji}`,
    `Mood: ${moodObj ? moodObj.label + " " + moodObj.emoji : "not set"}`,
    `Note from check-in: ${note || "none"}`,
    "",
    preplacedSummary ? "PRE-PLACED MEETINGS (these are LOCKED — the system will inject them; do NOT include them in your slots; just plan work around these times):" : null,
    preplacedSummary,
    preplacedSummary ? "" : null,
    "Active work items (priority ordered):",
    active.map((i, idx) => `${idx + 1}. [${i.priority || "medium"} priority] ${i.title}${i.timeEstimate ? ` (~${i.timeEstimate})` : ""}${i.status === "blocked" ? " 🚫 BLOCKED" : ""}${i.status === "inprogress" ? " ⚡ IN PROGRESS" : ""}${i.status === "waiting" ? " 💬 WAITING ON REPLY" : ""}`).join("\n") || "No items yet — free day!",
    "",
    "Build a realistic roadmap from now through 4:30 PM.",
  ].filter(l => l !== null).join("\n");

  try {
    let res;
    try {
      res = await fetch("/api/rosie", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1200,
          system: systemPrompt,
          messages: [{ role: "user", content: userMsg }],
        }),
      });
    } catch (netErr) {
      throw new Error(`Network error — ${netErr.message || "couldn't reach Rosie"}`);
    }
    if (!res.ok) {
      let bodyText = "";
      try { bodyText = await res.text(); } catch {}
      console.warn("[generateRoadmap] API returned non-OK status:", res.status, bodyText.slice(0, 300));
      if (res.status === 429) throw new Error("Rosie's busy right now (rate limited). Wait a sec and try again.");
      if (res.status >= 500) throw new Error(`Rosie's server hiccupped (HTTP ${res.status}). Try again in a moment.`);
      throw new Error(`API returned status ${res.status}`);
    }
    const data = await res.json();
    // Check for explicit API errors
    if (data.error) {
      console.warn("[generateRoadmap] API error:", data.error);
      throw new Error(`API error: ${data.error.message || data.error.type || "unknown"}`);
    }
    const text = data.content?.find(b => b.type === "text")?.text || "";
    if (!text) {
      console.warn("[generateRoadmap] empty response text");
      throw new Error("Rosie returned an empty response.");
    }
    // Robust JSON extraction — Rosie sometimes wraps in code fences or adds
    // preamble/postamble like "Here's your roadmap:" before the JSON object.
    // Strategy: strip code fences first, then if still doesn't parse, extract
    // the first {...} block by counting braces.
    let parsed = null;
    const cleanText = text.replace(/```json\s*|```\s*/g, "").trim();
    try {
      parsed = JSON.parse(cleanText);
    } catch {
      // Try extracting the first balanced JSON object by counting braces.
      const startIdx = cleanText.indexOf("{");
      if (startIdx >= 0) {
        let depth = 0, inString = false, escape = false;
        let endIdx = -1;
        for (let i = startIdx; i < cleanText.length; i++) {
          const ch = cleanText[i];
          if (escape) { escape = false; continue; }
          if (ch === "\\") { escape = true; continue; }
          if (ch === '"') { inString = !inString; continue; }
          if (inString) continue;
          if (ch === "{") depth++;
          else if (ch === "}") {
            depth--;
            if (depth === 0) { endIdx = i; break; }
          }
        }
        if (endIdx > startIdx) {
          try {
            parsed = JSON.parse(cleanText.slice(startIdx, endIdx + 1));
          } catch (err2) {
            console.warn("[generateRoadmap] JSON parse failed even after extraction:", err2.message, "raw text:", text.slice(0, 300));
          }
        }
      }
      if (!parsed) {
        console.warn("[generateRoadmap] couldn't parse Rosie's response. Raw text:", text.slice(0, 300));
        throw new Error("Rosie's response wasn't valid JSON.");
      }
    }
    if (!parsed || !Array.isArray(parsed.slots) || parsed.slots.length === 0) {
      console.warn("[generateRoadmap] response had no slots:", parsed);
      throw new Error("Rosie didn't generate any slots.");
    }
    {
      // Wrap the post-processing pipeline in its own try so a pipeline bug
      // (e.g., a regression in fillPhantomGaps) doesn't completely lose
      // Rosie's response. If pipeline fails, we return the raw parsed slots
      // and the user gets a working-but-unprocessed roadmap.
      try {
        // 0. STRIP any incoming locks from Rosie — we re-apply locks deterministically
        // based on slot type/label heuristics, not whatever Rosie decided to lock.
        parsed.slots = parsed.slots.map(s => ({ ...s, locked: false }));
      // 0.5 INJECT PRE-PLACED MEETINGS — these were parsed deterministically from
      // the meetings text and have explicit durationMin + locks. Rosie was told NOT
      // to include them. We also strip any slot Rosie generated that overlaps a
      // pre-placed meeting's time window (defense in case she ignored the instruction).
      if (preplacedSlots.length > 0) {
        const preplacedTimeKeys = new Set(preplacedSlots.map(s => s.time + "|" + s.label));
        // Build the full BLOCKED windows from each meeting (prep + meeting + breather).
        // Any non-pre-placed slot starting inside one of these windows is a conflict.
        const blockedWindows = parsedMeetings.map(m => ({
          // 10 min prep + 60 min meeting + 15 min breather = full reserved window
          fromMin: Math.max(0, m.startMin - 10),
          toMin: m.endMin + 15,
        }));
        const inBlockedWindow = (s) => {
          const t = parseSlotTimeMinutes(s.time);
          if (t < 0) return false;
          return blockedWindows.some(w => t >= w.fromMin && t < w.toMin);
        };
        // Drop Rosie-generated slots that:
        // (a) are pre-placed duplicates we already have, OR
        // (b) start inside a pre-placed meeting's blocked window (would conflict)
        parsed.slots = parsed.slots.filter(s => {
          // If this slot IS one of our pre-placed slots (label+time match), skip — we'll add ours
          if (preplacedTimeKeys.has(s.time + "|" + s.label)) return false;
          // If this slot is in a blocked meeting window, drop it
          if (inBlockedWindow(s)) return false;
          return true;
        });
        // Merge in pre-placed slots
        parsed.slots = [...parsed.slots, ...preplacedSlots];
      }
      // ─── ONE-CALL CANONICAL PIPELINE ───
      // canonicalizeSlots replaces what used to be ~13 separate steps:
      //   sort, autoLock, ensureRequiredBreaks, ensureMorningMeetingPrep,
      //   ensureMeetingPrepBlocks, ensureMeetingBreathers, ensureEndOfDayBlocks,
      //   autoLock again, sort again, rebalance, fillPhantomGaps.
      // It's idempotent and guarantees: sorted, no overlaps, all rules applied.
      parsed.slots = canonicalizeSlots(parsed.slots);
      } catch (pipelineErr) {
        // Pipeline crashed — log and return what we have. Rosie's raw slots
        // are still better than nothing (the user can manually fix from there).
        console.warn("[generateRoadmap] pipeline post-processing failed (returning raw slots):", pipelineErr);
      }
    }
    return parsed;
  }
  catch (err) {
    // Re-throw so the caller (runRoadmapGeneration) sees the specific error
    // message and can show it to the user. The outer try/catch is here only to
    // log uniformly — it must NOT swallow errors silently.
    console.warn("[generateRoadmap] failed:", err);
    throw err;
  }
}
// AI-powered roadmap refinement — takes user feedback and revises the plan
async function refineRoadmap(currentRoadmap, items, energy, mood, userFeedback) {
  const active = items.filter(i => isActiveStatus(i.status));
  const energyObj = ENERGY_LEVELS.find(e => e.key === energy) || ENERGY_LEVELS[1];
  const moodObj = MOODS.find(m => m.key === mood);

  const systemPrompt = [
    "You revise Lexy's daily work roadmap based on her natural-language feedback. She has ADHD/autism/bipolar and works at Fort Financial Credit Union.",
    "",
    "Return ONLY a JSON object matching the EXACT same shape as the original roadmap, no markdown:",
    `{"greeting":"...","headline":"...","slots":[{"time":"...","label":"...","type":"work|break|buffer|meeting|blocked","note":"..."}],"todayAdvice":"...","protectedTime":"..."}`,
    "",
    "RULES:",
    "- Apply ONLY the changes the user requested. Don't rewrite untouched parts.",
    "- Keep the same time format (e.g. '9:00 AM').",
    "- Maintain weekday-only logic, lunch break, afternoon break.",
    "- ✱ MEETINGS: Any meeting Lexy mentions (e.g. 'IT meeting from 10 to 10:30', 'add Verafin sync at 2pm') MUST use type:'meeting' so it gets auto-locked. Use the EXACT start time and duration she specifies. Each meeting needs a 10-min prep buffer (type:'buffer', label 'Prep for [meeting]') BEFORE and a 15-min buffer (type:'buffer', label 'Buffer after [meeting]') AFTER.",
    "- If she says 'add 30 min for X', add the slot at a sensible spot.",
    "- If she says 'too much/less work', adjust slot count not just labels.",
    "- If she says 'move X earlier/later', shift only that slot and adjacent times.",
    "- Update todayAdvice if the change affects the overall energy of the day.",
    "- Voice: warm, ADHD-aware, concrete. Like a trusted friend.",
  ].join("\n");

  const userMsg = [
    "CURRENT ROADMAP:",
    JSON.stringify(currentRoadmap, null, 2),
    "",
    `ENERGY: ${energyObj.label} | MOOD: ${moodObj?.label || "?"}`,
    "",
    `ACTIVE PLATE:\n${active.map(i => `- [${i.priority || "medium"}] ${i.title}${i.timeEstimate ? ` (~${i.timeEstimate})` : ""}`).join("\n") || "(no items)"}`,
    "",
    `FEEDBACK: ${userFeedback}`,
    "",
    "Return the revised roadmap.",
  ].join("\n");

  try {
    const res = await fetch("/api/rosie", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: userMsg }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.content?.find(b => b.type === "text")?.text || "{}";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    if (parsed && Array.isArray(parsed.slots)) {
      // STRIP any incoming locks from Rosie — locks are re-applied below.
      parsed.slots = parsed.slots.map(s => ({ ...s, locked: false }));
      // ─── ONE-CALL CANONICAL PIPELINE ───
      // canonicalizeSlots: heal + apply all rules + sort + rebalance + gap fill.
      // Replaces what used to be 11 separate steps. Idempotent.
      parsed.slots = canonicalizeSlots(parsed.slots);

      // ── BULLETPROOF LOCK PRESERVATION ──
      // Locked slots from the prior roadmap should NEVER move during a refine.
      // We match each new slot to a prior locked slot by EITHER:
      //   (a) exact-time match (most reliable — locked slots shouldn't move)
      //   (b) fuzzy label match (handles minor relabels by Rosie)
      // For matched slots, we restore the ORIGINAL TIME and re-apply locked: true.
      //
      // CLEANUP: filter out prior locks that shouldn't have been locked in the first
      // place (e.g., slots that got auto-locked by an old buggy heuristic). A prior
      // lock is considered legitimate ONLY if any of these are true.
      const priorLocked = (currentRoadmap?.slots || []).filter(s => {
        if (!s.locked) return false;
        // ── USER-LOCKED slots are ALWAYS legitimate. The user explicitly chose
        //    to lock this slot — survives every refine and every Re-apply.
        if (s.userLocked) return true;
        if (isMeetingSlot(s)) return true; // legitimate meeting lock
        const lab = (s.label || "").toLowerCase();
        if (lab.startsWith("prep for") || lab.startsWith("buffer after") ||
            lab.startsWith("breather after") || lab.includes("breather after")) return true; // legitimate meeting-related lock
        if (lab.includes("wrap") || lab.includes("close for") || lab.includes("close out") ||
            lab.includes("end of day") || lab.includes("end-of-day")) return true; // EOD legitimate
        if (lab.includes("lunch")) return true; // lunch is a hard-locked anchor
        if (s.type === "blocked") return true; // explicitly user-blocked
        // Lock looks spurious — skip it (helps clean up old buggy auto-locks)
        return false;
      });
      const priorLockedByTime = new Map();
      const priorLockedByLabel = new Map();
      for (const s of priorLocked) {
        const t = (s.time || "").trim();
        if (t) priorLockedByTime.set(t, s);
        const k = (s.label || "").toLowerCase().trim();
        if (k) priorLockedByLabel.set(k, s);
      }

      // Fuzzy label match — share at least 2 meaningful words
      const fuzzyLabelMatch = (newLabel) => {
        if (!newLabel) return null;
        const tokenize = (s) => (s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length >= 3);
        const newTokens = new Set(tokenize(newLabel));
        if (!newTokens.size) return null;
        let best = null, bestScore = 0;
        for (const [labelKey, slot] of priorLockedByLabel.entries()) {
          const oldTokens = tokenize(labelKey);
          let score = 0;
          for (const t of oldTokens) if (newTokens.has(t)) score++;
          if (score > bestScore) { bestScore = score; best = slot; }
        }
        return bestScore >= 2 ? best : null;
      };

      parsed.slots = parsed.slots.map(s => {
        const time = (s.time || "").trim();
        const labelKey = (s.label || "").toLowerCase().trim();

        // Try exact-time match first
        let priorMatch = priorLockedByTime.get(time);
        let matchType = priorMatch ? "time" : null;
        // Then exact-label match
        if (!priorMatch) { priorMatch = priorLockedByLabel.get(labelKey); matchType = priorMatch ? "exact-label" : null; }
        // Then fuzzy label match (handles minor relabels)
        if (!priorMatch) { priorMatch = fuzzyLabelMatch(s.label); matchType = priorMatch ? "fuzzy-label" : null; }

        if (priorMatch) {
          const priorLabel = (priorMatch.label || "").toLowerCase();
          const priorTime = parseSlotTimeMinutes(priorMatch.time);
          const isWrapOrClose = priorLabel.includes("wrap") || priorLabel.includes("close for") ||
            priorLabel.includes("close out") || priorLabel.includes("end of day") || priorLabel.includes("end-of-day");
          const priorWasInCanonicalWindow = priorTime >= 16 * 60 + 25 && priorTime <= 17 * 60 + 5;
          if (isWrapOrClose && !priorWasInCanonicalWindow) {
            // Drifted EOD — don't restore time, let ensureEndOfDayBlocks place it
            return { ...s, locked: true };
          }

          // CRITICAL: only restore time/label if the new and prior slots are clearly
          // the SAME ITEM. Test: their labels share at least one meaningful word OR
          // they're both at the same exact time. This prevents lock preservation
          // from overwriting a NEWLY-INSERTED slot (like a breather) that happens
          // to land at a time previously occupied by a different locked slot.
          const tokenize = (str) => (str || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length >= 4);
          const newTokens = new Set(tokenize(s.label));
          const oldTokens = tokenize(priorMatch.label);
          let sharedTokens = 0;
          for (const t of oldTokens) if (newTokens.has(t)) sharedTokens++;
          const labelsClearlySimilar = sharedTokens >= 1;
          // For time-based matches, require label similarity to confirm it's the same slot
          if (matchType === "time" && !labelsClearlySimilar) {
            // Different slot at the same time — don't munge it. Just check if the new
            // slot looks lockable on its own.
            return autoLockMeetingSlot(s);
          }

          // Same slot — restore time AND lock. Carry forward userLocked if the prior
          // slot had it (so user-set locks survive every refine).
          // Restore the prior LABEL too if the user explicitly locked it (their wording
          // was intentional — e.g. "Weekly IT Sync" not "IT Sync").
          if (priorMatch.userLocked) {
            return { ...s, time: priorMatch.time, label: priorMatch.label || s.label, type: priorMatch.type || s.type, locked: true, userLocked: true };
          }
          return { ...s, time: priorMatch.time, locked: true };
        }
        // Otherwise check if it's a new auto-lockable slot (meeting heuristic)
        return autoLockMeetingSlot(s);
      });

      // ── INJECT ORPHANED USER-LOCKED SLOTS ──
      // If the user explicitly locked a slot, but Rosie's refine response dropped it
      // (didn't return any matching slot), we re-insert it from the prior roadmap.
      // This guarantees that "I locked it" → "it stays" no matter what Rosie does.
      const matchedPriorIds = new Set();
      for (const s of parsed.slots) {
        if (s.userLocked && s.time) {
          matchedPriorIds.add(s.time + "|" + (s.label || "").toLowerCase().trim());
        }
      }
      const orphanedUserLocks = priorLocked.filter(s => {
        if (!s.userLocked) return false;
        const key = (s.time || "") + "|" + (s.label || "").toLowerCase().trim();
        return !matchedPriorIds.has(key);
      });
      if (orphanedUserLocks.length > 0) {

        // Insert each at its time-correct position
        for (const orphan of orphanedUserLocks) {
          const orphanMin = parseSlotTimeMinutes(orphan.time);
          if (orphanMin < 0) continue;
          let insertAt = parsed.slots.findIndex(s => parseSlotTimeMinutes(s.time) > orphanMin);
          if (insertAt < 0) insertAt = parsed.slots.length;
          parsed.slots.splice(insertAt, 0, { ...orphan, locked: true, userLocked: true });
        }
      }

      // FINAL PASS: re-enforce EOD blocks AFTER lock preservation. This catches the
      // case where lock preservation tried to restore a drifted EOD slot's time —
      // the final pass strips the drifted slot and places it at canonical 4:30/4:45.
      parsed.slots = ensureEndOfDayBlocks(parsed.slots);
    }
    return parsed;
  } catch { return null; }
}

// AI-powered reminder suggester — scans plate for things worth being reminded about
async function suggestRemindersWithAI(items, existingReminders = []) {
  const today = new Date().toISOString().slice(0, 10);
  const todayObj = new Date();
  const todayLabel = todayObj.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  // Build a structured snapshot of things Rosie should be aware of
  const upcoming = items
    .filter(i => isActiveStatus(i.status) && i.scheduledDate && !i.tbd)
    .map(i => {
      const days = Math.round((new Date(i.scheduledDate + "T12:00:00") - todayObj) / (1000 * 60 * 60 * 24));
      return { ...i, daysOut: days };
    })
    .filter(i => i.daysOut >= -2 && i.daysOut <= 7); // overdue, today, or within a week

  const blocked = items.filter(i => i.status === "blocked");
  const waiting = items.filter(i => i.status === "waiting");

  // Per-task scheduled dates worth flagging
  const taskReminders = [];
  items.forEach(i => {
    if (i.status === "done") return;
    const taskDates = i.taskDates || [];
    (i.tasks || []).forEach((t, idx) => {
      const td = taskDates[idx]?.date;
      if (!td || taskDates[idx]?.notToday) return;
      if ((i.completedTasks || []).includes(t)) return;
      const days = Math.round((new Date(td + "T12:00:00") - todayObj) / (1000 * 60 * 60 * 24));
      if (days >= 0 && days <= 3) {
        taskReminders.push({ task: t, item: i.title, date: td, daysOut: days });
      }
    });
  });

  const stuckLabel = (i) => {
    const ageMs = Date.now() - (i.lastUpdatedAt || i.createdAt || Date.now());
    return Math.floor(ageMs / (24 * 60 * 60 * 1000));
  };

  const systemPrompt = [
    "You proactively suggest reminders for Lexy (Project Coordinator at Fort Financial Credit Union, ADHD/autism/bipolar). Scan her plate and surface 0-5 reminders worth setting.",
    "",
    "Return ONLY a JSON array (empty if nothing worth flagging). No markdown.",
    'Shape: [{"text": "...", "type": "quick|item|recurring", "itemId": "optional", "time": "optional time string", "reason": "1-line why this matters"}]',
    "",
    "WHAT TO FLAG (in priority order):",
    "1. DEADLINES coming up — items due in 1-3 days that need pre-deadline action ('Send Verafin charter for review tomorrow — due Tuesday')",
    "2. MEETINGS/KICKOFFS — scheduled events in next 2-3 days needing prep ('Prep agenda for Verafin kickoff on Wednesday')",
    "3. STUCK items — blocked or waiting on reply for 5+ days, suggest a check-in ('Follow up with Lori — it's been 7 days')",
    "4. SCHEDULED TASKS — per-task dates due today or tomorrow ('Send project charter for review — scheduled for tomorrow')",
    "",
    "RULES:",
    "- Be CONSERVATIVE. Only suggest reminders that are genuinely useful.",
    "- For 'item' type, set itemId to the actual item id.",
    "- For 'recurring' type, only suggest if it's clearly a recurring action (don't force it).",
    "- Skip if a reminder with the SAME or VERY SIMILAR text already exists.",
    "- Time field is optional — only set if the title implies a specific time.",
    "- Max 5 reminders. Often 0-2 is the right answer.",
    "- Each reminder text under 80 chars, action-oriented.",
    "- Don't suggest reminders for items just because they exist — only if there's a TIME-SENSITIVE reason.",
  ].join("\n");

  const existingTexts = existingReminders.filter(r => !r.dismissed).map(r => r.text).join(" | ");

  const userMsg = [
    `Today: ${todayLabel} (${today})`,
    "",
    "UPCOMING ITEMS (overdue or due within 7 days):",
    upcoming.length ? upcoming.map(i =>
      `- [${i.id}] "${i.title}" — due ${i.scheduledDate} (${i.daysOut === 0 ? "today" : i.daysOut < 0 ? `${Math.abs(i.daysOut)}d overdue` : `${i.daysOut}d out`}) ${i.priority === "high" ? "⚠️" : ""}`
    ).join("\n") : "(none)",
    "",
    "BLOCKED / STUCK ITEMS:",
    blocked.length ? blocked.map(i => `- [${i.id}] "${i.title}" — stuck ${stuckLabel(i)}d. Notes: ${i.notes || "(none)"}`).join("\n") : "(none)",
    "",
    "WAITING ON REPLY:",
    waiting.length ? waiting.map(i => `- [${i.id}] "${i.title}" — waiting ${stuckLabel(i)}d. Notes: ${i.notes || "(none)"}`).join("\n") : "(none)",
    "",
    "PER-TASK SCHEDULED DATES (due in next 3 days):",
    taskReminders.length ? taskReminders.map(t => `- "${t.task}" (in "${t.item}") — ${t.date} (${t.daysOut === 0 ? "today" : t.daysOut === 1 ? "tomorrow" : `${t.daysOut}d`})`).join("\n") : "(none)",
    "",
    `EXISTING ACTIVE REMINDERS (don't duplicate): ${existingTexts || "(none)"}`,
    "",
    "What reminders, if any, should Lexy set right now? Return JSON array.",
  ].join("\n");

  try {
    const res = await fetch("/api/rosie", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 700,
        system: systemPrompt,
        messages: [{ role: "user", content: userMsg }],
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const text = data.content?.find(b => b.type === "text")?.text || "[]";
    const arr = JSON.parse(text.replace(/```json|```/g, "").trim());
    if (!Array.isArray(arr)) return [];
    // Filter out dupes against existing
    const existingLower = existingReminders.filter(r => !r.dismissed).map(r => r.text.toLowerCase());
    return arr
      .filter(r => r && typeof r.text === "string" && r.text.trim().length > 5 && r.text.length < 100)
      .filter(r => !existingLower.some(e => e.includes(r.text.toLowerCase()) || r.text.toLowerCase().includes(e)))
      .slice(0, 5);
  } catch { return []; }
}
