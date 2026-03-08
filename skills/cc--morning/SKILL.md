---
name: morning
version: 1.1.0
description: |
  Morning briefing for Brian. Pulls Pipedrive deals, Gmail drafts,
  n8n automation stats, and renewal pipeline status into a voice-friendly
  summary. Updated Mar 1 2026 with new n8n workflow IDs.
allowed-tools:
  - Bash
  - Read
  - WebFetch
  - WebSearch
  - Task
---

# Morning Briefing

You are Brian's morning briefing assistant. When invoked with `/morning`, run ALL sections below in parallel where possible and present a concise, voice-friendly summary. No tables. Bullets only. Bold the numbers.

---

## Section 1: Pipeline Snapshot

Pull from Pipedrive API:

```bash
# SUM Renewal pipeline (Pipeline 5) - paginate if needed
curl -s "https://api.pipedrive.com/v1/deals?api_token=7e5ef97b57244b68eea7b9f3290aa36e14572d95&pipeline_id=5&status=open&limit=100"
```

```bash
# Sales pipeline (Pipeline 3)
curl -s "https://api.pipedrive.com/v1/deals?api_token=7e5ef97b57244b68eea7b9f3290aa36e14572d95&pipeline_id=3&status=open&limit=100"
```

```bash
# FluidFlow pipeline (Pipeline 4)
curl -s "https://api.pipedrive.com/v1/deals?api_token=7e5ef97b57244b68eea7b9f3290aa36e14572d95&pipeline_id=4&status=open&limit=100"
```

If Pipeline 5 has `additional_data.pagination.more_items_in_collection: true`, fetch page 2:
```bash
curl -s "https://api.pipedrive.com/v1/deals?api_token=7e5ef97b57244b68eea7b9f3290aa36e14572d95&pipeline_id=5&status=open&limit=100&start=100"
```

Summarize:
- **X deals** in SUM Renewal pipeline (break down by stage: Email Sent, Follow Up 1/2, Final Notice, Replied)
- **X deals** in Sales pipeline
- **X deals** in FluidFlow pipeline
- Any deals that changed stage in the last 24 hours
- Any deals won or lost in the last 7 days

## Section 2: n8n Execution Health

Check all recent n8n executions from the last 24 hours:

```bash
curl -s "https://n8n.equilibri.pro/api/v1/executions?limit=20" \
  -H "X-N8N-API-KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYjFhODJlOS03ZTM3LTQ5MjMtOGY0Mi00ZjdlZDU4NmZmNzkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNDJmNjc3MTMtYWVhYS00MTE3LWFjZTMtMjY2NmEwYTExYTM2IiwiaWF0IjoxNzcyMjQzMzQ1fQ.dcLMaK60IMNQXnntRtfFDD69m6nMSVEDIO1-Nr-qhEo"
```

Summarize:
- **X executions** in the last 24h
- **X errors** (any workflow failures)
- List any failed workflow names and error messages

## Section 3: SUM Renewal Status

From the Pipeline 5 data above, highlight:
- Deals approaching follow-up dates (in Email Sent for 5+ days, Follow Up stages for 5+ days)
- Any customer replies detected (Stage 28)
- Deals at Final Notice (Stage 27) — these need attention
- Recently renewed or lapsed

## Section 4: Automation Health

Check all n8n workflows are active:

```bash
curl -s "https://n8n.equilibri.pro/api/v1/workflows?limit=50" \
  -H "X-N8N-API-KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYjFhODJlOS03ZTM3LTQ5MjMtOGY0Mi00ZjdlZDU4NmZmNzkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNDJmNjc3MTMtYWVhYS00MTE3LWFjZTMtMjY2NmEwYTExYTM2IiwiaWF0IjoxNzcyMjQzMzQ1fQ.dcLMaK60IMNQXnntRtfFDD69m6nMSVEDIO1-Nr-qhEo" \
  | python3 -c "import sys,json; data=json.load(sys.stdin); active=[w for w in data['data'] if w['active']]; inactive=[w for w in data['data'] if not w['active']]; print(f'ACTIVE ({len(active)}):'); [print(f'  OK: {w[\"name\"]}') for w in active]; print(f'INACTIVE ({len(inactive)}):'); [print(f'  DOWN: {w[\"name\"]}') for w in inactive]"
```

### Key Workflow Reference
| Workflow | ID | Purpose |
|----------|-----|---------|
| Quote Automation | rLwrJTcfFRDR0K42 | Typeform → Pipedrive → Anvil → Gmail |
| Intercom Quote Bot | Ax5kpAbBYq3DUiZs | Intercom → Pipedrive deal creation |
| Credit Control Daily | 9lu2EO2QIaVleXdC | Daily credit control checks |
| Gmail PO Extraction | ME3fpPI2644KoPy1 | Gmail PO backfill |
| Intercom → Slack | u0Oq9aLrExGsvJP5 | Intercom conversations to Slack |
| FF Hourly Sync | KGHNBodr6eijfy7i | FluidFlow hourly data sync |
| Morning Briefing | EZ5plAYVVDXXrZu3 | n8n morning briefing workflow |
| Xero Payment → Won | 8J2pYiVwrwT88c15 | Xero payment → deal won |
| Contract → Xero | Wt15C04PN8WXlprv | UseAnvil contract → Xero invoice |
| Xero Contacts Import | iMMerMXW8LgGLPxj | Xero contacts import + dedup |

Report any workflow that's not active. Flag if fewer than 2 are active (credentials issue).

## Section 5: ICP News (Future — placeholder)

_Coming soon: Aggregated project news, job postings, and industry signals for targeted ICPs._

---

## Output Format

Keep it voice-friendly. Structure like this:

```
Morning Briefing — [date]

PIPELINE
- X open SUM renewals (Y at Email Sent, Z following up)
- X open sales deals
- [Any stage changes or wins/losses]

EXECUTIONS
- X runs in last 24h, Y errors
- [Any failures worth noting]

ATTENTION NEEDED
- [Deals at Final Notice]
- [Customer replies to handle]
- [Any automation errors]

AUTOMATION
- X/Y workflows active / [any issues]
```

Keep total output under 30 lines. Brian reads this on his phone or hears it via voice.
