---
name: voice-interview-to-source
description: "Convert AI-guided interview transcripts into structured source material for content"
---

# Voice Interview to Source Material

## Purpose
Guide a structured interview with a subject matter expert (SME), capture their responses, and transform the raw transcript into organized source material that can feed the `seo-blog-writer` and other content skills. Ensures authentic expert voice and real-world examples make it into published content.

## Tools Required
- Notion API (store interview transcripts + source material)
- Perplexity API via OpenRouter (generate follow-up questions based on answers)

## Trigger
When creating content that requires authentic expert knowledge, customer stories, technical deep-dives, or when building a library of source material for a product vertical.

## Instructions

### Step 1: Prepare interview framework
Based on the content goal, generate an interview guide:
- 8-12 open-ended questions covering the topic
- Questions should follow the STAR framework where applicable (Situation, Task, Action, Result)
- Include "tell me about a time when..." prompts for story mining
- Add technical probing questions specific to the domain

Example question categories:
- **Problem space**: "What's the most common mistake you see engineers make with X?"
- **Solution depth**: "Walk me through how you'd approach Y step by step"
- **Differentiation**: "What makes FluidFlow's approach different from doing this manually?"
- **Outcomes**: "What specific results did you see after implementing Z?"

### Step 2: Conduct the interview
Present questions one at a time. After each answer:
- Acknowledge the response
- Use Perplexity to generate 1-2 follow-up probes based on what was said
- Ask for specific numbers, examples, or stories where answers are vague
- Flag quotable statements in real-time

Continue until all core questions are covered or the SME signals completion.

### Step 3: Extract structured source material
From the raw transcript, extract:

**Key claims** (factual statements that can be used in content):
```
- Claim: "Pipe sizing errors account for 30% of commissioning delays"
  Source: [SME name], [role], [date]
  Verification: [VERIFY] / [VERIFIED - source]
```

**Stories** (narrative arcs for case studies or examples):
```
- Setup: Customer had X problem
- Approach: Used FluidFlow to do Y
- Result: Achieved Z (with specific metrics)
```

**Quotable lines** (direct quotes for content):
```
- "Quote here" -- [SME name], [role]
```

**Technical insights** (deep knowledge for authoritative content):
```
- Topic: [specific technical point]
- Detail: [explanation in SME's words]
- Use in: [which content pieces this feeds]
```

### Step 4: Cross-reference with existing content
Check Notion content tracker for:
- Existing blog posts that could be enriched with this material
- Planned content that now has source material
- Keywords from `seo-keyword-research` that this material addresses

### Step 5: Store in Notion
Create a source material page in Notion with:
- Interview date, SME name, topic area
- All extracted claims, stories, quotes, insights (structured as above)
- Tags linking to relevant content pieces
- Verification status for each claim
- Status: "Raw" / "Processed" / "Used in [content piece]"

### Step 6: Generate content briefs
For each planned content piece that can use this material, update its Notion entry with:
- Which source material items to include
- Suggested placement (intro story, supporting data, expert quote, etc.)
- Priority bump if the source material makes the piece significantly stronger

## Agent Mapping
- **ff-marketing**: Primary consumer -- conducts interviews and processes source material
