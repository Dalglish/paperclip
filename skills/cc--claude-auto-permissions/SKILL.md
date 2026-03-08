---
name: claude-auto-permissions
description: Set up and maintain Claude Code permission auto-approval rules to eliminate constant bash permission prompts. Use this skill whenever the user mentions permission approvals, bash prompts being annoying, wanting to stop hitting Enter, auto-approve commands, Claude Code permissions, settings.json configuration, or wants to reduce interruptions during coding sessions. Also trigger when the user says "set up permissions", "fix permissions", "stop asking me", "auto-approve", or "kill the approvals".
---

# Claude Code Auto-Permissions

Eliminate the permission bottleneck. Configure Claude Code to auto-approve safe operations while keeping dangerous ones manual.

## The Problem

By default Claude Code prompts for approval on every bash command, file edit, and tool use. For an active coding session that's 200+ interruptions per day. This skill configures declarative rules that auto-approve safe operations.

## Setup Script

Run on any Mac with Claude Code installed:

```bash
bash claude-permissions-setup.sh
```

Or create `~/.claude/settings.json` manually with the rules below.

After setup:
1. `source ~/.zshrc`
2. `cc` (starts Claude Code in tmux with Remote Control)
3. `/config` → Enable Remote Control for all sessions → true

## Permission Rules Reference

### How Rules Work

- **Deny always wins** over allow — if both match, the command is blocked
- `Bash(npm *)` matches any command starting with `npm` followed by a space
- `Bash(ls *)` matches `ls -la` but NOT `lsof` (space before * enforces word boundary)
- `Bash(ls*)` without space matches both `ls -la` and `lsof`
- Claude understands shell operators — `Bash(safe-cmd *)` won't match `safe-cmd && malicious-cmd`

### Default Allow List (Safe Operations)

**Files & Navigation:** Edit, MultiEdit, Read, ls, cat, head, tail, find, grep, rg, mkdir, cp, mv, touch, pwd, wc, sort, diff, sed, awk, stat, file, du, df, basename, dirname, realpath

**Git (local only):** add, commit, status, diff, log, show, checkout, switch, branch, worktree, stash, merge, rebase, rev-parse, remote -v

**Build & Runtime:** npm, npx, node, python3, pip install, make, docker compose, docker build, docker ps, docker logs

**Info:** --version, --help, env, printenv, date, which

### Default Deny List (Require Manual Approval)

**Destructive:** rm -rf /, rm -rf ~, sudo, shutdown, reboot, kill, killall

**Network / Exfiltration:** curl, wget, ssh, scp, rsync, nc, ncat

**Remote State:** git push (all forms)

**Container Execution:** docker run, docker exec (can escape sandboxing)

### Adding Project-Specific Rules

Edit `~/.claude/settings.json` and add to the allow array:

```json
"Bash(pytest *)",
"Bash(cargo *)",
"Bash(go *)",
"Bash(pnpm *)",
"Bash(yarn *)",
"Bash(deno *)",
"Bash(bun *)",
"Bash(dotnet *)",
"Bash(swift *)",
"Bash(ruby *)",
"Bash(bundle *)"
```

Restart Claude Code after editing settings.

### Diagnosing Remaining Prompts

If Claude still prompts for something that should be auto-approved:

1. Note the exact command it's asking about
2. Check it's not matching a deny rule (deny wins)
3. Add a narrow allow entry — prefer specific patterns over wildcards
4. Restart Claude Code

Common missed ones:
- `Bash(chmod *)` — making scripts executable
- `Bash(ln *)` — symlinks
- `Bash(tar *)` — archives
- `Bash(unzip *)` — extraction
- `Bash(jq *)` — JSON processing

### Session Modes (Shift+Tab)

Beyond settings.json, you can toggle modes within a session:

- **normal-mode** — standard permission prompts (default)
- **auto-accept edit on** — auto-accept ALL operations for this session only (use for trusted sprints)
- **plan mode on** — read-only, no modifications (use for research/exploration)

Press Shift+Tab to cycle through these in the Claude Code terminal.

### Remote Control

With Remote Control enabled, you approve the remaining deny-list operations from your phone. The flow:

1. Claude runs into a `git push` → prompts
2. Your phone shows the prompt in the Claude app
3. You tap approve or voice-dictate "yes, push it"
4. Claude continues

This means you can walk away and only come back (virtually, via phone) for genuinely risky operations.

## Security Notes

- Never add `Bash(*)` to allow — this bypasses all checks
- Keep network tools (curl, wget) in deny to prevent data exfiltration
- Keep git push in deny so you review before code leaves your machine
- Keep sudo in deny — Claude should never need root
- If running in a sandboxed VM/container, you can use `--dangerously-skip-permissions` instead, but this doesn't work with Remote Control currently
