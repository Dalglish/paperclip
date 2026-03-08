# Qdrant Query Utility

Utility skill for querying FluidFlow Qdrant vector database collections.

## Connection Details

```bash
QDRANT_HOST=152.42.149.145
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
| `fluidflow_kb` | 100 | content, section, source, topic, source_type | Primary knowledge base articles |
| `fluidflow_unified` | 100 | question_text, question_category, technical_complexity | Agent interactions and Q&A |
| `correlations` | 21 | heading, text, source | Correlation data and references |
| `hubspot_production_v2` | 200 | searchable_content, ticket_category | CRM tickets and support data |

---

## Query Methods

### 1. Filter-Based Search (Field Match)

Use when you know the exact field value to filter by (e.g., topic, category, source).

```bash
curl -s -H "api-key: $QDRANT_API_KEY" \
  -X POST http://152.42.149.145:6333/collections/COLLECTION/points/scroll \
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
  -X POST http://152.42.149.145:6333/collections/COLLECTION/points/scroll \
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
  -X POST http://152.42.149.145:6333/collections/COLLECTION/points/scroll \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 50,
    "offset": "NEXT_PAGE_OFFSET",
    "with_payload": true
  }'
```

---

## Collection-Specific Templates

### fluidflow_kb (Primary Knowledge Base)

**Filter by topic:**
```bash
curl -s -H "api-key: $QDRANT_API_KEY" \
  -X POST http://152.42.149.145:6333/collections/fluidflow_kb/points/scroll \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 10,
    "with_payload": true,
    "filter": {
      "must": [
        {"key": "topic", "match": {"value": "TOPIC_NAME"}}
      ]
    }
  }'
```

**Search content for keywords:**
```bash
curl -s -H "api-key: $QDRANT_API_KEY" \
  -X POST http://152.42.149.145:6333/collections/fluidflow_kb/points/scroll \
  -H "Content-Type: application/json" \
  -d '{"limit": 100, "with_payload": true}' \
  | jq -r '.result.points[] | select(.payload.content | ascii_downcase | contains("KEYWORD")) | {id, topic: .payload.topic, section: .payload.section, source: .payload.source}'
```

**Filter by source type:**
```bash
curl -s -H "api-key: $QDRANT_API_KEY" \
  -X POST http://152.42.149.145:6333/collections/fluidflow_kb/points/scroll \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 10,
    "with_payload": true,
    "filter": {
      "must": [
        {"key": "source_type", "match": {"value": "manual|support|training"}}
      ]
    }
  }'
```

### fluidflow_unified (Agent Interactions)

**Filter by question category:**
```bash
curl -s -H "api-key: $QDRANT_API_KEY" \
  -X POST http://152.42.149.145:6333/collections/fluidflow_unified/points/scroll \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 10,
    "with_payload": true,
    "filter": {
      "must": [
        {"key": "question_category", "match": {"value": "CATEGORY"}}
      ]
    }
  }'
```

**Search questions by keyword:**
```bash
curl -s -H "api-key: $QDRANT_API_KEY" \
  -X POST http://152.42.149.145:6333/collections/fluidflow_unified/points/scroll \
  -H "Content-Type: application/json" \
  -d '{"limit": 100, "with_payload": true}' \
  | jq -r '.result.points[] | select(.payload.question_text | ascii_downcase | contains("KEYWORD")) | {id, question: .payload.question_text, category: .payload.question_category}'
```

### correlations (Correlation Data)

**Search by heading keyword:**
```bash
curl -s -H "api-key: $QDRANT_API_KEY" \
  -X POST http://152.42.149.145:6333/collections/correlations/points/scroll \
  -H "Content-Type: application/json" \
  -d '{"limit": 21, "with_payload": true}' \
  | jq -r '.result.points[] | select(.payload.heading | ascii_downcase | contains("KEYWORD")) | {id, heading: .payload.heading, source: .payload.source}'
```

**Full text search in correlation text:**
```bash
curl -s -H "api-key: $QDRANT_API_KEY" \
  -X POST http://152.42.149.145:6333/collections/correlations/points/scroll \
  -H "Content-Type: application/json" \
  -d '{"limit": 21, "with_payload": true}' \
  | jq -r '.result.points[] | select(.payload.text | ascii_downcase | contains("KEYWORD"))'
```

### hubspot_production_v2 (CRM Data)

**Filter by ticket category:**
```bash
curl -s -H "api-key: $QDRANT_API_KEY" \
  -X POST http://152.42.149.145:6333/collections/hubspot_production_v2/points/scroll \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 20,
    "with_payload": true,
    "filter": {
      "must": [
        {"key": "ticket_category", "match": {"value": "CATEGORY"}}
      ]
    }
  }'
```

**Search tickets by content:**
```bash
curl -s -H "api-key: $QDRANT_API_KEY" \
  -X POST http://152.42.149.145:6333/collections/hubspot_production_v2/points/scroll \
  -H "Content-Type: application/json" \
  -d '{"limit": 200, "with_payload": true}' \
  | jq -r '.result.points[] | select(.payload.searchable_content | ascii_downcase | contains("KEYWORD")) | {id, category: .payload.ticket_category, content: .payload.searchable_content[0:200]}'
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

Query `fluidflow_kb` for "cavitation":

```bash
curl -s -H "api-key: $QDRANT_API_KEY" \
  -X POST http://152.42.149.145:6333/collections/fluidflow_kb/points/scroll \
  -H "Content-Type: application/json" \
  -d '{"limit": 100, "with_payload": true}' \
  | jq -r '.result.points[] | select(.payload.content | ascii_downcase | contains("cavitation")) | {
      id,
      topic: .payload.topic,
      section: .payload.section,
      source: .payload.source,
      preview: .payload.content[0:150]
    } | @json' | head -5
```

**Example output:**
```json
{"id":386905063990090,"topic":"faq","section":null,"source":"Agent FAQS - LOOK HERE FIRST.txt","preview":"Q: Where do low-pressure zones commonly occur in two-phase systems?\nA: Low-pressure zones prone to vaporization commonly occur downstream of control v"}
{"id":18330615291369769,"topic":"theory","section":null,"source":"F02 Advanced Hydraulic Modeling Theory.txt","preview":"Voiceover Script:\n\"The standard fluid database covers many common applications, but you'll frequently encounter fluids that aren't included. Process i"}
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
- Check network connectivity to 152.42.149.145:6333
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
