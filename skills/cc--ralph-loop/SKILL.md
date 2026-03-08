# Ralph Loop — 6-Point Validation Protocol (Shared Fragment)

Loaded by all swarm skills as the final validation gate before output release.
Runs 6 checks sequentially. On failure: fix, restart from check 1. Max 3 iterations.

## Trigger

This skill is invoked automatically as a shared fragment — not directly by the user.
Other skills load it via: `Load ralph-loop/SKILL.md for output validation.`
The `!loop` command shows current Ralph status during a sprint.

## Dependencies

- **guardrails/SKILL.md** — Checks 2 (Scope) and 3 (Terminology) delegate to the Guardrail Registry
- **Notion Knowledge Base DB:** `3058fb7c-51ac-812a-8517-fb3604ca0627` — Check 4 (KB Alignment)
- **Qdrant Vector Store:** `QDRANT_HOST=152.42.149.145:6333` — Check 4 (KB Alignment, semantic search)
- **Notion Verification Sources DB:** `27a089ac-b62f-4d94-bd5d-230aec9f1887` — Check 5 (Correlation Validity)

## The 6 Checks

### Check 1: Response Format

Verify the output has expected structure and minimum content.

**Pass criteria:**
- Content is non-empty and not an error message
- Word count >= 20
- Does not start with "Error" or "I'm sorry, I cannot"

**Auto-fixable:** NO — if format fails, regenerate the response.

### Check 2: Scope Boundaries

Verify output respects what FluidFlow can and cannot do. Uses Guardrail Registry (Scope category).

**Pass criteria:**
- No out-of-scope term appears as a FluidFlow capability claim
- If out-of-scope term appears, it MUST have limitation context within 100 chars:
  "cannot", "can't", "not supported", "out of scope", "limitation", "not available"

**Out-of-scope terms** (from `RalphConfig.OUT_OF_SCOPE`):
3D CFD, CFD analysis, turbulence model, k-epsilon, LES, DNS, Reynolds stress,
velocity profile within, particle tracking, Lagrangian, FSI, fluid-structure,
combustion, chemical reaction, viscoelastic, thixotropic, open channel,
free surface, transient analysis, water hammer, surge analysis, pump trip

**In-scope capabilities** (from `RalphConfig.IN_SCOPE`):
steady-state, pipe network, pressure drop, Darcy-Weisbach, pump sizing, NPSH,
control valve, Cv, two-phase, slurry, non-Newtonian, friction factor

**Auto-fix:** Append scope disclaimer:
`"Note: {term} is outside FluidFlow's scope (steady-state pipe network analysis only)."`
For transient-related terms, add: `"FlowDesigner (coming soon) will address transient analysis."`

**Query Guardrail Registry for Scope rules:**
```
mcp__notion__API-query-data-source
  data_source_id: "3058fb7c-51ac-8122-8a7f-c80ece0615d7"
  filter: {"property": "Category", "select": {"equals": "Scope"}}
```

### Check 3: Terminology

Verify correct FluidFlow terminology is used. Uses Guardrail Registry (Terminology category).

**Pass criteria:**
- No incorrect term variant found in output
- Correlation names are correctly hyphenated

**Terminology map** (from `RalphConfig.TERMINOLOGY`):

| Correct | Incorrect Variants |
|---------|--------------------|
| pressure drop | pressure loss |
| friction factor | friction coefficient |
| settling slurry | settling solids |
| non-Newtonian | non Newtonian, nonNewtonian, non newtonian |
| Darcy-Weisbach | Darcy Weisbach, darcy weisbach |
| Colebrook-White | Colebrook White, colebrook white |
| Lockhart-Martinelli | Lockhart Martinelli, lockhart martinelli |
| Beggs-Brill | Beggs Brill, beggs brill |
| Herschel-Bulkley | Herschel Bulkley, herschel bulkley |
| Joule-Thompson | Joule Thompson, joule thompson |
| NPSHa | NPSH_a, NPSH-a |
| NPSHr | NPSH_r, NPSH-r |
| API RP 14E | API-RP-14E, API 14E, API-14E |

**Auto-fix:** YES — direct string replacement of incorrect term with correct term.

**Query Guardrail Registry for Terminology rules:**
```
mcp__notion__API-query-data-source
  data_source_id: "3058fb7c-51ac-8122-8a7f-c80ece0615d7"
  filter: {"property": "Category", "select": {"equals": "Terminology"}}
```

### Check 4: KB Alignment

Verify claims align with the Knowledge Base. Cross-reference against Notion KB and Qdrant vectors.

**Pass criteria:**
- No false capability claims (e.g., "FluidFlow can do transient analysis")
- Strong claims ("always use", "never use", "the only way", "guaranteed to") flagged for human review
- Equation references exist in KB
- Numerical values within KB-documented ranges (e.g., Durand Cv < 40%)
- Critical Reynolds number claims within 2000-4000 range

**KB lookup:**
```
mcp__notion__API-query-data-source
  data_source_id: "3058fb7c-51ac-812a-8517-fb3604ca0627"
  filter: {"property": "Topic", "select": {"equals": "{relevant_topic}"}}
```

Topic values: Slurry, Water Hammer, Pneumatic, Heat Transfer, Valves, Pumps, General

**Qdrant semantic search** (for deeper KB verification):
Query the vector store at `152.42.149.145:6333` with the content's key claims.
Minimum similarity score: 0.35. Retrieve top 5 chunks.

**Auto-fix:** NO — KB misalignment requires regeneration with correction context.

### Check 5: Correlation Validity

Verify that when correlations are referenced, their validity limits are stated.

**Pass criteria:**
- Each referenced correlation has validity terms mentioned within 300 chars context

**Correlation validity requirements** (from `RalphConfig.CORRELATION_VALIDITY`):

| Correlation | Must mention at least one of |
|-------------|------------------------------|
| Durand | Cv < 40%, d50, micron, particle, concentration |
| Wilson | sand, gravel, SG, specific gravity, coarse |
| Lockhart-Martinelli | horizontal, separated flow, not slug, not mist |
| Beggs-Brill | all angles, inclination, oil, gas |
| Power Law | shear rate, not valid at, low shear, high shear |
| Bingham | yield stress, plastic viscosity, constant |
| Herschel-Bulkley | yield stress, consistency, flow index |
| Hazen-Williams | water only, turbulent, 4-12 ft/s |
| API RP 14E | C-factor, C factor, 100, 150, service |

**Topic exclusions** (from `CORRELATION_TOPIC_EXCLUSIONS`):
- API RP 14E: skip for gas flow / sonic / compressible topics
- Herschel-Bulkley, Power Law: skip for gamma / specific heat / adiabatic topics

**Verification Sources lookup:**
```
mcp__notion__API-query-data-source
  data_source_id: "27a089ac-b62f-4d94-bd5d-230aec9f1887"
```

**Auto-fix:** NO — missing validity limits require regeneration.

### Check 6: Technical Accuracy

Verify numerical values and equations are plausible.

**Pass criteria:**
- Velocities: <= 100 m/s for liquid flow, <= 600 m/s for sonic/compressible context
- Friction factors: 0.001 to 0.1 (Darcy)
- Solids concentration (Cv): <= 60%
- No implausible combinations

**Context-aware thresholds:**
Sonic velocity context detected by keywords: "sonic", "speed of sound", "mach",
"choked", "compressible", "gas flow", "acoustic", "sound speed"
When detected: velocity threshold raised to 600 m/s.

**Auto-fix:** NO — implausible values require regeneration.

## Iteration Protocol

```
MAX_ITERATIONS = 3

for iteration in 1..MAX_ITERATIONS:
    run all 6 checks sequentially

    if ALL checks pass:
        status = PASSED (or FIXED if auto-fixes were applied)
        confidence = HIGH
        STOP → release output

    if any check FAILED:
        collect failed checks with issues

        if iteration < MAX_ITERATIONS:
            build correction context from failed checks
            regenerate response with correction instructions
            restart from check 1

        if iteration == MAX_ITERATIONS:
            status = NEEDS_HUMAN_REVIEW
            confidence = LOW
            STOP → escalate to human

Convergence rules (from agent_swarm.py):
- If fix count not improving (same or more than previous iteration): accept result
- If oscillating pattern detected over 3 iterations: accept result
- If down to <= 3 minor fixes after 3+ iterations: accept result
```

### Correction Context Format

When regenerating after failure, build this prompt for the agent:

```
CORRECTION REQUIRED - Previous response had validation issues:

- {Check Name}:
  * {issue description}
  * {issue description}
  (Auto-fixes attempted: {list})

Please regenerate your response addressing these issues.

ORIGINAL QUERY: {original query}
```

## Ralph Score

The Ralph Score is the count of checks passed out of 6.

```
Ralph Score = {checks_passed} / 6
```

| Score | Confidence | Action |
|-------|------------|--------|
| 6/6 | HIGH | Release output |
| 4-5/6 | MEDIUM | Release with human review items noted |
| 0-3/6 | LOW | Escalate to human, do not release |

If any human review items were flagged (strong claims, unverified equations, edge-case values),
confidence drops to MEDIUM even if all 6 checks pass.

## Output: Validation Report

```
## Ralph Validation Report

**Status:** PASSED | FIXED | NEEDS_HUMAN_REVIEW
**Confidence:** HIGH | MEDIUM | LOW
**Iterations:** {n}/{MAX_ITERATIONS}
**Ralph Score:** {passed}/6

### Check Results

| # | Check | Status | Issues |
|---|-------|--------|--------|
| 1 | Response Format | PASS/FAIL | {detail} |
| 2 | Scope Boundaries | PASS/FAIL | {detail} |
| 3 | Terminology | PASS/FAIL | {detail} |
| 4 | KB Alignment | PASS/FAIL | {detail} |
| 5 | Correlation Validity | PASS/FAIL | {detail} |
| 6 | Technical Accuracy | PASS/FAIL | {detail} |

### Auto-Fixes Applied
- {list of terminology replacements, scope disclaimers}

### Items for Human Review
- [ ] {unverified claim or edge-case value}
```

## Integration Points

- **Swarm Pipeline Stage 7:** Final stage before output release (after Draft Generator)
- **Course Generation:** Used by course-gen skill for training content validation
- **Sprint Cycle:** `!loop` command shows Ralph status; `!sprint` triggers full Boris > Karpathy > Ralph cycle
- **guardrails/SKILL.md:** Checks 2 and 3 load rules from the shared Guardrail Registry

## Source Reference

Logic extracted from:
- `src/ralph_loop.py` — `RalphLoop` class, `_run_validation_loop()`, checks 1-6
- `src/agent_swarm.py` — `RalphLoop` pipeline stage, `VALIDATION_CHECKS` constant
- `src/validation_strategies.py` — `RealRalphLoopValidator`, `ValidationContext`
