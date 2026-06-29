# knowledge/cost-lessons.md
# Proven cost savings — promoted from the ledger
# These are verified and recurring. The ledger is the raw log; this is the curated playbook.

---

## API / Token savings

### Council tiering
**Lesson:** Routine agent council seats (Sage, Poppy, Hazel, Fern in Work Hub) run on claude-haiku-4-5. Only Rosie and Ivy use Sonnet. This is set in Phase 0 of the Work Hub build.
**Saving:** ~60-70% on multi-agent call costs vs running all seats on Sonnet.
**Rule:** Never upgrade all seats to Sonnet to "improve quality" — the synthesis seat (Rosie/Ivy) is where quality lives. Routine seats just need to be correct.

### Pre-generation caching (Work Hub)
**Lesson:** Friday batch pre-generation of Monday's weekly plan cached in localStorage means no API call on Monday morning open. The expensive weekly-plan generation call runs once, not on every open.
**Saving:** Removes the most expensive call from the interactive session budget.
**Rule:** Pre-generation runs on schedule, not on-demand. Cache expires end of week.

### Context hygiene
**Lesson:** Long Work Hub build sessions in Claude.ai compound rapidly — each turn re-sends all prior turns. Start fresh chat sessions for distinct work units (planning vs building vs debugging) to keep context lean.
**Saving:** Rough 40-60% context reduction on long sessions when properly scoped.
**Rule:** One focal point per session. If a session has gone long, start a new one with a 3-line brief rather than continuing.

---

## Promoted from ledger
*Items here have appeared as COST entries 2+ times in the ledger and are confirmed recurring savings.*

---
*Last updated: 2026-06-29 (initial population)*
