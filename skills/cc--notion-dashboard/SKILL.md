# /notion-dashboard — Dashboard ↔ Notion Sync (PRD-22)

## Purpose
Conversational access to Dashboard Tasks, Content Tracker, and Agent Outputs in Notion.
Push dashboard intelligence to Notion; pull Notion data into the dashboard.

## Database IDs
| Database | ID | Data Source |
|----------|----|-------------|
| Dashboard Tasks | `3128fb7c-51ac-81c0-a5e8-e226b1491bf3` | (fetch to get) |
| Content Tracker | `eaa0f7c6-772b-459e-b680-5ac7a8cc9233` | (fetch to get) |
| Agent Outputs | `3058fb7c-51ac-816e-bf68-d672f349ef48` | (fetch to get) |

## Page IDs
| Page | ID |
|------|----|
| Daily Briefings | `3128fb7c-51ac-81a7-9c2f-da07d4a7eb94` |
| Growth System | `a26f217f-f4d0-44e6-bee2-df49da187f5c` |

## Query → Tool Mapping

| User asks... | Tool / Command |
|-------------|----------------|
| "Push action queue to Notion" | `python3 agents/intelligence.py --push-actions-notion` |
| "Push decisions to Notion" | `python3 agents/intelligence.py --push-decisions-notion` |
| "Push briefing to Notion" | `python3 agents/intelligence.py --push-briefing-notion` |
| "Show content tracker status" | `from notion_sync import get_content_tracker_summary` |
| "Show agent outputs" | `from notion_sync import get_agent_outputs_summary` |
| "Weekly digest" | `python3 agents/notion_sync.py --weekly-digest` |
| "Dry run push" | Add `--dry-run` flag to any push command |

## CLI Usage
```bash
# Push commands
python3 agents/intelligence.py --push-actions-notion --dry-run --json
python3 agents/intelligence.py --push-briefing-notion
python3 agents/intelligence.py --push-decisions-notion

# Standalone module
python3 agents/notion_sync.py --push-actions --dry-run
python3 agents/notion_sync.py --push-briefing
python3 agents/notion_sync.py --push-decisions
python3 agents/notion_sync.py --weekly-digest
```

## Dashboard Tasks Schema
- **Task** (title): Description of the action item
- **Company** (rich_text): Company name
- **Source** (select): Action Queue / Decision Board / Morning Briefing
- **Category** (select): 9 values (Stale Quote, Unsigned Contract, etc.)
- **Priority** (select): Critical / High / Medium / Low
- **Status** (status): Open / In Progress / Done / Skipped
- **Suggested Action** (rich_text): What to do
- **Deal ID** (rich_text): Pipedrive deal ID
- **Country** (rich_text): Customer country
- **Composite Key** (rich_text): `{company}|{category}` for dedup

## Dedup Logic
Before creating a task, queries `Composite Key == "{company}|{category}"` where `Status != Done`.
If found → updates existing. If not found → creates new.

## Rate Limiting
- 0.35s sleep between API calls (stays under Notion's 3 req/s limit)
- Batch size: 50 items max per push

## Known Issues
- MCP Notion tools have serialization issues with raw API calls — module uses `requests` directly
- Status property requires Notion's status type (not select) — created via API, not MCP
- Content Tracker field names may vary — code handles Name/Title/title variants
