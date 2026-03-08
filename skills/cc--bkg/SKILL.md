# /bkg — Autonomous Background Coding

Execute a sprint or task autonomously using the Boris → Karpathy → Ralph cycle with test-gated checkpoints. Minimal user interruption — surface only at milestones or when blocked after 2 failed approaches.

## Invocation
```
/bkg <task description or sprint number>
```
Examples:
- `/bkg Sprint 42` — execute sprint 42 from the repo PRD
- `/bkg add energy solver clamping to all MOC boundaries` — execute a specific task
- `/bkg fix all failing tests in gastrans module` — fix-focused mode

## Phase 1: LOAD (do not write code yet)

1. **Locate the work**
   - Sprint plans: check repo `PRDs/`, `SPRINT_STATE.md`, or `git log --oneline -20`
   - Specific task: parse the user's description
   - **Never search local filesystem outside the repo for sprint plans**
   - **Extract PRD criteria as a checklist** — these are the ONLY things you build

2. **Consider isolation** (use `/git-worktrees` skill if any apply)
   - Active uncommitted work on current branch
   - Sprint branch diverges significantly from main
   - Risky refactor that could break existing tests
   - Parallel work needed (e.g., big-data sprint while SEO branch active)
   - If none apply, stay on current branch — don't over-engineer

3. **Record test baseline**
   ```bash
   pytest --co -q 2>/dev/null | tail -1
   ```

4. **Identify affected files**
   - Read the plan/task fully
   - List every file that will be touched
   - Check existing functions: `grep -r "def function_name"` before adding new ones

5. **Quick health check** (if external APIs involved)
   - Notion: test a read operation
   - GitHub: verify branch and remote
   - Skip if pure local coding task

## Phase 2: BUILD (implement track by track)

For each track/subtask:

1. **Implement** the change
2. **Grep for old names** if any renames were made
3. **Run tests immediately:**
   ```bash
   pytest --tb=short -q 2>&1 | tail -20
   ```
4. **If tests pass:** commit the track with a descriptive message, move to next track
5. **If tests fail:**
   - Analyze the failure (read actual traceback, don't guess)
   - Fix and re-run (max 3 attempts per track)
   - If still failing after 3 attempts: revert track, note it as DEFERRED, continue

**Rules during BUILD:**
- Never fabricate citations or validation data — use `[CITATION NEEDED]`
- Never make backward-incompatible kwarg changes without updating all callers
- Never create new agents/skills if existing ones cover the need
- Verify imports actually resolve by running, not just reading
- Test count must never decrease

## Phase 3: BORIS REVIEW (self-audit)

After all tracks complete, run a Boris-style review:

1. **PRD drift check:** Re-read the PRD criteria from Phase 1. For each:
   - Did I build exactly what was specified? (not more, not less)
   - Did I add anything NOT in the PRD? If yes — **delete it**. Gold-plating is a bug.
   - Did I skip any criterion? If yes — go back and implement it before proceeding.
   - Are there files in `git diff --name-only` that aren't related to any PRD criterion? Investigate.
2. **Edge cases:** What breaks with zero input, negative values, empty arrays, None?
3. **PR rejection:** What would a staff engineer reject? Naming? Missing guards? Hardcoded values?
4. **Untested assumptions:** What did I assume works but never verified?
5. **Regression check:** `git diff` — any removed functionality? Changed signatures without updated callers?
6. **Scope containment:** If working in a worktree, confirm changes are ONLY in the worktree branch. If on main branch, confirm no unrelated files were modified.

If Boris finds issues → fix them (this is the Ralph loop, max 3 iterations).

## Phase 4: REPORT (surface to user)

```
AUTONOMOUS SESSION COMPLETE
============================
Task: [description]
Tracks: [N completed] / [N total] | [N deferred]
Tests: [before] → [after] (+N new)
Commits: [list with hashes]
Boris review: [PASS / N issues fixed]

Deferred items (if any):
- [item]: [reason]

Handover for next session (if incomplete):
[paste-ready prompt]
```

## Guardrails

- **STOP and ask user** if:
  - You've tried 2 different approaches and both failed
  - The task requires deleting >50 lines of someone else's code
  - You discover uncommitted work that might conflict
  - A test that was passing is now failing and you can't figure out why

- **Never:**
  - Force push
  - Delete branches
  - Skip pre-commit hooks
  - Push to remote without explicit permission
  - Guess at API keys, tokens, or credentials

## Session Scope
- ONE task or sprint per `/bkg` invocation
- If work remains, write a handover prompt — don't start the next sprint
- Target: fully_achieved, not mostly_achieved
