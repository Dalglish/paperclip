---
name: gtm-workspace-setup
description: "Bootstrap GTM workspace with .env credentials and claude.md project config"
---

# GTM Workspace Setup

## Purpose
Initialize a new GTM project workspace by configuring environment variables for all integrated tools, setting up the claude.md project instructions, and verifying API connectivity. This is the foundational skill that must run before any other GTM skill.

## Tools Required
- Apollo API (enrichment key)
- Pipedrive API (CRM key + company domain)
- GA4 (property ID + service account)
- Google Ads (customer ID + developer token)
- Google Search Console (site URL + service account)
- LinkedIn (organization ID + access token)
- Railway API (project token)
- Perplexity API via OpenRouter (API key)
- Notion API (integration token + database IDs)
- n8n (instance URL + API key)
- Intercom (access token + app ID)

## Trigger
When starting a new GTM campaign, onboarding a new product vertical, or setting up a fresh workspace for a team member.

## Instructions

### Step 1: Create project directory structure
```
mkdir -p {project-name}/{data,exports,dashboards,content,logs}
```

### Step 2: Generate .env template
Create `.env` in the project root with sections for each tool:
```
# === Apollo ===
APOLLO_API_KEY=
APOLLO_RATE_LIMIT=50  # requests/min on free tier

# === Pipedrive ===
PIPEDRIVE_API_TOKEN=
PIPEDRIVE_COMPANY_DOMAIN=

# === GA4 ===
GA4_PROPERTY_ID=
GA4_SERVICE_ACCOUNT_JSON=  # path to SA JSON

# === Google Ads ===
GOOGLE_ADS_CUSTOMER_ID=
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_REFRESH_TOKEN=

# === Google Search Console ===
GSC_SITE_URL=
GSC_SERVICE_ACCOUNT_JSON=  # can reuse GA4 SA

# === LinkedIn ===
LINKEDIN_ORG_ID=
LINKEDIN_ACCESS_TOKEN=

# === Railway ===
RAILWAY_API_TOKEN=
RAILWAY_PROJECT_ID=

# === Perplexity (via OpenRouter) ===
OPENROUTER_API_KEY=
PERPLEXITY_MODEL=perplexity/llama-3.1-sonar-large-128k-online

# === Notion ===
NOTION_API_KEY=
NOTION_CONTENT_DB=
NOTION_LEADS_DB=

# === n8n ===
N8N_BASE_URL=
N8N_API_KEY=

# === Intercom ===
INTERCOM_ACCESS_TOKEN=
INTERCOM_APP_ID=
```

### Step 3: Verify each API connection
For each configured key, run a lightweight test call:
- Apollo: `GET /v1/auth/health`
- Pipedrive: `GET /v1/users/me`
- GA4: Run a simple `runReport` for yesterday
- Google Ads: `GET /customers/{id}`
- GSC: `GET /searchAnalytics/query` for last 7 days
- Notion: `GET /v1/users/me`
- n8n: `GET /api/v1/workflows`
- Intercom: `GET /me`
- OpenRouter: `POST /api/v1/chat/completions` with a trivial prompt
- Railway: `POST /graphql` with `{ me { id } }`

### Step 4: Generate claude.md
Create a project-level `claude.md` with:
- Tool stack summary (which APIs are active)
- Rate limit reference table
- Project-specific ICP definition
- Link to this skills directory
- Any tool-specific gotchas discovered during verification

### Step 5: Output health report
Print a table showing each tool's status (CONNECTED / MISSING KEY / AUTH FAILED / RATE LIMITED).

## Agent Mapping
- **ff-marketing**: Uses this to bootstrap campaign workspaces
- **ff-sales-pipeline**: Uses this to verify CRM + enrichment connectivity
