---
name: seo-blog-publisher
description: "Publish approved blog content and track in Notion CMS"
---

# SEO Blog Publisher

## Purpose
Take approved blog content through the final publishing workflow: format for the target CMS, update the Notion content tracker, set up GSC monitoring, and trigger distribution. Notion serves as the single source of truth for content status and metadata.

## Tools Required
- Notion API (content tracker database + page management)
- Google Search Console API (submit URL for indexing + monitor)
- GA4 (set up content performance tracking)
- LinkedIn (organic distribution post)
- n8n (trigger post-publish automation workflows)

## Trigger
When a blog post in Notion has status "Approved" and is ready for publishing.

## Instructions

### Step 1: Pull approved content from Notion
Query the content tracker database for pages with status "Approved":
- Retrieve full page content (title, body, metadata, SEO fields)
- Validate all required fields are populated: title, slug, meta description, target keyword, body
- Check for any remaining `[VERIFY]` tags -- halt if found and flag for review

### Step 2: Format for publishing
Prepare the content package:
- Convert Notion blocks to clean HTML
- Verify all internal links resolve (no 404s)
- Check image alt tags are populated
- Validate schema markup JSON-LD
- Ensure heading hierarchy is correct (single H1, logical H2/H3 nesting)

### Step 3: Submit to Google Search Console
After the page is live:
- Use the URL Inspection API to request indexing
- Log the submission timestamp in Notion

### Step 4: Set up performance tracking
Configure tracking in GA4:
- Note the page path for monitoring
- Set a 30-day check reminder in Notion
- Baseline metrics to track: organic sessions, avg position, CTR, bounce rate

### Step 5: Create distribution posts
Draft a LinkedIn post for organic distribution:
- Hook line (question or stat)
- 2-3 key takeaways from the article
- CTA to read the full post
- Relevant hashtags (3-5 max)

Store the draft in Notion for approval before posting.

### Step 6: Trigger n8n post-publish workflow
Call the n8n webhook to trigger:
- Internal Slack notification to the team
- Add to the next morning brief's "New Content" section
- Schedule a 7-day and 30-day performance check

### Step 7: Update Notion status
Move the content tracker entry from "Approved" to "Published" with:
- Publish date
- Live URL
- GSC indexing request timestamp
- Distribution status (LinkedIn draft created / posted)

## Agent Mapping
- **ff-marketing**: Primary consumer -- manages the publish queue and distribution
