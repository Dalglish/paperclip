---
name: icp-linkedin-crawler
description: "Prospect ICP-matching LinkedIn profiles, enrich via Apollo, push to Pipedrive"
---

# ICP LinkedIn Crawler

## Purpose
Systematically build a qualified prospect list by identifying LinkedIn profiles matching the Ideal Customer Profile, enriching them through Apollo for contact details and firmographic data, and pushing qualified prospects into Pipedrive as new leads. This is proactive outbound prospecting, not reactive engagement capture.

## Tools Required
- LinkedIn API (search + profile data)
- Apollo API (contact enrichment -- email, phone, company data)
- Pipedrive API (create persons + deals)
- Notion API (prospect list management + ICP criteria)
- n8n (automate the crawl-enrich-push pipeline)

## Trigger
When launching an outbound campaign for a specific vertical, when expanding into a new geographic market, when pipeline needs topping up, or on a weekly scheduled basis.

## Instructions

### Step 1: Define ICP search criteria
Pull ICP definition from Notion or configure:

**Firmographic filters:**
- Industry: Oil & Gas, Water/Wastewater, Chemical, Pharmaceutical, Power Generation, HVAC, Mining
- Company size: 50-5000 employees (sweet spot: 200-2000)
- Geography: UK, EU, Middle East, Southeast Asia, ANZ, North America
- Revenue: $10M-$1B

**Title filters:**
- Keywords: "Process Engineer", "Mechanical Engineer", "Piping Engineer", "Engineering Manager", "Technical Director", "Head of Engineering", "VP Engineering", "Operations Manager"
- Seniority: Senior, Manager, Director, VP, C-suite
- Department: Engineering, Operations, R&D, Procurement

**Exclusion criteria:**
- Competitors' employees
- Students / interns
- Recruiters / HR
- Profiles already in Pipedrive
- Profiles contacted in last 90 days

### Step 2: Execute LinkedIn search
Use LinkedIn API to search with the defined criteria:
- Run searches segmented by industry + geography for manageable result sets
- Collect: name, headline, profile URL, current company, location
- Respect LinkedIn API rate limits strictly
- Cap at 100 new profiles per daily run

### Step 3: Deduplicate against existing pipeline
Before enrichment, check each profile against:
- Pipedrive persons (by name + company, or LinkedIn URL)
- Previous crawl results in Notion
- Skip any matches to avoid duplicate outreach

### Step 4: Enrich via Apollo
For each new profile, call Apollo:
```
POST /v1/people/match
{
  "linkedin_url": "{profile_url}",
  "reveal_personal_emails": false
}
```

Extract:
- Work email (required -- skip if unavailable)
- Phone number (bonus)
- Company: name, domain, industry, employee count, revenue, founded year
- Person: title, seniority, department
- Technologies used by company
- Company news / recent funding (if available)

Rate limit: 50 requests/minute on free tier. Batch accordingly.

### Step 5: Score against ICP
Apply weighted scoring:

| Criterion | Weight | Scoring |
|-----------|--------|---------|
| Industry match | 25 | Exact match = 25, adjacent = 15, no match = 0 |
| Company size | 20 | Sweet spot = 20, in range = 15, outside = 5 |
| Seniority | 20 | Director+ = 20, Manager = 15, Senior IC = 10 |
| Department | 15 | Engineering/Ops = 15, R&D = 10, other = 5 |
| Geography | 10 | Target region = 10, secondary = 5 |
| Tech signals | 10 | Uses CAD/sim software = 10, unknown = 5 |

**Classification:**
- 75+: **Tier 1** (highest priority outreach)
- 50-74: **Tier 2** (standard outreach sequence)
- 30-49: **Tier 3** (nurture / park)
- <30: **Disqualify** (do not push to CRM)

### Step 6: Push to Pipedrive
For Tier 1 and Tier 2 prospects:

**Create Person:**
- Name, email, phone
- LinkedIn URL (custom field)
- ICP score (custom field)
- Lead source: "LinkedIn Outbound"
- Company: linked organization (create org if new)

**Create Deal:**
- Title: "[Company] - Outbound"
- Stage: "Prospecting"
- Estimated value: Based on company size tier
- Note: ICP score breakdown, enrichment data, LinkedIn headline

**For Tier 1 specifically:**
- Add activity: "Priority outreach" due today
- Tag as "Hot Prospect"

### Step 7: Automate via n8n
Set up an n8n workflow that runs weekly:
1. Pull ICP criteria from Notion
2. Execute LinkedIn search
3. Deduplicate against Pipedrive
4. Enrich via Apollo (with rate limiting)
5. Score and classify
6. Push qualified prospects to Pipedrive
7. Send summary: "X profiles found, Y enriched, Z pushed (T1: n, T2: n)"

### Step 8: Track in Notion
Maintain a prospecting database with:
- Crawl date, search criteria used
- Profiles found, enriched, qualified, pushed
- ICP score distribution
- Email availability rate
- Conversion tracking: prospect > contacted > replied > meeting > deal

Weekly summary: crawl-to-meeting conversion rate, best performing verticals, criteria adjustments needed.

## Agent Mapping
- **ff-sales-triage**: Receives Tier 1 prospects for immediate outreach
- **ff-sales-pipeline**: Manages deals created from outbound prospecting
- **ff-marketing**: Feeds back which verticals and titles convert best
