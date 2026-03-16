#!/usr/bin/env python3
"""
Friday Weekly Digest Generator for Paperclip GTM Board.

Queries Paperclip's embedded PostgreSQL for issue status, formats a
team digest per the Project Management Handover PRD spec, and optionally
posts to Slack and creates a Notion archive page.

Usage:
    python3 weekly-digest.py                    # Print digest to stdout
    python3 weekly-digest.py --slack            # Also post to Slack
    python3 weekly-digest.py --notion           # Also create Notion page
    python3 weekly-digest.py --slack --notion   # Both
"""
import json
import os
import ssl
import sys
import urllib.request
from datetime import datetime, timedelta

# Fix SSL cert issues on macOS
ssl_ctx = ssl.create_default_context()
try:
    import certifi
    ssl_ctx.load_verify_locations(certifi.where())
except ImportError:
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE

# --- Config ---
PG_HOST = os.environ.get("PG_HOST", "localhost")
PG_PORT = int(os.environ.get("PG_PORT", "54329"))
PG_DB = os.environ.get("PG_DB", "paperclip")
PG_USER = os.environ.get("PG_USER", "paperclip")
PG_PASS = os.environ.get("PG_PASS", "paperclip")

COMPANY_ID = "f4193653-5213-4baa-8130-ddaacfee0d73"
GTM_PROJECT_ID = "c6402ef6-c0fc-473d-9328-580f4b672e18"

SLACK_CHANNEL_ID = os.environ.get("SLACK_CHANNEL_ID", "C0AL6439TNV")  # #gtm-feed
SLACK_BOT_TOKEN = os.environ.get("SLACK_BOT_TOKEN", "")
NOTION_API_KEY = os.environ.get("NOTION_API_KEY", "")
NOTION_ARCHIVE_DB_ID = os.environ.get("NOTION_ARCHIVE_DB_ID", "aea339e6-928d-4ce5-aebb-40cc9f38be19")

# --- Database ---
try:
    import psycopg2
except ImportError:
    psycopg2 = None

def get_db_connection():
    """Connect to Paperclip's embedded PostgreSQL."""
    if psycopg2 is None:
        print("ERROR: psycopg2 not installed. Run: pip install psycopg2-binary", file=sys.stderr)
        sys.exit(1)
    return psycopg2.connect(
        host=PG_HOST, port=PG_PORT, dbname=PG_DB,
        user=PG_USER, password=PG_PASS
    )

def query_issues(conn):
    """Query GTM project issues grouped by status."""
    cur = conn.cursor()

    # Issues by status with labels
    cur.execute("""
        SELECT i.id, i.title, i.status, i.priority,
               i.created_at, i.updated_at, i.completed_at,
               COALESCE(string_agg(l.name, ', '), '') as labels
        FROM issues i
        LEFT JOIN issue_labels il ON i.id = il.issue_id
        LEFT JOIN labels l ON il.label_id = l.id
        WHERE i.project_id = %s
        GROUP BY i.id, i.title, i.status, i.priority,
                 i.created_at, i.updated_at, i.completed_at
        ORDER BY
            CASE i.priority
                WHEN 'urgent' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                WHEN 'low' THEN 4
                ELSE 5
            END,
            i.updated_at DESC
    """, (GTM_PROJECT_ID,))

    columns = [desc[0] for desc in cur.description]
    rows = [dict(zip(columns, row)) for row in cur.fetchall()]
    cur.close()
    return rows

def query_agents(conn):
    """Query agent activity stats."""
    cur = conn.cursor()
    cur.execute("""
        SELECT
            COUNT(*) as total_runs,
            COUNT(*) FILTER (WHERE status = 'completed') as completed,
            COUNT(*) FILTER (WHERE status = 'failed') as failed
        FROM heartbeat_runs
        WHERE started_at >= NOW() - INTERVAL '7 days'
    """)
    row = cur.fetchone()
    cur.close()
    if row:
        return {"total": row[0], "completed": row[1], "failed": row[2]}
    return {"total": 0, "completed": 0, "failed": 0}

# --- Digest Formatting ---
def format_digest(issues, agent_stats):
    """Format the weekly digest per PRD spec."""
    now = datetime.now()
    week_start = now - timedelta(days=now.weekday())
    week_label = week_start.strftime("%b %d, %Y")

    # Categorize issues
    done = [i for i in issues if i["status"] == "done"]
    in_progress = [i for i in issues if i["status"] == "in_progress"]
    in_review = [i for i in issues if i["status"] == "in_review"]
    blocked = [i for i in issues if i["status"] == "blocked"]
    todo = [i for i in issues if i["status"] == "todo"]
    backlog = [i for i in issues if i["status"] == "backlog"]

    # Stale: updated > 5 days ago and not done/blocked
    stale_threshold = now - timedelta(days=5)
    stale = [i for i in issues
             if i["status"] not in ("done", "blocked", "backlog")
             and i["updated_at"] and i["updated_at"].replace(tzinfo=None) < stale_threshold]

    # Size breakdown for in-flight
    in_flight = in_progress + in_review + todo

    lines = []
    lines.append(f"WEEK OF {week_label} — TEAM DIGEST")
    lines.append("")

    # Shipped
    lines.append("SHIPPED THIS WEEK")
    if done:
        lines.append("  GTM:")
        for i in done:
            label = f" [{i['labels']}]" if i["labels"] else ""
            lines.append(f"    • {i['title']}{label}")
    else:
        lines.append("  (none this week)")
    lines.append("")

    # Blockers
    lines.append("BLOCKERS (need discussion Monday)")
    if blocked:
        for i in blocked:
            label = f" [{i['labels']}]" if i["labels"] else ""
            days = (now - i["updated_at"].replace(tzinfo=None)).days if i["updated_at"] else "?"
            lines.append(f"  • {i['title']}{label} — {days}d blocked")
    else:
        lines.append("  (none)")
    lines.append("")

    # In Flight
    lines.append("IN FLIGHT (carrying to next week)")
    lines.append(f"  GTM:  {len(in_flight)} tickets")
    if in_progress:
        lines.append(f"    In Progress: {len(in_progress)}")
    if in_review:
        lines.append(f"    In Review:   {len(in_review)}")
    if todo:
        lines.append(f"    Todo:        {len(todo)}")
    if backlog:
        lines.append(f"    Backlog:     {len(backlog)}")
    lines.append("")

    # Priority breakdown
    lines.append("PRIORITY BREAKDOWN")
    for prio in ["urgent", "high", "medium", "low"]:
        count = len([i for i in issues if i["priority"] == prio])
        if count:
            lines.append(f"  {prio.upper():8s} {count}")
    lines.append("")

    # Agent Work
    lines.append("AGENT WORK")
    if agent_stats["total"] > 0:
        success_rate = (agent_stats["completed"] / agent_stats["total"] * 100) if agent_stats["total"] else 0
        lines.append(f"  • {agent_stats['total']} heartbeat runs this week")
        lines.append(f"  • {agent_stats['completed']} completed, {agent_stats['failed']} failed")
        lines.append(f"  • Success rate: {success_rate:.0f}%")
    else:
        lines.append("  (no agent activity this week)")
    lines.append("")

    # Stale initiatives
    lines.append("INITIATIVES WITH NO ACTIVITY (5+ days)")
    if stale:
        for i in stale:
            days = (now - i["updated_at"].replace(tzinfo=None)).days if i["updated_at"] else "?"
            lines.append(f"  • {i['title']} — last touched {days}d ago")
    else:
        lines.append("  (none)")

    return "\n".join(lines)

# --- Slack ---
def post_to_slack(text):
    """Post digest to Slack via Bot API."""
    if not SLACK_BOT_TOKEN:
        print("WARN: SLACK_BOT_TOKEN not set, skipping Slack post", file=sys.stderr)
        return False

    payload = json.dumps({
        "channel": SLACK_CHANNEL_ID,
        "text": f"```\n{text}\n```",
        "unfurl_links": False,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://slack.com/api/chat.postMessage",
        data=payload,
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": f"Bearer {SLACK_BOT_TOKEN}",
        },
    )
    try:
        with urllib.request.urlopen(req, context=ssl_ctx) as resp:
            result = json.loads(resp.read())
            if result.get("ok"):
                print(f"Slack: posted to #{SLACK_CHANNEL_ID}", file=sys.stderr)
                return True
            print(f"Slack error: {result.get('error')}", file=sys.stderr)
            return False
    except Exception as e:
        print(f"Slack error: {e}", file=sys.stderr)
        return False

# --- Notion ---
def create_notion_archive(text):
    """Create a dated page in the Notion Weekly TM Archive."""
    if not NOTION_API_KEY or not NOTION_ARCHIVE_DB_ID:
        print("WARN: NOTION_API_KEY or NOTION_ARCHIVE_DB_ID not set, skipping Notion", file=sys.stderr)
        return False

    now = datetime.now()
    title = f"Weekly Digest — {now.strftime('%b %d, %Y')}"

    # Split text into blocks (Notion 2000 char limit per block)
    blocks = []
    for chunk_start in range(0, len(text), 1900):
        chunk = text[chunk_start:chunk_start + 1900]
        blocks.append({
            "object": "block",
            "type": "code",
            "code": {
                "rich_text": [{"type": "text", "text": {"content": chunk}}],
                "language": "plain text"
            }
        })

    payload = json.dumps({
        "parent": {"database_id": NOTION_ARCHIVE_DB_ID},
        "properties": {
            "title": {"title": [{"text": {"content": title}}]},
        },
        "children": blocks,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.notion.com/v1/pages",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {NOTION_API_KEY}",
            "Notion-Version": "2022-06-28",
        },
    )
    try:
        with urllib.request.urlopen(req, context=ssl_ctx) as resp:
            result = json.loads(resp.read())
            print(f"Notion: created page {result.get('id', '?')}", file=sys.stderr)
            return True
    except Exception as e:
        print(f"Notion error: {e}", file=sys.stderr)
        return False

# --- Main ---
def main():
    do_slack = "--slack" in sys.argv
    do_notion = "--notion" in sys.argv

    conn = get_db_connection()
    try:
        issues = query_issues(conn)
        agent_stats = query_agents(conn)
    finally:
        conn.close()

    digest = format_digest(issues, agent_stats)
    print(digest)

    if do_slack:
        post_to_slack(digest)
    if do_notion:
        create_notion_archive(digest)

if __name__ == "__main__":
    main()
