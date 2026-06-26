// 06-components-modals.js
// Input/recovery/history modals: EndOfDayModal, RecoveryModal, HistoryModal, PasteListModal, PasteTaskListModal, BrainDumpModal, ParkItModal.

// ── End of Day Modal ──────────────────────────────────────────────────────────
function EndOfDayModal({ data, roadmap, items, onUpdate, onReconcile, onClose, onDismiss, onSnooze }) {
  const [summary, setSummary] = useState(null);
  // Track which date the current summary was generated for. If the date
  // changes (e.g. user leaves the app open past midnight), the effect
  // re-runs and a fresh summary is generated. Without this, a stale summary
  // from yesterday can persist into today.
  const [generatedForDate, setGeneratedForDate] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  // Time-pacing leaderboard toggle — opened from "see pacing patterns" link
  // in the pacing card. Renders TimePacingLeaderboardModal on top.
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  // Surface D — reconciliation section. Show unreconciled past slots and
  // let the user batch-mark them right here before closing the day. Sorted
  // chronologically (oldest first) so they can scan their day in order.
  const [showEodRecon, setShowEodRecon] = useState(false);
  const unreconciledEod = (() => {
    const nowMin = (() => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); })();
    return getUnreconciledPastSlots(roadmap || {}, nowMin);
  })();

  // CRITICAL: filter completions to TODAY only. The original code summed
  // across all items ever marked done — so the AI was being told "you
  // completed 45 tasks" every day (lifetime total), which is why the prose
  // sounded identical day-to-day. completedAt is stamped when an item
  // transitions to "done" (see lines ~4042, ~16377), so we can filter
  // reliably. Items completed before tracking existed have no completedAt
  // and are excluded.
  const startOfTodayMs = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();
  const doneToday = data.items.filter(i => i.status === "done" && i.completedAt && i.completedAt >= startOfTodayMs);
  // Today's task count = sum of completedTasks across items completed today,
  // PLUS tasks completed within still-in-progress items today. The latter
  // we can't filter precisely (tasks don't have individual timestamps), so
  // we approximate by counting tasks in items updated today.
  const tasksDoneToday = doneToday.reduce((a, i) => a + (i.completedTasks || []).length, 0);

  // Roadmap completion stats — what they planned vs. what they actually checked off
  const roadmapStats = (() => {
    if (!roadmap || !roadmap.slots || roadmap.slots.length === 0) return null;
    const completedIdx = new Set(roadmap.completedSlots || []);
    const workSlots = roadmap.slots.filter(s => s.type === "work");
    const completedWork = roadmap.slots.filter((s, i) => s.type === "work" && completedIdx.has(i));
    const completedAll = roadmap.slots.filter((_, i) => completedIdx.has(i));
    const completedLabels = completedAll.map(s => s.label).filter(Boolean);
    return {
      totalWorkBlocks: workSlots.length,
      completedWorkBlocks: completedWork.length,
      completedLabels,
      totalCompleted: completedAll.length,
    };
  })();

  // Reconciliation summary — feeds AI richer signal about what actually
  // happened vs. what was planned. Counts partial / skipped / elsewhere
  // entries so the AI can be specific ("you marked 2 blocks partial, did
  // something else for 1") instead of generic.
  const reconStats = (() => {
    const recon = roadmap?.slotReconciliation || {};
    const counts = { partial: 0, skipped: 0, elsewhere: 0 };
    const elsewhereLabels = [];
    for (const entry of Object.values(recon)) {
      if (entry?.status === "partial") counts.partial++;
      else if (entry?.status === "skipped") counts.skipped++;
      else if (entry?.status === "elsewhere") {
        counts.elsewhere++;
        if (entry.actualWork) elsewhereLabels.push(entry.actualWork);
      }
    }
    return { ...counts, elsewhereLabels };
  })();

  // Factored summary generator so both the auto-fire effect and the manual
  // "↻ regenerate" button can invoke it. Builds the AI prompt with TODAY's
  // filtered data only. Note that we deliberately DON'T pass a "tasks
  // checked" count — tracking subtask completion timestamps would let us
  // do that accurately, but right now completedTasks is just an array of
  // indices with no per-task date stamp, so any rollup over-counted
  // historical subtasks within items marked done today. Surfacing
  // "items completed today" + the roadmap context is cleaner and honest.
  const generateSummary = () => {
    if (!data || !data.items) return;
    setIsRegenerating(true);
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const todayLabel = today.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

    const roadmapContext = roadmapStats && roadmapStats.totalCompleted > 0
      ? `\nFrom today's roadmap, ${roadmapStats.completedWorkBlocks}/${roadmapStats.totalWorkBlocks} work blocks were completed${roadmapStats.completedLabels.length ? `: ${roadmapStats.completedLabels.slice(0, 6).join(", ")}` : ""}.`
      : "";

    const reconContext = (reconStats.partial + reconStats.skipped + reconStats.elsewhere) > 0
      ? `\nReconciliation: ${reconStats.partial} partial, ${reconStats.skipped} skipped, ${reconStats.elsewhere} did-something-else${reconStats.elsewhereLabels.length ? ` (actual: ${reconStats.elsewhereLabels.slice(0, 3).join("; ")})` : ""}.`
      : "";

    const inProgressTitles = data.items
      .filter(i => i.status === "inprogress")
      .map(i => i.title)
      .join(", ") || "none";

    askRosie([{ role: "user", content:
      `Warm end-of-day wrap for someone with ADHD in IT/operations at a credit union.\nDate: ${todayLabel}\nToday's energy: ${data.energy||"unknown"}\nItems completed TODAY: ${doneToday.map(i=>i.title).join(", ")||"none marked done today"}\nStill in progress: ${inProgressTitles}${roadmapContext}${reconContext}\n\nIMPORTANT: Only reference items, blocks, and reconciliation info from the data above. Do NOT invent specific numbers, project names, or details not provided. 3-4 sentences max. Warm, specific to TODAY. No fluff. Acknowledge what they did. Remind them it's okay to stop. End with something grounding for tomorrow.`
    }], "You are Rosie — a warm ADHD-aware work coach. Short genuine responses only. Today's date matters — reference today's specific work, never generic. Never invent specific numbers or project names not in the prompt.", 280)
      .then(r => {
        setSummary(r);
        setGeneratedForDate(todayKey);
        setIsRegenerating(false);
      })
      .catch(() => { setIsRegenerating(false); });
  };

  useEffect(() => {
    if (!data || !data.items) return;
    // Date-keyed gate: regenerate when the calendar day changes, even if
    // the component somehow survives the rollover. Without this, a stale
    // summary from yesterday persists into today.
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    if (summary && generatedForDate === todayKey) return; // already gen'd for today
    generateSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.items?.length, roadmap?.slots?.length, roadmap?.completedSlots?.length, roadmap?.slotReconciliation]);

  const done = doneToday; // backward-compat reference for any UI below that used "done"
  const totalTasks = tasksDoneToday;

  return (
    <div className="modal-bg">
      <div className="modal fade" style={{ maxWidth: 460, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌙</div>
        <div className="jost" style={{ fontSize: 10, letterSpacing: 3, color: "rgba(212,130,154,0.7)", textTransform: "uppercase", marginBottom: 8 }}>4:30 — time to wrap up</div>
        <h2 className="cg" style={{ fontSize: 30, color: "#4a3540", marginBottom: 18 }}>You made it through <span style={{ color: "#d4829a", fontStyle: "italic" }}>another day</span> ✦</h2>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ background: "rgba(158,184,154,0.12)", border: "1px solid rgba(158,184,154,0.25)", borderRadius: 12, padding: "12px 18px" }}>
            <div className="cg" style={{ fontSize: 28, color: "#9eb89a" }}>{done.length}</div>
            <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.4)", letterSpacing: 1 }}>ITEMS DONE</div>
          </div>
          {/* Roadmap blocks completed */}
          {roadmapStats && roadmapStats.totalWorkBlocks > 0 && (
            <div style={{ background: "rgba(184,160,212,0.1)", border: "1px solid rgba(184,160,212,0.3)", borderRadius: 12, padding: "12px 18px" }}>
              <div className="cg" style={{ fontSize: 28, color: "#9878b8" }}>{roadmapStats.completedWorkBlocks}/{roadmapStats.totalWorkBlocks}</div>
              <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.4)", letterSpacing: 1 }}>BLOCKS DONE</div>
            </div>
          )}
          {(data.streak || 0) > 0 && (
            <div style={{ background: "rgba(255,160,60,0.08)", border: "1px solid rgba(255,160,60,0.2)", borderRadius: 12, padding: "12px 18px" }}>
              <div className="cg" style={{ fontSize: 28, color: "#e08030" }}>{data.streak}🔥</div>
              <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.4)", letterSpacing: 1 }}>DAY STREAK</div>
            </div>
          )}
        </div>

        {/* Completed roadmap slots — quick visual recap */}
        {roadmapStats && roadmapStats.completedLabels.length > 0 && (
          <div style={{ background: "rgba(184,160,212,0.06)", border: "1px solid rgba(184,160,212,0.2)", borderRadius: 12, padding: "10px 14px", marginBottom: 16, textAlign: "left" }}>
            <div className="jost" style={{ fontSize: 9, letterSpacing: 1.5, color: "rgba(152,120,184,0.75)", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>What you moved through today</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {roadmapStats.completedLabels.slice(0, 8).map((label, i) => (
                <div key={i} className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.65)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "#7a9e78", fontSize: 10 }}>✓</span>
                  <span style={{ flex: 1 }}>{label}</span>
                </div>
              ))}
              {roadmapStats.completedLabels.length > 8 && (
                <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.4)", fontStyle: "italic", marginTop: 2 }}>
                  + {roadmapStats.completedLabels.length - 8} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Surface D — batched reconciliation. If past blocks went unmarked,
            list them here so the user can sweep through before closing the
            day. Collapsed by default. Each row gets the same ReconciliationForm
            used by surfaces B + C — single source of truth for the UX. */}
        {unreconciledEod.length > 0 && onReconcile && (
          <div style={{ marginBottom: 16, textAlign: "left" }}>
            <button
              onClick={() => setShowEodRecon(prev => !prev)}
              className="jost"
              style={{
                width: "100%",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "rgba(184,160,212,0.08)",
                border: "1px solid rgba(184,160,212,0.3)",
                borderRadius: 10,
                padding: "8px 14px",
                fontSize: 12,
                color: "#9878b8",
                cursor: "pointer",
                fontWeight: 600,
                letterSpacing: 0.3,
              }}
              title="Sweep through past blocks before closing the day — done, partial, skipped, or did something else"
            >
              <span>🌿 ({unreconciledEod.length}) past block{unreconciledEod.length === 1 ? "" : "s"} need reconciling</span>
              <span style={{ fontSize: 10, opacity: 0.7 }}>{showEodRecon ? "▴ hide" : "▾ show"}</span>
            </button>
            {showEodRecon && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto", paddingRight: 4 }}>
                {unreconciledEod.map(({ idx, slot, startMin, endMin }) => (
                  <div
                    key={`eod-recon-${idx}`}
                    style={{
                      background: "rgba(255,255,255,0.5)",
                      border: "1px solid rgba(184,160,212,0.22)",
                      borderRadius: 9,
                      padding: "9px 12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7, gap: 8 }}>
                      <div className="jost" style={{ fontSize: 12, color: "#4a3540", fontWeight: 500 }}>{slot.label}</div>
                      <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)", whiteSpace: "nowrap", flexShrink: 0 }}>
                        {formatSlotMinutes(startMin)} – {formatSlotMinutes(endMin)}
                      </div>
                    </div>
                    <ReconciliationForm
                      slot={slot}
                      items={items}
                      onSubmit={(choice) => onReconcile(idx, choice)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!summary
          ? <p className="jost pulse" style={{ color: "rgba(212,130,154,0.5)", fontSize: 13, marginBottom: 20 }}>Rosie is writing your wrap-up…</p>
          : (
            <div style={{ marginBottom: 20 }}>
              <p className="jost" style={{ fontSize: 14, color: "rgba(74,53,64,0.65)", lineHeight: 1.75, marginBottom: 8 }}>{summary}</p>
              <button
                onClick={generateSummary}
                disabled={isRegenerating}
                className="jost"
                title="Re-generate the wrap-up with current data"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(212,130,154,0.25)",
                  color: "rgba(212,130,154,0.7)",
                  borderRadius: 7,
                  padding: "3px 10px",
                  fontSize: 10,
                  cursor: isRegenerating ? "default" : "pointer",
                  fontWeight: 500,
                  letterSpacing: 0.4,
                  opacity: isRegenerating ? 0.5 : 1,
                }}
              >{isRegenerating ? "regenerating…" : "↻ regenerate"}</button>
            </div>
          )
        }

        {/* Time-estimate accuracy — shows today's planned vs actual + trend
            from recent history. Surfaces when there's enough data (3+ work
            blocks captured today) to be meaningful. Quietly hidden otherwise
            so it doesn't add noise on light/empty days. */}
        {(() => {
          const timingHistory = data?.timingHistory || [];
          if (timingHistory.length < 3) return null;
          const todayISO = new Date().toISOString().slice(0, 10);
          const today = timingHistory.filter(e => e.date === todayISO);
          if (today.length < 3) return null;
          const todayPlannedMin = today.reduce((sum, e) => sum + (e.estimatedMin || 0), 0);
          const todayActualMin = today.reduce((sum, e) => sum + (e.actualMin || 0), 0);
          const todayDiff = todayActualMin - todayPlannedMin;
          const todayDiffPct = todayPlannedMin > 0 ? Math.round((todayDiff / todayPlannedMin) * 100) : 0;
          // Trend over the last 14 days (excluding today)
          const fourteenDaysAgo = (() => { const d = new Date(); d.setDate(d.getDate() - 14); return d.toISOString().slice(0, 10); })();
          const recent = timingHistory.filter(e => e.date >= fourteenDaysAgo && e.date < todayISO);
          let trendLine = null;
          if (recent.length >= 10) {
            const recentPlanned = recent.reduce((s, e) => s + (e.estimatedMin || 0), 0);
            const recentActual = recent.reduce((s, e) => s + (e.actualMin || 0), 0);
            const recentDiffPct = recentPlanned > 0 ? Math.round(((recentActual - recentPlanned) / recentPlanned) * 100) : 0;
            if (Math.abs(recentDiffPct) >= 10) {
              trendLine = recentDiffPct > 0
                ? `Over the last 2 weeks, you've run ${recentDiffPct}% over plan on average. Worth padding estimates a bit?`
                : `Over the last 2 weeks, you've been ${Math.abs(recentDiffPct)}% under plan — you might be over-estimating.`;
            }
          }
          const formatMin = (m) => m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
          return (
            <div style={{ background: "rgba(184,160,212,0.06)", border: "1px solid rgba(184,160,212,0.25)", borderRadius: 9, padding: "10px 14px", marginTop: 10, marginBottom: 10 }}>
              <div className="jost" style={{ fontSize: 10, color: "#9878b8", letterSpacing: 1, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>⏱ today's pacing</div>
              <div className="jost" style={{ fontSize: 12, color: "#4a3540", lineHeight: 1.5 }}>
                {formatMin(todayPlannedMin)} planned · {formatMin(todayActualMin)} actual
                {Math.abs(todayDiffPct) >= 5 && (
                  <span style={{ marginLeft: 6, color: todayDiff > 0 ? "#c4687a" : "#7a9e78", fontWeight: 600 }}>
                    {todayDiff > 0 ? `+${todayDiffPct}% over` : `${todayDiffPct}% under`}
                  </span>
                )}
              </div>
              {trendLine && (
                <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.6)", fontStyle: "italic", marginTop: 6, lineHeight: 1.5 }}>
                  🌿 {trendLine}
                </div>
              )}
              {timingHistory.length >= 10 && (
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="jost"
                  style={{
                    background: "rgba(152,120,184,0.1)",
                    border: "1px solid rgba(152,120,184,0.3)",
                    color: "#9878b8",
                    fontSize: 10, padding: "4px 10px", borderRadius: 6,
                    cursor: "pointer", fontWeight: 500, marginTop: 8,
                  }}
                >📊 See pacing patterns →</button>
              )}
            </div>
          );
        })()}
        {showLeaderboard && (
          <TimePacingLeaderboardModal data={data} onClose={() => setShowLeaderboard(false)} />
        )}

        {/* Reflection section — three optional prompts that turn EOD into
            a soft daily review. Saves to data.eodReflections keyed by date. */}
        {onUpdate && <EodReflectionSection data={data} onUpdate={onUpdate} />}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn rose jost" onClick={onClose} style={{ flex: 1, minWidth: 140, padding: 12 }}>Close for today 🌙</button>
          {onSnooze && (
            <button
              className="btn ghost jost"
              onClick={onSnooze}
              title="Hide for 5 min, then re-pop"
              style={{ padding: "12px 14px", fontSize: 12, background: "rgba(184,160,212,0.08)", border: "1px solid rgba(184,160,212,0.3)", color: "#9878b8" }}
            >💤 Snooze 5m</button>
          )}
          <button className="btn ghost jost" onClick={onDismiss} style={{ padding: "12px 16px", fontSize: 12 }}>Keep working</button>
        </div>
      </div>
    </div>
  );
}

// ── EOD Reflection Section ────────────────────────────────────────────────────
// Three short prompts that turn EOD from a static summary into a brief
// reflection. Optional — empty answers are fine. Saved to data.eodReflections
// keyed by date. The "one thing for tomorrow" populates tomorrow's check-in
// note as a soft suggestion.
function EodReflectionSection({ data, onUpdate }) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const existing = (data?.eodReflections || {})[todayISO] || { win: "", struggle: "", tomorrow: "" };
  const [draft, setDraft] = useState(existing);
  const [saved, setSaved] = useState(false);
  const commit = (next) => {
    const updated = next || draft;
    if (!updated.win && !updated.struggle && !updated.tomorrow) return; // don't save empty
    onUpdate({
      ...data,
      eodReflections: { ...(data?.eodReflections || {}), [todayISO]: updated },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };
  return (
    <div style={{ background: "rgba(212,130,154,0.04)", border: "1px solid rgba(212,130,154,0.2)", borderRadius: 9, padding: "14px 16px", marginTop: 12 }}>
      <div className="jost" style={{ fontSize: 10, color: "#b86d85", letterSpacing: 1, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>🌸 three small reflections</div>
      <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.5)", margin: "0 0 12px", lineHeight: 1.5 }}>
        Optional. Skip any. The "one thing for tomorrow" surfaces in your next check-in.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { key: "win", emoji: "✨", placeholder: "What was your win today?" },
          { key: "struggle", emoji: "🌿", placeholder: "What was hard or unfinished?" },
          { key: "tomorrow", emoji: "🌅", placeholder: "One thing for tomorrow…" },
        ].map(field => (
          <div key={field.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>{field.emoji}</span>
            <input
              value={draft[field.key]}
              onChange={e => setDraft({ ...draft, [field.key]: e.target.value })}
              onBlur={() => commit({ ...draft })}
              placeholder={field.placeholder}
              className="jost"
              style={{ flex: 1, fontSize: 12, padding: "6px 10px", border: "1px solid rgba(212,130,154,0.2)", borderRadius: 7, background: "rgba(255,255,255,0.6)", outline: "none", fontFamily: "'Jost', sans-serif" }}
            />
          </div>
        ))}
      </div>
      {saved && <div className="jost" style={{ fontSize: 10, color: "#7a9e78", marginTop: 6, textAlign: "right", fontStyle: "italic" }}>✓ saved</div>}
    </div>
  );
}

// ── BreakTimerModal ─────────────────────────────────────────────────────
// Countdown timer for break/lunch/buffer slots. When the timer hits zero,
// shows ✓ Done (mark slot complete, close) and 💤 Snooze 5 min (extend the
// slot by 5 min and shift subsequent non-locked slots forward).
// Props:
//   - slot: the slot object (label, durationMin, note, etc.)
//   - slotIdx: the slot's index in roadmap.slots
//   - endsAt: timestamp (ms) when timer expires — persisted in storage so
//             a reload mid-timer resumes correctly.
//   - onDone: () => void — user marks the break complete
//   - onSnooze: () => void — user wants 5 more minutes
//   - onClose: () => void — user cancels the timer (closes the modal AND
//              clears persisted timer state)
function BreakTimerModal({ slot, slotIdx, endsAt, onDone, onSnooze, onClose }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, []);

  const remaining = Math.max(0, endsAt - now);
  const expired = remaining <= 0;
  const remainSec = Math.ceil(remaining / 1000);
  const mins = Math.floor(remainSec / 60);
  const secs = remainSec % 60;
  const timeStr = `${mins}:${String(secs).padStart(2, "0")}`;

  // Type-based palette — uses the canonical slot-type helpers (same ones the
  // pill switch uses) so the palette stays in sync with the pill rendering.
  const palette = (() => {
    if (isLunchSlot(slot)) {
      return { emoji: "🍽️", color: "#9a7850", title: "Lunch break" };
    }
    if (isBrainBreakSlot(slot)) {
      return { emoji: "🌿", color: "#7a9e78", title: "Brain break" };
    }
    return { emoji: "☕", color: "#5a8888", title: "Recharge time" };
  })();

  return (
    <div className="modal-bg">
      <div className="modal fade" style={{ maxWidth: 380, textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>{palette.emoji}</div>
        <div className="jost" style={{ fontSize: 10, letterSpacing: 3, color: palette.color, opacity: 0.7, textTransform: "uppercase", marginBottom: 8 }}>
          {palette.title}
        </div>
        <h2 className="cg" style={{ fontSize: 24, color: "#4a3540", marginBottom: 18 }}>
          {slot.label || "Take a break"}
        </h2>

        {!expired ? (
          <>
            <div
              className="jost"
              style={{
                fontSize: 72, fontWeight: 300, color: palette.color,
                fontVariantNumeric: "tabular-nums", letterSpacing: 2,
                marginBottom: 12, lineHeight: 1,
              }}
            >
              {timeStr}
            </div>
            <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.5)", marginBottom: 22, letterSpacing: 0.5, fontStyle: "italic" }}>
              {slot.note || "step away from the screen"}
            </div>
            <button
              onClick={onClose}
              className="jost"
              style={{
                background: "rgba(255,255,255,0.5)", color: "rgba(74,53,64,0.55)",
                border: "1px solid rgba(212,130,154,0.2)", borderRadius: 8,
                padding: "8px 18px", cursor: "pointer", fontSize: 11,
                fontWeight: 500, letterSpacing: 0.5,
              }}
            >
              cancel
            </button>
          </>
        ) : (
          <>
            <div className="cg" style={{ fontSize: 24, color: palette.color, fontStyle: "italic", marginBottom: 22 }}>
              break's up ✦
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={onDone}
                className="jost"
                style={{
                  background: "linear-gradient(135deg, #9eb89a, #7a9e78)", color: "#fff",
                  border: "none", borderRadius: 10, padding: "10px 22px",
                  cursor: "pointer", fontSize: 12, fontWeight: 600, letterSpacing: 0.8,
                }}
              >
                ✓ Done
              </button>
              <button
                onClick={onSnooze}
                className="jost"
                style={{
                  background: "rgba(184,160,212,0.15)", color: "#9878b8",
                  border: "1px solid rgba(184,160,212,0.4)", borderRadius: 10,
                  padding: "10px 22px", cursor: "pointer", fontSize: 12,
                  fontWeight: 600, letterSpacing: 0.8,
                }}
              >
                💤 Snooze 5 min
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── BlockTransitionModal ────────────────────────────────────────────────
// Fires when a roadmap slot has just ended while the user is focused on a
// task. Offers to navigate to the next slot OR snooze it (shifts roadmap).
// Props:
//   - currentSlot: the slot that just ended
//   - nextSlot: the next slot in the roadmap (may be null at end of day)
//   - onGoNext: () => void — close FocusView and go to the next slot
//   - onSnooze: () => void — shift next slots forward by 5 min
//   - onDismiss: () => void — "not now", keep working, don't refire
// ── ReconciliationForm ───────────────────────────────────────────────────
// Reusable inline form for the 3 reconciliation surfaces (transition modal,
// gentle card on roadmap, end-of-day modal). Compact by default; expands
// inline when "partial" or "elsewhere" is chosen.
//
// Props:
//   slot       — the slot being reconciled (for display only)
//   items      — user's active work items (for the "elsewhere" picker)
//   onSubmit   — (choice) => void   where choice = { status, percent?, actualWork?, actualWorkItemId? }
//   onCancel   — optional callback for explicit dismissal
//   compact    — if true, shrinks spacing/font for tight spaces (transition modal)
function ReconciliationForm({ slot, items, onSubmit, onCancel, compact = false }) {
  const [stage, setStage] = useState("pick"); // "pick" | "partial" | "elsewhere"
  const [percent, setPercent] = useState(50);
  const [actualWorkItemId, setActualWorkItemId] = useState("");
  const [actualWorkText, setActualWorkText] = useState("");

  const fontSize = compact ? 11 : 12;
  const padding = compact ? "5px 10px" : "6px 12px";

  // Step 1: pick a status. Done/Skipped commit immediately; Partial and
  // Elsewhere expand into a second stage for more detail.
  const handlePickStatus = (status) => {
    if (status === "done" || status === "skipped") {
      onSubmit({ status });
      return;
    }
    if (status === "partial") { setStage("partial"); return; }
    if (status === "elsewhere") { setStage("elsewhere"); return; }
  };

  const handleConfirmPartial = () => {
    onSubmit({ status: "partial", percent });
  };
  const handleConfirmElsewhere = () => {
    // If they picked an item from the dropdown, use its title as actualWork too
    const pickedItem = actualWorkItemId ? items?.find(i => i.id === actualWorkItemId) : null;
    onSubmit({
      status: "elsewhere",
      actualWorkItemId: actualWorkItemId || null,
      actualWork: actualWorkText.trim() || (pickedItem ? pickedItem.title : ""),
    });
  };

  // STATUS PICKER (initial stage)
  if (stage === "pick") {
    return (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        {Object.entries(RECON_STATUSES).map(([key, conf]) => (
          <button
            key={key}
            onClick={() => handlePickStatus(key)}
            className="jost"
            title={conf.label}
            style={{
              background: conf.bg,
              border: `1px solid ${conf.border}`,
              color: conf.color,
              borderRadius: 8,
              padding,
              fontSize,
              cursor: "pointer",
              fontWeight: 600,
              letterSpacing: 0.3,
              whiteSpace: "nowrap",
            }}
          >
            {conf.emoji} {conf.label}
          </button>
        ))}
        {onCancel && (
          <button
            onClick={onCancel}
            className="jost"
            style={{
              background: "transparent",
              border: "1px solid rgba(74,53,64,0.18)",
              color: "rgba(74,53,64,0.5)",
              borderRadius: 8, padding, fontSize,
              cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap",
            }}
          >later</button>
        )}
      </div>
    );
  }

  // PARTIAL stage — slider + quick presets
  if (stage === "partial") {
    return (
      <div style={{ background: RECON_STATUSES.partial.bg, border: `1px solid ${RECON_STATUSES.partial.border}`, borderRadius: 9, padding: compact ? "8px 10px" : "10px 12px" }}>
        <div className="jost" style={{ fontSize: compact ? 10 : 10.5, color: RECON_STATUSES.partial.color, fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 7 }}>
          ◐ Partial — how much done?
        </div>
        <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
          {[25, 50, 75].map(p => (
            <button
              key={p}
              onClick={() => setPercent(p)}
              className="jost"
              style={{
                background: percent === p ? RECON_STATUSES.partial.color : "rgba(255,255,255,0.4)",
                color: percent === p ? "#fff" : RECON_STATUSES.partial.color,
                border: `1px solid ${RECON_STATUSES.partial.border}`,
                borderRadius: 7,
                padding: "3px 10px",
                fontSize: compact ? 11 : 11.5,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >{p}%</button>
          ))}
          <input
            type="range"
            min="1"
            max="99"
            value={percent}
            onChange={e => setPercent(Number(e.target.value))}
            style={{ flex: 1, minWidth: 100, accentColor: RECON_STATUSES.partial.color }}
          />
          <span className="jost" style={{ fontSize: 11.5, color: RECON_STATUSES.partial.color, fontWeight: 600, minWidth: 40, textAlign: "right" }}>
            {percent}%
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={handleConfirmPartial} className="btn jost" style={{ background: `linear-gradient(135deg, ${RECON_STATUSES.partial.color}, ${RECON_STATUSES.partial.color})`, color: "#fff", padding: "4px 12px", fontSize: 11 }}>✓ Confirm</button>
          <button onClick={() => setStage("pick")} className="btn ghost jost" style={{ padding: "4px 10px", fontSize: 11 }}>Back</button>
        </div>
      </div>
    );
  }

  // ELSEWHERE stage — active item picker + free text
  // (works even if items is empty — user can just type freely)
  if (stage === "elsewhere") {
    const activeItems = (items || []).filter(i => i && i.status !== "done" && i.status !== "cancelled");
    return (
      <div style={{ background: RECON_STATUSES.elsewhere.bg, border: `1px solid ${RECON_STATUSES.elsewhere.border}`, borderRadius: 9, padding: compact ? "8px 10px" : "10px 12px" }}>
        <div className="jost" style={{ fontSize: compact ? 10 : 10.5, color: RECON_STATUSES.elsewhere.color, fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 7 }}>
          🔀 What did you actually work on?
        </div>
        {activeItems.length > 0 && (
          <select
            value={actualWorkItemId}
            onChange={e => setActualWorkItemId(e.target.value)}
            className="jost"
            style={{
              width: "100%",
              padding: "5px 8px",
              borderRadius: 7,
              border: `1px solid ${RECON_STATUSES.elsewhere.border}`,
              background: "rgba(255,255,255,0.6)",
              color: "#4a3540",
              fontSize: 11.5,
              marginBottom: 6,
              cursor: "pointer",
            }}
          >
            <option value="">— pick from your items —</option>
            {activeItems.map(i => (
              <option key={i.id} value={i.id}>{i.title}</option>
            ))}
          </select>
        )}
        <input
          type="text"
          value={actualWorkText}
          onChange={e => setActualWorkText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleConfirmElsewhere(); }}
          placeholder={actualWorkItemId ? "Or add a note (optional)…" : "Or type what you did…"}
          className="jost"
          style={{
            width: "100%",
            padding: "5px 8px",
            borderRadius: 7,
            border: `1px solid ${RECON_STATUSES.elsewhere.border}`,
            background: "rgba(255,255,255,0.6)",
            color: "#4a3540",
            fontSize: 11.5,
            marginBottom: 7,
            boxSizing: "border-box",
          }}
          autoFocus={activeItems.length === 0}
        />
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={handleConfirmElsewhere}
            disabled={!actualWorkItemId && !actualWorkText.trim()}
            className="btn jost"
            style={{
              background: `linear-gradient(135deg, ${RECON_STATUSES.elsewhere.color}, ${RECON_STATUSES.elsewhere.color})`,
              color: "#fff", padding: "4px 12px", fontSize: 11,
              opacity: (!actualWorkItemId && !actualWorkText.trim()) ? 0.4 : 1,
            }}
          >✓ Save</button>
          <button onClick={() => setStage("pick")} className="btn ghost jost" style={{ padding: "4px 10px", fontSize: 11 }}>Back</button>
        </div>
      </div>
    );
  }
  return null;
}

function BlockTransitionModal({ currentSlot, currentSlotIdx, nextSlot, items, onReconcile, onGoNext, onSnooze, onDismiss }) {
  // Track whether reconciliation has been submitted so we can show a small
  // confirmation in place of the form. The user can still hit Go to next/etc.
  const [reconciledChoice, setReconciledChoice] = useState(null);
  const canReconcile = currentSlot && typeof currentSlotIdx === "number" && onReconcile;
  return (
    <div className="modal-bg">
      <div className="modal fade" style={{ maxWidth: 460, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>✦</div>
        <div className="jost" style={{ fontSize: 10, letterSpacing: 3, color: "rgba(212,130,154,0.7)", textTransform: "uppercase", marginBottom: 8 }}>
          time to move on
        </div>
        <h2 className="cg" style={{ fontSize: 24, color: "#4a3540", marginBottom: 6 }}>
          {nextSlot ? (
            <>Next: <span style={{ color: "#d4829a", fontStyle: "italic" }}>{nextSlot.label}</span></>
          ) : (
            <>End of <span style={{ color: "#d4829a", fontStyle: "italic" }}>today's roadmap</span></>
          )}
        </h2>
        {nextSlot && (
          <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.5)", marginBottom: 18, letterSpacing: 0.5 }}>
            starts at {nextSlot.time}{nextSlot.durationMin ? ` · ${nextSlot.durationMin}m` : ""}
          </div>
        )}

        {/* Reconciliation prompt for the just-ended slot — Surface B.
            Shown only when we have an idx + handler (passed from App). The user
            can still ignore it and just hit Go to next, but most of the time
            answering takes one click ("✓ did it" / "⊘ skipped"). */}
        {canReconcile && (
          <div style={{
            margin: "0 0 18px",
            padding: "12px 14px",
            background: "rgba(212,130,154,0.05)",
            border: "1px solid rgba(212,130,154,0.18)",
            borderRadius: 12,
            textAlign: "left",
          }}>
            <div className="jost" style={{ fontSize: 10, letterSpacing: 0.8, color: "rgba(74,53,64,0.55)", textTransform: "uppercase", fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
              Quick check on: <span style={{ color: "#4a3540" }}>{currentSlot.label}</span>
            </div>
            {reconciledChoice ? (
              <div className="jost" style={{ fontSize: 12, color: RECON_STATUSES[reconciledChoice.status]?.color || "#4a3540", textAlign: "center", fontStyle: "italic" }}>
                {RECON_STATUSES[reconciledChoice.status]?.emoji} {RECON_STATUSES[reconciledChoice.status]?.label}
                {reconciledChoice.percent ? ` (${reconciledChoice.percent}%)` : ""}
                {reconciledChoice.actualWork ? ` — ${reconciledChoice.actualWork}` : ""}
              </div>
            ) : (
              <ReconciliationForm
                slot={currentSlot}
                items={items}
                compact
                onSubmit={(choice) => {
                  onReconcile(currentSlotIdx, choice);
                  setReconciledChoice(choice);
                }}
              />
            )}
          </div>
        )}

        {!canReconcile && (
          <div className="cg" style={{ fontSize: 14, color: "rgba(74,53,64,0.6)", fontStyle: "italic", marginBottom: 22 }}>
            {currentSlot ? `Wrap up "${currentSlot.label}"?` : "Ready for what's next?"}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={onGoNext}
            className="jost"
            style={{
              background: "linear-gradient(135deg, #d4829a, #c4687a)", color: "#fff",
              border: "none", borderRadius: 10, padding: "10px 22px",
              cursor: "pointer", fontSize: 12, fontWeight: 600, letterSpacing: 0.8,
            }}
          >
            ✓ Go to next
          </button>
          {nextSlot && (
            <button
              onClick={onSnooze}
              className="jost"
              style={{
                background: "rgba(184,160,212,0.15)", color: "#9878b8",
                border: "1px solid rgba(184,160,212,0.4)", borderRadius: 10,
                padding: "10px 22px", cursor: "pointer", fontSize: 12,
                fontWeight: 600, letterSpacing: 0.8,
              }}
            >
              💤 Snooze 5 min
            </button>
          )}
          <button
            onClick={onDismiss}
            className="jost"
            style={{
              background: "transparent", color: "rgba(74,53,64,0.55)",
              border: "1px solid rgba(212,130,154,0.2)", borderRadius: 10,
              padding: "10px 18px", cursor: "pointer", fontSize: 11,
              fontWeight: 500, letterSpacing: 0.5,
            }}
          >
            not now
          </button>
        </div>
      </div>
    </div>
  );
}

function RecoveryModal({ data, onUpdate, onClose }) {
  const [scanning, setScanning] = useState(true);
  const [allBackups, setAllBackups] = useState([]); // { key, items, savedAt, source }
  const [recoverable, setRecoverable] = useState([]); // items NOT in current data, dedup by id
  const [error, setError] = useState("");
  const [restoredCount, setRestoredCount] = useState(0);

  // Scan all known backup keys on mount
  useEffect(() => {
    const scan = async () => {
      try {
        if (typeof window === "undefined" || !window.storage) {
          setError("Browser storage not available — can't scan backups.");
          setScanning(false);
          return;
        }
        const backups = [];

        // 1. Rolling backup
        try {
          const rolling = await window.storage.get(`${STORAGE_KEY}-items-rolling-backup`);
          if (rolling && rolling.value) {
            const parsed = JSON.parse(rolling.value);
            if (Array.isArray(parsed.items)) {
              backups.push({ key: "rolling-backup", items: parsed.items, savedAt: parsed.savedAt || 0, source: "Latest rolling backup" });
            }
          }
        } catch (e) { console.warn("[recovery] rolling backup unreadable:", e); }

        // 2. List all storage keys to find timestamped item backups
        try {
          if (typeof window.storage.list === "function") {
            const list = await window.storage.list(`${STORAGE_KEY}-items-backup-`);
            const keys = (list && Array.isArray(list.keys)) ? list.keys : [];
            for (const k of keys) {
              try {
                const r = await window.storage.get(k);
                if (r && r.value) {
                  const parsedData = JSON.parse(r.value);
                  if (parsedData && Array.isArray(parsedData.items)) {
                    const ts = parseInt(k.replace(`${STORAGE_KEY}-items-backup-`, ""), 10) || 0;
                    backups.push({ key: k, items: parsedData.items, savedAt: ts, source: `Timestamped backup (${new Date(ts).toLocaleString()})` });
                  }
                }
              } catch (e) { /* skip unreadable */ }
            }
          }
        } catch (e) { /* skip if no list */ }

        // 3. Also check the main store's history for any items mentioned in older roadmap snapshots —
        // these aren't recoverable directly but could give us hints.
        // (We don't restore from history because roadmaps don't contain full item objects.)

        setAllBackups(backups);

        // Aggregate all items from all backups, dedup by id (or by title if id missing)
        const currentIds = new Set((data.items || []).map(i => i.id));
        const currentTitles = new Set((data.items || []).map(i => (i.title || "").trim().toLowerCase()).filter(Boolean));
        const seen = new Set();
        const candidates = [];
        for (const b of backups) {
          for (const it of (b.items || [])) {
            if (!it || typeof it !== "object") continue;
            const id = it.id;
            const titleKey = (it.title || "").trim().toLowerCase();
            if (!titleKey) continue;
            // Skip if already in current data
            if (id && currentIds.has(id)) continue;
            if (titleKey && currentTitles.has(titleKey)) continue;
            // Dedup across backups by title (prefer the most recent backup's version)
            if (seen.has(titleKey)) continue;
            seen.add(titleKey);
            candidates.push({ ...it, _foundIn: b.source, _foundAt: b.savedAt });
          }
        }
        // Sort by most-recently-backed-up first
        candidates.sort((a, b) => (b._foundAt || 0) - (a._foundAt || 0));
        setRecoverable(candidates);
      } catch (e) {
        console.error("[recovery] scan failed:", e);
        setError("Couldn't scan backups: " + (e?.message || "unknown error"));
      }
      setScanning(false);
    };
    scan();
  }, []);

  const restoreOne = (cand) => {
    // Strip the diagnostic fields before restoring
    const { _foundIn, _foundAt, ...item } = cand;
    // Ensure unique id
    const newId = item.id && !data.items.some(i => i.id === item.id) ? item.id : uid();
    onUpdate({ ...data, items: [...data.items, { ...item, id: newId }] });
    setRecoverable(prev => prev.filter(c => c !== cand));
    setRestoredCount(c => c + 1);
  };

  const restoreAll = () => {
    if (!recoverable.length) return;
    const toAdd = recoverable.map(cand => {
      const { _foundIn, _foundAt, ...item } = cand;
      const newId = item.id && !data.items.some(i => i.id === item.id) ? item.id : uid();
      return { ...item, id: newId };
    });
    onUpdate({ ...data, items: [...data.items, ...toAdd] });
    setRestoredCount(c => c + toAdd.length);
    setRecoverable([]);
  };

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade" style={{ maxWidth: 640, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 className="cg" style={{ fontSize: 24, color: "#4a3540", fontStyle: "italic", fontWeight: 400, margin: 0 }}>🔍 Recover items</h2>
          <button onClick={onClose} className="jost" style={{ background: "none", border: "none", color: "rgba(74,53,64,0.4)", fontSize: 16, cursor: "pointer", padding: 4 }}>✕</button>
        </div>

        <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.6)", marginBottom: 14, lineHeight: 1.55 }}>
          Searching backups for items that aren't in your current list. Backups are written automatically on every save.
        </p>

        {scanning && (
          <p className="jost pulse" style={{ fontSize: 12, color: "rgba(212,130,154,0.6)", marginBottom: 12 }}>Scanning backups…</p>
        )}

        {!scanning && error && (
          <div style={{ background: "rgba(212,100,120,0.08)", border: "1px solid rgba(212,100,120,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
            <p className="jost" style={{ fontSize: 12, color: "#c4647c", margin: 0 }}>{error}</p>
          </div>
        )}

        {!scanning && !error && (
          <>
            <div style={{ background: "rgba(120,168,168,0.08)", border: "1px solid rgba(120,168,168,0.25)", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
              <div className="jost" style={{ fontSize: 11, color: "#5a8888", fontWeight: 600, marginBottom: 4 }}>
                Found {allBackups.length} backup{allBackups.length !== 1 ? "s" : ""} · {recoverable.length} recoverable item{recoverable.length !== 1 ? "s" : ""}
              </div>
              {restoredCount > 0 && (
                <div className="jost" style={{ fontSize: 11, color: "#7a9e78" }}>✓ Restored {restoredCount} item{restoredCount !== 1 ? "s" : ""}</div>
              )}
            </div>

            {recoverable.length > 0 && (
              <>
                <button
                  onClick={restoreAll}
                  className="btn rose jost"
                  style={{ marginBottom: 14, fontSize: 12, padding: "7px 14px" }}
                >🌸 Restore all {recoverable.length}</button>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {recoverable.map((cand, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.5)", border: "1px solid rgba(184,160,212,0.2)", borderRadius: 9 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="jost" style={{ fontSize: 13, color: "#4a3540", fontWeight: 500 }}>{cand.title || "(untitled)"}</div>
                        <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.4)", marginTop: 2 }}>
                          {cand.tasks?.length ? `${cand.tasks.length} task${cand.tasks.length !== 1 ? "s" : ""} · ` : ""}
                          {cand.status || "todo"} · {cand._foundIn}
                        </div>
                      </div>
                      <button
                        onClick={() => restoreOne(cand)}
                        className="btn ghost jost"
                        style={{ fontSize: 10, padding: "4px 10px" }}
                      >restore</button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {recoverable.length === 0 && (
              <p className="jost" style={{ fontSize: 13, color: "rgba(74,53,64,0.55)", textAlign: "center", padding: "20px 10px", fontStyle: "italic" }}>
                {allBackups.length === 0
                  ? "No backups found. The protection started recently — items lost before this won't be recoverable here."
                  : "No missing items found in backups. Everything in your backups is already in your current list."}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function HistoryModal({ data, onUpdate, onClose }) {
  const doneItems = data.items
    .filter(i => i.status === "done")
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const restore = id => onUpdate({ ...data, items: data.items.map(i => i.id === id ? { ...i, status: "todo" } : i) });
  const hardDelete = id => {
    if (!confirm("Permanently delete this completed item?")) return;
    const item = data.items.find(i => i.id === id);
    const seedMatch = item && SEED_ITEMS.some(s => s.title.toLowerCase() === item.title.toLowerCase());
    const nextDeleted = seedMatch
      ? [...(data.deletedSeedTitles || []), item.title]
      : (data.deletedSeedTitles || []);
    onUpdate({ ...data, items: data.items.filter(i => i.id !== id), deletedSeedTitles: nextDeleted });
  };

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade" style={{ maxWidth: 560 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <div className="jost" style={{ fontSize: 10, letterSpacing: 3, color: "rgba(158,184,154,0.85)", textTransform: "uppercase", marginBottom: 4 }}>✓ completed</div>
            <h2 className="cg" style={{ fontSize: 26, color: "#4a3540" }}>History <span style={{ color: "#9eb89a" }}>✦</span></h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(74,53,64,0.35)", fontSize: 24, cursor: "pointer" }}>×</button>
        </div>

        {doneItems.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <p className="cg" style={{ fontSize: 22, color: "rgba(74,53,64,0.35)", fontStyle: "italic" }}>Nothing finished yet</p>
            <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.3)", marginTop: 6 }}>Completed items land here when you mark them done ✦</p>
          </div>
        ) : (
          <>
            <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.5)", marginBottom: 14 }}>
              {doneItems.length} completed item{doneItems.length === 1 ? "" : "s"} — restore one back to your list, or delete permanently.
            </p>
            <div style={{ maxHeight: 420, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {doneItems.map(item => {
                const ct = (item.completedTasks || []).length, tt = (item.tasks || []).length;
                const when = item.createdAt ? new Date(item.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }) : "";
                return (
                  <div key={item.id} style={{ background: "rgba(158,184,154,0.08)", border: "1px solid rgba(158,184,154,0.2)", borderRadius: 12, padding: "12px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                          <span className="tag jost" style={{ background: "rgba(158,184,154,0.2)", color: "#7a9e78" }}>✓ done</span>
                          {item.category && <span className="tag jost" style={{ background: "rgba(180,160,210,0.1)", color: "#9878b8", fontSize: 10 }}>{item.category}</span>}
                          {when && <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.35)" }}>{when}</span>}
                        </div>
                        <div className="cg" style={{ fontSize: 16, color: "rgba(74,53,64,0.75)", fontWeight: 500, textDecoration: "line-through", textDecorationColor: "rgba(158,184,154,0.5)" }}>{item.title}</div>
                        {tt > 0 && <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.4)", marginTop: 4 }}>{ct}/{tt} tasks finished</p>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
                        <button className="btn ghost jost" onClick={() => restore(item.id)} style={{ fontSize: 11, padding: "4px 10px" }} title="Move back to To Do">↺ Restore</button>
                        <button onClick={() => hardDelete(item.id)} style={{ background: "rgba(212,100,120,0.07)", border: "1px solid rgba(212,100,120,0.15)", borderRadius: 8, color: "rgba(196,100,120,0.6)", padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "'Jost',sans-serif" }}>Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button className="btn ghost jost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Paste List Modal ──────────────────────────────────────────────────────────
// ── ParsedTaskPreview — shared preview list for both paste modals ─────────────
// Renders the parsed task rows (numbered, editable titles, date + duration
// chips, "+N sub" badge) with indented ↳ subtask rows. Stateless — parents own
// the `parsed` array and pass edit/remove callbacks. Subtask UI hides itself
// automatically when entries have no .subtasks (e.g. reminders mode).
//   parsed: array of { title, date?, durationMin?, subtasks?: [...] }
//   onEditTitle: (i, value) => void
//   onRemoveTask: (i) => void — removes the task and any subtasks
//   onEditSubtaskTitle: (parentIdx, subIdx, value) => void
//   onRemoveSubtask: (parentIdx, subIdx) => void
function ParsedTaskPreview({ parsed, onEditTitle, onRemoveTask, onEditSubtaskTitle, onRemoveSubtask }) {
  return (
    <div style={{ maxHeight: 380, overflowY: "auto", marginBottom: 14 }}>
      {parsed.map((t, i) => (
        <div key={i} style={{ marginBottom: 6 }}>
          <div style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(212,130,154,0.18)", borderRadius: 10, padding: "8px 12px", display: "flex", gap: 8, alignItems: "center" }}>
            <span className="jost" style={{ fontSize: 11, color: "rgba(184,109,133,0.6)", fontWeight: 600, minWidth: 18 }}>{i + 1}.</span>
            <input
              className="jost"
              value={t.title}
              onChange={e => onEditTitle(i, e.target.value)}
              style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: "#4a3540", outline: "none", fontWeight: 500 }}
            />
            {t.date && <span className="jost" style={{ fontSize: 10, color: "rgba(122,158,120,0.7)", background: "rgba(158,184,154,0.12)", borderRadius: 6, padding: "2px 7px" }}>{t.date}</span>}
            {t.durationMin && (
              <span className="jost" style={{ fontSize: 10, color: "rgba(184,109,133,0.75)", background: "rgba(212,130,154,0.1)", borderRadius: 6, padding: "2px 7px", fontWeight: 600 }}>
                {t.durationMin >= 60 && t.durationMin % 60 === 0
                  ? `${t.durationMin / 60}h`
                  : t.durationMin >= 60
                    ? `${Math.floor(t.durationMin / 60)}h ${t.durationMin % 60}m`
                    : `${t.durationMin}m`}
              </span>
            )}
            {(t.subtasks?.length || 0) > 0 && (
              <span className="jost" style={{ fontSize: 9, color: "rgba(122,158,120,0.7)", background: "rgba(158,184,154,0.1)", borderRadius: 6, padding: "2px 6px", letterSpacing: 0.3, fontWeight: 600 }}>+{t.subtasks.length} sub</span>
            )}
            <button onClick={() => onRemoveTask(i)} title="Remove this task and any subtasks" style={{ background: "none", border: "none", color: "rgba(196,120,142,0.5)", cursor: "pointer", fontSize: 18 }}>×</button>
          </div>
          {/* Subtasks render indented under their parent */}
          {(t.subtasks?.length || 0) > 0 && (
            <div style={{ marginLeft: 22, marginTop: 3, display: "flex", flexDirection: "column", gap: 3 }}>
              {t.subtasks.map((s, si) => (
                <div key={si} style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(212,130,154,0.12)", borderLeft: "2px solid rgba(212,130,154,0.25)", borderRadius: 7, padding: "5px 10px", display: "flex", gap: 6, alignItems: "center" }}>
                  <span className="jost" style={{ fontSize: 9, color: "rgba(184,109,133,0.5)", minWidth: 14 }}>↳</span>
                  <input
                    className="jost"
                    value={s.title}
                    onChange={e => onEditSubtaskTitle(i, si, e.target.value)}
                    style={{ flex: 1, border: "none", background: "transparent", fontSize: 12, color: "rgba(74,53,64,0.85)", outline: "none" }}
                  />
                  {s.durationMin && (
                    <span className="jost" style={{ fontSize: 9, color: "rgba(184,109,133,0.7)", background: "rgba(212,130,154,0.08)", borderRadius: 5, padding: "1px 5px", fontWeight: 600 }}>
                      {s.durationMin >= 60 ? `${(s.durationMin / 60).toFixed(s.durationMin % 60 === 0 ? 0 : 1)}h` : `${s.durationMin}m`}
                    </span>
                  )}
                  <button onClick={() => onRemoveSubtask(i, si)} style={{ background: "none", border: "none", color: "rgba(196,120,142,0.4)", cursor: "pointer", fontSize: 14 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PasteListModal({ onSave, onSaveTasks, onSaveReminders, items, onClose }) {
  // Mode picker — what type of thing to create from the pasted list.
  // "items"     → top-level work items (default)
  // "tasks"     → subtasks of a chosen parent item
  // "reminders" → individual reminders
  const [mode, setMode] = useState("items");
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState("");
  // For "tasks" mode, the user picks which item to attach to.
  const activeItems = (items || []).filter(i => i && i.status !== "done" && i.status !== "cancelled");
  const [parentItemId, setParentItemId] = useState(activeItems[0]?.id || "");

  const parse = async () => {
    if (!text.trim()) return;
    if (mode === "tasks" && !parentItemId) {
      setError("Pick an item to add the tasks to first.");
      return;
    }
    setParsing(true); setError("");
    try {
      // Shared pipeline — parsePasteList handles all three modes (hierarchical
      // parsing + time-estimate merging for tasks mode). Error copy stays here.
      const parentTitle = mode === "tasks"
        ? (activeItems.find(i => i.id === parentItemId)?.title || "")
        : "";
      const result = await parsePasteList(text, mode, parentTitle);
      if (!result.length) {
        setError(mode === "items" ? "Rosie couldn't find items to pull out. Try rewording?"
               : mode === "tasks" ? "Rosie couldn't pull subtasks out of that. Try rewording?"
               : "Rosie couldn't find reminders in that. Try rewording?");
      } else {
        setParsed(result);
      }
    } catch { setError("Something glitched. Give it another shot?"); }
    setParsing(false);
  };

  const confirm = () => {
    if (mode === "items" && onSave) onSave(parsed);
    else if (mode === "tasks" && onSaveTasks) onSaveTasks(parentItemId, parsed);
    else if (mode === "reminders" && onSaveReminders) onSaveReminders(parsed);
    onClose();
  };
  const togglePriority = i => {
    const order = ["high", "medium", "low"];
    setParsed(parsed.map((it, idx) => idx === i ? { ...it, priority: order[(order.indexOf(it.priority || "medium") + 1) % 3] } : it));
  };
  const removeItem = i => setParsed(parsed.filter((_, idx) => idx !== i));
  const editTitle = (i, v) => setParsed(parsed.map((it, idx) => idx === i ? { ...it, title: v } : it));

  // Mode-specific copy
  const headerTitle = mode === "items" ? "Turn a list into items"
                    : mode === "tasks" ? "Turn a list into subtasks"
                    : "Turn a list into reminders";
  const placeholderHint = mode === "items" ? "Paste anything — a list from a chat, bullet points, a brain dump. Rosie will structure it into items. 🌸"
                       : mode === "tasks" ? "Paste a list of subtasks for the item you picked above. Rosie will clean them up. 🌸"
                       : "Paste reminders — things to remember, not action items. Rosie will tidy them up. 🌸";

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade" style={{ maxWidth: 580 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div className="jost" style={{ fontSize: 10, letterSpacing: 3, color: "rgba(212,130,154,0.7)", textTransform: "uppercase", marginBottom: 4 }}>📋 paste a list</div>
            <h2 className="cg" style={{ fontSize: 24, color: "#4a3540" }}>{headerTitle} <span style={{ color: "#d4829a" }}>✦</span></h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(74,53,64,0.35)", fontSize: 24, cursor: "pointer" }}>×</button>
        </div>

        {!parsed && (
          <>
            {/* Mode picker pills */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {[
                { val: "items", label: "📦 Items", desc: "top-level work" },
                { val: "tasks", label: "✓ Tasks", desc: "under an item" },
                { val: "reminders", label: "🔔 Reminders", desc: "things to remember" },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => { setMode(opt.val); setError(""); }}
                  className="jost"
                  title={opt.desc}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    background: mode === opt.val ? "rgba(212,130,154,0.18)" : "rgba(255,255,255,0.5)",
                    border: "1px solid " + (mode === opt.val ? "rgba(212,130,154,0.45)" : "rgba(212,130,154,0.18)"),
                    borderRadius: 8,
                    color: mode === opt.val ? "#b86d85" : "rgba(74,53,64,0.55)",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: mode === opt.val ? 600 : 500,
                  }}
                >{opt.label}</button>
              ))}
            </div>

            {/* Parent item picker — only for "tasks" mode */}
            {mode === "tasks" && (
              <div style={{ marginBottom: 12 }}>
                <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 4, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase" }}>Add subtasks to:</label>
                {activeItems.length > 0 ? (
                  <select
                    value={parentItemId}
                    onChange={e => setParentItemId(e.target.value)}
                    className="jost ifield"
                    style={{ width: "100%", fontSize: 13, padding: "8px 12px" }}
                  >
                    {activeItems.map(it => (
                      <option key={it.id} value={it.id}>{it.title}</option>
                    ))}
                  </select>
                ) : (
                  <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.5)", fontStyle: "italic" }}>No active items yet — switch to 📦 Items to create one first.</p>
                )}
              </div>
            )}

            <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.5)", marginBottom: 12, lineHeight: 1.6 }}>
              {placeholderHint}
            </p>
            <textarea
              className="ifield jost"
              rows={8}
              style={{ resize: "vertical", minHeight: 160, fontSize: 13 }}
              placeholder="Paste your list here..."
              value={text}
              onChange={e => setText(e.target.value)}
              autoFocus
            />
            {error && <p className="jost" style={{ fontSize: 12, color: "#c4687a", marginTop: 8 }}>{error}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button className="btn rose jost" onClick={parse} disabled={!text.trim() || parsing || (mode === "tasks" && !parentItemId)} style={{ flex: 1, padding: "11px", opacity: (!text.trim() || parsing || (mode === "tasks" && !parentItemId)) ? 0.5 : 1 }}>
                {parsing ? "Rosie is parsing…" : "Parse with Rosie ✦"}
              </button>
              <button className="btn ghost jost" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}

        {parsed && mode === "items" && (
          <>
            <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.5)", marginBottom: 12, lineHeight: 1.6 }}>
              Found {parsed.length} item{parsed.length === 1 ? "" : "s"}. Tap priority to cycle it, ✕ to remove, or edit titles. Then add them all.
            </p>
            <div style={{ maxHeight: 340, overflowY: "auto", marginBottom: 14 }}>
              {parsed.map((it, i) => {
                const pColor = it.priority === "high" ? "#c4687a" : it.priority === "low" ? "#9a7850" : "#c4a882";
                const pBg = it.priority === "high" ? "rgba(212,100,120,0.1)" : it.priority === "low" ? "rgba(196,168,130,0.08)" : "rgba(196,168,130,0.15)";
                return (
                  <div key={i} style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(212,130,154,0.18)", borderRadius: 12, padding: "10px 14px", marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button onClick={() => togglePriority(i)} className="tag jost" style={{ background: pBg, color: pColor, border: "none", cursor: "pointer" }}>{it.priority || "medium"}</button>
                      <input
                        className="jost"
                        value={it.title}
                        onChange={e => editTitle(i, e.target.value)}
                        style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: "#4a3540", outline: "none", fontWeight: 500 }}
                      />
                      <button onClick={() => removeItem(i)} style={{ background: "none", border: "none", color: "rgba(196,120,142,0.5)", cursor: "pointer", fontSize: 18 }}>×</button>
                    </div>
                    {it.why && <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.4)", fontStyle: "italic", marginTop: 4, marginLeft: 2 }}>Why: {it.why}</p>}
                    {it.tasks?.length > 0 && (
                      <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.5)", marginTop: 4, marginLeft: 2 }}>{it.tasks.length} subtasks</p>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn rose jost" onClick={confirm} disabled={!parsed.length} style={{ flex: 1, padding: "11px" }}>Add {parsed.length} item{parsed.length === 1 ? "" : "s"} ✦</button>
              <button className="btn ghost jost" onClick={() => setParsed(null)}>← Back</button>
            </div>
          </>
        )}

        {parsed && (mode === "tasks" || mode === "reminders") && (() => {
          // Compute totals across the hierarchical structure
          const totalSubtasks = mode === "tasks"
            ? parsed.reduce((sum, t) => sum + (t.subtasks?.length || 0), 0)
            : 0;
          const removeSubtask = (parentIdx, subIdx) => {
            setParsed(parsed.map((t, idx) => idx === parentIdx
              ? { ...t, subtasks: (t.subtasks || []).filter((_, si) => si !== subIdx) }
              : t));
          };
          const editSubtaskTitle = (parentIdx, subIdx, v) => {
            setParsed(parsed.map((t, idx) => idx === parentIdx
              ? { ...t, subtasks: (t.subtasks || []).map((s, si) => si === subIdx ? { ...s, title: v } : s) }
              : t));
          };
          const totalToAdd = parsed.length + totalSubtasks;
          return (
          <>
            <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.5)", marginBottom: 12, lineHeight: 1.6 }}>
              {mode === "tasks" && totalSubtasks > 0
                ? `Found ${parsed.length} task${parsed.length === 1 ? "" : "s"} with ${totalSubtasks} subtask${totalSubtasks === 1 ? "" : "s"}. Edit titles or ✕ to remove, then add them all.`
                : `Found ${parsed.length} ${mode === "tasks" ? "task" : "reminder"}${parsed.length === 1 ? "" : "s"}. Edit or ✕ to remove, then add them all.`
              }
            </p>
            <ParsedTaskPreview
              parsed={parsed}
              onEditTitle={editTitle}
              onRemoveTask={removeItem}
              onEditSubtaskTitle={editSubtaskTitle}
              onRemoveSubtask={removeSubtask}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn rose jost" onClick={confirm} disabled={!parsed.length} style={{ flex: 1, padding: "11px" }}>
                {mode === "tasks" && totalSubtasks > 0
                  ? `Add ${totalToAdd} item${totalToAdd === 1 ? "" : "s"} ✦`
                  : `Add ${parsed.length} ${mode === "tasks" ? "task" : "reminder"}${parsed.length === 1 ? "" : "s"} ✦`
                }
              </button>
              <button className="btn ghost jost" onClick={() => setParsed(null)}>← Back</button>
            </div>
          </>
          );
        })()}
      </div>
    </div>
  );
}

// ── Paste Task List Modal — for FocusView ────────────────────────────────────
// Lets the user paste a list and have Rosie split it into SUBTASKS of the focused
// item (rather than into new top-level items). The parsed strings get added to
// item.tasks, with optional dates dropped into item.taskDates.
function PasteTaskListModal({ parentItem, onSave, onClose }) {
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState("");

  const parse = async () => {
    if (!text.trim()) return;
    setParsing(true); setError("");
    try {
      // Shared pipeline — hierarchical-first, flat fallback, time-estimate
      // merge (e.g. CompTIA study guide with "32 min" lines under each topic).
      const tasks = await parsePasteList(text, "tasks", parentItem?.title || "");
      if (!tasks.length) setError("Couldn't pull subtasks out of that. Try rewording or use bullets/commas?");
      else setParsed(tasks);
    } catch { setError("Something glitched. Give it another shot?"); }
    setParsing(false);
  };

  const confirm = () => { onSave(parsed); onClose(); };
  const removeTask = (i) => setParsed(parsed.filter((_, idx) => idx !== i));
  const editTitle = (i, v) => setParsed(parsed.map((t, idx) => idx === i ? { ...t, title: v } : t));
  const removeSubtask = (parentIdx, subIdx) => {
    setParsed(parsed.map((t, idx) => idx === parentIdx
      ? { ...t, subtasks: (t.subtasks || []).filter((_, si) => si !== subIdx) }
      : t));
  };
  const editSubtaskTitle = (parentIdx, subIdx, v) => {
    setParsed(parsed.map((t, idx) => idx === parentIdx
      ? { ...t, subtasks: (t.subtasks || []).map((s, si) => si === subIdx ? { ...s, title: v } : s) }
      : t));
  };

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade" style={{ maxWidth: 560 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div className="jost" style={{ fontSize: 10, letterSpacing: 3, color: "rgba(212,130,154,0.7)", textTransform: "uppercase", marginBottom: 4 }}>📋 paste a list</div>
            <h2 className="cg" style={{ fontSize: 22, color: "#4a3540" }}>
              Add subtasks to "{(parentItem?.title || "this item").slice(0, 40)}{parentItem?.title?.length > 40 ? "…" : ""}" <span style={{ color: "#d4829a" }}>✦</span>
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(74,53,64,0.35)", fontSize: 24, cursor: "pointer" }}>×</button>
        </div>

        {!parsed ? (
          <>
            <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.5)", marginBottom: 12, lineHeight: 1.6 }}>
              Paste a list, brain dump, or comma-separated steps — Rosie will split them into clean subtasks. 🌸
            </p>
            <textarea
              className="ifield jost"
              rows={8}
              style={{ resize: "vertical", minHeight: 160, fontSize: 13 }}
              placeholder="e.g. Review draft, Send to Josh, Schedule kickoff
Or:
- Build outline
- Add visuals
- Practice run-through"
              value={text}
              onChange={e => setText(e.target.value)}
              autoFocus
            />
            {error && <p className="jost" style={{ fontSize: 12, color: "#c4687a", marginTop: 8 }}>{error}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button className="btn rose jost" onClick={parse} disabled={!text.trim() || parsing} style={{ flex: 1, padding: "11px", opacity: !text.trim() || parsing ? 0.5 : 1 }}>
                {parsing ? "Rosie is parsing…" : "Parse with Rosie ✦"}
              </button>
              <button className="btn ghost jost" onClick={onClose}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            {(() => {
              const totalSubtasks = parsed.reduce((sum, t) => sum + (t.subtasks?.length || 0), 0);
              const totalToAdd = parsed.length + totalSubtasks;
              return (
                <>
                  <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.5)", marginBottom: 12, lineHeight: 1.6 }}>
                    {totalSubtasks > 0
                      ? `Found ${parsed.length} task${parsed.length === 1 ? "" : "s"} with ${totalSubtasks} subtask${totalSubtasks === 1 ? "" : "s"}. Edit titles or ✕ to remove, then add them all.`
                      : `Found ${parsed.length} task${parsed.length === 1 ? "" : "s"}. Edit titles or ✕ to remove, then add them all.`
                    }
                  </p>
                  <ParsedTaskPreview
                    parsed={parsed}
                    onEditTitle={editTitle}
                    onRemoveTask={removeTask}
                    onEditSubtaskTitle={editSubtaskTitle}
                    onRemoveSubtask={removeSubtask}
                  />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn rose jost" onClick={confirm} disabled={!parsed.length} style={{ flex: 1, padding: "11px" }}>
                      {totalSubtasks > 0
                        ? `Add ${totalToAdd} item${totalToAdd === 1 ? "" : "s"} ✦`
                        : `Add ${parsed.length} task${parsed.length === 1 ? "" : "s"} ✦`
                      }
                    </button>
                    <button className="btn ghost jost" onClick={() => { setParsed(null); }}>← Back</button>
                  </div>
                </>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}

// ── Brain Dump Modal (Parking Lot + Hyperfocus Spirals with tabs) ────────────
function BrainDumpModal({ data, onUpdate, onClose }) {
  const [tab, setTab] = useState("parking"); // 'parking' | 'spirals'
  const [parkInput, setParkInput] = useState("");

  // Parking lot helpers
  const addParking = () => {
    if (!parkInput.trim()) return;
    onUpdate({ ...data, parkingLot: [...(data.parkingLot || []), parkInput.trim()] });
    setParkInput("");
  };
  const removeParking = i => onUpdate({ ...data, parkingLot: data.parkingLot.filter((_, xi) => xi !== i) });

  // Spiral helpers
  const addSpiral = s => {
    const exists = (data.spirals || []).find(x => x.id === s.id);
    const spirals = exists ? data.spirals.map(x => x.id === s.id ? s : x) : [s, ...(data.spirals || [])];
    onUpdate({ ...data, spirals });
  };
  const updateSpiral = s => onUpdate({ ...data, spirals: (data.spirals || []).map(x => x.id === s.id ? s : x) });
  const deleteSpiral = id => onUpdate({ ...data, spirals: (data.spirals || []).filter(x => x.id !== id) });
  const standaloneSpirals = (data.spirals || []).filter(s => !s.itemId);

  const parkCount = (data.parkingLot || []).length;
  const spiralCount = standaloneSpirals.length;

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade" style={{ maxWidth: 620, padding: "24px 24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div className="jost" style={{ fontSize: 10, letterSpacing: 3, color: "rgba(180,140,90,0.85)", textTransform: "uppercase", marginBottom: 4 }}>🧠 brain dump</div>
            <h2 className="cg" style={{ fontSize: 26, color: "#4a3540" }}>Out of your head <span style={{ color: "#c4a882" }}>✦</span></h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(74,53,64,0.35)", fontSize: 24, cursor: "pointer" }}>×</button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, padding: 4, background: "rgba(196,168,130,0.08)", borderRadius: 12, border: "1px solid rgba(196,168,130,0.18)" }}>
          <button
            className="jost"
            onClick={() => setTab("parking")}
            style={{
              flex: 1,
              padding: "9px 12px",
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: tab === "parking" ? 600 : 500,
              background: tab === "parking" ? "linear-gradient(135deg,#d6c098,#b89868)" : "transparent",
              color: tab === "parking" ? "#fff" : "rgba(74,53,64,0.55)",
              transition: "all .2s",
              boxShadow: tab === "parking" ? "0 2px 8px rgba(180,140,90,0.25)" : "none",
            }}
          >
            🌿 Parking Lot {parkCount > 0 && <span style={{ opacity: 0.8, marginLeft: 4 }}>({parkCount})</span>}
          </button>
          <button
            className="jost"
            onClick={() => setTab("spirals")}
            style={{
              flex: 1,
              padding: "9px 12px",
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: tab === "spirals" ? 600 : 500,
              background: tab === "spirals" ? "linear-gradient(135deg,#c8b0e0,#9878b8)" : "transparent",
              color: tab === "spirals" ? "#fff" : "rgba(74,53,64,0.55)",
              transition: "all .2s",
              boxShadow: tab === "spirals" ? "0 2px 8px rgba(152,120,184,0.25)" : "none",
            }}
          >
            🌀 Hyperfocus Spirals {spiralCount > 0 && <span style={{ opacity: 0.8, marginLeft: 4 }}>({spiralCount})</span>}
          </button>
        </div>

        {/* Parking Lot tab */}
        {tab === "parking" && (
          <div className="fade">
            <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.5)", marginBottom: 14, lineHeight: 1.6 }}>
              Anything floating in your brain that doesn't belong anywhere yet. Get it out. 🌸
            </p>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input
                className="ifield"
                placeholder="Idea, thought, random thing your brain won't drop..."
                value={parkInput}
                onChange={e => setParkInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addParking()}
                autoFocus
              />
              <button className="btn ghost" onClick={addParking} style={{ flexShrink: 0, padding: "0 14px", fontSize: 18 }}>+</button>
            </div>
            <div style={{ maxHeight: 360, overflowY: "auto" }}>
              {(data.parkingLot || []).map((idea, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(196,168,130,0.08)", borderRadius: 10, marginBottom: 7, border: "1px solid rgba(196,168,130,0.15)" }}>
                  <span className="jost" style={{ fontSize: 13, color: "rgba(74,53,64,0.75)", flex: 1, lineHeight: 1.5 }}>{idea}</span>
                  <button onClick={() => removeParking(i)} style={{ background: "none", border: "none", color: "rgba(74,53,64,0.3)", cursor: "pointer", fontSize: 18, flexShrink: 0, marginLeft: 8 }}>×</button>
                </div>
              ))}
              {parkCount === 0 && (
                <div style={{ padding: "32px 20px", textAlign: "center" }}>
                  <p className="cg" style={{ fontSize: 20, color: "rgba(74,53,64,0.3)", fontStyle: "italic" }}>All clear up here ✨</p>
                  <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.3)", marginTop: 4 }}>Drop something in when your brain won't drop it</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Spirals tab */}
        {tab === "spirals" && (
          <div className="fade" style={{ marginTop: -4 }}>
            <HyperfocusContainer
              spirals={standaloneSpirals}
              onAdd={addSpiral}
              onUpdate={updateSpiral}
              onDelete={deleteSpiral}
              title="Hyperfocus Spirals"
              emptyText="No spirals yet ✨ When you fall down a rabbit hole, drop it here so it's not lost when the interest passes."
            />
          </div>
        )}

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button className="btn ghost jost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function ParkItModal({ onSave, onClose }) {
  const [text, setText] = useState("");
  const save = () => { if (text.trim()) { onSave(text.trim()); onClose(); } };
  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade" style={{ maxWidth: 440 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div className="jost" style={{ fontSize: 10, letterSpacing: 3, color: "rgba(180,140,90,0.85)", textTransform: "uppercase", marginBottom: 4 }}>🌿 park it</div>
            <h2 className="cg" style={{ fontSize: 24, color: "#4a3540" }}>Drop it here <span style={{ color: "#c4a882" }}>✦</span></h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(74,53,64,0.35)", fontSize: 24, cursor: "pointer" }}>×</button>
        </div>
        <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.5)", marginBottom: 14, lineHeight: 1.6 }}>
          That thing your brain won't drop. Get it out of your head. 🌸
        </p>
        <textarea
          className="ifield jost"
          rows={3}
          style={{ resize: "vertical", minHeight: 70 }}
          placeholder="Whatever it is..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); save(); } }}
          autoFocus
        />
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button className="btn jost" onClick={save} disabled={!text.trim()} style={{ flex: 1, padding: "11px", background: "linear-gradient(135deg,#d6c098,#b89868)", color: "#fff", opacity: !text.trim() ? 0.4 : 1 }}>Park it 🌿</button>
          <button className="btn ghost jost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
