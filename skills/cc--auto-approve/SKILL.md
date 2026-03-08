# Auto-Approve: Pre-flight Permission Batch

## Trigger
User says: `/auto-approve` (typically after `/simplify` has batched tasks)

## Purpose
Enter plan mode, scan all planned work, then call `ExitPlanMode` with comprehensive `allowedPrompts` so the user approves ONCE and walks away while coding completes.

## Workflow

### 1. Enter Plan Mode
Call `EnterPlanMode` if not already in plan mode.

### 2. Scan Planned Work
Read the task list (or conversation context if no task list) and identify every category of tool usage needed.

### 3. Write Plan
Write a brief plan to the plan file listing:
- Files to edit/create
- Commands to run
- External services to call

### 4. Exit with Full Permissions
Call `ExitPlanMode` with this standard permission bundle (trim any categories not needed):

```json
{
  "allowedPrompts": [
    {"tool": "Bash", "prompt": "run tests with pytest or python -m pytest"},
    {"tool": "Bash", "prompt": "run Python scripts and modules"},
    {"tool": "Bash", "prompt": "install dependencies with pip or pip3"},
    {"tool": "Bash", "prompt": "git add, commit, status, diff, log, branch, checkout, stash"},
    {"tool": "Bash", "prompt": "file operations: mv, cp, rm, mkdir, touch, chmod, ln"},
    {"tool": "Bash", "prompt": "search and inspect: grep, find, ls, tree, wc, du, cat, head, tail, sort"},
    {"tool": "Bash", "prompt": "run node, npm, npx commands"},
    {"tool": "Bash", "prompt": "run curl for API calls"},
    {"tool": "Bash", "prompt": "run sed, awk, tr for text processing"},
    {"tool": "Bash", "prompt": "run docker and docker-compose commands"},
    {"tool": "Bash", "prompt": "run ssh, scp, rsync for remote operations"},
    {"tool": "Bash", "prompt": "kill or pkill processes"},
    {"tool": "Bash", "prompt": "run tmux commands"},
    {"tool": "Bash", "prompt": "run bash or shell scripts"}
  ]
}
```

### 5. Execute All Tasks
After user approves, work through every task without stopping. Mark tasks complete as you go.

## Differences from /auto
| | `/auto` | `/auto-approve` |
|---|---|---|
| Mechanism | `--dangerously-skip-permissions` flag | `ExitPlanMode` allowedPrompts |
| User sees | Nothing (all skipped) | One consolidated approval screen |
| Safety | Skips all checks | User reviews permission categories |
| Use case | Known-safe solo work | Walk-away sessions with audit trail |

## Safety Rails
- **Never include** `git push --force`, `rm -rf /`, or destructive remote ops in blanket permissions
- **Git push** requires explicit inclusion — omitted by default
- **Secrets rule** still applies — never echo keys
- **Shared-state actions** (PR create, Slack, email) still confirm individually unless user explicitly adds them
