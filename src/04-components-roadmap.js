// 04-components-roadmap.js
// Roadmap UI: SLOT_COLORS/TYPES, TodayPicker, MorningRoadmap, SlotEditModal, TimelineView, RoadmapCard, RoadmapHistoryModal.

// ── Morning Roadmap Screen ────────────────────────────────────────────────────
const SLOT_COLORS = {
  work:    { color: "#d4829a", bg: "rgba(212,130,154,0.1)",  border: "rgba(212,130,154,0.25)", dot: "#d4829a" },
  break:   { color: "#9eb89a", bg: "rgba(158,184,154,0.1)",  border: "rgba(158,184,154,0.25)", dot: "#9eb89a" },
  buffer:  { color: "#c4a882", bg: "rgba(196,168,130,0.1)",  border: "rgba(196,168,130,0.25)", dot: "#c4a882" },
  blocked: { color: "#c47e8a", bg: "rgba(196,126,138,0.1)",  border: "rgba(196,126,138,0.25)", dot: "#c47e8a" },
};

// ── Slot editing helpers (used by both RoadmapCard and MorningRoadmap) ──────
const SLOT_TYPES = ["work", "break", "buffer", "blocked"];

// TodayPicker — shown after check-in, before roadmap generation. Lets Lexy
// review what's queued for today and check/uncheck items before Rosie builds
// the schedule. Defaults: items scheduled for today/past = checked, future = unchecked.
function TodayPicker({ data, energy, mood, onConfirm, onSkip, onUpdateData }) {
  // Filter out both done AND cancelled — both are terminal states. Cancelled
  // items are abandoned, shouldn't appear in planning suggestions.
  const allItems = (data?.items || []).filter(i => i.status !== "done" && i.status !== "cancelled");
  const todayISO = todayStr();
  const today = new Date(todayISO);

  // Categorize items by relevance for today
  const buckets = useMemo(() => {
    const overdue = []; // scheduled in the past
    const dueToday = []; // scheduled for today
    const upcoming = []; // scheduled for tomorrow+, or no date
    const blocked = []; // status: blocked, waiting, or hold — anything parked
    for (const item of allItems) {
      // Hold is grouped with blocked/waiting because it's the same UX intent:
      // "this can't move yet, don't suggest pulling it ahead." Keeps the
      // Upcoming bucket focused on items actually available to chip at.
      if (item.status === "blocked" || item.status === "waiting" || item.status === "hold") {
        blocked.push(item);
        continue;
      }
      const sched = item.scheduledDate;
      if (!sched) {
        upcoming.push(item);
        continue;
      }
      if (sched < todayISO) overdue.push(item);
      else if (sched === todayISO) dueToday.push(item);
      else upcoming.push(item);
    }
    return { overdue, dueToday, upcoming, blocked };
  }, [allItems, todayISO]);

  // Default: overdue + dueToday checked, others unchecked
  const [checkedIds, setCheckedIds] = useState(() => {
    const s = new Set();
    buckets.overdue.forEach(i => s.add(i.id));
    buckets.dueToday.forEach(i => s.add(i.id));
    return s;
  });

  const toggle = (id) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleBucket = (items, on) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      items.forEach(i => on ? next.add(i.id) : next.delete(i.id));
      return next;
    });
  };

  // Inline "add new task" — quick add during planning so freshly-noticed
  // items can be created without leaving the picker. Minimal fields only:
  // title + priority + optional scheduled date. Anything else (subtasks,
  // why, done-when, etc.) can be filled in by opening the item later.
  // After save: form clears, kind stays open for the next add, and the new
  // item is auto-checked so it pulls into the roadmap build.
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "medium", scheduledDate: "" });

  const saveTask = () => {
    const title = newTask.title.trim();
    if (!title || !onUpdateData) return;
    const newItem = {
      id: uid(),
      title,
      priority: newTask.priority || "medium",
      status: "todo",
      why: "",
      tasks: [],
      taskTimes: [],
      completedTasks: [],
      category: "",
      done: "",
      outOfScope: "",
      notes: "",
      timeEstimate: "",
      scheduledDate: newTask.scheduledDate || "",
      createdAt: Date.now(),
    };
    onUpdateData({ ...data, items: [...(data?.items || []), newItem] });
    // Auto-check the new item so it flows into the roadmap build. The user
    // just added it intentionally — clearly they want to work on it today.
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.add(newItem.id);
      return next;
    });
    // Clear form, ready for the next add. Keep open per Lexy's pattern.
    setNewTask({ title: "", priority: "medium", scheduledDate: "" });
  };

  const totalChecked = checkedIds.size;
  const totalAvailable = allItems.length;

  const confirmPick = () => {
    const selectedItems = allItems.filter(i => checkedIds.has(i.id));
    onConfirm(selectedItems);
  };

  const energyObj = ENERGY_LEVELS.find(e => e.key === energy) || ENERGY_LEVELS[1];

  const renderBucket = (label, items, color, dotColor, hint) => {
    if (!items.length) return null;
    const allChecked = items.every(i => checkedIds.has(i.id));
    const someChecked = items.some(i => checkedIds.has(i.id));
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, paddingLeft: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor }} />
          <div className="jost" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color, fontWeight: 600, flex: 1 }}>
            {label} <span style={{ color: "rgba(74,53,64,0.4)", fontWeight: 400 }}>({items.length})</span>
          </div>
          <button
            onClick={() => toggleBucket(items, !allChecked)}
            className="jost"
            style={{ background: "transparent", border: "none", color: "rgba(74,53,64,0.5)", fontSize: 10, cursor: "pointer", padding: "0 4px", textDecoration: "underline" }}
          >{allChecked ? "uncheck all" : "check all"}</button>
        </div>
        {hint && <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.5)", fontStyle: "italic", marginBottom: 6, paddingLeft: 20 }}>{hint}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {items.map(item => {
            const isChecked = checkedIds.has(item.id);
            const taskCount = (item.tasks || []).length;
            const completed = (item.completedTasks || []).length;
            const totalTime = (item.taskTimes || []).reduce((sum, t, idx) => sum + (completed > idx ? 0 : (t || 0)), 0);
            const remaining = taskCount - completed;
            return (
              <label
                key={item.id}
                onClick={(e) => { if (e.target.tagName !== "INPUT") { e.preventDefault(); toggle(item.id); } }}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "10px 14px",
                  background: isChecked ? "rgba(212,130,154,0.06)" : "rgba(255,255,255,0.5)",
                  border: `1px solid ${isChecked ? "rgba(212,130,154,0.25)" : "rgba(212,130,154,0.12)"}`,
                  borderRadius: 10, cursor: "pointer",
                  opacity: isChecked ? 1 : 0.6,
                  transition: "all .15s",
                }}
              >
                <span style={{ flexShrink: 0, marginTop: 2 }}>
                  {isChecked
                    ? <CheckSquare size={16} style={{ color: "#d4829a" }} />
                    : <Square size={16} style={{ color: "rgba(212,130,154,0.4)" }} />}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="jost" style={{ fontSize: 13, color: "#4a3540", fontWeight: 500, lineHeight: 1.4, textDecoration: isChecked ? "none" : "line-through" }}>
                    {item.title}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4, alignItems: "center" }}>
                    <span className="tag jost" style={{ fontSize: 10, padding: "2px 8px", background: item.priority === "high" ? "rgba(212,100,120,0.12)" : item.priority === "low" ? "rgba(196,168,130,0.12)" : "rgba(184,160,212,0.12)", color: item.priority === "high" ? "#c4687a" : item.priority === "low" ? "#9a7850" : "#9878b8" }}>{item.priority || "medium"}</span>
                    {item.status && item.status !== "todo" && <span className="tag jost" style={{ fontSize: 10, padding: "2px 8px", background: "rgba(74,53,64,0.06)", color: "rgba(74,53,64,0.55)" }}>{item.status}</span>}
                    {remaining > 0 && <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)" }}>{remaining}/{taskCount} task{taskCount !== 1 ? "s" : ""}{totalTime > 0 ? ` · ~${totalTime}m` : ""}</span>}
                    {taskCount === 0 && item.timeEstimate && <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)" }}>~{item.timeEstimate}</span>}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", padding: "30px 20px", maxWidth: 720, margin: "0 auto" }}>
      <div className="fade" style={{ textAlign: "center", marginBottom: 24 }}>
        <div className="jost" style={{ fontSize: 11, letterSpacing: 2, color: "rgba(74,53,64,0.5)", marginBottom: 6 }}>STEP 2 OF 2</div>
        <h1 className="cg" style={{ fontSize: 36, fontStyle: "italic", color: "#4a3540", margin: 0, lineHeight: 1.2 }}>What's on the list today?</h1>
        <p className="jost" style={{ fontSize: 13, color: "rgba(74,53,64,0.6)", marginTop: 8, fontStyle: "italic" }}>
          Pick what you actually want to tackle — Rosie will build around your choices. ✦
        </p>
      </div>

      <div className="card" style={{ padding: "20px 24px", marginBottom: 16 }}>
        {allItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🌸</div>
            <div className="cg" style={{ fontSize: 20, fontStyle: "italic", color: "rgba(74,53,64,0.5)", marginBottom: 4 }}>Nothing in the queue</div>
            <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.45)", margin: 0 }}>Rosie will build a free-form day with breaks and breathing room.</p>
          </div>
        ) : (
          <>
            {renderBucket("Overdue", buckets.overdue, "#c4687a", "#c4687a", "These were scheduled for past days. Roll forward or skip.")}
            {renderBucket("Due today", buckets.dueToday, "#d4829a", "#d4829a", null)}
            {renderBucket("Upcoming + unscheduled", buckets.upcoming, "#9878b8", "#b8a0d4", "Pull ahead anything you want to chip at.")}
            {renderBucket("Blocked / waiting", buckets.blocked, "#9a7850", "#c4a882", "These can't move yet — leave unchecked unless you want to revisit.")}
          </>
        )}

        {/* + Add new task — always available so the user can bootstrap an
            empty queue or add freshly-noticed items during planning. Newly
            added items auto-check so they flow straight into the roadmap. */}
        {onUpdateData && (
          <div style={{ marginTop: allItems.length === 0 ? 6 : 18, paddingTop: allItems.length === 0 ? 0 : 18, borderTop: allItems.length === 0 ? "none" : "1px solid rgba(212,130,154,0.12)" }}>
            {!showAddTask ? (
              <button
                onClick={() => setShowAddTask(true)}
                className="jost"
                style={{
                  background: "transparent",
                  border: "1px dashed rgba(212,130,154,0.35)",
                  color: "#d4829a",
                  fontSize: 12,
                  cursor: "pointer",
                  padding: "10px 16px",
                  borderRadius: 9,
                  width: "100%",
                  fontWeight: 500,
                  letterSpacing: 0.3,
                }}
              >+ Add new task</button>
            ) : (
              <div style={{ background: "rgba(212,130,154,0.05)", border: "1px solid rgba(212,130,154,0.25)", borderRadius: 11, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <label className="sl jost" style={{ marginBottom: 0 }}>✦ Add new task</label>
                  <button
                    onClick={() => {
                      setNewTask({ title: "", priority: "medium", scheduledDate: "" });
                      setShowAddTask(false);
                    }}
                    title="Hide"
                    className="jost"
                    style={{ background: "none", border: "none", color: "rgba(74,53,64,0.4)", fontSize: 12, cursor: "pointer", padding: 0 }}
                  >hide</button>
                </div>
                <p className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.4)", marginTop: 0, marginBottom: 10, lineHeight: 1.5 }}>
                  Quick add — title + priority + optional date. Auto-checked so it flows into today's roadmap. Open the item later to add subtasks, notes, etc.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>Title</label>
                    <input
                      value={newTask.title}
                      onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                      onKeyDown={e => { if (e.key === "Enter" && newTask.title.trim()) saveTask(); }}
                      placeholder="e.g. Draft Sell Statements"
                      className="jost"
                      style={{ width: "100%", padding: "6px 10px", fontSize: 13, border: "1px solid rgba(212,130,154,0.3)", borderRadius: 7, background: "rgba(255,255,255,0.7)", boxSizing: "border-box" }}
                      autoFocus
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 0.6 }}>
                      <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>Priority</label>
                      <select
                        value={newTask.priority}
                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                        className="jost"
                        style={{ width: "100%", padding: "6px 10px", fontSize: 12, border: "1px solid rgba(212,130,154,0.3)", borderRadius: 7, background: "rgba(255,255,255,0.7)", boxSizing: "border-box", cursor: "pointer" }}
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>Scheduled date (optional)</label>
                      <input
                        type="date"
                        value={newTask.scheduledDate}
                        onChange={e => setNewTask({ ...newTask, scheduledDate: e.target.value })}
                        className="jost"
                        style={{ width: "100%", padding: "5px 10px", fontSize: 12, border: "1px solid rgba(212,130,154,0.3)", borderRadius: 7, background: "rgba(255,255,255,0.7)", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button
                      onClick={saveTask}
                      disabled={!newTask.title.trim()}
                      className="btn jost"
                      style={{
                        background: newTask.title.trim() ? "linear-gradient(135deg,#d4829a,#c4687a)" : "rgba(212,130,154,0.2)",
                        color: newTask.title.trim() ? "#fff" : "rgba(74,53,64,0.4)",
                        padding: "6px 16px", fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
                        cursor: newTask.title.trim() ? "pointer" : "default",
                      }}
                    >✓ Save & add another</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "14px 18px", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(212,130,154,0.2)", borderRadius: 14, position: "sticky", bottom: 16, backdropFilter: "blur(8px)" }}>
        <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.65)", flex: 1 }}>
          {totalAvailable === 0 ? "No items to pick from" :
           totalChecked === 0 ? "Nothing checked — Rosie will build a free day" :
           totalChecked === totalAvailable ? `All ${totalAvailable} on the list` :
           `${totalChecked} of ${totalAvailable} chosen`}
        </div>
        {onSkip && (
          <button onClick={onSkip} className="btn ghost jost" style={{ fontSize: 12, padding: "8px 16px" }}>Skip — use defaults</button>
        )}
        <button
          onClick={confirmPick}
          className="btn rose jost"
          style={{ fontSize: 12, padding: "8px 18px" }}
        >
          Build my roadmap →
        </button>
      </div>
    </div>
  );
}

// Renders a thin bottom-edge resize handle inside a slot card. Self-contained:
// owns its own drag lifecycle (window mousemove/mouseup), shows a floating
// duration tooltip near the cursor while active, snaps to 5-min increments at
// 1px = 1min. On release, calls onCommit(newDurationMin). Hides itself for
// required breaks (passed via `disabled`). Parent must be position:relative.
function SlotResizeHandle({ color, disabled, getCurrentDuration, onCommit }) {
  const [resizing, setResizing] = useState(null); // { startY, startDuration, curX, curY } | null
  const [hover, setHover] = useState(false);

  // Window-level move/up listeners only attach while a resize is active.
  // Effect re-runs when resize starts (resizing transitions from null → object)
  // or ends (object → null). Live cursor coords kept in state for tooltip.
  useEffect(() => {
    if (!resizing) return;
    const onMove = (e) => {
      setResizing(prev => prev ? { ...prev, curX: e.clientX, curY: e.clientY } : null);
    };
    const onUp = (e) => {
      setResizing(prev => {
        if (prev) {
          const rawDelta = e.clientY - prev.startY;
          const snappedDelta = Math.round(rawDelta / 5) * 5; // 1px=1min, snap to 5
          const newDuration = Math.max(5, prev.startDuration + snappedDelta);
          if (newDuration !== prev.startDuration) onCommit(newDuration);
        }
        return null;
      });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    // Only re-attach when a resize starts/ends, not on every mousemove.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizing ? resizing.startY : null]);

  if (disabled) return null;

  const onMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation(); // don't trigger the parent's HTML5 drag
    const curDuration = getCurrentDuration();
    if (curDuration == null || curDuration <= 0) return;
    setResizing({ startY: e.clientY, startDuration: curDuration, curX: e.clientX, curY: e.clientY });
  };

  // Live preview duration for the tooltip.
  let previewLabel = null;
  if (resizing) {
    const rawDelta = resizing.curY - resizing.startY;
    const snappedDelta = Math.round(rawDelta / 5) * 5;
    const previewDuration = Math.max(5, resizing.startDuration + snappedDelta);
    const h = Math.floor(previewDuration / 60);
    const m = previewDuration % 60;
    previewLabel = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
  }

  const active = !!resizing;
  const showBar = hover || active;

  return (
    <>
      <div
        onMouseDown={onMouseDown}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        title="Drag down to extend, up to shrink"
        draggable={false}
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: -4,
          height: 9,
          cursor: "ns-resize",
          zIndex: 3,
          touchAction: "none",
        }}
      >
        <div style={{
          position: "absolute",
          left: 0, right: 0,
          top: 3,
          height: 3,
          background: color,
          opacity: active ? 0.85 : (showBar ? 0.5 : 0),
          borderRadius: 2,
          transition: "opacity .15s",
        }} />
      </div>
      {active && previewLabel && (
        <div
          className="jost"
          style={{
            position: "fixed",
            left: resizing.curX + 14,
            top: resizing.curY - 10,
            background: "#4a3540",
            color: "#fff8f5",
            fontSize: 11,
            fontWeight: 600,
            padding: "4px 9px",
            borderRadius: 6,
            pointerEvents: "none",
            zIndex: 9999,
            boxShadow: "0 4px 12px rgba(74,53,64,0.35)",
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}
        >{previewLabel}</div>
      )}
    </>
  );
}

// ── SlotActionPill ─────────────────────────────────────────────────────
// Slot-type-aware action pill that renders the right pill (+ wires the right
// click handler) for any slot in the roadmap. Used by MorningRoadmap's list
// rendering; designed so RoadmapCard's list view can adopt the same pill set
// when it's ready to drop its older simple-flex layout.
//
// Priority order (first match wins):
//   1. Linked work     → ✨ next up: [item]   → onFocus(item)
//   2. Specific prep   → 🌟 / 💛               → onMeetingFocus
//   3. Meeting         → 🌹 meeting             → onPastMeetingClick
//   4. Daily prep      → 🌸 daily prep          → onEditNote
//   5. Lunch           → 🍽️                    → onStartBreakTimer
//   6. Brain break     → 🌿                    → onStartBreakTimer
//   7. Morning settle  → 🌅                    → onEditNote
//   8. Wrap + tomorrow → 🌙 wrap & prep         → onEditNote
//   9. Close out       → 🌙 close out           → onEditNote
//  10. Rest / buffer   → ☕ recharge            → onStartBreakTimer
//
// All callbacks are optional — if a handler isn't passed in, the pill still
// renders but clicking is a no-op.
function SlotActionPill({ slot, idx, matchingItem, onFocus, onMeetingFocus, onPastMeetingClick, onStartBreakTimer, onEditNote }) {
  if (!slot) return null;
  const labelLower = (slot.label || "").toLowerCase();
  const slotMin = parseSlotTimeMinutes(slot.time);
  const stop = (fn) => (e) => { e.stopPropagation(); if (fn) fn(); };

  // 1. Linked work slot → ✨ next up: [title]
  if (slot.type === "work" && matchingItem) {
    return (
      <button
        onClick={stop(() => onFocus && onFocus(matchingItem))}
        className="jost"
        title={`Linked to: ${matchingItem.title}. Click to open and edit.`}
        style={{
          fontSize: 11, padding: "3px 11px", borderRadius: 12,
          background: "rgba(212,130,154,0.10)", color: "#b86d85",
          fontWeight: 500, letterSpacing: 0.2, cursor: "pointer",
          border: "1px solid rgba(212,130,154,0.25)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          maxWidth: 260,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,130,154,0.18)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(212,130,154,0.10)"; }}
      >✨ next up: {matchingItem.title}</button>
    );
  }

  // 2. "Prep for [meeting]" — but NOT the morning daily-prep block
  const isDailyPrep = labelLower.includes("prep for today") ||
                      labelLower.includes("prep for the day") ||
                      labelLower.includes("daily meeting prep") ||
                      labelLower.includes("meetings prep");
  if (labelLower.startsWith("prep for") && !isDailyPrep) {
    // 1:1-style patterns — explicit 1:1 markers plus the common informal
    // phrasings that are almost always 1:1s ("sync with josh", "catch-up
    // with sarah", "check-in with manager"). Conservative: must be "X with
    // [name]" to avoid catching team-wide check-ins.
    const is1on1 = /\b1:1\b/.test(labelLower)
      || /\bone[- ]on[- ]one\b/.test(labelLower)
      || /\bsync with\b/.test(labelLower)
      || /\bcatch[- ]?up with\b/.test(labelLower)
      || /\bcheck[- ]?in with\b/.test(labelLower);
    const targetLabel = (slot.label || "").replace(/^prep for\s+/i, "").trim();
    return (
      <button
        onClick={stop(() => {
          if (onMeetingFocus) {
            onMeetingFocus({ ...slot, label: targetLabel }, {
              autoPrep: true,
              prefilledSituation: targetLabel,
              detectedType: is1on1 ? "1on1" : null,
            });
          }
        })}
        className="jost"
        title={is1on1 ? "1:1 prep — opens 1:1 prep view" : "Meeting prep — opens prep view"}
        style={{
          fontSize: 11, padding: "3px 11px", borderRadius: 12,
          background: is1on1 ? "rgba(232,196,140,0.14)" : "rgba(184,160,212,0.12)",
          color: is1on1 ? "#b89858" : "#9878b8",
          fontWeight: 500, letterSpacing: 0.2, cursor: "pointer",
          border: `1px solid ${is1on1 ? "rgba(196,168,130,0.4)" : "rgba(184,160,212,0.35)"}`,
          whiteSpace: "nowrap",
        }}
      >{is1on1 ? "💛 1:1 prep" : "🌟 meeting prep"}</button>
    );
  }

  // 3. Meeting slot (not prep) → 🌹 meeting — opens Meetings notes
  if (isMeetingSlot(slot)) {
    return (
      <button
        onClick={stop(() => onPastMeetingClick && onPastMeetingClick(slot))}
        className="jost"
        title="Open meeting notes"
        style={{
          fontSize: 11, padding: "3px 11px", borderRadius: 12,
          background: "rgba(212,130,154,0.10)", color: "#b86d85",
          fontWeight: 500, letterSpacing: 0.2, cursor: "pointer",
          border: "1px solid rgba(212,130,154,0.25)",
          whiteSpace: "nowrap",
        }}
      >🌹 meeting</button>
    );
  }

  // 4. Daily morning prep block → 🌸 daily prep
  if (isDailyPrep) {
    return (
      <button
        onClick={stop(onEditNote)}
        className="jost"
        title="Daily prep — click to add notes"
        style={{
          fontSize: 11, padding: "3px 11px", borderRadius: 12,
          background: "rgba(184,160,212,0.10)", color: "#9878b8",
          fontWeight: 500, letterSpacing: 0.2, cursor: "pointer",
          border: "1px solid rgba(184,160,212,0.3)",
          whiteSpace: "nowrap",
        }}
      >🌸 daily prep</button>
    );
  }

  // 5. Lunch → 🍽️ eat something good (opens countdown timer modal)
  if (isLunchSlot(slot)) {
    return (
      <button
        onClick={stop(() => onStartBreakTimer && onStartBreakTimer(idx))}
        className="jost"
        title="Lunch — click to start countdown timer"
        style={{
          fontSize: 11, padding: "3px 11px", borderRadius: 12,
          background: "rgba(232,196,140,0.14)", color: "#9a7850",
          fontWeight: 500, letterSpacing: 0.2, cursor: "pointer",
          border: "1px solid rgba(196,168,130,0.4)",
          whiteSpace: "nowrap",
        }}
      >🍽️ eat something good</button>
    );
  }

  // 6. Brain break → 🌿 stretch & reset (opens countdown timer modal)
  if (isBrainBreakSlot(slot)) {
    return (
      <button
        onClick={stop(() => onStartBreakTimer && onStartBreakTimer(idx))}
        className="jost"
        title="Brain break — click to start countdown timer"
        style={{
          fontSize: 11, padding: "3px 11px", borderRadius: 12,
          background: "rgba(158,184,154,0.14)", color: "#7a9e78",
          fontWeight: 500, letterSpacing: 0.2, cursor: "pointer",
          border: "1px solid rgba(158,184,154,0.4)",
          whiteSpace: "nowrap",
        }}
      >🌿 stretch & reset</button>
    );
  }

  // 7. Morning settle / wake / reorient → 🌅 settle in
  const isMorningSettle = (
    labelLower.includes("settle") || labelLower.includes("morning buffer") ||
    labelLower.includes("reorient") || labelLower.includes("wake up") ||
    labelLower.includes("wake-up") || labelLower.includes("ease in") ||
    labelLower === "morning" || labelLower.startsWith("morning ") ||
    (labelLower === "buffer" && idx === 0 && slotMin < 10 * 60)
  );
  if (isMorningSettle && slotMin >= 0 && slotMin < 12 * 60) {
    return (
      <button
        onClick={stop(onEditNote)}
        className="jost"
        title="Settle in — click to add notes"
        style={{
          fontSize: 11, padding: "3px 11px", borderRadius: 12,
          background: "rgba(232,180,140,0.14)", color: "#b8895a",
          fontWeight: 500, letterSpacing: 0.2, cursor: "pointer",
          border: "1px solid rgba(220,170,130,0.4)",
          whiteSpace: "nowrap",
        }}
      >🌅 settle in</button>
    );
  }

  // 8. Wrap & prep tomorrow → 🌙 wrap & prep tomorrow
  if (labelLower.includes("wrap") && labelLower.includes("tomorrow")) {
    return (
      <button
        onClick={stop(onEditNote)}
        className="jost"
        title="Wrap & prep tomorrow — click to add notes"
        style={{
          fontSize: 11, padding: "3px 11px", borderRadius: 12,
          background: "rgba(184,160,212,0.10)", color: "#9878b8",
          fontWeight: 500, letterSpacing: 0.2, cursor: "pointer",
          border: "1px solid rgba(184,160,212,0.35)",
          whiteSpace: "nowrap",
        }}
      >🌙 wrap & prep tomorrow</button>
    );
  }

  // 9. Close out / End of day → 🌙 close out
  if (labelLower.includes("close for the day") || labelLower.includes("close out") ||
      labelLower.includes("end of day") || labelLower.includes("end-of-day")) {
    return (
      <button
        onClick={stop(onEditNote)}
        className="jost"
        title="Close out — click to add notes"
        style={{
          fontSize: 11, padding: "3px 11px", borderRadius: 12,
          background: "rgba(196,168,130,0.10)", color: "#9a7850",
          fontWeight: 500, letterSpacing: 0.2, cursor: "pointer",
          border: "1px solid rgba(196,168,130,0.35)",
          whiteSpace: "nowrap",
        }}
      >🌙 close out</button>
    );
  }

  // 10. Rest / free buffer / recovery → ☕ recharge time (opens countdown timer modal)
  if (labelLower.includes("rest") || labelLower.includes("free buffer") ||
      labelLower.includes("recovery") || labelLower === "buffer") {
    return (
      <button
        onClick={stop(() => onStartBreakTimer && onStartBreakTimer(idx))}
        className="jost"
        title="Recharge — click to start countdown timer"
        style={{
          fontSize: 11, padding: "3px 11px", borderRadius: 12,
          background: "rgba(120,168,168,0.10)", color: "#5a8888",
          fontWeight: 500, letterSpacing: 0.2, cursor: "pointer",
          border: "1px solid rgba(120,168,168,0.4)",
          whiteSpace: "nowrap",
        }}
      >☕ recharge time</button>
    );
  }

  return null;
}

function MorningRoadmap({ roadmap, energy, mood, data, onUpdate, onUpdateRoadmap, onContinue, onFocus, onMeetingFocus, onPastMeetingClick, onStartBreakTimer, roadmapError, onBackToCheckIn }) {
  const energyObj = ENERGY_LEVELS.find(e => e.key === energy) || ENERGY_LEVELS[1];
  const slots = roadmap?.slots || [];
  const items = (data?.items || []);

  // Reuse keyword-overlap matcher to link slots to actual work items
  const findMatchingItem = (label, slot) => {
    // Manual override (see RoadmapCard's findMatchingItem for full rationale)
    if (slot && slot.matchOverrideItemId) {
      if (slot.matchOverrideItemId === "__none__") return null;
      const pinned = items.find(it => it.id === slot.matchOverrideItemId);
      if (pinned) return pinned;
    }
    if (!label) return null;
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
  };
  const [refineInput, setRefineInput] = useState("");
  const [refining, setRefining] = useState(false);
  const [refineError, setRefineError] = useState("");
  const [refineActions, setRefineActions] = useState([]); // green pill confirmations
  const [editingSlot, setEditingSlot] = useState(null); // { idx, field: "time"|"label"|"note" }
  const [editValue, setEditValue] = useState("");
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  // Timeline-Edit slot modal — opens when a slot is clicked in TimelineView.
  // Build screen uses Timeline+Edit mode always (no toggle).
  const [timelineModalIdx, setTimelineModalIdx] = useState(null);

  // ── Slot editing helpers ──
  const startEdit = (idx, field) => {
    setEditingSlot({ idx, field });
    if (field === "endTime") {
      // Initialize with the displayed end time. For fixed-duration slots, that's
      // start + intended duration. Otherwise fall back to next slot's start.
      const slot = roadmap.slots[idx];
      const startMin = parseSlotTimeMinutes(slot.time);
      const fixedDur = intendedFixedDuration(slot);
      let endMin;
      if (fixedDur != null && startMin >= 0) {
        endMin = startMin + fixedDur;
      } else {
        const next = roadmap.slots[idx + 1];
        endMin = next ? parseSlotTimeMinutes(next.time) : (startMin >= 0 ? startMin + 30 : -1);
      }
      setEditValue(endMin >= 0 ? formatSlotMinutes(endMin) : "");
    } else {
      setEditValue((roadmap.slots[idx] && roadmap.slots[idx][field]) || "");
    }
  };
  const commitEdit = () => {
    if (!editingSlot) return;
    const { idx, field } = editingSlot;
    const trimmed = editValue.trim();
    if (field === "duration") {
      // Parse new duration in minutes. Accept bare number "45" or "45m" or
      // "1h 30m" style — be lenient about the format users actually type.
      const parsed = (() => {
        const m = trimmed.match(/^\s*(?:(\d+)\s*h)?\s*(\d+)?\s*m?\s*$/i);
        if (!m) return NaN;
        const h = parseInt(m[1] || "0", 10);
        const mins = parseInt(m[2] || "0", 10);
        const total = h * 60 + mins;
        return total > 0 ? total : NaN;
      })();
      if (!Number.isFinite(parsed) || parsed < 5) {
        // Invalid — silently bail. Min 5 min so user can't accidentally zero a slot.
        setEditingSlot(null); setEditValue(""); return;
      }
      const startMin = parseSlotTimeMinutes(roadmap.slots[idx].time);
      if (startMin < 0) { setEditingSlot(null); setEditValue(""); return; }
      const newEndMin = startMin + parsed;
      // Compute delta vs the slot's CURRENT effective end. For slots followed
      // by another slot, effective end = next.start (displayed duration is
      // gap-to-next, which is what the user sees in the "· 15m" label). For
      // the last slot, effective end = start + slot.durationMin (or fallback).
      const next = roadmap.slots[idx + 1];
      const nextStart = next ? parseSlotTimeMinutes(next.time) : -1;
      const oldEndMin = nextStart > startMin ? nextStart : (startMin + (roadmap.slots[idx].durationMin || parsed));
      const delta = newEndMin - oldEndMin;
      // Set new durationMin and auto-lock (explicit boundary), then shift ALL
      // subsequent slots by delta — locked or not. The user explicitly chose
      // a duration, so the rest of the day moves to accommodate. This matches
      // what a normal calendar app does when you extend a meeting.
      const newSlots = roadmap.slots.map((s, i) => {
        if (i === idx) return { ...s, durationMin: parsed, locked: true, userLocked: true };
        if (i > idx) {
          const sStart = parseSlotTimeMinutes(s.time);
          if (sStart < 0) return s;
          return { ...s, time: formatSlotMinutes(sStart + delta) };
        }
        return s;
      });
      if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: newSlots });
    } else if (field === "endTime") {
      const newEndMin = parseSlotTimeMinutes(trimmed);
      if (newEndMin < 0 || idx + 1 >= roadmap.slots.length) {
        setEditingSlot(null); setEditValue(""); return;
      }
      const startMin = parseSlotTimeMinutes(roadmap.slots[idx].time);
      if (newEndMin <= startMin) {
        setEditingSlot(null); setEditValue(""); return;
      }
      // Auto-lock both adjacent slots — STRUCTURAL change (boundary set explicitly).
      // Also set durationMin so the display reflects the user's chosen duration.
      const newDuration = newEndMin - startMin;
      const newSlots = roadmap.slots.map((s, i) => {
        if (i === idx) return { ...s, locked: true, userLocked: true, durationMin: newDuration };
        if (i === idx + 1) return { ...s, time: formatSlotMinutes(newEndMin), locked: true, userLocked: true };
        return s;
      });
      if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: newSlots });
    } else if (field === "time") {
      // Auto-lock on time edit — STRUCTURAL change (user set explicit start time)
      const newSlots = roadmap.slots.map((s, i) => i === idx ? { ...s, [field]: trimmed, locked: true, userLocked: true } : s);
      if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: newSlots });
    } else {
      // Label / note edits — COSMETIC, don't auto-lock. User can lock manually
      // if they want the change to survive refines + Re-apply rules.
      const newSlots = roadmap.slots.map((s, i) => i === idx ? { ...s, [field]: trimmed } : s);
      if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: newSlots });
    }
    setEditingSlot(null);
    setEditValue("");
  };
  const cancelEdit = () => { setEditingSlot(null); setEditValue(""); };
  const toggleSlotLock = (idx) => {
    const newSlots = roadmap.slots.map((s, i) => {
      if (i !== idx) return s;
      const newLocked = !s.locked;
      // userLocked tracks intentional user choice — survives refines & Re-apply rules
      return { ...s, locked: newLocked, userLocked: newLocked };
    });
    if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: newSlots });
  };
  const deleteSlot = (idx) => {
    const filtered = roadmap.slots.filter((_, i) => i !== idx);
    const newSlots = rebalanceSlotTimes(filtered, roadmap.slots);
    const shifted = shiftSlotMaps(roadmap, "delete", idx);
    if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: newSlots, ...shifted });
  };
  const addSlot = () => {
    const slots = roadmap.slots || [];
    if (slots.length === 0) {
      const newSlot = { time: "9:00 AM", type: "work", label: "New block", note: "" };
      if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: [newSlot] });
      return;
    }
    // Find the index of the "Wrap & tomorrow prep" / EOD anchor — insert BEFORE it
    // so the new slot doesn't sit past 5 PM and get stripped on the next pipeline run.
    let insertAt = slots.length;
    for (let i = slots.length - 1; i >= 0; i--) {
      const lab = (slots[i].label || "").toLowerCase();
      if ((lab.includes("wrap") && lab.includes("tomorrow")) ||
          lab.includes("close for the day") || lab.includes("close out")) {
        insertAt = i;
      }
    }
    // Compute the new slot's start time as 30 min after the previous slot
    const prevSlot = insertAt > 0 ? slots[insertAt - 1] : null;
    const prevStart = prevSlot ? parseSlotTimeMinutes(prevSlot.time) : 9 * 60 - 30;
    const newTime = formatSlotMinutes(prevStart + 30);
    const newSlot = { time: newTime, type: "work", label: "New block", note: "" };
    const newSlots = [...slots.slice(0, insertAt), newSlot, ...slots.slice(insertAt)];
    // Shift completedSlots / partialSlots / slotReconciliation indices: any
    // persisted index >= insertAt becomes idx+1. Without this, the new slot
    // can inherit a stale "completed" / reconciliation status (the render
    // filter would then HIDE it, making it look like add-slot did nothing).
    const shifted = shiftSlotMaps(roadmap, "insert", insertAt);
    if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: newSlots, ...shifted });
  };
  const cycleSlotType = (idx) => {
    const types = SLOT_TYPES;
    const cur = roadmap.slots[idx].type || "work";
    const next = types[(types.indexOf(cur) + 1) % types.length];
    // Auto-lock — type change is an intentional user action
    const newSlots = roadmap.slots.map((s, i) => i === idx ? { ...s, type: next, locked: true, userLocked: true } : s);
    if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: newSlots });
  };

  // ── Drag handlers ──
  const onDragStart = (e, idx) => {
    setDraggingIdx(idx);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(idx));
    }
  };
  const onDragEnd = () => { setDraggingIdx(null); setDragOverIdx(null); };
  const onDragOverRow = (e, idx) => { e.preventDefault(); setDragOverIdx(idx); };
  const onDropRow = (e, idx) => {
    e.preventDefault();
    if (draggingIdx === null || draggingIdx === idx) { onDragEnd(); return; }
    // Build oldIdx → newIdx mapping based on the move (independent of rebalance,
    // which creates new slot objects and breaks reference/time-based matching).
    const fromIdx = draggingIdx;
    const toIdx = idx;
    const buildIdxMap = (len, from, to) => {
      const map = new Map();
      for (let i = 0; i < len; i++) {
        if (i === from) map.set(i, to);
        else if (from < to) {
          if (i > from && i <= to) map.set(i, i - 1);
          else map.set(i, i);
        } else {
          if (i >= to && i < from) map.set(i, i + 1);
          else map.set(i, i);
        }
      }
      return map;
    };
    const idxMap = buildIdxMap(roadmap.slots.length, fromIdx, toIdx);
    const newSlots = reorderAndRebalanceSlots(roadmap.slots, fromIdx, toIdx);
    const remapped = remapSlotMaps(roadmap, idxMap);
    if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: newSlots, ...remapped });
    onDragEnd();
  };

  // ── Resize: commit a new durationMin for slot idx ──
  // Mirrors the existing endTime-edit commit path (lines ~265-282 above): set
  // the slot's durationMin + lock it, push the next slot's start time. Pipeline
  // (healSlots/canonicalize) absorbs any downstream overlap on the next cycle.
  const resizeSlotDuration = (idx, newDurationMin) => {
    const slot = roadmap.slots[idx];
    if (!slot) return;
    const startMin = parseSlotTimeMinutes(slot.time);
    if (startMin < 0) return;
    const newDuration = Math.max(5, Math.round(newDurationMin / 5) * 5);
    const newEndMin = startMin + newDuration;
    const newSlots = roadmap.slots.map((s, i) => {
      if (i === idx) return { ...s, locked: true, userLocked: true, durationMin: newDuration };
      if (i === idx + 1) return { ...s, time: formatSlotMinutes(newEndMin), locked: true, userLocked: true };
      return s;
    });
    if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: newSlots });
  };

  // ── Compute the currently-effective duration of slot idx (in minutes) ──
  // Used by the resize handle on mousedown to seed its starting duration.
  const getSlotEffectiveDuration = (idx) => {
    const slot = roadmap.slots[idx];
    if (!slot) return null;
    const startMin = parseSlotTimeMinutes(slot.time);
    if (startMin < 0) return null;
    const fixedDur = intendedFixedDuration(slot);
    if (fixedDur != null) return fixedDur;
    const next = roadmap.slots[idx + 1];
    if (next) {
      const nextStart = parseSlotTimeMinutes(next.time);
      if (nextStart > startMin) return nextStart - startMin;
    }
    return slot.durationMin || 30;
  };

  const handleRefine = async () => {
    const feedback = refineInput.trim();
    if (!feedback || refining) return;
    setRefining(true);
    setRefineError("");
    setRefineActions([]);
    try {
      // Run task-tool Rosie + roadmap refine in parallel so the user gets both effects from one input.
      const dataRef = { current: data || { items: [] } };
      const syncedUpdate = (next) => { dataRef.current = next; if (onUpdate) onUpdate(next); };

      const taskToolPrompt = `You are Rosie. Lexy is on her morning roadmap screen and just typed a refinement. Some refinements are PURELY about reshaping the roadmap (move break, swap blocks, add 1:1 prep) — for those, do NOTHING; reply with empty text and call no tools. But if she ALSO mentions task changes ("verafin charter is done", "add to tasks: prep agenda", "I finished X"), call the appropriate tools.

Tools: create_item, add_task_to_item, update_item_status, check_off_task, add_to_parking_lot, catch_spiral.

CRITICAL: Do NOT narrate. Do NOT write [calling X] syntax. Just call the tools that apply, or call NONE if the message is purely about the roadmap. After tools run, return a short confirmation (or empty if no tools were called).`;

      const [refineResult, toolResult] = await Promise.allSettled([
        refineRoadmap(roadmap, (data?.items || []), energy, mood, feedback),
        askRosieWithTools({
          messages: [{ role: "user", content: feedback }],
          systemPrompt: taskToolPrompt,
          getLatestData: () => dataRef.current,
          onDataUpdate: syncedUpdate,
        }),
      ]);

      let didSomething = false;
      // Apply roadmap changes
      if (refineResult.status === "fulfilled" && refineResult.value && onUpdateRoadmap) {
        onUpdateRoadmap(refineResult.value);
        didSomething = true;
      }
      // Surface tool actions
      const actions = toolResult.status === "fulfilled" ? (toolResult.value.actions || []) : [];
      if (actions.length) { setRefineActions(actions); didSomething = true; }

      if (didSomething) {
        setRefineInput("");
      } else {
        setRefineError("Hmm, couldn't quite get that — try rewording?");
      }
    } catch {
      setRefineError("Little glitch — try again? 🌸");
    }
    setRefining(false);
  };

  if (!roadmap) {
    if (roadmapError) {
      // Detect rate-limit / message-quota errors so we can show a clearer
      // explanation than the raw API error string. The signal: the message
      // contains "rate limit" or "message rate" or "quota". For these cases,
      // the user can't actually fix anything by retrying — they need to
      // either wait or reload the artifact.
      const errMsg = roadmapError.message || "";
      const isRateLimit = /rate limit|message rate|quota|too many/i.test(errMsg);
      return (
        <div className="fade" style={{ maxWidth: 560, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🌸</div>
          <p className="cg" style={{ color: "#4a3540", fontSize: 22, fontStyle: "italic", marginBottom: 6 }}>
            {isRateLimit ? "You've used up Claude's API quota for now" : "Hmm, that didn't work"}
          </p>
          <p className="jost" style={{ color: "rgba(74,53,64,0.6)", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
            {isRateLimit
              ? "The artifact runs inside Claude's sandbox, and every Rosie call (roadmaps, chats, parsing) uses a message from your daily quota. Either wait a bit or reload the artifact to start a fresh session — your data is saved. 🌸"
              : errMsg}
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {isRateLimit ? (
              <button
                onClick={() => window.location.reload()}
                className="btn rose jost"
                style={{ fontSize: 12, padding: "8px 18px" }}
              >🔄 Reload artifact</button>
            ) : (
              <button
                onClick={() => roadmapError.retry && roadmapError.retry()}
                className="btn rose jost"
                style={{ fontSize: 12, padding: "8px 18px" }}
              >Try again</button>
            )}
            {onBackToCheckIn && (
              <button
                onClick={onBackToCheckIn}
                className="btn ghost jost"
                style={{ fontSize: 12, padding: "8px 16px" }}
              >Back to check-in</button>
            )}
          </div>
        </div>
      );
    }
    return (
      <div className="fade" style={{ maxWidth: 560, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
        <p className="jost pulse" style={{ color: "rgba(212,130,154,0.5)", fontSize: 14 }}>Rosie is building your roadmap…</p>
      </div>
    );
  }

  return (
    <div className="fade" style={{ maxWidth: 620, margin: "0 auto", padding: "36px 20px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="jost" style={{ fontSize: 10, letterSpacing: 3, color: "rgba(212,130,154,0.7)", textTransform: "uppercase", marginBottom: 8 }}>
          {fmtTimeEST(getNowEST())} · Fort Wayne, IN · Rosie
        </div>
        <h1 className="cg" style={{ fontSize: 38, color: "#4a3540", fontWeight: 400, lineHeight: 1.15, marginBottom: 10 }}>
          {roadmap.headline || "Your day, mapped out"} <span style={{ color: "#d4829a" }}>✦</span>
        </h1>
        <p className="jost" style={{ fontSize: 14, color: "rgba(74,53,64,0.55)", lineHeight: 1.65, maxWidth: 480, margin: "0 auto" }}>
          {roadmap.greeting}
        </p>
      </div>

      {/* Timeline — Timeline+Edit mode always on. Drag blocks to move them,
          drag edges to resize, click empty grid for the inline block-type picker,
          click a slot to open the edit modal. Required breaks (lunch + brain
          breaks) stay anchored with hatched borders. */}
      <div className="card" style={{ padding: "22px 24px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <label className="sl jost">Today's Roadmap</label>
          <span className="jost" style={{ fontSize: 10, color: "rgba(184,109,133,0.65)", fontStyle: "italic" }}>
            ✏️ drag rows to reorder · click time/title to edit
          </span>
        </div>
        {/* Slot list — each slot is a draggable card with an external colored
            dot indicator on the left (cottagecore timeline marker style), card
            background tinted by slot type, top row of meta info + lock/×
            controls, title row, and description row (with "+ note" placeholder
            if empty). Drag rows up/down to reorder. Click time / title / note
            to edit inline. Required breaks can't be dragged or deleted. */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
          {slots.map((slot, idx) => {
            const styleSet = SLOT_COLORS[slot.type] || SLOT_COLORS.work;
            const matchingItem = slot.type === "work" && findMatchingItem ? findMatchingItem(slot.label, slot) : null;
            const isDragging = draggingIdx === idx;
            const isDragOver = dragOverIdx === idx && draggingIdx !== null && draggingIdx !== idx;
            const isLocked = !!slot.locked;
            const isUserLocked = !!slot.userLocked;
            const editingThis = editingSlot && editingSlot.idx === idx;
            const isRequiredBreak = slot.type === "break" && isLocked && !isUserLocked;

            // Compute end time + duration label
            const startMin = parseSlotTimeMinutes(slot.time);
            const next = slots[idx + 1];
            const nextStart = next ? parseSlotTimeMinutes(next.time) : -1;
            const fallbackDur = slot.durationMin || 30;
            let endMin;
            if (nextStart >= 0 && nextStart > startMin) endMin = nextStart;
            else endMin = startMin + fallbackDur;
            const durMin = endMin - startMin;
            const durLabel = durMin >= 60
              ? (durMin % 60 === 0 ? `${durMin / 60}h` : `${Math.floor(durMin / 60)}h ${durMin % 60}m`)
              : `${durMin}m`;

            // Per-type card background — warm cream base, with pink tint for
            // work / blocked and sage tint for break / buffer. Matches the
            // boho/cottagecore palette from the reference images.
            const cardBg = isDragOver
              ? styleSet.bg
              : slot.type === "work"
                ? "linear-gradient(135deg, rgba(252,238,242,0.75), rgba(248,228,234,0.55))"
                : slot.type === "blocked"
                  ? "linear-gradient(135deg, rgba(250,232,236,0.8), rgba(244,218,224,0.6))"
                  : slot.type === "break"
                    ? "linear-gradient(135deg, rgba(247,243,238,0.8), rgba(238,232,224,0.55))"
                    : "linear-gradient(135deg, rgba(252,246,238,0.85), rgba(245,237,224,0.6))"; // buffer / default

            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  gap: 12,
                  opacity: isDragging ? 0.4 : 1,
                  transform: isDragging ? "scale(0.98)" : "none",
                  transition: "all .15s",
                }}
              >
                {/* External dot indicator + vertical guide — sits to the left of
                    the card, like a timeline marker. The dot color reflects slot
                    type so the eye can scan the column quickly. Below the dot,
                    a small reconciliation badge appears when the slot has been
                    explicitly reconciled (done / partial / skipped / elsewhere).
                    Passive at-a-glance signal — no badge means "not reconciled
                    yet" (typical for in-progress and future slots). */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 18, width: 12, flexShrink: 0 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: styleSet.dot, flexShrink: 0,
                    boxShadow: `0 0 0 3px ${styleSet.bg}`,
                  }} />
                  {(() => {
                    const recon = roadmap?.slotReconciliation?.[idx];
                    if (!recon) return null;
                    const conf = RECON_STATUSES[recon.status];
                    if (!conf) return null;
                    const tooltip = recon.status === "elsewhere" && recon.actualWork
                      ? `${conf.label}: ${recon.actualWork}`
                      : recon.status === "partial"
                        ? `${conf.label} (${recon.percent || 50}%)`
                        : conf.label;
                    return (
                      <div
                        title={tooltip}
                        style={{
                          marginTop: 6,
                          fontSize: 11,
                          lineHeight: 1,
                          color: conf.color,
                          cursor: "default",
                          userSelect: "none",
                        }}
                      >{conf.emoji}</div>
                    );
                  })()}
                </div>

                {/* Card body — flex: 1 to take remaining width */}
                <div
                  onDragOver={e => onDragOverRow(e, idx)}
                  onDrop={e => onDropRow(e, idx)}
                  draggable={!isRequiredBreak && !editingThis}
                  onDragStart={(!isRequiredBreak && !editingThis) ? (e => onDragStart(e, idx)) : undefined}
                  onDragEnd={(!isRequiredBreak && !editingThis) ? onDragEnd : undefined}
                  style={{
                    flex: 1,
                    padding: "14px 16px 12px 16px",
                    borderRadius: 12,
                    background: cardBg,
                    border: `1px ${isDragOver ? "dashed" : "solid"} ${isDragOver ? styleSet.dot : "rgba(212,130,154,0.15)"}`,
                    boxShadow: "0 1px 3px rgba(74,53,64,0.04)",
                    cursor: isRequiredBreak ? "default" : (editingThis ? "text" : (isDragging ? "grabbing" : "grab")),
                    position: "relative",
                  }}
                >
                  {/* TOP ROW — drag handle + time range + duration + type pill + linked + spacer + lock + X */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span
                      title={isRequiredBreak ? "Required break — can't reorder" : "Drag to reorder"}
                      className="jost"
                      style={{ color: "rgba(184,109,133,0.45)", fontSize: 14, userSelect: "none", lineHeight: 1, pointerEvents: "none", flexShrink: 0 }}
                    >⋮⋮</span>

                    {/* Start time */}
                    {editingThis && editingSlot.field === "time" ? (
                      <input
                        autoFocus
                        type="text"
                        className="jost"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit(); }}
                        placeholder="9:30 AM"
                        style={{ background: "rgba(255,255,255,0.95)", border: `1px solid ${styleSet.border}`, borderRadius: 5, color: styleSet.color, fontSize: 13, fontWeight: 600, padding: "2px 6px", width: 75, fontVariantNumeric: "tabular-nums", outline: "none", fontFamily: "'Jost', sans-serif" }}
                      />
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingSlot({ idx, field: "time" }); setEditValue(slot.time); }}
                        title="Click to edit start time"
                        className="jost"
                        style={{ background: "none", border: "1px dashed transparent", color: styleSet.color, fontWeight: 700, fontSize: 13, fontVariantNumeric: "tabular-nums", cursor: "pointer", padding: "2px 4px", borderRadius: 5, whiteSpace: "nowrap" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = `${styleSet.color}55`; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; }}
                      >{slot.time.replace(/\s*(AM|PM)$/i, "")}</button>
                    )}
                    <span className="jost" style={{ color: styleSet.color, fontSize: 13, fontWeight: 500, opacity: 0.55 }}>—</span>
                    <span className="jost" style={{ color: styleSet.color, fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                      {endMin >= 0 ? formatSlotMinutes(endMin) : "—"}
                    </span>
                    {editingThis && editingSlot.field === "duration" ? (
                      <input
                        autoFocus
                        type="text"
                        className="jost"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit(); }}
                        placeholder="45"
                        title="Duration in minutes (e.g. 45 or 1h 30m)"
                        style={{ background: "rgba(255,255,255,0.95)", border: `1px solid ${styleSet.border}`, borderRadius: 5, color: styleSet.color, fontSize: 11, fontWeight: 500, padding: "1px 5px", width: 60, fontVariantNumeric: "tabular-nums", outline: "none", fontFamily: "'Jost', sans-serif", marginLeft: 2 }}
                      />
                    ) : isLocked ? (
                      <span className="jost" style={{ color: styleSet.color, fontSize: 11, fontWeight: 500, opacity: 0.55, marginLeft: 2 }}>· {durLabel}</span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingSlot({ idx, field: "duration" }); setEditValue(String(durMin)); }}
                        title="Click to edit duration — extending shifts the rest of the day forward"
                        className="jost"
                        style={{ background: "none", border: "1px dashed transparent", color: styleSet.color, fontSize: 11, fontWeight: 500, opacity: 0.55, cursor: "pointer", padding: "1px 5px", borderRadius: 4, marginLeft: 2, whiteSpace: "nowrap" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = `${styleSet.color}55`; e.currentTarget.style.opacity = 0.85; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.opacity = 0.55; }}
                      >· {durLabel}</button>
                    )}

                    {/* Clickable type pill — cycles through work / break / buffer / blocked */}
                    <button
                      onClick={(e) => { e.stopPropagation(); cycleSlotType(idx); }}
                      title={`Type: ${slot.type}. Click to cycle types.`}
                      className="jost"
                      style={{
                        fontSize: 10, padding: "2px 10px", borderRadius: 12,
                        background: `${styleSet.color}1a`, color: styleSet.color,
                        fontWeight: 600, letterSpacing: 0.3, textTransform: "lowercase",
                        border: `1px solid ${styleSet.color}40`,
                        whiteSpace: "nowrap", cursor: "pointer",
                        transition: "all .15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${styleSet.color}30`; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${styleSet.color}1a`; }}
                    >{slot.type}</button>

                    {/* Spacer — pushes lock + X to the right */}
                    <div style={{ flex: 1, minWidth: 12 }} />

                    {/* Action pill — slot-type-aware. See SlotActionPill above
                        for the per-type rendering and routing. */}
                    <SlotActionPill
                      slot={slot}
                      idx={idx}
                      matchingItem={matchingItem}
                      onFocus={onFocus}
                      onMeetingFocus={onMeetingFocus}
                      onPastMeetingClick={onPastMeetingClick}
                      onStartBreakTimer={onStartBreakTimer}
                      onEditNote={() => { setEditingSlot({ idx, field: "note" }); setEditValue(slot.note || ""); }}
                    />

                    {/* Lock + X buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSlotLock(idx); }}
                        title={
                          isUserLocked ? "You locked this. Click to unlock."
                          : isLocked ? "Auto-locked. Click to override."
                          : "Click to lock so it survives refines"
                        }
                        style={{
                          background: isUserLocked ? "rgba(212,130,154,0.18)" : (isLocked ? "rgba(196,168,130,0.15)" : "rgba(255,255,255,0.5)"),
                          border: `1px solid ${isUserLocked ? "rgba(212,130,154,0.4)" : (isLocked ? "rgba(196,168,130,0.4)" : "rgba(212,130,154,0.18)")}`,
                          borderRadius: 6, padding: "4px 8px", cursor: "pointer",
                          fontSize: 12, lineHeight: 1, opacity: isLocked ? 1 : 0.6,
                        }}
                      >{isUserLocked ? "🔒" : (isLocked ? "🔐" : "🔓")}</button>
                      {!isRequiredBreak && (
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteSlot(idx); }}
                          title="Delete this slot"
                          className="jost"
                          style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(212,130,154,0.18)", borderRadius: 6, color: "rgba(184,109,133,0.6)", cursor: "pointer", fontSize: 14, padding: "2px 9px", lineHeight: 1, fontWeight: 500 }}
                          onMouseEnter={e => { e.currentTarget.style.color = "#c4687a"; e.currentTarget.style.background = "rgba(252,232,237,0.7)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "rgba(184,109,133,0.6)"; e.currentTarget.style.background = "rgba(255,255,255,0.5)"; }}
                        >×</button>
                      )}
                    </div>
                  </div>

                  {/* TITLE ROW — Cormorant Garamond, prominent, clickable to edit */}
                  <div style={{ marginTop: 10 }}>
                    {editingThis && editingSlot.field === "label" ? (
                      <input
                        autoFocus
                        type="text"
                        className="cg"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit(); }}
                        style={{ background: "rgba(255,255,255,0.95)", border: `1px solid ${styleSet.border}`, borderRadius: 6, color: "#4a3540", fontSize: 18, fontWeight: 600, padding: "3px 8px", outline: "none", fontFamily: "'Cormorant Garamond', serif", width: "100%" }}
                      />
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingSlot({ idx, field: "label" }); setEditValue(slot.label); }}
                        title="Click to edit title"
                        className="cg"
                        style={{ background: "none", border: "1px dashed transparent", color: "#4a3540", fontWeight: 600, fontSize: 18, lineHeight: 1.25, cursor: "pointer", padding: "2px 6px", borderRadius: 6, textAlign: "left", fontFamily: "'Cormorant Garamond', serif", width: "100%", transition: "all .15s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(212,130,154,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.3)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "none"; }}
                      >{slot.label}</button>
                    )}
                  </div>

                  {/* DESCRIPTION / NOTE ROW — italic gray. Shows "+ note" placeholder
                      when empty so the user can add one inline. */}
                  <div style={{ marginTop: 2 }}>
                    {editingThis && editingSlot.field === "note" ? (
                      <input
                        autoFocus
                        type="text"
                        className="jost"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit(); }}
                        placeholder="A note for yourself…"
                        style={{ background: "rgba(255,255,255,0.95)", border: `1px solid ${styleSet.border}`, borderRadius: 6, color: "rgba(74,53,64,0.7)", fontSize: 12, fontWeight: 400, padding: "3px 8px", outline: "none", fontStyle: "italic", fontFamily: "'Jost', sans-serif", width: "100%" }}
                      />
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingSlot({ idx, field: "note" }); setEditValue(slot.note || ""); }}
                        title={slot.note ? "Click to edit note" : "Click to add a note"}
                        className="jost"
                        style={{
                          background: "none", border: "1px dashed transparent",
                          color: slot.note ? "rgba(74,53,64,0.55)" : "rgba(184,109,133,0.45)",
                          fontWeight: 400, fontSize: 12, lineHeight: 1.45,
                          cursor: "pointer", padding: "2px 6px", borderRadius: 6,
                          textAlign: "left", fontStyle: "italic",
                          fontFamily: "'Jost', sans-serif", width: "100%",
                          transition: "all .15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(212,130,154,0.2)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; }}
                      >{slot.note || "+ note"}</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* + Add a slot + Reset times — kept for explicit discoverability
            alongside the timeline's click-to-add interaction */}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            onClick={addSlot}
            className="jost"
            style={{ flex: 1, background: "rgba(255,255,255,0.5)", border: "1px dashed rgba(212,130,154,0.3)", borderRadius: 12, padding: "10px 14px", fontSize: 12, color: "rgba(184,109,133,0.7)", cursor: "pointer", textAlign: "center", fontWeight: 500, fontFamily: "'Jost', sans-serif", transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(212,130,154,0.5)"; e.currentTarget.style.color = "#b86d85"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(212,130,154,0.3)"; e.currentTarget.style.color = "rgba(184,109,133,0.7)"; }}
          >+ Add a slot</button>
          <button
            onClick={() => {
              const newSlots = rebalanceSlotTimes(slots, slots);
              if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: newSlots });
            }}
            title="Recalculate times based on natural slot durations (locked slots stay anchored)"
            className="jost"
            style={{ background: "rgba(255,255,255,0.5)", border: "1px dashed rgba(196,168,130,0.3)", borderRadius: 12, padding: "10px 14px", fontSize: 12, color: "rgba(154,120,80,0.75)", cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap", fontFamily: "'Jost', sans-serif", transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(196,168,130,0.5)"; e.currentTarget.style.color = "#9a7850"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(196,168,130,0.3)"; e.currentTarget.style.color = "rgba(154,120,80,0.75)"; }}
          >🔄 Reset times</button>
        </div>

        {/* Slot edit modal — opens when a slot is clicked in the timeline.
            Required breaks (auto-placed lunch + brain breaks) open in
            restrictedBreak mode so time/duration/delete are disabled — only
            the label can be renamed. */}
        {timelineModalIdx !== null && slots[timelineModalIdx] && (() => {
          const s = slots[timelineModalIdx];
          const isRequiredBreakSlot = s.type === "break" && !!s.locked && !s.userLocked;
          return (
            <SlotEditModal
              slot={s}
              idx={timelineModalIdx}
              isComplete={false}
              restrictedBreak={isRequiredBreakSlot}
              onSave={(updated) => {
                if (!onUpdateRoadmap) return;
                const newSlots = slots.map((sl, i) => i === timelineModalIdx ? updated : sl);
                onUpdateRoadmap({ ...roadmap, slots: newSlots });
              }}
              onDelete={() => { deleteSlot(timelineModalIdx); setTimelineModalIdx(null); }}
              onToggleLock={() => toggleSlotLock(timelineModalIdx)}
              onToggleDone={() => {}}
              onClose={() => setTimelineModalIdx(null)}
            />
          );
        })()}
      </div>

      {/* Advice + protected time */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {roadmap.todayAdvice && (
          <div className="card" style={{ padding: "16px 18px", borderColor: `${energyObj.color}30`, background: `${energyObj.color}08` }}>
            <label className="sl jost" style={{ color: `${energyObj.color}99` }}>Today's approach</label>
            <p className="jost" style={{ fontSize: 13, color: "rgba(74,53,64,0.65)", lineHeight: 1.6 }}>{roadmap.todayAdvice}</p>
          </div>
        )}
        {roadmap.protectedTime && (
          <div className="card" style={{ padding: "16px 18px", borderColor: "rgba(196,168,130,0.25)", background: "rgba(196,168,130,0.06)" }}>
            <label className="sl jost" style={{ color: "rgba(180,140,90,0.7)" }}>Protect your energy</label>
            <p className="jost" style={{ fontSize: 13, color: "rgba(74,53,64,0.65)", lineHeight: 1.6 }}>{roadmap.protectedTime}</p>
          </div>
        )}
      </div>

      {/* Refine roadmap (and adjust tasks) with Rosie */}
      {onUpdateRoadmap && (
        <div className="card" style={{ padding: "14px 18px", marginBottom: 14, background: "rgba(232,160,180,0.06)", border: "1px dashed rgba(212,130,154,0.3)" }}>
          <label className="sl jost" style={{ color: "rgba(212,130,154,0.85)" }}>🌸 Tweak with Rosie</label>
          <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.5)", marginBottom: 8, fontStyle: "italic" }}>
            Reshape the day, mark something done, add a task, or capture a thought — Rosie handles all of it.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <textarea
              className="ifield jost"
              rows={2}
              style={{ resize: "none", flex: 1, fontSize: 12 }}
              placeholder='e.g. "verafin charter is done, add a task to prep kickoff agenda", "move break to 11"'
              value={refineInput}
              onChange={e => setRefineInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleRefine(); } }}
              disabled={refining}
            />
            <button
              className="btn rose jost"
              onClick={handleRefine}
              disabled={refining || !refineInput.trim()}
              style={{ padding: "0 14px", fontSize: 13, alignSelf: "stretch", opacity: refining || !refineInput.trim() ? 0.45 : 1 }}
            >{refining ? <span className="pulse">🌸…</span> : "Refine"}</button>
          </div>
          {refineError && <div className="jost" style={{ fontSize: 11, color: "#c4687a", marginTop: 6, fontStyle: "italic" }}>{refineError}</div>}
          {refineActions.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              {refineActions.map((a, i) => (
                <div key={i} className="jost fade" style={{ fontSize: 11, color: "#7a9e78", background: "rgba(158,184,154,0.12)", border: "1px solid rgba(158,184,154,0.25)", borderRadius: 8, padding: "5px 10px" }}>{a}</div>
              ))}
            </div>
          )}
        </div>
      )}

      <button className="btn rose jost" onClick={onContinue} style={{ width: "100%", padding: "14px", fontSize: 15 }}>
        Let's do this ✦
      </button>

      {/* Rosie chat dock — for capturing thoughts, parking, or anything else */}
      {data && onUpdate && (
        <BottomChatDock
          systemPrompt={`You are Rosie — Lexy's warm ADHD/autistic/bipolar-aware work bestie. She's just landed on her morning roadmap screen at Fort Financial Credit Union and might want to talk through her day, capture a thought, or just check in.

Be conversational, brief, and emotionally present. Match her energy ("${energy}", mood: "${mood}"). Today's roadmap: ${(roadmap?.slots || []).map(s => s.time + " " + s.label).join(" → ")}.

If she wants to RESHAPE the roadmap (swap blocks, move a break, add a slot, change the order, "make my afternoon X"), DO NOT just chat — give her this exact instruction in your reply:

> 🌸 "For roadmap changes, scroll up to the **'🌸 Tweak with Rosie'** box right above this chat. Drop your request there ('${"add 30min for verafin at 2pm" /* example */}', etc.) and click **Refine**. That's the box that actually edits the timeline."

(Use her actual phrasing as the example, not literally "verafin at 2pm".) Be warm but explicit — she needs to know this chat can't move blocks; only the Tweak box can.

Same goes for "+ Add a slot" — point her to the inline button at the bottom of the timeline if she wants to add a one-off block manually.

TOOLS — YOU HAVE REAL TOOLS WIRED UP. WHEN SHE ASKS FOR AN ACTION, USE THEM.
- create_item — brand-new top-level work item
- add_task_to_item — NEW subtask under EXISTING item (match parent by partial title)
- add_to_parking_lot — quick thoughts to defer
- catch_spiral — a hyperfocus rabbit hole
- check_off_task — mark a subtask done
- update_item_status — change status

CRITICAL: DO NOT write fake tool-call syntax like [calling X: ...] in your text. The tool framework handles invocation — just USE the tool, don't narrate it. Brief warm confirmation after.

Keep replies short. She's about to start her day — don't slow her down.`}
          placeholder="Ask Rosie or capture a thought..."
          subtitle="Talk through your day. 🌸"
          greeting="Morning! 🌸 Anything on your mind before we dive in?"
          data={data}
          onDataUpdate={onUpdate}
        />
      )}
    </div>
  );
}

// SlotEditModal — appears when a slot is clicked in TimelineView. Lets the
// user edit label/type/time/duration, toggle lock, mark done, or delete the
// slot. Edits are committed via callbacks to the parent (RoadmapCard) which
// flows through canonicalizeSlots/healSlots, so corrupted state can't survive.
function SlotEditModal({ slot, idx, onSave, onDelete, onToggleLock, onToggleDone, onClose, isComplete, restrictedBreak = false }) {
  const [label, setLabel] = useState(slot?.label || "");
  const [time, setTime] = useState(slot?.time || "");
  const [type, setType] = useState(slot?.type || "work");
  const [durationMin, setDurationMin] = useState(() => {
    if (typeof slot?.durationMin === "number" && slot.durationMin > 0) return String(slot.durationMin);
    const fd = intendedFixedDuration(slot);
    return fd != null ? String(fd) : "30";
  });

  if (!slot) return null;
  const isLocked = !!slot.locked;
  const isUserLocked = !!slot.userLocked;

  const commit = () => {
    if (restrictedBreak) {
      // Required break: only the label is editable. Preserve original time,
      // type, duration, and the system lock (NOT userLocked — that would
      // promote it to user-locked and bypass ensureRequiredBreaks's auto-relocation).
      onSave({
        ...slot,
        label: label.trim() || slot.label,
      });
      onClose();
      return;
    }
    const parsedTime = parseSlotTimeMinutes(time);
    if (parsedTime < 0) {
      // Invalid time — don't save, but don't crash; just close
      onClose();
      return;
    }
    const cleanTime = formatSlotMinutes(parsedTime);
    const dur = Math.max(5, Math.min(480, parseInt(durationMin, 10) || 30));
    onSave({
      ...slot,
      label: label.trim() || slot.label,
      time: cleanTime,
      type,
      durationMin: dur,
      userLocked: true,
      locked: true,
    });
    onClose();
  };

  return (
    <div
      className="modal-bg"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(74,53,64,0.35)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div className="modal fade" style={{
        background: "#fffaf7", padding: 22, borderRadius: 14, maxWidth: 420, width: "92vw",
        boxShadow: "0 10px 40px rgba(74,53,64,0.18)",
        border: "1px solid rgba(212,130,154,0.2)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 className="cg" style={{ fontSize: 17, color: "#4a3540", margin: 0, fontWeight: 600 }}>
            {restrictedBreak ? "🔒 Required break" : "Edit slot"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(74,53,64,0.45)", cursor: "pointer", fontSize: 22, padding: 0, lineHeight: 1 }}>×</button>
        </div>

        {restrictedBreak && (
          <div className="jost" style={{
            background: "rgba(158,184,154,0.12)",
            border: "1px solid rgba(158,184,154,0.3)",
            borderRadius: 8, padding: "8px 12px", marginBottom: 12,
            fontSize: 11, color: "#5e7a5c", lineHeight: 1.5,
          }}>
            This break is auto-placed and locked. You can rename it, but it can't be moved, resized, or deleted — it'll come back. (Lunch + 2 brain breaks per day.)
          </div>
        )}

        {/* Type pills — hidden in restrictedBreak mode (it's a break, full stop) */}
        {!restrictedBreak && (
        <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
          {[
            { val: "work", label: "🌿 Work" },
            { val: "break", label: "☕ Break" },
            { val: "buffer", label: "🪞 Buffer" },
            { val: "meeting", label: "🌸 Meeting" },
            { val: "blocked", label: "🚫 Blocked" },
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => setType(opt.val)}
              className="jost"
              style={{
                background: type === opt.val ? "rgba(212,130,154,0.18)" : "rgba(255,255,255,0.6)",
                border: type === opt.val ? "1px solid rgba(212,130,154,0.5)" : "1px solid rgba(212,130,154,0.15)",
                color: type === opt.val ? "#b86d85" : "rgba(74,53,64,0.65)",
                fontSize: 10, padding: "4px 9px", borderRadius: 6, cursor: "pointer", fontWeight: 600,
              }}
            >{opt.label}</button>
          ))}
        </div>
        )}

        <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", letterSpacing: 0.4, fontWeight: 600, marginBottom: 4, display: "block", textTransform: "uppercase" }}>Label</label>
        <input
          className="ifield jost"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") onClose(); }}
          autoFocus
          style={{ fontSize: 13, padding: "8px 11px", marginBottom: 10 }}
        />

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 2 }}>
            <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", letterSpacing: 0.4, fontWeight: 600, marginBottom: 4, display: "block", textTransform: "uppercase" }}>Start time</label>
            <input
              className="ifield jost"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") onClose(); }}
              placeholder="9:30 AM"
              disabled={restrictedBreak}
              title={restrictedBreak ? "Required breaks can't be retimed" : undefined}
              style={{ fontSize: 12, padding: "7px 10px", opacity: restrictedBreak ? 0.5 : 1, cursor: restrictedBreak ? "not-allowed" : "text" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", letterSpacing: 0.4, fontWeight: 600, marginBottom: 4, display: "block", textTransform: "uppercase" }}>Duration</label>
            <input
              className="ifield jost"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") onClose(); }}
              placeholder="30"
              type="number"
              disabled={restrictedBreak}
              title={restrictedBreak ? "Required breaks can't be resized" : undefined}
              style={{ fontSize: 12, padding: "7px 10px", opacity: restrictedBreak ? 0.5 : 1, cursor: restrictedBreak ? "not-allowed" : "text" }}
            />
          </div>
        </div>

        {/* Action row — restrictedBreak hides lock toggle (always locked) and
            delete (can't be deleted). Mark-done stays available so you can
            still check off "yep, took my brain break". */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {!restrictedBreak && (
          <button
            onClick={() => { onToggleLock(); onClose(); }}
            className="jost"
            title={isLocked ? "Unlock this slot" : "Lock this slot"}
            style={{
              background: isLocked ? "rgba(212,130,154,0.12)" : "rgba(255,255,255,0.6)",
              border: "1px solid " + (isLocked ? "rgba(212,130,154,0.4)" : "rgba(212,130,154,0.18)"),
              color: isLocked ? "#b86d85" : "rgba(74,53,64,0.55)",
              fontSize: 11, padding: "6px 12px", borderRadius: 7, cursor: "pointer", fontWeight: 500,
            }}
          >{isLocked ? "🔒 Locked" : "🔓 Unlocked"}</button>
          )}
          <button
            onClick={() => { onToggleDone(); onClose(); }}
            className="jost"
            style={{
              background: isComplete ? "rgba(158,184,154,0.18)" : "rgba(255,255,255,0.6)",
              border: "1px solid " + (isComplete ? "rgba(158,184,154,0.4)" : "rgba(158,184,154,0.18)"),
              color: isComplete ? "#7a9e78" : "rgba(74,53,64,0.55)",
              fontSize: 11, padding: "6px 12px", borderRadius: 7, cursor: "pointer", fontWeight: 500,
            }}
          >{isComplete ? "✓ Completed" : "○ Mark done"}</button>
          <div style={{ flex: 1 }} />
          {!restrictedBreak && (
          <button
            onClick={() => { onDelete(); onClose(); }}
            className="jost"
            style={{
              background: "rgba(196,104,122,0.08)", border: "1px solid rgba(196,104,122,0.25)",
              color: "#c4687a", fontSize: 11, padding: "6px 12px", borderRadius: 7, cursor: "pointer", fontWeight: 500,
            }}
          >🗑️ Delete</button>
          )}
        </div>

        {/* Save / Cancel row */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            className="jost"
            style={{ background: "none", border: "1px solid rgba(74,53,64,0.15)", color: "rgba(74,53,64,0.55)", cursor: "pointer", fontSize: 12, padding: "7px 14px", borderRadius: 7 }}
          >Cancel</button>
          <button
            onClick={commit}
            className="jost"
            style={{
              background: "linear-gradient(135deg, rgba(232,160,180,0.32), rgba(212,130,154,0.28))",
              border: "1px solid rgba(212,130,154,0.5)",
              color: "#b86d85",
              cursor: "pointer", fontSize: 12, padding: "7px 18px", borderRadius: 7, fontWeight: 600,
            }}
          >Save</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LINK PICKER — shared "✨ next up" pill + re-link dropdown.
// ─────────────────────────────────────────────────────────────────────────────
// Extracted from RoadmapCard's list view (the only live implementation; the
// copy of linkPickerForSlot that used to live in TimelineView was never wired
// to any UI and has been removed). Stateless — the parent owns which slot's
// picker is open (linkPickerForSlot) and passes `open` + onOpen/onClose.
//
// Props:
//   matchingItem: item — the currently linked work item (required to render)
//   items: array — all items, filtered here to active + not-already-linked
//   open: bool — whether this slot's dropdown is showing
//   onOpen / onClose: () => void
//   onFocus: (item) => void — jump to FocusView for the linked item
//   onSetMatch: (overrideId) => void — null = auto-detect by keywords,
//     "__none__" = explicit unlink, otherwise an item id. Parent writes this
//     to slot.matchOverrideItemId.
//   onConvertSlot: ({ type, label }) => void — rewrite the slot to a canonical
//     non-work block (lunch / break / buffer). Parent must also clear
//     matchOverrideItemId so no stale "next up" pill survives the change.

// Conversion map for the "Or change this slot to" optgroup. Values are
// canonical type+label strings the pill-detection helpers (isLunchSlot,
// isBrainBreakSlot, etc. around line 903-921) match on.
const LINK_PICKER_SLOT_CONVERSIONS = {
  "__convert_lunch__":   { type: "break",  label: "Lunch" },
  "__convert_break__":   { type: "break",  label: "Brain break" },
  "__convert_settle__":  { type: "buffer", label: "Morning buffer & settle in" },
  "__convert_prep__":    { type: "buffer", label: "Prep for today's meetings" },
  "__convert_close__":   { type: "buffer", label: "Close for the day" },
  "__convert_wrap__":    { type: "buffer", label: "Wrap & tomorrow prep" },
};

function LinkPicker({ matchingItem, items, open, onOpen, onClose, onFocus, onSetMatch, onConvertSlot }) {
  if (!matchingItem) return null;

  if (open) {
    return (
      <select
        autoFocus
        value=""
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          e.stopPropagation();
          const v = e.target.value;
          if (v === "__focus__") { if (onFocus) onFocus(matchingItem); }
          else if (v === "__auto__") { if (onSetMatch) onSetMatch(null); }
          else if (v === "__none__") { if (onSetMatch) onSetMatch("__none__"); }
          else if (LINK_PICKER_SLOT_CONVERSIONS[v]) { if (onConvertSlot) onConvertSlot(LINK_PICKER_SLOT_CONVERSIONS[v]); }
          else if (v) { if (onSetMatch) onSetMatch(v); }
          if (onClose) onClose();
        }}
        onBlur={() => onClose && onClose()}
        className="jost"
        style={{ background: "rgba(212,130,154,0.1)", border: "1px solid rgba(212,130,154,0.45)", color: "#b86d85", fontSize: 11, padding: "3px 8px", borderRadius: 7, fontWeight: 500, maxWidth: 240, fontFamily: "'Jost', sans-serif", outline: "none", cursor: "pointer" }}
      >
        <option value="">— pick —</option>
        <option value="__focus__">→ Focus on {matchingItem.title}</option>
        <option value="__auto__">🔗 Auto-detect by keywords</option>
        <option value="__none__">✗ No match (unlink)</option>
        <optgroup label="Link to a different item">
          {(items || []).filter(it => it.status !== "done" && it.status !== "cancelled" && it.id !== matchingItem.id).map(it => (
            <option key={it.id} value={it.id}>{it.title}</option>
          ))}
        </optgroup>
        <optgroup label="Or change this slot to">
          <option value="__convert_lunch__">🍽️ Lunch (eat something good)</option>
          <option value="__convert_break__">🌿 Brain break (stretch & reset)</option>
          <option value="__convert_settle__">🌅 Settle in (morning buffer)</option>
          <option value="__convert_prep__">🌸 Daily prep (prep for today's meetings)</option>
          <option value="__convert_wrap__">🌙 Wrap & prep tomorrow</option>
          <option value="__convert_close__">🌙 Close for the day</option>
        </optgroup>
      </select>
    );
  }

  const shortTitle = (matchingItem.title || "").split(" ").slice(0, 4).join(" ");
  const truncated = shortTitle.length > 28 ? shortTitle.slice(0, 25) + "..." : shortTitle;
  return (
    <span style={{ display: "inline-flex", flexShrink: 0 }}>
      <button
        onClick={(e) => { e.stopPropagation(); if (onFocus) onFocus(matchingItem); }}
        title={`Focus on "${matchingItem.title}"`}
        className="jost"
        style={{ background: "rgba(212,130,154,0.1)", border: "1px solid rgba(212,130,154,0.35)", borderRight: "none", color: "#b86d85", fontSize: 10, padding: "3px 9px", cursor: "pointer", borderRadius: "7px 0 0 7px", fontWeight: 500, whiteSpace: "nowrap", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}
      >✨ next up: {truncated}</button>
      <button
        onClick={(e) => { e.stopPropagation(); if (onOpen) onOpen(); }}
        title="Change which item this slot links to"
        className="jost"
        style={{ background: "rgba(212,130,154,0.1)", border: "1px solid rgba(212,130,154,0.35)", color: "#b86d85", fontSize: 10, padding: "3px 7px", cursor: "pointer", borderRadius: "0 7px 7px 0", fontWeight: 700, lineHeight: 1 }}
      >▾</button>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TIMELINE VIEW — vertical scheduler-style render of the day's slots.
// ─────────────────────────────────────────────────────────────────────────────
// Slots are positioned absolutely on a vertical hour grid. Position IS time —
// you can't have an "11:30 slot rendering above a 9:45 slot" because vertical
// position is computed from slot.time directly. Conflicts (overlapping times)
// are visually obvious as side-by-side blocks with red outlines.
//
// Props:
//   slots: array — the canonical slots
//   currentMin: number — current time in minutes (for the "now" line)
//   completedSlots: Set<number> — indices that are completed
//   currentIdx: number — the active slot index (for "you're here" highlight)
//   findMatchingItem: (label) => item | null
//   onClickSlot: (idx) => void — open edit drawer
//   onToggleLock: (idx) => void
//   onDelete: (idx) => void
//   onToggleDone: (idx) => void
//   onAddSlotAtMinute: (startMin) => void — click empty space
//   onSlotMove: (idx, newStartMin) => void — drag to move
//   onSlotResize: (idx, newDurationMin) => void — drag bottom edge
function TimelineView({
  slots, currentMin, completedSlots, currentIdx,
  findMatchingItem, onClickSlot, onToggleLock, onDelete, onToggleDone,
  onAddSlotAtMinute, onSlotMove, onSlotResize, onFocusItem,
  onPastMeetingClick, // routes past-meeting pill clicks to Meetings History
  mode = "execute", // "execute" (default — running your day) | "edit" (Outlook-style shaping mode)
}) {
  const isEditMode = mode === "edit";
  // Drag state — a single drag at a time. Tracks which slot is being modified
  // and what kind of drag (move vs resize). A pixel-anchored start position
  // converts mouse Y → minutes via PX_PER_MIN.
  const [drag, setDrag] = useState(null);
  // Inline block-type picker — only used in edit mode. When the user clicks
  // empty grid space, instead of immediately adding a "Work" block we show a
  // tiny floating menu so they can pick the type. { x, y, startMin } | null.
  const [picker, setPicker] = useState(null);
  // { kind: "move"|"resize", idx: number, startY: number, originalStartMin: number, originalDurationMin: number, currentDeltaMin: number }
  const containerRef = useRef(null);

  // Snap to 5-min increments — keeps the schedule clean
  const snap = (m) => Math.round(m / 5) * 5;
  // Day bounds: 7 AM → 6 PM (660 min). Auto-extend if any slot lies outside.
  const allTimes = (slots || []).map(s => parseSlotTimeMinutes(s.time)).filter(t => t >= 0);
  const allEnds = (slots || []).map(s => {
    const start = parseSlotTimeMinutes(s.time);
    const dur = (typeof s.durationMin === "number" && s.durationMin > 0) ? s.durationMin : (intendedFixedDuration(s) ?? 30);
    return start >= 0 ? start + dur : -1;
  }).filter(t => t >= 0);
  const minSlot = allTimes.length ? Math.min(...allTimes) : 7 * 60;
  const maxSlot = allEnds.length ? Math.max(...allEnds) : 18 * 60;
  // Round to whole hours, with reasonable defaults
  const dayStart = Math.min(7 * 60, Math.floor(minSlot / 60) * 60);
  const dayEnd = Math.max(18 * 60, Math.ceil(maxSlot / 60) * 60);
  const totalMin = dayEnd - dayStart;
  const PX_PER_MIN = 1.6; // 96px per hour
  const totalHeight = totalMin * PX_PER_MIN;

  // Compute slot positions and assign lanes for conflict resolution
  const positioned = useMemo(() => {
    const items = (slots || []).map((slot, idx) => {
      const startMin = parseSlotTimeMinutes(slot.time);
      let dur = (typeof slot.durationMin === "number" && slot.durationMin > 0)
        ? slot.durationMin
        : intendedFixedDuration(slot);
      // For flexible slots without fixed duration, use gap-to-next from sorted order
      if (dur == null) {
        // Look for the next slot chronologically (not by array index — slots may
        // not be sorted; but if heal ran, they should be)
        const sortedSlots = [...slots].sort((a, b) => parseSlotTimeMinutes(a.time) - parseSlotTimeMinutes(b.time));
        const myIdx = sortedSlots.findIndex(s => s === slot);
        const nextSlot = myIdx >= 0 && myIdx + 1 < sortedSlots.length ? sortedSlots[myIdx + 1] : null;
        const nextStart = nextSlot ? parseSlotTimeMinutes(nextSlot.time) : -1;
        dur = (nextStart > startMin) ? Math.min(nextStart - startMin, 4 * 60) : 30;
      }
      return { slot, idx, startMin, durationMin: dur, endMin: startMin + dur, lane: 0, totalLanes: 1 };
    }).filter(p => p.startMin >= 0);

    // Sort by start time for lane assignment (tiebreak by original idx)
    const sorted = [...items].sort((a, b) => a.startMin - b.startMin || a.idx - b.idx);
    // Greedy lane assignment — each slot goes into the lowest-numbered lane
    // that doesn't overlap with any prior slot in that lane.
    const lanes = []; // array of { endMin: number, items: [] }
    for (const p of sorted) {
      let placed = false;
      for (let li = 0; li < lanes.length; li++) {
        if (lanes[li].endMin <= p.startMin) {
          lanes[li].endMin = p.endMin;
          lanes[li].items.push(p);
          p.lane = li;
          placed = true;
          break;
        }
      }
      if (!placed) {
        lanes.push({ endMin: p.endMin, items: [p] });
        p.lane = lanes.length - 1;
      }
    }
    // Total lanes = max + 1
    const totalLanes = Math.max(1, lanes.length);
    sorted.forEach(p => { p.totalLanes = totalLanes; });
    return sorted;
  }, [slots]);

  const conflictCount = positioned.length > 0 && positioned[0].totalLanes > 1
    ? positioned.filter(p => p.totalLanes > 1).length
    : 0;
  const hasConflicts = positioned.length > 0 && positioned[0].totalLanes > 1;

  // Hour rows
  const hours = [];
  for (let h = dayStart; h <= dayEnd; h += 60) hours.push(h);

  // "Now" indicator
  const showNow = currentMin >= dayStart && currentMin <= dayEnd;
  const nowTop = (currentMin - dayStart) * PX_PER_MIN;

  const HOUR_LABEL_WIDTH = 56;

  // Click handler for empty space — add a slot at the clicked time.
  // In execute mode: immediately calls onAddSlotAtMinute (defaults to "Work").
  // In edit mode: opens a small inline picker so the user can choose the
  // block type before adding (Work / Meeting / Break / Buffer).
  const handleTimelineClick = (e) => {
    if (!onAddSlotAtMinute) return;
    if (drag) return; // suppress click during/after drag
    // If picker is open, a click on the bg should close it (handled in picker render below)
    if (picker) { setPicker(null); return; }
    // Only fire if clicking the timeline itself, not a slot block
    if (e.target.dataset.timelineBg !== "true") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minutes = dayStart + Math.round(y / PX_PER_MIN / 5) * 5; // snap to 5 min
    if (isEditMode) {
      // Position the picker near the click. y is relative to the timeline container.
      setPicker({ x: e.clientX - rect.left, y, startMin: minutes });
    } else {
      onAddSlotAtMinute(minutes);
    }
  };

  // ── Drag handling ──
  // Mouse-based drag for moving and resizing slots. Uses document-level
  // listeners so the drag continues if the cursor leaves the slot block
  // (typical for fast drags). Drag state holds: kind, slot idx, mouse start
  // Y in pixels, slot's original start/duration in minutes, current delta.
  // Commits on mouseup via onSlotMove/onSlotResize callbacks. Snaps to 5min.
  const startMove = (e, p) => {
    // Only left mouse button. Skip if locked (locked slots shouldn't move via drag)
    if (e.button !== 0) return;
    if (p.slot.locked) return; // locked slots don't move via drag
    e.preventDefault();
    e.stopPropagation();
    setDrag({
      kind: "move", idx: p.idx,
      startY: e.clientY, originalStartMin: p.startMin, originalDurationMin: p.durationMin,
      currentDeltaMin: 0,
    });
  };
  const startResize = (e, p) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setDrag({
      kind: "resize", idx: p.idx,
      startY: e.clientY, originalStartMin: p.startMin, originalDurationMin: p.durationMin,
      currentDeltaMin: 0,
    });
  };
  // Resize from the TOP — adjusts start time AND duration so end stays put.
  // (Inverse of resize-from-bottom which extends end time.)
  const startResizeTop = (e, p) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setDrag({
      kind: "resizeTop", idx: p.idx,
      startY: e.clientY, originalStartMin: p.startMin, originalDurationMin: p.durationMin,
      currentDeltaMin: 0,
    });
  };

  // Document-level mouse handlers — active while dragging.
  useEffect(() => {
    if (!drag) return;
    const onMove = (e) => {
      const dy = e.clientY - drag.startY;
      const deltaMin = snap(dy / PX_PER_MIN);
      setDrag(d => d ? { ...d, currentDeltaMin: deltaMin } : null);
    };
    const onUp = () => {
      // Commit the drag.
      const slot = (slots || [])[drag.idx];
      if (slot) {
        if (drag.kind === "move") {
          const newStartMin = Math.max(0, drag.originalStartMin + drag.currentDeltaMin);
          if (newStartMin !== drag.originalStartMin && onSlotMove) {
            onSlotMove(drag.idx, newStartMin);
          }
        } else if (drag.kind === "resize") {
          // Bottom-edge resize: change duration, keep start fixed
          const newDur = Math.max(5, drag.originalDurationMin + drag.currentDeltaMin);
          if (newDur !== drag.originalDurationMin && onSlotResize) {
            onSlotResize(drag.idx, newDur);
          }
        } else if (drag.kind === "resizeTop") {
          // Top-edge resize: change start AND duration so end stays put.
          // delta > 0 = handle moved DOWN = later start = SHORTER duration.
          // delta < 0 = handle moved UP = earlier start = LONGER duration.
          const delta = drag.currentDeltaMin;
          const newStartMin = Math.max(0, drag.originalStartMin + delta);
          const newDur = Math.max(5, drag.originalDurationMin - delta);
          if (newStartMin !== drag.originalStartMin && onSlotMove) {
            onSlotMove(drag.idx, newStartMin);
          }
          if (newDur !== drag.originalDurationMin && onSlotResize) {
            onSlotResize(drag.idx, newDur);
          }
        }
      }
      setTimeout(() => setDrag(null), 50);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag?.kind, drag?.idx]);

  return (
    <div style={{ marginTop: 10, marginBottom: 14 }}>
      {/* Conflict warning banner — only shown if any blocks actually overlap */}
      {hasConflicts && (
        <div className="jost" style={{ background: "rgba(212,100,120,0.08)", border: "1px solid rgba(212,100,120,0.3)", borderRadius: 8, padding: "6px 10px", marginBottom: 8, fontSize: 11, color: "#c4687a", display: "flex", alignItems: "center", gap: 6 }}>
          <span>⚠️</span>
          <span>{conflictCount} slot{conflictCount !== 1 ? "s" : ""} overlap{conflictCount === 1 ? "s" : ""} — they're shown side-by-side. Drag to move, or click to edit.</span>
        </div>
      )}

      {/* Timeline container */}
      <div
        onClick={handleTimelineClick}
        style={{
          position: "relative",
          height: totalHeight,
          background: "rgba(255,250,247,0.5)",
          border: "1px solid rgba(212,130,154,0.12)",
          borderRadius: 10,
          overflow: "hidden",
        }}
        data-timeline-bg="true"
        data-edit-mode={isEditMode ? "true" : "false"}
      >
        {/* Hour grid lines + labels */}
        {hours.map(h => {
          const top = (h - dayStart) * PX_PER_MIN;
          const isHourLabel = h % 60 === 0;
          const labelText = formatSlotMinutes(h);
          return (
            <div
              key={h}
              data-timeline-bg="true"
              style={{
                position: "absolute", left: 0, right: 0, top: top,
                height: 1, background: "rgba(212,130,154,0.1)",
                pointerEvents: "none",
              }}
            >
              {isHourLabel && (
                <span
                  className="jost"
                  data-timeline-bg="true"
                  style={{
                    position: "absolute", left: 6, top: -7,
                    fontSize: 9, color: "rgba(184,109,133,0.55)",
                    fontWeight: 600, letterSpacing: 0.3,
                    background: "rgba(255,250,247,0.9)", padding: "0 4px",
                    pointerEvents: "none",
                  }}
                >{labelText}</span>
              )}
            </div>
          );
        })}

        {/* Half-hour grid lines (lighter) */}
        {hours.slice(0, -1).map(h => {
          const top = (h - dayStart + 30) * PX_PER_MIN;
          return (
            <div key={`half-${h}`} data-timeline-bg="true" style={{
              position: "absolute", left: HOUR_LABEL_WIDTH, right: 0, top: top,
              height: 1, background: "rgba(212,130,154,0.04)",
              pointerEvents: "none",
            }} />
          );
        })}

        {/* "Now" line — current time indicator */}
        {showNow && (
          <div data-timeline-bg="true" style={{
            position: "absolute", left: HOUR_LABEL_WIDTH - 4, right: 0, top: nowTop,
            height: 2, background: "rgba(212,130,154,0.7)",
            pointerEvents: "none", zIndex: 5,
            boxShadow: "0 0 8px rgba(212,130,154,0.4)",
          }}>
            <span className="jost" style={{
              position: "absolute", left: -52, top: -6,
              fontSize: 9, fontWeight: 700, color: "#b86d85",
              background: "#fff", padding: "1px 4px", borderRadius: 3,
              border: "1px solid rgba(212,130,154,0.5)",
            }}>now</span>
          </div>
        )}

        {/* Slot blocks */}
        {positioned.map((p) => {
          const slot = p.slot;
          const styleSet = SLOT_COLORS[slot.type] || SLOT_COLORS.work;
          const isCurrent = p.idx === currentIdx;
          const isComplete = completedSlots && completedSlots.has(p.idx);
          const isLocked = !!slot.locked;
          const isUserLocked = !!slot.userLocked;
          const matchingItem = slot.type === "work" && findMatchingItem ? findMatchingItem(slot.label, slot) : null;
          const inConflict = p.totalLanes > 1;

          // Position calculations
          const top = (p.startMin - dayStart) * PX_PER_MIN;
          const height = Math.max(p.durationMin * PX_PER_MIN, 28); // min 28px so very short slots are clickable
          // Width split for conflicts
          const laneWidth = `calc((100% - ${HOUR_LABEL_WIDTH}px - 8px) / ${p.totalLanes})`;
          const leftPx = `calc(${HOUR_LABEL_WIDTH}px + 4px + ${p.lane} * ((100% - ${HOUR_LABEL_WIDTH}px - 8px) / ${p.totalLanes}))`;

          // Apply live drag offset to top/height so the block visibly moves/resizes during drag
          const isBeingDragged = drag && drag.idx === p.idx;
          let dragTopOffset = 0;
          let dragHeightDelta = 0;
          if (isBeingDragged) {
            if (drag.kind === "move") dragTopOffset = drag.currentDeltaMin * PX_PER_MIN;
            else if (drag.kind === "resize") dragHeightDelta = drag.currentDeltaMin * PX_PER_MIN;
          }

          // A "required break" is one auto-placed by ensureRequiredBreaks (lunch +
          // 2 brain breaks). They have locked:true but NOT userLocked:true. In
          // edit mode these get a distinct visual treatment and reduced editing.
          const isRequiredBreak = slot.type === "break" && isLocked && !isUserLocked;

          return (
            <div
              key={`slot-${p.idx}`}
              className={`timeline-slot${isBeingDragged ? " dragging" : ""}`}
              data-slot-type={slot.type}
              data-slot-locked={isLocked ? "true" : "false"}
              data-required-break={isRequiredBreak ? "true" : "false"}
              onMouseDown={(e) => {
                // Start drag-to-move on mousedown anywhere in the block (except resize handle).
                // The click handler above is suppressed during drag via the `drag` state check.
                if (e.target.dataset.resizeHandle === "true") return;
                if (slot.locked) return; // can't drag-move locked slots
                startMove(e, p);
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Suppress click that follows a drag (mouseup re-fires click in some browsers)
                if (drag) return;
                if (onClickSlot) onClickSlot(p.idx);
              }}
              style={{
                position: "absolute",
                top: top + 1 + dragTopOffset,
                left: leftPx,
                width: laneWidth,
                height: Math.max(28, height - 2 + dragHeightDelta),
                background: isComplete ? "rgba(158,184,154,0.18)" : styleSet.bg,
                border: `${inConflict ? 2 : 1}px solid ${inConflict ? "#c4687a" : (isCurrent ? styleSet.color : (isLocked ? styleSet.color : "rgba(212,130,154,0.18)"))}`,
                borderRadius: 7,
                padding: height > 40 ? "5px 8px" : "2px 6px",
                cursor: slot.locked ? "pointer" : (isBeingDragged ? "grabbing" : "grab"),
                opacity: isComplete ? 0.6 : (p.startMin + p.durationMin < currentMin ? 0.7 : 1),
                overflow: "hidden",
                boxShadow: isBeingDragged
                  ? `0 4px 16px rgba(212,130,154,0.4), 0 0 0 2px ${styleSet.color}80`
                  : (isCurrent ? `0 0 0 2px ${styleSet.color}40` : "none"),
                transition: isBeingDragged ? "none" : "background 0.15s, border-color 0.15s",
                zIndex: isBeingDragged ? 10 : (isCurrent ? 3 : (inConflict ? 2 : 1)),
                userSelect: "none",
              }}
              onMouseEnter={(e) => { if (!drag) e.currentTarget.style.filter = "brightness(1.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
              title={
                isBeingDragged
                  ? (drag.kind === "move"
                      ? `Moving to ${formatSlotMinutes(p.startMin + drag.currentDeltaMin)}…`
                      : `Resizing to ${Math.max(5, p.durationMin + drag.currentDeltaMin)} min…`)
                  : `${slot.label} · ${formatSlotMinutes(p.startMin)} – ${formatSlotMinutes(p.endMin)}${slot.locked ? " · 🔒 locked (click to edit)" : " · drag to move, drag bottom to resize"}${inConflict ? " · ⚠️ overlaps another slot" : ""}`
              }
            >
              {/* Header row: time + type pill + lock + delete */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: height > 50 ? 2 : 0 }}>
                <span className="jost" style={{
                  fontSize: 9, fontWeight: 600, color: styleSet.color,
                  fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap",
                }}>
                  {formatSlotMinutes(p.startMin)}{height > 60 ? ` – ${formatSlotMinutes(p.endMin)}` : ""}
                </span>
                <span className="jost" style={{
                  fontSize: 8, padding: "1px 5px", borderRadius: 4,
                  background: `${styleSet.color}20`, color: styleSet.color,
                  letterSpacing: 0.3, textTransform: "uppercase", fontWeight: 600,
                  whiteSpace: "nowrap",
                }}>{slot.type}</span>
                <div style={{ flex: 1 }} />
                {isLocked && (
                  <span title={isUserLocked ? "You locked this" : "Auto-locked"} style={{ fontSize: 9, opacity: isUserLocked ? 1 : 0.55 }}>🔒</span>
                )}
              </div>
              {/* Label */}
              <div className="cg" style={{
                fontSize: height > 50 ? 13 : 11, fontWeight: 600, color: "#4a3540",
                lineHeight: 1.2,
                textDecoration: isComplete ? "line-through" : "none",
                overflow: "hidden", textOverflow: "ellipsis",
                whiteSpace: height > 60 ? "normal" : "nowrap",
                display: "-webkit-box", WebkitLineClamp: height > 80 ? 3 : (height > 50 ? 2 : 1),
                WebkitBoxOrient: "vertical",
              }}>{slot.label}</div>
              {/* Linked item indicator (only if there's room) */}
              {matchingItem && height > 60 && (
                <div
                  onClick={(e) => { e.stopPropagation(); if (onFocusItem) onFocusItem(matchingItem); }}
                  className="jost"
                  style={{
                    fontSize: 9, color: styleSet.color, marginTop: 2,
                    opacity: 0.85, fontWeight: 500,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}
                  title={`Open ${matchingItem.title}`}
                >→ {matchingItem.title}</div>
              )}
              {/* TOP drag handle — circle at top-center. Drag to change start time.
                  Resizing from the top adjusts BOTH start and duration (so end stays put).
                  Hidden if slot is locked (locked slots can't be resized via drag). */}
              {!slot.locked && height > 30 && (
                <div
                  data-resize-handle="true"
                  onMouseDown={(e) => startResizeTop(e, p)}
                  style={{
                    position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)",
                    width: 12, height: 12, borderRadius: "50%",
                    background: "#fff",
                    border: `2px solid ${styleSet.color}`,
                    cursor: "ns-resize",
                    zIndex: 4,
                    boxShadow: "0 1px 3px rgba(74,53,64,0.18)",
                    opacity: 0,
                    transition: "opacity 0.15s",
                  }}
                  className="resize-handle"
                  title="Drag to change start time"
                />
              )}
              {/* BOTTOM drag handle — circle at bottom-center. Drag to change end time. */}
              {!slot.locked && height > 30 && (
                <div
                  data-resize-handle="true"
                  onMouseDown={(e) => startResize(e, p)}
                  style={{
                    position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
                    width: 12, height: 12, borderRadius: "50%",
                    background: "#fff",
                    border: `2px solid ${styleSet.color}`,
                    cursor: "ns-resize",
                    zIndex: 4,
                    boxShadow: "0 1px 3px rgba(74,53,64,0.18)",
                    opacity: 0,
                    transition: "opacity 0.15s",
                  }}
                  className="resize-handle"
                  title="Drag to change end time"
                />
              )}
            </div>
          );
        })}

        {/* Inline block-type picker — only rendered in edit mode after the user
            clicks empty grid space. Lets them choose the type for the new block
            instead of always defaulting to "Work". Click outside to dismiss. */}
        {isEditMode && picker && (
          <div
            data-picker-popover="true"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              left: Math.min(picker.x, 220), // keep it within the timeline width
              top: Math.max(0, picker.y - 18),
              zIndex: 20,
              background: "#fff",
              border: "1px solid rgba(212,130,154,0.35)",
              borderRadius: 10,
              padding: 6,
              boxShadow: "0 8px 24px rgba(74,35,50,0.15), 0 0 0 4px rgba(255,255,255,0.6)",
              display: "flex",
              flexDirection: "column",
              gap: 3,
              minWidth: 130,
            }}
          >
            <div className="jost" style={{
              fontSize: 9, color: "rgba(184,109,133,0.7)",
              padding: "3px 8px 5px", letterSpacing: 0.6,
              textTransform: "uppercase", fontWeight: 600,
              borderBottom: "1px solid rgba(212,130,154,0.12)",
              marginBottom: 2,
            }}>
              New block at {formatSlotMinutes(picker.startMin)}
            </div>
            {[
              { val: "work",    label: "🌿 Work",    dur: 30 },
              { val: "meeting", label: "🌸 Meeting", dur: 30 },
              { val: "break",   label: "☕ Break",   dur: 15 },
              { val: "buffer",  label: "🪞 Buffer",  dur: 15 },
            ].map(opt => (
              <button
                key={opt.val}
                className="jost"
                onClick={() => {
                  onAddSlotAtMinute(picker.startMin, { type: opt.val, durationMin: opt.dur });
                  setPicker(null);
                }}
                style={{
                  background: "rgba(255,250,247,0.6)",
                  border: "1px solid rgba(212,130,154,0.15)",
                  color: "#4a3540",
                  fontSize: 12, padding: "6px 10px", borderRadius: 6,
                  cursor: "pointer", fontWeight: 500,
                  textAlign: "left", transition: "background 0.12s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,130,154,0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,250,247,0.6)"; }}
              >
                {opt.label}
                <span style={{ float: "right", fontSize: 9, color: "rgba(74,53,64,0.4)", marginTop: 2 }}>
                  {opt.dur}m
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hover styles for drag handles + edit-mode chrome.
          - Execute mode: handles only show on hover (current behavior).
          - Edit mode: handles always visible + pink hatched outline + locked
            required breaks get a distinct treatment and disabled drag cursor. */}
      <style>{`
        .timeline-slot:hover .resize-handle { opacity: 1 !important; }
        .timeline-slot.dragging .resize-handle { opacity: 1 !important; }
        [data-edit-mode="true"] .timeline-slot .resize-handle { opacity: 0.85 !important; }
        [data-edit-mode="true"] .timeline-slot[data-slot-locked="false"] {
          background-image: repeating-linear-gradient(
            -45deg,
            transparent 0px, transparent 6px,
            rgba(212,130,154,0.16) 6px, rgba(212,130,154,0.16) 7px
          );
          border-color: rgba(212,130,154,0.55) !important;
          border-style: dashed !important;
        }
        [data-edit-mode="true"] .timeline-slot[data-required-break="true"] {
          background-image: repeating-linear-gradient(
            -45deg,
            transparent 0px, transparent 8px,
            rgba(158,184,154,0.18) 8px, rgba(158,184,154,0.18) 9px
          );
          border-color: rgba(158,184,154,0.5) !important;
          border-style: solid !important;
          cursor: pointer !important;
        }
        [data-edit-mode="true"] .timeline-slot[data-slot-locked="true"][data-required-break="false"] {
          border-style: solid !important;
        }
      `}</style>

      {/* Hint below timeline — different copy for edit mode */}
      <p className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.4)", marginTop: 6, textAlign: "center", fontStyle: "italic" }}>
        {isEditMode
          ? "✏️ Edit mode — drag blocks to move, drag edges to resize, click empty grid to add. Locked breaks (lunch + brain breaks) stay put."
          : "Click slot to edit · drag to move · grab the circle handles to resize · click empty to add"}
      </p>
    </div>
  );
}

// ─── FollowUpRow ─────────────────────────────────────────────────────────────
// One follow-up entry inside RoadmapCard's expanded follow-ups slot. Pure
// render from props — all state (snooze picker, improving/copied ids) lives
// in RoadmapCard. Extracted from the allFollowUps.map loop in the list view.
function FollowUpRow({
  fu, item,
  copyFollowUpDraft, markFollowUpSent, markFollowUpSkipped,
  snoozeFollowUp, snoozeFollowUpUntil,
  improveFollowUpDraft, improvingFollowUpId, copiedFollowUpId,
  updateFollowUpDraft, reaffirmFollowUpRelevance, dismissFollowUpAsIrrelevant,
  snoozePickerForId, setSnoozePickerForId,
}) {
  const isSent = fu.status === "sent";
  const isSkipped = fu.status === "skipped";
  const isHandled = isSent || isSkipped;
  const draftValue = (fu.draftEdits !== undefined && fu.draftEdits !== null && fu.draftEdits !== "")
    ? fu.draftEdits
    : makeHeuristicDraft(fu);
  const recentlyCopied = copiedFollowUpId === fu.id;
  return (
    <div
      style={{
        background: isHandled ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.7)",
        border: `1px solid ${isHandled ? "rgba(158,184,154,0.2)" : "rgba(158,184,154,0.35)"}`,
        borderLeft: `3px solid ${isSent ? "#9eb89a" : isSkipped ? "rgba(74,53,64,0.2)" : "#9eb89a"}`,
        borderRadius: 9, padding: "10px 14px",
        opacity: isHandled ? 0.65 : 1,
      }}
    >
      {/* Header: recipient + status badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <span className="cg" style={{ fontSize: 15, color: "#4a3540", fontStyle: "italic", textDecoration: isSkipped ? "line-through" : "none" }}>
            {fu.recipient || "[Name]"}
          </span>
          <span className="jost" style={{ fontSize: 9, color: "rgba(74,53,64,0.45)", letterSpacing: 0.5, textTransform: "uppercase" }}>
            {fu.sources.includes("status") ? "waiting" : fu.sources.includes("task") ? "from task" : "from notes"}
          </span>
          {(fu.skipCount || 0) >= 2 && !fu.needsRelevanceReview && (
            <span className="jost" style={{ fontSize: 9, color: "#9a7850", background: "rgba(196,168,130,0.18)", borderRadius: 5, padding: "1px 6px", fontWeight: 600 }}>skipped {fu.skipCount}×</span>
          )}
        </div>
        {isSent && <span className="jost" style={{ fontSize: 10, color: "#7a9e78", fontWeight: 600 }}>✓ sent</span>}
        {isSkipped && <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)", fontWeight: 500 }}>↩ skipped</span>}
      </div>
      {/* Context block: item title, why, since */}
      <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.7)", marginBottom: 8, lineHeight: 1.5 }}>
        <div style={{ fontWeight: 600, color: "#4a3540" }}>{fu.title}</div>
        {item?.why && <div style={{ fontStyle: "italic", marginTop: 2 }}>Why: {item.why}</div>}
        {fu.sinceBizDays > 0 && (
          <div style={{ fontSize: 10, color: "rgba(74,53,64,0.5)", marginTop: 2 }}>
            {fu.sources.includes("status") ? `Waiting since ${fu.sinceBizDays} business day${fu.sinceBizDays === 1 ? "" : "s"}` : ""}
          </div>
        )}
        {fu.reasons.length > 0 && !fu.sources.includes("status") && (
          <div style={{ marginTop: 4 }}>
            {fu.reasons.map((r, ri) => (
              <div key={ri} style={{ fontSize: 10, color: "rgba(74,53,64,0.55)", marginTop: 1 }}>
                • {r}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* "Still relevant?" prompt — appears after 3+
          skips. User explicitly says yes or no instead
          of letting it cycle silently. */}
      {fu.needsRelevanceReview && (
        <div style={{ background: "rgba(196,168,130,0.12)", border: "1px solid rgba(196,168,130,0.4)", borderRadius: 7, padding: "8px 12px", marginBottom: 8 }}>
          <div className="jost" style={{ fontSize: 11, color: "#9a7850", fontWeight: 600, marginBottom: 4 }}>
            🌿 You've skipped this {fu.skipCount}× — still relevant?
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <button
              onClick={() => reaffirmFollowUpRelevance(fu.id)}
              className="jost"
              style={{
                background: "rgba(158,184,154,0.18)",
                border: "1px solid rgba(158,184,154,0.4)",
                color: "#7a9e78", fontSize: 10, padding: "4px 9px",
                borderRadius: 6, cursor: "pointer", fontWeight: 600,
              }}
            >✓ Yes, keep it</button>
            <button
              onClick={() => dismissFollowUpAsIrrelevant(fu.id)}
              className="jost"
              style={{
                background: "rgba(168,158,148,0.15)",
                border: "1px solid rgba(168,158,148,0.4)",
                color: "#a89e94", fontSize: 10, padding: "4px 9px",
                borderRadius: 6, cursor: "pointer", fontWeight: 500,
              }}
            >✗ No, drop it</button>
          </div>
        </div>
      )}
      {/* Draft textarea — editable, autosaves on blur */}
      {!isHandled && (
        <textarea
          value={draftValue}
          onChange={(e) => updateFollowUpDraft(fu.id, e.target.value)}
          className="jost"
          rows={Math.min(8, Math.max(4, draftValue.split("\n").length))}
          style={{
            width: "100%", padding: "8px 12px",
            fontSize: 12, color: "#4a3540",
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(158,184,154,0.3)",
            borderRadius: 7, fontFamily: "'Jost', sans-serif",
            outline: "none", resize: "vertical",
            lineHeight: 1.5, marginBottom: 8, boxSizing: "border-box",
          }}
        />
      )}
      {/* Action buttons (only show when pending) */}
      {!isHandled && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            onClick={() => copyFollowUpDraft(fu)}
            className="jost"
            style={{
              background: recentlyCopied ? "rgba(158,184,154,0.25)" : "rgba(158,184,154,0.12)",
              border: "1px solid rgba(158,184,154,0.4)",
              color: "#7a9e78",
              fontSize: 11, padding: "5px 11px", borderRadius: 7,
              cursor: "pointer", fontWeight: 600, letterSpacing: 0.3,
            }}
          >{recentlyCopied ? "✓ Copied!" : "📋 Copy"}</button>
          <button
            onClick={() => improveFollowUpDraft(fu)}
            disabled={improvingFollowUpId === fu.id}
            className="jost"
            title={fu.draftSource === "ai" ? "Regenerate with Rosie" : "Let Rosie write a more personalized version"}
            style={{
              background: improvingFollowUpId === fu.id ? "rgba(184,160,212,0.2)" : "rgba(184,160,212,0.12)",
              border: "1px solid rgba(184,160,212,0.4)",
              color: "#9878b8",
              fontSize: 11, padding: "5px 11px", borderRadius: 7,
              cursor: improvingFollowUpId === fu.id ? "default" : "pointer",
              fontWeight: 500, letterSpacing: 0.3,
            }}
          >{improvingFollowUpId === fu.id ? "✨ thinking…" : (fu.draftSource === "ai" ? "✨ regenerate" : "✨ improve w/ Rosie")}</button>
          <button
            onClick={() => markFollowUpSent(fu.id)}
            className="jost"
            style={{
              background: "linear-gradient(135deg,#9eb89a,#7a9e78)",
              border: "none", color: "#fff",
              fontSize: 11, padding: "5px 11px", borderRadius: 7,
              cursor: "pointer", fontWeight: 600, letterSpacing: 0.3,
            }}
          >✓ Mark sent</button>
          <button
            onClick={() => setSnoozePickerForId(snoozePickerForId === fu.id ? null : fu.id)}
            className="jost"
            style={{
              background: snoozePickerForId === fu.id ? "rgba(125,154,175,0.25)" : "rgba(125,154,175,0.12)",
              border: "1px solid rgba(125,154,175,0.4)",
              color: "#5e7e95",
              fontSize: 11, padding: "5px 11px", borderRadius: 7,
              cursor: "pointer", fontWeight: 500,
            }}
          >💤 Snooze</button>
          <button
            onClick={() => markFollowUpSkipped(fu.id)}
            className="jost"
            style={{
              background: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(74,53,64,0.15)",
              color: "rgba(74,53,64,0.55)",
              fontSize: 11, padding: "5px 11px", borderRadius: 7,
              cursor: "pointer", fontWeight: 500,
            }}
          >⏭ Skip for today</button>
        </div>
      )}
      {/* Snooze duration picker — appears when user clicks
          Snooze. Preset buttons + custom date input. */}
      {snoozePickerForId === fu.id && (
        <div style={{ marginTop: 8, padding: "10px 12px", background: "rgba(125,154,175,0.08)", border: "1px solid rgba(125,154,175,0.3)", borderRadius: 8 }}>
          <div className="jost" style={{ fontSize: 10, color: "#5e7e95", letterSpacing: 0.5, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>💤 Snooze until…</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
            {[
              { label: "Tomorrow", days: 1 },
              { label: "+3 days", days: 3 },
              { label: "+1 week", days: 7 },
              { label: "+2 weeks", days: 14 },
              { label: "+1 month", days: 30 },
            ].map(opt => (
              <button
                key={opt.days}
                onClick={() => snoozeFollowUp(fu.id, opt.days)}
                className="jost"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(125,154,175,0.4)",
                  color: "#5e7e95",
                  fontSize: 10, padding: "4px 9px", borderRadius: 6,
                  cursor: "pointer", fontWeight: 500,
                }}
              >{opt.label}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="jost" style={{ fontSize: 10, color: "rgba(94,126,149,0.7)" }}>or pick a date:</span>
            <input
              type="date"
              min={(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })()}
              onChange={e => e.target.value && snoozeFollowUpUntil(fu.id, e.target.value)}
              className="jost"
              style={{ fontSize: 10, padding: "3px 7px", borderRadius: 5, border: "1px solid rgba(125,154,175,0.35)", background: "rgba(255,255,255,0.85)", colorScheme: "light", fontFamily: "'Jost', sans-serif", outline: "none" }}
            />
            <button
              onClick={() => setSnoozePickerForId(null)}
              className="jost"
              style={{ background: "none", border: "none", color: "rgba(94,126,149,0.6)", fontSize: 10, cursor: "pointer", marginLeft: "auto", padding: "3px 6px" }}
            >Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SlotRow ─────────────────────────────────────────────────────────────────
// One slot row in RoadmapCard's list view: drag handle, complete toggle,
// inline label/duration editing, link picker, meeting/followups expansions.
// Pure render from props — all state lives in RoadmapCard. The 13 follow-up
// handler props are bundled as `followUpProps` and spread into FollowUpRow,
// since SlotRow never reads them. Returns null for completed/reconciled slots
// (those render in the Past blocks section instead).
function SlotRow({
  slot, idx,
  currentIdx, currentMinutes, completedSlots,
  draggingIdx, dragOverIdx, editingSlot, editValue, setEditValue,
  expandedFollowUpSlot, setExpandedFollowUpSlot,
  linkPickerForSlot, setLinkPickerForSlot,
  slots, findMatchingItem, getSlotEffectiveDuration,
  startEdit, commitEdit, cancelEdit,
  cycleSlotType, deleteSlot, resizeSlotDuration,
  toggleSlotComplete, toggleSlotLock, openCreateTaskFor,
  onDragStart, onDragEnd, onDragOverRow, onDropRow,
  roadmap, onUpdateRoadmap, onUpdate, data, items,
  onFocus, onMeetingFocus, onPastMeetingClick,
  followUpProps,
}) {
  const styleSet = SLOT_COLORS[slot.type] || SLOT_COLORS.work;
  const isCurrent = idx === currentIdx;
  const isPast = idx < currentIdx;
  const isComplete = completedSlots.has(idx);
  const hasRecon = !!(roadmap?.slotReconciliation?.[idx]);
  // Past blocks (completed OR reconciled) live exclusively in the
  // "Past blocks" grouped section above — never inline. This keeps
  // the active list focused on what's now and ahead. Past slots
  // that haven't been reconciled stay inline (Surface C card
  // prompts the user to reconcile them).
  if (isComplete || hasRecon) return null;
  const matchingItem = slot.type === "work" ? findMatchingItem(slot.label, slot) : null;
  const isMeetingSlotFlag = isMeetingSlot(slot);
  const isDragging = draggingIdx === idx;
  const isDragOver = dragOverIdx === idx && draggingIdx !== null && draggingIdx !== idx;
  const isLocked = !!slot.locked;
  const editingThis = editingSlot && editingSlot.idx === idx;
  const isRequiredBreak = isLunchSlot(slot) || isBrainBreakSlot(slot);
  return (
    <React.Fragment>
    <div
      onDragOver={e => onDragOverRow(e, idx)}
      onDrop={e => onDropRow(e, idx)}
      draggable={!isRequiredBreak && !editingThis}
      onDragStart={(!isRequiredBreak && !editingThis) ? (e => onDragStart(e, idx)) : undefined}
      onDragEnd={(!isRequiredBreak && !editingThis) ? onDragEnd : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 9,
        background: isCurrent ? styleSet.bg : (isPast || isComplete ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.6)"),
        border: `1px ${isDragOver ? "dashed" : "solid"} ${isDragOver ? styleSet.dot : (isCurrent ? styleSet.border : "rgba(212,130,154,0.1)")}`,
        boxShadow: isCurrent ? `0 0 0 2px ${styleSet.border}` : "none",
        transition: "all .15s",
        opacity: isDragging ? 0.4 : ((isPast || isComplete) && !isCurrent ? 0.55 : 1),
        transform: isDragging ? "scale(0.98)" : "none",
        position: "relative", // anchor for the bottom resize handle
        cursor: isRequiredBreak ? "default" : (editingThis ? "text" : (isDragging ? "grabbing" : "grab")),
      }}
    >
      {/* Visual-only grip — actual drag is on the row */}
      <span
        title={isRequiredBreak ? "Required break — can't move" : "Drag the row to reorder"}
        className="jost"
        draggable={false}
        style={{ color: "rgba(184,109,133,0.4)", fontSize: 14, padding: "0 2px", flexShrink: 0, userSelect: "none", lineHeight: 1, pointerEvents: "none" }}
      >⋮⋮</span>

      {/* Completion checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleSlotComplete(idx); }}
        title={isComplete ? "Mark incomplete" : "Mark complete"}
        style={{
          width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
          border: `2px solid ${styleSet.dot}`,
          background: isComplete ? styleSet.dot : "transparent",
          cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 10, fontWeight: 700,
        }}
      >{isComplete ? "✓" : ""}</button>

      {/* Time — start, end, duration. Each part clickable to edit. */}
      {editingThis && editingSlot.field === "time" ? (
        <input
          autoFocus
          type="text"
          className="jost"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit(); }}
          placeholder="9:30 AM"
          style={{ background: "rgba(255,255,255,0.95)", border: `1px solid ${styleSet.border}`, borderRadius: 5, color: styleSet.color, fontSize: 11, fontWeight: 600, padding: "2px 5px", width: 70, fontVariantNumeric: "tabular-nums", outline: "none" }}
        />
      ) : editingThis && editingSlot.field === "endTime" ? (
        <input
          autoFocus
          type="text"
          className="jost"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit(); }}
          placeholder="10:30 AM"
          style={{ background: "rgba(255,255,255,0.95)", border: `1px solid ${styleSet.border}`, borderRadius: 5, color: styleSet.color, fontSize: 11, fontWeight: 600, padding: "2px 5px", width: 70, fontVariantNumeric: "tabular-nums", outline: "none" }}
        />
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
          <button
            onClick={() => startEdit(idx, "time")}
            title="Click to edit start time"
            className="jost"
            style={{ background: "none", border: "1px dashed transparent", color: styleSet.color, fontWeight: 600, fontSize: 11, fontVariantNumeric: "tabular-nums", cursor: "pointer", padding: "2px 4px", borderRadius: 5, textAlign: "left", whiteSpace: "nowrap" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(212,130,154,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; }}
          >{(() => {
            // Show start time only (without ampm if matches end's ampm)
            const start = slot.time;
            const sm = start.match(/^(.+?)\s*(AM|PM)$/i);
            // Compute the actual end time we'll display (matches end-time button below)
            const startMin = parseSlotTimeMinutes(slot.time);
            const fixedDur = intendedFixedDuration(slot);
            let endTimeStr = null;
            if (fixedDur != null && startMin >= 0) {
              endTimeStr = formatSlotMinutes(startMin + fixedDur);
            } else {
              const next = slots[idx + 1];
              if (next) endTimeStr = next.time;
            }
            if (endTimeStr) {
              const nm = endTimeStr.match(/^(.+?)\s*(AM|PM)$/i);
              if (sm && nm && sm[2].toUpperCase() === nm[2].toUpperCase()) return sm[1];
            }
            return start;
          })()}</button>
          <span className="jost" style={{ color: styleSet.color, fontSize: 11, fontWeight: 600, opacity: 0.6 }}>–</span>
          {idx + 1 < slots.length ? (
            <button
              onClick={() => startEdit(idx, "endTime")}
              title="Click to edit end time (cascades to next slot's start)"
              className="jost"
              style={{ background: "none", border: "1px dashed transparent", color: styleSet.color, fontWeight: 600, fontSize: 11, fontVariantNumeric: "tabular-nums", cursor: "pointer", padding: "2px 4px", borderRadius: 5, textAlign: "left", whiteSpace: "nowrap" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(212,130,154,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; }}
            >{(() => {
              // Show the EFFECTIVE end time, capped at next slot's start.
              // Without the cap, a slot with explicit durationMin would visually
              // extend past a later locked slot (e.g. afternoon brain break
              // inserted at 3:30 between a work block ending at 3:40).
              const startMin = parseSlotTimeMinutes(slot.time);
              const fixedDur = intendedFixedDuration(slot);
              const next = slots[idx + 1];
              const nextStart = next ? parseSlotTimeMinutes(next.time) : -1;
              let endMin;
              if (fixedDur != null && startMin >= 0) {
                endMin = startMin + fixedDur;
                if (nextStart >= 0 && endMin > nextStart) endMin = nextStart;
              } else {
                endMin = nextStart;
              }
              return endMin >= 0 ? formatSlotMinutes(endMin) : "—";
            })()}</button>
          ) : (
            <span className="jost" style={{ color: styleSet.color, fontSize: 11, fontWeight: 600, opacity: 0.5, padding: "2px 4px" }}>{(() => {
              const startMin = parseSlotTimeMinutes(slot.time);
              // Last slot: use intended fixed duration if available, else +30 fallback
              const fixedDur = intendedFixedDuration(slot);
              if (fixedDur != null && startMin >= 0) {
                return formatSlotMinutes(startMin + fixedDur);
              }
              return startMin >= 0 ? formatSlotMinutes(startMin + 30) : "";
            })()}</span>
          )}
          {(() => {
            const dur = formatSlotDuration(slots, idx);
            return dur ? (
              <span className="jost" title="Duration" style={{ color: styleSet.color, fontSize: 9, fontWeight: 500, opacity: 0.55, marginLeft: 4, fontVariantNumeric: "tabular-nums" }}>· {dur}</span>
            ) : null;
          })()}
        </div>
      )}

      {/* Lock toggle — user-locked shows in stronger rose (your intentional choice),
          auto-locked shows in muted color (system protection like meetings/EOD) */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleSlotLock(idx); }}
        onMouseDown={(e) => e.stopPropagation()}
        title={
          slot.userLocked ? "You locked this. Click to unlock."
          : isLocked ? "Auto-locked (meeting/EOD/lunch). Click to override and unlock."
          : "Click to lock this slot so it survives refines + Re-apply rules."
        }
        style={{
          background: "none",
          border: "none",
          color: slot.userLocked ? "#d4829a"
               : isLocked ? styleSet.color
               : "rgba(184,109,133,0.25)",
          cursor: "pointer",
          fontSize: 14,
          padding: "4px 6px",
          borderRadius: 6,
          lineHeight: 1,
          flexShrink: 0,
          filter: slot.userLocked ? "drop-shadow(0 0 2px rgba(212,130,154,0.5))" : "none",
          pointerEvents: "auto",
          touchAction: "manipulation",
          transition: "background .12s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,130,154,0.12)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
      >{isLocked ? "🔒" : "🔓"}</button>

      {/* Type cycle (small dot button) */}
      <button
        onClick={(e) => { e.stopPropagation(); cycleSlotType(idx); }}
        title={`Type: ${slot.type}. Click to cycle.`}
        style={{ background: styleSet.dot, border: "none", borderRadius: "50%", width: 8, height: 8, cursor: "pointer", padding: 0, flexShrink: 0 }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Label — clickable to edit */}
        {editingThis && editingSlot.field === "label" ? (
          <input
            autoFocus
            type="text"
            className="jost"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit(); }}
            style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(212,130,154,0.3)", borderRadius: 5, color: "#4a3540", fontSize: 12, fontWeight: 500, padding: "2px 6px", width: "100%", outline: "none" }}
          />
        ) : (
          <div
            onClick={() => startEdit(idx, "label")}
            title="Click to edit"
            className="jost"
            style={{ fontSize: 12, color: "#4a3540", fontWeight: isCurrent ? 600 : 500, textDecoration: isComplete ? "line-through" : "none", cursor: "text", padding: "1px 0", borderRadius: 3 }}
          >{slot.label || <span style={{ color: "rgba(74,53,64,0.3)", fontStyle: "italic" }}>click to add label</span>}</div>
        )}

        {/* Note — clickable to edit */}
        {editingThis && editingSlot.field === "note" ? (
          <input
            autoFocus
            type="text"
            className="jost"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit(); }}
            placeholder="Add a note..."
            style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(212,130,154,0.25)", borderRadius: 5, color: "rgba(74,53,64,0.7)", fontSize: 10, fontStyle: "italic", padding: "2px 6px", width: "100%", marginTop: 2, outline: "none" }}
          />
        ) : (
          <div
            onClick={() => startEdit(idx, "note")}
            title="Click to edit note"
            className="jost"
            style={{ fontSize: 10, color: slot.note ? "rgba(74,53,64,0.5)" : "rgba(74,53,64,0.25)", marginTop: 1, fontStyle: "italic", cursor: "text" }}
          >{slot.note || "+ note"}</div>
        )}
      </div>

      {/* Slot type pill — clickable, marks the slot complete (or routes for meetings/work) */}
      {(() => {
        const isCompleted = completedSlots.has(idx);
        const completedStyle = isCompleted ? { opacity: 0.55 } : {};
        const labelLower = (slot.label || "").toLowerCase();

        // Meeting → 🌹 meeting (full prep + notes). The type-aware
        // quick-prep pill lives on the PREP BUFFER slot below, not
        // here, so the meeting slot stays focused on the meeting itself.
        if (isMeetingSlotFlag && onMeetingFocus) {
          // Detect past meeting — if its end time has passed, the pill
          // becomes "📜 notes" instead of "🌹 meeting" and routes to
          // the Meetings History tab/modal rather than the prep view.
          const slotStartMin = parseSlotTimeMinutes(slot.time);
          const slotEndMin = slotStartMin + (slot.durationMin || 30);
          const isPast = currentMinutes > slotEndMin;
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isPast && onPastMeetingClick) onPastMeetingClick(slot);
                else onMeetingFocus(slot);
              }}
              title={isPast ? `View notes & prep history for "${slot.label}"` : `Open prep + notes for "${slot.label}"`}
              className="jost"
              style={{ background: isPast ? "rgba(196,168,130,0.12)" : "rgba(184,160,212,0.12)", border: `1px solid ${isPast ? "rgba(196,168,130,0.4)" : "rgba(184,160,212,0.35)"}`, color: isPast ? "#9a7850" : "#9878b8", fontSize: 10, padding: "3px 9px", cursor: "pointer", flexShrink: 0, borderRadius: 7, fontWeight: 500, whiteSpace: "nowrap" }}
            >{isPast ? "📜 notes" : "🌹 meeting"}</button>
          );
        }
        // Meeting prep buffer → type-aware quick-prep pill (was generic
        // 🌸 prep). Inspects the following meeting slot, runs type
        // detection on its label, and clicking the pill fires an
        // autoPrep flow so the opener + curveballs are pre-generated.
        if (labelLower.startsWith("prep for") && onMeetingFocus) {
          // Find the corresponding meeting slot (next meeting slot after this buffer)
          const meetingForPrep = (() => {
            if (labelLower.includes("today's meeting") || labelLower.includes("daily meeting")) {
              for (let j = idx + 1; j < (roadmap.slots || []).length; j++) {
                if (isMeetingSlot(roadmap.slots[j])) return roadmap.slots[j];
              }
              return null;
            }
            for (let j = idx + 1; j < (roadmap.slots || []).length; j++) {
              if (isMeetingSlot(roadmap.slots[j])) return roadmap.slots[j];
            }
            return null;
          })();
          // Type-detect from the meeting's label; falls back to generic 🌸 if no meeting found
          const mtype = meetingForPrep ? detectMeetingTypeFromLabel(meetingForPrep.label) : null;
          const emoji = mtype ? mtype.emoji : "🌸";
          const handleClick = (e) => {
            e.stopPropagation();
            if (meetingForPrep) {
              onMeetingFocus(meetingForPrep, mtype ? { autoPrep: true, prefilledSituation: mtype.situation, detectedType: mtype.type } : {});
            } else {
              toggleSlotComplete(idx);
            }
          };
          return (
            <button
              onClick={handleClick}
              title={meetingForPrep ? `Quick ${mtype ? mtype.label.toLowerCase() : "prep"} for "${meetingForPrep.label}" — opener + curveballs ready` : "Click to mark prep done"}
              className="jost"
              style={{ background: "rgba(232,200,154,0.15)", border: "1px solid rgba(232,200,154,0.45)", color: "#a87a3a", fontSize: 10, padding: "3px 9px", cursor: "pointer", flexShrink: 0, borderRadius: 7, fontWeight: 500, whiteSpace: "nowrap", ...completedStyle }}
            >{isCompleted ? "✓ prepped" : `${emoji} prep`}</button>
          );
        }
        // Meeting buffer / breather → ☕ recharge time (toggle complete)
        if (labelLower.startsWith("buffer after") || labelLower.startsWith("buffer for") ||
            labelLower.startsWith("breather after") || labelLower.startsWith("breather for") ||
            labelLower.startsWith("decompress")) {
          const handleToggle = (e) => { e.stopPropagation(); toggleSlotComplete(idx); };
          return (
            <button
              onClick={handleToggle}
              title={isCompleted ? "Recharged — click to undo" : "Click to mark recharge done"}
              className="jost"
              style={{ background: "rgba(120,168,168,0.1)", border: "1px solid rgba(120,168,168,0.4)", color: "#5a8888", fontSize: 10, padding: "3px 9px", flexShrink: 0, borderRadius: 7, fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer", ...completedStyle }}
            >{isCompleted ? "✓ recharged" : "☕ recharge time"}</button>
          );
        }

        // Follow-ups slot — sage-accented pill showing pending count
        // (or "all sent" if none pending). Clicking toggles the
        // expansion panel below the row.
        if (slot.type === "followups") {
          const slotFollowUpIds = Array.isArray(slot.followUpIds) ? slot.followUpIds : [];
          const todayISO = new Date().toISOString().slice(0, 10);
          const allFollowUps = (roadmap?.followUps || [])
            .filter(fu => slotFollowUpIds.includes(fu.id))
            .filter(fu => {
              if (fu.status === "snoozed" && fu.snoozedUntil && fu.snoozedUntil > todayISO) return false;
              if (fu.status === "dismissed") return false;
              return true;
            });
          const pending = allFollowUps.filter(fu => fu.status === "pending").length;
          const sent = allFollowUps.filter(fu => fu.status === "sent").length;
          const skipped = allFollowUps.filter(fu => fu.status === "skipped").length;
          const isExpanded = expandedFollowUpSlot === idx;
          const allHandled = pending === 0 && allFollowUps.length > 0;
          const label = pending > 0
            ? `📨 ${pending} to send`
            : allHandled
              ? `✓ all handled`
              : `📨 ${allFollowUps.length}`;
          return (
            <button
              onClick={(e) => { e.stopPropagation(); setExpandedFollowUpSlot(isExpanded ? null : idx); }}
              title={`${pending} pending · ${sent} sent · ${skipped} skipped`}
              className="jost"
              style={{
                background: allHandled ? "rgba(158,184,154,0.18)" : "rgba(158,184,154,0.12)",
                border: `1px solid rgba(158,184,154,${allHandled ? "0.5" : "0.4"})`,
                color: "#7a9e78", fontSize: 11, padding: "3px 11px",
                flexShrink: 0, borderRadius: 7, fontWeight: 600, letterSpacing: 0.3,
                whiteSpace: "nowrap", cursor: "pointer", maxWidth: 180,
                display: "inline-flex", alignItems: "center", gap: 5,
              }}
            >
              {label}
              <span style={{ fontSize: 9, opacity: 0.7 }}>{isExpanded ? "▴" : "▾"}</span>
            </button>
          );
        }

        // Work block matched to an item → ✨ next up · clickable to FocusView,
        // plus a small ▾ caret to open the link picker (re-link to a different
        // item, auto-detect, or clear). Rendered by the shared <LinkPicker>
        // (defined above TimelineView); setMatch + convertSlot write through
        // roadmap + onUpdateRoadmap since that's what's in scope here.
        if (matchingItem && onFocus) {
          const setMatch = (overrideId) => {
            if (!onUpdateRoadmap) return;
            const newSlots = roadmap.slots.map((s, i) =>
              i === idx ? { ...s, matchOverrideItemId: overrideId === null ? undefined : overrideId } : s
            );
            onUpdateRoadmap({ ...roadmap, slots: newSlots });
          };
          const convertSlot = (conv) => {
            // Convert slot type/label. Locks in the new pill on next
            // render via the existing SlotActionPill priority order.
            if (!onUpdateRoadmap) return;
            const newSlots = roadmap.slots.map((s, i) =>
              i === idx ? { ...s, ...conv, matchOverrideItemId: undefined } : s
            );
            onUpdateRoadmap({ ...roadmap, slots: newSlots });
          };
          return (
            <LinkPicker
              matchingItem={matchingItem}
              items={items}
              open={linkPickerForSlot === idx}
              onOpen={() => setLinkPickerForSlot(idx)}
              onClose={() => setLinkPickerForSlot(null)}
              onFocus={onFocus}
              onSetMatch={setMatch}
              onConvertSlot={convertSlot}
            />
          );
        }

        // Unmatched work block — slot is work-type but no item
        // matches (and user hasn't explicitly unlinked via "__none__").
        // Offer to create + link a new task with Rosie's help.
        if (slot.type === "work" && !matchingItem && slot.matchOverrideItemId !== "__none__" && onUpdate && onUpdateRoadmap) {
          return (
            <button
              onClick={(e) => { e.stopPropagation(); openCreateTaskFor(idx); }}
              title="Rosie will suggest a new task to create + link to this slot"
              className="jost"
              style={{ background: "rgba(184,160,212,0.1)", border: "1px dashed rgba(184,160,212,0.5)", color: "#9878b8", fontSize: 10, padding: "3px 9px", flexShrink: 0, borderRadius: 7, fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer", maxWidth: 200 }}
            >✨ create task for this?</button>
          );
        }

        // All other pill types are clickable "mark complete" buttons.
        // Click toggles the slot's complete state. Visual: when complete,
        // the pill dims + shows a check.
        const handleToggle = (e) => { e.stopPropagation(); toggleSlotComplete(idx); };

        // Lunch → 🍽️ eat something good
        if (isLunchSlot(slot)) {
          return (
            <button
              onClick={handleToggle}
              title={isCompleted ? "Lunch done — click to undo" : "Click to mark lunch done"}
              className="jost"
              style={{ background: "rgba(232,196,140,0.14)", border: "1px solid rgba(196,168,130,0.4)", color: "#9a7850", fontSize: 10, padding: "3px 9px", flexShrink: 0, borderRadius: 7, fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer", ...completedStyle }}
            >{isCompleted ? "✓ ate" : "🍽️ eat something good"}</button>
          );
        }
        // Brain break → 🌿 stretch & reset
        if (isBrainBreakSlot(slot)) {
          return (
            <button
              onClick={handleToggle}
              title={isCompleted ? "Break done — click to undo" : "Click to mark break done"}
              className="jost"
              style={{ background: "rgba(158,184,154,0.14)", border: "1px solid rgba(158,184,154,0.4)", color: "#7a9e78", fontSize: 10, padding: "3px 9px", flexShrink: 0, borderRadius: 7, fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer", ...completedStyle }}
            >{isCompleted ? "✓ reset done" : "🌿 stretch & reset"}</button>
          );
        }
        // Morning settle-in / buffer (first slot of the day) — runs BEFORE rest pill
        // because labels like "Morning buffer" / "Settle in" / "Reorient" should
        // get the warm gold settle-in vibe, not the teal rest vibe.
        if (labelLower.includes("settle") || labelLower.includes("morning buffer") ||
            labelLower.includes("reorient") || labelLower.includes("wake up") ||
            labelLower === "morning" || labelLower === "morning reorient" ||
            // First slot of the day, generic "buffer" label, before 10 AM
            (labelLower === "buffer" && idx === 0 && parseSlotTimeMinutes(slot.time) < 10 * 60)) {
          return (
            <button
              onClick={handleToggle}
              title={isCompleted ? "Settled in — click to undo" : "Click to mark settle-in done"}
              className="jost"
              style={{ background: "rgba(232,196,140,0.1)", border: "1px solid rgba(232,196,140,0.4)", color: "#b89858", fontSize: 10, padding: "3px 9px", flexShrink: 0, borderRadius: 7, fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer", ...completedStyle }}
            >{isCompleted ? "✓ settled in" : "🌅 settle in"}</button>
          );
        }
        // Morning settle-in / buffer / wake-up → 🌅 settle in
        // Match BEFORE rest/free-buffer since "buffer" is generic and would catch morning too
        if (labelLower.includes("morning buffer") || labelLower.includes("settle in") ||
            labelLower.includes("settle-in") || labelLower.includes("wake-up") ||
            labelLower.includes("wake up") || labelLower.includes("morning settle") ||
            labelLower === "morning" || labelLower.startsWith("morning ") ||
            labelLower.includes("ease in") || labelLower.includes("good morning")) {
          // Only treat as morning slot if it's actually scheduled in the morning (before noon)
          const slotMin = parseSlotTimeMinutes(slot.time);
          const isMorningTime = slotMin >= 0 && slotMin < 12 * 60;
          if (isMorningTime) {
            return (
              <button
                onClick={handleToggle}
                title={isCompleted ? "Settled in — click to undo" : "Click to mark settle-in done"}
                className="jost"
                style={{ background: "rgba(232,180,140,0.14)", border: "1px solid rgba(220,170,130,0.4)", color: "#b8895a", fontSize: 10, padding: "3px 9px", flexShrink: 0, borderRadius: 7, fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer", ...completedStyle }}
              >{isCompleted ? "✓ settled in" : "🌅 settle in"}</button>
            );
          }
        }
        // Rest / free buffer → ☕ recharge time
        if (labelLower.includes("rest") || labelLower.includes("free buffer") ||
            labelLower.includes("recovery") || labelLower === "buffer") {
          return (
            <button
              onClick={handleToggle}
              title={isCompleted ? "Recharged — click to undo" : "Click to mark recharge done"}
              className="jost"
              style={{ background: "rgba(120,168,168,0.1)", border: "1px solid rgba(120,168,168,0.4)", color: "#5a8888", fontSize: 10, padding: "3px 9px", flexShrink: 0, borderRadius: 7, fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer", ...completedStyle }}
            >{isCompleted ? "✓ recharged" : "☕ recharge time"}</button>
          );
        }
        // Wrap & tomorrow prep
        if (labelLower.includes("wrap") && labelLower.includes("tomorrow")) {
          return (
            <button
              onClick={handleToggle}
              title={isCompleted ? "Wrap done — click to undo" : "Click to mark wrap-up done"}
              className="jost"
              style={{ background: "rgba(184,160,212,0.1)", border: "1px solid rgba(184,160,212,0.35)", color: "#9878b8", fontSize: 10, padding: "3px 9px", flexShrink: 0, borderRadius: 7, fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer", ...completedStyle }}
            >{isCompleted ? "✓ wrapped" : "🌙 wrap & prep tomorrow"}</button>
          );
        }
        // Close out / End of day
        if (labelLower.includes("close for the day") || labelLower.includes("close out") ||
            labelLower.includes("end of day") || labelLower.includes("end-of-day")) {
          return (
            <button
              onClick={handleToggle}
              title={isCompleted ? "Closed out — click to undo" : "Click to mark close-out done"}
              className="jost"
              style={{ background: "rgba(196,168,130,0.1)", border: "1px solid rgba(196,168,130,0.35)", color: "#9a7850", fontSize: 10, padding: "3px 9px", flexShrink: 0, borderRadius: 7, fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer", ...completedStyle }}
            >{isCompleted ? "✓ closed out" : "🌙 close out"}</button>
          );
        }
        // Morning meeting prep block (the 30-min "Prep for today's meetings" anchor)
        if (labelLower.includes("prep for today") || labelLower.includes("meetings prep") ||
            labelLower.includes("daily meeting prep")) {
          return (
            <button
              onClick={handleToggle}
              title={isCompleted ? "Prep done — click to undo" : "Click to mark prep done"}
              className="jost"
              style={{ background: "rgba(184,160,212,0.08)", border: "1px solid rgba(184,160,212,0.3)", color: "#9878b8", fontSize: 10, padding: "3px 9px", cursor: "pointer", flexShrink: 0, borderRadius: 7, fontWeight: 500, whiteSpace: "nowrap", ...completedStyle }}
            >{isCompleted ? "✓ prepped" : "🌸 daily prep"}</button>
          );
        }
        return null;
      })()}

      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); deleteSlot(idx); }}
        title="Delete slot"
        style={{ background: "none", border: "none", color: "rgba(184,109,133,0.3)", cursor: "pointer", fontSize: 12, padding: "0 4px", flexShrink: 0, lineHeight: 1 }}
        onMouseEnter={e => { e.currentTarget.style.color = "#c4687a"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "rgba(184,109,133,0.3)"; }}
      >✕</button>

      {/* Bottom-edge resize handle — drag to change duration. Hidden
          on required breaks (lunch + brain breaks). */}
      <SlotResizeHandle
        color={styleSet.color}
        disabled={isRequiredBreak}
        getCurrentDuration={() => getSlotEffectiveDuration(idx)}
        onCommit={(newDuration) => resizeSlotDuration(idx, newDuration)}
      />
    </div>
    {/* Follow-ups expansion panel — renders below the slot row
        when the user clicks the pill. Lists each follow-up with
        context (item title, why, "waiting since X days"), an
        editable draft, and Copy / Mark sent / Skip actions.
        Sent/skipped items remain visible but visually de-emphasized
        so the user can see what they've already handled. */}
    {slot.type === "followups" && expandedFollowUpSlot === idx && (() => {
      const slotFollowUpIds = Array.isArray(slot.followUpIds) ? slot.followUpIds : [];
      const todayISO = new Date().toISOString().slice(0, 10);
      const allFollowUps = (roadmap?.followUps || [])
        .filter(fu => slotFollowUpIds.includes(fu.id))
        .filter(fu => {
          if (fu.status === "snoozed" && fu.snoozedUntil && fu.snoozedUntil > todayISO) return false;
          if (fu.status === "dismissed") return false;
          return true;
        });
      if (allFollowUps.length === 0) {
        return (
          <div className="jost" style={{ marginLeft: 32, marginTop: 4, marginBottom: 6, padding: "10px 14px", background: "rgba(158,184,154,0.05)", border: "1px solid rgba(158,184,154,0.2)", borderRadius: 9, fontSize: 11, color: "rgba(74,53,64,0.5)", fontStyle: "italic" }}>
            Nothing to follow up on right now.
          </div>
        );
      }
      return (
        <div style={{ marginLeft: 32, marginTop: 4, marginBottom: 6, display: "flex", flexDirection: "column", gap: 8 }}>
          {allFollowUps.map((fu) => {
            const item = (data?.items || []).find(i => i.id === fu.itemId);
            return (
              <FollowUpRow
                key={fu.id}
                fu={fu}
                item={item}
                {...followUpProps}
              />
            );
          })}
        </div>
      );
    })()}
    </React.Fragment>
  );
}

function RoadmapCard({ roadmap, items, energy, mood, onUpdateRoadmap, onFocus, onOneThing, data, onUpdate, onCloseDay, onMeetingFocus, onPastMeetingClick }) {
  const [collapsed, setCollapsed] = useState(false);
  // Reconciliation card expand/collapse — collapsed by default since we don't
  // want this to feel like a nag the moment you open the app.
  const [showReconciliation, setShowReconciliation] = useState(false);
  // Suggest-and-create task from unmatched work block — Rosie drafts a task,
  // user confirms/edits in a small modal, save creates the item AND links
  // the slot via matchOverrideItemId. Falls back to a heuristic draft if
  // the AI call fails (so the user can still create the task offline).
  const [createTaskForSlot, setCreateTaskForSlot] = useState(null); // slot idx
  const [createTaskDraft, setCreateTaskDraft] = useState(null); // {title, priority, why}
  const [createTaskLoading, setCreateTaskLoading] = useState(false);
  const [createTaskError, setCreateTaskError] = useState(""); // user-facing error string
  // Follow-ups slot expansion state — which slot's panel is currently open
  // (null = all collapsed), and a brief "Copied!" indicator after copy.
  const [expandedFollowUpSlot, setExpandedFollowUpSlot] = useState(null);
  const [copiedFollowUpId, setCopiedFollowUpId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [refining, setRefining] = useState(false);
  const [refineActions, setRefineActions] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false); // collapsed completed slots toggle
  const [completionToast, setCompletionToast] = useState(""); // brief feedback when slot marked done
  const completionToastRef = useRef(null);
  // Add-slot inline form state — shown when user clicks "+ Add a slot" so they
  // can fill in label/type/time/duration BEFORE the slot appears (avoids the
  // "now I have to edit a 'New block' entry" friction)
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlotLabel, setNewSlotLabel] = useState("");
  const [newSlotType, setNewSlotType] = useState("work");
  const [newSlotTime, setNewSlotTime] = useState("");
  const [newSlotDuration, setNewSlotDuration] = useState(""); // minutes as string

  // Index of slot currently open in the timeline edit modal (null if none).
  // Used by TimelineView's click handler to drive the SlotEditModal.
  const [timelineModalIdx, setTimelineModalIdx] = useState(null);

  // Link picker — tracks which slot's "✨ next up" pill has its re-link
  // dropdown open. Click the ▾ caret on a linked pill to set this; the
  // dropdown lets the user re-link the slot to a different work item
  // (or auto-detect, or clear the link). Mirrors the same state in
  // TimelineView — both components have their own pill rendering paths.
  const [linkPickerForSlot, setLinkPickerForSlot] = useState(null);

  // View mode — List is the default in the main hub. Initial roadmap building
  // (MorningRoadmap) has its own Timeline+Edit view; the main hub stays focused
  // on execution. Toggle UI hidden below — only the default flip is functional.
  const viewMode = data?.roadmapViewMode === "timeline" ? "timeline" : "list";
  const setViewMode = (m) => {
    if (onUpdate) onUpdate({ ...data, roadmapViewMode: m });
  };

  // Open the create-task-from-slot modal. Triggers an AI call to draft the
  // task; if it fails, falls back to a heuristic (use slot.label as title,
  // medium priority) so the user can still create offline.
  const openCreateTaskFor = async (slotIdx) => {
    const slot = roadmap?.slots?.[slotIdx];
    if (!slot) return;
    setCreateTaskForSlot(slotIdx);
    setCreateTaskLoading(true);
    setCreateTaskError("");
    setCreateTaskDraft(null);
    try {
      const result = await suggestTaskFromSlot(slot, items);
      if (result.error) {
        // Show a soft error but still pre-fill from the slot label so the
        // user can create the task manually.
        const fallbackTitle = (slot.label || "New task").trim();
        setCreateTaskDraft({ title: fallbackTitle, priority: "medium", why: "" });
        setCreateTaskError(
          result.error === "timeout" ? "Rosie's slow today — using a quick draft." :
          result.error === "network" ? "Couldn't reach Rosie — using a quick draft." :
          "Couldn't generate a suggestion — edit below."
        );
      } else {
        setCreateTaskDraft({ title: result.title, priority: result.priority, why: result.why || "" });
      }
    } catch (e) {
      const fallbackTitle = (slot.label || "New task").trim();
      setCreateTaskDraft({ title: fallbackTitle, priority: "medium", why: "" });
      setCreateTaskError("Something went sideways — edit below to create manually.");
    } finally {
      setCreateTaskLoading(false);
    }
  };

  // Save the create-task-from-slot draft: persist the new item to data.items,
  // link the slot via matchOverrideItemId, close the modal.
  const saveCreatedTask = () => {
    if (!createTaskDraft || createTaskForSlot === null || !onUpdate || !onUpdateRoadmap) return;
    const title = (createTaskDraft.title || "").trim();
    if (!title) return;
    const newItem = {
      id: uid(),
      title,
      priority: createTaskDraft.priority || "medium",
      status: "todo",
      why: (createTaskDraft.why || "").trim(),
      tasks: [],
      taskTimes: [],
      completedTasks: [],
      category: "",
      done: "",
      outOfScope: "",
      notes: "",
      timeEstimate: "",
      scheduledDate: "",
      createdAt: Date.now(),
    };
    onUpdate({ ...data, items: [...(data?.items || []), newItem] });
    // Link the slot to the freshly created item
    const newSlots = roadmap.slots.map((s, i) =>
      i === createTaskForSlot ? { ...s, matchOverrideItemId: newItem.id } : s
    );
    onUpdateRoadmap({ ...roadmap, slots: newSlots });
    // Reset
    setCreateTaskForSlot(null);
    setCreateTaskDraft(null);
    setCreateTaskError("");
  };

  const cancelCreatedTask = () => {
    setCreateTaskForSlot(null);
    setCreateTaskDraft(null);
    setCreateTaskError("");
    setCreateTaskLoading(false);
  };

  // Follow-up handlers — update a single follow-up entry's state in
  // roadmap.followUps. Mark sent also writes lastFollowUpSentAt on the
  // parent item (used by recent-send suppression next morning).
  const updateFollowUpStatus = (fuId, status) => {
    if (!roadmap || !onUpdateRoadmap) return;
    const followUps = (roadmap.followUps || []).map(fu =>
      fu.id === fuId
        ? { ...fu, status, [status === "sent" ? "sentAt" : "skippedAt"]: Date.now() }
        : fu
    );
    onUpdateRoadmap({ ...roadmap, followUps });
    // Also stamp lastFollowUpSentAt on the parent item for suppression
    if (status === "sent" && onUpdate && data) {
      const fu = (roadmap.followUps || []).find(f => f.id === fuId);
      if (fu && fu.itemId) {
        const newItems = (data.items || []).map(i =>
          i.id === fu.itemId ? { ...i, lastFollowUpSentAt: Date.now() } : i
        );
        onUpdate({ ...data, items: newItems });
      }
    }
  };
  const markFollowUpSent = (fuId) => updateFollowUpStatus(fuId, "sent");
  const markFollowUpSkipped = (fuId) => {
    if (!roadmap || !onUpdateRoadmap) return;
    // Skip count tracking — when an item gets skipped 3+ times across days,
    // surface a "still relevant?" prompt instead of silently re-suggesting.
    // Prevents nag fatigue without losing track of the item.
    const fu = (roadmap.followUps || []).find(f => f.id === fuId);
    if (!fu) return;
    const newSkipCount = (fu.skipCount || 0) + 1;
    const followUps = (roadmap.followUps || []).map(f =>
      f.id === fuId
        ? { ...f, status: "skipped", skippedAt: Date.now(), skipCount: newSkipCount, needsRelevanceReview: newSkipCount >= 3 }
        : f
    );
    onUpdateRoadmap({ ...roadmap, followUps });
  };

  // Snooze a follow-up until a specific date. Hidden from active follow-ups
  // until snoozedUntil passes — then it resurfaces with skipCount preserved.
  // Threads the needle between "skip" (silently re-suggests next day) and
  // "dismiss" (gone forever).
  const [snoozePickerForId, setSnoozePickerForId] = useState(null);
  const snoozeFollowUp = (fuId, daysFromNow) => {
    if (!roadmap || !onUpdateRoadmap) return;
    const snoozedUntil = (() => {
      const d = new Date();
      d.setDate(d.getDate() + daysFromNow);
      return d.toISOString().slice(0, 10);
    })();
    const followUps = (roadmap.followUps || []).map(f =>
      f.id === fuId
        ? { ...f, status: "snoozed", snoozedAt: Date.now(), snoozedUntil }
        : f
    );
    onUpdateRoadmap({ ...roadmap, followUps });
    setSnoozePickerForId(null);
  };
  const snoozeFollowUpUntil = (fuId, dateISO) => {
    if (!roadmap || !onUpdateRoadmap || !dateISO) return;
    const followUps = (roadmap.followUps || []).map(f =>
      f.id === fuId
        ? { ...f, status: "snoozed", snoozedAt: Date.now(), snoozedUntil: dateISO }
        : f
    );
    onUpdateRoadmap({ ...roadmap, followUps });
    setSnoozePickerForId(null);
  };

  const updateFollowUpDraft = (fuId, draftEdits) => {
    if (!roadmap || !onUpdateRoadmap) return;
    const followUps = (roadmap.followUps || []).map(fu =>
      fu.id === fuId ? { ...fu, draftEdits } : fu
    );
    onUpdateRoadmap({ ...roadmap, followUps });
  };

  // When a follow-up has been skipped 3+ times and the user confirms it's
  // not relevant anymore, mark it dismissed (terminal). Won't reappear
  // even if the underlying item still matches the identifier criteria.
  const dismissFollowUpAsIrrelevant = (fuId) => {
    if (!roadmap || !onUpdateRoadmap) return;
    const followUps = (roadmap.followUps || []).map(fu =>
      fu.id === fuId ? { ...fu, status: "dismissed", dismissedAt: Date.now() } : fu
    );
    onUpdateRoadmap({ ...roadmap, followUps });
  };

  // When the user says "yes still relevant" to a 3+ skip prompt, clear the
  // review flag + reset skip count so they get a fresh cycle.
  const reaffirmFollowUpRelevance = (fuId) => {
    if (!roadmap || !onUpdateRoadmap) return;
    const followUps = (roadmap.followUps || []).map(fu =>
      fu.id === fuId
        ? { ...fu, needsRelevanceReview: false, skipCount: 0, status: "pending" }
        : fu
    );
    onUpdateRoadmap({ ...roadmap, followUps });
  };

  // AI-improved drafts. Lazy/on-demand — only fired when user clicks the
  // "✨ Improve with Rosie" button on a follow-up row. The result replaces
  // the user's current draft (or the heuristic if they haven't edited).
  // Stored on fu.draftEdits + fu.draftSource for transparency.
  const [improvingFollowUpId, setImprovingFollowUpId] = useState(null);
  const improveFollowUpDraft = async (fu) => {
    if (!roadmap || !onUpdateRoadmap || !fu) return;
    setImprovingFollowUpId(fu.id);
    const item = (data?.items || []).find(i => i.id === fu.itemId);
    try {
      const result = await suggestFollowUpDraft(fu, item);
      if (!result.error && result.draft) {
        const followUps = (roadmap.followUps || []).map(f =>
          f.id === fu.id ? { ...f, draftEdits: result.draft, draftSource: "ai" } : f
        );
        onUpdateRoadmap({ ...roadmap, followUps });
      }
      // On error, just bail silently — the user keeps the heuristic draft.
    } catch (e) {
      // Same — silent fallback.
    } finally {
      setImprovingFollowUpId(null);
    }
  };

  // Copy a follow-up's draft to clipboard. Shows a brief "✓ Copied!" indicator.
  const copyFollowUpDraft = async (fu) => {
    const text = (fu.draftEdits !== undefined && fu.draftEdits !== null && fu.draftEdits !== "")
      ? fu.draftEdits
      : makeHeuristicDraft(fu);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedFollowUpId(fu.id);
      setTimeout(() => setCopiedFollowUpId(prev => prev === fu.id ? null : prev), 1500);
    } catch (e) { /* clipboard may be unavailable in some contexts */ }
  };

  // Bundled passthrough for FollowUpRow (via SlotRow) — SlotRow never reads
  // these, it just spreads them into each FollowUpRow.
  const followUpProps = {
    copyFollowUpDraft, markFollowUpSent, markFollowUpSkipped,
    snoozeFollowUp, snoozeFollowUpUntil,
    improveFollowUpDraft, improvingFollowUpId, copiedFollowUpId,
    updateFollowUpDraft, reaffirmFollowUpRelevance, dismissFollowUpAsIrrelevant,
    snoozePickerForId, setSnoozePickerForId,
  };


  // Edit mode — Outlook-style shaping mode. Local state ONLY (intentionally
  // not persisted): you should wake up in execute mode each day, and only
  // flip into edit when actively reshaping. Resets when the roadmap's date
  // changes so a new day always starts un-edited.
  const [editMode, setEditMode] = useState(false);
  useEffect(() => {
    setEditMode(false);
  }, [roadmap?.date]);

  // ── SELF-HEALING TIME ALIGNMENT ──
  // Runs healSlots on every roadmap change. If the result differs from the
  // current slots, we persist the cleaned version. healSlots is idempotent —
  // when slots are already clean, this is a no-op (slotsArrayEqual catches it).
  //
  // healSlots fixes ALL known corruption types in one principled pass:
  //   • out-of-order times (sort)
  //   • duplicate locked preps at same minute (dedup, keep specific)
  //   • broken "Open work time" placeholders with backwards/giant durations
  //   • invalid slots (missing time, missing label)
  //
  // It does NOT add new content (use canonicalizeSlots / Re-apply rules for that).
  // This preserves user intent — if you delete a prep, heal won't re-add it.
  useEffect(() => {
    if (!roadmap?.slots || roadmap.slots.length < 2) return;
    if (!onUpdateRoadmap) return;
    const healed = healSlots(roadmap.slots);
    if (slotsArrayEqual(healed, roadmap.slots)) return; // already clean
    // Re-map all reconciliation maps (completedSlots, partialSlots,
    // slotReconciliation): build an old→new idxMap by matching label+type.
    const idxMap = new Map();
    for (let oldIdx = 0; oldIdx < roadmap.slots.length; oldIdx++) {
      const oldSlot = roadmap.slots[oldIdx];
      if (!oldSlot) continue;
      const newIdx = healed.findIndex(s => s.label === oldSlot.label && s.type === oldSlot.type);
      idxMap.set(oldIdx, newIdx >= 0 ? newIdx : -1);
    }
    const remapped = remapSlotMaps(roadmap, idxMap);
    onUpdateRoadmap({ ...roadmap, slots: healed, ...remapped });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadmap?.slots]);

  // Initialize from roadmap.completedSlots (persisted) — falls back to empty Set
  const [completedSlots, setCompletedSlotsRaw] = useState(() => new Set(roadmap?.completedSlots || []));
  // Sync when roadmap changes (e.g. after refine)
  useEffect(() => {
    setCompletedSlotsRaw(new Set(roadmap?.completedSlots || []));
  }, [roadmap?.completedSlots]);
  // Wrapped setter that persists changes to the roadmap object
  const setCompletedSlots = (updater) => {
    setCompletedSlotsRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (onUpdateRoadmap) {
        onUpdateRoadmap({ ...roadmap, completedSlots: Array.from(next) });
      }
      return next;
    });
  };

  // Editing state — track which slot/field is being edited inline
  const [editingSlot, setEditingSlot] = useState(null); // { idx, field: "time"|"label"|"note" }
  const [editValue, setEditValue] = useState("");
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const startEdit = (idx, field) => {
    setEditingSlot({ idx, field });
    if (field === "endTime") {
      // Initialize with the displayed end time. For fixed-duration slots, that's
      // start + intended duration. Otherwise fall back to next slot's start.
      const slot = roadmap.slots[idx];
      const startMin = parseSlotTimeMinutes(slot.time);
      const fixedDur = intendedFixedDuration(slot);
      let endMin;
      if (fixedDur != null && startMin >= 0) {
        endMin = startMin + fixedDur;
      } else {
        const next = roadmap.slots[idx + 1];
        endMin = next ? parseSlotTimeMinutes(next.time) : (startMin >= 0 ? startMin + 30 : -1);
      }
      setEditValue(endMin >= 0 ? formatSlotMinutes(endMin) : "");
    } else {
      setEditValue(roadmap.slots[idx][field] || "");
    }
  };
  const commitEdit = () => {
    if (!editingSlot) return;
    const { idx, field } = editingSlot;
    const trimmed = editValue.trim();
    if (field === "endTime") {
      // End-time edit cascades: set the NEXT slot's start time to this value
      const newEndMin = parseSlotTimeMinutes(trimmed);
      if (newEndMin < 0 || idx + 1 >= roadmap.slots.length) {
        // Last slot — there's no next, so ignore (or could create a phantom). Just bail.
        setEditingSlot(null); setEditValue(""); return;
      }
      const startMin = parseSlotTimeMinutes(roadmap.slots[idx].time);
      if (newEndMin <= startMin) {
        // Don't allow end before start
        setEditingSlot(null); setEditValue(""); return;
      }
      // Update next slot's start AND auto-lock both slots (the user has set their boundaries).
      // Also set durationMin on the edited slot so the display reflects the user's
      // chosen duration (overrides label-based defaults like Lunch=60 when shortened).
      const newDuration = newEndMin - startMin;
      const newSlots = roadmap.slots.map((s, i) => {
        if (i === idx) return { ...s, locked: true, userLocked: true, durationMin: newDuration };
        if (i === idx + 1) return { ...s, time: formatSlotMinutes(newEndMin), locked: true, userLocked: true };
        return s;
      });
      if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: newSlots });
    } else if (field === "time") {
      // Auto-lock on time edit — STRUCTURAL change (user set explicit start time)
      const newSlots = roadmap.slots.map((s, i) => i === idx ? { ...s, [field]: trimmed, locked: true, userLocked: true } : s);
      if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: newSlots });
    } else {
      // Label / note edits — COSMETIC. Don't auto-lock; the user can manually
      // lock the slot if they want their rename to survive refines + Re-apply rules.
      const newSlots = roadmap.slots.map((s, i) => i === idx ? { ...s, [field]: trimmed } : s);
      if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: newSlots });
    }
    setEditingSlot(null);
    setEditValue("");
  };
  const cancelEdit = () => { setEditingSlot(null); setEditValue(""); };

  const toggleSlotLock = (idx) => {
    const newSlots = roadmap.slots.map((s, i) => {
      if (i !== idx) return s;
      const newLocked = !s.locked;
      // userLocked tracks intentional user choice — survives refines & Re-apply rules
      return { ...s, locked: newLocked, userLocked: newLocked };
    });
    if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: newSlots });
  };
  const deleteSlot = (idx) => {
    const filtered = roadmap.slots.filter((_, i) => i !== idx);
    const newSlots = rebalanceSlotTimes(filtered, roadmap.slots);
    // Shift all reconciliation maps (completedSlots, partialSlots,
    // slotReconciliation) atomically so they stay in sync with the new slot indices.
    const shifted = shiftSlotMaps(roadmap, "delete", idx);
    if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: newSlots, ...shifted });
  };
  // Add a new slot. If `details` is omitted, opens the inline form. If
  // `details` is provided ({label, type, time, durationMin}), inserts the
  // slot directly with those values.
  const addSlot = (details) => {
    if (!details) {
      // No details — open the form (user wanted to fill it in)
      setShowAddForm(true);
      setNewSlotLabel("");
      setNewSlotType("work");
      setNewSlotTime("");
      setNewSlotDuration("");
      return;
    }
    const slots = roadmap.slots || [];
    // Find the EOD anchor (Wrap & tomorrow prep / Close for the day) and insert BEFORE it,
    // so new slots don't end up past 5:00 PM and get stripped by ensureEndOfDayBlocks.
    let insertAt = slots.length;
    for (let i = slots.length - 1; i >= 0; i--) {
      const lab = (slots[i].label || "").toLowerCase();
      if ((lab.includes("wrap") && lab.includes("tomorrow")) ||
          lab.includes("close for the day") || lab.includes("close out")) {
        insertAt = i;
      }
    }
    // Compute the new slot's start time
    let newTime;
    if (details.time && parseSlotTimeMinutes(details.time) >= 0) {
      newTime = details.time;
      // If user specified a time, find the right insertion spot chronologically
      const newMin = parseSlotTimeMinutes(details.time);
      let newInsertAt = slots.findIndex(s => parseSlotTimeMinutes(s.time) > newMin);
      if (newInsertAt < 0) newInsertAt = insertAt; // fallback to before EOD
      else newInsertAt = Math.min(newInsertAt, insertAt); // never insert past EOD
      insertAt = newInsertAt;
    } else {
      // No time given — slot in 30 min after the previous slot
      const prevSlot = insertAt > 0 ? slots[insertAt - 1] : null;
      const prevStart = prevSlot ? parseSlotTimeMinutes(prevSlot.time) : 9 * 60 - 30;
      newTime = formatSlotMinutes(prevStart + 30);
    }
    const newSlot = {
      time: newTime,
      type: details.type || "work",
      label: details.label || "New block",
      note: "",
      locked: !!details.time, // if user picked a specific time, lock it
      ...(details.time ? { userLocked: true } : {}),
      ...(details.durationMin > 0 ? { durationMin: details.durationMin } : {}),
    };
    const newSlots = [...slots.slice(0, insertAt), newSlot, ...slots.slice(insertAt)];
    // Shift all reconciliation maps so they stay aligned with the new index layout.
    const shifted = shiftSlotMaps(roadmap, "insert", insertAt);
    if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: newSlots, ...shifted });
  };

  const commitNewSlot = () => {
    const label = newSlotLabel.trim();
    if (!label) return;
    // Parse duration if provided (accept formats like "30", "30m", "1h", "1h30m", "45min")
    let durationMin = 0;
    if (newSlotDuration.trim()) {
      const dur = newSlotDuration.trim().toLowerCase();
      const hMatch = dur.match(/(\d+)\s*h/);
      const mMatch = dur.match(/(\d+)\s*m(?:in)?(?!\w)/) || (!hMatch && dur.match(/^(\d+)$/));
      if (hMatch) durationMin += parseInt(hMatch[1], 10) * 60;
      if (mMatch) durationMin += parseInt(mMatch[1], 10);
    }
    addSlot({
      label,
      type: newSlotType,
      time: newSlotTime.trim(),
      durationMin,
    });
    // Reset form
    setShowAddForm(false);
    setNewSlotLabel("");
    setNewSlotType("work");
    setNewSlotTime("");
    setNewSlotDuration("");
  };

  const cancelNewSlot = () => {
    setShowAddForm(false);
    setNewSlotLabel("");
    setNewSlotType("work");
    setNewSlotTime("");
    setNewSlotDuration("");
  };
  const cycleSlotType = (idx) => {
    const types = SLOT_TYPES;
    const cur = roadmap.slots[idx].type || "work";
    const next = types[(types.indexOf(cur) + 1) % types.length];
    // Auto-lock — type change is an intentional user action
    const newSlots = roadmap.slots.map((s, i) => i === idx ? { ...s, type: next, locked: true, userLocked: true } : s);
    if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: newSlots });
  };

  // Drag handlers — drag a row by its handle, drop to reorder + auto-rebalance
  const onDragStart = (e, idx) => {
    setDraggingIdx(idx);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(idx));
    }
  };
  const onDragEnd = () => { setDraggingIdx(null); setDragOverIdx(null); };
  const onDragOverRow = (e, idx) => { e.preventDefault(); setDragOverIdx(idx); };
  const onDropRow = (e, idx) => {
    e.preventDefault();
    if (draggingIdx === null || draggingIdx === idx) { onDragEnd(); return; }
    // Build oldIdx → newIdx mapping based on the move (independent of rebalance,
    // which creates new slot objects and breaks reference/time-based matching).
    const fromIdx = draggingIdx;
    const toIdx = idx;
    const buildIdxMap = (len, from, to) => {
      const map = new Map();
      for (let i = 0; i < len; i++) {
        if (i === from) map.set(i, to);
        else if (from < to) {
          if (i > from && i <= to) map.set(i, i - 1);
          else map.set(i, i);
        } else {
          if (i >= to && i < from) map.set(i, i + 1);
          else map.set(i, i);
        }
      }
      return map;
    };
    const idxMap = buildIdxMap(roadmap.slots.length, fromIdx, toIdx);
    const newSlots = reorderAndRebalanceSlots(roadmap.slots, fromIdx, toIdx);
    const newCompleted = Array.from(completedSlots)
      .map(i => idxMap.get(i))
      .filter(i => i !== undefined && i !== -1);
    if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: newSlots, completedSlots: newCompleted });
    onDragEnd();
  };

  // ── Resize: commit a new durationMin for slot idx ──
  // Mirrors the existing endTime-edit commit path: set the slot's durationMin +
  // lock it, push the next slot's start time. Pipeline (healSlots/canonicalize)
  // absorbs any downstream overlap on the next cycle.
  const resizeSlotDuration = (idx, newDurationMin) => {
    const slot = roadmap.slots[idx];
    if (!slot) return;
    const startMin = parseSlotTimeMinutes(slot.time);
    if (startMin < 0) return;
    const newDuration = Math.max(5, Math.round(newDurationMin / 5) * 5);
    const newEndMin = startMin + newDuration;
    const newSlots = roadmap.slots.map((s, i) => {
      if (i === idx) return { ...s, locked: true, userLocked: true, durationMin: newDuration };
      if (i === idx + 1) return { ...s, time: formatSlotMinutes(newEndMin), locked: true, userLocked: true };
      return s;
    });
    if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: newSlots });
  };

  // Computes the currently-effective duration of slot idx (in minutes).
  const getSlotEffectiveDuration = (idx) => {
    const slot = roadmap.slots[idx];
    if (!slot) return null;
    const startMin = parseSlotTimeMinutes(slot.time);
    if (startMin < 0) return null;
    const fixedDur = intendedFixedDuration(slot);
    if (fixedDur != null) return fixedDur;
    const next = roadmap.slots[idx + 1];
    if (next) {
      const nextStart = parseSlotTimeMinutes(next.time);
      if (nextStart > startMin) return nextStart - startMin;
    }
    return slot.durationMin || 30;
  };
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const slots = roadmap.slots || [];
  let currentIdx = -1;
  for (let i = 0; i < slots.length; i++) {
    const t = parseSlotTimeMinutes(slots[i].time);
    if (t <= currentMinutes) currentIdx = i;
    else break;
  }

  const handleRefine = async () => {
    if (!feedback.trim() || refining) return;
    setRefining(true);
    setRefineActions([]);
    try {
      const fb = feedback.trim();
      // Run task-tool Rosie + roadmap refine in parallel — one input handles both kinds of changes.
      const dataRef = { current: data || { items: items || [] } };
      const syncedUpdate = (next) => { dataRef.current = next; if (onUpdate) onUpdate(next); };

      const taskToolPrompt = `You are Rosie. Lexy is looking at her embedded roadmap card and just typed a refinement. Some refinements are PURELY about reshaping the roadmap (move break, swap blocks, add 1:1 prep) — for those, do NOTHING; reply with empty text and call no tools. But if she ALSO mentions task changes ("verafin charter is done", "add to tasks: prep agenda", "I finished X"), call the appropriate tools.

Tools: create_item, add_task_to_item, update_item_status, check_off_task, add_to_parking_lot, catch_spiral.

CRITICAL: Do NOT narrate. Do NOT write [calling X] syntax. Just call the tools that apply, or call NONE if the message is purely about the roadmap.`;

      const promises = [refineRoadmap(roadmap, items, energy, mood, fb)];
      if (onUpdate) {
        promises.push(askRosieWithTools({
          messages: [{ role: "user", content: fb }],
          systemPrompt: taskToolPrompt,
          getLatestData: () => dataRef.current,
          onDataUpdate: syncedUpdate,
        }));
      }

      const settled = await Promise.allSettled(promises);
      const refineResult = settled[0];
      const toolResult = settled[1];

      if (refineResult.status === "fulfilled" && refineResult.value) onUpdateRoadmap(refineResult.value);
      const actions = toolResult && toolResult.status === "fulfilled" ? (toolResult.value.actions || []) : [];
      if (actions.length) setRefineActions(actions);
      setFeedback("");
    } catch {}
    setRefining(false);
  };

  const toggleSlotComplete = (idx) => {
    const slot = (roadmap?.slots || [])[idx];
    setCompletedSlots(prev => {
      const next = new Set(prev);
      const wasComplete = next.has(idx);
      if (wasComplete) next.delete(idx);
      else next.add(idx);
      // Show a brief toast confirming the click landed — without this, when a
      // slot auto-hides under the "completed earlier" pill, the click feels invisible.
      const label = slot?.label || "Block";
      const shortLabel = label.length > 36 ? label.slice(0, 33) + "…" : label;
      setCompletionToast(wasComplete ? `↩︎ Unmarked: ${shortLabel}` : `✓ Marked done: ${shortLabel}`);
      if (completionToastRef.current) clearTimeout(completionToastRef.current);
      completionToastRef.current = setTimeout(() => setCompletionToast(""), 2200);
      return next;
    });

    // Time-estimate accuracy tracking — only on TRANSITION to complete (not on
    // un-mark), only for work slots, only when estimated duration is known.
    // Skip if "actual" would exceed 4 hours (almost certainly means user
    // marked it complete days later — not a real measurement).
    try {
      const isNowComplete = !(completedSlots.has(idx));
      if (isNowComplete && slot && slot.type === "work" && slot.durationMin && slot.time && data && onUpdate) {
        const startMin = parseSlotTimeMinutes(slot.time);
        if (typeof startMin === "number" && !Number.isNaN(startMin)) {
          const now = new Date();
          const nowMin = now.getHours() * 60 + now.getMinutes();
          const actualMin = nowMin - startMin;
          if (actualMin > 0 && actualMin < 240) {
            const entry = {
              date: now.toISOString().slice(0, 10),
              slotLabel: slot.label || "",
              slotType: slot.type,
              estimatedMin: slot.durationMin,
              actualMin,
              capturedAt: Date.now(),
            };
            // Keep history bounded — most recent 500 entries.
            const newHistory = [...(data.timingHistory || []), entry].slice(-500);
            onUpdate({ ...data, timingHistory: newHistory });
          }
        }
      }
    } catch (e) { /* timing capture is best-effort, never blocks the toggle */ }
  };

  // Try to match a slot label to an actual item (so user can click to Focus).
  // Uses keyword overlap — looks for shared meaningful words (>=3 chars), case-insensitive,
  // ignoring common roadmap words like "draft", "start", "continue", "review", etc.
  const findMatchingItem = (label, slot) => {
    // ── Manual override takes priority over keyword matching ──
    // slot.matchOverrideItemId values: <itemId> = explicit pick, "__none__" = user
    // unlinked, undefined/null = fall through to keyword match. Lets Lexy correct
    // wrong auto-detections by clicking the "next up:" pill.
    if (slot && slot.matchOverrideItemId) {
      if (slot.matchOverrideItemId === "__none__") return null;
      const pinned = items.find(it => it.id === slot.matchOverrideItemId);
      if (pinned) return pinned;
      // Override points to a deleted item — fall through to auto-detect
    }
    if (!label) return null;
    const ignoreWords = new Set([
      "draft", "start", "starts", "continue", "continues", "review", "reviewing",
      "work", "session", "block", "time", "morning", "afternoon", "evening", "break",
      "stretch", "reset", "settle", "wrap", "and", "the", "for", "with", "from",
      "into", "on", "to", "a", "an", "is", "of", "as", "at", "by", "polish", "wrap",
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
      // Title overlap weighs more than just task overlap
      const titleOverlap = titleTokens.filter(t => labelTokens.has(t)).length;
      score += titleOverlap;
      if (score > bestScore) { bestScore = score; best = i; }
    }
    return bestScore >= 1 ? best : null;
  };

  return (
    <div className="card fade" style={{ padding: collapsed ? "12px 18px" : "16px 20px", marginBottom: 4 }}>
      {/* Header — always visible */}
      <div onClick={() => setCollapsed(!collapsed)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div className="jost" style={{ fontSize: 10, letterSpacing: 2.5, color: "rgba(184,109,133,0.7)", textTransform: "uppercase", fontWeight: 600, marginBottom: collapsed ? 0 : 4 }}>
            🌸 Today's Roadmap
          </div>
          {!collapsed && (
            <div className="cg" style={{ fontSize: 18, color: "#4a3540" }}>{roadmap.headline || "Your day"}</div>
          )}
          {collapsed && currentIdx >= 0 && slots[currentIdx] && (
            <div className="jost" style={{ fontSize: 13, color: "#4a3540", marginTop: 2 }}>
              <span style={{ color: "#b86d85", fontWeight: 600 }}>Now:</span> {slots[currentIdx].label} <span style={{ color: "rgba(74,53,64,0.4)", fontSize: 11 }}>· {slots[currentIdx].time}</span>
            </div>
          )}
        </div>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(184,109,133,0.6)", fontSize: 14, padding: "4px 8px" }}>
          {collapsed ? "▼" : "▲"}
        </button>
      </div>

      {!collapsed && (
        <>
          {roadmap.greeting && (
            <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.65)", fontStyle: "italic", marginTop: 6, marginBottom: 12, lineHeight: 1.5 }}>{roadmap.greeting}</p>
          )}

          {/* Rebalance — small repair button that flattens gaps and aligns
              unlocked slots end-to-end. Non-destructive: doesn't change slot
              durations or delete anything. Useful after snoozes that leave
              the schedule a little messy. */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <button
              onClick={() => {
                if (!onUpdateRoadmap || !roadmap?.slots) return;
                const rebalanced = rebalanceRoadmap(roadmap.slots);
                onUpdateRoadmap({ ...roadmap, slots: rebalanced });
              }}
              className="jost"
              title="Fix timing: align slots, fill gaps with 'Open work time' placeholders. Doesn't change durations or delete anything."
              style={{
                background: "rgba(184,160,212,0.1)",
                border: "1px solid rgba(184,160,212,0.3)",
                borderRadius: 8,
                padding: "4px 10px",
                fontSize: 11,
                color: "#9878b8",
                cursor: "pointer",
                fontWeight: 500,
                letterSpacing: 0.3,
              }}
            >↻ Rebalance timing</button>
          </div>

          {/* Surface C — Gentle reconciliation card. Lists past slots that
              haven't been marked done OR explicitly reconciled (skipped,
              partial, elsewhere). One inline form per row. Collapsed by
              default; click the count pill to expand. The whole card is
              hidden when there's nothing to reconcile, so it doesn't add
              persistent UI weight when you're keeping up. */}
          {(() => {
            const nowMin = (() => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); })();
            const unreconciled = getUnreconciledPastSlots(roadmap, nowMin);
            if (unreconciled.length === 0) return null;
            return (
              <div style={{ marginTop: 10 }}>
                <button
                  onClick={() => setShowReconciliation(prev => !prev)}
                  className="jost"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
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
                  title="Mark how these past blocks actually went — done, partial, skipped, or did something else"
                >
                  <span>🌿 ({unreconciled.length}) past block{unreconciled.length === 1 ? "" : "s"} · quick reconcile?</span>
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{showReconciliation ? "▴ hide" : "▾ show"}</span>
                </button>
                {showReconciliation && (
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                    {unreconciled.map(({ idx, slot, startMin, endMin }) => {
                      const startLabel = formatSlotMinutes(startMin);
                      const endLabel = formatSlotMinutes(endMin);
                      return (
                        <div
                          key={`recon-${idx}`}
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
                              {startLabel} – {endLabel}
                            </div>
                          </div>
                          <ReconciliationForm
                            slot={slot}
                            items={items}
                            onSubmit={(choice) => {
                              if (onUpdateRoadmap) onUpdateRoadmap(applyReconciliation(roadmap, idx, choice));
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Brief toast when a slot is checked off — gives visible feedback since
              completed slots auto-hide. Without this, clicks feel invisible. */}
          {completionToast && (
            <div
              className="fade jost"
              style={{
                marginTop: 10,
                background: "rgba(158,184,154,0.18)",
                border: "1px solid rgba(158,184,154,0.4)",
                borderRadius: 9,
                padding: "8px 12px",
                fontSize: 12,
                color: "#5e8f5c",
                fontWeight: 500,
                textAlign: "center",
              }}
            >{completionToast}</div>
          )}

          {/* Slot timeline */}
          {(() => {
            // "Past blocks" = anything completed OR explicitly reconciled.
            // Single source of truth: union of completedSlots and slotReconciliation keys.
            const reconKeys = Object.keys(roadmap?.slotReconciliation || {}).map(Number);
            const allPastIndices = new Set([...completedSlots, ...reconKeys]);
            const pastCount = allPastIndices.size;
            if (pastCount === 0) return null;
            return (
              <button
                onClick={() => setShowCompleted(s => !s)}
                className="jost"
                style={{ background: "rgba(158,184,154,0.08)", border: "1px solid rgba(158,184,154,0.25)", borderRadius: 9, padding: "6px 12px", fontSize: 11, color: "#7a9e78", cursor: "pointer", fontWeight: 500, marginTop: 10, display: "flex", alignItems: "center", gap: 6, width: "100%", justifyContent: "space-between" }}
                title="Past blocks — completed, partial, skipped, or did-something-else. Grouped by how they were marked."
              >
                <span>📜 Past blocks ({pastCount})</span>
                <span style={{ fontSize: 10, opacity: 0.7 }}>{showCompleted ? "▴ hide" : "▾ show"}</span>
              </button>
            );
          })()}

          {/* Grouped past-blocks section — renders when the fold is expanded.
              Groups: ✓ Done / ◐ Partial / 🔀 Did something else / ⊘ Skipped.
              "Done" includes anything in completedSlots that has no reconciliation
              entry (e.g. checkbox-checked) AND anything with status="done".
              Reconciliation status takes precedence — a partial slot lives in
              Partial even though it's also in completedSlots. */}
          {showCompleted && (() => {
            const reconMap = roadmap?.slotReconciliation || {};
            const reconKeys = Object.keys(reconMap).map(Number);
            const allPastIndices = new Set([...completedSlots, ...reconKeys]);
            if (allPastIndices.size === 0) return null;
            const grouped = { done: [], partial: [], elsewhere: [], skipped: [] };
            for (const idx of allPastIndices) {
              const slot = slots[idx];
              if (!slot) continue;
              const recon = reconMap[idx];
              if (recon?.status === "partial") grouped.partial.push({ idx, slot, recon });
              else if (recon?.status === "elsewhere") grouped.elsewhere.push({ idx, slot, recon });
              else if (recon?.status === "skipped") grouped.skipped.push({ idx, slot, recon });
              else grouped.done.push({ idx, slot, recon }); // covers checked-without-recon + status==="done"
            }
            // Sort each group chronologically by start time
            const byStart = (a, b) => parseSlotTimeMinutes(a.slot.time) - parseSlotTimeMinutes(b.slot.time);
            for (const k of Object.keys(grouped)) grouped[k].sort(byStart);

            const renderGroup = (statusKey, entries) => {
              if (entries.length === 0) return null;
              const conf = RECON_STATUSES[statusKey];
              return (
                <div key={statusKey} style={{ marginBottom: 12 }}>
                  <div className="jost" style={{
                    fontSize: 10, letterSpacing: 1.2, fontWeight: 600,
                    color: conf.color, textTransform: "uppercase",
                    marginBottom: 6, paddingLeft: 2,
                  }}>
                    {conf.emoji} {conf.label} ({entries.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {entries.map(({ idx, slot, recon }) => {
                      const startMin = parseSlotTimeMinutes(slot.time);
                      const next = slots[idx + 1];
                      const nextStart = next ? parseSlotTimeMinutes(next.time) : -1;
                      const fixedDur = intendedFixedDuration(slot);
                      const endMin = fixedDur != null
                        ? startMin + fixedDur
                        : (nextStart > startMin ? nextStart : startMin + 30);
                      const detail = recon?.status === "partial"
                        ? `${recon.percent || 50}%`
                        : recon?.status === "elsewhere" && recon.actualWork
                          ? `did: ${recon.actualWork}`
                          : null;
                      return (
                        <div
                          key={`past-${idx}`}
                          style={{
                            display: "flex", alignItems: "baseline", gap: 8,
                            background: conf.bg, border: `1px solid ${conf.border}`,
                            borderRadius: 7, padding: "5px 10px",
                            fontSize: 11.5,
                          }}
                        >
                          <span className="jost" style={{ color: conf.color, fontWeight: 600, whiteSpace: "nowrap", fontSize: 10, minWidth: 90 }}>
                            {formatSlotMinutes(startMin)} – {formatSlotMinutes(endMin)}
                          </span>
                          <span className="jost" style={{ color: "#4a3540", flex: 1, fontWeight: 500 }}>
                            {slot.label}
                          </span>
                          {detail && (
                            <span className="jost" style={{ color: conf.color, fontSize: 10, fontStyle: "italic", whiteSpace: "nowrap", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>
                              {detail}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            };

            return (
              <div style={{
                marginTop: 8, padding: "12px 14px",
                background: "rgba(158,184,154,0.04)",
                border: "1px solid rgba(158,184,154,0.18)",
                borderRadius: 11,
              }}>
                {renderGroup("done", grouped.done)}
                {renderGroup("partial", grouped.partial)}
                {renderGroup("elsewhere", grouped.elsewhere)}
                {renderGroup("skipped", grouped.skipped)}
              </div>
            );
          })()}

          {/* View mode toggle hidden in the main hub. Timeline+Edit lives on
              the build screen (MorningRoadmap). Slot click → edit modal still
              works inline for tweaks. Code paths kept intact for easy revert. */}

          {/* Timeline view — visual scheduler. Position-IS-time means corruption
              becomes visually obvious (overlapping blocks) instead of silently
              showing wrong times. The legacy List view is still available below
              via the toggle. */}
          {viewMode === "timeline" && (
            <>
              <TimelineView
                slots={slots}
                currentMin={currentMinutes}
                completedSlots={completedSlots}
                currentIdx={currentIdx}
                findMatchingItem={findMatchingItem}
                mode={editMode ? "edit" : "execute"}
                onClickSlot={(idx) => setTimelineModalIdx(idx)}
                onToggleLock={(idx) => toggleSlotLock(idx)}
                onDelete={(idx) => deleteSlot(idx)}
                onToggleDone={(idx) => toggleSlotComplete(idx)}
                onAddSlotAtMinute={(min, opts) => {
                  // Execute mode passes only `min` → defaults to a 30-min Work block.
                  // Edit mode's inline picker passes `opts: { type, durationMin }`.
                  const t = (opts && opts.type) || "work";
                  const labels = { work: "New block", meeting: "Meeting", break: "Break", buffer: "Buffer" };
                  addSlot({
                    time: formatSlotMinutes(min),
                    label: labels[t] || "New block",
                    type: t,
                    durationMin: (opts && opts.durationMin) || 30,
                  });
                }}
                onSlotMove={(idx, newStartMin) => {
                  // User dragged a slot to a new time. Update its time + lock it
                  // (drag is an intentional move, so respect it on next refine).
                  // canonicalizeSlots/healSlots will run on next render and sort
                  // it into the right array position automatically.
                  if (!onUpdateRoadmap) return;
                  const newSlots = roadmap.slots.map((s, i) =>
                    i === idx ? { ...s, time: formatSlotMinutes(newStartMin), locked: true, userLocked: true } : s
                  );
                  onUpdateRoadmap({ ...roadmap, slots: newSlots });
                }}
                onSlotResize={(idx, newDurationMin) => {
                  if (!onUpdateRoadmap) return;
                  const newSlots = roadmap.slots.map((s, i) =>
                    i === idx ? { ...s, durationMin: newDurationMin, locked: true, userLocked: true } : s
                  );
                  onUpdateRoadmap({ ...roadmap, slots: newSlots });
                }}
                onFocusItem={(item) => onFocus && onFocus(item)}
                onPastMeetingClick={onPastMeetingClick}
              />
              {/* Edit modal — opens when a slot is clicked in timeline view.
                  In edit mode, required breaks (auto-placed lunch + brain breaks)
                  open with restrictedBreak=true so time/duration/delete are
                  disabled — they can only be renamed. */}
              {timelineModalIdx !== null && slots[timelineModalIdx] && (() => {
                const s = slots[timelineModalIdx];
                const isRequiredBreakSlot = s.type === "break" && !!s.locked && !s.userLocked;
                return (
                <SlotEditModal
                  slot={s}
                  idx={timelineModalIdx}
                  isComplete={completedSlots.has(timelineModalIdx)}
                  restrictedBreak={editMode && isRequiredBreakSlot}
                  onSave={(updated) => {
                    if (!onUpdateRoadmap) return;
                    const newSlots = roadmap.slots.map((s, i) => i === timelineModalIdx ? updated : s);
                    onUpdateRoadmap({ ...roadmap, slots: newSlots });
                  }}
                  onDelete={() => deleteSlot(timelineModalIdx)}
                  onToggleLock={() => toggleSlotLock(timelineModalIdx)}
                  onToggleDone={() => toggleSlotComplete(timelineModalIdx)}
                  onClose={() => setTimelineModalIdx(null)}
                />
                );
              })()}
            </>
          )}

          {/* Legacy list view */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10, marginBottom: 14 }}>
            {viewMode === "list" && slots.map((slot, idx) => (
              <SlotRow
                key={idx}
                slot={slot}
                idx={idx}
                currentIdx={currentIdx}
                currentMinutes={currentMinutes}
                completedSlots={completedSlots}
                draggingIdx={draggingIdx}
                dragOverIdx={dragOverIdx}
                editingSlot={editingSlot}
                editValue={editValue}
                setEditValue={setEditValue}
                expandedFollowUpSlot={expandedFollowUpSlot}
                setExpandedFollowUpSlot={setExpandedFollowUpSlot}
                linkPickerForSlot={linkPickerForSlot}
                setLinkPickerForSlot={setLinkPickerForSlot}
                slots={slots}
                findMatchingItem={findMatchingItem}
                getSlotEffectiveDuration={getSlotEffectiveDuration}
                startEdit={startEdit}
                commitEdit={commitEdit}
                cancelEdit={cancelEdit}
                cycleSlotType={cycleSlotType}
                deleteSlot={deleteSlot}
                resizeSlotDuration={resizeSlotDuration}
                toggleSlotComplete={toggleSlotComplete}
                toggleSlotLock={toggleSlotLock}
                openCreateTaskFor={openCreateTaskFor}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOverRow={onDragOverRow}
                onDropRow={onDropRow}
                roadmap={roadmap}
                onUpdateRoadmap={onUpdateRoadmap}
                onUpdate={onUpdate}
                data={data}
                items={items}
                onFocus={onFocus}
                onMeetingFocus={onMeetingFocus}
                onPastMeetingClick={onPastMeetingClick}
                followUpProps={followUpProps}
              />
            ))}

            {/* + Add slot form (inline) — shown when showAddForm is true */}
            {showAddForm && (
              <div style={{ marginTop: 8, padding: "12px 14px", background: "rgba(212,130,154,0.05)", border: "1px solid rgba(212,130,154,0.25)", borderRadius: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                {/* Type selector pills */}
                <div style={{ display: "flex", gap: 5 }}>
                  {[
                    { val: "work", label: "🌿 Work", color: "rgba(168,184,154,0.4)", fg: "#7a9e78" },
                    { val: "break", label: "☕ Break", color: "rgba(158,184,154,0.4)", fg: "#5a8e7a" },
                    { val: "buffer", label: "🪞 Buffer", color: "rgba(196,168,130,0.4)", fg: "#9a7850" },
                    { val: "blocked", label: "🚫 Blocked", color: "rgba(196,126,138,0.4)", fg: "#b86d85" },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setNewSlotType(opt.val)}
                      className="jost"
                      style={{
                        flex: 1,
                        padding: "5px 8px",
                        background: newSlotType === opt.val ? `rgba(212,130,154,0.18)` : "rgba(255,255,255,0.5)",
                        border: "1px solid " + (newSlotType === opt.val ? opt.color : "rgba(212,130,154,0.2)"),
                        borderRadius: 6,
                        color: newSlotType === opt.val ? opt.fg : "rgba(74,53,64,0.55)",
                        cursor: "pointer",
                        fontSize: 10,
                        fontWeight: newSlotType === opt.val ? 600 : 500,
                      }}
                    >{opt.label}</button>
                  ))}
                </div>

                <input
                  className="ifield jost"
                  placeholder="What's this block? (e.g. Build backlog)"
                  value={newSlotLabel}
                  onChange={e => setNewSlotLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") commitNewSlot(); if (e.key === "Escape") cancelNewSlot(); }}
                  style={{ fontSize: 12, padding: "7px 11px" }}
                  autoFocus
                />

                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    type="text"
                    className="ifield jost"
                    placeholder="Optional time (e.g. 2pm)"
                    value={newSlotTime}
                    onChange={e => setNewSlotTime(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") commitNewSlot(); if (e.key === "Escape") cancelNewSlot(); }}
                    style={{ fontSize: 11, padding: "6px 10px", flex: 2 }}
                  />
                  <input
                    type="text"
                    className="ifield jost"
                    placeholder="Duration (e.g. 30m)"
                    value={newSlotDuration}
                    onChange={e => setNewSlotDuration(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") commitNewSlot(); if (e.key === "Escape") cancelNewSlot(); }}
                    style={{ fontSize: 11, padding: "6px 10px", flex: 1 }}
                  />
                </div>

                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button onClick={cancelNewSlot} className="jost" style={{ background: "none", border: "1px solid rgba(74,53,64,0.15)", color: "rgba(74,53,64,0.55)", cursor: "pointer", fontSize: 10, padding: "5px 12px", borderRadius: 6 }}>Cancel</button>
                  <button onClick={commitNewSlot} disabled={!newSlotLabel.trim()} className="jost" style={{ background: newSlotLabel.trim() ? "linear-gradient(135deg, rgba(232,160,180,0.25), rgba(212,130,154,0.2))" : "rgba(212,130,154,0.08)", border: "1px solid " + (newSlotLabel.trim() ? "rgba(212,130,154,0.4)" : "rgba(212,130,154,0.15)"), color: newSlotLabel.trim() ? "#b86d85" : "rgba(184,109,133,0.5)", cursor: newSlotLabel.trim() ? "pointer" : "not-allowed", fontSize: 10, padding: "5px 14px", borderRadius: 6, fontWeight: 600 }}>Add</button>
                </div>
              </div>
            )}

            {/* + Add slot + Reset times + Re-apply rules buttons */}
            {!showAddForm && (
            <div style={{ display: "flex", gap: 6, marginTop: 2, flexWrap: "wrap" }}>
              <button
                onClick={() => addSlot()}
                className="jost"
                style={{ flex: 1, minWidth: 120, background: "rgba(255,255,255,0.5)", border: "1px dashed rgba(212,130,154,0.3)", borderRadius: 9, padding: "7px 10px", fontSize: 11, color: "rgba(184,109,133,0.7)", cursor: "pointer", textAlign: "center", fontWeight: 500 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(212,130,154,0.5)"; e.currentTarget.style.color = "#b86d85"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(212,130,154,0.3)"; e.currentTarget.style.color = "rgba(184,109,133,0.7)"; }}
              >+ Add a slot</button>
              <button
                onClick={() => {
                  const newSlots = rebalanceSlotTimes(roadmap.slots, roadmap.slots);
                  if (onUpdateRoadmap) onUpdateRoadmap({ ...roadmap, slots: newSlots });
                }}
                title="Recalculate times based on natural slot durations (locked slots stay anchored)"
                className="jost"
                style={{ background: "rgba(255,255,255,0.5)", border: "1px dashed rgba(196,168,130,0.3)", borderRadius: 9, padding: "7px 12px", fontSize: 11, color: "rgba(154,120,80,0.75)", cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(196,168,130,0.5)"; e.currentTarget.style.color = "#9a7850"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(196,168,130,0.3)"; e.currentTarget.style.color = "rgba(154,120,80,0.75)"; }}
              >📌 Reset times</button>
              <button
                onClick={() => {
                  if (!onUpdateRoadmap) return;
                  // Strip locks UNLESS user-explicitly-locked (userLocked is the
                  // user's intentional choice and survives Re-apply).
                  let cleaned = (roadmap.slots || []).map(s => {
                    if (s.userLocked) return { ...s, locked: true };
                    return { ...s, locked: false };
                  });

                  // Migration pass: rewrite legacy "Breather after X" → "Buffer after X"
                  // and collapse any "Prep for Prep for X" labels that crept in.
                  // Other dedup logic is now handled by canonicalizeSlots / healSlots.
                  cleaned = cleaned.map(s => {
                    let label = s.label || "";
                    while (/^prep for prep for /i.test(label)) {
                      label = label.replace(/^prep for prep for /i, "Prep for ");
                    }
                    if (/^breather after /i.test(label)) {
                      label = label.replace(/^breather after /i, "Buffer after ");
                      return { ...s, label, type: "buffer" };
                    }
                    if (/^breather for /i.test(label)) {
                      label = label.replace(/^breather for /i, "Buffer after ");
                      return { ...s, label, type: "buffer" };
                    }
                    return { ...s, label };
                  });

                  // ─── ONE-CALL CANONICAL PIPELINE ───
                  // canonicalizeSlots replaces 11+ separate steps. Idempotent.
                  // Drops broken placeholders, dedups duplicate preps, sorts by time,
                  // applies all rule helpers, rebalances, fills phantom gaps.
                  cleaned = canonicalizeSlots(cleaned);
                  onUpdateRoadmap({ ...roadmap, slots: cleaned });
                }}
                title="Clean up today's slots: enforce required breaks, EOD blocks, meeting prep/breathers, and strip spurious locks. No regeneration."
                className="jost"
                style={{ background: "rgba(255,255,255,0.5)", border: "1px dashed rgba(120,168,168,0.4)", borderRadius: 9, padding: "7px 12px", fontSize: 11, color: "#5a8888", cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(120,168,168,0.65)"; e.currentTarget.style.color = "#3d6a6a"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(120,168,168,0.4)"; e.currentTarget.style.color = "#5a8888"; }}
              >🍄 Re-apply rules</button>
            </div>
            )}
          </div>

          {/* Today's advice */}
          {(roadmap.todayAdvice || roadmap.protectedTime) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              {roadmap.todayAdvice && (
                <div style={{ background: "rgba(232,160,180,0.07)", border: "1px solid rgba(212,130,154,0.18)", borderRadius: 8, padding: "8px 10px" }}>
                  <div className="jost" style={{ fontSize: 9, letterSpacing: 1.5, color: "rgba(184,109,133,0.75)", textTransform: "uppercase", marginBottom: 3, fontWeight: 600 }}>Today's approach</div>
                  <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.75)", lineHeight: 1.5 }}>{roadmap.todayAdvice}</div>
                </div>
              )}
              {roadmap.protectedTime && (
                <div style={{ background: "rgba(196,168,130,0.07)", border: "1px solid rgba(196,168,130,0.2)", borderRadius: 8, padding: "8px 10px" }}>
                  <div className="jost" style={{ fontSize: 9, letterSpacing: 1.5, color: "rgba(154,120,80,0.85)", textTransform: "uppercase", marginBottom: 3, fontWeight: 600 }}>Protect your energy</div>
                  <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.75)", lineHeight: 1.5 }}>{roadmap.protectedTime}</div>
                </div>
              )}
            </div>
          )}

          {/* Refine chat with Rosie — handles roadmap + tasks in one input */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              className="ifield jost"
              placeholder="Tell Rosie… 'move break to 11', 'verafin done, add prep task', 'I finished X'"
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleRefine(); }}
              disabled={refining}
              style={{ flex: 1, fontSize: 11, padding: "7px 11px", opacity: refining ? 0.5 : 1 }}
            />
            <button
              onClick={handleRefine}
              disabled={!feedback.trim() || refining}
              className="jost"
              style={{
                background: refining ? "rgba(212,130,154,0.15)" : (feedback.trim() ? "rgba(212,130,154,0.18)" : "rgba(212,130,154,0.06)"),
                border: "1px solid " + (refining || !feedback.trim() ? "rgba(212,130,154,0.2)" : "rgba(212,130,154,0.4)"),
                color: feedback.trim() && !refining ? "#b86d85" : "rgba(184,109,133,0.5)",
                cursor: (!feedback.trim() || refining) ? "not-allowed" : "pointer",
                fontSize: 11, padding: "0 12px", borderRadius: 7, fontWeight: 600, flexShrink: 0,
              }}
            >{refining ? <span className="pulse">🌸…</span> : "Adjust"}</button>
          </div>
          {refineActions.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
              {refineActions.map((a, i) => (
                <div key={i} className="jost fade" style={{ fontSize: 10, color: "#7a9e78", background: "rgba(158,184,154,0.12)", border: "1px solid rgba(158,184,154,0.25)", borderRadius: 7, padding: "4px 9px" }}>{a}</div>
              ))}
            </div>
          )}

          {/* Close for the day — wraps the workday with the EOD reflection flow */}
          {onCloseDay && (
            <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
              <button
                onClick={onCloseDay}
                className="jost"
                title="Wrap up your workday with a reflection"
                style={{ background: "rgba(184,160,212,0.12)", border: "1px solid rgba(184,160,212,0.4)", color: "#9878b8", fontSize: 11, padding: "6px 16px", borderRadius: 18, cursor: "pointer", fontWeight: 500, transition: "all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(184,160,212,0.2)"; e.currentTarget.style.borderColor = "rgba(184,160,212,0.55)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(184,160,212,0.12)"; e.currentTarget.style.borderColor = "rgba(184,160,212,0.4)"; }}
              >🌙 Close for the day</button>
            </div>
          )}
        </>
      )}

      {/* Create-task confirmation modal — appears when user clicks the
          "✨ create task for this?" pill on an unmatched work block.
          Renders inside RoadmapCard so it has access to roadmap + items
          for the slot info display. Uses the standard modal-bg overlay. */}
      {createTaskForSlot !== null && (() => {
        const slot = roadmap?.slots?.[createTaskForSlot];
        if (!slot) return null;
        return (
          <div className="modal-bg" onClick={cancelCreatedTask}>
            <div className="modal fade" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
              <div className="jost" style={{ fontSize: 10, letterSpacing: 2.5, color: "rgba(152,120,184,0.7)", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
                ✨ create task for this block
              </div>
              <div style={{ background: "rgba(184,160,212,0.06)", border: "1px solid rgba(184,160,212,0.25)", borderRadius: 9, padding: "8px 12px", marginBottom: 14 }}>
                <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)", letterSpacing: 0.4 }}>{slot.time}{slot.durationMin ? ` · ${slot.durationMin}m` : ""}</div>
                <div className="cg" style={{ fontSize: 16, color: "#4a3540", fontStyle: "italic", marginTop: 2 }}>{slot.label}</div>
                {slot.note && <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.55)", marginTop: 4, fontStyle: "italic" }}>{slot.note}</div>}
              </div>

              {createTaskLoading ? (
                <div className="jost pulse" style={{ textAlign: "center", padding: "20px 0", color: "rgba(152,120,184,0.7)", fontSize: 12 }}>
                  Rosie's thinking…
                </div>
              ) : createTaskDraft ? (
                <>
                  {createTaskError && (
                    <div className="jost" style={{ background: "rgba(196,168,130,0.12)", border: "1px solid rgba(196,168,130,0.35)", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "#9a7850", marginBottom: 10 }}>
                      {createTaskError}
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>Title</label>
                      <input
                        value={createTaskDraft.title}
                        onChange={e => setCreateTaskDraft({ ...createTaskDraft, title: e.target.value })}
                        onKeyDown={e => { if (e.key === "Enter" && createTaskDraft.title.trim()) saveCreatedTask(); }}
                        className="jost"
                        style={{ width: "100%", padding: "7px 11px", fontSize: 14, border: "1px solid rgba(184,160,212,0.35)", borderRadius: 8, background: "rgba(255,255,255,0.7)", boxSizing: "border-box" }}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>Priority</label>
                      <select
                        value={createTaskDraft.priority}
                        onChange={e => setCreateTaskDraft({ ...createTaskDraft, priority: e.target.value })}
                        className="jost"
                        style={{ width: "100%", padding: "6px 10px", fontSize: 12, border: "1px solid rgba(184,160,212,0.35)", borderRadius: 8, background: "rgba(255,255,255,0.7)", boxSizing: "border-box", cursor: "pointer" }}
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>Why it matters (optional)</label>
                      <input
                        value={createTaskDraft.why}
                        onChange={e => setCreateTaskDraft({ ...createTaskDraft, why: e.target.value })}
                        onKeyDown={e => { if (e.key === "Enter" && createTaskDraft.title.trim()) saveCreatedTask(); }}
                        placeholder="e.g. Required for compliance review"
                        className="jost"
                        style={{ width: "100%", padding: "6px 10px", fontSize: 12, border: "1px solid rgba(184,160,212,0.35)", borderRadius: 8, background: "rgba(255,255,255,0.7)", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
                    <button onClick={cancelCreatedTask} className="btn ghost jost" style={{ padding: "8px 14px", fontSize: 12 }}>Cancel</button>
                    <button
                      onClick={saveCreatedTask}
                      disabled={!createTaskDraft.title.trim()}
                      className="btn jost"
                      style={{
                        background: createTaskDraft.title.trim() ? "linear-gradient(135deg,#9878b8,#876aa3)" : "rgba(184,160,212,0.2)",
                        color: createTaskDraft.title.trim() ? "#fff" : "rgba(74,53,64,0.4)",
                        padding: "8px 18px", fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
                        cursor: createTaskDraft.title.trim() ? "pointer" : "default",
                      }}
                    >✓ Create + link</button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── Reminders Card ──────────────────────────────────────────────────────────
// ── Roadmap History Modal ─────────────────────────────────────────────────────
function RoadmapHistoryModal({ data, onClose, onRestore, currentRoadmapId }) {
  const history = (data.roadmapHistory || []).slice().sort((a, b) => (b.capturedAt || 0) - (a.capturedAt || 0));
  const [expanded, setExpanded] = useState(history.length > 0 ? history[0].id : null);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yest = new Date(today);
    yest.setDate(yest.getDate() - 1);
    if (dt.toDateString() === today.toDateString()) return "Today";
    if (dt.toDateString() === yest.toDateString()) return "Yesterday";
    return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: dt.getFullYear() !== today.getFullYear() ? "numeric" : undefined });
  };

  const slotCompletion = (entry) => {
    const total = (entry.slots || []).filter(s => s.type === "work").length;
    const done = (entry.completedSlots || []).filter(idx => entry.slots[idx]?.type === "work").length;
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  };

  // Aggregate adherence across all history
  const totalSlots = history.reduce((sum, h) => sum + (h.slots || []).filter(s => s.type === "work").length, 0);
  const totalDone = history.reduce((sum, h) => sum + (h.completedSlots || []).filter(idx => h.slots[idx]?.type === "work").length, 0);
  const overallPct = totalSlots > 0 ? Math.round((totalDone / totalSlots) * 100) : null;

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
          <div>
            <label className="sl jost">Roadmap log</label>
            <h2 className="cg" style={{ fontSize: 28, color: "#4a3540", fontWeight: 400, lineHeight: 1.1 }}>Past <span style={{ color: "#d4829a", fontStyle: "italic" }}>roadmaps</span> ✦</h2>
            {overallPct !== null && totalSlots >= 5 && (
              <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.55)", marginTop: 6 }}>
                Across {history.length} day{history.length !== 1 ? "s" : ""}: <span style={{ color: "#7a9e78", fontWeight: 600 }}>{totalDone}/{totalSlots} work blocks completed ({overallPct}%)</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="jost" style={{ background: "none", border: "none", color: "rgba(74,53,64,0.5)", fontSize: 18, cursor: "pointer", padding: 6, lineHeight: 1 }}>✕</button>
        </div>

        {history.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <p className="cg" style={{ fontSize: 22, color: "rgba(74,53,64,0.3)", fontStyle: "italic" }}>No past roadmaps yet</p>
            <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.4)", marginTop: 6 }}>
              Roadmaps get archived here whenever you check in fresh ✦
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "60vh", overflowY: "auto", paddingRight: 4 }}>
            {history.map(entry => {
              const isOpen = expanded === entry.id;
              const energyObj = ENERGY_LEVELS.find(e => e.key === entry.energy);
              const moodObj = MOODS.find(m => m.key === entry.mood);
              const c = slotCompletion(entry);
              return (
                <div key={entry.id} className="card" style={{ padding: 0, overflow: "hidden", border: `1px solid ${entry.id === currentRoadmapId && currentRoadmapId ? "rgba(122,158,120,0.4)" : "rgba(212,130,154,0.15)"}`, background: entry.id === currentRoadmapId && currentRoadmapId ? "rgba(158,184,154,0.04)" : "transparent" }}>
                  <div
                    onClick={() => setExpanded(isOpen ? null : entry.id)}
                    style={{ padding: "12px 16px", cursor: "pointer", background: isOpen ? "rgba(232,160,180,0.06)" : "transparent", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <span className="jost" style={{ fontSize: 12, fontWeight: 600, color: "#b86d85" }}>{formatDate(entry.date)}</span>
                        {entry.id === currentRoadmapId && currentRoadmapId && <span className="jost" style={{ fontSize: 9, color: "#7a9e78", background: "rgba(158,184,154,0.15)", border: "1px solid rgba(122,158,120,0.4)", padding: "1px 7px", borderRadius: 10, fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase" }}>✓ Active</span>}
                        {energyObj && <span className="jost" style={{ fontSize: 10, color: energyObj.color, background: `${energyObj.color}15`, border: `1px solid ${energyObj.color}40`, padding: "1px 8px", borderRadius: 10 }}>{energyObj.emoji} {energyObj.label}</span>}
                        {moodObj && <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", background: "rgba(180,160,210,0.12)", border: "1px solid rgba(180,160,210,0.3)", padding: "1px 8px", borderRadius: 10 }}>{moodObj.emoji} {moodObj.label}</span>}
                        {c.total > 0 && (
                          <span className="jost" style={{ fontSize: 10, color: c.pct >= 70 ? "#7a9e78" : c.pct >= 40 ? "#9a7850" : "rgba(74,53,64,0.5)", fontWeight: 600 }}>
                            {c.done}/{c.total} done · {c.pct}%
                          </span>
                        )}
                      </div>
                      <div className="cg" style={{ fontSize: 16, color: "#4a3540", lineHeight: 1.2 }}>{entry.headline || "Your day"}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      {/* Quick "Use this" button — visible without expanding */}
                      {onRestore && (entry.id !== currentRoadmapId || !currentRoadmapId) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onRestore(entry); onClose(); }}
                          className="btn rose jost"
                          title="Use this roadmap as today's active roadmap"
                          style={{ fontSize: 10, padding: "5px 12px", whiteSpace: "nowrap" }}
                        >🌸 Use this</button>
                      )}
                      <span style={{ color: "rgba(184,109,133,0.6)", fontSize: 14 }}>{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="fade" style={{ padding: "0 16px 14px", borderTop: "1px solid rgba(212,130,154,0.1)" }}>
                      {entry.greeting && (
                        <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.55)", fontStyle: "italic", marginTop: 10, marginBottom: 10, lineHeight: 1.5 }}>{entry.greeting}</p>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {(entry.slots || []).map((slot, idx) => {
                          const styleSet = SLOT_COLORS[slot.type] || SLOT_COLORS.work;
                          const wasComplete = (entry.completedSlots || []).includes(idx);
                          return (
                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 6, background: wasComplete ? "rgba(158,184,154,0.08)" : "rgba(255,255,255,0.4)", border: `1px solid ${wasComplete ? "rgba(122,158,120,0.25)" : "rgba(212,130,154,0.1)"}`, opacity: wasComplete ? 0.85 : 1 }}>
                              <div style={{ width: 12, height: 12, borderRadius: "50%", flexShrink: 0, background: wasComplete ? "#7a9e78" : "transparent", border: `2px solid ${wasComplete ? "#7a9e78" : styleSet.dot}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 8 }}>{wasComplete ? "✓" : ""}</div>
                              <span className="jost" style={{ fontSize: 10, color: styleSet.color, fontWeight: 600, minWidth: 90, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{formatSlotTimeRange(entry.slots, idx)}</span>
                              <span className="jost" style={{ fontSize: 11, color: "#4a3540", flex: 1, textDecoration: wasComplete ? "line-through" : "none", opacity: wasComplete ? 0.7 : 1 }}>{slot.label}</span>
                            </div>
                          );
                        })}
                      </div>
                      {entry.todayAdvice && (
                        <div style={{ marginTop: 10, padding: "8px 10px", background: "rgba(232,160,180,0.06)", border: "1px solid rgba(212,130,154,0.18)", borderRadius: 8 }}>
                          <div className="jost" style={{ fontSize: 9, letterSpacing: 1.3, color: "rgba(184,109,133,0.7)", textTransform: "uppercase", marginBottom: 3, fontWeight: 600 }}>That day's approach</div>
                          <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.7)", lineHeight: 1.5 }}>{entry.todayAdvice}</div>
                        </div>
                      )}
                      {/* Restore button — make this entry today's active roadmap */}
                      {onRestore && (entry.id !== currentRoadmapId || !currentRoadmapId) && (
                        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRestore(entry);
                              onClose();
                            }}
                            className="btn rose jost"
                            title="Bring this roadmap back as today's active roadmap"
                            style={{ fontSize: 12, padding: "8px 18px" }}
                          >🌸 Use this roadmap today</button>
                        </div>
                      )}
                      {entry.id === currentRoadmapId && currentRoadmapId && (
                        <div className="jost" style={{ marginTop: 10, fontSize: 10, color: "#7a9e78", fontStyle: "italic", textAlign: "right" }}>
                          ✓ Currently active on your roadmap card
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
