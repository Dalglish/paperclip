# Quality Gate — Parallel 4-Agent Review

Spawn 4 independent review agents to audit the current working tree. Only unanimous PASS triggers a commit recommendation.

## Trigger
Use after completing implementation, before committing. Replaces serial review cycles.

## Agents

### 1. TEST_AGENT
```
Run `pytest -x --tb=short` on the full test suite.
Report: total pass/fail count, any new warnings, any skipped tests.
Flag if test count decreased from baseline.
PASS criteria: Zero failures, no test count regression.
```

### 2. STYLE_AGENT
```
Check all modified Python files (git diff --name-only) for:
- Unused imports
- Hardcoded values that should be constants
- Missing type hints on new function signatures
- Inconsistent naming (mixedCase vs snake_case)
- Print statements that should be logging
Report file-by-file findings.
PASS criteria: No blocking issues (unused imports and missing types are warnings, not blocks).
```

### 3. REFERENCE_AGENT
```
Find every literature citation, URL, or external data reference in modified files.
For each: verify it exists and is correctly attributed.
Flag any that cannot be independently verified as [CITATION NEEDED].
Check for hardcoded API keys, tokens, or credentials.
PASS criteria: No fabricated references, no exposed credentials.
```

### 4. REGRESSION_AGENT
```
Run `git diff main...HEAD` (or appropriate base branch).
Identify:
- Any removed functionality
- Changed function signatures (kwargs added/removed/renamed)
- Backward-incompatible changes to public APIs
- Any callers NOT updated after a rename
PASS criteria: No unaddressed backward-incompatible changes.
```

## Execution
Launch all 4 as parallel Task subagents. When all complete, synthesize:

```
QUALITY GATE REPORT
===================
TEST_AGENT:       PASS/FAIL — [summary]
STYLE_AGENT:      PASS/FAIL — [summary]
REFERENCE_AGENT:  PASS/FAIL — [summary]
REGRESSION_AGENT: PASS/FAIL — [summary]

VERDICT: PASS / FAIL
Blocking issues: [list or "None"]
```

## Rules
- Do NOT commit anything — report only.
- If FAIL, list specific fixes needed before re-running the gate.
- User decides whether to fix and re-run or ship with known issues.
