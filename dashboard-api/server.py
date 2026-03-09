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
from typing import Any

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

# Load dashboard-api's own .env first (overrides), then ff-sales-pipeline .env
dashboard_env = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(dashboard_env):
    load_dotenv(dashboard_env)

ff_env_path = os.path.join(FF_SALES_PATH, ".env")
if os.path.exists(ff_env_path):
    load_dotenv(ff_env_path, override=False)

# Ensure GOOGLE_SA_CREDS points to the correct local path.
# The parent shell may have a stale /Users/user/ path; override if the file doesn't exist.
_sa_default = "/Users/brianross/Downloads/misc_archive/fluidflow-content-sync-f9e35cea9dd6.json"
_current_sa = os.environ.get("GOOGLE_SA_CREDS", "")
if (not _current_sa or not os.path.exists(_current_sa)) and os.path.exists(_sa_default):
    os.environ["GOOGLE_SA_CREDS"] = _sa_default

# Now import the intelligence module
import intelligence  # noqa: E402

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
