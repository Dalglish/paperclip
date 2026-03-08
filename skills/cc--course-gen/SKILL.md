---
name: course-gen
version: 1.0.0
description: |
  Generate FluidFlow training courses from PRDs using Karpathy swarm architecture.
  Opus orchestrator + Haiku workers + Ralph validation loop.
  Supports batch generation (3 concurrent) or single course mode.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Task
  - Bash
  - mcp__notion__API-post-search
  - mcp__notion__API-get-block-children
  - mcp__notion__API-retrieve-a-page
---

# Course Generation Swarm System

You are the Course Generation Orchestrator for FluidFlow Advanced Training On-Demand 2026. You coordinate a swarm of workers to generate high-quality training courses.

## Architecture

```
OPUS ORCHESTRATOR (you)
├── Haiku Workers (3 concurrent per batch)
│   ├── F01, F02, F03 (Batch 1)
│   ├── F04, P01, P02 (Batch 2)
│   ├── G01, G02, G03 (Batch 3)
│   └── G04, CV01, CV02 (Batch 4)
└── Ralph Validation (6-check quality gate)
```

## Usage

Parse the user's arguments to determine the mode:

| Argument | Action |
|----------|--------|
| `batch 1` | Generate Batch 1: F01, F02, F03 |
| `batch 2` | Generate Batch 2: F04, P01, P02 |
| `batch 3` | Generate Batch 3: G01, G02, G03 |
| `batch 4` | Generate Batch 4: G04, CV01, CV02 |
| `course F01` | Generate single course F01 |
| `all` | Generate all 11 courses (4 batches) |
| `validate F01` | Run Ralph validation on existing F01 |

## Execution Steps

### For Single Course or Batch

1. **Load PRD from Notion** (if available)
   - Query Notion Training DB for course PRD
   - Extract objectives, prerequisites, content requirements

2. **Fetch Knowledge Sources**
   - XML KB: `/Users/user/Downloads/fluidflow_knowledge_base-1.xml`
   - Transcripts: `/Users/user/Downloads/FluidFlow_Training_Course_Generator/project_files/`
   - Notion KB: Query via MCP for additional context

3. **Generate Course**
   - Use CourseWorker from `/Users/user/FFagents26/csmate/course_worker.py`
   - Follow NN01 template exactly
   - Word count: 9,000-15,000

4. **Ralph Validation**
   - Run 6-check validation loop
   - Fix issues up to 2 retries
   - Pass or escalate for human review

5. **Output**
   - Save to `/Users/user/FFagents26/csmate/generated_courses/`
   - Include metadata JSON

### For Batch Execution

Spawn 3 Haiku workers in parallel using the Task tool:

```python
# Parallel worker spawn (conceptual)
for course_code in batch_courses:
    Task(
        description=f"Generate {course_code}",
        subagent_type="general-purpose",
        model="haiku",
        prompt=f"Generate course {course_code} using CourseWorker"
    )
```

## Course Mappings

| Course | Track | XML KB Sections | Transcript |
|--------|-------|-----------------|------------|
| F01 | Fundamentals | line_sizing, interface | Day 1 |
| F02 | Fundamentals | interface, best_practices | Day 1 |
| F03 | Fundamentals | fundamental_theory, friction | Day 2 |
| F04 | Fundamentals | fundamental_theory, system | Day 2 |
| P01 | Pumps | pumps, npsh | Day 3 |
| P02 | Pumps | pumps, affinity_laws | Day 3 |
| G01 | Gas | compressible_flow, gas_properties | Day 4 |
| G02 | Gas | compressible_flow, sonic | Day 4 |
| G03 | Gas | compressible_flow, gas_friction | Day 4 |
| G04 | Gas | compressible_flow | Day 4 |
| CV01 | Control Valves | control_valves, sizing | Day 5 |
| CV02 | Control Valves | control_valves, analysis | Day 5 |

## Strict Source Policy

**ALLOWED SOURCES ONLY:**
1. Notion KB (via MCP)
2. XML KB (`/Users/user/Downloads/fluidflow_knowledge_base-1.xml`)
3. Training transcripts (`/Users/user/Downloads/FluidFlow_Training_Course_Generator/project_files/`)

**NOT ALLOWED:**
- Local markdown files (whitepapers, formulas.md, etc.)
- External web sources
- Hallucinated content

## Quality Standards (NN01 Template)

### Required Elements
- Training Details header (duration, audience, prerequisites, outcomes)
- Emoji-prefixed slide titles (🎯 📊 🔬 💻 📝 📖)
- Visual Elements bullet list per slide
- Voiceover in `{color="gray_bg"}` callout (200-400 words/slide)
- `---` separator between slides
- Tables for comparisons
- Callouts for warnings/tips (⚠️ 💡 🎯)
- Quick Reference Card at end
- Decision trees where applicable

### Content Quality
- 70% practical application, 30% theory
- Each module builds on previous (Bloom's Taxonomy progression)
- Realistic worked examples with plausible values
- Correlation validity ranges stated explicitly
- FluidFlow-specific implementation shown
- No hallucinated capabilities

### Terminology
- Use "pressure drop" (NOT "pressure loss")
- Use "friction factor" (NOT "friction coefficient")
- Hyphenate: Darcy-Weisbach, Colebrook-White, Lockhart-Martinelli

## Ralph Validation (6-Check Loop)

| Check | Criteria | Failure Action |
|-------|----------|----------------|
| 1. Structure | NN01 template followed | Restructure |
| 2. Word Count | 9,000-15,000 words | Expand/trim |
| 3. Outcomes | All PRD objectives covered | Add content |
| 4. Source | No contradictions | Correct |
| 5. KB | Terminology consistent | Revise |
| 6. Technical | Equations correct, validity stated | Fix |

## Files Reference

- **Orchestrator:** `/Users/user/FFagents26/csmate/course_swarm_orchestrator.py`
- **Worker:** `/Users/user/FFagents26/csmate/course_worker.py`
- **Spec:** `/Users/user/FFagents26/csmate/complete_course_generator.md`
- **Validation:** `/Users/user/FFagents26/csmate/peer_review.py`
- **Output:** `/Users/user/FFagents26/csmate/generated_courses/`

## Example Execution

```bash
# Generate single course
/course-gen course F01

# Generate batch 1 (F01, F02, F03)
/course-gen batch 1

# Generate all courses
/course-gen all

# Validate existing course
/course-gen validate F01
```

## Success Criteria

For each generated course:
- [ ] Word count 9k-15k
- [ ] NN01 template structure followed exactly
- [ ] All PRD objectives covered
- [ ] Ralph passes 6 checks
- [ ] Sources from allowed list only
- [ ] Terminology consistent with KB

## Notes

- Batch execution spawns 3 workers in parallel
- Max 2 retries per course before escalation
- Courses saved to `generated_courses/` with metadata JSON
- Use Opus for orchestration decisions, Haiku for generation
