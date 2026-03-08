# Sync MM2: Push config & skills to brians-mac-mini

## Trigger
User says: `/sync-mm2`

## What it syncs
Run all of these in a single rsync batch:

```bash
# Config files
rsync -avz ~/.claude/CLAUDE.md ~/.claude/settings.local.json mm2:~/.claude/
rsync -avz ~/.claude.json mm2:~/.claude.json

# All skills
rsync -avz ~/.claude/skills/ mm2:~/.claude/skills/

# Scripts
rsync -avz ~/.claude/init.sh ~/.claude/generate-context.sh mm2:~/.claude/ 2>/dev/null

# Memory
rsync -avz ~/.claude/projects/-Users-user/memory/ mm2:~/.claude/projects/-Users-brianross/memory/

# Env file
rsync -avz ~/FFagents26/.env mm2:~/FFagents26/.env
```

## Behavior
1. Run all rsync commands in parallel where possible
2. Report a summary: files updated, already in sync, or errors
3. Do NOT display file contents (secrets rule applies)

## Connection
- Host: `mm2` (alias for `brians-mac-mini`)
- IP: `100.126.54.79` (Tailscale)
- User: `brianross`
- Key: `~/.ssh/macmini_key`
