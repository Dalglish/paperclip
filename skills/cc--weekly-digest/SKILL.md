---
name: weekly-digest
version: 1.0.0
description: Auto-generated Friday team digest from Paperclip GTM board
---

# Weekly Digest Agent

Generates a team digest every Friday at 16:00 GMT from the Paperclip GTM sprint board.

## What It Does

1. Queries Paperclip's PostgreSQL for all GTM project issues
2. Categorizes by status: Shipped / Blocked / In Progress / Todo / Backlog
3. Pulls agent heartbeat stats for the week
4. Formats per the Project Management Handover PRD spec
5. Posts to Slack #gtm-feed
6. (Optional) Creates a dated Notion Weekly TM Archive page

## Digest Sections

- **SHIPPED THIS WEEK** — issues moved to `done` status
- **BLOCKERS** — issues in `blocked` status with days-blocked count
- **IN FLIGHT** — all non-done issues with status breakdown
- **PRIORITY BREAKDOWN** — urgent/high/medium/low counts
- **AGENT WORK** — heartbeat run stats (total, completed, failed, success rate)
- **STALE INITIATIVES** — issues with no update for 5+ days (excluding done/blocked/backlog)

## Configuration

Environment variables (injected via Paperclip adapterConfig.env):

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PG_HOST | No | localhost | PostgreSQL host |
| PG_PORT | No | 54329 | PostgreSQL port |
| SLACK_BOT_TOKEN | For Slack | — | Slack Bot OAuth token with chat:write scope |
| SLACK_CHANNEL_ID | No | C0AL6439TNV | Target Slack channel (#gtm-feed) |
| NOTION_API_KEY | For Notion | — | Notion integration token |
| NOTION_ARCHIVE_DB_ID | For Notion | — | Notion Weekly TM Archive database ID |

## Manual Trigger

```bash
# Stdout only
python3 /Users/brianross/infra/paperclip/scripts/weekly-digest.py

# With Slack posting
python3 /Users/brianross/infra/paperclip/scripts/weekly-digest.py --slack

# With Notion archive
python3 /Users/brianross/infra/paperclip/scripts/weekly-digest.py --slack --notion
```

## Heartbeat

- Interval: 604800 seconds (7 days)
- Wake on demand: enabled
- Manual trigger: POST /api/agents/{id}/heartbeat/invoke

## Wiring Needed

1. Add `SLACK_BOT_TOKEN` to agent's adapterConfig.env (or as Paperclip secret)
2. Add `NOTION_API_KEY` + `NOTION_ARCHIVE_DB_ID` for Notion archiving
3. Set up a cron or n8n trigger for Friday 16:00 GMT (heartbeat intervalSec is approximate)
