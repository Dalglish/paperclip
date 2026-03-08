---
name: google-ads-optimizer
description: "Analyze Google Ads campaign data and generate optimization actions"
---

# Google Ads Optimizer

## Purpose
Perform systematic analysis of Google Ads campaigns to identify waste, improve quality scores, optimize bidding, and increase conversion efficiency. Produces specific, actionable recommendations with expected impact estimates.

## Tools Required
- Google Ads API (campaign, ad group, keyword, and ad-level data)
- GA4 (post-click behavior and conversion data)
- Notion API (track optimization actions)
- Perplexity API via OpenRouter (competitive benchmarking)

## Trigger
When running weekly/monthly ads reviews, when CPA exceeds target, when a campaign's performance degrades, or before budget allocation decisions.

## Instructions

### Step 1: Pull campaign performance data
From Google Ads API, retrieve for the analysis period (default: last 30 days):

**Account level:**
- Total spend, conversions, CPA, ROAS, impression share

**Campaign level:**
- Spend, clicks, impressions, CTR, conversions, CPA, quality score distribution
- Search impression share + lost IS (budget vs rank)
- Device breakdown

**Ad group level:**
- Same metrics as campaign, grouped by theme
- Keyword count per ad group

**Keyword level:**
- Match type, impressions, clicks, CTR, CPC, conversions, CPA
- Quality score components (expected CTR, ad relevance, landing page experience)
- Search terms report (actual queries triggering ads)

**Ad level:**
- RSA asset performance ratings (Best / Good / Low)
- Headline and description combination reports

### Step 2: Identify waste
Flag the following:
- **Negative keyword gaps**: Search terms with clicks but zero conversions (add as negatives)
- **Low quality score keywords** (QS < 5): Diagnose which component is weak
- **High CPA keywords**: Keywords above 2x target CPA with sufficient data (30+ clicks)
- **Low impression share campaigns**: Where budget or rank is limiting profitable spend
- **Audience waste**: Devices, locations, or times with poor performance

### Step 3: Optimization analysis

**Budget reallocation:**
- Calculate marginal CPA for each campaign
- Identify where shifting $X from Campaign A to Campaign B improves total conversions
- Flag campaigns that are budget-limited with good CPA

**Bid adjustments:**
- Device bid modifiers based on conversion rate difference
- Time-of-day / day-of-week patterns
- Location performance differences

**Quality score improvements:**
- For QS < 7 keywords, diagnose:
  - Expected CTR below average: Need better ad copy (feed to `google-ads-creative-generator`)
  - Ad relevance below average: Ad copy doesn't match keyword intent
  - Landing page below average: Page speed, content relevance, mobile experience

**Ad copy improvements:**
- Flag RSA assets rated "Low" for replacement
- Identify ad groups where all ads have CTR below campaign average
- Suggest A/B test ideas based on competitor patterns

### Step 4: Cross-reference with GA4
For high-spend keywords and campaigns:
- Check bounce rate on landing pages (high bounce = message mismatch)
- Verify conversion tracking is firing correctly
- Analyze assisted conversions (some keywords may assist without last-click credit)
- Check engagement time vs conversion rate correlation

### Step 5: Generate action plan
Produce a prioritized list of changes:

```
Priority: HIGH
Action: Add 23 negative keywords from search terms report
Campaign: [name]
Expected impact: Save ~$X/month (Y% of wasted spend)
Keywords: [list]

Priority: HIGH
Action: Shift $500/month budget from [Campaign A] to [Campaign B]
Rationale: Campaign B CPA is $X vs Campaign A CPA of $Y, but B is budget-limited
Expected impact: +Z conversions/month at lower blended CPA
```

### Step 6: Push to Notion
Create optimization tasks in Notion with:
- Action description, campaign/ad group, priority
- Current metrics vs target metrics
- Expected impact (clicks, conversions, cost)
- Status: "Recommended" / "Approved" / "Implemented" / "Verified"
- Review date (7 days post-implementation to verify impact)

### Step 7: Summary dashboard data
Output key metrics for the `ads-dashboard-builder` skill:
- Week-over-week trend for: spend, CPA, conversions, ROAS
- Top 5 performing and bottom 5 performing keywords
- Budget utilization rate per campaign
- Quality score distribution histogram

## Agent Mapping
- **ff-marketing**: Primary consumer -- runs weekly optimization cycles
- **ff-sales-pipeline**: Receives lead quality feedback to inform keyword value
