# Sprint Start — Session Opener

Load conventions, locate sprint PRD, set test baseline, and validate environment before any implementation begins.

## Trigger
Use at the start of any sprint implementation session.

## Steps

### 1. Locate the Sprint Plan
- Check the **current repo's** `PRDs/`, `SPRINT_STATE.md`, or recent commits for the sprint definition.
- Run `git log --oneline -20` to find recent sprint-related commits.
- **Do NOT search the local filesystem outside the repo.**
- If no sprint plan found in repo, ask the user — do not guess.

### 2. Record Test Baseline
```bash
pytest --co -q 2>/dev/null | tail -1
```
Store this count. It must not decrease by end of session.

### 3. Load Conventions
Remind yourself:
- **Reuse existing skills** in `.claude/skills/` — never create new ones.
- **Reuse existing functions** — `grep -r "def function_name"` before adding new ones.
- After any rename/refactor, grep for the old name across the entire codebase.
- Never fabricate citations — use `[CITATION NEEDED]` if source unavailable.
- Verification = run pytest and paste actual output. Never self-validate.

### 4. Validate Environment (if external APIs needed)
- If sprint involves Notion: test with a read operation first.
- If sprint involves GitHub push: verify branch and remote tracking.
- If sprint involves external APIs: confirm keys are set in `.env`.
- Report any blockers before starting implementation.

### 5. Read the Sprint Plan
Read the full PRD/sprint plan before writing any code. Identify:
- All affected files
- Track-by-track breakdown
- Acceptance criteria (binary PASS/FAIL)

### 6. Confirm and Go
Report to user:
```
Sprint [X] loaded.
Test baseline: [N] tests
Tracks: [list]
Environment: [OK / blockers]
Ready to implement.
```
Wait for user confirmation before starting.

## Rules
- ONE sprint per session. Do NOT start the next sprint.
- After each track: run pytest, report pass/fail, commit if green.
- End of session: report before/after test counts, files changed, tracks completed.
- If work remains, write a handover prompt the user can paste into the next session.
