// 05-components-items.js
// Item-related UI: SprintStartSetter, DraggableTaskList, OneThingMode, SpiralModal, HyperfocusContainer, ItemModal, FocusView.

function SprintStartSetter({ item, onUpdate }) {
  const active = isSprintActive(item);
  const paused = isSprintPaused(item);

  if (active || paused) {
    const effStart = sprintEffectiveStart(item);
    const pauseNow = () => onUpdate({ ...item, sprintStartTime: null, sprintPausedAccumMs: sprintElapsedMs(item) });
    const resumeNow = () => onUpdate({ ...item, sprintStartTime: Date.now() });
    const reset = () => onUpdate({ ...item, sprintStartTime: null, sprintPausedAccumMs: 0 });
    return (
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span className="jost" style={{ fontSize: 10, color: paused ? "rgba(196,168,130,0.85)" : "rgba(212,130,154,0.7)" }}>
          {paused ? "paused" : "started"} {fmtTime(new Date(effStart))}
        </span>
        {active ? (
          <button
            onClick={pauseNow}
            title="Pause — time won't count until you resume"
            className="jost"
            style={{ background: "rgba(196,168,130,0.12)", border: "1px solid rgba(196,168,130,0.3)", color: "#9a7850", cursor: "pointer", fontSize: 10, padding: "2px 8px", borderRadius: 12, fontFamily: "'Jost', sans-serif", fontWeight: 600 }}
          >⏸</button>
        ) : (
          <button
            onClick={resumeNow}
            title="Resume"
            className="jost"
            style={{ background: "rgba(158,184,154,0.15)", border: "1px solid rgba(158,184,154,0.35)", color: "#7a9e78", cursor: "pointer", fontSize: 10, padding: "2px 8px", borderRadius: 12, fontFamily: "'Jost', sans-serif", fontWeight: 600 }}
          >▶</button>
        )}
        <button
          onClick={reset}
          title="Reset sprint"
          style={{ background: "none", border: "none", color: "rgba(196,120,142,0.4)", cursor: "pointer", fontSize: 13, padding: "0 4px" }}
        >↺</button>
      </div>
    );
  }
  return <button className="btn ghost jost" onClick={() => onUpdate({ ...item, sprintStartTime: Date.now(), sprintPausedAccumMs: 0 })} style={{ fontSize: 11, padding: "4px 10px" }}>▶ Start now</button>;
}

// ── Draggable Task List ───────────────────────────────────────────────────────
// Renders the tasks for an item with drag-to-reorder. Compact = used in OneThingMode.
// Only the handle (⋮⋮) initiates a drag — row stays clickable/focusable normally.
function DraggableTaskList({ item, onUpdate, onToggleTask, compact = false }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const [dropBelow, setDropBelow] = useState(false);
  const [rowDraggable, setRowDraggable] = useState(null);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editingField, setEditingField] = useState(null); // "title" | "time"
  const [draft, setDraft] = useState("");
  const [hoverIdx, setHoverIdx] = useState(null);
  // Inline subtask creation state — window.prompt() is blocked in the
  // artifact iframe, so we render an inline input instead. Null = no
  // input showing; integer = adding a subtask to that parent index.
  const [pendingSubtaskParent, setPendingSubtaskParent] = useState(null);
  const [pendingSubtaskDraft, setPendingSubtaskDraft] = useState("");
  const tasks = item.tasks || [];

  // ── Subtask Timer (D) ─────────────────────────────────────────────────────
  // Per-subtask start/pause/resume with a single-active-timer rule per item.
  // Live tick: re-renders this component every 1s but only when something is
  // actually running, so cost is zero when no timer is active.
  const [, setTick] = useState(0);
  const hasActiveSubtaskTimer = (item.tasks || []).some((_, i) => isSubtaskTimerActive(item, i));
  useEffect(() => {
    if (!hasActiveSubtaskTimer) return;
    const id = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(id);
  }, [hasActiveSubtaskTimer]);
  const startSubtaskTimer = (idx) => {
    const now = Date.now();
    const timers = { ...(item.subtaskTimers || {}) };
    // Auto-pause any other subtask that's currently active on this item
    for (const k of Object.keys(timers)) {
      const ki = Number(k);
      if (ki === idx) continue;
      const t = timers[k];
      if (t && t.startTime && typeof t.finalDurationMs !== "number") {
        const accum = (t.pausedAccumMs || 0) + (now - t.startTime);
        timers[k] = { ...t, startTime: null, pausedAccumMs: accum };
      }
    }
    const existing = timers[idx] || { pausedAccumMs: 0 };
    timers[idx] = { ...existing, startTime: now };
    onUpdate({ ...item, subtaskTimers: timers });
  };
  const pauseSubtaskTimer = (idx) => {
    const t = getSubtaskTimer(item, idx);
    if (!t || !t.startTime) return;
    const now = Date.now();
    const accum = (t.pausedAccumMs || 0) + (now - t.startTime);
    onUpdate({
      ...item,
      subtaskTimers: { ...(item.subtaskTimers || {}), [idx]: { ...t, startTime: null, pausedAccumMs: accum } },
    });
  };
  const clearSubtaskTimer = (idx) => {
    const timers = { ...(item.subtaskTimers || {}) };
    delete timers[idx];
    onUpdate({ ...item, subtaskTimers: timers });
  };

  // ── Subtask note log (C) — shared by FocusView + the compact embed.
  // expandedNoteIdx: original index of the subtask whose note panel is open.
  // noteInput: text being typed for a new entry.
  const [expandedNoteIdx, setExpandedNoteIdx] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const fmtNoteStamp = (ts) => {
    try { return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
    catch { return ""; }
  };
  const addNote = (taskText) => {
    const text = noteInput.trim();
    if (!text) return;
    const entry = { id: uid(), text, ts: Date.now() };
    const logs = item.taskNoteLogs || {};
    onUpdate({ ...item, taskNoteLogs: { ...logs, [taskText]: [...(logs[taskText] || []), entry] } });
    setNoteInput("");
  };
  const deleteNote = (taskText, noteId) => {
    const logs = item.taskNoteLogs || {};
    const filtered = (logs[taskText] || []).filter(e => e.id !== noteId);
    if (filtered.length) {
      onUpdate({ ...item, taskNoteLogs: { ...logs, [taskText]: filtered } });
    } else {
      const { [taskText]: _, ...rest } = logs;
      onUpdate({ ...item, taskNoteLogs: rest });
    }
  };

  // ── Note → Subtask flow (option 2) ──
  // When the user clicks "→ subtask" on a note, fire reshapeNoteToSubtaskTitle.
  // While that's in flight (loading), show a spinner on the row. When it
  // returns, show an inline confirm dialog pre-filled with Rosie's suggested
  // title; user tweaks and confirms, which appends a new subtask AS A CHILD
  // of the source subtask via addSubtaskToItem (sets taskParents[new] =
  // sourceTaskIdx). This nests the new subtask visually right under its
  // origin instead of orphaning it at the bottom of the flat list.
  // Errors are typed — fallback offered: use the raw note text as the title.
  // State shape: { noteId, sourceTaskText, sourceTaskIdx, draftTitle, loading, errorKind } | null
  const [noteToSubtask, setNoteToSubtask] = useState(null);
  const startNoteToSubtask = async (sourceTaskText, sourceTaskIdx, noteId, noteText) => {
    if (noteToSubtask?.loading) return; // ignore double-clicks
    setNoteToSubtask({ noteId, sourceTaskText, sourceTaskIdx, draftTitle: "", loading: true, errorKind: null, rawNote: noteText });
    try {
      const result = await reshapeNoteToSubtaskTitle(noteText, item.title, item.why);
      if (result?.title) {
        setNoteToSubtask({ noteId, sourceTaskText, sourceTaskIdx, draftTitle: result.title, loading: false, errorKind: null, rawNote: noteText });
      } else {
        // Errored — pre-fill with the raw note so user can still proceed
        setNoteToSubtask({ noteId, sourceTaskText, sourceTaskIdx, draftTitle: noteText, loading: false, errorKind: result?.error || "unknown", rawNote: noteText });
      }
    } catch (e) {
      console.error("[startNoteToSubtask] unexpected:", e);
      setNoteToSubtask({ noteId, sourceTaskText, sourceTaskIdx, draftTitle: noteText, loading: false, errorKind: "unknown", rawNote: noteText });
    }
  };
  const confirmNoteToSubtask = () => {
    if (!noteToSubtask) return;
    const title = noteToSubtask.draftTitle.trim();
    if (!title) return;
    // Use addSubtaskToItem so the new subtask becomes a CHILD of the source
    // subtask — taskParents[new] = sourceTaskIdx. Renderer flattens parent
    // then children contiguously, so this nests visually under its origin.
    const updated = addSubtaskToItem(item, noteToSubtask.sourceTaskIdx, title, 15);
    onUpdate(updated);
    setNoteToSubtask(null);
  };
  const cancelNoteToSubtask = () => setNoteToSubtask(null);

  const onDragStart = (e, i) => {
    setDragIndex(i);
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", String(i)); } catch {}
  };
  const onDragOver = (e, i) => {
    if (dragIndex === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const below = e.clientY > rect.top + rect.height / 2;
    setDropIndex(i);
    setDropBelow(below);
  };
  const onDrop = (e, i) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) { cleanup(); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const below = e.clientY > rect.top + rect.height / 2;
    let to = below ? i + 1 : i;
    if (dragIndex < to) to -= 1;
    onUpdate(reorderItemTasks(item, dragIndex, to));
    cleanup();
  };
  const onDragEnd = () => cleanup();
  const cleanup = () => { setDragIndex(null); setDropIndex(null); setDropBelow(false); setRowDraggable(null); };

  const startEdit = (i, field, current) => {
    setEditingIdx(i);
    setEditingField(field);
    setDraft(String(current ?? ""));
  };
  const commitEdit = () => {
    if (editingIdx === null) return;
    const currentTask = tasks[editingIdx];
    if (editingField === "title") {
      const newText = draft.trim();
      if (!newText) {
        cancelEdit();
        return;
      }
      const oldText = currentTask;
      if (newText === oldText) { cancelEdit(); return; }
      const newTasks = tasks.map((t, idx) => idx === editingIdx ? newText : t);
      const completed = item.completedTasks || [];
      const newCompleted = completed.map(c => c === oldText ? newText : c);
      // Migrate completedTaskDates key if this task had a completion stamp
      const oldDateMap = item.completedTaskDates || {};
      let newDateMap = oldDateMap;
      if (Object.prototype.hasOwnProperty.call(oldDateMap, oldText)) {
        const { [oldText]: stamp, ...rest } = oldDateMap;
        newDateMap = { ...rest, [newText]: stamp };
      }
      // Migrate taskNoteLogs key too — subtask note logs are keyed by text,
      // so a rename has to carry the log across to the new key.
      const oldNoteLogs = item.taskNoteLogs || {};
      let newNoteLogs = oldNoteLogs;
      if (Object.prototype.hasOwnProperty.call(oldNoteLogs, oldText)) {
        const { [oldText]: log, ...restLogs } = oldNoteLogs;
        newNoteLogs = { ...restLogs, [newText]: log };
      }
      onUpdate({ ...item, tasks: newTasks, completedTasks: newCompleted, completedTaskDates: newDateMap, taskNoteLogs: newNoteLogs });
    } else if (editingField === "time") {
      const mins = Math.max(1, Math.min(600, parseInt(draft) || 15));
      const newTimes = [...(item.taskTimes || [])];
      while (newTimes.length < tasks.length) newTimes.push(15);
      newTimes[editingIdx] = mins;
      const total = newTimes.reduce((a, b) => a + (Number(b) || 0), 0);
      onUpdate({ ...item, taskTimes: newTimes, timeEstimate: fmtMins(total) });
    }
    cancelEdit();
  };
  const cancelEdit = () => { setEditingIdx(null); setEditingField(null); setDraft(""); };

  const deleteTask = i => {
    // If task has subtasks, cascade-delete them too
    const children = getTaskChildren(item, i);
    if (children.length > 0) {
      // Confirm before nuking a parent + its children — easy to misclick the ×
      const ok = typeof window !== "undefined" && window.confirm
        ? window.confirm(`Delete this task AND its ${children.length} subtask${children.length === 1 ? "" : "s"}?`)
        : true;
      if (!ok) return;
      const updated = removeTaskWithDescendants(item, i);
      const total = (updated.taskTimes || []).reduce((a, b) => a + (Number(b) || 0), 0);
      onUpdate({ ...updated, timeEstimate: total > 0 ? fmtMins(total) : "" });
      return;
    }
    // No subtasks — simple removal
    const updated = removeTaskWithDescendants(item, i);
    const total = (updated.taskTimes || []).reduce((a, b) => a + (Number(b) || 0), 0);
    onUpdate({ ...updated, timeEstimate: total > 0 ? fmtMins(total) : "" });
  };

  // Add a subtask under the parent at parentIdx
  const addSubtask = (parentIdx) => {
    // Open the inline input under this parent. No more window.prompt —
    // that's blocked in the artifact iframe.
    setPendingSubtaskParent(parentIdx);
    setPendingSubtaskDraft("");
  };
  const cancelSubtask = () => {
    setPendingSubtaskParent(null);
    setPendingSubtaskDraft("");
  };
  const commitSubtask = () => {
    const title = (pendingSubtaskDraft || "").trim();
    if (pendingSubtaskParent == null || !title) { cancelSubtask(); return; }
    const updated = addSubtaskToItem(item, pendingSubtaskParent, title, 15);
    const total = (updated.taskTimes || []).reduce((a, b) => a + (Number(b) || 0), 0);
    onUpdate({ ...updated, timeEstimate: total > 0 ? fmtMins(total) : "" });
    cancelSubtask();
  };

  if (!tasks.length) {
    return <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.3)", fontStyle: "italic" }}>{compact ? "No tasks yet" : "No tasks yet — add one below"}</p>;
  }

  // Sort: active tasks first (in original order), then completed tasks at the bottom.
  // Preserve original index for each entry so drag/edit/start-time logic still works.
  const completedSet = new Set(item.completedTasks || []);
  // Sort: active before completed; within each group, order by scheduled date
  // (taskDates[i].date), falling back to original array order. This shows tasks
  // chronologically — the user's expectation when dates are populated. Drag-reorder
  // still works (it changes originalIdx); the date order is a display convenience.
  const taskDates = item.taskDates || [];
  const dateForIdx = (idx) => {
    const td = taskDates[idx];
    if (!td || !td.date) return null;
    return td.date; // YYYY-MM-DD string sorts lexically the same as chronologically
  };

  // Subtask grouping: top-level tasks are sorted; subtasks are pinned right
  // under their parent in original (insertion) order, regardless of their own
  // date or completion state. This keeps the visual hierarchy clear.
  const topLevel = tasks
    .map((t, originalIdx) => ({ t, originalIdx, done: completedSet.has(t) }))
    .filter(entry => getTaskParent(item, entry.originalIdx) === null);

  const sortedTopLevel = topLevel.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1; // active before completed
      const dA = dateForIdx(a.originalIdx);
      const dB = dateForIdx(b.originalIdx);
      // If both have dates, sort by date. If only one has a date, undated goes last.
      if (dA && dB) {
        if (dA !== dB) return dA < dB ? -1 : 1;
      } else if (dA && !dB) return -1;
      else if (!dA && dB) return 1;
      // Same date (or both undated) — preserve original array order
      return a.originalIdx - b.originalIdx;
    });

  // Two-pass flatten:
  //   - Active section: each not-done parent followed by its not-done children;
  //     PLUS orphaned not-done children whose parents are already done (those
  //     get "promoted" to top-level since their visual parent is in the done
  //     section anyway — Lexy explicitly wanted these to stay up top).
  //   - Done section: each done parent followed by its done children. Done
  //     children of active parents also float down here so they don't clutter
  //     the active list.
  // Each top-level emits at the position determined by sortedTopLevel.
  const activeEntries = [];
  const doneEntries = [];
  for (const parent of sortedTopLevel) {
    const childIdxs = getTaskChildren(item, parent.originalIdx);
    const childEntries = childIdxs.map(ci => ({
      t: tasks[ci],
      originalIdx: ci,
      done: completedSet.has(tasks[ci]),
    }));
    const activeChildren = childEntries.filter(c => !c.done);
    const doneChildren = childEntries.filter(c => c.done);
    if (!parent.done) {
      // Active parent — render with its active children. Done children
      // shuttle to the done section so they don't pad out the active list.
      activeEntries.push({ ...parent, isSubtask: false });
      activeEntries.push(...activeChildren.map(c => ({ ...c, isSubtask: true })));
      doneEntries.push(...doneChildren.map(c => ({ ...c, isSubtask: true })));
    } else {
      // Done parent — render in done section with its done children.
      // Active children get promoted to top-level in the active section.
      activeEntries.push(...activeChildren.map(c => ({ ...c, isSubtask: false, promotedFromDoneParent: true })));
      doneEntries.push({ ...parent, isSubtask: false });
      doneEntries.push(...doneChildren.map(c => ({ ...c, isSubtask: true })));
    }
  }
  const sortedTasks = [...activeEntries, ...doneEntries];

  // Find the index where active tasks end and completed begin (for the divider)
  // (firstCompletedSortedIdx removed — divider now computed inline since subtasks
  // skip the divider check)

  return (
    <>
      {sortedTasks.map((entry, sortedIdx) => {
        const t = entry.t;
        const i = entry.originalIdx; // keep original index for all internal logic
        const done = entry.done;
        const isSub = entry.isSubtask;
        const st = getTaskStartTime(item, i);
        const isDragging = dragIndex === i;
        const showAbove = dropIndex === i && !dropBelow && dragIndex !== i;
        const showBelow = dropIndex === i && dropBelow && dragIndex !== i;
        const isEditingTitle = editingIdx === i && editingField === "title";
        const isEditingTime = editingIdx === i && editingField === "time";
        const cls = `item-row${isDragging ? " task-dragging" : ""}${showAbove ? " task-drop-above" : ""}${showBelow ? " task-drop-below" : ""}${done ? " task-completed-fade" : ""}`;
        // Show subtle divider before the first completed top-level task
        const showDivider = !compact && !isSub && (() => {
          // Find the index of the first completed top-level task in sortedTasks
          const firstDoneTopIdx = sortedTasks.findIndex(s => s.done && !s.isSubtask);
          return firstDoneTopIdx > 0 && sortedIdx === firstDoneTopIdx;
        })();
        return (
          <React.Fragment key={`task-${i}-${t}`}>
            {showDivider && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 4px 4px", opacity: 0.55 }}>
                <span className="jost" style={{ fontSize: 9, color: "rgba(122,158,120,0.7)", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>✓ Done</span>
                <div style={{ flex: 1, height: 1, background: "rgba(158,184,154,0.25)" }} />
              </div>
            )}
          <div
            className={cls}
            draggable={rowDraggable === i}
            onDragStart={e => onDragStart(e, i)}
            onDragOver={e => onDragOver(e, i)}
            onDrop={e => onDrop(e, i)}
            onDragEnd={onDragEnd}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            onClick={e => {
              if (dragIndex !== null || editingIdx !== null) return;
              // Subtask timer (D) freeze: if marking-to-complete with a running
              // or paused timer, snapshot elapsed into finalDurationMs first.
              // Unchecking doesn't unfreeze — the recorded time stays.
              if (!done && isSubtaskTimerRunning(item, i) && !hasFinalSubtaskTime(item, i)) {
                const elapsed = subtaskElapsedMs(item, i);
                const existing = getSubtaskTimer(item, i) || {};
                const frozen = { ...existing, startTime: null, finalDurationMs: elapsed };
                onUpdate({
                  ...item,
                  subtaskTimers: { ...(item.subtaskTimers || {}), [i]: frozen },
                });
                // Subtask timing → data.timingHistory (D-2). Dispatch event so
                // the App-level listener can push it to history for the
                // leaderboard + Rosie context, without DraggableTaskList
                // needing access to data directly.
                try {
                  if (typeof window !== "undefined" && window.dispatchEvent) {
                    const estimateMin = Number(item.taskTimes?.[i]) || 15;
                    const actualMin = Math.max(1, Math.round(elapsed / 60000));
                    window.dispatchEvent(new CustomEvent("work-hub-timing-captured", {
                      detail: {
                        date: new Date().toISOString().slice(0, 10),
                        slotLabel: t,
                        slotType: "subtask",
                        estimatedMin: estimateMin,
                        actualMin,
                        capturedAt: Date.now(),
                        parentItemId: item.id || null,
                        parentItemTitle: item.title || "",
                      },
                    }));
                  }
                } catch (e) { /* timing capture best-effort */ }
                // Defer the toggle by a tick so the freeze persists first
                setTimeout(() => onToggleTask(t, e), 0);
                return;
              }
              onToggleTask(t, e);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: compact ? 10 : 12,
              padding: compact ? (isSub ? "5px 10px 5px 26px" : "8px 10px") : (isSub ? "7px 12px 7px 32px" : "10px 12px"),
              marginBottom: compact ? 4 : (isSub ? 3 : 6),
              background: done ? "rgba(158,184,154,0.1)" : (isSub ? "rgba(212,130,154,0.025)" : "rgba(212,130,154,0.04)"),
              border: `1px solid ${done ? "rgba(158,184,154,0.25)" : "rgba(212,130,154,0.1)"}`,
              borderLeft: isSub ? "3px solid rgba(212,130,154,0.25)" : `1px solid ${done ? "rgba(158,184,154,0.25)" : "rgba(212,130,154,0.1)"}`,
            }}
          >
            <span
              className="drag-handle"
              title="Drag to reorder"
              onMouseDown={() => setRowDraggable(i)}
              onTouchStart={() => setRowDraggable(i)}
              onMouseUp={() => { if (dragIndex === null) setRowDraggable(null); }}
              onClick={e => e.stopPropagation()}
            >⋮⋮</span>
            <div style={{
              width: compact ? 18 : 20,
              height: compact ? 18 : 20,
              borderRadius: "50%",
              flexShrink: 0,
              border: `2px solid ${done ? "#9eb89a" : "rgba(212,130,154,0.4)"}`,
              background: done ? "#9eb89a" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: compact ? 10 : 11,
              color: "#fff",
              fontWeight: 700,
            }}>{done ? "✓" : i+1}</div>
            {isEditingTitle ? (
              <input
                autoFocus
                className="jost"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit(); }}
                onClick={e => e.stopPropagation()}
                style={{ fontSize: compact ? 12 : 13, flex: 1, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(212,130,154,0.4)", borderRadius: 6, padding: "3px 8px", color: "#4a3540", outline: "none", fontFamily: "'Jost', sans-serif" }}
              />
            ) : (
              <span
                className="jost"
                onClick={e => { e.stopPropagation(); startEdit(i, "title", t); }}
                title="Click to edit"
                style={{
                  fontSize: compact ? 12 : 13,
                  flex: 1,
                  color: done ? "rgba(74,53,64,0.3)" : "#4a3540",
                  textDecoration: done ? "line-through" : "none",
                  cursor: "text",
                  padding: "2px 6px",
                  marginLeft: -6,
                  borderRadius: 4,
                  transition: "background .15s",
                }}
                onMouseEnter={e => { if (!done) e.currentTarget.style.background = "rgba(212,130,154,0.06)"; }}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >{t}</span>
            )}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: compact ? 1 : 2, flexShrink: 0 }}>
              {isEditingTime ? (
                <input
                  autoFocus
                  type="number"
                  min="1"
                  max="600"
                  className="jost"
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit(); }}
                  onClick={e => e.stopPropagation()}
                  style={{ fontSize: 11, width: 54, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(212,130,154,0.4)", borderRadius: 5, padding: "2px 6px", color: "#d4829a", outline: "none", textAlign: "right", fontFamily: "'Jost', sans-serif" }}
                />
              ) : item.taskTimes?.[i] ? (
                <span
                  className="jost"
                  onClick={e => { e.stopPropagation(); startEdit(i, "time", item.taskTimes[i]); }}
                  title="Click to edit time"
                  style={{ fontSize: 10, color: done ? "rgba(74,53,64,0.2)" : "#d4829a", fontWeight: 500, cursor: "text", padding: "1px 5px", borderRadius: 4, transition: "background .15s" }}
                  onMouseEnter={e => { if (!done) e.currentTarget.style.background = "rgba(212,130,154,0.08)"; }}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >{fmtMins(item.taskTimes[i])}</span>
              ) : null}
              {/* Completion-date pill — shown for done tasks that have a stamp.
                  Matches the existing date display styling (sage green, small).
                  Tasks completed before this feature shipped won't have a stamp,
                  so they just render as the plain "✓" indicator with no pill. */}
              {done && (() => {
                const stamp = (item.completedTaskDates || {})[t];
                if (!stamp) return null;
                const d = new Date(stamp);
                const monthStr = d.toLocaleString("en-US", { month: "short" });
                return (
                  <span
                    className="jost"
                    title={`Completed ${d.toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}`}
                    style={{
                      fontSize: 9,
                      color: "rgba(122,158,120,0.85)",
                      fontWeight: 600,
                      letterSpacing: 0.3,
                      background: "rgba(158,184,154,0.12)",
                      border: "1px solid rgba(158,184,154,0.3)",
                      borderRadius: 8,
                      padding: "1px 7px",
                      whiteSpace: "nowrap",
                    }}
                  >✓ done {monthStr} {d.getDate()}</span>
                );
              })()}
              {/* Per-task date display (only in non-compact mode) */}
              {!compact && !done && (() => {
                const taskDate = (item.taskDates || [])[i]?.date || "";
                const notToday = (item.taskDates || [])[i]?.notToday || false;
                const fixed = (item.taskDates || [])[i]?.fixed || false;
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }} onClick={e => e.stopPropagation()}>
                    {notToday ? (
                      <button
                        onClick={() => {
                          const newDates = [...(item.taskDates || [])];
                          while (newDates.length < (item.tasks || []).length) newDates.push({ date: "", notToday: false, fixed: false });
                          newDates[i] = { ...newDates[i], notToday: false };
                          onUpdate({ ...item, taskDates: newDates });
                        }}
                        title="Click to un-defer"
                        className="jost"
                        style={{ background: "rgba(196,168,130,0.12)", border: "1px dashed rgba(196,168,130,0.4)", color: "#9a7850", fontSize: 9, fontWeight: 600, letterSpacing: 0.3, padding: "1px 7px", borderRadius: 10, cursor: "pointer", fontFamily: "'Jost', sans-serif", textTransform: "uppercase" }}
                      >not today</button>
                    ) : (
                      <input
                        type="date"
                        value={taskDate}
                        onChange={e => {
                          // Snapshot original dates BEFORE the edit so cascade can compute gaps
                          const originalDates = (item.taskDates || []).map(td => td ? { ...td } : { date: "", notToday: false, fixed: false });
                          while (originalDates.length < (item.tasks || []).length) originalDates.push({ date: "", notToday: false, fixed: false });

                          const newDates = originalDates.map(td => ({ ...td }));
                          newDates[i] = { ...newDates[i], date: e.target.value, notToday: false };

                          // Cascade: shift later unlocked tasks by the same delta, preserving gaps
                          const cascaded = cascadeTaskDates(originalDates, newDates, i);
                          onUpdate({ ...item, taskDates: cascaded });
                        }}
                        title="Pick a specific date for this task"
                        className="jost"
                        style={{
                          background: fixed ? "rgba(212,130,154,0.06)" : "transparent",
                          border: fixed ? "1px solid rgba(212,130,154,0.35)" : "none",
                          borderRadius: fixed ? 6 : 0,
                          color: fixed ? "#b86d85" : (taskDate ? "#7a9e78" : "rgba(74,53,64,0.3)"),
                          fontSize: 9,
                          cursor: "pointer",
                          outline: "none",
                          padding: fixed ? "1px 4px" : "0 2px",
                          colorScheme: "light",
                          fontFamily: "'Jost', sans-serif",
                          fontWeight: fixed ? 600 : 400,
                        }}
                      />
                    )}
                    {/* 🔒 Lock toggle — appears only when there's a date set and not deferred */}
                    {!notToday && taskDate && (
                      <button
                        onClick={() => {
                          const newDates = [...(item.taskDates || [])];
                          while (newDates.length < (item.tasks || []).length) newDates.push({ date: "", notToday: false, fixed: false });
                          newDates[i] = { ...newDates[i], fixed: !newDates[i]?.fixed };
                          onUpdate({ ...item, taskDates: newDates });
                        }}
                        title={fixed ? "Date is LOCKED — won't be changed by AI planner or spread-evenly. Click to unlock." : "Click to LOCK this date — AI planner and spread-evenly will skip it"}
                        style={{ background: "none", border: "none", cursor: "pointer", color: fixed ? "#b86d85" : "rgba(74,53,64,0.25)", fontSize: 11, padding: "0 3px", lineHeight: 1, transition: "color .15s" }}
                      >{fixed ? "🔒" : "🔓"}</button>
                    )}
                    <button
                      onClick={() => {
                        const newDates = [...(item.taskDates || [])];
                        while (newDates.length < (item.tasks || []).length) newDates.push({ date: "", notToday: false, fixed: false });
                        newDates[i] = { ...newDates[i], notToday: !newDates[i]?.notToday };
                        onUpdate({ ...item, taskDates: newDates });
                      }}
                      title={notToday ? "Un-defer" : "Defer — not today"}
                      style={{ background: "none", border: "none", cursor: "pointer", color: notToday ? "#9a7850" : "rgba(74,53,64,0.3)", fontSize: 10, padding: "0 4px", lineHeight: 1 }}
                    >{notToday ? "✓" : "⏭"}</button>
                  </div>
                );
              })()}
              {st && !done && <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.35)" }}>{compact ? st : `starts ${st}`}</span>}
            </div>
            {/* Subtask timer (D) — start/pause/resume per subtask. Single
                active timer per item enforced by startSubtaskTimer. When
                subtask is checked complete, elapsed time is frozen into
                finalDurationMs and the row shows ✓ + total. */}
            {(() => {
              const active = isSubtaskTimerActive(item, i);
              const paused = isSubtaskTimerPaused(item, i);
              const frozen = hasFinalSubtaskTime(item, i);
              const hasAny = active || paused || frozen;
              const showBtn = hasAny || hoverIdx === i;
              if (!showBtn) return null;
              const elapsedMs = subtaskElapsedMs(item, i);
              const elapsedLabel = formatSubtaskDuration(elapsedMs);
              // Frozen comparison (D-3) — when complete, show estimated → actual
              // with a color accent if variance is significant. Helps see at a
              // glance which subtasks landed close to estimate vs blew past it.
              const estimateMin = Number(item.taskTimes?.[i]) || 0;
              const actualMin = Math.max(1, Math.round(elapsedMs / 60000));
              const variancePct = (frozen && estimateMin > 0)
                ? Math.round(((actualMin - estimateMin) / estimateMin) * 100)
                : 0;
              const significantVariance = frozen && Math.abs(variancePct) >= 25;
              // Color theme: running = rose, paused = amber,
              //              frozen+close = sage, frozen+over = rose-warn, frozen+under = sage-bright
              const palette = active
                ? { bg: "rgba(212,130,154,0.15)", border: "rgba(212,130,154,0.45)", fg: "#b86d85" }
                : paused
                ? { bg: "rgba(196,168,130,0.15)", border: "rgba(196,168,130,0.45)", fg: "#9a7850" }
                : frozen && significantVariance && variancePct > 0
                ? { bg: "rgba(196,104,122,0.12)", border: "rgba(196,104,122,0.45)", fg: "#c4687a" }
                : frozen
                ? { bg: "rgba(158,184,154,0.15)", border: "rgba(158,184,154,0.45)", fg: "#7a9e78" }
                : { bg: "none", border: "rgba(212,130,154,0.2)", fg: "rgba(74,53,64,0.4)" };
              // Label content — frozen state shows estimate → actual
              const estimateLabel = estimateMin >= 60
                ? `${Math.floor(estimateMin / 60)}h${estimateMin % 60 ? ` ${estimateMin % 60}m` : ""}`
                : `${estimateMin}m`;
              return (
                <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (frozen) return; // already finalized — no-op (use 'reset' to clear)
                      if (active) pauseSubtaskTimer(i);
                      else startSubtaskTimer(i);
                    }}
                    title={
                      frozen && estimateMin > 0
                        ? `Planned ${estimateLabel} · Actual ${elapsedLabel}${significantVariance ? ` (${variancePct > 0 ? "+" : ""}${variancePct}%)` : ""}`
                        : frozen ? `Total time tracked: ${elapsedLabel}` :
                      active ? "Pause subtask timer" :
                      paused ? "Resume subtask timer" :
                      "Start subtask timer"
                    }
                    className="jost"
                    style={{
                      background: palette.bg,
                      border: `1px solid ${palette.border}`,
                      color: palette.fg,
                      borderRadius: 9,
                      cursor: frozen ? "default" : "pointer",
                      fontSize: 10,
                      padding: "2px 7px",
                      lineHeight: 1,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span style={{ fontSize: 9 }}>{frozen ? "✓" : active ? "⏸" : "▶"}</span>
                    {frozen && estimateMin > 0 ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <span style={{ opacity: 0.55, textDecoration: "line-through" }}>{estimateLabel}</span>
                        <span style={{ opacity: 0.4 }}>→</span>
                        <span>{elapsedLabel}</span>
                        {significantVariance && (
                          <span style={{ marginLeft: 2, fontSize: 9, opacity: 0.85 }}>
                            {variancePct > 0 ? `+${variancePct}%` : `${variancePct}%`}
                          </span>
                        )}
                      </span>
                    ) : hasAny ? (
                      <span>{elapsedLabel}</span>
                    ) : null}
                  </button>
                  {/* Tiny reset button — only when paused/frozen and hovered */}
                  {(paused || frozen) && hoverIdx === i && (
                    <button
                      onClick={e => { e.stopPropagation(); clearSubtaskTimer(i); }}
                      title="Reset subtask timer"
                      style={{ background: "none", border: "none", color: "rgba(74,53,64,0.35)", cursor: "pointer", fontSize: 10, padding: "0 3px", lineHeight: 1 }}
                    >↺</button>
                  )}
                </div>
              );
            })()}
            {/* Note-log toggle (C) — always visible when this subtask has notes,
                otherwise shows on row hover. Click expands the note panel below. */}
            {(() => {
              const noteCount = (item.taskNoteLogs?.[t] || []).length;
              const noteOpen = expandedNoteIdx === i;
              const showBtn = noteCount > 0 || hoverIdx === i;
              if (!showBtn) return null;
              return (
                <div style={{ flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={e => { e.stopPropagation(); setExpandedNoteIdx(noteOpen ? null : i); setNoteInput(""); }}
                    title={noteCount ? `${noteCount} note${noteCount === 1 ? "" : "s"} — click to view` : "Add a note to this subtask"}
                    className="jost"
                    style={{
                      background: noteOpen ? "rgba(184,160,212,0.2)" : (noteCount ? "rgba(184,160,212,0.1)" : "none"),
                      border: `1px solid ${noteCount || noteOpen ? "rgba(184,160,212,0.4)" : "rgba(212,130,154,0.2)"}`,
                      borderRadius: 9, cursor: "pointer", fontSize: 10, padding: "2px 7px",
                      color: noteCount || noteOpen ? "#9878b8" : "rgba(74,53,64,0.4)",
                      lineHeight: 1, fontWeight: 600,
                    }}
                  >📝{noteCount ? ` ${noteCount}` : ""}</button>
                </div>
              );
            })()}
            {/* Action buttons — show on hover */}
            {hoverIdx === i && editingIdx === null && (
              <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                {!isSub && (
                  <button
                    onClick={e => { e.stopPropagation(); addSubtask(i); }}
                    title="Add a subtask"
                    className="jost"
                    style={{ background: "none", border: "1px dashed rgba(212,130,154,0.3)", color: "rgba(184,109,133,0.7)", cursor: "pointer", fontSize: 9, padding: "2px 7px", borderRadius: 10, lineHeight: 1, fontWeight: 500 }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,130,154,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                  >+ sub</button>
                )}
                <button
                  onClick={e => { e.stopPropagation(); deleteTask(i); }}
                  title="Delete task"
                  style={{ background: "none", border: "none", color: "rgba(212,100,120,0.5)", cursor: "pointer", fontSize: 14, padding: "2px 6px", lineHeight: 1 }}
                >×</button>
              </div>
            )}
          </div>
          {/* Inline subtask creation input — replaces broken window.prompt. */}
          {pendingSubtaskParent === i && (
            <div
              onClick={e => e.stopPropagation()}
              style={{
                margin: compact ? "4px 0 6px 36px" : "4px 0 8px 44px",
                padding: "8px 10px",
                background: "rgba(212,130,154,0.06)",
                border: "1px dashed rgba(212,130,154,0.4)",
                borderRadius: 9,
                display: "flex",
                gap: 6,
                alignItems: "center",
              }}
            >
              <input
                autoFocus
                value={pendingSubtaskDraft}
                onChange={e => setPendingSubtaskDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") { e.preventDefault(); commitSubtask(); }
                  if (e.key === "Escape") { e.preventDefault(); cancelSubtask(); }
                }}
                placeholder="What's the subtask?"
                className="jost"
                style={{
                  flex: 1, fontSize: 13, padding: "5px 9px",
                  border: "1px solid rgba(212,130,154,0.3)",
                  borderRadius: 6, background: "rgba(255,255,255,0.85)",
                  outline: "none", fontFamily: "'Jost', sans-serif",
                  color: "#4a3540",
                }}
              />
              <button
                onClick={commitSubtask}
                disabled={!pendingSubtaskDraft.trim()}
                className="jost"
                style={{
                  background: pendingSubtaskDraft.trim() ? "linear-gradient(135deg,#d4829a,#b86d85)" : "rgba(74,53,64,0.12)",
                  color: pendingSubtaskDraft.trim() ? "#fff" : "rgba(74,53,64,0.4)",
                  border: "none", borderRadius: 6,
                  padding: "5px 11px", fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
                  cursor: pendingSubtaskDraft.trim() ? "pointer" : "default",
                }}
              >Add</button>
              <button
                onClick={cancelSubtask}
                title="Cancel (Esc)"
                className="jost"
                style={{
                  background: "none", border: "none", color: "rgba(74,53,64,0.5)",
                  cursor: "pointer", fontSize: 16, padding: "0 4px", lineHeight: 1,
                }}
              >×</button>
            </div>
          )}
          {/* Subtask note-log panel (C) — expands below the row when 📝 is toggled */}
          {expandedNoteIdx === i && (
            <div
              onClick={e => e.stopPropagation()}
              style={{
                margin: compact ? "2px 0 6px 36px" : "2px 0 8px 44px",
                padding: "9px 11px",
                background: "rgba(184,160,212,0.06)",
                border: "1px solid rgba(184,160,212,0.2)",
                borderRadius: 10,
              }}
            >
              {(item.taskNoteLogs?.[t] || []).length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 7 }}>
                  {(item.taskNoteLogs?.[t] || []).map(entry => {
                    const isActiveForThisNote = noteToSubtask?.noteId === entry.id;
                    return (
                      <React.Fragment key={entry.id}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                          <span className="jost" style={{ fontSize: 9, color: "#9878b8", fontWeight: 600, whiteSpace: "nowrap", paddingTop: 1, flexShrink: 0 }}>{fmtNoteStamp(entry.ts)}</span>
                          <span className="jost" style={{ fontSize: 11, color: "#4a3540", flex: 1, lineHeight: 1.4 }}>{entry.text}</span>
                          <button
                            onClick={() => startNoteToSubtask(t, i, entry.id, entry.text)}
                            disabled={isActiveForThisNote && noteToSubtask.loading}
                            title="Turn this note into a subtask under this one — Rosie will suggest a clean title, you confirm"
                            className="jost"
                            style={{
                              background: isActiveForThisNote ? "rgba(212,130,154,0.18)" : "none",
                              border: `1px solid ${isActiveForThisNote ? "rgba(212,130,154,0.45)" : "rgba(212,130,154,0.18)"}`,
                              borderRadius: 6,
                              color: isActiveForThisNote ? "#b86d85" : "rgba(184,109,133,0.55)",
                              cursor: isActiveForThisNote && noteToSubtask.loading ? "wait" : "pointer",
                              fontSize: 9.5,
                              padding: "1px 6px",
                              lineHeight: 1.3,
                              fontWeight: 600,
                              letterSpacing: 0.2,
                              flexShrink: 0,
                            }}
                          >{isActiveForThisNote && noteToSubtask.loading ? "…" : "→ subtask"}</button>
                          <button onClick={() => deleteNote(t, entry.id)} title="Delete note" style={{ background: "none", border: "none", color: "rgba(196,120,142,0.45)", cursor: "pointer", fontSize: 12, lineHeight: 1, flexShrink: 0 }}>×</button>
                        </div>
                        {/* Inline confirm dialog — shows when Rosie returns a suggested title for this specific note */}
                        {isActiveForThisNote && !noteToSubtask.loading && (
                          <div style={{ margin: "2px 0 4px 18px", padding: "7px 9px", background: "rgba(212,130,154,0.05)", border: "1px solid rgba(212,130,154,0.18)", borderRadius: 8 }}>
                            <div className="jost" style={{ fontSize: 9, color: "#b86d85", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>
                              {noteToSubtask.errorKind
                                ? `Rosie couldn't reshape this (${noteToSubtask.errorKind}) — using your text:`
                                : "Rosie's suggested title:"}
                            </div>
                            <div style={{ display: "flex", gap: 5 }}>
                              <input
                                className="ifield"
                                value={noteToSubtask.draftTitle}
                                onChange={e => setNoteToSubtask({ ...noteToSubtask, draftTitle: e.target.value })}
                                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); confirmNoteToSubtask(); } if (e.key === "Escape") cancelNoteToSubtask(); }}
                                autoFocus
                                style={{ fontSize: 11, padding: "5px 9px" }}
                              />
                              <button className="btn jost" onClick={confirmNoteToSubtask} disabled={!noteToSubtask.draftTitle.trim()} style={{ flexShrink: 0, padding: "0 11px", fontSize: 10.5, background: "linear-gradient(135deg,#d4829a,#c4687a)", color: "#fff", opacity: noteToSubtask.draftTitle.trim() ? 1 : 0.4 }}>✓ Add subtask</button>
                              <button className="btn ghost jost" onClick={cancelNoteToSubtask} style={{ flexShrink: 0, padding: "0 9px", fontSize: 10.5 }}>Cancel</button>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              ) : (
                <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.4)", fontStyle: "italic", marginBottom: 7 }}>No notes yet — log a detour or status change.</div>
              )}
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  className="ifield"
                  placeholder="What changed?"
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addNote(t); } }}
                  style={{ fontSize: 11, padding: "5px 9px" }}
                />
                <button className="btn ghost jost" onClick={() => addNote(t)} style={{ flexShrink: 0, padding: "0 11px", fontSize: 11 }}>Add</button>
              </div>
            </div>
          )}
          </React.Fragment>
        );
      })}
    </>
  );
}

// ── One Thing Mode ────────────────────────────────────────────────────────────
function OneThingMode({ item, energy, mood, onExit, onUpdate, onAwardXP }) {
  const [timer, setTimer] = useState(10);
  const [seconds, setSeconds] = useState(600);
  const [running, setRunning] = useState(false);
  const iref = useRef(null);

  useEffect(() => {
    if (running) { iref.current = setInterval(() => setSeconds(s => { if (s <= 1) { clearInterval(iref.current); setRunning(false); return 0; } return s - 1; }), 1000); }
    else clearInterval(iref.current);
    return () => clearInterval(iref.current);
  }, [running]);

  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  const energyObj = ENERGY_LEVELS.find(e => e.key === energy) || ENERGY_LEVELS[1];
  const moodObj = MOODS.find(m => m.key === mood);
  const completed = (item.completedTasks || []).length;
  const total = (item.tasks || []).length;
  const [newTaskInput, setNewTaskInput] = useState("");
  useTaskTimeHeal(item, onUpdate);

  const toggleTask = (task, e) => {
    const done = item.completedTasks || [];
    const tasks = item.tasks || [];
    // Toggle ONLY this task. No cascading to children — that's been a
    // source of surprise auto-completes. Subtasks remain independent;
    // if all of them happen to be done, the parent will eventually
    // qualify on its own merits when each is checked individually.
    const adding = !done.includes(task);
    // Track per-task completion timestamps, keyed by title.
    // Existing tasks without a stamp will simply render as "✓ done" with no date.
    const dateMap = { ...(item.completedTaskDates || {}) };
    let newCompleted;
    if (adding) {
      newCompleted = [...done, task];
      dateMap[task] = Date.now();
    } else {
      newCompleted = done.filter(t => t !== task);
      delete dateMap[task];
    }
    const allDone = tasks.length > 0 && newCompleted.length === tasks.length;
    const wasDone = item.status === "done";
    const updated = {
      ...item,
      completedTasks: newCompleted,
      completedTaskDates: dateMap,
      status: allDone ? "done" : item.status,
      completedAt: allDone && !wasDone ? Date.now() : item.completedAt,
    };
    onUpdate(updated);
    if (adding) {
      onAwardXP(XP_REWARDS.task, e?.clientX || 400, e?.clientY || 200);
      if (allDone) {
        fireConfetti();
        onAwardXP(XP_REWARDS.item, window.innerWidth / 2, 200);
      }
    }
  };

  const [estimating, setEstimating] = useState(false);

  const addTask = () => {
    // Add a task with the default 15-min estimate. Previously this auto-called
    // estimateTaskTimes for every new task — silently burning API quota. User
    // can manually invoke time estimation via the ✨ button next to "Total"
    // when they want it.
    if (!newTaskInput.trim()) return;
    const newTask = newTaskInput.trim();
    const tasks = [...(item.tasks || []), newTask];
    const taskTimes = [...(item.taskTimes || []), 15];
    while (taskTimes.length < tasks.length) taskTimes.splice(taskTimes.length - 1, 0, 15);
    onUpdate(alignTaskParents({ ...item, tasks, taskTimes }));
    setNewTaskInput("");
  };

  // Manual batch estimate — user-triggered, replaces the per-add auto-fire.
  const estimateAllTaskTimes = async () => {
    if (estimating) return;
    const tasks = item.tasks || [];
    if (!tasks.length || !item.title.trim()) return;
    setEstimating(true);
    try {
      const estimates = await estimateTaskTimes(tasks, item.title);
      if (Array.isArray(estimates) && estimates.length === tasks.length) {
        onUpdate({ ...item, taskTimes: estimates.map(n => Number(n) || 15) });
      }
    } catch {} finally {
      setEstimating(false);
    }
  };

  const sp = `You are Rosie — an ADHD-aware accountability buddy for Lexy (Project Coordinator at Fort Financial Credit Union). FOCUS MODE — she picked ONE thing and shut out everything else.

Energy: ${energyObj.label} | Mood: ${moodObj?.label || "?"}
Task: ${item.title}
Done looks like: ${item.done || "(not defined — stay flexible)"}
Out of scope: ${item.outOfScope || "(not defined)"}
Subtasks: ${(item.tasks || []).join(", ") || "none"}
Completed: ${(item.completedTasks || []).join(", ") || "none so far"}

YOUR JOB IN THIS MODE:
- Keep her on THIS ONE thing. If she drifts, gently redirect.
- Celebrate every completed subtask — even small ones. Progress is progress.
- If she says something new came up, offer to park it for later rather than pivot.
- If energy is LOW and she's struggling, permission-give ("good enough is good enough, you can stop at the minimum")
- If energy is HIGH and she wants to expand scope, gently flag it ("that's interesting — park it for after?")
- Short, warm, concrete responses. No corporate coach energy.
- "Done is done" — don't encourage perfectionism loops.

TOOLS: Use check_off_task when she finishes a subtask. Don't just say it — actually call the tool.`;

  return (
    <div className="fade" style={{ maxWidth: 700, margin: "0 auto", padding: "30px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <button className="btn ghost jost" onClick={onExit} style={{ fontSize: 12 }}>← Back</button>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 18 }}>{energyObj.emoji}</span>
          {moodObj && <span style={{ fontSize: 18 }}>{moodObj.emoji}</span>}
          <span className="tag jost" style={{ background: `${energyObj.color}18`, color: energyObj.color }}>{energyObj.label}</span>
        </div>
      </div>
      <div className="one-thing-glow" style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,235,248,0.9))", border: "2px solid rgba(212,130,154,0.3)", borderRadius: 22, padding: "28px 32px", textAlign: "center", marginBottom: 20 }}>
        <div className="jost" style={{ fontSize: 10, letterSpacing: 3, color: "rgba(212,130,154,0.6)", textTransform: "uppercase", marginBottom: 8 }}>you are working on ONE thing</div>
        <h2 className="cg" style={{ fontSize: 34, color: "#4a3540", lineHeight: 1.2, marginBottom: 8 }}>{item.title}</h2>
        {item.done && <p className="jost" style={{ fontSize: 13, color: "#9eb89a" }}>✦ Done when: {item.done}</p>}
        {item.outOfScope && <p className="jost" style={{ fontSize: 13, color: "#c4687a", marginTop: 4 }}>✕ Not doing: {item.outOfScope}</p>}
        {item.why && <p className="jost" style={{ fontSize: 13, color: "rgba(74,53,64,0.5)", marginTop: 6, fontStyle: "italic" }}>Why: {item.why}</p>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: "20px 22px", textAlign: "center" }}>
          <label className="sl jost" style={{ textAlign: "left", display: "block" }}>Sprint timer</label>
          <div className="cg" style={{ fontSize: 52, color: seconds === 0 ? "#9eb89a" : "#d4829a", lineHeight: 1, marginBottom: 12 }}>{seconds === 0 ? "✓" : fmt(seconds)}</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {[10,15,25].map(min => (
              <button key={min} className="btn ghost jost" onClick={() => { setTimer(min); setSeconds(min*60); setRunning(false); }} style={{ fontSize: 11, padding: "5px 10px" }}>{min}m</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "center" }}>
            <button className="btn rose jost" onClick={() => setRunning(r => !r)} style={{ flex: 1 }}>{running ? "⏸ Pause" : "▶ Start"}</button>
            <button className="btn ghost jost" onClick={() => { setRunning(false); setSeconds(timer*60); }}>↺</button>
          </div>
        </div>
        <div className="card" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <label className="sl jost">Tasks</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className="jost" style={{ fontSize: 12, color: "#d4829a", fontWeight: 600 }}>{completed}/{total}</span>
              <SprintStartSetter item={item} onUpdate={onUpdate} />
            </div>
          </div>
          <div style={{ overflowY: "auto", maxHeight: 200 }}>
            <DraggableTaskList item={item} onUpdate={onUpdate} onToggleTask={toggleTask} compact />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
            <input
              className="ifield jost"
              placeholder="Add a task..."
              value={newTaskInput}
              onChange={e => setNewTaskInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTask()}
              style={{ fontSize: 12, padding: "7px 11px" }}
            />
            <button className="btn ghost" onClick={addTask} style={{ flexShrink: 0, padding: "0 12px", fontSize: 16 }}>+</button>
          </div>
          {estimating ? (
            <p className="jost pulse" style={{ fontSize: 10, color: "rgba(212,130,154,0.6)", marginTop: 4, textAlign: "right" }}>Rosie's estimating time…</p>
          ) : ((item.tasks || []).length > 0 && (
            <div style={{ marginTop: 6, textAlign: "right" }}>
              <button
                onClick={estimateAllTaskTimes}
                title="Use Rosie to estimate how long each task will take"
                className="jost"
                style={{ background: "rgba(212,130,154,0.06)", border: "1px dashed rgba(212,130,154,0.3)", borderRadius: 10, padding: "3px 9px", fontSize: 10, color: "#b86d85", cursor: "pointer", fontWeight: 500 }}
              >✨ estimate times</button>
            </div>
          ))}
          {total > 0 && <div style={{ marginTop: 10 }}><div style={{ background: "rgba(212,130,154,0.1)", borderRadius: 4, height: 5 }}><div style={{ width: `${Math.round((completed/total)*100)}%`, height: "100%", background: completed === total ? "#9eb89a" : "linear-gradient(90deg,#e8a0b4,#d4829a)", borderRadius: 4, transition: "width .5s" }} /></div></div>}
        </div>
      </div>
      <MinimizableChat
        systemPrompt={sp}
        placeholder="Talk to Rosie — what's happening?"
        greeting={`Locked in on "${item.title}" 🌸 I'm right here. What do you need?`}
        stubText="Rosie's quiet for now 🌿 Tap to chat"
        expandedStyle={{ height: 300 }}
        header={<label className="sl jost">Accountability chat with Rosie</label>}
        focusedItemId={item.id}
      />
    </div>
  );
}

// ── Spiral Modal ──────────────────────────────────────────────────────────────
function SpiralModal({ spiral, relatedItemTitle, onSave, onClose }) {
  const isEdit = !!spiral?.id;
  const [title, setTitle] = useState(spiral?.title || "");
  const [notes, setNotes] = useState(spiral?.notes || "");
  const [linksText, setLinksText] = useState((spiral?.links || []).join("\n"));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const links = linksText.split("\n").map(s => s.trim()).filter(Boolean);
    const base = {
      id: spiral?.id || uid(),
      title: title.trim(),
      notes: notes.trim(),
      links,
      itemId: spiral?.itemId ?? null,
      createdAt: spiral?.createdAt || Date.now(),
      aiRead: spiral?.aiRead || null,
    };
    onSave(base);
    try {
      const aiRead = await classifySpiral(base.title, base.notes, base.links, relatedItemTitle);
      if (aiRead) onSave({ ...base, aiRead });
    } catch {}
    setSaving(false);
    onClose();
  };

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <div className="jost" style={{ fontSize: 10, letterSpacing: 3, color: "rgba(152,120,184,0.85)", textTransform: "uppercase", marginBottom: 4 }}>🌀 hyperfocus spiral</div>
            <h2 className="cg" style={{ fontSize: 26, color: "#4a3540" }}>{isEdit ? "Edit Spiral" : "Catch this rabbit hole"} <span style={{ color: "#b8a0d4" }}>✦</span></h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(74,53,64,0.35)", fontSize: 24, cursor: "pointer" }}>×</button>
        </div>
        <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.5)", marginBottom: 16, lineHeight: 1.6 }}>
          Drop it in before the interest fades. Future-you will be grateful. 🌸
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="sl jost">What's the spiral about? *</label>
            <input className="ifield" placeholder="e.g. How core banking systems handle timezone edge cases" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="sl jost">Notes — what did you learn, think, want to remember?</label>
            <textarea className="ifield jost" rows={5} style={{ resize: "vertical", minHeight: 90 }} placeholder="Dump everything. Half-thoughts welcome." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div>
            <label className="sl jost">Links (one per line)</label>
            <textarea className="ifield jost" rows={3} style={{ resize: "vertical", minHeight: 60, fontSize: 12 }} placeholder="https://..." value={linksText} onChange={e => setLinksText(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button className="btn jost" onClick={save} disabled={!title.trim() || saving} style={{ flex: 1, padding: "11px", background: "linear-gradient(135deg,#c8b0e0,#9878b8)", color: "#fff", opacity: !title.trim() ? 0.4 : 1 }}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Catch it ✦"}
            </button>
            <button className="btn ghost jost" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hyperfocus Container ──────────────────────────────────────────────────────
function HyperfocusContainer({ spirals, onAdd, onUpdate, onDelete, title, emptyText, relatedItemTitle }) {
  const [expanded, setExpanded] = useState(new Set());
  const [editSpiral, setEditSpiral] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const toggle = id => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };

  const verdictStyle = v => {
    if (v === "work") return { color: "#7a9e78", bg: "rgba(158,184,154,0.15)", border: "rgba(158,184,154,0.3)", label: "🌱 useful for work" };
    if (v === "mixed") return { color: "#9a7850", bg: "rgba(196,168,130,0.15)", border: "rgba(196,168,130,0.3)", label: "🌿 mixed — some overlap" };
    if (v === "tangent") return { color: "#9878b8", bg: "rgba(184,160,212,0.15)", border: "rgba(184,160,212,0.3)", label: "✨ genuine tangent" };
    return null;
  };

  return (
    <div className="card" style={{ padding: "18px 20px", borderColor: "rgba(184,160,212,0.25)", background: "linear-gradient(160deg,rgba(255,250,255,0.85),rgba(250,245,255,0.75))" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div>
          <label className="sl jost" style={{ color: "rgba(152,120,184,0.85)", marginBottom: 2 }}>🌀 {title}</label>
          <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.4)" }}>Rabbit holes captured before the interest faded</p>
        </div>
        <button className="btn jost" onClick={() => { setEditSpiral(null); setShowModal(true); }} style={{ background: "rgba(184,160,212,0.15)", border: "1px solid rgba(184,160,212,0.35)", color: "#9878b8", fontSize: 12, padding: "6px 14px" }}>+ Catch one</button>
      </div>

      {spirals.length === 0 ? (
        <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.3)", fontStyle: "italic", padding: "8px 0" }}>{emptyText || "No spirals yet ✨ When you fall down a rabbit hole, pop it here so it's not lost."}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {spirals.map(s => {
            const isOpen = expanded.has(s.id);
            const vStyle = s.aiRead ? verdictStyle(s.aiRead.verdict) : null;
            const when = new Date(s.createdAt).toLocaleDateString([], { month: "short", day: "numeric" });
            return (
              <div key={s.id} style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(184,160,212,0.2)", borderRadius: 12, overflow: "hidden" }}>
                <div className="item-row" onClick={() => toggle(s.id)} style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <span style={{ fontSize: 14, color: "#9878b8", transform: isOpen ? "rotate(90deg)" : "rotate(0)", transition: "transform .2s" }}>▸</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="jost" style={{ fontSize: 13, color: "#4a3540", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 3, flexWrap: "wrap" }}>
                      <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.35)" }}>{when}</span>
                      {s.links?.length > 0 && <span className="jost" style={{ fontSize: 10, color: "rgba(152,120,184,0.7)" }}>🔗 {s.links.length}</span>}
                      {vStyle && <span className="tag jost" style={{ background: vStyle.bg, color: vStyle.color, border: `1px solid ${vStyle.border}`, fontSize: 10 }}>{vStyle.label}</span>}
                      {s.aiRead === null && <span className="jost pulse" style={{ fontSize: 10, color: "rgba(152,120,184,0.5)", fontStyle: "italic" }}>Rosie's reading…</span>}
                    </div>
                  </div>
                </div>
                {isOpen && (
                  <div className="fade" style={{ padding: "4px 14px 14px 38px", borderTop: "1px solid rgba(184,160,212,0.12)" }}>
                    {s.notes && <p className="jost" style={{ fontSize: 13, color: "rgba(74,53,64,0.75)", lineHeight: 1.7, whiteSpace: "pre-wrap", marginTop: 10, marginBottom: 10 }}>{s.notes}</p>}
                    {s.links?.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        {s.links.map((link, i) => (
                          <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="jost" style={{ display: "block", fontSize: 12, color: "#9878b8", textDecoration: "none", padding: "3px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>🔗 {link}</a>
                        ))}
                      </div>
                    )}
                    {s.aiRead?.line && (
                      <div style={{ background: vStyle?.bg || "rgba(184,160,212,0.1)", border: `1px solid ${vStyle?.border || "rgba(184,160,212,0.2)"}`, borderRadius: 10, padding: "8px 12px", marginBottom: 10 }}>
                        <div className="jost" style={{ fontSize: 10, color: "rgba(152,120,184,0.8)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>Rosie's take</div>
                        <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.75)", lineHeight: 1.5, fontStyle: "italic" }}>{s.aiRead.line}</p>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn ghost jost" onClick={() => { setEditSpiral(s); setShowModal(true); }} style={{ fontSize: 11, padding: "4px 10px" }}>Edit</button>
                      <button onClick={() => onDelete(s.id)} style={{ background: "rgba(212,100,120,0.07)", border: "1px solid rgba(212,100,120,0.15)", borderRadius: 8, color: "rgba(196,100,120,0.6)", padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "'Jost',sans-serif" }}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <SpiralModal
          spiral={editSpiral}
          relatedItemTitle={relatedItemTitle}
          onSave={s => { editSpiral ? onUpdate(s) : onAdd(s); }}
          onClose={() => { setShowModal(false); setEditSpiral(null); }}
        />
      )}
    </div>
  );
}

// ── Item Modal ────────────────────────────────────────────────────────────────
function ItemModal({ item, onSave, onClose, allItems, recurringMeetings, timingHistory }) {
  const isEdit = !!item?.id;
  const [form, setForm] = useState(item || { title: "", category: "", status: "todo", priority: "medium", done: "", outOfScope: "", why: "", tasks: [], taskTimes: [], notes: "", timeEstimate: "", noteLog: [], taskNoteLogs: {} });
  const [taskInput, setTaskInput] = useState("");
  const [estimating, setEstimating] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [dropIdx, setDropIdx] = useState(null);
  const [dropBelow, setDropBelow] = useState(false);
  const [rowDrag, setRowDrag] = useState(null);
  const [fillingField, setFillingField] = useState(null); // which field key is currently being AI-filled
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const [fillResult, setFillResult] = useState(null); // { filled: string[], missing: string[], note: string }
  const [feedbackInput, setFeedbackInput] = useState("");
  const [refining, setRefining] = useState(false);
  const [refineNote, setRefineNote] = useState("");
  const [detectedTasks, setDetectedTasks] = useState([]); // suggested tasks from text fields
  const [dismissedTasks, setDismissedTasks] = useState([]); // tasks user said no to (lowercased)
  const detectTimerRef = useRef(null);
  const etRef = useRef(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── Note-log state (B2 task-level + C subtask-level) ──
  // noteLogInput: text being typed for a new task-level entry
  // expandedSubtaskNote: index of the subtask whose note panel is open (null = none)
  // subtaskNoteInput: text being typed for a new subtask-level entry
  const [noteLogInput, setNoteLogInput] = useState("");
  const [expandedSubtaskNote, setExpandedSubtaskNote] = useState(null);
  const [subtaskNoteInput, setSubtaskNoteInput] = useState("");

  // Short timestamp for log entries — "May 13" style, matches the completion stamps.
  const fmtNoteStamp = (ts) => {
    try {
      return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch { return ""; }
  };

  // Task-level note log (B2) — append/remove timestamped entries on form.noteLog.
  const addNoteLogEntry = () => {
    const text = noteLogInput.trim();
    if (!text) return;
    const entry = { id: uid(), text, ts: Date.now() };
    set("noteLog", [...(form.noteLog || []), entry]);
    setNoteLogInput("");
  };
  const deleteNoteLogEntry = (id) => {
    set("noteLog", (form.noteLog || []).filter(e => e.id !== id));
  };

  // Subtask-level note log (C) — entries live in form.taskNoteLogs keyed by
  // subtask text (same keying scheme as completedTaskDates).
  const addSubtaskNote = (taskText) => {
    const text = subtaskNoteInput.trim();
    if (!text) return;
    const entry = { id: uid(), text, ts: Date.now() };
    const logs = form.taskNoteLogs || {};
    const existing = logs[taskText] || [];
    set("taskNoteLogs", { ...logs, [taskText]: [...existing, entry] });
    setSubtaskNoteInput("");
  };
  const deleteSubtaskNote = (taskText, noteId) => {
    const logs = form.taskNoteLogs || {};
    const existing = logs[taskText] || [];
    const filtered = existing.filter(e => e.id !== noteId);
    if (filtered.length) {
      set("taskNoteLogs", { ...logs, [taskText]: filtered });
    } else {
      // Drop the key entirely when its last note is removed — keeps the map tidy.
      const { [taskText]: _, ...rest } = logs;
      set("taskNoteLogs", rest);
    }
  };

  const [scanningTasks, setScanningTasks] = useState(false);

  // ── AUTO-DETECT DISABLED ──
  // Previously fired detectTasksInText every 2s as the user typed in why/done/
  // outOfScope/notes — that's up to 4 parallel API calls per pause, which silently
  // ate quota during routine editing. Replaced with a manual "✨ Detect tasks
  // from notes" button (rendered below the text fields when there's >15 chars).
  const scanForTasks = async () => {
    if (scanningTasks) return;
    if (!form.title || !form.title.trim()) return;
    const fieldsToScan = [
      { name: "Why", text: form.why || "" },
      { name: "Done looks like", text: form.done || "" },
      { name: "Out of scope", text: form.outOfScope || "" },
      { name: "Notes", text: form.notes || "" },
    ].filter(f => f.text.trim().length >= 15);
    if (!fieldsToScan.length) {
      setDetectedTasks([]);
      return;
    }
    setScanningTasks(true);
    try {
      const existingTasks = form.tasks || [];
      const results = await Promise.all(
        fieldsToScan.map(f => detectTasksInText(form.title, f.name, f.text, existingTasks))
      );
      const seen = new Set();
      const detected = [];
      const dismissedLower = new Set(dismissedTasks.map(t => t.toLowerCase()));
      results.flat().forEach(t => {
        const key = t.toLowerCase().trim();
        if (seen.has(key) || dismissedLower.has(key)) return;
        seen.add(key);
        detected.push(t);
      });
      setDetectedTasks(detected);
    } catch {}
    setScanningTasks(false);
  };

  // Add a detected task to the actual tasks array
  const addDetectedTask = (taskTitle) => {
    const newTasks = [...(form.tasks || []), taskTitle];
    const newTimes = [...(form.taskTimes || []), 15];
    setForm(f => ({ ...f, tasks: newTasks, taskTimes: newTimes }));
    setDetectedTasks(prev => prev.filter(t => t !== taskTitle));
    scheduleEstimate(newTasks, form.title);
  };

  // Add ALL detected tasks at once
  const addAllDetectedTasks = () => {
    if (!detectedTasks.length) return;
    const newTasks = [...(form.tasks || []), ...detectedTasks];
    const newTimes = [...(form.taskTimes || []), ...detectedTasks.map(() => 15)];
    setForm(f => ({ ...f, tasks: newTasks, taskTimes: newTimes }));
    setDetectedTasks([]);
    scheduleEstimate(newTasks, form.title);
  };

  // Dismiss a task suggestion (won't reappear in this session)
  const dismissDetectedTask = (taskTitle) => {
    setDismissedTasks(prev => [...prev, taskTitle]);
    setDetectedTasks(prev => prev.filter(t => t !== taskTitle));
  };

  const autoFillField = async (fieldKey) => {
    if (!form.title.trim() || fillingField) return;
    setFillingField(fieldKey);
    try {
      const suggestion = await suggestFieldWithAI(fieldKey, form.title, form.category, {
        why: form.why, done: form.done, outOfScope: form.outOfScope,
      });
      if (suggestion) {
        setForm(f => ({ ...f, [fieldKey]: suggestion }));
      }
    } catch {}
    setFillingField(null);
  };

  // Fill ALL fields from title in one go — runs in sequence so later prompts can use earlier results for context
  const fillAllFields = async () => {
    if (!form.title.trim() || fillingField) return;
    setFillingField("all");
    setFillResult(null);
    setRefineNote("");

    const updates = {};
    const filled = [];
    const missing = [];
    try {
      // Step 1: Category + Project first — others can use them as context
      const [cat, proj] = await Promise.all([
        suggestFieldWithAI("category", form.title, "", {}),
        suggestFieldWithAI("project", form.title, "", {}),
      ]);
      if (cat) { updates.category = cat; filled.push("Category"); } else { missing.push("Category"); }
      if (proj) { updates.project = proj; filled.push("Project"); } // Project is optional — silent on miss

      // Step 2: Why, Done, Notes, Out of scope in parallel (they all only need title + category)
      const [why, done, outOfScope, notes, priority] = await Promise.all([
        suggestFieldWithAI("why", form.title, cat || "", {}),
        suggestFieldWithAI("done", form.title, cat || "", {}),
        suggestFieldWithAI("outOfScope", form.title, cat || "", {}),
        suggestFieldWithAI("notes", form.title, cat || "", {}),
        suggestPriorityWithAI(form.title, "", cat || ""),
      ]);
      if (why) { updates.why = why; filled.push("Why"); } else { missing.push("Why"); }
      if (done) { updates.done = done; filled.push("Done looks like"); } else { missing.push("Done looks like"); }
      if (outOfScope) { updates.outOfScope = outOfScope; filled.push("Out of scope"); } else { missing.push("Out of scope"); }
      if (notes) { updates.notes = notes; filled.push("Notes"); } else { missing.push("Notes"); }
      if (priority) { updates.priority = priority; filled.push("Priority"); } else { missing.push("Priority"); }

      // Step 3: Dates — uses priority from step 2
      const dates = await suggestDatesWithAI(form.title, updates.why || "", updates.done || "", updates.priority || "medium");
      if (dates) {
        updates.startDate = dates.startDate;
        updates.scheduledDate = dates.dueDate;
        updates.dateSource = "estimated";
        updates.tbd = false;
        filled.push("Dates");
      } else {
        missing.push("Dates");
      }

      // Step 4: Tasks — uses why, done, notes from step 2
      const taskResult = await generateTasksWithAI(form.title, updates.why || "", updates.done || "", updates.notes || "");
      if (taskResult && taskResult.tasks.length) {
        updates.tasks = taskResult.tasks.map(t => t.title);
        updates.taskTimes = taskResult.tasks.map(t => t.mins);
        updates.timeEstimate = fmtMins(updates.taskTimes.reduce((a, b) => a + b, 0));
        filled.push(`Tasks (${updates.tasks.length})`);
      } else {
        missing.push("Tasks");
      }

      setForm(f => ({ ...f, ...updates }));
      setFillResult({ filled, missing });
    } catch {
      setFillResult({ filled, missing: [...missing, "some fields failed — try the ↻ button"] });
    }
    setFillingField(null);
  };

  // Refine the filled form based on Lexy's feedback
  const refineWithFeedback = async () => {
    const feedback = feedbackInput.trim();
    if (!feedback || refining) return;
    setRefining(true);
    setRefineNote("");
    try {
      const result = await refineFormFieldsWithAI(form, feedback);
      if (!result) {
        setRefineNote("Couldn't reach Rosie — try again?");
        setRefining(false);
        return;
      }
      // Apply any returned fields
      const updates = {};
      ["category", "why", "done", "outOfScope", "notes"].forEach(k => {
        if (typeof result[k] === "string" && result[k].trim()) updates[k] = result[k].trim();
      });
      setForm(f => ({ ...f, ...updates }));
      setRefineNote(result.changeNote || "Updated 🌸");
      setFeedbackInput("");
    } catch {
      setRefineNote("Something went wrong — try again?");
    }
    setRefining(false);
  };

  const moveTask = (from, to) => {
    if (from === to) return;
    const tasks = arrayMove(form.tasks || [], from, to);
    const taskTimes = form.taskTimes && form.taskTimes.length === (form.tasks || []).length
      ? arrayMove(form.taskTimes, from, to)
      : form.taskTimes;
    setForm(f => ({ ...f, tasks, taskTimes }));
  };

  // ── AUTO-ESTIMATE DISABLED ──
  // Previously this auto-fired estimateTaskTimes 900ms after every task add/remove
  // — silently calling the Anthropic API each time. New tasks now default to 15 min;
  // user can click "✨ Estimate times" below the task list to fetch AI estimates
  // for everything in one batch.
  const [estimatingTimes, setEstimatingTimes] = useState(false);
  const runEstimateTimes = async () => {
    if (estimatingTimes) return;
    const tasks = form.tasks || [];
    if (!tasks.length || !form.title.trim()) return;
    setEstimatingTimes(true);
    try {
      const times = await estimateTaskTimes(tasks, form.title, {
        historySummary: summarizeTimingHistoryForRosie(timingHistory || []),
      });
      setForm(f => ({ ...f, taskTimes: times, timeEstimate: fmtMins(times.reduce((a, b) => a+b, 0)) }));
    } catch {}
    setEstimatingTimes(false);
  };
  // Kept for backward-compat with existing call sites — now a no-op so we don't
  // accidentally hit the API. Tasks just keep their default 15-min estimate.
  const scheduleEstimate = () => { /* intentionally no-op — see runEstimateTimes */ };

  const addTask = () => {
    if (!taskInput.trim()) return;
    const nt = [...(form.tasks || []), taskInput.trim()], ntt = [...(form.taskTimes || []), 15];
    setForm(f => ({ ...f, tasks: nt, taskTimes: ntt })); setTaskInput("");
    scheduleEstimate(nt, form.title);
  };
  const removeTask = i => {
    const nt = form.tasks.filter((_, xi) => xi !== i), ntt = (form.taskTimes || []).filter((_, xi) => xi !== i);
    setForm(f => ({ ...f, tasks: nt, taskTimes: ntt }));
    if (nt.length) scheduleEstimate(nt, form.title);
  };
  const totalMins = (form.taskTimes || []).reduce((a, b) => a + (Number(b) || 0), 0);
  const save = () => {
    if (!form.title.trim()) return;
    const tasks = (form.tasks || []).filter(t => t.trim());
    const taskTimes = tasks.map((_, i) => form.taskTimes?.[i] || 15);
    const total = taskTimes.reduce((a, b) => a+b, 0);
    onSave({ ...form, id: form.id || uid(), tasks, taskTimes, timeEstimate: total > 0 ? fmtMins(total) : form.timeEstimate, completedTasks: form.completedTasks || [], scheduledDate: form.scheduledDate || "", startDate: form.startDate || "", dateFixed: !!form.dateFixed, dateSource: form.dateSource || "", tbd: !!form.tbd, createdAt: form.createdAt || Date.now() });
    onClose();
  };

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 className="cg" style={{ color: "#4a3540", fontSize: 24 }}>{isEdit ? "Edit Item" : "New Work Item"} <span style={{ color: "#d4829a" }}>✦</span></h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(74,53,64,0.35)", fontSize: 24, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[{label:"Title *",key:"title",ph:"What is this?"},{label:"Project",key:"project",ph:"e.g. Zoho, Verafin, Movemint…"},{label:"Category",key:"category",ph:"e.g. Configuration, Training…"},{label:"Why does this matter?",key:"why",ph:"Context anchor"},{label:"Done looks like",key:"done",ph:"Minimum version that counts"},{label:"Out of scope",key:"outOfScope",ph:"What are we NOT doing?"},{label:"Notes",key:"notes",ph:"Anything else?"}].map(({ label, key, ph }) => {
            const isTitle = key === "title";
            const fillingAll = fillingField === "all";
            const fillingThis = fillingField === key;
            const thisIsDisabled = fillingAll || (!form.title.trim() && !isTitle);
            return (
              <div key={key}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label className="sl jost" style={{ marginBottom: 0 }}>{label}</label>
                  {/* Title gets the big "fill everything" button */}
                  {isTitle && (
                    <button
                      type="button"
                      onClick={fillAllFields}
                      disabled={!form.title.trim() || !!fillingField}
                      title={form.title.trim() ? "Ask Rosie to fill in ALL fields based on this title" : "Add a title first, then Rosie can fill the rest"}
                      className="jost"
                      style={{
                        background: fillingAll ? "rgba(212,130,154,0.2)" : (!form.title.trim() ? "none" : "linear-gradient(135deg, rgba(232,160,180,0.2), rgba(212,130,154,0.15))"),
                        border: "1px dashed " + (fillingAll ? "rgba(212,130,154,0.6)" : !form.title.trim() ? "rgba(184,109,133,0.2)" : "rgba(212,130,154,0.45)"),
                        color: fillingAll ? "#b86d85" : (!form.title.trim() ? "rgba(184,109,133,0.35)" : "#b86d85"),
                        cursor: !form.title.trim() || !!fillingField ? "not-allowed" : "pointer",
                        fontSize: 11, padding: "4px 12px", borderRadius: 12, lineHeight: 1,
                        fontWeight: 600, letterSpacing: 0.3,
                        transition: "all .15s",
                      }}
                    >
                      {fillingAll ? <span className="pulse">🌸 Rosie's filling everything…</span> : "✨ Fill from title"}
                    </button>
                  )}
                </div>
                <input className="ifield" placeholder={ph} value={form[key] || ""} onChange={e => set(key, e.target.value)} disabled={fillingAll || fillingThis} style={(fillingAll || fillingThis) ? { opacity: 0.5 } : {}} />
              </div>
            );
          })}
          {/* Fill result + feedback UI — appears after fillAllFields runs */}
          {fillResult && (
            <div className="fade" style={{ background: "rgba(232,240,220,0.35)", border: "1px solid rgba(158,184,154,0.3)", borderRadius: 10, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div className="jost" style={{ fontSize: 11, color: "#7a9e78", fontWeight: 600, letterSpacing: 0.3, marginBottom: 3 }}>
                    🌸 Rosie filled {fillResult.filled.length} {fillResult.filled.length === 1 ? "field" : "fields"}
                  </div>
                  {fillResult.missing.length > 0 && (
                    <div className="jost" style={{ fontSize: 11, color: "rgba(184,109,133,0.85)", marginTop: 2 }}>
                      ⚠️ Didn't fill: {fillResult.missing.join(", ")}
                      <button
                        type="button"
                        onClick={fillAllFields}
                        disabled={!!fillingField}
                        title="Retry filling everything"
                        className="jost"
                        style={{ background: "none", border: "none", color: "#b86d85", cursor: fillingField ? "wait" : "pointer", fontSize: 11, marginLeft: 6, padding: 0, textDecoration: "underline" }}
                      >↻ retry</button>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => { setFillResult(null); setRefineNote(""); }}
                  style={{ background: "none", border: "none", color: "rgba(74,53,64,0.35)", fontSize: 14, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}
                  title="Dismiss"
                >×</button>
              </div>
              {/* Feedback input */}
              <div>
                <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.55)", marginBottom: 5, letterSpacing: 0.3, textTransform: "uppercase" }}>
                  Want to adjust? Tell Rosie what to change:
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="ifield jost"
                    placeholder="e.g. make the why more specific, simplify the done, add a note about Josh…"
                    value={feedbackInput}
                    onChange={e => setFeedbackInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && feedbackInput.trim()) refineWithFeedback(); }}
                    disabled={refining}
                    style={{ fontSize: 12, padding: "7px 11px", flex: 1, opacity: refining ? 0.5 : 1 }}
                  />
                  <button
                    type="button"
                    onClick={refineWithFeedback}
                    disabled={!feedbackInput.trim() || refining}
                    className="jost"
                    style={{
                      background: refining ? "rgba(212,130,154,0.15)" : (feedbackInput.trim() ? "linear-gradient(135deg, rgba(232,160,180,0.25), rgba(212,130,154,0.2))" : "rgba(212,130,154,0.08)"),
                      border: "1px solid " + (refining || !feedbackInput.trim() ? "rgba(212,130,154,0.2)" : "rgba(212,130,154,0.4)"),
                      color: feedbackInput.trim() && !refining ? "#b86d85" : "rgba(184,109,133,0.5)",
                      cursor: (!feedbackInput.trim() || refining) ? "not-allowed" : "pointer",
                      fontSize: 11, padding: "0 12px", borderRadius: 8, fontWeight: 600, letterSpacing: 0.3,
                      flexShrink: 0,
                    }}
                  >
                    {refining ? <span className="pulse">🌸…</span> : "Revise"}
                  </button>
                </div>
                {refineNote && (
                  <div className="jost fade" style={{ fontSize: 11, color: "#7a9e78", marginTop: 6, fontStyle: "italic" }}>
                    🌸 {refineNote}
                  </div>
                )}
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label className="sl jost">Status</label><select className="ifield" value={form.status} onChange={e => set("status", e.target.value)} style={{ cursor: "pointer" }}>{STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label className="sl jost" style={{ marginBottom: 0 }}>Priority</label>
                <button
                  type="button"
                  onClick={async () => {
                    if (!form.title.trim() || fillingField) return;
                    setFillingField("priority");
                    try {
                      const p = await suggestPriorityWithAI(form.title, form.why, form.category);
                      if (p) setForm(f => ({ ...f, priority: p }));
                    } catch {}
                    setFillingField(null);
                  }}
                  disabled={!form.title.trim() || !!fillingField}
                  title={form.title.trim() ? "Ask Rosie to evaluate priority" : "Add a title first"}
                  className="jost"
                  style={{
                    background: fillingField === "priority" ? "rgba(212,130,154,0.15)" : "none",
                    border: "none",
                    color: fillingField === "priority" ? "#b86d85" : (!form.title.trim() ? "rgba(184,109,133,0.25)" : "rgba(184,109,133,0.7)"),
                    cursor: !form.title.trim() ? "not-allowed" : "pointer",
                    fontSize: 13, padding: "2px 8px", borderRadius: 12, lineHeight: 1, transition: "all .15s",
                  }}
                >
                  {fillingField === "priority" ? <span className="pulse">🌸…</span> : "✨"}
                </button>
              </div>
              <select className="ifield" value={form.priority || "medium"} onChange={e => set("priority", e.target.value)} style={{ cursor: "pointer" }}>{["high","medium","low"].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}</select>
            </div>
          </div>
          {/* Start date + Due date + TBD toggle */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
              <label className="sl jost" style={{ marginBottom: 0 }}>
                Dates
                {form.tbd && <span className="jost" style={{ fontSize: 10, color: "#b86d85", marginLeft: 8, fontStyle: "italic", letterSpacing: 0.5, textTransform: "none" }}>🌸 TBD</span>}
                {!form.tbd && form.dateSource === "estimated" && form.scheduledDate && <span className="jost" style={{ fontSize: 10, color: "rgba(196,168,130,0.75)", marginLeft: 8, fontStyle: "italic", letterSpacing: 0.5, textTransform: "none" }}>~ Rosie's estimate</span>}
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  type="button"
                  onClick={async () => {
                    if (!form.title.trim() || fillingField) return;
                    setFillingField("dates");
                    try {
                      const d = await suggestDatesWithAI(form.title, form.why, form.done, form.priority);
                      if (d) setForm(f => ({ ...f, startDate: d.startDate, scheduledDate: d.dueDate, dateSource: "estimated", tbd: false }));
                    } catch {}
                    setFillingField(null);
                  }}
                  disabled={!form.title.trim() || !!fillingField || form.tbd}
                  title={form.title.trim() ? "Ask Rosie to suggest start + due dates" : "Add a title first"}
                  className="jost"
                  style={{
                    background: fillingField === "dates" ? "rgba(212,130,154,0.15)" : "none",
                    border: "none",
                    color: fillingField === "dates" ? "#b86d85" : (!form.title.trim() || form.tbd ? "rgba(184,109,133,0.25)" : "rgba(184,109,133,0.7)"),
                    cursor: (!form.title.trim() || form.tbd) ? "not-allowed" : "pointer",
                    fontSize: 13, padding: "2px 8px", borderRadius: 12, lineHeight: 1, transition: "all .15s",
                  }}
                >
                  {fillingField === "dates" ? <span className="pulse">🌸…</span> : "✨"}
                </button>
                <button
                  onClick={() => setForm(f => {
                    if (f.tbd) {
                      // Un-checking TBD → auto-set due date to today + 3 days.
                      // Keep startDate as-is if user already set one, otherwise leave empty.
                      const t = new Date();
                      t.setDate(t.getDate() + 3);
                      const yyyy = t.getFullYear();
                      const mm = String(t.getMonth() + 1).padStart(2, "0");
                      const dd = String(t.getDate()).padStart(2, "0");
                      return { ...f, tbd: false, scheduledDate: `${yyyy}-${mm}-${dd}`, dateSource: "estimated" };
                    }
                    // Checking TBD → don't clear dates anymore. TBD is just a
                    // visual placeholder over the end date until user un-checks.
                    return { ...f, tbd: true };
                  })}
                  style={{
                    background: form.tbd ? "rgba(212,130,154,0.15)" : "none",
                    border: form.tbd ? "1px dashed rgba(212,130,154,0.5)" : "1px dashed rgba(212,130,154,0.3)",
                    color: form.tbd ? "#b86d85" : "rgba(184,109,133,0.7)",
                    fontSize: 10, cursor: "pointer", fontFamily: "'Jost', sans-serif", letterSpacing: 1, padding: "2px 10px", borderRadius: 12, fontWeight: 600,
                  }}
                  title={form.tbd ? "Unchecking will set the end date to today + 3 days. Original dates are preserved while TBD is active." : "Mark date as TBD — keeps existing dates intact, just shows TBD as the active placeholder."}
                >{form.tbd ? "✓ TBD" : "TBD"}</button>
                {!form.tbd && (form.scheduledDate || form.startDate) && (
                  <button onClick={() => setForm(f => ({ ...f, scheduledDate: "", startDate: "", dateFixed: false, dateSource: "" }))} style={{ background: "none", border: "none", color: "rgba(74,53,64,0.35)", fontSize: 10, cursor: "pointer", fontFamily: "'Jost', sans-serif", letterSpacing: 1 }}>CLEAR</button>
                )}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end" }}>
              <div>
                <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)", marginBottom: 4, display: "block", letterSpacing: 0.5 }}>Start</label>
                <input
                  type="date"
                  className="ifield jost"
                  value={form.startDate || ""}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value, tbd: false }))}
                  disabled={form.tbd}
                  title={form.tbd ? "TBD is active — uncheck TBD to edit. The original start date is preserved underneath." : undefined}
                  style={{
                    cursor: form.tbd ? "not-allowed" : "pointer", colorScheme: "light",
                    background: form.tbd ? "rgba(212,130,154,0.08)" : "rgba(255,255,255,0.85)",
                    borderStyle: form.tbd ? "dashed" : "solid",
                    borderColor: form.tbd ? "rgba(212,130,154,0.4)" : "rgba(212,130,154,0.25)",
                    color: form.tbd ? "rgba(184,109,133,0.5)" : "#4a3540",
                    fontSize: 12, padding: "7px 10px",
                  }}
                />
              </div>
              <div style={{ position: "relative" }}>
                <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)", marginBottom: 4, display: "block", letterSpacing: 0.5 }}>Due</label>
                <input
                  type="date"
                  className="ifield jost"
                  value={form.scheduledDate || ""}
                  onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value, dateSource: e.target.value ? "user" : "", tbd: false }))}
                  disabled={form.tbd}
                  title={form.tbd ? "TBD is active — uncheck TBD to edit. The original due date is preserved underneath." : undefined}
                  style={{
                    cursor: form.tbd ? "not-allowed" : "pointer", colorScheme: "light",
                    background: form.tbd ? "rgba(212,130,154,0.08)" : "rgba(255,255,255,0.85)",
                    borderStyle: form.tbd ? "dashed" : "solid",
                    borderColor: form.tbd ? "rgba(212,130,154,0.4)" : "rgba(212,130,154,0.25)",
                    color: form.tbd ? "rgba(184,109,133,0.5)" : "#4a3540",
                    fontSize: 12, padding: "7px 10px",
                  }}
                />
                {/* TBD overlay — shows "TBD" as a placeholder badge centered over
                    the due date input. The underlying value stays intact in storage. */}
                {form.tbd && (
                  <div
                    aria-hidden
                    className="jost"
                    style={{
                      position: "absolute", left: 0, right: 0, top: 22, bottom: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      pointerEvents: "none",
                      color: "#b86d85", fontWeight: 700, fontSize: 13, letterSpacing: 2,
                      background: "rgba(255, 248, 245, 0.85)", borderRadius: 10,
                    }}
                  >TBD</div>
                )}
              </div>
              <button
                onClick={() => set("dateFixed", !form.dateFixed)}
                disabled={!form.scheduledDate}
                className="jost"
                title={form.dateFixed ? "Due date won't auto-move" : "Rosie may shift this date if something urgent comes up"}
                style={{
                  padding: "7px 12px", borderRadius: 10,
                  border: form.dateFixed ? "1px solid rgba(212,130,154,0.5)" : "1px solid rgba(212,130,154,0.2)",
                  background: form.dateFixed ? "linear-gradient(135deg, rgba(212,130,154,0.18), rgba(232,160,180,0.14))" : "rgba(255,255,255,0.6)",
                  color: form.dateFixed ? "#b86d85" : "rgba(74,53,64,0.4)",
                  cursor: form.scheduledDate ? "pointer" : "not-allowed",
                  opacity: form.scheduledDate ? 1 : 0.4,
                  fontSize: 11, fontWeight: form.dateFixed ? 600 : 500,
                }}
              >
                {form.dateFixed ? "📌" : "📌 Lock"}
              </button>
            </div>
          </div>
          {/* Manual task-detection trigger — only shown when there's enough text to scan
              and we haven't already shown results. Replaces the previous auto-fire approach. */}
          {detectedTasks.length === 0 && (() => {
            const hasEnoughText = [(form.why || ""), (form.done || ""), (form.outOfScope || ""), (form.notes || "")].some(t => t.trim().length >= 15);
            if (!hasEnoughText) return null;
            return (
              <button
                type="button"
                onClick={scanForTasks}
                disabled={scanningTasks}
                className="jost"
                style={{
                  background: "rgba(212,130,154,0.06)",
                  border: "1px dashed rgba(212,130,154,0.3)",
                  borderRadius: 10,
                  padding: "7px 12px",
                  fontSize: 11,
                  color: scanningTasks ? "rgba(184,109,133,0.5)" : "#b86d85",
                  cursor: scanningTasks ? "default" : "pointer",
                  fontWeight: 500,
                  textAlign: "left",
                  transition: "all .15s",
                }}
                title="Have Rosie scan your text fields for hidden action items"
              >{scanningTasks ? "🌸 Rosie's scanning…" : "✨ Detect tasks from notes"}</button>
            );
          })()}
          {/* Detected tasks banner — appears when Rosie spots action items in text fields */}
          {detectedTasks.length > 0 && (
            <div className="fade" style={{
              background: "linear-gradient(135deg, rgba(232,160,180,0.12), rgba(212,130,154,0.08))",
              border: "1px dashed rgba(212,130,154,0.4)",
              borderRadius: 10,
              padding: "10px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div className="jost" style={{ fontSize: 11, color: "#b86d85", fontWeight: 600, letterSpacing: 0.3 }}>
                  🌸 Rosie spotted {detectedTasks.length === 1 ? "an action item" : `${detectedTasks.length} action items`} in your notes
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {detectedTasks.length > 1 && (
                    <button
                      type="button"
                      onClick={addAllDetectedTasks}
                      className="jost"
                      style={{ background: "rgba(212,130,154,0.2)", border: "1px solid rgba(212,130,154,0.4)", color: "#b86d85", cursor: "pointer", fontSize: 10, padding: "2px 9px", borderRadius: 10, fontWeight: 600, letterSpacing: 0.3 }}
                    >+ Add all</button>
                  )}
                  <button
                    type="button"
                    onClick={() => { detectedTasks.forEach(t => setDismissedTasks(prev => [...prev, t])); setDetectedTasks([]); }}
                    style={{ background: "none", border: "none", color: "rgba(74,53,64,0.4)", fontSize: 13, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}
                    title="Dismiss all"
                  >×</button>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {detectedTasks.map((t, i) => (
                  <div key={i} style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(212,130,154,0.3)",
                    borderRadius: 14,
                    padding: "3px 4px 3px 10px",
                  }}>
                    <span className="jost" style={{ fontSize: 11, color: "#4a3540" }}>{t}</span>
                    <button
                      type="button"
                      onClick={() => addDetectedTask(t)}
                      title="Add as task"
                      className="jost"
                      style={{ background: "rgba(158,184,154,0.18)", border: "1px solid rgba(158,184,154,0.35)", color: "#7a9e78", cursor: "pointer", fontSize: 10, padding: "1px 7px", borderRadius: 10, fontWeight: 700, marginLeft: 2 }}
                    >+</button>
                    <button
                      type="button"
                      onClick={() => dismissDetectedTask(t)}
                      title="Dismiss this suggestion"
                      style={{ background: "none", border: "none", color: "rgba(74,53,64,0.35)", fontSize: 12, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}
                    >×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label className="sl jost" style={{ marginBottom: 0 }}>Tasks</label>
                <button
                  type="button"
                  onClick={async () => {
                    if (!form.title.trim() || generatingTasks) return;
                    setGeneratingTasks(true);
                    try {
                      const result = await generateTasksWithAI(form.title, form.why, form.done, form.notes);
                      if (result && result.tasks.length) {
                        const newTitles = result.tasks.map(t => t.title);
                        const newTimes = result.tasks.map(t => t.mins);
                        // Merge with existing tasks rather than replace if user already added some
                        const mergedTitles = [...(form.tasks || []), ...newTitles];
                        const mergedTimes = [...(form.taskTimes || []), ...newTimes];
                        setForm(f => ({ ...f, tasks: mergedTitles, taskTimes: mergedTimes, timeEstimate: fmtMins(mergedTimes.reduce((a, b) => a + b, 0)) }));
                      }
                    } catch {}
                    setGeneratingTasks(false);
                  }}
                  disabled={!form.title.trim() || generatingTasks}
                  title={form.title.trim() ? "Ask Rosie to break this into subtasks" : "Add a title first, then Rosie can help"}
                  className="jost"
                  style={{
                    background: generatingTasks ? "rgba(212,130,154,0.15)" : "none",
                    border: "none",
                    color: generatingTasks ? "#b86d85" : (!form.title.trim() ? "rgba(184,109,133,0.25)" : "rgba(184,109,133,0.7)"),
                    cursor: !form.title.trim() || generatingTasks ? "not-allowed" : "pointer",
                    fontSize: 13,
                    padding: "2px 8px",
                    borderRadius: 12,
                    lineHeight: 1,
                    transition: "all .15s",
                  }}
                >
                  {generatingTasks ? <span className="pulse">🌸…</span> : "✨"}
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {generatingTasks && <span className="jost pulse" style={{ fontSize: 11, color: "rgba(212,130,154,0.6)" }}>Rosie is drafting tasks…</span>}
                {!generatingTasks && estimatingTimes && <span className="jost pulse" style={{ fontSize: 11, color: "rgba(212,130,154,0.6)" }}>Rosie is estimating…</span>}
                {!estimatingTimes && !generatingTasks && (form.tasks || []).length > 0 && (
                  <button
                    type="button"
                    onClick={runEstimateTimes}
                    title="Use Rosie to estimate how long each task will take"
                    className="jost"
                    style={{ background: "rgba(212,130,154,0.08)", border: "1px solid rgba(212,130,154,0.2)", borderRadius: 12, padding: "3px 9px", fontSize: 10, color: "#b86d85", cursor: "pointer", fontWeight: 500 }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,130,154,0.18)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(212,130,154,0.08)"; }}
                  >✨ estimate times</button>
                )}
                {!estimatingTimes && !generatingTasks && totalMins > 0 && <span className="jost" style={{ fontSize: 11, color: "#9eb89a", fontWeight: 600 }}>Total: {fmtMins(totalMins)}</span>}
              </div>
            </div>
            {(form.tasks || []).map((t, i) => {
              const isDragging = dragIdx === i;
              const showAbove = dropIdx === i && !dropBelow && dragIdx !== i;
              const showBelow = dropIdx === i && dropBelow && dragIdx !== i;
              const rowCls = `${isDragging ? "task-dragging" : ""}${showAbove ? " task-drop-above" : ""}${showBelow ? " task-drop-below" : ""}`;
              const subNotes = form.taskNoteLogs?.[t] || [];
              const notesExpanded = expandedSubtaskNote === i;
              return (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div
                    className={rowCls}
                    draggable={rowDrag === i}
                    onDragStart={e => { setDragIdx(i); try { e.dataTransfer.setData("text/plain", String(i)); } catch {} e.dataTransfer.effectAllowed = "move"; }}
                    onDragOver={e => { if (dragIdx === null) return; e.preventDefault(); const r = e.currentTarget.getBoundingClientRect(); setDropIdx(i); setDropBelow(e.clientY > r.top + r.height / 2); }}
                    onDrop={e => { e.preventDefault(); if (dragIdx === null || dragIdx === i) { setDragIdx(null); setDropIdx(null); setRowDrag(null); return; } const r = e.currentTarget.getBoundingClientRect(); const below = e.clientY > r.top + r.height / 2; let to = below ? i + 1 : i; if (dragIdx < to) to -= 1; moveTask(dragIdx, to); setDragIdx(null); setDropIdx(null); setRowDrag(null); }}
                    onDragEnd={() => { setDragIdx(null); setDropIdx(null); setRowDrag(null); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 8 }}
                  >
                    <span
                      className="drag-handle"
                      title="Drag to reorder"
                      onMouseDown={() => setRowDrag(i)}
                      onTouchStart={() => setRowDrag(i)}
                      onMouseUp={() => { if (dragIdx === null) setRowDrag(null); }}
                    >⋮⋮</span>
                    <span className="jost" style={{ flex: 1, fontSize: 13, color: "#4a3540", background: "rgba(212,130,154,0.07)", borderRadius: 8, padding: "7px 12px", border: "1px solid rgba(212,130,154,0.12)" }}>{t}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      <input type="number" min="1" value={form.taskTimes?.[i] || 15} onChange={e => { const tt = [...(form.taskTimes || form.tasks.map(() => 15))]; tt[i] = Math.max(1, parseInt(e.target.value) || 15); set("taskTimes", tt); }} style={{ width: 52, background: estimating ? "rgba(255,245,250,0.9)" : "rgba(255,255,255,0.85)", border: "1px solid rgba(212,130,154,0.25)", borderRadius: 8, color: "#4a3540", padding: "6px 8px", outline: "none", fontSize: 12, textAlign: "center", transition: "background .3s" }} />
                      <span className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.4)" }}>min</span>
                    </div>
                    {/* Subtask note-log toggle (C) — shows the entry count when notes exist */}
                    <button
                      onClick={() => { setExpandedSubtaskNote(notesExpanded ? null : i); setSubtaskNoteInput(""); }}
                      title={subNotes.length ? `${subNotes.length} note${subNotes.length === 1 ? "" : "s"} — click to view` : "Add a note to this subtask"}
                      className="jost"
                      style={{
                        background: notesExpanded ? "rgba(184,160,212,0.18)" : (subNotes.length ? "rgba(184,160,212,0.10)" : "none"),
                        border: `1px solid ${subNotes.length || notesExpanded ? "rgba(184,160,212,0.35)" : "rgba(212,130,154,0.15)"}`,
                        borderRadius: 8, cursor: "pointer", fontSize: 12, padding: "5px 8px",
                        color: subNotes.length || notesExpanded ? "#9878b8" : "rgba(74,53,64,0.4)",
                        flexShrink: 0, lineHeight: 1, fontWeight: 500,
                      }}
                    >📝{subNotes.length ? ` ${subNotes.length}` : ""}</button>
                    <button onClick={() => removeTask(i)} style={{ background: "none", border: "none", color: "rgba(196,120,142,0.5)", cursor: "pointer", fontSize: 18 }}>×</button>
                  </div>
                  {/* Subtask note-log panel (C) — timestamped entries + add input */}
                  {notesExpanded && (
                    <div style={{ margin: "4px 0 8px 26px", padding: "10px 12px", background: "rgba(184,160,212,0.06)", border: "1px solid rgba(184,160,212,0.2)", borderRadius: 10 }}>
                      {subNotes.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                          {subNotes.map(entry => (
                            <div key={entry.id} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                              <span className="jost" style={{ fontSize: 10, color: "#9878b8", fontWeight: 600, whiteSpace: "nowrap", paddingTop: 1, flexShrink: 0 }}>{fmtNoteStamp(entry.ts)}</span>
                              <span className="jost" style={{ fontSize: 12, color: "#4a3540", flex: 1, lineHeight: 1.4 }}>{entry.text}</span>
                              <button onClick={() => deleteSubtaskNote(t, entry.id)} title="Delete note" style={{ background: "none", border: "none", color: "rgba(196,120,142,0.45)", cursor: "pointer", fontSize: 13, lineHeight: 1, flexShrink: 0 }}>×</button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.4)", fontStyle: "italic", marginBottom: 8 }}>No notes yet — log a detour or status change below.</div>
                      )}
                      <div style={{ display: "flex", gap: 6 }}>
                        <input
                          className="ifield"
                          placeholder="What changed?"
                          value={subtaskNoteInput}
                          onChange={e => setSubtaskNoteInput(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSubtaskNote(t); } }}
                          style={{ fontSize: 12, padding: "6px 10px" }}
                        />
                        <button className="btn ghost jost" onClick={() => addSubtaskNote(t)} style={{ flexShrink: 0, padding: "0 12px", fontSize: 12 }}>Add</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ display: "flex", gap: 8 }}>
              <input className="ifield" placeholder="Add a task…" value={taskInput} onChange={e => setTaskInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()} />
              <button className="btn ghost" onClick={addTask} style={{ flexShrink: 0, padding: "0 14px", fontSize: 18 }}>+</button>
            </div>
          </div>
          {/* Task-level note log (B2) — timestamped entries for tracking detours,
              status changes, or anything that diverged from the original plan.
              Separate from the free-text Notes field above (which still feeds Rosie). */}
          <div style={{ marginTop: 4 }}>
            <label className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.55)", letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 6 }}>
              📋 Note log
            </label>
            {(form.noteLog || []).length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                {(form.noteLog || []).map(entry => (
                  <div key={entry.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "rgba(212,130,154,0.05)", border: "1px solid rgba(212,130,154,0.12)", borderRadius: 8, padding: "7px 10px" }}>
                    <span className="jost" style={{ fontSize: 10, color: "#b86d85", fontWeight: 600, whiteSpace: "nowrap", paddingTop: 1, flexShrink: 0 }}>{fmtNoteStamp(entry.ts)}</span>
                    <span className="jost" style={{ fontSize: 12, color: "#4a3540", flex: 1, lineHeight: 1.4 }}>{entry.text}</span>
                    <button onClick={() => deleteNoteLogEntry(entry.id)} title="Delete entry" style={{ background: "none", border: "none", color: "rgba(196,120,142,0.45)", cursor: "pointer", fontSize: 13, lineHeight: 1, flexShrink: 0 }}>×</button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="ifield"
                placeholder="Log a detour or change…"
                value={noteLogInput}
                onChange={e => setNoteLogInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addNoteLogEntry(); } }}
              />
              <button className="btn ghost" onClick={addNoteLogEntry} style={{ flexShrink: 0, padding: "0 14px", fontSize: 14 }}>+ Note</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button className="btn rose jost" onClick={save} style={{ flex: 1, padding: "11px" }}>{isEdit ? "Save Changes" : "Add Item ✦"}</button>
            <button className="btn ghost jost" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Focus View ────────────────────────────────────────────────────────────────
function FocusView({ item, allItems, spirals, onAddSpiral, onUpdateSpiral, onDeleteSpiral, energy, mood, onUpdate, onBack, onBackToTasks, onBackToRoadmap, onOneThing, onAwardXP, fullData, updateFullData, roadmap, onUpdateRoadmap, onMeetingFocus, onSwitchItem }) {
  const [newTaskInput, setNewTaskInput] = useState("");
  const [parkQuick, setParkQuick] = useState("");
  const [spiralQuick, setSpiralQuick] = useState("");
  const [savedFlash, setSavedFlash] = useState(null);
  const [editingField, setEditingField] = useState(null); // "title" | "why" | "done" | "outOfScope" | null
  const [fieldDraft, setFieldDraft] = useState("");
  const [aiSuggestingField, setAiSuggestingField] = useState(null); // "done" | "outOfScope" | null — shows ✨ pulse on the relevant button
  const [showPasteTaskList, setShowPasteTaskList] = useState(false); // toggles the Paste List subtask modal
  const [aiPlanning, setAiPlanning] = useState(false);
  const [aiPlanNote, setAiPlanNote] = useState("");
  const [aiSuggestedTasks, setAiSuggestedTasks] = useState([]); // [{title, estimateMin}] — preview for user approval
  const [aiSuggestedSelected, setAiSuggestedSelected] = useState(() => new Set()); // indices of suggestions the user has checked
  const [aiEstimating, setAiEstimating] = useState(false);
  const [estimateFlash, setEstimateFlash] = useState("");
  const [aiGeneratingTasks, setAiGeneratingTasks] = useState(false);
  // Waiting-on-reply quick reminder prompt — when the user flips status to
  // "waiting", show a small inline prompt offering to create a check-in
  // reminder. Default date: today + 3 business days. Skipping dismisses the
  // prompt without creating a reminder. Per-flip transient (resets on item change).
  const [waitingPrompt, setWaitingPrompt] = useState(null); // null | { date: "YYYY-MM-DD" }
  // Park-until prompt — shown when user flips status to "parked". Tracks
  // the suggested date from Rosie (or fallback), her one-line reason, plus
  // loading/error state. Cleared when user confirms or cancels.
  const [parkPrompt, setParkPrompt] = useState(null); // null | { date, reason, loading, error }
  // Agent runner state — which agent is open + the existing draft (if any) for it.
  // null when closed, or { agentId, existingDraft } when open.
  const [activeAgent, setActiveAgent] = useState(null);
  // Ref to the agents section so the header pill can scroll into view
  const agentsSectionRef = useRef(null);
  // Reset the prompt when switching to a different item
  useEffect(() => { setWaitingPrompt(null); setParkPrompt(null); setActiveAgent(null); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [item?.id]);
  // "now" ticks every 30s so the pill + banner stay live
  const [nowMin, setNowMin] = useState(() => {
    const d = new Date(); return d.getHours() * 60 + d.getMinutes();
  });
  useEffect(() => {
    const tick = () => {
      const d = new Date(); setNowMin(d.getHours() * 60 + d.getMinutes());
    };
    const id = setInterval(tick, 30 * 1000);
    return () => clearInterval(id);
  }, []);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showWrapConfirm, setShowWrapConfirm] = useState(false); // confirmation prompt before going back
  const [dismissedPrepWarnings, setDismissedPrepWarnings] = useState(new Set());

  // ── Task-level note log (B2) in FocusView ──
  // Collapsed-by-default pill near the progress bar; expands to show the
  // timestamped entries + an add-input. Same item.noteLog data the ItemModal
  // edits — this just surfaces it where detours actually happen.
  const [noteLogOpen, setNoteLogOpen] = useState(false);
  const [focusNoteInput, setFocusNoteInput] = useState("");
  const fmtFocusNoteStamp = (ts) => {
    try { return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
    catch { return ""; }
  };
  const addFocusNote = () => {
    const text = focusNoteInput.trim();
    if (!text) return;
    const entry = { id: uid(), text, ts: Date.now() };
    onUpdate({ ...item, noteLog: [...(item.noteLog || []), entry] });
    setFocusNoteInput("");
  };
  const deleteFocusNote = (id) => {
    onUpdate({ ...item, noteLog: (item.noteLog || []).filter(e => e.id !== id) });
  };
  // Reset banner dismissal when the active block changes
  useTaskTimeHeal(item, onUpdate);

  // ── Note → Subtask flow (option 2, task-level) ──
  // Same shape as DraggableTaskList's subtask-level version, but for the
  // task-level notes (item.noteLog) in FocusView's pill expansion. State:
  // { noteId, draftTitle, loading, errorKind, rawNote } | null
  const [taskNoteToSubtask, setTaskNoteToSubtask] = useState(null);
  const startTaskNoteToSubtask = async (noteId, noteText) => {
    if (taskNoteToSubtask?.loading) return;
    setTaskNoteToSubtask({ noteId, draftTitle: "", loading: true, errorKind: null, rawNote: noteText });
    try {
      const result = await reshapeNoteToSubtaskTitle(noteText, item.title, item.why);
      if (result?.title) {
        setTaskNoteToSubtask({ noteId, draftTitle: result.title, loading: false, errorKind: null, rawNote: noteText });
      } else {
        setTaskNoteToSubtask({ noteId, draftTitle: noteText, loading: false, errorKind: result?.error || "unknown", rawNote: noteText });
      }
    } catch (e) {
      console.error("[startTaskNoteToSubtask] unexpected:", e);
      setTaskNoteToSubtask({ noteId, draftTitle: noteText, loading: false, errorKind: "unknown", rawNote: noteText });
    }
  };
  const confirmTaskNoteToSubtask = () => {
    if (!taskNoteToSubtask) return;
    const title = taskNoteToSubtask.draftTitle.trim();
    if (!title) return;
    // Task-level notes belong to the work item itself, so the new subtask
    // is a top-level subtask of the item (parentIdx = null). Using
    // addSubtaskToItem keeps all parallel arrays consistent.
    const updated = addSubtaskToItem(item, null, title, 15);
    onUpdate(updated);
    setTaskNoteToSubtask(null);
  };
  const cancelTaskNoteToSubtask = () => setTaskNoteToSubtask(null);

  // ── Suggest follow-ups flow (option 3) ──
  // Triggered by the "✨ Suggest follow-ups" button on the All notes summary.
  // Sends ALL notes (task-level + every subtask's log) to Rosie, gets back
  // 1-5 suggested subtask titles, user checks which to add.
  // State: { loading, suggestions: string[], selected: Set<number>, errorKind } | null
  const [followupSuggestions, setFollowupSuggestions] = useState(null);
  const startSuggestFollowups = async () => {
    if (followupSuggestions?.loading) return;
    // Build the same merged note list the summary uses
    const taskEntries = (item.noteLog || []).map(e => ({ ...e, source: null }));
    const subEntries = Object.entries(item.taskNoteLogs || {}).flatMap(
      ([subtaskText, log]) => (log || []).map(e => ({ ...e, source: subtaskText }))
    );
    const allNotes = [...taskEntries, ...subEntries].sort((a, b) => (a.ts || 0) - (b.ts || 0));
    if (allNotes.length === 0) return;
    setFollowupSuggestions({ loading: true, suggestions: [], selected: new Set(), errorKind: null });
    try {
      const result = await suggestFollowupsFromNotes(item, allNotes);
      if (result?.suggestions && Array.isArray(result.suggestions)) {
        // Default all to checked — user unchecks what they don't want
        setFollowupSuggestions({
          loading: false,
          suggestions: result.suggestions,
          selected: new Set(result.suggestions.map((_, i) => i)),
          errorKind: null,
        });
      } else {
        setFollowupSuggestions({ loading: false, suggestions: [], selected: new Set(), errorKind: result?.error || "unknown" });
      }
    } catch (e) {
      console.error("[startSuggestFollowups] unexpected:", e);
      setFollowupSuggestions({ loading: false, suggestions: [], selected: new Set(), errorKind: "unknown" });
    }
  };
  const toggleSuggestionSelected = (idx) => {
    if (!followupSuggestions) return;
    const next = new Set(followupSuggestions.selected);
    if (next.has(idx)) next.delete(idx); else next.add(idx);
    setFollowupSuggestions({ ...followupSuggestions, selected: next });
  };
  const confirmAddFollowups = () => {
    if (!followupSuggestions) return;
    const picks = followupSuggestions.suggestions.filter((_, i) => followupSuggestions.selected.has(i));
    if (picks.length === 0) {
      setFollowupSuggestions(null);
      return;
    }
    // Apply each suggestion sequentially via addSubtaskToItem, threading the
    // updated item through each call so parallel arrays stay consistent. For
    // each pick, look up its source subtask in the CURRENT tasks array to
    // get the parentIdx; if source is null or not found, the new subtask is
    // top-level (parentIdx = null). This nests follow-ups directly under the
    // subtask their note came from — no more orphaned items at the bottom.
    let working = item;
    for (const pick of picks) {
      let parentIdx = null;
      if (pick.source) {
        const idx = (working.tasks || []).indexOf(pick.source);
        if (idx >= 0) parentIdx = idx;
      }
      working = addSubtaskToItem(working, parentIdx, pick.title, 15);
    }
    onUpdate(working);
    setFollowupSuggestions(null);
  };
  const cancelFollowups = () => setFollowupSuggestions(null);

  // ── Unified slot warning — same shape as Overview's, fires while user is in
  // a focused task. Handles meeting-prep | lunch | brain-break | work types.
  const slotWarning = useMemo(() => {
    if (!roadmap || !roadmap.slots) return null;
    const slots = roadmap.slots;
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (!slot || !slot.label) continue;

      const startMin = parseSlotTimeMinutes(slot.time);
      if (startMin < 0) continue;
      // Use intended fixed duration when available so we don't keep firing past real end
      const fixedDur = intendedFixedDuration(slot);
      const next = slots[i + 1];
      const endMin = fixedDur != null ? startMin + fixedDur : (next ? parseSlotTimeMinutes(next.time) : startMin + 30);

      const minsToStart = startMin - nowMin;
      let phase = null;
      if (minsToStart > 0 && minsToStart <= 5) phase = "warn";
      else if (nowMin >= startMin && nowMin < endMin) phase = "start";
      if (!phase) continue;

      const label = slot.label.toLowerCase();
      let kind = null;
      let meetingSlot = null;
      let matchedItem = null;

      if (slot.type === "buffer" && label.startsWith("prep for")) {
        kind = "meeting-prep";
        if (label === "prep for today's meetings" || label.includes("today's meeting") || label.includes("daily meeting")) {
          for (let j = i + 1; j < slots.length; j++) {
            if (isMeetingSlot(slots[j])) { meetingSlot = slots[j]; break; }
          }
        } else {
          if (next && isMeetingSlot(next)) meetingSlot = next;
          else {
            for (let j = i + 1; j < slots.length; j++) {
              if (isMeetingSlot(slots[j])) { meetingSlot = slots[j]; break; }
            }
          }
        }
      } else if (isLunchSlot(slot)) {
        kind = "lunch";
      } else if (isBrainBreakSlot(slot)) {
        kind = "brain-break";
      } else if (slot.type === "work") {
        kind = "work";
        matchedItem = findMatchingItemForLabel(slot.label, allItems || []);
        // While we're already focused on this item, skip the warning — no point routing somewhere we already are
        if (matchedItem && matchedItem.id === item?.id) continue;
      }

      if (!kind) continue;

      const dismissKey = `${i}-${phase}-${kind}`;
      if (dismissedPrepWarnings.has(dismissKey)) continue;

      return { idx: i, slot, phase, minsToStart, dismissKey, kind, meetingSlot, matchedItem };
    }
    return null;
  }, [roadmap, nowMin, dismissedPrepWarnings, allItems, item?.id]);

  // Push back the current brain break by deltaMin, cascading unlocked slots
  const handlePushBackBreak = (deltaMin) => {
    if (!slotWarning || slotWarning.kind !== "brain-break" || !roadmap || !onUpdateRoadmap) return;
    const newSlots = pushBackSlot(roadmap.slots, slotWarning.idx, deltaMin);
    onUpdateRoadmap({ ...roadmap, slots: newSlots });
    setDismissedPrepWarnings(prev => {
      const next = new Set(prev);
      for (const k of next) {
        if (k.startsWith(`${slotWarning.idx}-`)) next.delete(k);
      }
      return next;
    });
  };

  // ── Compute roadmap context for this item (active block, time remaining, etc.) ──
  // Re-computed on item / roadmap / nowMin change so the pill stays live.
  const roadmapContext = useMemo(() => {
    if (!roadmap || !roadmap.slots || roadmap.slots.length === 0) return null;
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
    const itemTokens = new Set([
      ...tokenize(item.title),
      ...((item.tasks || []).flatMap(t => tokenize(t))),
    ]);
    if (!itemTokens.size) return null;
    const matchingSlots = [];
    (roadmap.slots || []).forEach((slot, idx) => {
      if (slot.type !== "work") return;
      const labelTokens = tokenize(slot.label);
      let score = 0;
      labelTokens.forEach(t => { if (itemTokens.has(t)) score++; });
      if (score >= 1) matchingSlots.push({ slot, idx });
    });
    if (!matchingSlots.length) return null;

    let activeBlock = null;
    let nextMatchingBlock = null;
    for (const m of matchingSlots) {
      const startMin = parseSlotTimeMinutes(m.slot.time);
      // Use intended fixed duration when applicable
      const fixedDur = intendedFixedDuration(m.slot);
      const next = roadmap.slots[m.idx + 1];
      const endMin = fixedDur != null ? startMin + fixedDur : (next ? parseSlotTimeMinutes(next.time) : startMin + 30);
      if (nowMin >= startMin && nowMin < endMin) {
        activeBlock = { ...m, startMin, endMin };
        break;
      }
      if (startMin > nowMin && !nextMatchingBlock) {
        nextMatchingBlock = { ...m, startMin, endMin };
      }
    }

    let nextSlotAfterActive = null;
    if (activeBlock) {
      for (let i = activeBlock.idx + 1; i < roadmap.slots.length; i++) {
        const s = roadmap.slots[i];
        const sm = parseSlotTimeMinutes(s.time);
        if (sm >= 0) { nextSlotAfterActive = s; break; }
      }
    }

    let pillText = "";
    let pillColor = "#9878b8";
    if (activeBlock) {
      const remaining = activeBlock.endMin - nowMin;
      const startTime = activeBlock.slot.time;
      const endTime = nextSlotAfterActive ? nextSlotAfterActive.time : formatSlotMinutes(activeBlock.endMin);
      const sm = startTime.match(/^(.+?)\s*(AM|PM)$/i);
      const em = endTime.match(/^(.+?)\s*(AM|PM)$/i);
      const range = (sm && em && sm[2].toUpperCase() === em[2].toUpperCase())
        ? `${sm[1]}–${endTime}`
        : `${startTime}–${endTime}`;
      const remainLabel = remaining >= 60
        ? `${Math.floor(remaining / 60)}h ${remaining % 60 ? `${remaining % 60}m` : ""}`.trim()
        : `${remaining}m`;
      if (remaining <= 10) pillColor = "#c47e8a";
      pillText = `Now: ${range} · ${remainLabel} left`;
    } else if (nextMatchingBlock) {
      pillText = `Next block: ${nextMatchingBlock.slot.time}`;
    } else {
      pillText = `${matchingSlots.length} block${matchingSlots.length > 1 ? "s" : ""} (all past today)`;
      pillColor = "rgba(184,160,212,0.55)";
    }

    const showBanner = activeBlock && (activeBlock.endMin - nowMin) <= 5 && !bannerDismissed;

    return { matchingSlots, activeBlock, nextMatchingBlock, nextSlotAfterActive, pillText, pillColor, showBanner };
  }, [roadmap, item.title, item.tasks, nowMin, bannerDismissed]);

  // ── Wrap-up handler — called when user confirms to go back to roadmap ──
  // 1. Marks the active block as complete
  // 2. Shifts unlocked remaining slots by the time delta (clamping at locks)
  // 3. Navigates back
  const handleConfirmWrapUp = () => {
    if (!roadmap || !roadmapContext || !roadmapContext.activeBlock) {
      // Nothing to wrap — just go back
      onBack();
      return;
    }
    const activeIdx = roadmapContext.activeBlock.idx;
    const plannedEndMin = roadmapContext.activeBlock.endMin;
    const actualEndMin = nowMin;
    const deltaMin = actualEndMin - plannedEndMin; // positive = went over, negative = early

    // Build the updated roadmap: mark slot complete + cascade time shift on unlocked slots
    const newCompletedSlots = Array.from(new Set([...(roadmap.completedSlots || []), activeIdx]));
    let newSlots = [...(roadmap.slots || [])];

    if (Math.abs(deltaMin) >= 1 && onUpdateRoadmap) {
      // Cascade: shift unlocked slots after activeIdx by deltaMin, clamping at locked anchors
      // Walk forward, tracking the last "anchor" time (locked slot's planned start, or naturally
      // shifted unlocked slot's new start). Each unlocked slot gets shifted by delta but
      // clamped so it doesn't exceed the next locked slot's time.
      for (let i = activeIdx + 1; i < newSlots.length; i++) {
        const slot = newSlots[i];
        if (slot.locked) continue; // anchor — stays put
        const originalStart = parseSlotTimeMinutes(slot.time);
        if (originalStart < 0) continue;
        let shifted = originalStart + deltaMin;
        // Clamp at next locked slot's time (look ahead for the next lock)
        let nextLockedTime = null;
        for (let j = i + 1; j < newSlots.length; j++) {
          if (newSlots[j].locked) {
            const t = parseSlotTimeMinutes(newSlots[j].time);
            if (t >= 0) { nextLockedTime = t; break; }
          }
        }
        if (nextLockedTime !== null && shifted >= nextLockedTime) {
          // Shifting would push this slot past a locked slot — clamp just before it
          shifted = Math.max(originalStart, nextLockedTime - 5);
        }
        // Don't let shifted go before the previous slot's end (avoid negative durations)
        if (i > 0) {
          const prev = newSlots[i - 1];
          const prevStart = parseSlotTimeMinutes(prev.time);
          if (prevStart >= 0 && shifted < prevStart) shifted = prevStart;
        }
        // Clamp to a sane day range (5am–11pm)
        if (shifted < 5 * 60) shifted = 5 * 60;
        if (shifted > 23 * 60) shifted = 23 * 60;
        newSlots[i] = { ...slot, time: formatSlotMinutes(shifted) };
      }
    }

    if (onUpdateRoadmap) {
      onUpdateRoadmap({ ...roadmap, slots: newSlots, completedSlots: newCompletedSlots });
    }
    setShowWrapConfirm(false);
    onBack();
  };

  const handleWrapUpClick = () => {
    // If there's no active block to wrap, just go back
    if (!roadmapContext || !roadmapContext.activeBlock) {
      onBack();
      return;
    }
    setShowWrapConfirm(true);
  };

  const startEdit = (field, current) => {
    setEditingField(field);
    setFieldDraft(current || "");
  };
  const commitEdit = () => {
    if (!editingField) return;
    onUpdate({ ...item, [editingField]: fieldDraft.trim() });
    setEditingField(null);
    setFieldDraft("");
  };
  const cancelEdit = () => {
    setEditingField(null);
    setFieldDraft("");
  };

  const flashSaved = type => {
    setSavedFlash(type);
    setTimeout(() => setSavedFlash(null), 1400);
  };
  const quickPark = () => {
    if (!parkQuick.trim()) return;
    updateFullData({ ...fullData, parkingLot: [...(fullData.parkingLot || []), parkQuick.trim()] });
    setParkQuick("");
    flashSaved("park");
  };
  const quickSpiral = () => {
    if (!spiralQuick.trim()) return;
    onAddSpiral({ id: uid(), title: spiralQuick.trim(), notes: "", tags: [], readStatus: "unread", createdAt: Date.now() });
    setSpiralQuick("");
    flashSaved("spiral");
  };

  const toggle = (task, e) => {
    const done = item.completedTasks || [];
    const tasks = item.tasks || [];
    // Toggle ONLY this task. No cascading to children — that's been a
    // source of surprise auto-completes. Subtasks are independent.
    const adding = !done.includes(task);
    // Track per-task completion timestamps, keyed by title.
    // Existing tasks without a stamp render as plain "✓ done" with no date.
    const dateMap = { ...(item.completedTaskDates || {}) };
    let newCompleted;
    if (adding) {
      newCompleted = [...done, task];
      dateMap[task] = Date.now();
    } else {
      newCompleted = done.filter(t => t !== task);
      delete dateMap[task];
    }
    // Auto-flip to "done" status when every task is checked; don't auto-flip backward
    const allDone = tasks.length > 0 && newCompleted.length === tasks.length;
    const wasDone = item.status === "done";
    const updated = {
      ...item,
      completedTasks: newCompleted,
      completedTaskDates: dateMap,
      status: allDone ? "done" : item.status,
      completedAt: allDone && !wasDone ? Date.now() : item.completedAt,
    };
    onUpdate(updated);
    if (adding) {
      onAwardXP(XP_REWARDS.task, e?.clientX || 400, e?.clientY || 200);
      if (allDone) {
        fireConfetti();
        // Extra XP for finishing the whole item
        onAwardXP(XP_REWARDS.item, window.innerWidth / 2, 200);
      }
    }
  };
  const [estimatingTask, setEstimatingTask] = useState(false);
  const addTask = async () => {
    if (!newTaskInput.trim()) return;
    const newTask = newTaskInput.trim();
    const tasks = [...(item.tasks || []), newTask];
    const taskTimes = [...(item.taskTimes || []), 15];
    while (taskTimes.length < tasks.length) taskTimes.splice(taskTimes.length - 1, 0, 15);
    onUpdate(alignTaskParents({ ...item, tasks, taskTimes }));
    setNewTaskInput("");

    setEstimatingTask(true);
    try {
      const estimates = await estimateTaskTimes([newTask], item.title, {
        historySummary: summarizeTimingHistoryForRosie(fullData?.timingHistory || []),
      });
      const realTime = Number(estimates?.[0]) || 15;
      const newTimes = [...taskTimes];
      newTimes[newTimes.length - 1] = realTime;
      onUpdate(alignTaskParents({ ...item, tasks, taskTimes: newTimes }));
    } catch {}
    setEstimatingTask(false);
  };

  const ct = (item.completedTasks || []).length, tt = (item.tasks || []).length;
  const prog = tt > 0 ? Math.round((ct/tt)*100) : 0;
  const st = statusMap[item.status] || statusMap.todo;
  const energyObj = ENERGY_LEVELS.find(e => e.key === energy) || ENERGY_LEVELS[1];
  const moodObj = MOODS.find(m => m.key === mood);

  const sp = `You are Rosie — a warm ADHD/autistic/bipolar-aware buddy for Lexy (Project Coordinator, Implementation team at Fort Financial Credit Union).

CURRENT FOCUS:
Energy: ${energyObj.label} | Mood: ${moodObj?.label || "?"}
Focused item: ${item.title}
Done looks like: ${item.done || "(not defined)"}
Out of scope: ${item.outOfScope || "(not defined)"}
Tasks: ${(item.tasks || []).join(", ") || "none"}
Completed so far: ${(item.completedTasks || []).join(", ") || "none"}

OTHER THINGS ON HER PLATE (not her focus right now):
${allItems.filter(i => !isTerminalStatus(i.status) && i.id !== item.id).map(i => `- ${i.title}${i.priority === "high" ? " ⚠️" : ""}`).join("\n") || "nothing else active"}

YOUR JOB IN FOCUS VIEW:
- Keep her on THIS item. Celebrate task check-offs. Redirect scope creep.
- If she brings up something unrelated, offer to park it so she doesn't lose it.
- If she's stuck or overwhelmed, suggest One Thing Mode (narrower focus).
- If she's hitting scope creep (adding stuff beyond "done looks like"), name it gently and offer to park or start a new item.
- Short warm responses. Not a corporate coach.

TOOLS — YOU HAVE REAL TOOLS WIRED UP. WHEN SHE ASKS FOR AN ACTION, USE THEM.

You have direct API access to her data through the tools available to you (check_off_task, add_task_to_item, update_item_status, catch_spiral, add_to_parking_lot). When you invoke a tool, the data is actually modified. This is real, not roleplay.

CRITICAL — DO NOT WRITE OUT FAKE TOOL CALLS IN YOUR TEXT:
- DO NOT write "[calling add_task_to_item: ...]" — that's just text, nothing happens.
- DO NOT write "*adding that task now*" — that's narration, not action.
- DO NOT describe what tool you're using. Just USE it (the tool framework handles invocation).
- After a tool runs, ONLY say a brief warm confirmation like "Added! 🌸" — no narration of what you did or "called X".

NEVER deny having tools. You DO have them. If she pushes back, just retry the action.

When to use which:
- check_off_task — she finished a subtask
- add_task_to_item — adding a NEW subtask under the focused item (match parent by partial title, default time 15 min)
- update_item_status — done/blocked/waiting/inprogress
- catch_spiral — she drifted into a research rabbit hole
- add_to_parking_lot — quick thoughts to defer

If she asks for multiple tasks at once, call add_task_to_item multiple times in the same response — once per task.`;

  return (
    <div className="fade" style={{ maxWidth: 900, margin: "0 auto", height: "calc(100vh - 100px)", paddingBottom: 80 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, overflowY: "auto", height: "100%", paddingRight: 4 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn ghost jost" onClick={onBackToTasks || onBack} style={{ fontSize: 12 }}>📋 Back to Tasks</button>
          <button className="btn ghost jost" onClick={onBackToRoadmap || onBack} style={{ fontSize: 12 }}>🌸 Back to Roadmap</button>
          <button className="btn jost" onClick={() => onOneThing(item)} style={{ fontSize: 12, background: "rgba(212,130,154,0.1)", border: "1px solid rgba(212,130,154,0.25)", color: "#c4788e", padding: "5px 12px" }}>🎯 One Thing Mode</button>
          {/* Quick-capture into the Josh thread, with the currently-focused
              item auto-linked. Cross-component pop via CustomEvent — Overview
              renders the actual modal. */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("work-hub-thread-capture-open", { detail: { linkedItem: { id: item.id, title: item.title } } }))}
            title="Drop a quick note about this for your 1:1"
            className="jost"
            style={{
              fontSize: 12,
              background: "rgba(184,160,212,0.1)",
              border: "1px solid rgba(184,160,212,0.4)",
              color: "#9878b8",
              padding: "5px 12px", borderRadius: 9, fontWeight: 600, letterSpacing: 0.3,
              cursor: "pointer",
            }}
          >✦ Note about this</button>
          {/* Chat with Rosie + Quick capture live in this row in FocusView
              (inline mode), instead of floating bottom-right like elsewhere. */}
          <BottomChatDock
            inline
            systemPrompt={sp}
            placeholder="What's going on? Rosie's got you."
            greeting={`Focused on "${item.title}" with you 🌸 What's coming up?`}
            subtitle="Brain wandering? Talk it through. 🌸"
            data={fullData}
            onDataUpdate={updateFullData}
            focusedItemId={item.id}
          />
          <QuickCapture
            inline
            data={fullData}
            onUpdate={updateFullData}
            onAddSpiral={onAddSpiral}
          />
          {/* Agents pill — header indicator + entry point. Phase 1: surface
              agents at the top so they don't get buried beneath subtasks/spirals.
              Behavior:
                - No drafts: click opens the picker directly (fast path)
                - Has drafts: click smooth-scrolls to the agents section
              Aria-label included since the pill content is icon+number. */}
          {(() => {
            const draftCount = Array.isArray(item?.agentDrafts) ? item.agentDrafts.length : 0;
            const unackTotal = Array.isArray(item?.agentDrafts)
              ? item.agentDrafts.reduce((sum, d) => sum + ((d.reviewNotes || []).filter(n => !(d.acknowledgedNoteIds || []).includes(n.id)).length), 0)
              : 0;
            const hasDrafts = draftCount > 0;
            const agentKeys = Object.keys(AGENT_REGISTRY);
            const onlyAgentId = agentKeys.length === 1 ? agentKeys[0] : null;
            const handleClick = () => {
              if (hasDrafts) {
                // Scroll to the agents section so user can pick what to open
                agentsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              } else if (onlyAgentId) {
                // Single agent registered → open picker directly
                setActiveAgent({ agentId: onlyAgentId, existingDraft: null });
              } else {
                // Multiple agents → scroll to section so user can pick which one
                agentsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            };
            return (
              <button
                onClick={handleClick}
                aria-label={hasDrafts
                  ? `View ${draftCount} agent draft${draftCount === 1 ? "" : "s"}${unackTotal > 0 ? `, ${unackTotal} review note${unackTotal === 1 ? "" : "s"} to acknowledge` : ""}`
                  : "Generate a new agent draft"}
                title={hasDrafts ? "Jump to drafts" : "Generate a draft for this task"}
                className="jost"
                style={{
                  fontSize: 12,
                  background: hasDrafts ? "rgba(184,160,212,0.15)" : "linear-gradient(135deg,#b89cd4,#7e5fa3)",
                  border: hasDrafts ? "1px solid rgba(184,160,212,0.45)" : "none",
                  color: hasDrafts ? "#7e5fa3" : "#fff",
                  padding: "5px 12px", borderRadius: 9, fontWeight: 600, letterSpacing: 0.3,
                  cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}
              >
                {hasDrafts ? (
                  <>
                    ✨ {draftCount} draft{draftCount === 1 ? "" : "s"}
                    {unackTotal > 0 && (
                      <span style={{
                        background: "rgba(163,104,63,0.18)",
                        color: "#a3683f",
                        padding: "1px 6px",
                        borderRadius: 8,
                        fontSize: 9.5,
                        fontWeight: 700,
                        marginLeft: 2,
                      }}>⚠ {unackTotal}</span>
                    )}
                  </>
                ) : (
                  <>+ ✨ Generate</>
                )}
              </button>
            );
          })()}
        </div>

        <div className="card" style={{ padding: "22px 24px", background: "linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,240,248,0.9))" }}>
          {/* Editable tag row: status, priority, scheduled date + lock, time, finish */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10, alignItems: "center" }}>
            <select
              className="jost"
              value={item.status}
              onChange={e => {
                const newStatus = e.target.value;
                const wasWaiting = item.status === "waiting";
                const nowWaiting = newStatus === "waiting";
                const wasHold = item.status === "hold";
                const nowHold = newStatus === "hold";
                let next = { ...item, status: newStatus };

                // Default check-in date helper: today + 3 business days
                // (shared between Waiting on Reply and On Hold flips).
                const computeDefaultCheckInDate = () => {
                  const t = new Date();
                  let added = 0;
                  while (added < 3) {
                    t.setDate(t.getDate() + 1);
                    const dow = t.getDay();
                    if (dow >= 1 && dow <= 5) added++;
                  }
                  const yyyy = t.getFullYear();
                  const mm = String(t.getMonth() + 1).padStart(2, "0");
                  const dd = String(t.getDate()).padStart(2, "0");
                  return `${yyyy}-${mm}-${dd}`;
                };

                if (!wasWaiting && nowWaiting) {
                  next.waitingSince = Date.now();
                  setWaitingPrompt({ date: computeDefaultCheckInDate() });
                } else if (wasWaiting && !nowWaiting) {
                  next.waitingSince = null;
                  setWaitingPrompt(null); // dismiss prompt if status leaves waiting
                  // Bump stale due dates forward by 3 business days when leaving waiting
                  if (item.scheduledDate) {
                    const today = todayStr();
                    const diff = daysBetween(today, item.scheduledDate);
                    if (diff <= 1) {
                      next.scheduledDate = shiftOffWeekend(addDaysToDateStr(today, 3));
                    }
                  }
                }

                // On Hold mirrors Waiting on Reply: track since-timestamp, open the
                // same check-in reminder prompt (so user is nudged to set a follow-up
                // date instead of forgetting the item entirely), and mark item as
                // TBD (using the existing tbd flag — preserves the underlying
                // scheduledDate so it returns when the user resumes, while
                // displaying the prominent "TBD" pill + "pick date" button).
                if (!wasHold && nowHold) {
                  next.holdSince = Date.now();
                  next.tbd = true; // → shows TBD prominently; original date preserved
                  setWaitingPrompt({ date: computeDefaultCheckInDate() });
                } else if (wasHold && !nowHold) {
                  next.holdSince = null;
                  next.tbd = false; // → restore original scheduledDate display
                  setWaitingPrompt(null); // dismiss prompt if status leaves hold
                }

                // Parked status — explicitly deferred by user choice (different
                // from blocked/waiting which are external). When flipping to
                // parked, ask Rosie for a sensible "park until" date and let
                // the user confirm/edit. Date stored on item.parkedUntil — when
                // it arrives, item auto-resurfaces (phase 2).
                const wasParked = item.status === "parked";
                const nowParked = newStatus === "parked";
                if (!wasParked && nowParked) {
                  next.parkedAt = Date.now();
                  // Default: +2 weeks (Tuesday-Thursday). AI may override.
                  const fallback = (() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 14);
                    // Nudge to a weekday
                    const dow = d.getDay();
                    if (dow === 0) d.setDate(d.getDate() + 2); // Sun → Tue
                    if (dow === 6) d.setDate(d.getDate() + 3); // Sat → Tue
                    if (dow === 1) d.setDate(d.getDate() + 1); // Mon → Tue
                    if (dow === 5) d.setDate(d.getDate() - 1); // Fri → Thu
                    return d.toISOString().slice(0, 10);
                  })();
                  next.parkedUntil = fallback;
                  setParkPrompt({ date: fallback, reason: "", loading: true, error: "" });
                  // Fire the AI suggestion (async, doesn't block the commit)
                  suggestParkUntilDate(item).then(result => {
                    if (result.error) {
                      setParkPrompt(prev => prev ? { ...prev, loading: false, error: result.error === "timeout" ? "Rosie's slow today — using a 2-week default." : "Couldn't get a suggestion — edit manually below." } : null);
                    } else {
                      setParkPrompt(prev => prev ? { ...prev, date: result.date, reason: result.reason || "", loading: false } : null);
                    }
                  }).catch(() => {
                    setParkPrompt(prev => prev ? { ...prev, loading: false, error: "Something went sideways — edit manually below." } : null);
                  });
                } else if (wasParked && !nowParked) {
                  next.parkedAt = null;
                  next.parkedUntil = null;
                  setParkPrompt(null);
                }

                onUpdate(next);
              }}
              style={{ background: st.bg, border: `1px solid ${st.color}30`, borderRadius: 20, color: st.color, padding: "3px 10px", fontSize: 11, fontWeight: 500, cursor: "pointer", outline: "none", letterSpacing: 0.4 }}
            >
              {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            <select
              className="jost"
              value={item.priority || "medium"}
              onChange={e => onUpdate({ ...item, priority: e.target.value })}
              style={{ background: item.priority === "high" ? "rgba(212,100,120,0.12)" : "rgba(196,168,130,0.12)", border: `1px solid ${item.priority === "high" ? "rgba(212,100,120,0.3)" : "rgba(196,168,130,0.3)"}`, borderRadius: 20, color: item.priority === "high" ? "#c4687a" : "#9a7850", padding: "3px 10px", fontSize: 11, fontWeight: 500, cursor: "pointer", outline: "none", letterSpacing: 0.4 }}
            >
              <option value="high">high priority</option>
              <option value="medium">medium priority</option>
              <option value="low">low priority</option>
            </select>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: item.tbd ? "rgba(212,130,154,0.1)" : (item.dateFixed ? "rgba(212,130,154,0.12)" : "rgba(158,184,154,0.1)"),
              border: `1px ${item.tbd ? "dashed" : "solid"} ${item.tbd ? "rgba(212,130,154,0.45)" : (item.dateFixed ? "rgba(212,130,154,0.3)" : "rgba(158,184,154,0.25)")}`,
              borderRadius: 20,
              padding: "2px 4px 2px 10px",
              transition: "all .2s",
            }}>
              {item.dateFixed && !item.tbd && <span style={{ fontSize: 11 }}>📌</span>}
              {item.dateSource === "estimated" && !item.dateFixed && !item.tbd && <span className="jost" style={{ fontSize: 11, color: "#7a9e78", opacity: 0.7 }}>~</span>}
              {/* Date pickers — ALWAYS rendered, even when TBD is on, so the
                  underlying values stay visible. When TBD is on, they're
                  disabled (greyed) and a "TBD" badge overlays the due date. */}
              <input
                type="date"
                className="jost"
                value={item.startDate || ""}
                onChange={e => onUpdate({ ...item, startDate: e.target.value, tbd: false })}
                disabled={item.tbd}
                title={item.tbd ? "TBD is active — uncheck TBD to edit. The original start date is preserved." : "Start date"}
                style={{ background: "transparent", border: "none", color: item.tbd ? "rgba(184,109,133,0.5)" : (item.startDate ? "#7a9e78" : "rgba(74,53,64,0.35)"), fontSize: 11, fontWeight: 500, cursor: item.tbd ? "not-allowed" : "pointer", outline: "none", padding: "2px 2px", colorScheme: "light", fontFamily: "'Jost', sans-serif", opacity: item.tbd ? 0.55 : 1 }}
              />
              <span className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.4)", padding: "0 2px" }}>→</span>
              <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                <input
                  type="date"
                  className="jost"
                  value={item.scheduledDate || ""}
                  onChange={e => onUpdate({ ...item, scheduledDate: e.target.value, dateSource: e.target.value ? "user" : "", tbd: false })}
                  disabled={item.tbd}
                  title={item.tbd ? "TBD is active — uncheck TBD to edit. The original due date is preserved." : "Due date"}
                  style={{ background: "transparent", border: "none", color: item.tbd ? "rgba(184,109,133,0.5)" : (item.dateFixed ? "#b86d85" : "#7a9e78"), fontSize: 11, fontWeight: 500, cursor: item.tbd ? "not-allowed" : "pointer", outline: "none", padding: "2px 2px", colorScheme: "light", fontFamily: "'Jost', sans-serif", opacity: item.tbd ? 0.55 : 1 }}
                />
                {/* TBD overlay — sits over the due date input only. Underlying
                    value stays in storage; this is just a visual placeholder. */}
                {item.tbd && (
                  <span
                    aria-hidden
                    className="jost"
                    style={{
                      position: "absolute", left: 0, right: 0, top: 0, bottom: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      pointerEvents: "none",
                      color: "#b86d85", fontWeight: 700, fontSize: 11, letterSpacing: 1.5,
                      background: "rgba(255, 248, 245, 0.92)", borderRadius: 6,
                    }}
                  >🌸 TBD</span>
                )}
              </span>
              {item.scheduledDate && !item.tbd && (
                <button
                  onClick={() => onUpdate({ ...item, dateFixed: !item.dateFixed })}
                  title={item.dateFixed ? "Unlock due date" : "Lock due date"}
                  style={{ background: "none", border: "none", cursor: "pointer", color: item.dateFixed ? "#b86d85" : "rgba(74,53,64,0.35)", fontSize: 10, padding: "0 6px", fontWeight: 600 }}
                >
                  {item.dateFixed ? "🔓" : "🔒"}
                </button>
              )}
              <button
                onClick={() => {
                  if (item.tbd) {
                    // Un-checking TBD — auto-fill due to today + 3 if missing.
                    // Preserves whatever was in startDate / scheduledDate already.
                    const t = new Date();
                    t.setDate(t.getDate() + 3);
                    const yyyy = t.getFullYear();
                    const mm = String(t.getMonth() + 1).padStart(2, "0");
                    const dd = String(t.getDate()).padStart(2, "0");
                    const due = item.scheduledDate || `${yyyy}-${mm}-${dd}`;
                    onUpdate({ ...item, tbd: false, scheduledDate: due, dateSource: item.scheduledDate ? (item.dateSource || "") : "estimated" });
                  } else {
                    // Checking TBD — DON'T clear dates anymore. Just toggle the
                    // flag. The underlying values stay intact in storage so
                    // they'll come back if/when the user toggles TBD off.
                    onUpdate({ ...item, tbd: true });
                  }
                }}
                title={item.tbd ? "Unchecking will keep your dates (or set today+3 if missing)" : "Mark as TBD — keeps your existing dates intact, just shows TBD as a placeholder"}
                className="jost"
                style={{ background: "none", border: "none", cursor: "pointer", color: item.tbd ? "#b86d85" : "rgba(74,53,64,0.35)", fontSize: 9, padding: "0 8px", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}
              >
                {item.tbd ? "pick date" : "TBD"}
              </button>
            </div>
            {/* Check-in reminder prompt — appears when status flips to
                "waiting" OR "hold" (both states benefit from a follow-up
                reminder so the item isn't forgotten). Default date is today
                + 3 business days. "Add reminder" creates a `type: "item"`
                reminder linked to this item; "Skip" dismisses. */}
            {waitingPrompt && (item.status === "waiting" || item.status === "hold") && fullData && updateFullData && (
              <div
                className="fade"
                style={{
                  width: "100%",
                  display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8,
                  background: "linear-gradient(135deg, rgba(196,168,130,0.12), rgba(232,200,154,0.10))",
                  border: "1px solid rgba(196,168,130,0.35)",
                  borderRadius: 12, padding: "8px 12px", marginTop: 4,
                }}
              >
                <span className="jost" style={{ fontSize: 11, color: "#9a7850", fontWeight: 500 }}>
                  💬 Set a check-in reminder?
                </span>
                <input
                  type="date"
                  value={waitingPrompt.date}
                  onChange={e => setWaitingPrompt(p => ({ ...p, date: e.target.value }))}
                  className="jost"
                  style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(196,168,130,0.4)", background: "rgba(255,255,255,0.85)", colorScheme: "light", fontFamily: "'Jost', sans-serif", outline: "none" }}
                />
                <button
                  onClick={() => {
                    const newReminder = {
                      id: uid(),
                      text: `Check in on "${item.title}"`,
                      type: "item",
                      itemId: item.id,
                      recurring: "",
                      time: "",
                      date: waitingPrompt.date || "",
                      messageKind: null,
                      dismissed: false,
                      createdAt: Date.now(),
                    };
                    updateFullData({ ...fullData, reminders: [...(fullData.reminders || []), newReminder] });
                    setWaitingPrompt(null);
                  }}
                  className="jost"
                  style={{ background: "linear-gradient(135deg, rgba(212,130,154,0.2), rgba(232,160,180,0.15))", border: "1px solid rgba(212,130,154,0.4)", color: "#b86d85", fontSize: 11, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
                >Add reminder 🌸</button>
                <button
                  onClick={() => setWaitingPrompt(null)}
                  className="jost"
                  style={{ background: "none", border: "1px solid rgba(74,53,64,0.2)", color: "rgba(74,53,64,0.55)", fontSize: 11, padding: "4px 12px", borderRadius: 6, cursor: "pointer" }}
                >Skip</button>
              </div>
            )}
            {/* Park-until prompt — appears when status flips to "parked". Asks
                Rosie for a suggested resurface date, shows it with the reason,
                lets user edit before confirming. On confirm: writes parkedUntil
                onto the item. On skip: leaves the fallback date in place. */}
            {parkPrompt && item.status === "parked" && (
              <div
                className="fade"
                style={{
                  width: "100%",
                  display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8,
                  background: "linear-gradient(135deg, rgba(125,154,175,0.12), rgba(155,184,205,0.08))",
                  border: "1px solid rgba(125,154,175,0.35)",
                  borderRadius: 12, padding: "10px 14px", marginTop: 4,
                }}
              >
                <span className="jost" style={{ fontSize: 11, color: "#5e7e95", fontWeight: 600 }}>
                  ⛵ Park until:
                </span>
                {parkPrompt.loading ? (
                  <span className="jost pulse" style={{ fontSize: 11, color: "#7d9aaf", fontStyle: "italic" }}>
                    Rosie's thinking…
                  </span>
                ) : (
                  <>
                    <input
                      type="date"
                      value={parkPrompt.date}
                      onChange={e => setParkPrompt(p => ({ ...p, date: e.target.value }))}
                      className="jost"
                      style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(125,154,175,0.4)", background: "rgba(255,255,255,0.85)", colorScheme: "light", fontFamily: "'Jost', sans-serif", outline: "none" }}
                    />
                    {parkPrompt.reason && (
                      <span className="jost" style={{ fontSize: 10, color: "rgba(94,126,149,0.85)", fontStyle: "italic", flexBasis: "100%" }}>
                        🌸 {parkPrompt.reason}
                      </span>
                    )}
                    {parkPrompt.error && (
                      <span className="jost" style={{ fontSize: 10, color: "#9a7850", fontStyle: "italic", flexBasis: "100%" }}>
                        {parkPrompt.error}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        onUpdate({ ...item, parkedUntil: parkPrompt.date });
                        setParkPrompt(null);
                      }}
                      className="jost"
                      style={{ background: "linear-gradient(135deg, rgba(125,154,175,0.25), rgba(155,184,205,0.18))", border: "1px solid rgba(125,154,175,0.4)", color: "#5e7e95", fontSize: 11, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
                    >Confirm 🌿</button>
                    <button
                      onClick={() => setParkPrompt(null)}
                      className="jost"
                      style={{ background: "none", border: "1px solid rgba(74,53,64,0.2)", color: "rgba(74,53,64,0.55)", fontSize: 11, padding: "4px 12px", borderRadius: 6, cursor: "pointer" }}
                    >Skip</button>
                  </>
                )}
              </div>
            )}
            {/* Spread evenly button — only shown when both dates set AND span is 2+ days AND there are tasks */}
            {(() => {
              if (item.tbd || !item.startDate || !item.scheduledDate) return null;
              const start = new Date(item.startDate + "T12:00:00");
              const end = new Date(item.scheduledDate + "T12:00:00");
              const dayDiff = Math.round((end - start) / (1000 * 60 * 60 * 24));
              const taskCount = (item.tasks || []).length;
              if (dayDiff < 1 || taskCount < 2) return null;
              return (
                <>
                <button
                  onClick={() => {
                    const existing = item.taskDates || [];
                    const dates = spreadTaskDates(item.startDate, item.scheduledDate, taskCount);
                    // Preserve fixed tasks — don't overwrite their dates
                    const newTaskDates = (item.tasks || []).map((_, i) => {
                      const ex = existing[i];
                      if (ex?.fixed && ex?.date) return { ...ex }; // keep as-is
                      return {
                        date: dates[i] || item.scheduledDate,
                        notToday: false,
                        fixed: false,
                      };
                    });
                    onUpdate({ ...item, taskDates: newTaskDates });
                    setAiPlanNote("");
                  }}
                  title={`Evenly spread ${taskCount} tasks across ${dayDiff + 1} days (locked tasks 🔒 stay put)`}
                  className="tag jost"
                  style={{ background: "rgba(184,160,212,0.12)", color: "#9878b8", border: "1px dashed rgba(184,160,212,0.4)", cursor: "pointer", fontFamily: "'Jost', sans-serif" }}
                >
                  ✨ Spread evenly
                </button>
                <button
                  onClick={async () => {
                    if (aiPlanning) return;
                    const taskList = item.tasks || [];
                    if (!taskList.length) {
                      setAiPlanNote("No tasks yet — tap 'Ask Rosie to plan the tasks' below first, then come back here to schedule them.");
                      setTimeout(() => setAiPlanNote(""), 5000);
                      return;
                    }
                    setAiPlanning(true);
                    setAiPlanNote("");
                    setAiSuggestedTasks([]); // clear any prior pending suggestions
                    // try/finally guarantees aiPlanning resets no matter what —
                    // a throw anywhere below (buildWorkloadByDate, res.json(),
                    // an unforeseen error in planTaskDatesWithAI) used to skip
                    // setAiPlanning(false) entirely, leaving the button stuck
                    // on "Rosie's thinking…" forever. The finally block is the
                    // hard guarantee; the typed-error handling is the soft path.
                    try {
                      // Build workload context for Rosie — counts of other active
                      // items + recurring meetings per day across the date range.
                      // Helps Rosie balance load instead of stacking everything
                      // on already-busy days. Empty {} is safe (no extra context).
                      // NOTE: recurring meetings come from fullData (FocusView has
                      // no local `form` — that was an ItemModal copy-paste leftover
                      // that threw a ReferenceError whenever item.startDate was
                      // missing). planTaskDatesWithAI clamps a missing startDate
                      // internally, so no fallback is needed here.
                      const workloadByDate = (allItems && allItems.length)
                        ? buildWorkloadByDate(allItems, fullData?.recurringMeetings || [], item.startDate, item.scheduledDate, item.id)
                        : null;
                      const result = await planTaskDatesWithAI(
                        item.title,
                        taskList,
                        item.taskTimes || [],
                        item.startDate,
                        item.scheduledDate,
                        item.taskDates || [],
                        { why: item.why, done: item.done }, // pass context so Rosie knows what the work is for
                        workloadByDate,
                      );
                      if (!result || result.error) {
                        // Typed errors from planTaskDatesWithAI — give the timeout
                        // case its own message since "took too long" is actionable
                        // (retry) in a way that a generic failure isn't. The
                        // (parenthetical) error code makes the failure diagnosable
                        // from the UI alone without needing the console.
                        const errKind = result?.error || "unknown";
                        const msg = errKind === "timeout"
                          ? "Rosie took too long to respond — try again, or use the simple spread for now. (timeout)"
                          : errKind === "network"
                          ? "Couldn't reach Rosie — check your connection and try again. (network)"
                          : errKind === "http"
                          ? "Rosie's service returned an error — try again in a moment. (http)"
                          : errKind === "badformat"
                          ? "Rosie's response came back garbled — try again, or use the simple spread. (format)"
                          : "Couldn't plan tasks — try again, or use the simple spread. (unknown)";
                        setAiPlanNote(msg);
                        setTimeout(() => setAiPlanNote(""), 7000);
                        return;
                      }
                      const newTaskDates = taskList.map((_, i) => {
                        const ex = (item.taskDates || [])[i];
                        if (ex?.fixed && ex?.date) return { ...ex }; // preserve fixed tasks
                        return {
                          date: result.dates[i] || item.scheduledDate,
                          notToday: false,
                          fixed: false,
                        };
                      });
                      onUpdate({ ...item, taskDates: newTaskDates });
                      setAiPlanNote(result.note || "Rosie planned your tasks ✨");
                      // If Rosie suggested new subtasks, queue them for user approval
                      if (result.suggestedNewTasks && result.suggestedNewTasks.length > 0) {
                        setAiSuggestedTasks(result.suggestedNewTasks);
                        // Default all suggestions to checked — user can uncheck any they don't want
                        setAiSuggestedSelected(new Set(result.suggestedNewTasks.map((_, i) => i)));
                      }
                      if (onAwardXP) onAwardXP(5, window.innerWidth / 2, 200);
                    } catch (e) {
                      // Unexpected throw — surface a real message instead of a silent stuck state.
                      console.error("[Ask Rosie to plan] unexpected error:", e);
                      setAiPlanNote("Something went sideways planning your tasks — try again, or use the simple spread.");
                      setTimeout(() => setAiPlanNote(""), 6000);
                    } finally {
                      // The hard guarantee — runs on success, typed error, early
                      // return, OR throw. The button can never stay stuck.
                      setAiPlanning(false);
                    }
                  }}
                  disabled={aiPlanning}
                  title="Ask Rosie to plan your tasks — respects dependencies + realistic cadence"
                  className="tag jost"
                  style={{
                    background: aiPlanning ? "rgba(212,130,154,0.08)" : "rgba(212,130,154,0.12)",
                    color: "#b86d85",
                    border: "1px dashed rgba(212,130,154,0.4)",
                    cursor: aiPlanning ? "wait" : "pointer",
                    fontFamily: "'Jost', sans-serif",
                  }}
                >
                  {aiPlanning ? "🌸 Rosie's thinking…" : "🌸 Ask Rosie to plan"}
                </button>
                <button
                  onClick={async () => {
                    if (aiEstimating) return;
                    const taskList = item.tasks || [];
                    if (!taskList.length) return;
                    setAiEstimating(true);
                    setEstimateFlash("");
                    try {
                      const newTimes = await estimateTaskTimes(taskList, item.title, {
                        historySummary: summarizeTimingHistoryForRosie(fullData?.timingHistory || []),
                      });
                      const safeTimes = taskList.map((_, i) => Number(newTimes[i]) || 15);
                      const total = safeTimes.reduce((a, b) => a + b, 0);
                      onUpdate({ ...item, taskTimes: safeTimes, timeEstimate: fmtMins(total) });
                      setEstimateFlash(`⏱ Updated! New total: ${fmtMins(total)}`);
                      setTimeout(() => setEstimateFlash(""), 4000);
                      if (onAwardXP) onAwardXP(3, window.innerWidth / 2, 200);
                    } catch (e) {
                      setEstimateFlash("Couldn't reach Rosie — try again?");
                      setTimeout(() => setEstimateFlash(""), 3500);
                    }
                    setAiEstimating(false);
                  }}
                  disabled={aiEstimating || !(item.tasks || []).length}
                  title="Ask Rosie to re-estimate realistic time per task based on what they actually involve"
                  className="tag jost"
                  style={{
                    background: aiEstimating ? "rgba(158,184,154,0.08)" : "rgba(158,184,154,0.12)",
                    color: "#7a9e78",
                    border: "1px dashed rgba(158,184,154,0.4)",
                    cursor: aiEstimating ? "wait" : "pointer",
                    fontFamily: "'Jost', sans-serif",
                  }}
                >
                  {aiEstimating ? "⏱ Rosie's estimating…" : "⏱ Re-estimate times"}
                </button>
                </>
              );
            })()}
            {item.timeEstimate && (() => {
              const times = item.taskTimes || [];
              const tasks = item.tasks || [];
              const completedSet = new Set(item.completedTasks || []);
              const totalMins = times.reduce((a, b) => a + (Number(b) || 0), 0);
              const remainMins = tasks.reduce((a, t, idx) => completedSet.has(t) ? a : a + (Number(times[idx]) || 0), 0);
              const someDone = totalMins > 0 && remainMins > 0 && remainMins < totalMins;
              const allDone = totalMins > 0 && remainMins === 0;
              return (
                <span className="tag jost" style={{ background: "rgba(158,184,154,0.1)", color: "#7a9e78", whiteSpace: "nowrap" }}>
                  ⏱ Total: {totalMins > 0 ? fmtMins(totalMins) : item.timeEstimate}
                  {someDone && <span style={{ color: "#d4829a", marginLeft: 4 }}>· {fmtMins(remainMins)} left</span>}
                  {allDone && <span style={{ marginLeft: 4, fontStyle: "italic" }}>· all done 🌸</span>}
                </span>
              );
            })()}
            <FinishTime item={item} />
          </div>

          {/* Rosie's planning note — appears after AI plan runs */}
          {aiPlanNote && (
            <div className="fade" style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "rgba(212,130,154,0.06)", border: "1px solid rgba(212,130,154,0.18)", borderRadius: 10, padding: "8px 12px", marginTop: 4, marginBottom: 6 }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>🌸</span>
              <div style={{ flex: 1 }}>
                <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.75)", lineHeight: 1.5, fontStyle: "italic" }}>{aiPlanNote}</div>
              </div>
              <button
                onClick={() => setAiPlanNote("")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(184,109,133,0.5)", fontSize: 13, padding: "0 4px", lineHeight: 1 }}
                title="Dismiss"
              >×</button>
            </div>
          )}

          {/* AI suggested new subtasks — preview with per-task checkboxes + approve/skip */}
          {aiSuggestedTasks.length > 0 && (
            <div className="fade" style={{ background: "rgba(184,160,212,0.08)", border: "1px solid rgba(184,160,212,0.3)", borderRadius: 10, padding: "10px 14px", marginTop: 4, marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>✨</span>
                <div className="jost" style={{ flex: 1, fontSize: 12, color: "#9878b8", fontWeight: 600 }}>
                  Rosie also suggests adding {aiSuggestedTasks.length} task{aiSuggestedTasks.length !== 1 ? "s" : ""}:
                </div>
                {/* Toggle-all helper */}
                <button
                  className="jost"
                  onClick={() => {
                    const allChecked = aiSuggestedSelected.size === aiSuggestedTasks.length;
                    setAiSuggestedSelected(allChecked ? new Set() : new Set(aiSuggestedTasks.map((_, i) => i)));
                  }}
                  style={{ background: "transparent", border: "none", color: "rgba(152,120,184,0.7)", fontSize: 10, cursor: "pointer", padding: "0 4px", textDecoration: "underline" }}
                >
                  {aiSuggestedSelected.size === aiSuggestedTasks.length ? "uncheck all" : "check all"}
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10, paddingLeft: 26 }}>
                {aiSuggestedTasks.map((s, i) => {
                  const checked = aiSuggestedSelected.has(i);
                  return (
                    <label
                      key={i}
                      style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}
                      onClick={(e) => {
                        // Prevent double-toggling when clicking the input itself
                        if (e.target.tagName === "INPUT") return;
                        e.preventDefault();
                        setAiSuggestedSelected(prev => {
                          const next = new Set(prev);
                          if (next.has(i)) next.delete(i); else next.add(i);
                          return next;
                        });
                      }}
                    >
                      {checked ? (
                        <CheckSquare size={14} style={{ color: "#9878b8", flexShrink: 0 }} />
                      ) : (
                        <Square size={14} style={{ color: "rgba(152,120,184,0.5)", flexShrink: 0 }} />
                      )}
                      <span className="jost" style={{ fontSize: 12, color: checked ? "rgba(74,53,64,0.85)" : "rgba(74,53,64,0.5)", flex: 1, textDecoration: checked ? "none" : "line-through" }}>{s.title}</span>
                      <span className="jost" style={{ fontSize: 10, color: "rgba(152,120,184,0.7)", whiteSpace: "nowrap" }}>{s.estimateMin}m</span>
                    </label>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 8, paddingLeft: 26, alignItems: "center" }}>
                <button
                  onClick={() => {
                    // Add only the checked tasks at the END of the existing list
                    const picked = aiSuggestedTasks.filter((_, i) => aiSuggestedSelected.has(i));
                    if (picked.length === 0) return;
                    const newTasks = [...(item.tasks || []), ...picked.map(s => s.title)];
                    const newTimes = [...(item.taskTimes || []), ...picked.map(s => s.estimateMin)];
                    // Pad taskDates so new tasks get the item's due date by default (user can adjust)
                    const newDates = [...(item.taskDates || [])];
                    while (newDates.length < newTasks.length) {
                      newDates.push({ date: item.scheduledDate || "", notToday: false, fixed: false });
                    }
                    onUpdate(alignTaskParents({ ...item, tasks: newTasks, taskTimes: newTimes, taskDates: newDates }));
                    setAiSuggestedTasks([]);
                    setAiSuggestedSelected(new Set());
                    if (onAwardXP) onAwardXP(Math.min(3, picked.length), window.innerWidth / 2, 200);
                  }}
                  disabled={aiSuggestedSelected.size === 0}
                  className="btn rose jost"
                  style={{
                    fontSize: 11,
                    padding: "5px 12px",
                    opacity: aiSuggestedSelected.size === 0 ? 0.4 : 1,
                    cursor: aiSuggestedSelected.size === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  🌸 {aiSuggestedSelected.size === aiSuggestedTasks.length
                    ? `Add all ${aiSuggestedTasks.length}`
                    : aiSuggestedSelected.size === 0
                      ? "Add selected"
                      : `Add ${aiSuggestedSelected.size} of ${aiSuggestedTasks.length}`}
                </button>
                <button
                  onClick={() => {
                    setAiSuggestedTasks([]);
                    setAiSuggestedSelected(new Set());
                  }}
                  className="btn ghost jost"
                  style={{ fontSize: 11, padding: "5px 12px" }}
                >Skip</button>
              </div>
            </div>
          )}

          {/* Re-estimate flash message */}
          {estimateFlash && (
            <div className="fade" style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(158,184,154,0.08)", border: "1px solid rgba(158,184,154,0.25)", borderRadius: 10, padding: "6px 12px", marginTop: 4, marginBottom: 6 }}>
              <div className="jost" style={{ flex: 1, fontSize: 12, color: "#7a9e78", fontWeight: 500 }}>{estimateFlash}</div>
            </div>
          )}

          {/* Editable title */}
          {editingField === "title" ? (
            <input
              autoFocus
              className="cg"
              value={fieldDraft}
              onChange={e => setFieldDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit(); }}
              style={{ fontSize: 28, color: "#4a3540", lineHeight: 1.2, fontWeight: 600, width: "100%", border: "1px solid rgba(212,130,154,0.35)", background: "rgba(255,255,255,0.9)", borderRadius: 8, padding: "6px 10px", marginBottom: 8, outline: "none", fontFamily: "'Cormorant Garamond', serif" }}
            />
          ) : (
            <h2
              className="cg"
              onClick={() => startEdit("title", item.title)}
              title="Click to edit"
              style={{ fontSize: 28, color: "#4a3540", marginBottom: 8, lineHeight: 1.2, cursor: "text", padding: "2px 6px", marginLeft: -6, borderRadius: 6, transition: "background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(212,130,154,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {item.title}
            </h2>
          )}

          {/* Editable Why */}
          {editingField === "why" ? (
            <div style={{ marginBottom: 6 }}>
              <label className="sl jost" style={{ color: "rgba(74,53,64,0.55)", fontSize: 9, display: "flex", alignItems: "center", gap: 6 }}>
                Why
                {aiSuggestingField === "why" && <span className="pulse jost" style={{ fontSize: 9, fontStyle: "italic", color: "rgba(184,109,133,0.7)", textTransform: "none", letterSpacing: 0 }}>✦ Rosie's drafting…</span>}
              </label>
              <input
                autoFocus
                className="ifield jost"
                value={fieldDraft}
                onChange={e => setFieldDraft(e.target.value)}
                onBlur={() => { if (aiSuggestingField !== "why") commitEdit(); }}
                onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit(); }}
                placeholder={aiSuggestingField === "why" ? "Waiting for Rosie's draft… you can also type your own" : "Why does this matter?"}
                disabled={aiSuggestingField === "why"}
                style={{ fontSize: 13, fontStyle: "italic", opacity: aiSuggestingField === "why" ? 0.7 : 1 }}
              />
            </div>
          ) : item.why ? (
            <p
              className="jost"
              onClick={() => startEdit("why", item.why)}
              title="Click to edit"
              style={{ fontSize: 13, color: "rgba(74,53,64,0.5)", marginBottom: 6, fontStyle: "italic", cursor: "text", padding: "2px 6px", marginLeft: -6, borderRadius: 6, transition: "background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(212,130,154,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              Why: {item.why}
            </p>
          ) : (
            <button
              onClick={async () => {
                if (aiSuggestingField === "why") return;
                // Open the editor immediately so the user sees something happen
                startEdit("why", "");
                setAiSuggestingField("why");
                try {
                  const suggestion = await suggestFieldWithAI("why", item.title, item.category, {
                    done: item.done,
                    outOfScope: item.outOfScope,
                  });
                  if (suggestion) setFieldDraft(suggestion);
                } catch {} finally {
                  setAiSuggestingField(null);
                }
              }}
              className="jost"
              style={{ background: "none", border: "none", color: "rgba(74,53,64,0.3)", fontSize: 11, fontStyle: "italic", cursor: "pointer", padding: "2px 6px", marginLeft: -6, marginBottom: 6 }}
            >
              ✨ + Add "why"
            </button>
          )}

          {/* Editable Done when */}
          {editingField === "done" ? (
            <div style={{ marginBottom: 4 }}>
              <label className="sl jost" style={{ color: "#9eb89a", fontSize: 9, display: "flex", alignItems: "center", gap: 6 }}>
                Done when
                {aiSuggestingField === "done" && <span className="pulse jost" style={{ fontSize: 9, fontStyle: "italic", color: "rgba(158,184,154,0.7)", textTransform: "none", letterSpacing: 0 }}>✦ Rosie's drafting…</span>}
              </label>
              <input
                autoFocus
                className="ifield jost"
                value={fieldDraft}
                onChange={e => setFieldDraft(e.target.value)}
                onBlur={() => { if (aiSuggestingField !== "done") commitEdit(); }}
                onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit(); }}
                placeholder={aiSuggestingField === "done" ? "Waiting for Rosie's draft… you can also type your own" : "How will I know this is finished?"}
                disabled={aiSuggestingField === "done"}
                style={{ fontSize: 13, borderColor: "rgba(158,184,154,0.35)", background: "rgba(158,184,154,0.06)", opacity: aiSuggestingField === "done" ? 0.7 : 1 }}
              />
            </div>
          ) : item.done ? (
            <p
              className="jost"
              onClick={() => startEdit("done", item.done)}
              title="Click to edit"
              style={{ fontSize: 13, color: "#9eb89a", marginBottom: 4, cursor: "text", padding: "2px 6px", marginLeft: -6, borderRadius: 6, transition: "background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(158,184,154,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              ✦ Done when: {item.done}
            </p>
          ) : (
            <button
              onClick={async () => {
                if (aiSuggestingField === "done") return;
                // Open the editor immediately so the user sees something happen
                startEdit("done", "");
                setAiSuggestingField("done");
                try {
                  const suggestion = await suggestFieldWithAI("done", item.title, item.category, {
                    why: item.why,
                    done: item.done,
                  });
                  if (suggestion) {
                    setFieldDraft(suggestion);
                  }
                  // If suggestion is empty (rate limit, parse error, network), the
                  // editor stays open — the placeholder reverts to the normal "type
                  // your own" prompt, signaling Rosie didn't return anything.
                } catch {} finally {
                  setAiSuggestingField(null);
                }
              }}
              className="jost"
              style={{ background: "none", border: "none", color: "rgba(74,53,64,0.3)", fontSize: 11, fontStyle: "italic", cursor: "pointer", padding: "2px 6px", marginLeft: -6, marginRight: 10, marginBottom: 4 }}
            >
              ✨ + Add "done when"
            </button>
          )}

          {/* Editable Not doing */}
          {editingField === "outOfScope" ? (
            <div style={{ marginBottom: 4 }}>
              <label className="sl jost" style={{ color: "#c4687a", fontSize: 9, display: "flex", alignItems: "center", gap: 6 }}>
                Not doing
                {aiSuggestingField === "outOfScope" && <span className="pulse jost" style={{ fontSize: 9, fontStyle: "italic", color: "rgba(196,120,142,0.7)", textTransform: "none", letterSpacing: 0 }}>✦ Rosie's drafting…</span>}
              </label>
              <input
                autoFocus
                className="ifield jost"
                value={fieldDraft}
                onChange={e => setFieldDraft(e.target.value)}
                onBlur={() => { if (aiSuggestingField !== "outOfScope") commitEdit(); }}
                onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit(); }}
                placeholder={aiSuggestingField === "outOfScope" ? "Waiting for Rosie's draft… you can also type your own" : "What's explicitly out of scope?"}
                disabled={aiSuggestingField === "outOfScope"}
                style={{ fontSize: 13, borderColor: "rgba(212,100,120,0.35)", background: "rgba(212,100,120,0.04)", opacity: aiSuggestingField === "outOfScope" ? 0.7 : 1 }}
              />
            </div>
          ) : item.outOfScope ? (
            <p
              className="jost"
              onClick={() => startEdit("outOfScope", item.outOfScope)}
              title="Click to edit"
              style={{ fontSize: 13, color: "#c4687a", cursor: "text", padding: "2px 6px", marginLeft: -6, borderRadius: 6, transition: "background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(212,100,120,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              ✕ Not doing: {item.outOfScope}
            </p>
          ) : (
            <button
              onClick={async () => {
                if (aiSuggestingField === "outOfScope") return;
                startEdit("outOfScope", "");
                setAiSuggestingField("outOfScope");
                try {
                  const suggestion = await suggestFieldWithAI("outOfScope", item.title, item.category, {
                    why: item.why,
                    done: item.done,
                  });
                  if (suggestion) setFieldDraft(suggestion);
                } catch {} finally {
                  setAiSuggestingField(null);
                }
              }}
              className="jost"
              style={{ background: "none", border: "none", color: "rgba(74,53,64,0.3)", fontSize: 11, fontStyle: "italic", cursor: "pointer", padding: "2px 6px", marginLeft: -6 }}
            >
              ✨ + Add "not doing"
            </button>
          )}

          {tt > 0 && <div style={{ marginTop: 16 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}><span className="jost" style={{ fontSize: 11, letterSpacing: 1.5, color: "rgba(196,120,142,0.6)", textTransform: "uppercase" }}>Progress</span><span className="jost" style={{ fontSize: 12, color: "#d4829a", fontWeight: 600 }}>{ct}/{tt}</span></div><div style={{ background: "rgba(212,130,154,0.12)", borderRadius: 6, height: 6 }}><div style={{ width: `${prog}%`, height: "100%", background: prog === 100 ? "#9eb89a" : "linear-gradient(90deg,#e8a0b4,#d4687f)", borderRadius: 6, transition: "width .5s ease" }} /></div></div>}

          {/* Task-level note log (B2) — collapsed pill, expands inline. Lets Lexy
              log a detour/status change without leaving the focus screen. */}
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => { setNoteLogOpen(o => !o); setFocusNoteInput(""); }}
              className="jost"
              title={(item.noteLog || []).length ? "View / add note-log entries" : "Add a note-log entry"}
              style={{
                background: noteLogOpen ? "rgba(212,130,154,0.1)" : "rgba(212,130,154,0.04)",
                border: "1px solid rgba(212,130,154,0.22)",
                borderRadius: 10, cursor: "pointer", fontSize: 11, fontWeight: 600,
                color: "#b86d85", padding: "5px 12px", letterSpacing: 0.3,
                display: "inline-flex", alignItems: "center", gap: 6,
              }}
            >
              📋 {(item.noteLog || []).length > 0
                ? `Note log · ${(item.noteLog || []).length}`
                : "Add a note"}
              <span style={{ fontSize: 9, opacity: 0.7 }}>{noteLogOpen ? "▲" : "▼"}</span>
            </button>
            {noteLogOpen && (
              <div style={{ marginTop: 8, padding: "11px 13px", background: "rgba(212,130,154,0.05)", border: "1px solid rgba(212,130,154,0.18)", borderRadius: 12 }}>
                {(item.noteLog || []).length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 9 }}>
                    {(item.noteLog || []).map(entry => {
                      const isActive = taskNoteToSubtask?.noteId === entry.id;
                      return (
                        <React.Fragment key={entry.id}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "rgba(255,255,255,0.5)", border: "1px solid rgba(212,130,154,0.12)", borderRadius: 8, padding: "7px 10px" }}>
                            <span className="jost" style={{ fontSize: 10, color: "#b86d85", fontWeight: 600, whiteSpace: "nowrap", paddingTop: 1, flexShrink: 0 }}>{fmtFocusNoteStamp(entry.ts)}</span>
                            <span className="jost" style={{ fontSize: 12, color: "#4a3540", flex: 1, lineHeight: 1.4 }}>{entry.text}</span>
                            <button
                              onClick={() => startTaskNoteToSubtask(entry.id, entry.text)}
                              disabled={isActive && taskNoteToSubtask.loading}
                              title="Turn this note into a subtask — Rosie will suggest a clean title, you confirm"
                              className="jost"
                              style={{
                                background: isActive ? "rgba(212,130,154,0.18)" : "none",
                                border: `1px solid ${isActive ? "rgba(212,130,154,0.45)" : "rgba(212,130,154,0.22)"}`,
                                borderRadius: 7,
                                color: isActive ? "#b86d85" : "rgba(184,109,133,0.6)",
                                cursor: isActive && taskNoteToSubtask.loading ? "wait" : "pointer",
                                fontSize: 10,
                                padding: "2px 7px",
                                lineHeight: 1.3,
                                fontWeight: 600,
                                letterSpacing: 0.2,
                                flexShrink: 0,
                              }}
                            >{isActive && taskNoteToSubtask.loading ? "…" : "→ subtask"}</button>
                            <button onClick={() => deleteFocusNote(entry.id)} title="Delete entry" style={{ background: "none", border: "none", color: "rgba(196,120,142,0.45)", cursor: "pointer", fontSize: 13, lineHeight: 1, flexShrink: 0 }}>×</button>
                          </div>
                          {/* Inline confirm — pre-filled with Rosie's suggested title */}
                          {isActive && !taskNoteToSubtask.loading && (
                            <div style={{ marginLeft: 18, padding: "8px 10px", background: "rgba(212,130,154,0.06)", border: "1px solid rgba(212,130,154,0.2)", borderRadius: 9 }}>
                              <div className="jost" style={{ fontSize: 9.5, color: "#b86d85", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 5 }}>
                                {taskNoteToSubtask.errorKind
                                  ? `Rosie couldn't reshape this (${taskNoteToSubtask.errorKind}) — using your text:`
                                  : "Rosie's suggested title:"}
                              </div>
                              <div style={{ display: "flex", gap: 6 }}>
                                <input
                                  className="ifield"
                                  value={taskNoteToSubtask.draftTitle}
                                  onChange={e => setTaskNoteToSubtask({ ...taskNoteToSubtask, draftTitle: e.target.value })}
                                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); confirmTaskNoteToSubtask(); } if (e.key === "Escape") cancelTaskNoteToSubtask(); }}
                                  autoFocus
                                  style={{ fontSize: 12, padding: "6px 10px" }}
                                />
                                <button className="btn jost" onClick={confirmTaskNoteToSubtask} disabled={!taskNoteToSubtask.draftTitle.trim()} style={{ flexShrink: 0, padding: "0 12px", fontSize: 11, background: "linear-gradient(135deg,#d4829a,#c4687a)", color: "#fff", opacity: taskNoteToSubtask.draftTitle.trim() ? 1 : 0.4 }}>✓ Add subtask</button>
                                <button className="btn ghost jost" onClick={cancelTaskNoteToSubtask} style={{ flexShrink: 0, padding: "0 10px", fontSize: 11 }}>Cancel</button>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                ) : (
                  <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.4)", fontStyle: "italic", marginBottom: 9 }}>
                    No entries yet — log a detour, a blocker, or anything that diverged from the plan.
                  </div>
                )}
                <div style={{ display: "flex", gap: 7 }}>
                  <input
                    className="ifield"
                    placeholder="Log a detour or change…"
                    value={focusNoteInput}
                    onChange={e => setFocusNoteInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addFocusNote(); } }}
                    style={{ fontSize: 12, padding: "6px 10px" }}
                  />
                  <button className="btn ghost jost" onClick={addFocusNote} style={{ flexShrink: 0, padding: "0 13px", fontSize: 12 }}>+ Note</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* End-of-block banner — only when an active matching block has ≤5 min left */}
        {roadmapContext && roadmapContext.showBanner && (
          <div className="fade" style={{ background: "linear-gradient(135deg, rgba(212,130,154,0.12), rgba(184,160,212,0.12))", border: "1px solid rgba(184,160,212,0.45)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: -6, marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>🌙</span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="jost" style={{ fontSize: 12, color: "#9878b8", fontWeight: 600 }}>
                Block ending soon
              </div>
              <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.65)", marginTop: 2 }}>
                {roadmapContext.nextSlotAfterActive
                  ? `Next: ${roadmapContext.nextSlotAfterActive.label} at ${roadmapContext.nextSlotAfterActive.time}`
                  : "That's the last roadmap block for today"}
              </div>
            </div>
            <button
              onClick={handleWrapUpClick}
              className="btn rose jost"
              style={{ fontSize: 11, padding: "6px 14px" }}
            >Back to roadmap</button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="jost"
              title="Dismiss this prompt"
              style={{ background: "none", border: "none", color: "rgba(74,53,64,0.4)", fontSize: 14, cursor: "pointer", padding: "4px 6px", lineHeight: 1 }}
            >✕</button>
          </div>
        )}

        {/* Unified slot warning — fires 5 min before & at-start of slots, even while deep in a task.
            Dispatches by kind: meeting-prep | lunch | brain-break | work */}
        {slotWarning && (() => {
          const sw = slotWarning;
          const isStart = sw.phase === "start";
          const palette = {
            "meeting-prep": { emoji: isStart ? "🌸" : "🌙", title: "#9878b8", titleStart: "#b86d85", border: isStart ? "rgba(212,130,154,0.55)" : "rgba(184,160,212,0.45)", bg: isStart ? "linear-gradient(135deg, rgba(212,130,154,0.18), rgba(184,160,212,0.18))" : "linear-gradient(135deg, rgba(184,160,212,0.12), rgba(184,160,212,0.18))" },
            "lunch":         { emoji: "🍽️",  title: "#9a7850", titleStart: "#9a7850", border: "rgba(196,168,130,0.4)", bg: "linear-gradient(135deg, rgba(232,196,140,0.12), rgba(196,168,130,0.16))" },
            "brain-break":   { emoji: "🌿",  title: "#7a9e78", titleStart: "#7a9e78", border: "rgba(158,184,154,0.45)", bg: "linear-gradient(135deg, rgba(158,184,154,0.12), rgba(158,184,154,0.18))" },
            "work":          { emoji: isStart ? "✦" : "🌙",  title: "#c4788e", titleStart: "#b86d85", border: isStart ? "rgba(212,130,154,0.55)" : "rgba(212,130,154,0.4)", bg: isStart ? "linear-gradient(135deg, rgba(232,160,180,0.18), rgba(212,130,154,0.15))" : "linear-gradient(135deg, rgba(212,130,154,0.1), rgba(232,160,180,0.12))" },
          }[sw.kind];
          const headline = isStart ? `${sw.slot.label} — starts now` : `${sw.slot.label} in ${sw.minsToStart} min`;
          let subtext = "";
          if (sw.kind === "meeting-prep") subtext = sw.meetingSlot ? `Meeting: ${sw.meetingSlot.label} at ${sw.meetingSlot.time}` : "Time to get your head ready.";
          else if (sw.kind === "lunch") subtext = "Step away from screen — eat something good.";
          else if (sw.kind === "brain-break") {
            const slotEnd = (() => { const next = roadmap.slots[sw.idx + 1]; return next ? parseSlotTimeMinutes(next.time) : parseSlotTimeMinutes(sw.slot.time) + 15; })();
            const minsLeft = Math.max(0, slotEnd - nowMin);
            subtext = isStart ? `Stretch · water · sunlight if possible. ${minsLeft}m left in this break.` : "Take a real pause — body first, then back to it.";
          } else if (sw.kind === "work") subtext = sw.matchedItem ? `Matches: ${sw.matchedItem.title}` : "Time to dive in.";

          return (
            <div className="fade" style={{
              background: palette.bg,
              border: `1px solid ${palette.border}`,
              borderRadius: 12,
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              marginTop: -6,
              marginBottom: 12,
            }}>
              <span style={{ fontSize: 20 }}>{palette.emoji}</span>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div className="jost" style={{ fontSize: 12, color: isStart ? palette.titleStart : palette.title, fontWeight: 600 }}>
                  {headline}
                </div>
                <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.65)", marginTop: 2 }}>
                  {subtext}
                </div>
                {sw.kind === "brain-break" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)", letterSpacing: 0.5 }}>need more time?</span>
                    {[5, 10, 15].map(d => (
                      <button
                        key={d}
                        onClick={() => handlePushBackBreak(d)}
                        className="jost"
                        style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(158,184,154,0.4)", color: "#7a9e78", fontSize: 10, padding: "3px 9px", borderRadius: 7, cursor: "pointer", fontWeight: 500 }}
                      >+{d}m</button>
                    ))}
                  </div>
                )}
              </div>
              {sw.kind === "meeting-prep" && sw.meetingSlot && onMeetingFocus && (
                <button onClick={() => onMeetingFocus(sw.meetingSlot)} className="btn rose jost" style={{ fontSize: 11, padding: "6px 14px" }}>🌸 Open prep</button>
              )}
              {sw.kind === "work" && sw.matchedItem && onSwitchItem && (
                <button onClick={() => onSwitchItem(sw.matchedItem)} className="btn rose jost" style={{ fontSize: 11, padding: "6px 14px" }}>✦ Open task</button>
              )}
              <button
                onClick={() => setDismissedPrepWarnings(prev => new Set([...prev, sw.dismissKey]))}
                className="jost"
                title="Dismiss this prompt"
                style={{ background: "none", border: "none", color: "rgba(74,53,64,0.4)", fontSize: 14, cursor: "pointer", padding: "4px 6px", lineHeight: 1 }}
              >✕</button>
            </div>
          );
        })()}

        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <label className="sl jost" style={{ marginBottom: 0 }}>Tasks</label>
              <button
                onClick={() => setShowPasteTaskList(true)}
                className="btn ghost jost"
                title="Paste a list and Rosie will turn it into subtasks"
                style={{ fontSize: 10, padding: "4px 10px", letterSpacing: 0.3 }}
              >📋 Paste List</button>
              {/* Roadmap pill — inline next to Tasks label so it stays visible while scrolling task list */}
              {roadmapContext && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <div className="fade" style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(184,160,212,0.12)", border: `1px solid ${roadmapContext.pillColor}55`, borderRadius: 12, padding: "3px 9px" }}>
                    <span style={{ fontSize: 11 }}>🌸</span>
                    <span className="jost" style={{ fontSize: 10, color: roadmapContext.pillColor, fontWeight: 500 }}>{roadmapContext.pillText}</span>
                  </div>
                  <button
                    onClick={handleWrapUpClick}
                    className="jost"
                    title="Mark this block done & go back to roadmap"
                    style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(184,160,212,0.35)", color: "#9878b8", fontSize: 9, padding: "3px 8px", borderRadius: 7, cursor: "pointer", fontWeight: 500 }}
                  >🌙 wrap up</button>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {(item.taskTimes || []).length > 0 && (() => {
                const totalMins = (item.taskTimes || []).reduce((a, b) => a + (Number(b) || 0), 0);
                const completedSet = new Set(item.completedTasks || []);
                const remainMins = (item.tasks || []).reduce((a, t, idx) => completedSet.has(t) ? a : a + (Number((item.taskTimes || [])[idx]) || 0), 0);
                const allDone = remainMins === 0 && totalMins > 0;
                const someDone = remainMins !== totalMins && remainMins > 0;
                return (
                  <>
                    <span className="jost" style={{ fontSize: 11, color: "#9eb89a", fontWeight: 600 }}>
                      Total: {fmtMins(totalMins)}
                    </span>
                    {someDone && (
                      <span className="jost" style={{ fontSize: 11, color: "#d4829a", fontWeight: 600 }}>
                        · {fmtMins(remainMins)} left
                      </span>
                    )}
                    {allDone && (
                      <span className="jost" style={{ fontSize: 11, color: "#7a9e78", fontWeight: 600, fontStyle: "italic" }}>
                        · all done 🌸
                      </span>
                    )}
                  </>
                );
              })()}
              <SprintStartSetter item={item} onUpdate={onUpdate} />
            </div>
          </div>
          <DraggableTaskList item={item} onUpdate={onUpdate} onToggleTask={toggle} />
          {/* Rosie: generate tasks from scratch — only when no tasks yet */}
          {(!item.tasks || item.tasks.length === 0) && (
            <button
              onClick={async () => {
                if (aiGeneratingTasks) return;
                setAiGeneratingTasks(true);
                setEstimateFlash("");
                try {
                  const result = await generateTasksWithAI(item.title, item.why, item.done, item.notes);
                  if (!result || !result.tasks.length) {
                    setEstimateFlash("Couldn't reach Rosie — try again or add manually.");
                    setTimeout(() => setEstimateFlash(""), 3500);
                    setAiGeneratingTasks(false);
                    return;
                  }
                  const newTaskTitles = result.tasks.map(t => t.title);
                  const newTaskTimes = result.tasks.map(t => t.mins);
                  const total = newTaskTimes.reduce((a, b) => a + b, 0);
                  onUpdate({
                    ...item,
                    tasks: newTaskTitles,
                    taskTimes: newTaskTimes,
                    timeEstimate: fmtMins(total),
                    completedTasks: [],
                  });
                  setEstimateFlash(result.note ? `🌸 ${result.note}` : `🌸 Created ${newTaskTitles.length} tasks (${fmtMins(total)} total)`);
                  setTimeout(() => setEstimateFlash(""), 6000);
                  if (onAwardXP) onAwardXP(5, window.innerWidth / 2, 200);
                } catch (e) {
                  setEstimateFlash("Couldn't reach Rosie — try again?");
                  setTimeout(() => setEstimateFlash(""), 3500);
                }
                setAiGeneratingTasks(false);
              }}
              disabled={aiGeneratingTasks}
              className="jost"
              style={{
                width: "100%",
                marginTop: 10,
                padding: "12px",
                background: aiGeneratingTasks ? "rgba(212,130,154,0.08)" : "linear-gradient(135deg, rgba(232,160,180,0.18), rgba(212,130,154,0.15))",
                border: "1px dashed rgba(212,130,154,0.45)",
                borderRadius: 10,
                color: "#b86d85",
                fontSize: 13,
                fontWeight: 600,
                cursor: aiGeneratingTasks ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontFamily: "'Jost', sans-serif",
                transition: "all .2s",
              }}
            >
              {aiGeneratingTasks ? (
                <>🌸 Rosie's thinking about how to break this down…</>
              ) : (
                <>🌸 Ask Rosie to plan the tasks</>
              )}
            </button>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input className="ifield" placeholder="Add a task..." value={newTaskInput} onChange={e => setNewTaskInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()} />
            <button className="btn ghost" onClick={addTask} style={{ flexShrink: 0, padding: "0 14px", fontSize: 18 }}>+</button>
          </div>
          {estimatingTask && <p className="jost pulse" style={{ fontSize: 11, color: "rgba(212,130,154,0.6)", marginTop: 6, textAlign: "right" }}>Rosie's estimating time…</p>}
        </div>

        {/* Quick capture — saves straight to Brain Dump, doesn't show a list */}
        <div className="card" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <label className="sl jost" style={{ marginBottom: 0 }}>🧠 Drop a thought</label>
            <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.35)", fontStyle: "italic" }}>goes to Brain Dump</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="ifield jost"
                  placeholder="🌿 Park it for later..."
                  value={parkQuick}
                  onChange={e => setParkQuick(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && quickPark()}
                  style={{ background: "rgba(196,168,130,0.06)", borderColor: "rgba(196,168,130,0.22)" }}
                />
                <button
                  onClick={quickPark}
                  className="btn jost"
                  disabled={!parkQuick.trim()}
                  style={{
                    flexShrink: 0,
                    padding: "0 14px",
                    fontSize: 13,
                    background: parkQuick.trim() ? "rgba(196,168,130,0.18)" : "rgba(196,168,130,0.08)",
                    color: parkQuick.trim() ? "#9a7850" : "rgba(154,120,80,0.4)",
                    border: "1px solid rgba(196,168,130,0.28)",
                    cursor: parkQuick.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  Park
                </button>
              </div>
              {savedFlash === "park" && (
                <div className="fade jost" style={{ position: "absolute", right: 8, top: -20, fontSize: 10, color: "#7a9e78", letterSpacing: 1, textTransform: "uppercase", fontWeight: 600 }}>
                  ✓ saved to brain dump
                </div>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="ifield jost"
                  placeholder="🌀 Caught a rabbit hole..."
                  value={spiralQuick}
                  onChange={e => setSpiralQuick(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && quickSpiral()}
                  style={{ background: "rgba(184,160,212,0.06)", borderColor: "rgba(184,160,212,0.22)" }}
                />
                <button
                  onClick={quickSpiral}
                  className="btn jost"
                  disabled={!spiralQuick.trim()}
                  style={{
                    flexShrink: 0,
                    padding: "0 14px",
                    fontSize: 13,
                    background: spiralQuick.trim() ? "rgba(184,160,212,0.18)" : "rgba(184,160,212,0.08)",
                    color: spiralQuick.trim() ? "#9878b8" : "rgba(152,120,184,0.4)",
                    border: "1px solid rgba(184,160,212,0.28)",
                    cursor: spiralQuick.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  Catch
                </button>
              </div>
              {savedFlash === "spiral" && (
                <div className="fade jost" style={{ position: "absolute", right: 8, top: -20, fontSize: 10, color: "#7a9e78", letterSpacing: 1, textTransform: "uppercase", fontWeight: 600 }}>
                  ✓ saved to brain dump
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── All notes on this task — read-only roll-up ──
            Merges the task-level note log (item.noteLog) and every subtask's
            note log (item.taskNoteLogs) into one chronological list. Purely
            derived — adding/editing still happens via the 📋 pill near the
            progress bar and the 📝 toggles on each subtask row. Only renders
            when there's at least one note somewhere. */}
        {(() => {
          const taskEntries = (item.noteLog || []).map(e => ({ ...e, source: null }));
          const subEntries = Object.entries(item.taskNoteLogs || {}).flatMap(
            ([subtaskText, log]) => (log || []).map(e => ({ ...e, source: subtaskText }))
          );
          const all = [...taskEntries, ...subEntries].sort((a, b) => (a.ts || 0) - (b.ts || 0));
          if (all.length === 0) return null;
          const fmtStamp = (ts) => {
            try { return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
            catch { return ""; }
          };
          return (
            <div className="card" style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 10, flexWrap: "wrap" }}>
                <label className="sl jost" style={{ marginBottom: 0 }}>📋 All notes on this task</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.35)", fontStyle: "italic" }}>
                    {all.length} {all.length === 1 ? "entry" : "entries"} · oldest first
                  </span>
                  {/* ✨ Suggest follow-ups — sends ALL notes to Rosie, gets back
                      1-5 suggested subtasks, user picks which to add. */}
                  <button
                    onClick={startSuggestFollowups}
                    disabled={followupSuggestions?.loading}
                    title="Ask Rosie to suggest follow-up subtasks based on all the notes on this task"
                    className="jost"
                    style={{
                      background: followupSuggestions ? "rgba(184,160,212,0.18)" : "rgba(184,160,212,0.1)",
                      border: "1px solid rgba(184,160,212,0.35)",
                      borderRadius: 8,
                      padding: "4px 10px",
                      fontSize: 11,
                      color: "#9878b8",
                      cursor: followupSuggestions?.loading ? "wait" : "pointer",
                      fontWeight: 600,
                      letterSpacing: 0.3,
                    }}
                  >
                    {followupSuggestions?.loading ? "✨ Rosie's thinking…" : "✨ Suggest follow-ups"}
                  </button>
                </div>
              </div>

              {/* Suggestion panel — visible when Rosie has returned (or errored) */}
              {followupSuggestions && !followupSuggestions.loading && (
                <div style={{ marginBottom: 12, padding: "11px 13px", background: "rgba(184,160,212,0.08)", border: "1px solid rgba(184,160,212,0.3)", borderRadius: 10 }}>
                  {followupSuggestions.errorKind ? (
                    <div>
                      <div className="jost" style={{ fontSize: 11, color: "#9878b8", marginBottom: 7, fontStyle: "italic" }}>
                        {followupSuggestions.errorKind === "timeout"
                          ? "Rosie took too long — try again. (timeout)"
                          : followupSuggestions.errorKind === "network"
                          ? "Couldn't reach Rosie — check your connection. (network)"
                          : followupSuggestions.errorKind === "http"
                          ? "Rosie's service returned an error — try again in a moment. (http)"
                          : followupSuggestions.errorKind === "badformat"
                          ? "Rosie's response came back garbled — try again. (format)"
                          : "Couldn't get suggestions — try again. (unknown)"}
                      </div>
                      <button className="btn ghost jost" onClick={cancelFollowups} style={{ padding: "4px 10px", fontSize: 11 }}>Close</button>
                    </div>
                  ) : followupSuggestions.suggestions.length === 0 ? (
                    <div>
                      <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.6)", marginBottom: 7, fontStyle: "italic" }}>
                        Rosie didn't see anything that clearly calls for a follow-up subtask. The notes look like status updates rather than open threads.
                      </div>
                      <button className="btn ghost jost" onClick={cancelFollowups} style={{ padding: "4px 10px", fontSize: 11 }}>Close</button>
                    </div>
                  ) : (
                    <>
                      <div className="jost" style={{ fontSize: 10, color: "#9878b8", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>
                        Rosie suggests these subtasks — uncheck any you don't want
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
                        {followupSuggestions.suggestions.map((s, idx) => {
                          const checked = followupSuggestions.selected.has(idx);
                          // Resolve where the new subtask would nest — match
                          // s.source to a current subtask. If found, show a
                          // small "under: <subtask>" hint so user sees the
                          // nesting before confirming.
                          const willNestUnder = (() => {
                            if (!s.source) return null;
                            const idxInTasks = (item.tasks || []).indexOf(s.source);
                            return idxInTasks >= 0 ? s.source : null;
                          })();
                          return (
                            <label
                              key={idx}
                              className="jost"
                              style={{
                                display: "flex", alignItems: "flex-start", gap: 8,
                                background: checked ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)",
                                border: `1px solid ${checked ? "rgba(184,160,212,0.35)" : "rgba(184,160,212,0.15)"}`,
                                borderRadius: 8, padding: "7px 10px", cursor: "pointer",
                                fontSize: 12, color: checked ? "#4a3540" : "rgba(74,53,64,0.55)",
                                opacity: checked ? 1 : 0.7,
                                lineHeight: 1.4,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleSuggestionSelected(idx)}
                                style={{ marginTop: 2, flexShrink: 0, accentColor: "#9878b8" }}
                              />
                              <span style={{ flex: 1 }}>
                                {s.title}
                                {willNestUnder && (
                                  <span className="jost" style={{ display: "block", fontSize: 9.5, color: "rgba(74,53,64,0.4)", marginTop: 2, letterSpacing: 0.2 }}>
                                    ↳ will nest under: <span style={{ fontStyle: "italic" }}>{willNestUnder}</span>
                                  </span>
                                )}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn jost"
                          onClick={confirmAddFollowups}
                          disabled={followupSuggestions.selected.size === 0}
                          style={{
                            padding: "6px 14px", fontSize: 11.5,
                            background: "linear-gradient(135deg,#b89cd4,#9878b8)",
                            color: "#fff",
                            opacity: followupSuggestions.selected.size > 0 ? 1 : 0.4,
                          }}
                        >✓ Add {followupSuggestions.selected.size > 0 ? `${followupSuggestions.selected.size} ` : ""}subtask{followupSuggestions.selected.size === 1 ? "" : "s"}</button>
                        <button className="btn ghost jost" onClick={cancelFollowups} style={{ padding: "6px 12px", fontSize: 11.5 }}>Cancel</button>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {all.map(entry => (
                  <div
                    key={`${entry.source || "task"}-${entry.id}`}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 9,
                      background: entry.source ? "rgba(184,160,212,0.06)" : "rgba(212,130,154,0.05)",
                      border: `1px solid ${entry.source ? "rgba(184,160,212,0.18)" : "rgba(212,130,154,0.14)"}`,
                      borderRadius: 9, padding: "8px 11px",
                    }}
                  >
                    <span className="jost" style={{ fontSize: 10, color: entry.source ? "#9878b8" : "#b86d85", fontWeight: 600, whiteSpace: "nowrap", paddingTop: 2, flexShrink: 0 }}>
                      {fmtStamp(entry.ts)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className="jost" style={{ fontSize: 12, color: "#4a3540", lineHeight: 1.45 }}>{entry.text}</span>
                      <div className="jost" style={{ fontSize: 9.5, color: "rgba(74,53,64,0.4)", marginTop: 3, letterSpacing: 0.2 }}>
                        {entry.source
                          ? <>↳ subtask · <span style={{ fontStyle: "italic" }}>{entry.source}</span></>
                          : "task-level note"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Paste List modal — turn pasted text into tasks (with optional subtasks) */}
      {showPasteTaskList && (
        <PasteTaskListModal
          parentItem={item}
          onClose={() => setShowPasteTaskList(false)}
          onSave={(tasks) => {
            // Each entry may have .subtasks. Build parallel arrays with
            // proper parent index references for subtask nesting.
            const existingTasks = item.tasks || [];
            const existingTimes = item.taskTimes || [];
            const existingDates = item.taskDates || [];
            const existingParents = item.taskParents || [];
            const newTasks = [...existingTasks];
            const newTimes = [...existingTimes];
            const newDates = [...existingDates];
            const newParents = [];
            for (let i = 0; i < existingTasks.length; i++) {
              const p = existingParents[i];
              newParents.push(typeof p === "number" ? p : null);
            }
            while (newTimes.length < newTasks.length) newTimes.push(15);
            while (newDates.length < newTasks.length) newDates.push({ date: "", notToday: false, fixed: false });

            for (const top of tasks) {
              const parentIdx = newTasks.length;
              newTasks.push(top.title);
              newTimes.push(top.durationMin || 15);
              newDates.push({ date: top.date || "", notToday: false, fixed: false });
              newParents.push(null);
              for (const sub of (top.subtasks || [])) {
                newTasks.push(sub.title);
                newTimes.push(sub.durationMin || 15);
                newDates.push({ date: sub.date || top.date || "", notToday: false, fixed: false });
                newParents.push(parentIdx);
              }
            }
            onUpdate({ ...item, tasks: newTasks, taskTimes: newTimes, taskDates: newDates, taskParents: newParents });
          }}
        />
      )}

      {/* Wrap-up confirmation modal — appears before going back to roadmap */}
      {showWrapConfirm && roadmapContext && roadmapContext.activeBlock && (() => {
        const plannedEnd = roadmapContext.activeBlock.endMin;
        const actualEnd = nowMin;
        const deltaMin = actualEnd - plannedEnd;
        const isOver = deltaMin > 0;
        const isEarly = deltaMin < -2; // small threshold to ignore "right on time"
        const absDelta = Math.abs(deltaMin);
        const remainingUnlocked = (roadmap?.slots || []).slice(roadmapContext.activeBlock.idx + 1).filter(s => !s.locked).length;
        return (
          <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowWrapConfirm(false)}>
            <div className="modal fade" style={{ maxWidth: 420, textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🌙</div>
              <h3 className="cg" style={{ fontSize: 22, color: "#4a3540", fontStyle: "italic", marginBottom: 6, fontWeight: 400 }}>Wrap this block?</h3>
              <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.6)", marginBottom: 14, lineHeight: 1.5 }}>
                Mark "{roadmapContext.activeBlock.slot.label}" as ✓ done.
              </p>

              {/* Time delta info */}
              {(isOver || isEarly) && (
                <div style={{ background: isOver ? "rgba(196,126,138,0.08)" : "rgba(158,184,154,0.1)", border: `1px solid ${isOver ? "rgba(196,126,138,0.3)" : "rgba(158,184,154,0.3)"}`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, textAlign: "left" }}>
                  <div className="jost" style={{ fontSize: 11, color: isOver ? "#c47e8a" : "#7a9e78", fontWeight: 600, marginBottom: 4 }}>
                    {isOver ? `⏰ ${absDelta}m over` : `⚡ ${absDelta}m early`}
                  </div>
                  <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.65)", lineHeight: 1.5 }}>
                    {remainingUnlocked > 0
                      ? `Following ${remainingUnlocked} unlocked slot${remainingUnlocked !== 1 ? "s" : ""} will shift ${isOver ? "later" : "earlier"} by ${absDelta} min. Locked slots (meetings, 1:1s) stay put.`
                      : `No remaining unlocked slots to shift — locked slots stay put.`}
                  </div>
                </div>
              )}
              {!isOver && !isEarly && (
                <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.5)", marginBottom: 16, fontStyle: "italic" }}>
                  Right on time ✦
                </p>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn ghost jost"
                  onClick={() => setShowWrapConfirm(false)}
                  style={{ flex: 1, padding: 10, fontSize: 12 }}
                >Cancel</button>
                <button
                  className="btn rose jost"
                  onClick={handleConfirmWrapUp}
                  style={{ flex: 2, padding: 10, fontSize: 12 }}
                >🌸 Mark done & go back</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Agents section ────────────────────────────────────────────── */}
      {/* Shows the ✨ Generate menu + existing drafts saved on this task.
          Drafts persist on item.agentDrafts (array). Each draft = one agent
          run, edited or not, with copy buttons + review notes preserved. */}
      <div ref={agentsSectionRef} style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(184,160,212,0.05))", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(184,160,212,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div className="jost" style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: "#7e5fa3", fontWeight: 600 }}>
              ✨ agents
            </div>
            <div className="jost" style={{ fontSize: 10.5, color: "rgba(74,53,64,0.7)", fontStyle: "italic", marginTop: 2 }}>
              Drafts for review. Never auto-sent. Refine with feedback or copy + paste yourself.
            </div>
          </div>
          {/* Single button — we have one agent. If we add more, this becomes a dropdown. */}
          {Object.keys(AGENT_REGISTRY).length === 1 ? (
            (() => {
              const onlyAgent = Object.values(AGENT_REGISTRY)[0];
              return (
                <button
                  onClick={() => setActiveAgent({ agentId: onlyAgent.id, existingDraft: null })}
                  title={onlyAgent.description}
                  className="jost"
                  style={{
                    fontSize: 11.5, padding: "7px 14px",
                    background: "linear-gradient(135deg,#b89cd4,#7e5fa3)",
                    color: "#fff", border: "none", borderRadius: 7,
                    fontWeight: 600, letterSpacing: 0.3, cursor: "pointer",
                  }}
                >+ {onlyAgent.icon} {onlyAgent.label}</button>
              );
            })()
          ) : (
            <select
              value=""
              onChange={e => {
                if (e.target.value) {
                  setActiveAgent({ agentId: e.target.value, existingDraft: null });
                  e.target.value = "";
                }
              }}
              aria-label="Choose an agent to run"
              className="jost"
              style={{
                fontSize: 11.5, padding: "7px 12px",
                background: "linear-gradient(135deg,#b89cd4,#7e5fa3)",
                color: "#fff", border: "none", borderRadius: 7,
                fontWeight: 600, letterSpacing: 0.3, cursor: "pointer",
              }}
            >
              <option value="" style={{ color: "#4a3540" }}>+ Generate ▾</option>
              {Object.values(AGENT_REGISTRY).map(a => (
                <option key={a.id} value={a.id} style={{ color: "#4a3540" }}>{a.icon} {a.label}</option>
              ))}
            </select>
          )}
        </div>

        {/* Existing drafts for this task */}
        {Array.isArray(item?.agentDrafts) && item.agentDrafts.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {item.agentDrafts.slice().reverse().map(d => {
              const a = AGENT_REGISTRY[d.agentId];
              if (!a) return null;
              const ago = (() => {
                const ms = Date.now() - (d.savedAt || d.generatedAt || 0);
                const h = Math.floor(ms / (60 * 60 * 1000));
                if (h < 1) return "just now";
                if (h < 24) return `${h}h ago`;
                const days = Math.floor(h / 24);
                return `${days}d ago`;
              })();
              const unackNotes = (d.reviewNotes || []).filter(n => !(d.acknowledgedNoteIds || []).includes(n.id)).length;
              return (
                <div key={d.logId || d.generatedAt} style={{
                  background: "rgba(184,160,212,0.05)",
                  border: "1px solid rgba(184,160,212,0.2)",
                  borderRadius: 7,
                  padding: "8px 11px",
                  display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
                }}>
                  <span style={{ fontSize: 13 }}>{a.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="jost" style={{ fontSize: 11.5, color: "#4a3540", fontWeight: 500 }}>{a.label}</div>
                    <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.7)" }}>
                      {ago}{unackNotes > 0 && <span style={{ color: "#a3683f", marginLeft: 6, fontWeight: 600 }}>· ⚠ {unackNotes} to review</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveAgent({ agentId: d.agentId, existingDraft: d })}
                    aria-label={`Open ${a.label} draft`}
                    className="jost"
                    style={{
                      background: "rgba(184,160,212,0.18)", border: "1px solid rgba(184,160,212,0.4)",
                      color: "#7e5fa3", padding: "4px 10px", fontSize: 10.5, fontWeight: 600, borderRadius: 5,
                      cursor: "pointer",
                    }}
                  >Open</button>
                  <button
                    onClick={() => {
                      // Two-step delete — first click sets a confirm flag, second click in 3s deletes
                      const updated = { ...item, agentDrafts: (item.agentDrafts || []).filter(x => x.logId !== d.logId) };
                      onUpdate(updated);
                    }}
                    title="Delete draft"
                    aria-label={`Delete ${a.label} draft`}
                    className="jost"
                    style={{ background: "none", border: "none", color: "rgba(74,53,64,0.55)", cursor: "pointer", fontSize: 12, padding: "2px 5px" }}
                  >×</button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.65)", fontStyle: "italic", textAlign: "center", padding: "8px 0" }}>
            No drafts yet for this task.
          </div>
        )}
      </div>

      {/* Agent runner modal — opens when activeAgent is set */}
      {activeAgent && (
        <AgentRunnerModal
          agentId={activeAgent.agentId}
          task={item}
          existingDraft={activeAgent.existingDraft}
          onClose={() => setActiveAgent(null)}
          onSaveDraft={(draft) => {
            // Save or update the draft on the item.agentDrafts array
            const existing = Array.isArray(item.agentDrafts) ? item.agentDrafts : [];
            const isUpdate = activeAgent.existingDraft && existing.some(d => d.logId === activeAgent.existingDraft.logId);
            const nextDrafts = isUpdate
              ? existing.map(d => d.logId === activeAgent.existingDraft.logId ? draft : d)
              : [...existing, draft];
            onUpdate({ ...item, agentDrafts: nextDrafts });
          }}
          onLogAgent={(logEntry) => {
            // Append to data.agentLog via updateFullData (compliance audit trail)
            if (updateFullData && fullData) {
              const enriched = { ...logEntry, taskId: item.id, taskTitle: item.title };
              updateFullData({
                ...fullData,
                agentLog: [...(fullData.agentLog || []), enriched],
              });
            }
          }}
        />
      )}
    </div>
  );
}
