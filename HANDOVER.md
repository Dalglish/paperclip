# Session Handover — 2026-03-08/09

## What Was Built

### Paperclip Fork (Dalglish/paperclip)
- **Forked** from paperclipai/paperclip, cloned to `/Users/brianross/infra/paperclip`
- **214 skills** committed: 65 PM (pm-*), 103 Claude Code (cc--*), 16 GTM (gtm--*), 30 native
- **36 commands** from PM Skills Marketplace
- **SKILL-TREE.md** — categorized index with agent routing table
- **11 Paperclip agents** created via API with org chart
- **PRD-DASHBOARD-MIGRATION.md** — full PRD for dashboard consolidation

### Agents (11 active in Paperclip)
| Agent | Model | Role | Status |
|-------|-------|------|--------|
| ff-validator | Opus 4.6 | Quality gate | idle |
| ff-orchestrator | Haiku 4.5 | Router | idle |
| ff-support-triage | Haiku 4.5 | Support | idle |
| ff-sales-triage | Haiku 4.5 | Sales email | idle |
| ff-sales-pipeline | Haiku 4.5 | Pipeline | idle |
| ff-knowledge-base | Haiku 4.5 | KB | idle |
| ff-marketing | Haiku 4.5 | Marketing | idle |
| ff-weekly-review | Haiku 4.5 | Weekly digest | idle |
| ff-pm | Haiku 4.5 | Product manager | idle — **TESTED SUCCESSFULLY** |
| ff-project-awards | Haiku 4.5 | Project intel (NEW) | idle |
| ff-youtube-digest | Haiku 4.5 | YouTube learning (NEW) | idle |

Org: CEO → ff-orchestrator → all others

### First Successful Agent Run
- **ff-pm** completed task FFF-2: "Draft sprint plan for Infrastructure Rollout week 1"
- Produced 10-story sprint plan with critical path, risk register, DoD
- Set task to `in_review` — waiting for human approval
- Used Haiku via ANTHROPIC_API_KEY (not claude.ai subscription)

### Infrastructure
| Component | Status | Location |
|-----------|--------|----------|
| Docker Desktop | ✅ Running | /Applications/Docker.app |
| Paperclip (full dev) | ✅ Running :3100 | `/Users/brianross/infra/paperclip` |
| Dashboard FastAPI | ✅ Running :3200 | `/Users/brianross/infra/paperclip/dashboard-api/` |
| SSL fix | ✅ Permanent | NODE_EXTRA_CA_CERTS in .zshrc |
| pnpm | ✅ 10.30.3 | brew installed |
| Anonymizer | ✅ 10/10 tests | `/Users/brianross/infra/anonymizer/` |
| routing_rules.yaml | ✅ | `/Users/brianross/infra/configs/` |
| backup.sh | ✅ Daily 2am cron | `/Users/brianross/infra/backup.sh` |
| health.sh | ✅ 5min cron | `/Users/brianross/infra/health.sh` |
| migrate.sh | ✅ | `/Users/brianross/infra/migrate.sh` |
| backup.key | ✅ | `~/.claude/secrets/backup.key` |
| Tailscale | ✅ IP: 100.126.54.79 | App installed |

### YouTube Digest Test
- 2 Cody Schneider videos transcribed (69K chars total)
- 21 skills extracted, 16 created as SKILL.md files (adapted to FluidFlow stack)
- 8 workflow chains documented

## What's NOT Working / Needs Fixing

### Dashboard UI (PRIORITY)
- **BI dashboard pages exist** in Paperclip UI (`/bi/command-center`, `/bi/sales`, etc.) but **display is not good enough**
- Native React pages were built by worktree agent — they render data but need visual polish
- The old equilibri static embed also exists at `/dashboards/` — JS rewritten to point to localhost:3200
- **bi-dashboards.ts** proxy routes rewritten to forward to FastAPI at :3200
- FastAPI returns real data (tested: pipeline, briefing, revenue, nrr, sum/gap, data-quality all working)
- **Next session needs**: UI quality pass on all 7+1 dashboard pages, match ISA-101 design tokens from PRD-21

### Key Files for Dashboard Fix
- `ui/src/pages/dashboards/` — 8 React pages (CommandCenter, Sales, Pipeline, Marketing, Trials, Analytics, ABM, PM)
- `ui/src/api/biDashboards.ts` — API client (calls `/companies/:id/bi/*`)
- `server/src/routes/bi-dashboards.ts` — proxy routes (forwards to FastAPI :3200)
- `dashboard-api/server.py` — FastAPI (24 endpoints, imports intelligence.py)
- `PRDs/PRD-DASHBOARD-MIGRATION.md` — full spec with ISA-101 design tokens

### Other Pending Items
| Item | Owner | Status |
|------|-------|--------|
| Qdrant security | Colleague | Handed off — awaiting Tailscale IP + API key confirmation |
| mem0 docker-compose | Next session | Blocked on Qdrant |
| Prompt templates for 10 agents (not ff-pm) | Next session | ff-pm template works, replicate pattern |
| Notion MCP per-agent (role-scoped) | Next session | Security: don't give all agents full Notion access |
| Heartbeat timers (cron schedules) | Next session | All agents on assignment-wake only currently |
| ANTHROPIC_API_KEY source | Unknown | Key is in env but not in any .zshrc/.zprofile — comes from parent process |
| Paperclip not accessible remotely | Next session | Bind to Tailscale IP or deploy to Railway |

## How to Start Everything

```bash
# 1. Paperclip (server + UI)
cd /Users/brianross/infra/paperclip
unset CLAUDECODE
export NODE_EXTRA_CA_CERTS="/Users/brianross/.claude/secrets/node-ca-certs.pem"
pnpm dev

# 2. Dashboard API
cd /Users/brianross/infra/paperclip/dashboard-api
./start.sh

# 3. Open
open http://localhost:3100
```

## Critical Lesson Learned
- `claude_local` adapter CANNOT run inside a Claude Code session (CLAUDECODE env var blocks nested sessions)
- Fix: restart Paperclip with `unset CLAUDECODE` before starting
- Agents need `ANTHROPIC_API_KEY` in their adapter env for non-interactive auth
- Tasks must be in `todo` status (not `backlog`) for agents to pick them up
- `heartbeatConfig` doesn't persist via agent creation — must PATCH separately
- Use `/heartbeat/invoke` endpoint, not `/wake` for reliable runs

## Git Status
- All committed and pushed to `Dalglish/paperclip` (master)
- Latest commit: dashboard migration + BI proxy routes
- No uncommitted changes
