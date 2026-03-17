# PRD: Dashboard Migration — dash.equilibri.pro → Paperclip

**Status:** Complete (2026-03-17)
**Priority:** P1
**Owner:** BR
**Depends on:** Paperclip running on Mac Studio (Week 1), Qdrant secured
**Target:** 2 sprints

---

## Problem

FluidFlow's intelligence dashboards live at `dash.equilibri.pro` (Dalglish/ff-dashboard-hub), a standalone Vite/React app hosted on Vercel. This creates four problems:

1. **Disconnected from agents.** The dashboards show data but can't trigger action. When pipeline coverage drops, someone has to manually tell ff-sales-pipeline to investigate. There's no link between "metric moved" and "agent wakes up."

2. **No audit trail.** Dashboard viewers see numbers but not *who did what*. Paperclip tracks every agent heartbeat, task, and cost — the dashboard doesn't.

3. **Duplicate infrastructure.** dash.equilibri.pro runs on Vercel ($0 now, scales to paid). Paperclip already has a React UI at :3100 with SSE live updates, company-scoped views, and auth. Running both is redundant.

4. **No PM visibility.** The current dashboard covers sales/marketing/pipeline but has zero project management views — no sprint progress, no task status, no agent performance. PM is the stated weakness.

---

## Goal

Consolidate all intelligence views into Paperclip's built-in UI so that:

- **Every metric is next to the agent that acts on it**
- **Every alert can become a task assigned to an agent or human**
- **Sprint/PM dashboards live alongside sales/marketing dashboards**
- **One URL, one auth, one system** (Tailscale-only access)

---

## What Exists Today

### dash.equilibri.pro (7 pages)

| Page | Key Metrics | Data Source |
|------|------------|-------------|
| **Command Center** | Revenue Engine Score (retention + conversion + pipeline + NRR), full funnel, licensing pools, customer snapshot, system alerts, action items | Pipedrive API, internal calcs |
| **Sales** | Total revenue, NRR growth, trial conversion, pipeline deals, value at risk, revenue by industry/country, upsell/win-back targets | Pipedrive API |
| **Pipeline** | Deals by stage, velocity, forecast vs actual, stage conversion rates | Pipedrive API |
| **Marketing** | GSC impressions/clicks, content velocity, LinkedIn engagement, SEO health score | GSC, GA4 |
| **Leads/Trials** | Trial signups, conversion funnel, time-to-convert, source attribution | Pipedrive, GA4 |
| **Analytics** | Deep data: cohorts, retention curves, LTV, segmentation | Pipedrive, internal |
| **ABM** | Target accounts, engagement signals, deal progress | Pipedrive, Apollo |

### Paperclip UI (existing)

| View | What It Shows |
|------|--------------|
| **Dashboard** | Company activity feed, agent status, cost summary |
| **Agents** | Org chart, run history, live logs, heartbeat status |
| **Issues/Tasks** | Task board (kanban), comments, status, assignee |
| **Projects** | Grouped work with workspaces |
| **Approvals** | Board approval gates |
| **Cost** | Per-agent token/budget tracking |

### Gap

Paperclip has the governance views (agents, tasks, cost, approvals). dash.equilibri.pro has the business intelligence views (revenue, pipeline, marketing, ABM). Neither has PM views (sprint progress, velocity, burndown).

---

## Solution: 3-Phase Migration

### Phase 1: Embed Business Dashboards in Paperclip (Sprint 1)

**Don't rebuild the dashboards. Embed them.**

Paperclip's React UI supports custom pages. The fastest path:

1. **Extract dashboard components** from `Dalglish/ff-dashboard-hub` into a shared package
2. **Add a "Dashboards" tab** to Paperclip's sidebar navigation
3. **Mount the 7 dashboard views** as sub-routes under `/dashboards/`
4. **Wire the data layer** — Paperclip's API proxy handles Pipedrive/GSC/GA4 auth so credentials stay server-side (not in browser)
5. **Add "Create Task" buttons** on every alert/action item — clicking creates a Paperclip task assigned to the relevant agent

Result: `http://mac-studio:3100/dashboards/command-center` replaces `https://dash.equilibri.pro`

### Phase 2: Add PM Dashboard (Sprint 1-2)

New dashboard page: `/dashboards/pm`

| Section | Metrics | Source |
|---------|---------|--------|
| **Sprint Board** | Current sprint tasks, status, assignees (agents + humans) | Paperclip Issues API |
| **Velocity** | Tasks completed per sprint (trailing 4 sprints) | Paperclip Issues API |
| **Agent Performance** | Runs/day, success rate, avg tokens, cost per agent | Paperclip Runs API |
| **Blocked Items** | Tasks in `blocked` status with blocker notes | Paperclip Issues API |
| **Approval Queue** | Pending approvals needing human sign-off | Paperclip Approvals API |
| **Revision Rate** | % of agent drafts approved without major edits (the one metric) | mem0 + Paperclip |

### Phase 3: Alert → Agent Loop (Sprint 2)

**The key differentiator:** dashboards that act.

| Alert | Auto-Action |
|-------|------------|
| Pipeline coverage drops below 3x | Create task for ff-sales-pipeline: "Investigate pipeline coverage drop" |
| Trial conversion below threshold | Create task for ff-sales-triage: "Review trial nurture sequence" |
| GSC impressions spike for keyword cluster | Create task for ff-marketing: "Capitalize on trending keywords" |
| Agent failure rate above 20% | Create task for ff-orchestrator: "Review agent health" |
| Sprint velocity declining 2+ weeks | Create task for ff-pm: "Run retrospective on velocity drop" |
| Churn risk detected (customer health) | Create task for ff-sales-pipeline: "Execute save play" |

These use Paperclip's `automation` wake type — agent wakes when the task is created.

---

## Design

**Adopt ISA-101 design system** from PRD-21 (already specced). Both the existing Paperclip UI and the migrated dashboards use the same token set:

- `bg_primary: #1E1E1E` | `accent: #6B9BD2` (steel blue)
- `border_radius: 6px` | `cards: solid #3D3D3D, no glass-morphism`
- Chart palette: muted industrial (steel blue, muted green, muted amber)

Bloomberg terminal aesthetic preserved but adapted to ISA-101 color tokens.

---

## Data Architecture

### Current (fragmented)

```
dash.equilibri.pro → Vercel → calls Pipedrive/GSC/GA4 APIs directly from browser
Paperclip → localhost:3100 → its own Postgres
ff-sales-pipeline → Streamlit → its own Pipedrive calls
```

### Target (unified)

```
Paperclip :3100
├── /api/dashboards/revenue    → server-side Pipedrive proxy
├── /api/dashboards/pipeline   → server-side Pipedrive proxy
├── /api/dashboards/marketing  → server-side GSC + GA4 proxy
├── /api/dashboards/abm        → server-side Apollo proxy
├── /api/dashboards/pm         → Paperclip's own Issues/Runs/Cost APIs
├── /api/companies/:id/issues  → native Paperclip
├── /api/companies/:id/agents  → native Paperclip
└── /api/dashboards/alerts     → aggregated thresholds → auto-create tasks
```

API keys stay server-side. Browser never sees credentials. Tailscale-only access.

---

## Security

| Concern | Mitigation |
|---------|-----------|
| Pipedrive API key in browser | Server-side proxy — key stays in Paperclip env |
| GSC/GA4 service account | Server-side proxy — SA creds never leave server |
| Dashboard accessible externally | Tailscale-only (bind to 100.x.x.x, not 0.0.0.0) |
| Agent can't modify dashboards | Dashboards are read-only views; agents only create tasks |

---

## Migration Checklist

- [ ] Clone ff-dashboard-hub components into Paperclip UI
- [ ] Add `/dashboards` route group to Paperclip React app
- [ ] Create server-side API proxy routes for Pipedrive, GSC, GA4
- [ ] Mount 7 existing dashboard views
- [ ] Add "Create Task" buttons on all action items
- [ ] Build PM dashboard (sprint board, velocity, agent perf, blocked, approvals)
- [ ] Build alert threshold engine with auto-task creation
- [ ] Apply ISA-101 tokens to all views
- [ ] DNS: redirect dash.equilibri.pro → mac-studio:3100/dashboards (via Tailscale)
- [ ] Decommission Vercel deployment
- [ ] Tim security sign-off (API keys server-side, Tailscale-only)

---

## Success Criteria (Binary)

1. **All 7 dashboard views accessible at mac-studio:3100/dashboards** — no Vercel dependency
2. **PM dashboard shows sprint progress and agent performance** — PM visibility exists
3. **At least 3 alert → auto-task rules firing** — dashboards trigger action
4. **API keys are server-side only** — browser network tab shows no credentials
5. **Revision rate tracked week-over-week** — the one metric from the architecture doc

---

## Cost

$0 incremental. Paperclip is self-hosted. Vercel free tier eliminated. Same API calls, different proxy point.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Paperclip UI too rigid for custom dashboards | Medium | High | Can extend with custom React pages — MIT fork gives full control |
| ff-dashboard-hub components tightly coupled to Vercel | Low | Medium | It's a Vite/React app — components are portable |
| Data proxy adds latency | Low | Low | Server-side calls to Pipedrive are <200ms, same as direct |
| Mac Studio not ready (arrives Fri 13th) | Known | High | Run on Mac Mini until migration; same Tailscale network |

---

## Timeline

| Sprint | Deliverable |
|--------|------------|
| **Sprint 1 (Days 1-5)** | Phase 1: embed 7 dashboards + server proxy + ISA-101 tokens |
| **Sprint 2 (Days 6-10)** | Phase 2: PM dashboard + Phase 3: alert → agent loop |
| **Post-sprint** | Decommission Vercel, DNS redirect, Tim sign-off |

---

## References

- dash.equilibri.pro (live, 7 pages)
- `Dalglish/ff-dashboard-hub` (React source)
- `Dalglish/ff-sales-pipeline` (dashboard_helpers.py, PRD-21)
- PRD-21: Dashboard Visual Redesign — ISA-101 Design System
- Paperclip docs: `doc/SPEC-implementation.md` §5.1 (UI scope)
- Architecture: "Start Here" page — Paperclip is scheduler + governance, not the brain
