---
name: seo-keyword-research
description: "Discover keyword gaps and opportunities using GSC data + Perplexity research"
---

# SEO Keyword Research

## Purpose
Identify high-value keyword opportunities by combining Google Search Console performance data with Perplexity-powered competitive research. Finds gaps where we rank poorly or not at all, clusters keywords by intent, and prioritizes by traffic potential and difficulty.

## Tools Required
- Google Search Console API (current ranking data)
- Perplexity API via OpenRouter (competitive research + SERP analysis)
- Notion API (store keyword research outputs)
- GA4 (conversion data to weight keyword value)

## Trigger
When planning a new content sprint, reviewing quarterly SEO performance, or entering a new product vertical that needs keyword coverage.

## Instructions

### Step 1: Pull GSC baseline (last 90 days)
Query GSC API for:
- All queries where impressions > 10
- Group by: query, page, clicks, impressions, CTR, position
- Export as structured data

### Step 2: Identify quick wins
Filter for keywords where:
- Position 4-20 (page 1-2, not yet top 3)
- Impressions > 100
- CTR below expected for position (use CTR curve: pos 1=30%, pos 2=15%, pos 3=10%, etc.)
These are "striking distance" keywords to optimize existing pages for.

### Step 3: Use Perplexity for gap discovery
For each core product category, prompt Perplexity via OpenRouter:
```
What are the top 20 search queries engineers use when looking for {category} software?
Include long-tail variations. Focus on commercial and informational intent.
```

Cross-reference results against GSC data. Keywords Perplexity returns that have zero GSC impressions are gaps.

### Step 4: Cluster by intent
Group all keywords into clusters:
- **Navigational**: brand terms, product names
- **Informational**: "how to", "what is", guides
- **Commercial**: "best", "vs", "alternative", "pricing"
- **Transactional**: "buy", "demo", "free trial", "download"

### Step 5: Score and prioritize
For each keyword cluster, calculate a priority score:
```
priority = (estimated_monthly_volume * intent_weight) / competition_estimate
```
Where intent_weight: transactional=4, commercial=3, informational=2, navigational=1.

Use Perplexity to estimate volume and competition for the top 50 gap keywords.

### Step 6: Output to Notion
Create or update a Notion database with columns:
- Keyword | Cluster | Intent | Current Position | Impressions | Est. Volume | Priority Score | Target Page | Status

### Step 7: Generate brief
Produce a summary with:
- Top 10 quick wins (existing pages to optimize)
- Top 10 content gaps (new pages needed)
- Top 5 competitor keywords we should target
- Recommended next actions

## Agent Mapping
- **ff-marketing**: Primary consumer -- runs this monthly or before content sprints
- **ff-youtube-digest**: Cross-references video topics with keyword gaps
