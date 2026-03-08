# Switch to DeepSeek Mode

Quick shortcut to switch the LLM gateway to DeepSeek (cheapest tier).

## When User Says `/odeep`

Run:

```bash
source /Users/user/FFagents26/.env && export ANTHROPIC_API_KEY OPENAI_API_KEY DEEPSEEK_API_KEY && cd /Users/user/llm-gateway && python3 cli.py mode deepseek
```

Then confirm: "Gateway → DeepSeek (~free)."
