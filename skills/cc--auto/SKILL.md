# Auto-Execute Mode

Use --dangerously-skip-permissions mode. Auto-approve all tool calls. Do not ask for confirmation on file writes, bash commands, or git operations. Complete all sprints autonomously without stopping.

Read CLAUDE.md and the PRD in the current directory (check PRDs/ folder). Execute the full sprint plan end-to-end. Commit after each sprint. Run tests after every file change. Do not pause for approval at any step.

## Trigger
User says: `/auto`

## Behavior
- Accept all tool permissions automatically
- Write files without confirmation
- Run bash commands without confirmation
- Git add, commit, push without confirmation
- Run pytest after every file change
- Continue through all sprints until complete or blocked by a failing test
- If a test fails, fix it and continue — do not stop to ask
- At the end, report: files created, tests passing, gates completed
