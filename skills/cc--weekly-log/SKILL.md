# Weekly Log Skill

> Generate a weekly activity summary from Claude Code usage data and push to Notion.

## Trigger
`/weekly-log` — manual invoke only

## Reporting Window
**Friday 23:59 → Friday 22:59** (effectively Saturday 00:00 to Friday 23:59)
- First run: Mar 7, 2026+
- Retroactive runs supported by passing a date argument

## Notion Target
- **Parent page:** `69d65fc11bff4a7ebf810681fe1804ec` (Q1 2026 — Weekly Updates)
- Each run creates a **child page** titled: `Weekly Log — [Mon DD] to [Mon DD], YYYY`

## Data Sources
1. `~/.claude/usage-data/session-meta/*.json` — timestamps, durations, tool counts, lines changed, commits, project paths
2. `~/.claude/usage-data/facets/*.json` — goals, outcomes, satisfaction, friction, brief summaries

## Workflow

### Step 1: Calculate Date Range
```bash
# Default: previous Friday 23:59 to current Friday 22:59
# If today is Saturday Mar 1, the range is Sat Feb 22 00:00 → Fri Feb 28 23:59

# Get last Saturday and last Friday (the completed week)
WEEK_START=$(date -v-saturday -v-7d +%Y-%m-%d 2>/dev/null || date -dlast-saturday +%Y-%m-%d)
WEEK_END=$(date -v-friday +%Y-%m-%d 2>/dev/null || date -dlast-friday +%Y-%m-%d)

# For jq filtering, use ISO format
START_ISO="${WEEK_START}T00:00:00Z"
END_ISO="${WEEK_END}T23:59:59Z"
```

### Step 2: Extract Session Meta
```bash
# Filter sessions in date range and aggregate
jq -s '
  [.[] | select(.start_time >= "'$START_ISO'" and .start_time <= "'$END_ISO'")] |
  {
    total_sessions: length,
    total_duration_min: [.[].duration_minutes] | add,
    total_commits: [.[].git_commits] | add,
    total_pushes: [.[].git_pushes] | add,
    total_lines_added: [.[].lines_added] | add,
    total_lines_removed: [.[].lines_removed] | add,
    total_files_modified: [.[].files_modified] | add,
    total_user_messages: [.[].user_message_count] | add,
    total_assistant_messages: [.[].assistant_message_count] | add,
    projects: [group_by(.project_path)[] | {
      project: .[0].project_path,
      sessions: length,
      commits: [.[].git_commits] | add,
      lines_added: [.[].lines_added] | add,
      lines_removed: [.[].lines_removed] | add,
      duration_min: [.[].duration_minutes] | add
    }] | sort_by(-.sessions),
    languages: [.[].languages | to_entries[]] | group_by(.key) | [.[] | {lang: .[0].key, count: [.[].value] | add}] | sort_by(-.count),
    tools: [.[].tool_counts | to_entries[]] | group_by(.key) | [.[] | {tool: .[0].key, count: [.[].value] | add}] | sort_by(-.count)
  }
' ~/.claude/usage-data/session-meta/*.json
```

### Step 3: Extract Facets
```bash
# Get session IDs from the date range first, then match facets
SESSION_IDS=$(jq -r '
  select(.start_time >= "'$START_ISO'" and .start_time <= "'$END_ISO'") | .session_id
' ~/.claude/usage-data/session-meta/*.json)

# Filter facets by those session IDs and aggregate
jq -s --argjson ids "$(echo "$SESSION_IDS" | jq -R -s 'split("\n") | map(select(length > 0))')" '
  [.[] | select(.session_id as $sid | $ids | index($sid))] |
  {
    outcomes: group_by(.outcome) | [.[] | {outcome: .[0].outcome, count: length}] | sort_by(-.count),
    satisfaction: [.[].user_satisfaction_counts // {} | to_entries[]] | group_by(.key) | [.[] | {level: .[0].key, count: [.[].value] | add}] | sort_by(-.count),
    helpfulness: group_by(.claude_helpfulness) | [.[] | {level: .[0].helpfulness, count: length}] | sort_by(-.count) | [limit(5; .[])],
    friction: [.[].friction_counts // {} | to_entries[]] | group_by(.key) | [.[] | {type: .[0].key, count: [.[].value] | add}] | sort_by(-.count),
    friction_details: [.[] | select(.friction_detail != null and .friction_detail != "") | {project: .session_id, detail: .friction_detail}],
    summaries_by_project: "JOINED_FROM_META",
    goal_categories: [.[].goal_categories // {} | to_entries[]] | group_by(.key) | [.[] | {goal: .[0].key, count: [.[].value] | add}] | sort_by(-.count) | [limit(15; .[])]
  }
' ~/.claude/usage-data/facets/*.json
```

### Step 4: Join Summaries by Project
```bash
# Create a combined view: session_id → project_path mapping from meta,
# then attach brief_summary from facets
python3 -c "
import json, glob, os
from collections import defaultdict
from datetime import datetime

start = '$START_ISO'
end = '$END_ISO'

# Load session meta in range
meta = {}
for f in glob.glob(os.path.expanduser('~/.claude/usage-data/session-meta/*.json')):
    with open(f) as fh:
        d = json.load(fh)
        if start <= d['start_time'] <= end:
            meta[d['session_id']] = d

# Load matching facets
project_summaries = defaultdict(list)
for f in glob.glob(os.path.expanduser('~/.claude/usage-data/facets/*.json')):
    with open(f) as fh:
        d = json.load(fh)
        if d['session_id'] in meta:
            proj = meta[d['session_id']].get('project_path', 'unknown')
            proj_name = os.path.basename(proj) if proj else 'unknown'
            if d.get('brief_summary'):
                project_summaries[proj_name].append(d['brief_summary'])

# Print grouped summaries
for proj, sums in sorted(project_summaries.items(), key=lambda x: -len(x[1])):
    print(f'### {proj} ({len(sums)} sessions)')
    for s in sums[:5]:  # cap at 5 per project
        print(f'- {s[:200]}')
    print()
"
```

### Step 5: Format Notion Page
Build a markdown page with these sections:

```markdown
# Weekly Activity Log
Period: Sat [date] → Fri [date] | Sessions: X | Commits: X

## Summary
| Metric | Value |
|--------|-------|
| Sessions | X |
| Duration | Xh Xm |
| Commits | X |
| Pushes | X |
| Lines added | +X |
| Lines removed | -X |
| Files modified | X |

## Projects Worked On
- **[project]** — X sessions, X commits, +X/-X lines, Xh
- ...

## What Got Done
[brief_summaries from facets grouped by project, top 8-10 items]

## Goals & Outcomes
### Outcomes
- fully_achieved: X
- mostly_achieved: X
- partially_achieved: X

### Top Goals
- [goal_category]: X occurrences
- ...

## Satisfaction & Helpfulness
| Level | Count |
|-------|-------|
| satisfied | X |
| likely_satisfied | X |
| ...

## Friction & Lessons
| Type | Count |
|------|-------|
| wrong_approach | X |
| buggy_code | X |
| ...

### Notable Friction
- [detail snippets, max 5]
```

### Step 6: Push to Notion
Use `mcp__claude_ai_Notion__notion-create-pages` with:
- parent: `{"page_id": "69d65fc11bff4a7ebf810681fe1804ec"}`
- title: `Weekly Log — [Mon DD] to [Mon DD], YYYY`
- content: the formatted markdown from Step 5

## Arguments
- No args: generates for the most recently completed week
- `YYYY-MM-DD`: generates for the week containing that date
- `YYYY-MM-DD YYYY-MM-DD`: explicit start/end range

## Output
- Notion page URL printed on success
- Session count cross-check against `ls ~/.claude/usage-data/session-meta/ | wc -l`

## Notes
- No raw prompts are included — only aggregated metrics and brief summaries
- Friction details are included but capped at 5 entries
- All times are UTC (matching session_meta timestamps)
