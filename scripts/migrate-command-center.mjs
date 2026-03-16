#!/usr/bin/env node
/**
 * One-off migration: Notion Command Center → Paperclip GTM tickets
 * Idempotent: skips items with matching titles in the GTM project.
 */
import postgres from 'postgres';

const sql = postgres({ host: 'localhost', port: 54329, database: 'paperclip', username: 'paperclip', password: 'paperclip' });

const COMPANY_ID = 'f4193653-5213-4baa-8130-ddaacfee0d73';
const PROJECT_ID = 'c6402ef6-c0fc-473d-9328-580f4b672e18'; // GTM project

// Label IDs (created in Track 1)
const LABELS = {
  'Marketing': '7c6b6d86-f121-4b06-b15c-90915b80202b',
  'Content': '43c17547-c0de-4fc2-8206-8b0f6b9d38c7',
  'Sales': '26a55080-72e7-4709-8a75-3841d52aca4e',
  'Outreach': '7f41caea-096c-4e0b-b3d6-68bdf7e2eca3',
  'SEO': '1ddd5ff2-8b7e-4f1a-80a9-9b5472a648e1',
  'CS': '09e9bc30-1251-4f37-8474-29f286714e24',
  'Infrastructure': 'de61f864-c403-4713-9a61-e33cc03ea513',
  'n8n': '21fded9d-fc66-468f-8b79-fee45a9ed02a',
};

// Map Notion "Project" field to label
function projectToLabel(project) {
  const map = {
    'Infrastructure': 'Infrastructure',
    'n8n': 'n8n',
    'Sales Pipeline': 'Sales',
    'SEO': 'SEO',
    'KB Articles': 'Content',
    'FFagents26': 'Infrastructure',
  };
  return map[project] || null;
}

// Map Notion status to Paperclip status
function mapStatus(notionStatus) {
  const map = {
    'Todo': 'todo',
    'In Progress': 'in_progress',
    'Blocked': 'blocked',
    'Done': 'done',
  };
  return map[notionStatus] || 'backlog';
}

// Map Notion priority to Paperclip priority
function mapPriority(p) {
  const map = { 'P0': 'urgent', 'P1': 'high', 'P2': 'medium', 'P3': 'low' };
  return map[p] || 'medium';
}

// All 38 items from Notion Command Center (exported 2026-03-15)
const items = [
  // P0 Critical
  { title: 'Fix Ollama: set OLLAMA_HOST=0.0.0.0 on Mac Mini for remote access', project: 'Infrastructure', status: 'Blocked', priority: 'P0', notes: 'Connection refused from laptop. Ollama defaults to localhost only. Need to set env var and restart.' },
  { title: 'Add OpenRouter API key to llm-router MCP env in ~/.claude.json', project: 'Infrastructure', status: 'Blocked', priority: 'P0', notes: 'llm-router MCP needs OPENROUTER_API_KEY in env block. Without it, openrouter provider fails.' },
  { title: 'Redact CLAUDE.md and MEMORY.md -- remove IPs and credentials', project: 'Infrastructure', status: 'Todo', priority: 'P0', notes: '' },
  { title: 'Qdrant: Configure API key on server', project: 'Infrastructure', status: 'In Progress', priority: 'P0', notes: '' },
  { title: 'Qdrant: Add DO firewall rule for port 6333', project: 'Infrastructure', status: 'In Progress', priority: 'P0', notes: '' },
  // P1 High
  { title: 'Old Leads: Enrichment of 402 existing customers + Slack visibility', project: 'Sales Pipeline', status: 'Todo', priority: 'P1', notes: 'PRD needed. Batch enrich 402 companies via Apollo API, fill contact gaps, post status to Slack.' },
  { title: 'Apollo: Boris Gate validation -- spot-check 50 contacts per vertical', project: 'Sales Pipeline', status: 'Todo', priority: 'P1', notes: '8 Boris gates: vertical alignment, title accuracy >80%, geo coverage, employee sweet spot >60%, suppression, DM/EU pairing, exclusions, data quality >70%.' },
  { title: 'Apollo: Apply exclusion lists to all searches', project: 'Sales Pipeline', status: 'Todo', priority: 'P1', notes: 'Exclude-Verticals (10 HVAC/Wastewater), Exclude-Existing-Active (402 current customers).' },
  { title: 'Apollo: Upload 5 contact lists (CSVs ready)', project: 'Sales Pipeline', status: 'Todo', priority: 'P1', notes: 'High-Opp (102), Existing (402), Top-25, YoY-Growers (15), Mining (107). CSVs in ~/Documents/apollo-icp-setup/' },
  { title: 'Apollo: Create 8 Tier 1 saved searches in Apollo UI', project: 'Sales Pipeline', status: 'Todo', priority: 'P1', notes: 'Use apollo_search_configs.json + SETUP_GUIDE.md. Mining, Utilities, O&G, Chemicals x EU + DM. 226K prospects validated.' },
  { title: 'SEO: Fix /control-valve-sizing/ 404', project: 'SEO', status: 'Todo', priority: 'P1', notes: 'Page returning 404 -- needs redirect or content published' },
  { title: 'SEO: Fix /relief-valve-sizing/ wrong title', project: 'SEO', status: 'Todo', priority: 'P1', notes: 'Title tag incorrect on live page' },
  { title: 'Claude Plan: Verify Privacy toggle OFF + evaluate Team plan migration', project: 'Infrastructure', status: 'Todo', priority: 'P1', notes: 'Settings > Privacy > Help improve Claude must be OFF. Evaluate Team Standard ($100/mo) for sensitive work.' },
  { title: 'Install Ollama on Mac Mini + pull Qwen2.5 14B', project: 'Infrastructure', status: 'Todo', priority: 'P1', notes: '' },
  { title: 'Request ZDR from Anthropic (email sales@anthropic.com)', project: 'Infrastructure', status: 'Todo', priority: 'P1', notes: '' },
  { title: 'Upgrade to Claude Business plan for DPA', project: 'Infrastructure', status: 'Todo', priority: 'P1', notes: '' },
  { title: 'n8n: Re-add Pipedrive credentials', project: 'n8n', status: 'Todo', priority: 'P1', notes: '' },
  { title: 'n8n: Re-add Xero credentials', project: 'n8n', status: 'Todo', priority: 'P1', notes: '' },
  { title: 'n8n: Re-add Gmail credentials', project: 'n8n', status: 'Todo', priority: 'P1', notes: '' },
  { title: 'n8n: Re-add Slack credentials', project: 'n8n', status: 'Todo', priority: 'P1', notes: '' },
  { title: 'n8n: Re-add Google Sheets credentials', project: 'n8n', status: 'Todo', priority: 'P1', notes: '' },
  { title: 'Import 10 n8n workflows from local JSONs', project: 'n8n', status: 'In Progress', priority: 'P1', notes: '' },
  // P2 Medium
  { title: 'Apollo: Deploy n8n Apollo->Pipedrive sync workflow', project: 'Sales Pipeline', status: 'Todo', priority: 'P2', notes: 'deploy_n8n_workflow.py ready. Needs: Pipedrive cred ID in n8n, stage_id=7 verification, test + activate.' },
  { title: 'Apollo: Create 6 Tier 2 saved searches', project: 'Sales Pipeline', status: 'Todo', priority: 'P2', notes: 'Pharma, Shipbuilding, Manufacturing x EU + DM. 167K prospects validated. Create after Tier 1 spot-checked.' },
  { title: 'n8n: Re-add GCP Vision credentials', project: 'n8n', status: 'Todo', priority: 'P2', notes: 'Needed for PO extraction workflow' },
  { title: 'Pump KB: 3 [VERIFY] tags remain -- P14 viscosity, P29 flow reduction, P36 R-squared', project: 'KB Articles', status: 'Blocked', priority: 'P2', notes: 'Need AE verification. Cannot publish until confirmed against FluidFlow.' },
  { title: 'Sales Pipeline: PRD-21 visual redesign (ISA-101 design system)', project: 'Sales Pipeline', status: 'Todo', priority: 'P2', notes: 'Dashboard refactor done (356/356 tests). Next is ProbFlow ISA-101 visual pass.' },
  { title: 'Pump KB: Glossary anchor 404 risk -- verify fluidflowinfo.com/glossary/#anchor links', project: 'KB Articles', status: 'Todo', priority: 'P2', notes: 'All 12 pump articles link to glossary anchors that may not exist yet' },
  { title: 'n8n: Restore Anvil-to-Xero GraphQL body placeholders', project: 'n8n', status: 'Todo', priority: 'P2', notes: 'GraphQL body got stripped during workflow import. Needs manual restore in n8n UI.' },
  { title: 'Add Ollama provider to llm-router + local validation mode', project: 'FFagents26', status: 'Todo', priority: 'P2', notes: '' },
  { title: 'n8n: Rebuild Intercom Quote Bot workflow', project: 'n8n', status: 'Todo', priority: 'P2', notes: '' },
  { title: 'n8n: Rebuild Quotient Pipeline workflow (no local JSON)', project: 'n8n', status: 'Todo', priority: 'P2', notes: '' },
  { title: 'n8n: Re-add Anthropic/OpenAI/Notion credentials', project: 'n8n', status: 'Todo', priority: 'P2', notes: '' },
  { title: 'Generate 30 unseen test questions via Perplexity', project: 'FFagents26', status: 'Todo', priority: 'P2', notes: '' },
  { title: 'KB Articles: Awaiting Brian sign-off on 184 pages', project: 'KB Articles', status: 'Blocked', priority: 'P2', notes: '' },
  { title: 'SEO: 4 AE gates remain (Two-Phase, Slurry WP, Systems Design, Pillar)', project: 'SEO', status: 'Blocked', priority: 'P2', notes: '' },
  // P3 Low
  { title: 'Move Claude Desktop app from Downloads to /Applications', project: 'Infrastructure', status: 'Todo', priority: 'P3', notes: 'Auto-updates failing every 4hrs: read-only volume error in main.log' },
  { title: 'Telegram bot token refresh via @BotFather', project: 'Infrastructure', status: 'Todo', priority: 'P3', notes: '' },
];

async function migrate() {
  // Get existing issues to check for duplicates (idempotency)
  const existing = await sql`SELECT title FROM issues WHERE project_id = ${PROJECT_ID}`;
  const existingTitles = new Set(existing.map(e => e.title));

  let created = 0;
  let skipped = 0;

  for (const item of items) {
    if (existingTitles.has(item.title)) {
      console.log(`SKIP (exists): ${item.title.substring(0, 60)}...`);
      skipped++;
      continue;
    }

    const status = mapStatus(item.status);
    const priority = mapPriority(item.priority);
    const description = [item.notes, `\n\n---\nMigrated from Notion Command Center on 2026-03-15.\nOriginal project: ${item.project} | Original priority: ${item.priority}`].filter(Boolean).join('');

    const [issue] = await sql`
      INSERT INTO issues (id, company_id, project_id, title, description, status, priority, created_at, updated_at)
      VALUES (gen_random_uuid(), ${COMPANY_ID}, ${PROJECT_ID}, ${item.title}, ${description}, ${status}, ${priority}, now(), now())
      RETURNING id, title, status, priority
    `;

    // Add label
    const labelName = projectToLabel(item.project);
    if (labelName && LABELS[labelName]) {
      await sql`
        INSERT INTO issue_labels (issue_id, label_id, company_id, created_at)
        VALUES (${issue.id}, ${LABELS[labelName]}, ${COMPANY_ID}, now())
      `;
    }

    console.log(`CREATE: [${priority}] ${item.title.substring(0, 60)}... → ${labelName || 'no label'}`);
    created++;
  }

  console.log(`\nDONE: ${created} created, ${skipped} skipped (duplicates)`);
  console.log(`Total issues in GTM project: ${created + skipped + existing.length}`);
  await sql.end();
}

migrate().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
