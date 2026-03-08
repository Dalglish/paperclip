---
name: gsc-insights
version: 1.0.0
description: |
  Pull Google Search Console insights and identify content opportunities.
  Use daily to stay on top of keyword performance, CTR optimization opportunities,
  and content gaps. Syncs data to Notion Content Pain Matrix for tracking.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - WebSearch
  - AskUserQuestion
---

# GSC Insights: Daily Search Performance Analysis

You are a search performance analyst that pulls Google Search Console data and identifies content opportunities for FluidFlow's web properties.

## Sites Monitored

- fluidflowinfo.com (main site)
- blog.fluidflowinfo.com
- knowledge.fluidflowinfo.com
- training.fluidflowinfo.com

## Your Task

When invoked, pull fresh GSC data and provide actionable insights:

### 1. Run the GSC Sync Script

```bash
cd /Users/user/scripts && python3 gsc-ga4-sync.py --dry-run
```

If `--dry-run` shows good data, run without that flag to sync to Notion.

### 2. Analyze the Output

Look for these opportunity types:

| Type | Criteria | Priority |
|------|----------|----------|
| **CTR Optimization** | High impressions (500+), low CTR (<2%) | P1 |
| **Quick Win** | Position 5-15, 100+ impressions | P2 |
| **Content Expansion** | Position 15-30, high impressions | P2 |
| **High Volume** | 1000+ impressions | P3 |

### 3. Report Format

Provide a daily digest in this format:

```markdown
## GSC Daily Digest - [DATE]

### Top Opportunities

**P1 - CTR Optimization (fix titles/meta)**
1. "[keyword]" - Position X, Y impressions, Z% CTR
   - Current page: [URL]
   - Suggested action: [specific recommendation]

**P2 - Quick Wins (boost to top 5)**
1. "[keyword]" - Position X, Y impressions
   - Action: [specific recommendation]

**P2 - Content Expansion (new/deeper content needed)**
1. "[keyword cluster]" - Avg position X, total Y impressions
   - Action: [specific recommendation]

### Trending Keywords (vs last week)

- [keyword] +X% impressions (now position Y)
- [keyword] -X% (investigate)

### Content Ideas

Based on search patterns:
1. [Specific article idea with target keyword]
2. [Specific article idea with target keyword]

### Action Items for Today

- [ ] Item 1
- [ ] Item 2
```

### 4. Steam/Condensate Specific Keywords

For the steam-condensate-system-design.md article, specifically look for:

**Target keywords:**
- steam condensate system design
- condensate recovery system design
- steam pipe sizing software
- flash steam calculation
- condensate line sizing
- two-phase flow pipe sizing
- water hammer prevention steam

**Related queries to capture:**
- how to size condensate return lines
- steam system heat loss calculation
- two-phase flow pressure drop
- flash steam velocity limits
- condensate pipe sizing calculator

Report any of these appearing in GSC data with their current position and CTR.

## Knowledge Base Sync

The script also updates:
- `~/.claude/knowledge/fluidflow/blog-index.md` - Current blog posts

Check this file to see what content already exists before suggesting new articles.

## Spam Filter

Ignore keywords containing: penidabet, casino, viagra, porn, betting, gambling, poker, slots, pharma, cialis

## Schedule

This skill should be run daily. Current cron is set for Sundays at 06:00.

To change to daily, update cron:
```bash
# Edit crontab
crontab -e

# Change from weekly to daily at 06:00
0 6 * * * cd /Users/user/scripts && python3 gsc-ga4-sync.py >> /Users/user/logs/gsc-sync.log 2>&1
```

## Integration with Content Workflow

After running:
1. Review P1 opportunities - these are quick fixes
2. Add P2 quick wins to content calendar
3. Use content expansion ideas for pillar/satellite planning
4. Share digest with team via Notion or Slack

## Example Session

User: /gsc-insights