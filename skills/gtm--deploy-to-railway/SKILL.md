---
name: deploy-to-railway
description: "Deploy tools, scripts, and services as persistent Railway deployments"
---

# Deploy to Railway

## Purpose
Package and deploy internal tools, data pipelines, APIs, and automation scripts as persistent Railway services. Handles Dockerfile creation, environment variable configuration, health checks, and monitoring setup. Ensures tools are always-on and accessible without local machine dependency.

## Tools Required
- Railway API (project + service management, deployments)
- Notion API (track deployed services inventory)

## Trigger
When a tool or script needs to run persistently (not just locally), when deploying a webhook receiver, API endpoint, or scheduled job, or when moving a prototype to production.

## Instructions

### Step 1: Assess deployment requirements
Determine:
- **Runtime**: Python, Node.js, Go, or static
- **Type**: Web service (HTTP), worker (background), cron (scheduled)
- **Resources**: Memory, CPU, storage needs
- **Dependencies**: External APIs, databases, file storage
- **Environment variables**: List all required secrets/config

### Step 2: Prepare the project
Ensure the project directory has:

**For Python:**
```
requirements.txt or pyproject.toml
Procfile (e.g., "web: uvicorn main:app --host 0.0.0.0 --port $PORT")
```

**For Node.js:**
```
package.json with start script
```

**Dockerfile (if custom build needed):**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

### Step 3: Create Railway project via API
```
POST https://backboard.railway.app/graphql/v2
{
  "query": "mutation { projectCreate(input: { name: \"{service-name}\" }) { id } }"
}
```

### Step 4: Configure environment variables
Set all required environment variables via the Railway API:
```
mutation {
  variableUpsert(input: {
    projectId: "{project_id}",
    environmentId: "{env_id}",
    serviceId: "{service_id}",
    name: "API_KEY",
    value: "{value}"
  })
}
```

CRITICAL: Never log or echo secret values. Use the Railway API to set them directly.

### Step 5: Deploy
Push code to Railway via:
- **CLI**: `railway up` from the project directory
- **API**: Trigger deployment via GraphQL mutation
- **GitHub**: Connect repo for automatic deploys on push

### Step 6: Verify deployment
After deploy completes:
- Check deployment status via API (should be "SUCCESS")
- Hit the health check endpoint (if web service)
- Check logs for startup errors
- Verify environment variables are loaded correctly
- Test the primary function (API call, webhook, cron trigger)

### Step 7: Set up monitoring
Configure:
- Health check URL (Railway built-in)
- Restart policy (automatic on crash)
- Resource limits (prevent runaway costs)
- Log drain if needed

### Step 8: Document in Notion
Create a service inventory entry with:
- Service name, Railway project ID, URL
- Purpose / what it does
- Environment variables (names only, not values)
- Dependencies (external APIs, databases)
- Owner / maintainer
- Deploy method (CLI / GitHub / API)
- Monthly cost estimate
- Status: "Active" / "Paused" / "Deprecated"

## Agent Mapping
- **ff-marketing**: Deploys marketing automation tools and APIs
- **ff-project-awards**: Deploys data collection and monitoring services
