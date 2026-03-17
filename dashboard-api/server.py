#!/usr/bin/env python3
"""FastAPI server for the Equilibri dashboard backend.

Imports computation functions from ff-sales-pipeline/agents/intelligence.py
and serves them as REST endpoints at /api/private/*.

Runs on port 3200. The Paperclip dashboard frontend (localhost:3100) calls these
endpoints directly (CORS enabled).
"""

import sys
import os
import logging
import secrets
from datetime import datetime, timedelta
from functools import lru_cache
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Setup: add ff-sales-pipeline to sys.path so we can import intelligence.py
# ---------------------------------------------------------------------------
FF_SALES_PATH = "/Users/brianross/ff-sales-pipeline"
FF_AGENTS_PATH = os.path.join(FF_SALES_PATH, "agents")

# intelligence.py imports from config.py, contracts.py, pipeline_sheet.py
# which live in the agents/ directory
if FF_AGENTS_PATH not in sys.path:
    sys.path.insert(0, FF_AGENTS_PATH)
if FF_SALES_PATH not in sys.path:
    sys.path.insert(0, FF_SALES_PATH)

# Force dotenv loading before intelligence imports
from dotenv import load_dotenv

# Load dashboard-api's own .env first (overrides), then ff-sales-pipeline .env,
# then FFagents26/.env as final fallback.
dashboard_env = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(dashboard_env):
    load_dotenv(dashboard_env)

ff_env_path = os.path.join(FF_SALES_PATH, ".env")
if os.path.exists(ff_env_path):
    load_dotenv(ff_env_path, override=False)

ffagents26_env = "/Users/brianross/FFagents26/.env"
if os.path.exists(ffagents26_env):
    load_dotenv(ffagents26_env, override=False)

# Ensure GOOGLE_SA_CREDS points to the correct local path.
# The parent shell may have a stale /Users/user/ path; override if the file doesn't exist.
_sa_default = "/Users/brianross/Downloads/misc_archive/fluidflow-content-sync-f9e35cea9dd6.json"
_current_sa = os.environ.get("GOOGLE_SA_CREDS", "")
if (not _current_sa or not os.path.exists(_current_sa)) and os.path.exists(_sa_default):
    os.environ["GOOGLE_SA_CREDS"] = _sa_default

# Now import the intelligence module
import intelligence  # noqa: E402

# ---------------------------------------------------------------------------
# Setup: add FFagents26/src to sys.path for signal_adapter + synthesis
# ---------------------------------------------------------------------------
FF_AGENTS26_SRC = "/Users/brianross/FFagents26/src"
if FF_AGENTS26_SRC not in sys.path:
    sys.path.insert(0, FF_AGENTS26_SRC)

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("dashboard-api")

# ---------------------------------------------------------------------------
# Auth config
# ---------------------------------------------------------------------------
JWT_SECRET = os.environ.get("DASHBOARD_JWT_SECRET", secrets.token_hex(32))
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_DAYS = 30
AUTH_PASSWORD = "fluidflow2026"

security = HTTPBearer(auto_error=False)

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Equilibri Dashboard API",
    description="Backend for the Equilibri sales/pipeline dashboards",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3100",
        "http://localhost:3000",
        "http://127.0.0.1:3100",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
class LoginRequest(BaseModel):
    password: str


class TokenResponse(BaseModel):
    token: str
    expires_in_days: int


def create_token() -> str:
    payload = {
        "sub": "dashboard",
        "iat": datetime.now(),
        "exp": datetime.now() + timedelta(days=JWT_EXPIRY_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(credentials: HTTPAuthorizationCredentials | None = Depends(security)):
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    try:
        jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return True


# ---------------------------------------------------------------------------
# Helper: safely call an intelligence function
# ---------------------------------------------------------------------------
def _safe_call(fn, *args, **kwargs) -> Any:
    """Call an intelligence.py function with error handling."""
    try:
        return fn(*args, **kwargs)
    except Exception as exc:
        logger.exception("Error calling %s: %s", fn.__name__, exc)
        raise HTTPException(status_code=502, detail=f"Data source error: {exc}")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.post("/api/private/auth/login")
async def login(req: LoginRequest):
    if req.password != AUTH_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    token = create_token()
    return TokenResponse(token=token, expires_in_days=JWT_EXPIRY_DAYS)


@app.get("/api/private/briefing")
async def briefing(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_morning_briefing_data)


@app.get("/api/private/actions")
async def actions(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_action_queue)


@app.get("/api/private/decisions")
async def decisions(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_decision_board)


@app.get("/api/private/dashboard")
async def dashboard(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_dashboard)


@app.get("/api/private/pipeline")
async def pipeline(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_pipeline_velocity)


@app.get("/api/private/pipeline/leaks")
async def pipeline_leaks(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_pipeline_leaks)


@app.get("/api/private/pipeline/forecast")
async def pipeline_forecast(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_pipeline_forecast)


@app.get("/api/private/funnel")
async def funnel(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_conversion_funnel)


@app.get("/api/private/revenue")
async def revenue(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_revenue_analysis)


@app.get("/api/private/revenue/waterfall")
async def revenue_waterfall(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_revenue_waterfall)


@app.get("/api/private/revenue/industry")
async def revenue_industry(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_revenue_by_segment, "industry")


@app.get("/api/private/revenue/country")
async def revenue_country(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_revenue_by_segment, "country")


@app.get("/api/private/revenue/type")
async def revenue_type(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_revenue_by_segment, "type")


@app.get("/api/private/nrr")
async def nrr(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_nrr)


@app.get("/api/private/retention")
async def retention(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_retention_metrics)


@app.get("/api/private/customers/health")
async def customer_health(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_customer_health)


@app.get("/api/private/sum/gap")
async def sum_gap(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_sum_gap)


@app.get("/api/private/sum/renewals")
async def renewal_calendar(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_renewal_calendar)


@app.get("/api/private/marketing/gsc")
async def gsc(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_gsc_summary)


@app.get("/api/private/marketing/content")
async def marketing_content(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_content_performance)


@app.get("/api/private/marketing/agents")
async def marketing_agents(_auth: bool = Depends(verify_token)):
    """Placeholder — returns agent activity summary if available."""
    try:
        return _safe_call(intelligence.get_content_attribution)
    except Exception:
        return {"agents": [], "has_data": False}


@app.get("/api/private/data-quality")
async def data_quality(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_data_quality)


@app.get("/api/private/trials")
async def trials(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_trial_metrics)


@app.get("/api/private/retargeting")
async def retargeting(_auth: bool = Depends(verify_token)):
    return _safe_call(intelligence.get_retargeting_opportunities)


# ---------------------------------------------------------------------------
# Alert Threshold Engine (Phase 2 — PRD-DASHBOARD-MIGRATION Phase 3)
# ---------------------------------------------------------------------------
# Thresholds (override via env vars)
ALERT_PIPELINE_COVERAGE_MIN = float(os.environ.get("ALERT_PIPELINE_COVERAGE_MIN", "3.0"))
ALERT_TRIAL_CONVERSION_MIN = float(os.environ.get("ALERT_TRIAL_CONVERSION_MIN", "5.0"))
ALERT_NRR_WARNING = float(os.environ.get("ALERT_NRR_WARNING", "90.0"))
ALERT_NRR_CRITICAL = float(os.environ.get("ALERT_NRR_CRITICAL", "80.0"))
ALERT_CHURN_CUSTOMERS_WARNING = int(os.environ.get("ALERT_CHURN_CUSTOMERS_WARNING", "3"))


def _evaluate_alerts() -> List[Dict[str, Any]]:
    """Evaluate all threshold rules and return active alerts.

    Each alert: {id, title, detail, severity, agent_assignee}
    """
    alerts: List[Dict[str, Any]] = []

    # --- 1. NRR + Churn risk ---
    try:
        nrr = intelligence.get_nrr()
        nrr_pct = nrr.get("nrr_pct", 100.0)
        churned = nrr.get("churned_customers", 0)
        current_arr = nrr.get("current_arr", 0)
        churn_arr = nrr.get("churn_arr", 0)

        if nrr_pct < ALERT_NRR_CRITICAL:
            alerts.append({
                "id": "nrr-critical",
                "title": f"NRR critical: {nrr_pct:.1f}%",
                "detail": f"Below {ALERT_NRR_CRITICAL:.0f}% threshold. Churn ARR: ${churn_arr:,.0f}. Immediate attention required.",
                "severity": "critical",
                "agent_assignee": "ff-sales-pipeline",
            })
        elif nrr_pct < ALERT_NRR_WARNING:
            alerts.append({
                "id": "nrr-warning",
                "title": f"NRR below target: {nrr_pct:.1f}%",
                "detail": f"Below {ALERT_NRR_WARNING:.0f}% target. {churned} churned customers (${churn_arr:,.0f} ARR at risk).",
                "severity": "warning",
                "agent_assignee": "ff-sales-pipeline",
            })

        if churned >= ALERT_CHURN_CUSTOMERS_WARNING and nrr_pct >= ALERT_NRR_WARNING:
            alerts.append({
                "id": "churn-risk",
                "title": f"Churn risk: {churned} lapsed customers",
                "detail": f"${churn_arr:,.0f} recoverable ARR. Run save-play sequences.",
                "severity": "warning",
                "agent_assignee": "ff-sales-pipeline",
            })
    except Exception as exc:
        logger.warning("Alert eval: NRR check failed: %s", exc)

    # --- 2. Trial conversion ---
    try:
        trials = intelligence.get_trial_metrics()
        if trials.get("has_data"):
            conv_pct = trials.get("trial_to_customer_pct", 0.0)
            total_trials = trials.get("total_trials", 0)
            if conv_pct < ALERT_TRIAL_CONVERSION_MIN and total_trials >= 5:
                alerts.append({
                    "id": "trial-conversion-low",
                    "title": f"Trial conversion low: {conv_pct:.1f}%",
                    "detail": f"{trials.get('converted_from_trial', 0)} of {total_trials} trials converted. Below {ALERT_TRIAL_CONVERSION_MIN:.0f}% threshold.",
                    "severity": "warning",
                    "agent_assignee": "ff-sales-triage",
                })
    except Exception as exc:
        logger.warning("Alert eval: trial conversion check failed: %s", exc)

    # --- 3. Pipeline coverage (active pipeline deals vs current ARR) ---
    try:
        velocity = intelligence.get_pipeline_velocity()
        stage_counts = velocity.get("stage_counts", {})
        # Active pipeline stages (not Won / Lost / Paid)
        active_stages = {k: v for k, v in stage_counts.items()
                         if k.lower() not in ("won", "lost", "paid", "cancelled")}
        total_active = sum(active_stages.values())

        nrr_data = intelligence.get_nrr()
        current_arr = nrr_data.get("current_arr", 0)

        if current_arr > 0 and total_active > 0:
            # Coverage ratio: active deal count vs ARR proxy
            # Use deal count as coverage proxy since we don't have pipeline value here
            avg_deal_value = current_arr / max(nrr_data.get("retained_customers", 1), 1)
            pipeline_value = total_active * avg_deal_value
            coverage = pipeline_value / current_arr if current_arr > 0 else 0

            if coverage < ALERT_PIPELINE_COVERAGE_MIN:
                alerts.append({
                    "id": "pipeline-coverage-low",
                    "title": f"Pipeline coverage: {coverage:.1f}x (target {ALERT_PIPELINE_COVERAGE_MIN:.0f}x)",
                    "detail": f"{total_active} active deals. Coverage below {ALERT_PIPELINE_COVERAGE_MIN:.0f}x annual target.",
                    "severity": "warning" if coverage >= ALERT_PIPELINE_COVERAGE_MIN * 0.66 else "critical",
                    "agent_assignee": "ff-sales-pipeline",
                })
    except Exception as exc:
        logger.warning("Alert eval: pipeline coverage check failed: %s", exc)

    # --- 4. SUM gap (recoverable ARR from lapsed customers) ---
    try:
        gap = intelligence.get_sum_gap()
        if gap:
            total_recoverable = sum(
                g.get("recoverable_arr", 0) or 0 for g in gap
            )
            lapsed_count = len(gap)
            if total_recoverable > 10000:
                alerts.append({
                    "id": "sum-gap",
                    "title": f"${total_recoverable:,.0f} recoverable ARR",
                    "detail": f"{lapsed_count} lapsed customers off SUM. Win-back sequences recommended.",
                    "severity": "info",
                    "agent_assignee": "ff-sales-pipeline",
                })
    except Exception as exc:
        logger.warning("Alert eval: SUM gap check failed: %s", exc)

    return alerts


@app.get("/api/private/alerts")
async def get_alerts(_auth: bool = Depends(verify_token)):
    """Return active threshold alerts across pipeline, NRR, trials, and SUM.

    Each alert includes id, title, detail, severity (critical/warning/info),
    and agent_assignee for task routing.
    """
    alerts = _evaluate_alerts()
    return {
        "alerts": alerts,
        "count": len(alerts),
        "critical": sum(1 for a in alerts if a["severity"] == "critical"),
        "warning": sum(1 for a in alerts if a["severity"] == "warning"),
        "evaluated_at": datetime.now().isoformat(),
    }


# ---------------------------------------------------------------------------
# Signal Ingestion (GTM pipeline — n8n webhook target)
# ---------------------------------------------------------------------------

class SignalIngestRequest(BaseModel):
    """Payload from n8n or external webhooks."""
    signal_type: str  # e.g. "signal.buying_intent"
    company: str
    source: str = "n8n"
    data: Dict[str, Any] = {}
    contacts: List[Dict[str, Any]] = []


class SynthesisRequest(BaseModel):
    """Full lead synthesis request with signals + enrichment."""
    company: str
    signals: List[Dict[str, Any]]
    contacts: List[Dict[str, Any]] = []
    enrichment: Dict[str, Any] = {}


@app.post("/api/private/signals/ingest")
async def ingest_signal(req: SignalIngestRequest, _auth: bool = Depends(verify_token)):
    """Ingest a signal from n8n or external webhook.

    n8n WF5/WF6 POST here to bridge signals into the FFagents26 event bus.
    """
    try:
        from event_bus import EventBus
        from signal_adapter import SignalAdapter

        bus = EventBus()
        adapter = SignalAdapter(bus)
        result = adapter.ingest_http_signal(req.model_dump())
        if result.get("status") == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        return result
    except ImportError as exc:
        logger.exception("FFagents26 import failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"FFagents26 module not available: {exc}")


@app.post("/api/private/signals/synthesize")
async def synthesize_lead_endpoint(req: SynthesisRequest, _auth: bool = Depends(verify_token)):
    """Synthesize an IntelligencePackage from signals + enrichment.

    Used by n8n WF6 (inbound scoring) to get ICP score + recipe routing.
    Returns the full IntelligencePackage with Pipedrive field values.
    """
    try:
        from synthesis import synthesize_lead

        pkg = synthesize_lead(
            company=req.company,
            signals=req.signals,
            contacts=req.contacts,
            enrichment=req.enrichment,
        )
        return {
            "status": "ok",
            "package": pkg.to_dict(),
            "pipedrive_fields": pkg.to_pipedrive_fields(),
            "tier": pkg.tier,
            "icp_score": pkg.icp_score,
            "recipe": pkg.recipe,
        }
    except ImportError as exc:
        logger.exception("FFagents26 synthesis import failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Synthesis module not available: {exc}")


# ---------------------------------------------------------------------------
# Health check (no auth)
# ---------------------------------------------------------------------------
@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("DASHBOARD_API_PORT", "3200"))
    logger.info("Starting Equilibri Dashboard API on port %d", port)
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
