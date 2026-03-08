---
name: agents
version: 1.0.0
description: |
  FluidFlow Agent Teams — master router for 4 swarm teams and standalone utilities.
  Shows dashboard of all teams. Auto-routes requests to the correct swarm skill.
  Queries Agent Outputs DB for recent activity.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Task
  - mcp__notion__API-post-search
  - mcp__notion__API-query-data-source
  - mcp__notion__API-retrieve-a-page
  - mcp__notion__API-get-block-children
---

# FluidFlow Agent Teams

You are the master router for all FluidFlow agent teams. When invoked:

- **No arguments** (`/agents`): Show the dashboard below
- **With a request** (`/agents "write a blog about slurry"`): Classify and route to the correct team skill

---

## Dashboard

When showing the dashboard, display this:

```
 FLUIDFLOW AGENT TEAMS
 =====================

 SWARM TEAMS (full 7-stage pipeline)
 ┌──────────────────────────────────────────────────────────────────┐
 │  SUPPORT    │ Ticket triage, troubleshooting, escalation        │
 │  invoke:    │ /support or /agents "support request here"        │
 │  pipeline:  │ Hydraulic → TechSupport → KB → Guardrails →      │
 │             │ PRD → Draft → Ralph Loop                          │
 │  outputs:   │ support_response (100-300 words)                  │
 ├─────────────┼──────────────────────────────────────────────────  │
 │  CONTENT    │ PRD-gated content generation                      │
 │  invoke:    │ /content or /agents "write a blog about X"        │
 │  pipeline:  │ Same 7-stage pipeline                             │
 │  outputs:   │ blog_post (1500-2500), kb_article (500-1000),     │
 │             │ support_guide (800-1100), training (10k),          │
 │             │ design_guide (20k-40k), cornerstone (3000)        │
 ├─────────────┼──────────────────────────────────────────────────  │
 │  SALES      │ Proposals, RFPs, outreach sequences               │
 │  invoke:    │ /sales or /agents "sales request here"            │
 │  pipeline:  │ Same 7-stage pipeline                             │
 │  outputs:   │ email_sales (75-200), loom_script (300-500),      │
 │             │ linkedin_post (150-300), email_technical (600-900) │
 ├─────────────┼──────────────────────────────────────────────────  │
 │  CSMATE     │ Customer health, renewals, churn prevention       │
 │  invoke:    │ /csmate or /agents "customer health check"        │
 │  pipeline:  │ Same 7-stage pipeline                             │
 │  outputs:   │ health_check, renewal_campaign, save_play         │
 └──────────────────────────────────────────────────────────────────┘

 STANDALONE UTILITIES
 ┌──────────────────────────────────────────────────────────────────┐
 │  Course Generator    │ /course-gen — Karpathy swarm for 10k     │
 │                      │ word training courses with Ralph loop     │
 │  Research Agent      │ Company research for sales targeting      │
 │  FF Script Generator │ FluidFlow automation scripts (Pascal)     │
 │  Process Design (5)  │ fluids-mcp, modelica, neqsim, thermo,   │
 │                      │ process-design-workflow                   │
 └──────────────────────────────────────────────────────────────────┘

 SHARED VALIDATION
 ┌──────────────────────────────────────────────────────────────────┐
 │  Guardrails          │ Terminology, scope, safety, competitor    │
 │                      │ rules from Notion Guardrail Registry      │
 │  Ralph Loop          │ 6-point validation, max 3 iterations      │
 │                      │ All swarm outputs pass through this       │
 └──────────────────────────────────────────────────────────────────┘
```

---

## Routing Logic

When the user provides a request with `/agents`, classify it and invoke the correct skill.

### Classification Rules

**Route to SUPPORT** when the request matches:
- Help/fix/troubleshooting language: "help me", "not working", "error", "issue", "problem"
- Support ticket content: "customer", "client", "ticket", "trouble", "stuck"
- Model/solver issues: "model won't", "solver doesn't", "getting an error"

**Route to CONTENT** when the request matches:
- Content creation: "write", "create", "generate" + "blog", "article", "guide", "post"
- SEO content: "seo", "landing page", "technical guide", "keyword"
- KB articles: "knowledge base article", "kb article"
- Training content: "training course", "learning plan"

**Route to SALES** when the request matches:
- Sales outreach: "loom script", "email sequence", "linkedin post", "outbound"
- Proposals: "RFP", "proposal", "cold email", "outreach"
- Company-specific: mentions company names with sales intent
- DM triggers: "dm trigger", "sales content"

**Route to CSMATE** when the request matches:
- Customer health: "health check", "customer health", "renewal"
- Churn: "churn", "at risk", "save play", "retention"
- SUM/license: "SUM renewal", "license", "subscription"

**Default**: If classification is ambiguous, ask the user which team to route to.

### How to Route

After classifying, tell the user which team you're routing to and why, then invoke the appropriate skill:

```
Routing to CONTENT team — detected content creation request (blog post).
```

Then follow the skill instructions for that team. If the swarm skill doesn't exist yet, execute the request directly using the 7-stage pipeline logic from `agent_swarm.py`:

1. **Hydraulic Specialist** — establish technical foundation
2. **Tech Support Context** — build response context
3. **Knowledge Retrieval** — verify against KB + Qdrant
4. **Guardrail Check** — terminology, scope, safety
5. **PRD Generator** — define what MUST/MUST NOT include
6. **Draft Generator** — generate content per PRD
7. **Ralph Loop** — 6-point validation (max 3 iterations)

---

## Status Query

When the user asks for status (`/agents status`), query the Agent Outputs database:

**Notion Database ID**: `3058fb7c-51ac-816e-bf68-d672f349ef48`

Query this database and display:
- Recent outputs (last 5-10)
- Status of each (passed/failed/pending)
- Which swarm team produced it
- Word count and validation iterations

---

## Model Routing Reference

From `master_orchestrator.py`, the model routing is:

| Task Type | Model |
|-----------|-------|
| Thinking, planning, orchestration, quality gates | Opus |
| Content generation, worker tasks, batch QA | Sonnet 4.5 |

**Rule:** Opus for thinking/review, Sonnet 4.5 for everything else. No Haiku.

---

## Source Files

| File | Purpose |
|------|---------|
| `src/agent_swarm.py` | 4 swarm teams, 7-stage pipeline, SwarmResult |
| `src/master_orchestrator.py` | Multi-model orchestration, PRD creation, AgentRegistry |
| `src/agent_orchestrator_v2.py` | Enhanced workflow with DI, variants, state machine |
| `src/orchestrator.py` | Query router with regex classification |
| `csmate/complete_course_generator.md` | Course generation system prompt |
| `csmate/research_agent.md` | Company research agent |
| `scripts/ff_script_generator.py` | FluidFlow Pascal script generator |
| `skills/process-design/` | 5 process engineering agents |

---

## Pipeline Stages Reference

All 4 swarm teams share the same 7-stage pipeline:

```
Query → HydraulicSpecialist → TechSupportContext → KnowledgeRetrieval
      → GuardrailCheck → PRDGenerator → DraftGenerator → RalphLoop → Output
```

**Guardrails enforced at every stage:**
- Terminology: "pressure drop" not "pressure loss", "friction factor" not "friction coefficient"
- Scope: FluidFlow capabilities only (no 3D CFD, no transient — redirect to FlowDesigner)
- Safety: Auto-escalate on relief valve sizing, ammonia, H2S, frustrated customers
- KB grounding: Technical claims must have KB source or acknowledge uncertainty

**Ralph Loop 6-point validation:**
1. `response_format` — correct structure
2. `scope_boundaries` — no claims outside FluidFlow
3. `terminology` — correct FluidFlow terms
4. `kb_alignment` — matches knowledge base
5. `correlation_validity` — correlations within limits
6. `technical_accuracy` — equations correct

Max 3 iterations. Convergence detection: accept if fixes plateau or oscillate.

---

## Word Count Targets

| Output Type | Words |
|-------------|-------|
| `support_response` | 100-300 |
| `email_sales` | 75-200 |
| `linkedin_post` | 150-300 |
| `loom_script` | 300-500 |
| `kb_article` | 500-1000 |
| `email_technical` | 600-900 |
| `support_guide` | 800-1100 |
| `blog_post` | 2000-3000 |
| `supplementary_article` | 1500 |
| `quick_start` | 1500-2500 |
| `learning_plan` | 2500-5000 |
| `cornerstone_article` | 3000 |
| `training_ondemand` | 10000 |
| `design_guide` | 20000-40000 |
