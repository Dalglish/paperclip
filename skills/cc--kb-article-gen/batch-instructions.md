# KB Article Generation - Batch Execution Instructions

## Overview
This document outlines the batch execution strategy for generating 59 FluidFlow knowledge base articles organized into 7 batches. All articles must follow the established guidelines in the kb-article-gen skill.

## Output Configuration
- **Output Directory**: `/Users/user/Downloads/kb-articles/`
- **File Naming Convention**: `{KB_ID}_{slug}.md`
  - Example: `KB-PP-01_pump-sizing-selection-complete-guide.md`
- **Glossary Linking**: Each article MUST link to 3-5 glossary terms on first use
  - Link format: `[term name](https://fluidflowinfo.com/glossary/#term-slug)`
  - Only link first occurrence of each term
  - Use glossary-cache.xml for accurate URLs
- **CTA Strategy**: Include 1 CTA per article (not overkill)
  - Options: Trial download, Training/webinar, Pricing page, Contact sales
  - Place naturally at end of article or after key selling message

## Batch Breakdown

### Batch 1: Foundation & Energy Efficiency (8 articles)
**Articles**: KB-PP-01, KB-PP-05, KB-EC-01, KB-SA-06, KB-IA-01, KB-IA-02, KB-IA-03
**Total Word Count**: ~19,800 words
**Selling Messages Used**: 1 (Energy savings, ROI, BEP optimization)
**Focus**: Pump fundamentals, energy efficiency, BEP selection
**Priority**: P1 heavy (4 P1 articles)

**Execution Command**:
```bash
cd /Users/user/.claude/skills/kb-article-gen && \
python generate_batch.py --batch 1 --output /Users/user/Downloads/kb-articles/
```

---

### Batch 2: Valves & Core Hydraulics (9 articles)
**Articles**: KB-PP-02, KB-CC-01, KB-CC-02, KB-EC-02, KB-EC-03, KB-EC-06, KB-IA-04, KB-IA-05, KB-IA-06
**Total Word Count**: ~18,800 words
**Selling Messages Used**: 2 (Valve sizing accuracy, calculation precision)
**Focus**: Control valves, liquid/gas pressure drop, pump configurations
**Priority**: Mixed P1/P2/P3

**Execution Command**:
```bash
cd /Users/user/.claude/skills/kb-article-gen && \
python generate_batch.py --batch 2 --output /Users/user/Downloads/kb-articles/
```

---

### Batch 3: Slurry & Complex Fluids (8 articles)
**Articles**: KB-PP-03, KB-CC-03, KB-CC-04, KB-CC-05, KB-EC-04, KB-EC-05, KB-IA-07, KB-IA-08
**Total Word Count**: ~18,900 words
**Selling Messages Used**: 3 (Slurry expertise, PSV compliance, non-Newtonian handling)
**Focus**: PSV sizing, slurry transport, two-phase flow, non-Newtonian
**Priority**: Mixed P1/P2/P3

**Execution Command**:
```bash
cd /Users/user/.claude/skills/kb-article-gen && \
python generate_batch.py --batch 3 --output /Users/user/Downloads/kb-articles/
```

---

### Batch 4: Fire Protection & Optimization (8 articles)
**Articles**: KB-PP-04, KB-CC-06, KB-CC-07, KB-CC-08, KB-EC-06, KB-EC-07, KB-EC-08, KB-VC-01
**Total Word Count**: ~17,000 words
**Selling Messages Used**: 4 (Fire protection compliance, friction methods, API RP 520)
**Focus**: Fire protection hydraulics, friction factors, relief valve sizing
**Priority**: Mixed P1/P2/P3

**Execution Command**:
```bash
cd /Users/user/.claude/skills/kb-article-gen && \
python generate_batch.py --batch 4 --output /Users/user/Downloads/kb-articles/
```

---

### Batch 5: Thermal & Phase Change (8 articles)
**Articles**: KB-PP-06, KB-CC-09, KB-CC-10, KB-EC-09, KB-EC-10, KB-EC-11, KB-TH-01, KB-VC-02, KB-VC-03
**Total Word Count**: ~19,700 words
**Selling Messages Used**: 5 (Water hammer analysis, thermal modeling, phase change accuracy)
**Focus**: Water hammer, heat transfer, two-phase relief, validation
**Priority**: Mostly P2/P3

**Execution Command**:
```bash
cd /Users/user/.claude/skills/kb-article-gen && \
python generate_batch.py --batch 5 --output /Users/user/Downloads/kb-articles/
```

---

### Batch 6: System Design & Slurry Advanced (7 articles)
**Articles**: KB-PP-07, KB-EC-12, KB-SA-01, KB-SA-02, KB-SA-03, KB-TH-02, KB-TH-03, KB-GS-01
**Total Word Count**: ~15,800 words
**Selling Messages Used**: 6 (Slurry system design, economic sizing, network analysis)
**Focus**: Complete slurry guide, flow distribution, VFD applications, pipe economics
**Priority**: Mixed P1/P2/P3

**Execution Command**:
```bash
cd /Users/user/.claude/skills/kb-article-gen && \
python generate_batch.py --batch 6 --output /Users/user/Downloads/kb-articles/
```

---

### Batch 7: Gas Systems & Troubleshooting (11 articles)
**Articles**: KB-PP-08, KB-SA-04, KB-SA-05, KB-SA-07, KB-SA-08, KB-GS-02, KB-GS-03, KB-GS-04, KB-TS-01, KB-TS-02, KB-TS-03, KB-TS-04, KB-TS-05
**Total Word Count**: ~18,900 words
**Selling Messages Used**: 0-7 mixed (gas system expertise, troubleshooting support)
**Focus**: Gas flow complete guide, transients, getting started, troubleshooting
**Priority**: Mixed P2/P3 with some P1

**Execution Command**:
```bash
cd /Users/user/.claude/skills/kb-article-gen && \
python generate_batch.py --batch 7 --output /Users/user/Downloads/kb-articles/
```

---

## Overnight Execution Strategy

### Sequential Execution (All Batches)
```bash
#!/bin/bash
# Run all 7 batches sequentially overnight
cd /Users/user/.claude/skills/kb-article-gen

for batch in {1..7}; do
  echo "Starting Batch $batch at $(date)"
  python generate_batch.py --batch $batch --output /Users/user/Downloads/kb-articles/ \
    --log /Users/user/Downloads/kb-articles/batch_${batch}.log
  echo "Completed Batch $batch at $(date)"
done

echo "All batches completed at $(date)"
```

### Parallel Execution (Use with caution - API rate limits)
```bash
#!/bin/bash
# Run batches in parallel (monitor API usage)
cd /Users/user/.claude/skills/kb-article-gen

for batch in {1..7}; do
  python generate_batch.py --batch $batch --output /Users/user/Downloads/kb-articles/ \
    --log /Users/user/Downloads/kb-articles/batch_${batch}.log &
done

wait
echo "All batches completed at $(date)"
```

### Priority-Based Execution (P1 first)
```bash
#!/bin/bash
# Execute P1 articles first, then P2, then P3
cd /Users/user/.claude/skills/kb-article-gen

# P1 Priority batches (1, 2)
for batch in 1 2; do
  echo "Starting P1 Batch $batch at $(date)"
  python generate_batch.py --batch $batch --output /Users/user/Downloads/kb-articles/ \
    --log /Users/user/Downloads/kb-articles/batch_${batch}.log
done

# P2 Priority batches (3, 4, 5, 6)
for batch in 3 4 5 6; do
  echo "Starting P2 Batch $batch at $(date)"
  python generate_batch.py --batch $batch --output /Users/user/Downloads/kb-articles/ \
    --log /Users/user/Downloads/kb-articles/batch_${batch}.log
done

# P3 Priority batch (7)
echo "Starting P3 Batch 7 at $(date)"
python generate_batch.py --batch 7 --output /Users/user/Downloads/kb-articles/ \
  --log /Users/user/Downloads/kb-articles/batch_7.log

echo "All batches completed at $(date)"
```

---

## Batch Statistics Summary

| Batch | Articles | Total Words | Avg Words/Article | P1 Count | Selling Messages Used |
|-------|----------|-------------|-------------------|----------|----------------------|
| 1     | 8        | 19,800      | 2,475             | 4        | 1                    |
| 2     | 9        | 18,800      | 2,089             | 3        | 2                    |
| 3     | 8        | 18,900      | 2,363             | 2        | 3                    |
| 4     | 8        | 17,000      | 2,125             | 3        | 4                    |
| 5     | 8        | 19,700      | 2,463             | 0        | 5                    |
| 6     | 7        | 15,800      | 2,257             | 2        | 6                    |
| 7     | 11       | 18,900      | 1,718             | 0        | 0-7 mixed            |
| **TOTAL** | **59** | **128,900** | **2,185**     | **14**   | **1-9**              |

---

## Quality Checks

After each batch execution, verify:

1. **File count matches batch article count**
   ```bash
   ls /Users/user/Downloads/kb-articles/ | grep "KB-" | wc -l
   ```

2. **All files have content (not empty)**
   ```bash
   find /Users/user/Downloads/kb-articles/ -name "KB-*.md" -size 0
   ```

3. **Glossary links are present** (spot check)
   ```bash
   grep -c "fluidflowinfo.com/glossary/#" /Users/user/Downloads/kb-articles/KB-PP-01_*.md
   ```

4. **Word count within target** (±10% acceptable)
   ```bash
   wc -w /Users/user/Downloads/kb-articles/KB-PP-01_*.md
   ```

5. **CTA present** (1 per article)
   ```bash
   grep -i "try fluidflow\|request demo\|contact\|pricing" /Users/user/Downloads/kb-articles/KB-PP-01_*.md
   ```

---

## Glossary Linking Strategy

### Critical Rules
- **First use only**: Link glossary terms only on their first occurrence in each article
- **Anchor format**: Use `#term-slug` anchor, not dedicated pages (except GL-042 and GL-085)
- **Context-appropriate**: Only link terms that add value (don't over-link basic terms)
- **Minimum 3, Maximum 5**: Each article should link 3-5 terms from the assigned Glossary_Links column

### Example Linking
```markdown
The [centrifugal pump](https://fluidflowinfo.com/glossary/#centrifugal-pump) operates at its
[Best Efficiency Point (BEP)](https://fluidflowinfo.com/glossary/#best-efficiency-point-bep)
when the [system curve](https://fluidflowinfo.com/glossary/#system-curve) intersects the
pump performance curve at the optimal [duty point](https://fluidflowinfo.com/glossary/#duty-point).
```

### Special Cases
- **Deposition Velocity (GL-042)**: Use dedicated page `https://fluidflowinfo.com/blog/glossary/deposition-velocity/`
- **Intermediate Flow (GL-085)**: Use dedicated page `https://fluidflowinfo.com/blog/glossary/intermediate-flow/`
- All other terms: Use anchor on main glossary page

---

## CTA Placement Strategy

### Selling Message Map (from kb-article-gen skill)
1. **Energy Efficiency**: "Try FluidFlow free for 14 days" → `/trial-download/`
2. **Valve Sizing**: "Watch valve sizing webinar" → `/training/control-valve-sizing/`
3. **PSV/Safety**: "Contact our PSV experts" → `/contact/`
4. **Fire Protection**: "See FluidFlow pricing" → `/pricing/`
5. **Transient/Water Hammer**: "Explore FlowDesigner" → `/flowdesigner/`
6. **Slurry**: "Request slurry demo" → `/demo/slurry/`
7. **Gas Systems**: "Download gas flow whitepaper" → `/resources/gas-flow-guide/`
8. **Network Analysis**: "Join network modeling workshop" → `/training/network-analysis/`
9. **Getting Started**: "Start your free trial" → `/trial-download/`

### CTA Examples

**Energy efficiency articles (Selling Message 1)**:
> Ready to optimize your pump systems for maximum efficiency? [Try FluidFlow free for 14 days](https://www.fluidflowinfo.com/trial-download/) and see how accurate BEP analysis can reduce your energy costs by 15-30%.

**Valve sizing articles (Selling Message 2)**:
> Master control valve sizing in FluidFlow. [Register for our free webinar](https://www.fluidflowinfo.com/training/control-valve-sizing/) and learn from industry experts with 40+ years of hydraulic analysis experience.

**Slurry articles (Selling Message 6)**:
> Tackle complex slurry transport challenges with confidence. [Request a personalized demo](https://www.fluidflowinfo.com/demo/slurry/) to see how FluidFlow handles deposition velocity, non-Newtonian fluids, and critical velocity calculations.

---

## Notes

- **Glossary cache**: Contains 151 terms (not 143 as originally stated - updated during XML generation)
- **Pain Matrix alignment**: 8 pillar pages align with existing Pain Matrix articles
- **Word targets**: Pillar pages (3500-4500), Deep-dives (2200-2800), How-tos (1200-1800), Industry (2000), Glossary (200-400), Troubleshooting (1000-1200)
- **Refactor vs New**: 4 articles are refactors of existing content, 2 are existing (need minimal edits), 53 are new
- **Batch duration estimate**: 6-8 hours per batch at ~3-4 articles/hour
- **Total project time**: ~42-56 hours for all 59 articles

---

## File Structure After Execution

```
/Users/user/Downloads/kb-articles/
├── KB-PP-01_pump-sizing-selection-complete-guide.md
├── KB-PP-02_control-valve-sizing.md
├── KB-PP-03_psv-sizing-methodology.md
├── ...
├── KB-TS-05_over-constrained-models.md
├── batch_1.log
├── batch_2.log
├── ...
└── batch_7.log
```

Each `.log` file contains:
- Start/end timestamps
- Article generation status
- Word counts
- Glossary links inserted
- Any errors or warnings
- API usage statistics

---

**Last Updated**: 2026-02-17
**Total Articles**: 59
**Total Target Word Count**: ~128,900 words
**Estimated Completion Time**: 42-56 hours
