---
name: morning-data-brief
description: "Daily KPI summary combining GA4, GSC, Pipedrive, and Google Ads data"
---

# Morning Data Brief

## Purpose
Generate a concise, actionable daily briefing that combines key metrics from GA4 (website), Google Search Console (organic), Google Ads (paid), and Pipedrive (sales pipeline). Delivered first thing in the morning so leadership can start the day informed and ready to act on any anomalies.

## Tools Required
- GA4 API (website traffic + engagement metrics)
- Google Search Console API (organic search performance)
- Google Ads API (paid campaign performance)
- Pipedrive API (pipeline value, deal movement, activities)
- Notion API (archive daily briefs)
- n8n (schedule daily execution)

## Trigger
Runs automatically every morning at 7:00 AM via n8n cron trigger. Can also be invoked manually for ad-hoc reporting.

## Instructions

### Step 1: Pull yesterday's data from all sources

**GA4 (yesterday vs same day last week):**
- Total sessions, users, new users
- Organic sessions, paid sessions, direct, referral
- Top 5 landing pages by sessions
- Conversion events: demo requests, sign-ups, downloads
- Bounce rate (site average)

**Google Search Console (yesterday vs 7-day average):**
- Total clicks, impressions, CTR, average position
- Top 5 queries by clicks
- Top 5 pages by clicks
- Any queries entering top 10 for the first time
- Any queries dropping out of top 10

**Google Ads (yesterday vs 7-day average):**
- Total spend, clicks, impressions, CTR
- Conversions, CPA
- Remaining daily budget utilization
- Any campaigns hitting budget cap
- Quality score changes

**Pipedrive (yesterday):**
- Deals created (count + value)
- Deals won (count + value)
- Deals lost (count + value + loss reasons)
- Deals moved forward in pipeline (stage changes)
- Activities completed vs scheduled
- Pipeline total value by stage
- Overdue activities count

### Step 2: Calculate derived metrics
- **Blended CAC**: (Google Ads spend) / (total conversions)
- **Pipeline velocity**: Deals moved / total active deals
- **Organic growth rate**: Yesterday clicks vs 28-day average
- **Paid efficiency**: CPA trend (7-day moving average)
- **Lead-to-deal rate**: Pipedrive deals created vs website conversions

### Step 3: Detect anomalies
Flag anything outside normal range (>2 standard deviations from 30-day average):
- Traffic spikes or drops (by channel)
- Conversion rate changes
- CPA spikes
- Pipeline value drops
- Unusual search queries appearing

### Step 4: Format the brief

```
MORNING BRIEF - {date}
========================

HEADLINES
- {1-3 key takeaways, most important first}
- {anomalies or notable changes}

WEBSITE (GA4)
Sessions: {n} ({+/-X% vs last week})
  Organic: {n} | Paid: {n} | Direct: {n}
Conversions: {n} demos, {n} sign-ups
Bounce rate: {X%}

SEARCH (GSC)
Clicks: {n} ({+/-X% vs 7d avg})
Avg position: {X}
New top-10 queries: {list or "none"}
Dropped queries: {list or "none"}

PAID (Google Ads)
Spend: ${n} | CPA: ${n} ({+/-X% vs 7d avg})
Conversions: {n}
Budget utilization: {X%}
Alerts: {budget cap hits, QS drops, or "none"}

PIPELINE (Pipedrive)
Created: {n} deals (${value})
Won: {n} deals (${value})
Lost: {n} deals (${value})
Active pipeline: ${total} across {n} deals
Overdue activities: {n}

ACTION ITEMS
- {specific actions needed based on data}
- {e.g., "Review 3 overdue deals in Negotiation stage"}
- {e.g., "Campaign X hit budget cap -- consider increase"}
```

### Step 5: Deliver the brief
- Push to Notion (daily briefs database) for archival
- Trigger n8n workflow to send via preferred channel (Slack, email)

### Step 6: Archive and trend
Each daily brief stored in Notion builds a historical record for:
- Week-over-week comparisons
- Monthly roll-ups
- Identifying long-term trends vs daily noise

## Agent Mapping
- **ff-marketing**: Primary consumer -- reviews daily for campaign performance
- **ff-sales-pipeline**: Reviews pipeline section for deal management priorities
- **ff-sales-triage**: Checks new leads and conversion metrics
