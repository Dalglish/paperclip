---
name: n8n-config
version: 2.0.0
description: |
  n8n automation configuration reference. Workflow IDs, credentials,
  Pipedrive stages, MCP server config, and gotchas. Updated Mar 1 2026
  after instance rebuild.
allowed-tools:
  - Bash
  - Read
---

# n8n Automation Configuration

**Instance:** `n8n.equilibri.pro` (161.35.41.72, DigitalOcean)
**Version:** Community edition, rebuilt Feb 28 2026
**Notion doc:** https://www.notion.so/n8n-Automations-SUM-Renewal-Pipeline-Gmail-Auto-Draft-3078fb7c51ac812aa642dbf4a62d4005

## API Access

- **API key:** No-expiry JWT configured in `~/.claude.json` under `projects./Users/brianross.mcpServers.n8n-mcp.env.N8N_API_KEY`
- **Base URL:** `https://n8n.equilibri.pro/api/v1/`
- **Auth header:** `X-N8N-API-KEY: <jwt>`
- **MCP endpoint:** `https://n8n.equilibri.pro/mcp-server/http` (built-in n8n MCP server)

## MCP Servers (in ~/.claude.json)

Two MCP servers configured for `/Users/brianross` project:

1. **`n8n`** — HTTP type, connects to built-in MCP endpoint
   - URL: `https://n8n.equilibri.pro/mcp-server/http`
   - Auth: Bearer token (same API key)

2. **`n8n-mcp`** — stdio type, runs `@anthropic/n8n-mcp-server`
   - Package: `npx -y @anthropic/n8n-mcp-server`
   - Env: `N8N_API_KEY` + `N8N_BASE_URL=https://n8n.equilibri.pro`

## Workflows (as of Mar 1 2026)

| ID | Name | Status | Purpose |
|----|------|--------|---------|
| `rLwrJTcfFRDR0K42` | Quote Automation | inactive | Typeform → Pipedrive → Anvil → Gmail |
| `Ax5kpAbBYq3DUiZs` | Intercom Quote Bot | inactive | Intercom → Pipedrive deal creation |
| `9lu2EO2QIaVleXdC` | Credit Control Daily | inactive | Daily credit control checks |
| `ME3fpPI2644KoPy1` | Gmail PO Extraction | **ACTIVE** | Gmail PO backfill |
| `u0Oq9aLrExGsvJP5` | Intercom → Slack | **ACTIVE** | Intercom conversations to Slack |
| `KGHNBodr6eijfy7i` | FF Hourly Sync | inactive | FluidFlow hourly data sync |
| `EZ5plAYVVDXXrZu3` | Morning Briefing | inactive | n8n morning briefing workflow |
| `8J2pYiVwrwT88c15` | Xero Payment → Won | inactive | Xero payment received → deal won |
| `Wt15C04PN8WXlprv` | Contract → Xero | inactive | UseAnvil contract → Xero invoice |
| `iMMerMXW8LgGLPxj` | Xero Contacts Import | inactive | Xero contacts import + dedup |
| `kSNwZ5jY0EYATUyT` | Intercom Tickets → Slack | inactive | Intercom tickets to Slack |
| `3vu9RVNjsCMSndKQ` | Agent Output Digest | inactive | PRD-22 weekly digest |
| `beYjHKxFvabsfPIo` | Action Queue → Notion | inactive | PRD-22 action queue sync |
| `70k7KfmE4ZyT7uZ8` | Validation Suite Nightly | inactive | Nightly test suite runs |
| `k3iALyaQGsIj4fl8` | My workflow | inactive | Throwaway test (Xero OAuth2) |

**13 of 15 inactive** — need credentials re-added via n8n UI (Xero OAuth2, Gmail OAuth, Pipedrive API token, Anthropic key, Notion token).

### Old → New Workflow ID Mapping

Old IDs from before the rebuild are **dead** — do not use:
- ~~`fJefEAQv1Ro5zVF7`~~ → `rLwrJTcfFRDR0K42` (Quote Automation)
- ~~`BYvZbihJcUOUEEeJ`~~ → no direct replacement (Reply Detection was not re-imported)
- ~~`kjpAY521mOnKQsjL`~~ → no direct replacement (Gmail Auto-Draft was not re-imported)

## Pipedrive Stages

### Pipeline 5 — FluidFlow SUM Renewals
| Stage ID | Name |
|----------|------|
| 24 | Email Sent |
| 25 | Follow Up 1 |
| 26 | Follow Up 2 |
| 27 | Final Notice |
| 28 | Replied |
| 29 | Renewed |
| 30 | Lapsed |

### Pipeline 3 — Sales
| Stage ID | Name |
|----------|------|
| 10 | Qualified Lead |
| 11 | Demo |
| 12 | Proposal Sent |
| 13 | Won |
| 14 | Lost |

### Pipeline 4 — FluidFlow (general)

## Credentials (n8n UI)

- **Gmail:** OAuth2 for sales@fluidflowinfo.com (needs re-auth after rebuild)
- **Anthropic:** API key via `$env.ANTHROPIC_API_KEY`
- **Notion:** Read/write token `ntn_3857...VVahJ` and read-only KB token `ntn_3857...WcrC`
- **Pipedrive:** API token in URL params
- **Xero:** OAuth2 (needs re-auth — caused execution #10 error on Mar 1)
- **Intercom:** API token
- **Typeform:** Webhook (outbound, not credential)

## Gotchas

### n8n Platform
- Webhook nodes MUST have `webhookId` field or they 404
- Gmail trigger `$json.from` is an object — use `.text`
- HTTP Request `specifyBody:"json"` mangles JSON — use Code node with `this.helpers.httpRequest()`
- `onError: continueRegularOutput` doesn't work — remove failing nodes from chain
- After instance rebuild, **all OAuth2 credentials must be re-authenticated** in the UI
- API key in `~/.claude.json` — never hardcode in skill files (old expired JWT caused outages)

### Integration-Specific
- Quotient only allows 1 webhook URL
- Quotient payload: `$json.body.title`, `$json.body.event_name`, `$json.body.quote_for.{name_first,name_last,email,company_name}`
- Pipedrive handles follow-up timing (Day 7/14/21 automations built in Pipedrive UI, NOT in n8n)
- Pipedrive automations are **UI-only** — not accessible via API

### API Quirks
- `GET /workflows` returns all workflows with full config
- `GET /executions` supports `workflowId` filter and `limit` param
- Execution status values: `success`, `error`, `waiting`
- Old workflow IDs return error JSON (no `name` key) — always validate response before parsing

## Rules

- Auto-draft NEVER auto-sends
- No calls/meetings offered in drafts
- Use pricing from Notion (2026 pricing page)
- Brian's tone hardcoded in draft templates
- n8n handles ALL Quotient↔Pipedrive automation (deal creation, status changes, contact linking, reply detection, auto-drafting)
- Pipedrive ONLY handles timed follow-up emails within its own pipeline
- Clear split: n8n = logic/integration, Pipedrive = timed stage-based emails

## Quick Commands

```bash
# List all workflows
curl -s "https://n8n.equilibri.pro/api/v1/workflows" -H "X-N8N-API-KEY: $N8N_KEY" | python3 -c "import sys,json; [print(f'{w[\"id\"]} | {\"OK\" if w[\"active\"] else \"DOWN\"} | {w[\"name\"]}') for w in json.load(sys.stdin)['data']]"

# Check recent executions
curl -s "https://n8n.equilibri.pro/api/v1/executions?limit=10" -H "X-N8N-API-KEY: $N8N_KEY" | python3 -c "import sys,json; [print(f'{e[\"id\"]} | {e[\"status\"]} | {e.get(\"workflowData\",{}).get(\"name\",\"?\")}') for e in json.load(sys.stdin)['data']]"

# Check specific workflow
curl -s "https://n8n.equilibri.pro/api/v1/workflows/WORKFLOW_ID" -H "X-N8N-API-KEY: $N8N_KEY"
```

Note: `$N8N_KEY` should be read from `~/.claude.json` — never hardcode the JWT in scripts.
