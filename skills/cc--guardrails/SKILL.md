# Guardrail Checker (Shared Fragment)

Loaded by all 4 swarm skills (Support, Content, Sales, CSMate) and by the Ralph Loop.
Validates agent output against the Guardrail Registry in Notion before release.

## Trigger

This skill is invoked automatically as a shared fragment — not directly by the user.
Other skills load it via: `Load guardrails/SKILL.md before output release.`

## Notion Guardrail Registry

**Database ID:** `3058fb7c-51ac-8122-8a7f-c80ece0615d7`

### Schema

| Property | Type | Values |
|----------|------|--------|
| Rule | title | Rule name/description |
| Category | select | Terminology, Scope, Safety, Competitor, Legal |
| Severity | select | Block, Warn, Info |
| Incorrect Term | rich_text | The wrong term/phrase to detect |
| Correct Term | rich_text | The replacement term/phrase |
| Context | rich_text | When/why this rule applies |

## Step 1: Query Rules by Category

Query the Guardrail Registry for applicable rules. Filter by Category to get rules relevant to the content being checked.

To fetch ALL rules (recommended on first load per session):

```
mcp__notion__API-query-data-source
  data_source_id: "3058fb7c-51ac-8122-8a7f-c80ece0615d7"
```

To filter by a single Category:

```
mcp__notion__API-query-data-source
  data_source_id: "3058fb7c-51ac-8122-8a7f-c80ece0615d7"
  filter: {
    "property": "Category",
    "select": {
      "equals": "Terminology"
    }
  }
```

Repeat for each Category: Terminology, Scope, Safety, Competitor, Legal.

### Hardcoded Fallback Rules

If Notion is unavailable, use these baseline rules extracted from `guardrail_agent.py` and `agent_swarm.py`:

**Terminology (Warn):**
- "pressure loss" → "pressure drop"
- "friction coefficient" → "friction factor"
- "settling solids" → "settling slurry"
- "non Newtonian" / "nonNewtonian" → "non-Newtonian"
- "Darcy Weisbach" → "Darcy-Weisbach"
- "Colebrook White" → "Colebrook-White"
- "Lockhart Martinelli" → "Lockhart-Martinelli"
- "Beggs Brill" → "Beggs-Brill"
- "Herschel Bulkley" → "Herschel-Bulkley"

**Scope (Block):**
Out-of-scope terms that must NOT be presented as FluidFlow capabilities:
- 3D CFD, CFD analysis, turbulence model, k-epsilon, LES, DNS
- particle tracking, Lagrangian, FSI, fluid-structure
- combustion, chemical reaction, viscoelastic, thixotropic
- open channel, free surface, transient analysis, water hammer
- surge analysis, pump trip

If out-of-scope term appears, it MUST have limitation context nearby:
"cannot", "can't", "not supported", "out of scope", "limitation", "outside"

**Safety (Block):**
Auto-escalate to human if content references:
- relief valve sizing, ammonia, H2S, hydrogen sulfide
- emergency shutdown, safety instrumented, SIL rating

**Competitor (Warn):**
- Do not name competitor products (AFT Fathom, PIPE-FLO, Pipenet)
- Do not make comparative claims without sourced data

**Legal (Block):**
- No invented prices — must come from pricing matrix
- No unauthorized discounts — only documented volume discounts (10%/15%/25%)
- No PII exposure — redact emails, phones, passwords

## Step 2: Check Output Against Rules

For each rule returned from the registry:

1. **Extract** `Incorrect Term` and `Severity` from the rule
2. **Search** the output content (case-insensitive) for `Incorrect Term`
3. **If found:**
   - `Severity = Block` → FAIL. Output must not be released. Apply auto-fix if `Correct Term` exists, then re-check.
   - `Severity = Warn` → WARNING. Flag for review, output can proceed with warning attached.
   - `Severity = Info` → NOTE. Log for analytics, no action required.

### Category-Specific Check Logic

**Terminology checks:**
- Simple string replacement: `Incorrect Term` → `Correct Term`
- Auto-fixable: YES
- Check hyphenation of correlation names (Darcy-Weisbach, Colebrook-White, etc.)

**Scope checks:**
- Search for out-of-scope terms in content
- If found, check for limitation context within 100 chars
- If no limitation context: FAIL
- Auto-fix: append scope disclaimer
  - `"Note: {term} is outside FluidFlow's scope (steady-state pipe network analysis only)."`
  - If transient-related: add `"FlowDesigner (coming soon) will address transient analysis."`

**Safety checks:**
- Search for escalation triggers
- If found: BLOCK output, escalate to human
- Not auto-fixable — requires human review

**Competitor checks:**
- Search for competitor product names
- If found without sourced comparison data: WARN

**Legal checks:**
- Check for invented price patterns: `"I think it's around $"`, `"probably costs"`, `"I'd estimate"`
- Check for unauthorized discount patterns: `"I can give you X%"`, `"special deal"`
- Check for PII: email regex, phone regex, password patterns
- Auto-fix PII: replace with `[customer-email]`, `[customer-phone]`, `[REDACTED]`

## Step 3: Return Structured Result

Return a guardrail report with this structure:

```
## Guardrail Report

**Status:** PASSED | FAILED | WARNED
**Summary:** {count} Block, {count} Warn, {count} Info

### Results Per Rule

| Rule | Category | Severity | Status | Detail |
|------|----------|----------|--------|--------|
| {name} | {cat} | Block/Warn/Info | PASS/FAIL | {issue or "OK"} |

### Auto-Fixes Applied
- Replaced "{incorrect}" → "{correct}"
- Added scope disclaimer for "{term}"
- Redacted PII: {count} items

### Blocked (Requires Action)
- {rule}: {description} — {suggestion}
```

### Decision Logic

```
IF any Block-severity rule FAILS → status = FAILED, output blocked
ELIF any Warn-severity rule FAILS → status = WARNED, output proceeds with warnings
ELSE → status = PASSED
```

## Integration Points

- **Swarm Pipeline Stage 4:** Called after Knowledge Retrieval, before PRD generation
- **Ralph Loop Check 2 (scope_boundaries):** Uses Scope category rules
- **Ralph Loop Check 3 (terminology):** Uses Terminology category rules
- **Output release gate:** Final check before any output leaves the system

## Notes

- Cache Notion results for the session — rules don't change mid-conversation
- Always apply auto-fixes before reporting final status (a Block that was auto-fixed becomes a PASS)
- Safety/escalation rules are never auto-fixable — they always require human review

## Notion MCP Compatibility Note

The Notion MCP server uses API version `2022-06-28`. The `query-data-source` endpoint
may return `invalid_request_url`. If this happens, use curl with the older database endpoint:

```bash
NOTION_AUTH=$(python3 -c "import json; f=open('/Users/user/.mcp.json'); d=json.load(f); h=json.loads(d['mcpServers']['notion']['env']['OPENAPI_MCP_HEADERS']); print(h['Authorization'])")
curl -s -X POST "https://api.notion.com/v1/databases/3058fb7c-51ac-8122-8a7f-c80ece0615d7/query" \
  -H "Authorization: $NOTION_AUTH" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{}'
```
