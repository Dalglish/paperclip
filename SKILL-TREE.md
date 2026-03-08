# Paperclip Skill Tree

> 174 skills + 36 commands across 3 sources. Updated 2026-03-08.

## Sources

| Source | Prefix | Count | Origin |
|--------|--------|-------|--------|
| Paperclip Native | (none) | 6 | `paperclipai/paperclip` |
| PM Skills Marketplace | `pm-*` | 65 + 8 plugins | `phuryn/pm-skills` (fork: `Dalglish/pm-skills`) |
| Claude Code Skills | `cc--*` | 103 | `~/.claude/skills/` (Brian's env) |

---

## Paperclip Native (6)

Core skills for agent coordination within the Paperclip control plane.

| Skill | Purpose |
|-------|---------|
| `paperclip` | Heartbeat procedure, API auth, task checkout/release |
| `paperclip-create-agent` | Create and configure new agents |
| `create-agent-adapter` | Build custom agent adapters (claude_local, codex, http) |
| `para-memory-files` | PARA-method persistent memory across sessions |
| `release` | Version release workflow |
| `release-changelog` | Generate changelogs from commits |

---

## PM Skills Marketplace (65 skills, 36 commands)

Product management frameworks from discovery through launch.

### Product Discovery (13 skills, 5 commands)
Ideation, experiments, assumption testing, OSTs, interviews.

| Skill | Purpose |
|-------|---------|
| `pm-product-discovery--brainstorm-ideas-new` | Multi-perspective ideation for new products |
| `pm-product-discovery--brainstorm-ideas-existing` | Ideation for existing product features |
| `pm-product-discovery--identify-assumptions-new` | Risk assumptions across 8 categories (new product) |
| `pm-product-discovery--identify-assumptions-existing` | Risk assumptions for existing product features |
| `pm-product-discovery--prioritize-assumptions` | Impact x Risk matrix + experiment suggestions |
| `pm-product-discovery--brainstorm-experiments-new` | Lean startup pretotypes, XYZ hypotheses |
| `pm-product-discovery--brainstorm-experiments-existing` | Prototypes, A/B tests for existing products |
| `pm-product-discovery--analyze-feature-requests` | Prioritize feature requests by theme & alignment |
| `pm-product-discovery--prioritize-features` | Backlog prioritization (impact, effort, risk) |
| `pm-product-discovery--interview-script` | JTBD customer interview scripts |
| `pm-product-discovery--summarize-interview` | Structured interview transcript summaries |
| `pm-product-discovery--opportunity-solution-tree` | OST mapping: outcomes → opportunities → solutions |
| `pm-product-discovery--metrics-dashboard` | Product metrics dashboard design |

**Commands:** `/discover`, `/brainstorm`, `/interview`, `/triage-requests`, `/setup-metrics`

### Product Strategy (12 skills, 5 commands)
Strategic frameworks and canvases.

| Skill | Purpose |
|-------|---------|
| `pm-product-strategy--product-strategy` | 9-section Product Strategy Canvas |
| `pm-product-strategy--product-vision` | Inspiring, achievable product vision |
| `pm-product-strategy--lean-canvas` | Lean Canvas (problem, solution, metrics, UVP) |
| `pm-product-strategy--business-model` | Business Model Canvas (9 building blocks) |
| `pm-product-strategy--startup-canvas` | Combined Product Strategy + Business Model |
| `pm-product-strategy--value-proposition` | 6-part JTBD value proposition |
| `pm-product-strategy--swot-analysis` | Strengths, weaknesses, opportunities, threats |
| `pm-product-strategy--ansoff-matrix` | Growth strategy mapping |
| `pm-product-strategy--pestle-analysis` | Political, Economic, Social, Tech, Legal, Environmental |
| `pm-product-strategy--porters-five-forces` | Competitive landscape analysis |
| `pm-product-strategy--pricing-strategy` | Pricing models, competitive positioning |
| `pm-product-strategy--monetization-strategy` | Revenue model brainstorming |

**Commands:** `/strategy`, `/business-model`, `/value-proposition`, `/market-scan`, `/pricing`

### Execution (14 skills, 10 commands)
Sprint planning, PRDs, OKRs, retrospectives.

| Skill | Purpose |
|-------|---------|
| `pm-execution--create-prd` | 8-section PRD template |
| `pm-execution--sprint-plan` | Capacity, story selection, dependencies |
| `pm-execution--brainstorm-okrs` | Team OKRs aligned to company objectives |
| `pm-execution--user-stories` | User stories with acceptance criteria |
| `pm-execution--job-stories` | When/I want to/So I can format |
| `pm-execution--wwas` | Why-What-Acceptance backlog items |
| `pm-execution--prioritization-frameworks` | 9 frameworks (RICE, ICE, MoSCoW, etc.) |
| `pm-execution--outcome-roadmap` | Output → outcome roadmap transformation |
| `pm-execution--pre-mortem` | Risk analysis (Tiger, Paper Tiger, Elephant) |
| `pm-execution--stakeholder-map` | Power/interest grid, communication strategy |
| `pm-execution--retro` | Sprint retrospective facilitation |
| `pm-execution--release-notes` | User-facing release notes from tickets |
| `pm-execution--summarize-meeting` | Meeting notes with action items |
| `pm-execution--test-scenarios` | Test scenarios from user stories |
| `pm-execution--dummy-dataset` | Realistic test data generation |

**Commands:** `/write-prd`, `/sprint`, `/plan-okrs`, `/pre-mortem`, `/stakeholder-map`, `/test-scenarios`, `/meeting-notes`, `/generate-data`, `/retro`, `/release-notes`

### Market Research (7 skills, 3 commands)
Users, competitors, market sizing.

| Skill | Purpose |
|-------|---------|
| `pm-market-research--competitor-analysis` | Strengths, weaknesses, differentiation |
| `pm-market-research--market-sizing` | TAM, SAM, SOM (top-down + bottom-up) |
| `pm-market-research--market-segments` | 3-5 customer segments with JTBD |
| `pm-market-research--user-personas` | 3 personas with pains, gains, behaviors |
| `pm-market-research--user-segmentation` | Behavioral segmentation from feedback data |
| `pm-market-research--sentiment-analysis` | Feedback sentiment scoring, JTBD extraction |
| `pm-market-research--customer-journey-map` | End-to-end touchpoints, emotions, pain points |

**Commands:** `/competitive-analysis`, `/research-users`, `/analyze-feedback`

### Go-to-Market (6 skills, 1 command)
Launch strategy, ICPs, battlecards.

| Skill | Purpose |
|-------|---------|
| `pm-go-to-market--gtm-strategy` | Channels, messaging, success metrics |
| `pm-go-to-market--gtm-motions` | 7 motion types (inbound, outbound, PLG, etc.) |
| `pm-go-to-market--ideal-customer-profile` | ICP from research data |
| `pm-go-to-market--beachhead-segment` | First market segment selection |
| `pm-go-to-market--competitive-battlecard` | Sales-ready competitor comparison |
| `pm-go-to-market--growth-loops` | 5 flywheel types for sustainable traction |

**Commands:** `/plan-launch`

### Marketing & Growth (5 skills, 3 commands)
Positioning, naming, metrics.

| Skill | Purpose |
|-------|---------|
| `pm-marketing-growth--north-star-metric` | NSM + 3-5 supporting input metrics |
| `pm-marketing-growth--marketing-ideas` | 5 creative, cost-effective campaigns |
| `pm-marketing-growth--positioning-ideas` | Differentiated positioning brainstorm |
| `pm-marketing-growth--value-prop-statements` | Value props for marketing/sales/onboarding |
| `pm-marketing-growth--product-name` | 5 memorable product name options |

**Commands:** `/north-star`, `/positioning`, `/name-product`

### Data Analytics (3 skills, 3 commands)
Testing, cohorts, SQL.

| Skill | Purpose |
|-------|---------|
| `pm-data-analytics--ab-test-analysis` | Statistical significance, sample size validation |
| `pm-data-analytics--cohort-analysis` | Retention curves, feature adoption |
| `pm-data-analytics--sql-queries` | BigQuery, PostgreSQL, MySQL query generation |

**Commands:** `/analyze-test`, `/analyze-cohorts`, `/write-query`

### Toolkit (4 skills, 4 commands)
Utilities.

| Skill | Purpose |
|-------|---------|
| `pm-toolkit--draft-nda` | NDA generation |
| `pm-toolkit--grammar-check` | Grammar, logic, flow fixes |
| `pm-toolkit--privacy-policy` | Privacy policy (GDPR, CCPA) |
| `pm-toolkit--review-resume` | PM resume review (10 best practices) |

**Commands:** `/draft-nda`, `/privacy-policy`, `/proofread`, `/tailor-resume`

---

## Claude Code Skills (103)

Brian's production skill library — FluidFlow-specific, sales, SEO, CRO, technical.

### Infrastructure (14)
Session management, automation, integrations.

| Skill | Purpose |
|-------|---------|
| `cc--health-check` | Pre-session integration validation |
| `cc--sprint-start` | Sprint opener: conventions, PRDs, baselines |
| `cc--bkg` | Autonomous background coding (LOAD→BUILD→BORIS→REPORT) |
| `cc--quality-gate` | Parallel 4-agent review (test/style/ref/regression) |
| `cc--agents` | Master router for 4 swarm teams |
| `cc--auto` | Auto-execute mode |
| `cc--auto-approve` | Pre-flight permission batch |
| `cc--sync-mm2` | Push config/skills to Mac Mini |
| `cc--n8n-config` | n8n workflow IDs, credentials, stages |
| `cc--notion-config` | Notion database IDs, API config |
| `cc--notion-dashboard` | Dashboard ↔ Notion sync |
| `cc--morning` | Daily briefing (Pipedrive, Gmail, n8n) |
| `cc--ralph-loop` | 6-point content validation |
| `cc--guardrails` | Safety & terminology guard |

### FluidFlow-Specific (6)
Engineering software domain knowledge.

| Skill | Purpose |
|-------|---------|
| `cc--probflow` | Monte Carlo pipe flow physics |
| `cc--kb-article-gen` | KB articles P01-P144, Notion payloads |
| `cc--seo-corrections` | FluidFlow technical facts (SRK, Wilson, API 674) |
| `cc--course-gen` | Training course generator (Karpathy swarm) |
| `cc--csmate-swarm` | Customer Success: health, renewals, design guides |
| `cc--support-swarm` | Support ticket triage & response |

### Sales & Pipeline (9)
CRM, deals, forecasting, retention.

| Skill | Purpose |
|-------|---------|
| `cc--enterprise-sales` | CXO briefings, procurement, value stories |
| `cc--sales-pipeline` | CRM hygiene, deal reviews, forecast |
| `cc--sales-prospecting` | Cold outreach, discovery, objection handling |
| `cc--pipeline-analyst` | Deal velocity, stage analysis, forecasting |
| `cc--retention-analyst` | Churn prediction, save-play triggers |
| `cc--manufacturing-sales` | B2B manufacturing, technical bids |
| `cc--customer-analytics` | Activation maps, segmentation, LTV |
| `cc--customer-success` | Adoption playbooks, exec EBRs, risk scoring |
| `cc--data-analyst` | SQL, dashboards, visualization, storytelling |

### SEO (14)
Full-stack SEO from audit to AI search optimization.

| Skill | Purpose |
|-------|---------|
| `cc--seo` | Master orchestrator — routes to sub-skills |
| `cc--seo-plan` | Strategy, BSASS templates |
| `cc--seo-audit` | Full site audit (squirrelscan, 6 specialists) |
| `cc--seo-content` | Keyword mapping, on-page optimization |
| `cc--seo-competitor-pages` | Reverse-engineer competitor content |
| `cc--seo-geo` | GEO: AI Overviews, Perplexity, llms.txt |
| `cc--seo-hreflang` | International SEO, language tags |
| `cc--seo-images` | Image SEO, alt text, schema |
| `cc--seo-page` | Single-page deep analysis |
| `cc--seo-programmatic` | Programmatic SEO at scale |
| `cc--seo-schema` | JSON-LD, rich snippets |
| `cc--seo-sitemap` | XML sitemaps, crawl budgets |
| `cc--seo-technical` | Core Web Vitals, crawlability |
| `cc--seo-weekly-diagnostic` | Weekly perf reports (squirrelscan + GSC) |

### CRO & Optimization (8)
Conversion rate optimization across the funnel.

| Skill | Purpose |
|-------|---------|
| `cc--page-cro` | Landing page conversion optimization |
| `cc--signup-flow-cro` | Registration & trial activation |
| `cc--onboarding-cro` | Post-signup activation, time-to-value |
| `cc--form-cro` | Form field optimization, microcopy |
| `cc--popup-cro` | Exit intent, modals, overlays |
| `cc--paywall-upgrade-cro` | In-app upgrade screens, feature gates |
| `cc--ab-test-setup` | Test design, sample size, significance |
| `cc--analytics-tracking` | GA4, GTM, event tracking, attribution |

### Copywriting (6)
Marketing copy, editing, humanization.

| Skill | Purpose |
|-------|---------|
| `cc--copywriting` | Headlines, CTAs, value props |
| `cc--copy-editing` | Grammar, clarity, consistency |
| `cc--humanizer` | Remove AI writing patterns |
| `cc--email-sequence` | Lifecycle sequences, behavioral triggers |
| `cc--social-content` | LinkedIn, Twitter/X, platform-specific |
| `cc--competitor-alternatives` | "vs" pages, alternatives, feature matrices |

### Design & UX (4)
UI/UX, design systems, frontend.

| Skill | Purpose |
|-------|---------|
| `cc--bencium-controlled-ux-designer` | Accessible, distinctive UI/UX guidance |
| `cc--ux-researcher-designer` | Research, personas, journey mapping |
| `cc--ui-design-system` | Tokens, components, responsive calculations |
| `cc--frontend-patterns` | React, state management, performance |

### Strategy (10)
Product, pricing, marketing strategy.

| Skill | Purpose |
|-------|---------|
| `cc--product-strategist` | OKRs, market analysis, vision setting |
| `cc--agile-product-owner` | Sprint planning, backlog, INVEST stories |
| `cc--pricing-strategy` | Tiers, packaging, Van Westendorp |
| `cc--launch-strategy` | Product Hunt, phased launches, GTM |
| `cc--marketing-ideas` | 140 proven SaaS marketing approaches |
| `cc--marketing-psychology` | 70+ mental models for marketing |
| `cc--referral-program` | Referral/affiliate program design |
| `cc--free-tool-strategy` | Engineering as marketing, lead gen tools |
| `cc--competitive-intelligence` | Battlecards, win/loss, market signals |
| `cc--market-research` | Qual/quant research, scenario modeling |

### Technical (9)
Code quality, testing, security.

| Skill | Purpose |
|-------|---------|
| `cc--coding-standards` | TypeScript, React, Node.js patterns |
| `cc--backend-patterns` | API design, DB optimization, server-side |
| `cc--frontend-patterns` | React, state mgmt, component patterns |
| `cc--security-review` | OWASP, vulnerability scanning |
| `cc--tdd-workflow` | Test-driven development, 80%+ coverage |
| `cc--verification-loop` | Tests, lint, types, regression |
| `cc--git-worktrees` | Parallel branch work, swarm isolation |
| `cc--think_deeply` | Multi-perspective structured analysis |
| `cc--scientific-skills` | 185+ scientific integrations |

### Content Swarms (3)
Multi-agent content generation.

| Skill | Purpose |
|-------|---------|
| `cc--content-swarm` | Blog, KB, support, design guides |
| `cc--sales-swarm` | Email, Loom scripts, LinkedIn posts |
| `cc--continuous-learning-v2` | Instinct-based learning system |

### Context Loaders (7)
Read-only data, caches, config references.

| Skill | Purpose |
|-------|---------|
| `cc--ff-pipeline-context` | Pipedrive stage mappings |
| `cc--testing-suite-context` | Test inventory, module paths |
| `cc--notion-cache` | Notion data cache |
| `cc--optllm` | LLM cost optimization gateway |
| `cc--oauto` | OpenAI API config |
| `cc--odeep` | DeepSeek API config |
| `cc--qdrant-query` | Qdrant vector DB queries |

### Utilities (8)
Orchestration, review, audit tools.

| Skill | Purpose |
|-------|---------|
| `cc--karpathy-swarm` | Parallel implementation workers |
| `cc--karpathy-swarm-review` | Quality gate verification |
| `cc--prd-roundtable` | 4-model PRD review |
| `cc--audit-website` | squirrelscan 230+ rules |
| `cc--weekly-log` | Weekly activity summary → Notion |
| `cc--gsc-insights` | Google Search Console analysis |
| `cc--claude-auto-permissions` | Permission auto-approval config |
| `cc--genbot` | Sales intelligence agents |

### Specialized (9)
Domain-specific and niche skills.

| Skill | Purpose |
|-------|---------|
| `cc--customer-intel` | Customer intelligence gathering |
| `cc--paid-ads` | Google Ads, Meta, LinkedIn campaigns |
| `cc--schema-markup` | JSON-LD, structured data |
| `cc--programmatic-seo` | Template pages at scale |
| `cc--b2b-saas` | B2B SaaS patterns |
| `cc--accessibility` | Web accessibility |
| `cc--account-management` | Account management workflows |
| `cc--validation-suite` | FFagents26 validation suite |
| `cc--manufacturing-sales` | B2B manufacturing sales |

---

## Overlap Notes

Some PM Skills overlap with Claude Code skills. Both are kept for now:

| PM Skill | CC Skill | Keep Both? |
|----------|----------|------------|
| `pm-product-strategy--pricing-strategy` | `cc--pricing-strategy` | Yes — PM is framework-focused, CC is FluidFlow-tuned |
| `pm-execution--create-prd` | `cc--prd-roundtable` | Yes — PM creates, CC reviews with 4 models |
| `pm-data-analytics--ab-test-analysis` | `cc--ab-test-setup` | Yes — PM analyzes results, CC designs tests |
| `pm-execution--sprint-plan` | `cc--sprint-start` | Yes — PM plans, CC opens sessions |
| `pm-market-research--competitor-analysis` | `cc--competitive-intelligence` | Yes — PM is structured, CC is battlecard-focused |

---

## Agent Mapping

When Paperclip agents need PM capabilities, route to these skills:

| Agent Role | Primary Skills |
|------------|---------------|
| **PM Agent** | `pm-execution--*`, `pm-product-strategy--*`, `cc--product-strategist` |
| **Discovery Agent** | `pm-product-discovery--*`, `pm-market-research--*` |
| **Marketing Agent** | `pm-marketing-growth--*`, `pm-go-to-market--*`, `cc--seo`, `cc--copywriting` |
| **Sales Agent** | `cc--sales-*`, `cc--enterprise-sales`, `pm-go-to-market--competitive-battlecard` |
| **Support Agent** | `cc--support-swarm`, `cc--csmate-swarm`, `cc--kb-article-gen` |
| **Engineering Agent** | `cc--coding-standards`, `cc--tdd-workflow`, `cc--security-review` |
| **Analytics Agent** | `pm-data-analytics--*`, `cc--data-analyst`, `cc--gsc-insights` |
