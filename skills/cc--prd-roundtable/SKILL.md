---
name: prd-roundtable
version: 1.1.0
description: |
  Multi-model PRD review roundtable. Dispatches a PRD to Opus (architecture),
  Sonnet (implementation), Haiku (clarity), Kimi K2.5 (code feasibility),
  and Codex/platform (fit assessment) in parallel. Synthesizes a consensus
  report with conflicts highlighted.
  Use when user says "PRD roundtable", "review PRD", "roundtable", or "prd-roundtable".
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Task
  - Glob
  - Grep
  - AskUserQuestion
  - mcp__claude_ai_Notion__fetch
  - mcp__claude_ai_Notion__search
---

# PRD Roundtable — Multi-Model Review

Dispatch a PRD to 4 models in parallel, each reviewing from a different perspective. Synthesize into a single consensus report.

## Local Cache (Token Savings)

Before dispatching to any model, check for cached reviews:

**Cache location:** `~/.claude/cache/roundtable/`
**Cache key:** SHA-256 of PRD content (first 12 chars)
**Cache TTL:** 7 days
**Format:** `{hash}_{model}.md` per reviewer, `{hash}_report.md` for synthesis

### Cache Protocol

1. **Before dispatch:** Hash the PRD content. Check `~/.claude/cache/roundtable/` for
   `{hash}_opus.md`, `{hash}_sonnet.md`, `{hash}_haiku.md`, `{hash}_kimi.md`.
2. **Cache hit:** If ALL 4 cached reviews exist and are < 7 days old, skip API calls.
   Load from cache and go straight to synthesis (or re-use cached `{hash}_report.md`).
3. **Partial hit:** Only re-dispatch for models whose cache is missing or expired.
4. **After dispatch:** Save each model's raw review to `{hash}_{model}.md`.
   Save the final synthesis to `{hash}_report.md`.
5. **Cache the Kimi gateway call at temperature=0** so the gateway's own SQLite cache
   also kicks in on repeat runs.

### Implementation

```bash
# Create cache dir
mkdir -p ~/.claude/cache/roundtable

# Generate hash from PRD content
HASH=$(echo -n "$PRD_CONTENT" | shasum -a 256 | cut -c1-12)

# Check for cached reviews
for model in opus sonnet haiku kimi; do
  CACHE_FILE="$HOME/.claude/cache/roundtable/${HASH}_${model}.md"
  if [ -f "$CACHE_FILE" ]; then
    AGE=$(( $(date +%s) - $(stat -f %m "$CACHE_FILE") ))
    if [ $AGE -lt 604800 ]; then  # 7 days
      echo "CACHE HIT: $model (age: ${AGE}s)"
    fi
  fi
done
```

When a cached report is used, note it in the output:
```
Cache: 3/4 reviews from cache (opus, sonnet, haiku). Only kimi re-dispatched.
Saved: ~$X.XX in API costs.
```

---

## When User Says `/prd-roundtable`

### Step 1: Locate the PRD

Ask the user or detect from context:

1. **File path** — Read the PRD file directly
2. **Notion URL/ID** — Fetch via Notion MCP `fetch` tool
3. **Pasted content** — Use directly from the conversation
4. **Search** — If user gives a name, search Notion or the local repo

If the PRD source is ambiguous, use AskUserQuestion:
- **Local file** — Read from disk (provide path)
- **Notion page** — Fetch from Notion (provide URL or search term)
- **Paste it** — User will paste the content

### Step 2: Read and Prepare the PRD

Read the full PRD content. Extract:
- **Title** and version
- **Acceptance criteria** (the PASS/FAIL gates)
- **Technical scope** (what's being built)
- **Dependencies** and integrations

Prepare a review prompt that includes the full PRD text.

### Step 3: Launch 4 Parallel Review Agents

Spawn all 4 as **parallel Task subagents**. Each gets the full PRD content in their prompt.

#### Agent 1: ARCHITECT (Opus)
```
subagent_type: general
model: opus

You are a senior software architect reviewing a PRD. Be critical.

Review this PRD for:
1. ARCHITECTURAL GAPS — Missing system design decisions, unclear data flow,
   unspecified error handling, missing scalability considerations
2. SCOPE RISKS — Features that are underestimated, hidden complexity,
   implicit requirements not called out
3. DEPENDENCY RISKS — External services, APIs, or libraries that could
   block or delay implementation
4. SECURITY GAPS — Auth, data validation, injection vectors, secrets management

For each issue found:
- Rate severity: CRITICAL / HIGH / MEDIUM / LOW
- Quote the specific PRD section
- Suggest a concrete fix (1-2 sentences)

End with a GO / REVISE / BLOCK verdict.

PRD CONTENT:
<prd>
{PRD_CONTENT}
</prd>
```

#### Agent 2: IMPLEMENTER (Sonnet)
```
subagent_type: general
model: sonnet

You are a senior full-stack developer reviewing a PRD for implementation feasibility.

Review this PRD for:
1. IMPLEMENTATION FEASIBILITY — Can each criterion actually be built as
   described? Are there technical impossibilities or unrealistic expectations?
2. EFFORT ESTIMATION — Flag any criterion that looks like it's hiding
   2+ days of work behind a simple sentence
3. TESTING GAPS — Missing test scenarios, untestable criteria,
   criteria that are subjective rather than binary PASS/FAIL
4. TECHNICAL DEBT — Shortcuts that will create maintenance burden,
   missing migration paths, hardcoded values

For each issue found:
- Rate: BLOCKER / CONCERN / SUGGESTION
- Quote the specific criterion or section
- Suggest a concrete alternative

End with an effort estimate (T-shirt size: S/M/L/XL) and confidence level.

PRD CONTENT:
<prd>
{PRD_CONTENT}
</prd>
```

#### Agent 3: CLARITY AUDITOR (Haiku)
```
subagent_type: general
model: haiku

You are a QA lead reviewing a PRD for clarity and completeness.

Review this PRD for:
1. AMBIGUOUS CRITERIA — Any acceptance criterion that two developers
   could interpret differently
2. MISSING ACCEPTANCE CRITERIA — Obvious behaviors not covered
   (error states, edge cases, empty states, permissions)
3. CONTRADICTIONS — Criteria that conflict with each other
4. UNDEFINED TERMS — Jargon, acronyms, or references not explained
5. MISSING EXAMPLES — Complex criteria without concrete examples
   of expected input/output

For each issue:
- Quote the ambiguous text
- Show two possible interpretations
- Suggest a rewrite that eliminates ambiguity

Be concise. Focus on what's unclear, not what's good.

PRD CONTENT:
<prd>
{PRD_CONTENT}
</prd>
```

#### Agent 4: CODE REVIEWER (Kimi K2.5 via Gateway)

This agent uses the LLM gateway CLI to route to Kimi K2.5.

```
subagent_type: Bash

Run this command to send the PRD to Kimi K2.5 for code feasibility review.

First, write the PRD content to a temp file, then call the gateway:

1. Write the PRD to /tmp/prd_roundtable_input.md
2. Run:
   source /Users/brianross/FFagents26/.env && \
   export ANTHROPIC_API_KEY OPENAI_API_KEY KIMI_API_KEY && \
   cd /Users/brianross/llm-gateway && \
   python3 cli.py prompt "$(cat /tmp/prd_roundtable_input.md)" \
     --model kimi --max-tokens 4096 --task code

If the PRD is too long for a CLI argument (>100K chars), use the gateway
Python API directly instead:

   source /Users/brianross/FFagents26/.env && \
   export ANTHROPIC_API_KEY OPENAI_API_KEY KIMI_API_KEY && \
   cd /Users/brianross/llm-gateway && \
   python3 -c "
from llm_gateway import LLMGateway, GatewayConfig, LLMRequest
from pathlib import Path

prd = Path('/tmp/prd_roundtable_input.md').read_text()
config = GatewayConfig.from_env()
gw = LLMGateway(config)

system = '''You are a senior developer specializing in Python, TypeScript, and
infrastructure code. Review this PRD purely from a code implementation angle.

Review for:
1. CODE FEASIBILITY — Can each feature be implemented with the specified
   tech stack? Are there library limitations or API constraints?
2. DATA MODEL GAPS — Missing fields, unclear schemas, type ambiguities
3. API DESIGN — Missing endpoints, unclear request/response shapes,
   missing error codes
4. PERFORMANCE CONCERNS — N+1 queries, unbounded loops, missing pagination,
   large payload risks
5. INTEGRATION RISKS — Third-party API rate limits, auth complexity,
   webhook reliability

For each issue:
- Quote the relevant PRD section
- Explain the code-level problem
- Suggest a fix with a brief code sketch if helpful

End with a list of the top 3 implementation risks.'''

req = LLMRequest(
    prompt=prd,
    system_prompt=system,
    task_type='code',
    model_override='kimi-k2.5',
    max_tokens=4096,
    temperature=0,  # Must be 0 for gateway cache to work
)
resp = gw.complete(req)
print(f'Model: {resp.model} | Cost: \${resp.cost_usd:.4f} | Tokens: {resp.input_tokens}/{resp.output_tokens}')
print('---')
print(resp.content)
"

Return the full response.
```

**IMPORTANT:** For Agent 4, prefer the Python API approach (second option) as it handles
long PRDs reliably. Write the PRD to `/tmp/prd_roundtable_input.md` first, then run
the Python script.

#### Agent 5: PLATFORM ASSESSOR (Codex perspective, via Sonnet)
```
subagent_type: general
model: sonnet

You are an OpenAI Codex product architect reviewing this PRD from the perspective of:
"Would an alternative platform (Codex, Devin, or similar) be a better fit?"

Review for:
1. PLATFORM FIT — Is the proposed tool the right one for this use case?
   Compare against alternatives (Codex for code tasks, Devin for SWE,
   n8n/Make for no-code automation, custom-built for full control).
2. SECURITY MODEL COMPARISON — Cloud sandbox vs local sandbox vs hybrid.
   Which approach best fits the data sovereignty requirements?
3. HYBRID ARCHITECTURE — Could multiple tools each handle their
   strengths? (e.g., Codex for code gen, OpenClaw for runtime automation)
4. COST-BENEFIT — Compare pricing models and total cost of ownership.
5. TOP RECOMMENDATION — Use the proposed tool, an alternative, or a hybrid?

Provide specific, actionable recommendations.

PRD CONTENT:
<prd>
{PRD_CONTENT}
</prd>
```

### Step 4: Synthesize Consensus Report

After all 5 agents complete, produce this report:

```markdown
# PRD ROUNDTABLE REPORT
**PRD:** {title}
**Date:** {date}
**Models:** Opus (architect), Sonnet (implementer), Haiku (clarity), Kimi K2.5 (code), Sonnet (platform/Codex)

## Verdict Summary
| Reviewer     | Model    | Verdict     | Top Issue                    |
|-------------|----------|-------------|------------------------------|
| Architect   | Opus     | GO/REVISE   | {one-line summary}           |
| Implementer | Sonnet   | S/M/L/XL    | {one-line summary}           |
| Clarity     | Haiku    | {N issues}  | {one-line summary}           |
| Code        | Kimi 2.5 | {N risks}   | {one-line summary}           |
| Platform    | Sonnet   | FIT/HYBRID  | {one-line summary}           |

## Consensus Issues (2+ models flagged)
{Issues that appeared in multiple reviews, ranked by severity}

1. **{Issue title}** — CRITICAL
   - Architect: {their take}
   - Implementer: {their take}
   - Suggested fix: {merged recommendation}

2. ...

## Conflicts (models disagree)
{Cases where reviewers gave contradictory advice}

## Unique Insights (single model only)
{Valuable issues only one reviewer caught}

## Recommended PRD Changes
{Numbered list of specific edits to make, in priority order}

## Cost
| Model    | Tokens (in/out) | Cost    |
|----------|----------------|---------|
| Opus     | —              | —       |
| Sonnet   | —              | —       |
| Haiku    | —              | —       |
| Kimi 2.5 | {from output}  | {cost}  |
| **Total**| —              | **$X.XX** |
```

### Step 5: Ask Next Steps

Use AskUserQuestion:
- **Apply changes** — Update the PRD with recommended changes
- **Deep dive** — Expand on a specific issue with the relevant model
- **Re-run** — Run again after edits to verify fixes
- **Ship as-is** — Accept the PRD without changes

## Rules

1. **All 5 agents run in parallel** — never sequential
2. **Full PRD content** goes to every agent — no summarizing
3. **No fabrication** — if a model's response is empty or errors, report that honestly
4. **Cost tracking** — always show the Kimi gateway cost from the CLI output
5. **Opus subagent costs** are covered by Claude Code subscription, note this in the cost table
6. **Keep the synthesis sharp** — deduplicate, don't just concatenate 5 reviews
7. If any agent returns BLOCK/CRITICAL, highlight it prominently at the top
8. **Agent 5 (Platform)** provides alternative tool comparison — always include a decision matrix

## Shortcut Mode

If user says `/prd-roundtable quick`, run only Opus + Haiku (skip Sonnet and Kimi)
for a faster, cheaper review. Follow the same report format but with 2 columns.

## Example Invocations

```
/prd-roundtable                          # Asks for PRD source
/prd-roundtable PRDs/sprint-8.md         # Local file
/prd-roundtable https://notion.so/...    # Notion page
/prd-roundtable quick PRDs/sprint-8.md   # Fast mode (Opus + Haiku only)
```
