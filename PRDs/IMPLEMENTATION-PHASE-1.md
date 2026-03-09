# Phase 1 Implementation: Dashboard Migration — Status & Deployment Guide

**Status:** ✅ **COMPLETE (Ready for Testing)**
**Last Updated:** 2026-03-09
**Owner:** BR

---

## What's Been Implemented

### ✅ Backend Routes (Server-Side API Proxies)

All 7 BI dashboard endpoints are implemented in `server/src/routes/bi-dashboards.ts`:

| Endpoint | Status | Data Source | Features |
|----------|--------|------------|----------|
| `/api/companies/:companyId/bi/command-center` | ✅ | Pipedrive | Revenue Engine Score, funnel, alerts |
| `/api/companies/:companyId/bi/sales` | ✅ | Pipedrive | Total revenue, NRR, pipeline, upsell targets |
| `/api/companies/:companyId/bi/pipeline` | ✅ | Pipedrive | Deals by stage, velocity, coverage ratio |
| `/api/companies/:companyId/bi/marketing` | ✅ | GSC/GA4 | Impressions, sessions, SEO health (placeholder) |
| `/api/companies/:companyId/bi/trials` | ✅ | Pipedrive | Trial funnel, conversion rate, source attribution |
| `/api/companies/:companyId/bi/analytics` | ✅ | Pipedrive | Cohort analysis, segmentation, LTV |
| `/api/companies/:companyId/bi/abm` | ✅ | Pipedrive | Target accounts, engagement levels |

**Key security features:**
- All API credentials (Pipedrive token, GSC service account, GA4 property ID, Apollo key) stay **server-side only**
- Browser never sees credentials
- Routes enforce company access control via `assertCompanyAccess()`

---

### ✅ Frontend UI Components

All 8 dashboard pages implemented in `ui/src/pages/dashboards/`:

| Dashboard | Status | Lines | Features |
|-----------|--------|-------|----------|
| CommandCenter | ✅ | 133 | Revenue score, funnel, alerts with task buttons |
| Sales | ✅ | 123 | KPIs, upsell targets with task buttons |
| Pipeline | ✅ | 114 | Stage visualization, velocity metrics |
| Marketing | ✅ | 134 | GSC, GA4, LinkedIn, trending keyword task buttons |
| Trials | ✅ | 113 | Conversion funnel, source attribution, alert tasks |
| Analytics | ✅ | 118 | Cohort retention, segmentation |
| ABM | ✅ | 94 | Target accounts, engagement levels, task buttons |
| PM | ✅ | 170 | Sprint board, velocity, agent perf, blocked items, approvals |

**All dashboards:**
- Use React Query for data fetching with proper caching (`staleTime`)
- Have loading states
- Implement ISA-101 design tokens (dark theme `#1E1E1E`, steel blue accents `#6B9BD2`, 6px radius)
- Display `—` (em dash) for unavailable data
- Feature "Create Task" buttons for actionable items

---

### ✅ Dialog Context Enhancement

Updated `ui/src/context/DialogContext.tsx`:
- Added `title?: string` to `NewIssueDefaults` interface
- Dashboard alerts can now pre-fill task titles when creating issues
- Example: "Pipeline coverage below 3×" → creates task with that title

---

### ✅ Routing & Navigation

- `ui/src/App.tsx`: `/dashboards` route group with 8 child routes (all mounted)
- `ui/src/components/Sidebar.tsx`: Added "Dashboards" link to "Intelligence" section
- `ui/src/pages/dashboards/DashboardsLayout.tsx`: Tab-based navigation with active state styling
- Server integration: `biDashboardRoutes(db)` mounted in `server/src/app.ts:115`

---

## Build Status

✅ **UI Build:** Passes TypeScript and Vite bundling
✅ **Server:** Routes registered and compiled
✅ **API Client:** Types defined in `ui/src/api/biDashboards.ts`

```bash
pnpm run --filter=ui build  # ✅ Builds successfully
```

---

## Deployment Checklist

### Before Launch

- [ ] **Environment Variables** — Set these in Paperclip server environment:

  ```bash
  # Pipedrive (required)
  PIPEDRIVE_API_TOKEN=<your-pipedrive-api-token>
  PIPEDRIVE_COMPANY_DOMAIN=fluidflow  # adjust to your domain

  # Google Search Console (optional, but marketing dashboard shows placeholders without it)
  GSC_SERVICE_ACCOUNT_JSON=<stringified JSON of service account key>
  GSC_SITE_URL=https://fluidflow.com/

  # Google Analytics 4 (optional)
  GA4_PROPERTY_ID=<numeric property ID>

  # Apollo.io (optional, for ABM)
  APOLLO_API_KEY=<your-apollo-api-key>
  ```

  **Note:** GSC and GA4 use the same service account JSON. See Pipedrive knowledge base for setup steps.

- [ ] **Pipedrive API Token** — Verify token has these scopes:
  - `deals.read`
  - `organizations.read`
  - `persons.read`
  - `pipelines.read`
  - `stages.read`

- [ ] **Test API Routes** — Quick smoke test:

  ```bash
  curl -H "Authorization: Bearer <session-token>" \
    http://localhost:3100/api/companies/<companyId>/bi/command-center
  ```

  Expect JSON response with `revenueEngineScore`, `funnel`, `alerts`.

- [ ] **Database Migration** — None required. Dashboards are read-only views of existing data.

- [ ] **Tailscale Access** — Confirm Paperclip is only accessible via Tailscale (if using authenticated mode with `private` exposure).

---

## Testing Recommendations

### 1. Data Accuracy

- **Command Center:** Verify Revenue Engine Score calculation matches Pipedrive open deals + value
- **Pipeline:** Cross-check stage totals with Pipedrive pipeline view
- **Sales:** Confirm upsell target list matches top won deals
- **Trials:** Verify conversion rate = won deals / (won + lost) deals

### 2. UI/UX

- [ ] Click through all 8 tabs without errors
- [ ] Verify "Loading…" appears while data fetches
- [ ] Click a "Create Task" button → task dialog pre-fills title
- [ ] Test on Mac Studio at intended resolution
- [ ] Verify colors match ISA-101 tokens (dark background, steel blue accents)

### 3. Performance

- [ ] Dashboard load time < 2 seconds (typical: ~500ms for Pipedrive calls)
- [ ] Switching tabs doesn't cause flicker (React Query caching working)
- [ ] Check browser network tab → no API keys exposed in requests/responses

### 4. Security

- [ ] **Verify no credentials in browser:**
  ```bash
  # Open dev tools → Network tab → check all /api/companies/*/bi/* requests
  # Confirm "Authorization" header only (no API keys in body or query)
  ```

---

## Known Limitations (Phase 1)

| Limitation | Reason | Phase 2+ Plan |
|-----------|--------|--------------|
| GSC/GA4 data shows placeholders | Service account keys not yet configured | Wire up Google APIs client library |
| Apollo ABM data minimal | Apollo integration not configured | Phase 2: add Apollo engagement signals |
| No revision rate metric | Requires mem0 + Paperclip integration | Phase 3: add AI grading system |
| No alert → auto-task rules | Requires background job scheduler | Phase 3: alert threshold engine |

---

## Next Steps (Phase 2)

1. **Real GSC/GA4 Integration** — Implement Google APIs client to fetch real search impressions/clicks/sessions
2. **Apollo Integration** — Wire up Apollo.io for real ABM account engagement signals
3. **PM Dashboard Enhancements** — Add burndown charts, sprint velocity trends, agent success rate trends
4. **Alert Thresholds** — Build rules engine (pipeline coverage < 3×, trial conversion < 25%, etc.) that auto-creates tasks

---

## Rollback Plan

If issues arise:

1. **UI Issues:** Revert `ui/` changes, rebuild, redeploy static assets
2. **API Issues:** Set `PIPEDRIVE_API_TOKEN=""` to disable routes (they return 500 gracefully)
3. **Database:** No DB changes, safe to rollback
4. **Full Rollback:** Revert to commit before PRD-DASHBOARD-MIGRATION

```bash
git revert <commit-with-dashboard-migration>
```

---

## File Manifest

### Server

- `server/src/routes/bi-dashboards.ts` — All 7 proxy route implementations
- `server/src/routes/index.ts` — Export route factory
- `server/src/app.ts` — Mount routes (line 115: `api.use(biDashboardRoutes(db))`)

### UI

- `ui/src/pages/dashboards/` — 8 dashboard components
- `ui/src/pages/dashboards/DashboardsLayout.tsx` — Tab navigation
- `ui/src/components/Sidebar.tsx` — Sidebar link to dashboards
- `ui/src/api/biDashboards.ts` — API client + types
- `ui/src/context/DialogContext.tsx` — NewIssueDefaults interface
- `ui/src/components/NewIssueDialog.tsx` — Dialog initialization

### Docs

- `PRDs/PRD-DASHBOARD-MIGRATION.md` — Full requirements
- `PRDs/IMPLEMENTATION-PHASE-1.md` — This file

---

## Contacts & Questions

- **Server-side API:** Check `bi-dashboards.ts` comments for Pipedrive API specifics
- **UI Components:** Review dashboard component patterns in `CommandCenter.tsx`
- **Design Tokens:** Refer to ISA-101 system (colors, spacing, typography)
- **Deployment:** Follow environment variable checklist above

---

**Created:** 2026-03-09
**Updated:** As needed
**Status:** Ready for QA testing
