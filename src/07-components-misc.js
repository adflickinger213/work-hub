// 07-components-misc.js
// CSS, FX, ticker, chat docks, Reminders, Schedule/Recurring meetings, Overview, ProjectsView, CheckIn, MeetingFocusView, QuickCapture, MeetingsTab + MPC constants.

// ── Confetti & XP Pop ─────────────────────────────────────────────────────────
function fireConfetti() {
  const colors = ["#e8a0b4","#d4687f","#9eb89a","#c4a882","#b8a0d4","#f5c842"];
  for (let i = 0; i < 52; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.cssText = `left:${Math.random()*100}vw;top:0;background:${colors[Math.floor(Math.random()*colors.length)]};animation-duration:${0.9+Math.random()*1.2}s;animation-delay:${Math.random()*0.4}s;width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;border-radius:${Math.random()>0.5?"50%":"2px"}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2400);
  }
}

function showXpPop(amount, x, y) {
  const el = document.createElement("div");
  el.className = "xp-pop";
  el.textContent = `+${amount} XP ✨`;
  el.style.cssText = `left:${Math.min(x, window.innerWidth-80)}px;top:${y-20}px;`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} .cg{font-family:'Cormorant Garamond',serif;} .jost{font-family:'Jost',sans-serif;} textarea,input,button,select{font-family:'Jost',sans-serif;} ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:rgba(212,130,154,0.3);border-radius:4px;} .card{background:rgba(255,255,255,0.78);border:1px solid rgba(212,130,154,0.15);border-radius:18px;backdrop-filter:blur(8px);} .ifield{background:rgba(255,255,255,0.85);border:1px solid rgba(212,130,154,0.25);border-radius:10px;color:#4a3540;padding:9px 13px;width:100%;outline:none;font-size:13px;transition:border-color .2s;} .ifield:focus{border-color:rgba(212,130,154,0.6);} .ifield::placeholder{color:rgba(74,53,64,0.3);} .btn{border:none;border-radius:10px;cursor:pointer;font-size:13px;font-weight:500;padding:9px 18px;transition:all .2s;letter-spacing:.3px;} .btn:hover{transform:translateY(-1px);filter:brightness(1.05);} .btn:active{transform:translateY(0);} .rose{background:linear-gradient(135deg,#e8a0b4,#d4687f);color:#fff;} .ghost{background:rgba(212,130,154,0.08);color:#c4788e;border:1px solid rgba(212,130,154,0.2)!important;} .fade{animation:fadeUp .4s ease both;} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} .pulse{animation:pulse 1.8s infinite;} @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}} .item-row{transition:all .15s;border-radius:12px;cursor:pointer;} .item-row:hover{background:rgba(212,130,154,0.06)!important;} .tag{display:inline-flex;align-items:center;padding:3px 11px;border-radius:20px;font-size:11px;font-weight:500;letter-spacing:.4px;} .chat-bubble{max-width:88%;padding:11px 15px;font-size:13px;line-height:1.65;white-space:pre-wrap;animation:fadeUp .3s ease both;} .modal-bg{position:fixed;inset:0;background:rgba(74,35,50,0.25);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:100;padding:20px;} .modal{background:#fff8f5;border:1px solid rgba(212,130,154,0.2);border-radius:20px;padding:28px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(212,100,130,0.15);} .sl{font-size:10px;letter-spacing:2.5px;color:rgba(196,120,142,0.8);text-transform:uppercase;font-weight:600;display:block;margin-bottom:7px;} select option{background:#fff8f5;color:#4a3540;} .one-thing-glow{box-shadow:0 0 40px rgba(212,130,154,0.25),0 4px 24px rgba(212,130,154,0.15);} .energy-btn{border-radius:14px;padding:12px 16px;cursor:pointer;transition:all .2s;border:2px solid transparent;text-align:left;} .energy-btn:hover{transform:translateY(-2px);} .mood-btn{border-radius:12px;padding:10px 14px;cursor:pointer;transition:all .2s;border:2px solid transparent;text-align:center;} .mood-btn:hover{transform:scale(1.05);} .warn-banner{background:linear-gradient(135deg,rgba(212,130,154,0.15),rgba(196,168,130,0.1));border:1px solid rgba(212,130,154,0.25);border-radius:14px;padding:14px 18px;} .confetti-piece{position:fixed;pointer-events:none;z-index:9999;animation:confettiFall linear forwards;} @keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1;}100%{transform:translateY(100vh) rotate(720deg);opacity:0;}} .xp-pop{position:fixed;pointer-events:none;z-index:9998;animation:xpFloat 1.3s ease forwards;font-family:'Jost',sans-serif;font-size:14px;font-weight:600;color:#d4829a;text-shadow:0 1px 8px rgba(212,130,154,0.4);} @keyframes xpFloat{0%{opacity:1;transform:translateY(0) scale(1);}40%{opacity:1;transform:translateY(-30px) scale(1.1);}100%{opacity:0;transform:translateY(-65px) scale(0.9);}} .saved-ind{position:fixed;bottom:20px;right:20px;background:rgba(158,184,154,0.92);color:#fff;border-radius:10px;padding:6px 14px;font-size:12px;z-index:200;font-weight:500;animation:savedAnim 2.2s ease forwards;} @keyframes savedAnim{0%{opacity:0;transform:translateY(6px);}15%{opacity:1;transform:translateY(0);}70%{opacity:1;}100%{opacity:0;}} .streak-pill{box-shadow:0 0 10px rgba(255,160,60,0.35);} .chat-min-btn{background:rgba(212,130,154,0.08);border:1px solid rgba(212,130,154,0.2);border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#c4788e;font-size:14px;line-height:1;padding:0;transition:all .2s;} .chat-min-btn:hover{background:rgba(212,130,154,0.18);transform:scale(1.08);} .chat-bubble-fab{position:fixed;bottom:22px;right:22px;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#e8a0b4,#d4687f);color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:0 6px 24px rgba(212,100,130,0.35),0 0 0 4px rgba(255,255,255,0.6);z-index:150;transition:transform .2s,box-shadow .2s;animation:bubbleIn .35s ease both;} .chat-bubble-fab:hover{transform:translateY(-2px) scale(1.05);box-shadow:0 10px 32px rgba(212,100,130,0.45),0 0 0 4px rgba(255,255,255,0.7);} .chat-bubble-fab:active{transform:translateY(0) scale(0.98);} @keyframes bubbleIn{from{opacity:0;transform:translateY(20px) scale(0.7);}to{opacity:1;transform:translateY(0) scale(1);}} .chat-bubble-dot{position:absolute;top:4px;right:4px;width:10px;height:10px;border-radius:50%;background:#9eb89a;border:2px solid #fff;} .chat-min-stub{background:rgba(255,255,255,0.78);border:1px dashed rgba(212,130,154,0.3);border-radius:18px;padding:14px 18px;display:flex;align-items:center;justify-content:center;color:rgba(196,120,142,0.55);font-size:12px;font-style:italic;} .qc-fab{position:fixed;bottom:22px;right:230px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#fff8f5,#fde8f0);color:#d4829a;border:2px solid rgba(212,130,154,0.35);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:300;box-shadow:0 6px 20px rgba(212,100,130,0.2);z-index:150;transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s;animation:bubbleIn .35s ease both;line-height:1;padding:0;} .qc-fab:hover{transform:translateY(-2px) scale(1.06);box-shadow:0 10px 28px rgba(212,100,130,0.3);} .qc-fab.open{transform:rotate(45deg);background:linear-gradient(135deg,#d4829a,#c4687f);color:#fff;border-color:rgba(255,255,255,0.5);} .qc-mini{position:fixed;right:238px;width:44px;height:44px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 14px rgba(0,0,0,0.12);z-index:149;transition:transform .2s,box-shadow .2s;animation:qcFan .3s cubic-bezier(.34,1.56,.64,1) both;color:#fff;} .qc-mini:hover{transform:scale(1.1);box-shadow:0 6px 18px rgba(0,0,0,0.18);} @keyframes qcFan{from{opacity:0;transform:translateY(30px) scale(0.3);}to{opacity:1;transform:translateY(0) scale(1);}} .qc-label{position:fixed;right:292px;background:rgba(74,53,64,0.92);color:#fff;padding:6px 12px;border-radius:8px;font-size:12px;font-family:'Jost',sans-serif;font-weight:500;white-space:nowrap;pointer-events:none;box-shadow:0 3px 10px rgba(0,0,0,0.15);animation:qcFan .3s cubic-bezier(.34,1.56,.64,1) both;z-index:148;} .qc-label::before{content:"";position:absolute;right:-5px;top:50%;transform:translateY(-50%);border:5px solid transparent;border-left-color:rgba(74,53,64,0.92);} .drag-handle{cursor:grab;color:rgba(196,120,142,0.35);font-size:14px;line-height:1;user-select:none;padding:0 4px;transition:color .15s;flex-shrink:0;} .drag-handle:hover{color:rgba(196,120,142,0.75);} .drag-handle:active{cursor:grabbing;} .task-dragging{opacity:0.4;transform:scale(0.98);} .task-drop-above{box-shadow:0 -2px 0 0 #d4829a inset!important;} .task-drop-below{box-shadow:0 2px 0 0 #d4829a inset!important;} .task-completed-fade{animation:taskCompletedFade .35s ease both;} @keyframes taskCompletedFade{from{opacity:0.3;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}`;

// ── Saved Indicator ───────────────────────────────────────────────────────────
function SavedIndicator({ show }) {
  const [key, setKey] = useState(0);
  useEffect(() => { if (show) setKey(k => k+1); }, [show]);
  if (!show) return null;
  return <div key={key} className="saved-ind jost">✓ saved</div>;
}

// ── XP Bar ────────────────────────────────────────────────────────────────────
function XPBar({ xp, streak }) {
  const { level, progress } = xpForLevel(xp || 0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {streak > 0 && (
        <div className="streak-pill" style={{ background: "rgba(255,160,60,0.12)", border: "1px solid rgba(255,160,60,0.3)", borderRadius: 20, padding: "3px 10px", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 13 }}>🔥</span>
          <span className="jost" style={{ fontSize: 11, fontWeight: 600, color: "#e08030" }}>{streak}</span>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span className="jost" style={{ fontSize: 11, color: "#d4829a", fontWeight: 600 }}>Lv.{level}</span>
        <div style={{ width: 56, height: 5, background: "rgba(212,130,154,0.15)", borderRadius: 3 }}>
          <div style={{ width: `${progress*100}%`, height: "100%", background: "linear-gradient(90deg,#e8a0b4,#d4829a)", borderRadius: 3, transition: "width .6s" }} />
        </div>
        <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.35)" }}>{xp||0} XP</span>
      </div>
    </div>
  );
}

// ── Encouragement Ticker ──────────────────────────────────────────────────────
function EncouragementTicker() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random()*ENCOURAGEMENTS.length));
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i+1) % ENCOURAGEMENTS.length); setVisible(true); }, 420);
    }, 11000);
    return () => clearInterval(t);
  }, []);
  return <span className="jost" style={{ fontSize: 11, color: "rgba(196,120,142,0.65)", fontStyle: "italic", transition: "opacity .4s", opacity: visible?1:0 }}>{ENCOURAGEMENTS[idx]}</span>;
}

// ── Finish Time Tag ───────────────────────────────────────────────────────────
function FinishTime({ item }) {
  if (item.tbd) return <span className="tag jost" style={{ background: "rgba(212,130,154,0.1)", color: "#b86d85", border: "1px dashed rgba(212,130,154,0.35)" }}>🌸 TBD</span>;
  // Skip ETA projection for paused items — it'd be misleading. Projection
  // assumes Lexy can work on it now; "On hold" and "Waiting" mean she can't.
  if (item.status === "hold" || item.status === "waiting") return null;
  const times = item.taskTimes || [];
  if (!times.length) return null;
  const remainMins = (item.tasks || []).filter(t => !(item.completedTasks || []).includes(t)).reduce((a, t) => {
    const i = (item.tasks || []).indexOf(t); return a + (times[i] || 15);
  }, 0);
  if (!remainMins) return null;
  const finish = predictFinishEST(remainMins);
  if (!finish) return null;
  return (
    <span className="tag jost" style={{ background: "rgba(158,184,154,0.12)", color: "#7a9e78", display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ opacity: 0.7 }}>⏱</span> {fmtFinishLabel(finish)}
    </span>
  );
}

// ── Minimizable Chat Wrapper ──────────────────────────────────────────────────
function MinimizableChat({ systemPrompt, placeholder, greeting, header, stubText, expandedStyle, data, onDataUpdate, focusedItemId }) {
  const [minimized, setMinimized] = useState(false);

  if (minimized) {
    return (
      <>
        <div className="chat-min-stub">
          {stubText || "Rosie is minimized — tap the bubble to chat 🌸"}
        </div>
        <button
          className="chat-bubble-fab"
          onClick={() => setMinimized(false)}
          title="Open Rosie"
          aria-label="Open Rosie chat"
        >
          🌸
          <span className="chat-bubble-dot" />
        </button>
      </>
    );
  }

  return (
    <div className="card" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", overflow: "hidden", ...(expandedStyle || {}) }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>{header}</div>
        <button
          className="chat-min-btn"
          onClick={() => setMinimized(true)}
          title="Minimize Rosie"
          aria-label="Minimize Rosie chat"
        >
          −
        </button>
      </div>
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <ChatPanel systemPrompt={systemPrompt} placeholder={placeholder} greeting={greeting} data={data} onDataUpdate={onDataUpdate} focusedItemId={focusedItemId} />
      </div>
    </div>
  );
}

// ── Bottom Chat Dock ──────────────────────────────────────────────────────────
// Docks Rosie at the bottom of the viewport. Collapsed = slim pill bar.
// Expanded = popover panel above it. No sidebar needed.
function BottomChatDock({ systemPrompt, placeholder, greeting, data, onDataUpdate, subtitle, focusedItemId, inline = false }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Expanded panel */}
      {expanded && (
        <div
          className="fade"
          style={{
            position: "fixed",
            bottom: 74,
            right: 20,
            left: "auto",
            width: "min(440px, calc(100vw - 40px))",
            height: "min(520px, calc(100vh - 140px))",
            background: "linear-gradient(160deg,rgba(255,255,255,0.98),rgba(255,238,245,0.96))",
            border: "1px solid rgba(212,130,154,0.25)",
            borderRadius: 20,
            boxShadow: "0 20px 60px rgba(212,100,130,0.2), 0 0 0 1px rgba(255,255,255,0.6)",
            backdropFilter: "blur(12px)",
            zIndex: 160,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            padding: "18px 20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label className="sl jost">Rosie — your work bestie</label>
              {subtitle && <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.4)", marginTop: -3 }}>{subtitle}</p>}
            </div>
            <button
              className="chat-min-btn"
              onClick={() => setExpanded(false)}
              title="Minimize Rosie"
              aria-label="Minimize Rosie chat"
            >
              −
            </button>
          </div>
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <ChatPanel systemPrompt={systemPrompt} placeholder={placeholder} greeting={greeting} data={data} onDataUpdate={onDataUpdate} focusedItemId={focusedItemId} />
          </div>
        </div>
      )}

      {/* Collapsed bar — fixed floating button by default, or an inline pill
          when inline=true (used in FocusView's top pill row). The expanded
          panel above stays anchored bottom-right either way. */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="jost"
        style={inline ? {
          padding: "5px 13px",
          borderRadius: 24,
          background: expanded
            ? "linear-gradient(135deg,#d4829a,#c4687f)"
            : "linear-gradient(135deg,#e8a0b4,#d4687f)",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          fontWeight: 500,
          boxShadow: "0 3px 12px rgba(212,100,130,0.25)",
          transition: "transform .2s, box-shadow .2s",
        } : {
          position: "fixed",
          bottom: 18,
          right: 20,
          height: 46,
          padding: "0 18px 0 14px",
          borderRadius: 24,
          background: expanded
            ? "linear-gradient(135deg,#d4829a,#c4687f)"
            : "linear-gradient(135deg,#e8a0b4,#d4687f)",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 13,
          fontWeight: 500,
          boxShadow: "0 6px 24px rgba(212,100,130,0.35), 0 0 0 4px rgba(255,255,255,0.6)",
          zIndex: 155,
          transition: "transform .2s, box-shadow .2s",
        }}
        aria-label={expanded ? "Minimize Rosie" : "Open Rosie"}
      >
        <span style={{ fontSize: inline ? 15 : 20, lineHeight: 1 }}>🌸</span>
        <span>{expanded ? "Close Rosie" : "Chat with Rosie"}</span>
        <span style={{ fontSize: inline ? 11 : 14, opacity: 0.8 }}>{expanded ? "↓" : "↑"}</span>
      </button>
    </>
  );
}

// ── History Modal (completed items) ───────────────────────────────────────────
// ── Recovery Modal — search backups for missing items and offer to restore ────
// ── Recurring Meetings Modal — manage daily/weekly meetings ──────────────────
function RecurringMeetingsModal({ data, onUpdate, onClose }) {
  const recurring = data.recurringMeetings || [];
  const [editing, setEditing] = useState(null); // null | "new" | id
  const [form, setForm] = useState({ title: "", dayOfWeek: "daily", startTime: "09:00", durationMin: 30, note: "", startDate: "" });
  // Restore-from-backup state. On mount, probe the rolling meetings backup
  // (written by the autosave when data has entries). If the backup has
  // recurring meetings AND current data has none, surface a restore option
  // so the user isn't stuck with an empty list and an unrecoverable wipe.
  const [backupInfo, setBackupInfo] = useState(null); // null | { recurring, scheduled, savedAt }
  const [restoreDone, setRestoreDone] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.storage) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await window.storage.get(`${STORAGE_KEY}-meetings-rolling-backup`);
        if (cancelled || !r || !r.value) return;
        const parsed = JSON.parse(r.value);
        if (Array.isArray(parsed?.recurringMeetings) && parsed.recurringMeetings.length > 0) {
          setBackupInfo(parsed);
        }
      } catch (e) { /* backup probe is best-effort */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const restoreFromBackup = () => {
    if (!backupInfo || !onUpdate) return;
    // Merge by id: keep current entries, add any from backup not already present.
    // This way a partial-restore (some meetings exist + some missing) doesn't
    // duplicate or wipe what the user has now.
    const currentIds = new Set((data?.recurringMeetings || []).map(rm => rm.id));
    const merged = [
      ...(data?.recurringMeetings || []),
      ...(backupInfo.recurringMeetings || []).filter(rm => rm && rm.id && !currentIds.has(rm.id)),
    ];
    onUpdate({ ...data, recurringMeetings: merged });
    setRestoreDone(true);
    setBackupInfo(null);
  };

  const startNew = () => {
    setForm({ title: "", dayOfWeek: "daily", startTime: "09:00", durationMin: 30, note: "", startDate: "" });
    setEditing("new");
  };
  const startEdit = (rm) => {
    // Stringify dayOfWeek so the dropdown's option values match (selects use string compare)
    const dowStr = rm.dayOfWeek === "daily" ? "daily" :
                   typeof rm.dayOfWeek === "number" ? String(rm.dayOfWeek) :
                   rm.dayOfWeek || "daily";
    // Pre-fill startDate from anchorDate (biweekly) or notBefore (monthly) if either exists.
    const startDate = rm.anchorDate || rm.notBefore || "";
    setForm({ title: rm.title || "", dayOfWeek: dowStr, startTime: rm.startTime || "09:00", durationMin: rm.durationMin || 30, note: rm.note || "", startDate });
    setEditing(rm.id);
  };
  const saveForm = () => {
    if (!form.title.trim()) return;
    // dayOfWeek can be: "daily", a numeric string ("1"-"5"), or a complex string
    // ("biweekly-1", "monthly-day-15", "monthly-first-3", etc.)
    let dow;
    if (form.dayOfWeek === "daily") dow = "daily";
    else if (typeof form.dayOfWeek === "string" && /^\d+$/.test(form.dayOfWeek)) dow = Number(form.dayOfWeek);
    else dow = form.dayOfWeek; // pass through complex cadence strings

    const isBiweekly = typeof dow === "string" && dow.startsWith("biweekly-");
    const isMonthly = typeof dow === "string" && dow.startsWith("monthly-");
    const today = new Date().toISOString().slice(0, 10);

    // For biweekly: anchorDate sets the parity. For monthly: notBefore date
    // suppresses the meeting until on/after that date (used as a deferred start).
    // For weekly/daily: neither field is needed.
    const userStartDate = form.startDate && form.startDate >= today ? form.startDate : null;

    if (editing === "new") {
      const newRm = {
        id: uid(),
        ...form,
        dayOfWeek: dow,
        ...(isBiweekly ? { anchorDate: userStartDate || today } : {}),
        ...(isMonthly && userStartDate ? { notBefore: userStartDate } : {}),
      };
      onUpdate({ ...data, recurringMeetings: [...recurring, newRm] });
    } else {
      const existing = recurring.find(rm => rm.id === editing);
      let anchorDate = existing?.anchorDate;
      // For biweekly: if user picked a start date in the form, use it (overrides any prior).
      // Otherwise keep existing anchor or stamp today as fallback.
      if (isBiweekly) {
        anchorDate = userStartDate || anchorDate || today;
      }
      onUpdate({
        ...data,
        recurringMeetings: recurring.map(rm => rm.id === editing
          ? {
              ...rm, ...form, dayOfWeek: dow,
              ...(isBiweekly ? { anchorDate } : { anchorDate: undefined }),
              ...(isMonthly && userStartDate ? { notBefore: userStartDate } : { notBefore: isMonthly ? rm.notBefore : undefined }),
            }
          : rm),
      });
    }
    setEditing(null);
  };
  const cancelEdit = () => setEditing(null);
  const deleteRm = (id) => {
    if (!confirm("Delete this recurring meeting?")) return;
    onUpdate({ ...data, recurringMeetings: recurring.filter(rm => rm.id !== id) });
  };

  const dowLabel = formatRecurringDayOfWeek;
  const fmtTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade" style={{ maxWidth: 520, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 className="cg" style={{ fontSize: 24, color: "#4a3540", fontStyle: "italic", fontWeight: 400, margin: 0 }}>📅 Recurring meetings</h2>
          <button onClick={onClose} className="jost" style={{ background: "none", border: "none", color: "rgba(74,53,64,0.4)", fontSize: 16, cursor: "pointer", padding: 4 }}>✕</button>
        </div>

        <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.6)", marginBottom: 14, lineHeight: 1.55 }}>
          Set up meetings that happen regularly so you don't have to type them in every day. They'll show up in your check-in as a checklist.
        </p>

        {/* Restore-from-backup banner — shown when current recurring list is
            empty AND a rolling backup with entries exists. Lets the user
            recover from data wipes (window.storage resets, etc.) without
            having to re-enter everything by hand. */}
        {backupInfo && recurring.length === 0 && !restoreDone && (
          <div style={{
            background: "rgba(196,168,130,0.12)",
            border: "1px solid rgba(196,168,130,0.4)",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 12,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap",
          }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div className="jost" style={{ fontSize: 11, color: "#9a7850", fontWeight: 600, marginBottom: 2 }}>
                🌿 Backup found
              </div>
              <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.65)", lineHeight: 1.4 }}>
                {backupInfo.recurringMeetings.length} recurring meeting{backupInfo.recurringMeetings.length === 1 ? "" : "s"} saved {(() => {
                  if (!backupInfo.savedAt) return "previously";
                  const ageMs = Date.now() - backupInfo.savedAt;
                  const days = Math.floor(ageMs / (1000 * 60 * 60 * 24));
                  if (days === 0) return "today";
                  if (days === 1) return "yesterday";
                  if (days < 7) return `${days} days ago`;
                  return `${Math.floor(days / 7)} week${Math.floor(days / 7) === 1 ? "" : "s"} ago`;
                })()}.
              </div>
            </div>
            <button
              onClick={restoreFromBackup}
              className="btn jost"
              style={{
                background: "linear-gradient(135deg,#c4a882,#a88862)",
                color: "#fff",
                padding: "6px 14px", fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
                cursor: "pointer", border: "none", borderRadius: 8,
              }}
            >↺ Restore</button>
          </div>
        )}

        {restoreDone && (
          <div className="fade jost" style={{
            background: "rgba(158,184,154,0.18)",
            border: "1px solid rgba(158,184,154,0.4)",
            borderRadius: 10,
            padding: "8px 14px", marginBottom: 12,
            fontSize: 11, color: "#7a9e78", fontWeight: 500, textAlign: "center",
          }}>
            ✓ Restored from backup
          </div>
        )}

        {/* List of existing recurring meetings */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {recurring.length === 0 && editing !== "new" && (
            <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.45)", textAlign: "center", padding: "16px 8px", fontStyle: "italic" }}>
              No recurring meetings yet. Tap "+ Add" below to set one up.
            </p>
          )}
          {recurring.map(rm => (
            <div key={rm.id}>
              {editing === rm.id ? (
                <RecurringForm form={form} setForm={setForm} onSave={saveForm} onCancel={cancelEdit} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.5)", border: "1px solid rgba(184,160,212,0.2)", borderRadius: 9 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="jost" style={{ fontSize: 13, color: "#4a3540", fontWeight: 500 }}>{rm.title}</div>
                    <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)", marginTop: 2 }}>
                      {dowLabel(rm.dayOfWeek)} · {fmtTime(rm.startTime)} · {rm.durationMin}m
                    </div>
                  </div>
                  <button onClick={() => startEdit(rm)} className="btn ghost jost" style={{ fontSize: 10, padding: "4px 10px" }}>edit</button>
                  <button onClick={() => deleteRm(rm.id)} className="jost" style={{ background: "none", border: "none", color: "rgba(184,109,133,0.5)", cursor: "pointer", fontSize: 13, padding: "0 4px" }}>×</button>
                </div>
              )}
            </div>
          ))}
          {editing === "new" && (
            <RecurringForm form={form} setForm={setForm} onSave={saveForm} onCancel={cancelEdit} />
          )}
        </div>

        {editing !== "new" && (
          <button
            onClick={startNew}
            className="jost"
            style={{ width: "100%", background: "rgba(255,255,255,0.5)", border: "1px dashed rgba(212,130,154,0.3)", borderRadius: 9, padding: "8px 10px", fontSize: 12, color: "#b86d85", cursor: "pointer", textAlign: "center", fontWeight: 500 }}
          >+ Add recurring meeting</button>
        )}
      </div>
    </div>
  );
}

function RecurringForm({ form, setForm, onSave, onCancel }) {
  return (
    <div style={{ background: "rgba(184,160,212,0.06)", border: "1px solid rgba(184,160,212,0.3)", borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>Title</label>
          <input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Daily IT Sync"
            className="jost"
            style={{ width: "100%", padding: "6px 10px", fontSize: 13, border: "1px solid rgba(184,160,212,0.3)", borderRadius: 7, background: "rgba(255,255,255,0.7)" }}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1.4 }}>
            <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>When</label>
            <select
              value={form.dayOfWeek}
              onChange={e => setForm({ ...form, dayOfWeek: e.target.value })}
              className="jost"
              style={{ width: "100%", padding: "6px 10px", fontSize: 12, border: "1px solid rgba(184,160,212,0.3)", borderRadius: 7, background: "rgba(255,255,255,0.7)" }}
            >
              <option value="daily">Daily (M-F)</option>
              <optgroup label="Weekly">
                <option value="1">Every Monday</option>
                <option value="2">Every Tuesday</option>
                <option value="3">Every Wednesday</option>
                <option value="4">Every Thursday</option>
                <option value="5">Every Friday</option>
              </optgroup>
              <optgroup label="Every other week">
                <option value="biweekly-1">Every other Monday</option>
                <option value="biweekly-2">Every other Tuesday</option>
                <option value="biweekly-3">Every other Wednesday</option>
                <option value="biweekly-4">Every other Thursday</option>
                <option value="biweekly-5">Every other Friday</option>
              </optgroup>
              <optgroup label="Monthly (by day of month)">
                <option value="monthly-day-1">1st of each month</option>
                <option value="monthly-day-15">15th of each month</option>
                <option value="monthly-day-last">Last day of each month</option>
              </optgroup>
              <optgroup label="Monthly (by weekday)">
                <option value="monthly-first-1">First Monday of month</option>
                <option value="monthly-first-3">First Wednesday of month</option>
                <option value="monthly-second-2">Second Tuesday of month</option>
                <option value="monthly-second-4">Second Thursday of month</option>
                <option value="monthly-third-1">Third Monday of month</option>
                <option value="monthly-third-3">Third Wednesday of month</option>
                <option value="monthly-fourth-2">Fourth Tuesday of month</option>
                <option value="monthly-fourth-4">Fourth Thursday of month</option>
                <option value="monthly-last-5">Last Friday of month</option>
              </optgroup>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>Start</label>
            <input
              type="time"
              value={form.startTime}
              onChange={e => setForm({ ...form, startTime: e.target.value })}
              className="jost"
              style={{ width: "100%", padding: "5px 10px", fontSize: 12, border: "1px solid rgba(184,160,212,0.3)", borderRadius: 7, background: "rgba(255,255,255,0.7)" }}
            />
          </div>
          <div style={{ flex: 0.8 }}>
            <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>Min</label>
            <input
              type="number"
              min="5"
              max="240"
              value={form.durationMin}
              onChange={e => setForm({ ...form, durationMin: Number(e.target.value) || 30 })}
              className="jost"
              style={{ width: "100%", padding: "5px 10px", fontSize: 12, border: "1px solid rgba(184,160,212,0.3)", borderRadius: 7, background: "rgba(255,255,255,0.7)" }}
            />
          </div>
        </div>
        {/* Start date — only meaningful for cadences with parity (biweekly) or
            for monthly meetings where the user wants to defer the first occurrence.
            For weekly + daily cadences, the next matching weekday IS the start. */}
        {(() => {
          const dow = form.dayOfWeek || "";
          const isBiweekly = typeof dow === "string" && dow.startsWith("biweekly-");
          const isMonthly = typeof dow === "string" && dow.startsWith("monthly-");
          if (!isBiweekly && !isMonthly) return null;
          const today = new Date().toISOString().slice(0, 10);
          return (
            <div>
              <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>
                Starts on
                <span style={{ fontStyle: "italic", color: "rgba(74,53,64,0.4)", marginLeft: 6 }}>
                  {isBiweekly ? "(picks the parity — every other week from this date)" : "(skip until this date)"}
                </span>
              </label>
              <input
                type="date"
                value={form.startDate || today}
                min={today}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
                className="jost"
                style={{ width: "100%", padding: "6px 10px", fontSize: 12, border: "1px solid rgba(184,160,212,0.3)", borderRadius: 7, background: "rgba(255,255,255,0.7)" }}
              />
            </div>
          );
        })()}
        <div>
          <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>Note (optional)</label>
          <input
            value={form.note}
            onChange={e => setForm({ ...form, note: e.target.value })}
            placeholder="e.g. status update with the team"
            className="jost"
            style={{ width: "100%", padding: "6px 10px", fontSize: 12, border: "1px solid rgba(184,160,212,0.3)", borderRadius: 7, background: "rgba(255,255,255,0.7)" }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} className="btn ghost jost" style={{ fontSize: 11, padding: "5px 12px" }}>cancel</button>
          <button onClick={onSave} disabled={!form.title.trim()} className="btn rose jost" style={{ fontSize: 11, padding: "5px 14px", opacity: form.title.trim() ? 1 : 0.4 }}>save</button>
        </div>
      </div>
    </div>
  );
}

// ── SchedulePanel ────────────────────────────────────────────────────────────
// Manages BOTH one-off scheduled meetings (data.scheduledMeetings) and recurring
// meetings (data.recurringMeetings). Used inside the Meetings tab's "Schedule"
// subtab so Lexy can log meetings ahead of time and have them auto-pull into
// the roadmap when she does her morning check-in.
function SchedulePanel({ data, onUpdate, onShowRecurringModal }) {
  const scheduled = data.scheduledMeetings || [];
  const recurring = data.recurringMeetings || [];
  const upcoming = useMemo(() => getUpcomingScheduledMeetings(scheduled), [scheduled]);

  const [editing, setEditing] = useState(null); // null | "new" | id of scheduled meeting
  const [flash, setFlash] = useState(""); // brief confirmation after save
  const formRef = useRef(null);
  const todayISO = todayStr();
  const tomorrowISO = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();
  const [form, setForm] = useState({ title: "", date: tomorrowISO, startTime: "09:00", durationMin: 30, note: "" });

  const showFlash = (msg) => {
    setFlash(msg);
    setTimeout(() => setFlash(""), 2200);
  };

  const startNew = () => {
    setForm({ title: "", date: tomorrowISO, startTime: "09:00", durationMin: 30, note: "" });
    setEditing("new");
  };
  const startEdit = (sm) => {
    setForm({
      title: sm.title || "",
      date: sm.date || tomorrowISO,
      startTime: sm.startTime || "09:00",
      durationMin: sm.durationMin || 30,
      note: sm.note || "",
    });
    setEditing(sm.id);
  };
  const saveForm = () => {
    if (!form.title.trim() || !form.date) return false;
    if (editing === "new") {
      const newSm = { id: uid(), ...form, title: form.title.trim(), createdAt: Date.now() };
      onUpdate({ ...data, scheduledMeetings: [...scheduled, newSm] });
      showFlash("✓ Meeting saved");
    } else {
      onUpdate({
        ...data,
        scheduledMeetings: scheduled.map(sm => sm.id === editing ? { ...sm, ...form, title: form.title.trim() } : sm),
      });
      showFlash("✓ Meeting updated");
    }
    // Reset form so the next add starts clean
    setForm({ title: "", date: tomorrowISO, startTime: "09:00", durationMin: 30, note: "" });
    setEditing(null);
    return true;
  };
  const cancelEdit = () => {
    setForm({ title: "", date: tomorrowISO, startTime: "09:00", durationMin: 30, note: "" });
    setEditing(null);
  };
  const deleteScheduled = (id) => {
    if (!window.confirm("Delete this scheduled meeting?")) return;
    onUpdate({ ...data, scheduledMeetings: scheduled.filter(sm => sm.id !== id) });
    showFlash("Meeting removed");
  };

  // Click-outside the form: if title + date are filled, save; otherwise cancel.
  useEffect(() => {
    if (!editing) return;
    const handler = (e) => {
      if (!formRef.current) return;
      if (formRef.current.contains(e.target)) return;
      // Ignore clicks on edit/delete buttons inside the list (they have their own behavior)
      // Ignore clicks on confirm dialogs
      if (form.title.trim() && form.date) {
        saveForm();
      } else {
        cancelEdit();
      }
    };
    // Slight delay so the click that opened the form doesn't immediately close it
    const t = setTimeout(() => {
      document.addEventListener("mousedown", handler);
    }, 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, form.title, form.date, form.startTime, form.durationMin, form.note]);

  // Display helpers
  const fmtTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  };
  const fmtDate = (dateISO) => {
    if (!dateISO) return "";
    const [y, m, d] = dateISO.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    if (dateISO === todayISO) return "Today";
    if (dateISO === tomorrowISO) return "Tomorrow";
    return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };
  const dowLabel = formatRecurringDayOfWeek;

  return (
    <>
      {/* Context card */}
      <div className="card" style={{ padding: "14px 18px", marginBottom: 12, background: "rgba(253,240,245,0.5)" }}>
        <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.7)", fontStyle: "italic", lineHeight: 1.55 }}>
          Log meetings ahead of time and they'll automatically pull into your roadmap on the day they happen — no need to retype them at check-in. 🌸
        </div>
      </div>

      {/* Flash confirmation */}
      {flash && (
        <div className="fade" style={{ padding: "8px 14px", marginBottom: 10, background: "rgba(158,184,154,0.12)", border: "1px solid rgba(158,184,154,0.35)", borderRadius: 8, textAlign: "center" }}>
          <span className="jost" style={{ fontSize: 12, color: "#7a9e78", fontWeight: 600 }}>{flash}</span>
        </div>
      )}

      {/* ── Upcoming one-off meetings ── */}
      <div className="card" style={{ padding: "16px 20px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Calendar size={16} color="#d4829a" />
          <div className="cg" style={{ fontSize: 17, fontWeight: 600, color: "#4a3540" }}>Upcoming meetings</div>
          <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.45)", fontStyle: "italic", marginLeft: "auto" }}>
            {upcoming.length === 0 ? "none scheduled" : `${upcoming.length} scheduled`}
          </span>
        </div>

        {upcoming.length === 0 && editing !== "new" && (
          <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.45)", textAlign: "center", padding: "16px 8px", fontStyle: "italic", margin: 0 }}>
            Nothing on the calendar yet. Tap below to log one. ✦
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: editing === "new" || upcoming.length > 0 ? 10 : 0 }}>
          {upcoming.map(sm => (
            <div key={sm.id}>
              {editing === sm.id ? (
                <div ref={formRef}>
                  <ScheduledMeetingForm form={form} setForm={setForm} onSave={saveForm} onCancel={cancelEdit} />
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.5)", border: "1px solid rgba(212,130,154,0.18)", borderRadius: 9 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="jost" style={{ fontSize: 13, color: "#4a3540", fontWeight: 500, lineHeight: 1.3 }}>{sm.title}</div>
                    <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)", marginTop: 2 }}>
                      {fmtDate(sm.date)} · {fmtTime(sm.startTime)} · {sm.durationMin || 30}m
                      {sm.note ? <span style={{ marginLeft: 6, fontStyle: "italic", color: "rgba(74,53,64,0.4)" }}>· {sm.note}</span> : null}
                    </div>
                  </div>
                  <button onClick={() => startEdit(sm)} className="btn ghost jost" style={{ fontSize: 10, padding: "4px 10px" }}>edit</button>
                  <button onClick={() => deleteScheduled(sm.id)} className="jost" style={{ background: "none", border: "none", color: "rgba(184,109,133,0.5)", cursor: "pointer", fontSize: 13, padding: "0 4px" }}>×</button>
                </div>
              )}
            </div>
          ))}
          {editing === "new" && (
            <div ref={formRef}>
              <ScheduledMeetingForm form={form} setForm={setForm} onSave={saveForm} onCancel={cancelEdit} />
            </div>
          )}
        </div>

        {editing !== "new" && (
          <button
            onClick={startNew}
            className="jost"
            style={{ width: "100%", background: "rgba(255,255,255,0.5)", border: "1px dashed rgba(212,130,154,0.35)", borderRadius: 9, padding: "8px 10px", fontSize: 12, color: "#b86d85", cursor: "pointer", textAlign: "center", fontWeight: 500 }}
          >+ Log a meeting</button>
        )}
      </div>

      {/* ── Recurring meetings (compact summary + manage button) ── */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <RefreshCw size={15} color="#9878b8" />
          <div className="cg" style={{ fontSize: 17, fontWeight: 600, color: "#4a3540" }}>Recurring meetings</div>
          <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.45)", fontStyle: "italic", marginLeft: "auto" }}>
            {recurring.length === 0 ? "none set up" : `${recurring.length} set up`}
          </span>
        </div>

        {recurring.length === 0 ? (
          <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.45)", textAlign: "center", padding: "12px 8px", fontStyle: "italic", margin: 0, marginBottom: 10 }}>
            No standing meetings yet — set them up so they show on every check-in. ✦
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
            {recurring.slice(0, 6).map(rm => (
              <div key={rm.id} style={{ padding: "8px 12px", background: "rgba(184,160,212,0.06)", border: "1px solid rgba(184,160,212,0.15)", borderRadius: 8 }}>
                <div className="jost" style={{ fontSize: 12.5, color: "#4a3540", fontWeight: 500 }}>{rm.title}</div>
                <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)", marginTop: 2 }}>
                  {dowLabel(rm.dayOfWeek)} · {fmtTime(rm.startTime)} · {rm.durationMin}m
                </div>
              </div>
            ))}
            {recurring.length > 6 && (
              <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.4)", fontStyle: "italic", textAlign: "center", paddingTop: 4 }}>
                +{recurring.length - 6} more…
              </div>
            )}
          </div>
        )}

        <button
          onClick={onShowRecurringModal}
          className="jost"
          style={{ width: "100%", background: "rgba(184,160,212,0.08)", border: "1px solid rgba(184,160,212,0.3)", borderRadius: 9, padding: "8px 10px", fontSize: 12, color: "#9878b8", cursor: "pointer", textAlign: "center", fontWeight: 600 }}
        >
          {recurring.length === 0 ? "+ Add recurring meeting" : "Manage recurring meetings →"}
        </button>
      </div>
    </>
  );
}

function ScheduledMeetingForm({ form, setForm, onSave, onCancel }) {
  return (
    <div style={{ background: "rgba(212,130,154,0.06)", border: "1px solid rgba(212,130,154,0.3)", borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>Title</label>
          <input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Vendor sync with Corelation"
            className="jost"
            style={{ width: "100%", padding: "6px 10px", fontSize: 13, border: "1px solid rgba(212,130,154,0.3)", borderRadius: 7, background: "rgba(255,255,255,0.7)" }}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1.4 }}>
            <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className="jost"
              style={{ width: "100%", padding: "5px 10px", fontSize: 12, border: "1px solid rgba(212,130,154,0.3)", borderRadius: 7, background: "rgba(255,255,255,0.7)" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>Start</label>
            <input
              type="time"
              value={form.startTime}
              onChange={e => setForm({ ...form, startTime: e.target.value })}
              className="jost"
              style={{ width: "100%", padding: "5px 10px", fontSize: 12, border: "1px solid rgba(212,130,154,0.3)", borderRadius: 7, background: "rgba(255,255,255,0.7)" }}
            />
          </div>
          <div style={{ flex: 0.8 }}>
            <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>Min</label>
            <input
              type="number"
              min="5"
              max="240"
              value={form.durationMin}
              onChange={e => setForm({ ...form, durationMin: Number(e.target.value) || 30 })}
              className="jost"
              style={{ width: "100%", padding: "5px 10px", fontSize: 12, border: "1px solid rgba(212,130,154,0.3)", borderRadius: 7, background: "rgba(255,255,255,0.7)" }}
            />
          </div>
        </div>
        <div>
          <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>Note (optional)</label>
          <input
            value={form.note}
            onChange={e => setForm({ ...form, note: e.target.value })}
            placeholder="e.g. quick status check"
            className="jost"
            style={{ width: "100%", padding: "6px 10px", fontSize: 13, border: "1px solid rgba(212,130,154,0.3)", borderRadius: 7, background: "rgba(255,255,255,0.7)" }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button onClick={onSave} disabled={!form.title.trim() || !form.date} className="btn rose jost" style={{ fontSize: 11, padding: "6px 14px", flex: 1, opacity: !form.title.trim() || !form.date ? 0.4 : 1, cursor: !form.title.trim() || !form.date ? "not-allowed" : "pointer" }}>Save</button>
          <button onClick={onCancel} className="btn ghost jost" style={{ fontSize: 11, padding: "6px 14px" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Chat Panel ────────────────────────────────────────────────────────────────
// If `data` and `onDataUpdate` are passed, Rosie gets real tools.
function ChatPanel({ systemPrompt, placeholder, greeting, data, onDataUpdate, focusedItemId }) {
  const toolsEnabled = !!(data && onDataUpdate);
  const initialGreeting = greeting || (toolsEnabled
    ? "Hey! 🌸 I'm Rosie — your work bestie. I can actually add items, park things, catch spirals, and check off tasks for you now. Just ask. What's going on?"
    : "Hey! 🌸 I'm Rosie — your work bestie. Here to keep you focused and on track. What's going on?");
  const [msgs, setMsgs] = useState([{ role: "assistant", content: initialGreeting }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const dataRef = useRef(data);
  const bottomRef = useRef(null);
  useEffect(() => { dataRef.current = data; }, [data]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    const userMsg = { role: "user", content: userText };
    const updated = [...msgs, userMsg];
    setMsgs(updated); setInput(""); setLoading(true);

    // INTERCEPT: Detect if user pasted a structured list. If so, parse it
    // deterministically and add tasks directly — bypassing Rosie's flaky
    // tool-call behavior. This catches the "monthly task list" pattern.
    if (toolsEnabled && focusedItemId) {
      const parsed = detectAndParseList(userText);
      if (parsed && parsed.entries && parsed.entries.length >= 3) {
        const latest = dataRef.current;
        const focusItem = (latest.items || []).find(i => i.id === focusedItemId);
        if (focusItem) {
          const actions = [];
          let working = latest;
          for (const entry of parsed.entries) {
            const result = executeRosieTool("add_task_to_item", {
              itemTitleMatch: focusItem.title,
              taskTitle: entry.taskTitle,
            }, working);
            working = result.data;
            // If a date was parsed, set it on the new task too
            if (entry.date) {
              const updItem = working.items.find(i => i.id === focusItem.id);
              if (updItem) {
                const taskIdx = (updItem.tasks || []).indexOf(entry.taskTitle);
                if (taskIdx >= 0) {
                  const newTaskDates = [...(updItem.taskDates || [])];
                  while (newTaskDates.length <= taskIdx) newTaskDates.push({ date: "", notToday: false, fixed: false });
                  newTaskDates[taskIdx] = { date: entry.date, notToday: false, fixed: false };
                  working = { ...working, items: working.items.map(i => i.id === focusItem.id ? { ...updItem, taskDates: newTaskDates } : i) };
                }
              }
            }
            actions.push(`✓ ${entry.taskTitle}${entry.date ? ` · ${fmtDateLabel(entry.date)}` : ""}`);
          }
          dataRef.current = working;
          onDataUpdate(working);
          // Build a warm summary
          const summary = parsed.kind === "monthly_tasks"
            ? `Added ${actions.length} tasks with month-end due dates to "${focusItem.title}" 🌸`
            : `Added ${actions.length} tasks to "${focusItem.title}" 🌸`;
          setMsgs(prev => [
            ...prev,
            { role: "system-action", content: actions.join(" • ") },
            { role: "assistant", content: summary },
          ]);
          setLoading(false);
          return;
        }
      }
    }

    // Convert chat history to API format, filtering out non-text display entries
    const apiMessages = updated
      .filter(m => typeof m.content === "string")
      .filter(m => m.role === "user" || m.role === "assistant") // strip system-action / system-warning display-only entries
      .map(m => ({ role: m.role, content: m.content }));

    try {
      if (toolsEnabled) {
        // Wrap onDataUpdate so tool loop writes are immediately visible to
        // getLatestData() within the same run (before React re-renders).
        const syncedUpdate = (next) => {
          dataRef.current = next;
          onDataUpdate(next);
        };

        // Retry up to 3 times with exponential backoff if calls throw
        // (network blip, rate limit, parse error, etc.)
        let result = null;
        let lastError = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            result = await askRosieWithTools({
              messages: apiMessages,
              systemPrompt,
              getLatestData: () => dataRef.current,
              onDataUpdate: syncedUpdate,
              focusedItemId,
            });
            break;
          } catch (err) {
            lastError = err;
            console.warn(`[Rosie] attempt ${attempt + 1} failed:`, err);
            if (attempt < 2) await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt))); // 500ms, 1s
          }
        }
        if (!result) {
          throw lastError || new Error("Rosie unreachable");
        }
        const { text, actions } = result;

        // Hallucination guard: if Rosie's reply CLAIMS an action but no tools fired, flag it
        const claimsAction = /\b(added|adding|created|creating|checked off|moved|updated|tagged|caught|parked)\b/i.test(text);
        const lookedLikeRequest = /\b(add|create|park|catch|check off|mark|move|update|track|tag)\b/i.test(userText || "");
        const possibleHallucination = claimsAction && lookedLikeRequest && actions.length === 0;
        setMsgs(prev => [
          ...prev,
          ...(actions.length ? [{ role: "system-action", content: actions.join(" • ") }] : []),
          { role: "assistant", content: text },
          ...(possibleHallucination ? [{ role: "system-warning", content: "⚠️ Rosie said she did something but didn't actually call a tool. Try rephrasing — e.g. 'add a task called X to my Verafin item'." }] : []),
        ]);
      } else {
        const reply = await askRosie(apiMessages, systemPrompt);
        setMsgs(prev => [...prev, { role: "assistant", content: reply }]);
      }
    } catch (err) {
      console.warn("[Rosie chat] final failure:", err);
      const errMsg = focusedItemId
        ? "Couldn't reach Rosie just now. Tip — for adding subtasks, the 📋 Paste List button up top works without needing the chat. 🌸"
        : "Couldn't reach Rosie just now — try once more? 🌸";
      setMsgs(prev => [...prev, { role: "assistant", content: errMsg }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }}>
        {msgs.map((m, i) => {
          if (m.role === "system-action") {
            return (
              <div key={i} className="jost fade" style={{ alignSelf: "center", fontSize: 11, color: "#7a9e78", background: "rgba(158,184,154,0.12)", border: "1px solid rgba(158,184,154,0.25)", borderRadius: 12, padding: "6px 12px", maxWidth: "92%", textAlign: "center" }}>{m.content}</div>
            );
          }
          if (m.role === "system-warning") {
            return (
              <div key={i} className="jost fade" style={{ alignSelf: "center", fontSize: 11, color: "#c4687a", background: "rgba(212,100,120,0.08)", border: "1px solid rgba(212,100,120,0.3)", borderRadius: 12, padding: "8px 14px", maxWidth: "92%", textAlign: "center", lineHeight: 1.5 }}>{m.content}</div>
            );
          }
          return (
            <div key={i} className="chat-bubble jost" style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", background: m.role === "user" ? "linear-gradient(135deg,#e8a0b4,#d4687f)" : "rgba(255,255,255,0.95)", color: m.role === "user" ? "#fff" : "#4a3540", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", boxShadow: "0 2px 12px rgba(212,100,130,0.1)", border: m.role === "assistant" ? "1px solid rgba(212,130,154,0.15)" : "none" }}>{m.content}</div>
          );
        })}
        {loading && <div className="pulse jost" style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.95)", border: "1px solid rgba(212,130,154,0.15)", borderRadius: "18px 18px 18px 4px", padding: "11px 15px", fontSize: 13, color: "rgba(196,120,142,0.5)" }}>Rosie is {toolsEnabled ? "working on it" : "typing"}…</div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: "1px solid rgba(212,130,154,0.12)" }}>
        <textarea className="ifield jost" rows={2} style={{ resize: "none" }} placeholder={placeholder || "Talk to Rosie…"} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
        <button className="btn rose" onClick={send} style={{ padding: "0 16px", fontSize: 18, alignSelf: "stretch" }}>↑</button>
      </div>
    </div>
  );
}

// ── Check-In ──────────────────────────────────────────────────────────────────
function CheckIn({ onComplete, streak, data, onUpdateData }) {
  const [energy, setEnergy] = useState(null);
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState("");
  // Inline meeting form — handles BOTH one-off and recurring kinds. Toggle
  // at top switches between the two; the only field that differs is "When"
  // (shown only for recurring). On save:
  //   - one-off → writes to data.scheduledMeetings (date=today)
  //   - recurring → writes to data.recurringMeetings (with dayOfWeek)
  // The new meeting appears in the "Today's meetings" checklist above if
  // it matches today; otherwise a brief toast confirms the save.
  const [meetingKind, setMeetingKind] = useState("oneoff"); // "oneoff" | "recurring"
  const [meetingForm, setMeetingForm] = useState({ title: "", startTime: "09:00", durationMin: 30, note: "", dayOfWeek: "daily" });
  const [meetingToast, setMeetingToast] = useState(""); // brief confirmation when a recurring save doesn't appear today
  const [showMeetingsField, setShowMeetingsField] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);

  // Compute today's recurring meetings + a Set of which are checked (default: all checked)
  const todayRecurring = useMemo(() => getRecurringMeetingsForToday(data?.recurringMeetings), [data?.recurringMeetings]);
  // Also compute today's one-off scheduled meetings (logged ahead via the Meetings tab)
  const todayScheduled = useMemo(() => getScheduledMeetingsForToday(data?.scheduledMeetings), [data?.scheduledMeetings]);
  // Combined list — recurring first, then one-offs, both with stable ids for the checkbox state
  const todayMeetings = useMemo(
    () => [
      ...todayRecurring.map(rm => ({ ...rm, _kind: "recurring" })),
      ...todayScheduled.map(sm => ({ ...sm, _kind: "scheduled" })),
    ],
    [todayRecurring, todayScheduled]
  );
  const [checkedIds, setCheckedIds] = useState(() => new Set(todayMeetings.map(m => m.id)));
  // When the list changes (e.g. user adds one in the modal), include any new ones as checked
  useEffect(() => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      for (const m of todayMeetings) {
        if (!next.has(m.id) && !prev.has(m.id)) next.add(m.id);
      }
      return next;
    });
  }, [todayMeetings.length]);

  const toggleChecked = (id) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Human-friendly label for a recurring meeting's dayOfWeek — used in the
  // save-confirmation toast for recurring meetings that don't appear today.
  const describeRecurring = (dayOfWeek) => {
    if (dayOfWeek === "daily") return "Mon–Fri";
    const dayNames = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];
    if (/^\d+$/.test(String(dayOfWeek))) return dayNames[Number(dayOfWeek)] || "matching days";
    const s = String(dayOfWeek);
    if (s.startsWith("biweekly-")) {
      const dow = Number(s.split("-")[1]);
      const singular = (dayNames[dow] || "day").replace(/s$/, "");
      return `every other ${singular}`;
    }
    if (s.startsWith("monthly-day-")) {
      const part = s.split("-")[2];
      if (part === "last") return "the last day of each month";
      const n = Number(part);
      const suffix = n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
      return `the ${n}${suffix} of each month`;
    }
    if (s.startsWith("monthly-")) return "matching monthly days";
    return "matching days";
  };

  // Unified save handler — branches on kind.
  const saveMeeting = () => {
    const title = meetingForm.title.trim();
    if (!title || !onUpdateData) return;
    if (meetingKind === "oneoff" || meetingKind === "appointment") {
      const todayDate = (() => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      })();
      const newSm = {
        id: uid(),
        title,
        date: todayDate,
        startTime: meetingForm.startTime || "09:00",
        durationMin: Math.max(5, Math.min(240, Number(meetingForm.durationMin) || 30)),
        note: (meetingForm.note || "").trim(),
        kind: meetingKind, // "oneoff" | "appointment" — distinguishes in display
        createdAt: Date.now(),
      };
      onUpdateData({ ...data, scheduledMeetings: [...(data?.scheduledMeetings || []), newSm] });
    } else {
      // Recurring — normalize dayOfWeek: numeric strings become real numbers
      // (matches existing data shape), special strings ("daily", "biweekly-",
      // "monthly-") pass through unchanged.
      let dow = meetingForm.dayOfWeek;
      if (typeof dow === "string" && /^\d+$/.test(dow)) dow = Number(dow);
      const newRm = {
        id: uid(),
        title,
        dayOfWeek: dow,
        startTime: meetingForm.startTime || "09:00",
        durationMin: Math.max(5, Math.min(240, Number(meetingForm.durationMin) || 30)),
        note: (meetingForm.note || "").trim(),
      };
      onUpdateData({ ...data, recurringMeetings: [...(data?.recurringMeetings || []), newRm] });
      // If this recurring meeting doesn't fire today, show a brief
      // confirmation toast so the user knows the save worked even though
      // it won't appear in the checklist above.
      const firesToday = recurringMeetingFiresOn(newRm, new Date());
      if (!firesToday) {
        setMeetingToast(`✓ Saved — will appear on ${describeRecurring(meetingForm.dayOfWeek)}`);
        setTimeout(() => setMeetingToast(""), 4000);
      }
    }
    // Clear form, ready for the next add. Keep the kind toggle on its
    // current setting (user might want to add several of the same type).
    setMeetingForm({ title: "", startTime: "09:00", durationMin: 30, note: "", dayOfWeek: "daily" });
  };

  const submit = () => {
    if (!energy) return;
    // Build the combined meetings text from the checked items in the
    // Today's meetings checklist. The inline one-off form writes to
    // data.scheduledMeetings, which is already pulled into todayMeetings —
    // so structured one-offs flow through here automatically. No more
    // separate paste-text path.
    const meetingLines = todayMeetings
      .filter(m => checkedIds.has(m.id))
      .map(m => formatRecurringForPaste(m)) // works for both — same shape
      .filter(Boolean);
    const combinedMeetings = meetingLines.join("\n");
    onComplete({ energy, mood, note, meetingsText: combinedMeetings });
  };

  return (
    <div className="fade" style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div className="jost" style={{ fontSize: 10, letterSpacing: 3, color: "rgba(212,130,154,0.7)", textTransform: "uppercase", marginBottom: 8 }}>daily check-in with Rosie</div>
        <h1 className="cg" style={{ fontSize: 40, color: "#4a3540", fontWeight: 400, lineHeight: 1.1 }}>How are we <span style={{ color: "#d4829a", fontStyle: "italic" }}>today?</span></h1>
        <p className="jost" style={{ marginTop: 10, color: "rgba(74,53,64,0.45)", fontSize: 14 }}>This helps me show you the right things and protect your energy. 🌸</p>
        {streak > 0 && (
          <div className="streak-pill" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,160,60,0.1)", border: "1px solid rgba(255,160,60,0.25)", borderRadius: 20, padding: "6px 14px", marginTop: 12 }}>
            <span style={{ fontSize: 16 }}>🔥</span>
            <span className="jost" style={{ fontSize: 13, color: "#e08030", fontWeight: 600 }}>{streak} day streak — keep it going!</span>
          </div>
        )}
      </div>
      <div className="card" style={{ padding: "24px", marginBottom: 16 }}>
        <label className="sl jost">Energy level</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {ENERGY_LEVELS.map(e => (
            <div key={e.key} className="energy-btn" onClick={() => setEnergy(e.key)} style={{ background: energy === e.key ? `${e.color}18` : "rgba(255,255,255,0.6)", border: `2px solid ${energy === e.key ? e.color : "rgba(212,130,154,0.15)"}` }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{e.emoji}</div>
              <div className="jost" style={{ fontSize: 13, fontWeight: 600, color: "#4a3540" }}>{e.label}</div>
              <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.45)", marginTop: 2 }}>{e.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ padding: "24px", marginBottom: 16 }}>
        <label className="sl jost">Mood right now (optional)</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {MOODS.map(m => (
            <div key={m.key} className="mood-btn" onClick={() => setMood(mood === m.key ? null : m.key)} style={{ background: mood === m.key ? "rgba(212,130,154,0.15)" : "rgba(255,255,255,0.6)", border: `2px solid ${mood === m.key ? "#d4829a" : "rgba(212,130,154,0.15)"}` }}>
              <div style={{ fontSize: 20 }}>{m.emoji}</div>
              <div className="jost" style={{ fontSize: 11, color: "#4a3540", marginTop: 3 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ padding: "20px 24px", marginBottom: 16 }}>
        <label className="sl jost">Anything Rosie should know? (optional)</label>
        <input className="ifield" placeholder="e.g. rough morning, big deadline, running late…" value={note} onChange={e => setNote(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
        {/* Carryover items — when yesterday's EOD detected items you didn't
            touch, surface them here with "pull forward" or "skip" options. */}
        {onUpdateData && (() => {
          const carryoverIds = data?.tomorrowCarryover || [];
          const generatedAt = data?.tomorrowCarryoverGeneratedAt || 0;
          // Only show if generated within the last 24 hours (yesterday's EOD)
          if (!Array.isArray(carryoverIds) || carryoverIds.length === 0) return null;
          if (Date.now() - generatedAt > 36 * 60 * 60 * 1000) return null; // stale > 36h
          const items = (data.items || []).filter(i => carryoverIds.includes(i.id) && isActiveStatus(i.status));
          if (items.length === 0) return null;
          const todayISO = new Date().toISOString().slice(0, 10);
          const pullForward = (itemId) => {
            const newItems = (data.items || []).map(i =>
              i.id === itemId ? { ...i, scheduledDate: todayISO, lastUpdatedAt: Date.now() } : i
            );
            const newCarryover = carryoverIds.filter(id => id !== itemId);
            onUpdateData({ ...data, items: newItems, tomorrowCarryover: newCarryover });
          };
          const skipCarryover = (itemId) => {
            const newCarryover = carryoverIds.filter(id => id !== itemId);
            onUpdateData({ ...data, tomorrowCarryover: newCarryover });
          };
          const dismissAll = () => {
            onUpdateData({ ...data, tomorrowCarryover: [] });
          };
          return (
            <div style={{ marginTop: 12, padding: "12px 14px", background: "rgba(125,154,175,0.06)", border: "1px solid rgba(125,154,175,0.25)", borderRadius: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div className="jost" style={{ fontSize: 11, color: "#5e7e95", fontWeight: 600 }}>
                  🌿 {items.length} item{items.length === 1 ? "" : "s"} from yesterday — pull forward?
                </div>
                <button onClick={dismissAll} className="jost" style={{ background: "none", border: "none", color: "rgba(94,126,149,0.5)", fontSize: 10, cursor: "pointer", padding: 0 }}>dismiss all</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "rgba(255,255,255,0.55)", borderRadius: 7 }}>
                    <span className="jost" style={{ flex: 1, fontSize: 12, color: "#4a3540", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</span>
                    <button
                      onClick={() => pullForward(item.id)}
                      className="jost"
                      style={{
                        background: "rgba(212,130,154,0.15)",
                        border: "1px solid rgba(212,130,154,0.4)",
                        color: "#b86d85",
                        fontSize: 10, padding: "3px 9px", borderRadius: 6, cursor: "pointer", fontWeight: 600,
                      }}
                    >→ Today</button>
                    <button
                      onClick={() => skipCarryover(item.id)}
                      className="jost"
                      style={{
                        background: "none",
                        border: "1px solid rgba(74,53,64,0.15)",
                        color: "rgba(74,53,64,0.5)",
                        fontSize: 10, padding: "3px 9px", borderRadius: 6, cursor: "pointer",
                      }}
                    >Skip</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
        {/* "One thing for tomorrow" from yesterday's EOD reflection — surfaces
            as a soft suggestion the user can click to populate their note. */}
        {(() => {
          const reflections = data?.eodReflections || {};
          // Find the most recent date with a "tomorrow" reflection (not today)
          const todayISO = new Date().toISOString().slice(0, 10);
          const recentTomorrow = Object.entries(reflections)
            .filter(([d, r]) => d !== todayISO && r?.tomorrow)
            .sort(([a], [b]) => b.localeCompare(a))[0];
          if (!recentTomorrow) return null;
          const [, ref] = recentTomorrow;
          if (note) return null; // user already typed something, don't override
          return (
            <button
              onClick={() => setNote(ref.tomorrow)}
              className="jost fade"
              style={{
                marginTop: 8, padding: "6px 10px",
                background: "rgba(212,130,154,0.06)",
                border: "1px dashed rgba(212,130,154,0.3)",
                color: "#b86d85",
                fontSize: 11, borderRadius: 7,
                cursor: "pointer", textAlign: "left",
                width: "100%",
                fontStyle: "italic",
              }}
              title="From last EOD reflection — click to use as today's note"
            >🌅 From yesterday: "{ref.tomorrow}"</button>
          );
        })()}
        {/* Include follow-ups toggle. Defaults to on. When on, Rosie scans for
            waiting/hold items + verb-tagged subtasks and injects a 3:30 PM
            follow-ups slot with pre-drafted messages. */}
        {onUpdateData && (() => {
          const includeFollowUps = data?.preferences?.includeFollowUps !== false;
          const toggleFollowUps = () => {
            const next = !includeFollowUps;
            onUpdateData({
              ...data,
              preferences: { ...(data?.preferences || {}), includeFollowUps: next },
            });
          };
          return (
            <div
              onClick={toggleFollowUps}
              role="checkbox"
              aria-checked={includeFollowUps}
              style={{
                marginTop: 12,
                padding: "10px 12px",
                background: includeFollowUps ? "rgba(158,184,154,0.12)" : "rgba(74,53,64,0.04)",
                border: `1px solid ${includeFollowUps ? "rgba(158,184,154,0.35)" : "rgba(74,53,64,0.1)"}`,
                borderRadius: 9,
                cursor: "pointer",
                display: "flex", alignItems: "flex-start", gap: 10,
                transition: "all .15s",
              }}
            >
              <div
                style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
                  background: includeFollowUps ? "linear-gradient(135deg,#9eb89a,#7a9e78)" : "transparent",
                  border: `1.5px solid ${includeFollowUps ? "transparent" : "rgba(74,53,64,0.25)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 11, fontWeight: 700,
                }}
              >{includeFollowUps ? "✓" : ""}</div>
              <div style={{ flex: 1 }}>
                <div className="jost" style={{ fontSize: 12, color: "#4a3540", fontWeight: 500, marginBottom: 2 }}>
                  ✉️ Include follow-ups for today
                </div>
                <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.55)", lineHeight: 1.4 }}>
                  Reviews waiting/hold items + scans for messages to send. Rosie pre-drafts them in a 3:30 PM slot.
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Today's meetings checklist — recurring + one-off scheduled */}
      <div className="card" style={{ padding: "16px 22px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: todayMeetings.length ? 10 : 0 }}>
          <label className="sl jost" style={{ marginBottom: 0 }}>
            📅 Today's meetings
            {todayMeetings.length > 0 && <span style={{ color: "rgba(74,53,64,0.4)", fontWeight: 400 }}> · {checkedIds.size} of {todayMeetings.length}</span>}
          </label>
          <button
            onClick={() => setShowRecurringModal(true)}
            className="jost"
            style={{ background: "none", border: "none", color: "#9878b8", fontSize: 11, cursor: "pointer", padding: 0, fontWeight: 500 }}
          >manage</button>
        </div>
        {todayMeetings.length === 0 ? (
          <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.45)", margin: 0, fontStyle: "italic" }}>
            Nothing on today's calendar. <button onClick={() => setShowRecurringModal(true)} className="jost" style={{ background: "none", border: "none", color: "#b86d85", cursor: "pointer", fontSize: 11, padding: 0, textDecoration: "underline" }}>Add some</button> in the Meetings tab so they auto-pull each morning.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {todayMeetings.map(m => {
              const isChecked = checkedIds.has(m.id);
              const isOneOff = m._kind === "scheduled";
              const isAppointment = isOneOff && m.kind === "appointment";
              // Background tint by type when checked: appointment = sage,
              // one-off meeting = rose, recurring = lavender
              const checkedBg = !isChecked ? "transparent"
                : isAppointment ? "rgba(158,184,154,0.08)"
                : isOneOff ? "rgba(212,130,154,0.06)"
                : "rgba(184,160,212,0.06)";
              const accent = isAppointment ? "#7a9e78" : isOneOff ? "#d4829a" : "#9878b8";
              return (
                <label key={m.id} className="jost" style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", cursor: "pointer", borderRadius: 7, background: checkedBg }}>
                  <input type="checkbox" checked={isChecked} onChange={() => toggleChecked(m.id)} style={{ accentColor: accent, cursor: "pointer" }} />
                  <span style={{ fontSize: 12, color: isChecked ? "#4a3540" : "rgba(74,53,64,0.5)", fontWeight: 500, flex: 1 }}>
                    {isAppointment && <span style={{ marginRight: 4 }}>📍</span>}
                    {m.title}
                    {isAppointment
                      ? <span className="jost" style={{ fontSize: 9, color: "#7a9e78", fontStyle: "italic", marginLeft: 6, fontWeight: 400 }}>· appt</span>
                      : isOneOff
                        ? <span className="jost" style={{ fontSize: 9, color: "#b86d85", fontStyle: "italic", marginLeft: 6, fontWeight: 400 }}>· one-off</span>
                        : null}
                  </span>
                  <span style={{ fontSize: 10, color: "rgba(74,53,64,0.4)" }}>{formatRecurringForPaste(m).split(" | ")[0]} · {m.durationMin}m</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Add a meeting inline — either a one-off (date=today) or a recurring
          meeting (saved by dayOfWeek). The toggle at the top switches kinds;
          a "When" dropdown appears only for recurring. After save the form
          clears and stays open so the user can add another. Recurring saves
          that don't fire today get a brief confirmation toast so the user
          knows the save worked. */}
      <div className="card" style={{ padding: "16px 22px", marginBottom: 20 }}>
        {!showMeetingsField ? (
          <button
            onClick={() => setShowMeetingsField(true)}
            className="jost"
            style={{ background: "transparent", border: "none", color: "#9878b8", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontWeight: 500, padding: 0 }}
          >
            <span>📅</span>
            <span>+ Add meeting</span>
          </button>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label className="sl jost" style={{ marginBottom: 0 }}>📅 Add meeting</label>
              <button
                onClick={() => {
                  setMeetingForm({ title: "", startTime: "09:00", durationMin: 30, note: "", dayOfWeek: "daily" });
                  setMeetingToast("");
                  setShowMeetingsField(false);
                }}
                title="Hide"
                className="jost"
                style={{ background: "none", border: "none", color: "rgba(74,53,64,0.4)", fontSize: 12, cursor: "pointer", padding: 0 }}
              >hide</button>
            </div>

            {/* Kind toggle — one-off vs appointment vs recurring */}
            <div style={{ display: "flex", gap: 4, marginBottom: 10, padding: 3, background: "rgba(74,53,64,0.04)", borderRadius: 8, border: "1px solid rgba(74,53,64,0.08)" }}>
              {[
                { key: "oneoff", label: "Meeting", emoji: "📌", color: "#d4829a", colorBg: "linear-gradient(135deg,#d4829a,#c4687a)" },
                { key: "appointment", label: "Appointment", emoji: "📍", color: "#7a9e78", colorBg: "linear-gradient(135deg,#9eb89a,#7a9e78)" },
                { key: "recurring", label: "Recurring", emoji: "🔁", color: "#9878b8", colorBg: "linear-gradient(135deg,#9878b8,#876aa3)" },
              ].map(opt => {
                const active = meetingKind === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setMeetingKind(opt.key)}
                    className="jost"
                    style={{
                      flex: 1,
                      background: active ? opt.colorBg : "transparent",
                      color: active ? "#fff" : "rgba(74,53,64,0.55)",
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 10px",
                      fontSize: 11,
                      fontWeight: active ? 600 : 500,
                      cursor: "pointer",
                      letterSpacing: 0.3,
                      transition: "all .15s",
                    }}
                  >
                    {opt.emoji} {opt.label}
                  </button>
                );
              })}
            </div>

            <p className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.4)", marginTop: 0, marginBottom: 10, lineHeight: 1.5 }}>
              {meetingKind === "oneoff"
                ? "Logged meetings appear in Today's meetings above + persist in your log. Add as many as you need — the form clears after each save."
                : meetingKind === "appointment"
                ? "Appointments block your time today (doctor, vendor, demo, etc). They appear in Today's meetings tagged 📍 so they're easy to spot."
                : "Recurring meetings auto-pull each morning on their day. Saved to your meetings log for editing later."}
            </p>

            <div style={{
              background: meetingKind === "oneoff" ? "rgba(212,130,154,0.06)"
                : meetingKind === "appointment" ? "rgba(158,184,154,0.08)"
                : "rgba(184,160,212,0.08)",
              border: meetingKind === "oneoff" ? "1px solid rgba(212,130,154,0.3)"
                : meetingKind === "appointment" ? "1px solid rgba(158,184,154,0.35)"
                : "1px solid rgba(184,160,212,0.35)",
              borderRadius: 10, padding: "12px 14px"
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>Title</label>
                  <input
                    value={meetingForm.title}
                    onChange={e => setMeetingForm({ ...meetingForm, title: e.target.value })}
                    onKeyDown={e => { if (e.key === "Enter" && meetingForm.title.trim()) saveMeeting(); }}
                    placeholder={meetingKind === "oneoff" ? "e.g. AP Mig. Project Intake"
                      : meetingKind === "appointment" ? "e.g. Dentist · Annual review · Vendor demo"
                      : "e.g. Weekly IT Sync"}
                    className="jost"
                    style={{
                      width: "100%", padding: "6px 10px", fontSize: 13,
                      border: meetingKind === "oneoff" ? "1px solid rgba(212,130,154,0.3)"
                        : meetingKind === "appointment" ? "1px solid rgba(158,184,154,0.35)"
                        : "1px solid rgba(184,160,212,0.3)",
                      borderRadius: 7, background: "rgba(255,255,255,0.7)", boxSizing: "border-box"
                    }}
                    autoFocus
                  />
                </div>

                {/* When — only shown for recurring */}
                {meetingKind === "recurring" && (
                  <div>
                    <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>When</label>
                    <select
                      value={meetingForm.dayOfWeek}
                      onChange={e => setMeetingForm({ ...meetingForm, dayOfWeek: e.target.value })}
                      className="jost"
                      style={{ width: "100%", padding: "6px 10px", fontSize: 12, border: "1px solid rgba(184,160,212,0.3)", borderRadius: 7, background: "rgba(255,255,255,0.7)", boxSizing: "border-box", cursor: "pointer" }}
                    >
                      <option value="daily">Daily (M-F)</option>
                      <optgroup label="Weekly">
                        <option value="1">Every Monday</option>
                        <option value="2">Every Tuesday</option>
                        <option value="3">Every Wednesday</option>
                        <option value="4">Every Thursday</option>
                        <option value="5">Every Friday</option>
                      </optgroup>
                      <optgroup label="Every other week">
                        <option value="biweekly-1">Every other Monday</option>
                        <option value="biweekly-2">Every other Tuesday</option>
                        <option value="biweekly-3">Every other Wednesday</option>
                        <option value="biweekly-4">Every other Thursday</option>
                        <option value="biweekly-5">Every other Friday</option>
                      </optgroup>
                      <optgroup label="Monthly (by day)">
                        <option value="monthly-day-1">1st of each month</option>
                        <option value="monthly-day-15">15th of each month</option>
                        <option value="monthly-day-last">Last day of each month</option>
                      </optgroup>
                    </select>
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>Start</label>
                    <input
                      type="time"
                      value={meetingForm.startTime}
                      onChange={e => setMeetingForm({ ...meetingForm, startTime: e.target.value })}
                      className="jost"
                      style={{
                        width: "100%", padding: "5px 10px", fontSize: 12,
                        border: meetingKind === "oneoff" ? "1px solid rgba(212,130,154,0.3)"
                          : meetingKind === "appointment" ? "1px solid rgba(158,184,154,0.35)"
                          : "1px solid rgba(184,160,212,0.3)",
                        borderRadius: 7, background: "rgba(255,255,255,0.7)", boxSizing: "border-box"
                      }}
                    />
                  </div>
                  <div style={{ flex: 0.8 }}>
                    <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>Min</label>
                    <input
                      type="number"
                      min="5"
                      max="240"
                      step="5"
                      value={meetingForm.durationMin}
                      onChange={e => setMeetingForm({ ...meetingForm, durationMin: Number(e.target.value) || 30 })}
                      className="jost"
                      style={{
                        width: "100%", padding: "5px 10px", fontSize: 12,
                        border: meetingKind === "oneoff" ? "1px solid rgba(212,130,154,0.3)"
                          : meetingKind === "appointment" ? "1px solid rgba(158,184,154,0.35)"
                          : "1px solid rgba(184,160,212,0.3)",
                        borderRadius: 7, background: "rgba(255,255,255,0.7)", boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.6)", display: "block", marginBottom: 3, fontWeight: 500 }}>
                    {meetingKind === "appointment" ? "Where / details (optional)" : "Note (optional)"}
                  </label>
                  <input
                    value={meetingForm.note}
                    onChange={e => setMeetingForm({ ...meetingForm, note: e.target.value })}
                    onKeyDown={e => { if (e.key === "Enter" && meetingForm.title.trim()) saveMeeting(); }}
                    placeholder={meetingKind === "appointment" ? "e.g. 123 Main St · Suite 4B · or just \"phone\"" : "e.g. agenda link, who's running it"}
                    className="jost"
                    style={{
                      width: "100%", padding: "5px 10px", fontSize: 12,
                      border: meetingKind === "oneoff" ? "1px solid rgba(212,130,154,0.3)"
                        : meetingKind === "appointment" ? "1px solid rgba(158,184,154,0.35)"
                        : "1px solid rgba(184,160,212,0.3)",
                      borderRadius: 7, background: "rgba(255,255,255,0.7)", boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button
                    onClick={saveMeeting}
                    disabled={!meetingForm.title.trim()}
                    className="btn jost"
                    style={{
                      background: meetingForm.title.trim()
                        ? (meetingKind === "oneoff" ? "linear-gradient(135deg,#d4829a,#c4687a)"
                          : meetingKind === "appointment" ? "linear-gradient(135deg,#9eb89a,#7a9e78)"
                          : "linear-gradient(135deg,#9878b8,#876aa3)")
                        : "rgba(212,130,154,0.2)",
                      color: meetingForm.title.trim() ? "#fff" : "rgba(74,53,64,0.4)",
                      padding: "6px 16px", fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
                      cursor: meetingForm.title.trim() ? "pointer" : "default",
                    }}
                  >✓ Save & add another</button>
                </div>
              </div>
            </div>

            {/* Brief toast after recurring save when the meeting doesn't fire today */}
            {meetingToast && (
              <div
                className="fade jost"
                style={{
                  marginTop: 10,
                  padding: "8px 12px",
                  background: "rgba(184,160,212,0.15)",
                  border: "1px solid rgba(184,160,212,0.35)",
                  borderRadius: 8,
                  fontSize: 11,
                  color: "#9878b8",
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >{meetingToast}</div>
            )}
          </>
        )}
      </div>

      <button className="btn rose jost" onClick={submit} disabled={!energy} style={{ width: "100%", padding: "14px", fontSize: 15, opacity: energy ? 1 : 0.4 }}>Let's get to it ✦</button>

      {showRecurringModal && (
        <RecurringMeetingsModal data={data} onUpdate={onUpdateData} onClose={() => setShowRecurringModal(false)} />
      )}
    </div>
  );
}

// ─── ReminderRow ─────────────────────────────────────────────────────────────
// One reminder entry in RemindersCard's list. Pure render from props — the
// inline-edit state (editingReminderId/Text) lives in RemindersCard, mirroring
// how FollowUpRow handles snoozePickerForId. Extracted from the reminders.map
// loop.
function ReminderRow({
  r, item,
  onFocus, onDraftMessage,
  editingReminderId, editingReminderText, setEditingReminderText,
  startReminderEdit, saveReminderEdit, cancelReminderEdit,
  deleteReminder, dismissReminder,
}) {
  const typeIcon = r.type === "recurring" ? "🔁" : r.type === "item" ? "📌" : "💭";
  const typeColor = r.type === "recurring" ? "#9878b8" : r.type === "item" ? "#d4829a" : "#9a7850";
  const typeBg = r.type === "recurring" ? "rgba(184,160,212,0.08)" : r.type === "item" ? "rgba(212,130,154,0.08)" : "rgba(196,168,130,0.08)";
  const isClickable = !!(item && onFocus);
  const handleOpen = () => { if (isClickable) onFocus(item); };
  const isEditingThis = editingReminderId === r.id;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: typeBg, border: `1px solid ${typeColor}22`, borderRadius: 8, minWidth: 0 }}>
      <span style={{ fontSize: 12, flexShrink: 0 }}>{typeIcon}</span>
      {isEditingThis ? (
        <input
          autoFocus
          type="text"
          value={editingReminderText}
          onChange={e => setEditingReminderText(e.target.value)}
          onBlur={saveReminderEdit}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); saveReminderEdit(); } if (e.key === "Escape") cancelReminderEdit(); }}
          className="jost"
          style={{ flex: 1, minWidth: 0, fontSize: 12, color: "#4a3540", padding: "3px 6px", borderRadius: 6, border: `1px solid ${typeColor}55`, background: "rgba(255,255,255,0.9)", outline: "none", fontFamily: "'Jost', sans-serif" }}
        />
      ) : (
        <div
          onClick={handleOpen}
          title={isClickable ? `Open ${item.title}` : undefined}
          style={{ flex: 1, minWidth: 0, cursor: isClickable ? "pointer" : "default", borderRadius: 6, padding: isClickable ? "1px 4px" : 0, marginLeft: isClickable ? -4 : 0, transition: "background .15s" }}
          onMouseEnter={isClickable ? (e) => { e.currentTarget.style.background = "rgba(255,255,255,0.6)"; } : undefined}
          onMouseLeave={isClickable ? (e) => { e.currentTarget.style.background = "transparent"; } : undefined}
        >
          <div className="jost" style={{ fontSize: 12, color: "#4a3540", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {r.text}
            {r.suggested && <span className="jost" style={{ fontSize: 9, color: "rgba(184,109,133,0.7)", marginLeft: 6, fontStyle: "italic" }}>🌸 from Rosie</span>}
          </div>
          {(r.time || r.recurring || r.date || item) && (
            <div className="jost" style={{ fontSize: 9, color: typeColor, marginTop: 1, fontWeight: 500, letterSpacing: 0.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.date && (() => {
                const d = new Date(r.date + "T12:00:00");
                if (isNaN(d)) return null;
                const label = d.toLocaleString("en-US", { month: "short", day: "numeric" });
                return <span>📅 {label}</span>;
              })()}
              {r.date && (r.time || r.recurring || item) && <span> · </span>}
              {r.time && <span>at {r.time}</span>}
              {r.time && (r.recurring || item) && <span> · </span>}
              {r.recurring && <span>{recurringLabel[r.recurring]}</span>}
              {item && <span style={{ textDecoration: isClickable ? "underline" : "none" }}>linked to: {item.title.slice(0, 35)}{item.title.length > 35 ? "…" : ""}{isClickable ? " →" : ""}</span>}
            </div>
          )}
        </div>
      )}
      {/* Draft → pill — when reminder is tagged as email/teams,
          clicking jumps to Email & Teams with the situation
          chat pre-filled with the reminder text + linked item. */}
      {!isEditingThis && r.messageKind && onDraftMessage && (
        <button
          onClick={() => onDraftMessage(r, item)}
          title={`Draft ${r.messageKind === "teams" ? "Teams" : "email"} message in Email & Teams (pre-fills the situation chat)`}
          className="jost"
          style={{ background: "rgba(184,160,212,0.15)", border: "1px solid rgba(184,160,212,0.4)", color: "#9878b8", cursor: "pointer", fontSize: 10, padding: "2px 8px", borderRadius: 8, fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap" }}
        >{r.messageKind === "teams" ? "💬" : "📧"} draft →</button>
      )}
      {!isEditingThis && (
        <button onClick={() => startReminderEdit(r)} title="Edit" style={{ background: "none", border: "none", color: "rgba(74,53,64,0.35)", cursor: "pointer", fontSize: 11, padding: "0 4px", lineHeight: 1, flexShrink: 0 }}>✏️</button>
      )}
      <button onClick={() => dismissReminder(r.id)} title="Done" className="jost" style={{ background: "rgba(158,184,154,0.15)", border: "1px solid rgba(158,184,154,0.35)", color: "#7a9e78", cursor: "pointer", fontSize: 10, padding: "2px 8px", borderRadius: 8, fontWeight: 600, flexShrink: 0 }}>✓</button>
      <button onClick={() => deleteReminder(r.id)} title="Delete" style={{ background: "none", border: "none", color: "rgba(74,53,64,0.35)", cursor: "pointer", fontSize: 14, padding: "0 4px", lineHeight: 1, flexShrink: 0 }}>×</button>
    </div>
  );
}

function RemindersCard({ data, onUpdate, onFocus, onDraftMessage }) {
  const [collapsed, setCollapsed] = useState(false);
  const [newText, setNewText] = useState("");
  const [newType, setNewType] = useState("quick"); // "quick" | "item" | "recurring"
  const [newItemId, setNewItemId] = useState("");
  const [newRecurring, setNewRecurring] = useState("daily");
  const [newTime, setNewTime] = useState("");
  // New: explicit due-date for the reminder (YYYY-MM-DD) + optional messageKind
  // for tagging reminders as email/teams drafts → enables the "draft →" pill
  // that pre-fills Email Hub with the reminder context.
  const [newDate, setNewDate] = useState("");
  const [newMessageKind, setNewMessageKind] = useState(""); // "" | "email" | "teams"
  const [showForm, setShowForm] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [scanning, setScanning] = useState(false);
  const scanTimerRef = useRef(null);

  // Sort reminders: dated reminders by date asc, then undated ones (by createdAt asc)
  const reminders = (data.reminders || [])
    .filter(r => !r.dismissed)
    .sort((a, b) => {
      const aDate = a.date || "";
      const bDate = b.date || "";
      if (aDate && bDate) return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
      if (aDate && !bDate) return -1;
      if (!aDate && bDate) return 1;
      return (a.createdAt || 0) - (b.createdAt || 0);
    });
  const items = data.items || [];
  // Inline reminder edit — click pencil to switch the row into an editable
  // textarea; Enter saves, Escape cancels. Tracks the open row by id.
  const [editingReminderId, setEditingReminderId] = useState(null);
  const [editingReminderText, setEditingReminderText] = useState("");
  const saveReminderEdit = () => {
    if (!editingReminderId) return;
    const trimmed = editingReminderText.trim();
    if (!trimmed) {
      setEditingReminderId(null);
      return;
    }
    const newReminders = (data.reminders || []).map(r =>
      r.id === editingReminderId ? { ...r, text: trimmed, editedAt: Date.now() } : r
    );
    onUpdate({ ...data, reminders: newReminders });
    setEditingReminderId(null);
    setEditingReminderText("");
  };
  const cancelReminderEdit = () => { setEditingReminderId(null); setEditingReminderText(""); };
  const startReminderEdit = (r) => { setEditingReminderId(r.id); setEditingReminderText(r.text || ""); };

  // ── AUTO-SCAN DISABLED ──
  // Previously this useEffect auto-called suggestRemindersWithAI in the background
  // every hour when items changed. Removed because it silently burned API quota
  // even when the user wasn't actively asking for suggestions. Use the
  // "✨ Scan for suggestions" button below to fetch them manually instead.

  const manualScan = async () => {
    if (scanning) return;
    setScanning(true);
    try {
      const dismissed = (data.dismissedReminderSuggestions || []).map(s => s.toLowerCase());
      const suggested = await suggestRemindersWithAI(items, data.reminders || []);
      const fresh = suggested.filter(s => !dismissed.some(d => d.includes(s.text.toLowerCase()) || s.text.toLowerCase().includes(d)));
      setSuggestions(fresh);
      onUpdate({ ...data, lastReminderScan: Date.now() });
    } catch {}
    setScanning(false);
  };

  const acceptSuggestion = (s) => {
    const reminder = {
      id: uid(),
      text: s.text,
      type: s.type || "quick",
      itemId: s.itemId || "",
      recurring: s.type === "recurring" ? (s.recurring || "weekly") : "",
      time: s.time || "",
      dismissed: false,
      createdAt: Date.now(),
      suggested: true,
    };
    onUpdate({ ...data, reminders: [...(data.reminders || []), reminder] });
    setSuggestions(prev => prev.filter(p => p.text !== s.text));
  };

  const acceptAllSuggestions = () => {
    if (!suggestions.length) return;
    const newReminders = suggestions.map(s => ({
      id: uid(),
      text: s.text,
      type: s.type || "quick",
      itemId: s.itemId || "",
      recurring: s.type === "recurring" ? (s.recurring || "weekly") : "",
      time: s.time || "",
      dismissed: false,
      createdAt: Date.now(),
      suggested: true,
    }));
    onUpdate({ ...data, reminders: [...(data.reminders || []), ...newReminders] });
    setSuggestions([]);
  };

  const dismissSuggestion = (s) => {
    onUpdate({ ...data, dismissedReminderSuggestions: [...(data.dismissedReminderSuggestions || []), s.text] });
    setSuggestions(prev => prev.filter(p => p.text !== s.text));
  };

  const dismissAllSuggestions = () => {
    onUpdate({ ...data, dismissedReminderSuggestions: [...(data.dismissedReminderSuggestions || []), ...suggestions.map(s => s.text)] });
    setSuggestions([]);
  };

  const addReminder = () => {
    if (!newText.trim()) return;
    const reminder = {
      id: uid(),
      text: newText.trim(),
      type: newType,
      itemId: newType === "item" ? newItemId : "",
      recurring: newType === "recurring" ? newRecurring : "",
      time: newTime || "",
      date: newDate || "", // explicit YYYY-MM-DD; "" = no date set
      messageKind: newMessageKind || null, // "email" | "teams" | null — drives the "draft →" pill
      dismissed: false,
      createdAt: Date.now(),
    };
    onUpdate({ ...data, reminders: [...(data.reminders || []), reminder] });
    setNewText(""); setNewItemId(""); setNewTime(""); setNewDate(""); setNewMessageKind(""); setShowForm(false); setNewType("quick");
  };

  const dismissReminder = (id) => {
    onUpdate({ ...data, reminders: (data.reminders || []).map(r => r.id === id ? { ...r, dismissed: true } : r) });
  };

  const deleteReminder = (id) => {
    const reminder = (data.reminders || []).find(r => r.id === id);
    if (!reminder) return;
    const snapshot = data;
    onUpdate({ ...data, reminders: (data.reminders || []).filter(r => r.id !== id) });
    // 10s undo window — dispatched via global event, picked up by App's
    // undo listener. Snapshot restores the full data state.
    try {
      if (typeof window !== "undefined" && window.dispatchEvent) {
        const shortText = (reminder.text || "Reminder").length > 32 ? (reminder.text.slice(0, 29) + "…") : reminder.text;
        window.dispatchEvent(new CustomEvent("work-hub-undo", {
          detail: {
            label: `Deleted reminder "${shortText}"`,
            undoFn: () => onUpdate(snapshot),
          },
        }));
      }
    } catch (e) { /* undo best-effort */ }
  };

  const recurringLabel = {
    daily: "Every day",
    weekly: "Every week",
    biweekly: "Every 2 weeks",
    monthly: "Every month",
  };

  return (
    <div className="card fade" style={{ padding: collapsed ? "10px 16px" : "14px 18px", marginBottom: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div onClick={() => setCollapsed(!collapsed)} className="jost" style={{ flex: 1, cursor: "pointer", fontSize: 10, letterSpacing: 2.5, color: "rgba(154,120,80,0.85)", textTransform: "uppercase", fontWeight: 600 }}>
          🔔 {(() => {
            const waitingCount = items.filter(i => i.status === "waiting" && i.waitingSince).length;
            const total = reminders.length + waitingCount;
            return total > 0 ? <span style={{ color: "#9a7850" }}>({total})</span> : null;
          })()}
          {suggestions.length > 0 && <span style={{ color: "#b86d85", marginLeft: 6 }}>· {suggestions.length} suggested</span>}
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <button
            onClick={manualScan}
            disabled={scanning}
            title="Ask Rosie for reminder suggestions"
            className="jost"
            style={{
              background: scanning ? "rgba(212,130,154,0.15)" : "none",
              border: "1px dashed rgba(212,130,154,0.3)",
              color: scanning ? "#b86d85" : "rgba(184,109,133,0.7)",
              cursor: scanning ? "wait" : "pointer",
              fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 600,
            }}
          >{scanning ? <span className="pulse">🌸…</span> : "✨"}</button>
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(154,120,80,0.6)", fontSize: 14, padding: "0 6px" }}>
            {collapsed ? "▼" : "▲"}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Rosie's suggestions */}
          {suggestions.length > 0 && (
            <div className="fade" style={{
              marginTop: 10,
              padding: "10px 12px",
              background: "linear-gradient(135deg, rgba(232,160,180,0.1), rgba(212,130,154,0.06))",
              border: "1px dashed rgba(212,130,154,0.4)",
              borderRadius: 8,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div className="jost" style={{ fontSize: 10, color: "#b86d85", fontWeight: 600, letterSpacing: 0.3 }}>
                  🌸 Rosie suggests {suggestions.length} reminder{suggestions.length !== 1 ? "s" : ""}
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  {suggestions.length > 1 && (
                    <button onClick={acceptAllSuggestions} className="jost" style={{ background: "rgba(158,184,154,0.15)", border: "1px solid rgba(158,184,154,0.35)", color: "#7a9e78", cursor: "pointer", fontSize: 9, padding: "2px 8px", borderRadius: 8, fontWeight: 600 }}>+ Add all</button>
                  )}
                  <button onClick={dismissAllSuggestions} title="Dismiss all" style={{ background: "none", border: "none", color: "rgba(74,53,64,0.4)", fontSize: 14, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}>×</button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {suggestions.map((s, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.65)", border: "1px solid rgba(212,130,154,0.2)", borderRadius: 8, padding: "6px 10px" }}>
                    <span style={{ fontSize: 11, flexShrink: 0 }}>{s.type === "recurring" ? "🔁" : s.type === "item" ? "📌" : "💭"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="jost" style={{ fontSize: 11, color: "#4a3540", lineHeight: 1.4 }}>{s.text}</div>
                      {s.reason && <div className="jost" style={{ fontSize: 9, color: "rgba(74,53,64,0.5)", fontStyle: "italic", marginTop: 1 }}>{s.reason}</div>}
                    </div>
                    <button onClick={() => acceptSuggestion(s)} title="Add as reminder" className="jost" style={{ background: "rgba(158,184,154,0.18)", border: "1px solid rgba(158,184,154,0.4)", color: "#7a9e78", cursor: "pointer", fontSize: 11, padding: "1px 8px", borderRadius: 8, fontWeight: 700, flexShrink: 0 }}>+</button>
                    <button onClick={() => dismissSuggestion(s)} title="Dismiss" style={{ background: "none", border: "none", color: "rgba(74,53,64,0.35)", fontSize: 13, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing active reminders */}
          {/* Two-column layout: regular reminders on the left, waiting-on-reply on the right.
              Auto-collapses to single column on narrow screens via CSS grid auto-fit + minmax.
              Each side renders independently — if only one has content, it takes full width
              instead of leaving an awkward empty column. */}
          {(() => {
            const waitingItems = items.filter(i => i.status === "waiting" && i.waitingSince);
            // Sort waiting items by longest-waiting first
            waitingItems.sort((a, b) => (a.waitingSince || 0) - (b.waitingSince || 0));
            // On Hold items — mirror Waiting on Reply pattern. Don't require
            // holdSince so existing items hold-flipped before this feature still
            // surface in the column (backward compat).
            const holdItems = items.filter(i => i.status === "hold");
            holdItems.sort((a, b) => (a.holdSince || 0) - (b.holdSince || 0));
            const hasReminders = reminders.length > 0;
            const hasWaiting = waitingItems.length > 0;
            const hasHold = holdItems.length > 0;
            if (!hasReminders && !hasWaiting && !hasHold) return null;
            // Show column headers when more than one column is visible (so user
            // can disambiguate). Single-column view doesn't need a header.
            const showHeaders = ((hasReminders ? 1 : 0) + (hasWaiting ? 1 : 0) + (hasHold ? 1 : 0)) >= 2;

            // Render the regular reminders column
            const remindersColumn = hasReminders ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
                {showHeaders && (
                  <div className="jost" style={{ fontSize: 9, letterSpacing: 1.5, color: "rgba(154,120,80,0.75)", textTransform: "uppercase", fontWeight: 600, marginBottom: 1, paddingLeft: 4 }}>
                    📌 Reminders ({reminders.length})
                  </div>
                )}
                {reminders.map(r => {
                  const item = r.itemId ? items.find(i => i.id === r.itemId) : null;
                  return (
                    <ReminderRow
                      key={r.id}
                      r={r}
                      item={item}
                      onFocus={onFocus}
                      onDraftMessage={onDraftMessage}
                      editingReminderId={editingReminderId}
                      editingReminderText={editingReminderText}
                      setEditingReminderText={setEditingReminderText}
                      startReminderEdit={startReminderEdit}
                      saveReminderEdit={saveReminderEdit}
                      cancelReminderEdit={cancelReminderEdit}
                      deleteReminder={deleteReminder}
                      dismissReminder={dismissReminder}
                    />
                  );
                })}
              </div>
            ) : null;

            // Render the waiting-on-reply column
            const waitingColumn = hasWaiting ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
                <div className="jost" style={{ fontSize: 9, letterSpacing: 1.5, color: "rgba(122,158,120,0.75)", textTransform: "uppercase", fontWeight: 600, marginBottom: 1, paddingLeft: 4 }}>
                  💬 Waiting on reply ({waitingItems.length})
                </div>
                {waitingItems.map(item => {
                  const days = businessDaysSince(item.waitingSince);
                  const dayLabel = days === 0 ? "since today" : days === 1 ? "1 business day" : `${days} business days`;
                  const isStale = days >= 3;
                  const isVeryStale = days >= 6;
                  const accentColor = isVeryStale ? "#c4687a" : isStale ? "#9a7850" : "#7a9e78";
                  const accentBg = isVeryStale ? "rgba(212,100,120,0.06)" : isStale ? "rgba(196,168,130,0.06)" : "rgba(158,184,154,0.06)";
                  const isClickable = !!onFocus;
                  return (
                    <div key={`waiting-${item.id}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: accentBg, border: `1px solid ${accentColor}30`, borderRadius: 8, minWidth: 0 }}>
                      <span style={{ fontSize: 12, flexShrink: 0 }}>💬</span>
                      <div
                        onClick={() => isClickable && onFocus(item)}
                        title={isClickable ? `Open ${item.title}` : undefined}
                        style={{ flex: 1, minWidth: 0, cursor: isClickable ? "pointer" : "default", borderRadius: 6, padding: isClickable ? "1px 4px" : 0, marginLeft: isClickable ? -4 : 0, transition: "background .15s" }}
                        onMouseEnter={isClickable ? (e) => { e.currentTarget.style.background = "rgba(255,255,255,0.6)"; } : undefined}
                        onMouseLeave={isClickable ? (e) => { e.currentTarget.style.background = "transparent"; } : undefined}
                      >
                        <div className="jost" style={{ fontSize: 12, color: "#4a3540", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.title}
                        </div>
                        <div className="jost" style={{ fontSize: 9, color: accentColor, marginTop: 1, fontWeight: 500, letterSpacing: 0.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          Waiting {dayLabel}{isStale && !isVeryStale && " · time to follow up?"}{isVeryStale && " · really worth a nudge"}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const today = todayStr();
                          let next = { ...item, status: "todo", waitingSince: null };
                          if (item.scheduledDate) {
                            const diff = daysBetween(today, item.scheduledDate);
                            if (diff <= 1) {
                              next.scheduledDate = shiftOffWeekend(addDaysToDateStr(today, 3));
                            }
                          }
                          onUpdate({ ...data, items: data.items.map(i => i.id === item.id ? next : i) });
                        }}
                        title="Got the reply — flip to To Do"
                        className="jost"
                        style={{ background: "rgba(158,184,154,0.15)", border: "1px solid rgba(158,184,154,0.35)", color: "#7a9e78", cursor: "pointer", fontSize: 10, padding: "2px 8px", borderRadius: 8, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}
                      >↩ got reply</button>
                    </div>
                  );
                })}
              </div>
            ) : null;

            // Render the on-hold column — same shape as waiting but with lavender
            // accent (matches the "On Hold" status pill color #9878b8) and a
            // "↪ resume" pill that flips status back to To Do. Sorted oldest-held
            // first (the ones most at risk of being forgotten).
            const holdColumn = hasHold ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
                <div className="jost" style={{ fontSize: 9, letterSpacing: 1.5, color: "rgba(152,120,184,0.75)", textTransform: "uppercase", fontWeight: 600, marginBottom: 1, paddingLeft: 4 }}>
                  🌿 On hold ({holdItems.length})
                </div>
                {holdItems.map(item => {
                  // Held-since label — graceful when holdSince is missing
                  // (backward compat with existing hold items from before this feature).
                  const sinceLabel = (() => {
                    if (!item.holdSince) return "On hold";
                    const days = Math.floor((Date.now() - item.holdSince) / (1000 * 60 * 60 * 24));
                    if (days === 0) return "Held since today";
                    if (days === 1) return "Held 1 day";
                    if (days < 7) return `Held ${days} days`;
                    if (days < 30) {
                      const weeks = Math.floor(days / 7);
                      return `Held ${weeks} week${weeks === 1 ? "" : "s"}`;
                    }
                    const months = Math.floor(days / 30);
                    return `Held ${months} month${months === 1 ? "" : "s"}`;
                  })();
                  const isClickable = !!onFocus;
                  return (
                    <div key={`hold-${item.id}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "rgba(184,160,212,0.06)", border: "1px solid rgba(184,160,212,0.3)", borderRadius: 8, minWidth: 0 }}>
                      <span style={{ fontSize: 12, flexShrink: 0 }}>🌿</span>
                      <div
                        onClick={() => isClickable && onFocus(item)}
                        title={isClickable ? `Open ${item.title}` : undefined}
                        style={{ flex: 1, minWidth: 0, cursor: isClickable ? "pointer" : "default", borderRadius: 6, padding: isClickable ? "1px 4px" : 0, marginLeft: isClickable ? -4 : 0, transition: "background .15s" }}
                        onMouseEnter={isClickable ? (e) => { e.currentTarget.style.background = "rgba(255,255,255,0.6)"; } : undefined}
                        onMouseLeave={isClickable ? (e) => { e.currentTarget.style.background = "transparent"; } : undefined}
                      >
                        <div className="jost" style={{ fontSize: 12, color: "#4a3540", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.title}
                        </div>
                        <div className="jost" style={{ fontSize: 9, color: "#9878b8", marginTop: 1, fontWeight: 500, letterSpacing: 0.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {sinceLabel}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          // Resume — flip status to To Do, clear holdSince. We don't
                          // restore a scheduledDate (we cleared it on hold entry);
                          // the user will pick a fresh date via the existing TBD UI.
                          const next = { ...item, status: "todo", holdSince: null };
                          onUpdate({ ...data, items: data.items.map(i => i.id === item.id ? next : i) });
                        }}
                        title="Resume — flip back to To Do"
                        className="jost"
                        style={{ background: "rgba(158,184,154,0.15)", border: "1px solid rgba(158,184,154,0.35)", color: "#7a9e78", cursor: "pointer", fontSize: 10, padding: "2px 8px", borderRadius: 8, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}
                      >↪ resume</button>
                    </div>
                  );
                })}
              </div>
            ) : null;

            // Layout: grid auto-fit splits into multiple columns when there's
            // room (≥260px per column) and stacks vertically on narrower
            // viewports. Handles 1/2/3 visible columns transparently.
            return (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: showHeaders ? "repeat(auto-fit, minmax(260px, 1fr))" : "1fr",
                  gap: 12,
                  marginTop: 10,
                  alignItems: "start",
                }}
              >
                {remindersColumn}
                {waitingColumn}
                {holdColumn}
              </div>
            );
          })()}

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="jost"
              style={{
                marginTop: (reminders.length > 0 || suggestions.length > 0) ? 10 : 8,
                width: "100%",
                background: "none",
                border: "1px dashed rgba(196,168,130,0.4)",
                color: "rgba(154,120,80,0.85)",
                cursor: "pointer",
                fontSize: 11,
                padding: "7px",
                borderRadius: 8,
                fontWeight: 500,
              }}
            >+ Add a reminder</button>
          ) : (
            <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(196,168,130,0.05)", border: "1px solid rgba(196,168,130,0.2)", borderRadius: 8, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 5 }}>
                {[
                  { val: "quick", label: "💭 Quick" },
                  { val: "item", label: "📌 On item" },
                  { val: "recurring", label: "🔁 Recurring" },
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setNewType(opt.val)}
                    className="jost"
                    style={{
                      flex: 1,
                      padding: "5px 8px",
                      background: newType === opt.val ? "rgba(196,168,130,0.18)" : "rgba(255,255,255,0.5)",
                      border: "1px solid " + (newType === opt.val ? "rgba(154,120,80,0.4)" : "rgba(196,168,130,0.2)"),
                      borderRadius: 6,
                      color: newType === opt.val ? "#9a7850" : "rgba(74,53,64,0.55)",
                      cursor: "pointer",
                      fontSize: 10,
                      fontWeight: newType === opt.val ? 600 : 500,
                    }}
                  >{opt.label}</button>
                ))}
              </div>

              <input
                className="ifield jost"
                placeholder={
                  newType === "quick" ? "e.g. Call back at 2pm, eat lunch…" :
                  newType === "item" ? "What's the reminder?" :
                  "e.g. Submit weekly report"
                }
                value={newText}
                onChange={e => setNewText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addReminder(); }}
                style={{ fontSize: 12, padding: "7px 11px" }}
                autoFocus
              />

              {newType === "item" && (
                <select className="ifield jost" value={newItemId} onChange={e => setNewItemId(e.target.value)} style={{ fontSize: 11, cursor: "pointer", padding: "6px 10px" }}>
                  <option value="">Pick an item to link…</option>
                  {items.filter(i => !isTerminalStatus(i.status)).map(i => <option key={i.id} value={i.id}>{i.title.slice(0, 50)}</option>)}
                </select>
              )}

              {newType === "recurring" && (
                <select className="ifield jost" value={newRecurring} onChange={e => setNewRecurring(e.target.value)} style={{ fontSize: 11, cursor: "pointer", padding: "6px 10px" }}>
                  <option value="daily">Every day</option>
                  <option value="weekly">Every week</option>
                  <option value="biweekly">Every 2 weeks</option>
                  <option value="monthly">Every month</option>
                </select>
              )}

              <input
                type="text"
                className="ifield jost"
                placeholder="Optional time (e.g. 2pm, 9:30am)"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                style={{ fontSize: 11, padding: "6px 10px" }}
              />

              {/* Explicit due date for the reminder. Optional — leave blank for
                  a general "no specific day" reminder. When set, the reminder
                  card sorts by this date and shows it in the meta line. */}
              <input
                type="date"
                className="ifield jost"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                title="Optional date — leave blank for an undated reminder"
                style={{ fontSize: 11, padding: "6px 10px", colorScheme: "light" }}
              />

              {/* Message-kind toggle — if this reminder is about sending an
                  email or a Teams message, tag it so the reminder card shows
                  a "draft →" pill that jumps to Email & Teams with the
                  context pre-filled in Tell-me-the-situation. */}
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span className="jost" style={{ fontSize: 9, color: "rgba(74,53,64,0.45)", letterSpacing: 1, textTransform: "uppercase" }}>kind</span>
                {[
                  { val: "", emoji: "—", label: "None" },
                  { val: "email", emoji: "📧", label: "Email" },
                  { val: "teams", emoji: "💬", label: "Teams" },
                ].map(opt => (
                  <button
                    key={opt.val || "none"}
                    onClick={() => setNewMessageKind(opt.val)}
                    title={`Tag this reminder as a ${opt.label.toLowerCase()} draft (or none)`}
                    className="jost"
                    style={{
                      background: newMessageKind === opt.val ? "rgba(184,160,212,0.18)" : "rgba(255,255,255,0.6)",
                      border: `1px solid ${newMessageKind === opt.val ? "rgba(184,160,212,0.5)" : "rgba(212,130,154,0.18)"}`,
                      color: newMessageKind === opt.val ? "#9878b8" : "rgba(74,53,64,0.55)",
                      fontSize: 10, padding: "4px 9px", borderRadius: 6, cursor: "pointer", fontWeight: 500,
                    }}
                  >{opt.emoji} {opt.label}</button>
                ))}
              </div>

              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button onClick={() => { setShowForm(false); setNewText(""); setNewDate(""); setNewMessageKind(""); }} className="jost" style={{ background: "none", border: "1px solid rgba(74,53,64,0.15)", color: "rgba(74,53,64,0.55)", cursor: "pointer", fontSize: 10, padding: "5px 12px", borderRadius: 6 }}>Cancel</button>
                <button onClick={addReminder} disabled={!newText.trim()} className="jost" style={{ background: newText.trim() ? "linear-gradient(135deg, rgba(232,160,180,0.25), rgba(212,130,154,0.2))" : "rgba(212,130,154,0.08)", border: "1px solid " + (newText.trim() ? "rgba(212,130,154,0.4)" : "rgba(212,130,154,0.15)"), color: newText.trim() ? "#b86d85" : "rgba(184,109,133,0.5)", cursor: newText.trim() ? "pointer" : "not-allowed", fontSize: 10, padding: "5px 14px", borderRadius: 6, fontWeight: 600 }}>Add</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Projects View ────────────────────────────────────────────────────────────
function ProjectsView({ data, onUpdate, onFocus, onEdit, onAwardXP }) {
  const [collapsed, setCollapsed] = useState({}); // projectKey → bool
  const [backfilling, setBackfilling] = useState(false);
  const [backfillNote, setBackfillNote] = useState("");

  const items = (data.items || []).filter(i => i.status !== "done" && i.status !== "cancelled");
  const itemsWithoutProject = items.filter(i => !i.project);

  // Group items by project, items without a project go into "Unassigned"
  const groups = {};
  items.forEach(i => {
    const key = i.project || "(unassigned)";
    if (!groups[key]) groups[key] = [];
    groups[key].push(i);
  });

  // Sort projects: ones with most items first, "(unassigned)" goes last
  const projectKeys = Object.keys(groups).sort((a, b) => {
    if (a === "(unassigned)") return 1;
    if (b === "(unassigned)") return -1;
    return groups[b].length - groups[a].length;
  });

  // Sort items within each group: high priority first, then by date
  const po = { high: 0, medium: 1, low: 2 };
  Object.values(groups).forEach(arr => {
    arr.sort((a, b) => {
      const pa = po[a.priority] ?? 1;
      const pb = po[b.priority] ?? 1;
      if (pa !== pb) return pa - pb;
      if (!a.scheduledDate && !b.scheduledDate) return 0;
      if (!a.scheduledDate) return 1;
      if (!b.scheduledDate) return -1;
      return a.scheduledDate < b.scheduledDate ? -1 : 1;
    });
  });

  const projectColor = (name) => {
    // Generate consistent rose-palette color from project name
    if (name === "(unassigned)") return { color: "#9a7850", bg: "rgba(196,168,130,0.08)", border: "rgba(196,168,130,0.25)" };
    const palette = [
      { color: "#b86d85", bg: "rgba(212,130,154,0.08)", border: "rgba(212,130,154,0.25)" },
      { color: "#9878b8", bg: "rgba(184,160,212,0.08)", border: "rgba(152,120,184,0.25)" },
      { color: "#7a9e78", bg: "rgba(158,184,154,0.08)", border: "rgba(122,158,120,0.25)" },
      { color: "#9a7850", bg: "rgba(196,168,130,0.08)", border: "rgba(154,120,80,0.25)" },
      { color: "#c4687a", bg: "rgba(196,104,122,0.08)", border: "rgba(196,104,122,0.25)" },
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i);
    return palette[Math.abs(hash) % palette.length];
  };

  const backfillProjects = async () => {
    if (backfilling || !itemsWithoutProject.length) return;
    setBackfilling(true);
    setBackfillNote("");
    let successCount = 0;
    try {
      // Get suggestions for each unassigned item in parallel (but capped to avoid spamming API)
      const targets = itemsWithoutProject.slice(0, 20);
      const results = await Promise.all(
        targets.map(i => suggestFieldWithAI("project", i.title, i.category || "", {}).then(p => ({ id: i.id, project: p })))
      );
      const updates = {};
      results.forEach(r => { if (r.project) updates[r.id] = r.project; });
      if (Object.keys(updates).length) {
        const newItems = data.items.map(i => updates[i.id] ? { ...i, project: updates[i.id] } : i);
        onUpdate({ ...data, items: newItems });
        successCount = Object.keys(updates).length;
      }
      setBackfillNote(`🌸 Rosie tagged ${successCount} item${successCount !== 1 ? "s" : ""} with a project${itemsWithoutProject.length > 20 ? ` (more available — run again)` : ""}`);
      if (successCount && onAwardXP) onAwardXP(3, window.innerWidth / 2, 200);
    } catch {
      setBackfillNote("Couldn't reach Rosie — try again?");
    }
    setBackfilling(false);
  };

  if (!items.length) {
    return (
      <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
        <p className="cg" style={{ fontSize: 24, color: "rgba(74,53,64,0.3)", fontStyle: "italic" }}>No active items to group</p>
        <p className="jost" style={{ fontSize: 13, color: "rgba(74,53,64,0.25)", marginTop: 6 }}>Add items and they'll appear here grouped by project ✦</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Backfill banner — only shown if many items lack project */}
      {itemsWithoutProject.length >= 3 && (
        <div className="card fade" style={{ padding: "12px 16px", background: "rgba(232,160,180,0.06)", border: "1px dashed rgba(212,130,154,0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.7)", lineHeight: 1.5 }}>
              {itemsWithoutProject.length} items don't have a project yet. Want Rosie to tag them automatically?
            </div>
            <button
              onClick={backfillProjects}
              disabled={backfilling}
              className="jost"
              style={{
                background: backfilling ? "rgba(212,130,154,0.15)" : "linear-gradient(135deg, rgba(232,160,180,0.25), rgba(212,130,154,0.2))",
                border: "1px solid rgba(212,130,154,0.4)",
                color: "#b86d85",
                cursor: backfilling ? "wait" : "pointer",
                fontSize: 11, padding: "6px 14px", borderRadius: 8, fontWeight: 600,
              }}
            >{backfilling ? <span className="pulse">🌸…</span> : "✨ Tag with projects"}</button>
          </div>
          {backfillNote && <div className="jost fade" style={{ fontSize: 11, color: "#7a9e78", marginTop: 8, fontStyle: "italic" }}>{backfillNote}</div>}
        </div>
      )}

      {/* Project groups */}
      {projectKeys.map(key => {
        const groupItems = groups[key];
        const isCollapsed = collapsed[key];
        const c = projectColor(key);
        const totalMins = groupItems.reduce((sum, i) => {
          const m = parseInt((i.timeEstimate || "").match(/\d+/)?.[0] || 0);
          if ((i.timeEstimate || "").includes("h")) return sum + m * 60;
          return sum + m;
        }, 0);
        const highCount = groupItems.filter(i => i.priority === "high").length;
        return (
          <div key={key} className="card fade" style={{ padding: 0, overflow: "hidden", border: `1px solid ${c.border}` }}>
            {/* Group header */}
            <div
              onClick={() => setCollapsed(s => ({ ...s, [key]: !s[key] }))}
              style={{
                padding: "12px 18px",
                background: c.bg,
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                borderBottom: isCollapsed ? "none" : `1px solid ${c.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 16, color: c.color }}>📁</span>
                <h3 className="cg" style={{ fontSize: 20, color: c.color, margin: 0, lineHeight: 1, fontWeight: 500, fontStyle: key === "(unassigned)" ? "italic" : "normal" }}>
                  {key === "(unassigned)" ? "Unassigned" : key}
                </h3>
                <span className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.5)", fontWeight: 500 }}>
                  · {groupItems.length} {groupItems.length === 1 ? "item" : "items"}
                  {highCount > 0 && <span style={{ color: "#c4687a", marginLeft: 6 }}>· {highCount} high ⚠️</span>}
                  {totalMins > 0 && <span style={{ marginLeft: 6 }}>· ~{fmtMins(totalMins)}</span>}
                </span>
              </div>
              <span style={{ color: c.color, fontSize: 14 }}>{isCollapsed ? "▼" : "▲"}</span>
            </div>

            {/* Group items */}
            {!isCollapsed && (
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {groupItems.map((item, idx) => {
                  const st = STATUSES.find(s => s.key === item.status) || STATUSES[0];
                  const taskCount = (item.tasks || []).length;
                  const completedCount = (item.completedTasks || []).length;
                  const progress = taskCount > 0 ? completedCount / taskCount : 0;
                  return (
                    <div
                      key={item.id}
                      onClick={() => onFocus(item)}
                      style={{
                        padding: "10px 18px",
                        background: idx % 2 === 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        transition: "background .15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,130,154,0.06)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)"; }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span className="tag jost" style={{ background: st.bg, color: st.color, fontSize: 9 }}>{st.label}</span>
                        {item.priority === "high" && <span className="tag jost" style={{ background: "rgba(212,100,120,0.1)", color: "#c4687a", fontSize: 9 }}>⚠️ high</span>}
                        {item.category && <span className="tag jost" style={{ background: "rgba(180,160,210,0.1)", color: "#9878b8", fontSize: 9 }}>{item.category}</span>}
                        {item.scheduledDate && <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)" }}>{fmtDateLabel(item.scheduledDate)}</span>}
                        {item.timeEstimate && <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)" }}>· ~{item.timeEstimate}</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="jost" style={{ fontSize: 13, color: "#4a3540", fontWeight: 500, flex: 1, minWidth: 0 }}>{item.title}</div>
                        <button
                          onClick={e => { e.stopPropagation(); onEdit(item); }}
                          className="jost"
                          style={{ background: "rgba(212,130,154,0.08)", border: "1px solid rgba(212,130,154,0.2)", color: "#b86d85", cursor: "pointer", fontSize: 10, padding: "3px 10px", borderRadius: 6, fontWeight: 500, flexShrink: 0 }}
                        >Edit</button>
                      </div>
                      {taskCount > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 3, background: "rgba(212,130,154,0.1)", borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ width: `${progress * 100}%`, height: "100%", background: "linear-gradient(90deg,#e8a0b4,#d4687f)", transition: "width .3s" }} />
                          </div>
                          <span className="jost" style={{ fontSize: 9, color: "rgba(74,53,64,0.4)", fontWeight: 500 }}>{completedCount}/{taskCount}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── OverviewStatPills ───────────────────────────────────────────────────────
// The pill row above RoadmapCard in Overview: energy/mood chip, Re-check in,
// Roadmap log, and conditional Parked count. Pure render from props —
// parkedCount derives from data inside.
function OverviewStatPills({
  energyObj, moodObj,
  onReCheckIn,
  setShowRoadmapHistory, setShowParkedDashboard,
  data,
}) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: -2, flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center", background: `${energyObj.color}15`, border: `1px solid ${energyObj.color}40`, borderRadius: 18, padding: "4px 11px" }}>
        <span style={{ fontSize: 14 }}>{energyObj.emoji}</span>
        {moodObj && <span style={{ fontSize: 14 }}>{moodObj.emoji}</span>}
        <span className="jost" style={{ fontSize: 11, color: energyObj.color, fontWeight: 500 }}>{energyObj.label}</span>
      </div>
      <button
        onClick={onReCheckIn}
        title="Re-check in to update your energy & mood"
        className="jost"
        style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(212,130,154,0.2)", color: "rgba(184,109,133,0.75)", fontSize: 10, padding: "4px 10px", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}
      >Re-check in</button>
      <button
        className="jost"
        onClick={() => setShowRoadmapHistory(true)}
        style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(212,130,154,0.2)", color: "rgba(184,109,133,0.75)", fontSize: 10, padding: "4px 10px", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}
        title="See past roadmaps + adherence"
      >📜 Roadmap log{(data.roadmapHistory || []).length > 0 ? ` (${(data.roadmapHistory || []).length})` : ""}</button>
      {(() => {
        const parkedCount = (data.items || []).filter(i => i.status === "parked").length;
        if (parkedCount === 0) return null;
        return (
          <button
            className="jost"
            onClick={() => setShowParkedDashboard(true)}
            style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(125,154,175,0.3)", color: "#5e7e95", fontSize: 10, padding: "4px 10px", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}
            title="View all parked items + resurface dates"
          >⛵ Parked ({parkedCount})</button>
        );
      })()}
    </div>
  );
}

function Overview({ data, energy, mood, onUpdate, onFocus, onOneThing, onReCheckIn, onAwardXP, roadmap, onUpdateRoadmap, onCloseDay, showRoadmapHistory, setShowRoadmapHistory, showParkedDashboard, setShowParkedDashboard, onMeetingFocus, initialWorkTab, appTab, setAppTab, onPastMeetingClick, onDraftMessage }) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list"); // "list" | "projects"
  const [workTab, setWorkTab] = useState(initialWorkTab || "today"); // "today" | "tasks" | "schedule"
  // Schedule tab — modal toggle for managing recurring meetings (reuses RecurringMeetingsModal)
  const [showRecurringModalInOverview, setShowRecurringModalInOverview] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showBrainDump, setShowBrainDump] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false); // top-row "More ⋯" dropdown
  const moreMenuRef = useRef(null); // for outside-click dismissal
  const [statusToast, setStatusToast] = useState(""); // brief feedback after status changes (e.g. waiting → todo bump)
  const statusToastTimerRef = useRef(null);
  // Bulk gap-fill state — Rosie scans all tasks for missing why/subtasks
  // and proposes fills. Null when idle. Shape: { phase: "loading"|"ready",
  // proposals: [{id, item, fill, isFallback?}], total, skipped: Set<id> }
  const [bulkFillState, setBulkFillState] = useState(null);
  // Bulk audit state — Rosie scans existing tasks and proposes adjustments
  // (additional subtasks, date moves, concerns to flag). Same shape as
  // bulkFillState. Null when idle.
  const [bulkAuditState, setBulkAuditState] = useState(null);
  // Running thread capture state — null when closed, or { thread, linkedItem }
  // when the capture modal is showing. Review modal shown when opening a 1:1
  // with unreviewed entries.
  const [threadCaptureOpen, setThreadCaptureOpen] = useState(null);
  const [threadReviewOpen, setThreadReviewOpen] = useState(null);
  // Phase 2 — per-entry chat modal. Null when closed, or { entry, thread,
  // linkedItem } when open. Triggered via "work-hub-thread-chat-open" event
  // (from Threads tab 💬 button OR from a fresh capture's optional continue).
  const [threadChatOpen, setThreadChatOpen] = useState(null);
  // Listen for capture/review open requests from elsewhere (FocusView,
  // MeetingFocusView, etc.). CustomEvent pattern avoids prop drilling.
  // Event detail: { thread, linkedItem? } for capture; { thread, entries }
  // for review.
  useEffect(() => {
    const onCapture = (e) => {
      // If thread wasn't explicitly passed (e.g. from FocusView which only
      // knows the linked item, not the recipient), detect it from data.
      let thread = e.detail?.thread;
      if (!thread) {
        const recurring = data?.recurringMeetings || [];
        const oneOnOne = recurring.find(m => /1[:\-_ ]?1|josh/i.test(m.title || ""));
        const detectedName = oneOnOne
          ? (oneOnOne.title.match(/(?:with\s+)?([A-Z][a-z]+)/)?.[1] || "Josh")
          : "Josh";
        const existing = (data?.runningThreads || []).find(t => t.personName === detectedName);
        thread = existing || { id: `thread-${detectedName.toLowerCase()}`, personName: detectedName };
      }
      setThreadCaptureOpen({ thread, linkedItem: e.detail?.linkedItem || null });
    };
    const onReview = (e) => {
      // Two call shapes:
      //   { thread, entries }          — fully resolved (top button does this)
      //   { personName: "Josh" }       — needs lookup (MeetingFocusView banner does this)
      if (e.detail?.thread && Array.isArray(e.detail.entries)) {
        setThreadReviewOpen({ thread: e.detail.thread, entries: e.detail.entries });
        return;
      }
      if (e.detail?.personName) {
        const t = (data?.runningThreads || []).find(t => t.personName === e.detail.personName);
        if (!t) return;
        const unreviewed = (t.entries || []).filter(en => !en.reviewedAt);
        if (unreviewed.length === 0) return;
        setThreadReviewOpen({ thread: t, entries: unreviewed });
      }
    };
    // Phase 2 — open the per-entry chat. Detail shapes:
    //   { entry, thread, linkedItem }   — fully resolved
    //   { entryId, threadId }           — IDs only, look up from data
    const onChatOpen = (e) => {
      let entry = e.detail?.entry;
      let thread = e.detail?.thread;
      let linkedItem = e.detail?.linkedItem;
      if (!entry && e.detail?.entryId && e.detail?.threadId) {
        thread = (data?.runningThreads || []).find(t => t.id === e.detail.threadId);
        entry = thread?.entries?.find(en => en.id === e.detail.entryId);
        if (entry?.linkedItemId) {
          const linked = (data?.items || []).find(it => it.id === entry.linkedItemId);
          if (linked) linkedItem = { id: linked.id, title: linked.title };
        }
      }
      if (entry && thread) setThreadChatOpen({ entry, thread, linkedItem });
    };
    window.addEventListener("work-hub-thread-capture-open", onCapture);
    window.addEventListener("work-hub-thread-review-open", onReview);
    window.addEventListener("work-hub-thread-chat-open", onChatOpen);
    return () => {
      window.removeEventListener("work-hub-thread-capture-open", onCapture);
      window.removeEventListener("work-hub-thread-review-open", onReview);
      window.removeEventListener("work-hub-thread-chat-open", onChatOpen);
    };
  }, [data?.recurringMeetings, data?.runningThreads, data?.items]);
  // Close the More menu when clicking outside it
  useEffect(() => {
    if (!showMoreMenu) return;
    const handler = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
      }
    };
    // Slight delay so the click that opened it doesn't immediately close it
    const t = setTimeout(() => {
      document.addEventListener("mousedown", handler);
    }, 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handler);
    };
  }, [showMoreMenu]);
  const [showRecurring, setShowRecurring] = useState(false);
  const [dragItemId, setDragItemId] = useState(null);
  const [dragOverBucket, setDragOverBucket] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [dragOverBelow, setDragOverBelow] = useState(false);
  // Live clock for meeting prep warnings — ticks every 30s
  const [nowMin, setNowMin] = useState(() => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); });
  useEffect(() => {
    const tick = () => { const d = new Date(); setNowMin(d.getHours() * 60 + d.getMinutes()); };
    const id = setInterval(tick, 30 * 1000);
    return () => clearInterval(id);
  }, []);
  // Dismissed prep warnings (keyed by slot index + phase: "warn" or "start")
  const [dismissedPrepWarnings, setDismissedPrepWarnings] = useState(new Set());

  const energyObj = ENERGY_LEVELS.find(e => e.key === energy) || ENERGY_LEVELS[1];
  const moodObj = MOODS.find(m => m.key === mood);
  const isLow = energy === "low" || energy === "rough";
  const isHigh = energy === "high";

  // ── Unified slot warning — fires 5 min before & at-start for the next noteworthy slot.
  // Handles four behaviors based on slot type/label:
  //   - "meeting-prep" → routes to MeetingFocusView with prep flow
  //   - "lunch" → soft acknowledgment, no destination
  //   - "brain-break" → soft reminder + push-back buttons (+5/+10/+15)
  //   - "work" → routes to FocusView for matching item
  //
  // Returns the FIRST non-dismissed warning sorted by start time.
  const slotWarning = useMemo(() => {
    if (!roadmap || !roadmap.slots) return null;
    const slots = roadmap.slots;
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (!slot || !slot.label) continue;

      const startMin = parseSlotTimeMinutes(slot.time);
      if (startMin < 0) continue;
      // Use intended fixed duration when available so brain breaks/buffers don't
      // stay "active" past their real end if the next slot has a phantom gap.
      const fixedDur = intendedFixedDuration(slot);
      const next = slots[i + 1];
      const endMin = fixedDur != null ? startMin + fixedDur : (next ? parseSlotTimeMinutes(next.time) : startMin + 30);

      const minsToStart = startMin - nowMin;
      let phase = null;
      if (minsToStart > 0 && minsToStart <= 5) phase = "warn";
      else if (nowMin >= startMin && nowMin < endMin) phase = "start";
      if (!phase) continue;

      const label = slot.label.toLowerCase();
      // Determine the warning kind
      let kind = null;
      let meetingSlot = null;
      let matchedItem = null;

      if (slot.type === "buffer" && label.startsWith("prep for")) {
        // Meeting prep buffer
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
        matchedItem = findMatchingItemForLabel(slot.label, data?.items || []);
      }

      if (!kind) continue;

      // Skip if user dismissed this specific warning
      const dismissKey = `${i}-${phase}-${kind}`;
      if (dismissedPrepWarnings.has(dismissKey)) continue;

      return { idx: i, slot, phase, minsToStart, dismissKey, kind, meetingSlot, matchedItem };
    }
    return null;
  }, [roadmap, nowMin, dismissedPrepWarnings, onMeetingFocus, data?.items]);

  // Push back the current brain break by deltaMin, cascading unlocked slots
  const handlePushBackBreak = (deltaMin) => {
    if (!slotWarning || slotWarning.kind !== "brain-break" || !roadmap || !onUpdateRoadmap) return;
    const newSlots = pushBackSlot(roadmap.slots, slotWarning.idx, deltaMin);
    onUpdateRoadmap({ ...roadmap, slots: newSlots });
    // Don't dismiss — let the warning re-evaluate; it'll re-show after the new
    // 5-min-before window (or stay dismissed if the user pushed it well past).
    // Clear any prior dismissals of this slot so the user can push back again.
    setDismissedPrepWarnings(prev => {
      const next = new Set(prev);
      // Remove all keys for this slot index so the warning can fire again
      for (const k of next) {
        if (k.startsWith(`${slotWarning.idx}-`)) next.delete(k);
      }
      return next;
    });
  };

  const saveItem = item => {
    const exists = data.items.find(i => i.id === item.id);
    const wasDone = exists?.status === "done";
    const nowDone = item.status === "done";
    // Auto-estimate a scheduled date if missing (skip for TBD items)
    let finalItem = alignTaskParents({ ...item });
    if (!finalItem.scheduledDate && !nowDone && !finalItem.tbd) {
      finalItem.scheduledDate = estimateDateForNewItem(finalItem.priority || "medium", data.items.filter(i => i.id !== item.id));
      finalItem.dateSource = "estimated";
      finalItem.dateFixed = false;
    }
    // Stamp completedAt when transitioning to done (preserve on edit, clear on un-done)
    if (!wasDone && nowDone) finalItem.completedAt = Date.now();
    else if (wasDone && !nowDone) finalItem.completedAt = null;
    else if (wasDone && nowDone && exists?.completedAt) finalItem.completedAt = exists.completedAt;
    // Always stamp lastUpdatedAt on edit/save (used by 1:1 to flag "active this week")
    finalItem.lastUpdatedAt = Date.now();
    let items = exists ? data.items.map(i => i.id === item.id ? finalItem : i) : [...data.items, finalItem];
    // Cascade: if this item is high priority and has a date, push lower-priority non-fixed items on same day forward
    if (finalItem.priority === "high" && finalItem.scheduledDate && isActiveStatus(finalItem.status)) {
      items = cascadeDates(items, finalItem.id);
    }
    onUpdate({ ...data, items });
    if (!wasDone && nowDone) {
      fireConfetti();
      onAwardXP(XP_REWARDS.item, window.innerWidth/2, 200);
      // If the item has unchecked subtasks, prompt to mark them complete too.
      // Many users mark an item done in spirit without checking each subtask
      // (especially ADHD-style "I just want this off my list"). This makes
      // the cleanup explicit but optional — never forces.
      const totalTasks = (finalItem.tasks || []).length;
      const completedCount = (finalItem.completedTasks || []).length;
      if (totalTasks > 0 && completedCount < totalTasks) {
        setMarkCompletePromptItem(finalItem);
      }
    }
  };
  const deleteItem = id => {
    const item = data.items.find(i => i.id === id);
    if (!item) return;
    // Capture full state snapshot for undo. The undo restore writes the
    // entire `data` object back, so it's resilient to subsequent edits.
    const snapshot = data;
    const seedMatch = item && SEED_ITEMS.some(s => s.title.toLowerCase() === item.title.toLowerCase());
    const nextDeleted = seedMatch
      ? [...(data.deletedSeedTitles || []), item.title]
      : (data.deletedSeedTitles || []);
    onUpdate({ ...data, items: data.items.filter(i => i.id !== id), deletedSeedTitles: nextDeleted });
    // Register undo toast — 10s window to recover.
    try {
      if (typeof window !== "undefined" && window.dispatchEvent) {
        const shortTitle = (item.title || "Item").length > 32 ? (item.title.slice(0, 29) + "…") : item.title;
        window.dispatchEvent(new CustomEvent("work-hub-undo", {
          detail: {
            label: `Deleted "${shortTitle}"`,
            undoFn: () => onUpdate(snapshot),
          },
        }));
      }
    } catch (e) { /* undo dispatch best-effort */ }
  };
  const updateStatus = (id, status, e) => {
    const item = data.items.find(i => i.id === id);
    const wasDone = item?.status === "done";
    const nowDone = status === "done";
    const wasWaiting = item?.status === "waiting";
    const nowWaiting = status === "waiting";
    const today = todayStr();

    // When transitioning OUT of waiting (back to to-do/in-progress), bump a stale
    // due date forward by 3 business days. Only bumps if the date is past or
    // within 1 day — leaves further-out due dates alone since those don't need help.
    let bumpedDateMsg = null;

    onUpdate({ ...data, items: data.items.map(i => {
      if (i.id !== id) return i;
      const next = { ...i, status };
      if (!wasDone && nowDone) next.completedAt = Date.now();
      else if (wasDone && !nowDone) next.completedAt = null;

      // ── Waiting-on-Reply lifecycle ──
      if (!wasWaiting && nowWaiting) {
        // Stamp when we entered waiting — used for "Waiting Nd" badge + 3-day nudge
        next.waitingSince = Date.now();
      } else if (wasWaiting && !nowWaiting) {
        // Coming back from waiting — clear the stamp
        next.waitingSince = null;
        // Auto-bump stale due dates so the user has breathing room to actually work on it.
        // Only bumps if the original date has already passed or is today/tomorrow.
        if (i.scheduledDate) {
          const diff = daysBetween(today, i.scheduledDate);
          if (diff <= 1) {
            const bumped = shiftOffWeekend(addDaysToDateStr(today, 3));
            next.scheduledDate = bumped;
            // dateSource stays "user" if user-set, marked as adjusted otherwise
            next.dateSource = i.dateSource === "user" ? "user" : "estimated";
            bumpedDateMsg = bumped;
          }
        }
      }

      return next;
    }) });

    if (bumpedDateMsg) {
      // Brief inline confirmation (non-blocking) so the user knows the date moved
      const formatted = fmtDateLabel(bumpedDateMsg);
      setStatusToast(`📅 Due date moved to ${formatted} — three days from now`);
      if (statusToastTimerRef.current) clearTimeout(statusToastTimerRef.current);
      statusToastTimerRef.current = setTimeout(() => setStatusToast(""), 3500);
    }

    if (item?.status !== "done" && status === "done") { fireConfetti(); onAwardXP(XP_REWARDS.item, e?.clientX || window.innerWidth/2, e?.clientY || 200); }
  };

  const saveBulkItems = parsedItems => {
    // Auto-estimate dates for each new item, spreading them sensibly — unless
    // the paste-parser pulled an explicit date out of the title (preserve it).
    // Same logic for durationMin → timeEstimate.
    let newItems = [];
    let workingItems = [...data.items];
    for (const it of parsedItems) {
      const taskCount = (it.tasks || []).length;
      const item = {
        id: uid(),
        title: it.title,
        priority: it.priority || "medium",
        status: "todo",
        why: it.why || "",
        tasks: it.tasks || [],
        taskTimes: (it.tasks || []).map(() => 15),
        taskParents: Array(taskCount).fill(null), // pasted tasks default to top-level
        completedTasks: [],
        category: "",
        done: "",
        outOfScope: "",
        notes: "",
        timeEstimate: it.durationMin ? `${it.durationMin}m` : "",
        scheduledDate: it.date || estimateDateForNewItem(it.priority || "medium", workingItems),
        dateSource: it.date ? "user" : "estimated",
        dateFixed: !!it.date,
        createdAt: Date.now(),
      };
      newItems.push(item);
      workingItems.push(item);
    }
    onUpdate({ ...data, items: [...data.items, ...newItems] });
  };

  // Reorder within a date bucket (drag & drop)
  const reorderItem = (itemId, targetIndex, bucket) => {
    const bucketItems = data.items.filter(i => isActiveStatus(i.status) && dateBucket(i.scheduledDate) === bucket);
    const otherItems = data.items.filter(i => !(isActiveStatus(i.status) && dateBucket(i.scheduledDate) === bucket));
    const idx = bucketItems.findIndex(i => i.id === itemId);
    if (idx < 0) return;
    const moved = arrayMove(bucketItems, idx, targetIndex);
    onUpdate({ ...data, items: [...otherItems, ...moved] });
  };
  // Move item to a different bucket (changes date)
  const moveItemToBucket = (itemId, newBucket) => {
    const today = todayStr();
    let newDate = "";
    if (newBucket === "today") newDate = today;
    else if (newBucket === "tomorrow") newDate = shiftOffWeekend(addDaysToDateStr(today, 1));
    else if (newBucket === "thisweek") {
      // Drop somewhere later in this calendar week (not today/tomorrow). If it's
      // already too late in the week to find a non-weekend day other than today/tomorrow,
      // fall back to next week.
      const todayDate = new Date(today + "T12:00:00");
      const dow = todayDate.getDay();
      const daysLeft = (7 - dow) % 7; // remaining days incl. weekend
      if (daysLeft >= 2) newDate = shiftOffWeekend(addDaysToDateStr(today, Math.min(daysLeft, 3)));
      else newDate = shiftOffWeekend(addDaysToDateStr(today, daysLeft + 3)); // bump into next week
    }
    else if (newBucket === "nextweek") newDate = shiftOffWeekend(addDaysToDateStr(today, 7));
    else if (newBucket === "later") newDate = shiftOffWeekend(addDaysToDateStr(today, 14));
    else if (newBucket === "nodate") newDate = "";
    // If dragging into TBD bucket, mark tbd=true. Dragging elsewhere clears it.
    const tbd = newBucket === "nodate";
    onUpdate({ ...data, items: data.items.map(i => i.id === itemId ? { ...i, scheduledDate: newDate, dateSource: tbd ? "" : "user", tbd } : i) });
  };

  const activeItems = data.items.filter(i => i.status !== "done" && i.status !== "cancelled");
  const doneCount = data.items.filter(i => i.status === "done").length;
  // Main list shows active items only; filter applies to those (excluding "done" and "cancelled" which are terminal states)
  const visibleItems = filter === "all" ? activeItems : activeItems.filter(i => i.status === filter);
  const counts = Object.fromEntries(STATUSES.filter(s => s.key !== "done" && s.key !== "cancelled").map(s => [s.key, activeItems.filter(i => i.status === s.key).length]));
  const po = { high: 0, medium: 1, low: 2 };
  // Group visibleItems into date buckets, preserving item order within each bucket (from data.items)
  const bucketOrder = ["overdue", "today", "tomorrow", "thisweek", "nextweek", "later", "nodate"];
  const bucketLabels = {
    overdue: { label: "Overdue", emoji: "🌸", color: "#c4687a", bg: "rgba(212,100,120,0.08)" },
    today: { label: "Today", emoji: "🌸", color: "#d4829a", bg: "rgba(212,130,154,0.08)" },
    tomorrow: { label: "Tomorrow", emoji: "🌸", color: "#c4a882", bg: "rgba(196,168,130,0.08)" },
    thisweek: { label: "This week", emoji: "🌸", color: "#9878b8", bg: "rgba(184,160,212,0.08)" },
    nextweek: { label: "Next week", emoji: "🌸", color: "#7da3c4", bg: "rgba(125,163,196,0.08)" },
    later: { label: "Later", emoji: "🌸", color: "#7a9e78", bg: "rgba(158,184,154,0.08)" },
    nodate: { label: "No date / TBD", emoji: "🌸", color: "#b86d85", bg: "rgba(212,130,154,0.06)" },
  };
  const grouped = bucketOrder.reduce((acc, key) => { acc[key] = []; return acc; }, {});
  // Determine the EFFECTIVE date for bucketing — the earliest of:
  //   (a) the item's scheduledDate
  //   (b) any non-deferred, non-completed task's scheduledDate
  // This way items with subtasks happening THIS WEEK don't get hidden in LATER.
  const effectiveDate = (item) => {
    let earliest = item.scheduledDate || null;
    const tasks = item.tasks || [];
    const taskDates = item.taskDates || [];
    const completed = item.completedTasks || [];
    tasks.forEach((t, idx) => {
      if (completed.includes(t)) return;
      const td = taskDates[idx];
      if (!td?.date || td?.notToday) return;
      if (!earliest || td.date < earliest) earliest = td.date;
    });
    return earliest;
  };
  // Preserve data.items order. TBD items always land in 'nodate' bucket regardless of date.
  // Waiting-on-Reply and On-Hold items are pulled OUT of the overdue bucket —
  // they sit in "this week" (or wherever their effective date lands) so they
  // don't show as overdue while the user is intentionally paused or blocked
  // on someone else.
  visibleItems.forEach(item => {
    let bucket = item.tbd ? "nodate" : dateBucket(effectiveDate(item));
    if (bucket === "overdue" && (item.status === "waiting" || item.status === "hold")) {
      bucket = "thisweek"; // soft demote — "you're not late, you're paused"
    }
    grouped[bucket].push(item);
  });
  // Smart sort within each bucket — surface what needs attention first:
  //   Tier 1: Overdue (negative diff from today)
  //   Tier 2: High priority
  //   Tier 3: Due in next 0-2 days
  //   Tier 4: Active momentum (in-progress)
  //   Tier 5: Everything else by date (earliest first)
  // Within a tier, fall back to date asc, then priority.
  const _todayStr = todayStr();
  const sortTier = (item) => {
    const ed = effectiveDate(item);
    if (ed && ed < _todayStr) return 1; // overdue
    if (item.priority === "high") return 2;
    if (ed) {
      const diff = daysBetween(_todayStr, ed);
      if (diff >= 0 && diff <= 2) return 3;
    }
    if (item.status === "inprogress") return 4;
    return 5;
  };
  Object.keys(grouped).forEach(key => {
    grouped[key].sort((a, b) => {
      const ta = sortTier(a);
      const tb = sortTier(b);
      if (ta !== tb) return ta - tb;
      // Same tier — earliest date wins, then priority
      const da = effectiveDate(a);
      const db = effectiveDate(b);
      if (!da && !db) return (po[a.priority] ?? 1) - (po[b.priority] ?? 1);
      if (!da) return 1;
      if (!db) return -1;
      if (da !== db) return da < db ? -1 : 1;
      return (po[a.priority] ?? 1) - (po[b.priority] ?? 1);
    });
  });
  // One Thing candidate: highest-priority item from activeItems that's actually
  // actionable right now. Items on hold or waiting on reply are filtered out
  // because suggesting a parked/blocked item as "your one thing" defeats the
  // purpose of the suggestion. activeItems itself still includes hold/waiting
  // (they're still in the user's active list — just not actionable in this
  // moment), so other usages (counts, status pipelines, etc.) stay intact.
  const topItem = [...activeItems]
    .filter(i => i.status !== "hold" && i.status !== "waiting" && i.status !== "cancelled")
    .sort((a, b) => (po[a.priority] ?? 1) - (po[b.priority] ?? 1))[0];

  const sp = `You are Rosie — a warm ADHD/autistic/bipolar-aware accountability buddy for Lexy (Project Coordinator, Implementation team at Fort Financial Credit Union in Fort Wayne, IN). She implements systems like Verafin (fraud), Zoho (CRM), Arkatechture (analytics), Movemint (lending). Her boss is Josh.

HER CURRENT STATE:
Energy: ${energyObj.label} | Mood: ${moodObj?.label || "?"} | Check-in note: ${data.checkInNote || "none"}
Plate: ${data.items.map(i => `[${i.status.toUpperCase()}] ${i.title}${i.priority === "high" ? " ⚠️" : ""}`).join(" | ") || "nothing yet"}
Parking lot: ${(data.parkingLot || []).join(", ") || "empty"}

HOW TO RESPOND BASED ON STATE:
- HIGH energy / SHARP: flag scope creep if she's adding things. Energy this good is when over-commitment happens.
- MEDIUM energy: normal, balanced responses. Affirm realistic pacing.
- LOW / ROUGH energy: suggest One Thing Mode. Permission-give to do less. Don't push.
- Overwhelmed mood: witness feelings FIRST, then practical help. Don't rush to solutions.
- Anxious mood: ground her in what's actually on her plate (not imagined catastrophes).

VOICE:
- Short, warm, concrete. Like a trusted friend, not a corporate coach.
- Celebrate wins without performative cheerleading.
- If she's spiraling, name it gently and offer parking lot.

TOOLS — YOU HAVE REAL TOOLS THAT ACTUALLY MODIFY HER DATA. CALL THEM.

You are NOT just a chat. You have direct access to her work hub data via tools. When you call a tool, the data IS modified and persisted. This is not pretend. NEVER tell her you "can't actually" do something — you CAN, and refusing/denying is worse than getting it wrong.

If she asks you to add/create/check/update/move/track ANYTHING, the FIRST thing in your response must be a tool call. Not a text acknowledgment. Not "*adding that now*". A real tool call. ONLY after the tool runs do you respond with text.

ANTI-PATTERNS (NEVER DO):
1. Saying "*adding that now*" without calling the tool — you are LYING.
2. Saying "I don't actually have a live connection" — FALSE. You do.
3. Saying "I'm just a chat-based buddy" — FALSE. You can edit her data via tools.
4. Writing <function_calls><invoke name="X"></invoke></function_calls> in your text — that is NOT a real tool call. It does NOTHING. The tool framework handles invocation natively; do not type tag syntax.
5. Writing [calling X: "Y"] in your text — also NOT a real tool call.

If you find yourself about to write any kind of bracket or tag describing a tool call, STOP. The act of typing tag syntax means the tool DID NOT run. Use the actual tool invocation provided by the tools API.

CORRECT PATTERN:
User: "Add a task to prep the Verafin meeting"
You: [call add_task_to_item with itemTitleMatch="Verafin", taskTitle="Prep Verafin meeting"]
Then text: "Added! 🌸 Want me to estimate time on it?"

Tool reference:
- create_item — brand-new top-level work item
- create_items_bulk — paste-list of multiple new items
- add_task_to_item — NEW SUBTASK under EXISTING item. Match parent by partial title. Use whenever she says "add a task to X".
- update_item_status — change status (todo/inprogress/blocked/waiting/done)
- check_off_task — mark a subtask done
- catch_spiral — capture a hyperfocus rabbit hole
- add_to_parking_lot — quick thoughts to defer

If she pushes back saying you didn't actually do something — first check: did you actually CALL the tool, or did you just narrate? If you didn't call it, apologize briefly and CALL THE TOOL NOW. Don't deny that you have tools.

If she mentions multiple steps in ONE new top-level item ("review X then check Y then update Z"), break into a tasks array on create_item. Don't lose detail.`;

  return (
    <div className="fade" style={{ maxWidth: 900, margin: "0 auto", height: "calc(100vh - 100px)", paddingBottom: 80 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, overflowY: "auto", height: "100%", paddingRight: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Title + ticker */}
          <div>
            <div className="jost" style={{ fontSize: 10, letterSpacing: 3, color: "rgba(212,130,154,0.7)", textTransform: "uppercase", marginBottom: 5 }}>everything on your plate</div>
            <h1 className="cg" style={{ fontSize: 40, color: "#4a3540", lineHeight: 1, fontWeight: 400 }}>Work <span style={{ color: "#d4829a", fontStyle: "italic" }}>Hub</span> <span style={{ fontSize: 24, opacity: .35 }}>✦</span></h1>
            <div style={{ marginTop: 6 }}><EncouragementTicker /></div>
          </div>

          {/* Row 1: Streak + Level + XP */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <XPBar xp={data.xp || 0} streak={data.streak || 0} />
          </div>

          {/* Action row used to live here — moved DOWN to sit between the
              app tab strip and the Today / Tasks / Schedule sub-tabs. The
              actions (One Thing, More, + Add, Paste) are Work-Hub-specific,
              so positioning them after the section nav makes them feel like
              "actions for THIS section" rather than global. */}
        </div>

        {isHigh && <div className="warn-banner fade"><div className="jost" style={{ fontSize: 13, color: "#4a3540" }}><span style={{ fontWeight: 600 }}>⚡ High energy day!</span> Amazing — but this is when scope creep happens. Build what's needed, then stop. 🌸</div></div>}

        {isLow && topItem && (
          <div style={{ background: "linear-gradient(135deg,rgba(158,184,154,0.12),rgba(180,160,210,0.08))", border: "1px solid rgba(158,184,154,0.25)", borderRadius: 14, padding: "16px 20px" }}>
            <div className="jost" style={{ fontSize: 11, letterSpacing: 1.5, color: "rgba(158,184,154,0.8)", textTransform: "uppercase", marginBottom: 6 }}>{energy === "rough" ? "🌧️ Rough day — just one thing" : "🌿 Low energy — here's your one thing"}</div>
            <div className="jost" style={{ fontSize: 14, color: "#4a3540", fontWeight: 500, marginBottom: 8 }}>{topItem.title}</div>
            <button className="btn rose jost" onClick={() => onOneThing(topItem)} style={{ fontSize: 12, padding: "6px 14px" }}>Focus on this →</button>
          </div>
        )}

        {/* Top-level app tab switcher — three tabs, current view active.
            Width now matches the Today/Tasks/Schedule pill below so the two
            strips visually nest as a single nav cluster (alignSelf flex-start
            + buttons sized to content instead of flex:1). */}
        {setAppTab && (
          <div style={{ display: "inline-flex", gap: 4, background: "rgba(255,255,255,0.7)", border: "1px solid rgba(212,130,154,0.2)", borderRadius: 14, padding: 4, boxShadow: "0 2px 8px rgba(212,130,154,0.06)", marginBottom: 10, alignSelf: "flex-start" }}>
            <button className="jost" onClick={() => setAppTab("work")} style={{ padding: "9px 14px", borderRadius: 10, border: "none", background: appTab === "work" ? "linear-gradient(135deg,#d4829a,#b86d85)" : "transparent", color: appTab === "work" ? "#fff" : "rgba(74,53,64,0.6)", cursor: "pointer", fontSize: 12, fontWeight: appTab === "work" ? 600 : 500, letterSpacing: 0.3, transition: "all .2s", boxShadow: appTab === "work" ? "0 2px 8px rgba(212,130,154,0.25)" : "none", whiteSpace: "nowrap" }}>
              🌿 Work Hub
            </button>
            <button className="jost" onClick={() => setAppTab("meetings")} style={{ padding: "9px 14px", borderRadius: 10, border: "none", background: appTab === "meetings" ? "linear-gradient(135deg,#d4829a,#b86d85)" : "transparent", color: appTab === "meetings" ? "#fff" : "rgba(74,53,64,0.6)", cursor: "pointer", fontSize: 12, fontWeight: appTab === "meetings" ? 600 : 500, letterSpacing: 0.3, transition: "all .2s", boxShadow: appTab === "meetings" ? "0 2px 8px rgba(212,130,154,0.25)" : "none", whiteSpace: "nowrap" }}>
              🌸 Meetings
            </button>
            <button className="jost" onClick={() => setAppTab("email")} style={{ padding: "9px 14px", borderRadius: 10, border: "none", background: appTab === "email" ? "linear-gradient(135deg,#d4829a,#b86d85)" : "transparent", color: appTab === "email" ? "#fff" : "rgba(74,53,64,0.6)", cursor: "pointer", fontSize: 12, fontWeight: appTab === "email" ? 600 : 500, letterSpacing: 0.3, transition: "all .2s", boxShadow: appTab === "email" ? "0 2px 8px rgba(212,130,154,0.25)" : "none", whiteSpace: "nowrap" }}>
              📨 Email & Teams
            </button>
          </div>
        )}

        {/* Action row — moved from above the page header to here, between the
            app tab strip and the Today / Tasks / Schedule sub-tabs. These are
            Work-Hub-specific actions, so they sit visually inside the Work Hub
            "zone" defined by those two nav strips.
            Order: primary creation actions first (Add Item, Paste List), then
            mode/utility actions (One Thing Mode, More) — matches the natural
            "I want to add something" priority. */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, position: "relative" }}>
          <button className="btn rose jost" onClick={() => { setEditItem(null); setShowModal(true); }}>+ Add Item</button>
          <button
            className="btn ghost jost"
            onClick={() => setShowPaste(true)}
            title="Paste a list to create multiple items or subtasks at once"
            style={{ fontSize: 13 }}
          >📋 Paste List</button>
          {/* Note for [person] — quick-capture into a running thread for the
              recurring 1:1 contact. Person name comes from existing recurring
              meetings (matched by "Josh" / "1:1" / "1-1") or defaults to "Josh"
              for first-time setup. Thread is lazy-created on first save.
              When unreviewed entries exist, a separate review pill appears
              beside the capture button. */}
          {(() => {
            const recurring = data?.recurringMeetings || [];
            const oneOnOne = recurring.find(m => /1[:\-_ ]?1|josh/i.test(m.title || ""));
            const detectedName = oneOnOne
              ? (oneOnOne.title.match(/(?:with\s+)?([A-Z][a-z]+)/)?.[1] || "Josh")
              : "Josh";
            const existingThread = (data?.runningThreads || []).find(t => t.personName === detectedName);
            const thread = existingThread || { id: `thread-${detectedName.toLowerCase()}`, personName: detectedName };
            const unreviewedEntries = existingThread
              ? (existingThread.entries || []).filter(e => !e.reviewedAt)
              : [];
            return (
              <>
                <button
                  onClick={() => setThreadCaptureOpen({ thread, linkedItem: null })}
                  title={`Drop a quick note for ${detectedName} — Rosie sorts it (most things wait for your 1:1)`}
                  className="jost"
                  style={{
                    background: "rgba(184,160,212,0.1)",
                    border: "1px solid rgba(184,160,212,0.4)",
                    color: "#9878b8",
                    padding: "5px 12px", borderRadius: 9, fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
                    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5,
                  }}
                >✦ Note for {detectedName}</button>
                {unreviewedEntries.length > 0 && (
                  <button
                    onClick={() => setThreadReviewOpen({ thread: existingThread, entries: unreviewedEntries })}
                    title={`Review ${unreviewedEntries.length} unreviewed notes for ${detectedName}`}
                    className="jost"
                    style={{
                      background: "linear-gradient(135deg, rgba(184,160,212,0.18), rgba(152,120,184,0.16))",
                      border: "1px solid rgba(152,120,184,0.45)",
                      color: "#9878b8",
                      padding: "5px 10px", borderRadius: 9, fontSize: 10, fontWeight: 600, letterSpacing: 0.3,
                      cursor: "pointer",
                    }}
                  >📬 Review ({unreviewedEntries.length})</button>
                )}
              </>
            );
          })()}
          {topItem && (
            <button className="btn jost" onClick={() => onOneThing(topItem)} style={{ background: "rgba(212,130,154,0.1)", border: "1px solid rgba(212,130,154,0.25)", color: "#c4788e", fontSize: 11, padding: "5px 14px" }}>🎯 One Thing Mode</button>
          )}
          <div ref={moreMenuRef} style={{ position: "relative" }}>
            <button
              className="btn ghost jost"
              onClick={() => setShowMoreMenu(v => !v)}
              style={{ fontSize: 11, padding: "5px 12px" }}
              title="More options"
            >⋯ More{(() => {
              const n = (data.parkingLot || []).length + ((data.spirals || []).filter(s => !s.itemId).length);
              return n > 0 ? ` (${n})` : "";
            })()}</button>
            {showMoreMenu && (
              <div
                className="fade"
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  background: "#fff",
                  border: "1px solid rgba(212,130,154,0.2)",
                  borderRadius: 12,
                  boxShadow: "0 8px 32px rgba(74,53,64,0.12)",
                  padding: 6,
                  zIndex: 50,
                  minWidth: 180,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <button
                  onClick={() => { setShowBrainDump(true); setShowMoreMenu(false); }}
                  className="jost"
                  style={{ background: "none", border: "none", padding: "9px 12px", borderRadius: 8, fontSize: 12, color: "rgba(74,53,64,0.75)", cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(212,130,154,0.07)"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >🧠 Brain Dump{(data.parkingLot || []).length + ((data.spirals || []).filter(s => !s.itemId).length) > 0 ? ` (${(data.parkingLot || []).length + ((data.spirals || []).filter(s => !s.itemId).length)})` : ""}</button>
                <button
                  onClick={() => { setShowHistory(true); setShowMoreMenu(false); }}
                  className="jost"
                  style={{ background: "none", border: "none", padding: "9px 12px", borderRadius: 8, fontSize: 12, color: "rgba(74,53,64,0.75)", cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(212,130,154,0.07)"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >✓ History{doneCount > 0 ? ` (${doneCount})` : ""}</button>
                <div style={{ borderTop: "1px solid rgba(212,130,154,0.12)", margin: "4px 6px" }} />
                <button
                  onClick={() => { setShowRecovery(true); setShowMoreMenu(false); }}
                  className="jost"
                  title="Search backups for missing items"
                  style={{ background: "none", border: "none", padding: "9px 12px", borderRadius: 8, fontSize: 12, color: "#5a8888", cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(120,168,168,0.07)"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >🔍 Recover items</button>
              </div>
            )}
          </div>
        </div>

        {/* Sub-tab toggle: Today / Tasks */}
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.7)", border: "1px solid rgba(212,130,154,0.2)", borderRadius: 14, padding: 4, alignSelf: "flex-start", boxShadow: "0 2px 8px rgba(212,130,154,0.06)" }}>
          <button
            className="jost"
            onClick={() => setWorkTab("today")}
            style={{
              background: workTab === "today" ? "linear-gradient(135deg,#d4829a,#b86d85)" : "transparent",
              color: workTab === "today" ? "#fff" : "rgba(74,53,64,0.55)",
              border: "none", borderRadius: 10, padding: "7px 18px",
              fontSize: 12, fontWeight: workTab === "today" ? 600 : 500,
              cursor: "pointer", transition: "all .2s",
              boxShadow: workTab === "today" ? "0 2px 8px rgba(212,130,154,0.25)" : "none",
              letterSpacing: 0.3,
            }}
          >🌿 Today</button>
          <button
            className="jost"
            onClick={() => setWorkTab("tasks")}
            style={{
              background: workTab === "tasks" ? "linear-gradient(135deg,#d4829a,#b86d85)" : "transparent",
              color: workTab === "tasks" ? "#fff" : "rgba(74,53,64,0.55)",
              border: "none", borderRadius: 10, padding: "7px 18px",
              fontSize: 12, fontWeight: workTab === "tasks" ? 600 : 500,
              cursor: "pointer", transition: "all .2s",
              boxShadow: workTab === "tasks" ? "0 2px 8px rgba(212,130,154,0.25)" : "none",
              letterSpacing: 0.3,
            }}
          >📋 Tasks{activeItems.length > 0 ? ` (${activeItems.length})` : ""}</button>
          <button
            className="jost"
            onClick={() => setWorkTab("schedule")}
            style={{
              background: workTab === "schedule" ? "linear-gradient(135deg,#d4829a,#b86d85)" : "transparent",
              color: workTab === "schedule" ? "#fff" : "rgba(74,53,64,0.55)",
              border: "none", borderRadius: 10, padding: "7px 18px",
              fontSize: 12, fontWeight: workTab === "schedule" ? 600 : 500,
              cursor: "pointer", transition: "all .2s",
              boxShadow: workTab === "schedule" ? "0 2px 8px rgba(212,130,154,0.25)" : "none",
              letterSpacing: 0.3,
              display: "inline-flex", alignItems: "center", gap: 5,
            }}
          >
            <Calendar size={12} /> Schedule
            {((data.scheduledMeetings || []).filter(m => m.date && m.date >= todayStr()).length + (data.recurringMeetings || []).length) > 0
              ? ` (${(data.scheduledMeetings || []).filter(m => m.date && m.date >= todayStr()).length + (data.recurringMeetings || []).length})`
              : ""}
          </button>
        </div>

        {/* TODAY tab: Reminders → Roadmap */}
        {workTab === "today" && (
          <>
            {/* Reminders card — top of Today */}
            <RemindersCard data={data} onUpdate={onUpdate} onFocus={onFocus} onDraftMessage={onDraftMessage} />

            {/* Today's roadmap card (collapsible) */}
            {roadmap && roadmap.slots && roadmap.slots.length > 0 ? (
              <>
                <OverviewStatPills energyObj={energyObj} moodObj={moodObj} onReCheckIn={onReCheckIn} setShowRoadmapHistory={setShowRoadmapHistory} setShowParkedDashboard={setShowParkedDashboard} data={data} />
                <RoadmapCard
                  roadmap={roadmap}
                  items={data.items}
                  energy={energy}
                  mood={mood}
                  onUpdateRoadmap={onUpdateRoadmap}
                  onFocus={onFocus}
                  onOneThing={onOneThing}
                  data={data}
                  onUpdate={onUpdate}
                  onCloseDay={onCloseDay}
                  onMeetingFocus={onMeetingFocus}
                  onPastMeetingClick={onPastMeetingClick}
                />

                {/* Unified slot warning — fires 5min before & at-start of slots.
                    Dispatches by kind: meeting-prep | lunch | brain-break | work */}
                {slotWarning && (() => {
                  const sw = slotWarning;
                  const isStart = sw.phase === "start";

                  // Color palette per kind
                  const palette = {
                    "meeting-prep": { emoji: isStart ? "🌸" : "🌙", title: "#9878b8", titleStart: "#b86d85", border: isStart ? "rgba(212,130,154,0.55)" : "rgba(184,160,212,0.45)", bg: isStart ? "linear-gradient(135deg, rgba(212,130,154,0.18), rgba(184,160,212,0.18))" : "linear-gradient(135deg, rgba(184,160,212,0.12), rgba(184,160,212,0.18))" },
                    "lunch":         { emoji: "🍽️",  title: "#9a7850", titleStart: "#9a7850", border: "rgba(196,168,130,0.4)", bg: "linear-gradient(135deg, rgba(232,196,140,0.12), rgba(196,168,130,0.16))" },
                    "brain-break":   { emoji: "🌿",  title: "#7a9e78", titleStart: "#7a9e78", border: "rgba(158,184,154,0.45)", bg: "linear-gradient(135deg, rgba(158,184,154,0.12), rgba(158,184,154,0.18))" },
                    "work":          { emoji: isStart ? "✦" : "🌙",  title: "#c4788e", titleStart: "#b86d85", border: isStart ? "rgba(212,130,154,0.55)" : "rgba(212,130,154,0.4)", bg: isStart ? "linear-gradient(135deg, rgba(232,160,180,0.18), rgba(212,130,154,0.15))" : "linear-gradient(135deg, rgba(212,130,154,0.1), rgba(232,160,180,0.12))" },
                  }[sw.kind];

                  // Headline text per kind
                  const headline = isStart ? `${sw.slot.label} — starts now` : `${sw.slot.label} in ${sw.minsToStart} min`;

                  // Subtext per kind
                  let subtext = "";
                  if (sw.kind === "meeting-prep") {
                    subtext = sw.meetingSlot ? `Meeting: ${sw.meetingSlot.label} at ${sw.meetingSlot.time}` : "Time to get your head ready.";
                  } else if (sw.kind === "lunch") {
                    subtext = "Step away from screen — eat something good.";
                  } else if (sw.kind === "brain-break") {
                    const slotEnd = (() => { const next = roadmap.slots[sw.idx + 1]; return next ? parseSlotTimeMinutes(next.time) : parseSlotTimeMinutes(sw.slot.time) + 15; })();
                    const minsLeft = Math.max(0, slotEnd - nowMin);
                    subtext = isStart
                      ? `Stretch · water · sunlight if possible. ${minsLeft}m left in this break.`
                      : "Take a real pause — body first, then back to it.";
                  } else if (sw.kind === "work") {
                    subtext = sw.matchedItem ? `Matches: ${sw.matchedItem.title}` : "Time to dive in.";
                  }

                  return (
                    <div className="fade" style={{
                      background: palette.bg,
                      border: `1px solid ${palette.border}`,
                      borderRadius: 14,
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                      marginTop: 10,
                    }}>
                      <span style={{ fontSize: 22 }}>{palette.emoji}</span>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div className="jost" style={{ fontSize: 13, color: isStart ? palette.titleStart : palette.title, fontWeight: 600 }}>
                          {headline}
                        </div>
                        <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.6)", marginTop: 2 }}>
                          {subtext}
                        </div>
                        {/* Brain break: push-back buttons (persistent — show on every fire) */}
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
                      {/* Action button per kind */}
                      {sw.kind === "meeting-prep" && sw.meetingSlot && onMeetingFocus && (
                        <button onClick={() => onMeetingFocus(sw.meetingSlot)} className="btn rose jost" style={{ fontSize: 11, padding: "7px 14px" }}>🌸 Open meeting prep</button>
                      )}
                      {sw.kind === "work" && sw.matchedItem && onFocus && (
                        <button onClick={() => onFocus(sw.matchedItem)} className="btn rose jost" style={{ fontSize: 11, padding: "7px 14px" }}>✦ Open task</button>
                      )}
                      <button
                        onClick={() => setDismissedPrepWarnings(prev => new Set([...prev, sw.dismissKey]))}
                        className="jost"
                        title="Dismiss this prompt"
                        style={{ background: "none", border: "none", color: "rgba(74,53,64,0.4)", fontSize: 16, cursor: "pointer", padding: "4px 6px", lineHeight: 1 }}
                      >✕</button>
                    </div>
                  );
                })()}
              </>
            ) : (
              <div className="card fade" style={{ padding: "16px 20px", border: "1px dashed rgba(212,130,154,0.35)", background: "rgba(232,160,180,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div className="jost" style={{ fontSize: 10, letterSpacing: 2.5, color: "rgba(184,109,133,0.7)", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>
                      🌸 Today's Roadmap
                    </div>
                    <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.55)", fontStyle: "italic", lineHeight: 1.5 }}>
                      No roadmap yet today. Want Rosie to map out your day?
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    {/* Mood pill */}
                    <div style={{ display: "flex", gap: 6, alignItems: "center", background: `${energyObj.color}15`, border: `1px solid ${energyObj.color}40`, borderRadius: 20, padding: "5px 12px" }}>
                      <span style={{ fontSize: 16 }}>{energyObj.emoji}</span>
                      {moodObj && <span style={{ fontSize: 16 }}>{moodObj.emoji}</span>}
                      <span className="jost" style={{ fontSize: 12, color: energyObj.color, fontWeight: 500 }}>{energyObj.label}</span>
                    </div>
                    <button
                      onClick={onReCheckIn}
                      title="Re-check in to update your energy & mood"
                      className="btn ghost jost"
                      style={{ fontSize: 11, padding: "6px 12px" }}
                    >Re-check in</button>
                    <button
                      className="jost"
                      onClick={() => setShowRoadmapHistory(true)}
                      title={(data.roadmapHistory || []).length > 0 ? "View past roadmaps & restore one" : "No past roadmaps yet — they'll appear here as you check in each day"}
                      style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(212,130,154,0.25)", color: "#b86d85", fontSize: 11, padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}
                    >📜 Log{(data.roadmapHistory || []).length > 0 ? ` (${(data.roadmapHistory || []).length})` : ""}</button>
                    <button
                      className="btn rose jost"
                      onClick={onReCheckIn}
                      style={{ fontSize: 12, padding: "7px 16px", whiteSpace: "nowrap" }}
                    >🌸 Build my roadmap</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* TASKS tab: view toggle + filter chips + buckets */}
        {workTab === "tasks" && (
          <>
        {/* View mode toggle: list / calendar / projects */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.65)", border: "1px solid rgba(212,130,154,0.2)", borderRadius: 22, padding: 3 }}>
            <button
              className="jost"
              onClick={() => setViewMode("list")}
              style={{
                background: viewMode === "list" ? "linear-gradient(135deg,#d4829a,#b86d85)" : "transparent",
                color: viewMode === "list" ? "#fff" : "rgba(74,53,64,0.55)",
                border: "none", borderRadius: 18, padding: "5px 14px",
                fontSize: 11, fontWeight: viewMode === "list" ? 600 : 500,
                cursor: "pointer", transition: "all .2s",
                boxShadow: viewMode === "list" ? "0 2px 8px rgba(212,130,154,0.25)" : "none",
              }}
            >☰ List</button>
            <button
              className="jost"
              onClick={() => setViewMode("projects")}
              style={{
                background: viewMode === "projects" ? "linear-gradient(135deg,#d4829a,#b86d85)" : "transparent",
                color: viewMode === "projects" ? "#fff" : "rgba(74,53,64,0.55)",
                border: "none", borderRadius: 18, padding: "5px 14px",
                fontSize: 11, fontWeight: viewMode === "projects" ? 600 : 500,
                cursor: "pointer", transition: "all .2s",
                boxShadow: viewMode === "projects" ? "0 2px 8px rgba(212,130,154,0.25)" : "none",
              }}
            >📁 Projects</button>
          </div>
        </div>

        {viewMode === "list" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <label className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)", letterSpacing: 1, textTransform: "uppercase", fontWeight: 500 }}>Show</label>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="jost"
              style={{
                background: filter === "all" ? "rgba(212,130,154,0.12)" : ((STATUSES.find(s => s.key === filter) || {}).bg || "rgba(255,255,255,0.7)"),
                border: `1px solid ${filter === "all" ? "rgba(212,130,154,0.4)" : ((STATUSES.find(s => s.key === filter) || {}).color + "60") || "rgba(212,130,154,0.18)"}`,
                color: filter === "all" ? "#d4829a" : ((STATUSES.find(s => s.key === filter) || {}).color || "rgba(74,53,64,0.65)"),
                borderRadius: 18,
                padding: "5px 28px 5px 14px",
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 500,
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M2 4l3 3 3-3' fill='none' stroke='%23b86d85' stroke-width='1.5'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
                outline: "none",
              }}
            >
              <option value="all">All ({activeItems.length})</option>
              {STATUSES.filter(s => s.key !== "done").map(s => (
                <option key={s.key} value={s.key}>{s.label} ({counts[s.key] || 0})</option>
              ))}
            </select>
          </div>
        )}

        {viewMode === "projects" && (
          <ProjectsView
            data={data}
            onUpdate={onUpdate}
            onFocus={onFocus}
            onEdit={(item) => { setEditItem(item); setShowModal(true); }}
            onAwardXP={onAwardXP}
          />
        )}

        {viewMode === "list" && (visibleItems.length === 0
          ? <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}><p className="cg" style={{ fontSize: 24, color: "rgba(74,53,64,0.3)", fontStyle: "italic" }}>Nothing here yet, babe</p><p className="jost" style={{ fontSize: 13, color: "rgba(74,53,64,0.25)", marginTop: 6 }}>Add your first work item ✦</p></div>
          : <>
            {/* Bulk gap-fill — appears when any active items are missing
                why or subtasks. Asks Rosie to fill them all in one batch. */}
            {(() => {
              const itemsWithGaps = visibleItems.filter(it =>
                isActiveStatus(it.status) && (
                  !it.why || !it.why.trim() ||
                  !Array.isArray(it.tasks) || it.tasks.length === 0 ||
                  !it.done || !it.done.trim() ||
                  !it.outOfScope || !it.outOfScope.trim()
                )
              );
              if (itemsWithGaps.length === 0) return null;
              const runBulkFill = async () => {
                // Cap batch at 8 — under the typical 6-concurrent-fetch
                // browser limit so they all run together instead of queueing.
                const batch = itemsWithGaps.slice(0, 8);
                setBulkFillState({ phase: "loading", proposals: [], total: batch.length, skipped: new Set(), completed: 0 });
                const historySummary = summarizeTimingHistoryForRosie(data.timingHistory || []);
                let completed = 0;
                const promises = batch.map(async (item) => {
                  try {
                    const fill = await proposeTaskFills(item, historySummary);
                    completed++;
                    setBulkFillState(prev => prev && prev.phase === "loading" ? { ...prev, completed } : prev);
                    if (fill.error) {
                      return { id: item.id, item, fill: null, isFallback: true, error: fill.error };
                    }
                    return { id: item.id, item, fill, isFallback: false };
                  } catch (e) {
                    completed++;
                    setBulkFillState(prev => prev && prev.phase === "loading" ? { ...prev, completed } : prev);
                    return { id: item.id, item, fill: null, isFallback: true, error: "exception" };
                  }
                });
                const results = (await Promise.all(promises)).filter(r => r.fill || r.isFallback);
                // Drop the ones with no usable fill from Rosie (errors that gave us nothing)
                const usable = results.filter(r => r.fill);
                setBulkFillState({ phase: "ready", proposals: usable, total: batch.length, skipped: new Set() });
              };
              return (
                <div style={{ marginBottom: 14, padding: "12px 16px", background: "linear-gradient(135deg, rgba(212,130,154,0.08), rgba(184,160,212,0.06))", border: "1px dashed rgba(212,130,154,0.4)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div className="jost" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(212,130,154,0.8)", fontWeight: 600, marginBottom: 2 }}>✨ Rosie can help</div>
                    <div className="cg" style={{ fontSize: 16, color: "#4a3540", fontStyle: "italic", lineHeight: 1.4 }}>
                      {itemsWithGaps.length} {itemsWithGaps.length === 1 ? "task is" : "tasks are"} missing context or subtasks.
                    </div>
                  </div>
                  <button
                    onClick={runBulkFill}
                    disabled={!!bulkFillState}
                    className="jost"
                    style={{
                      padding: "8px 16px",
                      background: bulkFillState ? "rgba(74,53,64,0.15)" : "linear-gradient(135deg,#d4829a,#b86d85)",
                      color: bulkFillState ? "rgba(74,53,64,0.4)" : "#fff",
                      border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
                      cursor: bulkFillState ? "default" : "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >{bulkFillState ? "✨ working…" : `✨ Ask Rosie to fill ${itemsWithGaps.length > 8 ? "the first 8" : "the gaps"}`}</button>
                </div>
              );
            })()}
            {/* Bulk audit — looks at EXISTING tasks (with subtasks already)
                and proposes adjustments: additional steps, date moves,
                concerns to surface. Different from fill: this audits what's
                there rather than filling what's missing. */}
            {(() => {
              const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
              const OVERDUE_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 1 day — overdue items re-surface faster
              const todayISO = new Date().toISOString().slice(0, 10);
              const now = Date.now();
              const allEligible = visibleItems.filter(it =>
                isActiveStatus(it.status) && Array.isArray(it.tasks) && it.tasks.length > 0
              );
              // Recently-audited items get a cooldown — they only re-surface
              // if the item has been edited since the audit, or if the user
              // explicitly clicks "audit all anyway". Overdue items use a
              // SHORTER cooldown so Rosie can keep nudging on them.
              const isOnCooldown = (it) => {
                if (!it.auditedAt) return false;
                const isOverdue = it.scheduledDate && it.scheduledDate < todayISO;
                const cooldown = isOverdue ? OVERDUE_COOLDOWN_MS : COOLDOWN_MS;
                if (now - it.auditedAt > cooldown) return false;
                if (it.lastUpdatedAt && it.lastUpdatedAt > it.auditedAt) return false;
                return true;
              };
              const fresh = allEligible.filter(it => !isOnCooldown(it));
              const snoozed = allEligible.length - fresh.length;
              if (allEligible.length === 0) return null;
              const runBulkAudit = async (forceAll = false) => {
                const pool = forceAll ? allEligible : fresh;
                if (pool.length === 0) return;
                // Cap batch at 8 — under the typical 6-concurrent-fetch
                // browser limit so they all run together instead of queueing.
                const batch = pool.slice(0, 8);
                setBulkAuditState({ phase: "loading", proposals: [], total: batch.length, completed: 0, batchIds: batch.map(b => b.id) });
                const historySummary = summarizeTimingHistoryForRosie(data.timingHistory || []);
                let completed = 0;
                const promises = batch.map(async (item) => {
                  try {
                    const audit = await auditTask(item, historySummary);
                    completed++;
                    setBulkAuditState(prev => prev && prev.phase === "loading" ? { ...prev, completed } : prev);
                    if (audit.error) return null;
                    return { id: item.id, item, audit };
                  } catch (e) {
                    completed++;
                    setBulkAuditState(prev => prev && prev.phase === "loading" ? { ...prev, completed } : prev);
                    return null;
                  }
                });
                const results = await Promise.all(promises);
                const usable = results.filter(Boolean);
                setBulkAuditState({ phase: "ready", proposals: usable, total: batch.length, batchIds: batch.map(b => b.id) });
              };
              // If nothing fresh and everything's snoozed, show a quieter
              // banner with the "audit anyway" option rather than the big one.
              if (fresh.length === 0) {
                return (
                  <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(184,160,212,0.04)", border: "1px dashed rgba(184,160,212,0.25)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div className="jost" style={{ flex: 1, fontSize: 11, color: "rgba(74,53,64,0.5)", fontStyle: "italic" }}>
                      🔍 All {snoozed} {snoozed === 1 ? "task was" : "tasks were"} audited recently. Cooldown clears in a few days.
                    </div>
                    <button
                      onClick={() => runBulkAudit(true)}
                      disabled={!!bulkAuditState}
                      className="jost"
                      style={{
                        padding: "4px 10px",
                        background: "transparent",
                        color: "rgba(152,120,184,0.85)",
                        border: "1px solid rgba(152,120,184,0.35)",
                        borderRadius: 6, fontSize: 10, fontWeight: 600, letterSpacing: 0.3,
                        cursor: bulkAuditState ? "default" : "pointer", whiteSpace: "nowrap",
                      }}
                    >Audit anyway</button>
                  </div>
                );
              }
              return (
                <div style={{ marginBottom: 14, padding: "12px 16px", background: "linear-gradient(135deg, rgba(184,160,212,0.08), rgba(125,154,175,0.06))", border: "1px dashed rgba(184,160,212,0.45)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div className="jost" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(152,120,184,0.85)", fontWeight: 600, marginBottom: 2 }}>🔍 Audit time?</div>
                    <div className="cg" style={{ fontSize: 16, color: "#4a3540", fontStyle: "italic", lineHeight: 1.4 }}>
                      Have Rosie check {fresh.length} active {fresh.length === 1 ? "task" : "tasks"} — missing steps, date drift, anything off.
                    </div>
                    {snoozed > 0 && (
                      <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.4)", marginTop: 3, fontStyle: "italic" }}>
                        {snoozed} other {snoozed === 1 ? "task is" : "tasks are"} on audit cooldown (audited recently).
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => runBulkAudit(false)}
                    disabled={!!bulkAuditState}
                    className="jost"
                    style={{
                      padding: "8px 16px",
                      background: bulkAuditState ? "rgba(74,53,64,0.15)" : "linear-gradient(135deg, #b89cd4, #9878b8)",
                      color: bulkAuditState ? "rgba(74,53,64,0.4)" : "#fff",
                      border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
                      cursor: bulkAuditState ? "default" : "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >{bulkAuditState ? "🔍 auditing…" : `🔍 Audit ${fresh.length > 8 ? "the first 8" : "all open tasks"}`}</button>
                </div>
              );
            })()}
            {bucketOrder.map(bucket => {
              const items = grouped[bucket];
              if (!items.length) return null;
              const bl = bucketLabels[bucket];
              const isDropTarget = dragOverBucket === bucket && dragOverIdx === null;
              return (
                <div key={bucket} style={{ marginBottom: 18 }}>
                  {/* Bucket header */}
                  <div
                    onDragOver={e => { e.preventDefault(); if (dragItemId) { setDragOverBucket(bucket); setDragOverIdx(null); } }}
                    onDrop={e => {
                      e.preventDefault();
                      if (!dragItemId) return;
                      const dragged = data.items.find(i => i.id === dragItemId);
                      if (dragged && dateBucket(dragged.scheduledDate) !== bucket) {
                        moveItemToBucket(dragItemId, bucket);
                      }
                      setDragItemId(null); setDragOverBucket(null); setDragOverIdx(null);
                    }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", marginBottom: 10, background: isDropTarget ? bl.bg : "transparent", border: isDropTarget ? `1px dashed ${bl.color}` : "1px dashed transparent", borderRadius: 10, transition: "all .15s" }}
                  >
                    <span style={{ fontSize: 14 }}>{bl.emoji}</span>
                    <div className="jost" style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: bl.color, fontWeight: 600 }}>{bl.label}</div>
                    <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${bl.color}40, transparent)` }} />
                    <span className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.35)" }}>{items.length}</span>
                  </div>

                  {items.map((item, idx) => {
                    const st = statusMap[item.status] || statusMap.todo;
                    const ct = (item.completedTasks || []).length, tt = (item.tasks || []).length;
                    const prog = tt > 0 ? Math.round((ct/tt)*100) : null;
                    const isDragging = dragItemId === item.id;
                    const showAbove = dragOverBucket === bucket && dragOverIdx === idx && !dragOverBelow && dragItemId !== item.id;
                    const showBelow = dragOverBucket === bucket && dragOverIdx === idx && dragOverBelow && dragItemId !== item.id;
                    return (
                      <div
                        key={item.id}
                        onDragOver={e => {
                          if (!dragItemId) return;
                          e.preventDefault();
                          const rect = e.currentTarget.getBoundingClientRect();
                          const below = (e.clientY - rect.top) > rect.height / 2;
                          setDragOverBucket(bucket); setDragOverIdx(idx); setDragOverBelow(below);
                        }}
                        onDrop={e => {
                          e.preventDefault();
                          if (!dragItemId || dragItemId === item.id) { setDragItemId(null); setDragOverBucket(null); setDragOverIdx(null); return; }
                          const dragged = data.items.find(i => i.id === dragItemId);
                          if (!dragged) { setDragItemId(null); setDragOverBucket(null); setDragOverIdx(null); return; }
                          // If dragged item is from a different bucket, move it to this bucket first
                          if (dateBucket(dragged.scheduledDate) !== bucket) {
                            moveItemToBucket(dragItemId, bucket);
                          } else {
                            // Reorder within same bucket
                            const targetIdx = dragOverBelow ? idx + 1 : idx;
                            const srcIdx = items.findIndex(i => i.id === dragItemId);
                            const adjusted = srcIdx < targetIdx ? targetIdx - 1 : targetIdx;
                            reorderItem(dragItemId, adjusted, bucket);
                          }
                          setDragItemId(null); setDragOverBucket(null); setDragOverIdx(null);
                        }}
                        className={`card fade ${isDragging ? "task-dragging" : ""} ${showAbove ? "task-drop-above" : ""} ${showBelow ? "task-drop-below" : ""}`}
                        style={{ padding: "18px 22px 18px 14px", marginBottom: 10, animationDelay: `${idx*.05}s`, borderLeft: `3px solid ${st.color}`, background: "rgba(255,255,255,0.82)", display: "flex", alignItems: "flex-start", gap: 8 }}
                      >
                        {/* Drag handle */}
                        <div
                          className="drag-handle"
                          draggable
                          onDragStart={e => { setDragItemId(item.id); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", item.id); }}
                          onDragEnd={() => { setDragItemId(null); setDragOverBucket(null); setDragOverIdx(null); }}
                          style={{ padding: "18px 2px 0", marginRight: 2, fontSize: 14 }}
                          title="Drag to reorder or move to different day"
                        >
                          ⋮⋮
                        </div>
                        <div style={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 8 }}>
                              <span className="tag jost" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                              {item.priority && <span className="tag jost" style={{ background: item.priority === "high" ? "rgba(212,100,120,0.1)" : "rgba(196,168,130,0.1)", color: item.priority === "high" ? "#c4687a" : "#9a7850" }}>{item.priority}</span>}
                              {item.project && <span className="tag jost" style={{ background: "rgba(212,130,154,0.1)", color: "#b86d85", fontWeight: 600 }}>📁 {item.project}</span>}
                              {item.category && <span className="tag jost" style={{ background: "rgba(180,160,210,0.1)", color: "#9878b8" }}>{item.category}</span>}
                              {item.scheduledDate && (() => {
                                // ── Waiting-on-Reply override ──
                                // When status is "waiting", swap the date pill for a sage "Waiting Nd" pill.
                                // The actual scheduledDate is preserved on the item, but visually it doesn't
                                // show as overdue while the user is genuinely blocked on someone else.
                                if (item.status === "waiting" && item.waitingSince) {
                                  const daysWaiting = businessDaysSince(item.waitingSince);
                                  const label = daysWaiting === 0 ? "Just now" : daysWaiting === 1 ? "Waiting 1 business day" : `Waiting ${daysWaiting} business days`;
                                  return (
                                    <span className="tag jost" style={{ background: "rgba(158,184,154,0.12)", color: "#7a9e78", display: "inline-flex", alignItems: "center", gap: 4 }} title={`Original due: ${fmtDateLabel(item.scheduledDate)}`}>
                                      💬 {label}
                                    </span>
                                  );
                                }
                                return (() => {
                                  const isDateOverdue = item.scheduledDate && item.scheduledDate < todayStr();
                                  const isStartPast = item.startDate && item.startDate < todayStr();
                                  // Helper for short absolute date label, e.g. "May 1"
                                  const fmtShort = (s) => {
                                    if (!s) return "";
                                    const [y, m, d] = s.split("-").map(Number);
                                    return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                                  };
                                  // Compose the label by case:
                                  //   - Both past:     "Apr 30 → Jun 5 · overdue 11d"  (clear absolute range + overdue marker)
                                  //   - Only end past: "May 1 → due 11d ago"
                                  //   - Future range:  "Apr 30 → Jun 5"  (existing behavior, but with icon)
                                  //   - Single date:   existing fmtDateLabel ("Tomorrow", "Tue, Jun 4", etc.)
                                  let content;
                                  if (item.startDate && isStartPast && isDateOverdue) {
                                    const overdueDays = Math.abs(daysBetween(todayStr(), item.scheduledDate));
                                    content = <>{fmtShort(item.startDate)} → {fmtShort(item.scheduledDate)} <span style={{ color: "#c4687a", fontWeight: 600 }}>· overdue {overdueDays}d</span></>;
                                  } else if (item.startDate) {
                                    content = `${fmtDateLabel(item.startDate)} → ${fmtDateLabel(item.scheduledDate)}`;
                                  } else if (isDateOverdue) {
                                    const overdueDays = Math.abs(daysBetween(todayStr(), item.scheduledDate));
                                    content = <><span style={{ color: "#c4687a", fontWeight: 600 }}>Overdue {overdueDays}d</span> <span style={{ opacity: 0.5 }}>· {fmtShort(item.scheduledDate)}</span></>;
                                  } else {
                                    content = fmtDateLabel(item.scheduledDate);
                                  }
                                  return (
                                    <span className="tag jost" style={{ background: item.dateFixed ? "rgba(212,130,154,0.12)" : "rgba(158,184,154,0.08)", color: item.dateFixed ? "#b86d85" : "#7a9e78", display: "inline-flex", alignItems: "center", gap: 5 }}>
                                      {item.dateFixed ? "📌" : <span style={{ opacity: 0.6 }}>📅</span>}
                                      {item.dateSource === "estimated" && !item.dateFixed && <span style={{ opacity: 0.6 }}>~</span>}
                                      {content}
                                    </span>
                                  );
                                })();
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
                              {["today", "tomorrow", "thisweek", "nextweek"].includes(bucket) && <FinishTime item={item} />}
                            </div>
                            <h3 className="cg" style={{ fontSize: 20, color: "#4a3540", marginBottom: 3, fontWeight: 600 }}>{item.title}</h3>
                            {/* Subtask preview — for items in the thisweek or nextweek bucket */}
                            {(bucket === "thisweek" || bucket === "nextweek") && (() => {
                              const tasks = item.tasks || [];
                              const taskDates = item.taskDates || [];
                              const completed = item.completedTasks || [];
                              if (!tasks.length) return null;
                              // Compute the relevant calendar week's range based on which bucket this is.
                              // thisweek: today through Sunday. nextweek: next Mon through following Sunday.
                              const todayD = new Date();
                              todayD.setHours(0, 0, 0, 0);
                              const todayDow = todayD.getDay(); // 0=Sun, 6=Sat
                              const daysUntilSunday = (7 - todayDow) % 7;
                              let rangeStart, rangeEnd;
                              if (bucket === "thisweek") {
                                rangeStart = todayD;
                                rangeEnd = new Date(todayD);
                                rangeEnd.setDate(rangeEnd.getDate() + daysUntilSunday);
                              } else {
                                rangeStart = new Date(todayD);
                                rangeStart.setDate(rangeStart.getDate() + daysUntilSunday + 1); // next Monday
                                rangeEnd = new Date(rangeStart);
                                rangeEnd.setDate(rangeEnd.getDate() + 6); // following Sunday
                              }
                              const inRange = (dateStr) => {
                                if (!dateStr) return false;
                                const [y, m, d] = dateStr.split("-").map(Number);
                                const dt = new Date(y, m - 1, d);
                                return dt >= rangeStart && dt <= rangeEnd;
                              };
                              // Find tasks scheduled within this range, not done, not deferred
                              const rangeTasks = tasks
                                .map((t, idx) => ({ title: t, idx, td: taskDates[idx] }))
                                .filter(t => !completed.includes(t.title))
                                .filter(t => t.td?.date && !t.td?.notToday && inRange(t.td.date));
                              if (!rangeTasks.length) return null;
                              // Sort by date
                              rangeTasks.sort((a, b) => (a.td.date < b.td.date ? -1 : 1));
                              const headerLabel = bucket === "thisweek" ? "🌸 Due this week" : "🌸 Due next week";
                              return (
                                <div style={{ marginTop: 6, marginBottom: 4, display: "flex", flexDirection: "column", gap: 3 }} onClick={e => e.stopPropagation()}>
                                  <div className="jost" style={{ fontSize: 9, letterSpacing: 1.3, color: "rgba(212,130,154,0.65)", textTransform: "uppercase", fontWeight: 600, marginBottom: 1 }}>
                                    {headerLabel}
                                  </div>
                                  {rangeTasks.map(t => (
                                    <div key={t.idx} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 8px", background: "rgba(212,130,154,0.05)", border: "1px solid rgba(212,130,154,0.15)", borderRadius: 6 }}>
                                      <span className="jost" style={{ fontSize: 10, color: "#b86d85", fontWeight: 600, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{fmtDateLabel(t.td.date)}</span>
                                      <span className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.7)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                                      {t.td.fixed && <span style={{ fontSize: 9, opacity: 0.7 }}>🔒</span>}
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                            {item.why && <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.4)", fontStyle: "italic" }}>Why: {item.why}</p>}
                            {item.done && <p className="jost" style={{ fontSize: 11, color: "#9eb89a", fontStyle: "italic" }}>✦ Done when: {item.done}</p>}
                            {item.outOfScope && <p className="jost" style={{ fontSize: 11, color: "#c4687a", fontStyle: "italic" }}>✕ Not doing: {item.outOfScope}</p>}
                            {/* Follow-up nudge — appears when an item has been "Waiting on Reply"
                                for 3+ business days. Click to add a reminder + mark the wait as nudged. */}
                            {item.status === "waiting" && item.waitingSince && (() => {
                              const daysWaiting = businessDaysSince(item.waitingSince);
                              if (daysWaiting < 3) return null;
                              return (
                                <div
                                  className="fade jost"
                                  style={{
                                    marginTop: 8,
                                    background: "linear-gradient(135deg, rgba(232,160,180,0.1), rgba(196,168,130,0.1))",
                                    border: "1px solid rgba(196,168,130,0.35)",
                                    borderRadius: 9,
                                    padding: "8px 12px",
                                    fontSize: 12,
                                    color: "#9a7850",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <span>🌸 It's been {daysWaiting} business days — time to follow up?</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Add a reminder + reset the waitingSince so the nudge doesn't keep firing
                                      const reminder = {
                                        id: uid(),
                                        text: `Follow up: ${item.title}`,
                                        type: "item",
                                        itemId: item.id,
                                        recurring: "",
                                        time: "",
                                        dismissed: false,
                                        createdAt: Date.now(),
                                      };
                                      onUpdate({
                                        ...data,
                                        reminders: [...(data.reminders || []), reminder],
                                        items: data.items.map(i => i.id === item.id ? { ...i, waitingSince: Date.now() } : i),
                                      });
                                    }}
                                    className="jost"
                                    style={{ background: "rgba(154,120,80,0.15)", border: "1px solid rgba(154,120,80,0.35)", borderRadius: 12, padding: "3px 10px", fontSize: 11, color: "#9a7850", cursor: "pointer", fontWeight: 500 }}
                                  >+ Follow-up reminder</button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Snooze — reset the wait clock by 3 business days so the nudge doesn't reappear immediately
                                      onUpdate({
                                        ...data,
                                        items: data.items.map(i => i.id === item.id ? { ...i, waitingSince: Date.now() } : i),
                                      });
                                    }}
                                    className="jost"
                                    style={{ background: "transparent", border: "none", color: "rgba(154,120,80,0.65)", fontSize: 11, cursor: "pointer", fontStyle: "italic" }}
                                  >snooze</button>
                                </div>
                              );
                            })()}
                            {prog !== null && <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}><div style={{ flex: 1, background: "rgba(212,130,154,0.1)", borderRadius: 4, height: 4 }}><div style={{ width: `${prog}%`, height: "100%", background: prog === 100 ? "#9eb89a" : "linear-gradient(90deg,#e8a0b4,#d4829a)", borderRadius: 4, transition: "width .5s" }} /></div><span className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.35)", flexShrink: 0 }}>{ct}/{tt}</span></div>}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "flex-end" }}>
                            <select className="jost" value={item.status} onChange={e => updateStatus(item.id, e.target.value, e)} style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(212,130,154,0.2)", borderRadius: 8, color: "rgba(74,53,64,0.6)", padding: "5px 10px", fontSize: 12, cursor: "pointer", outline: "none" }}>
                              {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                            </select>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button className="btn rose jost" onClick={() => onFocus(item)} style={{ fontSize: 12, padding: "5px 12px" }}>Focus →</button>
                              <button className="btn ghost jost" onClick={() => { setEditItem(item); setShowModal(true); }} style={{ fontSize: 12, padding: "5px 12px" }}>Edit</button>
                              <button onClick={() => deleteItem(item.id)} style={{ background: "rgba(212,100,120,0.07)", border: "1px solid rgba(212,100,120,0.15)", borderRadius: 8, color: "rgba(196,100,120,0.6)", padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>✕</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </>
        )}
          </>
        )}

        {/* SCHEDULE tab: log one-off meetings + manage recurring */}
        {workTab === "schedule" && (
          <SchedulePanel
            data={data}
            onUpdate={onUpdate}
            onShowRecurringModal={() => setShowRecurringModalInOverview(true)}
          />
        )}
      </div>

      {/* Recurring meetings modal — opened from the Schedule tab */}
      {showRecurringModalInOverview && (
        <RecurringMeetingsModal data={data} onUpdate={onUpdate} onClose={() => setShowRecurringModalInOverview(false)} />
      )}

      <BottomChatDock
        systemPrompt={sp}
        placeholder="What should I tackle first, Rosie?"
        subtitle="Prioritize, think out loud, stay on track. 🌸"
        data={data}
        onDataUpdate={onUpdate}
      />

      {showModal && <ItemModal item={editItem} onSave={saveItem} onClose={() => { setShowModal(false); setEditItem(null); }} allItems={data.items} recurringMeetings={data.recurringMeetings} timingHistory={data.timingHistory} />}
      {showPaste && <PasteListModal
        onSave={saveBulkItems}
        items={data.items}
        onSaveTasks={(parentId, parsedTasks) => {
          // Append hierarchical tasks to a chosen parent item.
          // parsedTasks is an array of { title, date?, subtasks: [{title}] }.
          // Each top-level becomes a task in the item; each subtask becomes
          // a child via taskParents pointing at the top-level's index.
          const parent = data.items.find(i => i.id === parentId);
          if (!parent) return;
          const existingTasks = parent.tasks || [];
          const existingTimes = parent.taskTimes || [];
          const existingDates = parent.taskDates || [];
          const existingParents = parent.taskParents || [];

          // Pad existing parents to match existing tasks length (defensive)
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

          // Insert each top-level + its subtasks. Now respects parsed duration
          // and date metadata from extractDateAndDuration — anything pulled out
          // of the title (e.g. "— 45 min, 6/30/2026") becomes structured fields
          // instead of polluting the task name.
          for (const top of parsedTasks) {
            const parentIdx = newTasks.length; // new top-level's index in the appended array
            newTasks.push(top.title);
            newTimes.push(top.durationMin || 15);
            newDates.push({ date: top.date || "", notToday: false, fixed: false });
            newParents.push(null); // top-level
            // Then children
            for (const sub of (top.subtasks || [])) {
              newTasks.push(sub.title);
              newTimes.push(sub.durationMin || 15);
              newDates.push({ date: sub.date || top.date || "", notToday: false, fixed: false });
              newParents.push(parentIdx);
            }
          }

          const updated = { ...parent, tasks: newTasks, taskTimes: newTimes, taskDates: newDates, taskParents: newParents };
          onUpdate({ ...data, items: data.items.map(i => i.id === parentId ? updated : i) });
        }}
        onSaveReminders={(reminders) => {
          // Each parsed entry becomes a quick reminder
          const newReminders = reminders.map(r => ({
            id: uid(),
            text: r.title,
            type: "quick",
            itemId: "",
            recurring: "",
            time: "",
            dismissed: false,
            createdAt: Date.now(),
          }));
          onUpdate({ ...data, reminders: [...(data.reminders || []), ...newReminders] });
        }}
        onClose={() => setShowPaste(false)}
      />}
      {showHistory && <HistoryModal data={data} onUpdate={onUpdate} onClose={() => setShowHistory(false)} />}
      {showBrainDump && <BrainDumpModal data={data} onUpdate={onUpdate} onClose={() => setShowBrainDump(false)} />}
      {showRecovery && <RecoveryModal data={data} onUpdate={onUpdate} onClose={() => setShowRecovery(false)} />}
      {showRecurring && <RecurringMeetingsModal data={data} onUpdate={onUpdate} onClose={() => setShowRecurring(false)} />}

      {/* Status-change toast — appears briefly after a date auto-bump etc. */}
      {statusToast && (
        <div
          className="fade jost"
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(158,184,154,0.95)",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: 22,
            fontSize: 12,
            fontWeight: 500,
            boxShadow: "0 4px 16px rgba(74,53,64,0.18)",
            zIndex: 200,
            maxWidth: "90vw",
            textAlign: "center",
          }}
        >{statusToast}</div>
      )}
      {/* Bulk gap-fill preview modal — opens after Rosie finishes proposing
          fills for all tasks with gaps. Lets Lexy skip rows she doesn't want
          before applying. Loading state shows while Rosie's drafting. */}
      {bulkFillState && (
        <BulkFillModal
          state={bulkFillState}
          onCancel={() => setBulkFillState(null)}
          onApply={(toApply) => {
            if (toApply.length === 0) { setBulkFillState(null); return; }
            // Merge fills into items. Only touch fields that were ACTUALLY
            // proposed (non-empty in the proposal) — never overwrite
            // existing values.
            const fillsById = new Map(toApply.map(p => [p.id, p.fill]));
            const nextItems = (data.items || []).map(it => {
              if (!fillsById.has(it.id)) return it;
              const f = fillsById.get(it.id);
              const updates = { lastUpdatedAt: Date.now() };
              if (f.why && (!it.why || !it.why.trim())) updates.why = f.why;
              if (f.subtasks && f.subtasks.length > 0 && (!it.tasks || it.tasks.length === 0)) {
                updates.tasks = f.subtasks;
                updates.taskTimes = f.taskTimes || f.subtasks.map(() => 15);
                updates.completedTasks = [];
              }
              if (f.doneCriteria && (!it.done || !it.done.trim())) updates.done = f.doneCriteria;
              if (f.outOfScope && (!it.outOfScope || !it.outOfScope.trim())) updates.outOfScope = f.outOfScope;
              return { ...it, ...updates };
            });
            onUpdate({ ...data, items: nextItems });
            setBulkFillState(null);
          }}
        />
      )}
      {/* Bulk audit preview modal — opens after Rosie audits existing tasks
          and proposes adjustments. Applied selectively via per-row skip.
          On both Apply and Cancel, every audited item gets auditedAt stamped
          so the cooldown filter knows not to re-surface it immediately. */}
      {bulkAuditState && (
        <BulkAuditModal
          state={bulkAuditState}
          onCancel={() => {
            // Mark all audited items as seen so they don't re-pop next time
            const batchIds = bulkAuditState.batchIds || (bulkAuditState.proposals || []).map(p => p.id);
            if (batchIds.length > 0) {
              const now = Date.now();
              const idSet = new Set(batchIds);
              const nextItems = (data.items || []).map(it =>
                idSet.has(it.id) ? { ...it, auditedAt: now } : it
              );
              onUpdate({ ...data, items: nextItems });
            }
            setBulkAuditState(null);
          }}
          onApply={(toApply) => {
            // Stamp every audited item (including ones with no changes accepted)
            // so the cooldown applies uniformly — Lexy saw the modal, that counts.
            const batchIds = bulkAuditState.batchIds || (bulkAuditState.proposals || []).map(p => p.id);
            const auditedSet = new Set(batchIds);
            const auditsById = new Map(toApply.map(p => [p.id, p]));
            const now = Date.now();
            const nextItems = (data.items || []).map(it => {
              const wasAudited = auditedSet.has(it.id);
              if (!wasAudited) return it;
              const updates = { auditedAt: now };
              if (auditsById.has(it.id)) {
                const entry = auditsById.get(it.id);
                const a = entry.audit;
                const accepts = entry.accepts || {};
                updates.lastUpdatedAt = now;
                if (accepts.subtasks && a.additionalSubtasks?.length > 0) {
                  updates.tasks = [...(it.tasks || []), ...a.additionalSubtasks];
                  updates.taskTimes = [...(it.taskTimes || []), ...a.additionalTaskTimes];
                }
                if (accepts.date && a.newDate) {
                  updates.scheduledDate = a.newDate;
                  updates.tbd = false;
                }
                if (accepts.times && a.timeAdjustments?.length > 0) {
                  // Apply per-subtask time adjustments. Start from whichever
                  // taskTimes array is most current (may have just been
                  // extended by accepts.subtasks above).
                  const baseTimes = updates.taskTimes ? [...updates.taskTimes] : [...(it.taskTimes || [])];
                  // Ensure array is long enough — pad with defaults if needed
                  while (baseTimes.length < (it.tasks?.length || 0)) baseTimes.push(15);
                  for (const ta of a.timeAdjustments) {
                    if (ta.subtaskIndex >= 0 && ta.subtaskIndex < baseTimes.length) {
                      baseTimes[ta.subtaskIndex] = ta.newTime;
                    }
                  }
                  updates.taskTimes = baseTimes;
                }
              }
              return { ...it, ...updates };
            });
            onUpdate({ ...data, items: nextItems });
            setBulkAuditState(null);
          }}
        />
      )}
      {/* Thread capture modal — opens from "Note for [person]" button (top
          bar) or "+ Note about this" inside a task focus view. On save:
          (1) writes the entry to data.runningThreads (lazy-creating the
          thread if it doesn't exist yet); (2) if Rosie tagged urgency as
          "today" or "thisweek", also pushes a reminder so the entry shows
          up in the reminder card area. */}
      {threadCaptureOpen && (
        <ThreadCaptureModal
          thread={threadCaptureOpen.thread}
          linkedItem={threadCaptureOpen.linkedItem}
          onCancel={() => setThreadCaptureOpen(null)}
          onSave={(entry) => {
            const allThreads = data.runningThreads || [];
            const targetId = threadCaptureOpen.thread.id;
            // Lazy-create thread if it doesn't exist
            const existing = allThreads.find(t => t.id === targetId);
            const nextThread = existing
              ? { ...existing, entries: [...(existing.entries || []), entry] }
              : {
                  id: targetId,
                  personName: threadCaptureOpen.thread.personName,
                  createdAt: Date.now(),
                  entries: [entry],
                };
            const nextThreads = existing
              ? allThreads.map(t => t.id === targetId ? nextThread : t)
              : [...allThreads, nextThread];
            // For urgent entries (today / this week), ALSO drop a reminder
            const nextReminders = [...(data.reminders || [])];
            if (entry.urgency === "today" || entry.urgency === "thisweek") {
              const prefix = entry.urgency === "today" ? "⚡ Send today" : "📅 This week";
              nextReminders.push({
                id: `rem-thr-${entry.id}`,
                text: `${prefix} — to ${nextThread.personName}: ${entry.summary}`,
                type: "quick",
                messageKind: "teams", // Surfaces the "💬 draft →" button to compose in Teams
                threadEntryId: entry.id,
                threadId: nextThread.id,
                dismissed: false,
                createdAt: Date.now(),
                suggested: true,
              });
            }
            onUpdate({ ...data, runningThreads: nextThreads, reminders: nextReminders });
            setThreadCaptureOpen(null);
          }}
        />
      )}
      {/* Thread review modal — opens from the "Note for X (N)" button when
          the user wants to triage accumulated entries OR auto-banner in
          MeetingFocusView for the matching 1:1. On complete:
          (1) stamps each entry with action + reviewedAt; (2) builds a
          plain-text digest grouped by type and copies to clipboard so
          Lexy can paste into Teams. */}
      {threadReviewOpen && (
        <ThreadReviewModal
          thread={threadReviewOpen.thread}
          entries={threadReviewOpen.entries}
          onCancel={() => setThreadReviewOpen(null)}
          onComplete={(actions) => {
            const now = Date.now();
            const targetId = threadReviewOpen.thread.id;
            const allThreads = data.runningThreads || [];
            const nextThreads = allThreads.map(t => {
              if (t.id !== targetId) return t;
              return {
                ...t,
                entries: (t.entries || []).map(e => {
                  if (!(e.id in actions)) return e;
                  return { ...e, action: actions[e.id], reviewedAt: now };
                }),
              };
            });
            // Build the digest from "send" entries, grouped by type
            const sendEntries = threadReviewOpen.entries.filter(e => actions[e.id] === "send");
            if (sendEntries.length > 0) {
              const typeLabels = { idea: "Ideas", update: "Updates", question: "Questions", issue: "Issues" };
              const grouped = {};
              for (const e of sendEntries) {
                const k = e.type || "update";
                if (!grouped[k]) grouped[k] = [];
                grouped[k].push(e);
              }
              const order = ["issue", "question", "update", "idea"];
              const lines = [`Hey ${threadReviewOpen.thread.personName} — a few things from this cycle:`, ""];
              for (const k of order) {
                if (!grouped[k]) continue;
                lines.push(`${typeLabels[k]}:`);
                for (const e of grouped[k]) {
                  lines.push(`• ${e.text}${e.linkedItemTitle ? `  (re: ${e.linkedItemTitle})` : ""}`);
                }
                lines.push("");
              }
              const digest = lines.join("\n").trim();
              // Copy to clipboard so Lexy can paste into Teams
              if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(digest).catch(() => {});
              }
            }
            onUpdate({ ...data, runningThreads: nextThreads });
            setThreadReviewOpen(null);
          }}
        />
      )}
      {/* Phase 2: per-entry Rosie chat. Persists chat history to the entry
          on every message so Lexy can leave and come back. On-track nudges
          use currently-focused item (from data) as context — only fires
          when the chat has been going for 5+ min. */}
      {threadChatOpen && (() => {
        // Active focus block detection — Lexy's in a focus block if data has
        // a focusedItemId, currentFocusItemId, or activeFocus marker.
        const focusedItemId = data?.focusedItemId || data?.currentFocusItemId || data?.activeFocus?.itemId || null;
        const focusedItem = focusedItemId ? (data?.items || []).find(it => it.id === focusedItemId) : null;
        const activeFocusContext = focusedItem ? { itemTitle: focusedItem.title } : null;
        // Upcoming meeting — find the next recurring meeting firing today within 30 min
        let upcomingMeeting = null;
        const now = new Date();
        const todayMin = now.getHours() * 60 + now.getMinutes();
        for (const m of (data?.recurringMeetings || [])) {
          if (!m.startTime) continue;
          const [hh, mm] = String(m.startTime).split(":").map(Number);
          if (!Number.isFinite(hh) || !Number.isFinite(mm)) continue;
          const mMin = hh * 60 + mm;
          const minutesUntil = mMin - todayMin;
          if (minutesUntil > 0 && minutesUntil <= 30) {
            // Fire check — does this meeting recur today?
            try {
              if (typeof recurringMeetingFiresOn === "function" && !recurringMeetingFiresOn(m, now)) continue;
            } catch { /* skip if helper not available */ }
            if (!upcomingMeeting || minutesUntil < upcomingMeeting.minutesUntil) {
              upcomingMeeting = { title: m.title || "your meeting", minutesUntil };
            }
          }
        }
        return (
          <ThreadChatModal
            entry={threadChatOpen.entry}
            thread={threadChatOpen.thread}
            linkedItem={threadChatOpen.linkedItem}
            activeFocusContext={activeFocusContext}
            upcomingMeeting={upcomingMeeting}
            onClose={() => setThreadChatOpen(null)}
            onPersistChat={(newChat) => {
              const nextThreads = (data.runningThreads || []).map(t => {
                if (t.id !== threadChatOpen.thread.id) return t;
                return {
                  ...t,
                  entries: (t.entries || []).map(e => e.id === threadChatOpen.entry.id ? { ...e, chat: newChat } : e),
                };
              });
              onUpdate({ ...data, runningThreads: nextThreads });
            }}
            onUpdateEntry={(updatedEntry) => {
              const nextThreads = (data.runningThreads || []).map(t => {
                if (t.id !== threadChatOpen.thread.id) return t;
                return {
                  ...t,
                  entries: (t.entries || []).map(e => e.id === threadChatOpen.entry.id ? updatedEntry : e),
                };
              });
              onUpdate({ ...data, runningThreads: nextThreads });
            }}
            onCreateTask={(taskProposal, sourceEntry) => {
              // Create a new Work Hub item from the chat's task proposal.
              // Mark with source: "thread-chat" + sourceThreadEntryId so it
              // can be traced back to the conversation that spawned it.
              const newItem = {
                id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                title: taskProposal.title,
                why: taskProposal.why || "",
                status: "todo",
                priority: "medium",
                tasks: taskProposal.subtasks || [],
                taskTimes: taskProposal.taskTimes || [],
                completedTasks: [],
                tbd: true, // user can set a date if they want
                createdAt: Date.now(),
                lastUpdatedAt: Date.now(),
                source: "thread-chat",
                sourceThreadEntryId: sourceEntry?.id || null,
                sourceThreadPersonName: threadChatOpen.thread.personName,
              };
              onUpdate({ ...data, items: [...(data.items || []), newItem] });
            }}
          />
        );
      })()}
    </div>
  );
}

// ── Bulk Audit Modal ──────────────────────────────────────────────────────────
// Shown after Rosie audits existing tasks. Each item row shows the proposed
// adjustments (additional subtasks, new date, concern) with INDIVIDUAL accept
// checkboxes per change type — so user can take just the date change without
// the subtasks, or vice versa. "Apply" commits accepted changes.
function BulkAuditModal({ state, onCancel, onApply }) {
  // accepts[itemId] = { subtasks: bool, date: bool }
  const [accepts, setAccepts] = useState({});
  const proposals = state.proposals || [];
  const loading = state.phase === "loading";
  // Pre-seed all checkboxes to true on first render
  useEffect(() => {
    if (loading || proposals.length === 0) return;
    const initial = {};
    for (const p of proposals) {
      initial[p.id] = {
        subtasks: (p.audit.additionalSubtasks?.length || 0) > 0,
        date: !!p.audit.newDate,
        times: (p.audit.timeAdjustments?.length || 0) > 0,
      };
    }
    setAccepts(initial);
  }, [loading, proposals.length]);
  const setAccept = (id, key, value) => {
    setAccepts(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [key]: value } }));
  };
  const toApply = proposals
    .map(p => ({ ...p, accepts: accepts[p.id] || {} }))
    .filter(p => p.accepts.subtasks || p.accepts.date || p.accepts.times);
  return (
    <div className="modal-bg" onClick={loading ? undefined : onCancel}>
      <div className="modal fade" onClick={e => e.stopPropagation()} style={{ maxWidth: 620, maxHeight: "88vh", overflow: "auto" }}>
        <div className="jost" style={{ fontSize: 10, letterSpacing: 2.5, color: "rgba(152,120,184,0.85)", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
          🔍 audit
        </div>
        <div className="cg" style={{ fontSize: 22, fontStyle: "italic", color: "#4a3540", textAlign: "center", marginBottom: 8 }}>
          {loading ? `Rosie's auditing your tasks…` : proposals.length === 0 ? "Everything looks fine 🌸" : `${proposals.length} ${proposals.length === 1 ? "task has" : "tasks have"} suggestions`}
        </div>
        <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.55)", lineHeight: 1.6, textAlign: "center", marginBottom: 16 }}>
          {loading ? `Looking at ${state.total} active ${state.total === 1 ? "task" : "tasks"} — usually 5-15 seconds.` : proposals.length === 0 ? "Rosie went through your tasks and didn't find anything obvious that needs adjusting." : "Each suggestion has its own toggle. Take what's helpful, leave what's not."}
        </p>
        {loading ? (
          <div style={{ padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div className="pulse jost" style={{ fontSize: 13, color: "#9878b8", fontStyle: "italic" }}>
              🔍 {(state.completed || 0) === 0 ? `reviewing ${state.total} ${state.total === 1 ? "task" : "tasks"}…` : `reviewed ${state.completed || 0} of ${state.total}…`}
            </div>
            {/* Progress bar — fills as each audit completes */}
            <div style={{ width: "70%", height: 4, background: "rgba(184,160,212,0.15)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                width: `${state.total ? Math.round(((state.completed || 0) / state.total) * 100) : 0}%`,
                height: "100%",
                background: "linear-gradient(90deg, #b89cd4, #9878b8)",
                transition: "width .4s ease",
              }} />
            </div>
          </div>
        ) : proposals.length === 0 ? (
          <div className="card" style={{ padding: "20px 16px", textAlign: "center", marginBottom: 12, background: "rgba(158,184,154,0.08)", border: "1px solid rgba(158,184,154,0.2)" }}>
            <div className="cg" style={{ fontSize: 14, fontStyle: "italic", color: "#7a9e78" }}>Your tasks are in good shape.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {proposals.map(entry => {
              const a = entry.audit;
              const accept = accepts[entry.id] || {};
              const hasSubtasks = (a.additionalSubtasks?.length || 0) > 0;
              const hasDate = !!a.newDate;
              const hasKeepDate = !!a.dateKeepReason;
              const hasTimeAdjustments = (a.timeAdjustments?.length || 0) > 0;
              const hasConcern = !!a.concern;
              return (
                <div key={entry.id} style={{
                  background: "rgba(255,255,255,0.65)",
                  border: "1px solid rgba(184,160,212,0.25)",
                  borderRadius: 8, padding: "10px 12px",
                }}>
                  <div className="cg" style={{ fontSize: 14, color: "#4a3540", fontWeight: 600, lineHeight: 1.4, marginBottom: 8 }}>
                    {entry.item.title}
                  </div>
                  {hasSubtasks && (
                    <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 7, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={!!accept.subtasks}
                        onChange={e => setAccept(entry.id, "subtasks", e.target.checked)}
                        style={{ marginTop: 3, cursor: "pointer", accentColor: "#9878b8", width: 15, height: 15, flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="jost" style={{ fontSize: 9, color: "rgba(152,120,184,0.85)", letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 3 }}>+ Add {a.additionalSubtasks.length} subtask{a.additionalSubtasks.length === 1 ? "" : "s"}</div>
                        <ul style={{ margin: 0, padding: "0 0 0 14px", fontSize: 11.5, color: "rgba(74,53,64,0.75)", lineHeight: 1.5 }}>
                          {a.additionalSubtasks.map((s, i) => (
                            <li key={i} className="jost">{s} {a.additionalTaskTimes?.[i] ? <span style={{ color: "rgba(74,53,64,0.4)" }}>· {a.additionalTaskTimes[i]}m</span> : null}</li>
                          ))}
                        </ul>
                      </div>
                    </label>
                  )}
                  {hasDate && (
                    <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 7, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={!!accept.date}
                        onChange={e => setAccept(entry.id, "date", e.target.checked)}
                        style={{ marginTop: 3, cursor: "pointer", accentColor: "#9878b8", width: 15, height: 15, flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="jost" style={{ fontSize: 9, color: "rgba(94,126,149,0.85)", letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>📅 {(entry.item.tbd || !entry.item.scheduledDate) ? "Set" : "Move"} date to {a.newDate}</div>
                        {a.newDateReason && <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.65)", fontStyle: "italic", lineHeight: 1.45 }}>{a.newDateReason}</div>}
                      </div>
                    </label>
                  )}
                  {hasKeepDate && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 8px", background: "rgba(158,184,154,0.1)", borderRadius: 6, marginTop: 4, marginBottom: 4 }}>
                      <span style={{ fontSize: 12 }}>📅</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="jost" style={{ fontSize: 9, color: "rgba(122,158,120,0.85)", letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Keep current date — {entry.item.scheduledDate}</div>
                        <div className="jost" style={{ fontSize: 11, color: "#7a9e78", lineHeight: 1.45, fontStyle: "italic" }}>{a.dateKeepReason}</div>
                      </div>
                    </div>
                  )}
                  {hasTimeAdjustments && (
                    <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 7, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={!!accept.times}
                        onChange={e => setAccept(entry.id, "times", e.target.checked)}
                        style={{ marginTop: 3, cursor: "pointer", accentColor: "#9878b8", width: 15, height: 15, flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="jost" style={{ fontSize: 9, color: "rgba(212,140,90,0.95)", letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 3 }}>
                          ⏱ Adjust {a.timeAdjustments.length} subtask time{a.timeAdjustments.length === 1 ? "" : "s"}
                        </div>
                        <ul style={{ margin: 0, padding: "0 0 0 14px", fontSize: 11.5, color: "rgba(74,53,64,0.75)", lineHeight: 1.5 }}>
                          {a.timeAdjustments.map((ta, i) => {
                            const subtaskTitle = entry.item.tasks?.[ta.subtaskIndex] || `Subtask ${ta.subtaskIndex + 1}`;
                            return (
                              <li key={i} className="jost">
                                <span style={{ color: "rgba(74,53,64,0.85)" }}>{subtaskTitle}</span>
                                <span style={{ color: "rgba(74,53,64,0.4)" }}> · </span>
                                {ta.currentTime > 0 && <span style={{ color: "rgba(74,53,64,0.5)", textDecoration: "line-through" }}>{ta.currentTime}m</span>}
                                <span style={{ color: "#b86d85", fontWeight: 600 }}>{ta.currentTime > 0 ? " → " : ""}{ta.newTime}m</span>
                                {ta.reason && <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)", fontStyle: "italic", marginLeft: 2 }}>↳ {ta.reason}</div>}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </label>
                  )}
                  {hasConcern && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 8px", background: "rgba(196,168,130,0.1)", borderRadius: 6, marginTop: 4 }}>
                      <span style={{ fontSize: 12 }}>⚠️</span>
                      <div className="jost" style={{ flex: 1, fontSize: 11, color: "#9a7850", lineHeight: 1.5, fontStyle: "italic" }}>{a.concern}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, paddingTop: 8, borderTop: "1px solid rgba(74,53,64,0.08)" }}>
          <button onClick={onCancel} disabled={loading} className="btn ghost jost" style={{ padding: "8px 14px", fontSize: 12, opacity: loading ? 0.4 : 1 }}>{proposals.length === 0 ? "Close 🌸" : "Cancel"}</button>
          {proposals.length > 0 && (
            <button
              onClick={() => onApply(toApply)}
              disabled={loading || toApply.length === 0}
              className="jost"
              style={{
                background: (loading || toApply.length === 0) ? "rgba(74,53,64,0.15)" : "linear-gradient(135deg, #b89cd4, #9878b8)",
                color: (loading || toApply.length === 0) ? "rgba(74,53,64,0.4)" : "#fff",
                padding: "8px 18px", fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
                border: "none", borderRadius: 7,
                cursor: (loading || toApply.length === 0) ? "default" : "pointer",
              }}
            >{loading ? "auditing…" : `✓ Apply (${toApply.length})`}</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Bulk Fill Modal ───────────────────────────────────────────────────────────
// Shown after parallel Rosie expansion fills missing fields for many tasks.
// Compact preview list — each row has a skip toggle. "Apply all" writes the
// non-skipped fills back to data.items.
function BulkFillModal({ state, onCancel, onApply }) {
  const [skipped, setSkipped] = useState(new Set());
  const toggleSkip = (id) => {
    setSkipped(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const proposals = state.proposals || [];
  const loading = state.phase === "loading";
  const accepted = proposals.filter(p => !skipped.has(p.id));
  return (
    <div className="modal-bg" onClick={loading ? undefined : onCancel}>
      <div className="modal fade" onClick={e => e.stopPropagation()} style={{ maxWidth: 620, maxHeight: "88vh", overflow: "auto" }}>
        <div className="jost" style={{ fontSize: 10, letterSpacing: 2.5, color: "rgba(212,130,154,0.7)", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
          ✨ bulk fill
        </div>
        <div className="cg" style={{ fontSize: 22, fontStyle: "italic", color: "#4a3540", textAlign: "center", marginBottom: 8 }}>
          {loading ? `Rosie's filling gaps…` : `${proposals.length} ${proposals.length === 1 ? "task" : "tasks"} ready to update`}
        </div>
        <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.55)", lineHeight: 1.6, textAlign: "center", marginBottom: 16 }}>
          {loading ? "All running in parallel — usually 5-15 seconds." : "Only missing fields will be filled — existing values are never overwritten. Skip any you don't want."}
        </p>
        {loading ? (
          <div style={{ padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div className="pulse jost" style={{ fontSize: 13, color: "#b86d85", fontStyle: "italic" }}>
              ✨ {(state.completed || 0) === 0 ? `thinking through ${state.total} ${state.total === 1 ? "task" : "tasks"}…` : `drafted ${state.completed || 0} of ${state.total}…`}
            </div>
            <div style={{ width: "70%", height: 4, background: "rgba(212,130,154,0.15)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                width: `${state.total ? Math.round(((state.completed || 0) / state.total) * 100) : 0}%`,
                height: "100%",
                background: "linear-gradient(90deg, #d4829a, #b86d85)",
                transition: "width .4s ease",
              }} />
            </div>
          </div>
        ) : proposals.length === 0 ? (
          <div className="card" style={{ padding: "30px 16px", textAlign: "center", marginBottom: 12 }}>
            <div className="cg" style={{ fontSize: 16, fontStyle: "italic", color: "rgba(74,53,64,0.5)" }}>Nothing new to propose.</div>
            <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.4)", marginTop: 4 }}>Rosie couldn't find useful fills this round. Try opening one in focus mode.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {proposals.map((entry) => {
              const isSkipped = skipped.has(entry.id);
              const f = entry.fill;
              return (
                <div key={entry.id} style={{
                  background: isSkipped ? "rgba(74,53,64,0.04)" : "rgba(255,255,255,0.65)",
                  border: `1px solid ${isSkipped ? "rgba(74,53,64,0.1)" : "rgba(212,130,154,0.25)"}`,
                  borderRadius: 8, padding: "10px 12px",
                  opacity: isSkipped ? 0.5 : 1,
                  transition: "opacity .15s",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={!isSkipped}
                      onChange={() => toggleSkip(entry.id)}
                      style={{ marginTop: 3, cursor: "pointer", accentColor: "#b86d85", width: 15, height: 15, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="cg" style={{ fontSize: 14, color: "#4a3540", fontWeight: 600, lineHeight: 1.4, textDecoration: isSkipped ? "line-through" : "none", marginBottom: 6 }}>
                        {entry.item.title}
                      </div>
                      {f.why && (
                        <div style={{ marginBottom: 5 }}>
                          <div className="jost" style={{ fontSize: 9, color: "rgba(212,130,154,0.7)", letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>+ Why</div>
                          <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.75)", fontStyle: "italic", lineHeight: 1.45 }}>{f.why}</div>
                        </div>
                      )}
                      {f.subtasks && f.subtasks.length > 0 && (
                        <div style={{ marginBottom: 5 }}>
                          <div className="jost" style={{ fontSize: 9, color: "rgba(184,160,212,0.85)", letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 3 }}>+ {f.subtasks.length} subtask{f.subtasks.length === 1 ? "" : "s"}</div>
                          <ul style={{ margin: 0, padding: "0 0 0 16px", fontSize: 11.5, color: "rgba(74,53,64,0.7)", lineHeight: 1.5 }}>
                            {f.subtasks.slice(0, 5).map((s, i) => (
                              <li key={i} className="jost">{s} {f.taskTimes?.[i] ? <span style={{ color: "rgba(74,53,64,0.4)" }}>· {f.taskTimes[i]}m</span> : null}</li>
                            ))}
                            {f.subtasks.length > 5 && (
                              <li className="jost" style={{ fontStyle: "italic", color: "rgba(74,53,64,0.4)" }}>…and {f.subtasks.length - 5} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                      {f.doneCriteria && (
                        <div style={{ marginBottom: 5 }}>
                          <div className="jost" style={{ fontSize: 9, color: "rgba(122,158,120,0.85)", letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>+ Done when</div>
                          <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.75)", lineHeight: 1.45 }}>✦ {f.doneCriteria}</div>
                        </div>
                      )}
                      {f.outOfScope && (
                        <div style={{ marginBottom: 5 }}>
                          <div className="jost" style={{ fontSize: 9, color: "rgba(196,104,122,0.75)", letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>+ Not doing</div>
                          <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.75)", lineHeight: 1.45 }}>✕ {f.outOfScope}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, paddingTop: 8, borderTop: "1px solid rgba(74,53,64,0.08)" }}>
          <button onClick={onCancel} disabled={loading} className="btn ghost jost" style={{ padding: "8px 14px", fontSize: 12, opacity: loading ? 0.4 : 1 }}>{loading ? "Cancel" : "Close"}</button>
          <button
            onClick={() => onApply(accepted)}
            disabled={loading || accepted.length === 0}
            className="jost"
            style={{
              background: (loading || accepted.length === 0) ? "rgba(74,53,64,0.15)" : "linear-gradient(135deg,#d4829a,#b86d85)",
              color: (loading || accepted.length === 0) ? "rgba(74,53,64,0.4)" : "#fff",
              padding: "8px 18px", fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
              border: "none", borderRadius: 7,
              cursor: (loading || accepted.length === 0) ? "default" : "pointer",
            }}
          >{loading ? "drafting…" : `✓ Apply to ${accepted.length}`}</button>
        </div>
      </div>
    </div>
  );
}

// ── Park It Modal ─────────────────────────────────────────────────────────────
// ── Meeting Focus View ────────────────────────────────────────────────────────
// Standalone focus mode for a single meeting. Mirrors how FocusView works for tasks.
// Pre-fills from the slot label, runs the prep generator inline, and includes
// a notes section so prep + during-meeting notes live in one place.
// ─── Quill — Meeting Minutes ─────────────────────────────────────────────────
// Transcript capture (paste or live mic) → Rosie-generated structured minutes.
// Lives inside MeetingFocusView; persists to the meeting object via saveMeeting:
//   minutes (structured result), minutesTranscript, minutesMeta, minutesType.
// Adapted from the standalone Quill app (dev chat 2026-06-09). Palette/fonts
// mapped to work-hub values; helpers prefixed Qm/QM_ to avoid collisions.
const QM = {
  cream: "#faf6ee", creamDeep: "#f3ebdd", ivory: "#fdfbf5",
  ink: "#4a3540", inkSoft: "rgba(74,53,64,0.65)",
  terracotta: "#c1734f", rose: "#b86d85", sage: "#7a9e78",
  gold: "#c2a25c", lavender: "#9878b8", line: "#e6dccb",
};
const QM_SERIF = "'Cormorant Garamond', serif";
const QM_SANS = "'Jost', sans-serif";

const QM_TYPES = [
  { id: "general", label: "General" },
  { id: "standup", label: "Standup" },
  { id: "status", label: "Status update" },
  { id: "kickoff", label: "Project kickoff" },
  { id: "vendor", label: "Vendor call" },
  { id: "oneonone", label: "1:1" },
  { id: "brainstorm", label: "Brainstorm" },
];

const QM_GUIDANCE = {
  general: "Capture the conversation faithfully across all sections.",
  standup: "Organize around per-person updates and surface blockers prominently in open questions.",
  status: "Emphasize progress, risks, and decisions; keep next steps concrete and owned.",
  kickoff: "Emphasize scope, roles/responsibilities, milestones, and risks. Decisions should capture agreed scope and ownership.",
  vendor: "Emphasize vendor commitments, any pricing/terms/timelines mentioned, and required follow-ups. Flag anything vague or unconfirmed in open questions.",
  oneonone: "Keep it personal and supportive: discussion points, feedback given, support needed, and clear action items.",
  brainstorm: "Capture ideas generously, group recurring themes in minutes, and put the most promising directions in next steps. Decisions may be light.",
};

function looksLikeQuestion(s, name) {
  const t = (s || "").trim().toLowerCase();
  if (t.length < 10) return false;
  if (t.includes("?")) return true;
  const starters = ["what", "why", "how", "when", "where", "who", "which", "can you",
    "could you", "would you", "do you", "did you", "are you", "is there", "will you",
    "should we", "thoughts on", "any update", "where are we", "what's your", "how's"];
  if (starters.some((st) => t.startsWith(st) || t.includes(" " + st + " "))) return true;
  if (name && name.trim() && t.includes(name.trim().toLowerCase())) return true;
  return false;
}

function MeetingMinutes({ meeting, saveMeeting, fullData, onUpdateData }) {
  const [mode, setMode] = useState("paste");
  const [meetingType, setMeetingType] = useState(meeting?.minutesType || "general");
  const [transcript, setTranscript] = useState(meeting?.minutesTranscript || "");
  const [interim, setInterim] = useState("");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [meta, setMeta] = useState(meeting?.minutesMeta || { title: meeting?.title || meeting?.slotLabel || "", date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), attendees: meeting?.whoWith || "" });
  const [name, setName] = useState("Lexy");
  const [brief, setBrief] = useState("");
  const [currentSpeaker, setCurrentSpeaker] = useState("");
  const [assistOn, setAssistOn] = useState(true);
  const [suggestion, setSuggestion] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(meeting?.minutes || null);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  // Action item → Work Hub task expansion flow. `expandingIdx` is the index
  // currently waiting on Rosie; `expansionPreview` holds the result for the
  // confirm modal. Null in both = no active expansion.
  const [expandingIdx, setExpandingIdx] = useState(null);
  const [expansionPreview, setExpansionPreview] = useState(null); // null | { idx, proposal, actionItem }
  const [expansionAdded, setExpansionAdded] = useState({}); // {idx: true} → already added rows
  // Bulk selection state — Set of action item indices currently checked.
  // Bulk preview holds the parallel-expanded proposals once Rosie completes.
  const [selectedActionItems, setSelectedActionItems] = useState(new Set());
  // Inline edit state for action items — Rosie's drafts sometimes need
  // fixing before bulk/individual add. `editingActionItemIdx` is the index
  // currently in edit mode (null = nothing being edited). Draft holds the
  // owner/task/due values being edited.
  const [editingActionItemIdx, setEditingActionItemIdx] = useState(null);
  const [actionItemDraft, setActionItemDraft] = useState({ owner: "", task: "", due: "" });
  const [bulkExpansion, setBulkExpansion] = useState(null); // null | { proposals: [{idx, proposal, actionItem}], loading: bool }
  const [open, setOpen] = useState(!!(meeting?.minutes || meeting?.minutesTranscript));
  const [savedFlash, setSavedFlash] = useState("");

  const recRef = useRef(null);
  const wantRef = useRef(false);
  const assistOnRef = useRef(assistOn);
  const briefRef = useRef(brief);
  const nameRef = useRef(name);
  const typeRef = useRef(meetingType);
  const transcriptRef = useRef(meeting?.minutesTranscript || "");
  const lastSpeakerRef = useRef("");
  const currentSpeakerRef = useRef("");
  const suggestBusyRef = useRef(false);
  const lastQRef = useRef("");

  useEffect(() => { assistOnRef.current = assistOn; }, [assistOn]);
  useEffect(() => { briefRef.current = brief; }, [brief]);
  useEffect(() => { nameRef.current = name; }, [name]);
  useEffect(() => { typeRef.current = meetingType; }, [meetingType]);
  useEffect(() => { currentSpeakerRef.current = currentSpeaker; }, [currentSpeaker]);
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

  // Autosave the captured transcript so it isn't lost if she never generates.
  const saveRef = useRef(saveMeeting);
  useEffect(() => { saveRef.current = saveMeeting; });
  useEffect(() => {
    if (transcript === (meeting?.minutesTranscript || "")) return;
    const t = setTimeout(() => saveRef.current({ minutesTranscript: transcriptRef.current }), 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSupported(false);
  }, []);

  const suggestAnswer = useCallback(async (question) => {
    if (suggestBusyRef.current) return;
    suggestBusyRef.current = true;
    setSuggesting(true);
    const recent = transcriptRef.current.trim().split(/\s+/).slice(-450).join(" ");
    const who = nameRef.current?.trim() || "the user";
    const typeLabel = (QM_TYPES.find((t) => t.id === typeRef.current) || {}).label || "meeting";
    const prompt = `You are quietly helping ${who} during a live ${typeLabel}. Someone asked a question or directed something at them. Draft a short, natural suggested response ${who} could actually say out loud — confident and competent, plain-spoken, in their own voice. Not robotic, not over-formal.

Give 2-4 tight talking points (or 2-3 sentences). If there isn't enough information to answer confidently, suggest a smart clarifying question or a graceful way to buy a moment ("Good question — let me pull that up") rather than inventing facts.

About ${who}: ${briefRef.current?.trim() || "(no extra context provided)"}

Recent conversation:
${recent || "(not much captured yet)"}

The question / prompt directed at them: "${question}"

Return ONLY the suggested response text. No preamble, no quotation marks, no "you could say".`;
    try {
      const res = await fetch("/api/rosie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
      if (text) setSuggestion(text);
    } catch {
      setSuggestion("Couldn't draft a suggestion just now — a calm \"Good question, let me come back to you on that\" always buys you a beat.");
    } finally {
      setSuggesting(false);
      suggestBusyRef.current = false;
    }
  }, []);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e) => {
      let finalChunk = "", interimChunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalChunk += t + " ";
        else interimChunk += t;
      }
      if (finalChunk.trim()) {
        const speaker = currentSpeakerRef.current;
        const chunk = finalChunk.trim();
        setTranscript((prev) => {
          let next;
          if (speaker) {
            if (lastSpeakerRef.current !== speaker || !prev.trim()) {
              next = (prev ? prev.replace(/\s+$/, "") + "\n" : "") + speaker + ": " + chunk + " ";
            } else {
              next = prev + chunk + " ";
            }
            lastSpeakerRef.current = speaker;
          } else {
            next = (prev ? prev.replace(/\s+$/, "") + " " : "") + chunk + " ";
          }
          transcriptRef.current = next;
          return next;
        });
        if (assistOnRef.current && speaker !== "Me" && looksLikeQuestion(chunk, nameRef.current)) {
          if (chunk !== lastQRef.current) { lastQRef.current = chunk; suggestAnswer(chunk); }
        }
      }
      setInterim(interimChunk);
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setError("I couldn't reach the microphone. Check your browser's mic permission, then try again.");
        wantRef.current = false; setListening(false);
      }
    };
    rec.onend = () => {
      if (wantRef.current) { try { rec.start(); } catch {} }
      else setInterim("");
    };

    recRef.current = rec;
    wantRef.current = true;
    setError("");
    try { rec.start(); setListening(true); } catch {}
  }, [suggestAnswer]);

  const stopListening = useCallback(() => {
    wantRef.current = false; setListening(false);
    if (recRef.current) { try { recRef.current.stop(); } catch {} }
    setInterim("");
  }, []);

  useEffect(() => () => { wantRef.current = false; if (recRef.current) try { recRef.current.stop(); } catch {} }, []);

  const generate = async () => {
    const text = transcript.trim();
    if (!text) { setError("Add a transcript first — paste one in, or use Listen live to capture the conversation."); return; }
    setBusy(true); setError(""); setResult(null);
    if (listening) stopListening();

    const typeLabel = (QM_TYPES.find((t) => t.id === meetingType) || {}).label || "Meeting";
    const context = [
      meta.title ? `Meeting: ${meta.title}` : "",
      meta.date ? `Date: ${meta.date}` : "",
      meta.attendees ? `Attendees: ${meta.attendees}` : "",
      `Meeting type: ${typeLabel}`,
    ].filter(Boolean).join("\n");

    const prompt = `You are Rosie, a warm, sharp meeting-notes assistant. Turn the transcript below into clean, professional notes. The transcript may use "Speaker: text" labels — use them to attribute decisions and action items accurately.

Format guidance for this ${typeLabel}: ${QM_GUIDANCE[meetingType]}

${context}

TRANSCRIPT:
${text}

Return ONLY a JSON object (no markdown, no backticks, no preamble) with exactly these keys:
{
  "rosieNote": "one warm, plain-spoken sentence (max two) flagging the single most important thing to act on or watch — Rosie's voice: calm, kind, real, never hype",
  "summary": "2-4 sentence plain overview of the meeting and its outcome",
  "minutes": ["concise bullet of a key discussion point"],
  "decisions": ["a decision that was made"],
  "actionItems": [{"owner": "name or 'Unassigned'", "task": "what needs doing", "due": "date/timeframe or 'TBD'"}],
  "openQuestions": ["unresolved question or parking-lot item"],
  "nextSteps": ["what happens next"]
}

Rules: Base everything strictly on the transcript — never invent owners, dates, or decisions. Empty array if a section has nothing. Keep bullets tight and skimmable.`;

    try {
      const res = await fetch("/api/rosie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 4000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const raw = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(raw);
      setResult(parsed);
      saveMeeting({ minutes: parsed, minutesTranscript: text, minutesMeta: meta, minutesType: meetingType });
      setSavedFlash("Minutes saved 🌸");
      setTimeout(() => setSavedFlash(""), 1600);
    } catch {
      setError("Something hiccuped while writing the notes. Give it another go — if it keeps happening, the transcript may be too long.");
    } finally {
      setBusy(false);
    }
  };

  const buildMarkdown = (r) => {
    const L = [];
    L.push(`# ${meta.title || "Meeting Notes"}`);
    if (meta.date) L.push(`*${meta.date}*`);
    if (meta.attendees) L.push(`**Attendees:** ${meta.attendees}`);
    L.push("");
    if (r.rosieNote) { L.push(`> ${r.rosieNote} — Rosie`, ""); }
    if (r.summary) { L.push("## Summary", r.summary, ""); }
    if (r.decisions?.length) { L.push("## Decisions"); r.decisions.forEach((d) => L.push(`- ${d}`)); L.push(""); }
    if (r.actionItems?.length) { L.push("## Action Items"); r.actionItems.forEach((a) => L.push(`- [ ] **${a.owner}** — ${a.task} _(${a.due})_`)); L.push(""); }
    if (r.minutes?.length) { L.push("## Minutes"); r.minutes.forEach((m) => L.push(`- ${m}`)); L.push(""); }
    if (r.openQuestions?.length) { L.push("## Open Questions"); r.openQuestions.forEach((q) => L.push(`- ${q}`)); L.push(""); }
    if (r.nextSteps?.length) { L.push("## Next Steps"); r.nextSteps.forEach((s) => L.push(`- ${s}`)); L.push(""); }
    return L.join("\n");
  };

  // Clean plain-text version of the full minutes — no #, no **, no _()_, no [ ].
  // What you'd actually want to paste into a chat or note app. Single newline
  // between sections, bullet character "•" for lists.
  const buildPlainText = (r) => {
    const L = [];
    L.push(meta.title || "Meeting Notes");
    if (meta.date) L.push(meta.date);
    if (meta.attendees) L.push(`Attendees: ${meta.attendees}`);
    L.push("");
    if (r.rosieNote) { L.push(`${r.rosieNote} — Rosie`, ""); }
    if (r.summary) { L.push("Summary", r.summary, ""); }
    if (r.decisions?.length) { L.push("Decisions"); r.decisions.forEach((d) => L.push(`• ${d}`)); L.push(""); }
    if (r.actionItems?.length) {
      L.push("Action items");
      r.actionItems.forEach((a) => {
        const dueSuffix = a.due ? ` (${a.due})` : "";
        L.push(`• ${a.owner} — ${a.task}${dueSuffix}`);
      });
      L.push("");
    }
    if (r.minutes?.length) { L.push("Minutes"); r.minutes.forEach((m) => L.push(`• ${m}`)); L.push(""); }
    if (r.openQuestions?.length) { L.push("Open questions"); r.openQuestions.forEach((q) => L.push(`• ${q}`)); L.push(""); }
    if (r.nextSteps?.length) { L.push("Next steps"); r.nextSteps.forEach((s) => L.push(`• ${s}`)); L.push(""); }
    return L.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  };

  // Clean HTML for rich-text clipboard — reuses esc() and the buildWordHtml
  // tag soup, minus the <style> block (which interferes with paste). When
  // pasted into Word/Notion/Slack/email, this renders properly.
  const buildCleanHtml = (r) => {
    const li = (arr) => arr.map((x) => `<li>${esc(x)}</li>`).join("");
    const head = `<h2 style="margin:0 0 4px;font-family:Georgia,serif;">${esc(meta.title || "Meeting Notes")}</h2>` +
      (meta.date ? `<p style="margin:0;color:#666;font-size:13px;"><em>${esc(meta.date)}</em></p>` : "") +
      (meta.attendees ? `<p style="margin:4px 0 12px;color:#666;font-size:13px;"><b>Attendees:</b> ${esc(meta.attendees)}</p>` : "<div style='height:8px;'></div>");
    const rosie = r.rosieNote ? `<blockquote style="margin:8px 0 16px;padding:8px 12px;border-left:3px solid #c4a882;background:#fdf6ee;font-style:italic;color:#666;">${esc(r.rosieNote)} — Rosie</blockquote>` : "";
    const section = (title, body) => body ? `<h3 style="margin:14px 0 6px;font-family:Georgia,serif;color:#4a3540;">${title}</h3>${body}` : "";
    const acts = r.actionItems?.length ? `<ul style="margin:0;padding-left:20px;">${r.actionItems.map((a) => {
      const dueSuffix = a.due ? ` <em style="color:#888;">(${esc(a.due)})</em>` : "";
      return `<li><b>${esc(a.owner)}</b> — ${esc(a.task)}${dueSuffix}</li>`;
    }).join("")}</ul>` : "";
    const bulletList = (arr) => arr?.length ? `<ul style="margin:0;padding-left:20px;">${li(arr)}</ul>` : "";
    const sum = r.summary ? `<p style="margin:0;">${esc(r.summary)}</p>` : "";
    const html = head + rosie +
      section("Summary", sum) +
      section("Decisions", bulletList(r.decisions)) +
      section("Action items", acts) +
      section("Minutes", bulletList(r.minutes)) +
      section("Open questions", bulletList(r.openQuestions)) +
      section("Next steps", bulletList(r.nextSteps));
    return `<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#4a3540;">${html}</div>`;
  };

  const copy = (key, payload) => {
    // For the full-result "all" copy: write both rich-HTML and clean
    // plain-text to the clipboard. Pastes correctly into Word/Notion/email
    // (rich) AND into chat / plain editors (clean prose, no markdown).
    if (typeof payload === "object" && payload && payload.summary !== undefined) {
      const plain = buildPlainText(payload);
      const html = buildCleanHtml(payload);
      const writeBoth = async () => {
        if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                "text/html": new Blob([html], { type: "text/html" }),
                "text/plain": new Blob([plain], { type: "text/plain" }),
              }),
            ]);
            return true;
          } catch (e) { /* fall through to plain writeText */ }
        }
        try { await navigator.clipboard?.writeText(plain); return true; } catch { return false; }
      };
      writeBoth().then((ok) => {
        if (ok) { setCopiedKey(key); setTimeout(() => setCopiedKey(""), 1600); }
      });
      return;
    }
    // Per-section copies (already plain-text strings) — straight writeText
    const text = typeof payload === "string" ? payload : String(payload || "");
    navigator.clipboard?.writeText(text).then(() => { setCopiedKey(key); setTimeout(() => setCopiedKey(""), 1600); });
  };

  const fileBase = () => {
    const t = (meta.title || "Meeting Notes").trim();
    const d = meta.date ? " - " + meta.date.trim() : "";
    return (t + d).replace(/[\\/:*?"<>|]+/g, "").slice(0, 80) || "Meeting Notes";
  };

  const downloadBlob = (filename, mime, content) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const buildWordHtml = (r) => {
    const li = (arr) => arr.map((x) => `<li>${esc(x)}</li>`).join("");
    const head = `<h1>${esc(meta.title || "Meeting Notes")}</h1>` +
      (meta.date ? `<p class="meta">${esc(meta.date)}</p>` : "") +
      (meta.attendees ? `<p class="meta"><b>Attendees:</b> ${esc(meta.attendees)}</p>` : "");
    const rosie = r.rosieNote ? `<table class="rosie"><tr><td><i>${esc(r.rosieNote)}</i> &mdash; Rosie</td></tr></table>` : "";
    const sect = (title, html) => html ? `<h2>${title}</h2>${html}` : "";
    const acts = r.actionItems?.length ? `<ul>${r.actionItems.map((a) => `<li><b>${esc(a.owner)}</b> &mdash; ${esc(a.task)} <i>(${esc(a.due)})</i></li>`).join("")}</ul>` : "";
    return `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${esc(meta.title || "Meeting Notes")}</title><style>
      body{font-family:Georgia,serif;color:#4a3540;line-height:1.5;}
      h1{font-size:26pt;margin:0 0 4pt;}
      h2{font-size:15pt;color:#c1734f;border-bottom:1px solid #e6dccb;padding-bottom:3pt;margin:18pt 0 6pt;}
      p,ul{font-family:'Segoe UI',Arial,sans-serif;font-size:11pt;}
      .meta{color:#7a6e70;margin:0 0 2pt;font-size:10pt;}
      li{margin-bottom:4pt;}
      table.rosie{border-collapse:collapse;margin:14pt 0;width:100%;}
      table.rosie td{background:#f7ece6;border-left:3pt solid #c08a8a;padding:8pt 12pt;font-size:11pt;}
    </style></head><body>${head}${rosie}${sect("Summary", r.summary ? `<p>${esc(r.summary)}</p>` : "")}${sect("Decisions", r.decisions?.length ? `<ul>${li(r.decisions)}</ul>` : "")}${sect("Action Items", acts)}${sect("Minutes", r.minutes?.length ? `<ul>${li(r.minutes)}</ul>` : "")}${sect("Open Questions", r.openQuestions?.length ? `<ul>${li(r.openQuestions)}</ul>` : "")}${sect("Next Steps", r.nextSteps?.length ? `<ul>${li(r.nextSteps)}</ul>` : "")}</body></html>`;
  };

  const handleWord = () => downloadBlob(fileBase() + ".doc", "application/msword", buildWordHtml(result));
  const handlePdf = () => { window.print(); };

  const handleEmail = () => {
    const to = (meta.attendees || "").split(",").map((s) => s.trim()).filter((s) => s.includes("@")).join(",");
    const subject = (meta.title || "Meeting Notes") + (meta.date ? " — " + meta.date : "");
    const L = [];
    if (result.summary) L.push(result.summary, "");
    if (result.decisions?.length) { L.push("DECISIONS"); result.decisions.forEach((d) => L.push("- " + d)); L.push(""); }
    if (result.actionItems?.length) { L.push("ACTION ITEMS"); result.actionItems.forEach((a) => L.push(`- ${a.owner}: ${a.task} (${a.due})`)); L.push(""); }
    if (result.nextSteps?.length) { L.push("NEXT STEPS"); result.nextSteps.forEach((s) => L.push("- " + s)); L.push(""); }
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(L.join("\n"))}`;
  };

  const speakerChips = ["Me", ...((meta.attendees || "").split(",").map((s) => s.trim()).filter(Boolean))];
  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  return (
    <>
    <div className="card q-screen" style={{ padding: "16px 20px", marginBottom: 14, border: "1px solid rgba(194,162,92,0.35)", background: "rgba(194,162,92,0.05)", fontFamily: QM_SANS, color: QM.ink }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 7 }}>
          <label className="sl jost" style={{ marginBottom: 0, color: "rgba(154,134,80,0.9)", cursor: "pointer" }}>🪶 Meeting minutes</label>
          <ChevronDown size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s", color: "rgba(154,134,80,0.7)" }} />
        </button>
        {savedFlash && <span className="jost fade" style={{ fontSize: 10, color: "#7a9e78", fontStyle: "italic" }}>{savedFlash}</span>}
      </div>
      {open && (
      <div style={{ marginTop: 12 }}>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          {[{ id: "paste", label: "Paste transcript", icon: ClipboardList }, { id: "live", label: "Listen live", icon: Mic }].map(({ id, label, icon: Icon }) => {
            const active = mode === id;
            return (
              <button key={id} onClick={() => setMode(id)} className="flex items-center gap-2 rounded-2xl px-4 py-2.5 transition-all"
                style={{ fontSize: 14, fontWeight: 500, background: active ? QM.ink : QM.ivory, color: active ? QM.cream : QM.inkSoft, border: `1px solid ${active ? QM.ink : QM.line}`, boxShadow: active ? "0 4px 12px rgba(74,63,68,0.15)" : "none" }}>
                <Icon size={16} strokeWidth={1.8} /> {label}
              </button>
            );
          })}
        </div>

        {/* Meeting type */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2" style={{ color: QM.inkSoft, fontSize: 12.5 }}>
            <Tag size={14} strokeWidth={1.8} /> <span>Meeting type</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QM_TYPES.map((t) => {
              const active = meetingType === t.id;
              return (
                <button key={t.id} onClick={() => setMeetingType(t.id)} className="rounded-full px-3.5 py-1.5 transition-all"
                  style={{ fontSize: 13, fontWeight: 500, background: active ? QM.gold : QM.ivory, color: active ? QM.ivory : QM.inkSoft, border: `1px solid ${active ? QM.gold : QM.line}` }}>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meta fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <QmField icon={FileText} placeholder="Meeting title" value={meta.title} onChange={(v) => setMeta({ ...meta, title: v })} />
          <QmField icon={Calendar} placeholder="Date" value={meta.date} onChange={(v) => setMeta({ ...meta, date: v })} />
          <QmField icon={Users} placeholder="Attendees (comma-separated)" value={meta.attendees} onChange={(v) => setMeta({ ...meta, attendees: v })} />
        </div>

        {/* Live controls */}
        {mode === "live" && (
          <div className="rounded-3xl p-5 mb-4" style={{ background: QM.ivory, border: `1px solid ${QM.line}`, boxShadow: "0 6px 20px rgba(74,63,68,0.06)" }}>
            {!supported ? (
              <p style={{ color: QM.inkSoft, fontSize: 14, lineHeight: 1.6 }}>
                Live listening needs Chrome or Edge. In the meantime, switch to <em>Paste transcript</em> — Teams gives you a transcript you can drop right in.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <button onClick={listening ? stopListening : startListening} className="flex items-center gap-2.5 rounded-2xl px-5 py-3 transition-all"
                    style={{ fontSize: 15, fontWeight: 600, background: listening ? QM.rose : QM.terracotta, color: QM.ivory, boxShadow: `0 6px 16px ${listening ? "rgba(192,138,138,0.35)" : "rgba(193,115,79,0.32)"}` }}>
                    {listening ? <Square size={17} strokeWidth={2} /> : <Mic size={17} strokeWidth={2} />}
                    {listening ? "Stop listening" : "Start listening"}
                  </button>
                  {listening && (
                    <span className="flex items-center gap-2" style={{ color: QM.rose, fontSize: 13.5, fontWeight: 500 }}>
                      <span style={{ width: 9, height: 9, borderRadius: 99, background: QM.rose, display: "inline-block", animation: "qpulse 1.3s ease-in-out infinite" }} /> listening…
                    </span>
                  )}
                </div>

                {/* Speaker chips */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2" style={{ color: QM.inkSoft, fontSize: 12.5 }}>
                    <User size={14} strokeWidth={1.8} /> <span>Who's talking now? (tags the transcript — tap <strong>Me</strong> when it's you)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {speakerChips.map((s) => {
                      const active = currentSpeaker === s;
                      return (
                        <button key={s} onClick={() => setCurrentSpeaker(active ? "" : s)} className="rounded-full px-3.5 py-1.5 transition-all"
                          style={{ fontSize: 13, fontWeight: 500, background: active ? QM.lavender : QM.cream, color: active ? QM.ivory : QM.inkSoft, border: `1px solid ${active ? QM.lavender : QM.line}` }}>
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Answer assist toggle */}
                <div className="flex items-center justify-between mt-4 rounded-2xl px-4 py-3" style={{ background: QM.cream, border: `1px solid ${QM.line}` }}>
                  <div className="flex items-center gap-2.5">
                    <Wand2 size={16} strokeWidth={1.8} color={QM.sage} />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>Answer assist</div>
                      <div style={{ fontSize: 12, color: QM.inkSoft }}>Drafts a reply when someone asks a question</div>
                    </div>
                  </div>
                  <button onClick={() => setAssistOn(!assistOn)} className="rounded-full transition-all" aria-label="Toggle answer assist"
                    style={{ width: 46, height: 26, background: assistOn ? QM.sage : QM.line, position: "relative", flexShrink: 0 }}>
                    <span style={{ position: "absolute", top: 3, left: assistOn ? 23 : 3, width: 20, height: 20, borderRadius: 99, background: QM.ivory, transition: "left .18s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </button>
                </div>

                <details className="mt-3">
                  <summary style={{ fontSize: 12.5, color: QM.inkSoft, cursor: "pointer" }}>About me (helps assist sound like you)</summary>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                    <QmField icon={User} placeholder="Your name" value={name} onChange={setName} />
                    <div className="sm:col-span-2">
                      <textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Your role, projects, key facts — e.g. 'Project Coordinator, leading the VOS vendor onboarding rollout through Nov…'"
                        style={{ width: "100%", minHeight: 58, resize: "vertical", outline: "none", border: `1px solid ${QM.line}`, borderRadius: 16, background: QM.ivory, color: QM.ink, fontSize: 13, lineHeight: 1.5, padding: "10px 12px" }} />
                    </div>
                  </div>
                </details>

                <p style={{ color: QM.inkSoft, fontSize: 12, lineHeight: 1.6, marginTop: 12 }}>
                  Tip: this captures your microphone. To pick up a Teams call, use speakerphone or route the meeting audio to your mic with a virtual audio cable.
                </p>
              </>
            )}
          </div>
        )}

        {/* Answer assist panel */}
        {mode === "live" && assistOn && (suggesting || suggestion) && (
          <div className="rounded-3xl p-5 mb-4" style={{ background: `linear-gradient(150deg, ${QM.sage}1f, ${QM.gold}1a)`, border: `1px solid ${QM.sage}55` }}>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2" style={{ color: QM.sage, fontWeight: 600 }}>
                <MessageSquare size={16} strokeWidth={2} />
                <span style={{ fontSize: 14 }}>Something you could say</span>
              </div>
              <div className="flex items-center gap-3">
                {suggestion && !suggesting && (
                  <button onClick={() => copy("sugg", suggestion)} className="flex items-center gap-1" style={{ color: QM.inkSoft, fontSize: 12.5 }}>
                    {copiedKey === "sugg" ? <Check size={14} color={QM.sage} /> : <Copy size={14} strokeWidth={1.7} />} {copiedKey === "sugg" ? "copied" : "copy"}
                  </button>
                )}
                <button onClick={() => { setSuggestion(""); }} style={{ color: QM.inkSoft }} aria-label="Dismiss"><X size={16} strokeWidth={1.8} /></button>
              </div>
            </div>
            {suggesting && !suggestion ? (
              <div className="flex items-center gap-2" style={{ color: QM.inkSoft, fontSize: 14 }}>
                <Loader2 size={15} className="animate-spin" /> drafting a reply…
              </div>
            ) : (
              <p style={{ fontSize: 14.5, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{suggestion}</p>
            )}
          </div>
        )}

        {/* Transcript */}
        <div className="rounded-3xl mb-4 overflow-hidden" style={{ background: QM.ivory, border: `1px solid ${QM.line}`, boxShadow: "0 6px 20px rgba(74,63,68,0.06)" }}>
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <span style={{ fontFamily: QM_SERIF, fontSize: 19, fontWeight: 600 }}>Transcript</span>
            <div className="flex items-center gap-3">
              {mode === "live" && supported && (
                <button onClick={() => suggestAnswer("(no specific question — suggest what I could add or say next)")} className="flex items-center gap-1.5" style={{ color: QM.sage, fontSize: 12.5, fontWeight: 500 }}>
                  <Wand2 size={14} strokeWidth={1.8} /> help me answer
                </button>
              )}
              <span style={{ color: QM.inkSoft, fontSize: 12 }}>{wordCount} words</span>
              {transcript && (
                <button onClick={() => { setTranscript(""); setInterim(""); lastSpeakerRef.current = ""; }} className="flex items-center gap-1.5" style={{ color: QM.inkSoft, fontSize: 12.5 }}>
                  <Trash2 size={14} strokeWidth={1.8} /> clear
                </button>
              )}
            </div>
          </div>
          <textarea value={transcript + (interim ? (transcript ? " " : "") + interim : "")}
            onChange={(e) => { setTranscript(e.target.value); setInterim(""); }}
            placeholder={mode === "live" ? "Your words will appear here as you talk. You can also type or edit anything." : "Paste your Teams transcript or notes here…"}
            spellCheck={false}
            style={{ width: "100%", minHeight: 200, resize: "vertical", outline: "none", border: "none", background: "transparent", color: QM.ink, fontSize: 14.5, lineHeight: 1.7, padding: "4px 20px 20px", whiteSpace: "pre-wrap" }} />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-2xl px-4 py-3 mb-4" style={{ background: "#f7ece6", border: `1px solid ${QM.terracotta}33`, color: QM.terracotta, fontSize: 13.5, lineHeight: 1.5 }}>
            <AlertCircle size={17} strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 1 }} /> <span>{error}</span>
          </div>
        )}

        <button onClick={generate} disabled={busy} className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 transition-all mb-8"
          style={{ fontSize: 16, fontWeight: 600, fontFamily: QM_SERIF, letterSpacing: 0.3, background: busy ? QM.inkSoft : QM.ink, color: QM.cream, boxShadow: "0 8px 22px rgba(74,63,68,0.22)", cursor: busy ? "default" : "pointer", opacity: busy ? 0.85 : 1 }}>
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} strokeWidth={1.8} />}
          {busy ? "Writing your notes…" : "Generate notes"}
        </button>

        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 style={{ fontFamily: QM_SERIF, fontSize: 26, fontWeight: 600 }}>Your notes</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <QmExportBtn onClick={() => copy("all", result)} icon={copiedKey === "all" ? Check : Copy} label={copiedKey === "all" ? "Copied!" : "Copy all"} bg={QM.sage} />
                <QmExportBtn onClick={handleWord} icon={FileDown} label="Word" bg={QM.terracotta} />
                <QmExportBtn onClick={handlePdf} icon={Printer} label="PDF" bg={QM.gold} />
                <QmExportBtn onClick={handleEmail} icon={Mail} label="Email" bg={QM.lavender} />
              </div>
            </div>

            {result.rosieNote && (
              <div className="rounded-3xl p-5" style={{ background: `linear-gradient(150deg, ${QM.rose}22, ${QM.gold}1a)`, border: `1px solid ${QM.rose}55` }}>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center rounded-2xl" style={{ width: 38, height: 38, background: QM.ivory, flexShrink: 0, boxShadow: "0 2px 8px rgba(74,63,68,0.08)" }}>
                    <Sparkles size={18} strokeWidth={1.7} color={QM.terracotta} />
                  </span>
                  <div>
                    <div style={{ fontSize: 12.5, color: QM.terracotta, fontWeight: 600, letterSpacing: 0.3, marginBottom: 2 }}>A note from Rosie</div>
                    <p style={{ fontSize: 15.5, lineHeight: 1.6, fontStyle: "italic" }}>{result.rosieNote}</p>
                  </div>
                </div>
              </div>
            )}

            {result.summary && (
              <QmCard title="Summary" icon={FileText} accent={QM.gold} onCopy={() => copy("summary", result.summary)} copied={copiedKey === "summary"}>
                <p style={{ fontSize: 14.5, lineHeight: 1.7 }}>{result.summary}</p>
              </QmCard>
            )}
            {result.decisions?.length > 0 && (
              <QmCard title="Decisions" icon={Gavel} accent={QM.terracotta} onCopy={() => copy("dec", result.decisions.map((d) => `• ${d}`).join("\n"))} copied={copiedKey === "dec"}>
                <QmBullets items={result.decisions} color={QM.terracotta} />
              </QmCard>
            )}
            {result.actionItems?.length > 0 && (
              <QmCard title="Action items" icon={ListChecks} accent={QM.sage} onCopy={() => copy("act", result.actionItems.map((a) => `[ ] ${a.owner} — ${a.task} (${a.due})`).join("\n"))} copied={copiedKey === "act"}>
                {/* Bulk controls — appear when there are 2+ unadded items.
                    Select all + bulk add. Hidden when nothing's selectable. */}
                {onUpdateData && result.actionItems.filter((_, i) => !expansionAdded[i]).length >= 2 && (() => {
                  const eligibleCount = result.actionItems.reduce((n, _, i) => n + (expansionAdded[i] ? 0 : 1), 0);
                  const selectedCount = selectedActionItems.size;
                  const allSelected = selectedCount === eligibleCount && eligibleCount > 0;
                  const toggleAll = () => {
                    if (allSelected) {
                      setSelectedActionItems(new Set());
                    } else {
                      const next = new Set();
                      result.actionItems.forEach((_, i) => { if (!expansionAdded[i]) next.add(i); });
                      setSelectedActionItems(next);
                    }
                  };
                  const runBulkExpansion = async () => {
                    const indices = Array.from(selectedActionItems).filter(i => !expansionAdded[i]);
                    if (indices.length === 0) return;
                    setBulkExpansion({ proposals: [], loading: true, total: indices.length });
                    const meetingContext = { title: meta.title, date: meta.date, summary: result.summary || "" };
                    // Parallel expansion — all selected items hit Rosie at once.
                    // Each one has its own 20s timeout in expandActionItemToWorkHubItem.
                    const results = await Promise.all(indices.map(async (idx) => {
                      const a = result.actionItems[idx];
                      try {
                        const proposal = await expandActionItemToWorkHubItem(a, meetingContext);
                        if (proposal.error) {
                          return { idx, actionItem: a, proposal: {
                            title: a.task.length > 60 ? a.task.slice(0, 57) + "..." : a.task,
                            why: `From ${meta.title || "meeting"} (${meta.date || "today"})`,
                            subtasks: [], taskTimes: [], suggestedDate: "", priority: "medium",
                          }, isFallback: true };
                        }
                        return { idx, actionItem: a, proposal, isFallback: false };
                      } catch (e) {
                        return { idx, actionItem: a, proposal: {
                          title: a.task, why: "", subtasks: [], taskTimes: [], suggestedDate: "", priority: "medium",
                        }, isFallback: true };
                      }
                    }));
                    setBulkExpansion({ proposals: results, loading: false });
                  };
                  return (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10, padding: "8px 12px", background: "rgba(212,130,154,0.06)", border: "1px dashed rgba(212,130,154,0.3)", borderRadius: 9 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleAll}
                          style={{ cursor: "pointer", accentColor: "#b86d85" }}
                        />
                        <span className="jost" style={{ fontSize: 11, color: "#b86d85", fontWeight: 600, letterSpacing: 0.3 }}>
                          {allSelected ? `${selectedCount} selected` : selectedCount > 0 ? `${selectedCount} selected` : "Select all"}
                        </span>
                      </label>
                      <button
                        disabled={selectedCount === 0}
                        onClick={runBulkExpansion}
                        className="jost"
                        style={{
                          padding: "5px 12px",
                          background: selectedCount > 0 ? "linear-gradient(135deg,#d4829a,#b86d85)" : "rgba(74,53,64,0.1)",
                          color: selectedCount > 0 ? "#fff" : "rgba(74,53,64,0.35)",
                          border: "none", borderRadius: 7, fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
                          cursor: selectedCount > 0 ? "pointer" : "default",
                        }}
                      >✨ Draft {selectedCount > 0 ? `${selectedCount} ` : ""}with Rosie</button>
                    </div>
                  );
                })()}
                <div className="space-y-2.5">
                  {result.actionItems.map((a, i) => {
                    const added = !!expansionAdded[i];
                    const loading = expandingIdx === i;
                    const selected = selectedActionItems.has(i);
                    const isEditing = editingActionItemIdx === i;
                    const toggleSelect = () => {
                      setSelectedActionItems(prev => {
                        const next = new Set(prev);
                        if (next.has(i)) next.delete(i); else next.add(i);
                        return next;
                      });
                    };
                    const startEdit = () => {
                      setEditingActionItemIdx(i);
                      setActionItemDraft({
                        owner: a.owner || "",
                        task: a.task || "",
                        due: a.due || "",
                      });
                    };
                    const cancelEdit = () => {
                      setEditingActionItemIdx(null);
                      setActionItemDraft({ owner: "", task: "", due: "" });
                    };
                    const saveEdit = () => {
                      const trimmed = {
                        owner: actionItemDraft.owner.trim() || "Unassigned",
                        task: actionItemDraft.task.trim(),
                        due: actionItemDraft.due.trim() || "TBD",
                      };
                      if (!trimmed.task) { cancelEdit(); return; }
                      // Write back to meeting.minutes.actionItems via saveMeeting.
                      // Guard: only update if minutes still has the array shape.
                      const nextActionItems = result.actionItems.map((x, j) => j === i ? trimmed : x);
                      const updatedMinutes = { ...(meeting.minutes || result), actionItems: nextActionItems };
                      saveMeeting({ ...meeting, minutes: updatedMinutes });
                      cancelEdit();
                    };
                    return (
                      <div key={i} className="flex items-start gap-3 rounded-2xl px-3.5 py-3" style={{
                        background: isEditing ? "rgba(255,255,255,0.85)" : selected ? "rgba(212,130,154,0.06)" : QM.cream,
                        border: `1px solid ${isEditing ? "rgba(212,130,154,0.5)" : selected ? "rgba(212,130,154,0.4)" : QM.line}`,
                        transition: "background .15s, border-color .15s",
                      }}>
                        {/* Real checkbox — selectable when not yet added. */}
                        {!added && onUpdateData && !isEditing ? (
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={toggleSelect}
                            style={{ marginTop: 4, flexShrink: 0, cursor: "pointer", accentColor: "#b86d85", width: 16, height: 16 }}
                            title="Select for bulk add"
                          />
                        ) : (
                          <span style={{ width: 16, height: 16, borderRadius: 6, border: `2px solid ${added ? "#7a9e78" : QM.sage}`, background: added ? "#7a9e78" : "transparent", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>
                            {added ? "✓" : ""}
                          </span>
                        )}
                        <div style={{ flex: 1, minWidth: 0, fontSize: 14.5, lineHeight: 1.55 }}>
                          {isEditing ? (
                            <>
                              {/* Three inline fields: owner, task (textarea for
                                  long text), due. Esc cancels, Cmd/Ctrl+Enter saves. */}
                              <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                                <div style={{ flex: "0 0 130px", minWidth: 100 }}>
                                  <label className="jost" style={{ display: "block", fontSize: 9, color: "rgba(74,53,64,0.5)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 2 }}>Owner</label>
                                  <input
                                    autoFocus
                                    value={actionItemDraft.owner}
                                    onChange={e => setActionItemDraft({ ...actionItemDraft, owner: e.target.value })}
                                    onKeyDown={e => { if (e.key === "Escape") cancelEdit(); if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveEdit(); }}
                                    className="jost"
                                    placeholder="Unassigned"
                                    style={{ width: "100%", boxSizing: "border-box", fontSize: 12, padding: "5px 8px", border: "1px solid rgba(212,130,154,0.25)", borderRadius: 5, background: "rgba(255,255,255,0.7)", outline: "none", fontFamily: "'Jost', sans-serif" }}
                                  />
                                </div>
                                <div style={{ flex: "0 0 160px", minWidth: 120 }}>
                                  <label className="jost" style={{ display: "block", fontSize: 9, color: "rgba(74,53,64,0.5)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 2 }}>Due</label>
                                  <input
                                    value={actionItemDraft.due}
                                    onChange={e => setActionItemDraft({ ...actionItemDraft, due: e.target.value })}
                                    onKeyDown={e => { if (e.key === "Escape") cancelEdit(); if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveEdit(); }}
                                    className="jost"
                                    placeholder="TBD"
                                    style={{ width: "100%", boxSizing: "border-box", fontSize: 12, padding: "5px 8px", border: "1px solid rgba(212,130,154,0.25)", borderRadius: 5, background: "rgba(255,255,255,0.7)", outline: "none", fontFamily: "'Jost', sans-serif" }}
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="jost" style={{ display: "block", fontSize: 9, color: "rgba(74,53,64,0.5)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 2 }}>Task</label>
                                <textarea
                                  value={actionItemDraft.task}
                                  onChange={e => setActionItemDraft({ ...actionItemDraft, task: e.target.value })}
                                  onKeyDown={e => { if (e.key === "Escape") cancelEdit(); if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveEdit(); }}
                                  rows={2}
                                  className="jost"
                                  placeholder="What needs to happen…"
                                  style={{ width: "100%", boxSizing: "border-box", fontSize: 13, padding: "6px 9px", border: "1px solid rgba(212,130,154,0.25)", borderRadius: 5, background: "rgba(255,255,255,0.7)", outline: "none", fontFamily: "'Jost', sans-serif", resize: "vertical", lineHeight: 1.4 }}
                                />
                              </div>
                              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                                <button onClick={saveEdit} className="jost" style={{ background: "linear-gradient(135deg,#d4829a,#b86d85)", color: "#fff", padding: "4px 12px", fontSize: 10, fontWeight: 600, letterSpacing: 0.3, border: "none", borderRadius: 6, cursor: "pointer" }}>✓ Save</button>
                                <button onClick={cancelEdit} className="jost" style={{ background: "rgba(255,255,255,0.6)", color: "rgba(74,53,64,0.6)", padding: "4px 10px", fontSize: 10, fontWeight: 500, border: "1px solid rgba(74,53,64,0.15)", borderRadius: 6, cursor: "pointer" }}>Cancel</button>
                                <span className="jost" style={{ fontSize: 9, color: "rgba(74,53,64,0.4)", letterSpacing: 0.3, alignSelf: "center", marginLeft: "auto", fontStyle: "italic" }}>Esc to cancel · Ctrl+Enter to save</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <span style={{ fontWeight: 600 }}>{a.owner}</span> — {a.task}
                                {a.due && <span style={{ color: QM.inkSoft }}> · <em>{a.due}</em></span>}
                              </div>
                              {/* Per-row buttons — Edit (inline) + Add (preview modal). */}
                              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                                {!added && (
                                  <button
                                    onClick={startEdit}
                                    className="jost"
                                    style={{
                                      padding: "4px 10px",
                                      background: "rgba(255,255,255,0.7)",
                                      border: "1px solid rgba(74,53,64,0.15)",
                                      color: "rgba(74,53,64,0.6)",
                                      fontSize: 10.5, fontWeight: 600, letterSpacing: 0.3,
                                      borderRadius: 7, cursor: "pointer",
                                    }}
                                  >✎ Edit</button>
                                )}
                                {onUpdateData && (
                                  <button
                                    disabled={loading || added}
                                    onClick={async () => {
                                      if (loading || added) return;
                                      setExpandingIdx(i);
                                      try {
                                  const meetingContext = {
                                    title: meta.title,
                                    date: meta.date,
                                    summary: result.summary || "",
                                  };
                                  const proposal = await expandActionItemToWorkHubItem(a, meetingContext);
                                  if (proposal.error) {
                                    const fallback = {
                                      title: a.task.length > 60 ? a.task.slice(0, 57) + "..." : a.task,
                                      why: `From ${meta.title || "meeting"} (${meta.date || "today"})`,
                                      subtasks: [],
                                      taskTimes: [],
                                      suggestedDate: "",
                                      priority: "medium",
                                    };
                                    setExpansionPreview({ idx: i, proposal: fallback, actionItem: a, isFallback: true, error: proposal.error });
                                  } else {
                                    setExpansionPreview({ idx: i, proposal, actionItem: a, isFallback: false });
                                  }
                                } catch (e) {
                                  setExpansionPreview({ idx: i, proposal: { title: a.task, why: "", subtasks: [], taskTimes: [], suggestedDate: "", priority: "medium" }, actionItem: a, isFallback: true, error: "network" });
                                } finally {
                                  setExpandingIdx(null);
                                }
                              }}
                              className="jost"
                              style={{
                                marginTop: 6, padding: "4px 10px",
                                background: added ? "rgba(158,184,154,0.18)" : loading ? "rgba(184,160,212,0.2)" : "rgba(212,130,154,0.1)",
                                border: `1px solid ${added ? "rgba(158,184,154,0.5)" : loading ? "rgba(184,160,212,0.45)" : "rgba(212,130,154,0.35)"}`,
                                color: added ? "#7a9e78" : loading ? "#9878b8" : "#b86d85",
                                fontSize: 10.5, fontWeight: 600, letterSpacing: 0.3,
                                borderRadius: 7, cursor: (loading || added) ? "default" : "pointer",
                              }}
                            >
                              {added ? "✓ Added to Work Hub" : loading ? "✨ Rosie's drafting…" : "+ Add (with preview)"}
                            </button>
                          )}
                                </div>
                              </>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </QmCard>
            )}
            {result.minutes?.length > 0 && (
              <QmCard title="Minutes" icon={ClipboardList} accent={QM.lavender} onCopy={() => copy("min", result.minutes.map((m) => `• ${m}`).join("\n"))} copied={copiedKey === "min"}>
                <QmBullets items={result.minutes} color={QM.lavender} />
              </QmCard>
            )}
            {result.openQuestions?.length > 0 && (
              <QmCard title="Open questions" icon={HelpCircle} accent={QM.rose} onCopy={() => copy("oq", result.openQuestions.map((q) => `• ${q}`).join("\n"))} copied={copiedKey === "oq"}>
                <QmBullets items={result.openQuestions} color={QM.rose} />
              </QmCard>
            )}
            {result.nextSteps?.length > 0 && (
              <QmCard title="Next steps" icon={ArrowRight} accent={QM.gold} onCopy={() => copy("ns", result.nextSteps.map((s) => `• ${s}`).join("\n"))} copied={copiedKey === "ns"}>
                <QmBullets items={result.nextSteps} color={QM.gold} />
              </QmCard>
            )}
          </div>
        )}

      </div>
      )}
      <style>{`@keyframes qpulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        .q-print { display: none; }
        @media print {
          body * { visibility: hidden; }
          .q-print, .q-print * { visibility: visible; }
          .q-print { display: block !important; position: absolute; top: 0; left: 0; width: 100%; }
        }`}</style>
    </div>
    {result && <QmPrintView r={result} meta={meta} />}
    {/* Action item → Work Hub task expansion preview modal. Opens when user
        clicks "+ Add to Work Hub" on a row and Rosie has produced a draft
        (or heuristic fallback fired). Lets them tweak before saving. */}
    {expansionPreview && (
      <ActionItemExpansionModal
        preview={expansionPreview}
        meeting={meeting}
        meta={meta}
        onCancel={() => setExpansionPreview(null)}
        onAccept={(item) => {
          if (!onUpdateData || !fullData) { setExpansionPreview(null); return; }
          const now = Date.now();
          const newItem = {
            id: `item-${now}-${Math.random().toString(36).slice(2, 7)}`,
            title: item.title.trim(),
            why: item.why.trim(),
            status: "todo",
            priority: item.priority || "medium",
            tasks: item.subtasks || [],
            taskTimes: item.taskTimes || [],
            completedTasks: [],
            scheduledDate: item.suggestedDate || "",
            tbd: !item.suggestedDate,
            createdAt: now,
            lastUpdatedAt: now,
            source: "meeting-action-item",
            sourceMeetingId: meeting?.id || null,
            sourceMeetingTitle: meta?.title || "",
          };
          onUpdateData({ ...fullData, items: [...(fullData.items || []), newItem] });
          setExpansionAdded(prev => ({ ...prev, [expansionPreview.idx]: true }));
          setExpansionPreview(null);
        }}
      />
    )}
    {/* Bulk expansion preview — opens when "Draft N with Rosie" finishes.
        Shows all proposals as a compact list; user can skip individual rows
        before "Add all" commits the batch to data.items. */}
    {bulkExpansion && (
      <BulkExpansionModal
        bulkExpansion={bulkExpansion}
        meeting={meeting}
        meta={meta}
        onCancel={() => { setBulkExpansion(null); setSelectedActionItems(new Set()); }}
        onAcceptAll={(acceptedProposals) => {
          if (!onUpdateData || !fullData || acceptedProposals.length === 0) {
            setBulkExpansion(null);
            setSelectedActionItems(new Set());
            return;
          }
          const baseNow = Date.now();
          const newItems = acceptedProposals.map((entry, i) => ({
            id: `item-${baseNow}-${i}-${Math.random().toString(36).slice(2, 5)}`,
            title: entry.proposal.title.trim(),
            why: entry.proposal.why.trim(),
            status: "todo",
            priority: entry.proposal.priority || "medium",
            tasks: entry.proposal.subtasks || [],
            taskTimes: entry.proposal.taskTimes || [],
            completedTasks: [],
            scheduledDate: entry.proposal.suggestedDate || "",
            tbd: !entry.proposal.suggestedDate,
            createdAt: baseNow + i,
            lastUpdatedAt: baseNow + i,
            source: "meeting-action-item",
            sourceMeetingId: meeting?.id || null,
            sourceMeetingTitle: meta?.title || "",
          }));
          onUpdateData({ ...fullData, items: [...(fullData.items || []), ...newItems] });
          const addedSet = { ...expansionAdded };
          acceptedProposals.forEach(entry => { addedSet[entry.idx] = true; });
          setExpansionAdded(addedSet);
          setBulkExpansion(null);
          setSelectedActionItems(new Set());
        }}
      />
    )}
    </>
  );
}

// ── Action Item Expansion Modal ───────────────────────────────────────────────
// Preview of a Rosie-expanded meeting action item before it becomes a Work
// Hub item. All fields editable inline. Cancel discards; Save adds to items.
function ActionItemExpansionModal({ preview, meeting, meta, onCancel, onAccept }) {
  const [draft, setDraft] = useState({
    title: preview.proposal.title || "",
    why: preview.proposal.why || "",
    subtasks: preview.proposal.subtasks || [],
    taskTimes: preview.proposal.taskTimes || [],
    suggestedDate: preview.proposal.suggestedDate || "",
    priority: preview.proposal.priority || "medium",
  });
  const updateSubtask = (i, text) => {
    const next = [...draft.subtasks];
    next[i] = text;
    setDraft({ ...draft, subtasks: next });
  };
  const updateSubtaskTime = (i, mins) => {
    const next = [...draft.taskTimes];
    next[i] = mins;
    setDraft({ ...draft, taskTimes: next });
  };
  const removeSubtask = (i) => {
    setDraft({
      ...draft,
      subtasks: draft.subtasks.filter((_, idx) => idx !== i),
      taskTimes: draft.taskTimes.filter((_, idx) => idx !== i),
    });
  };
  const addSubtask = () => {
    setDraft({ ...draft, subtasks: [...draft.subtasks, ""], taskTimes: [...draft.taskTimes, 15] });
  };
  const canSave = draft.title.trim().length > 0;
  const totalMin = draft.taskTimes.reduce((a, b) => a + (Number(b) || 0), 0);
  return (
    <div className="modal-bg" onClick={onCancel}>
      <div className="modal fade" onClick={e => e.stopPropagation()} style={{ maxWidth: 560, maxHeight: "88vh", overflow: "auto" }}>
        <div className="jost" style={{ fontSize: 10, letterSpacing: 2.5, color: "rgba(212,130,154,0.7)", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
          ✨ rosie's draft
        </div>
        <div className="cg" style={{ fontSize: 22, fontStyle: "italic", color: "#4a3540", textAlign: "center", marginBottom: 8 }}>
          New Work Hub task
        </div>
        <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.55)", lineHeight: 1.6, textAlign: "center", marginBottom: 16 }}>
          From <em>"{meta?.title || "this meeting"}"</em> · Edit anything before saving.
          {preview.isFallback && (
            <span style={{ display: "block", marginTop: 4, color: "#9a7850" }}>
              {preview.error === "timeout" ? "Rosie was slow — drafted a starting point." : "Rosie couldn't expand this one — drafted a starting point."}
            </span>
          )}
        </p>
        {/* Title */}
        <div style={{ marginBottom: 12 }}>
          <label className="jost" style={{ display: "block", fontSize: 10, color: "rgba(74,53,64,0.55)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>Title</label>
          <input
            value={draft.title}
            onChange={e => setDraft({ ...draft, title: e.target.value })}
            className="jost"
            placeholder="Short, action-oriented…"
            style={{ width: "100%", fontSize: 14, padding: "8px 10px", border: "1px solid rgba(212,130,154,0.25)", borderRadius: 7, background: "rgba(255,255,255,0.7)", outline: "none", fontFamily: "'Jost', sans-serif" }}
          />
        </div>
        {/* Why */}
        <div style={{ marginBottom: 12 }}>
          <label className="jost" style={{ display: "block", fontSize: 10, color: "rgba(74,53,64,0.55)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>Why it matters</label>
          <textarea
            value={draft.why}
            onChange={e => setDraft({ ...draft, why: e.target.value })}
            className="jost"
            placeholder="What's the goal or context?"
            rows={2}
            style={{ width: "100%", fontSize: 12, padding: "8px 10px", border: "1px solid rgba(212,130,154,0.25)", borderRadius: 7, background: "rgba(255,255,255,0.7)", outline: "none", fontFamily: "'Jost', sans-serif", resize: "vertical" }}
          />
        </div>
        {/* Subtasks */}
        <div style={{ marginBottom: 12 }}>
          <label className="jost" style={{ display: "block", fontSize: 10, color: "rgba(74,53,64,0.55)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>
            Subtasks {totalMin > 0 && <span style={{ color: "#7a9e78", fontWeight: 600 }}>· {totalMin}m total</span>}
          </label>
          {draft.subtasks.length === 0 && (
            <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.4)", fontStyle: "italic", padding: "6px 0" }}>No subtasks yet. Add some below or save without.</div>
          )}
          {draft.subtasks.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <input
                value={s}
                onChange={e => updateSubtask(i, e.target.value)}
                className="jost"
                placeholder={`Step ${i + 1}…`}
                style={{ flex: 1, fontSize: 12, padding: "6px 9px", border: "1px solid rgba(212,130,154,0.2)", borderRadius: 6, background: "rgba(255,255,255,0.65)", outline: "none", fontFamily: "'Jost', sans-serif" }}
              />
              <input
                type="number"
                value={draft.taskTimes[i] || 15}
                onChange={e => updateSubtaskTime(i, Math.max(1, Math.min(180, Number(e.target.value) || 15)))}
                className="jost"
                style={{ width: 56, fontSize: 11, padding: "6px 7px", border: "1px solid rgba(212,130,154,0.2)", borderRadius: 6, background: "rgba(255,255,255,0.65)", outline: "none", fontFamily: "'Jost', sans-serif", textAlign: "center" }}
                min="1"
                max="180"
              />
              <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.4)" }}>m</span>
              <button
                onClick={() => removeSubtask(i)}
                style={{ background: "none", border: "none", color: "rgba(74,53,64,0.35)", cursor: "pointer", fontSize: 14, padding: "0 4px" }}
                title="Remove"
              >×</button>
            </div>
          ))}
          <button
            onClick={addSubtask}
            className="jost"
            style={{ marginTop: 4, padding: "4px 10px", background: "none", border: "1px dashed rgba(212,130,154,0.4)", color: "rgba(184,109,133,0.8)", fontSize: 10, borderRadius: 6, cursor: "pointer", fontWeight: 500 }}
          >+ add subtask</button>
        </div>
        {/* Date + Priority row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label className="jost" style={{ display: "block", fontSize: 10, color: "rgba(74,53,64,0.55)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>Scheduled date</label>
            <input
              type="date"
              value={draft.suggestedDate}
              onChange={e => setDraft({ ...draft, suggestedDate: e.target.value })}
              className="jost"
              style={{ width: "100%", fontSize: 12, padding: "6px 9px", border: "1px solid rgba(212,130,154,0.25)", borderRadius: 7, background: "rgba(255,255,255,0.7)", outline: "none", fontFamily: "'Jost', sans-serif", colorScheme: "light" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="jost" style={{ display: "block", fontSize: 10, color: "rgba(74,53,64,0.55)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>Priority</label>
            <select
              value={draft.priority}
              onChange={e => setDraft({ ...draft, priority: e.target.value })}
              className="jost"
              style={{ width: "100%", fontSize: 12, padding: "6px 9px", border: "1px solid rgba(212,130,154,0.25)", borderRadius: 7, background: "rgba(255,255,255,0.7)", outline: "none", fontFamily: "'Jost', sans-serif", cursor: "pointer" }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <button onClick={onCancel} className="btn ghost jost" style={{ padding: "8px 14px", fontSize: 12 }}>Cancel</button>
          <button
            onClick={() => onAccept(draft)}
            disabled={!canSave}
            className="jost"
            style={{
              background: canSave ? "linear-gradient(135deg,#d4829a,#b86d85)" : "rgba(74,53,64,0.15)",
              color: canSave ? "#fff" : "rgba(74,53,64,0.4)",
              padding: "8px 18px", fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
              border: "none", borderRadius: 7,
              cursor: canSave ? "pointer" : "default",
            }}
          >✓ Add to Work Hub</button>
        </div>
      </div>
    </div>
  );
}

// ── Bulk Expansion Modal ──────────────────────────────────────────────────────
// Shown after parallel Rosie expansion completes for multiple action items.
// Renders a compact preview list — each row has a "skip" toggle. "Add all"
// commits only the non-skipped proposals. Skipped rows are simply dropped.
function BulkExpansionModal({ bulkExpansion, meeting, meta, onCancel, onAcceptAll }) {
  const [skipped, setSkipped] = useState(new Set());
  const toggleSkip = (idx) => {
    setSkipped(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };
  const proposals = bulkExpansion.proposals || [];
  const loading = bulkExpansion.loading;
  const total = bulkExpansion.total || proposals.length;
  const accepted = proposals.filter(p => !skipped.has(p.idx));
  return (
    <div className="modal-bg" onClick={loading ? undefined : onCancel}>
      <div className="modal fade" onClick={e => e.stopPropagation()} style={{ maxWidth: 580, maxHeight: "88vh", overflow: "auto" }}>
        <div className="jost" style={{ fontSize: 10, letterSpacing: 2.5, color: "rgba(212,130,154,0.7)", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
          ✨ bulk draft
        </div>
        <div className="cg" style={{ fontSize: 22, fontStyle: "italic", color: "#4a3540", textAlign: "center", marginBottom: 8 }}>
          {loading ? `Rosie's drafting ${total} tasks…` : `${proposals.length} task${proposals.length === 1 ? "" : "s"} ready to add`}
        </div>
        <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.55)", lineHeight: 1.6, textAlign: "center", marginBottom: 16 }}>
          {loading ? "All running in parallel — usually 5-15 seconds total." : `From "${meta?.title || "this meeting"}". Skip any you don't want, or add all at once.`}
        </p>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
            <div className="pulse jost" style={{ fontSize: 13, color: "#b86d85", fontStyle: "italic" }}>✨ thinking…</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            {proposals.map((entry) => {
              const isSkipped = skipped.has(entry.idx);
              const p = entry.proposal;
              return (
                <div key={entry.idx} style={{
                  background: isSkipped ? "rgba(74,53,64,0.04)" : "rgba(255,255,255,0.65)",
                  border: `1px solid ${isSkipped ? "rgba(74,53,64,0.1)" : "rgba(212,130,154,0.25)"}`,
                  borderRadius: 8, padding: "10px 12px",
                  opacity: isSkipped ? 0.5 : 1,
                  transition: "opacity .15s",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={!isSkipped}
                      onChange={() => toggleSkip(entry.idx)}
                      style={{ marginTop: 3, cursor: "pointer", accentColor: "#b86d85", width: 15, height: 15, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="jost" style={{ fontSize: 13, color: "#4a3540", fontWeight: 600, lineHeight: 1.4, textDecoration: isSkipped ? "line-through" : "none" }}>
                        {p.title}
                      </div>
                      {p.why && (
                        <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.6)", fontStyle: "italic", marginTop: 3, lineHeight: 1.4 }}>
                          {p.why}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
                        {p.suggestedDate && (
                          <span className="jost" style={{ fontSize: 10, color: "#5e7e95", background: "rgba(125,154,175,0.12)", padding: "2px 7px", borderRadius: 5 }}>📅 {p.suggestedDate}</span>
                        )}
                        {p.subtasks?.length > 0 && (
                          <span className="jost" style={{ fontSize: 10, color: "#9878b8", background: "rgba(152,120,184,0.12)", padding: "2px 7px", borderRadius: 5 }}>📋 {p.subtasks.length} subtask{p.subtasks.length === 1 ? "" : "s"}</span>
                        )}
                        {p.priority && p.priority !== "medium" && (
                          <span className="jost" style={{ fontSize: 10, color: p.priority === "high" ? "#c4687a" : "#a89e94", background: p.priority === "high" ? "rgba(196,104,122,0.12)" : "rgba(168,158,148,0.12)", padding: "2px 7px", borderRadius: 5 }}>
                            {p.priority === "high" ? "⚡ high" : "↓ low"}
                          </span>
                        )}
                        {entry.isFallback && (
                          <span className="jost" style={{ fontSize: 10, color: "#9a7850", background: "rgba(196,168,130,0.15)", padding: "2px 7px", borderRadius: 5 }}>fallback</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, paddingTop: 8, borderTop: "1px solid rgba(74,53,64,0.08)" }}>
          <button onClick={onCancel} disabled={loading} className="btn ghost jost" style={{ padding: "8px 14px", fontSize: 12, opacity: loading ? 0.4 : 1 }}>Cancel</button>
          <button
            onClick={() => onAcceptAll(accepted)}
            disabled={loading || accepted.length === 0}
            className="jost"
            style={{
              background: (loading || accepted.length === 0) ? "rgba(74,53,64,0.15)" : "linear-gradient(135deg,#d4829a,#b86d85)",
              color: (loading || accepted.length === 0) ? "rgba(74,53,64,0.4)" : "#fff",
              padding: "8px 18px", fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
              border: "none", borderRadius: 7,
              cursor: (loading || accepted.length === 0) ? "default" : "pointer",
            }}
          >{loading ? "drafting…" : `✓ Add all (${accepted.length})`}</button>
        </div>
      </div>
    </div>
  );
}

// ── Thread Capture Modal ──────────────────────────────────────────────────────
// Quick-add an entry to a running thread (e.g. notes for Josh). Captures
// text, optionally links to a task, then calls Rosie to classify urgency +
// type. Urgent ones auto-create a reminder; the rest accumulate for the 1:1.
// ── Agent Panel ─────────────────────────────────────────────────────────────
// Universal UI for any agent in AGENT_REGISTRY. Handles the full lifecycle:
// input → run → structured output with editable fields → review notes with
// acknowledge → smart copy (per field or full output). Errors get retry UX.
//
// State machine: "input" → "running" → "output" | "error"
function AgentPanel({ agentId, taskContext, onClose, onLog }) {
  const agent = AGENT_REGISTRY[agentId];
  const [phase, setPhase] = useState("input"); // input | running | output | error
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState(null); // { fields, reviewNotes, generatedAt }
  const [errorMsg, setErrorMsg] = useState("");
  const [editedFields, setEditedFields] = useState({}); // user edits to agent fields
  const [acknowledged, setAcknowledged] = useState(new Set()); // review note IDs
  const [copyFlash, setCopyFlash] = useState(""); // which copy just happened

  if (!agent) {
    return (
      <div className="modal-bg" onClick={onClose}>
        <div className="modal fade" onClick={e => e.stopPropagation()}>
          <p className="jost">Unknown agent: {agentId}</p>
          <button onClick={onClose} className="btn ghost jost">Close</button>
        </div>
      </div>
    );
  }

  const handleRun = async () => {
    setPhase("running");
    setErrorMsg("");
    const result = await runAgent(agentId, userInput, taskContext);
    if (result.error) {
      setErrorMsg({
        "input-too-short": "Add a bit more to work with — at least a few items.",
        "timeout": "Took too long. Try again, maybe with less input?",
        "network": "Couldn't reach Rosie. Check your connection?",
        "http": "Something glitched on the API side. Try again?",
        "badformat": "Got a weird response. Try once more — usually transient.",
      }[result.error] || "Something went wrong. Try again?");
      setPhase("error");
      return;
    }
    setOutput(result);
    setEditedFields(result.fields);
    setPhase("output");
    // Log the run
    if (typeof onLog === "function") {
      onLog({
        id: `agent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        agentType: agentId,
        ranAt: Date.now(),
        status: "draft",
        outputSummary: Object.keys(result.fields).join(", "),
        hadReviewNotes: (result.reviewNotes?.length || 0) > 0,
      });
    }
  };

  // Smart copy — formats the output for clipboard. Different formats per agent type
  // can be added here as needed. Default: pretty plain text with field labels.
  const copyAll = () => {
    const lines = [];
    for (const field of agent.fields) {
      const val = editedFields[field.id];
      if (!val) continue;
      lines.push(`━━ ${field.label.toUpperCase()} ━━`);
      lines.push(val);
      lines.push("");
    }
    const text = lines.join("\n");
    navigator.clipboard?.writeText(text).then(() => {
      setCopyFlash("all");
      setTimeout(() => setCopyFlash(""), 1500);
    });
  };

  const copyField = (fieldId) => {
    const val = editedFields[fieldId];
    if (!val) return;
    navigator.clipboard?.writeText(val).then(() => {
      setCopyFlash(fieldId);
      setTimeout(() => setCopyFlash(""), 1500);
    });
  };

  const visibleReviewNotes = (output?.reviewNotes || []).filter(rn => !acknowledged.has(rn.id));

  return (
    <div className="modal-bg" onClick={phase === "running" ? undefined : onClose}>
      <div className="modal fade" onClick={e => e.stopPropagation()} style={{ maxWidth: 620, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ flexShrink: 0, marginBottom: 12, textAlign: "center" }}>
          <div className="jost" style={{ fontSize: 10, letterSpacing: 2.5, color: "rgba(184,160,212,0.85)", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>
            ✨ agent · {agent.icon}
          </div>
          <div className="cg" style={{ fontSize: 22, fontStyle: "italic", color: "#4a3540", lineHeight: 1.3 }}>
            {agent.label}
          </div>
          <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.55)", marginTop: 2 }}>
            {agent.description}
          </div>
        </div>

        {/* Body — phase-based */}
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 2px" }}>
          {phase === "input" && (
            <>
              <label className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.7)", display: "block", marginBottom: 6, fontWeight: 600 }}>
                {agent.inputLabel}
              </label>
              <textarea
                autoFocus
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                placeholder={agent.inputPlaceholder}
                rows={10}
                className="jost"
                style={{
                  width: "100%", boxSizing: "border-box", fontSize: 13,
                  padding: "10px 12px", border: "1px solid rgba(184,160,212,0.4)",
                  borderRadius: 8, background: "rgba(255,255,255,0.85)", outline: "none",
                  fontFamily: "monospace", lineHeight: 1.5, resize: "vertical",
                  minHeight: 200,
                }}
              />
              <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.45)", marginTop: 8, lineHeight: 1.6, fontStyle: "italic" }}>
                🌸 Heads up — this gets sent to Rosie for processing. Don't include anything sensitive (NPI, work-confidential).
              </div>
            </>
          )}

          {phase === "running" && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div className="pulse jost" style={{ fontSize: 14, color: "#9878b8", fontStyle: "italic" }}>
                ✨ Rosie's working on this…
              </div>
              <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.4)", marginTop: 14, lineHeight: 1.6 }}>
                Usually takes 5-15 seconds. Don't close the panel.
              </div>
            </div>
          )}

          {phase === "error" && (
            <div style={{ textAlign: "center", padding: "30px 20px" }}>
              <div className="cg" style={{ fontSize: 18, fontStyle: "italic", color: "#c4687a", marginBottom: 8 }}>
                Hmm.
              </div>
              <div className="jost" style={{ fontSize: 13, color: "#4a3540", lineHeight: 1.6, marginBottom: 16 }}>
                {errorMsg}
              </div>
            </div>
          )}

          {phase === "output" && output && (
            <>
              {/* Review notes block — surfaced FIRST so Lexy sees what to check before reading the draft */}
              {visibleReviewNotes.length > 0 && (
                <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(196,136,106,0.06)", border: "1px dashed rgba(196,136,106,0.4)", borderRadius: 8 }}>
                  <div className="jost" style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: "#c4886a", fontWeight: 600, marginBottom: 6 }}>
                    ⚠️ double-check before using ({visibleReviewNotes.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {visibleReviewNotes.map(rn => (
                      <div key={rn.id} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ fontSize: 11, marginTop: 2, flexShrink: 0 }}>{rn.severity === "warn" ? "⚠" : "ℹ"}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span className="jost" style={{ fontSize: 11.5, color: "#4a3540", lineHeight: 1.5 }}>{rn.concern}</span>
                          {rn.field && rn.field !== "_raw" && (
                            <span className="jost" style={{ fontSize: 9, color: "rgba(74,53,64,0.45)", marginLeft: 6, fontStyle: "italic" }}>↳ {rn.field}</span>
                          )}
                        </div>
                        <button
                          onClick={() => setAcknowledged(prev => new Set([...prev, rn.id]))}
                          title="Got it"
                          className="jost"
                          style={{
                            background: "none", border: "1px solid rgba(74,53,64,0.2)",
                            color: "rgba(74,53,64,0.55)", fontSize: 9, padding: "2px 7px",
                            borderRadius: 4, cursor: "pointer", flexShrink: 0,
                          }}
                        >✓</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Field-by-field output — editable */}
              {output.fields._raw ? (
                // Parse-failed fallback: show raw text
                <div style={{ background: "rgba(184,160,212,0.06)", border: "1px solid rgba(184,160,212,0.25)", borderRadius: 8, padding: "12px 14px" }}>
                  <div className="jost" style={{ fontSize: 10, letterSpacing: 0.5, color: "rgba(74,53,64,0.5)", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>raw output</div>
                  <pre className="jost" style={{ fontSize: 12, color: "#4a3540", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0, fontFamily: "monospace" }}>{output.fields._raw}</pre>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {agent.fields.map(field => {
                    const val = editedFields[field.id] || "";
                    if (!val) return null;
                    return (
                      <div key={field.id} style={{ background: "rgba(184,160,212,0.05)", border: "1px solid rgba(184,160,212,0.2)", borderRadius: 8, padding: "10px 12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8 }}>
                          <label className="jost" style={{ fontSize: 10, letterSpacing: 0.8, color: "rgba(152,120,184,0.85)", textTransform: "uppercase", fontWeight: 600, flex: 1 }}>
                            {field.label}
                          </label>
                          <button
                            onClick={() => copyField(field.id)}
                            title="Copy this field"
                            className="jost"
                            style={{
                              background: copyFlash === field.id ? "rgba(158,184,154,0.25)" : "rgba(184,160,212,0.1)",
                              border: "1px solid rgba(184,160,212,0.3)",
                              color: copyFlash === field.id ? "#7a9e78" : "#9878b8",
                              padding: "3px 8px", fontSize: 9, fontWeight: 600,
                              letterSpacing: 0.3, borderRadius: 5, cursor: "pointer",
                              transition: "all 0.2s", flexShrink: 0,
                            }}
                          >{copyFlash === field.id ? "✓ copied" : "📋 copy"}</button>
                        </div>
                        {field.editable ? (
                          <textarea
                            value={val}
                            onChange={e => setEditedFields({ ...editedFields, [field.id]: e.target.value })}
                            rows={Math.min(12, Math.max(3, val.split("\n").length))}
                            className="jost"
                            style={{
                              width: "100%", boxSizing: "border-box", fontSize: 12,
                              padding: "8px 10px", border: "1px solid rgba(184,160,212,0.15)",
                              borderRadius: 6, background: "rgba(255,255,255,0.7)", outline: "none",
                              fontFamily: "'Jost', sans-serif", lineHeight: 1.55, resize: "vertical",
                              color: "#4a3540", whiteSpace: "pre-wrap",
                            }}
                          />
                        ) : (
                          <div className="jost" style={{ fontSize: 12, color: "#4a3540", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{val}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer — actions */}
        <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", gap: 8, paddingTop: 14, marginTop: 10, borderTop: "1px solid rgba(74,53,64,0.08)" }}>
          {phase === "input" && (
            <>
              <button onClick={onClose} className="btn ghost jost" style={{ padding: "7px 14px", fontSize: 11 }}>Cancel</button>
              <button
                onClick={handleRun}
                disabled={!userInput || userInput.trim().length < (agent.inputMinLength || 1)}
                className="jost"
                style={{
                  background: userInput.trim().length >= (agent.inputMinLength || 1) ? "linear-gradient(135deg,#b89cd4,#9878b8)" : "rgba(74,53,64,0.15)",
                  color: userInput.trim().length >= (agent.inputMinLength || 1) ? "#fff" : "rgba(74,53,64,0.4)",
                  padding: "8px 18px", fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
                  border: "none", borderRadius: 7,
                  cursor: userInput.trim().length >= (agent.inputMinLength || 1) ? "pointer" : "default",
                }}
              >✨ Run agent</button>
            </>
          )}
          {phase === "running" && (
            <button onClick={onClose} disabled className="btn ghost jost" style={{ padding: "7px 14px", fontSize: 11, opacity: 0.4 }}>Close after</button>
          )}
          {phase === "error" && (
            <>
              <button onClick={onClose} className="btn ghost jost" style={{ padding: "7px 14px", fontSize: 11 }}>Close</button>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => { setPhase("input"); setErrorMsg(""); }} className="jost" style={{ background: "rgba(184,160,212,0.15)", color: "#9878b8", border: "1px solid rgba(184,160,212,0.35)", padding: "7px 12px", fontSize: 11, fontWeight: 600, borderRadius: 7, cursor: "pointer" }}>← Back to input</button>
                <button onClick={handleRun} className="jost" style={{ background: "linear-gradient(135deg,#b89cd4,#9878b8)", color: "#fff", padding: "7px 14px", fontSize: 11, fontWeight: 600, border: "none", borderRadius: 7, cursor: "pointer" }}>Try again</button>
              </div>
            </>
          )}
          {phase === "output" && (
            <>
              <button onClick={() => { setPhase("input"); setOutput(null); setEditedFields({}); setAcknowledged(new Set()); }} className="btn ghost jost" style={{ padding: "7px 14px", fontSize: 11 }}>← New run</button>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={onClose} className="jost" style={{ background: "rgba(184,160,212,0.15)", color: "#9878b8", border: "1px solid rgba(184,160,212,0.35)", padding: "7px 12px", fontSize: 11, fontWeight: 600, borderRadius: 7, cursor: "pointer" }}>Close</button>
                <button
                  onClick={copyAll}
                  className="jost"
                  style={{
                    background: copyFlash === "all" ? "linear-gradient(135deg,#9eb89a,#7a9e78)" : "linear-gradient(135deg,#b89cd4,#9878b8)",
                    color: "#fff", padding: "7px 14px", fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
                    border: "none", borderRadius: 7, cursor: "pointer", transition: "all 0.2s",
                  }}
                >{copyFlash === "all" ? "✓ copied all" : "📋 copy all"}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Weekly Observations Card ────────────────────────────────────────────────
// Shows Rosie's review of the past week — surfaced Monday mornings.
// Lexy can dismiss the whole card OR acknowledge individual observations
// (which collapses them out without dismissing others). Stored on data.weeklyObservations.
// ── Agent Runner Modal ───────────────────────────────────────────────────────
// Generic UI for any agent in AGENT_REGISTRY. Renders the input form, calls
// runAgent, displays the result as editable structured fields with smart copy
// buttons, shows review notes the agent flagged ("double-check this before
// using"), and saves drafts to the task on close.
//
// Per Fort Financial AUP requirements baked in:
//   - Every output explicitly framed as "draft" — never "ready to send"
//   - Review notes prominent, not hidden
//   - "What NOT to enter" hint visible above the input
//   - No auto-anything (no auto-send, auto-save to external systems)
//   - Audit log entry recorded via onLogAgent prop
function AgentRunnerModal({ agentId, task, existingDraft, onClose, onSaveDraft, onLogAgent }) {
  const agent = AGENT_REGISTRY[agentId];
  const [userInput, setUserInput] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(existingDraft || null);
  const [error, setError] = useState(null);
  // Per-field acknowledged review notes (collapse them after user has eyed them)
  const [acknowledgedNoteIds, setAcknowledgedNoteIds] = useState(
    () => new Set(existingDraft?.acknowledgedNoteIds || [])
  );
  // Per-field copy feedback
  const [copiedField, setCopiedField] = useState(null);
  // Refinement chat — multi-turn agent feedback loop. Each message is { role, content, ts }.
  // Persisted on the draft so reopening preserves the conversation.
  const [chatHistory, setChatHistory] = useState(existingDraft?.chat || []);
  const [refineInput, setRefineInput] = useState("");
  const [refining, setRefining] = useState(false);
  // Visual flash for fields that just got updated by a refinement.
  // Set of field IDs that should glow sage for ~2 seconds.
  const [recentlyChangedFields, setRecentlyChangedFields] = useState(new Set());
  const chatScrollRef = useRef(null);

  // Auto-scroll chat on new message
  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatHistory.length, refining]);

  // Clear field-change flash after 2.5s
  useEffect(() => {
    if (recentlyChangedFields.size === 0) return;
    const t = setTimeout(() => setRecentlyChangedFields(new Set()), 2500);
    return () => clearTimeout(t);
  }, [recentlyChangedFields]);

  if (!agent) return null;

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    const taskContext = task
      ? `Task: "${task.title}". ${task.why ? `Why: "${task.why}". ` : ""}Status: ${task.status || "todo"}.${Array.isArray(task.tasks) && task.tasks.length ? ` Subtasks: ${task.tasks.join("; ")}.` : ""}${task.notes ? ` Notes: "${String(task.notes).slice(0, 400)}".` : ""}`
      : null;
    const r = await runAgent(agentId, userInput, taskContext, onLogAgent);
    setRunning(false);
    if (r.error) {
      setError(r.error === "input-too-short"
        ? `Need at least ${agent.inputMinLength} characters of context.`
        : r.error === "timeout" ? "Took too long — try again."
        : r.error === "network" ? "Couldn't reach the network — try again."
        : "Something went wrong. Try again?");
      return;
    }
    setResult(r);
    setChatHistory([]);
  };

  // Multi-turn refinement (Option B). User types feedback, agent updates the
  // draft in-place. Only fields the agent decides to change are touched.
  const handleRefine = async () => {
    const feedback = refineInput.trim();
    if (!feedback || refining || !result) return;
    setRefining(true);
    // Push user message immediately for snappy UI
    const userMsg = { role: "user", content: feedback, ts: Date.now() };
    const nextChat = [...chatHistory, userMsg];
    setChatHistory(nextChat);
    setRefineInput("");
    const taskContext = task
      ? `Task: "${task.title}". ${task.why ? `Why: "${task.why}". ` : ""}Status: ${task.status || "todo"}.`
      : null;
    const r = await refineAgent(agentId, result, feedback, chatHistory, taskContext, onLogAgent);
    setRefining(false);
    if (r.error) {
      const errReply = {
        role: "assistant",
        content: r.error === "timeout" ? "Took too long — can you try again?"
          : r.error === "network" ? "Couldn't reach the network — try again?"
          : r.error === "empty-feedback" ? "I need a bit more direction — what should I change?"
          : "Something glitched. Try again?",
        ts: Date.now(),
        error: true,
      };
      setChatHistory([...nextChat, errReply]);
      return;
    }
    // Update fields in place — only changed ones
    const changedKeys = Object.keys(r.changedFields || {});
    if (changedKeys.length > 0) {
      setResult(prev => ({
        ...prev,
        fields: { ...prev.fields, ...r.changedFields },
        reviewNotes: r.newReviewNotes,
      }));
      setRecentlyChangedFields(new Set(changedKeys));
      // Reset acknowledgments for fields that changed — they need re-review
      setAcknowledgedNoteIds(new Set());
    } else if (r.newReviewNotes.length > 0) {
      // Agent didn't change fields but updated reviewNotes — apply those
      setResult(prev => ({ ...prev, reviewNotes: r.newReviewNotes }));
    }
    // Push agent reply to chat
    const agentMsg = {
      role: "assistant",
      content: r.agentReply,
      ts: Date.now(),
      changedFields: changedKeys,
    };
    setChatHistory([...nextChat, agentMsg]);
  };

  const handleFieldEdit = (fieldId, value) => {
    if (!result) return;
    setResult({ ...result, fields: { ...result.fields, [fieldId]: value } });
  };

  const handleCopyField = (fieldId) => {
    const text = result?.fields?.[fieldId] || "";
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 1500);
    } catch { /* */ }
  };

  const handleCopyAll = () => {
    if (!result?.fields) return;
    const parts = agent.fields
      .map(f => {
        const val = result.fields[f.id];
        if (!val) return null;
        return `${f.label}:\n${val}`;
      })
      .filter(Boolean);
    try {
      navigator.clipboard.writeText(parts.join("\n\n"));
      setCopiedField("__all__");
      setTimeout(() => setCopiedField(null), 1500);
    } catch { /* */ }
  };

  const handleClose = () => {
    // Save the draft to the task before closing (if there's a result)
    if (result && onSaveDraft) {
      onSaveDraft({
        ...result,
        chat: chatHistory,
        acknowledgedNoteIds: Array.from(acknowledgedNoteIds),
        savedAt: Date.now(),
      });
    }
    onClose();
  };

  const handleStartOver = () => {
    setResult(null);
    setUserInput("");
    setError(null);
    setAcknowledgedNoteIds(new Set());
    setChatHistory([]);
    setRefineInput("");
    setRecentlyChangedFields(new Set());
  };

  const unacknowledgedNotes = result?.reviewNotes?.filter(n => !acknowledgedNoteIds.has(n.id)) || [];
  const acknowledgedCount = (result?.reviewNotes?.length || 0) - unacknowledgedNotes.length;

  return (
    <div className="modal-bg" onClick={running || refining ? undefined : handleClose}>
      <div className="modal fade" onClick={e => e.stopPropagation()} style={{ maxWidth: 680, maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
        {/* Header — denser than v1, single-line title with task in subtitle */}
        <div style={{ flexShrink: 0, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div className="cg" style={{ fontSize: 17, fontStyle: "italic", color: "#4a3540", lineHeight: 1.2 }}>
              {agent.icon} {agent.label}
            </div>
            <button
              onClick={handleClose}
              disabled={running || refining}
              aria-label="Close agent"
              title="Save & close"
              className="jost"
              style={{
                background: "none", border: "none", color: "rgba(74,53,64,0.6)",
                cursor: running || refining ? "default" : "pointer", fontSize: 16,
                padding: "2px 8px", lineHeight: 1, opacity: running || refining ? 0.4 : 1,
              }}
            >×</button>
          </div>
          {task && (
            <div className="jost" style={{ fontSize: 10.5, color: "rgba(74,53,64,0.65)", marginTop: 2 }}>
              for: <em>{task.title}</em>
            </div>
          )}
        </div>

        {/* Policy hint — accessibility: bumped from 0.55 to 0.7 for contrast */}
        <div className="jost" style={{ flexShrink: 0, fontSize: 10.5, color: "rgba(74,53,64,0.7)", background: "rgba(184,160,212,0.08)", border: "1px dashed rgba(184,160,212,0.4)", borderRadius: 6, padding: "5px 10px", marginBottom: 10, lineHeight: 1.5 }}>
          🌸 Operational context only — no member info or sensitive data. Drafts for your review.
        </div>

        {/* Scroll area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 2px" }}>
          {/* Input form (shown only before result) */}
          {!result && (
            <>
              <label className="jost" style={{ fontSize: 11.5, color: "rgba(74,53,64,0.8)", fontWeight: 500, display: "block", marginBottom: 4 }}>
                {agent.inputLabel}
              </label>
              <textarea
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                placeholder={agent.inputPlaceholder}
                rows={6}
                className="jost"
                disabled={running}
                style={{ width: "100%", boxSizing: "border-box", fontSize: 13, padding: "10px 12px", border: "1px solid rgba(184,160,212,0.35)", borderRadius: 8, background: "rgba(255,255,255,0.9)", outline: "none", fontFamily: "'Jost', sans-serif", lineHeight: 1.5, resize: "vertical", marginBottom: 8, minHeight: 100, color: "#4a3540" }}
              />
              {error && (
                <div className="jost" style={{ fontSize: 11.5, color: "#c4687a", marginBottom: 8, fontStyle: "italic" }}>{error}</div>
              )}
            </>
          )}

          {/* Result fields */}
          {result && (
            <>
              {/* Review notes — surfaced PROMINENTLY at top */}
              {unacknowledgedNotes.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div className="jost" style={{ fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", color: "#a3683f", fontWeight: 600, marginBottom: 6 }}>
                    ⚠ double-check before using ({unacknowledgedNotes.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {unacknowledgedNotes.map(n => (
                      <div key={n.id} style={{
                        background: n.severity === "warn" ? "rgba(196,136,106,0.10)" : "rgba(196,168,130,0.08)",
                        border: `1px solid ${n.severity === "warn" ? "rgba(196,136,106,0.4)" : "rgba(196,168,130,0.3)"}`,
                        borderRadius: 7,
                        padding: "7px 10px",
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                      }}>
                        <span style={{ fontSize: 12, marginTop: 1 }}>{n.severity === "warn" ? "⚠" : "ℹ"}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {n.field && <div className="jost" style={{ fontSize: 9.5, color: "rgba(74,53,64,0.7)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{n.field}</div>}
                          <div className="jost" style={{ fontSize: 12, color: "#4a3540", lineHeight: 1.5 }}>{n.concern}</div>
                        </div>
                        <button
                          onClick={() => setAcknowledgedNoteIds(prev => new Set([...prev, n.id]))}
                          title="Got it"
                          aria-label="Acknowledge this review note"
                          className="jost"
                          style={{ background: "none", border: "1px solid rgba(74,53,64,0.2)", color: "rgba(74,53,64,0.7)", cursor: "pointer", fontSize: 10, padding: "2px 8px", borderRadius: 4, flexShrink: 0 }}
                        >✓</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {acknowledgedCount > 0 && unacknowledgedNotes.length === 0 && (
                <div className="jost" style={{ fontSize: 10.5, color: "#5e8a5c", marginBottom: 10, fontStyle: "italic", textAlign: "center" }}>
                  ✓ All {acknowledgedCount} review note{acknowledgedCount === 1 ? "" : "s"} acknowledged
                </div>
              )}

              {/* Editable field blocks */}
              {agent.fields.map(f => {
                const wasChanged = recentlyChangedFields.has(f.id);
                return (
                  <div key={f.id} style={{ marginBottom: 12, transition: "background 300ms ease", background: wasChanged ? "rgba(158,184,154,0.10)" : "transparent", borderRadius: 8, padding: wasChanged ? "6px 8px" : 0, margin: wasChanged ? "0 -8px 12px" : "0 0 12px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <label className="jost" style={{ fontSize: 10.5, color: "rgba(74,53,64,0.8)", fontWeight: 600, letterSpacing: 0.3, textTransform: "uppercase" }}>
                        {f.label}
                        {wasChanged && <span className="jost" style={{ fontSize: 9, color: "#5e8a5c", marginLeft: 6, fontWeight: 500, textTransform: "none", fontStyle: "italic" }}>✓ updated</span>}
                      </label>
                      <button
                        onClick={() => handleCopyField(f.id)}
                        disabled={!result.fields[f.id]}
                        title={`Copy ${f.label.toLowerCase()}`}
                        aria-label={`Copy ${f.label}`}
                        className="jost"
                        style={{
                          background: copiedField === f.id ? "rgba(158,184,154,0.2)" : "rgba(184,160,212,0.12)",
                          border: `1px solid ${copiedField === f.id ? "rgba(158,184,154,0.45)" : "rgba(184,160,212,0.35)"}`,
                          color: copiedField === f.id ? "#5e8a5c" : "#7e5fa3",
                          padding: "3px 9px", fontSize: 9.5, fontWeight: 600, letterSpacing: 0.3,
                          borderRadius: 5,
                          cursor: result.fields[f.id] ? "pointer" : "default",
                          opacity: result.fields[f.id] ? 1 : 0.5,
                        }}
                      >{copiedField === f.id ? "✓ Copied" : "📋 Copy"}</button>
                    </div>
                    {f.type === "textarea" ? (
                      <textarea
                        value={result.fields[f.id] || ""}
                        onChange={e => handleFieldEdit(f.id, e.target.value)}
                        rows={Math.min(12, Math.max(3, Math.ceil((result.fields[f.id] || "").length / 60)))}
                        className="jost"
                        style={{ width: "100%", boxSizing: "border-box", fontSize: 13, padding: "8px 11px", border: "1px solid rgba(184,160,212,0.3)", borderRadius: 7, background: "rgba(255,255,255,0.92)", outline: "none", fontFamily: "'Jost', sans-serif", lineHeight: 1.55, resize: "vertical", color: "#4a3540" }}
                      />
                    ) : (
                      <input
                        value={result.fields[f.id] || ""}
                        onChange={e => handleFieldEdit(f.id, e.target.value)}
                        className="jost"
                        style={{ width: "100%", boxSizing: "border-box", fontSize: 13, padding: "7px 11px", border: "1px solid rgba(184,160,212,0.3)", borderRadius: 7, background: "rgba(255,255,255,0.92)", outline: "none", fontFamily: "'Jost', sans-serif", color: "#4a3540" }}
                      />
                    )}
                  </div>
                );
              })}

              {/* ── Refinement chat panel ─────────────────────────────── */}
              {/* Multi-turn feedback loop. User asks for changes, agent updates
                  fields in place. Chat preserved on the draft. */}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px dashed rgba(184,160,212,0.35)" }}>
                <div className="jost" style={{ fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", color: "#7e5fa3", fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  💬 refine with feedback
                </div>
                <div className="jost" style={{ fontSize: 10.5, color: "rgba(74,53,64,0.7)", fontStyle: "italic", marginBottom: 8, lineHeight: 1.5 }}>
                  Tell me what to change. I'll only touch what you ask about.
                </div>
                {/* Chat history */}
                {chatHistory.length > 0 && (
                  <div ref={chatScrollRef} style={{ maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginBottom: 8, padding: "4px 2px" }}>
                    {chatHistory.map((m, i) => (
                      <div key={i} style={{
                        alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                        maxWidth: "88%",
                        background: m.role === "user" ? "linear-gradient(135deg,#c4788e,#a8607a)" : "rgba(184,160,212,0.14)",
                        color: m.role === "user" ? "#fff" : "#4a3540",
                        padding: "7px 11px",
                        borderRadius: m.role === "user" ? "10px 10px 3px 10px" : "10px 10px 10px 3px",
                        fontSize: 12.5,
                        lineHeight: 1.5,
                        fontFamily: "'Jost', sans-serif",
                        whiteSpace: "pre-wrap",
                        opacity: m.error ? 0.75 : 1,
                      }}>
                        {m.content}
                        {m.changedFields && m.changedFields.length > 0 && (
                          <div className="jost" style={{ marginTop: 4, fontSize: 9.5, color: "rgba(94,138,92,0.95)", fontStyle: "italic" }}>
                            ✓ updated: {m.changedFields.join(", ")}
                          </div>
                        )}
                      </div>
                    ))}
                    {refining && (
                      <div className="pulse jost" style={{ alignSelf: "flex-start", fontSize: 11, color: "#7e5fa3", fontStyle: "italic", padding: "3px 11px" }}>
                        ✨ thinking…
                      </div>
                    )}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
                  <textarea
                    value={refineInput}
                    onChange={e => setRefineInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleRefine(); }
                    }}
                    placeholder={chatHistory.length === 0 ? "e.g. make it shorter, remove the Aaron mention, more formal tone" : "Keep going — what else?"}
                    rows={2}
                    className="jost"
                    disabled={refining}
                    style={{ flex: 1, fontSize: 12.5, padding: "7px 10px", border: "1px solid rgba(212,130,154,0.35)", borderRadius: 7, background: "rgba(255,255,255,0.9)", outline: "none", fontFamily: "'Jost', sans-serif", lineHeight: 1.5, resize: "vertical", maxHeight: 100, color: "#4a3540", opacity: refining ? 0.6 : 1 }}
                  />
                  <button
                    onClick={handleRefine}
                    disabled={!refineInput.trim() || refining}
                    aria-label="Send refinement feedback"
                    className="jost"
                    style={{
                      background: (refineInput.trim() && !refining) ? "linear-gradient(135deg,#c4788e,#a8607a)" : "rgba(74,53,64,0.18)",
                      color: (refineInput.trim() && !refining) ? "#fff" : "rgba(74,53,64,0.5)",
                      padding: "7px 13px", fontSize: 11.5, fontWeight: 600, letterSpacing: 0.3,
                      border: "none", borderRadius: 6,
                      cursor: (refineInput.trim() && !refining) ? "pointer" : "default",
                    }}
                  >Send</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ flexShrink: 0, paddingTop: 12, marginTop: 8, borderTop: "1px solid rgba(74,53,64,0.1)", display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={handleClose}
            disabled={running || refining}
            className="btn ghost jost"
            style={{ padding: "7px 14px", fontSize: 11.5 }}
          >
            {result ? "Save & close" : "Cancel"}
          </button>
          {!result && (
            <button
              onClick={handleRun}
              disabled={running || ((agent.inputMinLength || 0) > 0 && userInput.trim().length < (agent.inputMinLength || 0))}
              className="jost"
              style={{
                background: running ? "rgba(184,160,212,0.35)" : "linear-gradient(135deg,#b89cd4,#7e5fa3)",
                color: "#fff",
                padding: "8px 18px", fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
                border: "none", borderRadius: 7, cursor: running ? "default" : "pointer",
              }}
            >
              {running ? "✨ thinking…" : "✨ Run agent"}
            </button>
          )}
          {result && (
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={handleStartOver}
                title="Discard this draft and start over"
                className="jost"
                style={{ background: "rgba(184,160,212,0.14)", border: "1px solid rgba(184,160,212,0.4)", color: "#7e5fa3", padding: "7px 12px", fontSize: 11.5, fontWeight: 600, borderRadius: 7, cursor: "pointer" }}
              >
                ↻ Start over
              </button>
              <button
                onClick={handleCopyAll}
                className="jost"
                style={{
                  background: copiedField === "__all__" ? "rgba(158,184,154,0.2)" : "linear-gradient(135deg,#c4788e,#a8607a)",
                  color: copiedField === "__all__" ? "#5e8a5c" : "#fff",
                  border: copiedField === "__all__" ? "1px solid rgba(158,184,154,0.45)" : "none",
                  padding: "8px 16px", fontSize: 11.5, fontWeight: 600, letterSpacing: 0.3, borderRadius: 7, cursor: "pointer",
                }}
              >
                {copiedField === "__all__" ? "✓ Copied all" : "📋 Copy all"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Agent Auto-Start: Candidate Finder + Consent Modal ──────────────────────
// When user commits the morning roadmap, scan the slots for tasks that could
// benefit from an agent head-start. With only task-summary registered, we
// offer it for every linked task that doesn't already have a fresh draft.
// Future agents will get smarter matching (e.g. only suggest "vendor email"
// for tasks tagged as vendor follow-up).
//
// Returns array of { itemId, taskTitle, agentId, agentLabel, agentIcon }
function findAgentCandidates(roadmap, items) {
  if (!roadmap || !Array.isArray(roadmap.slots) || !Array.isArray(items)) return [];
  const todayStartMs = (() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime();
  })();
  const candidates = [];
  const seenItemIds = new Set();
  for (const slot of roadmap.slots) {
    // Need a linked task. Skip breaks, meetings, custom blocks.
    if (!slot.itemId) continue;
    if (seenItemIds.has(slot.itemId)) continue;
    seenItemIds.add(slot.itemId);
    const item = items.find(i => i.id === slot.itemId);
    if (!item) continue;
    if (item.status === "done") continue;
    // For each available agent, check if this task already has a fresh draft
    for (const agent of Object.values(AGENT_REGISTRY)) {
      const existingDrafts = Array.isArray(item.agentDrafts) ? item.agentDrafts : [];
      const hasFresh = existingDrafts.some(d => d.agentId === agent.id && (d.generatedAt || 0) >= todayStartMs);
      if (hasFresh) continue;
      candidates.push({
        itemId: item.id,
        taskTitle: item.title,
        agentId: agent.id,
        agentLabel: agent.label,
        agentIcon: agent.icon,
      });
    }
  }
  return candidates;
}

// Modal shown right after roadmap commit. Lists tasks Rosie thinks could use
// a head-start, with per-task checkboxes. Default: all checked. User confirms
// or skips. Confirmed tasks queue background agent runs.
function AgentConsentModal({ candidates, onConfirm, onSkip }) {
  // Per-candidate selection state — default all selected
  const [selected, setSelected] = useState(() => new Set(candidates.map(c => `${c.itemId}::${c.agentId}`)));
  const toggle = (key) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  const selectedCount = selected.size;
  const handleConfirm = () => {
    const accepted = candidates.filter(c => selected.has(`${c.itemId}::${c.agentId}`));
    onConfirm(accepted);
  };
  return (
    <div className="modal-bg">
      <div className="modal fade" style={{ maxWidth: 560 }}>
        {/* Header */}
        <div style={{ marginBottom: 12 }}>
          <div className="jost" style={{ fontSize: 10.5, letterSpacing: 2, color: "#7e5fa3", textTransform: "uppercase", fontWeight: 600, marginBottom: 4, textAlign: "center" }}>
            ✨ before you go
          </div>
          <div className="cg" style={{ fontSize: 22, fontStyle: "italic", color: "#4a3540", textAlign: "center", lineHeight: 1.3, marginBottom: 6 }}>
            {candidates.length === 1
              ? "I spotted 1 task that could use a head start"
              : `I spotted ${candidates.length} tasks that could use a head start`}
          </div>
          <div className="jost" style={{ fontSize: 11.5, color: "rgba(74,53,64,0.75)", textAlign: "center", lineHeight: 1.55 }}>
            Drafts will land on your tasks while you go about your morning. Uncheck anything you don't want.
          </div>
        </div>

        {/* Policy reminder — small, dismissable feel even if not dismissable */}
        <div className="jost" style={{ fontSize: 10.5, color: "rgba(74,53,64,0.7)", background: "rgba(184,160,212,0.08)", border: "1px dashed rgba(184,160,212,0.4)", borderRadius: 6, padding: "5px 10px", marginBottom: 10, lineHeight: 1.5 }}>
          🌸 Operational context only — no member info touches these drafts.
        </div>

        {/* Candidate list */}
        <div style={{ maxHeight: "45vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
          {candidates.map(c => {
            const key = `${c.itemId}::${c.agentId}`;
            const isSelected = selected.has(key);
            return (
              <label
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  background: isSelected ? "rgba(184,160,212,0.10)" : "rgba(74,53,64,0.04)",
                  border: `1px solid ${isSelected ? "rgba(184,160,212,0.35)" : "rgba(74,53,64,0.1)"}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "background 150ms",
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(key)}
                  aria-label={`Run ${c.agentLabel} for ${c.taskTitle}`}
                  style={{ accentColor: "#7e5fa3", cursor: "pointer", flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="jost" style={{ fontSize: 12.5, color: "#4a3540", fontWeight: 500, lineHeight: 1.3 }}>
                    {c.taskTitle}
                  </div>
                  <div className="jost" style={{ fontSize: 10.5, color: "rgba(74,53,64,0.7)", marginTop: 2 }}>
                    → {c.agentIcon} {c.agentLabel}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={onSkip}
            className="btn ghost jost"
            style={{ padding: "8px 16px", fontSize: 12 }}
          >Skip — I'll request as needed</button>
          <button
            onClick={handleConfirm}
            disabled={selectedCount === 0}
            className="jost"
            style={{
              background: selectedCount > 0 ? "linear-gradient(135deg,#b89cd4,#7e5fa3)" : "rgba(74,53,64,0.15)",
              color: selectedCount > 0 ? "#fff" : "rgba(74,53,64,0.5)",
              padding: "9px 20px", fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
              border: "none", borderRadius: 8,
              cursor: selectedCount > 0 ? "pointer" : "default",
            }}
          >Let Rosie start {selectedCount > 0 ? `${selectedCount} ` : ""}🌸</button>
        </div>
      </div>
    </div>
  );
}

function WeeklyObservationsCard({ data, onDismiss, onAcknowledge }) {
  const obs = data?.weeklyObservations;
  if (!obs || obs.dismissed || !Array.isArray(obs.observations) || obs.observations.length === 0) return null;
  // Filter out acknowledged observations
  const acknowledged = new Set(obs.acknowledgedIds || []);
  const visible = obs.observations.filter(o => !acknowledged.has(o.id));
  if (visible.length === 0) return null;
  const categoryMeta = {
    pattern: { emoji: "🔍", color: "#9878b8", bg: "rgba(184,160,212,0.10)", border: "rgba(184,160,212,0.35)", label: "pattern" },
    concern: { emoji: "⚠️", color: "#c4886a", bg: "rgba(196,136,106,0.10)", border: "rgba(196,136,106,0.35)", label: "worth a look" },
    win: { emoji: "🌸", color: "#7a9e78", bg: "rgba(158,184,154,0.12)", border: "rgba(158,184,154,0.35)", label: "win" },
    note: { emoji: "✦", color: "#9a7850", bg: "rgba(196,168,130,0.10)", border: "rgba(196,168,130,0.35)", label: "noticed" },
  };
  return (
    <div className="card" style={{ marginBottom: 16, padding: "14px 18px", background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(184,160,212,0.04))", border: "1px solid rgba(184,160,212,0.25)", borderRadius: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
        <div>
          <div className="jost" style={{ fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: "rgba(152,120,184,0.85)", fontWeight: 600, marginBottom: 2 }}>
            ✦ from rosie · this week
          </div>
          <div className="cg" style={{ fontSize: 18, fontStyle: "italic", color: "#4a3540", lineHeight: 1.3 }}>
            {obs.summary || "Here's what I noticed about last week"}
          </div>
        </div>
        <button
          onClick={onDismiss}
          title="Dismiss for the week"
          className="jost"
          style={{
            background: "none", border: "none", color: "rgba(74,53,64,0.4)",
            cursor: "pointer", fontSize: 14, padding: "4px 6px", lineHeight: 1, flexShrink: 0,
          }}
        >×</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {visible.map(o => {
          const meta = categoryMeta[o.category] || categoryMeta.note;
          return (
            <div key={o.id} style={{
              background: meta.bg,
              border: `1px solid ${meta.border}`,
              borderRadius: 8,
              padding: "9px 12px",
              display: "flex",
              alignItems: "flex-start",
              gap: 9,
            }}>
              <span style={{ fontSize: 13, marginTop: 1 }}>{meta.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="jost" style={{ fontSize: 9, color: meta.color, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 3, opacity: 0.85 }}>{meta.label}</div>
                <div className="jost" style={{ fontSize: 12.5, color: "#4a3540", lineHeight: 1.5 }}>{o.text}</div>
              </div>
              <button
                onClick={() => onAcknowledge(o.id)}
                title="Got it"
                className="jost"
                style={{
                  background: "none", border: "1px solid rgba(74,53,64,0.15)",
                  color: "rgba(74,53,64,0.5)",
                  cursor: "pointer", fontSize: 10, padding: "3px 8px",
                  borderRadius: 5, flexShrink: 0,
                }}
              >✓</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ThreadCaptureModal({ thread, linkedItem, onCancel, onSave }) {
  const [text, setText] = useState("");
  const [tagging, setTagging] = useState(false);
  // saveAndChat: when true, after save, fire the chat-open event so the
  // ThreadChatModal opens with this fresh entry. Pattern C from Lexy's spec.
  const handleSave = async (saveAndChat) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTagging(true);
    let classification;
    try {
      classification = await classifyThreadEntry(trimmed, thread?.personName || "", linkedItem?.title || "");
    } catch { classification = { error: "exception" }; }
    // Heuristic fallback — default to "wait" + "update" if Rosie failed
    const entry = {
      id: `thr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      threadId: thread?.id || "",
      text: trimmed,
      createdAt: Date.now(),
      urgency: classification.error ? "wait" : classification.urgency,
      type: classification.error ? "update" : classification.type,
      summary: classification.error ? trimmed.slice(0, 60) : classification.summary,
      linkedItemId: linkedItem?.id || null,
      linkedItemTitle: linkedItem?.title || null,
      reviewedAt: null,
      action: null,
    };
    onSave(entry);
    setTagging(false);
    if (saveAndChat) {
      // Open the per-entry chat with the just-saved entry. Small delay so
      // Overview can persist first.
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("work-hub-thread-chat-open", {
          detail: {
            entry,
            thread: { id: thread?.id, personName: thread?.personName },
            linkedItem,
          },
        }));
      }, 100);
    }
  };
  return (
    <div className="modal-bg" onClick={tagging ? undefined : onCancel}>
      <div className="modal fade" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="jost" style={{ fontSize: 10, letterSpacing: 2.5, color: "rgba(212,130,154,0.7)", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
          ✦ note for {thread?.personName || "thread"}
        </div>
        <div className="cg" style={{ fontSize: 22, fontStyle: "italic", color: "#4a3540", textAlign: "center", marginBottom: 8 }}>
          What's on your mind?
        </div>
        <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.55)", lineHeight: 1.6, textAlign: "center", marginBottom: 14 }}>
          {linkedItem ? <>About <em>"{linkedItem.title}"</em>. Rosie will sort by urgency.</> : "Type the thought. Rosie will sort it — most things wait for your next 1:1."}
        </p>
        <textarea
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Escape") onCancel(); if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave(false); }}
          placeholder={`Idea, update, question, or issue for ${thread?.personName || "them"}…`}
          rows={5}
          className="jost"
          style={{ width: "100%", boxSizing: "border-box", fontSize: 14, padding: "10px 12px", border: "1px solid rgba(212,130,154,0.3)", borderRadius: 8, background: "rgba(255,255,255,0.85)", outline: "none", fontFamily: "'Jost', sans-serif", lineHeight: 1.5, resize: "vertical", marginBottom: 12 }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={onCancel} disabled={tagging} className="btn ghost jost" style={{ padding: "8px 14px", fontSize: 12, opacity: tagging ? 0.4 : 1 }}>Cancel</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {tagging && <span className="pulse jost" style={{ fontSize: 11, color: "#9878b8", fontStyle: "italic" }}>✨ Rosie's sorting…</span>}
            <button
              onClick={() => handleSave(true)}
              disabled={!text.trim() || tagging}
              title="Save and bounce ideas with Rosie before deciding"
              className="jost"
              style={{
                background: (text.trim() && !tagging) ? "rgba(184,160,212,0.15)" : "rgba(74,53,64,0.08)",
                color: (text.trim() && !tagging) ? "#9878b8" : "rgba(74,53,64,0.4)",
                border: (text.trim() && !tagging) ? "1px solid rgba(184,160,212,0.4)" : "1px solid transparent",
                padding: "7px 14px", fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
                borderRadius: 7,
                cursor: (text.trim() && !tagging) ? "pointer" : "default",
              }}
            >💭 Save & chat</button>
            <button
              onClick={() => handleSave(false)}
              disabled={!text.trim() || tagging}
              className="jost"
              style={{
                background: (text.trim() && !tagging) ? "linear-gradient(135deg,#d4829a,#b86d85)" : "rgba(74,53,64,0.15)",
                color: (text.trim() && !tagging) ? "#fff" : "rgba(74,53,64,0.4)",
                padding: "8px 18px", fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
                border: "none", borderRadius: 7,
                cursor: (text.trim() && !tagging) ? "pointer" : "default",
              }}
            >Save{tagging ? "…" : ""}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Thread Review Modal ──────────────────────────────────────────────────────
// Bi-weekly review surfaced before a 1:1. Each unreviewed entry gets
// Send / Discuss / Skip. "Send" entries get composed into a copy-paste
// digest for Teams. "Discuss" become meeting agenda items. "Skip" archives.
function ThreadReviewModal({ thread, entries, onCancel, onComplete }) {
  const [actions, setActions] = useState(() => {
    const init = {};
    entries.forEach(e => { init[e.id] = e.urgency === "today" || e.urgency === "thisweek" ? "send" : "discuss"; });
    return init;
  });
  const setAction = (id, action) => setActions(prev => ({ ...prev, [id]: action }));
  const counts = {
    send: entries.filter(e => actions[e.id] === "send").length,
    discuss: entries.filter(e => actions[e.id] === "discuss").length,
    skip: entries.filter(e => actions[e.id] === "skip").length,
  };
  const typeIcon = { idea: "💡", update: "📋", question: "❓", issue: "⚠️" };
  return (
    <div className="modal-bg" onClick={onCancel}>
      <div className="modal fade" onClick={e => e.stopPropagation()} style={{ maxWidth: 640, maxHeight: "90vh", overflow: "auto" }}>
        <div className="jost" style={{ fontSize: 10, letterSpacing: 2.5, color: "rgba(212,130,154,0.7)", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
          ✦ 1:1 review
        </div>
        <div className="cg" style={{ fontSize: 22, fontStyle: "italic", color: "#4a3540", textAlign: "center", marginBottom: 8 }}>
          {entries.length} {entries.length === 1 ? "thing" : "things"} for {thread?.personName || "them"}
        </div>
        <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.55)", lineHeight: 1.6, textAlign: "center", marginBottom: 16 }}>
          For each: <strong style={{ color: "#b86d85" }}>Send</strong> = goes in your Teams digest. <strong style={{ color: "#9878b8" }}>Discuss</strong> = bring to the 1:1. <strong style={{ color: "rgba(74,53,64,0.5)" }}>Skip</strong> = archive.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {entries.map(e => {
            const action = actions[e.id];
            return (
              <div key={e.id} style={{
                background: action === "skip" ? "rgba(74,53,64,0.04)" : "rgba(255,255,255,0.7)",
                border: `1px solid ${action === "send" ? "rgba(212,130,154,0.4)" : action === "discuss" ? "rgba(184,160,212,0.4)" : "rgba(74,53,64,0.1)"}`,
                borderRadius: 8, padding: "10px 12px",
                opacity: action === "skip" ? 0.55 : 1,
                transition: "opacity .15s",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="jost" style={{ fontSize: 13, color: "#4a3540", lineHeight: 1.45 }}>
                      <span style={{ marginRight: 5 }}>{typeIcon[e.type] || "📋"}</span>
                      {e.text}
                    </div>
                    {e.linkedItemTitle && (
                      <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.45)", marginTop: 3, fontStyle: "italic" }}>↳ {e.linkedItemTitle}</div>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {[
                    { id: "send", label: "Send", color: "#b86d85", bg: "rgba(212,130,154,0.12)", bgActive: "linear-gradient(135deg,#d4829a,#b86d85)" },
                    { id: "discuss", label: "Discuss", color: "#9878b8", bg: "rgba(184,160,212,0.12)", bgActive: "linear-gradient(135deg,#b89cd4,#9878b8)" },
                    { id: "skip", label: "Skip", color: "rgba(74,53,64,0.6)", bg: "rgba(74,53,64,0.06)", bgActive: "rgba(74,53,64,0.2)" },
                  ].map(opt => {
                    const active = action === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setAction(e.id, opt.id)}
                        className="jost"
                        style={{
                          flex: 1, padding: "4px 8px",
                          background: active ? opt.bgActive : opt.bg,
                          color: active ? "#fff" : opt.color,
                          border: "none", borderRadius: 6,
                          fontSize: 10, fontWeight: 600, letterSpacing: 0.3,
                          cursor: "pointer",
                        }}
                      >{opt.label}</button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, paddingTop: 8, borderTop: "1px solid rgba(74,53,64,0.08)" }}>
          <button onClick={onCancel} className="btn ghost jost" style={{ padding: "8px 14px", fontSize: 12 }}>Close</button>
          <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)", alignSelf: "center" }}>
            {counts.send} send · {counts.discuss} discuss · {counts.skip} skip
          </div>
          <button
            onClick={() => onComplete(actions)}
            className="jost"
            style={{
              background: "linear-gradient(135deg,#d4829a,#b86d85)",
              color: "#fff",
              padding: "8px 18px", fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
              border: "none", borderRadius: 7,
              cursor: "pointer",
            }}
          >✓ Done reviewing</button>
        </div>
      </div>
    </div>
  );
}

// ── Thread Chat Modal ────────────────────────────────────────────────────────
// Per-entry conversation with Rosie. Phase 2 wiring:
//   - Time-based triggers (not exchange-based): 5min, 10min, focus-block nudge
//     at 3min+, meeting-soon nudge at <10min until meeting.
//   - Two tabs on reopen: Summary (the wrap-up) + Raw chat (full history).
//   - "Bundle this up" → summarizeChatAndProposeTask → maybe offers a task.
//   - Mid-chat "make this a task" → detectTaskFromChat → always confirms.
//   - Soft container: NEVER cuts Lexy off. The triggers are *offers*, not stops.
function ThreadChatModal({ entry, thread, linkedItem, activeFocusContext, upcomingMeeting, onClose, onPersistChat, onUpdateEntry, onCreateTask }) {
  // If the entry already has a saved summary, show the tabbed view; if it's
  // a fresh chat, jump straight to the chat tab.
  const hasSavedSummary = !!entry?.chatSummary;
  const [activeTab, setActiveTab] = useState(hasSavedSummary ? "summary" : "chat");
  const [messages, setMessages] = useState(entry?.chat || []);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [chatStartTime] = useState(() => Date.now());
  // Track which triggers have already fired so they don't re-fire on every
  // message. Once a checkpoint shows up, we don't shove it in again two
  // messages later. That'd be the "nag" failure mode Lexy specifically
  // didn't want.
  const [firedTriggers, setFiredTriggers] = useState({
    checkpoint: false,
    secondCheckpoint: false,
    onTrackNudge: false,
    meetingNudge: false,
  });
  // Summary state — set when "bundle this up" runs. Holds the summary text
  // plus an optional task proposal that the user can accept or decline.
  const [bundlingState, setBundlingState] = useState(null); // { phase: "loading"|"ready"|"error", summary?, taskProposal? }
  // Mid-chat task ask flow. Set when user explicitly asks Rosie to make a task.
  const [pendingTaskProposal, setPendingTaskProposal] = useState(null);
  const scrollRef = useRef(null);
  // Auto-scroll on new content
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length, sending]);

  // Detect "make this a task" intent in the latest user message. Cheap regex
  // check — avoids unnecessary API calls for the common case.
  const looksLikeTaskAsk = (text) => {
    const t = text.toLowerCase();
    return /\b(make|turn|create|add)\b.*\b(this|it|that)\b.*\b(task|todo|to-do|item)\b/.test(t)
      || /\b(make|create|add)\s+(a\s+)?(task|todo|to-do)\b/.test(t)
      || /\b(track|log)\s+(this|it|that)\b/.test(t);
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;

    // First check — is this a manual task-creation ask? If so, run that flow
    // instead of the normal chat.
    if (looksLikeTaskAsk(text) && messages.length >= 2) {
      const userMsg = { role: "user", content: text, ts: Date.now() };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setDraft("");
      setSending(true);
      let result;
      try {
        result = await detectTaskFromChat({
          entry, threadName: thread?.personName || "",
          priorMessages: messages, linkedItem,
          userRequest: text,
        });
      } catch { result = { error: "exception" }; }
      setSending(false);
      if (result.error || !result.taskProposal) {
        // Couldn't extract — fall back to normal chat reply
        const errReply = { role: "assistant", content: "Hmm, I want to make sure I get the task right. Can you tell me a bit more about what it should be?", ts: Date.now() };
        const final = [...nextMessages, errReply];
        setMessages(final);
        onPersistChat?.(final);
        return;
      }
      // Show the proposal for confirmation
      setPendingTaskProposal(result.taskProposal);
      const ackMsg = { role: "assistant", content: "Here's what I'd add — want me to go ahead with this?", ts: Date.now(), kind: "task-proposal" };
      const final = [...nextMessages, ackMsg];
      setMessages(final);
      onPersistChat?.(final);
      return;
    }

    // Normal chat flow — compute triggers based on elapsed time
    const chatDurationMin = (Date.now() - chatStartTime) / 60000;
    const triggers = {
      checkpoint: !firedTriggers.checkpoint && chatDurationMin >= 5 && !firedTriggers.secondCheckpoint,
      secondCheckpoint: !firedTriggers.secondCheckpoint && chatDurationMin >= 10 && firedTriggers.checkpoint,
      onTrackNudge: !firedTriggers.onTrackNudge && chatDurationMin >= 3 && !!activeFocusContext?.itemTitle,
      meetingNudge: !firedTriggers.meetingNudge && !!upcomingMeeting?.title && (upcomingMeeting.minutesUntil || 999) < 10,
    };

    const userMsg = { role: "user", content: text, ts: Date.now() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setDraft("");
    setSending(true);

    let result;
    try {
      result = await chatAboutThreadEntry({
        entry,
        threadName: thread?.personName || "",
        linkedItem,
        priorMessages: messages,
        userMessage: text,
        activeFocusContext,
        upcomingMeeting,
        triggers,
        chatDurationMin,
      });
    } catch { result = { error: "exception" }; }

    if (result.error) {
      const errMsg = { role: "assistant", content: "(Couldn't reach Rosie just now. Try again?)", ts: Date.now(), error: true };
      const final = [...nextMessages, errMsg];
      setMessages(final);
      onPersistChat?.(final);
    } else {
      const aiMsg = { role: "assistant", content: result.text, ts: Date.now() };
      const final = [...nextMessages, aiMsg];
      setMessages(final);
      onPersistChat?.(final);
      // Mark triggers as fired AFTER successful response — so retries don't
      // suppress them on the next attempt.
      if (Object.values(triggers).some(Boolean)) {
        setFiredTriggers(prev => ({
          checkpoint: prev.checkpoint || triggers.checkpoint,
          secondCheckpoint: prev.secondCheckpoint || triggers.secondCheckpoint,
          onTrackNudge: prev.onTrackNudge || triggers.onTrackNudge,
          meetingNudge: prev.meetingNudge || triggers.meetingNudge,
        }));
      }
    }
    setSending(false);
  };

  // The "bundle this up" button — runs the summarize helper, shows the summary
  // and any task proposal in a sub-modal. User can save & close (preserves
  // both summary AND raw chat on the entry) or also accept the task proposal.
  const runBundle = async () => {
    if (messages.length < 2) return;
    setBundlingState({ phase: "loading" });
    let result;
    try {
      result = await summarizeChatAndProposeTask({
        entry, threadName: thread?.personName || "",
        priorMessages: messages, linkedItem,
      });
    } catch { result = { error: "exception" }; }
    if (result.error) {
      setBundlingState({ phase: "error" });
      return;
    }
    setBundlingState({ phase: "ready", summary: result.summary, taskProposal: result.taskProposal });
  };

  const acceptBundle = (alsoCreateTask) => {
    if (!bundlingState?.summary) return;
    onUpdateEntry?.({
      ...entry,
      chatSummary: bundlingState.summary,
      chat: messages,
      chatBundledAt: Date.now(),
    });
    if (alsoCreateTask && bundlingState.taskProposal) {
      onCreateTask?.(bundlingState.taskProposal, entry);
    }
    setBundlingState(null);
    onClose();
  };

  const acceptManualTask = () => {
    if (!pendingTaskProposal) return;
    onCreateTask?.(pendingTaskProposal, entry);
    const confirmMsg = { role: "assistant", content: `Done — "${pendingTaskProposal.title}" is on your task list. 🌸`, ts: Date.now() };
    const final = [...messages, confirmMsg];
    setMessages(final);
    onPersistChat?.(final);
    setPendingTaskProposal(null);
  };

  const declineManualTask = () => {
    const declineMsg = { role: "assistant", content: "No worries — keeping it in chat only. What else?", ts: Date.now() };
    const final = [...messages, declineMsg];
    setMessages(final);
    onPersistChat?.(final);
    setPendingTaskProposal(null);
  };

  // Sub-modal: showing the bundled summary + optional task proposal
  if (bundlingState) {
    return (
      <div className="modal-bg" onClick={bundlingState.phase === "loading" ? undefined : () => setBundlingState(null)}>
        <div className="modal fade" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
          <div className="jost" style={{ fontSize: 10, letterSpacing: 2.5, color: "rgba(184,160,212,0.85)", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
            ✦ bundle
          </div>
          <div className="cg" style={{ fontSize: 22, fontStyle: "italic", color: "#4a3540", textAlign: "center", marginBottom: 14 }}>
            {bundlingState.phase === "loading" ? "Pulling it together…" : bundlingState.phase === "error" ? "Something glitched" : "Here's where we landed"}
          </div>
          {bundlingState.phase === "loading" && (
            <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
              <span className="pulse jost" style={{ fontSize: 12, color: "#9878b8", fontStyle: "italic" }}>✨ wrapping up…</span>
            </div>
          )}
          {bundlingState.phase === "error" && (
            <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.55)", lineHeight: 1.6, textAlign: "center", padding: "10px 16px" }}>
              I couldn't reach my brain to write the summary. Try again, or just hit "save & close" to keep the raw chat.
            </div>
          )}
          {bundlingState.phase === "ready" && (
            <>
              <div style={{ background: "rgba(184,160,212,0.06)", border: "1px solid rgba(184,160,212,0.25)", borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
                <div className="jost" style={{ fontSize: 13, color: "#4a3540", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{bundlingState.summary}</div>
              </div>
              {bundlingState.taskProposal && (
                <div style={{ background: "linear-gradient(135deg, rgba(212,130,154,0.08), rgba(184,160,212,0.06))", border: "1px dashed rgba(212,130,154,0.4)", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
                  <div className="jost" style={{ fontSize: 9, color: "rgba(212,130,154,0.85)", letterSpacing: 1, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>✦ Next step came out of this</div>
                  <div className="cg" style={{ fontSize: 15, color: "#4a3540", fontStyle: "italic", lineHeight: 1.4 }}>{bundlingState.taskProposal.title}</div>
                  {bundlingState.taskProposal.subtasks?.length > 0 && (
                    <ul style={{ margin: "5px 0 0", padding: "0 0 0 16px", fontSize: 11, color: "rgba(74,53,64,0.65)", lineHeight: 1.5 }}>
                      {bundlingState.taskProposal.subtasks.map((s, i) => (
                        <li key={i} className="jost">{s}{bundlingState.taskProposal.taskTimes?.[i] ? <span style={{ opacity: 0.6 }}> · {bundlingState.taskProposal.taskTimes[i]}m</span> : null}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, paddingTop: 8 }}>
            <button onClick={() => setBundlingState(null)} disabled={bundlingState.phase === "loading"} className="btn ghost jost" style={{ padding: "7px 12px", fontSize: 11 }}>Back to chat</button>
            {bundlingState.phase === "ready" && (
              <div style={{ display: "flex", gap: 6 }}>
                {bundlingState.taskProposal && (
                  <button onClick={() => acceptBundle(true)} className="jost" style={{ background: "linear-gradient(135deg,#d4829a,#b86d85)", color: "#fff", padding: "7px 14px", fontSize: 11, fontWeight: 600, letterSpacing: 0.3, border: "none", borderRadius: 7, cursor: "pointer" }}>✓ Save + add task</button>
                )}
                <button onClick={() => acceptBundle(false)} className="jost" style={{ background: bundlingState.taskProposal ? "rgba(184,160,212,0.18)" : "linear-gradient(135deg,#b89cd4,#9878b8)", color: bundlingState.taskProposal ? "#9878b8" : "#fff", border: bundlingState.taskProposal ? "1px solid rgba(184,160,212,0.4)" : "none", padding: "7px 14px", fontSize: 11, fontWeight: 600, letterSpacing: 0.3, borderRadius: 7, cursor: "pointer" }}>✓ Save summary only</button>
              </div>
            )}
            {bundlingState.phase === "error" && (
              <button onClick={runBundle} className="jost" style={{ background: "linear-gradient(135deg,#d4829a,#b86d85)", color: "#fff", padding: "7px 14px", fontSize: 11, fontWeight: 600, letterSpacing: 0.3, border: "none", borderRadius: 7, cursor: "pointer" }}>Try again</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-bg" onClick={sending ? undefined : onClose}>
      <div className="modal fade" onClick={e => e.stopPropagation()} style={{ maxWidth: 580, height: "min(85vh, 720px)", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ flexShrink: 0, marginBottom: 10 }}>
          <div className="jost" style={{ fontSize: 10, letterSpacing: 2.5, color: "rgba(212,130,154,0.7)", textTransform: "uppercase", marginBottom: 4, textAlign: "center" }}>
            💭 bouncing with rosie
          </div>
          <div className="cg" style={{ fontSize: 17, fontStyle: "italic", color: "#4a3540", textAlign: "center", lineHeight: 1.3, marginBottom: 4 }}>
            "{entry.text.length > 100 ? entry.text.slice(0, 100) + "…" : entry.text}"
          </div>
          {linkedItem && (
            <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)", fontStyle: "italic", textAlign: "center" }}>↳ {linkedItem.title}</div>
          )}
        </div>
        {/* Tabs — only shown when there's a saved summary */}
        {hasSavedSummary && (
          <div style={{ flexShrink: 0, display: "flex", gap: 4, marginBottom: 10, background: "rgba(184,160,212,0.06)", borderRadius: 8, padding: 3 }}>
            {[
              { id: "summary", label: "📋 Summary" },
              { id: "chat", label: `💬 Chat (${messages.length})` },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className="jost" style={{
                flex: 1, padding: "6px 10px",
                background: activeTab === t.id ? "linear-gradient(135deg,#b89cd4,#9878b8)" : "transparent",
                color: activeTab === t.id ? "#fff" : "rgba(74,53,64,0.6)",
                border: "none", borderRadius: 6,
                fontSize: 11, fontWeight: 600, letterSpacing: 0.3, cursor: "pointer",
              }}>{t.label}</button>
            ))}
          </div>
        )}
        {/* Content */}
        {activeTab === "summary" && hasSavedSummary ? (
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 4px" }}>
            <div className="jost" style={{ fontSize: 9, color: "rgba(184,160,212,0.85)", letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>where we landed</div>
            <div style={{ background: "rgba(184,160,212,0.06)", border: "1px solid rgba(184,160,212,0.25)", borderRadius: 8, padding: "12px 14px" }}>
              <div className="jost" style={{ fontSize: 13, color: "#4a3540", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{entry.chatSummary}</div>
            </div>
            <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.4)", textAlign: "center", marginTop: 10, fontStyle: "italic" }}>
              Tap the chat tab above to see the full back-and-forth, or send a new message below to keep going.
            </div>
          </div>
        ) : (
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "8px 4px 12px", display: "flex", flexDirection: "column", gap: 10, minHeight: 200 }}>
            {messages.length === 0 && (
              <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.5)", fontStyle: "italic", textAlign: "center", padding: "16px 8px", lineHeight: 1.6 }}>
                What do you want to think through? I'll push back if I disagree — that's the point. 🌸
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                background: m.role === "user" ? "linear-gradient(135deg,#d4829a,#b86d85)" : "rgba(184,160,212,0.1)",
                color: m.role === "user" ? "#fff" : "#4a3540",
                padding: "8px 12px",
                borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                fontSize: 13,
                lineHeight: 1.5,
                fontFamily: "'Jost', sans-serif",
                whiteSpace: "pre-wrap",
                opacity: m.error ? 0.7 : 1,
              }}>
                {m.content}
                {m.kind === "task-proposal" && pendingTaskProposal && (
                  <div style={{ marginTop: 8, padding: "8px 10px", background: "rgba(255,255,255,0.2)", borderRadius: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{pendingTaskProposal.title}</div>
                    {pendingTaskProposal.why && <div style={{ fontSize: 11, fontStyle: "italic", opacity: 0.85, marginBottom: 4 }}>{pendingTaskProposal.why}</div>}
                    {pendingTaskProposal.subtasks?.length > 0 && (
                      <ul style={{ margin: 0, padding: "0 0 0 14px", fontSize: 11, opacity: 0.9 }}>
                        {pendingTaskProposal.subtasks.map((s, j) => (
                          <li key={j}>{s}{pendingTaskProposal.taskTimes?.[j] ? ` · ${pendingTaskProposal.taskTimes[j]}m` : ""}</li>
                        ))}
                      </ul>
                    )}
                    <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                      <button onClick={acceptManualTask} className="jost" style={{ background: "rgba(255,255,255,0.95)", color: "#b86d85", border: "none", padding: "4px 10px", fontSize: 10, fontWeight: 600, borderRadius: 5, cursor: "pointer" }}>✓ Add it</button>
                      <button onClick={declineManualTask} className="jost" style={{ background: "transparent", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.4)", padding: "4px 10px", fontSize: 10, fontWeight: 500, borderRadius: 5, cursor: "pointer" }}>Not yet</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="pulse jost" style={{ alignSelf: "flex-start", fontSize: 11, color: "#9878b8", fontStyle: "italic", padding: "4px 12px" }}>
                ✨ thinking…
              </div>
            )}
          </div>
        )}
        {/* Input area */}
        <div style={{ flexShrink: 0, borderTop: "1px solid rgba(74,53,64,0.08)", paddingTop: 10, display: "flex", gap: 6, alignItems: "flex-end" }}>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              if (e.key === "Escape" && !sending) onClose();
            }}
            placeholder={hasSavedSummary && activeTab === "summary" ? "Pick this back up — send a new message…" : "What's on your mind?"}
            rows={2}
            className="jost"
            disabled={sending}
            style={{ flex: 1, fontSize: 13, padding: "8px 10px", border: "1px solid rgba(212,130,154,0.3)", borderRadius: 8, background: "rgba(255,255,255,0.85)", outline: "none", fontFamily: "'Jost', sans-serif", lineHeight: 1.5, resize: "vertical", maxHeight: 120, opacity: sending ? 0.6 : 1 }}
          />
          <button
            onClick={() => { if (hasSavedSummary && activeTab === "summary") setActiveTab("chat"); send(); }}
            disabled={!draft.trim() || sending}
            className="jost"
            style={{
              background: (draft.trim() && !sending) ? "linear-gradient(135deg,#d4829a,#b86d85)" : "rgba(74,53,64,0.15)",
              color: (draft.trim() && !sending) ? "#fff" : "rgba(74,53,64,0.4)",
              padding: "8px 14px", fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
              border: "none", borderRadius: 7,
              cursor: (draft.trim() && !sending) ? "pointer" : "default",
            }}
          >Send</button>
        </div>
        {/* Footer */}
        <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", gap: 8, paddingTop: 10, marginTop: 8, borderTop: "1px solid rgba(74,53,64,0.05)" }}>
          <button onClick={onClose} disabled={sending} className="btn ghost jost" style={{ padding: "6px 12px", fontSize: 11 }}>Save & close</button>
          {messages.length >= 4 && (
            <button onClick={runBundle} disabled={sending} className="jost" style={{ background: "rgba(184,160,212,0.15)", color: "#9878b8", border: "1px solid rgba(184,160,212,0.4)", padding: "6px 12px", fontSize: 11, fontWeight: 600, borderRadius: 7, cursor: "pointer" }}>
              ✦ Bundle this up
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function QmPrintView({ r, meta }) {
  const Section = ({ title, children }) => (
    <div style={{ marginTop: 18 }}>
      <h2 style={{ fontFamily: QM_SERIF, fontSize: 18, color: QM.terracotta, borderBottom: `1px solid ${QM.line}`, paddingBottom: 4, margin: "0 0 8px" }}>{title}</h2>
      {children}
    </div>
  );
  const List = ({ items }) => (
    <ul style={{ margin: "0 0 0 18px", padding: 0 }}>
      {items.map((x, i) => <li key={i} style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 4 }}>{x}</li>)}
    </ul>
  );
  return (
    <div className="q-print" style={{ fontFamily: "Georgia, serif", color: QM.ink, padding: "24px 8px", maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontFamily: QM_SERIF, fontSize: 26, margin: "0 0 4px" }}>{meta.title || "Meeting Notes"}</h1>
      {meta.date && <p style={{ color: QM.inkSoft, fontSize: 11, margin: "0 0 2px" }}>{meta.date}</p>}
      {meta.attendees && <p style={{ color: QM.inkSoft, fontSize: 11, margin: "0 0 2px" }}><b>Attendees:</b> {meta.attendees}</p>}
      {r.rosieNote && (
        <div style={{ background: "#f7ece6", borderLeft: `3px solid ${QM.rose}`, padding: "8px 12px", margin: "14px 0", fontSize: 12, fontStyle: "italic" }}>
          {r.rosieNote} — Rosie
        </div>
      )}
      {r.summary && <Section title="Summary"><p style={{ fontSize: 12, lineHeight: 1.6, margin: 0 }}>{r.summary}</p></Section>}
      {r.decisions?.length > 0 && <Section title="Decisions"><List items={r.decisions} /></Section>}
      {r.actionItems?.length > 0 && (
        <Section title="Action Items">
          <ul style={{ margin: "0 0 0 18px", padding: 0 }}>
            {r.actionItems.map((a, i) => <li key={i} style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 4 }}><b>{a.owner}</b> — {a.task} <i style={{ color: QM.inkSoft }}>({a.due})</i></li>)}
          </ul>
        </Section>
      )}
      {r.minutes?.length > 0 && <Section title="Minutes"><List items={r.minutes} /></Section>}
      {r.openQuestions?.length > 0 && <Section title="Open Questions"><List items={r.openQuestions} /></Section>}
      {r.nextSteps?.length > 0 && <Section title="Next Steps"><List items={r.nextSteps} /></Section>}
    </div>
  );
}

function QmExportBtn({ onClick, icon: Icon, label, bg }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 rounded-2xl px-3.5 py-2.5"
      style={{ fontSize: 13, fontWeight: 500, background: bg, color: QM.ivory, boxShadow: `0 4px 12px ${bg}55` }}>
      <Icon size={15} strokeWidth={1.8} /> {label}
    </button>
  );
}

function QmField({ icon: Icon, placeholder, value, onChange }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl px-3.5 py-3" style={{ background: QM.ivory, border: `1px solid ${QM.line}` }}>
      <Icon size={15} strokeWidth={1.8} color={QM.inkSoft} style={{ flexShrink: 0 }} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", outline: "none", border: "none", background: "transparent", color: QM.ink, fontSize: 13.5 }} />
    </div>
  );
}

function QmCard({ title, icon: Icon, accent, children, onCopy, copied }) {
  return (
    <div className="rounded-3xl p-5" style={{ background: QM.ivory, border: `1px solid ${QM.line}`, boxShadow: "0 6px 20px rgba(74,63,68,0.06)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center rounded-xl" style={{ width: 32, height: 32, background: accent + "22" }}>
            <Icon size={17} strokeWidth={1.8} color={accent} />
          </span>
          <h3 style={{ fontFamily: QM_SERIF, fontSize: 20, fontWeight: 600 }}>{title}</h3>
        </div>
        <button onClick={onCopy} style={{ color: QM.inkSoft }} className="flex items-center gap-1.5">
          {copied ? <Check size={15} color={QM.sage} /> : <Copy size={15} strokeWidth={1.7} />}
          <span style={{ fontSize: 12.5 }}>{copied ? "copied" : "copy"}</span>
        </button>
      </div>
      {children}
    </div>
  );
}

function QmBullets({ items, color }) {
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2.5" style={{ fontSize: 14.5, lineHeight: 1.6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: color, flexShrink: 0, marginTop: 8 }} />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}


function MeetingFocusView({ meeting, onUpdate, onBack, onAwardXP, onComplete, fullData, onUpdateData }) {
  // Local state mirrors MeetingsTab's prep flow but persists to the meeting object
  const [vibe, setVibe] = useState(meeting?.vibe || "warm");
  const [energy, setEnergy] = useState(meeting?.energy || "normal");
  const [situation, setSituation] = useState(meeting?.situation || "");
  const [whoWith, setWhoWith] = useState(meeting?.whoWith || "");
  const [meetingTitle, setMeetingTitle] = useState(meeting?.title || meeting?.slotLabel || "");
  const [generated, setGenerated] = useState(meeting?.generated || null);
  const [curveballs, setCurveballs] = useState(meeting?.curveballs || []);
  const [fullScript, setFullScript] = useState(meeting?.fullScript || null);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [scriptError, setScriptError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [notes, setNotes] = useState(meeting?.notes || "");
  const [savedFlash, setSavedFlash] = useState("");
  const notesTimeoutRef = useRef(null);

  // Persist any field change to the meeting object via onUpdate (debounced for notes)
  const saveMeeting = (patch) => {
    onUpdate({ ...meeting, ...patch });
  };

  // Auto-save notes after 600ms idle
  useEffect(() => {
    if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current);
    notesTimeoutRef.current = setTimeout(() => {
      if (notes !== (meeting?.notes || "")) {
        saveMeeting({ notes });
        setSavedFlash("Notes saved 🌸");
        setTimeout(() => setSavedFlash(""), 1400);
      }
    }, 600);
    return () => { if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  // ── Auto-prep: when MeetingFocusView is opened via the quick-prep pill,
  // the meeting object carries transient _autoPrep + _detectedType flags.
  // Fire generate() ONCE on mount when those are set and we haven't generated yet.
  const autoPrepFiredRef = useRef(false);
  useEffect(() => {
    if (autoPrepFiredRef.current) return;
    if (!meeting?._autoPrep) return;
    if (generated) return;
    if (!situation || !situation.trim()) return;
    autoPrepFiredRef.current = true;
    setTimeout(() => {
      const opener = mpcOpener(situation, whoWith, vibe, energy);
      const cb = mpcCurveballs(situation);
      setGenerated(opener);
      setCurveballs(cb);
      saveMeeting({
        title: (meetingTitle || meeting?.slotLabel || "Meeting").trim(),
        vibe, energy,
        situation: situation.trim(),
        whoWith: (whoWith || "").trim(),
        generated: opener,
        curveballs: cb,
        fullScript: null,
      });
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = () => {
    if (!situation.trim()) return;
    const opener = mpcOpener(situation, whoWith, vibe, energy);
    const cb = mpcCurveballs(situation);
    setGenerated(opener);
    setCurveballs(cb);
    setFullScript(null);
    setScriptError(null);
    setExpandedSections({});
    saveMeeting({
      title: meetingTitle.trim() || meeting?.slotLabel || "Meeting",
      vibe, energy,
      situation: situation.trim(),
      whoWith: whoWith.trim(),
      generated: opener,
      curveballs: cb,
      fullScript: null,
    });
    if (onAwardXP) onAwardXP(10, window.innerWidth / 2, 200);
  };

  const buildFullScript = async () => {
    if (scriptLoading) return;
    setScriptLoading(true);
    setScriptError(null);
    const result = await generateFullScript(situation, whoWith, vibe, energy);
    setScriptLoading(false);
    if (!result) {
      setScriptError("Something glitched — try once more?");
      return;
    }
    setFullScript(result);
    setExpandedSections({});
    saveMeeting({ fullScript: result });
  };

  const toggleSection = (key) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  // Post-meeting follow-up scan — surfaces detected candidates from notes
  // before navigating back. User can accept/skip each one. null = no scan
  // active; array = candidates pending review.
  const [followUpCandidates, setFollowUpCandidates] = useState(null);
  const markComplete = () => {
    saveMeeting({ completedAt: Date.now() });
    const notesText = meeting?.notes || "";
    const candidates = scanMeetingNotesForFollowUps(notesText, meeting);
    if (candidates.length > 0) {
      // Show the review surface first; user will dismiss to navigate back.
      setFollowUpCandidates(candidates);
      return;
    }
    if (onComplete) onComplete();
    onBack();
  };
  // Used by the review modal — adds picked candidates as quick reminders
  // tagged with the meeting context, then completes navigation.
  const acceptFollowUpCandidates = (selected, fullData, fullDataUpdate) => {
    if (!fullData || !fullDataUpdate) {
      setFollowUpCandidates(null);
      if (onComplete) onComplete();
      onBack();
      return;
    }
    const now = Date.now();
    const newReminders = selected.map((c, i) => ({
      id: `r-${now}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      text: c.text,
      type: "quick",
      itemId: null,
      time: null,
      dismissed: false,
      createdAt: now,
      source: "meeting-followup",
      meetingId: c.meetingId,
      meetingTitle: c.meetingTitle,
    }));
    fullDataUpdate({ ...fullData, reminders: [...(fullData.reminders || []), ...newReminders] });
    setFollowUpCandidates(null);
    if (onComplete) onComplete();
    onBack();
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 80, position: "relative" }}>
      {/* Header */}
      <button onClick={onBack} className="jost" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(212,130,154,0.25)", borderRadius: 8, padding: "5px 12px", fontSize: 11, color: "#b86d85", cursor: "pointer", fontWeight: 500, marginBottom: 14 }}>← back to roadmap</button>

      <div style={{ marginBottom: 18 }}>
        <div className="jost" style={{ fontSize: 10, letterSpacing: 3, color: "rgba(212,130,154,0.85)", textTransform: "uppercase", marginBottom: 6 }}>🌸 meeting focus</div>
        <input
          className="cg"
          value={meetingTitle}
          onChange={e => setMeetingTitle(e.target.value)}
          onBlur={() => saveMeeting({ title: meetingTitle.trim() || meeting?.slotLabel || "Meeting" })}
          placeholder="Meeting name"
          style={{ fontSize: 32, fontStyle: "italic", color: "#4a3540", fontWeight: 400, lineHeight: 1.1, width: "100%", border: "1px solid transparent", background: "transparent", outline: "none", fontFamily: "'Cormorant Garamond', serif", padding: "2px 6px", marginLeft: -6, borderRadius: 6, transition: "all .15s" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(212,130,154,0.2)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}
        />
        {meeting?.scheduledTime && (
          <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.5)", marginTop: 4 }}>Scheduled at {meeting.scheduledTime}</p>
        )}
      </div>

      {/* Thread review banner — fires when this meeting matches a running
          thread and there are unreviewed entries. Detects by matching the
          meeting title against /1:1|josh|<person>/i where <person> is the
          name on any existing thread. */}
      {(() => {
        const threads = fullData?.runningThreads || [];
        if (threads.length === 0) return null;
        const titleStr = (meeting?.title || meeting?.slotLabel || "").toLowerCase();
        if (!titleStr) return null;
        // Match by thread.personName OR by /1:1/ if there's just one thread
        const matchingThread = threads.find(t => {
          const name = (t.personName || "").toLowerCase();
          return name && titleStr.includes(name);
        }) || (threads.length === 1 && /1[:\-_ ]?1/.test(titleStr) ? threads[0] : null);
        if (!matchingThread) return null;
        const unreviewed = (matchingThread.entries || []).filter(e => !e.reviewedAt);
        if (unreviewed.length === 0) return null;
        return (
          <div style={{ marginBottom: 14, padding: "12px 16px", background: "linear-gradient(135deg, rgba(184,160,212,0.1), rgba(212,130,154,0.06))", border: "1px dashed rgba(152,120,184,0.5)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="jost" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(152,120,184,0.9)", fontWeight: 600, marginBottom: 2 }}>📬 Thread review</div>
              <div className="cg" style={{ fontSize: 16, color: "#4a3540", fontStyle: "italic", lineHeight: 1.4 }}>
                You have {unreviewed.length} unreviewed {unreviewed.length === 1 ? "note" : "notes"} for {matchingThread.personName} since your last 1:1.
              </div>
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("work-hub-thread-review-open", { detail: { personName: matchingThread.personName } }))}
              className="jost"
              style={{
                padding: "8px 16px",
                background: "linear-gradient(135deg, #b89cd4, #9878b8)",
                color: "#fff",
                border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
                cursor: "pointer", whiteSpace: "nowrap",
              }}
            >📬 Review now</button>
          </div>
        );
      })()}

      {/* Tone + Energy selectors */}
      <div className="card" style={{ padding: "16px 20px", marginBottom: 14 }}>
        <label className="sl jost">Tone</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {Object.entries(MPC_VIBES).map(([key, v]) => (
            <button
              key={key}
              onClick={() => { setVibe(key); saveMeeting({ vibe: key }); }}
              className="jost"
              style={{
                background: vibe === key ? "rgba(212,130,154,0.18)" : "rgba(255,255,255,0.5)",
                border: `1px solid ${vibe === key ? "#d4829a" : "rgba(212,130,154,0.2)"}`,
                color: vibe === key ? "#b86d85" : "rgba(74,53,64,0.6)",
                borderRadius: 12, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontWeight: 500,
                display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left",
              }}
            >
              <span style={{ fontWeight: 600 }}>{v.label}</span>
              <span style={{ fontSize: 9, color: "rgba(74,53,64,0.45)", marginTop: 1 }}>{v.note}</span>
            </button>
          ))}
        </div>
        <label className="sl jost">Energy</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(MPC_ENERGY).map(([key, e]) => (
            <button
              key={key}
              onClick={() => { setEnergy(key); saveMeeting({ energy: key }); }}
              className="jost"
              style={{
                background: energy === key ? "rgba(196,168,130,0.15)" : "rgba(255,255,255,0.5)",
                border: `1px solid ${energy === key ? "#c4a882" : "rgba(196,168,130,0.2)"}`,
                color: energy === key ? "#9a7850" : "rgba(74,53,64,0.6)",
                borderRadius: 12, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontWeight: 500,
                display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left",
              }}
            >
              <span style={{ fontWeight: 600 }}>{e.label}</span>
              <span style={{ fontSize: 9, color: "rgba(74,53,64,0.45)", marginTop: 1 }}>{e.note}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Situation + Who */}
      <div className="card" style={{ padding: "16px 20px", marginBottom: 14 }}>
        <label className="sl jost">What's the meeting about?</label>
        <textarea
          className="ifield jost"
          rows={3}
          value={situation}
          onChange={e => setSituation(e.target.value)}
          placeholder="e.g. Kickoff for the new fraud detection project. Need to align on scope and timeline."
          style={{ marginBottom: 10, resize: "vertical" }}
        />
        <label className="sl jost">Who's there?</label>
        <input
          className="ifield jost"
          value={whoWith}
          onChange={e => setWhoWith(e.target.value)}
          placeholder="e.g. Josh, vendor team, our analysts"
        />
        <button
          onClick={generate}
          className="btn rose jost"
          disabled={!situation.trim()}
          style={{ marginTop: 12, padding: "9px 18px", fontSize: 13, opacity: situation.trim() ? 1 : 0.5 }}
        >🌸 {generated ? "Re-generate prep" : "Generate prep"}</button>
      </div>

      {/* Generated opener + curveballs */}
      {generated && (
        <div className="card fade" style={{ padding: "16px 20px", marginBottom: 14, background: "rgba(232,160,180,0.05)", border: "1px solid rgba(212,130,154,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 10, flexWrap: "wrap" }}>
            <label className="sl jost" style={{ marginBottom: 0 }}>Opener</label>
            <button
              onClick={() => navigator.clipboard?.writeText(generated)}
              className="jost"
              style={{ background: "rgba(212,130,154,0.1)", border: "1px solid rgba(212,130,154,0.3)", color: "#b86d85", borderRadius: 7, padding: "3px 9px", fontSize: 10, cursor: "pointer", fontWeight: 500 }}
            >📋 copy</button>
          </div>
          <p className="jost" style={{ fontSize: 13, color: "#4a3540", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{generated}</p>
        </div>
      )}

      {curveballs && curveballs.length > 0 && (
        <div className="card fade" style={{ padding: "16px 20px", marginBottom: 14 }}>
          <label className="sl jost">If they ask… 🌀</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
            {curveballs.map((cb, i) => (
              <div key={i} style={{ background: "rgba(184,160,212,0.07)", border: "1px solid rgba(184,160,212,0.2)", borderRadius: 10, padding: "10px 14px" }}>
                <div className="jost" style={{ fontSize: 11, fontWeight: 600, color: "#9878b8", marginBottom: 4 }}>{cb.q}</div>
                <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.7)", lineHeight: 1.6 }}>{cb.a}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full script (optional) */}
      {generated && (
        <div className="card" style={{ padding: "14px 20px", marginBottom: 14 }}>
          {!fullScript && !scriptLoading && (
            <button
              onClick={buildFullScript}
              className="jost"
              style={{ background: "rgba(184,160,212,0.1)", border: "1px solid rgba(184,160,212,0.3)", color: "#9878b8", borderRadius: 10, padding: "8px 16px", fontSize: 12, cursor: "pointer", fontWeight: 500 }}
            >📜 Build full script</button>
          )}
          {scriptLoading && (
            <div className="jost pulse" style={{ fontSize: 12, color: "rgba(184,160,212,0.7)", fontStyle: "italic" }}>Rosie's writing the full script…</div>
          )}
          {scriptError && (
            <div className="jost" style={{ fontSize: 11, color: "#c4687a", fontStyle: "italic" }}>{scriptError}</div>
          )}
          {fullScript && (
            <div>
              <label className="sl jost" style={{ marginBottom: 8 }}>Full script</label>
              {Object.entries(fullScript).map(([key, value]) => {
                if (!value) return null;
                const labels = {
                  opening: "Opening", agenda: "Agenda", main_points: "Main points",
                  transitions: "Transitions", closing: "Closing",
                  if_offtopic: "If they go off-topic", if_tense: "If things get tense",
                };
                const isOpen = expandedSections[key];
                return (
                  <div key={key} style={{ marginBottom: 8, border: "1px solid rgba(212,130,154,0.15)", borderRadius: 9, overflow: "hidden" }}>
                    <button
                      onClick={() => toggleSection(key)}
                      className="jost"
                      style={{ background: isOpen ? "rgba(232,160,180,0.06)" : "transparent", border: "none", width: "100%", textAlign: "left", padding: "8px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#4a3540", fontWeight: 500 }}
                    >
                      <span>{labels[key] || key}</span>
                      <span style={{ color: "rgba(184,109,133,0.6)" }}>{isOpen ? "▴" : "▾"}</span>
                    </button>
                    {isOpen && (
                      <div className="jost fade" style={{ padding: "0 14px 12px", fontSize: 12, color: "rgba(74,53,64,0.75)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{value}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Notes — for during/after the meeting */}
      <div className="card" style={{ padding: "16px 20px", marginBottom: 14, border: "1px solid rgba(158,184,154,0.3)", background: "rgba(158,184,154,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <label className="sl jost" style={{ marginBottom: 0, color: "rgba(122,158,120,0.85)" }}>📝 Meeting notes</label>
          {savedFlash && <span className="jost fade" style={{ fontSize: 10, color: "#7a9e78", fontStyle: "italic" }}>{savedFlash}</span>}
        </div>
        <textarea
          className="ifield jost"
          rows={6}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Jot things as they come up — decisions, action items, things to follow up on..."
          style={{ resize: "vertical", borderColor: "rgba(158,184,154,0.3)", lineHeight: 1.6 }}
        />
      </div>

      {/* Quill — meeting minutes (transcript → AI notes); persists to the meeting object */}
      <MeetingMinutes meeting={meeting} saveMeeting={saveMeeting} fullData={fullData} onUpdateData={onUpdateData} />

      {/* Done button */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button
          onClick={onBack}
          className="btn ghost jost"
          style={{ fontSize: 12, padding: "8px 16px" }}
        >Save & back</button>
        <button
          onClick={markComplete}
          className="btn rose jost"
          style={{ fontSize: 12, padding: "8px 16px" }}
        >🌸 Mark meeting done</button>
      </div>

      {/* Post-meeting follow-up review modal — opens when markComplete
          detects verb-driven follow-up cues in the notes. User selects which
          ones to turn into reminders; skipped ones are simply discarded. */}
      {followUpCandidates && followUpCandidates.length > 0 && (
        <FollowUpReviewModal
          candidates={followUpCandidates}
          meetingTitle={meeting?.title || meeting?.slotLabel || "Meeting"}
          onAccept={(picked) => acceptFollowUpCandidates(picked, fullData, onUpdateData)}
          onSkipAll={() => {
            setFollowUpCandidates(null);
            if (onComplete) onComplete();
            onBack();
          }}
        />
      )}
    </div>
  );
}

// ── Follow-Up Review Modal ────────────────────────────────────────────────────
// Used after a meeting is marked complete. Shows candidate follow-up sentences
// detected from the notes. User toggles which ones to convert into reminders.
// On Accept: picks become reminders. On Skip all: nothing saved.
function FollowUpReviewModal({ candidates, meetingTitle, onAccept, onSkipAll }) {
  const [selected, setSelected] = useState(new Set(candidates.map(c => c.id)));
  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };
  const accept = () => {
    onAccept(candidates.filter(c => selected.has(c.id)));
  };
  return (
    <div className="modal-bg" onClick={onSkipAll}>
      <div className="modal fade" onClick={e => e.stopPropagation()} style={{ maxWidth: 580, maxHeight: "85vh", overflow: "auto" }}>
        <div className="jost" style={{ fontSize: 10, letterSpacing: 2.5, color: "rgba(212,130,154,0.7)", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
          📨 follow-ups from this meeting
        </div>
        <div className="cg" style={{ fontSize: 22, fontStyle: "italic", color: "#4a3540", textAlign: "center", marginBottom: 8 }}>
          {candidates.length} possible follow-up{candidates.length === 1 ? "" : "s"} in your notes
        </div>
        <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.55)", lineHeight: 1.6, textAlign: "center", marginBottom: 16 }}>
          From "{meetingTitle}". Uncheck any that aren't actually commitments. Selected ones become quick reminders.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {candidates.map(c => {
            const isSelected = selected.has(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                className="jost"
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  background: isSelected ? "rgba(212,130,154,0.08)" : "rgba(255,255,255,0.5)",
                  border: `1px solid ${isSelected ? "rgba(212,130,154,0.4)" : "rgba(74,53,64,0.15)"}`,
                  borderRadius: 8,
                  padding: "10px 12px",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  transition: "all .15s",
                }}
              >
                <span style={{ fontSize: 14, color: isSelected ? "#b86d85" : "rgba(74,53,64,0.3)", lineHeight: 1, marginTop: 1 }}>
                  {isSelected ? "✓" : "○"}
                </span>
                <span style={{ flex: 1, fontSize: 12, color: "#4a3540", lineHeight: 1.5 }}>{c.text}</span>
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, gap: 10 }}>
          <button onClick={onSkipAll} className="btn ghost jost" style={{ padding: "7px 14px", fontSize: 12 }}>Skip all</button>
          <button
            onClick={accept}
            className="btn jost"
            disabled={selected.size === 0}
            style={{
              background: "linear-gradient(135deg,#9eb89a,#7a9e78)",
              color: "#fff",
              padding: "7px 16px", fontSize: 12, fontWeight: 600, letterSpacing: 0.3, border: "none",
              opacity: selected.size === 0 ? 0.4 : 1,
              cursor: selected.size === 0 ? "default" : "pointer",
            }}
          >✓ Save as reminders ({selected.size})</button>
        </div>
      </div>
    </div>
  );
}

// ── Quick Capture FAB ─────────────────────────────────────────────────────────
function QuickCapture({ data, onUpdate, onAddSpiral, onCloseDay, inline = false }) {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const pick = which => {
    setOpen(false);
    if (which === "close") {
      if (onCloseDay) onCloseDay();
      return;
    }
    setModal(which);
  };

  const saveItem = item => {
    const withDate = item.scheduledDate ? item : {
      ...item,
      scheduledDate: estimateDateForNewItem(item.priority || "medium", data.items || []),
      dateSource: "estimated",
      dateFixed: false,
    };
    onUpdate({ ...data, items: [...(data.items || []), withDate] });
  };
  const saveParking = text => onUpdate({ ...data, parkingLot: [...(data.parkingLot || []), text] });

  const actions = [
    { key: "park",   label: "Park it",         emoji: "🌿", color: "linear-gradient(135deg,#d6c098,#b89868)", bottom: 88 },
    { key: "spiral", label: "Catch a spiral",  emoji: "🌀", color: "linear-gradient(135deg,#c8b0e0,#9878b8)", bottom: 140 },
    { key: "item",   label: "New work item",   emoji: "✦",  color: "linear-gradient(135deg,#e8a0b4,#d4687f)", bottom: 192 },
    ...(onCloseDay ? [{ key: "close", label: "Close for the day", emoji: "🌙", color: "linear-gradient(135deg,#b8a0d4,#9878b8)", bottom: 244 }] : []),
  ];

  // ── Inline mode — a pill + dropdown instead of the fixed FAB + fan-out.
  // Used in FocusView's top pill row. Same actions, same modals; just a
  // layout that sits in document flow instead of floating bottom-right.
  if (inline) {
    return (
      <span style={{ position: "relative", display: "inline-flex" }}>
        <button
          className="btn jost"
          onClick={() => setOpen(o => !o)}
          title={open ? "Close" : "Quick capture"}
          style={{
            fontSize: 12,
            background: open ? "rgba(212,130,154,0.2)" : "rgba(212,130,154,0.1)",
            border: "1px solid rgba(212,130,154,0.25)",
            color: "#c4788e",
            padding: "5px 12px",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
          aria-label={open ? "Close quick capture" : "Open quick capture"}
        >
          <span style={{ fontSize: 15, lineHeight: 1, transform: open ? "rotate(45deg)" : "none", transition: "transform .2s", display: "inline-block" }}>＋</span>
          Quick add
        </button>
        {open && (
          <>
            {/* click-catcher — closes the dropdown on any outside click */}
            <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 90 }} />
            <div
              className="fade"
              style={{
                position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 91,
                background: "#fff8f5", border: "1px solid rgba(212,130,154,0.25)",
                borderRadius: 12, boxShadow: "0 10px 30px rgba(212,100,130,0.18)",
                padding: 6, minWidth: 190, display: "flex", flexDirection: "column", gap: 2,
              }}
            >
              {actions.map(a => (
                <button
                  key={a.key}
                  onClick={() => { setOpen(false); pick(a.key); }}
                  className="jost"
                  style={{
                    display: "flex", alignItems: "center", gap: 9, background: "none",
                    border: "none", cursor: "pointer", padding: "8px 10px", borderRadius: 8,
                    fontSize: 12.5, color: "#4a3540", textAlign: "left", width: "100%",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,130,154,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                >
                  <span style={{ fontSize: 15 }}>{a.emoji}</span> {a.label}
                </button>
              ))}
            </div>
          </>
        )}
        {modal === "item" && <ItemModal item={null} onSave={saveItem} onClose={() => setModal(null)} allItems={data?.items} recurringMeetings={data?.recurringMeetings} timingHistory={data?.timingHistory} />}
        {modal === "park" && <ParkItModal onSave={saveParking} onClose={() => setModal(null)} />}
        {modal === "spiral" && <SpiralModal spiral={null} onSave={onAddSpiral} onClose={() => setModal(null)} />}
      </span>
    );
  }

  return (
    <>
      {open && actions.map((a, i) => (
        <React.Fragment key={a.key}>
          <button
            className="qc-mini"
            onClick={() => pick(a.key)}
            style={{ bottom: a.bottom, background: a.color, animationDelay: `${i * 0.04}s` }}
            aria-label={a.label}
          >
            {a.emoji}
          </button>
          <span className="qc-label" style={{ bottom: a.bottom + 8, animationDelay: `${i * 0.04 + 0.05}s` }}>{a.label}</span>
        </React.Fragment>
      ))}
      <button
        className={`qc-fab${open ? " open" : ""}`}
        onClick={() => setOpen(o => !o)}
        title={open ? "Close" : "Quick capture"}
        aria-label={open ? "Close quick capture" : "Open quick capture"}
      >
        +
      </button>

      {modal === "item" && <ItemModal item={null} onSave={saveItem} onClose={() => setModal(null)} allItems={data?.items} recurringMeetings={data?.recurringMeetings} timingHistory={data?.timingHistory} />}
      {modal === "park" && <ParkItModal onSave={saveParking} onClose={() => setModal(null)} />}
      {modal === "spiral" && <SpiralModal spiral={null} onSave={onAddSpiral} onClose={() => setModal(null)} />}
    </>
  );
}

// ── Meetings with Rosie (lives as a tab inside the Work Hub, styled to match) ─
// Storage keys are namespaced under "mpc:" so they don't collide with work-hub-v4
const MPC_KEYS = {
  history: "mpc:history",
  favorites: "mpc:favorites",
  favoriteOpeners: "mpc:favoriteOpeners",
  streak: "mpc:streak",
  lastPrepDate: "mpc:lastPrepDate",
  totalPreps: "mpc:totalPreps",
};

const MPC_VIBES = {
  warm: { label: "Warm", note: "friendly + human" },
  pro: { label: "Professional", note: "polished, kind" },
  confident: { label: "Confident", note: "clear + sure" },
};

const MPC_ENERGY = {
  low: { label: "Low spoons", icon: Battery, note: "shortest scripts" },
  normal: { label: "Regular day", icon: Heart, note: "balanced" },
  sharp: { label: "Sharp + on", icon: Zap, note: "fuller energy" },
};

const MPC_AFFIRM = ["You've got this 💗", "Look at you, prepping like a pro ✨", "I'm proud of you for doing this", "You're literally ready. I can feel it.", "This is the energy — keep going 🌸", "You belong in that room. Period.", "Okay that was GOOD. You're gonna nail it.", "Your future self is already thanking you"];
const MPC_CELEBRATE = ["Yesss! That was beautiful. You're ready. 🌸", "Okay SHOW OFF, that was perfect ✨", "I KNEW you could do it. Go get 'em 💗", "You sound so confident — go shine", "That's it. Walk in like you own it."];
const MPC_PANIC = ["Hey. Breathe. You've done harder things than this.", "One breath in. One breath out. You're okay.", "You were invited. You belong. That's it.", "Shoulders down. Jaw unclench. You've got this."];

const mpcPick = arr => arr[Math.floor(Math.random() * arr.length)];

function mpcCurveballs(sit) {
  const s = sit.toLowerCase();
  const isKickoff = /kickoff|kick-off|kick off|starting|begin|new project|launch/.test(s);
  const isStatus = /status|update|check.?in|standup|weekly|progress/.test(s);
  const isVendor = /vendor|client|partner|external/.test(s);
  // 1:1 detection comes before leadership so "1:1 with manager" doesn't trip
  // the formal exec branch. The 1:1 curveballs are about openness, blockers,
  // and asking for what you need — not "what do you recommend / what's the cost"
  const is1on1 = /1:1|1-1|one.on.one|one[\s-]on[\s-]one/i.test(s);
  const isLeadership = !is1on1 && /leader|exec|director|boss|\bvp\b|\bceo\b|\bcfo\b|\bcio\b/.test(s);
  const isProblem = /issue|problem|delay|behind|stuck|escalat|concern|risk/.test(s);

  let pool = [
    { q: "\"Can you just summarize the whole project real quick?\"", a: "You don't have to do it perfectly. Say: \"Sure — we're [current phase], focused on [top priority], with [next milestone] coming up. Want me to go deeper on any piece?\" That's a complete answer." },
    { q: "\"Why is this taking so long?\"", a: "Don't get defensive. Say: \"Fair question. Here's what's driving the timeline — [reason]. If you want to explore ways to compress it, I can come back with options.\"" },
    { q: "\"Who else is involved in this?\"", a: "Quick list works: \"On our side it's me, [person], and [person]. On their side, [person] is the main contact.\" If you don't know — \"Let me confirm and send it over today.\"" },
    { q: "A question you didn't plan for at all", a: "Your line: \"Good question — I want to give you a real answer, not a guess. Let me follow up today.\" Then write it down. You don't have to know everything in the room." },
    { q: "Someone interrupts or talks over you", a: "Hold your ground gently: \"I want to finish this thought real quick and then I want to hear yours.\" Keep your tone warm. You're allowed to take your turn." },
    { q: "Awkward silence after you speak", a: "Let it sit. Count to 3. If they still don't speak: \"Does that land okay, or do you want me to go deeper?\" Silence is usually them thinking, not judging." },
  ];
  if (isKickoff) pool.unshift(
    { q: "\"What do YOU need from us to make this successful?\"", a: "This is a gift. \"Three things — quick decisions when I ask, one point of contact on your side, and a heads up if priorities shift. That's it.\"" },
    { q: "\"How are we going to communicate during this project?\"", a: "Have a default: \"Weekly status email from me, a shared tracker you can check anytime, and I'll call out anything urgent. Does that work?\"" }
  );
  if (isStatus) pool.unshift(
    { q: "\"Wait — when did THAT change?\"", a: "\"That shifted [when]. I should've flagged it sooner — here's where we are now and here's the plan.\" Own it cleanly." },
    { q: "\"Are we going to hit the deadline?\"", a: "Be honest. If yes: \"Yes, we're on track.\" If unsure: \"Right now, yes, assuming [X]. If that changes, you'll hear from me immediately.\"" }
  );
  if (isLeadership) pool.unshift(
    { q: "\"What do you recommend?\"", a: "They're asking YOU because they trust you. \"My recommendation is [thing], because [reason]. The main risk is [X], and here's how I'd handle it.\"" },
    { q: "\"How much will this cost / take?\"", a: "If you know — give the number. If not — \"I'll have a full estimate by [specific time].\" Vague answers hurt you." }
  );
  if (is1on1) pool.unshift(
    { q: "\"How are things actually going for you?\"", a: "Be honest — they're asking because they care. \"Honestly, [one real thing that's good] is going well, and [one thing] has been heavy. I'm working through it but wanted you to know.\"" },
    { q: "\"What's blocking you right now?\"", a: "Have ONE answer ready. \"The main blocker is [specific thing] — I'd love [specific ask: a decision / intro / cover / time].\" Don't say 'nothing' if there's something." },
    { q: "\"Any feedback for me?\"", a: "Have something small + true ready. \"One thing — when [specific moment], it would help me if [specific ask].\" If you really don't have anything: \"Nothing big right now, but I'll bring something next time.\"" },
    { q: "Awkward small talk you weren't expecting", a: "Lean in for 60 seconds, then redirect: \"Yeah definitely — speaking of which, I wanted to share [thing].\" You're allowed to steer the conversation." }
  );
  if (isProblem) pool.unshift(
    { q: "\"Why didn't we catch this sooner?\"", a: "\"Good question — here's what I know now, and I'm looking into what we can adjust for next time. Right now I want to focus on fixing it.\" Redirect to solution." },
    { q: "\"What's the worst-case scenario?\"", a: "\"Worst case, [specific thing]. Most likely case, [thing]. Here's what I'm doing to make sure we land in the 'most likely' version.\"" }
  );
  if (isVendor) pool.unshift(
    { q: "\"Who on your side has final sign-off?\"", a: "Know this BEFORE you walk in. If you don't: \"I'll confirm the approval chain and send it over today.\"" },
    { q: "\"Can you do [thing outside original scope]?\"", a: "Don't say yes on the spot. \"Let me check on that and come back to you — I want to make sure I give you a real answer.\"" }
  );
  return [...new Set(pool)].sort(() => Math.random() - 0.5).slice(0, 4);
}

// Detects the meeting type from a roadmap slot label so the "quick prep" pill
// can route to MeetingFocusView pre-loaded with the right opener + curveballs.
// Mirrors the keyword patterns mpcOpener uses internally, but sourced from the
// slot label string instead of the situation field.
//
// Returns: { type, emoji, label, situation }
function detectMeetingTypeFromLabel(label) {
  const raw = (label || "").trim();
  const s = raw.toLowerCase();
  if (/escalat|risk|issue|problem|delay|behind|stuck|concern/.test(s)) {
    return { type: "problem", emoji: "⚠️", label: "Problem / escalation", situation: `Escalation meeting about ${raw}. Need to flag a problem clearly.` };
  }
  if (/kickoff|kick-off|kick off|launch|new project/.test(s)) {
    return { type: "kickoff", emoji: "🚀", label: "Kickoff", situation: `Kickoff meeting for ${raw}.` };
  }
  // 1:1 detection comes BEFORE leadership so "1:1 with manager" routes to
  // the conversational opener, not the formal exec-briefing one.
  if (/1:1|1-1|one.on.one|one[\s-]on[\s-]one/i.test(s)) {
    // Extract the other person's name if present ("1:1 with Josh", "1:1/Josh", "1:1 w/Josh")
    const nameMatch = raw.match(/(?:with|w\/?|\/)\s*([A-Z][a-zA-Z]+)/i);
    const name = nameMatch ? nameMatch[1] : "";
    return {
      type: "one_on_one",
      emoji: "🌟",
      label: "1:1",
      situation: name
        ? `1:1 with ${name} — checking in, sharing where I'm at, hearing what's on their mind.`
        : `1:1 — checking in, sharing where I'm at, hearing what's on their mind.`,
    };
  }
  if (/leadership|exec|director|\bvp\b|\bceo\b|\bcfo\b|\bcio\b/.test(s)) {
    return { type: "leadership", emoji: "🌟", label: "Leadership / exec", situation: `Meeting with leadership about ${raw}.` };
  }
  if (/vendor|external|third.?party|client call|partner sync/.test(s)) {
    return { type: "vendor", emoji: "🤝", label: "Vendor / external", situation: `Vendor meeting for ${raw}.` };
  }
  if (/status|standup|stand-up|weekly|check.?in|sync|progress|update/.test(s)) {
    return { type: "status", emoji: "📊", label: "Status check-in", situation: `Status check-in for ${raw}.` };
  }
  if (/\bintro\b|introduc|meet (and|&) greet|first time|new contact/.test(s)) {
    return { type: "intro", emoji: "👋", label: "Intro / first meet", situation: `Intro meeting — first time meeting for ${raw}.` };
  }
  return { type: "general", emoji: "🌷", label: "Meeting prep", situation: `Meeting: ${raw}.` };
}

function mpcOpener(situation, whoWith, vibe, energy) {
  const sit = situation.toLowerCase();
  const who = whoWith.trim();
  const whoPart = who ? ` ${who}` : "";
  const isKickoff = /kickoff|kick-off|kick off|starting|begin|new project|launch/.test(sit);
  const isStatus = /status|update|check.?in|standup|stand-up|weekly|progress/.test(sit);
  const isVendor = /vendor|client|partner|external|third.?party/.test(sit);
  // 1:1 catches BEFORE leadership so "1:1 with manager" doesn't trigger the
  // formal "Brief update and a recommendation" line. Tone is conversational,
  // peer-level — works for 1:1s with manager, peer, or report.
  const is1on1 = /1:1|1-1|one.on.one|one[\s-]on[\s-]one/i.test(sit);
  const isLeadership = !is1on1 && /leader|exec|director|boss|vp|ceo|cfo|cio/.test(sit);
  const isProblem = /issue|problem|delay|behind|stuck|escalat|concern|risk/.test(sit);
  const isNew = /\bnew\b|don't know|never met|first time|introduc/.test(sit);

  const shortIntro = "I'm Lexy — Project Coordinator, Implementation";
  const fullIntro = "I'm Lexy, Project Coordinator on Implementation";

  // LOW energy → shortest possible
  if (energy === "low") {
    // 1:1s skip the formal intro since they're with someone who already knows you
    if (is1on1) {
      if (vibe === "warm") return `Hi${whoPart}! Quick check-in from me.`;
      if (vibe === "pro") return `Hi${whoPart}. Brief check-in.`;
      return `Hey${whoPart}. Quick one.`;
    }
    if (vibe === "warm") return `Hi${whoPart} — ${shortIntro}. Thanks for the time.`;
    if (vibe === "pro") return `Hello${whoPart}. ${shortIntro}.`;
    return `${whoPart ? `${who} — ` : ""}${shortIntro}.`;
  }

  // SHARP energy → a touch fuller, one clear move
  if (energy === "sharp") {
    if (vibe === "warm") {
      if (isKickoff) return `Hi${whoPart}! ${fullIntro} — excited to kick this off. What does success look like for you?`;
      if (is1on1) return `Hey${whoPart}! Few things on my mind, and curious what's on yours.`;
      if (isLeadership) return `Hi${whoPart}, thanks for the time. ${fullIntro}. I'll keep it tight.`;
      if (isProblem) return `Hi${whoPart}, thanks for making time. ${fullIntro}. Wanted to flag something early.`;
      if (isNew) return `Hi${whoPart} — ${fullIntro}. Glad we're finally connecting!`;
      return `Hi${whoPart}! ${fullIntro}. ${isStatus ? "Quick status on my end." : "Thanks for being here."}`;
    }
    if (vibe === "pro") {
      if (isKickoff) return `Good morning${whoPart}. ${fullIntro}. I'll be your point of contact throughout.`;
      if (is1on1) return `Hi${whoPart}. A few updates from me, and a couple of things I'd like your read on.`;
      if (isLeadership) return `Good morning${whoPart}. ${fullIntro}. Brief update and a recommendation — I'll keep it tight.`;
      if (isVendor) return `Hello${whoPart}. ${fullIntro} at the credit union. Let's confirm the plan.`;
      return `Good morning${whoPart}. ${fullIntro}. ${isStatus ? "I'll walk through status and open items." : "Thank you for the time."}`;
    }
    // confident
    if (is1on1) return `${whoPart ? `${who} — ` : ""}Few things on my plate, and one thing I want your take on.`;
    if (isLeadership) return `${whoPart ? `${who} — ` : ""}${fullIntro}. Clear recommendation coming.`;
    if (isProblem) return `${whoPart ? `${who} — ` : ""}${fullIntro}. We've hit a snag. Here's the plan.`;
    return `${whoPart ? `${who} — ` : ""}${shortIntro}. Three things to cover.`;
  }

  // NORMAL energy → balanced
  if (vibe === "warm") {
    if (isKickoff) return `Hi${whoPart}! ${fullIntro}. I'll be your go-to on this — what's top of mind for you?`;
    if (is1on1) return `Hey${whoPart}! How's everything going? I've got a few things to share and would love to hear what's on your radar.`;
    if (isLeadership) return `Hi${whoPart}, thanks for the time. ${fullIntro}. Short update + one question for you.`;
    if (isProblem) return `Hey${whoPart}, thanks for making time. ${fullIntro}. Wanted to flag something early.`;
    if (isNew) return `Hi${whoPart} — ${fullIntro}. Glad we're connecting today.`;
    if (isStatus) return `Hey${whoPart}! ${fullIntro}. Quick status — anything specific on your mind first?`;
    return `Hi${whoPart}! ${fullIntro}. Thanks for the time today.`;
  }
  if (vibe === "pro") {
    if (isKickoff) return `Good morning${whoPart}. ${fullIntro}. Coordinating this implementation end to end.`;
    if (is1on1) return `Hi${whoPart}. Quick check-in from me — anything specific you want to cover first?`;
    if (isLeadership) return `Hello${whoPart}. ${fullIntro}. I'll keep this focused.`;
    if (isVendor) return `Hi${whoPart}. ${fullIntro} at the credit union. Main point of contact on our side.`;
    if (isStatus) return `Hello${whoPart}. ${fullIntro}. Brief status and a couple of items for input.`;
    return `Hello${whoPart}. ${fullIntro}. Thank you for the time.`;
  }
  // confident
  if (is1on1) return `${whoPart ? `${who} — ` : ""}Three things on my mind, and curious what's on yours.`;
  if (isLeadership) return `${whoPart ? `${who} — ` : ""}${fullIntro}. Clear ask coming.`;
  if (isProblem) return `${whoPart ? `${who} — ` : ""}${fullIntro}. We've hit a snag. Here's the plan.`;
  return `${whoPart ? `${who} — ` : ""}${shortIntro}.`;
}

const MPC_EXITS = {
  warm: [
    { situation: "Wrapping up a meeting on time", text: "This was really helpful — thank you. I'll send a quick recap with next steps by end of day." },
    { situation: "Meeting is running long & you need to go", text: "I want to be mindful of your time — and mine. Can we take the rest offline? I'll follow up today with next steps." },
    { situation: "You need to end it (you're drained)", text: "Let's pause here for today. I'll pull my notes together and circle back with you tomorrow. Thanks for the time." },
    { situation: "Someone stopped you in the hallway", text: "That's a great point — I don't want to give you a half-thought answer. Can I swing by later or send you a note on it?" },
    { situation: "Leaving after meeting someone new", text: "Really glad we connected. I'll keep you posted on [thing]. Have a good rest of your day!" },
  ],
  pro: [
    { situation: "Wrapping up a meeting on time", text: "Thank you for the time. I'll circulate a summary with next steps and owners by end of day." },
    { situation: "Meeting is running long & you need to go", text: "I'd like to be respectful of the time. Let's close here and I'll follow up via email with anything outstanding." },
    { situation: "You need to end it (you're drained)", text: "I'll wrap here and come back with a full update tomorrow. Thank you for the time today." },
    { situation: "Someone stopped you in the hallway", text: "That deserves a real answer — let me send you a note on it later today." },
    { situation: "Leaving after meeting someone new", text: "It was good to connect. I'll be in touch on [specific thing]. Take care." },
  ],
  confident: [
    { situation: "Wrapping up a meeting on time", text: "Good meeting. Recap and next steps hitting your inbox today." },
    { situation: "Meeting is running long & you need to go", text: "Let's close it here. I'll follow up on the open items by end of day." },
    { situation: "You need to end it (you're drained)", text: "I'm going to wrap here. You'll have a full update tomorrow." },
    { situation: "Someone stopped you in the hallway", text: "Good question — I'll send you something on that today." },
    { situation: "Leaving after meeting someone new", text: "Great to meet you. Talk soon." },
  ],
};

const MPC_SCRIPTS = {
  warm: [
    { id: "w-cold", title: "Walking in cold", text: "Hi, I don't think we've officially met — I'm Lexy, Project Coordinator on the Implementation team. I've seen your name come up a lot in good context. Glad we're finally connecting." },
    { id: "w-kickoff", title: "Project kickoff", text: "Hi everyone, thanks for being here! I'm Lexy, Project Coordinator on Implementation — I'll be your main point of contact throughout this project. Before we dive in, I'd love to hear what each of you is hoping to get out of this." },
    { id: "w-status", title: "Status check-in", text: "Hey! Thanks for the time. I've got a quick update on where we are and a couple of things I need your input on. Should I run through it, or do you want to start with anything first?" },
    { id: "w-problem", title: "Flagging a problem", text: "Hey, thanks for making time on short notice. I wanted to get ahead of something before it grows. Here's what I'm seeing, and here's what I'm thinking for next steps — but I want your read on it too." },
    { id: "w-leader", title: "Meeting with leadership", text: "Hi, thank you for the time. I'm Lexy from Implementation. I know you're slammed, so I'll be focused. I've got a quick update and one decision I need your help on." },
    { id: "w-vendor", title: "Vendor or external call", text: "Hi, I'm Lexy, Project Coordinator on the Implementation team at the credit union. I'll be your main contact on our side throughout this project. Thanks for the time today — let's make sure we walk out aligned." },
  ],
  pro: [
    { id: "p-cold", title: "Walking in cold", text: "Hello, I'm Lexy, Project Coordinator on the Implementation team. It's nice to put a face to the name. Thank you for making time." },
    { id: "p-kickoff", title: "Project kickoff", text: "Good morning. I'm Lexy, Project Coordinator on the Implementation team. I'll be coordinating this project end to end. Let's walk through the scope and timeline so we're all aligned." },
    { id: "p-status", title: "Status check-in", text: "Hello. I have a status update and two open items that need input. I'll keep this efficient." },
    { id: "p-problem", title: "Flagging a problem", text: "Thank you for the time. I want to surface a risk I've identified early, before it affects delivery. Here's what I'm seeing and what I recommend." },
    { id: "p-leader", title: "Meeting with leadership", text: "Good morning. Thank you for the time. I'm Lexy from Implementation. I have a concise update and a specific recommendation." },
    { id: "p-vendor", title: "Vendor or external call", text: "Hello, I'm Lexy, Project Coordinator on the Implementation team. I'll be your primary contact during this engagement. Let's confirm the plan and timeline." },
  ],
  confident: [
    { id: "c-cold", title: "Walking in cold", text: "Lexy — Project Coordinator, Implementation. Good to meet you." },
    { id: "c-kickoff", title: "Project kickoff", text: "Morning. Lexy, Project Coordinator on Implementation. I'll run point on this. Here's how we're going to move." },
    { id: "c-status", title: "Status check-in", text: "Three things to cover. Let's go." },
    { id: "c-problem", title: "Flagging a problem", text: "I've spotted a risk. Here's what it is and here's what I need from you to solve it." },
    { id: "c-leader", title: "Meeting with leadership", text: "Thanks for the time. I came in with a clear recommendation. Here it is." },
    { id: "c-vendor", title: "Vendor or external call", text: "Lexy, Project Coordinator. I'll be your contact on our side. Let's confirm the plan." },
  ],
};

const MPC_CHEATSHEET = [
  { icon: "🌸", title: "Before the door opens", tips: ["One slow breath. Shoulders down. You're a peer, not a guest.", "Say your opening line in your head once.", "You were invited. You belong in this room."] },
  { icon: "👋", title: "The first 10 seconds", tips: ["Eye contact → smile → then speak. In that order.", "Say your full intro slower than feels natural.", "Then stop. Let them respond."] },
  { icon: "☕", title: "Small talk rules", tips: ["One small-talk beat is enough. ONE.", "Going straight to business is fine if there's an agenda.", "Match their length if they start small talk.", "Silence for 2–3 seconds is normal."] },
  { icon: "🎯", title: "Pivoting to the point", tips: ["Verbal signal: \"So — the reason I wanted to meet...\"", "Purpose in ONE sentence. Then stop.", "Over-explaining? \"Let me pause — does that make sense so far?\""] },
  { icon: "🫧", title: "If you feel cold or flat", tips: ["Cold usually means rushed. Slow down.", "Say their name once in the first minute.", "Swap \"I need\" for \"I wanted to.\"", "Sip of water resets your expression."] },
  { icon: "🧠", title: "If your brain is doing too much", tips: ["Bring a notecard with 3 bullets. You're allowed.", "Lost your place: \"Let me come back to that in a sec.\"", "Unplanned question: \"Good question — let me think and follow up.\""] },
  { icon: "🔋", title: "If you're running on low spoons", tips: ["Shortest intro: \"Hi, I'm Lexy, Project Coordinator on Implementation.\" Done.", "Say: \"I want to be efficient with both our time today.\"", "Clear and kind beats warm and depleted."] },
];

// Generate a full meeting script using Claude — tailored to situation, vibe, energy
const SCRIPT_SYSTEM_PROMPT = `You are Rosie — a warm, ADHD/autism-aware meeting coach helping Lexy (Project Coordinator on the Implementation team at a credit union) walk through an entire meeting arc, not just the opening.

Your job: produce a FULL meeting script as structured JSON. The script should be bulleted (short, actionable lines Lexy can scan mid-meeting), specific to her situation, and calibrated to her current energy + tone.

TONE CALIBRATION:
- "warm" vibe: conversational, relational, uses "we/us/together"
- "pro" vibe: polished, efficient, respectful of time
- "confident" vibe: direct, clear, owns the room

ENERGY CALIBRATION:
- "low" (low spoons): shortest possible bullets, minimal transitions, front-load the most important points, permission to cut things
- "normal" (regular day): balanced, standard arc
- "sharp" (on): fuller engagement, more proactive questions, fuller closing

IMPORTANT PRINCIPLES:
- Every bullet should be something Lexy could actually say or do — not abstract advice
- For "what to say" bullets, use quote marks so it's clear these are lines
- For "what to do" bullets (breathing, pausing, etc.), skip quotes
- Keep bullets short: under 15 words each where possible
- The "if_offtopic" and "if_tense" sections exist for when things go sideways — Lexy should be able to tap these mid-meeting and get immediate usable wording

OUTPUT FORMAT: Return ONLY a valid JSON object with this exact shape, no markdown, no code fences:

{
  "opening": {
    "title": "Opening (first 30 seconds)",
    "bullets": ["...", "..."]
  },
  "agenda": {
    "title": "Set the agenda",
    "bullets": ["...", "..."]
  },
  "main_points": {
    "title": "Main discussion points",
    "bullets": ["...", "..."]
  },
  "transitions": {
    "title": "Transitions between topics",
    "bullets": ["...", "..."]
  },
  "closing": {
    "title": "Closing (last 2 minutes)",
    "bullets": ["...", "..."]
  },
  "if_offtopic": {
    "title": "If they go off-topic",
    "bullets": ["...", "..."]
  },
  "if_tense": {
    "title": "If things get tense",
    "bullets": ["...", "..."]
  }
}

Each section should have 3-6 bullets. Be specific to Lexy's situation, not generic.`;

async function generateFullScript(situation, whoWith, vibe, energy) {
  const userMsg = `Situation: ${situation || "general meeting"}
Meeting with: ${whoWith || "(not specified)"}
Tone: ${vibe}
Energy level: ${energy}

Generate the full meeting script for Lexy.`;

  try {
    const response = await fetch("/api/rosie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2500,
        system: SCRIPT_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMsg }],
      }),
    });
    const data = await response.json();
    const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("").trim() || "";
    const clean = text.replace(/^```json\s*|```\s*$/g, "").trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error("Script gen error:", e);
    return null;
  }
}

// Refine any part of the meeting prep based on Lexy's request
const REFINE_PREP_SYSTEM_PROMPT = `You are Rosie — a warm, ADHD/autism-aware meeting coach helping Lexy (Project Coordinator, Implementation team at a credit union). Lexy is asking you to REFINE specific parts of her meeting prep. You have the current opener, curveballs, and full script in context. Apply her requested changes and return the UPDATED full state.

RULES:
- Only change what she asks you to change. Leave everything else alone.
- If she says "make the opener warmer" → only update opener, keep curveballs and script intact
- If she says "add a curveball about pricing" → only add to curveballs array, keep everything else
- If she says "if they get tense, add a line about taking a pause" → only update fullScript.if_tense, keep everything else
- Keep bullets short (under 15 words each for script sections)
- Match the existing tone (warm/pro/confident) and energy (low/normal/sharp) unless she explicitly asks to change it
- Keep quotation marks around things Lexy should literally say, plain text for things to do

OUTPUT FORMAT: Return ONLY a valid JSON object. No markdown, no code fences, no explanation. Include ALL these keys (preserve sections she didn't change):
{
  "opener": "the opener string",
  "curveballs": [{ "q": "...", "a": "..." }, ...],
  "fullScript": {
    "opening": { "title": "...", "bullets": [...] },
    "agenda": { "title": "...", "bullets": [...] },
    "main_points": { "title": "...", "bullets": [...] },
    "transitions": { "title": "...", "bullets": [...] },
    "closing": { "title": "...", "bullets": [...] },
    "if_offtopic": { "title": "...", "bullets": [...] },
    "if_tense": { "title": "...", "bullets": [...] }
  },
  "rosieNote": "a brief friendly note to Lexy explaining what you changed (1 sentence)"
}

If the current state has no fullScript (it's null), and Lexy isn't asking about the script, set fullScript to null in your response.`;

async function refineMeetingPrep(currentState, userRequest) {
  const { situation, whoWith, vibe, energy, opener, curveballs, fullScript } = currentState;
  const userMsg = `Current meeting prep state:

SITUATION: ${situation || "(none)"}
MEETING WITH: ${whoWith || "(not specified)"}
TONE: ${vibe}
ENERGY: ${energy}

CURRENT OPENER: "${opener}"

CURRENT CURVEBALLS:
${(curveballs || []).map((c, i) => `${i + 1}. Q: ${c.q}\n   A: ${c.a}`).join("\n") || "(none)"}

CURRENT FULL SCRIPT:
${fullScript ? JSON.stringify(fullScript, null, 2) : "(not generated yet)"}

LEXY'S REQUEST: ${userRequest}

Return the updated full state as JSON.`;

  try {
    const response = await fetch("/api/rosie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 3000,
        system: REFINE_PREP_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMsg }],
      }),
    });
    const data = await response.json();
    const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("").trim() || "";
    const clean = text.replace(/^```json\s*|```\s*$/g, "").trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error("Refine prep error:", e);
    return null;
  }
}

// Parse messy meeting notes into a structured breakdown
const NOTES_SYSTEM_PROMPT = `You are Rosie — a meeting notes parser for Lexy (Project Coordinator, Implementation team at a credit union). Parse her raw meeting notes into structured output.

Your job: extract ACTION ITEMS (with owners), DECISIONS, OPEN QUESTIONS, RISKS, REMINDERS, and NEXT MEETING info from messy notes.

CRITICAL RULES FOR ACTION ITEMS:
- Mark "owner" as "me" if the action is clearly Lexy's responsibility (she volunteered, was assigned, said "I'll...", or it's implementation/coordination work that's naturally hers)
- Mark "owner" as the person's name if they took it
- Mark "owner" as "team" if it's a group effort with no clear owner
- Mark "owner" as "unclear" if the notes don't say — don't guess
- For Lexy's action items ("me"), ALWAYS provide:
  - "title": short clear task name (under 60 chars, starts with verb)
  - "priority": "high" (urgent/blocker/deadline this week), "medium" (default, this week-ish), "low" (nice-to-have, future)
  - "why": one-line context pulled from notes (why this matters, what it unblocks)
  - "tasks": array of subtasks IF the action item has multiple clear steps. Otherwise empty array.
  - "dueHint": if notes mention a due date/deadline, include it as plain text like "Friday", "end of week", "before 5/1" — else empty string
- For other people's items, still provide title, owner, priority, dueHint — skip why/tasks

DECISIONS: things explicitly agreed to. Each should be one clear sentence.
OPEN QUESTIONS: things raised but not resolved. Include who should answer if notes say.
RISKS: concerns or things that could blow up. Include mitigation if mentioned.
REMINDERS: time-anchored nudges Lexy should set for herself — things like "follow up with Josh on Friday," "check in on the Verafin charter next week," "ping Colby if no reply by Monday." These are NOT full tasks (those are action items) — they're standalone alerts to surface at the right moment. Only extract reminders that are explicitly time-bound or follow-up oriented in the notes. If nothing fits, return an empty array.
- "text": short, under 80 chars, starts with a verb ("Follow up with…", "Check on…", "Ping…")
- "when": plain-text timing hint pulled from notes if any (e.g. "Friday", "next week", "before 5/1") — else empty string
NEXT MEETING: when/what if mentioned in notes.

OUTPUT FORMAT — return ONLY valid JSON, no markdown, no code fences:

{
  "actionItems": [
    { "title": "...", "owner": "me|Name|team|unclear", "priority": "high|medium|low", "why": "...", "tasks": ["...", "..."], "dueHint": "" }
  ],
  "decisions": ["...", "..."],
  "openQuestions": [
    { "question": "...", "whoShouldAnswer": "" }
  ],
  "risks": [
    { "risk": "...", "mitigation": "" }
  ],
  "reminders": [
    { "text": "...", "when": "" }
  ],
  "nextMeeting": {
    "when": "",
    "focus": ""
  },
  "summary": "one or two sentences of plain-English summary for context"
}

If a category has nothing, return an empty array (or empty strings for nextMeeting). Don't skip keys.`;

async function parseMeetingNotes(notesText, meetingContext) {
  const userMsg = `${meetingContext ? `Meeting context: ${meetingContext}\n\n` : ""}Raw notes:
"""
${notesText}
"""

Parse these notes.`;

  try {
    const response = await fetch("/api/rosie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 3000,
        system: NOTES_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMsg }],
      }),
    });
    const data = await response.json();
    const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("").trim() || "";
    const clean = text.replace(/^```json\s*|```\s*$/g, "").trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error("Notes parse error:", e);
    return null;
  }
}

// ── MeetingsTab React Component ───────────────────────────────────────────────
function MeetingsTab({ onAwardXP, data, onUpdateData, appEnergy, appMood, onReCheckIn, onShowRoadmapLog, appTab, setAppTab, pendingPastMeeting, onClearPendingPastMeeting, onMeetingFocus }) {
  const [subtab, setSubtab] = useState("prep");
  const [libraryView, setLibraryView] = useState("openers");
  const [moreView, setMoreView] = useState("menu");

  const [vibe, setVibe] = useState("warm");
  const [energy, setEnergy] = useState("normal");
  const [situation, setSituation] = useState("");
  const [whoWith, setWhoWith] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [generated, setGenerated] = useState(null);
  const [curveballs, setCurveballs] = useState([]);
  const [copied, setCopied] = useState(null);
  const [rehearsing, setRehearsing] = useState(false);
  const [rehearsalLines, setRehearsalLines] = useState([]);
  const [rehearsalIndex, setRehearsalIndex] = useState(0);
  const [fullScript, setFullScript] = useState(null); // { opening, agenda, main_points, transitions, closing, if_offtopic, if_tense } | null
  const [scriptLoading, setScriptLoading] = useState(false);
  const [scriptError, setScriptError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({}); // "if_offtopic": true

  // Rosie refinement chat state (for tweaking prep after generation)
  const [refineInput, setRefineInput] = useState("");
  const [refineLoading, setRefineLoading] = useState(false);
  const [refineHistory, setRefineHistory] = useState([]); // [{ role, text }]

  // Notes logging state
  const [notesInput, setNotesInput] = useState("");
  const [notesAttachTo, setNotesAttachTo] = useState(""); // meeting id or "" for standalone
  const [notesStandaloneTitle, setNotesStandaloneTitle] = useState(""); // optional title for unprepped meetings
  const [notesAttendees, setNotesAttendees] = useState(""); // comma-separated names of who was there

  // Schedule subtab — modal toggle for recurring meetings (reuses existing modal)
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  // History pill — opens the meeting trail in a modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  // Two-step delete confirmation — meeting id whose Delete button is armed
  // and showing the "Click again" state. Null when no delete is pending.
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  // Same pattern but for thread entries in the Threads subtab.
  const [pendingThreadDeleteId, setPendingThreadDeleteId] = useState(null);
  const pendingThreadDeleteTimerRef = useRef(null);
  // Inline edit state for thread entries.
  const [editingThreadEntryId, setEditingThreadEntryId] = useState(null);
  const [editingThreadEntryDraft, setEditingThreadEntryDraft] = useState("");
  // Highlight a specific meeting in the history modal when the user navigated
  // here from a past-meeting pill on the roadmap. Cleared after the effect runs.
  const [historyHighlightLabel, setHistoryHighlightLabel] = useState("");
  // When App sets pendingPastMeeting (via the roadmap's past-meeting pill click),
  // auto-open the history modal and remember which meeting to scroll to.
  useEffect(() => {
    if (pendingPastMeeting && pendingPastMeeting.slotLabel) {
      setShowHistoryModal(true);
      setHistoryHighlightLabel(pendingPastMeeting.slotLabel);
      if (onClearPendingPastMeeting) onClearPendingPastMeeting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPastMeeting]);
  // Prep mode toggle — combines former "Prep" and "1:1" subtabs into one
  const [prepMode, setPrepMode] = useState("meeting"); // "meeting" | "oneonone"

  // 1:1 prep state
  const [oneOnOneSummary, setOneOnOneSummary] = useState("");
  const [oneOnOneLoading, setOneOnOneLoading] = useState(false);
  const [oneOnOneCopied, setOneOnOneCopied] = useState(false);
  const [oneOnOneFeedback, setOneOnOneFeedback] = useState("");
  const [oneOnOneRefining, setOneOnOneRefining] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [oneOnOnePeriod, setOneOnOnePeriod] = useState(14); // 7 | 14 | 30 days
  const oneOnOneHistory = data.oneOnOneHistory || [];
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesResult, setNotesResult] = useState(null);
  const [notesError, setNotesError] = useState(null);
  const [notesCurrentId, setNotesCurrentId] = useState(null); // the saved note entry id
  const [notesAddedFlash, setNotesAddedFlash] = useState(null); // "{n} items" or "{n} reminders" — string
  // Per-category selections (Set of indices) — default to all "me" items checked, all reminders checked
  const [notesActionItemsSelected, setNotesActionItemsSelected] = useState(() => new Set());
  const [notesRemindersSelected, setNotesRemindersSelected] = useState(() => new Set());
  const [notesActionItemsAdded, setNotesActionItemsAdded] = useState(false); // hide section once user has added
  const [notesRemindersAdded, setNotesRemindersAdded] = useState(false);

  // History expansion + editing
  const [expandedMeeting, setExpandedMeeting] = useState(null);
  const [editingMeetingField, setEditingMeetingField] = useState(null); // { meetingId, field, path? }
  const [meetingFieldDraft, setMeetingFieldDraft] = useState("");
  const [historyScriptSections, setHistoryScriptSections] = useState({}); // { "meetingId:if_tense": true }
  // Script bullet editing — works for both Prep (meetingId = "current") and History (meetingId = actual id)
  const [editingBullet, setEditingBullet] = useState(null); // { scope, meetingId?, sectionKey, bulletIndex }
  const [bulletDraft, setBulletDraft] = useState("");
  // History refine chat — separate per meeting
  const [historyRefineInput, setHistoryRefineInput] = useState({}); // { meetingId: "text" }
  const [historyRefineLoading, setHistoryRefineLoading] = useState(null); // meetingId currently loading
  const [historyRefineChats, setHistoryRefineChats] = useState({}); // { meetingId: [{role, text}] }

  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favoriteOpeners, setFavoriteOpeners] = useState([]);
  // Inline edit state for library favorites — track which favorite is being
  // edited and what the current draft text is. null = nothing being edited.
  const [editingFavoriteId, setEditingFavoriteId] = useState(null);
  const [favoriteDraft, setFavoriteDraft] = useState("");
  const [streak, setStreak] = useState(0);
  const [lastPrepDate, setLastPrepDate] = useState(null);
  const [totalPreps, setTotalPreps] = useState(0);
  const [checklist, setChecklist] = useState({ water: false, notecard: false, breath: false, bathroom: false, phone: false });

  const [panicMode, setPanicMode] = useState(false);
  const [rosieNote, setRosieNote] = useState(null);
  const [debriefOpen, setDebriefOpen] = useState(false);
  const [currentMeetingId, setCurrentMeetingId] = useState(null);
  const [debriefFeeling, setDebriefFeeling] = useState("");
  const [debriefWin, setDebriefWin] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  // Backup & restore — import reads a work-hub-backup-*.json (the exact shape
  // exportHubBackup writes) and replaces the full hub state after confirm.
  const importFileRef = useRef(null);
  const [pendingImport, setPendingImport] = useState(null); // parsed backup awaiting confirm
  const [importError, setImportError] = useState("");
  const handleImportFile = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setImportError("");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.items)) {
          setImportError("That file doesn't look like a Work Hub backup — expected a work-hub-backup-*.json export.");
          return;
        }
        setPendingImport(parsed);
      } catch {
        setImportError("Couldn't read that file as JSON — make sure it's an unedited Work Hub backup export.");
      }
    };
    reader.onerror = () => setImportError("Couldn't read the file. Try picking it again.");
    reader.readAsText(file);
  };
  const confirmImport = () => {
    if (!pendingImport) return;
    exportHubBackup(data); // safety net: download the current state before replacing it
    onUpdateData(pendingImport);
    setPendingImport(null);
  };

  useEffect(() => {
    (async () => {
      try {
        const keys = Object.values(MPC_KEYS);
        const results = await Promise.all(keys.map(k => window.storage.get(k).catch(() => null)));
        if (results[0]?.value) setHistory(JSON.parse(results[0].value));
        if (results[1]?.value) setFavorites(JSON.parse(results[1].value));
        if (results[2]?.value) setFavoriteOpeners(JSON.parse(results[2].value));
        if (results[3]?.value) setStreak(parseInt(results[3].value));
        if (results[4]?.value) setLastPrepDate(results[4].value);
        if (results[5]?.value) setTotalPreps(parseInt(results[5].value));
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  const saveMpc = async (key, value) => {
    try { await window.storage.set(key, typeof value === "string" ? value : JSON.stringify(value)); } catch (e) {}
  };

  const generate = () => {
    const opener = mpcOpener(situation, whoWith, vibe, energy);
    setGenerated(opener);
    const lines = opener.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()) || [opener];
    setRehearsalLines(lines);
    setRehearsalIndex(0);
    setRehearsing(false);
    const cb = mpcCurveballs(situation);
    setCurveballs(cb);
    // Clear any previous full script — let user regenerate if they want one
    setFullScript(null);
    setScriptError(null);
    setExpandedSections({});
    // Clear any previous refinement chat — fresh prep = fresh conversation
    setRefineHistory([]);
    setRefineInput("");

    const isNervous = /nervous|scared|anxious|worried|afraid|tense/.test(situation.toLowerCase());
    setRosieNote(isNervous
      ? "Hey — nerves just mean you care. Read this out loud a few times and it'll start feeling like yours. 💗"
      : mpcPick(MPC_AFFIRM));

    const meeting = {
      id: Date.now(), date: new Date().toISOString(),
      title: meetingTitle.trim(),
      situation: situation || "No description", whoWith: whoWith.trim() || "—",
      opener, vibe, energy, curveballs: cb, debrief: null,
    };
    const newHistory = [meeting, ...history].slice(0, 50);
    setHistory(newHistory); saveMpc(MPC_KEYS.history, newHistory);
    setCurrentMeetingId(meeting.id);

    const today = new Date().toDateString();
    const newTotal = totalPreps + 1;
    setTotalPreps(newTotal); saveMpc(MPC_KEYS.totalPreps, String(newTotal));
    if (lastPrepDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = lastPrepDate === yesterday ? streak + 1 : 1;
      setStreak(newStreak); saveMpc(MPC_KEYS.streak, String(newStreak));
      setLastPrepDate(today); saveMpc(MPC_KEYS.lastPrepDate, today);
    }
    if (onAwardXP) onAwardXP(10, window.innerWidth / 2, 200);
  };

  const startRehearsal = () => { setRehearsing(true); setRehearsalIndex(0); setRosieNote(null); };

  const buildFullScript = async () => {
    if (scriptLoading) return;
    setScriptLoading(true);
    setScriptError(null);
    const result = await generateFullScript(situation, whoWith, vibe, energy);
    setScriptLoading(false);
    if (!result) {
      setScriptError("Something glitched — try once more?");
      return;
    }
    setFullScript(result);
    setExpandedSections({});
    // Persist the script to the current meeting in history so it shows in expanded view later
    if (currentMeetingId) {
      const updated = history.map(m => m.id === currentMeetingId ? { ...m, fullScript: result } : m);
      setHistory(updated);
      saveMpc(MPC_KEYS.history, updated);
    }
    if (onAwardXP) onAwardXP(5, window.innerWidth / 2, 200);
  };
  const toggleSection = key => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  // Refine prep based on Lexy's conversational request
  const submitRefineRequest = async () => {
    if (!refineInput.trim() || refineLoading) return;
    const userText = refineInput.trim();
    setRefineInput("");
    setRefineHistory(prev => [...prev, { role: "user", text: userText }]);
    setRefineLoading(true);

    const currentState = {
      situation, whoWith, vibe, energy,
      opener: generated || "",
      curveballs,
      fullScript,
    };
    const result = await refineMeetingPrep(currentState, userText);
    setRefineLoading(false);

    if (!result) {
      setRefineHistory(prev => [...prev, { role: "rosie", text: "Something glitched on my end — try again? 💗" }]);
      return;
    }

    // Apply each field if returned
    if (typeof result.opener === "string" && result.opener) {
      setGenerated(result.opener);
      const lines = result.opener.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()) || [result.opener];
      setRehearsalLines(lines);
    }
    if (Array.isArray(result.curveballs)) setCurveballs(result.curveballs);
    if (result.fullScript && typeof result.fullScript === "object") setFullScript(result.fullScript);
    else if (result.fullScript === null) setFullScript(null);

    // Persist to current meeting in history
    if (currentMeetingId) {
      const updated = history.map(m => m.id === currentMeetingId ? {
        ...m,
        opener: result.opener || m.opener,
        curveballs: Array.isArray(result.curveballs) ? result.curveballs : m.curveballs,
        fullScript: result.fullScript !== undefined ? result.fullScript : m.fullScript,
      } : m);
      setHistory(updated);
      saveMpc(MPC_KEYS.history, updated);
    }

    setRefineHistory(prev => [...prev, { role: "rosie", text: result.rosieNote || "Done! Take a look ✨" }]);
    if (onAwardXP) onAwardXP(3, window.innerWidth / 2, 200);
  };

  // Build a script for any meeting in history (not just current one being prepped)
  const [buildingScriptFor, setBuildingScriptFor] = useState(null); // meetingId currently generating
  const buildScriptForMeeting = async meetingId => {
    const m = history.find(x => x.id === meetingId);
    if (!m || buildingScriptFor) return;
    setBuildingScriptFor(meetingId);
    const result = await generateFullScript(
      m.situation === "No description" ? "" : m.situation,
      m.whoWith === "—" ? "" : m.whoWith,
      m.vibe,
      m.energy
    );
    setBuildingScriptFor(null);
    if (!result) return;
    const updated = history.map(x => x.id === meetingId ? { ...x, fullScript: result } : x);
    setHistory(updated);
    saveMpc(MPC_KEYS.history, updated);
    if (onAwardXP) onAwardXP(5, window.innerWidth / 2, 200);
  };

  // Refine any past meeting via conversational request
  const submitHistoryRefine = async meetingId => {
    const userText = (historyRefineInput[meetingId] || "").trim();
    if (!userText || historyRefineLoading) return;
    const m = history.find(x => x.id === meetingId);
    if (!m) return;

    // Clear the input for this meeting
    setHistoryRefineInput(prev => ({ ...prev, [meetingId]: "" }));
    // Append user message
    setHistoryRefineChats(prev => ({
      ...prev,
      [meetingId]: [...(prev[meetingId] || []), { role: "user", text: userText }],
    }));
    setHistoryRefineLoading(meetingId);

    const currentState = {
      situation: m.situation === "No description" ? "" : m.situation,
      whoWith: m.whoWith === "—" ? "" : m.whoWith,
      vibe: m.vibe,
      energy: m.energy,
      opener: m.opener || "",
      curveballs: m.curveballs || [],
      fullScript: m.fullScript || null,
    };
    const result = await refineMeetingPrep(currentState, userText);
    setHistoryRefineLoading(null);

    if (!result) {
      setHistoryRefineChats(prev => ({
        ...prev,
        [meetingId]: [...(prev[meetingId] || []), { role: "rosie", text: "Something glitched — try again? 💗" }],
      }));
      return;
    }

    // Apply and persist to this specific meeting
    const updated = history.map(x => x.id === meetingId ? {
      ...x,
      opener: result.opener || x.opener,
      curveballs: Array.isArray(result.curveballs) ? result.curveballs : x.curveballs,
      fullScript: result.fullScript !== undefined ? result.fullScript : x.fullScript,
    } : x);
    setHistory(updated);
    saveMpc(MPC_KEYS.history, updated);

    setHistoryRefineChats(prev => ({
      ...prev,
      [meetingId]: [...(prev[meetingId] || []), { role: "rosie", text: result.rosieNote || "Done! Take a look ✨" }],
    }));
    if (onAwardXP) onAwardXP(3, window.innerWidth / 2, 200);
  };

  // Script bullet editing — shared between Prep ("current") and History (meetingId)
  const startBulletEdit = (scope, sectionKey, bulletIndex, currentText, meetingId = null) => {
    setEditingBullet({ scope, sectionKey, bulletIndex, meetingId });
    setBulletDraft(currentText);
  };
  const cancelBulletEdit = () => {
    setEditingBullet(null);
    setBulletDraft("");
  };
  // Updates a script — scope: "current" edits live state, scope: "history" edits history
  const updateScriptField = (scope, meetingId, updater) => {
    if (scope === "current") {
      const nextScript = updater(fullScript);
      setFullScript(nextScript);
      if (currentMeetingId) {
        const updated = history.map(m => m.id === currentMeetingId ? { ...m, fullScript: nextScript } : m);
        setHistory(updated);
        saveMpc(MPC_KEYS.history, updated);
      }
    } else {
      const updated = history.map(m => {
        if (m.id !== meetingId) return m;
        return { ...m, fullScript: updater(m.fullScript) };
      });
      setHistory(updated);
      saveMpc(MPC_KEYS.history, updated);
    }
  };
  const commitBulletEdit = () => {
    if (!editingBullet) return;
    const { scope, sectionKey, bulletIndex, meetingId } = editingBullet;
    const trimmed = bulletDraft.trim();
    if (!trimmed) {
      updateScriptField(scope, meetingId, script => {
        if (!script || !script[sectionKey]) return script;
        const bullets = [...(script[sectionKey].bullets || [])];
        bullets.splice(bulletIndex, 1);
        return { ...script, [sectionKey]: { ...script[sectionKey], bullets } };
      });
    } else {
      updateScriptField(scope, meetingId, script => {
        if (!script || !script[sectionKey]) return script;
        const bullets = [...(script[sectionKey].bullets || [])];
        if (bulletIndex >= bullets.length) {
          bullets.push(trimmed);
        } else {
          bullets[bulletIndex] = trimmed;
        }
        return { ...script, [sectionKey]: { ...script[sectionKey], bullets } };
      });
    }
    cancelBulletEdit();
  };
  const deleteBullet = (scope, meetingId, sectionKey, bulletIndex) => {
    updateScriptField(scope, meetingId, script => {
      if (!script || !script[sectionKey]) return script;
      const bullets = [...(script[sectionKey].bullets || [])];
      bullets.splice(bulletIndex, 1);
      return { ...script, [sectionKey]: { ...script[sectionKey], bullets } };
    });
  };
  const addBulletToSection = (scope, meetingId, sectionKey) => {
    const target = scope === "current" ? fullScript : history.find(m => m.id === meetingId)?.fullScript;
    const newIndex = (target?.[sectionKey]?.bullets?.length) || 0;
    updateScriptField(scope, meetingId, script => {
      if (!script || !script[sectionKey]) return script;
      const bullets = [...(script[sectionKey].bullets || []), ""];
      return { ...script, [sectionKey]: { ...script[sectionKey], bullets } };
    });
    setEditingBullet({ scope, sectionKey, bulletIndex: newIndex, meetingId });
    setBulletDraft("");
  };
  const copyFullScript = () => {
    if (!fullScript) return;
    const sections = ["opening", "agenda", "main_points", "transitions", "closing", "if_offtopic", "if_tense"];
    const text = sections.map(key => {
      const s = fullScript[key];
      if (!s) return "";
      return `${s.title.toUpperCase()}\n${(s.bullets || []).map(b => `  • ${b}`).join("\n")}`;
    }).filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied("fullscript");
    setTimeout(() => setCopied(null), 1800);
  };

  // ── Notes handlers ──────────────────────────────────────────────────────────
  const parseNotes = async () => {
    if (!notesInput.trim() || notesLoading) return;
    setNotesLoading(true);
    setNotesError(null);
    setNotesResult(null);
    setNotesActionItemsAdded(false);
    setNotesRemindersAdded(false);

    // Build context from attached meeting if there is one
    const attachedMeeting = history.find(m => m.id === Number(notesAttachTo));
    const attendeesTrimmed = notesAttendees.trim();
    const contextParts = [];
    if (attachedMeeting) {
      contextParts.push(`Meeting with ${attachedMeeting.whoWith || "colleagues"}. Situation: ${attachedMeeting.situation || "(unspecified)"}`);
    } else if (notesStandaloneTitle.trim()) {
      contextParts.push(`Meeting: ${notesStandaloneTitle.trim()}`);
    }
    if (attendeesTrimmed) {
      contextParts.push(`Attendees: ${attendeesTrimmed}. When attributing action items, use these names where the notes refer to them by first name only.`);
    }
    const context = contextParts.join(" ");

    const result = await parseMeetingNotes(notesInput.trim(), context);
    setNotesLoading(false);
    if (!result) {
      setNotesError("Something glitched — try once more?");
      return;
    }
    setNotesResult(result);

    // Default-check all of Lexy's action items + all reminders so "Add all" is one click,
    // but uncheck-to-skip is now possible.
    const myItemIndexes = (result.actionItems || [])
      .map((a, i) => (a.owner === "me" ? i : -1))
      .filter(i => i >= 0);
    setNotesActionItemsSelected(new Set(myItemIndexes));
    const reminderIndexes = (result.reminders || []).map((_, i) => i);
    setNotesRemindersSelected(new Set(reminderIndexes));

    // Save the note entry — ALWAYS persist to history, either to the attached meeting
    // or as a synthetic "standalone" history entry (so the user can find it later).
    const standaloneTitleTrimmed = notesStandaloneTitle.trim();
    const noteEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      rawNotes: notesInput.trim(),
      parsed: result,
      attachedMeetingId: attachedMeeting ? attachedMeeting.id : null,
      attachedMeetingLabel: attachedMeeting
        ? (attachedMeeting.whoWith !== "—" ? `Meeting with ${attachedMeeting.whoWith}` : "Meeting")
        : (standaloneTitleTrimmed || "Standalone note"),
      standaloneTitle: attachedMeeting ? null : (standaloneTitleTrimmed || null),
      attendees: attendeesTrimmed || null,
    };
    setNotesCurrentId(noteEntry.id);

    if (attachedMeeting) {
      // Append note to the attached meeting in history
      const updated = history.map(m => m.id === attachedMeeting.id
        ? { ...m, notes: [...(m.notes || []), noteEntry] }
        : m
      );
      setHistory(updated);
      saveMpc(MPC_KEYS.history, updated);
    } else {
      // Standalone — create a synthetic history entry so the note shows up in the
      // History tab and isn't lost. Uses the user's title if provided, else a default.
      const syntheticMeeting = {
        id: noteEntry.id,
        date: noteEntry.date,
        title: standaloneTitleTrimmed || "Standalone note",
        situation: result.summary || "Notes-only entry (no prep)",
        whoWith: "—",
        opener: null,
        vibe: "warm",
        energy: "normal",
        curveballs: [],
        debrief: null,
        notes: [noteEntry],
        isStandaloneNotes: true, // marker so History can style/filter
      };
      const updated = [syntheticMeeting, ...history].slice(0, 50);
      setHistory(updated);
      saveMpc(MPC_KEYS.history, updated);
    }

    if (onAwardXP) onAwardXP(10, window.innerWidth / 2, 200);
  };

  // Add the user-selected action items to the Work Hub. Only "me"-owned items
  // can be selected; non-"me" items are reference-only and not addable.
  const addSelectedActionItems = () => {
    if (!notesResult || !data || !onUpdateData) return;
    const picked = (notesResult.actionItems || [])
      .map((a, i) => ({ a, i }))
      .filter(({ a, i }) => a.owner === "me" && notesActionItemsSelected.has(i))
      .map(({ a }) => a);
    if (!picked.length) return;

    const attachedMeeting = history.find(m => m.id === Number(notesAttachTo));
    const sourceTag = attachedMeeting
      ? `📝 from ${attachedMeeting.title || (attachedMeeting.whoWith !== "—" ? attachedMeeting.whoWith : "meeting")} (${new Date(attachedMeeting.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })})`
      : `📝 from ${notesStandaloneTitle.trim() || "meeting"} ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

    let workingItems = [...(data.items || [])];
    const newItems = picked.map(a => {
      const scheduledDate = estimateDateForNewItem(a.priority || "medium", workingItems);
      const newItem = {
        id: uid(),
        title: a.title,
        priority: a.priority || "medium",
        status: "todo",
        why: a.why || sourceTag,
        tasks: Array.isArray(a.tasks) ? a.tasks : [],
        taskTimes: Array.isArray(a.tasks) ? a.tasks.map(() => 15) : [],
        completedTasks: [],
        category: "",
        done: "",
        outOfScope: "",
        notes: a.dueHint ? `Due hint from meeting: ${a.dueHint}\n\n${sourceTag}` : sourceTag,
        timeEstimate: "",
        scheduledDate,
        dateSource: "estimated",
        dateFixed: false,
        createdAt: Date.now(),
      };
      workingItems.push(newItem);
      return newItem;
    });
    onUpdateData({ ...data, items: [...(data.items || []), ...newItems] });
    setNotesActionItemsAdded(true);
    setNotesAddedFlash(`${picked.length} ${picked.length === 1 ? "item" : "items"} added to Work Hub`);
    setTimeout(() => setNotesAddedFlash(null), 4000);
    fireConfetti();
    if (onAwardXP) onAwardXP(Math.min(5, picked.length * 2), window.innerWidth / 2, 200);
  };

  // Add the user-selected reminders to data.reminders.
  const addSelectedReminders = () => {
    if (!notesResult || !data || !onUpdateData) return;
    const picked = (notesResult.reminders || [])
      .map((r, i) => ({ r, i }))
      .filter(({ i }) => notesRemindersSelected.has(i))
      .map(({ r }) => r);
    if (!picked.length) return;

    const newReminders = picked.map(r => ({
      id: uid(),
      text: r.when ? `${r.text}${r.text.endsWith(".") ? "" : ""} (${r.when})` : r.text,
      type: "quick",
      itemId: "",
      recurring: "",
      time: "",
      dismissed: false,
      createdAt: Date.now(),
      suggested: true, // mark as Rosie-sourced
    }));
    onUpdateData({ ...data, reminders: [...(data.reminders || []), ...newReminders] });
    setNotesRemindersAdded(true);
    setNotesAddedFlash(`${picked.length} ${picked.length === 1 ? "reminder" : "reminders"} added`);
    setTimeout(() => setNotesAddedFlash(null), 4000);
    if (onAwardXP) onAwardXP(Math.min(3, picked.length), window.innerWidth / 2, 200);
  };

  const clearNotes = () => {
    setNotesInput("");
    setNotesResult(null);
    setNotesError(null);
    setNotesAttachTo("");
    setNotesStandaloneTitle("");
    setNotesAttendees("");
    setNotesCurrentId(null);
    setNotesAddedFlash(null);
    setNotesActionItemsSelected(new Set());
    setNotesRemindersSelected(new Set());
    setNotesActionItemsAdded(false);
    setNotesRemindersAdded(false);
  };

  const finishRehearsal = () => {
    setRehearsing(false);
    fireConfetti();
    setRosieNote(mpcPick(MPC_CELEBRATE));
    setTimeout(() => setDebriefOpen(true), 1000);
  };
  const saveDebrief = () => {
    if (!currentMeetingId) { setDebriefOpen(false); return; }
    const updated = history.map(m => m.id === currentMeetingId ? { ...m, debrief: { feeling: debriefFeeling, win: debriefWin, savedAt: new Date().toISOString() } } : m);
    setHistory(updated); saveMpc(MPC_KEYS.history, updated);
    setDebriefOpen(false); setDebriefFeeling(""); setDebriefWin("");
    setRosieNote("Saved to your wins. Look at you collecting moments. 🌸");
  };
  const toggleFavorite = id => {
    const next = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id];
    setFavorites(next); saveMpc(MPC_KEYS.favorites, next);
  };
  const saveOpenerFavorite = () => {
    if (!generated) return;
    const newFav = { id: Date.now(), text: generated, date: new Date().toISOString(), situation: situation || "—" };
    const next = [newFav, ...favoriteOpeners].slice(0, 20);
    setFavoriteOpeners(next); saveMpc(MPC_KEYS.favoriteOpeners, next);
    setRosieNote("Saved! Find it in Library → Openers. 💗");
  };
  const deleteMeeting = id => {
    // Meetings can live in TWO places: MPC `history` (from Prep flow) or
    // `data.meetings` (created from the roadmap). Strip from whichever
    // source it actually lives in — and from both if it somehow lives in
    // both. No window.confirm here — that's blocked in the artifact iframe.
    // The confirmation gesture is the two-step click pattern via requestDelete.
    const fromHistory = (history || []).find(m => m.id === id);
    const fromMeetings = (data?.meetings || []).find(m => m.id === id);
    if (!fromHistory && !fromMeetings) return;
    if (fromHistory) {
      const next = history.filter(m => m.id !== id);
      setHistory(next); saveMpc(MPC_KEYS.history, next);
    }
    if (fromMeetings && onUpdateData && data) {
      onUpdateData({ ...data, meetings: (data.meetings || []).filter(m => m.id !== id) });
    }
  };

  // Two-step inline delete confirmation — replaces window.confirm() which is
  // blocked inside the artifact iframe. First click arms `pendingDeleteId`
  // and the Delete button flips to a red "Click again to confirm" state;
  // second click within 3 seconds actually fires deleteMeeting. After the
  // timeout (or another row arming) the pending state clears automatically.
  const pendingDeleteTimerRef = useRef(null);
  const requestDelete = (id) => {
    if (pendingDeleteId === id) {
      if (pendingDeleteTimerRef.current) clearTimeout(pendingDeleteTimerRef.current);
      pendingDeleteTimerRef.current = null;
      setPendingDeleteId(null);
      deleteMeeting(id);
      return;
    }
    if (pendingDeleteTimerRef.current) clearTimeout(pendingDeleteTimerRef.current);
    setPendingDeleteId(id);
    pendingDeleteTimerRef.current = setTimeout(() => {
      setPendingDeleteId(null);
      pendingDeleteTimerRef.current = null;
    }, 3000);
  };

  // Meeting edit handlers
  const startMeetingEdit = (meetingId, field, currentValue, path = null) => {
    setEditingMeetingField({ meetingId, field, path });
    setMeetingFieldDraft(currentValue || "");
  };
  const cancelMeetingEdit = () => {
    setEditingMeetingField(null);
    setMeetingFieldDraft("");
  };
  const commitMeetingEdit = () => {
    if (!editingMeetingField) return;
    const { meetingId, field, path } = editingMeetingField;
    const trimmed = meetingFieldDraft.trim();
    const next = history.map(m => {
      if (m.id !== meetingId) return m;
      const updated = { ...m };
      if (!path) {
        // Top-level field: title, situation, whoWith, opener
        updated[field] = trimmed;
      } else if (path.startsWith("debrief.")) {
        const key = path.split(".")[1];
        updated.debrief = { ...(m.debrief || {}), [key]: trimmed };
      } else if (path.startsWith("note:")) {
        // path format: "note:<noteId>:<field>"  (field can be "rawNotes", "parsed.summary")
        const [, noteId, ...rest] = path.split(":");
        const notePath = rest.join(":");
        updated.notes = (m.notes || []).map(n => {
          if (String(n.id) !== String(noteId)) return n;
          if (notePath === "rawNotes") return { ...n, rawNotes: trimmed };
          if (notePath === "parsed.summary") return { ...n, parsed: { ...(n.parsed || {}), summary: trimmed } };
          return n;
        });
      }
      return updated;
    });
    setHistory(next);
    saveMpc(MPC_KEYS.history, next);
    cancelMeetingEdit();
  };
  // Delete a logged note from a meeting
  const deleteNoteFromMeeting = (meetingId, noteId) => {
    const next = history.map(m => m.id !== meetingId ? m : { ...m, notes: (m.notes || []).filter(n => String(n.id) !== String(noteId)) });
    setHistory(next);
    saveMpc(MPC_KEYS.history, next);
  };
  // Remove an action item from a parsed note (e.g. if Rosie misassigned it)
  const removeNoteItem = (meetingId, noteId, category, index) => {
    const next = history.map(m => {
      if (m.id !== meetingId) return m;
      return {
        ...m,
        notes: (m.notes || []).map(n => {
          if (String(n.id) !== String(noteId)) return n;
          const parsed = { ...(n.parsed || {}) };
          if (Array.isArray(parsed[category])) {
            parsed[category] = parsed[category].filter((_, i) => i !== index);
          }
          return { ...n, parsed };
        }),
      };
    });
    setHistory(next);
    saveMpc(MPC_KEYS.history, next);
  };
  const resetAll = async () => {
    try { await Promise.all(Object.values(MPC_KEYS).map(k => window.storage.delete(k).catch(() => null))); } catch (e) {}
    setHistory([]); setFavorites([]); setFavoriteOpeners([]); setStreak(0); setLastPrepDate(null); setTotalPreps(0);
    setResetConfirm(false); setRosieNote("Fresh start. Whenever you're ready. 🌸"); setMoreView("menu");
  };
  const copy = (text, key) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 1800); };

  const formatDate = iso => {
    const d = new Date(iso);
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const checklistItems = [
    { key: "water", label: "Water within reach" },
    { key: "bathroom", label: "Bathroom break handled" },
    { key: "notecard", label: "Notecard with 3 bullets" },
    { key: "phone", label: "Phone silenced or away" },
    { key: "breath", label: "One slow breath taken" },
  ];
  const checklistDone = Object.values(checklist).filter(Boolean).length;

  const pill = (active, color = "#d4829a") => ({
    padding: "9px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: active ? 600 : 500,
    background: active ? `linear-gradient(135deg, ${color}, #b86d85)` : "transparent",
    color: active ? "#fff" : "rgba(74,53,64,0.6)",
    transition: "all .2s", boxShadow: active ? "0 2px 8px rgba(212,130,154,0.25)" : "none",
  });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* ← back to Work Hub — FocusView-style nav. Meetings is a place you go
          INTO from Work Hub, with one clear way back. Tab strip is intentionally
          NOT rendered here — Work Hub stays the "home" with full tab nav, and
          secondary places (Meetings, Email & Teams) feel like in-and-out trips. */}
      {setAppTab && (
        <button
          onClick={() => setAppTab("work")}
          className="jost"
          style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(212,130,154,0.25)", borderRadius: 8, padding: "5px 12px", fontSize: 11, color: "#b86d85", cursor: "pointer", fontWeight: 500, marginBottom: 14 }}
        >← back to Work Hub</button>
      )}

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div className="jost" style={{ fontSize: 10, letterSpacing: 3, color: "rgba(212,130,154,0.85)", textTransform: "uppercase", marginBottom: 6 }}>🌸 meetings with rosie</div>
        <h1 className="cg" style={{ fontSize: 38, fontStyle: "italic", color: "#4a3540", fontWeight: 400, lineHeight: 1.1, marginBottom: 4 }}>Tell me the situation <span style={{ color: "#c4a882" }}>✦</span></h1>
        <p className="jost" style={{ fontSize: 13, color: "rgba(74,53,64,0.55)", fontStyle: "italic" }}>I'll get you ready, babe.</p>
      </div>

      {/* Day-state cluster: mood + re-check in + roadmap log (mirrors Today tab) */}
      {(appEnergy || appMood) && (() => {
        const energyObj = ENERGY_LEVELS.find(e => e.key === appEnergy) || ENERGY_LEVELS[1];
        const moodObj = MOODS.find(m => m.key === appMood);
        return (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center", background: `${energyObj.color}15`, border: `1px solid ${energyObj.color}40`, borderRadius: 20, padding: "5px 12px" }}>
              <span style={{ fontSize: 16 }}>{energyObj.emoji}</span>
              {moodObj && <span style={{ fontSize: 16 }}>{moodObj.emoji}</span>}
              <span className="jost" style={{ fontSize: 12, color: energyObj.color, fontWeight: 500 }}>{energyObj.label}</span>
            </div>
            {onReCheckIn && (
              <button
                onClick={onReCheckIn}
                title="Re-check in to update your energy & mood"
                className="btn ghost jost"
                style={{ fontSize: 11, padding: "5px 12px" }}
              >Re-check in</button>
            )}
            {onShowRoadmapLog && false /* Roadmap log pill removed — roadmap history lives on Work Hub via More menu */ && (
              <button
                onClick={onShowRoadmapLog}
                title={(data.roadmapHistory || []).length > 0 ? "View past roadmaps & restore one" : "No past roadmaps yet"}
                className="jost"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(212,130,154,0.25)", color: "#b86d85", fontSize: 11, padding: "5px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}
              >📜 Roadmap log{(data.roadmapHistory || []).length > 0 ? ` (${(data.roadmapHistory || []).length})` : ""}</button>
            )}
            {/* History pill moved to the sub-tab row (between Notes and More). */}
          </div>
        );
      })()}

      {/* Stats row */}
      {loaded && (totalPreps > 0 || streak > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div className="card" style={{ padding: "12px 8px", textAlign: "center" }}>
            <Flame size={16} color="#d4829a" style={{ marginBottom: 4 }} />
            <div className="jost" style={{ fontSize: 20, fontWeight: 600, color: "#4a3540" }}>{streak}</div>
            <div className="jost" style={{ fontSize: 9, color: "rgba(74,53,64,0.4)", letterSpacing: 1.5, textTransform: "uppercase" }}>day streak</div>
          </div>
          <div className="card" style={{ padding: "12px 8px", textAlign: "center" }}>
            <Trophy size={16} color="#c4a882" style={{ marginBottom: 4 }} />
            <div className="jost" style={{ fontSize: 20, fontWeight: 600, color: "#4a3540" }}>{totalPreps}</div>
            <div className="jost" style={{ fontSize: 9, color: "rgba(74,53,64,0.4)", letterSpacing: 1.5, textTransform: "uppercase" }}>prepped</div>
          </div>
          <div className="card" style={{ padding: "12px 8px", textAlign: "center" }}>
            <Award size={16} color="#9eb89a" style={{ marginBottom: 4 }} />
            <div className="jost" style={{ fontSize: 20, fontWeight: 600, color: "#4a3540" }}>{history.filter(m => m.debrief).length}</div>
            <div className="jost" style={{ fontSize: 9, color: "rgba(74,53,64,0.4)", letterSpacing: 1.5, textTransform: "uppercase" }}>wins</div>
          </div>
        </div>
      )}

      {/* Panic button */}
      <button className="btn jost" onClick={() => setPanicMode(true)} style={{ width: "100%", padding: "11px", background: "linear-gradient(135deg, rgba(212,130,154,0.15), rgba(232,160,180,0.2))", border: "1px solid rgba(212,130,154,0.3)", borderRadius: 10, fontSize: 12, fontWeight: 600, color: "#b86d85", cursor: "pointer", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <AlertCircle size={14} /> Meeting in 2 minutes? Tap here
      </button>

      {/* Sub-tab switcher */}
      <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.6)", border: "1px solid rgba(212,130,154,0.15)", borderRadius: 12, padding: 4, marginBottom: 16 }}>
        {[
          { id: "prep", label: "Prep", icon: Sparkles },
          { id: "library", label: "Library", icon: BookOpen },
          { id: "notes", label: "Notes", icon: FileText },
          { id: "threads", label: "Threads", icon: MessageCircle },
          { id: "history", label: "History", icon: HistoryIcon },
          { id: "more", label: "More", icon: MoreHorizontal },
        ].map(({ id, label, icon: Icon }) => {
          const isActive = subtab === id;
          const threadCount = (data?.runningThreads || []).reduce((a, t) => a + (t.entries?.filter(e => !e.reviewedAt).length || 0), 0);
          return (
            <button key={id} className="jost" onClick={() => {
              setSubtab(id);
              if (id === "more") setMoreView("menu");
            }} style={{ flex: 1, padding: "10px 6px", borderRadius: 9, border: "none", background: isActive ? "linear-gradient(135deg,#d4829a,#b86d85)" : "transparent", color: isActive ? "#fff" : "rgba(74,53,64,0.6)", cursor: "pointer", fontSize: 12, fontWeight: isActive ? 600 : 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .2s" }}>
              <Icon size={13} /> {label}{id === "history" && history.length > 0 ? ` (${history.length})` : ""}{id === "threads" && threadCount > 0 ? ` (${threadCount})` : ""}
            </button>
          );
        })}
      </div>

      {/* Rosie inline note */}
      {rosieNote && !rehearsing && (
        <div className="card fade" style={{ padding: "12px 14px", marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 10, borderLeft: "3px solid #d4829a" }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🌸</span>
          <div className="jost" style={{ flex: 1, fontSize: 13, lineHeight: 1.5, color: "rgba(74,53,64,0.8)" }}>
            <span style={{ fontWeight: 600, color: "#b86d85" }}>Rosie: </span>{rosieNote}
          </div>
          <button onClick={() => setRosieNote(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(74,53,64,0.3)", padding: 0 }}><X size={14} /></button>
        </div>
      )}

      {/* PREP — combines former "Prep" + "1:1" into one tab with a mode toggle */}
      {subtab === "prep" && (
        <>
          {/* Mode toggle: meeting prep vs 1:1 prep */}
          <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.6)", border: "1px solid rgba(212,130,154,0.15)", borderRadius: 10, padding: 4, marginBottom: 12 }}>
            <button
              onClick={() => setPrepMode("meeting")}
              className="jost"
              style={{ flex: 1, padding: "8px 10px", borderRadius: 7, border: "none", background: prepMode === "meeting" ? "linear-gradient(135deg,#d4829a,#b86d85)" : "transparent", color: prepMode === "meeting" ? "#fff" : "rgba(74,53,64,0.6)", cursor: "pointer", fontSize: 12, fontWeight: prepMode === "meeting" ? 600 : 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .2s" }}
            >
              <Sparkles size={12} /> Meeting prep
            </button>
            <button
              onClick={() => setPrepMode("oneonone")}
              className="jost"
              style={{ flex: 1, padding: "8px 10px", borderRadius: 7, border: "none", background: prepMode === "oneonone" ? "linear-gradient(135deg,#d4829a,#b86d85)" : "transparent", color: prepMode === "oneonone" ? "#fff" : "rgba(74,53,64,0.6)", cursor: "pointer", fontSize: 12, fontWeight: prepMode === "oneonone" ? 600 : 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .2s" }}
            >
              <MessageCircle size={12} /> 1:1 with Josh
            </button>
          </div>
        </>
      )}

      {/* MEETING PREP — original prep flow (now under the "Meeting prep" mode) */}
      {subtab === "prep" && prepMode === "meeting" && (
        <>
          <div className="card" style={{ padding: "18px 20px", marginBottom: 12 }}>
            <label className="sl jost">How are you doing today?</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
              {Object.entries(MPC_ENERGY).map(([key, e]) => {
                const Icon = e.icon;
                return (
                  <button key={key} onClick={() => setEnergy(key)} className="jost" style={{ padding: "12px 6px", borderRadius: 10, border: energy === key ? "2px solid #d4829a" : "1px solid rgba(212,130,154,0.15)", background: energy === key ? "rgba(212,130,154,0.08)" : "rgba(255,255,255,0.5)", cursor: "pointer", textAlign: "center", fontFamily: "inherit", transition: "all .2s" }}>
                    <Icon size={14} color="#d4829a" style={{ marginBottom: 4 }} />
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#4a3540" }}>{e.label}</div>
                    <div style={{ fontSize: 10, color: "rgba(74,53,64,0.4)", fontStyle: "italic", marginTop: 2 }}>{e.note}</div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="card" style={{ padding: "18px 20px", marginBottom: 12 }}>
            <label className="sl jost">Tone</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
              {Object.entries(MPC_VIBES).map(([key, v]) => (
                <button key={key} onClick={() => setVibe(key)} className="jost" style={{ padding: "10px 6px", borderRadius: 10, border: vibe === key ? "2px solid #d4829a" : "1px solid rgba(212,130,154,0.15)", background: vibe === key ? "rgba(212,130,154,0.08)" : "rgba(255,255,255,0.5)", cursor: "pointer", textAlign: "center", fontFamily: "inherit", transition: "all .2s" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#4a3540" }}>{v.label}</div>
                  <div style={{ fontSize: 10, color: "rgba(74,53,64,0.4)", fontStyle: "italic", marginTop: 2 }}>{v.note}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: "20px 22px" }}>
            {!rehearsing ? (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label className="sl jost">Meeting title <span style={{ textTransform: "none", letterSpacing: 0.5, color: "rgba(74,53,64,0.35)", fontWeight: 400 }}>(helps you find it later)</span></label>
                  <input className="ifield jost" value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} placeholder="e.g. Arkatechture kickoff, Weekly status with Karen" />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label className="sl jost">Tell Rosie the situation</label>
                  <textarea className="ifield jost" value={situation} onChange={e => setSituation(e.target.value)} placeholder="e.g. Kickoff with a new vendor. I'm nervous because I haven't met them." style={{ minHeight: 80, resize: "vertical", lineHeight: 1.5 }} />
                  <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.4)", fontStyle: "italic", marginTop: 6 }}>The more detail, the better I can help 💗</div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="sl jost">Who's the meeting with? (optional)</label>
                  <input className="ifield jost" value={whoWith} onChange={e => setWhoWith(e.target.value)} placeholder="e.g. Sarah, leadership, the vendor team" />
                </div>
                <button className="btn rose jost" onClick={generate} style={{ width: "100%", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Sparkles size={14} /> Generate my prep
                </button>

                {generated && (
                  <div className="fade" style={{ marginTop: 18, padding: "18px 20px", background: "rgba(255,252,245,0.8)", border: "1px solid rgba(212,130,154,0.25)", borderRadius: 12 }}>
                    <div className="sl jost" style={{ marginBottom: 8 }}>Your opener</div>
                    <p className="cg" style={{ fontSize: 17, lineHeight: 1.65, color: "#4a3540", margin: 0, fontStyle: "italic" }}>"{generated}"</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
                      <button className="btn rose jost" onClick={startRehearsal} style={{ fontSize: 11, padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 5 }}><Play size={11} /> Rehearse</button>
                      <button className="btn ghost jost" onClick={() => copy(generated, "gen")} style={{ fontSize: 11, padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 5 }}>
                        {copied === "gen" ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                      </button>
                      <button className="btn ghost jost" onClick={generate} style={{ fontSize: 11, padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 5 }}><RefreshCw size={11} /> New version</button>
                      <button className="btn ghost jost" onClick={saveOpenerFavorite} style={{ fontSize: 11, padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 5 }}><Star size={11} /> Save</button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "10px 4px" }}>
                <div className="sl jost" style={{ marginBottom: 6 }}>Rehearsal — line {rehearsalIndex + 1} of {rehearsalLines.length}</div>
                <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 20 }}>
                  {rehearsalLines.map((_, i) => (
                    <div key={i} style={{ width: 28, height: 4, borderRadius: 2, background: i <= rehearsalIndex ? "#d4829a" : "rgba(212,130,154,0.2)", transition: "background .3s" }} />
                  ))}
                </div>
                <div key={rehearsalIndex} className="fade" style={{ minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 14px", background: "rgba(253,240,245,0.6)", borderRadius: 12, border: "1px solid rgba(212,130,154,0.2)", marginBottom: 18 }}>
                  <p className="cg" style={{ fontSize: 22, lineHeight: 1.5, color: "#4a3540", margin: 0, fontStyle: "italic" }}>"{rehearsalLines[rehearsalIndex]}"</p>
                </div>
                <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.4)", fontStyle: "italic", marginBottom: 14 }}>Say it out loud. No rush. Rosie's right here. 🌸</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  <button className="btn ghost jost" disabled={rehearsalIndex === 0} onClick={() => setRehearsalIndex(i => i - 1)} style={{ fontSize: 12, padding: "6px 12px", opacity: rehearsalIndex === 0 ? 0.3 : 1, display: "inline-flex", alignItems: "center", gap: 5 }}><ChevronLeft size={12} /> Back</button>
                  {rehearsalIndex < rehearsalLines.length - 1 ? (
                    <button className="btn rose jost" onClick={() => setRehearsalIndex(i => i + 1)} style={{ fontSize: 12, padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: 5 }}>Next <ChevronRight size={12} /></button>
                  ) : (
                    <button className="btn rose jost" onClick={finishRehearsal} style={{ fontSize: 12, padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: 5 }}><Check size={12} /> I'm ready</button>
                  )}
                  <button className="btn ghost jost" onClick={() => setRehearsing(false)} style={{ fontSize: 12, padding: "6px 12px" }}>Exit</button>
                </div>
              </div>
            )}
          </div>

          {curveballs.length > 0 && !rehearsing && (
            <div className="card" style={{ padding: "18px 20px", marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Shield size={16} color="#d4829a" />
                <div className="cg" style={{ fontSize: 17, fontWeight: 600, color: "#4a3540" }}>What if they say...</div>
              </div>
              <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.45)", fontStyle: "italic", marginBottom: 12 }}>So nothing catches you off guard 💗</div>
              {curveballs.map((c, i) => (
                <div key={i} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.5)", borderLeft: "3px solid #e8a0b4", borderRadius: 8, marginBottom: 8 }}>
                  <div className="jost" style={{ fontSize: 13, fontWeight: 600, color: "#b86d85", marginBottom: 5 }}>{c.q}</div>
                  <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.75)", lineHeight: 1.55 }}>{c.a}</div>
                </div>
              ))}
            </div>
          )}

          {/* FULL MEETING SCRIPT — AI generated, inline, below curveballs */}
          {generated && !rehearsing && (
            <div className="card" style={{ padding: "20px 22px", marginTop: 12, background: "linear-gradient(135deg, rgba(255,252,245,0.95), rgba(253,245,240,0.8))", borderColor: "rgba(196,168,130,0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Sparkles size={16} color="#c4a882" />
                  <div className="cg" style={{ fontSize: 18, fontWeight: 600, color: "#4a3540" }}>Full meeting script</div>
                </div>
                {fullScript && !scriptLoading && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn ghost jost" onClick={copyFullScript} style={{ fontSize: 10, padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {copied === "fullscript" ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy all</>}
                    </button>
                    <button className="btn ghost jost" onClick={buildFullScript} style={{ fontSize: 10, padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <RefreshCw size={10} /> Regenerate
                    </button>
                  </div>
                )}
              </div>
              <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.5)", fontStyle: "italic", marginBottom: 14 }}>
                The whole arc — opening to closing, plus what to do when things go sideways 🌸
              </div>

              {!fullScript && !scriptLoading && (
                <button
                  className="btn jost"
                  onClick={buildFullScript}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "linear-gradient(135deg, #d6c098, #b89868)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "0 3px 12px rgba(180,140,90,0.3)",
                  }}
                >
                  <Sparkles size={14} /> Build my full script
                </button>
              )}

              {scriptLoading && (
                <div style={{ padding: "24px", textAlign: "center" }}>
                  <div className="pulse jost" style={{ fontSize: 12, color: "rgba(180,140,90,0.7)", letterSpacing: 1 }}>
                    ✨ Rosie's writing your script…
                  </div>
                  <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.35)", fontStyle: "italic", marginTop: 6 }}>
                    tailoring it to your {MPC_VIBES[vibe].label.toLowerCase()} tone + {MPC_ENERGY[energy].label.toLowerCase()} energy
                  </div>
                </div>
              )}

              {scriptError && (
                <div style={{ padding: "12px 14px", background: "rgba(212,100,120,0.06)", borderLeft: "3px solid rgba(212,100,120,0.4)", borderRadius: 8 }}>
                  <div className="jost" style={{ fontSize: 12, color: "rgba(196,100,120,0.85)", marginBottom: 6 }}>{scriptError}</div>
                  <button className="btn ghost jost" onClick={buildFullScript} style={{ fontSize: 11, padding: "4px 10px" }}>Try again</button>
                </div>
              )}

              {fullScript && !scriptLoading && (
                <div>
                  {/* Main arc — always visible */}
                  {["opening", "agenda", "main_points", "transitions", "closing"].map(key => {
                    const section = fullScript[key];
                    if (!section) return null;
                    return (
                      <div key={key} style={{ marginBottom: 14, paddingBottom: 12, borderBottom: "1px dashed rgba(196,168,130,0.2)" }}>
                        <div className="jost" style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#9a7850", fontWeight: 600, marginBottom: 8 }}>
                          {section.title}
                        </div>
                        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                          {(section.bullets || []).map((b, i) => {
                            const isEditing = editingBullet?.scope === "current" && editingBullet?.sectionKey === key && editingBullet?.bulletIndex === i;
                            return (
                              <li key={i} className="jost" style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(74,53,64,0.85)", padding: "4px 0 4px 16px", position: "relative", display: "flex", alignItems: "flex-start", gap: 6 }}>
                                <span style={{ position: "absolute", left: 0, top: 11, width: 5, height: 5, borderRadius: "50%", background: "#c4a882" }} />
                                {isEditing ? (
                                  <textarea
                                    autoFocus
                                    className="jost"
                                    value={bulletDraft}
                                    onChange={e => setBulletDraft(e.target.value)}
                                    onBlur={commitBulletEdit}
                                    onKeyDown={e => { if (e.key === "Escape") cancelBulletEdit(); if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitBulletEdit(); } }}
                                    style={{ flex: 1, fontSize: 13, lineHeight: 1.5, background: "rgba(255,255,255,0.95)", border: "1px solid rgba(196,168,130,0.45)", borderRadius: 6, padding: "4px 8px", outline: "none", fontFamily: "'Jost', sans-serif", color: "#4a3540", resize: "vertical", minHeight: 28 }}
                                  />
                                ) : (
                                  <>
                                    <span
                                      onClick={() => startBulletEdit("current", key, i, b)}
                                      title="Click to edit — empty to delete"
                                      style={{ flex: 1, cursor: "text", padding: "2px 4px", marginLeft: -4, borderRadius: 4, transition: "background .15s" }}
                                      onMouseEnter={e => e.currentTarget.style.background = "rgba(196,168,130,0.08)"}
                                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                      {b}
                                    </span>
                                    <button
                                      onClick={() => deleteBullet("current", null, key, i)}
                                      title="Delete bullet"
                                      style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(196,168,130,0.4)", padding: "2px 6px", fontSize: 12, lineHeight: 1, opacity: 0.6 }}
                                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                      onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
                                    >×</button>
                                  </>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                        <button
                          onClick={() => addBulletToSection("current", null, key)}
                          className="jost"
                          style={{ background: "none", border: "none", color: "rgba(196,168,130,0.55)", cursor: "pointer", fontSize: 11, padding: "4px 0 0 16px", fontStyle: "italic", fontFamily: "'Jost', sans-serif" }}
                        >+ add bullet</button>
                      </div>
                    );
                  })}

                  {/* Optional "when things go sideways" sections — collapsed by default */}
                  <div className="jost" style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(74,53,64,0.4)", fontWeight: 600, marginTop: 6, marginBottom: 8 }}>
                    When things go sideways
                  </div>
                  {["if_offtopic", "if_tense"].map(key => {
                    const section = fullScript[key];
                    if (!section) return null;
                    const open = !!expandedSections[key];
                    const color = key === "if_tense" ? "#c4687a" : "#9878b8";
                    const bg = key === "if_tense" ? "rgba(212,100,120,0.06)" : "rgba(184,160,212,0.06)";
                    const border = key === "if_tense" ? "rgba(212,100,120,0.25)" : "rgba(184,160,212,0.25)";
                    return (
                      <div key={key} style={{ marginBottom: 8, border: `1px solid ${border}`, borderRadius: 10, background: bg, overflow: "hidden" }}>
                        <button
                          onClick={() => toggleSection(key)}
                          className="jost"
                          style={{ width: "100%", padding: "10px 14px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "inherit", textAlign: "left" }}
                        >
                          <span style={{ fontSize: 12, fontWeight: 600, color, letterSpacing: 0.3 }}>
                            {key === "if_tense" ? "⚠️" : "💭"} {section.title}
                          </span>
                          <span style={{ color, fontSize: 14, opacity: 0.7, fontWeight: 600 }}>{open ? "−" : "+"}</span>
                        </button>
                        {open && (
                          <div className="fade" style={{ padding: "0 14px 12px" }}>
                            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                              {(section.bullets || []).map((b, i) => {
                                const isEditing = editingBullet?.scope === "current" && editingBullet?.sectionKey === key && editingBullet?.bulletIndex === i;
                                return (
                                  <li key={i} className="jost" style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(74,53,64,0.85)", padding: "4px 0 4px 16px", position: "relative", display: "flex", alignItems: "flex-start", gap: 6 }}>
                                    <span style={{ position: "absolute", left: 0, top: 11, width: 5, height: 5, borderRadius: "50%", background: color }} />
                                    {isEditing ? (
                                      <textarea
                                        autoFocus
                                        className="jost"
                                        value={bulletDraft}
                                        onChange={e => setBulletDraft(e.target.value)}
                                        onBlur={commitBulletEdit}
                                        onKeyDown={e => { if (e.key === "Escape") cancelBulletEdit(); if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitBulletEdit(); } }}
                                        style={{ flex: 1, fontSize: 13, lineHeight: 1.5, background: "rgba(255,255,255,0.95)", border: `1px solid ${color}60`, borderRadius: 6, padding: "4px 8px", outline: "none", fontFamily: "'Jost', sans-serif", color: "#4a3540", resize: "vertical", minHeight: 28 }}
                                      />
                                    ) : (
                                      <>
                                        <span
                                          onClick={() => startBulletEdit("current", key, i, b)}
                                          title="Click to edit"
                                          style={{ flex: 1, cursor: "text", padding: "2px 4px", marginLeft: -4, borderRadius: 4, transition: "background .15s" }}
                                          onMouseEnter={e => e.currentTarget.style.background = `${bg}`}
                                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                        >
                                          {b}
                                        </span>
                                        <button
                                          onClick={() => deleteBullet("current", null, key, i)}
                                          title="Delete bullet"
                                          style={{ background: "none", border: "none", cursor: "pointer", color, padding: "2px 6px", fontSize: 12, lineHeight: 1, opacity: 0.5 }}
                                          onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                          onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                                        >×</button>
                                      </>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                            <button
                              onClick={() => addBulletToSection("current", null, key)}
                              className="jost"
                              style={{ background: "none", border: "none", color: `${color}99`, cursor: "pointer", fontSize: 11, padding: "4px 0 0 16px", fontStyle: "italic", fontFamily: "'Jost', sans-serif" }}
                            >+ add bullet</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Rosie refinement chat — for tweaking any part of the prep */}
          {generated && !rehearsing && (
            <div className="card" style={{ padding: "16px 18px", marginTop: 12, background: "linear-gradient(135deg, rgba(253,240,245,0.85), rgba(255,248,251,0.7))", borderColor: "rgba(212,130,154,0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>🌸</span>
                <div className="cg" style={{ fontSize: 17, fontWeight: 600, color: "#4a3540" }}>Chat with Rosie about this prep</div>
              </div>
              <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.5)", fontStyle: "italic", marginBottom: 12, lineHeight: 1.5 }}>
                Want anything tweaked? Ask her to adjust the opener, add curveballs, change how to handle off-topic moments, soften tense language, anything.
              </div>

              {/* Conversation history */}
              {refineHistory.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10, maxHeight: 260, overflowY: "auto" }}>
                  {refineHistory.map((msg, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                      <div className="jost" style={{
                        fontSize: 12,
                        lineHeight: 1.5,
                        padding: "8px 12px",
                        borderRadius: 12,
                        maxWidth: "85%",
                        background: msg.role === "user" ? "rgba(212,130,154,0.15)" : "rgba(255,255,255,0.85)",
                        color: msg.role === "user" ? "#4a3540" : "rgba(74,53,64,0.85)",
                        border: msg.role === "user" ? "1px solid rgba(212,130,154,0.25)" : "1px solid rgba(212,130,154,0.15)",
                        fontStyle: msg.role === "rosie" ? "italic" : "normal",
                      }}>
                        {msg.role === "rosie" && <span style={{ marginRight: 4 }}>🌸</span>}
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {refineLoading && (
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                      <div className="jost pulse" style={{ fontSize: 11, color: "rgba(184,109,133,0.7)", padding: "6px 10px", fontStyle: "italic" }}>
                        🌸 Rosie's thinking…
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quick-pick suggestion chips (only show before first message) */}
              {refineHistory.length === 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {[
                    "Make the opener warmer",
                    "Shorten the opener",
                    "Add a curveball about timeline",
                    "More specific main points",
                    "Soften the 'if tense' section",
                  ].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => setRefineInput(suggestion)}
                      className="jost"
                      style={{
                        fontSize: 10,
                        padding: "4px 10px",
                        background: "rgba(212,130,154,0.08)",
                        border: "1px solid rgba(212,130,154,0.2)",
                        borderRadius: 14,
                        color: "#b86d85",
                        cursor: "pointer",
                        fontFamily: "'Jost', sans-serif",
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Input row */}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="ifield jost"
                  placeholder="e.g. 'Make the opener shorter' or 'Add a curveball about pricing'"
                  value={refineInput}
                  onChange={e => setRefineInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !refineLoading) submitRefineRequest(); }}
                  disabled={refineLoading}
                  style={{ flex: 1, fontSize: 12, background: "rgba(255,255,255,0.9)" }}
                />
                <button
                  onClick={submitRefineRequest}
                  disabled={!refineInput.trim() || refineLoading}
                  className="btn jost"
                  style={{
                    flexShrink: 0,
                    padding: "0 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    background: (!refineInput.trim() || refineLoading) ? "rgba(212,130,154,0.25)" : "linear-gradient(135deg,#d4829a,#b86d85)",
                    color: "#fff",
                    border: "none",
                    cursor: (!refineInput.trim() || refineLoading) ? "not-allowed" : "pointer",
                    boxShadow: (!refineInput.trim() || refineLoading) ? "none" : "0 2px 8px rgba(212,130,154,0.3)",
                  }}
                >
                  Ask Rosie
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 1:1 PREP — now nested under Prep tab, shows when prepMode is "oneonone" */}
      {subtab === "prep" && prepMode === "oneonone" && (
        <>
          {/* Header card */}
          <div className="card" style={{ padding: "16px 20px", marginBottom: 12 }}>
            <h3 className="cg" style={{ fontSize: 22, color: "#4a3540", margin: 0, marginBottom: 4 }}>1:1 with Josh <span style={{ color: "#d4829a" }}>✦</span></h3>
            <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.6)", lineHeight: 1.55, margin: 0 }}>
              Rosie reads everything on your plate — completed, in progress, queued, waiting, blocked — and drafts realistic talking points. 🌸
            </p>
          </div>

          {/* Period selector + Generate button */}
          {!oneOnOneSummary && !oneOnOneLoading && (
            <>
              <div className="card" style={{ padding: "12px 16px", marginBottom: 10 }}>
                <div className="jost" style={{ fontSize: 10, letterSpacing: 1.5, color: "rgba(74,53,64,0.55)", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>
                  Time period
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[
                    { val: 7, label: "Last week" },
                    { val: 14, label: "Last 2 weeks" },
                    { val: 30, label: "Last month" },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setOneOnOnePeriod(opt.val)}
                      className="jost"
                      style={{
                        flex: 1,
                        padding: "8px",
                        background: oneOnOnePeriod === opt.val ? "linear-gradient(135deg, rgba(232,160,180,0.2), rgba(212,130,154,0.15))" : "rgba(255,255,255,0.5)",
                        border: "1px solid " + (oneOnOnePeriod === opt.val ? "rgba(212,130,154,0.45)" : "rgba(212,130,154,0.18)"),
                        borderRadius: 8,
                        color: oneOnOnePeriod === opt.val ? "#b86d85" : "rgba(74,53,64,0.6)",
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: oneOnOnePeriod === opt.val ? 600 : 500,
                        transition: "all .15s",
                      }}
                    >{opt.label}</button>
                  ))}
                </div>
                <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.45)", marginTop: 8, fontStyle: "italic", lineHeight: 1.4 }}>
                  Filters completed wins to this window. Active, blocked, and waiting items always show regardless of age.
                </div>
              </div>
              <button
                className="jost"
                onClick={async () => {
                  setOneOnOneLoading(true);
                  try {
                    const summary = await generate1on1Summary(data.items, oneOnOneHistory, oneOnOnePeriod);
                    setOneOnOneSummary(summary || "");
                  } catch (e) {
                    setOneOnOneSummary("Couldn't reach Rosie — try again?");
                  }
                  setOneOnOneLoading(false);
                  if (onAwardXP) onAwardXP(5, window.innerWidth / 2, 200);
                }}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "linear-gradient(135deg, rgba(232,160,180,0.2), rgba(212,130,154,0.15))",
                  border: "1px dashed rgba(212,130,154,0.45)",
                  borderRadius: 12,
                  color: "#b86d85",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Jost', sans-serif",
                  transition: "all .2s",
                }}
              >🌸 Generate 1:1 prep ({oneOnOnePeriod === 7 ? "last week" : oneOnOnePeriod === 14 ? "last 2 weeks" : "last month"})</button>
            </>
          )}

          {oneOnOneLoading && (
            <div className="card" style={{ padding: "20px", textAlign: "center" }}>
              <div className="jost pulse" style={{ fontSize: 13, color: "#b86d85", fontWeight: 500 }}>🌸 Rosie's reading your plate and drafting talking points…</div>
            </div>
          )}

          {oneOnOneSummary && !oneOnOneLoading && (
            <div className="card" style={{ padding: "20px 22px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 10 }}>
                <div className="jost" style={{ fontSize: 10, letterSpacing: 3, color: "rgba(212,130,154,0.7)", textTransform: "uppercase" }}>1:1 prep · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(oneOnOneSummary);
                      setOneOnOneCopied(true);
                      setTimeout(() => setOneOnOneCopied(false), 1500);
                    }}
                    className="jost"
                    style={{ background: oneOnOneCopied ? "rgba(158,184,154,0.2)" : "rgba(212,130,154,0.1)", border: "1px solid " + (oneOnOneCopied ? "rgba(158,184,154,0.4)" : "rgba(212,130,154,0.3)"), color: oneOnOneCopied ? "#7a9e78" : "#b86d85", cursor: "pointer", fontSize: 11, padding: "4px 10px", borderRadius: 8, fontWeight: 600 }}
                  >{oneOnOneCopied ? "✓ Copied" : "Copy"}</button>
                  <button
                    onClick={() => { setOneOnOneSummary(""); setOneOnOneFeedback(""); }}
                    style={{ background: "none", border: "none", color: "rgba(74,53,64,0.4)", fontSize: 14, cursor: "pointer", padding: "0 4px" }}
                    title="Clear"
                  >×</button>
                </div>
              </div>
              <pre className="jost" style={{ fontFamily: "'Jost', sans-serif", whiteSpace: "pre-wrap", margin: 0, fontSize: 13, lineHeight: 1.7, color: "#4a3540" }}>{oneOnOneSummary}</pre>
            </div>
          )}

          {/* Refinement chat */}
          {oneOnOneSummary && !oneOnOneLoading && (
            <div className="card" style={{ padding: "16px 20px", marginBottom: 12 }}>
              <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.55)", marginBottom: 8, letterSpacing: 0.3, textTransform: "uppercase", fontWeight: 600 }}>
                💬 Want to adjust? Tell Rosie what to change:
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="ifield jost"
                  placeholder="e.g. shorter, drop the in-progress section, add capacity concerns…"
                  value={oneOnOneFeedback}
                  onChange={e => setOneOnOneFeedback(e.target.value)}
                  onKeyDown={async e => {
                    if (e.key === "Enter" && oneOnOneFeedback.trim() && !oneOnOneRefining) {
                      setOneOnOneRefining(true);
                      try {
                        const revised = await refine1on1Summary(oneOnOneSummary, data.items, oneOnOneFeedback.trim());
                        if (revised) setOneOnOneSummary(revised);
                        setOneOnOneFeedback("");
                      } catch {}
                      setOneOnOneRefining(false);
                    }
                  }}
                  disabled={oneOnOneRefining}
                  style={{ flex: 1, fontSize: 12, padding: "8px 12px", opacity: oneOnOneRefining ? 0.5 : 1 }}
                />
                <button
                  onClick={async () => {
                    if (!oneOnOneFeedback.trim() || oneOnOneRefining) return;
                    setOneOnOneRefining(true);
                    try {
                      const revised = await refine1on1Summary(oneOnOneSummary, data.items, oneOnOneFeedback.trim());
                      if (revised) setOneOnOneSummary(revised);
                      setOneOnOneFeedback("");
                    } catch {}
                    setOneOnOneRefining(false);
                  }}
                  disabled={!oneOnOneFeedback.trim() || oneOnOneRefining}
                  className="jost"
                  style={{
                    background: oneOnOneRefining ? "rgba(212,130,154,0.15)" : (oneOnOneFeedback.trim() ? "linear-gradient(135deg, rgba(232,160,180,0.25), rgba(212,130,154,0.2))" : "rgba(212,130,154,0.08)"),
                    border: "1px solid " + (oneOnOneRefining || !oneOnOneFeedback.trim() ? "rgba(212,130,154,0.2)" : "rgba(212,130,154,0.4)"),
                    color: oneOnOneFeedback.trim() && !oneOnOneRefining ? "#b86d85" : "rgba(184,109,133,0.5)",
                    cursor: (!oneOnOneFeedback.trim() || oneOnOneRefining) ? "not-allowed" : "pointer",
                    fontSize: 11, padding: "0 14px", borderRadius: 8, fontWeight: 600, flexShrink: 0,
                  }}
                >{oneOnOneRefining ? <span className="pulse">🌸…</span> : "Revise"}</button>
              </div>
            </div>
          )}

          {/* Save to history */}
          {oneOnOneSummary && !oneOnOneLoading && (
            <button
              className="jost"
              onClick={() => {
                const entry = {
                  id: uid(),
                  date: new Date().toISOString().slice(0, 10),
                  summary: oneOnOneSummary,
                  itemSnapshot: data.items.filter(i => !isTerminalStatus(i.status)).slice(0, 30).map(i => ({ title: i.title, status: i.status, priority: i.priority })),
                  topics: [],
                };
                onUpdateData({ ...data, oneOnOneHistory: [...oneOnOneHistory, entry] });
                setOneOnOneSummary("");
                setOneOnOneFeedback("");
                if (onAwardXP) onAwardXP(3, window.innerWidth / 2, 200);
              }}
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(158,184,154,0.12)",
                border: "1px solid rgba(158,184,154,0.35)",
                borderRadius: 10,
                color: "#7a9e78",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Jost', sans-serif",
                marginBottom: 16,
              }}
            >💾 Save to 1:1 history</button>
          )}

          {/* History list */}
          {oneOnOneHistory.length > 0 && (
            <div>
              <div className="jost" style={{ fontSize: 10, letterSpacing: 2, color: "rgba(74,53,64,0.5)", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>
                Past 1:1 prep ({oneOnOneHistory.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[...oneOnOneHistory].reverse().map(entry => {
                  const isExpanded = expandedHistoryId === entry.id;
                  const dateLabel = new Date(entry.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
                  return (
                    <div key={entry.id} className="card" style={{ padding: "12px 16px", cursor: "pointer" }} onClick={() => setExpandedHistoryId(isExpanded ? null : entry.id)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div className="jost" style={{ fontSize: 12, fontWeight: 600, color: "#4a3540" }}>{dateLabel}</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)" }}>{entry.itemSnapshot?.length || 0} items on plate</span>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              if (confirm("Delete this 1:1 entry?")) {
                                onUpdateData({ ...data, oneOnOneHistory: oneOnOneHistory.filter(h => h.id !== entry.id) });
                              }
                            }}
                            style={{ background: "none", border: "none", color: "rgba(212,100,120,0.4)", cursor: "pointer", fontSize: 13, padding: "0 4px" }}
                            title="Delete"
                          >×</button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(212,130,154,0.12)" }}>
                          <pre className="jost" style={{ fontFamily: "'Jost', sans-serif", whiteSpace: "pre-wrap", margin: 0, fontSize: 12, lineHeight: 1.65, color: "#4a3540" }}>{entry.summary}</pre>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(entry.summary);
                              setOneOnOneCopied(true);
                              setTimeout(() => setOneOnOneCopied(false), 1500);
                            }}
                            className="jost"
                            style={{ marginTop: 10, background: "rgba(212,130,154,0.1)", border: "1px solid rgba(212,130,154,0.3)", color: "#b86d85", cursor: "pointer", fontSize: 10, padding: "3px 9px", borderRadius: 8, fontWeight: 600 }}
                          >Copy</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* NOTES */}
      {subtab === "notes" && (
        <>
          {/* Context card — explain the flow */}
          {!notesResult && !notesLoading && (
            <div className="card" style={{ padding: "14px 18px", marginBottom: 12, background: "rgba(253,240,245,0.5)" }}>
              <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.7)", fontStyle: "italic", lineHeight: 1.55 }}>
                Dump your messy meeting notes here. Rosie will pull out action items, decisions, open questions, risks, and next steps — and auto-add anything assigned to you into the Work Hub. 🌸
              </div>
            </div>
          )}

          {/* Attach to meeting picker */}
          <div className="card" style={{ padding: "14px 18px", marginBottom: 12 }}>
            <label className="sl jost">Which meeting is this from? (optional)</label>
            <select
              className="ifield jost"
              value={notesAttachTo}
              onChange={e => setNotesAttachTo(e.target.value)}
              style={{ cursor: "pointer" }}
            >
              <option value="">Standalone note (not tied to a prepped meeting)</option>
              {[...history].slice(0, 15).map(m => {
                const dateLabel = formatDate(m.date);
                const titlePart = m.title ? ` — ${m.title}` : (m.whoWith !== "—" ? ` with ${m.whoWith}` : "");
                const sit = !m.title && m.situation !== "No description" ? ` — ${m.situation.slice(0, 40)}${m.situation.length > 40 ? "…" : ""}` : "";
                return <option key={m.id} value={m.id}>{dateLabel}{titlePart}{sit}</option>;
              })}
            </select>
            {/* Meeting title field — only shown when standalone, so unprepped meetings can still be labeled */}
            {!notesAttachTo && (
              <div style={{ marginTop: 12 }}>
                <label className="sl jost">Meeting title (optional)</label>
                <input
                  type="text"
                  className="ifield jost"
                  value={notesStandaloneTitle}
                  onChange={e => setNotesStandaloneTitle(e.target.value)}
                  placeholder="e.g. Vendor sync with Corelation, Fort Financial check-in…"
                  style={{ fontSize: 13 }}
                />
                <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.45)", fontStyle: "italic", marginTop: 6 }}>
                  Helps you find this note later in History ✦
                </div>
              </div>
            )}
            {/* Attendees — useful regardless of whether the meeting is attached or standalone */}
            <div style={{ marginTop: 12 }}>
              <label className="sl jost">Who was there? (optional)</label>
              <input
                type="text"
                className="ifield jost"
                value={notesAttendees}
                onChange={e => setNotesAttendees(e.target.value)}
                placeholder="e.g. Josh, Colby, Rob from Corelation"
                style={{ fontSize: 13 }}
              />
              <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.45)", fontStyle: "italic", marginTop: 6 }}>
                Helps Rosie attribute action items correctly ✦
              </div>
            </div>
            {notesAttachTo && (
              <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.45)", fontStyle: "italic", marginTop: 6 }}>
                Notes will attach to this meeting's History entry ✦
              </div>
            )}
          </div>

          {/* Notes input */}
          <div className="card" style={{ padding: "18px 22px", marginBottom: 12 }}>
            <label className="sl jost">Your raw notes</label>
            <textarea
              className="ifield jost"
              value={notesInput}
              onChange={e => setNotesInput(e.target.value)}
              placeholder="Dump everything — bullets, abbreviations, half-sentences, whatever. Example:&#10;&#10;Josh will pull Q3 numbers by Fri&#10;I'll follow up with Colby re: demo times&#10;Rob asked about the API timeline - unclear&#10;decided to move kickoff to week of 5/12&#10;risk: vendor still hasn't confirmed sign-off..."
              style={{ minHeight: 180, resize: "vertical", lineHeight: 1.55, fontSize: 13, fontFamily: "'Jost', sans-serif" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
              <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.4)", fontStyle: "italic" }}>{notesInput.length} characters</div>
              {(notesInput || notesResult) && !notesLoading && (
                <button className="btn ghost jost" onClick={clearNotes} style={{ fontSize: 10, padding: "3px 10px" }}>Clear</button>
              )}
            </div>
            <button
              className="btn jost"
              onClick={parseNotes}
              disabled={!notesInput.trim() || notesLoading}
              style={{
                width: "100%",
                padding: "12px",
                marginTop: 12,
                background: (!notesInput.trim() || notesLoading) ? "rgba(212,130,154,0.3)" : "linear-gradient(135deg,#d4829a,#b86d85)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: (!notesInput.trim() || notesLoading) ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: (!notesInput.trim() || notesLoading) ? "none" : "0 3px 12px rgba(212,130,154,0.3)",
              }}
            >
              {notesLoading ? (
                <><span className="pulse">✨</span> Rosie's reading through...</>
              ) : (
                <><Sparkles size={14} /> Parse these notes</>
              )}
            </button>
          </div>

          {/* Added flash — works for both action items and reminders */}
          {notesAddedFlash && (
            <div className="card fade" style={{ padding: "14px 18px", marginBottom: 12, background: "linear-gradient(135deg, rgba(158,184,154,0.15), rgba(196,218,196,0.1))", borderLeft: "3px solid #9eb89a" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 20 }}>✨</div>
                <div>
                  <div className="cg" style={{ fontSize: 16, fontWeight: 600, color: "#7a9e78" }}>
                    {notesAddedFlash}
                  </div>
                  <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.55)", fontStyle: "italic", marginTop: 2 }}>
                    All saved 🌸
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {notesError && (
            <div className="card" style={{ padding: "14px 18px", marginBottom: 12, background: "rgba(212,100,120,0.06)", borderLeft: "3px solid rgba(212,100,120,0.4)" }}>
              <div className="jost" style={{ fontSize: 13, color: "rgba(196,100,120,0.85)", marginBottom: 6 }}>{notesError}</div>
              <button className="btn ghost jost" onClick={parseNotes} style={{ fontSize: 11, padding: "4px 10px" }}>Try again</button>
            </div>
          )}

          {/* Parsed result */}
          {notesResult && !notesLoading && (
            <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Summary */}
              {notesResult.summary && (
                <div className="card" style={{ padding: "14px 18px", background: "rgba(255,252,245,0.7)", borderColor: "rgba(196,168,130,0.2)" }}>
                  <div className="jost" style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#9a7850", fontWeight: 600, marginBottom: 6 }}>
                    ✦ Quick summary
                  </div>
                  <div className="jost" style={{ fontSize: 13, color: "rgba(74,53,64,0.85)", lineHeight: 1.55, fontStyle: "italic" }}>{notesResult.summary}</div>
                </div>
              )}

              {/* Action items — split into "mine" and "others" */}
              {(notesResult.actionItems || []).length > 0 && (
                <div className="card" style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <ListChecks size={16} color="#d4829a" />
                    <div className="cg" style={{ fontSize: 17, fontWeight: 600, color: "#4a3540" }}>Action items</div>
                  </div>

                  {/* "Mine" section — checkbox UI to opt-in items to Work Hub */}
                  {(() => {
                    const mineWithIdx = notesResult.actionItems
                      .map((a, i) => ({ a, i }))
                      .filter(({ a }) => a.owner === "me");
                    if (!mineWithIdx.length) return null;
                    const allSelectedCount = mineWithIdx.filter(({ i }) => notesActionItemsSelected.has(i)).length;
                    const allChecked = allSelectedCount === mineWithIdx.length;
                    return (
                      <div style={{ marginBottom: 14 }}>
                        <div className="jost" style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#b86d85", fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                          🌸 Yours {notesActionItemsAdded && <span style={{ color: "#7a9e78", fontWeight: 500, textTransform: "none", letterSpacing: 0.3 }}>(added ✓)</span>}
                          {!notesActionItemsAdded && mineWithIdx.length > 1 && (
                            <button
                              onClick={() => {
                                setNotesActionItemsSelected(allChecked ? new Set() : new Set(mineWithIdx.map(({ i }) => i)));
                              }}
                              className="jost"
                              style={{ background: "transparent", border: "none", color: "rgba(184,109,133,0.7)", fontSize: 10, cursor: "pointer", padding: "0 4px", textDecoration: "underline", marginLeft: "auto", textTransform: "none", letterSpacing: 0.3, fontWeight: 500 }}
                            >
                              {allChecked ? "uncheck all" : "check all"}
                            </button>
                          )}
                        </div>
                        {mineWithIdx.map(({ a, i }) => {
                          const checked = notesActionItemsSelected.has(i);
                          const dimmed = notesActionItemsAdded || !checked;
                          return (
                            <label
                              key={i}
                              style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 14px", background: "rgba(212,130,154,0.06)", borderLeft: "3px solid #d4829a", borderRadius: 8, marginBottom: 6, cursor: notesActionItemsAdded ? "default" : "pointer", opacity: dimmed && !checked ? 0.55 : 1, transition: "opacity .15s" }}
                              onClick={(e) => {
                                if (notesActionItemsAdded) return;
                                if (e.target.tagName === "INPUT") return;
                                e.preventDefault();
                                setNotesActionItemsSelected(prev => {
                                  const next = new Set(prev);
                                  if (next.has(i)) next.delete(i); else next.add(i);
                                  return next;
                                });
                              }}
                            >
                              {!notesActionItemsAdded && (
                                <span style={{ flexShrink: 0, marginTop: 2 }}>
                                  {checked
                                    ? <CheckSquare size={16} style={{ color: "#d4829a" }} />
                                    : <Square size={16} style={{ color: "rgba(212,130,154,0.5)" }} />}
                                </span>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="jost" style={{ fontSize: 13, color: "#4a3540", fontWeight: 500, lineHeight: 1.4, textDecoration: !notesActionItemsAdded && !checked ? "line-through" : "none" }}>{a.title}</div>
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                                  <span className="tag jost" style={{ fontSize: 10, padding: "2px 8px", background: a.priority === "high" ? "rgba(212,100,120,0.12)" : a.priority === "low" ? "rgba(196,168,130,0.12)" : "rgba(184,160,212,0.12)", color: a.priority === "high" ? "#c4687a" : a.priority === "low" ? "#9a7850" : "#9878b8" }}>{a.priority}</span>
                                  {a.dueHint && <span className="tag jost" style={{ fontSize: 10, padding: "2px 8px", background: "rgba(158,184,154,0.12)", color: "#7a9e78" }}>📅 {a.dueHint}</span>}
                                  {a.tasks && a.tasks.length > 0 && <span className="tag jost" style={{ fontSize: 10, padding: "2px 8px", background: "rgba(74,53,64,0.06)", color: "rgba(74,53,64,0.55)" }}>{a.tasks.length} subtasks</span>}
                                </div>
                                {a.why && <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.5)", fontStyle: "italic", marginTop: 5 }}>Why: {a.why}</div>}
                              </div>
                            </label>
                          );
                        })}
                        {!notesActionItemsAdded && (
                          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <button
                              onClick={addSelectedActionItems}
                              disabled={allSelectedCount === 0}
                              className="btn rose jost"
                              style={{
                                fontSize: 11,
                                padding: "6px 14px",
                                opacity: allSelectedCount === 0 ? 0.4 : 1,
                                cursor: allSelectedCount === 0 ? "not-allowed" : "pointer",
                              }}
                            >
                              🌸 {allChecked ? `Add all ${mineWithIdx.length} to Work Hub` : allSelectedCount === 0 ? "Add to Work Hub" : `Add ${allSelectedCount} of ${mineWithIdx.length} to Work Hub`}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* "Others" section */}
                  {(() => {
                    const others = notesResult.actionItems.filter(a => a.owner !== "me");
                    if (!others.length) return null;
                    return (
                      <div>
                        <div className="jost" style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(74,53,64,0.5)", fontWeight: 600, marginBottom: 6 }}>
                          Others' items (for reference)
                        </div>
                        {others.map((a, i) => (
                          <div key={i} style={{ padding: "8px 12px", background: "rgba(74,53,64,0.03)", borderLeft: "2px solid rgba(74,53,64,0.15)", borderRadius: 6, marginBottom: 5 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                              <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.75)", flex: 1 }}>{a.title}</div>
                              <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.45)", fontStyle: "italic", flexShrink: 0 }}>
                                {a.owner === "team" ? "team" : a.owner === "unclear" ? "?" : a.owner}
                                {a.dueHint && ` · ${a.dueHint}`}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Decisions */}
              {(notesResult.decisions || []).length > 0 && (
                <div className="card" style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <Check size={16} color="#7a9e78" />
                    <div className="cg" style={{ fontSize: 17, fontWeight: 600, color: "#4a3540" }}>Decisions made</div>
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {notesResult.decisions.map((d, i) => (
                      <li key={i} className="jost" style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(74,53,64,0.85)", padding: "5px 0 5px 18px", position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, top: 12, color: "#7a9e78", fontWeight: 700 }}>✓</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Open questions */}
              {(notesResult.openQuestions || []).length > 0 && (
                <div className="card" style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <HelpCircle size={16} color="#9878b8" />
                    <div className="cg" style={{ fontSize: 17, fontWeight: 600, color: "#4a3540" }}>Open questions</div>
                  </div>
                  {notesResult.openQuestions.map((q, i) => (
                    <div key={i} style={{ padding: "8px 12px", background: "rgba(184,160,212,0.06)", borderLeft: "2px solid rgba(184,160,212,0.4)", borderRadius: 6, marginBottom: 6 }}>
                      <div className="jost" style={{ fontSize: 13, color: "rgba(74,53,64,0.85)", lineHeight: 1.5 }}>{q.question}</div>
                      {q.whoShouldAnswer && <div className="jost" style={{ fontSize: 11, color: "#9878b8", fontStyle: "italic", marginTop: 3 }}>→ {q.whoShouldAnswer}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* Risks */}
              {(notesResult.risks || []).length > 0 && (
                <div className="card" style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <AlertTriangle size={16} color="#c4687a" />
                    <div className="cg" style={{ fontSize: 17, fontWeight: 600, color: "#4a3540" }}>Risks</div>
                  </div>
                  {notesResult.risks.map((r, i) => (
                    <div key={i} style={{ padding: "8px 12px", background: "rgba(212,100,120,0.05)", borderLeft: "2px solid rgba(212,100,120,0.3)", borderRadius: 6, marginBottom: 6 }}>
                      <div className="jost" style={{ fontSize: 13, color: "rgba(74,53,64,0.85)", lineHeight: 1.5 }}>{r.risk}</div>
                      {r.mitigation && <div className="jost" style={{ fontSize: 11, color: "#7a9e78", marginTop: 3 }}>→ mitigation: {r.mitigation}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* Reminders — checkbox UI to opt-in time-anchored nudges */}
              {(notesResult.reminders || []).length > 0 && (() => {
                const reminders = notesResult.reminders || [];
                const allSelectedCount = reminders.filter((_, i) => notesRemindersSelected.has(i)).length;
                const allChecked = allSelectedCount === reminders.length;
                return (
                  <div className="card" style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <AlertCircle size={16} color="#c4a882" />
                      <div className="cg" style={{ fontSize: 17, fontWeight: 600, color: "#4a3540" }}>Reminders</div>
                      {notesRemindersAdded && <span className="jost" style={{ fontSize: 11, color: "#7a9e78", fontStyle: "italic", marginLeft: 4 }}>(added ✓)</span>}
                      {!notesRemindersAdded && reminders.length > 1 && (
                        <button
                          onClick={() => {
                            setNotesRemindersSelected(allChecked ? new Set() : new Set(reminders.map((_, i) => i)));
                          }}
                          className="jost"
                          style={{ background: "transparent", border: "none", color: "rgba(154,120,80,0.7)", fontSize: 10, cursor: "pointer", padding: "0 4px", textDecoration: "underline", marginLeft: "auto", textTransform: "none", letterSpacing: 0.3, fontWeight: 500 }}
                        >
                          {allChecked ? "uncheck all" : "check all"}
                        </button>
                      )}
                    </div>
                    {reminders.map((r, i) => {
                      const checked = notesRemindersSelected.has(i);
                      return (
                        <label
                          key={i}
                          style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 12px", background: "rgba(196,168,130,0.06)", borderLeft: "2px solid rgba(196,168,130,0.4)", borderRadius: 6, marginBottom: 6, cursor: notesRemindersAdded ? "default" : "pointer", opacity: !notesRemindersAdded && !checked ? 0.55 : 1, transition: "opacity .15s" }}
                          onClick={(e) => {
                            if (notesRemindersAdded) return;
                            if (e.target.tagName === "INPUT") return;
                            e.preventDefault();
                            setNotesRemindersSelected(prev => {
                              const next = new Set(prev);
                              if (next.has(i)) next.delete(i); else next.add(i);
                              return next;
                            });
                          }}
                        >
                          {!notesRemindersAdded && (
                            <span style={{ flexShrink: 0, marginTop: 2 }}>
                              {checked
                                ? <CheckSquare size={16} style={{ color: "#c4a882" }} />
                                : <Square size={16} style={{ color: "rgba(196,168,130,0.5)" }} />}
                            </span>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="jost" style={{ fontSize: 13, color: "rgba(74,53,64,0.85)", lineHeight: 1.5, textDecoration: !notesRemindersAdded && !checked ? "line-through" : "none" }}>{r.text}</div>
                            {r.when && <div className="jost" style={{ fontSize: 11, color: "#9a7850", fontStyle: "italic", marginTop: 3 }}>📅 {r.when}</div>}
                          </div>
                        </label>
                      );
                    })}
                    {!notesRemindersAdded && (
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button
                          onClick={addSelectedReminders}
                          disabled={allSelectedCount === 0}
                          className="btn jost"
                          style={{
                            fontSize: 11,
                            padding: "6px 14px",
                            background: allSelectedCount === 0 ? "rgba(196,168,130,0.3)" : "linear-gradient(135deg,#c4a882,#9a7850)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            fontWeight: 600,
                            opacity: allSelectedCount === 0 ? 0.4 : 1,
                            cursor: allSelectedCount === 0 ? "not-allowed" : "pointer",
                          }}
                        >
                          ✦ {allChecked ? `Add all ${reminders.length} reminder${reminders.length === 1 ? "" : "s"}` : allSelectedCount === 0 ? "Add reminders" : `Add ${allSelectedCount} of ${reminders.length} reminder${reminders.length === 1 ? "" : "s"}`}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Next meeting */}
              {notesResult.nextMeeting && (notesResult.nextMeeting.when || notesResult.nextMeeting.focus) && (
                <div className="card" style={{ padding: "16px 20px", background: "rgba(158,184,154,0.06)", borderColor: "rgba(158,184,154,0.25)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <Calendar size={16} color="#7a9e78" />
                    <div className="cg" style={{ fontSize: 16, fontWeight: 600, color: "#4a3540" }}>Next meeting</div>
                  </div>
                  {notesResult.nextMeeting.when && <div className="jost" style={{ fontSize: 13, color: "rgba(74,53,64,0.8)", marginBottom: 3 }}><strong>When:</strong> {notesResult.nextMeeting.when}</div>}
                  {notesResult.nextMeeting.focus && <div className="jost" style={{ fontSize: 13, color: "rgba(74,53,64,0.8)" }}><strong>Focus:</strong> {notesResult.nextMeeting.focus}</div>}
                </div>
              )}

              {/* Empty state — parsed successfully but nothing found */}
              {!(notesResult.actionItems || []).length && !(notesResult.decisions || []).length && !(notesResult.openQuestions || []).length && !(notesResult.risks || []).length && !(notesResult.reminders || []).length && (
                <div className="card" style={{ padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🌸</div>
                  <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.55)", fontStyle: "italic" }}>
                    Rosie read through but didn't find clear action items or decisions. That's okay — sometimes meetings are mostly discussion.
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* LIBRARY */}
      {subtab === "library" && (
        <>
          <div className="card" style={{ padding: "14px 18px", marginBottom: 12 }}>
            <label className="sl jost">Tone</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
              {Object.entries(MPC_VIBES).map(([key, v]) => (
                <button key={key} onClick={() => setVibe(key)} className="jost" style={{ padding: "8px 6px", borderRadius: 10, border: vibe === key ? "2px solid #d4829a" : "1px solid rgba(212,130,154,0.15)", background: vibe === key ? "rgba(212,130,154,0.08)" : "rgba(255,255,255,0.5)", cursor: "pointer", textAlign: "center", fontFamily: "inherit" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#4a3540" }}>{v.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.6)", border: "1px solid rgba(212,130,154,0.15)", borderRadius: 999, padding: 4, marginBottom: 14 }}>
            {[{ id: "openers", label: "Openers", icon: MessageCircle }, { id: "exits", label: "Exits", icon: LogOut }].map(({ id, label, icon: Icon }) => (
              <button key={id} className="jost" onClick={() => setLibraryView(id)} style={{ flex: 1, padding: "8px 10px", borderRadius: 999, border: "none", background: libraryView === id ? "linear-gradient(135deg,#d4829a,#b86d85)" : "transparent", color: libraryView === id ? "#fff" : "rgba(74,53,64,0.6)", cursor: "pointer", fontSize: 12, fontWeight: libraryView === id ? 600 : 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .2s" }}>
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>

          {libraryView === "openers" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {favoriteOpeners.length > 0 && (
                <div className="card" style={{ padding: "16px 18px", background: "rgba(255,252,245,0.85)", borderColor: "rgba(196,168,130,0.25)" }}>
                  <div className="jost" style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(180,140,90,0.85)", fontWeight: 600, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <Star size={12} fill="#c4a882" color="#c4a882" /> Your saved openers
                  </div>
                  {favoriteOpeners.map(f => {
                    const isEditing = editingFavoriteId === f.id;
                    const startEdit = () => {
                      setEditingFavoriteId(f.id);
                      setFavoriteDraft(f.text || "");
                    };
                    const cancelEdit = () => {
                      setEditingFavoriteId(null);
                      setFavoriteDraft("");
                    };
                    const saveEdit = () => {
                      const trimmed = favoriteDraft.trim();
                      if (!trimmed) { cancelEdit(); return; }
                      const updated = favoriteOpeners.map(x => x.id === f.id ? { ...x, text: trimmed } : x);
                      setFavoriteOpeners(updated);
                      saveMpc(MPC_KEYS.favoriteOpeners, updated);
                      cancelEdit();
                    };
                    const removeFav = () => {
                      const n = favoriteOpeners.filter(x => x.id !== f.id);
                      setFavoriteOpeners(n);
                      saveMpc(MPC_KEYS.favoriteOpeners, n);
                    };
                    return (
                      <div key={f.id} style={{ padding: 12, background: "rgba(255,255,255,0.6)", borderRadius: 8, marginBottom: 8 }}>
                        {isEditing ? (
                          <>
                            <textarea
                              autoFocus
                              value={favoriteDraft}
                              onChange={e => setFavoriteDraft(e.target.value)}
                              onKeyDown={e => { if (e.key === "Escape") cancelEdit(); if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveEdit(); }}
                              className="cg"
                              style={{
                                width: "100%", boxSizing: "border-box",
                                fontSize: 13, lineHeight: 1.5, color: "rgba(74,53,64,0.85)",
                                fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif",
                                border: "1px solid rgba(212,130,154,0.4)", borderRadius: 6,
                                background: "rgba(255,255,255,0.85)", padding: "8px 10px",
                                resize: "vertical", minHeight: 60, outline: "none",
                                marginBottom: 8,
                              }}
                              placeholder="Edit your opener…"
                            />
                            <div style={{ display: "flex", gap: 6 }}>
                              <button className="btn rose jost" onClick={saveEdit} style={{ fontSize: 10, padding: "4px 12px", fontWeight: 600 }}>✓ Save</button>
                              <button className="btn ghost jost" onClick={cancelEdit} style={{ fontSize: 10, padding: "4px 10px" }}>Cancel</button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="cg" style={{ fontSize: 13, color: "rgba(74,53,64,0.85)", fontStyle: "italic", margin: "0 0 8px", lineHeight: 1.5 }}>"{f.text}"</p>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button className="btn ghost jost" onClick={() => copy(f.text, `fav-${f.id}`)} style={{ fontSize: 10, padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: 4 }}>
                                {copied === `fav-${f.id}` ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
                              </button>
                              <button className="btn ghost jost" onClick={startEdit} style={{ fontSize: 10, padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: 4 }}>✎ Edit</button>
                              <button className="btn ghost jost" onClick={removeFav} style={{ fontSize: 10, padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: 4, color: "rgba(196,104,122,0.7)" }}><X size={10} /> Remove</button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {MPC_SCRIPTS[vibe].map(s => (
                <div key={s.id} className="card" style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div className="jost" style={{ fontSize: 12, fontWeight: 600, color: "#b86d85", letterSpacing: 0.5 }}>{s.title}</div>
                    <button onClick={() => toggleFavorite(s.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                      <Star size={14} fill={favorites.includes(s.id) ? "#c4a882" : "none"} color="#c4a882" />
                    </button>
                  </div>
                  <p className="cg" style={{ fontSize: 16, lineHeight: 1.6, color: "#4a3540", margin: "0 0 10px", fontStyle: "italic" }}>"{s.text}"</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button className="btn rose jost" onClick={() => { const lines = s.text.match(/[^.!?]+[.!?]+/g)?.map(l => l.trim()) || [s.text]; setRehearsalLines(lines); setRehearsalIndex(0); setGenerated(s.text); setRehearsing(true); setSubtab("prep"); }} style={{ fontSize: 11, padding: "5px 12px", display: "inline-flex", alignItems: "center", gap: 5 }}><Play size={11} /> Rehearse</button>
                    <button className="btn ghost jost" onClick={() => copy(s.text, s.id)} style={{ fontSize: 11, padding: "5px 12px", display: "inline-flex", alignItems: "center", gap: 5 }}>
                      {copied === s.id ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {libraryView === "exits" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="card" style={{ padding: "14px 18px", background: "rgba(253,240,245,0.5)" }}>
                <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.7)", fontStyle: "italic", lineHeight: 1.5 }}>Leaving is just as hard as arriving. Here's how to close without fading out or lingering too long 💗</div>
              </div>
              {MPC_EXITS[vibe].map((e, i) => (
                <div key={i} className="card" style={{ padding: "16px 18px" }}>
                  <div className="jost" style={{ fontSize: 12, fontWeight: 600, color: "#b86d85", marginBottom: 8 }}>{e.situation}</div>
                  <p className="cg" style={{ fontSize: 15, lineHeight: 1.6, color: "#4a3540", margin: "0 0 10px", fontStyle: "italic" }}>"{e.text}"</p>
                  <button className="btn ghost jost" onClick={() => copy(e.text, `e-${i}`)} style={{ fontSize: 11, padding: "5px 12px", display: "inline-flex", alignItems: "center", gap: 5 }}>
                    {copied === `e-${i}` ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Threads — browse running thread entries (notes for Josh, etc).
          Chronological, with urgency-coded tags and delete capability.
          Click "Review all" to open the review modal via CustomEvent. */}
      {subtab === "threads" && (() => {
        const threads = data?.runningThreads || [];
        const urgencyStyle = {
          today: { bg: "rgba(212,130,154,0.18)", color: "#b86d85", label: "⚡ today" },
          thisweek: { bg: "rgba(196,168,130,0.18)", color: "#9a7850", label: "📅 this week" },
          wait: { bg: "rgba(184,160,212,0.15)", color: "#9878b8", label: "🌸 wait" },
        };
        const typeIcon = { idea: "💡", update: "📋", question: "❓", issue: "⚠️" };
        if (threads.length === 0) {
          return (
            <div className="card" style={{ padding: "24px 20px", textAlign: "center" }}>
              <div className="cg" style={{ fontSize: 18, fontStyle: "italic", color: "rgba(74,53,64,0.5)", marginBottom: 8 }}>No threads yet 🌸</div>
              <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.55)", lineHeight: 1.6 }}>
                Use the <strong>✦ Note for Josh</strong> button on the Tasks page to capture ideas, updates, and questions between 1:1s.
              </p>
            </div>
          );
        }
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {threads.map(thread => {
              const entries = (thread.entries || []).slice().sort((a, b) => b.createdAt - a.createdAt);
              const unreviewed = entries.filter(e => !e.reviewedAt);
              return (
                <div key={thread.id} className="card" style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 10, flexWrap: "wrap" }}>
                    <div>
                      <div className="jost" style={{ fontSize: 10, letterSpacing: 2, color: "rgba(152,120,184,0.85)", textTransform: "uppercase", fontWeight: 600 }}>✦ thread</div>
                      <div className="cg" style={{ fontSize: 22, fontStyle: "italic", color: "#4a3540" }}>{thread.personName}</div>
                      <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.5)", marginTop: 2 }}>{entries.length} {entries.length === 1 ? "note" : "notes"} · {unreviewed.length} unreviewed</div>
                    </div>
                    {unreviewed.length > 0 && (
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent("work-hub-thread-review-open", { detail: { personName: thread.personName } }))}
                        className="jost"
                        style={{
                          padding: "6px 14px",
                          background: "linear-gradient(135deg, #b89cd4, #9878b8)",
                          color: "#fff", border: "none", borderRadius: 8,
                          fontSize: 11, fontWeight: 600, letterSpacing: 0.3, cursor: "pointer",
                        }}
                      >📬 Review ({unreviewed.length})</button>
                    )}
                  </div>
                  {entries.length === 0 ? (
                    <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.4)", fontStyle: "italic", textAlign: "center", padding: "12px 0" }}>(no entries yet)</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {entries.map(e => {
                        const u = urgencyStyle[e.urgency] || urgencyStyle.wait;
                        const dt = new Date(e.createdAt);
                        const dateStr = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " · " + dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                        return (
                          <div key={e.id} style={{
                            background: e.reviewedAt ? "rgba(74,53,64,0.03)" : "rgba(255,255,255,0.6)",
                            border: "1px solid rgba(184,160,212,0.18)",
                            borderRadius: 8, padding: "10px 12px",
                            opacity: e.reviewedAt ? 0.65 : 1,
                          }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="jost" style={{ fontSize: 13, color: "#4a3540", lineHeight: 1.45 }}>
                                  <span style={{ marginRight: 5 }}>{typeIcon[e.type] || "📋"}</span>{e.text}
                                </div>
                                {e.linkedItemTitle && (
                                  <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.45)", marginTop: 3, fontStyle: "italic" }}>↳ {e.linkedItemTitle}</div>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  const nextThreads = (data.runningThreads || []).map(t =>
                                    t.id === thread.id ? { ...t, entries: (t.entries || []).filter(x => x.id !== e.id) } : t
                                  );
                                  onUpdateData({ ...data, runningThreads: nextThreads });
                                }}
                                title="Delete this note"
                                style={{ background: "none", border: "none", color: "rgba(212,100,120,0.45)", cursor: "pointer", fontSize: 14, padding: "0 4px", lineHeight: 1, flexShrink: 0 }}
                              >×</button>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                                <span className="jost" style={{ background: u.bg, color: u.color, padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600 }}>{u.label}</span>
                                <button
                                  onClick={() => window.dispatchEvent(new CustomEvent("work-hub-thread-chat-open", { detail: { entryId: e.id, threadId: thread.id } }))}
                                  title="Talk this through with Rosie"
                                  className="jost"
                                  style={{
                                    background: "rgba(212,130,154,0.08)",
                                    border: "1px solid rgba(212,130,154,0.3)",
                                    color: "#b86d85",
                                    padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >💭 {(e.chat?.length || 0) > 0 ? `Chat (${e.chat.length})` : "Bounce"}</button>
                              </div>
                              <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.4)" }}>{dateStr}{e.reviewedAt && e.action ? ` · ${e.action}` : ""}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* THREADS — running threads for recurring contacts (Josh primarily).
          Browsable list of all entries, grouped by thread, sorted newest-first.
          Click a thread header to expand. Per-entry: tag pill, linked task,
          edit/delete. Review button up top opens the bi-weekly review modal. */}
      {subtab === "threads" && (() => {
        const threads = data?.runningThreads || [];
        if (threads.length === 0) {
          return (
            <div className="card" style={{ padding: "32px 24px", textAlign: "center" }}>
              <div className="cg" style={{ fontSize: 18, fontStyle: "italic", color: "rgba(74,53,64,0.5)", marginBottom: 8 }}>No threads yet 🌸</div>
              <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.5)", lineHeight: 1.6, maxWidth: 380, margin: "0 auto" }}>
                Drop notes for someone (like Josh) using the <strong>✦ Note for Josh</strong> button on the Tasks page. They'll accumulate here between 1:1s.
              </p>
            </div>
          );
        }
        const urgencyMeta = {
          today: { label: "send today", color: "#c4687a", bg: "rgba(212,130,154,0.15)" },
          thisweek: { label: "this week", color: "#a87da5", bg: "rgba(184,160,212,0.15)" },
          wait: { label: "for 1:1", color: "#7a9e78", bg: "rgba(158,184,154,0.15)" },
        };
        const typeIcon = { idea: "💡", update: "📋", question: "❓", issue: "⚠️" };
        const fmtDate = (ts) => {
          const d = new Date(ts);
          const today = new Date();
          const diff = Math.floor((today - d) / (24 * 60 * 60 * 1000));
          if (diff === 0) return "Today";
          if (diff === 1) return "Yesterday";
          if (diff < 7) return `${diff}d ago`;
          return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        };
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {threads.map(thread => {
              const entries = [...(thread.entries || [])].sort((a, b) => b.createdAt - a.createdAt);
              const unreviewed = entries.filter(e => !e.reviewedAt);
              return (
                <div key={thread.id} className="card" style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 10, flexWrap: "wrap" }}>
                    <div>
                      <div className="cg" style={{ fontSize: 20, color: "#4a3540", fontStyle: "italic" }}>
                        ✦ Notes for {thread.personName}
                      </div>
                      <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.45)", letterSpacing: 1, textTransform: "uppercase", marginTop: 3 }}>
                        {entries.length} total · {unreviewed.length} unreviewed
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent("work-hub-thread-capture-open", { detail: { thread: { id: thread.id, personName: thread.personName } } }))}
                        className="jost"
                        style={{
                          background: "rgba(184,160,212,0.1)", border: "1px solid rgba(184,160,212,0.4)",
                          color: "#9878b8", padding: "5px 12px", borderRadius: 8,
                          fontSize: 10, fontWeight: 600, letterSpacing: 0.3, cursor: "pointer",
                        }}
                      >+ Add note</button>
                      {unreviewed.length > 0 && (
                        <button
                          onClick={() => window.dispatchEvent(new CustomEvent("work-hub-thread-review-open", { detail: { personName: thread.personName } }))}
                          className="jost"
                          style={{
                            background: "linear-gradient(135deg, #b89cd4, #9878b8)", border: "none",
                            color: "#fff", padding: "5px 12px", borderRadius: 8,
                            fontSize: 10, fontWeight: 600, letterSpacing: 0.3, cursor: "pointer",
                          }}
                        >📬 Review ({unreviewed.length})</button>
                      )}
                    </div>
                  </div>
                  {entries.length === 0 ? (
                    <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.4)", fontStyle: "italic", textAlign: "center", padding: "16px 0" }}>
                      No entries yet — drop a note above.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {entries.map(entry => {
                        const u = urgencyMeta[entry.urgency] || urgencyMeta.wait;
                        const isReviewed = !!entry.reviewedAt;
                        return (
                          <div key={entry.id} style={{
                            background: isReviewed ? "rgba(74,53,64,0.03)" : "rgba(255,255,255,0.65)",
                            border: `1px solid ${isReviewed ? "rgba(74,53,64,0.08)" : "rgba(184,160,212,0.22)"}`,
                            borderRadius: 8, padding: "9px 12px",
                            opacity: isReviewed ? 0.65 : 1,
                          }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                              <span style={{ fontSize: 13, marginTop: 1 }}>{typeIcon[entry.type] || "📋"}</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                {editingThreadEntryId === entry.id ? (
                                  <div>
                                    <textarea
                                      autoFocus
                                      value={editingThreadEntryDraft}
                                      onChange={e => setEditingThreadEntryDraft(e.target.value)}
                                      onKeyDown={e => {
                                        if (e.key === "Escape") {
                                          setEditingThreadEntryId(null);
                                          setEditingThreadEntryDraft("");
                                        }
                                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                          const trimmed = editingThreadEntryDraft.trim();
                                          if (!trimmed) return;
                                          const nextThreads = (data.runningThreads || []).map(t => {
                                            if (t.id !== thread.id) return t;
                                            return {
                                              ...t,
                                              entries: (t.entries || []).map(ee =>
                                                ee.id === entry.id ? { ...ee, text: trimmed, summary: trimmed.slice(0, 80) } : ee
                                              ),
                                            };
                                          });
                                          onUpdateData({ ...data, runningThreads: nextThreads });
                                          setEditingThreadEntryId(null);
                                          setEditingThreadEntryDraft("");
                                        }
                                      }}
                                      rows={3}
                                      className="jost"
                                      style={{ width: "100%", boxSizing: "border-box", fontSize: 12.5, padding: "6px 8px", border: "1px solid rgba(184,160,212,0.4)", borderRadius: 6, background: "rgba(255,255,255,0.95)", outline: "none", fontFamily: "'Jost', sans-serif", lineHeight: 1.45, resize: "vertical" }}
                                    />
                                    <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                                      <button
                                        onClick={() => {
                                          const trimmed = editingThreadEntryDraft.trim();
                                          if (!trimmed) return;
                                          const nextThreads = (data.runningThreads || []).map(t => {
                                            if (t.id !== thread.id) return t;
                                            return {
                                              ...t,
                                              entries: (t.entries || []).map(ee =>
                                                ee.id === entry.id ? { ...ee, text: trimmed, summary: trimmed.slice(0, 80) } : ee
                                              ),
                                            };
                                          });
                                          onUpdateData({ ...data, runningThreads: nextThreads });
                                          setEditingThreadEntryId(null);
                                          setEditingThreadEntryDraft("");
                                        }}
                                        disabled={!editingThreadEntryDraft.trim()}
                                        className="jost"
                                        style={{
                                          background: editingThreadEntryDraft.trim() ? "linear-gradient(135deg,#b89cd4,#9878b8)" : "rgba(74,53,64,0.1)",
                                          color: editingThreadEntryDraft.trim() ? "#fff" : "rgba(74,53,64,0.4)",
                                          border: "none", borderRadius: 5,
                                          padding: "3px 9px", fontSize: 10, fontWeight: 600, letterSpacing: 0.3,
                                          cursor: editingThreadEntryDraft.trim() ? "pointer" : "default",
                                        }}
                                      >Save</button>
                                      <button
                                        onClick={() => { setEditingThreadEntryId(null); setEditingThreadEntryDraft(""); }}
                                        className="jost"
                                        style={{
                                          background: "none", border: "none",
                                          color: "rgba(74,53,64,0.5)",
                                          cursor: "pointer", fontSize: 10, padding: "3px 6px",
                                        }}
                                      >Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="jost" style={{ fontSize: 12.5, color: "#4a3540", lineHeight: 1.45 }}>{entry.text}</div>
                                    {entry.linkedItemTitle && (
                                      <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.45)", marginTop: 3, fontStyle: "italic" }}>↳ {entry.linkedItemTitle}</div>
                                    )}
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
                                      <span className="jost" style={{ fontSize: 9, color: u.color, background: u.bg, padding: "2px 7px", borderRadius: 5, letterSpacing: 0.4, textTransform: "uppercase", fontWeight: 600 }}>{u.label}</span>
                                      <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.4)" }}>{fmtDate(entry.createdAt)}</span>
                                      {isReviewed && (
                                        <span className="jost" style={{ fontSize: 9, color: "rgba(74,53,64,0.5)", letterSpacing: 0.4, textTransform: "uppercase", fontWeight: 500 }}>
                                          ✓ {entry.action || "reviewed"}
                                        </span>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                              {editingThreadEntryId !== entry.id && (
                                <button
                                  onClick={() => window.dispatchEvent(new CustomEvent("work-hub-thread-chat-open", { detail: { entryId: entry.id, threadId: thread.id } }))}
                                  title={entry.chatSummary ? "Reopen chat (summary saved)" : entry.chat?.length > 0 ? "Continue chat" : "Bounce ideas with Rosie"}
                                  style={{ background: "none", border: "none", color: entry.chatSummary ? "#9878b8" : "rgba(74,53,64,0.4)", cursor: "pointer", fontSize: 12, padding: "2px 4px", lineHeight: 1, flexShrink: 0 }}
                                >💬{entry.chatSummary ? <sup style={{ fontSize: 7, marginLeft: 1 }}>✦</sup> : null}</button>
                              )}
                              {editingThreadEntryId !== entry.id && (
                                <button
                                  onClick={() => {
                                    setEditingThreadEntryId(entry.id);
                                    setEditingThreadEntryDraft(entry.text || "");
                                  }}
                                  title="Edit"
                                  style={{ background: "none", border: "none", color: "rgba(74,53,64,0.4)", cursor: "pointer", fontSize: 11, padding: "2px 4px", lineHeight: 1, flexShrink: 0 }}
                                >✎</button>
                              )}
                              {editingThreadEntryId !== entry.id && (
                              <button
                                onClick={() => {
                                  if (pendingThreadDeleteId === entry.id) {
                                    // Second click — actually delete
                                    if (pendingThreadDeleteTimerRef.current) {
                                      clearTimeout(pendingThreadDeleteTimerRef.current);
                                      pendingThreadDeleteTimerRef.current = null;
                                    }
                                    setPendingThreadDeleteId(null);
                                    const nextThreads = (data.runningThreads || []).map(t => {
                                      if (t.id !== thread.id) return t;
                                      return { ...t, entries: (t.entries || []).filter(e => e.id !== entry.id) };
                                    });
                                    // Also clean up any reminder created from this entry
                                    const nextReminders = (data.reminders || []).filter(r => r.threadEntryId !== entry.id);
                                    onUpdateData({ ...data, runningThreads: nextThreads, reminders: nextReminders });
                                  } else {
                                    // First click — arm it
                                    setPendingThreadDeleteId(entry.id);
                                    if (pendingThreadDeleteTimerRef.current) clearTimeout(pendingThreadDeleteTimerRef.current);
                                    pendingThreadDeleteTimerRef.current = setTimeout(() => {
                                      setPendingThreadDeleteId(null);
                                      pendingThreadDeleteTimerRef.current = null;
                                    }, 3000);
                                  }
                                }}
                                title={pendingThreadDeleteId === entry.id ? "Click again to confirm" : "Delete this entry"}
                                className="jost"
                                style={pendingThreadDeleteId === entry.id ? {
                                  background: "rgba(212,100,120,0.18)",
                                  border: "1px solid rgba(212,100,120,0.5)",
                                  color: "#c4687a",
                                  cursor: "pointer", fontSize: 9, fontWeight: 600, letterSpacing: 0.3,
                                  padding: "3px 7px", borderRadius: 5, lineHeight: 1, flexShrink: 0,
                                  textTransform: "uppercase",
                                } : {
                                  background: "none", border: "none",
                                  color: "rgba(212,100,120,0.4)",
                                  cursor: "pointer", fontSize: 14, padding: "2px 4px", lineHeight: 1, flexShrink: 0,
                                }}
                              >{pendingThreadDeleteId === entry.id ? "click again" : "×"}</button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* HISTORY — opened via the History pill in the header.
          We MERGE two sources at render time:
            1. `history` (MPC_KEYS.history) — meetings logged via the prep flow inside this tab
            2. `data.meetings` (main storage) — meetings created via the roadmap's quick-prep pill
          Without this merge, a 1:1 prepped from the roadmap would never show up
          in the History pill. Dedupe by id; MPC entries win on collision since
          they have the richest fields (script refinement, notes refinement, etc).
          Sort by createdAt/timestamp desc so newest is first. */}
      {((showHistoryModal || subtab === "history") && (() => {
        const inlineMode = subtab === "history";
        const mpcById = new Map((history || []).map(h => [h.id, h]));
        const merged = [...(history || [])];
        for (const m of (data.meetings || [])) {
          if (mpcById.has(m.id)) continue;
          // Adapt the data.meetings shape to MPC history shape
          merged.push({
            id: m.id,
            title: m.title || m.slotLabel || "Meeting",
            slotLabel: m.slotLabel || "",
            date: m.date || "",
            scheduledTime: m.scheduledTime || "",
            vibe: m.vibe || "warm",
            energy: m.energy || "normal",
            situation: m.situation || "",
            whoWith: m.whoWith || "",
            generated: m.generated || null,
            curveballs: m.curveballs || [],
            fullScript: m.fullScript || null,
            notes: Array.isArray(m.notes) ? m.notes : [], // roadmap meetings store notes as a string (focus-view textarea); history renders an array — guard prevents .map crash
            minutes: m.minutes || null,
            minutesMeta: m.minutesMeta || null,
            createdAt: m.createdAt || Date.now(),
            completedAt: m.completedAt || null,
            _fromRoadmap: true, // marker for any UI affordance differences
          });
        }
        merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        const displayHistory = merged;
        return (
        <div className={inlineMode ? "" : "modal-bg"} onClick={inlineMode ? undefined : e => e.target === e.currentTarget && setShowHistoryModal(false)}>
          <div className={inlineMode ? "" : "modal fade"} style={inlineMode ? {} : { maxWidth: 720, width: "95%", maxHeight: "92vh", overflowY: "auto" }}>
            <div style={inlineMode
              ? { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }
              : { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, position: "sticky", top: -28, paddingTop: 28, marginTop: -28, paddingBottom: 6, background: "#fff8f5", zIndex: 2 }
            }>
              <h2 className="cg" style={{ fontSize: 24, color: "#4a3540", fontStyle: "italic", fontWeight: 400, margin: 0 }}>
                <HistoryIcon size={18} style={{ display: "inline", verticalAlign: "-3px", marginRight: 6, color: "#d4829a" }} /> History
                {displayHistory.length > 0 && <span className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.5)", fontStyle: "normal", fontWeight: 400, marginLeft: 8 }}>· {displayHistory.length}</span>}
              </h2>
              {!inlineMode && (
                <button onClick={() => setShowHistoryModal(false)} className="jost" style={{ background: "none", border: "none", color: "rgba(74,53,64,0.4)", fontSize: 16, cursor: "pointer", padding: 4 }}>✕</button>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {displayHistory.length === 0 ? (
            <div className="card" style={{ padding: "40px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 38, marginBottom: 10 }}>🌸</div>
              <div className="cg" style={{ fontSize: 20, fontStyle: "italic", color: "rgba(74,53,64,0.5)", marginBottom: 4 }}>Nothing here yet</div>
              <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.4)", fontStyle: "italic" }}>Prep a meeting or log notes — they'll all live here.</div>
            </div>
          ) : (
            <>
              <div className="card" style={{ padding: "12px 18px", background: "rgba(253,240,245,0.5)", textAlign: "center" }}>
                <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.7)", fontStyle: "italic" }}>Your meeting trail — preps, notes, and reflections, all saved here. 🌸</div>
              </div>
              {displayHistory.map(m => {
                const isOpen = expandedMeeting === m.id;
                const displayTitle = m.title || (m.whoWith !== "—" ? `With ${m.whoWith}` : "Meeting");
                return (
                  <div key={m.id} className="card" style={{ padding: isOpen ? "18px 20px" : "16px 18px", transition: "padding .2s", border: isOpen ? "1px solid rgba(212,130,154,0.35)" : "1px solid rgba(212,130,154,0.15)" }}>
                    {/* Clickable summary row — clicking the title area opens
                        directly into meeting mode (matches user's expectation
                        from history). The +/- expand button to the right still
                        toggles the inline detail view. */}
                    <div
                      onClick={() => {
                        if (onMeetingFocus) { onMeetingFocus(m); return; }
                        setExpandedMeeting(isOpen ? null : m.id);
                      }}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isOpen ? 14 : 8, cursor: "pointer" }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="jost" style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(74,53,64,0.45)", fontWeight: 500, marginBottom: 2 }}>
                          {formatDate(m.date)}
                          {m.whoWith !== "—" && m.title && <span style={{ marginLeft: 8, textTransform: "none", letterSpacing: 0.5, color: "rgba(74,53,64,0.4)" }}>· with {m.whoWith}</span>}
                        </div>
                        {editingMeetingField?.meetingId === m.id && editingMeetingField?.field === "title" ? (
                          <input
                            autoFocus
                            className="cg"
                            value={meetingFieldDraft}
                            onClick={e => e.stopPropagation()}
                            onChange={e => setMeetingFieldDraft(e.target.value)}
                            onBlur={commitMeetingEdit}
                            onKeyDown={e => { if (e.key === "Enter") commitMeetingEdit(); if (e.key === "Escape") cancelMeetingEdit(); }}
                            placeholder="Meeting title..."
                            style={{ fontSize: 17, color: "#4a3540", fontWeight: 600, width: "100%", border: "1px solid rgba(212,130,154,0.35)", background: "rgba(255,255,255,0.9)", borderRadius: 6, padding: "4px 8px", outline: "none", fontFamily: "'Cormorant Garamond', serif" }}
                          />
                        ) : (
                          <div
                            className="cg"
                            onClick={e => { if (isOpen) { e.stopPropagation(); startMeetingEdit(m.id, "title", m.title || ""); } }}
                            title={isOpen ? "Click to edit title" : ""}
                            style={{ fontSize: 17, fontWeight: 600, color: "#4a3540", cursor: isOpen ? "text" : "pointer", padding: isOpen ? "2px 6px" : 0, marginLeft: isOpen ? -6 : 0, borderRadius: 4, transition: "background .15s" }}
                            onMouseEnter={e => { if (isOpen) e.currentTarget.style.background = "rgba(212,130,154,0.06)"; }}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            {displayTitle}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                        <button
                          onClick={e => { e.stopPropagation(); setExpandedMeeting(isOpen ? null : m.id); }}
                          title={isOpen ? "Hide details" : "Peek details without leaving History"}
                          className="jost"
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            background: "rgba(255,255,255,0.6)",
                            border: "1px solid rgba(74,53,64,0.12)",
                            color: "rgba(74,53,64,0.55)",
                            padding: "3px 9px", borderRadius: 6,
                            fontSize: 10, fontWeight: 500, letterSpacing: 0.3,
                            cursor: "pointer",
                            transition: "background .15s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.95)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.6)"; }}
                        >
                          <span>{isOpen ? "hide" : "view"}</span>
                          <span style={{ color: "rgba(74,53,64,0.45)", fontSize: 13, fontWeight: 600, marginLeft: 1 }}>{isOpen ? "−" : "+"}</span>
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); requestDelete(m.id); }}
                          title={pendingDeleteId === m.id ? "Click again to confirm" : "Delete this meeting"}
                          className="jost"
                          style={{
                            background: pendingDeleteId === m.id ? "#c4687a" : "rgba(196,104,122,0.08)",
                            border: pendingDeleteId === m.id ? "1px solid #c4687a" : "1px solid rgba(196,104,122,0.3)",
                            cursor: "pointer",
                            color: pendingDeleteId === m.id ? "#fff" : "#b86d85",
                            padding: "3px 9px",
                            marginLeft: 6,
                            borderRadius: 6,
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: 0.3,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            transition: "all .15s",
                          }}
                          onMouseEnter={e => {
                            if (pendingDeleteId === m.id) return;
                            e.currentTarget.style.background = "rgba(196,104,122,0.18)";
                            e.currentTarget.style.borderColor = "rgba(196,104,122,0.55)";
                          }}
                          onMouseLeave={e => {
                            if (pendingDeleteId === m.id) return;
                            e.currentTarget.style.background = "rgba(196,104,122,0.08)";
                            e.currentTarget.style.borderColor = "rgba(196,104,122,0.3)";
                          }}
                        >{pendingDeleteId === m.id ? "Click again ✓" : <><X size={11} /> Delete</>}</button>
                      </div>
                    </div>

                    {/* Compact preview when collapsed */}
                    {!isOpen && (
                      <>
                        {m.situation !== "No description" && (
                          <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.65)", marginBottom: 6, fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {m.situation}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <span className="tag jost" style={{ background: "rgba(212,130,154,0.1)", color: "#b86d85" }}>{MPC_VIBES[m.vibe].label}</span>
                          <span className="tag jost" style={{ background: "rgba(196,168,130,0.12)", color: "#9a7850" }}>{MPC_ENERGY[m.energy].label}</span>
                          {m.debrief && <span className="tag jost" style={{ background: "rgba(158,184,154,0.12)", color: "#7a9e78" }}>✓ debriefed</span>}
                          {(m.notes || []).length > 0 && <span className="tag jost" style={{ background: "rgba(184,160,212,0.12)", color: "#9878b8" }}>📝 {m.notes.length} note{m.notes.length === 1 ? "" : "s"}</span>}
                        </div>
                      </>
                    )}

                    {/* Full details when expanded */}
                    {isOpen && (
                      <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.35)", fontStyle: "italic", letterSpacing: 0.3 }}>
                          ✏️ tap any field to edit
                        </div>
                        {/* Meta badges + editable who with */}
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                          <span className="tag jost" style={{ background: "rgba(212,130,154,0.1)", color: "#b86d85" }}>{MPC_VIBES[m.vibe].label}</span>
                          <span className="tag jost" style={{ background: "rgba(196,168,130,0.12)", color: "#9a7850" }}>{MPC_ENERGY[m.energy].label}</span>
                          {editingMeetingField?.meetingId === m.id && editingMeetingField?.field === "whoWith" ? (
                            <input
                              autoFocus
                              className="jost"
                              value={meetingFieldDraft}
                              onChange={e => setMeetingFieldDraft(e.target.value)}
                              onBlur={commitMeetingEdit}
                              onKeyDown={e => { if (e.key === "Enter") commitMeetingEdit(); if (e.key === "Escape") cancelMeetingEdit(); }}
                              placeholder="Who's this with?"
                              style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, border: "1px solid rgba(212,130,154,0.35)", background: "rgba(255,255,255,0.9)", color: "#4a3540", outline: "none", fontFamily: "'Jost', sans-serif", width: 200 }}
                            />
                          ) : (
                            <span
                              className="tag jost"
                              onClick={() => startMeetingEdit(m.id, "whoWith", m.whoWith === "—" ? "" : m.whoWith)}
                              title="Click to edit"
                              style={{ background: "rgba(74,53,64,0.05)", color: "rgba(74,53,64,0.55)", cursor: "text", border: "1px dashed rgba(74,53,64,0.15)" }}
                            >
                              {m.whoWith !== "—" ? `with ${m.whoWith}` : "+ add who"}
                            </span>
                          )}
                        </div>

                        {/* Editable situation */}
                        <div>
                          <div className="jost" style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(74,53,64,0.45)", fontWeight: 600, marginBottom: 4 }}>Situation</div>
                          {editingMeetingField?.meetingId === m.id && editingMeetingField?.field === "situation" ? (
                            <textarea
                              autoFocus
                              className="ifield jost"
                              value={meetingFieldDraft}
                              onChange={e => setMeetingFieldDraft(e.target.value)}
                              onBlur={commitMeetingEdit}
                              onKeyDown={e => { if (e.key === "Escape") cancelMeetingEdit(); if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commitMeetingEdit(); }}
                              placeholder="What was this meeting about?"
                              style={{ fontSize: 13, minHeight: 70, resize: "vertical", lineHeight: 1.5 }}
                            />
                          ) : (
                            <div
                              className="jost"
                              onClick={() => startMeetingEdit(m.id, "situation", m.situation === "No description" ? "" : m.situation)}
                              title="Click to edit"
                              style={{ fontSize: 13, color: m.situation === "No description" ? "rgba(74,53,64,0.35)" : "rgba(74,53,64,0.8)", background: "rgba(212,130,154,0.06)", padding: "10px 14px", borderRadius: 8, lineHeight: 1.5, cursor: "text", fontStyle: m.situation === "No description" ? "italic" : "normal", transition: "background .15s" }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(212,130,154,0.1)"}
                              onMouseLeave={e => e.currentTarget.style.background = "rgba(212,130,154,0.06)"}
                            >
                              {m.situation === "No description" ? "+ Add situation description" : m.situation}
                            </div>
                          )}
                        </div>

                        {/* Editable opener */}
                        <div>
                          <div className="jost" style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(74,53,64,0.45)", fontWeight: 600, marginBottom: 4 }}>Your opener</div>
                          {editingMeetingField?.meetingId === m.id && editingMeetingField?.field === "opener" ? (
                            <textarea
                              autoFocus
                              className="ifield jost"
                              value={meetingFieldDraft}
                              onChange={e => setMeetingFieldDraft(e.target.value)}
                              onBlur={commitMeetingEdit}
                              onKeyDown={e => { if (e.key === "Escape") cancelMeetingEdit(); if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commitMeetingEdit(); }}
                              style={{ fontSize: 15, minHeight: 60, resize: "vertical", lineHeight: 1.5, fontStyle: "italic", background: "rgba(255,252,245,0.9)", borderColor: "rgba(196,168,130,0.35)", fontFamily: "'Cormorant Garamond', serif" }}
                            />
                          ) : (
                            <p
                              className="cg"
                              onClick={() => startMeetingEdit(m.id, "opener", m.opener)}
                              title="Click to edit"
                              style={{ fontSize: 15, lineHeight: 1.6, color: "#4a3540", margin: 0, fontStyle: "italic", background: "rgba(255,252,245,0.7)", padding: "12px 14px", borderRadius: 8, border: "1px solid rgba(196,168,130,0.15)", cursor: "text", transition: "background .15s" }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,252,245,0.95)"}
                              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,252,245,0.7)"}
                            >
                              "{m.opener}"
                            </p>
                          )}
                        </div>

                        {/* Curveballs */}
                        {(m.curveballs || []).length > 0 && (
                          <div>
                            <div className="jost" style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(74,53,64,0.45)", fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}>
                              <Shield size={10} /> Curveballs prepared
                            </div>
                            {m.curveballs.map((c, ci) => (
                              <div key={ci} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.5)", borderLeft: "2px solid #e8a0b4", borderRadius: 6, marginBottom: 5 }}>
                                <div className="jost" style={{ fontSize: 12, fontWeight: 600, color: "#b86d85", marginBottom: 3 }}>{c.q}</div>
                                <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.7)", lineHeight: 1.5 }}>{c.a}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Full meeting script (if built) */}
                        {m.fullScript ? (
                          <div style={{ padding: "14px 16px", background: "linear-gradient(135deg, rgba(255,252,245,0.8), rgba(253,245,240,0.6))", border: "1px solid rgba(196,168,130,0.25)", borderRadius: 10 }}>
                            <div className="jost" style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#9a7850", fontWeight: 600, marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
                              <Sparkles size={11} /> Full meeting script
                            </div>
                            {/* Main arc */}
                            {["opening", "agenda", "main_points", "transitions", "closing"].map(key => {
                              const section = m.fullScript[key];
                              if (!section) return null;
                              return (
                                <div key={key} style={{ marginBottom: 10, paddingBottom: 8, borderBottom: "1px dashed rgba(196,168,130,0.2)" }}>
                                  <div className="jost" style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "#9a7850", fontWeight: 600, marginBottom: 5 }}>
                                    {section.title}
                                  </div>
                                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                                    {(section.bullets || []).map((b, bi) => {
                                      const isEditing = editingBullet?.scope === "history" && editingBullet?.meetingId === m.id && editingBullet?.sectionKey === key && editingBullet?.bulletIndex === bi;
                                      return (
                                        <li key={bi} className="jost" style={{ fontSize: 12, lineHeight: 1.5, color: "rgba(74,53,64,0.8)", padding: "3px 0 3px 14px", position: "relative", display: "flex", alignItems: "flex-start", gap: 4 }}>
                                          <span style={{ position: "absolute", left: 0, top: 9, width: 4, height: 4, borderRadius: "50%", background: "#c4a882" }} />
                                          {isEditing ? (
                                            <textarea
                                              autoFocus
                                              className="jost"
                                              value={bulletDraft}
                                              onChange={e => setBulletDraft(e.target.value)}
                                              onBlur={commitBulletEdit}
                                              onKeyDown={e => { if (e.key === "Escape") cancelBulletEdit(); if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitBulletEdit(); } }}
                                              style={{ flex: 1, fontSize: 12, lineHeight: 1.45, background: "rgba(255,255,255,0.95)", border: "1px solid rgba(196,168,130,0.45)", borderRadius: 5, padding: "3px 7px", outline: "none", fontFamily: "'Jost', sans-serif", color: "#4a3540", resize: "vertical", minHeight: 26 }}
                                            />
                                          ) : (
                                            <>
                                              <span
                                                onClick={() => startBulletEdit("history", key, bi, b, m.id)}
                                                title="Click to edit"
                                                style={{ flex: 1, cursor: "text", padding: "1px 3px", marginLeft: -3, borderRadius: 3, transition: "background .15s" }}
                                                onMouseEnter={e => e.currentTarget.style.background = "rgba(196,168,130,0.08)"}
                                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                              >
                                                {b}
                                              </span>
                                              <button
                                                onClick={() => deleteBullet("history", m.id, key, bi)}
                                                title="Delete bullet"
                                                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(196,168,130,0.5)", padding: "1px 5px", fontSize: 11, lineHeight: 1, opacity: 0.5 }}
                                                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                                onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                                              >×</button>
                                            </>
                                          )}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                  <button
                                    onClick={() => addBulletToSection("history", m.id, key)}
                                    className="jost"
                                    style={{ background: "none", border: "none", color: "rgba(196,168,130,0.55)", cursor: "pointer", fontSize: 10, padding: "3px 0 0 14px", fontStyle: "italic", fontFamily: "'Jost', sans-serif" }}
                                  >+ add bullet</button>
                                </div>
                              );
                            })}
                            {/* Collapsible sideways sections */}
                            {["if_offtopic", "if_tense"].map(key => {
                              const section = m.fullScript[key];
                              if (!section) return null;
                              const stateKey = `${m.id}:${key}`;
                              const open = !!historyScriptSections[stateKey];
                              const color = key === "if_tense" ? "#c4687a" : "#9878b8";
                              const bg = key === "if_tense" ? "rgba(212,100,120,0.06)" : "rgba(184,160,212,0.06)";
                              const border = key === "if_tense" ? "rgba(212,100,120,0.25)" : "rgba(184,160,212,0.25)";
                              return (
                                <div key={key} style={{ marginBottom: 6, border: `1px solid ${border}`, borderRadius: 8, background: bg, overflow: "hidden" }}>
                                  <button
                                    onClick={() => setHistoryScriptSections(prev => ({ ...prev, [stateKey]: !prev[stateKey] }))}
                                    className="jost"
                                    style={{ width: "100%", padding: "8px 12px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "inherit", textAlign: "left" }}
                                  >
                                    <span style={{ fontSize: 11, fontWeight: 600, color, letterSpacing: 0.3 }}>
                                      {key === "if_tense" ? "⚠️" : "💭"} {section.title}
                                    </span>
                                    <span style={{ color, fontSize: 13, opacity: 0.7, fontWeight: 600 }}>{open ? "−" : "+"}</span>
                                  </button>
                                  {open && (
                                    <div className="fade" style={{ padding: "0 12px 10px" }}>
                                      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                                        {(section.bullets || []).map((b, bi) => {
                                          const isEditing = editingBullet?.scope === "history" && editingBullet?.meetingId === m.id && editingBullet?.sectionKey === key && editingBullet?.bulletIndex === bi;
                                          return (
                                            <li key={bi} className="jost" style={{ fontSize: 12, lineHeight: 1.5, color: "rgba(74,53,64,0.8)", padding: "3px 0 3px 14px", position: "relative", display: "flex", alignItems: "flex-start", gap: 4 }}>
                                              <span style={{ position: "absolute", left: 0, top: 9, width: 4, height: 4, borderRadius: "50%", background: color }} />
                                              {isEditing ? (
                                                <textarea
                                                  autoFocus
                                                  className="jost"
                                                  value={bulletDraft}
                                                  onChange={e => setBulletDraft(e.target.value)}
                                                  onBlur={commitBulletEdit}
                                                  onKeyDown={e => { if (e.key === "Escape") cancelBulletEdit(); if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitBulletEdit(); } }}
                                                  style={{ flex: 1, fontSize: 12, lineHeight: 1.45, background: "rgba(255,255,255,0.95)", border: `1px solid ${color}60`, borderRadius: 5, padding: "3px 7px", outline: "none", fontFamily: "'Jost', sans-serif", color: "#4a3540", resize: "vertical", minHeight: 26 }}
                                                />
                                              ) : (
                                                <>
                                                  <span
                                                    onClick={() => startBulletEdit("history", key, bi, b, m.id)}
                                                    title="Click to edit"
                                                    style={{ flex: 1, cursor: "text", padding: "1px 3px", marginLeft: -3, borderRadius: 3, transition: "background .15s" }}
                                                    onMouseEnter={e => e.currentTarget.style.background = bg}
                                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                                  >
                                                    {b}
                                                  </span>
                                                  <button
                                                    onClick={() => deleteBullet("history", m.id, key, bi)}
                                                    title="Delete bullet"
                                                    style={{ background: "none", border: "none", cursor: "pointer", color, padding: "1px 5px", fontSize: 11, lineHeight: 1, opacity: 0.5 }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                                                  >×</button>
                                                </>
                                              )}
                                            </li>
                                          );
                                        })}
                                      </ul>
                                      <button
                                        onClick={() => addBulletToSection("history", m.id, key)}
                                        className="jost"
                                        style={{ background: "none", border: "none", color: `${color}99`, cursor: "pointer", fontSize: 10, padding: "3px 0 0 14px", fontStyle: "italic", fontFamily: "'Jost', sans-serif" }}
                                      >+ add bullet</button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <button
                            onClick={() => buildScriptForMeeting(m.id)}
                            disabled={buildingScriptFor === m.id}
                            className="jost"
                            style={{
                              background: buildingScriptFor === m.id ? "rgba(196,168,130,0.15)" : "rgba(196,168,130,0.08)",
                              border: "1px dashed rgba(196,168,130,0.4)",
                              color: "#9a7850",
                              padding: "10px 14px",
                              borderRadius: 8,
                              cursor: buildingScriptFor === m.id ? "wait" : "pointer",
                              fontSize: 12,
                              fontWeight: 500,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              width: "fit-content",
                            }}
                          >
                            <Sparkles size={12} /> {buildingScriptFor === m.id ? "Rosie's writing it..." : "+ Build full script for this meeting"}
                          </button>
                        )}

                        {/* Rosie refinement chat — for tweaking this historical meeting */}
                        <div style={{ padding: "14px 16px", background: "linear-gradient(135deg, rgba(253,240,245,0.7), rgba(255,248,251,0.55))", border: "1px solid rgba(212,130,154,0.2)", borderRadius: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <span style={{ fontSize: 14 }}>🌸</span>
                            <div className="jost" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#b86d85", fontWeight: 600 }}>Chat with Rosie</div>
                          </div>
                          <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)", fontStyle: "italic", marginBottom: 10, lineHeight: 1.5 }}>
                            Adjust the opener, curveballs, script, or sideways sections.
                          </div>

                          {/* Conversation history */}
                          {(historyRefineChats[m.id] || []).length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10, maxHeight: 220, overflowY: "auto" }}>
                              {historyRefineChats[m.id].map((msg, mi) => (
                                <div key={mi} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                                  <div className="jost" style={{
                                    fontSize: 11,
                                    lineHeight: 1.5,
                                    padding: "7px 11px",
                                    borderRadius: 10,
                                    maxWidth: "85%",
                                    background: msg.role === "user" ? "rgba(212,130,154,0.15)" : "rgba(255,255,255,0.85)",
                                    color: msg.role === "user" ? "#4a3540" : "rgba(74,53,64,0.85)",
                                    border: msg.role === "user" ? "1px solid rgba(212,130,154,0.25)" : "1px solid rgba(212,130,154,0.15)",
                                    fontStyle: msg.role === "rosie" ? "italic" : "normal",
                                  }}>
                                    {msg.role === "rosie" && <span style={{ marginRight: 3 }}>🌸</span>}
                                    {msg.text}
                                  </div>
                                </div>
                              ))}
                              {historyRefineLoading === m.id && (
                                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                  <div className="jost pulse" style={{ fontSize: 10, color: "rgba(184,109,133,0.7)", padding: "4px 8px", fontStyle: "italic" }}>
                                    🌸 Rosie's thinking…
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Suggestion chips — only show before first message */}
                          {(historyRefineChats[m.id] || []).length === 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
                              {[
                                "Make the opener warmer",
                                "Add a curveball",
                                "Soften 'if tense'",
                                "Shorten the script",
                              ].map(suggestion => (
                                <button
                                  key={suggestion}
                                  onClick={() => setHistoryRefineInput(prev => ({ ...prev, [m.id]: suggestion }))}
                                  className="jost"
                                  style={{
                                    fontSize: 10,
                                    padding: "3px 9px",
                                    background: "rgba(212,130,154,0.08)",
                                    border: "1px solid rgba(212,130,154,0.2)",
                                    borderRadius: 12,
                                    color: "#b86d85",
                                    cursor: "pointer",
                                    fontFamily: "'Jost', sans-serif",
                                  }}
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Input row */}
                          <div style={{ display: "flex", gap: 6 }}>
                            <input
                              className="ifield jost"
                              placeholder="Ask Rosie to adjust anything..."
                              value={historyRefineInput[m.id] || ""}
                              onChange={e => setHistoryRefineInput(prev => ({ ...prev, [m.id]: e.target.value }))}
                              onKeyDown={e => { if (e.key === "Enter" && historyRefineLoading !== m.id) submitHistoryRefine(m.id); }}
                              disabled={historyRefineLoading === m.id}
                              style={{ flex: 1, fontSize: 11, padding: "7px 10px", background: "rgba(255,255,255,0.9)" }}
                            />
                            <button
                              onClick={() => submitHistoryRefine(m.id)}
                              disabled={!(historyRefineInput[m.id] || "").trim() || historyRefineLoading === m.id}
                              className="btn jost"
                              style={{
                                flexShrink: 0,
                                padding: "0 12px",
                                fontSize: 11,
                                fontWeight: 600,
                                background: (!(historyRefineInput[m.id] || "").trim() || historyRefineLoading === m.id) ? "rgba(212,130,154,0.25)" : "linear-gradient(135deg,#d4829a,#b86d85)",
                                color: "#fff",
                                border: "none",
                                cursor: (!(historyRefineInput[m.id] || "").trim() || historyRefineLoading === m.id) ? "not-allowed" : "pointer",
                              }}
                            >
                              Ask
                            </button>
                          </div>
                        </div>

                        {/* Debrief / win — editable */}
                        {m.debrief && (
                          <div style={{ padding: "12px 14px", background: "rgba(158,184,154,0.1)", borderRadius: 8, border: "1px solid rgba(158,184,154,0.2)" }}>
                            <div className="jost" style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#7a9e78", fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                              <Trophy size={10} /> Your win
                            </div>
                            {/* Felt */}
                            {editingMeetingField?.meetingId === m.id && editingMeetingField?.path === "debrief.feeling" ? (
                              <input
                                autoFocus
                                className="jost"
                                value={meetingFieldDraft}
                                onChange={e => setMeetingFieldDraft(e.target.value)}
                                onBlur={commitMeetingEdit}
                                onKeyDown={e => { if (e.key === "Enter") commitMeetingEdit(); if (e.key === "Escape") cancelMeetingEdit(); }}
                                placeholder="how it felt..."
                                style={{ fontSize: 13, width: "100%", padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(158,184,154,0.4)", background: "rgba(255,255,255,0.85)", outline: "none", fontFamily: "'Jost', sans-serif", marginBottom: 4 }}
                              />
                            ) : (
                              <div
                                className="jost"
                                onClick={() => startMeetingEdit(m.id, "debrief", m.debrief?.feeling || "", "debrief.feeling")}
                                title="Click to edit"
                                style={{ fontSize: 13, color: m.debrief.feeling ? "rgba(74,53,64,0.8)" : "rgba(74,53,64,0.35)", marginBottom: 4, cursor: "text", padding: "2px 6px", marginLeft: -6, borderRadius: 4, transition: "background .15s", fontStyle: m.debrief.feeling ? "normal" : "italic" }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(158,184,154,0.15)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                              >
                                <strong>Felt:</strong> {m.debrief.feeling || "+ add how it felt"}
                              </div>
                            )}
                            {/* What worked */}
                            {editingMeetingField?.meetingId === m.id && editingMeetingField?.path === "debrief.win" ? (
                              <textarea
                                autoFocus
                                className="jost"
                                value={meetingFieldDraft}
                                onChange={e => setMeetingFieldDraft(e.target.value)}
                                onBlur={commitMeetingEdit}
                                onKeyDown={e => { if (e.key === "Escape") cancelMeetingEdit(); if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commitMeetingEdit(); }}
                                placeholder="what went well..."
                                style={{ fontSize: 13, width: "100%", padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(158,184,154,0.4)", background: "rgba(255,255,255,0.85)", outline: "none", fontFamily: "'Jost', sans-serif", lineHeight: 1.5, minHeight: 50, resize: "vertical" }}
                              />
                            ) : (
                              <div
                                className="jost"
                                onClick={() => startMeetingEdit(m.id, "debrief", m.debrief?.win || "", "debrief.win")}
                                title="Click to edit"
                                style={{ fontSize: 13, color: m.debrief.win ? "rgba(74,53,64,0.8)" : "rgba(74,53,64,0.35)", cursor: "text", padding: "2px 6px", marginLeft: -6, borderRadius: 4, transition: "background .15s", fontStyle: m.debrief.win ? "normal" : "italic" }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(158,184,154,0.15)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                              >
                                <strong>What worked:</strong> {m.debrief.win || "+ add what worked"}
                              </div>
                            )}
                          </div>
                        )}
                        {/* Add debrief if missing */}
                        {!m.debrief && (
                          <button
                            onClick={() => { const updated = history.map(x => x.id === m.id ? { ...x, debrief: { feeling: "", win: "", savedAt: new Date().toISOString() } } : x); setHistory(updated); saveMpc(MPC_KEYS.history, updated); }}
                            className="jost"
                            style={{ background: "rgba(158,184,154,0.08)", border: "1px dashed rgba(158,184,154,0.3)", color: "#7a9e78", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, width: "fit-content" }}
                          >
                            <Trophy size={12} /> + Add a debrief / win
                          </button>
                        )}

                        {/* Notes entries — each with its full breakdown */}
                        {(m.notes || []).length > 0 && (
                          <div>
                            <div className="jost" style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#9878b8", fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                              <FileText size={11} /> Notes logged ({m.notes.length})
                            </div>
                            {m.notes.map((n, ni) => (
                              <div key={ni} style={{ padding: "12px 14px", background: "rgba(184,160,212,0.06)", borderRadius: 8, border: "1px solid rgba(184,160,212,0.18)", marginBottom: 8 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                  <div className="jost" style={{ fontSize: 11, color: "rgba(152,120,184,0.9)", fontWeight: 500 }}>
                                    {new Date(n.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                                  </div>
                                  <button
                                    onClick={() => { if (confirm("Delete this note entry? (The Work Hub items already created will stay.)")) deleteNoteFromMeeting(m.id, n.id); }}
                                    title="Delete this note entry"
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(152,120,184,0.5)", padding: 2, fontSize: 14, lineHeight: 1 }}
                                  >×</button>
                                </div>

                                {/* Editable summary */}
                                {editingMeetingField?.meetingId === m.id && editingMeetingField?.path === `note:${n.id}:parsed.summary` ? (
                                  <textarea
                                    autoFocus
                                    className="jost"
                                    value={meetingFieldDraft}
                                    onChange={e => setMeetingFieldDraft(e.target.value)}
                                    onBlur={commitMeetingEdit}
                                    onKeyDown={e => { if (e.key === "Escape") cancelMeetingEdit(); if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commitMeetingEdit(); }}
                                    placeholder="quick summary..."
                                    style={{ fontSize: 12, width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(184,160,212,0.4)", background: "rgba(255,255,255,0.85)", outline: "none", fontFamily: "'Jost', sans-serif", lineHeight: 1.5, minHeight: 50, resize: "vertical", fontStyle: "italic", marginBottom: 10 }}
                                  />
                                ) : n.parsed?.summary ? (
                                  <div
                                    className="jost"
                                    onClick={() => startMeetingEdit(m.id, "note_summary", n.parsed.summary, `note:${n.id}:parsed.summary`)}
                                    title="Click to edit"
                                    style={{ fontSize: 12, color: "rgba(74,53,64,0.8)", fontStyle: "italic", lineHeight: 1.5, marginBottom: 10, paddingBottom: 8, borderBottom: "1px dashed rgba(184,160,212,0.3)", cursor: "text" }}
                                  >
                                    {n.parsed.summary}
                                  </div>
                                ) : null}

                                {(n.parsed?.actionItems || []).length > 0 && (
                                  <div style={{ marginBottom: 8 }}>
                                    <div className="jost" style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#b86d85", fontWeight: 600, marginBottom: 4 }}>Action items</div>
                                    {n.parsed.actionItems.map((a, ai) => (
                                      <div key={ai} className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.85)", padding: "3px 22px 3px 14px", position: "relative", lineHeight: 1.5 }}>
                                        <span style={{ position: "absolute", left: 0, top: 9, width: 4, height: 4, borderRadius: "50%", background: a.owner === "me" ? "#d4829a" : "rgba(74,53,64,0.3)" }} />
                                        <span style={{ fontWeight: a.owner === "me" ? 600 : 400 }}>{a.title}</span>
                                        {a.owner === "me" && <span className="jost" style={{ fontSize: 10, color: "#7a9e78", marginLeft: 6, fontStyle: "italic" }}>(yours)</span>}
                                        {a.owner !== "me" && a.owner && <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.45)", marginLeft: 6, fontStyle: "italic" }}>({a.owner})</span>}
                                        <button
                                          onClick={() => removeNoteItem(m.id, n.id, "actionItems", ai)}
                                          title="Remove this item"
                                          style={{ position: "absolute", right: 0, top: 2, background: "none", border: "none", cursor: "pointer", color: "rgba(212,130,154,0.4)", padding: "2px 6px", fontSize: 12, lineHeight: 1 }}
                                        >×</button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {(n.parsed?.decisions || []).length > 0 && (
                                  <div style={{ marginBottom: 8 }}>
                                    <div className="jost" style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#7a9e78", fontWeight: 600, marginBottom: 4 }}>🎯 Decisions</div>
                                    {n.parsed.decisions.map((d, di) => (
                                      <div key={di} className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.8)", padding: "3px 22px 3px 14px", position: "relative", lineHeight: 1.5 }}>
                                        <span style={{ position: "absolute", left: 0, top: 9, width: 4, height: 4, borderRadius: "50%", background: "#9eb89a" }} />
                                        {typeof d === "string" ? d : d.decision || d.text}
                                        <button
                                          onClick={() => removeNoteItem(m.id, n.id, "decisions", di)}
                                          title="Remove"
                                          style={{ position: "absolute", right: 0, top: 2, background: "none", border: "none", cursor: "pointer", color: "rgba(158,184,154,0.5)", padding: "2px 6px", fontSize: 12, lineHeight: 1 }}
                                        >×</button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {(n.parsed?.openQuestions || []).length > 0 && (
                                  <div style={{ marginBottom: 8 }}>
                                    <div className="jost" style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#9878b8", fontWeight: 600, marginBottom: 4 }}>❓ Open questions</div>
                                    {n.parsed.openQuestions.map((q, qi) => (
                                      <div key={qi} className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.8)", padding: "3px 22px 3px 14px", position: "relative", lineHeight: 1.5 }}>
                                        <span style={{ position: "absolute", left: 0, top: 9, width: 4, height: 4, borderRadius: "50%", background: "#b8a0d4" }} />
                                        {typeof q === "string" ? q : q.question || q.text}
                                        <button
                                          onClick={() => removeNoteItem(m.id, n.id, "openQuestions", qi)}
                                          title="Remove"
                                          style={{ position: "absolute", right: 0, top: 2, background: "none", border: "none", cursor: "pointer", color: "rgba(184,160,212,0.5)", padding: "2px 6px", fontSize: 12, lineHeight: 1 }}
                                        >×</button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {(n.parsed?.risks || []).length > 0 && (
                                  <div style={{ marginBottom: 8 }}>
                                    <div className="jost" style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#c4687a", fontWeight: 600, marginBottom: 4 }}>⚠️ Risks</div>
                                    {n.parsed.risks.map((r, ri) => (
                                      <div key={ri} className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.8)", padding: "3px 22px 3px 14px", position: "relative", lineHeight: 1.5 }}>
                                        <span style={{ position: "absolute", left: 0, top: 9, width: 4, height: 4, borderRadius: "50%", background: "#d4829a" }} />
                                        {typeof r === "string" ? r : r.risk || r.text}
                                        <button
                                          onClick={() => removeNoteItem(m.id, n.id, "risks", ri)}
                                          title="Remove"
                                          style={{ position: "absolute", right: 0, top: 2, background: "none", border: "none", cursor: "pointer", color: "rgba(212,130,154,0.5)", padding: "2px 6px", fontSize: 12, lineHeight: 1 }}
                                        >×</button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {n.parsed?.nextMeeting && (n.parsed.nextMeeting.when || n.parsed.nextMeeting.focus) && (
                                  <div style={{ marginTop: 8, padding: "8px 10px", background: "rgba(196,168,130,0.1)", borderRadius: 6 }}>
                                    <div className="jost" style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#9a7850", fontWeight: 600, marginBottom: 3 }}>🗓️ Next meeting</div>
                                    {n.parsed.nextMeeting.when && <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.8)" }}><strong>When:</strong> {n.parsed.nextMeeting.when}</div>}
                                    {n.parsed.nextMeeting.focus && <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.8)" }}><strong>Focus:</strong> {n.parsed.nextMeeting.focus}</div>}
                                  </div>
                                )}

                                {n.rawNotes && (
                                  <details style={{ marginTop: 8 }}>
                                    <summary className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.4)", cursor: "pointer", letterSpacing: 1, textTransform: "uppercase", fontWeight: 500 }}>Raw notes</summary>
                                    <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.65)", lineHeight: 1.5, marginTop: 6, padding: "8px 10px", background: "rgba(74,53,64,0.04)", borderRadius: 6, whiteSpace: "pre-wrap" }}>{n.rawNotes}</div>
                                  </details>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quill minutes — read-only view of generated meeting minutes */}
                        {m.minutes && (
                          <div>
                            <div className="jost" style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#9a8650", fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 5 }}>
                              <span>🪶 Minutes{m.minutesMeta?.date ? ` · ${m.minutesMeta.date}` : ""}</span>
                              {onMeetingFocus && (
                                <button
                                  onClick={() => onMeetingFocus(m)}
                                  className="jost"
                                  title="Reopen this meeting to add action items to Work Hub, copy minutes, etc."
                                  style={{
                                    background: "rgba(212,130,154,0.1)",
                                    border: "1px solid rgba(212,130,154,0.35)",
                                    color: "#b86d85",
                                    fontSize: 9.5, fontWeight: 600, letterSpacing: 0.3,
                                    padding: "3px 9px", borderRadius: 6, cursor: "pointer",
                                    textTransform: "none",
                                  }}
                                >Open in meeting mode →</button>
                              )}
                            </div>
                            <div style={{ padding: "12px 14px", background: "rgba(194,162,92,0.06)", borderRadius: 8, border: "1px solid rgba(194,162,92,0.22)", display: "flex", flexDirection: "column", gap: 10 }}>
                              {m.minutes.rosieNote && (
                                <div className="jost" style={{ fontSize: 12, fontStyle: "italic", color: "#b86d85", padding: "8px 10px", background: "rgba(212,130,154,0.07)", borderRadius: 6, borderLeft: "2px solid rgba(212,130,154,0.4)" }}>
                                  {m.minutes.rosieNote} — Rosie
                                </div>
                              )}
                              {m.minutes.summary && (
                                <div className="jost" style={{ fontSize: 12.5, color: "rgba(74,53,64,0.8)", lineHeight: 1.55 }}>{m.minutes.summary}</div>
                              )}
                              {(m.minutes.decisions || []).length > 0 && (
                                <div>
                                  <div className="jost" style={{ fontSize: 9.5, letterSpacing: 1.2, textTransform: "uppercase", color: "#c1734f", fontWeight: 600, marginBottom: 4 }}>Decisions</div>
                                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                                    {m.minutes.decisions.map((x, xi) => <li key={xi} className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.75)", lineHeight: 1.5, marginBottom: 2 }}>{x}</li>)}
                                  </ul>
                                </div>
                              )}
                              {(m.minutes.actionItems || []).length > 0 && (
                                <div>
                                  <div className="jost" style={{ fontSize: 9.5, letterSpacing: 1.2, textTransform: "uppercase", color: "#7a9e78", fontWeight: 600, marginBottom: 4 }}>Action items</div>
                                  {m.minutes.actionItems.map((a, ai) => (
                                    <div key={ai} className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.78)", lineHeight: 1.5, marginBottom: 3 }}>
                                      <span style={{ fontWeight: 600 }}>{a.owner}</span> — {a.task}{a.due ? <span style={{ color: "rgba(74,53,64,0.5)", fontStyle: "italic" }}> ({a.due})</span> : null}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {[
                                ["Minutes", m.minutes.minutes, "#9878b8"],
                                ["Open questions", m.minutes.openQuestions, "#b86d85"],
                                ["Next steps", m.minutes.nextSteps, "#9a8650"],
                              ].map(([label, items, color]) => (items || []).length > 0 && (
                                <div key={label}>
                                  <div className="jost" style={{ fontSize: 9.5, letterSpacing: 1.2, textTransform: "uppercase", color, fontWeight: 600, marginBottom: 4 }}>{label}</div>
                                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                                    {items.map((x, xi) => <li key={xi} className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.75)", lineHeight: 1.5, marginBottom: 2 }}>{x}</li>)}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
          </div>
        </div>
        );
      })())}

      {/* MORE */}
      {subtab === "more" && (
        <>
          {moreView === "menu" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { key: "checklist", emoji: "☑️", title: "Pre-meeting checklist", desc: "Water, notecard, one breath ✓" },
                { key: "tips", emoji: "💡", title: "Tips & cheat sheet", desc: "The unwritten rules, written" },
                { key: "settings", emoji: "⚙️", title: "Settings", desc: "Reset data, about Rosie" },
              ].map(x => (
                <button key={x.key} onClick={() => setMoreView(x.key)} className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left", width: "100%", fontFamily: "inherit", border: "1px solid rgba(212,130,154,0.15)" }}>
                  <div style={{ fontSize: 24 }}>{x.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div className="cg" style={{ fontSize: 16, fontWeight: 600, color: "#4a3540", marginBottom: 2 }}>{x.title}</div>
                    <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.45)", fontStyle: "italic" }}>{x.desc}</div>
                  </div>
                  <ChevronRight size={16} color="#d4829a" />
                </button>
              ))}
            </div>
          )}

          {moreView === "checklist" && (
            <>
              <button className="btn ghost jost" onClick={() => setMoreView("menu")} style={{ fontSize: 11, padding: "5px 12px", marginBottom: 10, display: "inline-flex", alignItems: "center", gap: 5 }}><ChevronLeft size={11} /> Back</button>
              <div className="card" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div className="cg" style={{ fontSize: 17, fontWeight: 600, color: "#4a3540" }}>Pre-meeting checklist</div>
                  <button className="btn ghost jost" onClick={() => setChecklist({ water: false, notecard: false, breath: false, bathroom: false, phone: false })} style={{ fontSize: 10, padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: 4 }}><RefreshCw size={10} /> Reset</button>
                </div>
                <div style={{ height: 5, background: "rgba(212,130,154,0.12)", borderRadius: 3, marginBottom: 14, overflow: "hidden" }}>
                  <div style={{ width: `${(checklistDone / checklistItems.length) * 100}%`, height: "100%", background: "linear-gradient(90deg, #e8a0b4, #d4829a)", transition: "width .4s" }} />
                </div>
                {checklistItems.map(item => (
                  <button key={item.key} onClick={() => setChecklist({ ...checklist, [item.key]: !checklist[item.key] })} className="jost" style={{ width: "100%", padding: "12px", background: checklist[item.key] ? "rgba(212,130,154,0.08)" : "rgba(255,255,255,0.5)", border: `1px solid ${checklist[item.key] ? "rgba(212,130,154,0.3)" : "rgba(212,130,154,0.12)"}`, borderRadius: 10, marginBottom: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left", fontFamily: "inherit", transition: "all .2s" }}>
                    {checklist[item.key] ? <CheckSquare size={18} color="#d4829a" fill="rgba(212,130,154,0.15)" /> : <Square size={18} color="#d4829a" />}
                    <span style={{ fontSize: 13, color: "rgba(74,53,64,0.8)", textDecoration: checklist[item.key] ? "line-through" : "none", opacity: checklist[item.key] ? 0.6 : 1 }}>{item.label}</span>
                  </button>
                ))}
                {checklistDone === checklistItems.length && (
                  <div className="fade" style={{ marginTop: 14, padding: 14, background: "linear-gradient(135deg, rgba(212,130,154,0.15), rgba(232,160,180,0.2))", borderRadius: 10, textAlign: "center", border: "1px solid rgba(212,130,154,0.25)" }}>
                    <div style={{ fontSize: 26, marginBottom: 4 }}>🌸</div>
                    <div className="cg" style={{ fontSize: 18, color: "#b86d85", fontStyle: "italic", marginBottom: 2 }}>You're ready, babe.</div>
                    <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.6)" }}>Go shine. I'll be here when you're back. ✿</div>
                  </div>
                )}
              </div>
            </>
          )}

          {moreView === "tips" && (
            <>
              <button className="btn ghost jost" onClick={() => setMoreView("menu")} style={{ fontSize: 11, padding: "5px 12px", marginBottom: 10, display: "inline-flex", alignItems: "center", gap: 5 }}><ChevronLeft size={11} /> Back</button>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {MPC_CHEATSHEET.map((section, i) => (
                  <div key={i} className="card" style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 20 }}>{section.icon}</span>
                      <div className="cg" style={{ fontSize: 16, fontWeight: 600, color: "#4a3540" }}>{section.title}</div>
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {section.tips.map((tip, j) => (
                        <li key={j} className="jost" style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(74,53,64,0.8)", padding: "5px 0 5px 16px", position: "relative" }}>
                          <span style={{ position: "absolute", left: 0, top: 12, width: 5, height: 5, borderRadius: "50%", background: "#d4829a" }} />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          )}

          {moreView === "settings" && (
            <>
              <button className="btn ghost jost" onClick={() => setMoreView("menu")} style={{ fontSize: 11, padding: "5px 12px", marginBottom: 10, display: "inline-flex", alignItems: "center", gap: 5 }}><ChevronLeft size={11} /> Back</button>
              <div className="card" style={{ padding: "20px 22px", textAlign: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 30, marginBottom: 6 }}>🌸</div>
                <div className="cg" style={{ fontSize: 20, fontStyle: "italic", color: "#4a3540", marginBottom: 6 }}>About Rosie</div>
                <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.6)", lineHeight: 1.6 }}>Your pocket coach for meetings. Designed for real humans with real brains. Everything saved stays on your device.</div>
              </div>
              <div className="card" style={{ padding: "16px 18px", marginBottom: 12 }}>
                <div className="cg" style={{ fontSize: 14, fontWeight: 600, color: "#4a3540", marginBottom: 6 }}>Backup & restore</div>
                <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.5)", marginBottom: 12, lineHeight: 1.5 }}>Your data lives with this artifact — it doesn't follow the code into a new chat. Export a backup here, then import it wherever the app runs next.</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn ghost jost" onClick={() => exportHubBackup(data)} style={{ flex: 1, padding: "10px", justifyContent: "center", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                    <FileDown size={12} /> Export backup
                  </button>
                  <button className="btn ghost jost" onClick={() => { setImportError(""); importFileRef.current && importFileRef.current.click(); }} style={{ flex: 1, padding: "10px", justifyContent: "center", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                    <FileText size={12} /> Import backup
                  </button>
                  <input ref={importFileRef} type="file" accept=".json,application/json" onChange={handleImportFile} style={{ display: "none" }} />
                </div>
                {importError && <div className="jost" style={{ fontSize: 11, color: "#b86d85", marginTop: 10, lineHeight: 1.5 }}>{importError}</div>}
                {pendingImport && (
                  <div className="fade" style={{ marginTop: 12, padding: "12px 14px", background: "rgba(194,162,92,0.08)", border: "1px solid rgba(194,162,92,0.3)", borderRadius: 8 }}>
                    <div className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.8)", lineHeight: 1.55, marginBottom: 10 }}>
                      This backup has <strong>{(pendingImport.items || []).length} items</strong>, <strong>{(pendingImport.meetings || []).length} meetings</strong>, and <strong>{(pendingImport.roadmapHistory || []).length} roadmap days</strong>. Importing replaces everything here — your current data downloads as a safety backup first.
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn rose jost" onClick={confirmImport} style={{ flex: 1, padding: "9px", display: "flex", justifyContent: "center", fontSize: 12 }}>Import & replace</button>
                      <button className="btn ghost jost" onClick={() => setPendingImport(null)} style={{ flex: 1, padding: "9px", display: "flex", justifyContent: "center", fontSize: 12 }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="card" style={{ padding: "16px 18px" }}>
                <div className="cg" style={{ fontSize: 14, fontWeight: 600, color: "#4a3540", marginBottom: 6 }}>Reset all data</div>
                <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.5)", marginBottom: 12, lineHeight: 1.5 }}>Clears your history, favorites, streak, and wins. Can't be undone.</div>
                {!resetConfirm ? (
                  <button className="btn ghost jost" onClick={() => setResetConfirm(true)} style={{ width: "100%", padding: "10px", justifyContent: "center", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                    <Trash2 size={12} /> Reset everything
                  </button>
                ) : (
                  <div>
                    <div className="cg jost" style={{ fontSize: 13, color: "#b86d85", fontStyle: "italic", textAlign: "center", padding: "8px 0", marginBottom: 8 }}>Are you sure?</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn rose jost" onClick={resetAll} style={{ flex: 1, padding: "10px", display: "flex", justifyContent: "center", fontSize: 12 }}>Yes, reset</button>
                      <button className="btn ghost jost" onClick={() => setResetConfirm(false)} style={{ flex: 1, padding: "10px", display: "flex", justifyContent: "center", fontSize: 12 }}>Keep it</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      <div className="jost" style={{ textAlign: "center", marginTop: 24, fontSize: 10, color: "rgba(74,53,64,0.35)", fontStyle: "italic", letterSpacing: 1.5 }}>rosie's rooting for you ✿</div>

      {/* PANIC MODAL */}
      {panicMode && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setPanicMode(false)}>
          <div className="modal fade" style={{ maxWidth: 420, padding: "26px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>🌸</div>
            <div className="jost" style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(212,130,154,0.85)", fontWeight: 600, marginBottom: 6 }}>Rosie says</div>
            <div className="cg" style={{ fontSize: 22, color: "#4a3540", fontStyle: "italic", lineHeight: 1.4, marginBottom: 16 }}>{mpcPick(MPC_PANIC)}</div>
            <div style={{ padding: 14, background: "rgba(255,252,245,0.8)", borderRadius: 10, marginBottom: 12, border: "1px solid rgba(196,168,130,0.25)", textAlign: "left" }}>
              <div className="sl jost" style={{ marginBottom: 4 }}>Your shortest line</div>
              <p className="cg" style={{ fontSize: 14, color: "#4a3540", margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>"Hi, I'm Lexy, Project Coordinator on Implementation. Thanks for the time."</p>
            </div>
            <div style={{ padding: 12, background: "rgba(212,130,154,0.08)", borderRadius: 10, marginBottom: 16 }}>
              <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.7)", lineHeight: 1.5 }}>Breathe in for 4 • Hold for 4 • Out for 6<br/><em style={{ color: "rgba(74,53,64,0.5)" }}>Do it twice. I'll wait.</em></div>
            </div>
            <button className="btn rose jost" onClick={() => setPanicMode(false)} style={{ width: "100%", padding: "12px" }}>I'm ready 💗</button>
          </div>
        </div>
      )}

      {/* DEBRIEF MODAL */}
      {debriefOpen && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setDebriefOpen(false)}>
          <div className="modal fade" style={{ maxWidth: 440, padding: "24px" }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>🌸</div>
              <div className="cg" style={{ fontSize: 20, fontStyle: "italic", color: "#4a3540", marginBottom: 4 }}>How'd it go, babe?</div>
              <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.45)", fontStyle: "italic" }}>Optional. Skip if you want. No pressure.</div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label className="sl jost">How are you feeling right now?</label>
              <input className="ifield jost" value={debriefFeeling} onChange={e => setDebriefFeeling(e.target.value)} placeholder="e.g. relieved, proud, tired, good" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="sl jost">One thing that went well?</label>
              <textarea className="ifield jost" value={debriefWin} onChange={e => setDebriefWin(e.target.value)} placeholder="e.g. I didn't rush my intro. I remembered to smile first." style={{ minHeight: 60, resize: "vertical", lineHeight: 1.5 }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn rose jost" onClick={saveDebrief} style={{ flex: 1, padding: "12px" }}>Save my win 💗</button>
              <button className="btn ghost jost" onClick={() => setDebriefOpen(false)} style={{ padding: "12px 14px" }}>Skip</button>
            </div>
          </div>
        </div>
      )}

      {/* Recurring meetings modal — opened from the Schedule subtab */}
      {showRecurringModal && (
        <RecurringMeetingsModal data={data} onUpdate={onUpdateData} onClose={() => setShowRecurringModal(false)} />
      )}
    </div>
  );
}
