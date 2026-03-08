---
name: seo-content-optimizer
description: "Analyze GSC data to generate content optimization recommendations for existing pages"
---

# SEO Content Optimizer

## Purpose
Review existing published content using Google Search Console performance data to identify pages that are underperforming relative to their potential. Generates specific, actionable optimization recommendations to improve rankings, CTR, and traffic for pages already indexed.

## Tools Required
- Google Search Console API (performance data + URL inspection)
- GA4 (engagement metrics: time on page, bounce rate, conversions)
- Perplexity API via OpenRouter (competitive SERP analysis)
- Notion API (track optimization tasks)

## Trigger
When running a monthly content audit, when a previously top-ranking page drops in position, or when a page has high impressions but low CTR.

## Instructions

### Step 1: Pull GSC performance data (last 90 days)
For all pages, retrieve:
- Page URL, queries, clicks, impressions, CTR, avg position
- Compare to previous 90-day period for trend detection
- Flag pages with: position drop > 3 spots, CTR below curve, impressions declining

### Step 2: Categorize pages by optimization type
- **CTR optimization**: High impressions + low CTR (position OK but not getting clicks)
- **Ranking recovery**: Position dropped 3+ spots vs prior period
- **Cannibalization**: Multiple pages ranking for same keyword
- **Consolidation candidates**: Thin pages (low impressions across all queries)
- **Quick wins**: Position 4-10 with high impressions (close to page 1 top)

### Step 3: Analyze each flagged page
For each page needing optimization:

**CTR issues:**
- Compare title tag + meta description against competitors via Perplexity
- Check if rich snippets are possible (FAQ, HowTo schema)
- Suggest new title/meta that are more compelling

**Ranking drops:**
- Use Perplexity to check what new content has appeared for the target keyword
- Identify content freshness gaps (outdated stats, old screenshots)
- Check if search intent has shifted (informational vs commercial)

**Cannibalization:**
- Map which queries each page ranks for
- Recommend: merge pages, add canonical, or differentiate targeting

### Step 4: Pull GA4 engagement data
For each flagged page, check:
- Average engagement time (low = content quality issue)
- Bounce rate vs site average
- Conversion rate from organic traffic
- Scroll depth if available

### Step 5: Generate optimization recommendations
For each page, produce a specific action plan:
```
Page: /blog/example-post
Target keyword: "example keyword"
Current position: 8.2 | Impressions: 1,450 | CTR: 1.8%
Issue: CTR below expected (expected ~4% at position 8)

Recommendations:
1. Update title tag from "..." to "..."
2. Rewrite meta description to include "..."
3. Add FAQ schema for 3 PAA questions
4. Update intro paragraph to better match search intent
5. Add comparison table (competitors have this, we don't)

Priority: HIGH | Estimated impact: +200 clicks/month
```

### Step 6: Push to Notion
Create optimization tasks in Notion with:
- Page URL, target keyword, current metrics
- Specific recommendations (numbered list)
- Priority (HIGH/MEDIUM/LOW)
- Estimated impact
- Status: "To Do"

### Step 7: Summary report
Output a prioritized list:
- Top 5 highest-impact optimizations
- Pages to merge/consolidate
- Pages to deprecate (no traffic potential)
- Total estimated traffic gain from all optimizations

## Agent Mapping
- **ff-marketing**: Primary consumer -- runs monthly content audits
- **ff-youtube-digest**: Cross-references declining pages with video content opportunities
