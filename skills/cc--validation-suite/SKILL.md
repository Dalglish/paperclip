# Validation Suite Skill

## Trigger
`/validation-suite` or `!validate`

## Purpose
Run and manage the FFagents26 automated validation suite. Tests agent outputs against spec sheet + KB using DeepSeek generation, rule-based validation, and incremental learning.

## Architecture
```
DeepSeek v3 generates → 7 ff-validator checks → Ralph loop (x3) → Karpathy gates
                                                      ↓
                                              Few-shot memory (55+ gold Q&A pairs)
                                              Learning store (181+ corrections)
                                              JSONL iteration log (737+ entries)
```

## Key Paths
| Path | Purpose |
|------|---------|
| `~/FFagents26/src/validation_suite.py` | Main CLI orchestrator |
| `~/FFagents26/src/validation_pipeline.py` | 7 ff-validator checks (rule-based) |
| `~/FFagents26/src/faq_generator.py` | 64 test cases: 26 contract + 38 KB FAQs |
| `~/FFagents26/src/few_shot_memory.py` | Verified Q&A pairs for few-shot injection |
| `~/FFagents26/src/suite_config.py` | All config: models, paths, prompts |
| `~/FFagents26/src/run_batch_session.py` | Multi-pass batch runner |
| `~/FFagents26/quality_gates.json` | Karpathy gates (count only increases) |
| `~/FFagents26/validation_results/verified_answers.json` | 55+ gold Q&A pairs |
| `~/FFagents26/validation_results/learnings.json` | 181+ corrections + failures |
| `~/FFagents26/validation_results/learning_log.jsonl` | Full iteration trace |

## CLI
```bash
cd ~/FFagents26/src

# Quick test (10 random)
python3 validation_suite.py --mode quick --no-opus

# All 64 tests
python3 validation_suite.py --mode nightly --no-opus

# Single question
python3 validation_suite.py --mode single --question "Can FluidFlow do transient?"

# Batch session (multi-pass, targeting 90%)
python3 run_batch_session.py --passes 5 --target 90

# Seed few-shot memory from learning log
python3 -c "from few_shot_memory import seed_from_learning_log; seed_from_learning_log()"
```

## Memory Layers (in priority order)
1. **Few-shot examples** — 2 most similar verified Q&A pairs injected into prompt. DeepSeek copies patterns, not rules. Most impactful.
2. **Learning store** — Common issues + fix patterns from past corrections. "Never mention SRK", "Always say pressure drop not pressure loss".
3. **Karpathy gates** — Binary PASS/FAIL checks on output. Count only increases. Auto-created from persistent failures via Boris review.
4. **Learning log** — Raw JSONL trace of every iteration. 737+ entries. Used for analysis and seeding other layers.

## Self-Improvement Loop
```
Generate (DeepSeek) → Validate (7 checks) → FAIL?
    → Build correction context → Regenerate (x3 max)
    → PASS? → Store in few-shot memory + learning store
    → Still FAIL after 3? → Create Karpathy gate + Loom script
    → Next run: few-shot examples + learnings in prompt → better first-try accuracy
```

## Notion DBs
| DB | ID |
|----|-----|
| Verified Answer Bank | `e6fa19908d7e4de3bb3eefcb7582d1be` |
| Loom Training Scripts | `fd5c0f5e60564957ab0008eee7396327` |

## Google Sheet
- ID: `1R25rI-sASbrZ4E9EW4tNBum16ATuWXCyRodsTpaX7HQ`
- Tabs: `Validation Log`, `Test Results`

## Cron
`0 2 * * *` on Mac Mini via `~/FFagents26/run_nightly.sh`

## Pass Rate History
| Session | Model | Passes | Start→End | Gates | Learnings |
|---------|-------|--------|-----------|-------|-----------|
| First batch | DeepSeek v3 | 5 | 58%→70% | 8 | 181 |

## Known DeepSeek Hallucination Patterns
- Mentions SRK even when told not to (sometimes as disclaimer — OK)
- Fabricates customer names (Shell, Chevron, Bechtel)
- Claims Fisher Control Valve Handbook integration
- Lists out-of-scope features when describing limitations (triggers scope check)
- Insufficient word count on long-form content (training modules)
