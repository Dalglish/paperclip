---
name: pain-point-research
description: "Mine Reddit, YouTube, and forums via Perplexity for customer pain points and language"
---

# Pain Point Research

## Purpose
Systematically discover and catalog real customer pain points, objections, and language patterns by mining public forums, Reddit threads, YouTube comments, and Q&A sites. Produces actionable insights for ad copy, content strategy, sales enablement, and product positioning.

## Tools Required
- Perplexity API via OpenRouter (search + summarize forum discussions)
- Notion API (store pain point library)
- Google Search Console API (validate pain points against existing search demand)

## Trigger
When entering a new market vertical, developing messaging for a campaign, writing sales scripts, creating ad copy, or when customer language in ads/content isn't converting.

## Instructions

### Step 1: Define research scope
Specify:
- Product category (pipe sizing, pump selection, heat exchanger design, etc.)
- Target persona (process engineer, mechanical engineer, procurement, etc.)
- Competitor products to monitor (AFT Fathom, PIPE-FLO, Aspen HYSYS, etc.)
- Geographic focus if relevant

### Step 2: Mine forums via Perplexity
Run a series of Perplexity queries via OpenRouter:

**Reddit:**
```
Search Reddit for discussions about {product category} software frustrations.
Focus on subreddits: r/engineering, r/ChemicalEngineering, r/MechanicalEngineering, r/AskEngineers
Show: exact quotes, upvote counts, thread URLs.
What are the most common complaints?
```

**YouTube comments:**
```
What do engineers complain about in YouTube video comments about {product category} software?
Focus on tutorial videos and review videos.
Extract specific pain points and the exact language used.
```

**Technical forums:**
```
Search Eng-Tips, Stack Exchange Engineering, and other technical forums for
discussions about problems with {competitor product} or {product category} in general.
What specific issues do users report?
```

**Q&A sites:**
```
What questions do engineers frequently ask about {product category} on
Quora, Eng-Tips, and technical Q&A sites?
Group by: beginner questions, advanced questions, buying decisions.
```

### Step 3: Extract and categorize pain points
From all research, extract discrete pain points and categorize:

**Pain point categories:**
- **Usability**: "The UI is from 1995", "Takes forever to set up a model"
- **Accuracy**: "Results don't match real-world measurements", "Validation is unclear"
- **Cost**: "Too expensive for our team size", "Forced to buy modules we don't need"
- **Learning curve**: "Took months to get productive", "Documentation is terrible"
- **Integration**: "Can't import from CAD", "No API for automation"
- **Support**: "Support tickets take weeks", "Community is dead"
- **Features**: "Missing two-phase", "No transient analysis"
- **Workflow**: "Manual report generation", "Can't collaborate with team"

For each pain point, record:
- Exact customer language (verbatim quotes)
- Source URL
- Upvotes / agreement signals (how many people share this pain)
- Competitor context (which product they're complaining about)
- Frequency (how often this comes up across sources)

### Step 4: Identify language patterns
Extract the exact words and phrases customers use:
- How they describe their problem (before knowing a solution exists)
- How they describe what they want (aspirational language)
- Emotional words (frustrated, nightmare, wasted, finally, game-changer)
- Technical jargon vs plain language ratios
- Comparison language ("X is better than Y because...")

This feeds directly into ad copy and content writing.

### Step 5: Validate with GSC data
Cross-reference pain points with search demand:
- Do people search for these problems? (Check GSC queries)
- What's the search volume for pain-point keywords?
- Are we ranking for any of these terms already?
- Gaps where we have content but pain point isn't addressed

### Step 6: Score and prioritize
Rank pain points by:
```
priority = frequency * emotional_intensity * addressability
```
Where:
- frequency: 1 (rare) to 5 (mentioned in every thread)
- emotional_intensity: 1 (mild annoyance) to 5 (deal-breaker)
- addressability: 1 (we can't solve this) to 5 (we directly solve this)

### Step 7: Store in Notion
Create a Pain Point Library database with:
- Pain point statement
- Category, priority score
- Exact customer quotes (3-5 per pain point)
- Source URLs
- Addressability (how FluidFlow solves this)
- Content pieces that address this pain point (links)
- Ad campaigns using this language (links)
- Status: "New" / "Validated" / "Used in Content" / "Used in Ads"

### Step 8: Output actionable briefs
Generate:
- **For ad copy**: Top 10 pain points with exact customer language for headlines
- **For content**: Pain points with no existing content addressing them
- **For sales**: Common objections with suggested responses
- **For product**: Feature requests ranked by frequency and emotional intensity

## Agent Mapping
- **ff-marketing**: Primary consumer -- feeds content and ad copy creation
- **ff-sales-triage**: Uses pain point language for outreach personalization
- **ff-sales-pipeline**: Uses objection data for deal progression
- **ff-youtube-digest**: Cross-references video topics with discovered pain points
