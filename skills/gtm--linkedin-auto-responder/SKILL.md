---
name: linkedin-auto-responder
description: "Draft personalized replies to LinkedIn post commenters to drive engagement"
---

# LinkedIn Auto-Responder

## Purpose
Generate personalized, contextual replies to comments on LinkedIn posts to maintain engagement momentum, build relationships, and subtly guide commenters toward conversion actions (demos, content downloads, website visits). Replies feel human and conversational, never templated or salesy.

## Tools Required
- LinkedIn API (read comments + post replies)
- Apollo API (quick enrichment for context on commenter)
- Perplexity API via OpenRouter (research commenter's company/industry for personalization)
- Notion API (log responses + track engagement threads)

## Trigger
When a LinkedIn post receives comments that haven't been responded to within 2 hours, or on a scheduled basis (check every 2-4 hours during business hours).

## Instructions

### Step 1: Pull unresponded comments
For each active post (published within last 7 days):
- Retrieve all comments
- Filter out comments that already have a reply from the company account
- Sort by recency and engagement score (comments with likes/replies prioritized)

### Step 2: Classify comment type
Categorize each comment:

- **Question**: Asks something specific about the topic
- **Agreement**: "+1", "Great point", validates the post
- **Challenge**: Disagrees or offers a counter-perspective
- **Story**: Shares their own experience related to the topic
- **Tag**: Tags someone else (often for awareness)
- **Spam/Irrelevant**: Off-topic promotion or gibberish

Skip Spam/Irrelevant. Prioritize Questions and Challenges (highest engagement value).

### Step 3: Enrich commenter context (lightweight)
Quick Apollo lookup by LinkedIn URL:
- Company, title, industry
- Use this to personalize the reply (reference their industry or role)

If Apollo returns nothing, use their LinkedIn headline for context.

### Step 4: Draft personalized replies
For each comment, generate a reply following these rules:

**Tone:**
- Conversational, not corporate
- Match the commenter's energy level (brief reply to brief comment, detailed to detailed)
- Use their first name
- No hashtags in replies
- No emojis unless the commenter used them first

**Structure by comment type:**

*Question:*
1. Acknowledge the question
2. Give a direct, useful answer (2-3 sentences)
3. If relevant, mention a resource (blog post, guide) without being pushy
4. End with an open question to continue the thread

*Agreement:*
1. Thank them and add a related insight
2. Ask a follow-up question to deepen the conversation
3. Keep it short (2-3 sentences max)

*Challenge:*
1. Validate their perspective ("That's a fair point")
2. Offer nuance or additional context (not defensive)
3. Find common ground
4. Invite further discussion

*Story:*
1. Acknowledge their experience specifically
2. Connect it back to the post's theme
3. Ask a follow-up about their story

**CTA integration (subtle, max 1 per 5 replies):**
- "We actually wrote about this in detail -- [link]"
- "Happy to show you how we handle that if you're curious"
- Only include when genuinely relevant to the comment

### Step 5: Quality checks
Before posting each reply:
- Verify no technical claims that contradict the spec sheet
- Ensure reply length is proportionate to comment (don't write 200 words replying to "Great post!")
- Check for awkward phrasing or overly formal tone
- Verify the CTA (if any) links to a real, live page

### Step 6: Post replies
Use LinkedIn API to post each reply under the corresponding comment.
Space replies 1-3 minutes apart to appear natural (not batch-posted).

### Step 7: Log in Notion
For each reply session, log:
- Post URL, comment count, replies sent
- Commenter names and companies (for pipeline tracking)
- Any comments flagged as potential leads (high ICP match)
- Reply quality self-assessment (natural / forced / skipped)

Flag high-potential commenters for the `linkedin-engagement-pipeline` skill.

## Agent Mapping
- **ff-marketing**: Primary consumer -- manages LinkedIn presence and engagement
- **ff-sales-triage**: Receives flagged high-ICP commenters for follow-up
