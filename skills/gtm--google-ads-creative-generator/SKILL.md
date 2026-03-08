---
name: google-ads-creative-generator
description: "Generate Google Ads copy variations with headlines, descriptions, and extensions"
---

# Google Ads Creative Generator

## Purpose
Produce high-converting Google Ads copy variations at scale by analyzing existing top performers, competitor ads, and keyword intent. Generates responsive search ad (RSA) components: headlines, descriptions, sitelinks, callouts, and structured snippets -- all within Google Ads character limits.

## Tools Required
- Google Ads API (pull existing ad performance data)
- Perplexity API via OpenRouter (competitor ad research)
- Google Search Console API (identify converting keywords to target)
- Notion API (store ad copy library)

## Trigger
When launching a new Google Ads campaign, refreshing underperforming ad groups, or expanding into new keyword territories.

## Instructions

### Step 1: Gather context
Collect inputs:
- Target keywords / ad group theme
- Landing page URL
- Unique selling propositions (from spec sheet or product knowledge)
- Any offers, promotions, or CTAs currently active
- Competitor names to research

### Step 2: Analyze existing performance (if applicable)
Pull from Google Ads API:
- Current ad copy + performance metrics (CTR, conversion rate, quality score)
- Identify top-performing headlines and descriptions
- Note which RSA asset combinations Google favors ("Best" / "Good" / "Low" ratings)
- Flag any disapproved ads or policy issues

### Step 3: Research competitor ads
Use Perplexity to find competitor ad copy:
```
What Google Ads copy do competitors use for "{keyword}"?
Show headlines, descriptions, and any visible extensions.
Focus on: {competitor names}
```

Extract patterns:
- Common hooks (free trial, demo, ROI claims)
- Differentiators used
- CTA styles
- Extension types

### Step 4: Generate RSA components
Create a full RSA asset set following Google Ads limits:

**Headlines (15 max, 30 chars each):**
- 3-4 keyword-match headlines (include exact target keyword)
- 3-4 benefit headlines (speed, accuracy, cost savings)
- 2-3 social proof headlines (customer count, years in market)
- 2-3 CTA headlines (Free Demo, Try Free, Get Quote)
- 1-2 differentiator headlines (vs competitors)

**Descriptions (4 max, 90 chars each):**
- 1 feature-focused description
- 1 benefit-focused description
- 1 social-proof description
- 1 CTA-focused description

**Sitelink extensions (4-6):**
- Title (25 chars) + Description line 1 (35 chars) + Description line 2 (35 chars)
- Cover: Features, Pricing, Case Studies, Demo, Support, Industries

**Callout extensions (4-6, 25 chars each):**
- Key differentiators and trust signals

**Structured snippets:**
- Type: Features, Types, or Industries
- Values: 3-10 items (25 chars each)

### Step 5: Create variations by intent
For each keyword intent type, adjust tone:
- **Research intent** ("what is X"): Educational, position as authority
- **Comparison intent** ("X vs Y"): Competitive, highlight advantages
- **Purchase intent** ("buy X", "X pricing"): Direct CTA, urgency, offers
- **Problem intent** ("how to fix X"): Solution-oriented, empathy + authority

### Step 6: Quality checks
Verify all copy:
- Within character limits (headlines: 30, descriptions: 90)
- No trademarked terms used improperly
- No superlatives without qualification ("best" needs evidence)
- CTA matches landing page action
- No technical claims that contradict the spec sheet

### Step 7: Store in Notion
Create an ad copy library page with:
- Campaign / ad group association
- All headlines, descriptions, extensions (structured table)
- Performance predictions based on competitor analysis
- Status: "Draft" / "Approved" / "Live" / "Paused"

## Agent Mapping
- **ff-marketing**: Primary consumer -- generates ad copy for campaigns
