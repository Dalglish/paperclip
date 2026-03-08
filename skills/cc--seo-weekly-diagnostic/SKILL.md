---
name: seo-weekly-diagnostic
description: Weekly SEO diagnostic for fluidflowinfo.com. Runs squirrelscan + SEO audit in tandem, compares against the master checklist, updates the Google Sheet with new findings, and posts a summary to Notion. Use when user says "weekly SEO check", "SEO diagnostic", or "run SEO health check".
allowed-tools: Bash(squirrel:*) Bash(npx:*) Bash(python3:*) Bash(curl:*) Read Write Grep Glob WebFetch Task
user-invocable: true
---

# Weekly SEO Diagnostic — fluidflowinfo.com

Runs two diagnostic tools in parallel, cross-references with the master action
checklist, and produces a delta report.

## How to Invoke

```
/seo-weekly-diagnostic
```

## What It Does

### Phase 1: Parallel Scans (run simultaneously)
1. **squirrelscan** — `npx squirrelscan https://fluidflowinfo.com --format json`
   - 230+ rules across 21 categories
   - Returns broken links, meta tag issues, performance, security
2. **SEO audit** — `/seo audit https://fluidflowinfo.com`
   - Schema validation, sitemap health, content quality, CWV, GEO readiness

### Phase 2: Compare Against Master Checklist
- Read the Google Sheet: `12xETIbLi38flVhwAhbBfflQrBKVbTxEGsyhAsqn16YY`
- For each finding:
  - If it matches an existing "To Do" row → note it's still open
  - If it matches a "Done" row → verify the fix is live (regression check)
  - If it's a NEW finding → add a new row to the sheet

### Phase 3: Summary Report
- Post to Notion as a child page under the SEO project:
  `3068fb7c-51ac-8147-9767-ce5a55cad4bc`
- Include:
  - Date and scan versions
  - Issues fixed since last run (moved to Done)
  - Issues still open (with age in days)
  - NEW issues found this week
  - Health score trend (if available)

## Configuration

```
SHEET_ID=12xETIbLi38flVhwAhbBfflQrBKVbTxEGsyhAsqn16YY
NOTION_SEO_PROJECT_PAGE=3068fb7c-51ac-8147-9767-ce5a55cad4bc
SA_CREDS=/Users/user/Downloads/misc_archive/fluidflow-content-sync-f9e35cea9dd6.json
NOTION_API_KEY=<from /Users/user/FFagents26/.env>
TARGET_URL=https://fluidflowinfo.com
```

## Execution Flow

```
START
  |
  ├── [parallel] squirrelscan → /tmp/squirrelscan-results.json
  ├── [parallel] /seo audit → structured findings
  |
  v
READ Google Sheet (SEO Actions tab)
  |
  v
COMPARE: new findings vs existing rows
  - Match by URL + category
  - Flag regressions (Done → broken again)
  - Flag new issues
  |
  v
UPDATE Sheet:
  - Add new rows with "To Do" status
  - Add "Last Checked: YYYY-MM-DD" to Notes on verified items
  |
  v
POST Notion summary page
  |
  v
DONE — print summary to terminal
```

## Scheduling

To run weekly, add to cron or use the `/morning` skill to trigger on Mondays:

```bash
# Add to crontab: every Monday at 8am
0 8 * * 1 cd /Users/user && claude -p "run /seo-weekly-diagnostic"
```

Or manually: just type `/seo-weekly-diagnostic` in any Claude Code session.

## Output Format

### Terminal Summary
```
=== SEO Weekly Diagnostic: fluidflowinfo.com ===
Date: YYYY-MM-DD
squirrelscan: X issues (Y critical, Z high)
SEO audit score: XX/100

Fixed since last run: N items
Still open: N items (N critical, N high, N medium)
New this week: N items
Regressions: N items

Sheet updated: https://docs.google.com/spreadsheets/d/12xETIbLi38flVhwAhbBfflQrBKVbTxEGsyhAsqn16YY
Notion summary: [URL]
```
