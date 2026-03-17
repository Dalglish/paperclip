# Qdrant Query Utility

Utility skill for querying FluidFlow Qdrant vector database collections.

## Connection Details

```bash
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_API_KEY=<load from /Users/user/ffagents26/.env>
```

**To get the API key at runtime:**
```bash
export QDRANT_API_KEY=$(grep QDRANT_API_KEY /Users/user/ffagents26/.env | cut -d= -f2)
```

## Available Collections

| Collection | Points | Primary Fields | Purpose |
|------------|--------|----------------|---------|
| `fluidflow_mem0` | ~60 | data, category, user_id, created_at | Org-level mem0 memory (editorial rules, technical facts) |
| `ff-knowledge-base` | 1 | content, agent, type, system_prompt_hash | KB agent memory store |
| `ff-support-memory` | 1 | content, agent, type, system_prompt_hash | Support triage agent memory |
| `ff-sales-memory` | 1 | content, agent, type, system_prompt_hash | Sales pipeline agent memory |
| `ff-corrections` | 1 | content, agent, type, system_prompt_hash | Corrections/validation agent memory |
| `ff-validation` | 1 | content, agent, type, system_prompt_hash | Validator agent memory |
| `ff-marketing-memory` | 1 | content, agent, type, system_prompt_hash | Marketing agent memory |

> **Note:** The old `fluidflow_kb`, `fluidflow_unified`, `correlations`, and `hubspot_production_v2` collections no longer exist. All agent memory now flows through mem0 collections.

---

## Query Methods

### 1. Filter-Based Search (Field Match)

Use when you know the exact field value to filter by (e.g., topic, category, source).

```bash
curl -s -H "api-key: $QDRANT_API_KEY" \
  -X POST http://localhost:6333/collections/COLLECTION/points/scroll \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 10,
    "with_payload": true,
    "filter": {
      "must": [
        {"key": "FIELD_NAME", "match": {"value": "FIELD_VALUE"}}
      ]
    }
  }'
```

**Use cases:**
- Search by `topic` in `fluidflow_kb`
- Search by `ticket_category` in `hubspot_production_v2`
- Search by `question_category` in `fluidflow_unified`

### 2. Full-Text Search (Client-Side Filter)

Use when searching for keywords within content fields. Retrieves all points and filters client-side.

```bash
# Step 1: Retrieve all points
curl -s -H "api-key: $QDRANT_API_KEY" \
  -X POST http://localhost:6333/collections/COLLECTION/points/scroll \
  -H "Content-Type: application/json" \
  -d '{"limit": 100, "with_payload": true}' \
  | jq '.result.points[] | select(.payload.CONTENT_FIELD | test("KEYWORD"; "i"))'
```

**Use cases:**
- Search for "cavitation" in KB articles
- Find tickets mentioning "slurry"
- Locate questions containing specific technical terms

### 3. Paginated Scroll (Large Collections)

For collections with many points, use offset parameter:

```bash
curl -s -H "api-key: $QDRANT_API_KEY" \
  -X POST http://localhost:6333/collections/COLLECTION/points/scroll \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 50,
    "offset": "NEXT_PAGE_OFFSET",
    "with_payload": true
  }'
```

---

## Collection-Specific Templates

### fluidflow_mem0 (Org-Level Memory)

Primary mem0 store for org-wide editorial rules, technical facts, and cross-agent corrections.

**Filter by category:**
```bash
curl -s -H "api-key: $QDRANT_API_KEY" \
  -X POST http://localhost:6333/collections/fluidflow_mem0/points/scroll \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 20,
    "with_payload": true,
    "filter": {
      "must": [
        {"key": "category", "match": {"value": "CATEGORY"}}
      ]
    }
  }'
```
Categories include: `editorial`, `technical`, `brand`, `product`

**Search by keyword in data field:**
```bash
curl -s -H "api-key: $QDRANT_API_KEY" \
  -X POST http://localhost:6333/collections/fluidflow_mem0/points/scroll \
  -H "Content-Type: application/json" \
  -d '{"limit": 100, "with_payload": true}' \
  | jq -r '.result.points[] | select(.payload.data | ascii_downcase | contains("KEYWORD")) | {id, category: .payload.category, data: .payload.data}'
```

**Get all entries (full dump):**
```bash
curl -s -H "api-key: $QDRANT_API_KEY" \
  -X POST http://localhost:6333/collections/fluidflow_mem0/points/scroll \
  -H "Content-Type: application/json" \
  -d '{"limit": 100, "with_payload": true}' \
  | jq -r '.result.points[] | {category: .payload.category, data: .payload.data}'
```

### Agent Memory Collections (ff-*-memory)

Per-agent memory stores with fields: `agent`, `type`, `content`, `system_prompt_hash`, `synced_at`.

**Get agent's stored memories:**
```bash
COLLECTION=ff-support-memory  # or ff-sales-memory, ff-marketing-memory, etc.
curl -s -H "api-key: $QDRANT_API_KEY" \
  -X POST "http://localhost:6333/collections/$COLLECTION/points/scroll" \
  -H "Content-Type: application/json" \
  -d '{"limit": 50, "with_payload": true}' \
  | jq -r '.result.points[] | {type: .payload.type, content: .payload.content}'
```

**Search agent memory by keyword:**
```bash
curl -s -H "api-key: $QDRANT_API_KEY" \
  -X POST http://localhost:6333/collections/ff-support-memory/points/scroll \
  -H "Content-Type: application/json" \
  -d '{"limit": 100, "with_payload": true}' \
  | jq -r '.result.points[] | select(.payload.content | ascii_downcase | contains("KEYWORD")) | {type: .payload.type, content: .payload.content}'
```

---

## Common JQ Patterns

**Extract specific fields:**
```bash
| jq '.result.points[] | {id, field1: .payload.field1, field2: .payload.field2}'
```

**Count results:**
```bash
| jq '.result.points | length'
```

**Case-insensitive search:**
```bash
| jq -r '.result.points[] | select(.payload.FIELD | ascii_downcase | contains("keyword"))'
```

**Multiple keyword search (OR):**
```bash
| jq -r '.result.points[] | select((.payload.content | ascii_downcase | contains("keyword1")) or (.payload.content | ascii_downcase | contains("keyword2")))'
```

**Multiple keyword search (AND):**
```bash
| jq -r '.result.points[] | select((.payload.content | ascii_downcase | contains("keyword1")) and (.payload.content | ascii_downcase | contains("keyword2")))'
```

---

## Usage Example

Query `fluidflow_mem0` for all editorial rules:

```bash
export QDRANT_API_KEY=$(grep QDRANT_API_KEY /Users/brianross/FFagents26/.env | cut -d= -f2)
curl -s -H "api-key: $QDRANT_API_KEY" \
  -X POST http://localhost:6333/collections/fluidflow_mem0/points/scroll \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 100,
    "with_payload": true,
    "filter": {"must": [{"key": "category", "match": {"value": "editorial"}}]}
  }' \
  | jq -r '.result.points[] | .payload.data' | head -10
```

**Example output:**
```
EDITORIAL RULE: Never use '10,000+ engineers' without proper context in FluidFlow content
SRK is NOT supported
Always use "FluidFlow" (one word, capital F twice)
```

---

## Best Practices

1. **Start specific**: Use filter-based search when you know the exact field value
2. **Fallback to full-text**: Use scroll + jq for keyword searches within content
3. **Limit appropriately**: Small collections (correlations) can retrieve all; large collections (hubspot) should paginate
4. **Cache results**: Store frequently accessed queries to avoid repeated API calls
5. **Validate empty results**: Check `.result.points | length` before processing

---

## Troubleshooting

**Empty results:**
- Check collection name spelling
- Verify field names match collection schema
- Test without filters first to confirm data exists

**API errors:**
- Verify API key is correct
- Check network connectivity to localhost:6333
- Ensure JSON payload is properly formatted

**JQ parsing errors:**
- Validate JSON response with `| jq .` first
- Check field paths match actual payload structure
- Use `| jq -r` for raw string output

---

## Integration with Other Skills

Reference this skill in other FluidFlow skills when:
- Retrieving KB articles for course generation
- Querying support tickets for pain point analysis
- Looking up correlation data for engineering calculations
- Searching agent interaction history for patterns

Example reference:
```markdown
See `~/.claude/skills/qdrant-query/SKILL.md` for query templates
```
