---
name: seo-blog-writer
description: "Write SEO-optimized blog posts by scraping SERP results and using source material"
---

# SEO Blog Writer

## Purpose
Generate high-quality, SEO-optimized blog posts by first analyzing what currently ranks for the target keyword, extracting structural patterns and content gaps from top results, then writing original content informed by real source material. Never fabricates technical claims -- all engineering content must trace to verified source material.

## Tools Required
- Perplexity API via OpenRouter (SERP analysis + source research)
- Google Search Console API (validate keyword targeting)
- Notion API (content tracker + publish queue)

## Trigger
When a keyword gap has been identified (via `seo-keyword-research` skill) and a new blog post is needed to fill it.

## Instructions

### Step 1: Analyze the SERP
Use Perplexity to research the target keyword:
```
Analyze the top 10 Google results for "{target keyword}".
For each result, provide:
1. Title and URL
2. Word count estimate
3. H2/H3 heading structure
4. Key topics covered
5. Content format (listicle, guide, comparison, tutorial)
6. Unique angle or differentiator
```

### Step 2: Identify the content gap
From the SERP analysis, determine:
- What every top result covers (table stakes content)
- What is missing or poorly covered (the gap)
- What angle would differentiate our post
- Target word count (match or exceed median of top 5)

### Step 3: Gather source material
Use Perplexity to find authoritative sources:
- Industry standards and specifications
- Technical documentation
- Case studies and benchmarks
- Published research

CRITICAL: For FluidFlow-specific claims, only use content from the spec sheet cache or verified knowledge base. Mark anything unverifiable as `[VERIFY]`.

### Step 4: Create outline
Structure the post with:
- H1: Include primary keyword naturally
- H2s: Cover all table-stakes topics + unique angle
- H3s: Break down complex sections
- Include planned locations for: images, tables, CTAs, internal links

### Step 5: Write the post
- Write in a clear, technical-but-accessible tone
- Front-load value (answer the query in the first 200 words)
- Include the primary keyword in: H1, first paragraph, 1-2 H2s, meta description
- Use related keywords naturally throughout
- Add a FAQ section using "People Also Ask" questions from Perplexity research
- Target the word count identified in Step 2
- End with a clear CTA

### Step 6: SEO metadata
Generate:
- Title tag (under 60 chars, keyword near front)
- Meta description (under 155 chars, includes keyword + CTA)
- URL slug (short, keyword-rich, hyphens)
- Suggested internal links (to existing pages)
- Suggested schema markup type (Article, HowTo, FAQ)

### Step 7: Push to Notion
Create a new page in the content tracker database with:
- Title, slug, target keyword, word count
- Status: "Draft - Needs Review"
- Body content in Notion blocks
- SEO metadata in properties

## Agent Mapping
- **ff-marketing**: Primary consumer -- drafts content from keyword research output
