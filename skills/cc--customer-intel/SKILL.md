# Customer Intelligence — `/customer-intel`

## Purpose
Daily intelligence scan of FluidFlow customers for capital project awards (2026) and ICP job postings to identify upsell/expansion opportunities.

## Trigger
`/customer-intel` or "customer intelligence", "customer scan", "project intelligence"

## Architecture
```
Google Sheet (Master Leads) → fetch N companies alphabetically
    ↓
For each company:
    WebSearch: "{company} {industry} 2026 capital project EPC FEED expansion"
    WebSearch: "{company} process engineer OR mechanical engineer job"
    ↓
    Synthesize → structured JSON (capital_projects, job_postings, opportunity_score)
    ↓
    Ruflo memory_store (namespace: customer-intel, key: {slug}:run:{date})
    ↓
Aggregate → HTML dashboard at ~/Downloads/customer-intel-poc.html
```

## Data Sources
- **Google Sheet:** `1pbwKKOzHkq3n1PBc9-IfxipWM68JpckYb9Af83VxDdk` (Customers tab)
- **SA Creds:** `/Users/user/Downloads/misc_archive/fluidflow-content-sync-f9e35cea9dd6.json`
- **Memory namespace:** `customer-intel`

## Opportunity Scoring (1-10)
| Score | Criteria |
|-------|----------|
| 9-10 | Multiple active 2026 capital projects + ICP hiring + large license count |
| 7-8 | Active projects OR significant hiring + moderate license base |
| 5-6 | Some project activity OR regional context + moderate engagement |
| 3-4 | Limited data, small license count, or ambiguous identity |
| 1-2 | No web presence, no projects, no hiring signals |

## ICP Job Titles
- Process Engineer / Process Manager
- Mechanical Engineer / Mechanical Engineering Manager
- Piping Engineer
- Project Engineer

## Output
- **HTML Dashboard:** `~/Downloads/customer-intel-poc.html`
  - KPI summary (companies scanned, projects, jobs, avg score)
  - Company cards with expand/collapse details
  - Sortable/filterable table view
  - Color-coded opportunity scores (green 7+, yellow 4-6, red 1-3)
  - Source URLs as clickable links

## Memory Schema
```json
{
  "key": "{company-slug}:run:{YYYY-MM-DD}",
  "namespace": "customer-intel",
  "value": {
    "company": "...",
    "industry": "...",
    "country": "...",
    "total_licenses": 0,
    "capital_projects": [{"name": "", "stage": "", "value": "", "source_url": ""}],
    "job_postings": [{"role": "", "location": "", "source_url": "", "icp_match": false}],
    "opportunity_score": 0,
    "summary": "..."
  },
  "tags": ["customer-intel", "{industry}", "{country}"]
}
```

## Usage
```
/customer-intel              # Run POC (first 20 companies A-Z)
/customer-intel --count 50   # Scan first 50 companies
/customer-intel --tier A     # Scan only Tier A customers
/customer-intel --industry "Mining & Metals"  # Filter by industry
```

## Dependencies
- Python 3 + gspread (installed)
- WebSearch tool
- Ruflo memory_store/memory_search
- Optional: mcp__llm-router (OpenRouter) for LLM synthesis

## Cost
- WebSearches: free (2 per company)
- LLM synthesis: ~$0.015/company via OpenRouter Sonnet
- Ruflo memory: free (local sql.js + HNSW)

## POC Results (2026-02-26)
- 20 companies scanned
- 20 capital projects found
- 7 job postings found
- Avg opportunity score: 4.8
- Top targets: AFC Energy (9), AFRY (9), AECOM (8), Aerison (8), A1 Engenharia (7)
