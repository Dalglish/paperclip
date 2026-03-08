---
name: on-demand-data-analysis
description: "Ad-hoc data analysis using Railway-hosted Postgres for GTM datasets"
---

# On-Demand Data Analysis

## Purpose
Provide ad-hoc analytical capability for GTM data by maintaining a Railway-hosted Postgres database that ingests data from GA4, GSC, Google Ads, Pipedrive, and Apollo. Enables SQL-based analysis for questions that pre-built dashboards don't answer, such as cohort analysis, attribution modeling, and funnel diagnostics.

## Tools Required
- Railway API (Postgres hosting + management)
- GA4 API (ingest website data)
- Google Search Console API (ingest organic data)
- Google Ads API (ingest paid data)
- Pipedrive API (ingest CRM data)
- Apollo API (ingest enrichment data)
- n8n (scheduled data ingestion workflows)
- Notion API (store analysis results)

## Trigger
When a specific analytical question comes up that can't be answered from standard dashboards, when building attribution models, or when investigating funnel drop-offs.

## Instructions

### Step 1: Set up Railway Postgres (one-time)
Create a Postgres database on Railway:
```graphql
mutation {
  serviceCreate(input: {
    projectId: "{project_id}",
    source: { image: "postgres:15" }
  }) { id }
}
```

Store connection string in `.env` (never display full credentials).

### Step 2: Define schema
Create tables for each data source:

```sql
-- Website sessions (GA4)
CREATE TABLE ga4_sessions (
  date DATE, source TEXT, medium TEXT, campaign TEXT,
  sessions INT, users INT, new_users INT,
  engaged_sessions INT, conversions INT,
  landing_page TEXT
);

-- Search performance (GSC)
CREATE TABLE gsc_queries (
  date DATE, query TEXT, page TEXT,
  clicks INT, impressions INT,
  ctr FLOAT, position FLOAT
);

-- Ad performance (Google Ads)
CREATE TABLE gads_keywords (
  date DATE, campaign TEXT, ad_group TEXT,
  keyword TEXT, match_type TEXT,
  impressions INT, clicks INT, cost FLOAT,
  conversions INT, cpa FLOAT
);

-- Pipeline (Pipedrive)
CREATE TABLE deals (
  id INT PRIMARY KEY, title TEXT, person_id INT,
  org_name TEXT, value FLOAT, currency TEXT,
  stage TEXT, status TEXT,
  created_at TIMESTAMP, won_at TIMESTAMP, lost_at TIMESTAMP,
  lead_source TEXT, utm_campaign TEXT
);

-- Enrichment (Apollo)
CREATE TABLE contacts (
  email TEXT PRIMARY KEY, name TEXT, title TEXT,
  company TEXT, industry TEXT, employee_count INT,
  revenue_range TEXT, linkedin_url TEXT,
  enriched_at TIMESTAMP
);
```

### Step 3: Set up data ingestion via n8n
Create n8n workflows for each source:
- **Daily**: GA4 sessions, GSC queries, Google Ads keywords
- **Hourly**: Pipedrive deals (via webhook or poll)
- **On enrichment**: Apollo contacts (triggered by enrichment pipeline)

Each workflow: API call > transform > INSERT INTO Postgres.

### Step 4: Run ad-hoc analysis
When an analytical question comes in, translate it to SQL:

**Example questions and queries:**

"Which campaigns drive the most pipeline value?"
```sql
SELECT d.utm_campaign, COUNT(*) as deals, SUM(d.value) as pipeline_value,
  AVG(d.value) as avg_deal_size
FROM deals d
WHERE d.created_at > NOW() - INTERVAL '90 days'
GROUP BY d.utm_campaign
ORDER BY pipeline_value DESC;
```

"What's our true cost per opportunity by keyword?"
```sql
SELECT k.keyword, SUM(k.cost) as total_cost,
  COUNT(d.id) as opportunities,
  SUM(k.cost) / NULLIF(COUNT(d.id), 0) as cost_per_opportunity
FROM gads_keywords k
LEFT JOIN ga4_sessions s ON s.campaign = k.campaign AND s.date = k.date
LEFT JOIN deals d ON d.utm_campaign = k.campaign
GROUP BY k.keyword
HAVING SUM(k.cost) > 100
ORDER BY cost_per_opportunity ASC;
```

"Which industries convert best from organic search?"
```sql
SELECT c.industry, COUNT(*) as conversions,
  AVG(d.value) as avg_deal_value
FROM contacts c
JOIN deals d ON d.person_id = c.email
JOIN ga4_sessions s ON s.source = 'google' AND s.medium = 'organic'
GROUP BY c.industry
ORDER BY conversions DESC;
```

### Step 5: Present results
Format query results as:
- Summary insight (1-2 sentences answering the question)
- Data table with key columns
- Recommended action based on findings
- Caveats or data quality notes

### Step 6: Store in Notion
Save each analysis as a Notion page with:
- Question asked
- SQL query used
- Results table
- Insight summary
- Date of analysis
- Data freshness note
- Tags: campaign, channel, funnel stage

## Agent Mapping
- **ff-marketing**: Requests analysis for campaign optimization
- **ff-sales-pipeline**: Requests pipeline and attribution analysis
- **ff-project-awards**: Uses for win/loss pattern analysis
