"""
main.py  –  FastAPI entry-point that replaces server.js
==========================================================
Mounts developer_portal_api.py router and a lightweight health-check.

Run (development):
    uvicorn main:app --host 0.0.0.0 --port 3001 --reload

Run (production):
    uvicorn main:app --host 0.0.0.0 --port 3001 --workers 2
"""

import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from developer_portal_api import router as developer_portal_router
from command_agent_api import router as command_agent_router
from transcribe_api import router as transcribe_api_router

# ---------------------------------------------------------------------------
# Load .env (same search order as the Node.js loadEnvFiles())
# ---------------------------------------------------------------------------
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger("main")

# ---------------------------------------------------------------------------
# App creation
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Vireonix.ai Backend API",
    version="2.0.0",
    description="Python/FastAPI replacement for the Node.js server.",
)

# ---------------------------------------------------------------------------
# CORS  (mirrors corsOptions in server.js)
# ---------------------------------------------------------------------------
FRONTEND_ORIGIN_ENV = (
    os.environ.get("FRONTEND_ORIGIN")
    or os.environ.get("VITE_FRONTEND_ORIGIN")
    or "http://localhost:5173"
)
allowed_origins = [o.strip().rstrip("/") for o in FRONTEND_ORIGIN_ENV.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-Forwarded-For",
        "X-Portal",
        "X-Usage-Type",
        "X-Skip-Credit-Check",
        "x-veytrix-flow",
    ],
)

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
app.include_router(developer_portal_router)
app.include_router(command_agent_router)
app.include_router(transcribe_api_router)


@app.get("/")
async def root():
    return {"message": "Server is alive"}


@app.get("/test")
async def test():
    logger.info("TEST ROUTE HIT")
    return "OK"
