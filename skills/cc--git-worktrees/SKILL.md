---
name: git-worktrees
version: 2.0.0
description: |
  Isolated git worktrees for parallel branch work and swarm execution.
  Creates workspaces, installs deps, verifies baselines. Integrates with
  Karpathy swarm for parallel agent tracks in separate worktrees.
  Use for sprint branches, parallel features, or swarm-mode parallel execution.
  Adapted from obra/superpowers (MIT).
allowed-tools:
  - Bash
  - Read
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---

# Git Worktrees — Isolated Workspaces + Parallel Swarm Execution

Two modes:
1. **Single worktree** — isolated branch for one task
2. **Swarm mode** — multiple worktrees for parallel Karpathy tracks

## Mode 1: Single Worktree

### When to Use
- Sprint branch alongside active work
- Risky refactor without polluting current tree
- Boris/Karpathy cycle in isolation

### Setup

```bash
# 1. Detect context
project_root=$(git rev-parse --show-toplevel 2>/dev/null)
project_name=$(basename "$project_root")
current_branch=$(git branch --show-current)
```

If not in a git repo, stop.

### Location Selection

Check in order:
```bash
ls -d "$project_root/.worktrees" 2>/dev/null     # Preferred
ls -d "$project_root/worktrees" 2>/dev/null       # Alternative
grep -i "worktree" "$project_root/CLAUDE.md" 2>/dev/null
```

If nothing found, ask user:
- **.worktrees/ (Recommended)** — project-local, hidden, gitignored
- **~/worktrees/<project>/** — global location, outside repo

### Safety Check (project-local only)

```bash
git check-ignore -q .worktrees 2>/dev/null
# Exit 0 = safe. Exit 1 = NOT ignored → fix first:
# echo ".worktrees/" >> .gitignore && git add .gitignore && git commit -m "Ignore .worktrees"
```

### Create + Setup

```bash
git worktree add .worktrees/<branch-name> -b <branch-name>
cd .worktrees/<branch-name>

# Python deps
[ -f requirements.txt ] && pip install -r requirements.txt
[ -f pyproject.toml ] && pip install -e .

# Copy env (never commit)
[ -f "$project_root/.env" ] && cp "$project_root/.env" .

# Baseline tests
pytest --tb=short -q 2>&1 | tail -5
```

FluidFlow repos:
- `testing-suite`: PYTHONPATH only, no install
- `FFagents26`: Copy `.env`, pip install if requirements.txt exists
- `ff-sales-pipeline`: pip install -r requirements.txt

### Report

```
Worktree ready:
  Path:     /path/to/.worktrees/<branch-name>
  Branch:   <branch-name>
  Base:     <parent-branch>
  Tests:    N passing, 0 failures
```

---

## Mode 2: Swarm Parallel Execution

### When to Use
- Karpathy swarm with 2+ independent tracks
- Sprint with parallelizable tasks that touch different files
- Any `/bkg` session where tracks can run concurrently

### How It Works

Each parallel track gets its own worktree. Subagents work in separate directories
so there are zero merge conflicts. After all tracks complete, merge sequentially.

```
main branch (untouched)
  ├── .worktrees/track-a/  ← Agent A works here
  ├── .worktrees/track-b/  ← Agent B works here
  └── .worktrees/track-c/  ← Agent C works here
```

### Step 1: Decompose Tasks

From the PRD or sprint plan, identify independent tracks.
Tasks are independent if they touch **different files**.

Example:
```
Track A: gastrans MOC solver (gastrans/*.py)
Track B: valve Cv/Kv calcs (valves/*.py)
Track C: heat exchanger dP (heatx/*.py)
```

If tracks share files → they CANNOT be parallelized. Run sequentially.

### Step 2: Create Worktrees (All at Once)

```bash
project_root=$(git rev-parse --show-toplevel)
base_branch=$(git branch --show-current)

# Create one worktree per track
git worktree add .worktrees/track-a -b sprint-N-track-a
git worktree add .worktrees/track-b -b sprint-N-track-b
git worktree add .worktrees/track-c -b sprint-N-track-c

# Copy .env to each
for wt in .worktrees/track-*; do
  [ -f "$project_root/.env" ] && cp "$project_root/.env" "$wt/"
done
```

### Step 3: Launch Parallel Agents

Use the Task tool to spawn one subagent per track. Each agent gets:
- Its worktree path as working directory
- The specific PRD criteria for its track
- Instructions to commit within its worktree when done

```
Task(subagent_type="Bash", prompt="
  cd /path/to/.worktrees/track-a
  # Implement track A: [PRD criteria]
  # Run tests: pytest track_a_tests/ --tb=short -q
  # Commit: git add -A && git commit -m 'Track A: [description]'
")
```

Launch ALL tracks in parallel (single message, multiple Task calls).

**Agent rules:**
- Work ONLY in your assigned worktree directory
- Do NOT touch files outside your track's scope
- Run tests for YOUR module only (fast feedback)
- Commit when tests pass
- Report: PASS/FAIL + test count + files changed

### Step 4: Opus Quality Gate (After All Tracks Complete)

For each completed track:
```bash
cd .worktrees/track-a
pytest --tb=short -q 2>&1 | tail -5   # Actually run tests
git diff --stat $base_branch           # Check what changed
git log --oneline $base_branch..HEAD   # Review commits
```

Verify:
- [ ] Tests actually pass (don't trust agent claims)
- [ ] Changes are scoped to the track's files only
- [ ] No PRD drift (only built what was specified)

### Step 5: Sequential Merge

Merge tracks one at a time into the base branch. Run full test suite after each merge to catch integration issues.

```bash
cd "$project_root"

# Merge track A
git merge sprint-N-track-a --no-ff -m "Merge track A: [description]"
pytest --tb=short -q 2>&1 | tail -5
# If tests fail → investigate before merging next track

# Merge track B
git merge sprint-N-track-b --no-ff -m "Merge track B: [description]"
pytest --tb=short -q 2>&1 | tail -5

# Merge track C
git merge sprint-N-track-c --no-ff -m "Merge track C: [description]"
pytest --tb=short -q 2>&1 | tail -5
```

**If merge conflicts:** Resolve manually. Conflicts mean the tracks weren't truly independent — note for next sprint.

### Step 6: Cleanup

```bash
# Remove worktrees
git worktree remove .worktrees/track-a
git worktree remove .worktrees/track-b
git worktree remove .worktrees/track-c

# Delete merged branches
git branch -d sprint-N-track-a sprint-N-track-b sprint-N-track-c

# Prune stale refs
git worktree prune
```

### Step 7: Report

```
SWARM COMPLETE
==============
Tracks: 3/3 merged
  Track A: gastrans MOC — 12 files, 47 tests, PASS
  Track B: valve Cv/Kv — 8 files, 31 tests, PASS
  Track C: heatx dP — 6 files, 22 tests, PASS

Integration: Full suite 1,591 tests, 0 failures
Merge conflicts: 0
PRD drift: None detected
```

---

## Autocomplete: Worktree from Branch Name

When the user provides a branch name or sprint reference, skip all prompts and create directly:

```
/git-worktrees sprint-42-big-data
```
→ Creates `.worktrees/sprint-42-big-data`, installs deps, runs baseline, reports ready.

```
/git-worktrees --swarm track-a:gastrans track-b:valves track-c:heatx
```
→ Creates 3 worktrees, reports all ready, waits for agent dispatch.

If just `/git-worktrees` with no args → follow the interactive flow (ask location, ask branch name).

---

## Integration Points

| Skill | How It Uses Worktrees |
|---|---|
| `/bkg` Phase 1 | Checks if isolation needed, creates single worktree |
| `/karpathy-swarm` | Swarm mode — one worktree per parallel track |
| Boris Review Phase 3 | Scope containment check — changes only in worktree branch |
| `/bkg` Phase 4 | Cleanup — merge, remove worktrees, prune |

## Quick Reference

| Situation | Action |
|---|---|
| `.worktrees/` exists | Use it (verify gitignored) |
| Neither dir exists | Ask user preference |
| Dir not gitignored | Add to .gitignore, commit, then proceed |
| Tests fail at baseline | Report, ask to proceed |
| Need .env in worktree | Copy from project root (never commit) |
| Tracks share files | Cannot parallelize — run sequentially |
| Merge conflict | Resolve, note as not-independent for next sprint |
| Done with worktree | `git worktree remove`, delete branch if merged |

## Permission Requirements

Subagents spawned via the Task tool inherit restrictive permissions by default.
For swarm mode to work fully autonomously, the orchestrator must either:
1. Pre-approve Write + Bash for the session before launching agents
2. Or create files and run tests from the main context after agents report their planned changes

If agents get blocked on Write/Bash, fall back to orchestrator-driven execution:
agents explore and report what to build, orchestrator creates files and runs tests.

## Never

- Create project-local worktree without verifying it's gitignored
- Skip baseline test verification
- Let agents work outside their assigned worktree
- Merge without running full test suite
- Force-delete a worktree with uncommitted changes
- Copy credentials into worktree and commit them
- Parallelize tracks that touch the same files
