// 08-app-main.js
// Top-level App component (export default).

// Minimal stub to satisfy <AgentLauncher> usage until the real component lands.
function AgentLauncher() { return null; }

// ── App Root ──────────────────────────────────────────────────────────────────

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  EMAIL & TEAMS HUB — feature module (added in this revision)         ║
// ║  Self-contained: own storage namespace (eh_v3_*), own Rosie persona  ║
// ║  (askEmailRosie), own palette (EH_P), CSS namespaced with eh- prefix.║
// ║  Renders as the third top-level tab in App.                          ║
// ╚══════════════════════════════════════════════════════════════════════╝


// ============== PALETTE ==============
const EH_P = {
  rose:        '#e8829a',
  blush:       '#f4b8c8',
  softBlush:   '#fce8ef',
  warmWhite:   '#fffaf7',
  cream:       '#fdf6f0',
  dusty:       '#d4637a',
  darkRose:    '#8b3a52',
  mauve:       '#c97a8f',
  gold:        '#e8c99a',
  softGold:    '#fdf0dc',
  green:       '#7aba9a',
  greenBg:     '#e8f5ee',
  greenDark:   '#3d7a5a',
  text:        '#3d1f2a',
  textMid:     '#7a4a58',
  textLight:   '#b07a8a',
  lavender:    '#c4b8d8',
  lavBg:       '#f0ecf8',
  border:      '#f0d8df',
  borderSoft:  '#f8e4ec',
  teamsPurple: '#9d8bc4',
};

const STANDING_DEFAULTS = {
  "Project Sponsor/Manager Name": "Rob Anderson",
  "Project Sponsor": "Rob Anderson",
  "Sponsor Name": "Rob Anderson",
  "Sponsor": "Rob Anderson",
  "Backup contact": "[set in settings]",
  "Last Name": "[your last name]",
};

// ============== CHANNELS ==============
const CHANNELS = [
  { id: 'email', label: 'Email', emoji: '💌', color: EH_P.dusty,        accent: EH_P.softBlush },
  { id: 'teams', label: 'Teams', emoji: '💬', color: EH_P.teamsPurple,  accent: EH_P.lavBg },
];

// ============== CATEGORIES ==============
const CATEGORIES = [
  // Email categories
  { id: 'core',       label: 'Core',        emoji: '🌸', color: EH_P.dusty,       channel: 'email' },
  { id: 'vendor',     label: 'Vendor',      emoji: '🤝', color: EH_P.mauve,       channel: 'email' },
  { id: 'leadership', label: 'Leadership',  emoji: '🌟', color: EH_P.gold,        channel: 'email' },
  { id: 'team',       label: 'Team',        emoji: '🌿', color: EH_P.green,       channel: 'email' },
  { id: 'compliance', label: 'Compliance',  emoji: '🌱', color: EH_P.lavender,    channel: 'email' },
  { id: 'lifecycle',  label: 'Lifecycle',   emoji: '🌷', color: EH_P.rose,        channel: 'email' },
  { id: 'signature',  label: 'Signatures',  emoji: '✨', color: EH_P.blush,       channel: 'email' },
  // Teams categories
  { id: 't_kickoff',  label: 'Kickoffs',    emoji: '🚀', color: EH_P.teamsPurple, channel: 'teams' },
  { id: 't_status',   label: 'Status',      emoji: '📋', color: EH_P.teamsPurple, channel: 'teams' },
  { id: 't_followup', label: 'Follow-ups',  emoji: '🔔', color: EH_P.teamsPurple, channel: 'teams' },
  { id: 't_blocker',  label: 'Blockers',    emoji: '⚠️', color: EH_P.teamsPurple, channel: 'teams' },
  { id: 't_wrap',     label: 'Wins',        emoji: '🎉', color: EH_P.teamsPurple, channel: 'teams' },
  { id: 't_quick',    label: 'Quick asks',  emoji: '💭', color: EH_P.teamsPurple, channel: 'teams' },
];

// ============== ALL TEMPLATES (61 email + 19 Teams = 80) ==============
const TEMPLATES = [
  // ============ EMAIL — CORE 22 ============
  { id: 'c1', channel: 'email', category: 'core', name: 'Vendor Follow-Up Nudge', description: 'Vendor went quiet on something specific', subject: 'Following up — [Project/Topic]',
    body: `Hi [Name],

Floating this back up in case my note from [date] got buried — wanted to check in on [specific item].

For context, we're aiming to [downstream milestone] by [date], so getting this squared away would help us stay on track. Let me know if there's anything I can do on my end to help move it along.

Thanks,
Lexy` },
  { id: 'c2', channel: 'email', category: 'core', name: 'Vendor Info / Document Request', description: 'Need specific docs from a vendor', subject: 'Documentation request — [Project name]',
    body: `Hi [Name],

Hope your week is off to a good start. As we get [project] moving, would you be able to share the following?
• [Document 1]
• [Document 2]
• [Document 3]

Aiming for [date] so we have time to review before [next milestone / dependency]. If anything will be tricky to pull together by then, let me know — happy to talk through alternatives or adjust timing where I can.

Thanks so much,
Lexy` },
  { id: 'c3', channel: 'email', category: 'core', name: 'Vendor Kickoff + Agenda', description: 'Locking in kickoff and setting the table', subject: 'Kickoff confirmed — [Project name] — [Date]',
    body: `Hi [Name],

Glad we're getting this on the calendar — confirming our kickoff for [Project] on [Date] at [Time] [Time Zone]. Calendar invite is on its way.

Here's what I'd like to walk through together:
• Introductions and roles on both sides
• Project scope, goals, and success criteria
• High-level timeline and key milestones
• Communication cadence and primary points of contact
• Open questions or concerns from either side

By the end, I'm hoping we'll have alignment on next steps and a date locked in for [first milestone]. If there's anything you'd like to add or shift, send it my way before [date] and I'll work it in.

Looking forward to it,
Lexy` },
  { id: 'c4', channel: 'email', category: 'core', name: 'Status Request', description: 'Need a real update with specific questions', subject: 'Quick check-in — [Item/Project]',
    body: `Hi [Name],

Checking in on [item] — could you share where things are sitting? Specifically curious about:
• [Specific question 1]
• [Specific question 2]

Asking because [downstream task / handoff] is queued up for [date], and I want to make sure we're set up to transition smoothly. If anything is looking like it might slip, even better to know now so I can adjust on this end.

Thanks,
Lexy` },
  { id: 'c5', channel: 'email', category: 'core', name: 'Looping You In', description: 'Intro between two people who haven\'t met', subject: 'Intro — [Person A] / [Person B] re: [Topic]',
    body: `Hi both,

Connecting you two — I think you'll be a great resource for each other.

[Person A], meet [Person B] — they're [role/context] and the right person to talk to about [topic].

[Person B], [Person A] is working on [project/need] and could use [type of expertise/info]. I'll let you both take it from here, but let me know if I can help in any way.

Thanks,
Lexy` },
  { id: 'c6', channel: 'email', category: 'core', name: 'Team Outreach (Confirm Role)', description: 'Inviting someone to join the team', subject: '[Project name] — would love to have you on the team',
    body: `Hi [Name],

[Project Sponsor/Manager Name] and I have been pulling together the team for [Project name], and your name came up immediately — your work on [related thing / your expertise area] would be a real asset. Wanted to share what we're thinking and see if it's a fit for your bandwidth:
• Project: [brief description and why it matters]
• Proposed role: [specific contribution]
• Estimated time commitment: [X hours/week or total]
• Project timeline: [start] – [end]
• Kickoff: [date]

Would you be open to joining? A few ways this can land:
• Yes, count me in — just reply and I'll add you to the kickoff
• Interested, but need to check with my manager first — totally fine, just let me know your timeline
• Not the right fit for me, but I can suggest someone better suited — even better, please pass along their name
• Not able to take this on right now — no problem at all, appreciate the honest answer

If you could let me know by [date] (or earlier if it's an easy yes), that would be wonderful. I'd rather have the right person on the team than the first person, so please don't feel pressure to say yes if it's not a good fit.

Hope to have you on board — and thanks either way for considering it.

Thanks,
Lexy` },
  { id: 'c7', channel: 'email', category: 'core', name: 'Meeting Recap + Actions', description: 'After every working meeting', subject: 'Recap — [Meeting name] — [Date]',
    body: `Hi all,

Thanks for a productive discussion today. Quick recap so we're all aligned:

Decisions:
• [Decision 1]
• [Decision 2]

Action items (as I captured them — please flag anything I missed or misheard):
• [Owner] — [Action] — Target [Date]
• [Owner] — [Action] — Target [Date]
• [Owner] — [Action] — Target [Date]

Parked for later:
• [Topic to revisit + when]

Next meeting: [Date/Time]

If anything on this list looks off, send a reply and I'll update.

Thanks,
Lexy` },
  { id: 'c8', channel: 'email', category: 'core', name: 'Action Item Reminder', description: 'Nudging on an upcoming due date', subject: 'Friendly reminder — [Action item] coming up [Date]',
    body: `Hi [Name],

A gentle nudge that [action item] has a target date of [date] — wanted to make sure it didn't sneak up on you.

If you're tracking well, no need to reply. If you've hit a snag or it's looking like the date might shift, give me a heads-up so I can adjust [downstream item] accordingly.

Thanks,
Lexy` },
  { id: 'c9', channel: 'email', category: 'core', name: 'SME Engagement Request', description: 'Asking an SME for specific input', subject: 'Could use your expertise — [Topic] for [Project]',
    body: `Hi [Name],

We're working through [topic/issue] on [Project], and your expertise as the [area] SME would help us get this right.

What would be most helpful, if you have the bandwidth:
• Specific input needed: [Specific question or deliverable]
• Estimated time: [X minutes/hours]
• Hoping to wrap by: [Date — and why this date if relevant]

Whatever works best for you — I can send context ahead of time and get your thoughts via email, or we can grab 15-20 minutes if it's quicker to talk through. And if your bandwidth isn't there right now, let me know and we can figure out timing or another path.

Thanks so much in advance,
Lexy` },
  { id: 'c10', channel: 'email', category: 'core', name: 'Weekly RAG Status', description: 'Standing weekly update to sponsor', subject: '[Project name] — Weekly Status — [Date]',
    body: `Hi [Name],

Here's where we are on [Project] this week.

Status: 🟢 Green / 🟡 Amber / 🔴 Red
Change from last week: [Improved / Held steady / Slipped — why]

Progress this week:
• [Key update 1]
• [Key update 2]
• [Key update 3]

Focus next week:
• [Planned item 1]
• [Planned item 2]

Risks I'm tracking:
• [Risk + likelihood + what I'm doing about it, or "None at this time"]

Where I could use your support:
• [Specific ask, or "All clear right now"]

Happy to walk through anything in more detail — let me know.

Thanks,
Lexy` },
  { id: 'c11', channel: 'email', category: 'core', name: 'Risk / Blocker Escalation', description: 'Bringing real issue to leadership', subject: 'Heads-up — [Project] — [Brief description]',
    body: `Hi [Name],

Wanted to bring something on [Project] to your attention so we can figure out the best path forward together.

What's happening: [What's wrong]
Severity: Probability [High/Med/Low] × Impact [High/Med/Low]
Impact if unaddressed: [Specific impact — timeline slip, budget exposure, scope, compliance/regulatory risk]
What I've tried or explored already: [1-2 sentences showing pre-work]

Options I see from here:
• [Option 1] — [pros/cons + rough cost or impact]
• [Option 2] — [pros/cons + rough cost or impact]

My recommendation: [Suggested path] because [brief why]

A decision by [date] would let us [downstream impact]. Happy to walk through the trade-offs whenever works for you, or via email if that's easier.

Thanks,
Lexy` },
  { id: 'c12', channel: 'email', category: 'core', name: 'Decision / Approval Request', description: 'Need sign-off with options laid out', subject: 'Could use your input — [Topic] — by [Date]',
    body: `Hi [Name],

When you have a few minutes, could I get your sign-off on [item] for [Project]?

Quick context: [1-2 sentences — what and why now]

Options I've weighed:
• [Option 1] — [trade-offs]
• [Option 2] — [trade-offs]

My recommendation: [Suggested path] because [brief why]

If [date] works on your end, we'll be set up to [downstream milestone]. Beyond that, we'd be looking at [delay or impact]. Happy to chat through if anything needs clarifying.

Thanks so much,
Lexy` },
  { id: 'c13', channel: 'email', category: 'core', name: 'Vendor Due Diligence (VOS)', description: 'Kicking off VOS package collection', subject: 'Vendor Onboarding — [Vendor name] — Due Diligence Information',
    body: `Hi [Name],

Welcome aboard, and thanks for partnering with us. As part of our standard vendor onboarding at Fort Financial, our compliance team will need a due diligence package — fairly standard items, but sharing the full list so you have a heads-up on what's coming:
• SOC 1 / SOC 2 Type II report (most recent)
• Certificate of Insurance
• Information security policy summary
• Business continuity / disaster recovery plan
• Financial statements (most recent audited)
• Completed security questionnaire (attached)

Aiming for [Date] so we can complete review and have you fully approved by [target go-live or next milestone]. If any of these aren't applicable to your engagement or you'd like to talk through alternatives, let me know — happy to walk through any of it or connect you with our compliance team directly.

Thanks so much,
Lexy` },
  { id: 'c14', channel: 'email', category: 'core', name: 'Project Closure Memo', description: 'Officially closing a project', subject: '[Project name] — All wrapped up',
    body: `Hi all,

[Project name] is officially closed as of [date]. Big thanks to everyone who put in the time and energy to make this happen.

Outcomes vs. what we set out to do:
• [Original goal] → [Result]
• [Original goal] → [Result]
• [Original goal] → [Result]

What happens from here:
• Ongoing ownership: [Name/team]
• Documentation lives: [Location/link]
• Open items rolled to BAU: [List or "None"]
• Questions post-close: [Contact]

Lessons learned doc to follow once I've gathered input from the team. Truly appreciate everyone's contributions on this one.

Thanks again,
Lexy` },
  { id: 'c15', channel: 'email', category: 'core', name: 'Quick Clarifying Question', description: 'One-off question, no wrapper needed', subject: 'Quick question when you have a sec — [Topic]',
    body: `Hi [Name],

A quick one for you when you have a moment — [specific question]?

Thanks!
Lexy` },
  { id: 'c16', channel: 'email', category: 'core', name: 'Calendar Hold / Save the Date', description: 'Blocking time before formal invite', subject: 'Save the date — [Meeting/Event] — [Date]',
    body: `Hi all,

Putting a hold on your calendars for [meeting/event] on [Date] at [Time]. Formal invite with full agenda will follow by [date].

Quick context so you can plan:
• Topic: [What we're discussing]
• Who's expected: [Names or groups]
• Time commitment: [Duration]
• Why it matters: [Brief]

If you already know you'll have a conflict, give me a heads-up and I'll see what I can do before sending the formal invite. Otherwise, more details to come.

Thanks,
Lexy` },
  { id: 'c17', channel: 'email', category: 'core', name: 'Pushback / Polite No', description: 'Declining without burning bridges', subject: '[Topic] — let\'s talk through this',
    body: `Hi [Name],

Thanks for raising [request/idea] — wanted to be transparent about where I'm landing on it.

Where I'm landing: This isn't something we can fit into [current scope/phase/timeline] without [specific impact — pushing X back, descoping Y, exceeding budget by Z].

Why: [1-2 sentences with the actual reasoning]

What I can offer instead:
• [Alternative 1 — e.g., revisit in next phase]
• [Alternative 2 — e.g., scaled-down version now]
• [Alternative 3 — e.g., escalate to sponsor for trade-off decision]

Open to talking it through if you'd like, or if there's context I'm missing that might change the picture. Just want to be upfront so we don't lose time.

Thanks,
Lexy` },
  { id: 'c18', channel: 'email', category: 'core', name: 'Connect for a Quick Sync', description: 'Proposing brief meeting with options', subject: 'Quick sync — [Topic] — proposed times',
    body: `Hi [Name],

Could we grab [15/20/30 minutes] to talk through [topic]? It'll be more efficient than going back and forth on email, and I want to make sure we get aligned on [specific outcome — decision, next step, etc.].

A few times that work on my end:
• [Option 1 — day, time]
• [Option 2 — day, time]
• [Option 3 — day, time]

If none of those work, send back a few that do and I'll find us something. Happy to share an agenda ahead of time so we use the time well.

Thanks,
Lexy` },
  { id: 'c19', channel: 'email', category: 'core', name: 'Stage Gate / Go-No-Go', description: 'Formal go/no-go decision needed', subject: '[Project] — [Gate name] go/no-go decision needed by [Date]',
    body: `Hi [Name],

We're at [stage gate name] on [Project], and need to formalize a go/no-go decision before moving into [next phase].

Where we stand:
• Phase to date: [What's complete]
• Exit criteria met: [Yes / No / Partial — with detail]
• Outstanding items: [List or "None"]

Recommendation: [GO / NO-GO / CONDITIONAL GO with conditions] because [reasoning grounded in exit criteria].

Risks to a "go" decision:
• [Risk 1] — Probability/Impact: [H/M/L × H/M/L] — Mitigation: [brief]
• [Risk 2] — Probability/Impact: [H/M/L × H/M/L] — Mitigation: [brief]

Cost of delay: [What happens if we wait — timeline slippage, dependency impact, opportunity cost]

Need your decision by [date] to keep [next milestone] on critical path. Documentation packet attached for the record. Happy to walk through any of it.

Thanks,
Lexy` },
  { id: 'c20', channel: 'email', category: 'core', name: 'At-Risk Status / Recovery', description: 'Project slipped, here\'s the recovery', subject: '[Project] — moved to [Amber/Red] — recovery plan attached',
    body: `Hi [Name],

I'm shifting [Project] to [Amber/Red] this week and want to be transparent with you about why and what I'm doing about it.

What's happening: [Specific facts — what slipped, by how much, when noticed]

Impact:
• Timeline: [Specific delay or slip]
• Budget: [If applicable]
• Scope: [If applicable]
• Downstream dependencies: [Other projects/teams affected]

Root cause (initial assessment): [Brief — vendor delay, scope creep, resource gap, technical issue, etc.]

Recovery plan:
• [Action 1] — Owner: [Name] — By: [Date]
• [Action 2] — Owner: [Name] — By: [Date]
• [Action 3] — Owner: [Name] — By: [Date]

What I need from you: [Specific ask, or "Awareness for now — I'll bring options if escalation is needed"]

Next checkpoint: [Date] — I'll have an updated status and confidence level by then.

Available to walk through whenever works.

Thanks,
Lexy` },
  { id: 'c21', channel: 'email', category: 'core', name: 'Change Request Acknowledgment', description: 'Formal scope change request received', subject: 'Change request received — [Project] — [Brief description]',
    body: `Hi [Name],

Thanks for raising this — confirming I've received your change request for [Project]. Logging it now and walking it through our change control process.

What I captured:
• Requested change: [Brief description]
• Reason / business driver: [Why]
• Requested by: [Name + role]
• Date received: [Date]

What happens next:
• Initial impact assessment (timeline, budget, scope, risk): by [date]
• Review with [project sponsor / change control board / steering committee]: [date]
• Decision back to you: by [date]

If approved, we'll incorporate into the plan and update affected stakeholders. If not approved or modified, I'll loop back with the reasoning and any alternatives.

If anything in what I captured looks off, send a reply and I'll update the log. Otherwise, I'll be in touch by [date].

Thanks,
Lexy` },
  { id: 'c22', channel: 'email', category: 'core', name: 'Escalation to Sponsor', description: 'When you\'re blocked above your authority', subject: '[Project] — could use your support to unblock [issue]',
    body: `Hi [Name],

Coming to you because I've hit something I can't resolve at my level and need your support to keep [Project] on track.

What's blocking us: [Specific issue]
Why it's beyond my authority: [Cross-functional dispute, resource decision, executive alignment, vendor relationship, etc.]
What I've tried: [1-2 sentences — shows I exhausted my options first]

Impact if unresolved by [date]:
• [Specific impact 1]
• [Specific impact 2]

What would help most from you:
• [Specific ask — e.g., "a 15-min call with [other stakeholder]" / "sign-off on [decision]" / "escalation to [executive]"]

Happy to put together any prep materials you'd want, or walk through the situation in more detail. Just let me know what would be most useful.

Thanks,
Lexy` },

  // ============ EMAIL — VENDOR 10 ============
  { id: 'v1', channel: 'email', category: 'vendor', name: 'Initial Outreach', description: 'First time contacting a new vendor', subject: 'Hello from Fort Financial Credit Union',
    body: `Hi [Name],

I'm Lexy [Last Name], Project Coordinator at Fort Financial Credit Union — nice to (virtually) meet you. We're exploring [topic/solution] for [brief context — why it matters to us], and your name came up as a great first contact at [Vendor].

If you have a few minutes, I'd love your input on a few starting questions:
• [Question 1]
• [Question 2]
• [Question 3]

Whatever's easiest for you — a quick email reply works great, or I'm happy to send any materials your way.

Looking forward to connecting,
Lexy` },
  { id: 'v2', channel: 'email', category: 'vendor', name: 'Contract / Redline Follow-Up', description: 'Chasing legal review status', subject: 'Following up — [Vendor] contract review',
    body: `Hi [Name],

Checking in on the [contract/MSA/SOW] for [project] — any updates from your legal team on the redlines we sent over [date]?

We're aiming to have signatures finalized by [date] so we can stay on track for [project milestone]. If anything in the redlines is sparking questions or holding things up, please reach out — happy to clarify or set up a quick call between teams to get over the line.

Thanks so much,
Lexy` },
  { id: 'v3', channel: 'email', category: 'vendor', name: 'Second Follow-Up / Re-Engagement', description: 'When the first nudge didn\'t land', subject: 'Reconnecting — [Project/Topic]',
    body: `Hi [Name],

Wanted to circle back on [topic] — I know things get busy, so gently bumping this up so it doesn't slip off either of our plates.

If priorities have shifted on your end, no worries at all — let me know where things stand and we can take it from there.

Thanks,
Lexy` },
  { id: 'v4', channel: 'email', category: 'vendor', name: 'Mid-Implementation Check-In', description: 'Pulse check during long implementation', subject: '[Project] — checking in',
    body: `Hi [Name],

We're [X weeks] into the [Project] implementation and I wanted to do a quick pulse check from your side:
• Is [current phase] tracking the way you'd hoped?
• Any blockers or concerns I should know about — even ones still forming?
• Anything you need from us to keep things moving?

I'll send a written update from our side by [date] so you have visibility into where we are too. And if it'd be useful to set up a 30-minute touch base, just say the word.

Thanks,
Lexy` },
  { id: 'v5', channel: 'email', category: 'vendor', name: 'Timeline / Scope Change Notice', description: 'Letting vendor know things shifted', subject: '[Project] — update on timeline/scope',
    body: `Hi [Name],

Wanted to give you a heads-up that [Project] has had a [timeline/scope] adjustment on our end.

What's changing: [Brief description]
Why: [Reason]
New target date / scope: [Details]
What this might mean for your team: [Impact]

Please let me know if this raises any concerns — happy to talk through it and figure out adjustments together if needed.

Thanks for your flexibility,
Lexy` },
  { id: 'v6', channel: 'email', category: 'vendor', name: 'Issue Escalation to Vendor', description: 'Flagging a problem on their end', subject: '[Project] — could use your help on something',
    body: `Hi [Name],

Wanted to flag something on the [Project] implementation that I'd like to work through with your team.

What we're seeing: [Description]
Why it matters: [What it's blocking + impact on timeline]
First noticed: [Date]
What we've tried or ruled out on our end: [1-2 sentences]

What would help most: [Specific ask from their team]
Hoping for resolution by: [Date — and why this date]

Happy to jump on a quick call if that'll move things along faster. Let me know what works.

Thanks,
Lexy` },
  { id: 'v7', channel: 'email', category: 'vendor', name: 'UAT Coordination', description: 'Getting UAT scheduled', subject: '[Project] — let\'s get UAT on the calendar',
    body: `Hi [Name],

We're getting ready to schedule UAT for [Project] and wanted to share what I'm thinking:
• Test window: [Date range]
• Test environment: [Details]
• Testers from our side: [Names/roles]
• Test scenarios: [Attached or summarized]
• What "pass" looks like: [Criteria]

Do those dates work on your end, or would you like to suggest some adjustments? Once we're aligned, I'll send out a kickoff note to the testing group.

Thanks,
Lexy` },
  { id: 'v8', channel: 'email', category: 'vendor', name: 'Go-Live Confirmation', description: 'Locking in launch day with both sides', subject: '[Project] — go-live confirmed for [Date]',
    body: `Hi [Name],

We're officially good to go — confirming go-live for [Project] on [Date] at [Time].

Day-of contacts on our side:
• [Name] — [Role] — [Phone/email]
• [Name] — [Role] — [Phone/email]

Escalation path if anything goes sideways: [Name + how to reach them]

When you have a chance, would you mind sharing your day-of contact info as well? Looking forward to launching this with you — thanks for everything you've put into it.

Lexy` },
  { id: 'v9', channel: 'email', category: 'vendor', name: 'Wrap-Up + BAU Handoff', description: 'Transition to ongoing support', subject: '[Project] — transitioning into ongoing support',
    body: `Hi [Name],

Hard to believe [Project] is wrapping up already. Thanks so much for all the work you put into making implementation a success.

As we shift into ongoing support, here's how the handoff is shaping up:
• Ongoing point of contact (FFCU): [Name + role]
• Ongoing point of contact (vendor): [Confirm or update]
• Support process: [Ticket system, email, etc.]
• Standing meeting cadence: [If any]
• Final documentation: [Where it lives]

Truly appreciated the partnership through implementation — looking forward to continuing to work together.

Thanks,
Lexy` },
  { id: 'v10', channel: 'email', category: 'vendor', name: 'Thank You / Close', description: 'Ending engagement on a high note', subject: 'Thank you — [Project]',
    body: `Hi [Name],

A quick note to say thank you for all your work on [Project]. [Specific thing they did well] really made a difference, and it was a pleasure collaborating with you.

Hope our paths cross again soon.

Thanks,
Lexy` },

  // ============ EMAIL — LEADERSHIP 4 ============
  { id: 'l1', channel: 'email', category: 'leadership', name: 'Project Charter Approval', description: 'Sending the charter for sign-off', subject: 'Approval request — [Project] charter',
    body: `Hi [Name],

Attaching the project charter for [Project] for your review. Quick highlights:
• Objective: [One line]
• Scope: [One line]
• Timeline: [Start – end]
• Budget: [If applicable]
• Key risks: [1–2 items]

If [date] works for sign-off on your end, we'll be set to kick off on schedule and hit our [first milestone] target. If you have questions or want to talk through any section first, happy to walk through whenever works for you.

Thanks so much,
Lexy` },
  { id: 'l2', channel: 'email', category: 'leadership', name: 'Milestone Hit', description: 'Sharing a quick win with sponsors', subject: '[Project] — [Milestone] complete 🎉',
    body: `Hi [Name],

Quick win to share — [Project] hit [milestone] on [date], [right on schedule / X days ahead of schedule].

What this means: [Brief impact]
Up next: [Next milestone + target date]

Big thanks to the team for the effort getting us here.

Thanks,
Lexy` },
  { id: 'l3', channel: 'email', category: 'leadership', name: 'Resource / Budget Request', description: 'Asking leadership for more', subject: 'Request — additional [resource/budget] for [Project]',
    body: `Hi [Name],

Wanted to bring something to your attention. [Project] is going to need additional [resource/budget] to stay on track, and I'd like to walk through the case with you.

What I'm requesting: [Specific number/role/dollar amount]
Why now: [Reason — scope change, risk emerged, faster path identified, etc.]
If approved: [Specific outcome — timeline preserved, risk reduced, etc.]
If not approved: [Specific trade-off — delay, descope, increased risk]
What I've already explored: [Internal resources, scope adjustments, etc. — shows pre-work]

If you could weigh in by [date] that would let us [downstream impact]. Happy to walk through it whenever works for you.

Thanks so much,
Lexy` },
  { id: 'l4', channel: 'email', category: 'leadership', name: 'Steering Committee Pre-Read', description: 'Pre-read for steering meetings', subject: '[Project] — Steering Committee pre-read — [Date]',
    body: `Hi all,

Sharing the pre-read for [date] steering committee — full deck attached.

Status: [Green/Amber/Red]
Change from last review: [Improved / Steady / Slipped — why]

Key wins since last meeting:
• [Win 1]
• [Win 2]

Key risks I'm tracking:
• [Risk 1 + mitigation]
• [Risk 2 + mitigation]

Decisions needed from this group: [List or "None at this time"]
Discussion topics: [List]

Looking forward to working through it together.

Thanks,
Lexy` },

  // ============ EMAIL — TEAM 6 ============
  { id: 't1', channel: 'email', category: 'team', name: 'Kickoff Invite + Pre-Read', description: 'Internal team kickoff setup', subject: '[Project] — kickoff [Date] — pre-read attached',
    body: `Hi all,

Excited to get this one going — kickoff for [Project] is [Date] at [Time]. Calendar invite is coming separately.

Pre-read attached. If you have a chance to look it over before we meet, that'd be great:
• Project charter
• High-level timeline
• Roles + responsibilities

What we'll cover:
• Introductions
• Charter walkthrough
• Timeline + milestones
• Roles confirmation
• Q&A

By the end, we should have alignment on roles, the next two weeks of work, and any open questions surfaced. Bring whatever's on your mind — there are no bad questions, and starting strong is worth the time.

Thanks,
Lexy` },
  { id: 't2', channel: 'email', category: 'team', name: 'Workflow Handoff', description: 'Tagging the next person in chain', subject: '[Project/Task] — passing this over to you',
    body: `Hi [Name],

[Item] is ready for your part whenever you're able to pick it up.

What's done: [Previous step]
What's in your court: [Their step]
Target date: [Date]
Where to find it: [Link/system]
Context that might help: [Anything they need to know that isn't obvious]

Give me a shout if you need anything — happy to help.

Thanks,
Lexy` },
  { id: 't3', channel: 'email', category: 'team', name: 'Standing Meeting Cancel', description: 'Skipping a regular meeting', subject: '[Meeting name] — canceled this week',
    body: `Hi all,

Going to give you all some time back — this week's [meeting] is canceled since we don't have anything pressing to cover. Next meeting will be [date] as usual.

If anything comes up between now and then that needs the group, just let me know and we can pull something together.

Thanks,
Lexy` },
  { id: 't4', channel: 'email', category: 'team', name: 'PTO Coverage Check', description: 'Confirming coverage before key dates', subject: 'Coverage check — [Date range]',
    body: `Hi all,

Looking ahead to [project milestone / event] coming up [date range] and want to make sure we're covered.

If you'll be out during that window, would you mind replying with:
• Dates you'll be unavailable
• Backup contact for your area (if applicable)

Thanks so much — appreciate it.
Lexy` },
  { id: 't5', channel: 'email', category: 'team', name: 'Apologize + Recover', description: 'When you dropped the ball', subject: 'Apologies on [topic] — and a path forward',
    body: `Hi [Name],

Wanted to own this directly: [what happened — clearly and without spin].

I'm sorry for the [specific impact — confusion, delay, extra work for you]. That's on me.

Here's what I'm doing to make it right:
• [Specific action 1 — what I'm doing now to fix it]
• [Specific action 2 — what changes going forward to prevent it]
• [Specific action 3 — confirming new dates/expectations if relevant]

If there's anything else that would help on your end, please tell me. Otherwise, I'll [next concrete step] by [date].

Thanks for your patience.

Lexy` },
  { id: 't6', channel: 'email', category: 'team', name: 'New Stakeholder Onboarding', description: 'Bringing someone up to speed mid-project', subject: 'Welcome to [Project] — quick context to get up to speed',
    body: `Hi [Name],

Welcome to the [Project] team. Wanted to send a quick orientation so you can hit the ground running.

Where we are: [1-2 sentences on current phase and most recent work]

What you need to know:
• Project objective: [One line]
• Your role and how it fits: [Brief — RACI position if helpful]
• Key contacts: [Sponsor, SMEs, vendor reps]
• Cadence you'll see: [Weekly status, biweekly stand-ups, monthly steering, etc.]

Resources to dig into:
• Project charter: [Link]
• Recent status updates: [Link]
• Decision log: [Link]
• Risk register: [Link]

I'll send a calendar invite for a 30-minute orientation call next week — happy to walk through anything that's unclear or answer questions live. In the meantime, welcome aboard.

Thanks,
Lexy` },

  // ============ EMAIL — COMPLIANCE 6 ============
  { id: 'cm1', channel: 'email', category: 'compliance', name: 'Annual Vendor Review', description: 'Yearly re-attestation request', subject: 'Annual vendor review — [Vendor name]',
    body: `Hi [Name],

It's that time again — we're working through the annual review of [Vendor's] partnership with Fort Financial. When you have a chance, would you be able to send updated versions of the following by [date]?
• SOC 1 / SOC 2 report
• Certificate of Insurance
• Information security policy
• Business continuity plan
• Updated security questionnaire (attached)

The [date] target gives our compliance team time to review before [renewal date / audit / next milestone]. If any of your documents are still current and don't need re-issuing, let me know and we'll work with what we have on file.

Thanks so much for your help,
Lexy` },
  { id: 'cm2', channel: 'email', category: 'compliance', name: 'Findings / Remediation', description: 'Following up on flagged items', subject: '[Vendor/Project] — remediation items',
    body: `Hi [Name],

Following up on the [audit/review/assessment] of [vendor/project]. Our compliance team flagged the items below for remediation, and I wanted to walk through them and figure out a plan together:
• [Finding 1] — Severity: [High/Med/Low] — Target: [date]
• [Finding 2] — Severity: [High/Med/Low] — Target: [date]
• [Finding 3] — Severity: [High/Med/Low] — Target: [date]

When you have a chance, could you confirm receipt and share your plan for each? Compliance is hoping for progress updates by [date], with full closure by [date]. Happy to chat through any of it before then if that'd help — especially the higher-severity items.

Thanks so much,
Lexy` },
  { id: 'cm3', channel: 'email', category: 'compliance', name: 'Verafin Onboarding Kickoff', description: 'Starting Verafin with new vendor', subject: 'Welcome — Verafin Onboarding for [Vendor name]',
    body: `Hi [Name],

Welcome to the Fort Financial vendor family. We use Verafin for vendor management, and I'd like to walk you through what onboarding looks like.

Here's what our compliance team will need from you:
• Completed Verafin vendor questionnaire (attached / sent separately)
• Standard due diligence package (SOC, COI, BCP, financials)
• Primary contact for ongoing reviews

How the process works:
• You complete the questionnaire and submit documents
• Our compliance team reviews
• We follow up if anything's missing or needs clarification
• You're approved for ongoing engagement

Aiming to wrap up by [Date] so we can have you fully approved ahead of [target start date / contract activation]. If anything in the questionnaire is unclear, please reach out — happy to walk through any of it.

Looking forward to working together.

Thanks,
Lexy` },
  { id: 'cm4', channel: 'email', category: 'compliance', name: 'Policy / Procedure Review', description: 'Asking for policy review', subject: 'Could use your eyes on this — [Policy/Procedure name]',
    body: `Hi [Name],

When you have a few minutes, would you be able to take a look at [Policy/Procedure] before we move to [next step]?

What would be most helpful: [Approve as-is / suggest edits / flag concerns]
Sections worth focusing on: [Specific sections if applicable]
Hoping to wrap by: [Date — and why if relevant]

Doc is attached / linked here: [link]

Thanks so much for the help,
Lexy` },
  { id: 'cm5', channel: 'email', category: 'compliance', name: 'Audit Prep Docs', description: 'Gathering artifacts before audit', subject: 'Audit prep — [Audit type] — could use a few things from you',
    body: `Hi [Name],

We're starting to prep for the [audit name/type] coming up [date], and I'll need a few things from your area:
• [Document 1]
• [Document 2]
• [Document 3]

If you could send those over by [internal deadline — earlier than audit], that gives us time to review and address any gaps before the audit team sees them. Let me know if anything will be tight and we'll figure it out together.

Thanks so much,
Lexy` },
  { id: 'cm6', channel: 'email', category: 'compliance', name: 'Vendor Scorecard (Quarterly)', description: 'Sharing quarterly vendor performance', subject: 'Quarterly performance scorecard — [Vendor name] — [Quarter]',
    body: `Hi [Name],

Sharing the [Q1/Q2/Q3/Q4 YYYY] performance scorecard for [Vendor name]. Wanted to walk through it together so we're aligned on what's working and where we'd love to see improvement.

Overall rating: [Excellent / Meets Expectations / Needs Improvement / Underperforming]
Trend vs. last quarter: [Improved / Steady / Declined]

What's going well:
• [Strength 1 — with specific example]
• [Strength 2 — with specific example]

Areas for improvement:
• [Issue 1] — Impact: [brief] — What we'd like to see: [expectation]
• [Issue 2] — Impact: [brief] — What we'd like to see: [expectation]

SLA performance summary:
• Response time: [Met / Missed — by what margin]
• Issue resolution: [Met / Missed — by what margin]
• Other key metrics: [As applicable]

What I'd like from you:
• Review the attached scorecard
• Share any context I might be missing on the items flagged
• Let me know your plan to address improvement areas by [date]

Happy to set up a 30-minute review call if it'd be more useful to talk through it live. Full scorecard attached for the record.

Thanks so much,
Lexy` },

  // ============ EMAIL — LIFECYCLE 7 ============
  { id: 'lc1', channel: 'email', category: 'lifecycle', name: 'Go-Live Announcement (Staff)', description: 'Telling staff something\'s launching', subject: '[Project/System] — going live [Date]',
    body: `Hi all,

Exciting news — [Project/System] goes live [Date] at [Time].

What's changing: [Brief description]
Who's affected: [Departments/roles]
What you can expect: [Action steps if any, or "Nothing — automatic on our end"]
Training/resources: [Link]
Day-of support: [Contact info]
Where to ask questions: [Channel/email]

If you have questions before go-live, please reach out — much rather sort things out ahead of time than on launch day.

Excited to launch this with you all,
Lexy` },
  { id: 'lc2', channel: 'email', category: 'lifecycle', name: 'Member Comms Draft', description: 'Routing member comms for review', subject: 'Member comms draft — [Project] — needs review before send',
    body: `Hi [Name],

I've drafted member-facing communication for [Project] and need review before send. Looking for both:
• [Marketing/comms] — tone, brand alignment, channel fit
• [Legal/compliance] — regulatory review (Reg E, UDAAP, disclosure requirements as applicable)

Draft attached.
• Intended channel(s): [Email / website banner / in-branch / statement insert / etc.]
• Target send date: [Date]
• Audience: [All members / specific segment]
• Goal of the message: [What we want members to know/do]

If [date] works for sign-off, that keeps us on track for the planned send. Open to all feedback — wording, tone, anything you'd flag.

Thanks so much,
Lexy` },
  { id: 'lc3', channel: 'email', category: 'lifecycle', name: 'Lessons Learned Invite', description: 'Setting up post-project debrief', subject: '[Project] — Lessons Learned session — [Date]',
    body: `Hi all,

Now that [Project] is wrapped, I'd like to get the team together for a lessons learned session. Calendar invite to follow.

Date/Time: [Date] at [Time]
Format: [In-person / virtual]
Time commitment: [60 minutes]

If you're able, come ready to share:
• What went well and we should keep doing
• What didn't and we should change
• What you'd do differently next time

This is a no-blame conversation — the goal is to learn together and feed those lessons into the next project. I'll capture what we discuss and share a summary after.

Thanks,
Lexy` },
  { id: 'lc4', channel: 'email', category: 'lifecycle', name: '30 / 60 / 90 Check-In', description: 'Pulse check after launch', subject: '[Project] — [30/60/90]-day check-in',
    body: `Hi [Name],

Hard to believe we're already [30/60/90] days post go-live on [Project]. When you have a few minutes, I'd love your honest take:
• Is [system/process] working the way you'd hoped?
• Any unresolved issues from launch still hanging around?
• Anything we missed in training or rollout?
• Any improvements you'd suggest?

All feedback is welcome — gathering input across the team to see what we can keep improving.

Thanks so much,
Lexy` },
  { id: 'lc5', channel: 'email', category: 'lifecycle', name: 'Intake Acknowledgment', description: 'Confirming you got their request', subject: 'Got it — [Request type / Project name]',
    body: `Hi [Name],

Thanks for sending over your [intake form / request] for [project/topic] — it's officially in my hands. Here's what to expect from here:
• Initial review: within [X business days]
• You'll hear back from me by: [date]
• Next step if approved: [brief description]
• If we need more info: I'll reach out directly with specifics

If anything changes on your end in the meantime, send me a note. Otherwise, talk soon.

Thanks,
Lexy` },
  { id: 'lc6', channel: 'email', category: 'lifecycle', name: 'Project on Hold / Paused', description: 'When project gets paused mid-flight', subject: '[Project name] — paused as of [Date]',
    body: `Hi all,

Wanted to let you know that [Project name] is being paused as of [date]. Sharing the context so we're all on the same page:

Why: [Reason — budget freeze, reorg, regulatory shift, dependency stalled, sponsor decision, etc.]
Decision made by: [Sponsor name / committee]

What this means right now:
• Active work stopping as of: [Date]
• Open commitments: [What you should/shouldn't continue]
• Vendor/contract status: [What we're communicating to vendors]
• Documentation: [Where current state is being preserved]

What's still TBD:
• Expected resume date: [Known date / "To be determined — anticipated [timeframe]" / "Indefinite"]
• Conditions to restart: [What would trigger resumption]

I'll keep the project artifacts current and reach back out when there's news. In the meantime, please redirect any [project-related] questions to me. Thanks for everything you've put in so far — none of it is wasted; we'll pick back up where we left off.

Thanks,
Lexy` },
  { id: 'lc7', channel: 'email', category: 'lifecycle', name: 'Final Report / Close-Out', description: 'Executive wrap-up post-project', subject: '[Project name] — Final Report and Close-Out',
    body: `Hi [Name],

Sharing the final report for [Project name], officially closed [date]. Full report attached; quick summary below.

Outcomes vs. original objectives:
• [Objective 1] → [Outcome] — [Met / Exceeded / Partial / Missed]
• [Objective 2] → [Outcome] — [Met / Exceeded / Partial / Missed]
• [Objective 3] → [Outcome] — [Met / Exceeded / Partial / Missed]

Key metrics:
• Schedule: [On time / X days early / X days late vs baseline]
• Budget: [On budget / X% under / X% over vs baseline]
• Scope: [Delivered as planned / adjusted — see report]

Top wins:
• [Win 1]
• [Win 2]

Top lessons learned:
• [Lesson 1 — and what we'd carry forward]
• [Lesson 2 — and what we'd carry forward]

Ongoing ownership:
• System/process owner: [Name/team]
• Documentation: [Location]
• Post-implementation review scheduled: [Date]

Thanks for your support throughout. Available to walk through anything in the report or discuss takeaways for future projects.

Thanks,
Lexy` },

  // ============ EMAIL — SIGNATURES 6 ============
  { id: 's1', channel: 'email', category: 'signature', name: 'Sorry, Missed Your Message', description: 'Apologizing for slow response', subject: '(use as Outlook Signature — no subject)',
    body: `Hi [Name] — apologies, your message slipped through. Catching up now and will follow up by [Date]. Thanks for your patience.

— Lexy` },
  { id: 's2', channel: 'email', category: 'signature', name: 'OOO Redirect', description: 'While you\'re out, project backups', subject: '(use as Outlook Signature or auto-reply)',
    body: `Hi there — thanks for your note. I'm out of office through [Date] with limited email access.

For anything urgent in the meantime, you can reach out to:
• VOS / vendor onboarding: [Backup contact]
• Verafin: [Backup contact]
• General project coordination: [Backup contact]

Otherwise, I'll get back to you as soon as I'm back. Thanks so much.

— Lexy` },
  { id: 's3', channel: 'email', category: 'signature', name: 'Got It, Will Follow Up', description: 'Acknowledgment with a deadline', subject: '(use as Outlook Signature — no subject)',
    body: `Got it — thanks. Will follow up by [Date].

— Lexy` },
  { id: 's4', channel: 'email', category: 'signature', name: 'Thanks, No Action Needed', description: 'Closing a thread cleanly', subject: '(use as Outlook Signature — no subject)',
    body: `Thanks for the update — all good on my end, no action needed.

— Lexy` },
  { id: 's5', channel: 'email', category: 'signature', name: 'Quick FYI / Heads-Up', description: 'Sharing info, no action needed', subject: '(use as Outlook Signature — write subject like "FYI — [topic]")',
    body: `Hi [Name] — quick heads-up: [what's happening]. No action needed on your end right now, just wanted you to have the context. Reach out if you have questions.

— Lexy` },
  { id: 's6', channel: 'email', category: 'signature', name: 'Reschedule a Meeting', description: 'Pushing a meeting to new time', subject: '(use as Outlook Signature — write subject like "[Meeting] — moving to [new time]")',
    body: `Hi [Name] — need to push our [meeting] originally scheduled for [date]. Could we move it to [proposed new time]? If that doesn't work, send me a few options that do and I'll get it on the calendar.

Thanks for the flexibility.

— Lexy` },

  // ============ TEAMS — KICKOFFS 2 ============
  { id: 'tm_k1', channel: 'teams', category: 't_kickoff', name: 'Project channel intro', description: 'First message when a project channel goes live', subject: '',
    body: `👋 Hey everyone! I'm Lexy and I'll be coordinating [Project name].

I'll be keeping track of timelines, action items, and making sure nothing falls through the cracks. Feel free to tag me here anytime with questions or updates — that's what I'm here for!

Really looking forward to working with this group. 💜` },
  { id: 'tm_k2', channel: 'teams', category: 't_kickoff', name: 'Kickoff meeting heads-up', description: 'Letting team know a calendar invite is coming', subject: '',
    body: `Hey team! 👋 Sending over a calendar invite for our [Project name] kickoff shortly — just a heads-up so it doesn't catch anyone off guard.

If the time doesn't work for you, just let me know and we'll find something that does. Can't wait to get this going! 🚀` },

  // ============ TEAMS — STATUS 2 ============
  { id: 'tm_s1', channel: 'teams', category: 't_status', name: 'Quick weekly status', description: 'Mid-week or end-of-week pulse in the channel', subject: '',
    body: `Hey team — quick [Project name] update! 📋

✅ [What just got done]
🔄 [What's in progress right now]
📅 Next up: [upcoming milestone or date]

We're in good shape! Tag me if anything comes up on your end. 😊` },
  { id: 'tm_s2', channel: 'teams', category: 't_status', name: 'FYI update — no action needed', description: 'Keeping someone in the loop without asking for anything', subject: '',
    body: `Hey @[Name], just wanted to keep you in the loop — [one sentence on what happened or where things stand]. No action needed on your end, just want to make sure you have the latest. 😊` },

  // ============ TEAMS — FOLLOW-UPS 7 ============
  { id: 'tm_f1', channel: 'teams', category: 't_followup', name: 'Quick nudge', description: 'Gentle reminder on something pending', subject: '',
    body: `Hey @[Name]! Just a gentle nudge on [item] — no stress, just want to make sure it's still on your radar before [date or milestone].

Let me know if anything's come up and I'm happy to help figure it out.` },
  { id: 'tm_f2', channel: 'teams', category: 't_followup', name: 'Action item check-in', description: 'Following up on something assigned in a meeting', subject: '',
    body: `Hey @[Name]! Following up on the [item] from our [meeting name] on [date] — just wanted to check in and see how it's coming along.

Totally fine if things have shifted — just want to make sure I have the latest so I can keep the tracker up to date.` },
  { id: 'tm_f3', channel: 'teams', category: 't_followup', name: 'Post-meeting recap drop', description: 'Drop in the channel right after a Teams call', subject: '',
    body: `Thanks everyone — great call today! Here's a quick recap of next steps:

✅ @[Name] — [action item] by [date]
✅ @[Name] — [action item] by [date]
✅ Me — [what I'm doing next]

I'll get these into the tracker. Let me know if I missed anything.` },
  { id: 'tm_f4', channel: 'teams', category: 't_followup', name: 'Checking in when someone\'s been quiet', description: 'Caring check-in when a teammate has gone quiet', subject: '',
    body: `Hey @[Name]! Just checking in — haven't heard much from you lately on [project/item] and wanted to make sure everything's okay on your end.

No pressure at all, just want to make sure you have what you need and that nothing's gotten stuck. Here if you need anything.` },
  { id: 'tm_f5', channel: 'teams', category: 't_followup', name: 'Rescheduling a meeting', description: 'When a meeting needs to move', subject: '',
    body: `Hey team! I need to move our [meeting name] scheduled for [date/time] — sorry for the disruption!

Would [alternative day/time] work for everyone? If not, share what does and I'll get an updated invite out right away.` },
  { id: 'tm_f6', channel: 'teams', category: 't_followup', name: 'Asking for review or approval', description: 'When you need someone to look something over', subject: '',
    body: `Hey @[Name]! Whenever you have a few minutes, would you be open to taking a look at [document/item]?

Specifically looking for your thoughts on [what you want feedback on]. No hard deadline, but having your input by [date] would be really helpful.` },
  { id: 'tm_f7', channel: 'teams', category: 't_followup', name: 'Requesting deadline extension', description: 'Diplomatically asking for more time', subject: '',
    body: `Hey @[Name] — wanted to flag this before it becomes an issue.

We're making solid progress on [item], but it's looking like [original date] will be tighter than we anticipated. Would it be possible to move the deadline to [new proposed date]? I want to make sure we deliver something solid.

Happy to talk through it if that doesn't work — just wanted to get ahead of it.` },

  // ============ TEAMS — BLOCKERS 2 ============
  { id: 'tm_b1', channel: 'teams', category: 't_blocker', name: 'Flagging a blocker', description: 'Raising something that needs attention', subject: '',
    body: `Hey @[Name] — wanted to flag something on [Project name] before it becomes a bigger issue.

[One sentence: what the blocker is and what's at risk.]

I've already [done X] on my end, but I think this one might need your eyes or a quick decision to keep things moving. Whenever you have a moment.` },
  { id: 'tm_b2', channel: 'teams', category: 't_blocker', name: 'Urgent — needs attention today', description: 'When something genuinely can\'t wait', subject: '',
    body: `Hey @[Name] — sorry to jump in but this one is a bit time-sensitive.

[One sentence on what's happening and why it matters today.]

Would a quick message here sort it out, or would a 10-minute call be easier? Either works for me.` },

  // ============ TEAMS — WINS 3 ============
  { id: 'tm_w1', channel: 'teams', category: 't_wrap', name: 'Milestone celebration', description: 'Shout out a win in the channel', subject: '',
    body: `[Milestone] is officially done! 🎉

Really proud of what this team pulled off — that took real effort and it shows. Onward to [next milestone].` },
  { id: 'tm_w2', channel: 'teams', category: 't_wrap', name: 'Individual shoutout', description: 'Recognize someone who went above and beyond', subject: '',
    body: `Just want to take a second to recognize @[Name] — [one specific thing they did that made a difference].

This project is better because of you. Thank you.` },
  { id: 'tm_w3', channel: 'teams', category: 't_wrap', name: 'Project wrap — channel close-out', description: 'Final message before archiving the channel', subject: '',
    body: `[Project name] is officially complete! 🎊

So proud of what this team accomplished together. Final docs are in [location]. I'll be archiving this channel in [timeframe], but feel free to tag me if anything comes up.

Until next time! 💜` },

  // ============ TEAMS — QUICK ASKS 3 ============
  { id: 'tm_q1', channel: 'teams', category: 't_quick', name: 'Gut-check to boss', description: 'Run a draft past your boss before formal review', subject: '',
    body: `Hey @[Boss] — I put together [doc/item]. Before I finalize anything, wanted to make sure you're good with the direction. Happy to walk through it or just let me know if you want changes. 🙂` },
  { id: 'tm_q2', channel: 'teams', category: 't_quick', name: 'Quick question — colleague', description: 'One-line ask for info or a resource', subject: '',
    body: `Hey @[Name] — quick one for you: [specific question]. Thanks! 😊` },
  { id: 'tm_q3', channel: 'teams', category: 't_quick', name: 'Direction question to sponsor', description: 'Ask sponsor which path to take before diving in', subject: '',
    body: `Hey @[Name] — quick question on [Project]. [Brief context — 1 sentence]. Did you want me to [option 1] or [option 2]? Just want to check before I dive in — let me know which direction and I'll get going! 😊` },
];

// ============== HELPERS ==============
function extractPlaceholders(text) {
  const matches = (text || '').match(/\[[^\]]+\]/g) || [];
  return [...new Set(matches)];
}
function applyValues(text, values) {
  let result = text || '';
  Object.entries(values).forEach(([ph, val]) => {
    if (val && val.trim()) result = result.split(ph).join(val);
  });
  return result;
}
function findStandingValue(placeholder, standingContext) {
  const key = placeholder.replace(/[\[\]]/g, '').toLowerCase().trim();
  for (const [stdKey, value] of Object.entries(standingContext)) {
    if (stdKey.toLowerCase().trim() === key) return value;
  }
  return '';
}
function templateById(id, customs = []) {
  return TEMPLATES.find(t => t.id === id) || (customs || []).find(t => t.id === id) || null;
}

// Known project keywords for auto-tagging — based on Lexy's actual work
const PROJECT_KEYWORDS = [
  { tag: 'Verafin',   patterns: [/\bverafin\b/i] },
  { tag: 'VOS',       patterns: [/\bvos\b/i, /vendor onboarding standard/i, /vendor.*standardization/i] },
  { tag: 'MoveMint',  patterns: [/\bmovemint\b/i, /\bcunexus\b/i] },
  { tag: 'Corelation',patterns: [/\bcorelation\b/i, /\bkeystone\b/i, /\bkeybridge\b/i] },
  { tag: 'Zoho',      patterns: [/\bzoho\b/i] },
];

function extractProjectTag(text) {
  if (!text) return null;
  for (const { tag, patterns } of PROJECT_KEYWORDS) {
    if (patterns.some(p => p.test(text))) return tag;
  }
  return null;
}

// Record a placeholder value usage; returns the updated memory object
function recordValueUse(memory, placeholder, value) {
  if (!value || !value.trim()) return memory;
  const next = { ...(memory || {}) };
  next[placeholder] = { ...(next[placeholder] || {}) };
  next[placeholder][value.trim()] = (next[placeholder][value.trim()] || 0) + 1;
  return next;
}

// Get top suggestions for a placeholder, sorted by usage frequency
function getSuggestions(memory, placeholder, currentValue, limit = 6) {
  if (!memory || !memory[placeholder]) return [];
  return Object.entries(memory[placeholder])
    .filter(([v]) => v && v !== currentValue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([v]) => v);
}

function formatTime(timestamp) {
  const d = new Date(timestamp);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function isToday(ts) {
  const d = new Date(ts), n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

// ============== AUDIO CHIME ==============
function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    [
      { freq: 660, time: 0,    dur: 0.18 },
      { freq: 880, time: 0.08, dur: 0.22 },
      { freq: 1100, time: 0.16, dur: 0.28 },
    ].forEach(({ freq, time, dur }) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = freq;
      o.type = 'sine';
      g.gain.setValueAtTime(0, now + time);
      g.gain.linearRampToValueAtTime(0.07, now + time + 0.02);
      g.gain.linearRampToValueAtTime(0, now + time + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(now + time); o.stop(now + time + dur);
    });
    setTimeout(() => ctx.close(), 800);
  } catch(e){}
}

// ============== ROSIE API ==============
async function askEmailRosie(userMessage, conversationHistory) {
  const tCtx = TEMPLATES.map(t =>
    `- ${t.id} [${t.channel}/${t.category}]: ${t.name} — ${t.description}`
  ).join('\n');

  const systemPrompt = `you are rosie, lexy's warm, gentle AI companion in her email & teams hub 🌸. lexy is a project coordinator at fort financial credit union.

your voice: warm, plain, conversational. lowercase ok. think maya angelou energy — quiet wisdom, not motivational poster. never corporate, never "let's crush it", never overly enthusiastic. acknowledge her situation in a sentence, suggest the template warmly. occasional 🌸 or ✨ if natural — never forced.

═══ YOUR JOB HAS TWO MODES ═══

choose based on what lexy needs right now:

──── MODE 1: REFINE TEXT ────
lexy has given you text (her own draft, a message she's editing, a paragraph she's working on) and wants you to refine, polish, soften, sharpen, shorten, lengthen, edit, rewrite, fix, tone down, or make it more X.

signals it's mode 1:
- pasted text + a refine verb in her message
  examples: "[some text]; can you refine this", "make this shorter: ...",
            "soften this: ...", "polish this for me", "rewrite this to sound more professional"
- she's clearly handing you text TO TRANSFORM, not describing something to write from scratch

what to do in mode 1:
- just return the refined version of her text
- DO NOT add a [TEMPLATE: ...] marker
- DO NOT add a [FILL: ...] marker
- DO NOT try to match her text to a template — she's not asking for a template
- keep her warm, plain tone UNLESS she specifically asks for a tone shift ("more formal", "more direct")
- optional: ONE short line at the top about what you changed, then the refined text
- if the refinement direction is ambiguous ("polish this" with no hint), pick a sensible default (clarity + flow, trim filler) and offer to try a different angle at the end

──── MODE 2: TEMPLATE MATCH ────
lexy is describing a situation that needs a message — she doesn't have the text yet, she's describing the THING she needs to write.

signals it's mode 2:
- she describes WHO she needs to talk to and WHY
- no pasted draft text, no refine verb
  examples: "need to follow up with the verafin team", "want to thank kelly in the channel",
            "have to send the weekly status to leadership"

what to do in mode 2: your job is to pick the best template (email OR microsoft teams) and tell her which one. if her description is truly ambiguous, ask ONE clarifying question.

choosing channel:
- TEAMS for: quick gut-checks, channel intros, pulse updates, "@person needs to know", informal asks, urgent flags inside the team, milestone celebrations in the channel, gentle nudges, asking colleagues quick questions
- EMAIL for: formal outreach, vendor communication (initial, contract, due diligence), sponsor approvals, weekly status to leadership, charters, formal escalations, anything with attachments, anything to people you don't have a chat thread with

response format for mode 2 (read carefully):
- keep responses short — 2 to 3 sentences max
- when you've identified a template, end your message with exactly: [TEMPLATE: <id>]
  example: [TEMPLATE: c1] or [TEMPLATE: tm_f1]
- AFTER the template marker, OPTIONALLY add a [FILL: {...}] marker with a JSON object pre-filling placeholders you can confidently infer from what lexy said. only include placeholders where lexy explicitly said the value. don't invent.
  example format: [FILL: {"Vendor name":"Verafin","specific item":"the SOC 2 report"}]
  the keys must match the placeholder text exactly (without the brackets — so "[Vendor name]" becomes "Vendor name").
- if you're unsure about a template, no marker — just ask a question

available templates:
${tCtx}

handling revisions (mode 2):
- if lexy is responding to a template you JUST suggested ("softer", "shorter", "more direct", "no wait, the other one", "tone it down", "less formal"), prefer to STAY ON THE SAME TEMPLATE and revise the [FILL: ...] values OR suggest a sibling template in the same category. don't restart from scratch unless she's clearly switched topics.
- if she's adding more context to the same situation ("oh and it's actually for vendor X", "by the way it's urgent"), update the [FILL: ...] values to incorporate the new info — same template still applies most of the time.
- if she's pivoting to a totally new task, then yes, pick a fresh template.

remember: in mode 2, ONE template per response. be a thoughtful editor — pre-fill what's clearly there, leave what's not. no marker if uncertain.
in mode 1, NO markers at all — just return the refined text.`;

  const messages = [
    ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];

  const response = await fetch('/api/rosie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) throw new Error('rosie had a hiccup');
  const data = await response.json();
  const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('');

  const tMatch = text.match(/\[TEMPLATE:\s*([a-z0-9_]+)\s*\]/i);
  const templateId = tMatch ? tMatch[1].toLowerCase() : null;

  let prefill = {};
  const fMatch = text.match(/\[FILL:\s*(\{[\s\S]*?\})\s*\]/);
  if (fMatch) {
    try { prefill = JSON.parse(fMatch[1]); } catch (e) {}
  }

  const cleanText = text
    .replace(/\[TEMPLATE:\s*[a-z0-9_]+\s*\]/gi, '')
    .replace(/\[FILL:\s*\{[\s\S]*?\}\s*\]/g, '')
    .trim();

  return { text: cleanText, templateId, prefill };
}

// ============== CONFETTI ==============
function ConfettiBurst({ active }) {
  if (!active) return null;
  const pieces = Array.from({ length: 28 }, (_, i) => {
    const symbols = ['🌸', '✨', '🌷', '♡', '✦', '🌟'];
    const symbol = symbols[i % symbols.length];
    const angle = (Math.PI * 2 * i) / 28 + (Math.random() - 0.5) * 0.6;
    const dist = 80 + Math.random() * 160;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist - 40;
    const rot = (Math.random() - 0.5) * 540;
    const dur = 1100 + Math.random() * 700;
    const delay = Math.random() * 100;
    const size = 14 + Math.random() * 12;
    return (
      <span key={i} style={{
        position: 'absolute', left: '50%', top: '50%',
        fontSize: `${size}px`, pointerEvents: 'none',
        animation: `eh-burst ${dur}ms ${delay}ms ease-out forwards`,
        ['--tx']: `${tx}px`, ['--ty']: `${ty}px`, ['--rot']: `${rot}deg`,
      }}>{symbol}</span>
    );
  });
  return <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>{pieces}</div>;
}

// ============== MAIN APP ==============
function EmailHub({ onClose, appTab, setAppTab, pendingMessagePrefill, onClearPendingMessagePrefill }) {
  const [activeTab, setActiveTab] = useState('rosie');
  const [showSettings, setShowSettings] = useState(false);
  const [standingContext, setStandingContext] = useState(STANDING_DEFAULTS);

  // Rosie
  const [chatHistory, setChatHistory] = useState([]);
  const [rosieInput, setRosieInput] = useState('');
  // When a reminder's "draft →" pill routes here, populate the rosie chat input
  // with the reminder text + linked item context. Switch to the rosie tab so
  // the user lands directly on "Tell me the situation". Clear after read.
  useEffect(() => {
    if (pendingMessagePrefill && pendingMessagePrefill.text) {
      setActiveTab('rosie');
      setRosieInput(pendingMessagePrefill.text);
      if (onClearPendingMessagePrefill) onClearPendingMessagePrefill();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingMessagePrefill]);
  const [rosieThinking, setRosieThinking] = useState(false);
  const [rosieError, setRosieError] = useState(null);

  // Fill view
  const [fillTemplate, setFillTemplate] = useState(null);
  const [fillValues, setFillValues] = useState({});
  const [fillSource, setFillSource] = useState('rosie');
  const [fillSessionId, setFillSessionId] = useState(null);
  const [fillPrefilledKeys, setFillPrefilledKeys] = useState([]); // which fields Rosie pre-filled

  // History & favorites
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]); // array of template ids

  // NEW: value memory (autocomplete) & custom templates
  const [valueMemory, setValueMemory] = useState({}); // { placeholder: { value: count } }
  const [customTemplates, setCustomTemplates] = useState([]); // user-saved filled versions

  // Library
  const [libSearch, setLibSearch] = useState('');
  const [libExpanded, setLibExpanded] = useState({});
  const [libChannel, setLibChannel] = useState('email'); // 'email' | 'teams'

  const todayCount = useMemo(() => history.filter(h => isToday(h.timestamp)).length, [history]);
  const totalCount = history.length;

  const [toast, setToast] = useState(null);

  // Load
  useEffect(() => {
    async function load() {
      try {
        const ctx = await window.storage.get('eh_v3_standing');
        if (ctx?.value) setStandingContext({ ...STANDING_DEFAULTS, ...JSON.parse(ctx.value) });
      } catch (e) {}
      try {
        const h = await window.storage.get('eh_v3_history');
        if (h?.value) setHistory(JSON.parse(h.value));
      } catch (e) {}
      try {
        const f = await window.storage.get('eh_v3_favorites');
        if (f?.value) setFavorites(JSON.parse(f.value));
      } catch (e) {}
      try {
        const m = await window.storage.get('eh_v3_value_memory');
        if (m?.value) setValueMemory(JSON.parse(m.value));
      } catch (e) {}
      try {
        const ct = await window.storage.get('eh_v3_custom_templates');
        if (ct?.value) setCustomTemplates(JSON.parse(ct.value));
      } catch (e) {}
    }
    load();
  }, []);

  const saveSettings = async (newCtx) => {
    setStandingContext({ ...STANDING_DEFAULTS, ...newCtx });
    try { await window.storage.set('eh_v3_standing', JSON.stringify(newCtx)); } catch (e) {}
  };

  const toggleFavorite = async (templateId) => {
    const updated = favorites.includes(templateId)
      ? favorites.filter(id => id !== templateId)
      : [...favorites, templateId];
    setFavorites(updated);
    try { await window.storage.set('eh_v3_favorites', JSON.stringify(updated)); } catch (e) {}
  };

  // NEW: save a filled-in version as a custom template
  const saveCustomTemplate = async (sourceTemplate, name, values, subjectOverride, bodyOverride) => {
    const renderedSubject = subjectOverride !== undefined ? subjectOverride : applyValues(sourceTemplate.subject || '', values);
    const renderedBody = bodyOverride !== undefined ? bodyOverride : applyValues(sourceTemplate.body || '', values);
    const newCt = {
      id: `ct_${Date.now()}`,
      isCustom: true,
      sourceId: sourceTemplate.id,
      channel: sourceTemplate.channel,
      category: sourceTemplate.channel === 'teams' ? 'custom_teams' : 'custom_email',
      name,
      description: `your saved version · based on ${sourceTemplate.name}`,
      subject: renderedSubject,
      body: renderedBody,
      createdAt: Date.now(),
    };
    const updated = [newCt, ...customTemplates];
    setCustomTemplates(updated);
    try { await window.storage.set('eh_v3_custom_templates', JSON.stringify(updated)); } catch (e) {}
    showToast(`saved as "${name}" 🌸`, 'find it under "my templates" in the library.');
    return newCt;
  };

  const deleteCustomTemplate = async (id) => {
    const updated = customTemplates.filter(t => t.id !== id);
    setCustomTemplates(updated);
    try { await window.storage.set('eh_v3_custom_templates', JSON.stringify(updated)); } catch (e) {}
    setFavorites(favorites.filter(fid => fid !== id));
  };

  // NEW: update the project tag on a history entry
  const updateHistoryTag = async (entryId, newTag) => {
    const updated = history.map(h => h.id === entryId ? { ...h, projectTag: newTag } : h);
    setHistory(updated);
    try { await window.storage.set('eh_v3_history', JSON.stringify(updated)); } catch (e) {}
  };

  const sendToRosie = async () => {
    const msg = rosieInput.trim();
    if (!msg || rosieThinking) return;
    setRosieInput('');
    setRosieError(null);
    const userMsg = { role: 'user', content: msg, ts: Date.now() };
    const newHist = [...chatHistory, userMsg];
    setChatHistory(newHist);
    setRosieThinking(true);
    try {
      const { text, templateId, prefill } = await askEmailRosie(msg, newHist.slice(0, -1));
      setChatHistory([...newHist, { role: 'assistant', content: text, templateId, prefill, ts: Date.now() }]);
    } catch (e) {
      setRosieError("rosie's offline for a sec — try again? 🌸");
    } finally {
      setRosieThinking(false);
    }
  };

  // Open template in fill view, optionally with Rosie's pre-fill
  const openFillView = (templateId, source = 'library', rosiePrefill = {}) => {
    const t = templateById(templateId, customTemplates);
    if (!t) return;
    setFillTemplate(t);
    setFillSource(source);

    const placeholders = extractPlaceholders(`${t.subject || ''}\n${t.body || ''}`);
    const initial = {};
    const prefilledKeys = [];

    placeholders.forEach(ph => {
      const phKey = ph.replace(/[\[\]]/g, '');
      // Priority: Rosie pre-fill > standing context > empty
      if (rosiePrefill && rosiePrefill[phKey] !== undefined && rosiePrefill[phKey]) {
        initial[ph] = rosiePrefill[phKey];
        prefilledKeys.push(ph);
      } else {
        // Try case-insensitive match for Rosie's prefill
        const rosieKey = Object.keys(rosiePrefill || {}).find(k => k.toLowerCase() === phKey.toLowerCase());
        if (rosieKey && rosiePrefill[rosieKey]) {
          initial[ph] = rosiePrefill[rosieKey];
          prefilledKeys.push(ph);
        } else {
          const v = findStandingValue(ph, standingContext);
          if (v) initial[ph] = v;
        }
      }
    });

    setFillValues(initial);
    setFillPrefilledKeys(prefilledKeys);
    setFillSessionId(`s_${Date.now()}`);
  };

  const saveToHistory = async (templateId, values, prompt = null, channel = 'email') => {
    // Auto-detect project tag from prompt + filled values
    const valuesText = Object.values(values || {}).join(' ');
    const projectTag = extractProjectTag(prompt) || extractProjectTag(valuesText) || null;

    const entry = {
      id: fillSessionId || `s_${Date.now()}`,
      templateId, values, prompt, channel,
      projectTag,
      timestamp: Date.now(),
    };
    const updated = [entry, ...history.filter(h => h.id !== entry.id)].slice(0, 100);
    setHistory(updated);
    try { await window.storage.set('eh_v3_history', JSON.stringify(updated)); } catch (e) {}

    // Record values into memory for autocomplete
    let memUpdate = valueMemory;
    Object.entries(values || {}).forEach(([ph, val]) => {
      memUpdate = recordValueUse(memUpdate, ph, val);
    });
    if (memUpdate !== valueMemory) {
      setValueMemory(memUpdate);
      try { await window.storage.set('eh_v3_value_memory', JSON.stringify(memUpdate)); } catch (e) {}
    }

    // Achievements
    const newTotal = updated.length;
    const newToday = updated.filter(h => isToday(h.timestamp)).length;
    if (newTotal === 1) showToast("first message, ever 🌸", "you're off to a soft start.");
    else if (newToday === 5) showToast("5 today ✨", "you're cookin'.");
    else if (newToday === 10) showToast("10 today 🌷", "incredible momentum.");
    else if (newTotal === 10) showToast("10 messages total 🌸", "the hub's earning its keep.");
    else if (newTotal === 25) showToast("25 messages sent ✨", "officially a regular.");
    else if (newTotal === 50) showToast("50 messages 🌟", "this is your tool now.");
  };

  const showToast = (title, sub) => {
    setToast({ title, sub });
    setTimeout(() => setToast(null), 3500);
  };

  const closeFillView = () => {
    setFillTemplate(null); setFillValues({}); setFillSessionId(null); setFillPrefilledKeys([]);
  };

  const resumeFromHistory = (entry) => {
    const t = templateById(entry.templateId, customTemplates);
    if (!t) return;
    setFillTemplate(t);
    setFillValues(entry.values || {});
    setFillSessionId(entry.id);
    setFillSource('history');
    setFillPrefilledKeys([]);
  };

  const resetRosieChat = () => { setChatHistory([]); setRosieError(null); };

  return (
    <div style={{
      fontFamily: '"Nunito", -apple-system, sans-serif', color: EH_P.text,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Nunito:wght@400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap');
        .eh-display { font-family: "Fraunces", Georgia, serif; letter-spacing: -0.01em; }
        .eh-script { font-family: "Caveat", cursive; letter-spacing: 0.005em; }
        ::selection { background: ${EH_P.blush}; color: ${EH_P.darkRose}; }
        input:focus, textarea:focus { outline: none; }
        button { font-family: inherit; cursor: pointer; }
        .eh-scroll-area { scrollbar-width: thin; scrollbar-color: ${EH_P.blush} transparent; }
        .eh-scroll-area::-webkit-scrollbar { width: 6px; }
        .eh-scroll-area::-webkit-scrollbar-thumb { background: ${EH_P.blush}; border-radius: 3px; }
        @keyframes eh-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes eh-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes eh-float-anim { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes eh-shimmer-anim { 0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.7; } 50% { transform: scale(1.15) rotate(8deg); opacity: 1; } }
        @keyframes eh-burst {
          0% { transform: translate(-50%, -50%) translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) rotate(var(--rot)); opacity: 0; }
        }
        @keyframes eh-toastIn {
          0% { transform: translate(-50%, 30px); opacity: 0; }
          15% { transform: translate(-50%, 0); opacity: 1; }
          85% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, -10px); opacity: 0; }
        }
        @keyframes eh-prefillGlow {
          0% { box-shadow: 0 0 0 0 ${EH_P.gold}88; }
          50% { box-shadow: 0 0 0 4px ${EH_P.gold}44; }
          100% { box-shadow: 0 0 0 0 ${EH_P.gold}00; }
        }
        .eh-fade-in { animation: eh-fadeIn 0.4s ease-out; }
        .eh-thinking-dot { animation: eh-pulse 1.4s ease-in-out infinite; }
        .eh-float { animation: eh-float-anim 3s ease-in-out infinite; }
        .eh-shimmer { animation: eh-shimmer-anim 2.4s ease-in-out infinite; }
        .eh-prefilled { animation: eh-prefillGlow 2s ease-out 1; }
        textarea { resize: none; font-family: inherit; }
      `}</style>

      {/* ← back to Work Hub — FocusView-style nav. Tab strip intentionally not
          rendered here. Same pattern as MeetingsTab. */}
      {setAppTab && (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '14px 24px 0' }}>
          <button
            onClick={() => setAppTab("work")}
            className="jost"
            style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(212,130,154,0.25)", borderRadius: 8, padding: "5px 12px", fontSize: 11, color: "#b86d85", cursor: "pointer", fontWeight: 500 }}
          >← back to Work Hub</button>
        </div>
      )}

      {/* COMPACT ACTION ROW (replaces removed sticky header) */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {totalCount > 0 && (
            <div className="eh-fade-in" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', background: EH_P.softBlush,
              border: `1px solid ${EH_P.borderSoft}`, borderRadius: '20px',
              fontSize: '12.5px', color: EH_P.darkRose, fontWeight: 600,
            }}>
              <span className="eh-script" style={{ fontSize: '17px', color: EH_P.dusty, lineHeight: 1 }}>{todayCount}</span>
              <span style={{ color: EH_P.textMid, fontWeight: 500 }}>today</span>
              <span style={{ color: EH_P.textLight }}>·</span>
              <span className="eh-script" style={{ fontSize: '17px', color: EH_P.dusty, lineHeight: 1 }}>{totalCount}</span>
              <span style={{ color: EH_P.textMid, fontWeight: 500 }}>all-time</span>
            </div>
          )}
        </div>
        <button onClick={() => setShowSettings(true)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 14px', background: 'transparent',
          border: `1px solid ${EH_P.border}`, borderRadius: '14px',
          color: EH_P.textMid, fontSize: '13px', fontWeight: 500,
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = EH_P.dusty; e.currentTarget.style.color = EH_P.dusty; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = EH_P.border; e.currentTarget.style.color = EH_P.textMid; }}
        >
          <Settings size={14} /> settings
        </button>
      </div>

      {/* SUB-NAV (rosie / library / history) */}
      <nav style={{ maxWidth: '1100px', margin: '0 auto', padding: '8px 24px 0', display: 'flex', gap: '4px', borderBottom: `1px solid ${EH_P.borderSoft}` }}>
        {[
          { id: 'rosie',   label: 'rosie',   emoji: '🌸' },
          { id: 'library', label: 'library', emoji: '📚' },
          { id: 'history', label: 'history', emoji: '🌷' },
        ].map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '12px 18px', background: 'transparent', border: 'none',
              borderBottom: active ? `2.5px solid ${EH_P.dusty}` : '2.5px solid transparent',
              color: active ? EH_P.darkRose : EH_P.textMid,
              fontSize: '14px', fontWeight: active ? 700 : 500,
              marginBottom: '-1px', transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: '14px' }}>{tab.emoji}</span> {tab.label}
            </button>
          );
        })}
      </nav>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 60px' }}>
        {activeTab === 'rosie' && (
          <RosieTab
            chatHistory={chatHistory}
            input={rosieInput}
            setInput={setRosieInput}
            onSend={sendToRosie}
            thinking={rosieThinking}
            error={rosieError}
            onUseTemplate={(id, prefill) => openFillView(id, 'rosie', prefill)}
            onReset={resetRosieChat}
            onGoHistory={() => setActiveTab('history')}
            history={history}
          />
        )}
        {activeTab === 'library' && (
          <LibraryTab
            search={libSearch}
            setSearch={setLibSearch}
            expanded={libExpanded}
            setExpanded={setLibExpanded}
            channel={libChannel}
            setChannel={setLibChannel}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelect={(id) => openFillView(id, 'library')}
            customTemplates={customTemplates}
            onDeleteCustom={deleteCustomTemplate}
          />
        )}
        {activeTab === 'history' && (
          <HistoryTab
            history={history}
            onResume={resumeFromHistory}
            customTemplates={customTemplates}
            onUpdateTag={updateHistoryTag}
            onClearAll={async () => {
              setHistory([]);
              try { await window.storage.set('eh_v3_history', JSON.stringify([])); } catch (e) {}
            }}
          />
        )}
      </main>

      {fillTemplate && (
        <FillView
          template={fillTemplate}
          values={fillValues}
          setValues={setFillValues}
          source={fillSource}
          prefilledKeys={fillPrefilledKeys}
          valueMemory={valueMemory}
          onClose={closeFillView}
          onCopy={(values) => saveToHistory(
            fillTemplate.id, values,
            fillSource === 'rosie' ? chatHistory.find(m => m.role === 'user')?.content : null,
            fillTemplate.channel
          )}
          isFavorite={favorites.includes(fillTemplate.id)}
          onToggleFavorite={() => toggleFavorite(fillTemplate.id)}
          onSaveCustom={saveCustomTemplate}
        />
      )}

      {showSettings && (
        <SettingsModal context={standingContext} onSave={saveSettings} onClose={() => setShowSettings(false)} />
      )}

      {toast && <Toast title={toast.title} sub={toast.sub} />}
    </div>
  );
}

// ============== ROSIE TAB ==============
function RosieTab({ chatHistory, input, setInput, onSend, thinking, error, onUseTemplate, onReset, onGoHistory, history }) {
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory, thinking]);

  const isFirstTurn = chatHistory.length === 0;
  const recentPrompts = useMemo(() => {
    const seen = new Set(); const result = [];
    history.forEach(h => {
      if (h.prompt && !seen.has(h.prompt)) { seen.add(h.prompt); result.push(h.prompt); }
    });
    return result.slice(0, 3);
  }, [history]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "good morning, lexy 🌸";
    if (h < 17) return "hey lexy 🌸";
    return "evening, lexy 🌙";
  }, []);

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      {isFirstTurn ? (
        <div className="eh-fade-in" style={{ textAlign: 'center', padding: '32px 20px 20px' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
            <div style={{
              display: 'inline-flex', padding: '20px', borderRadius: '50%',
              background: `radial-gradient(circle, ${EH_P.softBlush}, ${EH_P.softGold})`,
              border: `2px solid ${EH_P.borderSoft}`, boxShadow: `0 4px 20px ${EH_P.softBlush}`,
            }}>
              <span className="eh-float" style={{ fontSize: '34px' }}>🌸</span>
            </div>
            <span className="eh-shimmer" style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '16px' }}>✨</span>
            <span className="eh-shimmer" style={{ position: 'absolute', bottom: '-2px', left: '-6px', fontSize: '12px', animationDelay: '1.2s' }}>✨</span>
          </div>

          <h2 className="eh-display" style={{ margin: '0 0 8px', fontSize: '32px', fontWeight: 600, color: EH_P.darkRose }}>{greeting}</h2>
          <p className="eh-display" style={{ margin: '0 0 28px', fontSize: '20px', fontWeight: 400, color: EH_P.textMid, fontStyle: 'italic' }}>
            what are you working on?
          </p>

          <RosieInput value={input} onChange={setInput} onSend={onSend} thinking={thinking} inputRef={inputRef} placeholder="tell me what you need to send (email or teams)…" />

          <p style={{ margin: '12px 0 0', fontSize: '11.5px', color: EH_P.textLight, fontStyle: 'italic' }}>
            tip: the more context you give, the more rosie can pre-fill for you ✨
          </p>

          {recentPrompts.length > 0 && (
            <div style={{ marginTop: '28px' }}>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: EH_P.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                <span style={{ marginRight: '5px' }}>✨</span>recent
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {recentPrompts.map((p, i) => (
                  <button key={i} onClick={() => setInput(p)} style={{
                    padding: '8px 14px', background: EH_P.softBlush, border: `1px solid ${EH_P.borderSoft}`,
                    borderRadius: '14px', fontSize: '12.5px', color: EH_P.darkRose, fontWeight: 500,
                    transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = EH_P.blush; e.currentTarget.style.color = EH_P.warmWhite; }}
                    onMouseLeave={e => { e.currentTarget.style.background = EH_P.softBlush; e.currentTarget.style.color = EH_P.darkRose; }}
                  >
                    {p.length > 42 ? p.slice(0, 42) + '…' : p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button onClick={onGoHistory} style={{
            marginTop: '20px', padding: '10px 18px',
            background: 'transparent', border: `1px dashed ${EH_P.border}`,
            borderRadius: '20px', color: EH_P.dusty,
            fontSize: '13px', fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = EH_P.softBlush; e.currentTarget.style.borderStyle = 'solid'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderStyle = 'dashed'; }}
          >
            🌷 look at history
          </button>
        </div>
      ) : (
        <div className="eh-fade-in">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button onClick={onReset} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 13px', background: EH_P.softBlush,
              border: `1px solid ${EH_P.borderSoft}`, borderRadius: '14px',
              color: EH_P.dusty, fontSize: '12px', fontWeight: 500,
            }}>
              <RotateCcw size={11} /> start over
            </button>
          </div>

          <div ref={scrollRef} className="eh-scroll-area" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '4px 4px' }}>
            {chatHistory.map((msg, i) => (
              <ChatBubble key={i} message={msg} onUseTemplate={onUseTemplate} />
            ))}
            {thinking && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '12px 18px', color: EH_P.dusty, fontSize: '14px', fontStyle: 'italic' }}>
                <span className="eh-thinking-dot" style={{ animationDelay: '0s' }}>·</span>
                <span className="eh-thinking-dot" style={{ animationDelay: '0.2s' }}>·</span>
                <span className="eh-thinking-dot" style={{ animationDelay: '0.4s' }}>·</span>
                <span className="eh-script" style={{ marginLeft: '6px', fontSize: '17px' }}>rosie's thinking 🌸</span>
              </div>
            )}
            {error && (
              <div style={{ padding: '12px 18px', color: EH_P.dusty, fontSize: '13px', fontStyle: 'italic' }}>{error}</div>
            )}
          </div>

          <div style={{ marginTop: '16px' }}>
            <RosieInput value={input} onChange={setInput} onSend={onSend} thinking={thinking} inputRef={inputRef} placeholder="keep going…" />
          </div>
        </div>
      )}
    </div>
  );
}

function RosieInput({ value, onChange, onSend, thinking, inputRef, placeholder }) {
  return (
    <div style={{
      position: 'relative', background: EH_P.warmWhite,
      border: `1.5px solid ${EH_P.borderSoft}`, borderRadius: '22px',
      padding: '4px', display: 'flex', alignItems: 'flex-end',
      boxShadow: `0 2px 12px ${EH_P.softBlush}, 0 1px 2px rgba(212, 99, 122, 0.06)`,
    }}>
      <textarea
        ref={inputRef} value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
        placeholder={placeholder} rows={2}
        style={{
          flex: 1, padding: '14px 16px', background: 'transparent', border: 'none',
          fontSize: '15px', color: EH_P.text, minHeight: '50px', maxHeight: '180px',
        }}
      />
      <button onClick={onSend} disabled={!value.trim() || thinking} style={{
        margin: '6px', padding: '12px 14px',
        background: value.trim() && !thinking ? EH_P.dusty : EH_P.borderSoft,
        border: 'none', borderRadius: '16px', color: EH_P.warmWhite,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
        cursor: value.trim() && !thinking ? 'pointer' : 'not-allowed',
        boxShadow: value.trim() && !thinking ? `0 2px 8px ${EH_P.blush}` : 'none',
      }}>
        <Send size={16} />
      </button>
    </div>
  );
}

function ChatBubble({ message, onUseTemplate }) {
  const isUser = message.role === 'user';
  const t = message.templateId ? templateById(message.templateId) : null;
  const cat = t ? CATEGORIES.find(c => c.id === t.category) : null;
  const ch = t ? CHANNELS.find(c => c.id === t.channel) : null;
  const prefillCount = message.prefill ? Object.values(message.prefill).filter(v => v && String(v).trim()).length : 0;

  return (
    <div className="eh-fade-in" style={{ marginBottom: '16px', display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div style={{ maxWidth: '85%' }}>
        {!isUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', marginLeft: '6px' }}>
            <span style={{ fontSize: '14px' }}>🌸</span>
            <span className="eh-script" style={{ fontSize: '17px', color: EH_P.dusty, fontWeight: 600 }}>rosie</span>
          </div>
        )}
        <div style={{
          padding: '14px 18px',
          background: isUser ? EH_P.softGold : EH_P.warmWhite,
          border: `1px solid ${isUser ? EH_P.gold + '99' : EH_P.borderSoft}`,
          borderRadius: isUser ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
          fontSize: '14.5px', lineHeight: 1.55,
          color: EH_P.text, whiteSpace: 'pre-wrap',
        }}>
          {message.content}
        </div>
        {/* Copy pill — shown on Rosie's no-template responses so refined text
            (mode 1) is one click to grab. Without this the user would have to
            manually select-and-copy the chat bubble, which is real friction. */}
        {!isUser && !t && message.content && message.content.trim().length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(message.content);
                  // Tiny visual confirmation — temporarily swap the label.
                  const el = document.activeElement;
                  if (el && el.tagName === 'BUTTON') {
                    const old = el.textContent;
                    el.textContent = '✓ copied';
                    setTimeout(() => { if (el.textContent === '✓ copied') el.textContent = old; }, 1400);
                  }
                } catch (err) {
                  console.error('clipboard write failed:', err);
                }
              }}
              className="eh-script"
              style={{
                background: EH_P.softBlush,
                border: `1px solid ${EH_P.blush}55`,
                borderRadius: '12px',
                padding: '3px 11px',
                fontSize: '12px',
                color: EH_P.dusty,
                cursor: 'pointer',
                fontWeight: 600,
              }}
              title="Copy this text"
            >📋 copy</button>
          </div>
        )}
        {t && (
          <div style={{
            marginTop: '12px', padding: '14px 16px',
            background: `linear-gradient(135deg, ${EH_P.softBlush}, ${EH_P.softGold})`,
            border: `1.5px solid ${EH_P.blush}`, borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
            position: 'relative',
          }}>
            <span className="eh-shimmer" style={{ position: 'absolute', top: '-7px', right: '14px', fontSize: '14px' }}>✨</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: EH_P.dusty, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <span>{cat?.emoji}</span> suggested
                <span style={{
                  padding: '1px 8px', background: ch?.color, color: EH_P.warmWhite,
                  borderRadius: '8px', fontSize: '9px', letterSpacing: '0.05em',
                }}>
                  {ch?.emoji} {ch?.label}
                </span>
              </div>
              <div className="eh-display" style={{ fontSize: '15.5px', fontWeight: 600, color: EH_P.darkRose, marginBottom: '2px' }}>{t.name}</div>
              <div style={{ fontSize: '12.5px', color: EH_P.textMid }}>{t.description}</div>
              {prefillCount > 0 && (
                <div style={{ marginTop: '6px', fontSize: '11.5px', color: '#9b7833', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>✨</span> i pre-filled {prefillCount} {prefillCount === 1 ? 'field' : 'fields'} from what you said
                </div>
              )}
            </div>
            <button onClick={() => onUseTemplate(t.id, message.prefill)} style={{
              flexShrink: 0, padding: '10px 16px',
              background: EH_P.dusty, color: EH_P.warmWhite,
              border: 'none', borderRadius: '14px',
              fontSize: '13px', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '5px',
              boxShadow: `0 2px 8px ${EH_P.blush}`,
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = EH_P.darkRose; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = EH_P.dusty; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              fill it in <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============== LIBRARY TAB ==============
function LibraryTab({ search, setSearch, expanded, setExpanded, channel, setChannel, favorites, onToggleFavorite, onSelect, customTemplates = [], onDeleteCustom }) {
  const [confirmDelete, setConfirmDelete] = useState(null);

  const allTemplates = useMemo(() => [...customTemplates, ...TEMPLATES], [customTemplates]);

  const filtered = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return allTemplates.filter(t =>
      t.name.toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      (t.subject || '').toLowerCase().includes(q) ||
      t.body.toLowerCase().includes(q)
    );
  }, [search, allTemplates]);

  const channelCats = CATEGORIES.filter(c => c.channel === channel);
  const favTemplates = allTemplates.filter(t => favorites.includes(t.id));
  const customForChannel = customTemplates.filter(t => t.channel === channel);

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="eh-fade-in" style={{ marginBottom: '20px' }}>
        <h2 className="eh-display" style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 600, color: EH_P.darkRose, display: 'flex', alignItems: 'center', gap: '8px' }}>
          📚 library
        </h2>
        <p style={{ margin: 0, fontSize: '13.5px', color: EH_P.textMid }}>
          <span style={{ fontWeight: 700, color: EH_P.dusty }}>{TEMPLATES.length}</span> templates
          {customTemplates.length > 0 && (
            <> · <span style={{ fontWeight: 700, color: '#9b7833' }}>{customTemplates.length}</span> of yours</>
          )}
          {' '}· search anywhere or browse by channel
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: EH_P.textLight }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="search across all templates…"
          style={{
            width: '100%', padding: '14px 16px 14px 42px', fontSize: '14.5px',
            background: EH_P.warmWhite, border: `1.5px solid ${EH_P.borderSoft}`,
            borderRadius: '16px', color: EH_P.text, transition: 'border-color 0.15s',
            boxShadow: `0 1px 4px ${EH_P.softBlush}`,
          }}
          onFocus={e => e.target.style.borderColor = EH_P.dusty}
          onBlur={e => e.target.style.borderColor = EH_P.borderSoft}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: EH_P.textLight, padding: '4px' }}>
            <X size={15} />
          </button>
        )}
      </div>

      {!search && (
        <>
          {/* Channel toggle */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: EH_P.warmWhite, padding: '4px', borderRadius: '14px', border: `1px solid ${EH_P.borderSoft}` }}>
            {CHANNELS.map(ch => {
              const active = channel === ch.id;
              const count = TEMPLATES.filter(t => t.channel === ch.id).length;
              return (
                <button key={ch.id} onClick={() => setChannel(ch.id)} style={{
                  flex: 1, padding: '11px 16px',
                  background: active ? ch.color : 'transparent',
                  color: active ? EH_P.warmWhite : EH_P.textMid,
                  border: 'none', borderRadius: '11px',
                  fontSize: '14px', fontWeight: active ? 700 : 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.15s',
                  boxShadow: active ? `0 2px 8px ${ch.color}55` : 'none',
                }}>
                  <span style={{ fontSize: '15px' }}>{ch.emoji}</span>
                  {ch.label}
                  <span style={{ fontSize: '11px', opacity: active ? 0.85 : 0.6 }}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Favorites section */}
          {favTemplates.length > 0 && (
            <div className="eh-fade-in" style={{
              background: `linear-gradient(135deg, ${EH_P.softGold}, ${EH_P.softBlush})`,
              border: `1.5px solid ${EH_P.gold}88`,
              borderRadius: '16px', padding: '14px 16px', marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Star size={14} fill="#9b7833" color="#9b7833" />
                <span className="eh-display" style={{ fontSize: '15px', fontWeight: 700, color: '#9b7833' }}>
                  favorites
                </span>
                <span className="eh-script" style={{ fontSize: '17px', color: '#9b7833', lineHeight: 1 }}>{favTemplates.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {favTemplates.map(t => (
                  <TemplateCard
                    key={t.id} template={t}
                    isFavorite onToggleFavorite={() => onToggleFavorite(t.id)}
                    onSelect={() => onSelect(t.id)}
                    compact showChannel
                  />
                ))}
              </div>
            </div>
          )}

          {/* My Templates section (custom) */}
          {customForChannel.length > 0 && (
            <div className="eh-fade-in" style={{
              background: `linear-gradient(135deg, ${EH_P.lavBg}, ${EH_P.softBlush})`,
              border: `1.5px solid ${EH_P.lavender}aa`,
              borderRadius: '16px', padding: '14px 16px', marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px' }}>⭐</span>
                <span className="eh-display" style={{ fontSize: '15px', fontWeight: 700, color: '#6b5a85' }}>
                  my templates
                </span>
                <span className="eh-script" style={{ fontSize: '17px', color: '#6b5a85', lineHeight: 1 }}>{customForChannel.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {customForChannel.map(t => (
                  <CustomTemplateCard
                    key={t.id} template={t}
                    isFavorite={favorites.includes(t.id)}
                    onToggleFavorite={() => onToggleFavorite(t.id)}
                    onSelect={() => onSelect(t.id)}
                    onDelete={() => setConfirmDelete(t)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {filtered ? (
        <div className="eh-fade-in">
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: EH_P.textMid }}>
            {filtered.length} {filtered.length === 1 ? 'match' : 'matches'} 🌸
          </p>
          {filtered.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: EH_P.textLight, fontSize: '14px', fontStyle: 'italic' }}>
              nothing matches that search 🌷
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filtered.map(t => (
                <TemplateCard
                  key={t.id} template={t}
                  isFavorite={favorites.includes(t.id)}
                  onToggleFavorite={() => onToggleFavorite(t.id)}
                  onSelect={() => onSelect(t.id)}
                  showChannel
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {channelCats.map(cat => {
            const items = TEMPLATES.filter(t => t.category === cat.id);
            const isOpen = expanded[cat.id];
            return (
              <div key={cat.id} style={{
                background: EH_P.warmWhite, border: `1.5px solid ${EH_P.borderSoft}`,
                borderRadius: '16px', overflow: 'hidden',
              }}>
                <button onClick={() => setExpanded({ ...expanded, [cat.id]: !isOpen })} style={{
                  width: '100%', padding: '16px 20px',
                  background: 'transparent', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = EH_P.softBlush; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>{cat.emoji}</span>
                    <span className="eh-display" style={{ fontSize: '17px', fontWeight: 600, color: EH_P.darkRose }}>{cat.label}</span>
                    <span className="eh-script" style={{ fontSize: '17px', color: EH_P.dusty, lineHeight: 1 }}>{items.length}</span>
                  </div>
                  <ChevronDown size={16} color={EH_P.textMid} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {isOpen && (
                  <div className="eh-fade-in" style={{ padding: '4px 12px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {items.map(t => (
                      <TemplateCard
                        key={t.id} template={t}
                        isFavorite={favorites.includes(t.id)}
                        onToggleFavorite={() => onToggleFavorite(t.id)}
                        onSelect={() => onSelect(t.id)}
                        compact
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {confirmDelete && (
        <div onClick={() => setConfirmDelete(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(139, 58, 82, 0.45)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 200,
        }}>
          <div onClick={e => e.stopPropagation()} className="eh-fade-in" style={{
            background: EH_P.warmWhite, borderRadius: '20px', maxWidth: '380px', width: '100%',
            border: `1.5px solid ${EH_P.borderSoft}`, boxShadow: `0 30px 80px rgba(139, 58, 82, 0.4)`,
            padding: '22px',
          }}>
            <h3 className="eh-display" style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 600, color: EH_P.darkRose }}>
              delete this saved template?
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '13.5px', color: EH_P.textMid }}>
              "{confirmDelete.name}" — this can't be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} style={{
                padding: '9px 14px', background: 'transparent',
                border: `1px solid ${EH_P.border}`, borderRadius: '10px',
                color: EH_P.textMid, fontSize: '13px', fontWeight: 500,
              }}>cancel</button>
              <button onClick={() => { onDeleteCustom(confirmDelete.id); setConfirmDelete(null); }} style={{
                padding: '9px 14px', background: EH_P.dusty, color: EH_P.warmWhite,
                border: 'none', borderRadius: '10px',
                fontSize: '13px', fontWeight: 700,
              }}>yes, delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomTemplateCard({ template, onSelect, isFavorite, onToggleFavorite, onDelete }) {
  const ch = CHANNELS.find(c => c.id === template.channel);
  return (
    <div style={{
      width: '100%', display: 'flex', alignItems: 'stretch', gap: '4px',
      background: 'transparent', border: '1px solid transparent',
      borderRadius: '14px', transition: 'all 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = `${EH_P.warmWhite}cc`; e.currentTarget.style.borderColor = EH_P.lavender; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
    >
      <button onClick={onSelect} style={{
        flex: 1, textAlign: 'left',
        padding: '12px 14px',
        background: 'transparent', border: 'none', borderRadius: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
          <span className="eh-display" style={{ fontSize: '14.5px', fontWeight: 600, color: '#6b5a85' }}>{template.name}</span>
        </div>
        <div style={{ fontSize: '12px', color: EH_P.textMid, lineHeight: 1.4, fontStyle: 'italic' }}>
          {template.description}
        </div>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
        style={{ padding: '0 10px', background: 'transparent', border: 'none', color: isFavorite ? '#d4a445' : EH_P.textLight, display: 'flex', alignItems: 'center' }}
        title={isFavorite ? 'remove from favorites' : 'add to favorites'}
      >
        <Star size={15} fill={isFavorite ? '#d4a445' : 'none'} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        style={{ padding: '0 12px', background: 'transparent', border: 'none', color: EH_P.textLight, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
        title="delete this saved template"
        onMouseEnter={e => { e.currentTarget.style.color = EH_P.dusty; }}
        onMouseLeave={e => { e.currentTarget.style.color = EH_P.textLight; }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function TemplateCard({ template, onSelect, compact, showChannel, isFavorite, onToggleFavorite }) {
  const cat = CATEGORIES.find(c => c.id === template.category);
  const ch = CHANNELS.find(c => c.id === template.channel);

  return (
    <div style={{
      width: '100%', display: 'flex', alignItems: 'stretch', gap: '4px',
      padding: 0,
      background: compact ? 'transparent' : EH_P.warmWhite,
      border: compact ? '1px solid transparent' : `1.5px solid ${EH_P.borderSoft}`,
      borderRadius: '14px', transition: 'all 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = EH_P.softBlush; e.currentTarget.style.borderColor = EH_P.blush; }}
      onMouseLeave={e => { e.currentTarget.style.background = compact ? 'transparent' : EH_P.warmWhite; e.currentTarget.style.borderColor = compact ? 'transparent' : EH_P.borderSoft; }}
    >
      <button onClick={onSelect} style={{
        flex: 1, textAlign: 'left',
        padding: compact ? '12px 14px' : '14px 16px',
        background: 'transparent', border: 'none', borderRadius: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
          {!compact && <span style={{ fontSize: '14px' }}>{cat?.emoji}</span>}
          <span className="eh-display" style={{ fontSize: '14.5px', fontWeight: 600, color: EH_P.darkRose }}>{template.name}</span>
          {showChannel && (
            <span style={{
              padding: '1px 7px', background: ch?.color, color: EH_P.warmWhite,
              borderRadius: '6px', fontSize: '9.5px', letterSpacing: '0.04em', fontWeight: 700,
            }}>
              {ch?.emoji} {ch?.label}
            </span>
          )}
        </div>
        <div style={{ fontSize: '12.5px', color: EH_P.textMid, marginLeft: compact ? 0 : '22px', lineHeight: 1.4 }}>
          {template.description}
        </div>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
        style={{
          padding: '0 14px', background: 'transparent', border: 'none',
          color: isFavorite ? '#d4a445' : EH_P.textLight,
          display: 'flex', alignItems: 'center',
          transition: 'all 0.15s',
        }}
        title={isFavorite ? 'remove from favorites' : 'add to favorites'}
        onMouseEnter={e => { e.currentTarget.style.color = '#d4a445'; }}
        onMouseLeave={e => { e.currentTarget.style.color = isFavorite ? '#d4a445' : EH_P.textLight; }}
      >
        <Star size={16} fill={isFavorite ? '#d4a445' : 'none'} />
      </button>
    </div>
  );
}

// ============== HISTORY TAB ==============
function HistoryTab({ history, onResume, onClearAll, customTemplates = [], onUpdateTag }) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [editingTag, setEditingTag] = useState(null);

  // Build tag list from history
  const availableTags = useMemo(() => {
    const counts = {};
    history.forEach(h => {
      if (h.projectTag) counts[h.projectTag] = (counts[h.projectTag] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [history]);

  const untaggedCount = history.filter(h => !h.projectTag).length;

  const filteredHistory = useMemo(() => {
    if (activeFilter === 'all') return history;
    if (activeFilter === '__untagged') return history.filter(h => !h.projectTag);
    return history.filter(h => h.projectTag === activeFilter);
  }, [history, activeFilter]);

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="eh-fade-in" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h2 className="eh-display" style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 600, color: EH_P.darkRose, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🌷 history
          </h2>
          <p style={{ margin: 0, fontSize: '13.5px', color: EH_P.textMid }}>your recent messages — click any to reopen and reuse 🌸</p>
        </div>
        {history.length > 0 && (
          confirmClear ? (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setConfirmClear(false)} style={{ padding: '7px 12px', background: 'transparent', border: `1px solid ${EH_P.border}`, borderRadius: '12px', fontSize: '12px', color: EH_P.textMid }}>cancel</button>
              <button onClick={() => { onClearAll(); setConfirmClear(false); }} style={{ padding: '7px 12px', background: EH_P.dusty, border: 'none', borderRadius: '12px', fontSize: '12px', color: EH_P.warmWhite, fontWeight: 600 }}>yes, clear all</button>
            </div>
          ) : (
            <button onClick={() => setConfirmClear(true)} style={{ padding: '7px 12px', background: 'transparent', border: `1px solid ${EH_P.border}`, borderRadius: '12px', fontSize: '12px', color: EH_P.textLight, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Trash2 size={11} /> clear all
            </button>
          )
        )}
      </div>

      {/* Project tag filters */}
      {(availableTags.length > 0 || untaggedCount > 0) && (
        <div className="eh-fade-in" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
          <FilterChip
            active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
            label="all"
            count={history.length}
            color={EH_P.dusty}
          />
          {availableTags.map(([tag, count]) => (
            <FilterChip
              key={tag}
              active={activeFilter === tag}
              onClick={() => setActiveFilter(tag)}
              label={tag}
              count={count}
              color={EH_P.lavender}
            />
          ))}
          {untaggedCount > 0 && (
            <FilterChip
              active={activeFilter === '__untagged'}
              onClick={() => setActiveFilter('__untagged')}
              label="untagged"
              count={untaggedCount}
              color={EH_P.textLight}
            />
          )}
        </div>
      )}

      {history.length === 0 ? (
        <div className="eh-fade-in" style={{
          padding: '60px 24px', textAlign: 'center',
          background: EH_P.warmWhite, border: `1.5px solid ${EH_P.borderSoft}`, borderRadius: '20px',
        }}>
          <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: EH_P.softBlush, marginBottom: '14px' }}>
            <span style={{ fontSize: '24px' }}>🌷</span>
          </div>
          <h3 className="eh-display" style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 600, color: EH_P.darkRose }}>no history yet</h3>
          <p style={{ margin: 0, fontSize: '13px', color: EH_P.textMid, maxWidth: '320px', marginInline: 'auto', lineHeight: 1.5 }}>
            once you fill in and copy your first message, it'll show up here so you can grab it again later.
          </p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="eh-fade-in" style={{ padding: '40px 20px', textAlign: 'center', color: EH_P.textLight, fontSize: '14px', fontStyle: 'italic' }}>
          no messages match this filter 🌷
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredHistory.map(entry => {
            const t = templateById(entry.templateId, customTemplates);
            if (!t) return null;
            const cat = CATEGORIES.find(c => c.id === t.category) || { emoji: '⭐' };
            const ch = CHANNELS.find(c => c.id === (entry.channel || t.channel));
            const filledCount = Object.values(entry.values || {}).filter(v => v && v.trim()).length;
            const isEditing = editingTag === entry.id;
            return (
              <div key={entry.id} style={{
                background: EH_P.warmWhite, border: `1.5px solid ${EH_P.borderSoft}`,
                borderRadius: '14px', overflow: 'hidden',
                transition: 'border-color 0.15s',
              }}>
                <button onClick={() => onResume(entry)} style={{
                  width: '100%', textAlign: 'left', padding: '14px 16px',
                  background: 'transparent', border: 'none',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = EH_P.softBlush; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px' }}>{cat?.emoji}</span>
                        <span className="eh-display" style={{ fontSize: '14.5px', fontWeight: 600, color: EH_P.darkRose }}>{t.name}</span>
                        <span style={{
                          padding: '1px 7px', background: ch?.color, color: EH_P.warmWhite,
                          borderRadius: '6px', fontSize: '9.5px', letterSpacing: '0.04em', fontWeight: 700,
                        }}>
                          {ch?.emoji} {ch?.label}
                        </span>
                        {entry.projectTag && (
                          <span style={{
                            padding: '1px 7px', background: EH_P.lavBg, color: '#6b5a85',
                            borderRadius: '6px', fontSize: '9.5px', letterSpacing: '0.04em', fontWeight: 700,
                          }}>
                            🏷 {entry.projectTag}
                          </span>
                        )}
                      </div>
                      {entry.prompt && (
                        <div style={{ fontSize: '12.5px', color: EH_P.textMid, fontStyle: 'italic', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          "{entry.prompt}"
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11.5px', color: EH_P.textLight }}>
                        <span>{formatTime(entry.timestamp)}</span>
                        <span>·</span>
                        <span>{filledCount} field{filledCount !== 1 ? 's' : ''} filled</span>
                      </div>
                    </div>
                    <ChevronRight size={16} color={EH_P.dusty} style={{ flexShrink: 0, marginTop: '2px' }} />
                  </div>
                </button>
                {/* Tag edit row */}
                <div style={{
                  borderTop: `1px solid ${EH_P.borderSoft}`,
                  padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px',
                  background: EH_P.cream + '88',
                }}>
                  {isEditing ? (
                    <TagEditor
                      currentTag={entry.projectTag}
                      availableTags={availableTags.map(([t]) => t)}
                      onSave={(newTag) => { onUpdateTag(entry.id, newTag); setEditingTag(null); }}
                      onCancel={() => setEditingTag(null)}
                    />
                  ) : (
                    <button
                      onClick={() => setEditingTag(entry.id)}
                      style={{
                        padding: '3px 10px', background: 'transparent',
                        border: `1px dashed ${EH_P.border}`, borderRadius: '8px',
                        fontSize: '10.5px', color: EH_P.textLight, fontWeight: 500,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = EH_P.lavender; e.currentTarget.style.color = '#6b5a85'; e.currentTarget.style.borderStyle = 'solid'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = EH_P.border; e.currentTarget.style.color = EH_P.textLight; e.currentTarget.style.borderStyle = 'dashed'; }}
                    >
                      🏷 {entry.projectTag ? 'change tag' : 'add tag'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label, count, color }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 12px',
      background: active ? color : EH_P.warmWhite,
      color: active ? EH_P.warmWhite : EH_P.textMid,
      border: `1px solid ${active ? color : EH_P.border}`,
      borderRadius: '14px', fontSize: '12.5px',
      fontWeight: active ? 700 : 500,
      display: 'flex', alignItems: 'center', gap: '6px',
      transition: 'all 0.15s',
      boxShadow: active ? `0 2px 6px ${color}55` : 'none',
    }}>
      {label}
      <span style={{ opacity: active ? 0.85 : 0.6, fontSize: '11px' }}>{count}</span>
    </button>
  );
}

function TagEditor({ currentTag, availableTags, onSave, onCancel }) {
  const [val, setVal] = useState(currentTag || '');
  const inputRef = useRef(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 30); }, []);

  return (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
      <input
        ref={inputRef} type="text" value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') onSave(val.trim() || null);
          if (e.key === 'Escape') onCancel();
        }}
        placeholder="project name…"
        list="project-tag-suggestions"
        style={{
          flex: 1, minWidth: '120px', padding: '4px 9px', fontSize: '11.5px',
          background: EH_P.warmWhite, border: `1px solid ${EH_P.lavender}`,
          borderRadius: '8px', color: EH_P.text,
        }}
      />
      <datalist id="project-tag-suggestions">
        {availableTags.map(t => <option key={t} value={t} />)}
      </datalist>
      <button onClick={() => onSave(val.trim() || null)} style={{
        padding: '4px 10px', background: EH_P.lavender, color: EH_P.warmWhite,
        border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
      }}>save</button>
      {currentTag && (
        <button onClick={() => onSave(null)} style={{
          padding: '4px 8px', background: 'transparent', color: EH_P.textLight,
          border: `1px solid ${EH_P.border}`, borderRadius: '8px', fontSize: '11px',
        }}>clear</button>
      )}
      <button onClick={onCancel} style={{
        padding: '4px 8px', background: 'transparent', color: EH_P.textLight,
        border: `1px solid ${EH_P.border}`, borderRadius: '8px', fontSize: '11px',
      }}>cancel</button>
    </div>
  );
}

// ============== FILL VIEW ==============
function FillView({ template, values, setValues, source, prefilledKeys, valueMemory, onClose, onCopy, isFavorite, onToggleFavorite, onSaveCustom }) {
  const [copiedField, setCopiedField] = useState(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editedSubject, setEditedSubject] = useState(null); // null = use template; string = override
  const [editedBody, setEditedBody] = useState(null);
  const [warningPending, setWarningPending] = useState(null); // {text, field} or null
  const [showSaveModal, setShowSaveModal] = useState(false);

  const placeholders = useMemo(() => extractPlaceholders(`${template.subject || ''}\n${template.body || ''}`), [template]);
  const renderedSubject = useMemo(() => applyValues(template.subject || '', values), [template, values]);
  const renderedBody = useMemo(() => applyValues(template.body, values), [template, values]);
  const finalSubject = editedSubject !== null ? editedSubject : renderedSubject;
  const finalBody = editedBody !== null ? editedBody : renderedBody;
  const cat = CATEGORIES.find(c => c.id === template.category) || { emoji: '⭐', label: 'My Templates' };
  const ch = CHANNELS.find(c => c.id === template.channel);
  const isTeams = template.channel === 'teams';
  const isCustom = template.isCustom;

  // Detect unfilled placeholders in the FINAL output (what would actually be copied)
  const unfilledInFinal = useMemo(() => {
    return [...new Set([...extractPlaceholders(finalSubject), ...extractPlaceholders(finalBody)])];
  }, [finalSubject, finalBody]);

  const performCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      onCopy(values);
      playChime();
      setConfettiKey(k => k + 1);
      setConfettiActive(true);
      setTimeout(() => setConfettiActive(false), 1900);
      setTimeout(() => setCopiedField(null), 1900);
    } catch (e) {}
  };

  const tryCopy = (text, field) => {
    // Empty-placeholder warning: re-check on the final text being copied
    const stillUnfilled = extractPlaceholders(text);
    if (stillUnfilled.length > 0) {
      setWarningPending({ text, field, count: stillUnfilled.length, names: stillUnfilled });
      return;
    }
    performCopy(text, field);
  };

  const filledCount = placeholders.filter(ph => values[ph] && values[ph].trim()).length;
  const totalCount = placeholders.length;
  const sourceLabel = isCustom
    ? '⭐ your saved version'
    : source === 'rosie' ? '🌸 rosie picked this'
    : source === 'history' ? '🌷 from history'
    : '📚 from library';

  const resetEdits = () => { setEditedSubject(null); setEditedBody(null); };
  const hasEdits = editedSubject !== null || editedBody !== null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(139, 58, 82, 0.35)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '40px 20px', zIndex: 50, overflowY: 'auto',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="eh-fade-in" style={{
        background: EH_P.warmWhite, borderRadius: '24px', maxWidth: '720px', width: '100%',
        border: `1.5px solid ${EH_P.borderSoft}`, boxShadow: `0 30px 80px rgba(139, 58, 82, 0.25)`, position: 'relative',
      }}>
        <div key={confettiKey}><ConfettiBurst active={confettiActive} /></div>

        <div style={{
          padding: '20px 24px', borderBottom: `1px solid ${EH_P.borderSoft}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${EH_P.softBlush}33, ${EH_P.softGold}33)`,
          borderRadius: '24px 24px 0 0',
        }}>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: 'transparent', border: 'none', color: EH_P.textMid, fontSize: '13px', fontWeight: 500 }}>
            <ChevronLeft size={14} /> back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {totalCount > 0 && !isCustom && (
              <div style={{ fontSize: '12px', color: EH_P.textMid, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="eh-script" style={{ fontSize: '17px', color: EH_P.dusty, lineHeight: 1, fontWeight: 700 }}>{filledCount}</span>
                <span>of</span>
                <span className="eh-script" style={{ fontSize: '17px', color: EH_P.textMid, lineHeight: 1, fontWeight: 700 }}>{totalCount}</span>
                <span>filled</span>
              </div>
            )}
            <button onClick={onToggleFavorite} style={{
              padding: '6px', background: 'transparent', border: 'none',
              color: isFavorite ? '#d4a445' : EH_P.textLight,
              display: 'flex', alignItems: 'center', transition: 'color 0.15s',
            }}
              title={isFavorite ? 'remove from favorites' : 'add to favorites'}
            >
              <Star size={18} fill={isFavorite ? '#d4a445' : 'none'} />
            </button>
          </div>
        </div>

        <div style={{ padding: '20px 24px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: EH_P.dusty, fontWeight: 700 }}>
              {sourceLabel}
            </span>
            <span style={{
              padding: '2px 9px', background: ch?.color, color: EH_P.warmWhite,
              borderRadius: '7px', fontSize: '10px', letterSpacing: '0.04em', fontWeight: 700,
            }}>
              {ch?.emoji} {ch?.label}
            </span>
          </div>
          <h2 className="eh-display" style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: EH_P.darkRose, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{cat?.emoji}</span> {template.name}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: EH_P.textMid }}>{template.description}</p>
        </div>

        {placeholders.length > 0 && (
          <div style={{ padding: '12px 24px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: EH_P.textLight, fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✨</span> fill in the blanks
              {prefilledKeys && prefilledKeys.length > 0 && (
                <span style={{ marginLeft: '4px', color: '#9b7833', textTransform: 'none', letterSpacing: 0, fontStyle: 'italic', fontWeight: 500 }}>
                  · rosie pre-filled {prefilledKeys.length}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {placeholders.map(ph => (
                <FillField
                  key={ph} placeholder={ph}
                  value={values[ph] || ''}
                  onChange={val => setValues({ ...values, [ph]: val })}
                  isPrefilled={prefilledKeys && prefilledKeys.includes(ph)}
                  suggestions={getSuggestions(valueMemory, ph, values[ph])}
                />
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: '20px 24px 12px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: EH_P.textLight, fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{ch?.emoji}</span> preview
              {hasEdits && (
                <span style={{
                  padding: '1px 7px', background: EH_P.lavBg, color: '#6b5a85',
                  borderRadius: '5px', fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.04em',
                  textTransform: 'none',
                }}>
                  ✏️ edited
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {hasEdits && (
                <button onClick={resetEdits} style={{
                  padding: '5px 10px', background: 'transparent',
                  border: `1px solid ${EH_P.border}`, borderRadius: '10px',
                  color: EH_P.textLight, fontSize: '11px', fontWeight: 500,
                  letterSpacing: 0, textTransform: 'none',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <RotateCcw size={10} /> reset
                </button>
              )}
              <button onClick={() => setEditMode(!editMode)} style={{
                padding: '5px 10px',
                background: editMode ? EH_P.dusty : 'transparent',
                border: `1px solid ${editMode ? EH_P.dusty : EH_P.border}`, borderRadius: '10px',
                color: editMode ? EH_P.warmWhite : EH_P.dusty,
                fontSize: '11px', fontWeight: 600,
                letterSpacing: 0, textTransform: 'none',
              }}>
                {editMode ? 'done editing' : '✏️ edit'}
              </button>
            </div>
          </div>
          <div style={{
            padding: '18px 20px',
            background: EH_P.cream,
            border: `1.5px solid ${EH_P.borderSoft}`,
            borderRadius: '16px', fontSize: '14px', lineHeight: 1.65,
          }}>
            {!isTeams && template.subject && (
              <>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: EH_P.textLight, fontWeight: 700, marginBottom: '6px' }}>subject</div>
                {editMode ? (
                  <input type="text"
                    value={finalSubject}
                    onChange={e => setEditedSubject(e.target.value)}
                    style={{
                      width: '100%', marginBottom: '14px',
                      padding: '8px 10px', fontSize: '14px',
                      background: EH_P.warmWhite, border: `1px solid ${EH_P.dusty}55`,
                      borderRadius: '8px', color: EH_P.text, fontWeight: 500,
                    }}
                  />
                ) : (
                  <div style={{ marginBottom: '14px', color: EH_P.text, fontWeight: 500 }}>
                    <HighlightedText text={finalSubject} />
                  </div>
                )}
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: EH_P.textLight, fontWeight: 700, marginBottom: '6px' }}>body</div>
              </>
            )}
            {isTeams && (
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: EH_P.textLight, fontWeight: 700, marginBottom: '6px' }}>message</div>
            )}
            {editMode ? (
              <textarea
                value={finalBody}
                onChange={e => setEditedBody(e.target.value)}
                style={{
                  width: '100%', minHeight: '160px',
                  padding: '10px 12px', fontSize: '14px', lineHeight: 1.6,
                  background: EH_P.warmWhite, border: `1px solid ${EH_P.dusty}55`,
                  borderRadius: '10px', color: EH_P.text,
                }}
              />
            ) : (
              <div style={{ whiteSpace: 'pre-wrap', color: EH_P.text }}>
                <HighlightedText text={finalBody} />
              </div>
            )}
          </div>

          {/* save as my template */}
          {!isCustom && filledCount > 0 && (
            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <button onClick={() => setShowSaveModal(true)} style={{
                padding: '8px 16px',
                background: 'transparent',
                border: `1px dashed ${EH_P.gold}`, borderRadius: '14px',
                color: '#9b7833', fontSize: '12.5px', fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = EH_P.softGold; e.currentTarget.style.borderStyle = 'solid'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderStyle = 'dashed'; }}
              >
                <Star size={12} /> save this version as my template
              </button>
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px 24px', display: 'flex', gap: '10px', flexWrap: 'wrap', position: 'relative' }}>
          {!isTeams && template.subject && (
            <CopyButton label="copy subject" copied={copiedField === 'subject'} onClick={() => tryCopy(finalSubject, 'subject')} />
          )}
          <CopyButton label={isTeams ? "copy message 🌸" : "copy body"} copied={copiedField === 'body'} primary={isTeams} onClick={() => tryCopy(finalBody, 'body')} />
          {!isTeams && template.subject && (
            <CopyButton label="copy both 🌸" copied={copiedField === 'both'} primary onClick={() => tryCopy(`Subject: ${finalSubject}\n\n${finalBody}`, 'both')} />
          )}
        </div>
      </div>

      {warningPending && (
        <EmptyWarning
          count={warningPending.count}
          names={warningPending.names}
          onCancel={() => setWarningPending(null)}
          onProceed={() => {
            const w = warningPending;
            setWarningPending(null);
            performCopy(w.text, w.field);
          }}
        />
      )}

      {showSaveModal && (
        <SaveCustomModal
          template={template}
          values={values}
          editedSubject={editedSubject}
          editedBody={editedBody}
          onClose={() => setShowSaveModal(false)}
          onSave={async (name) => {
            await onSaveCustom(template, name, values, editedSubject, editedBody);
            setShowSaveModal(false);
          }}
        />
      )}
    </div>
  );
}

function EmptyWarning({ count, names, onCancel, onProceed }) {
  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, background: 'rgba(139, 58, 82, 0.55)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 200,
    }}>
      <div onClick={e => e.stopPropagation()} className="eh-fade-in" style={{
        background: EH_P.warmWhite, borderRadius: '20px', maxWidth: '420px', width: '100%',
        border: `1.5px solid ${EH_P.gold}`, boxShadow: `0 30px 80px rgba(139, 58, 82, 0.4)`,
        padding: '24px',
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ fontSize: '28px', lineHeight: 1 }}>🌷</div>
          <div style={{ flex: 1 }}>
            <h3 className="eh-display" style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 600, color: EH_P.darkRose }}>
              still {count} unfilled
            </h3>
            <p style={{ margin: 0, fontSize: '13.5px', color: EH_P.textMid, lineHeight: 1.5 }}>
              just a heads up — if you copy now, the placeholder{count > 1 ? 's' : ''} will paste literally with the brackets.
            </p>
          </div>
        </div>
        <div style={{
          padding: '10px 12px', background: EH_P.softBlush,
          borderRadius: '10px', marginBottom: '16px',
          fontSize: '12px', color: EH_P.darkRose, fontWeight: 500,
          display: 'flex', flexWrap: 'wrap', gap: '5px',
        }}>
          {names.slice(0, 6).map((n, i) => (
            <span key={i} style={{
              padding: '2px 8px', background: EH_P.warmWhite,
              borderRadius: '6px', fontSize: '11.5px',
              border: `1px solid ${EH_P.blush}`,
            }}>{n}</span>
          ))}
          {names.length > 6 && <span style={{ padding: '2px 4px', fontSize: '11.5px', color: EH_P.textLight }}>+{names.length - 6} more</span>}
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '10px 16px', background: 'transparent',
            border: `1px solid ${EH_P.border}`, borderRadius: '12px',
            color: EH_P.textMid, fontSize: '13px', fontWeight: 500,
          }}>
            go back & fill
          </button>
          <button onClick={onProceed} style={{
            padding: '10px 18px', background: EH_P.dusty, color: EH_P.warmWhite,
            border: 'none', borderRadius: '12px',
            fontSize: '13px', fontWeight: 700,
            boxShadow: `0 2px 8px ${EH_P.blush}`,
          }}>
            copy anyway 🌸
          </button>
        </div>
      </div>
    </div>
  );
}

function SaveCustomModal({ template, values, editedSubject, editedBody, onClose, onSave }) {
  const [name, setName] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  // Build a smart default name based on filled-in vendor or name
  const suggested = useMemo(() => {
    const candidates = ['Vendor name', '[Vendor name]', 'Name', '[Name]', 'Project name', '[Project name]', 'Project'];
    for (const cand of candidates) {
      const key = Object.keys(values).find(k => k.toLowerCase().includes(cand.toLowerCase().replace(/[\[\]]/g, '')));
      if (key && values[key] && values[key].trim()) {
        return `${values[key].trim()} — ${template.name}`;
      }
    }
    return `My ${template.name}`;
  }, [values, template]);

  const trySave = () => {
    const finalName = name.trim() || suggested;
    onSave(finalName);
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(139, 58, 82, 0.55)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 200,
    }}>
      <div onClick={e => e.stopPropagation()} className="eh-fade-in" style={{
        background: EH_P.warmWhite, borderRadius: '20px', maxWidth: '440px', width: '100%',
        border: `1.5px solid ${EH_P.gold}`, boxShadow: `0 30px 80px rgba(139, 58, 82, 0.4)`,
      }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${EH_P.borderSoft}`, background: `linear-gradient(135deg, ${EH_P.softGold}, ${EH_P.softBlush})`, borderRadius: '20px 20px 0 0' }}>
          <h3 className="eh-display" style={{ margin: 0, fontSize: '19px', fontWeight: 600, color: EH_P.darkRose, display: 'flex', alignItems: 'center', gap: '7px' }}>
            ⭐ save as my template
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: EH_P.textMid }}>
            keeps your filled-in version handy for next time
          </p>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: EH_P.darkRose, marginBottom: '6px' }}>
            name it
          </label>
          <input
            ref={inputRef}
            type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder={suggested}
            onKeyDown={e => { if (e.key === 'Enter') trySave(); }}
            style={{
              width: '100%', padding: '11px 14px', fontSize: '14px',
              background: EH_P.cream, border: `1.5px solid ${EH_P.borderSoft}`,
              borderRadius: '12px', color: EH_P.text,
            }}
            onFocus={e => e.target.style.borderColor = EH_P.dusty}
            onBlur={e => e.target.style.borderColor = EH_P.borderSoft}
          />
          <p style={{ margin: '8px 2px 0', fontSize: '11.5px', color: EH_P.textLight, fontStyle: 'italic' }}>
            tip: include the vendor or project name so future-you remembers what it's for
          </p>
        </div>
        <div style={{ padding: '14px 24px 20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '10px 16px', background: 'transparent',
            border: `1px solid ${EH_P.border}`, borderRadius: '12px',
            color: EH_P.textMid, fontSize: '13px', fontWeight: 500,
          }}>cancel</button>
          <button onClick={trySave} style={{
            padding: '10px 18px', background: EH_P.dusty, color: EH_P.warmWhite,
            border: 'none', borderRadius: '12px',
            fontSize: '13px', fontWeight: 700,
            boxShadow: `0 2px 8px ${EH_P.blush}`,
          }}>save 🌸</button>
        </div>
      </div>
    </div>
  );
}

function FillField({ placeholder, value, onChange, isPrefilled, suggestions = [] }) {
  const cleanLabel = placeholder.replace(/[\[\]]/g, '');
  const listId = `dl_${placeholder.replace(/[^a-z0-9]/gi, '_')}`;
  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: EH_P.darkRose, marginBottom: '5px' }}>
        {cleanLabel}
        {isPrefilled && (
          <span style={{
            padding: '1px 6px', background: EH_P.softGold, color: '#9b7833',
            borderRadius: '5px', fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.04em',
          }}>
            ✨ from rosie
          </span>
        )}
        {suggestions.length > 0 && (
          <span style={{
            padding: '1px 6px', background: EH_P.lavBg, color: '#6b5a85',
            borderRadius: '5px', fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.04em',
          }}
          title={`${suggestions.length} ${suggestions.length === 1 ? 'value' : 'values'} you've used before — click in the field to see them`}
          >
            💭 {suggestions.length}
          </span>
        )}
      </label>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={`fill in ${cleanLabel.toLowerCase()}…`}
        list={suggestions.length > 0 ? listId : undefined}
        className={isPrefilled ? 'eh-prefilled' : ''}
        style={{
          width: '100%', padding: '11px 14px', fontSize: '13.5px',
          background: isPrefilled ? EH_P.softGold : EH_P.cream,
          border: `1.5px solid ${isPrefilled ? EH_P.gold : EH_P.borderSoft}`,
          borderRadius: '12px', color: EH_P.text, transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = EH_P.dusty}
        onBlur={e => e.target.style.borderColor = isPrefilled ? EH_P.gold : EH_P.borderSoft}
      />
      {suggestions.length > 0 && (
        <datalist id={listId}>
          {suggestions.map((s, i) => <option key={i} value={s} />)}
        </datalist>
      )}
      {suggestions.length > 0 && !value && (
        <div style={{ marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {suggestions.slice(0, 3).map((s, i) => (
            <button
              key={i}
              onClick={() => onChange(s)}
              style={{
                padding: '3px 9px', background: EH_P.lavBg,
                border: `1px solid ${EH_P.lavender}66`, borderRadius: '8px',
                fontSize: '11px', color: '#6b5a85', fontWeight: 500,
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = EH_P.lavender; e.currentTarget.style.color = EH_P.warmWhite; }}
              onMouseLeave={e => { e.currentTarget.style.background = EH_P.lavBg; e.currentTarget.style.color = '#6b5a85'; }}
            >
              {s.length > 24 ? s.slice(0, 24) + '…' : s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function HighlightedText({ text }) {
  const parts = (text || '').split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.match(/^\[[^\]]+\]$/)) {
          return (
            <span key={i} style={{
              background: EH_P.softGold, color: '#9b7833',
              padding: '1px 7px', borderRadius: '5px',
              fontSize: '0.92em', fontWeight: 600,
              border: `1px solid ${EH_P.gold}55`,
            }}>
              {part}
            </span>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}

function CopyButton({ label, onClick, copied, primary }) {
  return (
    <button onClick={onClick} style={{
      flex: primary ? 1 : 'initial',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
      padding: '12px 18px',
      background: copied ? EH_P.green : (primary ? EH_P.dusty : EH_P.warmWhite),
      color: copied ? EH_P.warmWhite : (primary ? EH_P.warmWhite : EH_P.dusty),
      border: `1.5px solid ${copied ? EH_P.green : (primary ? EH_P.dusty : EH_P.borderSoft)}`,
      borderRadius: '14px', fontSize: '13.5px', fontWeight: 700,
      transition: 'all 0.15s',
      boxShadow: primary || copied ? `0 2px 10px ${copied ? EH_P.greenBg : EH_P.blush}` : 'none',
    }}
      onMouseEnter={e => { if (!copied && !primary) e.currentTarget.style.borderColor = EH_P.dusty; }}
      onMouseLeave={e => { if (!copied && !primary) e.currentTarget.style.borderColor = EH_P.borderSoft; }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'copied! 🌸' : label}
    </button>
  );
}

function Toast({ title, sub }) {
  return (
    <div style={{
      position: 'fixed', left: '50%', bottom: '32px',
      transform: 'translate(-50%, 0)',
      background: EH_P.warmWhite, border: `1.5px solid ${EH_P.blush}`,
      borderRadius: '20px', padding: '14px 22px',
      boxShadow: `0 12px 40px ${EH_P.blush}88`,
      zIndex: 200, animation: 'eh-toastIn 3.5s ease-out forwards',
      minWidth: '240px', textAlign: 'center',
    }}>
      <div className="eh-display" style={{ fontSize: '17px', fontWeight: 700, color: EH_P.darkRose }}>{title}</div>
      <div style={{ fontSize: '12.5px', color: EH_P.textMid, fontStyle: 'italic', marginTop: '2px' }}>{sub}</div>
    </div>
  );
}

function SettingsModal({ context, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...context });
  const ctxKeys = [
    { key: 'Project Sponsor/Manager Name', label: 'Project Sponsor', help: 'e.g., Rob Anderson — used in team outreach templates' },
    { key: 'Last Name', label: 'Your Last Name', help: 'used in vendor outreach intros' },
    { key: 'Backup contact', label: 'Default Backup Contact', help: 'for OOO and signatures' },
  ];

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(139, 58, 82, 0.35)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 100 }}>
      <div onClick={e => e.stopPropagation()} className="eh-fade-in" style={{ background: EH_P.warmWhite, borderRadius: '24px', maxWidth: '500px', width: '100%', border: `1.5px solid ${EH_P.borderSoft}`, boxShadow: `0 30px 80px rgba(139, 58, 82, 0.25)` }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${EH_P.borderSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: `linear-gradient(135deg, ${EH_P.softBlush}55, ${EH_P.softGold}55)`, borderRadius: '24px 24px 0 0' }}>
          <div>
            <h3 className="eh-display" style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: EH_P.darkRose, display: 'flex', alignItems: 'center', gap: '7px' }}>✨ standing context</h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: EH_P.textMid }}>pre-fills these placeholders across all templates 🌸</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', padding: '4px', color: EH_P.textMid, cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {ctxKeys.map(({ key, label, help }) => (
            <div key={key} style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: EH_P.darkRose, marginBottom: '4px' }}>{label}</label>
              <p style={{ margin: '0 0 6px', fontSize: '12px', color: EH_P.textLight }}>{help}</p>
              <input type="text" value={draft[key] || ''} onChange={e => setDraft({ ...draft, [key]: e.target.value })}
                style={{
                  width: '100%', padding: '11px 14px', fontSize: '13.5px',
                  background: EH_P.cream, border: `1.5px solid ${EH_P.borderSoft}`, borderRadius: '12px', color: EH_P.text,
                }}
                onFocus={e => e.target.style.borderColor = EH_P.dusty}
                onBlur={e => e.target.style.borderColor = EH_P.borderSoft}
              />
            </div>
          ))}
        </div>

        <div style={{ padding: '14px 24px 20px', borderTop: `1px solid ${EH_P.borderSoft}`, display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 16px', background: 'transparent', border: `1px solid ${EH_P.border}`, borderRadius: '12px', color: EH_P.textMid, fontSize: '13px', fontWeight: 500 }}>
            cancel
          </button>
          <button onClick={() => { onSave(draft); onClose(); }} style={{ padding: '10px 18px', background: EH_P.dusty, border: 'none', borderRadius: '12px', color: EH_P.warmWhite, fontSize: '13px', fontWeight: 700, boxShadow: `0 2px 8px ${EH_P.blush}` }}>
            save 🌸
          </button>
        </div>
      </div>
    </div>
  );
}
// ── Time Pacing Leaderboard ───────────────────────────────────────────────────
// Analyzes data.timingHistory to surface "which categories of work do I
// consistently underestimate?" by extracting keywords from slot labels and
// computing per-category accuracy. Sorted by largest variance so the most
// surprising trends bubble up. Requires 10+ history entries to be meaningful.
function TimePacingLeaderboardModal({ data, onClose }) {
  const history = data?.timingHistory || [];
  // Extract a category keyword from a slot label — first non-trivial word.
  // Strips common filler words. Returns lowercase category key.
  const categorize = (label) => {
    if (!label) return "other";
    const filler = new Set(["the","a","an","and","or","but","with","for","to","on","in","of","at","by","is","are","was","were","be","been","being","have","has","had","do","does","did","this","that","these","those","my","your","work","task","block","time","session","quick","brief","short","long","draft","start","starts","continue","continues","wrap","wrap-up","finish","finishing","do","doing"]);
    const words = label.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w && w.length >= 4 && !filler.has(w));
    return words[0] || "other";
  };
  // Build category buckets
  const buckets = {};
  for (const entry of history) {
    if (!entry || !entry.estimatedMin || !entry.actualMin) continue;
    const cat = categorize(entry.slotLabel);
    if (!buckets[cat]) buckets[cat] = { category: cat, count: 0, estimated: 0, actual: 0 };
    buckets[cat].count++;
    buckets[cat].estimated += entry.estimatedMin;
    buckets[cat].actual += entry.actualMin;
  }
  // Compute variance + sort
  const rows = Object.values(buckets)
    .filter(b => b.count >= 2 && b.estimated > 0) // need 2+ data points + non-zero baseline
    .map(b => ({
      ...b,
      variancePct: Math.round(((b.actual - b.estimated) / b.estimated) * 100),
      avgEstimated: Math.round(b.estimated / b.count),
      avgActual: Math.round(b.actual / b.count),
    }))
    .sort((a, b) => Math.abs(b.variancePct) - Math.abs(a.variancePct))
    .slice(0, 10);
  const formatMin = (m) => m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? `${m % 60}m` : ""}` : `${m}m`;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal fade" onClick={e => e.stopPropagation()} style={{ maxWidth: 580, maxHeight: "85vh", overflow: "auto" }}>
        <div className="jost" style={{ fontSize: 10, letterSpacing: 2.5, color: "rgba(152,120,184,0.7)", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
          ⏱ time pacing leaderboard
        </div>
        <div className="cg" style={{ fontSize: 22, fontStyle: "italic", color: "#4a3540", textAlign: "center", marginBottom: 8 }}>
          {rows.length === 0 ? "Not enough data yet." : "Where your estimates drift."}
        </div>
        <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.5)", lineHeight: 1.6, textAlign: "center", marginBottom: 16 }}>
          {rows.length === 0
            ? `Complete more work blocks (${history.length}/10) and patterns will start to emerge here.`
            : "Grouped by the dominant word in each block's name. Sorted by biggest gap between planned and actual."}
        </p>
        {rows.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rows.map((row, i) => {
              const over = row.variancePct > 0;
              const accent = Math.abs(row.variancePct) >= 25
                ? (over ? "#c4687a" : "#7a9e78")
                : "rgba(74,53,64,0.55)";
              const bgAccent = Math.abs(row.variancePct) >= 25
                ? (over ? "rgba(196,104,122,0.06)" : "rgba(122,158,120,0.06)")
                : "rgba(74,53,64,0.03)";
              return (
                <div key={row.category} style={{
                  background: bgAccent,
                  border: `1px solid ${Math.abs(row.variancePct) >= 25 ? (over ? "rgba(196,104,122,0.25)" : "rgba(122,158,120,0.25)") : "rgba(74,53,64,0.08)"}`,
                  borderRadius: 8,
                  padding: "10px 14px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div className="cg" style={{ fontSize: 18, color: "rgba(74,53,64,0.3)", fontWeight: 600, minWidth: 22 }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="jost" style={{ fontSize: 12, color: "#4a3540", fontWeight: 600, textTransform: "capitalize" }}>{row.category}</div>
                    <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)", marginTop: 2 }}>
                      avg {formatMin(row.avgEstimated)} planned · {formatMin(row.avgActual)} actual · {row.count} block{row.count === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div className="jost" style={{ fontSize: 14, color: accent, fontWeight: 700, whiteSpace: "nowrap" }}>
                    {row.variancePct > 0 ? `+${row.variancePct}%` : `${row.variancePct}%`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {rows.length > 0 && (
          <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.5)", lineHeight: 1.6, marginTop: 14, fontStyle: "italic", textAlign: "center" }}>
            🌿 Tip: pad estimates on categories running 25%+ over. Shorter estimates on the under-runners.
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={onClose} className="btn ghost jost" style={{ padding: "7px 14px", fontSize: 12 }}>Close</button>
        </div>
      </div>
    </div>
  );
}


// Modal listing all items currently in parked status, sorted by resurface
// date. Per-row actions: "Resurface now" (active immediately) and "+2 weeks"
// (extend the deferral). Gives the user agency over the deferral pile so it
// doesn't feel like a black hole.
// ─── ParkedItemRow ───────────────────────────────────────────────────────────
// One parked item in ParkedDashboardModal: title, resurface countdown, and
// resurface-now / extend / cancel actions. Pure render from props — `days`
// is computed at the call site via daysUntil, `overdue` derives inside.
function ParkedItemRow({ item, days, resurfaceNow, extend, cancel }) {
  const overdue = days !== null && days <= 0;
  return (
    <div style={{
      background: "rgba(255,255,255,0.7)",
      border: `1px solid ${overdue ? "rgba(212,130,154,0.4)" : "rgba(125,154,175,0.25)"}`,
      borderRadius: 9,
      padding: "12px 14px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, gap: 8 }}>
        <div className="jost" style={{ fontSize: 13, color: "#4a3540", fontWeight: 600, flex: 1, minWidth: 0 }}>{item.title}</div>
        <div className="jost" style={{ fontSize: 10, color: overdue ? "#b86d85" : "#5e7e95", whiteSpace: "nowrap", fontWeight: 600 }}>
          {overdue ? "↻ ready to resurface" : (days === 1 ? "tomorrow" : days > 0 ? `${days} days` : "—")}
        </div>
      </div>
      {item.why && <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.55)", fontStyle: "italic", marginBottom: 8 }}>Why: {item.why}</div>}
      <div className="jost" style={{ fontSize: 10, color: "rgba(94,126,149,0.7)", marginBottom: 8 }}>
        {item.parkedUntil ? `Resurface date: ${item.parkedUntil}` : "No resurface date set"}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button
          onClick={() => resurfaceNow(item.id)}
          className="jost"
          style={{
            background: "linear-gradient(135deg, rgba(212,130,154,0.2), rgba(232,160,180,0.15))",
            border: "1px solid rgba(212,130,154,0.4)",
            color: "#b86d85",
            fontSize: 10, padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontWeight: 600,
          }}
        >↻ Resurface now</button>
        <button
          onClick={() => extend(item.id)}
          className="jost"
          style={{
            background: "rgba(125,154,175,0.12)",
            border: "1px solid rgba(125,154,175,0.35)",
            color: "#5e7e95",
            fontSize: 10, padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontWeight: 500,
          }}
        >+2 weeks</button>
        <button
          onClick={() => cancel(item.id)}
          className="jost"
          style={{
            background: "rgba(168,158,148,0.1)",
            border: "1px solid rgba(168,158,148,0.35)",
            color: "#a89e94",
            fontSize: 10, padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontWeight: 500,
          }}
        >✗ Cancel</button>
      </div>
    </div>
  );
}

function ParkedDashboardModal({ data, onUpdate, onClose }) {
  if (!data) return null;
  const todayISO = new Date().toISOString().slice(0, 10);
  const parkedItems = (data.items || [])
    .filter(i => i.status === "parked")
    .sort((a, b) => (a.parkedUntil || "9999").localeCompare(b.parkedUntil || "9999"));
  const resurfaceNow = (itemId) => {
    const newItems = (data.items || []).map(i =>
      i.id === itemId
        ? { ...i, status: "todo", parkedAt: null, parkedUntil: null, lastResurfaced: Date.now(), lastUpdatedAt: Date.now() }
        : i
    );
    onUpdate({ ...data, items: newItems });
  };
  const extend = (itemId) => {
    const newDate = (() => {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      return d.toISOString().slice(0, 10);
    })();
    const newItems = (data.items || []).map(i =>
      i.id === itemId ? { ...i, parkedUntil: newDate, lastUpdatedAt: Date.now() } : i
    );
    onUpdate({ ...data, items: newItems });
  };
  const cancel = (itemId) => {
    const newItems = (data.items || []).map(i =>
      i.id === itemId ? { ...i, status: "cancelled", parkedAt: null, parkedUntil: null, lastUpdatedAt: Date.now() } : i
    );
    onUpdate({ ...data, items: newItems });
  };
  const daysUntil = (dateISO) => {
    if (!dateISO) return null;
    const target = new Date(dateISO + "T12:00:00");
    const now = new Date();
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal fade" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, maxHeight: "85vh", overflow: "auto" }}>
        <div className="jost" style={{ fontSize: 10, letterSpacing: 2.5, color: "rgba(125,154,175,0.7)", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
          ⛵ parked items
        </div>
        <div className="cg" style={{ fontSize: 22, fontStyle: "italic", color: "#4a3540", textAlign: "center", marginBottom: 8 }}>
          {parkedItems.length === 0 ? "Nothing's parked right now." : `${parkedItems.length} item${parkedItems.length === 1 ? "" : "s"} parked`}
        </div>
        <p className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.5)", lineHeight: 1.6, textAlign: "center", marginBottom: 16 }}>
          {parkedItems.length === 0
            ? "Items you've parked will show up here so you can see what's waiting to come back."
            : "Sorted by resurface date. Items auto-return on their date — or pull them back now."}
        </p>
        {parkedItems.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {parkedItems.map(item => (
              <ParkedItemRow
                key={item.id}
                item={item}
                days={daysUntil(item.parkedUntil)}
                resurfaceNow={resurfaceNow}
                extend={extend}
                cancel={cancel}
              />
            ))}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={onClose} className="btn ghost jost" style={{ padding: "7px 14px", fontSize: 12 }}>Close</button>
        </div>
      </div>
    </div>
  );
}


// Floating bottom-left badge that shows ambient autosave status. Click opens
// a diagnostic panel with last-save time, backup ages (items/meetings/misc),
// and counts. Surfaces silent failures before they bite. Replaces "discover
// the IT Sync wipe by accident" with a passive signal something is off.
function StorageHealthIndicator({ lastAutosaveAt, data }) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [backups, setBackups] = useState({ items: null, meetings: null, misc: null });
  // Refresh "now" every 10s so the relative-time label stays accurate
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(id);
  }, []);
  // Probe backup keys when the panel opens
  useEffect(() => {
    if (!open || typeof window === "undefined" || !window.storage) return;
    let cancelled = false;
    (async () => {
      const probe = async (key) => {
        try {
          const r = await window.storage.get(key);
          if (!r || !r.value) return null;
          const parsed = JSON.parse(r.value);
          return parsed;
        } catch { return null; }
      };
      const [items, meetings, misc] = await Promise.all([
        probe(`${STORAGE_KEY}-items-rolling-backup`),
        probe(`${STORAGE_KEY}-meetings-rolling-backup`),
        probe(`${STORAGE_KEY}-misc-rolling-backup`),
      ]);
      if (!cancelled) setBackups({ items, meetings, misc });
    })();
    return () => { cancelled = true; };
  }, [open]);

  const formatAge = (ts) => {
    if (!ts) return "never";
    const ageSec = Math.floor((now - ts) / 1000);
    if (ageSec < 5) return "just now";
    if (ageSec < 60) return `${ageSec}s ago`;
    if (ageSec < 3600) return `${Math.floor(ageSec / 60)}m ago`;
    if (ageSec < 86400) return `${Math.floor(ageSec / 3600)}h ago`;
    return `${Math.floor(ageSec / 86400)}d ago`;
  };
  const saveAgeSec = lastAutosaveAt ? Math.floor((now - lastAutosaveAt) / 1000) : null;
  // Healthy if: just opened OR saved within last 2 minutes.
  const isHealthy = saveAgeSec === null || saveAgeSec < 120;
  const indicatorLabel = lastAutosaveAt ? `saved ${formatAge(lastAutosaveAt)}` : "ready";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="jost"
        title="Storage health"
        style={{
          position: "fixed", bottom: 16, left: 16,
          background: isHealthy ? "rgba(158,184,154,0.12)" : "rgba(196,168,130,0.18)",
          border: `1px solid ${isHealthy ? "rgba(158,184,154,0.35)" : "rgba(196,168,130,0.5)"}`,
          color: isHealthy ? "#7a9e78" : "#9a7850",
          borderRadius: 14, padding: "5px 11px", fontSize: 10,
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
          zIndex: 60, fontWeight: 500, letterSpacing: 0.3,
          opacity: 0.75,
          transition: "opacity .15s, background .15s",
          backdropFilter: "blur(8px)",
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "1"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "0.75"; }}
      >
        <span style={{ fontSize: 11, lineHeight: 1 }}>💾</span>
        <span>{indicatorLabel}</span>
      </button>
      {open && (
        <div className="modal-bg" onClick={() => setOpen(false)}>
          <div className="modal fade" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="jost" style={{ fontSize: 10, letterSpacing: 2.5, color: "rgba(122,158,120,0.7)", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
              💾 storage health
            </div>
            <div className="cg" style={{ fontSize: 22, fontStyle: "italic", color: "#4a3540", textAlign: "center", marginBottom: 16 }}>
              Everything okay back here.
            </div>

            {/* Main save status */}
            <div style={{ background: isHealthy ? "rgba(158,184,154,0.08)" : "rgba(196,168,130,0.1)", border: `1px solid ${isHealthy ? "rgba(158,184,154,0.3)" : "rgba(196,168,130,0.4)"}`, borderRadius: 9, padding: "10px 14px", marginBottom: 10 }}>
              <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>Last autosave</div>
              <div className="jost" style={{ fontSize: 14, color: "#4a3540", fontWeight: 500 }}>
                {lastAutosaveAt ? formatAge(lastAutosaveAt) : "no autosave yet this session"}
              </div>
            </div>

            {/* Backup ages */}
            <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)", letterSpacing: 0.5, textTransform: "uppercase", marginTop: 14, marginBottom: 6 }}>Backups</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { name: "Items", data: backups.items, count: backups.items?.count ?? backups.items?.items?.length },
                { name: "Meetings", data: backups.meetings, count: (backups.meetings?.recurringMeetings?.length || 0) + (backups.meetings?.scheduledMeetings?.length || 0) },
                { name: "Reminders + prefs", data: backups.misc, count: backups.misc?.reminders?.length || 0 },
              ].map((b, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(255,255,255,0.5)", border: "1px solid rgba(212,130,154,0.1)", borderRadius: 7 }}>
                  <span className="jost" style={{ fontSize: 12, color: "#4a3540", fontWeight: 500 }}>{b.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {b.data ? (
                      <>
                        <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)" }}>{b.count || 0} saved</span>
                        <span className="jost" style={{ fontSize: 10, color: "#7a9e78", fontWeight: 500 }}>{formatAge(b.data.savedAt)}</span>
                      </>
                    ) : (
                      <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.4)", fontStyle: "italic" }}>no backup yet</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Current counts */}
            <div className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)", letterSpacing: 0.5, textTransform: "uppercase", marginTop: 14, marginBottom: 6 }}>Current data</div>
            <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.7)", lineHeight: 1.7, padding: "8px 12px", background: "rgba(255,255,255,0.5)", border: "1px solid rgba(212,130,154,0.1)", borderRadius: 7 }}>
              <div>{(data?.items || []).length} items · {(data?.recurringMeetings || []).length} recurring meetings · {(data?.scheduledMeetings || []).length} scheduled meetings</div>
              <div>{(data?.reminders || []).length} reminders · data version {data?.dataVersion || 1}</div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setOpen(false)} className="btn ghost jost" style={{ padding: "7px 14px", fontSize: 12 }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


export default function App() {
  const [data, setData] = useState(defaultData);
  const [screen, setScreen] = useState("checkin");
  // Track last successful autosave timestamp — drives the storage health
  // indicator's "saved Xs ago" display. Updated by event listener below
  // that catches the work-hub-autosaved event dispatched from saveToStorage.
  const [lastAutosaveAt, setLastAutosaveAt] = useState(null);
  // When user marks an item done with unchecked subtasks remaining, this
  // stores the item so the "mark subtasks complete too?" prompt can show.
  // Cleared on user response (yes/no/dismiss).
  const [markCompletePromptItem, setMarkCompletePromptItem] = useState(null);
  // Periodic cleanup pass — every 14 days on check-in, if there are stale
  // items (>30 days since last touched, status still todo/blocked), surface
  // a review prompt with bulk Park/Cancel options. Without this, the active
  // list grows infinitely because nothing prompts a graceful exit.
  const [cleanupReviewItems, setCleanupReviewItems] = useState(null); // null | array of items
  // Undo toast state — registered by dispatching CustomEvent("work-hub-undo")
  // with detail {label, undoFn}. Auto-dismisses after 10 seconds. Lets any
  // destructive action be wrapped in a 10s safety net without prop drilling.
  const [undoToast, setUndoToast] = useState(null); // null | { label, undoFn, expiresAt }
  // Active meeting detection — checks every minute if current time falls
  // inside a meeting slot. Surfaces a banner inviting the user into meeting
  // mode (MeetingFocusView). The check is roadmap-aware and quiet when no
  // meeting is current.
  const [activeMeetingBanner, setActiveMeetingBanner] = useState(null); // null | { slotIdx, label, startMin, endMin }
  // Phase 2 — agent auto-start consent modal. null when not shown, or array
  // of candidate objects when the user has just committed today's roadmap and
  // we want to ask if they want Rosie to draft heads-up content for some tasks.
  const [agentConsentCandidates, setAgentConsentCandidates] = useState(null);
  // Agent panel — null when closed, agentId string when open
  const [openAgent, setOpenAgent] = useState(null);

  // Publish the live app data to the ESM bridge (set up in main.jsx) so the
  // out-of-tree weekly-prep launcher can read the real items/tasks without
  // importing into this concatenated bundle. Read-only snapshot; updated on
  // every data change.
  useEffect(() => {
    if (typeof window !== "undefined" && window.__workhub) {
      window.__workhub.currentData = data;
    }
  }, [data]);

  // Weekly observations trigger — runs Monday mornings (or first day Lexy
  // opens the app each week if she misses Monday). Gates on weekOf so it
  // only runs once per week. Won't fire if no meaningful activity to review.
  useEffect(() => {
    if (!data) return;
    const now = new Date();
    const todayISO = now.toISOString().slice(0, 10);
    // Compute "week of" as the Monday of the current week (ISO Monday-start)
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysSinceMonday);
    const weekOfISO = monday.toISOString().slice(0, 10);
    // Skip if we already generated for this week
    if (data.weeklyObservations?.weekOf === weekOfISO) return;
    // Skip if it's not yet Monday-evening-or-later (so we have something to observe)
    if (dayOfWeek === 0) return; // Sunday — wait for Monday
    // Build activity summary from past 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentItems = (data.items || []).filter(it => (it.lastUpdatedAt || 0) >= sevenDaysAgo);
    const completedRecent = recentItems.filter(it => it.status === "done");
    const stale = (data.items || []).filter(it => {
      if (it.status !== "todo" && it.status !== "blocked" && it.status !== "hold") return false;
      const lastTouched = it.lastUpdatedAt || it.createdAt || 0;
      return Date.now() - lastTouched > 14 * 24 * 60 * 60 * 1000;
    });
    const overdue = (data.items || []).filter(it => {
      if (it.status === "done") return false;
      if (!it.scheduledDate) return false;
      return it.scheduledDate < todayISO;
    });
    const recentThreadCaptures = (data.threads || []).reduce((sum, t) =>
      sum + (t.entries || []).filter(e => (e.createdAt || 0) >= sevenDaysAgo).length, 0);
    // Project tally — which projects got the most attention
    const projectCounts = {};
    for (const it of recentItems) {
      const p = (it.project || "").trim();
      if (p) projectCounts[p] = (projectCounts[p] || 0) + 1;
    }
    const topProject = Object.entries(projectCounts).sort((a, b) => b[1] - a[1])[0];
    const activitySummary = {
      completedCount: completedRecent.length,
      completedTitles: completedRecent.slice(0, 8).map(it => it.title),
      staleCount: stale.length,
      staleTitles: stale.slice(0, 5).map(it => `"${it.title}" (${Math.floor((Date.now() - (it.lastUpdatedAt || it.createdAt || 0)) / (24*60*60*1000))}d untouched)`),
      overdueCount: overdue.length,
      overdueTitles: overdue.slice(0, 5).map(it => it.title),
      threadCapturesCount: recentThreadCaptures,
      activeItemCount: (data.items || []).filter(it => it.status !== "done").length,
      topProject: topProject ? { name: topProject[0], itemCount: topProject[1] } : null,
    };
    // Only run if there's meaningful activity (don't generate empty observations)
    if (activitySummary.completedCount === 0 && activitySummary.staleCount === 0
        && activitySummary.overdueCount === 0 && activitySummary.threadCapturesCount === 0) return;
    // Generate (async, fire-and-forget)
    (async () => {
      const result = await generateWeeklyObservations(
        activitySummary,
        data.weeklyObservations?.observations || null
      );
      if (result.error || !Array.isArray(result.observations) || result.observations.length === 0) return;
      updateData({
        ...data,
        weeklyObservations: {
          weekOf: weekOfISO,
          observations: result.observations,
          summary: result.summary || "",
          generatedAt: Date.now(),
          dismissed: false,
          acknowledgedIds: [],
        },
      });
    })();
  }, [data?.weeklyObservations?.weekOf, screen]);
  useEffect(() => {
    const handler = (e) => {
      const detail = e?.detail;
      if (!detail || typeof detail.undoFn !== "function") return;
      setUndoToast({
        label: detail.label || "Action",
        undoFn: detail.undoFn,
        expiresAt: Date.now() + 10000,
      });
    };
    if (typeof window !== "undefined") {
      window.addEventListener("work-hub-undo", handler);
      return () => window.removeEventListener("work-hub-undo", handler);
    }
  }, []);
  // Auto-clear undo toast when its window expires
  useEffect(() => {
    if (!undoToast) return;
    const ms = undoToast.expiresAt - Date.now();
    if (ms <= 0) { setUndoToast(null); return; }
    const id = setTimeout(() => setUndoToast(null), ms);
    return () => clearTimeout(id);
  }, [undoToast]);
  useEffect(() => {
    const handler = (e) => setLastAutosaveAt(e?.detail?.at || Date.now());
    if (typeof window !== "undefined") {
      window.addEventListener("work-hub-autosaved", handler);
      return () => window.removeEventListener("work-hub-autosaved", handler);
    }
  }, []);
  // Subtask timing capture listener (D-2). Receives entries from
  // DraggableTaskList when a subtask is checked complete with a frozen
  // timer. Pushes onto data.timingHistory (capped at 500) so the leaderboard
  // and Rosie's estimator both see the data.
  useEffect(() => {
    const handler = (e) => {
      const entry = e?.detail;
      if (!entry || typeof entry !== "object" || !entry.actualMin) return;
      setData(prev => {
        const next = { ...prev, timingHistory: [...(prev.timingHistory || []), entry].slice(-500) };
        return next;
      });
    };
    if (typeof window !== "undefined") {
      window.addEventListener("work-hub-timing-captured", handler);
      return () => window.removeEventListener("work-hub-timing-captured", handler);
    }
  }, []);
  const [pendingCheckIn, setPendingCheckIn] = useState(null); // stashes check-in details while the today-picker is shown
  const [roadmapError, setRoadmapError] = useState(null); // {message, retry} when generation fails or times out
  const [pendingWorkTab, setPendingWorkTab] = useState(null); // when user comes back from FocusView, which Work Hub tab to land on
  const [appTab, setAppTab] = useState("work"); // "work" | "meetings" | "email"
  // When a past meeting pill is clicked on the roadmap, we route the user to the
  // Meetings tab and ask MeetingsTab to auto-open its history modal scrolled to
  // that meeting. The slot is shared via this state; MeetingsTab clears it on read.
  const [pendingPastMeeting, setPendingPastMeeting] = useState(null);
  const handlePastMeetingClick = (slot) => {
    if (!slot) return;
    setPendingPastMeeting({ slotLabel: (slot.label || "").trim(), at: Date.now() });
    setAppTab("meetings");
  };
  // When a "draft →" pill is clicked on a reminder tagged email/teams, we route
  // to Email & Teams and pre-fill the "Tell me the situation" chat with the
  // reminder text + linked item title. EmailHub clears the prefill on read.
  const [pendingMessagePrefill, setPendingMessagePrefill] = useState(null);
  const handleDraftMessage = (reminder, linkedItem) => {
    if (!reminder) return;
    const parts = [];
    parts.push(reminder.text || "");
    if (linkedItem && linkedItem.title) {
      parts.push(`(related to: ${linkedItem.title})`);
    }
    setPendingMessagePrefill({
      kind: reminder.messageKind || "email",
      text: parts.filter(Boolean).join(" "),
      reminderId: reminder.id,
      linkedItemId: linkedItem ? linkedItem.id : null,
      at: Date.now(),
    });
    setAppTab("email");
  };
  const [focusItem, setFocusItem] = useState(null);
  const [focusMeeting, setFocusMeeting] = useState(null); // active meeting for MeetingFocusView
  const [energy, setEnergy] = useState(null);
  const [mood, setMood] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [showEOD, setShowEOD] = useState(false);
  // Quiet "day wrapped ✓" indicator, shown briefly after the EOD chain fires
  // when the user hard-closes the day. Purely cosmetic; the chain runs whether
  // or not this is visible.
  const [dayWrapped, setDayWrapped] = useState(false);
  const dayWrappedTimerRef = useRef(null);
  const [showRoadmapHistory, setShowRoadmapHistory] = useState(false);
  // Parked items dashboard — modal accessed via the "⛵ Parked (N)" pill in
  // the Overview header. Shows resurface dates + per-item actions.
  const [showParkedDashboard, setShowParkedDashboard] = useState(false);

  // Stage B — Break timer + Block transition modal state.
  //   activeBreakTimer: { slotIdx, slotLabel, slotNote, endsAt } | null
  //     - persisted INSIDE `data` (under data.activeBreakTimer) so a reload
  //       mid-break resumes the timer. Lives in `data` rather than a separate
  //       storage key by design — the autosave pipeline + the existing
  //       backup/restore tooling all operate on `data` as a single unit, so
  //       keeping the timer state there means it's covered by every backup
  //       and the load/save path stays simple. The leading-position in the
  //       object name flags it as transient session state.
  //     - cleared on Done, cancel, or when it's gone stale (>10 min past end).
  //   pendingTransition: { fromSlotIdx, nextSlotIdx } | null
  //     - in-memory only; set by the polling effect when a slot just ended
  //       while the user is in a focus task.
  //   dismissedTransitionsRef: Ref<Set<number>>
  //     - in a useRef rather than useState so updates don't restart the
  //       polling effect. Slot indices the user has already dismissed today
  //       (resets on reload, which is the right behavior — a new day means
  //       a new roadmap, so old indices wouldn't apply anyway).
  const [activeBreakTimer, setActiveBreakTimer] = useState(null);
  const [pendingTransition, setPendingTransition] = useState(null);
  const dismissedTransitionsRef = useRef(new Set());
  const [roadmap, setRoadmapRaw] = useState(null);
  // Wrapped setter — auto-archives every roadmap change to history so it's never lost.
  //
  // HISTORY IS PRECIOUS — we go to extreme lengths to never accidentally delete
  // existing entries. A user's past roadmaps are days of their work; losing them
  // is a real harm. The rules below are intentionally paranoid.
  const setRoadmap = (next) => {
    setRoadmapRaw(next);
    if (!next || !next.slots || next.slots.length === 0) return;

    const dateKey = next.date || new Date().toISOString().slice(0, 10);
    // Generate a stable ID. Use the existing one if present, otherwise create one
    // tied to the date so re-renders with the same roadmap don't generate fresh IDs.
    const id = next.id || `rm-${dateKey}-${Date.now()}`;
    const snapshot = {
      id,
      date: dateKey,
      capturedAt: Date.now(),
      energy: next.energy,
      mood: next.mood,
      headline: next.headline,
      greeting: next.greeting,
      slots: next.slots,
      todayAdvice: next.todayAdvice,
      protectedTime: next.protectedTime,
      completedSlots: next.completedSlots || [],
    };

    setData(prev => {
      const existing = prev.roadmapHistory || [];

      // RULE 1: Dedup by DATE — one entry per calendar day, latest version wins.
      // Same-day refines/edits should overwrite, not pile up. The previous bug
      // ("&&" instead of just date filter) is avoided here by being explicit:
      // we keep entries whose date is DIFFERENT from today's, and replace the
      // same-date entry with the new snapshot.
      const filtered = existing.filter(h => h && h.date && h.date !== dateKey);

      // RULE 2: Sanity check — same-day dedup should remove AT MOST entries
      // matching the same date. If somehow multiple entries had today's date
      // (legacy data from the previous ID-based dedup), they all collapse into
      // one — but if the filter removed entries from OTHER dates, abort.
      const removedFromOtherDates = existing.filter(h => h && h.date && h.date !== dateKey && !filtered.includes(h));
      if (removedFromOtherDates.length > 0) {
        console.warn("[history guard] write would delete entries from other dates — aborting.", removedFromOtherDates);
        return prev;
      }

      // RULE 3: Cap at 60. Sort by capturedAt desc, then keep top 60.
      const merged = [snapshot, ...filtered].sort((a, b) => (b.capturedAt || 0) - (a.capturedAt || 0));
      const capped = merged.slice(0, 60);

      const updated = { ...prev, roadmapHistory: capped };
      saveToStorage(updated);

      // RULE 4: Also save a backup copy of just history under a separate storage key.
      // If the main data ever gets corrupted, this backup gives us a recovery path.
      try {
        if (typeof window !== "undefined" && window.storage && typeof window.storage.set === "function") {
          window.storage.set(`${STORAGE_KEY}-history-backup`, JSON.stringify(capped));
        }
      } catch (e) { /* backup is best-effort, never block */ }

      return updated;
    });
  };
  // Track the date string (YYYY-MM-DD) for which we already showed EOD, so it
  // shows once per day. The previous boolean approach combined with the "exactly
  // 16:30" check meant the prompt would fire only if the user was on the overview
  // screen between 4:30:00–4:30:59 on a 30-second polling interval — easy to miss.
  const eodRef = useRef(null); // null | "YYYY-MM-DD" of last shown
  const eodSnoozeTimerRef = useRef(null); // timeout id for snooze re-pop
  const saveRef = useRef(null);
  // Autosave safety net — debounced setTimeout that persists `data` on every
  // change regardless of whether the caller went through updateData(). Catches
  // accidental in-place mutations or paths that forget to save explicitly.
  const autosaveRef = useRef(null);

  useEffect(() => {
    loadFromStorage().then(async saved => {
      if (saved) {
        const seeded = seedItemsIfMissing(saved);

        // HISTORY RECOVERY — check the backup storage and merge any entries that
        // exist in the backup but NOT in the main data. This is the safety net for
        // any future bug that might wipe roadmapHistory from the main store.
        try {
          if (typeof window !== "undefined" && window.storage && typeof window.storage.get === "function") {
            const backupRaw = await window.storage.get(`${STORAGE_KEY}-history-backup`);
            if (backupRaw && backupRaw.value) {
              const backupHistory = JSON.parse(backupRaw.value);
              if (Array.isArray(backupHistory) && backupHistory.length > 0) {
                const existingIds = new Set((seeded.roadmapHistory || []).map(h => h.id));
                const recovered = backupHistory.filter(h => h && h.id && !existingIds.has(h.id));
                if (recovered.length > 0) {

                  const merged = [...(seeded.roadmapHistory || []), ...recovered]
                    .sort((a, b) => (b.capturedAt || 0) - (a.capturedAt || 0))
                    .slice(0, 60);
                  seeded.roadmapHistory = merged;
                  saveToStorage(seeded); // persist the recovered merge back to main
                }
              }
            }
          }
        } catch (e) { /* recovery is best-effort */ }

        // PARKED RESURFACE: items where parkedUntil has arrived flip back to
        // active. Without this, parked items never come back — they're
        // effectively a soft-delete. This is the deferred-return mechanism
        // that makes parked status meaningfully different from cancelled.
        try {
          const todayISO = new Date().toISOString().slice(0, 10);
          let resurfaceCount = 0;
          if (Array.isArray(seeded.items)) {
            seeded.items = seeded.items.map(item => {
              if (item && item.status === "parked" && item.parkedUntil && item.parkedUntil <= todayISO) {
                resurfaceCount++;
                return { ...item, status: "todo", parkedAt: null, parkedUntil: null, lastResurfaced: Date.now() };
              }
              return item;
            });
            if (resurfaceCount > 0) {
              console.log(`[work-hub] resurfaced ${resurfaceCount} parked item(s) whose date arrived`);
              saveToStorage(seeded);
            }
          }
        } catch (e) { /* resurface is best-effort */ }

        // ONE-TIME DEDUP: Collapse any duplicate-date entries down to one (latest wins).
        // This cleans up any same-day pile-up from the previous ID-based dedup logic.
        if (Array.isArray(seeded.roadmapHistory) && seeded.roadmapHistory.length > 0) {
          const byDate = new Map();
          for (const entry of seeded.roadmapHistory) {
            if (!entry || !entry.date) continue;
            const existing = byDate.get(entry.date);
            // Keep the entry with the latest capturedAt (or just the entry if none yet)
            if (!existing || (entry.capturedAt || 0) > (existing.capturedAt || 0)) {
              byDate.set(entry.date, entry);
            }
          }
          const deduped = Array.from(byDate.values()).sort((a, b) => (b.capturedAt || 0) - (a.capturedAt || 0));
          if (deduped.length < seeded.roadmapHistory.length) {
            const removed = seeded.roadmapHistory.length - deduped.length;

            seeded.roadmapHistory = deduped;
            saveToStorage(seeded);
          }
        }

        // ── ITEMS RECOVERY — check the rolling backup. If the backup has MORE
        // items than the main data, that's a sign of accidental data loss
        // (the backup is captured on every save, so it represents the most
        // recent state where we had more items). Surface a recovery option.
        try {
          if (typeof window !== "undefined" && window.storage && typeof window.storage.get === "function") {
            const itemsBackupRaw = await window.storage.get(`${STORAGE_KEY}-items-rolling-backup`);
            if (itemsBackupRaw && itemsBackupRaw.value) {
              const itemsBackup = JSON.parse(itemsBackupRaw.value);
              const currentCount = Array.isArray(seeded.items) ? seeded.items.length : 0;
              const backupCount = Array.isArray(itemsBackup?.items) ? itemsBackup.items.length : 0;
              if (backupCount > currentCount) {
                // Backup has more items than current — likely data loss.
                // Find missing items by ID and merge them back.
                const currentIds = new Set(seeded.items.map(i => i.id));
                const recoverable = itemsBackup.items.filter(i => i && i.id && !currentIds.has(i.id));
                if (recoverable.length > 0) {
                  console.warn(`[items recovery] found ${recoverable.length} item(s) in backup not in current data — restoring:`, recoverable.map(i => i.title));
                  seeded.items = [...seeded.items, ...recoverable];
                  // Initialize the cached count to the recovered total
                  __lastSavedItemsCount = seeded.items.length;
                  saveToStorage(seeded);
                }
              }
            }
            // Initialize the cache if not yet set (avoids first-save false-positive on the guard)
            if (__lastSavedItemsCount === null) {
              __lastSavedItemsCount = Array.isArray(seeded.items) ? seeded.items.length : 0;
            }
          }
        } catch (e) { /* recovery is best-effort */ }

        setData(seeded);
        // Persist if seeding added anything
        if (seeded !== saved) saveToStorage(seeded);
        if (seeded.lastCheckIn) {
          const last = new Date(seeded.lastCheckIn);
          if (last.toDateString() === new Date().toDateString() && seeded.energy) {
            setEnergy(seeded.energy); setMood(seeded.mood); setScreen("overview");
          }
        }
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded || screen !== "overview") return;
    const check = () => {
      const now = getNowEST();
      if (isWeekend(now)) return;
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      const eodTime = 16 * 60 + 30; // 4:30 PM
      const cutoffTime = 22 * 60; // 10 PM — don't pop EOD modal late at night

      // Show the EOD modal if:
      //   (a) it's after 4:30 PM and before 10 PM,
      //   (b) we haven't shown it yet today.
      // The date key (YYYY-MM-DD) ensures it triggers exactly once per workday
      // even if the user opens the app late or stays on a non-overview screen
      // through 4:30 and lands on overview at 5:15.
      if (totalMinutes >= eodTime && totalMinutes < cutoffTime) {
        const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        if (eodRef.current !== todayKey) {
          eodRef.current = todayKey;
          setShowEOD(true);
        }
      }
    };
    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, [loaded, screen]);

  const updateData = next => {
    setData(next); saveToStorage(next);
    clearTimeout(saveRef.current); setSavedFlash(false);
    requestAnimationFrame(() => setSavedFlash(true));
    saveRef.current = setTimeout(() => setSavedFlash(false), 2500);
  };

  const awardXP = (amount, x, y) => {
    showXpPop(amount, x, y);
    setData(prev => { const next = { ...prev, xp: (prev.xp || 0) + amount }; saveToStorage(next); return next; });
  };

  const handleCheckIn = ({ energy: e, mood: m, note, meetingsText }) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const last = data.lastStreakDate;
    const newStreak = last === yesterday ? (data.streak || 0) + 1 : last === today ? (data.streak || 0) : 1;
    const bonus = newStreak > (data.streak || 0) ? XP_REWARDS.checkin : 0;
    const next = { ...data, energy: e, mood: m, checkInNote: note, lastCheckIn: Date.now(), streak: newStreak, lastStreakDate: today, xp: (data.xp || 0) + XP_REWARDS.checkin + bonus };
    updateData(next); setEnergy(e); setMood(m);
    setTimeout(() => showXpPop(XP_REWARDS.checkin + bonus, window.innerWidth/2, 180), 400);

    // Cleanup pass — fires at most every 14 days. Identifies stale items
    // (todo/blocked, no movement in 30+ days). If 2+ exist, queues the
    // review modal. Modal renders on top of whatever screen comes next.
    try {
      const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      const lastCleanup = data?.preferences?.lastCleanupAt || 0;
      if (Date.now() - lastCleanup >= FOURTEEN_DAYS) {
        const nowMs = Date.now();
        const stale = (next.items || []).filter(item => {
          if (!item) return false;
          if (item.status !== "todo" && item.status !== "blocked") return false;
          const lastTouched = item.lastUpdatedAt || item.createdAt || 0;
          const created = item.createdAt || 0;
          if (nowMs - lastTouched < THIRTY_DAYS) return false;
          if (nowMs - created < THIRTY_DAYS) return false;
          return true;
        });
        if (stale.length >= 2) {
          setCleanupReviewItems(stale);
        }
      }
    } catch (e) { /* cleanup trigger best-effort */ }
    // Stash check-in details for the picker → roadmap flow
    setPendingCheckIn({ energy: e, mood: m, note, meetingsText });
    setRoadmapRaw(null); // clear current roadmap (skip auto-archive of null)
    // If there are no active items, skip the picker — Rosie will build a free day
    const hasActiveItems = (next.items || []).some(i => isActiveStatus(i.status));
    if (!hasActiveItems) {
      setScreen("roadmap");
      runRoadmapGeneration(next.items, e, m, note, meetingsText);
    } else {
      setScreen("today-picker");
    }
  };

  // Run the roadmap generation with a specific subset of items chosen by the user.
  // Wraps generateRoadmap in proper error handling so a failed/hung API call
  // doesn't leave the user stuck on "Rosie is building..." forever.
  const runRoadmapGeneration = (itemsToInclude, e, m, note, meetingsText, attempt = 1) => {
    const augmentedNote = meetingsText
      ? `${note || ""}${note ? "\n\n" : ""}TODAY'S MEETINGS (already on calendar — for EACH meeting below, create a slot with type:"meeting" at the EXACT start time, with the EXACT duration. Then add a 10-min prep buffer before AND a 15-min buffer slot after each. Meetings MUST have type:"meeting" so they get locked.):\n${meetingsText}`
      : note;
    setRoadmapError(null);

    // Hard 90-second timeout — if Rosie hangs, we surface an error rather than
    // leaving the user stuck on the building screen.
    const TIMEOUT_MS = 90000;
    let didTimeout = false;
    const timeoutId = setTimeout(() => {
      didTimeout = true;
      setRoadmapError({
        message: "Rosie is taking longer than usual. Network issue, maybe?",
        retry: () => runRoadmapGeneration(itemsToInclude, e, m, note, meetingsText, 1),
      });
    }, TIMEOUT_MS);

    generateRoadmap(itemsToInclude, e, m, augmentedNote)
      .then(r => {
        clearTimeout(timeoutId);
        if (didTimeout) return; // user already saw error; ignore late response
        if (!r || !Array.isArray(r.slots) || r.slots.length === 0) {
          // Defensive — generateRoadmap should now THROW for these cases, but
          // catch any leftover null returns just in case.
          setRoadmapError({
            message: "Rosie didn't return a usable roadmap. Want to try again?",
            retry: () => runRoadmapGeneration(itemsToInclude, e, m, note, meetingsText, 1),
          });
          return;
        }
        const todayISO = new Date().toISOString().slice(0, 10);
        // Follow-ups: identify items needing check-in messages today and inject
        // a dedicated slot if any qualify. Skips entirely when preference is
        // off or zero follow-ups found, so the roadmap stays clean.
        const includeFollowUps = data?.preferences?.includeFollowUps !== false;
        let followUpsArr = [];
        let finalSlots = r.slots;
        if (includeFollowUps) {
          followUpsArr = identifyFollowUps(itemsToInclude, data?.reminders || [], todayISO);
          if (followUpsArr.length > 0) {
            finalSlots = insertFollowUpSlot(r.slots, followUpsArr);
          }
        }
        setRoadmap({
          ...r,
          slots: finalSlots,
          followUps: followUpsArr,
          id: `rm-${Date.now()}`,
          date: todayISO,
          energy: e,
          mood: m,
          completedSlots: [],
        });
      })
      .catch(err => {
        clearTimeout(timeoutId);
        if (didTimeout) return;
        console.warn(`[generateRoadmap] attempt ${attempt} failed:`, err);
        // Auto-retry up to 2x for parse/empty-response failures (Rosie's nondeterministic).
        // Network/rate-limit errors don't auto-retry — user choice.
        const errMsg = err?.message || "Something went wrong";
        const isTransient = errMsg.includes("wasn't valid JSON") ||
                            errMsg.includes("empty response") ||
                            errMsg.includes("didn't generate any slots");
        if (isTransient && attempt < 3) {
          // Brief delay then retry silently — Rosie sometimes just gets it right on the second try
          setTimeout(() => runRoadmapGeneration(itemsToInclude, e, m, note, meetingsText, attempt + 1), 800);
          return;
        }
        // Final failure — surface the actual error to the user
        setRoadmapError({
          message: errMsg,
          retry: () => runRoadmapGeneration(itemsToInclude, e, m, note, meetingsText, 1),
        });
      });
  };

  // Called when user confirms the today-picker. selectedItems is the subset they chose.
  const handleTodayPickerConfirm = (selectedItems) => {
    const ck = pendingCheckIn;
    if (!ck) return;
    setScreen("roadmap");
    runRoadmapGeneration(selectedItems, ck.energy, ck.mood, ck.note, ck.meetingsText);
    setPendingCheckIn(null);
  };

  // Called if user opts to skip the picker. Filters to items that the picker
  // would have pre-selected (overdue + due today), extended to tomorrow — so
  // Rosie has a focused list to map into slots instead of getting flooded
  // with every non-done item (which tends to produce generic blocks).
  // Falls back to all non-done items if nothing matches, so skip never
  // produces an empty roadmap.
  const handleTodayPickerSkip = () => {
    const ck = pendingCheckIn;
    if (!ck) return;
    setScreen("roadmap");
    const todayISO = todayStr();
    const tomorrowISO = addDaysToDateStr(todayISO, 1);
    const dueSoon = (data.items || []).filter(i => {
      if (i.status === "done" || i.status === "blocked" || i.status === "waiting") return false;
      return i.scheduledDate && i.scheduledDate <= tomorrowISO;
    });
    const itemsToUse = dueSoon.length > 0
      ? dueSoon
      : (data.items || []).filter(i => isActiveStatus(i.status));
    runRoadmapGeneration(itemsToUse, ck.energy, ck.mood, ck.note, ck.meetingsText);
    setPendingCheckIn(null);
  };

  const handleFocus = item => { setFocusItem(item); setScreen("focus"); };
  const handleOneThing = item => { setFocusItem(item); setScreen("onething"); };
  const updateItem = item => { const next = { ...data, items: data.items.map(i => i.id === item.id ? item : i) }; updateData(next); setFocusItem(item); };

  // Meeting handlers — find an existing meeting for this slot or create a fresh one
  const handleMeetingFocus = (slot, opts = {}) => {
    if (!slot) return;
    // EARLY PATH: caller passed a FULL meeting object (e.g. from history),
    // not a roadmap slot. We can tell because it has an id and at least one
    // populated meeting-data field. Route it to the focus screen by id —
    // if it's already in data.meetings, use that record; otherwise promote
    // it (preserving minutes/notes/script) so the focus view has somewhere
    // to write updates back to.
    const looksLikeFullMeeting = slot.id && (
      slot.minutes || slot.minutesTranscript || slot.notes || slot.generated ||
      slot.fullScript || slot.situation || slot.whoWith
    );
    if (looksLikeFullMeeting) {
      const existing = (data.meetings || []).find(m => m.id === slot.id);
      if (existing) {
        setFocusMeeting(existing);
        setScreen("meetingFocus");
        return;
      }
      // Promote MPC-history meeting into data.meetings so the focus view
      // can read/write through onUpdateData like any other meeting.
      const promoted = {
        id: slot.id,
        slotLabel: slot.slotLabel || "",
        title: slot.title || slot.slotLabel || "Meeting",
        date: slot.date || new Date().toISOString().slice(0, 10),
        scheduledTime: slot.scheduledTime || "",
        vibe: slot.vibe || "warm",
        energy: slot.energy || "normal",
        situation: slot.situation || "",
        whoWith: slot.whoWith || "",
        generated: slot.generated || null,
        curveballs: slot.curveballs || [],
        fullScript: slot.fullScript || null,
        notes: Array.isArray(slot.notes) ? "" : (slot.notes || ""),
        minutes: slot.minutes || null,
        minutesMeta: slot.minutesMeta || null,
        minutesTranscript: slot.minutesTranscript || "",
        minutesType: slot.minutesType || "general",
        createdAt: slot.createdAt || Date.now(),
        completedAt: slot.completedAt || null,
      };
      updateData({ ...data, meetings: [...(data.meetings || []), promoted] });
      setFocusMeeting(promoted);
      setScreen("meetingFocus");
      return;
    }
    // ORIGINAL PATH: roadmap slot → create or reuse today's meeting record.
    const { autoPrep = false, prefilledSituation = "", detectedType = null } = opts || {};
    const dateKey = new Date().toISOString().slice(0, 10);
    const slotLabel = (slot.label || "").trim();
    const existing = (data.meetings || []).find(m => m.date === dateKey && m.slotLabel === slotLabel);
    let meeting;
    if (existing) {
      if (autoPrep && prefilledSituation && !(existing.situation && existing.situation.trim())) {
        meeting = { ...existing, situation: prefilledSituation, _autoPrep: true, _detectedType: detectedType };
      } else {
        meeting = { ...existing, _autoPrep: false };
      }
    } else {
      meeting = {
        id: `mtg-${Date.now()}`,
        slotLabel,
        title: slotLabel,
        date: dateKey,
        scheduledTime: slot.time,
        vibe: "warm",
        energy: "normal",
        situation: autoPrep ? prefilledSituation : "",
        whoWith: "",
        generated: null,
        curveballs: [],
        fullScript: null,
        notes: "",
        createdAt: Date.now(),
        completedAt: null,
        _autoPrep: autoPrep,
        _detectedType: detectedType,
      };
      const { _autoPrep, _detectedType, ...persistable } = meeting;
      const newMeetings = [...(data.meetings || []), persistable];
      updateData({ ...data, meetings: newMeetings });
    }
    setFocusMeeting(meeting);
    setScreen("meetingFocus");
  };
  const updateMeeting = (m) => {
    const meetings = (data.meetings || []).map(x => x.id === m.id ? m : x);
    updateData({ ...data, meetings });
    setFocusMeeting(m);
  };

  const addSpiralRoot = s => { const exists = (data.spirals || []).find(x => x.id === s.id); const spirals = exists ? data.spirals.map(x => x.id === s.id ? s : x) : [s, ...(data.spirals || [])]; updateData({ ...data, spirals }); };
  const updateSpiralRoot = s => updateData({ ...data, spirals: (data.spirals || []).map(x => x.id === s.id ? s : x) });
  const deleteSpiralRoot = id => updateData({ ...data, spirals: (data.spirals || []).filter(x => x.id !== id) });

  // ── Stage B handlers — Break timer + Block transition modal ────────
  // Pure state-and-roadmap mutations; the actual shift math lives in
  // shiftRoadmapAfterSnooze() at module level (near formatSlotMinutes).

  // Open the break-timer modal for a slot. Persists endsAt to storage so
  // a reload mid-timer can resume.
  const startBreakTimer = (slotIdx) => {
    if (!roadmap || !roadmap.slots || !roadmap.slots[slotIdx]) return;
    const slot = roadmap.slots[slotIdx];
    const durMins = slot.durationMin || 15;
    const endsAt = Date.now() + durMins * 60 * 1000;
    const next = { slotIdx, slotLabel: slot.label, slotNote: slot.note, endsAt };
    setActiveBreakTimer(next);
    updateData({ ...data, activeBreakTimer: next });
  };

  const clearBreakTimer = () => {
    setActiveBreakTimer(null);
    if (data.activeBreakTimer) updateData({ ...data, activeBreakTimer: null });
  };

  const breakTimerDone = () => {
    // Mark the slot as complete, then clear timer.
    if (activeBreakTimer && roadmap) {
      const idx = activeBreakTimer.slotIdx;
      const completedSet = new Set(roadmap.completedSlots || []);
      completedSet.add(idx);
      setRoadmap({ ...roadmap, completedSlots: Array.from(completedSet) });
    }
    clearBreakTimer();
  };

  const breakTimerSnooze = () => {
    if (!activeBreakTimer || !roadmap) return;
    const idx = activeBreakTimer.slotIdx;
    const SNOOZE_MIN = 5;
    // Shift subsequent non-locked slots by 5 min.
    const newSlots = shiftRoadmapAfterSnooze(roadmap.slots || [], idx, SNOOZE_MIN);
    setRoadmap({ ...roadmap, slots: newSlots });
    // Extend the timer by 5 minutes (push endsAt out).
    const newEndsAt = activeBreakTimer.endsAt + SNOOZE_MIN * 60 * 1000;
    const next = { ...activeBreakTimer, endsAt: newEndsAt };
    setActiveBreakTimer(next);
    updateData({ ...data, activeBreakTimer: next });
  };

  const breakTimerClose = () => { clearBreakTimer(); };

  // Block-transition modal handlers
  const transitionGoNext = () => {
    if (!pendingTransition) return;
    dismissedTransitionsRef.current.add(pendingTransition.fromSlotIdx);
    setPendingTransition(null);
    // Close focus screen — back to overview where the roadmap is visible.
    setScreen("overview");
  };

  const transitionSnooze = () => {
    if (!pendingTransition || !roadmap) return;
    const SNOOZE_MIN = 5;
    const newSlots = shiftRoadmapAfterSnooze(
      roadmap.slots || [],
      pendingTransition.fromSlotIdx,
      SNOOZE_MIN
    );
    setRoadmap({ ...roadmap, slots: newSlots });
    dismissedTransitionsRef.current.add(pendingTransition.fromSlotIdx);
    setPendingTransition(null);
  };

  const transitionDismiss = () => {
    if (!pendingTransition) return;
    dismissedTransitionsRef.current.add(pendingTransition.fromSlotIdx);
    setPendingTransition(null);
  };

  // ── Hydrate the break timer from storage after data loads ──
  // Runs once (when `loaded` flips). If a stale timer is present (expired
  // >10 min ago) we clear it; otherwise we resume so the user sees the
  // modal where they left off.
  // MUST stay ABOVE the `if (!loaded) return` below — hook order rule.
  const breakTimerHydratedRef = useRef(false);
  useEffect(() => {
    if (!loaded) return;
    if (breakTimerHydratedRef.current) return;
    breakTimerHydratedRef.current = true;
    const stored = data.activeBreakTimer;
    if (stored && stored.endsAt) {
      const STALE_AFTER = 10 * 60 * 1000; // 10 min past expiry → stale
      if (stored.endsAt > Date.now() - STALE_AFTER) {
        setActiveBreakTimer(stored);
      } else {
        updateData({ ...data, activeBreakTimer: null });
      }
    }
  }, [loaded]);

  // ── Polling for block transitions ──
  // While the user is in a focus task AND there's a roadmap, check every 15s
  // whether they've crossed a slot boundary that hasn't been handled yet.
  //
  // The fix for the "skips to the slot after next" bug: the old logic only
  // fired if a slot ended within the last 2 minutes. If the user was
  // heads-down and didn't catch that narrow window, the transition was lost
  // forever — and the NEXT slot's end (now inside the window) is what fired,
  // so the modal pointed one slot too far ahead.
  //
  // New logic: find the MOST RECENT slot that (a) has ended, (b) ended within
  // the last 20 min, (c) hasn't been dismissed this session, and (d) isn't
  // checked off. The 20-min lookback is wide enough that a heads-down user
  // doesn't miss a real transition, narrow enough that opening FocusView
  // later in the day doesn't resurface stale ones. Once dismissed/acted-on
  // it's recorded in dismissedTransitionsRef and won't refire.
  // MUST stay ABOVE the `if (!loaded) return` below — hook order rule.
  // ── Active meeting auto-detect ──
  // Polls every 60s and on relevant deps. If current time falls inside a
  // meeting slot, sets activeMeetingBanner with the slot info. Cleared
  // when no meeting is current. The banner UI prompts the user to enter
  // meeting mode (MeetingFocusView). Quiet during non-meeting blocks.
  // MUST stay ABOVE the `if (!loaded) return` below — hook order rule.
  useEffect(() => {
    if (!loaded) return;
    if (!roadmap || !Array.isArray(roadmap.slots) || roadmap.slots.length === 0) {
      setActiveMeetingBanner(null);
      return;
    }
    const check = () => {
      try {
        const now = new Date();
        const currentMin = now.getHours() * 60 + now.getMinutes();
        for (let i = 0; i < roadmap.slots.length; i++) {
          const slot = roadmap.slots[i];
          if (!slot || !isMeetingSlot(slot) || !slot.time || !slot.durationMin) continue;
          const startMin = parseSlotTimeMinutes(slot.time);
          if (typeof startMin !== "number" || Number.isNaN(startMin)) continue;
          const endMin = startMin + slot.durationMin;
          if (currentMin >= startMin && currentMin < endMin) {
            setActiveMeetingBanner({ slotIdx: i, label: slot.label || "Meeting", startMin, endMin });
            return;
          }
        }
        setActiveMeetingBanner(null);
      } catch (e) { /* detection best-effort */ }
    };
    check();
    const id = setInterval(check, 60000); // every 60s
    return () => clearInterval(id);
  }, [loaded, roadmap]);

  useEffect(() => {
    if (!loaded) return;
    if (screen !== "focus") return;
    if (!roadmap || !roadmap.slots || roadmap.slots.length === 0) return;
    if (pendingTransition) return;
    if (activeBreakTimer) return;

    const checkTransition = () => {
      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();
      const slots = roadmap.slots;
      const completedSet = new Set(roadmap.completedSlots || []);
      // How far back a slot-end can be and still be worth surfacing. Generous
      // enough that a heads-down user doesn't miss a real transition (the old
      // 2-min window was the bug), tight enough that opening FocusView later
      // in the day doesn't resurface transitions for slots long past.
      const LOOKBACK_MIN = 20;
      // Walk forward, tracking the latest slot that has ended recently and
      // hasn't been handled. We don't early-return on the first match —
      // we want the MOST RECENT qualifying slot, not the oldest.
      let candidateIdx = -1;
      for (let i = 0; i < slots.length; i++) {
        const s = slots[i];
        const start = parseSlotTimeMinutes(s.time);
        if (start < 0) continue;
        const end = start + (s.durationMin || 0);
        if (end <= nowMins) {
          // Slot has ended. Surface it only if: recent enough, not already
          // dismissed this session, and not already checked off.
          const endedRecently = end > nowMins - LOOKBACK_MIN;
          if (endedRecently && !dismissedTransitionsRef.current.has(i) && !completedSet.has(i)) {
            candidateIdx = i; // keep the latest one that qualifies
          }
        } else {
          // This slot hasn't ended yet — nothing past here has either.
          break;
        }
      }
      if (candidateIdx >= 0) {
        const nextIdx = candidateIdx + 1 < slots.length ? candidateIdx + 1 : null;
        setPendingTransition({ fromSlotIdx: candidateIdx, nextSlotIdx: nextIdx });
      }
    };

    checkTransition();
    const interval = setInterval(checkTransition, 15 * 1000);
    return () => clearInterval(interval);
  }, [loaded, screen, roadmap, activeBreakTimer, pendingTransition]);

  // ── Autosave safety net ──
  // Debounced 600ms — every change to `data` triggers a save, regardless of
  // whether the caller went through updateData(). Acts as a backstop for any
  // path that mutates state without explicitly calling saveToStorage. The
  // existing call sites still fire immediately; this is purely additive.
  // MUST be defined BEFORE the `if (!loaded) return` early return below so the
  // hook count stays consistent across renders (React error #310 otherwise).
  // We guard INSIDE the effect so saves don't fire with defaultData pre-load.
  useEffect(() => {
    if (!loaded) return;
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => { saveToStorage(data); }, 600);
    return () => { if (autosaveRef.current) clearTimeout(autosaveRef.current); };
  }, [data, loaded]);

  // ── Dev console hooks ──
  // window.__workhubData → live peek at current state from the browser console
  // window.exportHubBackup() → one-call backup download (uses the helper above)
  // Refreshed on every render so they stay in sync with the latest `data`.
  // Also placed BEFORE the early return to maintain hook order.
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__workhubData = data;
      window.exportHubBackup = () => exportHubBackup(data);
    }
  }, [data]);

  if (!loaded) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#fdf0f5 0%,#fdf6ee 50%,#f5f0fd 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{css}</style>
      <p className="jost pulse" style={{ color: "rgba(212,130,154,0.6)", fontSize: 14, letterSpacing: 2 }}>loading your hub…</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#fdf0f5 0%,#fdf6ee 50%,#f5f0fd 100%)", padding: "24px 20px", position: "relative", overflow: "hidden" }}>
      <style>{css}</style>
      <div style={{ position: "fixed", top: "-30px", right: "5%", fontSize: 120, opacity: .04, color: "#d4829a", pointerEvents: "none", zIndex: 0 }}>✿</div>
      <div style={{ position: "fixed", bottom: "5%", left: "-20px", fontSize: 80, opacity: .04, color: "#c4a882", pointerEvents: "none", zIndex: 0 }}>✦</div>
      <div style={{ position: "fixed", top: "40%", right: "-10px", fontSize: 60, opacity: .04, color: "#b8a0d4", pointerEvents: "none", zIndex: 0 }}>❀</div>
      <SavedIndicator show={savedFlash} />
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Weekly observations from Rosie — Monday morning surfacing.
            Only renders on overview-level screens so it doesn't intrude on
            check-in, roadmap-build, or focus flows where Lexy is heads-down. */}
        {(screen === "overview" || screen === "work") && (
          <WeeklyObservationsCard
            data={data}
            onDismiss={() => updateData({
              ...data,
              weeklyObservations: { ...(data.weeklyObservations || {}), dismissed: true },
            })}
            onAcknowledge={(obsId) => updateData({
              ...data,
              weeklyObservations: {
                ...(data.weeklyObservations || {}),
                acknowledgedIds: [...(data.weeklyObservations?.acknowledgedIds || []), obsId],
              },
            })}
          />
        )}
        {/* Phase 2 — Agent auto-start consent modal. Shown right after user
            commits the morning roadmap if any tasks were detected as candidates
            for an agent head-start. Confirm = background generation begins +
            transition to overview. Skip = transition to overview. */}
        {agentConsentCandidates && (
          <AgentConsentModal
            candidates={agentConsentCandidates}
            onSkip={() => {
              setAgentConsentCandidates(null);
              setScreen("overview");
            }}
            onConfirm={(accepted) => {
              // Clear modal + transition immediately — generation runs in background
              setAgentConsentCandidates(null);
              setScreen("overview");
              if (accepted.length === 0) return;
              // Fire-and-forget Promise.all — caps at 8 concurrent (browser limit).
              // Each completed agent run saves to the item's agentDrafts AND logs
              // to data.agentLog. We use a closure over the current data ref so
              // multiple writes don't clobber each other.
              (async () => {
                const BATCH_SIZE = 4; // Conservative — these are heavier API calls
                for (let i = 0; i < accepted.length; i += BATCH_SIZE) {
                  const batch = accepted.slice(i, i + BATCH_SIZE);
                  await Promise.all(batch.map(async (c) => {
                    const item = (data?.items || []).find(it => it.id === c.itemId);
                    if (!item) return;
                    const taskContext = `Task: "${item.title}". ${item.why ? `Why: "${item.why}". ` : ""}Status: ${item.status || "todo"}.${Array.isArray(item.tasks) && item.tasks.length ? ` Subtasks: ${item.tasks.join("; ")}.` : ""}${item.notes ? ` Notes: "${String(item.notes).slice(0, 400)}".` : ""}`;
                    // Run the agent. We pass null for userInput so the agent
                    // works from task context alone (matches Phase 1 design).
                    const r = await runAgent(c.agentId, "", taskContext, null);
                    if (r.error) return; // Silently skip failures — user can retry manually
                    // Use setData with callback to avoid stale-closure issues
                    // (multiple agents may complete concurrently). saveToStorage
                    // called explicitly inside the callback to persist properly.
                    setData(prev => {
                      const items = (prev?.items || []).map(it => {
                        if (it.id !== c.itemId) return it;
                        const newDraft = {
                          ...r,
                          savedAt: Date.now(),
                          autoGenerated: true, // flag so we know this came from auto-start
                        };
                        return { ...it, agentDrafts: [...(it.agentDrafts || []), newDraft] };
                      });
                      const logEntry = {
                        id: r.logId,
                        agentId: c.agentId,
                        taskId: c.itemId,
                        taskTitle: c.taskTitle,
                        ranAt: r.generatedAt,
                        status: "draft",
                        hadReviewNotes: (r.reviewNotes || []).length > 0,
                        source: "auto-start",
                      };
                      const next = {
                        ...prev,
                        items,
                        agentLog: [...(prev?.agentLog || []), logEntry],
                      };
                      // Persist immediately — otherwise auto-generated drafts
                      // would only show up after the next manual save action.
                      saveToStorage(next);
                      return next;
                    });
                  }));
                }
              })();
            }}
          />
        )}
        {screen === "checkin" && <CheckIn onComplete={handleCheckIn} streak={data.streak || 0} data={data} onUpdateData={updateData} />}
        {screen === "today-picker" && pendingCheckIn && (
          <TodayPicker
            data={data}
            energy={pendingCheckIn.energy}
            mood={pendingCheckIn.mood}
            onConfirm={handleTodayPickerConfirm}
            onSkip={handleTodayPickerSkip}
            onUpdateData={updateData}
          />
        )}
        {screen === "roadmap" && (
          <MorningRoadmap
            roadmap={roadmap}
            energy={energy}
            mood={mood}
            data={data}
            onUpdate={updateData}
            onUpdateRoadmap={setRoadmap}
            onContinue={() => {
              // Phase 2 — check if Rosie spotted any tasks that could use a
              // head-start. If so, show consent modal BEFORE transitioning
              // to overview. The modal handlers transition once user decides.
              const candidates = findAgentCandidates(roadmap, data?.items || []);
              if (candidates.length > 0) {
                setAgentConsentCandidates(candidates);
                // Stay on roadmap screen — modal renders as overlay
              } else {
                setScreen("overview");
              }
            }}
            onFocus={handleFocus}
            onMeetingFocus={handleMeetingFocus}
            onPastMeetingClick={handlePastMeetingClick}
            onStartBreakTimer={startBreakTimer}
            roadmapError={roadmapError}
            onBackToCheckIn={() => { setRoadmapError(null); setScreen("checkin"); }}
          />
        )}
        {screen === "overview" && (
          <>
            {/* Top-level tab strip moved down into each view (right above its
                content) so navigation is clustered close to the action. */}
            {appTab === "work" && <Overview appTab={appTab} setAppTab={setAppTab} onPastMeetingClick={handlePastMeetingClick} onDraftMessage={handleDraftMessage} data={data} energy={energy} mood={mood} onUpdate={updateData} onFocus={handleFocus} onOneThing={handleOneThing} onReCheckIn={() => setScreen("checkin")} onAwardXP={awardXP} roadmap={roadmap} onUpdateRoadmap={setRoadmap} onCloseDay={!showEOD ? () => {
              const now = getNowEST();
              const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
              eodRef.current = todayKey;
              setShowEOD(true);
            } : null} showRoadmapHistory={showRoadmapHistory} setShowRoadmapHistory={setShowRoadmapHistory} showParkedDashboard={showParkedDashboard} setShowParkedDashboard={setShowParkedDashboard} onMeetingFocus={handleMeetingFocus} initialWorkTab={pendingWorkTab} />}
            {appTab === "meetings" && <MeetingsTab appTab={appTab} setAppTab={setAppTab} onAwardXP={awardXP} data={data} onUpdateData={updateData} appEnergy={energy} appMood={mood} onReCheckIn={() => setScreen("checkin")} onShowRoadmapLog={() => setShowRoadmapHistory(true)} pendingPastMeeting={pendingPastMeeting} onClearPendingPastMeeting={() => setPendingPastMeeting(null)} onMeetingFocus={handleMeetingFocus} />}
            {appTab === "email" && <EmailHub appTab={appTab} setAppTab={setAppTab} pendingMessagePrefill={pendingMessagePrefill} onClearPendingMessagePrefill={() => setPendingMessagePrefill(null)} />}
            {/* Standing compliance reminder — Fort Financial AI Acceptable Use
                Policy. Lives as a quiet footer, not a banner: muted, low-contrast,
                thin divider above, so it reads as boilerplate rather than a call
                to action. No NPI / sensitive data, drafts only, human review. */}
            <div style={{
              marginTop: 28,
              paddingTop: 12,
              borderTop: "1px solid rgba(184,160,212,0.18)",
              textAlign: "center",
            }}>
              <p className="jost" style={{
                fontSize: 8.5,
                color: "rgba(74,53,64,0.26)",
                letterSpacing: 0.3,
                lineHeight: 1.5,
                margin: 0,
              }}>
                Drafts only — keep NPI and sensitive info out, review before sending.
              </p>
            </div>
          </>
        )}
        {screen === "focus" && focusItem && <FocusView item={data.items.find(i => i.id === focusItem.id) || focusItem} allItems={data.items} spirals={data.spirals || []} onAddSpiral={addSpiralRoot} onUpdateSpiral={updateSpiralRoot} onDeleteSpiral={deleteSpiralRoot} energy={energy} mood={mood} onUpdate={updateItem} onBack={() => { setPendingWorkTab(null); setScreen("overview"); }} onBackToTasks={() => { setPendingWorkTab("tasks"); setScreen("overview"); }} onBackToRoadmap={() => { setPendingWorkTab("today"); setScreen("overview"); }} onOneThing={handleOneThing} onAwardXP={awardXP} fullData={data} updateFullData={updateData} roadmap={roadmap} onUpdateRoadmap={setRoadmap} onMeetingFocus={handleMeetingFocus} onSwitchItem={handleFocus} />}
        {screen === "meetingFocus" && focusMeeting && <MeetingFocusView meeting={(data.meetings || []).find(m => m.id === focusMeeting.id) || focusMeeting} onUpdate={updateMeeting} onBack={() => setScreen("overview")} onAwardXP={awardXP} onComplete={() => {}} fullData={data} onUpdateData={updateData} />}
        {screen === "onething" && focusItem && <OneThingMode item={data.items.find(i => i.id === focusItem.id) || focusItem} energy={energy} mood={mood} onExit={() => setScreen("overview")} onUpdate={updateItem} onAwardXP={awardXP} />}
      </div>
      {/* Break-timer modal — opened by clicking lunch / brain break / recharge
          pills on a slot card. Counts down from slot.durationMin. When it
          fires, offers Done (mark complete) or Snooze (extend by 5 min). */}
      {activeBreakTimer && roadmap && roadmap.slots && roadmap.slots[activeBreakTimer.slotIdx] && (
        <BreakTimerModal
          slot={roadmap.slots[activeBreakTimer.slotIdx]}
          slotIdx={activeBreakTimer.slotIdx}
          endsAt={activeBreakTimer.endsAt}
          onDone={breakTimerDone}
          onSnooze={breakTimerSnooze}
          onClose={breakTimerClose}
        />
      )}
      {/* Block-transition modal — fires when a slot just ended while the user
          is in a focus task. Offers Go-to-next, Snooze (push next slots by 5
          min), or Dismiss. */}
      {pendingTransition && roadmap && roadmap.slots && (
        <BlockTransitionModal
          currentSlot={roadmap.slots[pendingTransition.fromSlotIdx]}
          currentSlotIdx={pendingTransition.fromSlotIdx}
          nextSlot={pendingTransition.nextSlotIdx != null ? roadmap.slots[pendingTransition.nextSlotIdx] : null}
          items={data?.items || []}
          onReconcile={(idx, choice) => {
            // Apply the reconciliation choice via the centralized helper. Doesn't
            // close the modal — user still hits Go to next / Snooze / Dismiss.
            setRoadmap(applyReconciliation(roadmap, idx, choice));
          }}
          onGoNext={transitionGoNext}
          onSnooze={transitionSnooze}
          onDismiss={transitionDismiss}
        />
      )}
      {showEOD && <EndOfDayModal
        data={data}
        roadmap={roadmap}
        items={data?.items || []}
        onUpdate={updateData}
        onReconcile={(idx, choice) => {
          if (roadmap) setRoadmap(applyReconciliation(roadmap, idx, choice));
        }}
        onClose={() => {
          // Detect untouched items — todo/blocked items where lastUpdatedAt
          // is older than today's start. These become tomorrow's check-in
          // carryover suggestions ("you didn't touch these — pull forward?").
          try {
            const startOfToday = (() => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); })();
            const carryoverIds = (data.items || [])
              .filter(item =>
                item &&
                (item.status === "todo" || item.status === "blocked" || item.status === "inprogress") &&
                (!item.lastUpdatedAt || item.lastUpdatedAt < startOfToday)
              )
              .map(i => i.id);
            if (carryoverIds.length > 0) {
              updateData({ ...data, tomorrowCarryover: carryoverIds, tomorrowCarryoverGeneratedAt: Date.now() });
            }
          } catch (e) { /* carryover detection best-effort */ }
          // Hard-close — actually wraps the day
          if (eodSnoozeTimerRef.current) { clearTimeout(eodSnoozeTimerRef.current); eodSnoozeTimerRef.current = null; }
          setShowEOD(false);
          setScreen("checkin");
          setFocusItem(null);
          // Fire the end-of-day chain: Sage re-spreads unfinished work across the
          // rest of the week, Ivy synthesizes, and the day's snapshot persists.
          // Fire-and-forget through the lib bridge — never blocks the close, and a
          // failure stays silent (the chain isolates its own steps). A quiet
          // "day wrapped ✓" appears when it settles. Only fires in the real app,
          // where the bridge and /api routes exist.
          try {
            const runChain = (typeof window !== "undefined" && window.__workhub && typeof window.__workhub.runEODChain === "function")
              ? window.__workhub.runEODChain
              : null;
            if (runChain) {
              const items = Array.isArray(data.items) ? data.items : [];
              const isActive = (it) => {
                const s = (it.status || "todo").toLowerCase();
                return s !== "done" && s !== "complete" && s !== "completed" && s !== "parked" && s !== "cancelled";
              };
              const toTask = (it) => ({
                id: it.id,
                name: it.title || it.name || "Untitled",
                why: it.why || "",
                status: it.status || "todo",
              });
              const doneToday = items.filter((it) => it.status === "done" && it.completedAt && it.completedAt >= startOfToday);
              const activeItems = items.filter(isActive);
              const todayData = {
                date: new Date().toISOString().slice(0, 10),
                completedTasks: doneToday.map((it) => it.title || it.name || "Untitled"),
                incompleteTasks: activeItems.map(toTask),
                allTasks: activeItems.map(toTask),
                waitingOn: items.filter((it) => (it.status || "").toLowerCase() === "blocked").map((it) => it.title || it.name || "Untitled"),
                slots: (roadmap && Array.isArray(roadmap.slots)) ? roadmap.slots : [],
                capacityState: energy || null,
                sageNote: null,
                ivyNote: null,
              };
              Promise.resolve(runChain(todayData))
                .then(() => {
                  setDayWrapped(true);
                  if (dayWrappedTimerRef.current) clearTimeout(dayWrappedTimerRef.current);
                  dayWrappedTimerRef.current = setTimeout(() => { dayWrappedTimerRef.current = null; setDayWrapped(false); }, 4000);
                })
                .catch(() => { /* chain isolates its own failures; stay quiet */ });
            }
          } catch (e) { /* EOD chain is best-effort */ }
        }}
        onDismiss={() => {
          // Soft dismiss — keep eodRef.current set to today so the auto-check
          // on the 30s tick doesn't re-pop. User can still manually re-open
          // via the "🌙 Close for the day" button on the roadmap card.
          if (eodSnoozeTimerRef.current) { clearTimeout(eodSnoozeTimerRef.current); eodSnoozeTimerRef.current = null; }
          setShowEOD(false);
        }}
        onSnooze={() => {
          // Hide for 5 min, then auto-re-pop.
          if (eodSnoozeTimerRef.current) clearTimeout(eodSnoozeTimerRef.current);
          setShowEOD(false);
          eodSnoozeTimerRef.current = setTimeout(() => {
            eodSnoozeTimerRef.current = null;
            setShowEOD(true);
          }, 5 * 60 * 1000);
        }}
      />}
      {dayWrapped && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            background: "linear-gradient(135deg, rgba(150,138,110,0.96), rgba(168,156,128,0.96))",
            color: "#fdf6ee",
            padding: "10px 16px",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
            zIndex: 95,
            boxShadow: "0 8px 24px rgba(120,100,80,0.28)",
            backdropFilter: "blur(10px)",
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: 16,
            maxWidth: "calc(100vw - 40px)",
          }}
        >
          <span aria-hidden="true">🌙</span>
          <span>day wrapped ✓</span>
        </div>
      )}
      {showRoadmapHistory && (
        <RoadmapHistoryModal
          data={data}
          onClose={() => setShowRoadmapHistory(false)}
          currentRoadmapId={roadmap?.id}
          onRestore={(entry) => {
            const todayISO = new Date().toISOString().slice(0, 10);
            const restored = {
              id: entry.id,
              date: todayISO,
              energy: entry.energy,
              mood: entry.mood,
              headline: entry.headline,
              greeting: entry.greeting,
              slots: entry.slots,
              todayAdvice: entry.todayAdvice,
              protectedTime: entry.protectedTime,
              completedSlots: entry.completedSlots || [],
            };
            setRoadmap(restored);
          }}
        />
      )}
      {loaded && ["overview", "onething"].includes(screen) && appTab === "work" && (
        <QuickCapture
          data={data}
          onUpdate={updateData}
          onAddSpiral={addSpiralRoot}
        />
      )}
      {/* Active meeting banner — auto-detected from the roadmap. Surfaces
          when current time falls inside a meeting slot. Quiet otherwise.
          Pinned to top so user sees it from any view. */}
      {activeMeetingBanner && screen !== "meetingFocus" && screen !== "focus" && (
        <div
          style={{
            position: "fixed",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg, rgba(212,130,154,0.95), rgba(232,160,180,0.95))",
            color: "#fdf6ee",
            padding: "8px 16px",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            gap: 12,
            zIndex: 95,
            boxShadow: "0 8px 24px rgba(212,130,154,0.35)",
            backdropFilter: "blur(10px)",
            fontFamily: "'Jost', sans-serif",
            fontSize: 12,
            maxWidth: "calc(100vw - 40px)",
          }}
        >
          <span style={{ fontSize: 14 }}>🤝</span>
          <span style={{ fontWeight: 500 }}>You're in a meeting now: <em style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 600, fontSize: 14 }}>{activeMeetingBanner.label}</em></span>
          <button
            onClick={() => {
              // Find or create a meeting entry for this slot, then open MeetingFocusView
              const existing = (data.meetings || []).find(m => m.slotLabel === activeMeetingBanner.label && m.date === new Date().toISOString().slice(0, 10));
              if (existing) {
                setFocusMeeting(existing);
                setScreen("meetingFocus");
              } else {
                // Create a stub meeting entry tied to this slot
                const stub = {
                  id: `meeting-${Date.now()}`,
                  slotLabel: activeMeetingBanner.label,
                  title: activeMeetingBanner.label,
                  date: new Date().toISOString().slice(0, 10),
                  notes: "",
                  vibe: "",
                  energy: "",
                  whoWith: "",
                  situation: "",
                  generated: false,
                  createdAt: Date.now(),
                };
                updateData({ ...data, meetings: [...(data.meetings || []), stub] });
                setFocusMeeting(stub);
                setScreen("meetingFocus");
              }
            }}
            className="jost"
            style={{
              background: "rgba(253,246,238,0.25)",
              border: "1px solid rgba(253,246,238,0.5)",
              color: "#fdf6ee",
              padding: "5px 12px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: 0.3,
            }}
          >Open meeting mode 🌸</button>
          <button
            onClick={() => setActiveMeetingBanner(null)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(253,246,238,0.6)",
              cursor: "pointer",
              fontSize: 16,
              padding: 0,
              lineHeight: 1,
              marginLeft: 2,
            }}
            title="Dismiss"
          >×</button>
        </div>
      )}

      {/* Storage health indicator — floating bottom-left badge showing
          ambient autosave status. Click to open diagnostic panel. */}
      <StorageHealthIndicator lastAutosaveAt={lastAutosaveAt} data={data} />

      {/* Parked items dashboard modal — opened from the ⛵ Parked pill in
          the Overview header. Lists all parked items with resurface dates. */}
      {showParkedDashboard && (
        <ParkedDashboardModal
          data={data}
          onUpdate={updateData}
          onClose={() => setShowParkedDashboard(false)}
        />
      )}

      {/* Agent panel — opens when openAgent is set to an agentId string.
          Shows the universal AgentPanel component which renders any registered agent. */}
      {openAgent && (
        <AgentPanel
          agentId={openAgent}
          taskContext={null}
          onClose={() => setOpenAgent(null)}
          onLog={(logEntry) => {
            updateData({
              ...data,
              agentLog: [...(data.agentLog || []), logEntry],
            });
          }}
        />
      )}

      {/* Floating agent launcher — bottom right. Shows on overview/work screens.
          Click reveals a small menu of available agents. */}
      {(screen === "overview" || screen === "work") && !openAgent && (
        <AgentLauncher onPick={setOpenAgent} />
      )}

      {/* Undo toast — appears bottom-center when a destructive action
          dispatches "work-hub-undo". 10-second window to click and restore.
          Auto-dismisses when timer expires. */}
      {undoToast && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(74,53,64,0.92)",
            color: "#fdf6ee",
            padding: "10px 16px",
            borderRadius: 11,
            display: "flex",
            alignItems: "center",
            gap: 14,
            zIndex: 100,
            boxShadow: "0 10px 30px rgba(74,53,64,0.25)",
            backdropFilter: "blur(8px)",
            fontSize: 13,
            fontFamily: "'Jost', sans-serif",
            maxWidth: 420,
          }}
        >
          <span>{undoToast.label}</span>
          <button
            onClick={() => {
              try { undoToast.undoFn(); } catch (e) { console.error("[undo] failed:", e); }
              setUndoToast(null);
            }}
            className="jost"
            style={{
              background: "rgba(212,130,154,0.4)",
              border: "1px solid rgba(232,160,180,0.6)",
              color: "#fdf6ee",
              padding: "5px 12px",
              borderRadius: 7,
              cursor: "pointer",
              fontWeight: 600,
              letterSpacing: 0.3,
              fontSize: 12,
            }}
          >↶ Undo</button>
          <button
            onClick={() => setUndoToast(null)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(253,246,238,0.5)",
              cursor: "pointer",
              fontSize: 16,
              padding: 0,
              lineHeight: 1,
            }}
          >×</button>
        </div>
      )}

      {/* Cleanup review modal — appears after check-in when 14+ days have
          passed and there are 2+ stale items. Helps prune the active list
          before it gets unwieldy. Per-row Keep/Park/Cancel + bulk options. */}
      {cleanupReviewItems && cleanupReviewItems.length > 0 && (() => {
        const dismissAll = (markCompleted = true) => {
          if (markCompleted) {
            updateData({ ...data, preferences: { ...(data.preferences || {}), lastCleanupAt: Date.now() } });
          }
          setCleanupReviewItems(null);
        };
        const updateItemStatus = (itemId, status, extraFields = {}) => {
          const newItems = (data.items || []).map(i =>
            i.id === itemId ? { ...i, status, lastUpdatedAt: Date.now(), ...extraFields } : i
          );
          updateData({ ...data, items: newItems, preferences: { ...(data.preferences || {}), lastCleanupAt: Date.now() } });
          setCleanupReviewItems(prev => (prev || []).filter(i => i.id !== itemId));
        };
        const keepItem = (itemId) => {
          // Just bump lastUpdatedAt to suppress next pass — doesn't change status
          const newItems = (data.items || []).map(i => i.id === itemId ? { ...i, lastUpdatedAt: Date.now() } : i);
          updateData({ ...data, items: newItems, preferences: { ...(data.preferences || {}), lastCleanupAt: Date.now() } });
          setCleanupReviewItems(prev => (prev || []).filter(i => i.id !== itemId));
        };
        const parkAllRemaining = () => {
          const parkUntilISO = (() => {
            const d = new Date();
            d.setDate(d.getDate() + 21); // 3 weeks out by default
            return d.toISOString().slice(0, 10);
          })();
          const remainingIds = new Set(cleanupReviewItems.map(i => i.id));
          const newItems = (data.items || []).map(i =>
            remainingIds.has(i.id)
              ? { ...i, status: "parked", parkedAt: Date.now(), parkedUntil: parkUntilISO, lastUpdatedAt: Date.now() }
              : i
          );
          updateData({ ...data, items: newItems, preferences: { ...(data.preferences || {}), lastCleanupAt: Date.now() } });
          setCleanupReviewItems(null);
        };
        const cancelAllRemaining = () => {
          const remainingIds = new Set(cleanupReviewItems.map(i => i.id));
          const newItems = (data.items || []).map(i =>
            remainingIds.has(i.id)
              ? { ...i, status: "cancelled", lastUpdatedAt: Date.now() }
              : i
          );
          updateData({ ...data, items: newItems, preferences: { ...(data.preferences || {}), lastCleanupAt: Date.now() } });
          setCleanupReviewItems(null);
        };
        const ageInDays = (createdAt) => Math.floor((Date.now() - (createdAt || Date.now())) / (1000 * 60 * 60 * 24));
        return (
          <div className="modal-bg" onClick={() => dismissAll(false)}>
            <div className="modal fade" onClick={e => e.stopPropagation()} style={{ maxWidth: 580, maxHeight: "85vh", overflow: "auto" }}>
              <div className="jost" style={{ fontSize: 10, letterSpacing: 2.5, color: "rgba(125,154,175,0.7)", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
                🌿 quarterly cleanup
              </div>
              <div className="cg" style={{ fontSize: 22, fontStyle: "italic", color: "#4a3540", textAlign: "center", marginBottom: 8 }}>
                {cleanupReviewItems.length} item{cleanupReviewItems.length === 1 ? "" : "s"} haven't moved in 30+ days.
              </div>
              <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.6)", lineHeight: 1.6, textAlign: "center", marginBottom: 16 }}>
                Worth reviewing? Keep ones you still care about, park ones for later, cancel ones you've moved past.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {cleanupReviewItems.map(item => (
                  <div key={item.id} style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(125,154,175,0.25)",
                    borderRadius: 9,
                    padding: "10px 14px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, gap: 8 }}>
                      <div className="jost" style={{ fontSize: 13, color: "#4a3540", fontWeight: 600, flex: 1, minWidth: 0 }}>{item.title}</div>
                      <span className="jost" style={{ fontSize: 10, color: "rgba(74,53,64,0.5)", whiteSpace: "nowrap" }}>{ageInDays(item.createdAt)} days old</span>
                    </div>
                    {item.why && <div className="jost" style={{ fontSize: 11, color: "rgba(74,53,64,0.55)", fontStyle: "italic", marginBottom: 8 }}>Why: {item.why}</div>}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        onClick={() => keepItem(item.id)}
                        className="jost"
                        style={{
                          background: "rgba(158,184,154,0.15)",
                          border: "1px solid rgba(158,184,154,0.4)",
                          color: "#7a9e78",
                          fontSize: 10, padding: "4px 10px", borderRadius: 6,
                          cursor: "pointer", fontWeight: 600,
                        }}
                      >✓ Keep</button>
                      <button
                        onClick={() => {
                          const parkUntil = (() => { const d = new Date(); d.setDate(d.getDate() + 21); return d.toISOString().slice(0, 10); })();
                          updateItemStatus(item.id, "parked", { parkedAt: Date.now(), parkedUntil: parkUntil });
                        }}
                        className="jost"
                        style={{
                          background: "rgba(125,154,175,0.15)",
                          border: "1px solid rgba(125,154,175,0.4)",
                          color: "#5e7e95",
                          fontSize: 10, padding: "4px 10px", borderRadius: 6,
                          cursor: "pointer", fontWeight: 600,
                        }}
                      >⛵ Park (3 weeks)</button>
                      <button
                        onClick={() => updateItemStatus(item.id, "cancelled")}
                        className="jost"
                        style={{
                          background: "rgba(168,158,148,0.15)",
                          border: "1px solid rgba(168,158,148,0.4)",
                          color: "#a89e94",
                          fontSize: 10, padding: "4px 10px", borderRadius: 6,
                          cursor: "pointer", fontWeight: 500,
                        }}
                      >✗ Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "space-between", flexWrap: "wrap", paddingTop: 12, borderTop: "1px solid rgba(74,53,64,0.08)" }}>
                <button onClick={() => dismissAll(true)} className="btn ghost jost" style={{ padding: "7px 12px", fontSize: 11 }}>Skip this review</button>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={parkAllRemaining} className="jost" style={{ background: "rgba(125,154,175,0.18)", border: "1px solid rgba(125,154,175,0.45)", color: "#5e7e95", padding: "7px 12px", fontSize: 11, borderRadius: 7, cursor: "pointer", fontWeight: 600 }}>⛵ Park all remaining</button>
                  <button onClick={cancelAllRemaining} className="jost" style={{ background: "rgba(168,158,148,0.18)", border: "1px solid rgba(168,158,148,0.45)", color: "#a89e94", padding: "7px 12px", fontSize: 11, borderRadius: 7, cursor: "pointer", fontWeight: 500 }}>✗ Cancel all remaining</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* Mark-complete prompt — confirm modal shown when an item is marked
          done with unchecked subtasks remaining. Lets them choose between
          "yes, finish them all" and "no, keep the subtask state." Optional
          cleanup, never forced. */}
      {markCompletePromptItem && (() => {
        const item = markCompletePromptItem;
        const totalTasks = (item.tasks || []).length;
        const completedCount = (item.completedTasks || []).length;
        const uncheckedCount = totalTasks - completedCount;
        const dismiss = () => setMarkCompletePromptItem(null);
        const acceptAll = () => {
          const allTaskIndices = item.tasks.map((_, i) => i);
          const dateMap = { ...(item.completedTaskDates || {}) };
          const now = Date.now();
          for (let i = 0; i < totalTasks; i++) {
            if (!dateMap[i]) dateMap[i] = now;
          }
          const snapshot = data;
          const updatedItem = { ...item, completedTasks: allTaskIndices, completedTaskDates: dateMap };
          const newItems = (data.items || []).map(i => i.id === item.id ? updatedItem : i);
          updateData({ ...data, items: newItems });
          // Undo for the bulk mark — same pattern as deleteItem.
          try {
            if (typeof window !== "undefined" && window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent("work-hub-undo", {
                detail: {
                  label: `Marked ${totalTasks - completedCount} subtask${(totalTasks - completedCount) === 1 ? "" : "s"} complete`,
                  undoFn: () => updateData(snapshot),
                },
              }));
            }
          } catch (e) { /* undo best-effort */ }
          setMarkCompletePromptItem(null);
        };
        return (
          <div className="modal-bg" onClick={dismiss}>
            <div className="modal fade" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
              <div className="jost" style={{ fontSize: 10, letterSpacing: 2.5, color: "rgba(122,158,120,0.7)", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
                ✓ marked done
              </div>
              <div className="cg" style={{ fontSize: 20, fontStyle: "italic", color: "#4a3540", textAlign: "center", marginBottom: 10 }}>
                Finish the subtasks too?
              </div>
              <p className="jost" style={{ fontSize: 12, color: "rgba(74,53,64,0.6)", lineHeight: 1.6, textAlign: "center", marginBottom: 16 }}>
                "{item.title}" still has {uncheckedCount} unchecked subtask{uncheckedCount === 1 ? "" : "s"}. Mark them complete too, or leave them as is?
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={dismiss}
                  className="btn ghost jost"
                  style={{ padding: "8px 18px", fontSize: 12 }}
                >Leave as is</button>
                <button
                  onClick={acceptAll}
                  className="btn jost"
                  style={{
                    background: "linear-gradient(135deg,#9eb89a,#7a9e78)",
                    color: "#fff",
                    padding: "8px 18px", fontSize: 12, fontWeight: 600, letterSpacing: 0.3, border: "none",
                  }}
                >✓ Mark all complete</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
