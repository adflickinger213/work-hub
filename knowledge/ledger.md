# knowledge/ledger.md
# Lexy's Personal Stack — Knowledge Ledger
# Format: DATE | TYPE | PROJECT | DECISION OR LESSON | NOTES
# Types: SPEC | FIX | LESSON | ROUTINE | COST | DECISION

---

## Work Hub

2026-06-28 | SPEC | work-hub | Stack: Vite/React, GitHub (adflickinger213/work-hub), Vercel (work-hub-xi.vercel.app), Anthropic API via serverless proxy (api/rosie.js) |
2026-06-28 | SPEC | work-hub | Six agents — Rosie (Sonnet, primary), Sage/Poppy/Hazel/Fern (Haiku, routine), Ivy (Sonnet, synthesis) — never change routing without deliberate SCOUT |
2026-06-28 | SPEC | work-hub | Pre-Generation Principle: batch AI work Friday, serve cached Monday | Reduces friction on week start
2026-06-28 | SPEC | work-hub | Always squash-and-merge PRs |
2026-06-28 | SPEC | work-hub | Work Hub Hazel = capacity manager. Rosie HQ Hazel = Chief of Staff. These must never appear in the same context. |
2026-06-28 | FIX | work-hub | devcontainer postCreateCommand: "cd /home/user/work-hub && npm install" — repo is at /home/user/work-hub in Codespace, NOT /workspaces/ |
2026-06-28 | FIX | work-hub | npm global path in Codespace: add "export PATH=$PATH:/home/user/.npm-global/bin" to .bashrc |
2026-06-28 | SPEC | work-hub | Claude Code operates on single branch strategy in Codespace — no gh CLI access, push to assigned branch only |

---

## Rosie HQ

2026-06-29 | SPEC | rosie-hq | Rosie's Town: cottagecore map UI, each building = one department/sub-business, clicking a building enters that space | Navigation IS the UI
2026-06-29 | SPEC | rosie-hq | Council: Iris (Strategist), Flora (Marketer), Reed (Builder), Vera (Realist — speaks last), Hazel (Chief of Staff/Liaison) |
2026-06-29 | SPEC | rosie-hq | Finance agent: hard rule — never authorize real money movement without Lexy's explicit approval |
2026-06-29 | SPEC | rosie-hq | Founding 6 sub-businesses: RFP Studio, The Agency, Legal Room, Agent Shop, Mod Studio, Consulting Desk | All concept status
2026-06-29 | DECISION | rosie-hq | The Consulting Desk draws on general credit union AI governance expertise ONLY — never FFFCU-specific IP |
2026-06-29 | SPEC | rosie-hq | Stack: Vite/React, Vercel, SEPARATE repo from work-hub, Anthropic API direct |

---

## Sims 4 Modding App

2026-06-29 | SPEC | sims4 | Tier 1: DBPF direct manipulation, no Blender at launch |
2026-06-29 | SPEC | sims4 | Core spine: regenerate-from-spec — every mod defined as JSON spec, package generated FROM spec | Technical differentiator
2026-06-29 | DECISION | sims4 | Manager = free open-source (trust-building). Creator = soft-monetized (freemium or one-time). |
2026-06-29 | DECISION | sims4 | Never lead with "AI" in marketing — April 2026 community backlash. Let capability speak without the label. |
2026-06-29 | SPEC | sims4 | Stack: Electron + React (needs file system access), JSON spec format, Anthropic API for AI assist | DBPF library TBD — s4pi is .NET, need Node equivalent

---

## Coco Agent

2026-06-29 | SPEC | coco | Floating Electron widget, tortoiseshell cat, hotkey access, Anthropic API direct, local .env for key | Repo: adflickinger213/coco-agent
2026-06-29 | SPEC | coco | Personality: casual, breezy, light. Least formal companion. Cheeky cat energy allowed. |
2026-06-29 | SPEC | coco | Hardware: MacBook Pro Mid 2012, no AVX2 — avoid npm packages with native binaries requiring AVX2 |

---

## Mac Infrastructure

2026-06-28 | SPEC | mac | MacBook Pro Mid 2012, Intel Core i7-3720QM, x86_64, macOS Sonoma via OCLP. No AVX2. |
2026-06-28 | FIX | mac | Claude Code: pin to v2.1.30 (npm) OR use claude-node wrapper (cli.js from v2.1.108 + bash wrapper at /usr/local/bin/claude-node) |
2026-06-28 | FIX | mac | caffeinate -s& = system awake, display sleep controlled by System Settings. sudo pmset displaysleepnow to sleep display manually. |

---

## FFFCU (non-sensitive lessons only)

2026-06-28 | LESSON | fffcu-zoho | Zoho v3 dependency endpoint: POST .../tasks/[successorID]/multitaskdependency — dependencyDetails uses display key + " FS" suffix |
2026-06-28 | LESSON | fffcu-zoho | Staff need Creator licenses, not customer portal licenses |
2026-06-28 | LESSON | fffcu-zoho | CORS issues calling OpenAI from Zoho Flow — custom proxy required |
2026-06-28 | LESSON | fffcu-writing | Josh = concise bullets; Rob = confident bottom-line-up-front; Aaron = peer-to-peer; vendors = no call-scheduling prompts |

---

## Knowledge Base

2026-06-29 | DECISION | kb | Ledger lives at knowledge/ledger.md in adflickinger213/work-hub repo | SCOUT T2 decision over Drive doc and Project instructions
2026-06-29 | SPEC | kb | Skills scaffold: 6 new skills created (session-opener, cognitive-design, rosie-hq-spec, sims4-spec, fffcu-guardrail, project-status-snapshot, morning-brief, coco-spec) |
2026-06-29 | SPEC | kb | lexy-personal-app-aesthetic updated — added Mode A (artifact) vs Mode B (Vercel/modular) build constraint distinction |

---
*HEARTH due: 2026-07-13*
