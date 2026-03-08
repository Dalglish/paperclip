---
name: ads-dashboard-builder
description: "Build GA4 + Google Ads performance dashboards with key GTM metrics"
---

# Ads Dashboard Builder

## Purpose
Create and maintain a unified performance dashboard combining Google Ads campaign data with GA4 website analytics. Provides a single view of paid acquisition performance from ad click through to conversion, enabling data-driven budget and strategy decisions.

## Tools Required
- GA4 API (website engagement + conversion data)
- Google Ads API (campaign performance data)
- Google Search Console API (organic vs paid comparison)
- Notion API (dashboard snapshots + commentary)
- n8n (scheduled data refresh workflows)

## Trigger
When setting up reporting for a new campaign, during weekly performance reviews, or when stakeholders need a consolidated view of paid acquisition metrics.

## Instructions

### Step 1: Define dashboard metrics
Organize metrics into sections:

**Acquisition (Google Ads):**
- Spend (daily, weekly, monthly)
- Impressions, clicks, CTR
- CPC (average and by campaign)
- Impression share (search + display)
- Quality score distribution

**Engagement (GA4):**
- Sessions from paid traffic
- Bounce rate by campaign/landing page
- Average engagement time
- Pages per session
- Scroll depth on key landing pages

**Conversion:**
- Total conversions (demo requests, sign-ups, downloads)
- Conversion rate by campaign and landing page
- Cost per conversion (CPA)
- ROAS (if revenue data available)
- Assisted conversions attribution

**Comparison:**
- Paid vs organic traffic volume and conversion rate
- Paid vs organic for same keywords (GSC overlap analysis)
- Month-over-month and year-over-year trends

### Step 2: Pull data from all sources
Execute API calls to collect:

**Google Ads API:**
```
- Campaign performance: last 30 days, daily granularity
- Ad group performance: last 30 days
- Keyword performance: last 30 days
- Geographic performance: last 30 days
- Device performance: last 30 days
- Hour of day performance: last 30 days
```

**GA4 API:**
```
- Sessions by source/medium (filter: google/cpc)
- Landing page report (filter: paid traffic)
- Conversion events by source
- User engagement metrics by landing page
```

**GSC API:**
```
- Organic queries overlapping with paid keywords
- Organic CTR for same keywords
```

### Step 3: Calculate derived metrics
Compute:
- Blended CPA across all campaigns
- Budget utilization rate (spend / daily budget * 100)
- Quality score weighted average
- Win rate: conversions / total clicks
- Organic vs paid CTR gap for overlapping keywords
- Trend direction (improving / declining / stable) for each KPI

### Step 4: Generate dashboard output
Produce a structured report with:

**Executive summary (5 lines max):**
- Total spend, total conversions, blended CPA
- Best performing campaign
- Biggest issue / opportunity
- Trend vs prior period

**Detailed tables:**
- Campaign performance table (sortable by any metric)
- Top 20 keywords by conversions
- Bottom 10 keywords by CPA (waste candidates)
- Landing page performance
- Device and geographic breakdown

**Charts (as data for visualization):**
- Daily spend + conversions trend (dual axis)
- CPA trend over time
- Impression share over time
- Conversion funnel: impressions > clicks > sessions > conversions

### Step 5: Set up automated refresh via n8n
Create an n8n workflow that:
- Runs daily at 7:00 AM
- Pulls fresh data from all three APIs
- Computes derived metrics
- Pushes summary to Notion
- Triggers alert if CPA exceeds threshold or spend exceeds daily budget by 20%

### Step 6: Push snapshot to Notion
Create a Notion page for each reporting period with:
- Date range
- All tables and metric summaries
- Commentary / annotations from the optimization skill
- Action items from the analysis
- Status: "Current" / "Archived"

## Agent Mapping
- **ff-marketing**: Primary consumer -- reviews dashboards and makes budget decisions
- **ff-sales-pipeline**: Consults for lead quality and conversion attribution
