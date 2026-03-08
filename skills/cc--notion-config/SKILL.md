# Notion Configuration

## Integration Rules
- MCP has known serialization bugs with `API-post-page`. Use block appending (`API-patch-block-children`) as workaround.
- Always verify target database/page is shared with integration before writes.
- If Notion API calls fail twice, fall back to `curl` commands.
- Comments API returns 403 — need permission added for inline comments.

## Database IDs
```
NOTION_VERIFICATION_SOURCES_DB=27a089ac-b62f-4d94-bd5d-230aec9f1887
NOTION_CONTENT_PAIN_MATRIX_DB=6acedb28-fecb-4c3a-bed0-5fa3f0cf66cf
NOTION_MVP_PRDS_DB=0858805f-6549-42c3-bb94-390dd8501d9f
NOTION_INDUSTRY_PAIN_MAP=2eb8fb7c-51ac-81ba-8133-f3a792838271
NOTION_KNOWLEDGE_BASE_DB=3058fb7c-51ac-812a-8517-fb3604ca0627
NOTION_AGENT_OUTPUTS_DB=3058fb7c-51ac-816e-bf68-d672f349ef48
NOTION_GUARDRAIL_REGISTRY_DB=3058fb7c-51ac-8122-8a7f-c80ece0615d7
```

## Integrations
- Read/write: `NOTION_API_KEY` (ntn_3857...VVahJ)
- Read-only KB: `NOTION_KB_READONLY_KEY` (ntn_3857...WcrC)
- KB Index page: `2488fb7c-51ac-807f-8a66-e3b6c34c8499`

## Content Tracker
- DB: `eaa0f7c6-772b-459e-b680-5ac7a8cc9233`
- Status pipeline: Outline → Draft → In Review → AE Sign-off → Published → Updating
- Reviewers: Brian (primary), Kate (editorial), AE Team (technical)
- Training fields: Views, Engagement (0-100), Completion (%), Last Seen, Signal, Notes, Refresh Needed
