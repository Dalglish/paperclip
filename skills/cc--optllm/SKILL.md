---
name: optllm
version: 1.0.0
description: |
  LLM cost optimization gateway. Check spend, switch routing modes,
  run benchmarks, and manage the multi-provider router (Opus/Sonnet/GPT-4o-mini).
  Use when you want to check API costs, change model routing, or optimize LLM spend.
allowed-tools:
  - Bash
  - Read
  - Edit
  - Write
  - AskUserQuestion
---

# LLM Gateway Optimizer

You manage the LLM cost optimization gateway at `/Users/user/llm-gateway/`.

The gateway routes requests across tiers + model overrides:
- **Tier 0 (deepseek):** `deepseek-chat` — trivial tasks (cheapest)
- **Tier 1 (codex):** `gpt-4o-mini` — classification, extraction, formatting
- **Tier 2 (sonnet):** `claude-sonnet-4-5` — content, summarization, drafting, email
- **Tier 2 (kimi):** `kimi-k2.5` — **all coding tasks** (code, refactor, debug, test gen)
- **Tier 3 (opus):** `claude-opus-4-6` — spec, architecture, planning, reviews, Boris/Karpathy/Ralph

**Key rule:** Opus specifies and checks. Kimi codes. Sonnet writes. DeepSeek classifies.

## Environment Setup

Always source API keys before running any gateway command:

```bash
source /Users/user/FFagents26/.env && export ANTHROPIC_API_KEY OPENAI_API_KEY
```

## Available Commands

All commands run from `/Users/user/llm-gateway/`:

```bash
# Check current routing mode
python3 cli.py mode

# Switch modes
python3 cli.py mode auto      # Smart routing by complexity (default)
python3 cli.py mode opus      # Lock everything to Opus
python3 cli.py mode sonnet    # Lock everything to Sonnet
python3 cli.py mode kimi      # Lock everything to Kimi K2.5
python3 cli.py mode codex     # Lock everything to GPT-4o-mini
python3 cli.py mode deepseek  # Lock everything to DeepSeek (cheapest)

# View spend dashboard
python3 cli.py spend

# Run cost comparison benchmark
python3 cli.py benchmark

# View cache hit rates
python3 cli.py cache-stats

# Score a prompt without calling API
python3 cli.py score "your prompt here"

# Send a prompt through the gateway
python3 cli.py prompt "your prompt" --task classification
python3 cli.py prompt "your prompt" --model opus
```

## When User Says `/optllm`

Run the following steps:

### Step 1: Show Current State

Run these in parallel:

```bash
source /Users/user/FFagents26/.env && export ANTHROPIC_API_KEY OPENAI_API_KEY && cd /Users/user/llm-gateway && python3 cli.py mode
```

```bash
source /Users/user/FFagents26/.env && export ANTHROPIC_API_KEY OPENAI_API_KEY && cd /Users/user/llm-gateway && python3 cli.py spend
```

```bash
source /Users/user/FFagents26/.env && export ANTHROPIC_API_KEY OPENAI_API_KEY && cd /Users/user/llm-gateway && python3 cli.py cache-stats
```

### Step 2: Present Summary

Format as a concise dashboard:

```
LLM Gateway Status
  Mode:     [auto/opus/sonnet/codex]
  Today:    $X.XX / $50.00 (X%)
  Month:    $X.XX / $500.00 (X%)
  Requests: N (N cache hits, N% hit rate)
  Top model: [model] — N reqs, $X.XX
```

### Step 3: Ask What They Want

Use AskUserQuestion with options:
- **Switch mode** — change routing (auto/opus/sonnet/kimi/codex/deepseek)
- **Run benchmark** — compare costs across all tiers
- **View details** — full spend breakdown by model and task
- **Adjust budget** — change daily/monthly limits

### If User Wants to Switch Mode

Run the mode command and confirm:
```bash
source /Users/user/FFagents26/.env && export ANTHROPIC_API_KEY OPENAI_API_KEY && cd /Users/user/llm-gateway && python3 cli.py mode [selected_mode]
```

### If User Wants Benchmark

Run:
```bash
source /Users/user/FFagents26/.env && export ANTHROPIC_API_KEY OPENAI_API_KEY && cd /Users/user/llm-gateway && python3 cli.py benchmark
```

Then show the savings comparison and recommend whether to stay in current mode or switch.

## Key Files

| File | Purpose |
|------|---------|
| `llm_gateway/config.py` | Pricing tables, tier definitions, budget limits |
| `llm_gateway/router.py` | Complexity scoring, task-type overrides, mode bypass |
| `llm_gateway/budget.py` | SQLite spend tracking, daily/monthly enforcement |
| `llm_gateway/cache.py` | Exact-match response cache with TTL |
| `llm_gateway/gateway.py` | Main entrypoint, fallback escalation |
| `llm_gateway/providers.py` | Anthropic, OpenAI, DeepSeek, Kimi adapters |
| `cli.py` | CLI interface |
| `~/.llm-gateway/spend.db` | Persistent spend log |
| `~/.llm-gateway/cache.db` | Persistent response cache |
| `~/.llm-gateway/mode` | Persisted routing mode |

## Kimi-Routed Task Types (coding)

These auto-route to `kimi-k2.5` in `auto` mode:
- `code`, `code_generation`, `simple_code`
- `refactor`, `code_review`, `debugging`, `test_generation`

## Opus-Locked Task Types (spec & check)

These always route to Opus regardless of mode:
- `specification`, `architecture`, `complex_reasoning`, `planning`
- `boris_review`, `karpathy_review`, `ralph_loop`
- `quality_gate`, `sprint_review`
- `safety_critical`, `multi_document`

## Budget Limits (Configurable in config.py)

| Limit | Default |
|-------|---------|
| Per-request max | $5.00 |
| Daily ceiling | $50.00 |
| Monthly ceiling | $500.00 |
| Degrade to tier 1 at | 90% of daily |
| Alert at | 70% of daily |
