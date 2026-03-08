# Health Check — Pre-Session Integration Validation

Validate all external service connections before starting work. Catches broken integrations in the first 60 seconds instead of 30 minutes in.

## Trigger
Use at session start when the task involves external APIs (Notion, GitHub, Pipedrive, Google Sheets, Qdrant).

## Checks

### 1. Notion MCP
```
- List databases (API-post-search) — confirms token works
- Try reading a known page — confirms sharing
- NOTE: API-post-page has known serialization bugs.
  Use API-patch-block-children (block append) instead.
- If reads fail: report "Notion unavailable" and suggest curl fallback
```

### 2. GitHub
```bash
git remote -v                    # Confirm remote exists
git fetch --dry-run 2>&1         # Confirm push/pull access
git branch -vv                   # Confirm branch tracking
git status                       # Check for uncommitted work
```

### 3. API Keys (.env)
```bash
# Check keys are set (not their values)
grep -c "OPENAI_API_KEY=" .env 2>/dev/null
grep -c "ANTHROPIC_API_KEY=" .env 2>/dev/null
grep -c "QDRANT_API_KEY=" .env 2>/dev/null
grep -c "PIPEDRIVE_API_TOKEN=" .env 2>/dev/null
```
For each key found, make a minimal authenticated request to verify it's not expired.

### 4. Qdrant (if needed)
```bash
curl -s -o /dev/null -w "%{http_code}" http://152.42.149.145:6333/collections
```
Expected: 200

## Output

```
INTEGRATION HEALTH CHECK
========================
Service         | Status  | Workaround
----------------|---------|------------------
Notion MCP      | OK/FAIL | Use block-append, not post-page
GitHub          | OK/FAIL | [details]
API Keys        | OK/FAIL | [which missing]
Qdrant          | OK/FAIL | [details]

Known quirks loaded:
- Notion post-page serialization bug → use block-append
- [any others from CLAUDE.md]

Ready to proceed: YES / NO (fix blockers first)
```

## Rules
- Run this BEFORE any implementation work.
- If a service is down, tell the user immediately with a proposed alternative.
- Do NOT spend time debugging MCP bugs — use known workarounds.
- Load CLAUDE.md integration notes into working context.
