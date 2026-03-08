---
name: linkedin-engagement-pipeline
description: "Enrich LinkedIn post engagers via Apollo and push qualified leads to Pipedrive"
---

# LinkedIn Engagement Pipeline

## Purpose
Convert LinkedIn post engagement (likes, comments, shares) into qualified sales pipeline by enriching engager profiles through Apollo, scoring them against the ICP, and pushing qualified leads into Pipedrive with full context. Turns organic social engagement into measurable pipeline.

## Tools Required
- LinkedIn API (post engagement data -- likes, comments, shares)
- Apollo API (contact enrichment -- email, company, title, revenue)
- Pipedrive API (create leads/deals with enriched data)
- Notion API (track engagement-to-pipeline conversion)
- n8n (automate the enrichment + push workflow)

## Trigger
After publishing a LinkedIn post that generates significant engagement (10+ reactions), on a scheduled basis (daily/weekly), or when running a targeted content campaign.

## Instructions

### Step 1: Pull LinkedIn engagement data
For target posts (or all posts in the date range), retrieve:
- Post ID, content snippet, publish date
- List of users who liked, commented, or shared
- For each engager: name, headline, profile URL
- Comment text (for intent scoring)

### Step 2: Score engagement quality
Assign intent scores based on engagement type:
- **Comment with question or pain point**: 10 points
- **Comment with agreement/insight**: 7 points
- **Share with commentary**: 8 points
- **Share without commentary**: 5 points
- **Like/reaction**: 3 points
- **Multiple engagements across posts**: +5 bonus per additional post

Filter out:
- Internal team members
- Known vendors / agencies
- Bot-like profiles (no photo, <50 connections)
- Engagers already in Pipedrive (check via API)

### Step 3: Enrich via Apollo
For engagers scoring above threshold (default: 5 points), call Apollo:
```
POST /v1/people/match
{
  "linkedin_url": "{profile_url}"
}
```

Extract:
- Email (work preferred)
- Company name, domain, employee count, revenue
- Title, seniority level, department
- Location
- Technologies used (if available)

### Step 4: ICP qualification
Score each enriched contact against the ICP criteria:
- **Industry match** (engineering, oil & gas, water, pharma, etc.): +20
- **Company size** (target range: 50-5000 employees): +15
- **Seniority** (Director+, VP, C-suite, Lead Engineer): +15
- **Department** (Engineering, Operations, R&D, Procurement): +10
- **Geography** (target regions): +10
- **Technology signals** (CAD, simulation software, etc.): +10

Classify:
- Score 50+: **Hot** (immediate outreach)
- Score 30-49: **Warm** (nurture sequence)
- Score <30: **Cold** (park / monitor)

### Step 5: Push to Pipedrive
For Hot and Warm leads, create in Pipedrive:

**Person:**
- Name, email, phone (if available), LinkedIn URL
- Custom field: Lead source = "LinkedIn Engagement"
- Custom field: Engagement score, ICP score

**Deal:**
- Title: "[Company] - LinkedIn Inbound"
- Stage: "New Lead" (Hot) or "Nurture" (Warm)
- Value: Estimated based on company size
- Note: Include the original post content, their comment/reaction, enrichment data

### Step 6: Set up n8n automation
Create a recurring n8n workflow that:
- Runs daily at 9:00 AM
- Pulls previous day's LinkedIn engagement
- Enriches new engagers via Apollo (respect rate limits: 50/min free tier)
- Scores and qualifies
- Pushes to Pipedrive
- Sends Slack summary: "X new engagers, Y qualified, Z pushed to pipeline"

### Step 7: Track in Notion
Maintain a conversion tracking database:
- Post URL, date, total engagements
- Engagers processed, enriched, qualified, pushed to CRM
- Pipeline value generated from LinkedIn engagement
- Best performing post types (for content strategy feedback)

## Agent Mapping
- **ff-sales-triage**: Receives qualified leads for outreach prioritization
- **ff-sales-pipeline**: Manages deals created from LinkedIn engagement
- **ff-marketing**: Feeds back which content types generate most pipeline
