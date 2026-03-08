# Sync MM1: Push config & skills to users-mac-mini

## Trigger
User says: `/sync-mm1`

## What it syncs
Run all of these in a single rsync batch:

```bash
# Config files
rsync -avz ~/.claude/CLAUDE.md ~/.claude/settings.local.json mm1:~/.claude/
rsync -avz ~/.claude.json mm1:~/.claude.json

# All skills
rsync -avz ~/.claude/skills/ mm1:~/.claude/skills/

# Scripts
rsync -avz ~/.claude/init.sh ~/.claude/generate-context.sh mm1:~/.claude/ 2>/dev/null

# Memory
rsync -avz ~/.claude/projects/-Users-brianross/memory/ mm1:~/.claude/projects/-Users-user/memory/

# Env file
rsync -avz ~/FFagents26/.env mm1:~/FFagents26/.env
```

## Behavior
1. Run all rsync commands in parallel where possible
2. Report a summary: files updated, already in sync, or errors
3. Do NOT display file contents (secrets rule applies)

## Connection
- Host: `mm1` (alias for `users-mac-mini`)
- IP: `100.82.243.28` (Tailscale)
- User: `user`
- Key: `~/.ssh/macmini_key`
