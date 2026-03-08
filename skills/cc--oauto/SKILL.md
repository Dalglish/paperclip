# Switch to Auto Mode

Quick shortcut to switch the LLM gateway back to auto routing.

## When User Says `/oauto`

Run:

```bash
source /Users/user/FFagents26/.env && export ANTHROPIC_API_KEY OPENAI_API_KEY DEEPSEEK_API_KEY && cd /Users/user/llm-gateway && python3 cli.py mode auto
```

Then confirm: "Gateway → Auto (routes by complexity)."
