"""
developer_portal_api.py
=======================
FastAPI translation of developer-portal-api.js.

All original route paths, query/body shapes, and response structures are
preserved exactly so the existing React front-end keeps working without
modification.

Dependencies (add to requirements.txt):
    fastapi
    uvicorn[standard]
    supabase            # pip install supabase
    httpx               # async HTTP for Cloudflare calls
    python-dotenv
    pydantic
"""

import os
import re
import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Set

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from supabase import Client, create_client

# ---------------------------------------------------------------------------
# Environment / logging
# ---------------------------------------------------------------------------

load_dotenv()

logger = logging.getLogger("developer_portal_api")

# ---------------------------------------------------------------------------
# Supabase lazy singleton (mirrors Security/auth/supabaseClient.js)
# ---------------------------------------------------------------------------

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is None:
        url = (
            os.environ.get("SUPABASE_URL")
            or os.environ.get("VITE_SUPABASE_URL")
            or ""
        )
        key = (
            os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
            or os.environ.get("VITE_SUPABASE_SERVICE_ROLE_KEY")
            or os.environ.get("SUPABASE_ANON_KEY")
            or os.environ.get("VITE_SUPABASE_ANON_KEY")
            or ""
        )
        if not url or not key:
            raise RuntimeError(
                "Missing Supabase auth configuration in environment. "
                "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY."
            )
        _supabase_client = create_client(url, key)
    return _supabase_client


# ---------------------------------------------------------------------------
# Cloudflare config (mirrors Security/file_security/cloudflareConfig.js)
# ---------------------------------------------------------------------------


def get_cloudflare_config() -> Dict[str, str]:
    api_token = (
        os.environ.get("CLOUDFLARE_API_TOKEN")
        or os.environ.get("CLOUDFLARE_TOKEN")
        or ""
    )
    return {
        "apiToken": api_token,
        "accountId": os.environ.get("CLOUDFLARE_ACCOUNT_ID") or "",
        "zoneId": os.environ.get("CLOUDFLARE_ZONE_ID") or "",
        "email": os.environ.get("CLOUDFLARE_EMAIL") or "",
        "isConfigured": bool(api_token),
    }


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

TESTER_PERMISSIONS = [
    "tester.portal.access",
    "user.portal.access",
    "developer.testing.run",
]

TESTER_PORTAL_ACCESS = ["tester", "user"]

PROFILE_SELECTS = [
    "id, email, full_name, role, user_credits, developer_credits, created_at, subscription_status, portal_access",
    "id, email, full_name, user_credits, developer_credits, created_at, subscription_status, portal_access",
    "id, email, full_name, created_at",
    "id, email",
]

DEVELOPER_LABELS = ["RUDRIK", "MOHAN", "MANJITH", "HARSHITHA", "UDAY", "SASWATEE"]

# In-memory settings (mirrors JS module-level variable)
_profit_distribution_settings: Dict[str, float] = {
    "reservePercentage": 20,
    "growthPercentage": 30,
    "workerPercentage": 50,
}


# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------


def is_missing_table_error(error: Any) -> bool:
    if error is None:
        return False
    message = str(getattr(error, "message", "") or "").lower()
    code = str(getattr(error, "code", "") or "")
    return (
        code in ("PGRST205", "PGRST116")
        or "could not find the table" in message
        or "does not exist" in message
        or "schema cache" in message
    )


def get_internal_fallback_profile(user: Dict) -> Optional[Dict]:
    email = (user.get("email") or "").lower()

    if email == "admin@veytrix.ai":
        return {"id": user["id"], "email": user["email"], "role": "admin"}

    if email in ("developer@veytrix.ai", "official@mavrostech.in"):
        return {"id": user["id"], "email": user["email"], "role": "developer"}

    if email in ("tester@veeytrix.ai", "tester@veytrix.ai"):
        return {"id": user["id"], "email": user["email"], "role": "tester"}

    if os.environ.get("NODE_ENV") != "production":
        return {"id": user["id"], "email": user["email"], "role": "developer"}

    return None


def get_bearer_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    if authorization.startswith("Bearer "):
        return authorization[7:]
    return None


async def find_internal_profile(user: Dict) -> Optional[Dict]:
    """Try app_profiles → profiles → fallback (mirrors findInternalProfile)."""
    supabase = get_supabase_client()

    async def select_profile(table_name: str) -> Optional[Dict]:
        for columns in ["id, email, role", "id, email"]:
            try:
                res = (
                    supabase.from_(table_name)
                    .select(columns)
                    .eq("id", user["id"])
                    .maybe_single()
                    .execute()
                )
                data = res.data
                fallback = get_internal_fallback_profile(user)
                if data:
                    data["role"] = data.get("role") or (fallback or {}).get("role") or "user"
                    return data
                return None
            except Exception as exc:
                msg = str(exc).lower()
                code = getattr(exc, "code", "")
                if code == "42703":
                    continue
                if code != "PGRST116" and "does not exist" not in msg:
                    logger.warning("Failed to load internal profile from %s: %s", table_name, exc)
                return None

    return (
        await select_profile("app_profiles")
        or await select_profile("profiles")
        or get_internal_fallback_profile(user)
    )


async def select_app_profiles(
    ids: Optional[List[str]] = None,
    offset: int = 0,
    limit: int = 20,
) -> List[Dict]:
    supabase = get_supabase_client()
    for columns in PROFILE_SELECTS:
        try:
            query = supabase.from_("app_profiles").select(columns)
            if ids is not None:
                query = query.in_("id", ids)
            else:
                query = (
                    query.order("created_at", desc=True)
                    .range(offset, offset + limit - 1)
                )
            res = query.execute()
            return res.data or []
        except Exception as exc:
            code = getattr(exc, "code", "")
            if code != "42703":
                raise
    return []


async def select_app_profile_by_id(profile_id: str) -> Optional[Dict]:
    profiles = await select_app_profiles(ids=[profile_id])
    return profiles[0] if profiles else None


async def get_video_counts_for_users(user_ids: List[str]) -> Dict[str, int]:
    if not user_ids:
        return {}
    supabase = get_supabase_client()
    try:
        res = (
            supabase.from_("usage_logs")
            .select("user_id")
            .in_("user_id", user_ids)
            .in_("feature_key", ["video_generation", "ai_video_generation", "scene_generation"])
            .execute()
        )
        counts: Dict[str, int] = {}
        for log in res.data or []:
            uid = log["user_id"]
            counts[uid] = counts.get(uid, 0) + 1
        return counts
    except Exception as exc:
        logger.warning("Error calculating video counts: %s", exc)
        return {}


def is_tester_account(auth_user: Dict, profile: Optional[Dict]) -> bool:
    email = ((profile or {}).get("email") or (auth_user or {}).get("email") or "").lower()
    metadata_role = (auth_user or {}).get("user_metadata", {}).get("role") or (auth_user or {}).get("app_metadata", {}).get("role")
    portal_access = (profile or {}).get("portal_access") or (auth_user or {}).get("user_metadata", {}).get("portal_access") or []

    return (
        (profile or {}).get("role") == "tester"
        or metadata_role == "tester"
        or ("tester" in portal_access)
        or email in ("tester@veeytrix.ai", "tester@veytrix.ai")
        or "tester" in email
        or "qa" in email
    )


async def get_developer_credit_balance(user_id: str, profile: Optional[Dict]) -> float:
    supabase = get_supabase_client()
    try:
        res = (
            supabase.from_("tester_credit_wallets")
            .select("balance")
            .eq("user_id", user_id)
            .eq("wallet_type", "tester_credits")
            .maybe_single()
            .execute()
        )
        wallet = res.data
        return float(
            (wallet or {}).get("balance")
            or (profile or {}).get("developer_credits")
            or 0
        )
    except Exception:
        return float((profile or {}).get("developer_credits") or 0)


async def upsert_tester_profile(
    *,
    profile_id: str,
    email: str,
    full_name: str,
    developer_credits: float = 0,
) -> None:
    supabase = get_supabase_client()
    supabase.from_("app_profiles").upsert(
        {
            "id": profile_id,
            "email": email,
            "full_name": full_name,
            "role": "tester",
            "subscription_status": "active",
            "user_credits": 0,
            "developer_credits": developer_credits,
        },
        on_conflict="id",
    ).execute()


def format_money(value: float) -> float:
    return round(float(value), 2)


def build_distribution_row(
    label: str,
    revenue: float,
    expenses: float,
    profit: float,
    settings: Dict[str, float],
) -> Dict:
    reserved = format_money(profit * settings["reservePercentage"] / 100)
    growth = format_money(profit * settings["growthPercentage"] / 100)
    worker = format_money(profit * settings["workerPercentage"] / 100)
    remainder = format_money(profit - reserved - growth - worker)
    return {
        "label": label,
        "revenue": format_money(revenue),
        "expenses": format_money(expenses),
        "profit": format_money(profit),
        "reservedAmount": reserved,
        "growthAmount": growth,
        "workerAmount": worker,
        "remainder": remainder,
    }


def calculate_growth(current: float, previous: float) -> float:
    if previous == 0:
        return 100.0 if current > 0 else 0.0
    return round(((current - previous) / previous) * 100 * 100) / 100


# ---------------------------------------------------------------------------
# Auth dependency helpers
# ---------------------------------------------------------------------------


async def authenticate_internal_request(
    authorization: Optional[str] = Header(None),
) -> Dict:
    """Validates Bearer token and returns {user, profile}. Raises HTTPException on failure."""
    token = get_bearer_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")

    supabase = get_supabase_client()
    auth_response = supabase.auth.get_user(token)
    user = (auth_response.user if hasattr(auth_response, "user") else None)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user_dict = user.model_dump() if hasattr(user, "model_dump") else dict(user)
    profile = await find_internal_profile(user_dict)
    if not profile:
        logger.error("Profile not found for user: %s", user_dict.get("email"))
        raise HTTPException(status_code=403, detail="Profile not found")

    logger.info("Auth successful - User: %s, Role: %s", user_dict.get("email"), profile.get("role"))
    return {"user": user_dict, "profile": profile}


async def verify_developer_access(
    authorization: Optional[str] = Header(None),
) -> Dict:
    auth = await authenticate_internal_request(authorization)
    role = auth["profile"].get("role")
    if role not in ("admin", "super_admin", "developer"):
        logger.warning("Insufficient permissions - Role: %s", role)
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return auth


async def verify_tester_or_developer_access(
    tester_id: Optional[str] = None,
    authorization: Optional[str] = Header(None),
) -> Dict:
    auth = await authenticate_internal_request(authorization)
    role = auth["profile"].get("role")
    if role not in ("admin", "super_admin", "developer", "tester"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    if role == "tester" and tester_id and auth["user"]["id"] != tester_id:
        raise HTTPException(status_code=403, detail="Cannot access another tester profile")
    return auth


async def verify_portal_access(
    authorization: Optional[str] = Header(None),
) -> Dict:
    auth = await authenticate_internal_request(authorization)
    role = auth["profile"].get("role")
    allowed = ("admin", "super_admin", "developer", "security_admin", "security_analyst", "security_viewer")
    if role not in allowed:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return auth


# ---------------------------------------------------------------------------
# Cloudflare helper
# ---------------------------------------------------------------------------


def _build_cloudflare_fallback(config: Dict) -> Dict:
    configured = bool(config.get("apiToken") and config.get("accountId"))
    return {
        "configured": configured,
        "source": "cloudflare-api" if configured else "fallback",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "accountId": config.get("accountId") or None,
        "zoneId": config.get("zoneId") or None,
        "summary": {
            "requests": 0,
            "bandwidthBytes": 0,
            "blockedRequests": 0,
            "uniqueVisitors": 0,
            "threats": 0,
        },
        "security": {
            "criticalAlerts": 0,
            "activeThreats": 0,
            "failedLogins": 0,
            "blockedRequests": 0,
            "systemHealth": 98 if configured else 95,
        },
        "recentEvents": [],
        "notes": []
        if configured
        else ["Cloudflare API token and account ID are not configured. Showing safe fallback metrics."],
    }


async def fetch_cloudflare_portal_overview() -> Dict:
    config = get_cloudflare_config()
    if not config.get("apiToken"):
        return _build_cloudflare_fallback(config)

    now_dt = datetime.now(timezone.utc)
    since = (now_dt - timedelta(hours=24)).isoformat()
    until = now_dt.isoformat()

    headers = {
        "Authorization": f"Bearer {config['apiToken']}",
        "Content-Type": "application/json",
    }

    zone_id = config.get("zoneId")
    account_id = config.get("accountId")

    if zone_id:
        analytics_url = (
            f"https://api.cloudflare.com/client/v4/zones/{zone_id}/analytics/dashboard"
            f"?since={since}&until={until}&interval=1d"
        )
        firewall_url = (
            f"https://api.cloudflare.com/client/v4/zones/{zone_id}/firewall/events?limit=10&direction=desc"
        )
    else:
        analytics_url = (
            f"https://api.cloudflare.com/client/v4/accounts/{account_id}/analytics/dashboard"
            f"?since={since}&until={until}&interval=1d"
        )
        firewall_url = (
            f"https://api.cloudflare.com/client/v4/accounts/{account_id}/firewall/events?limit=10&direction=desc"
        )

    fallback = _build_cloudflare_fallback(config)

    analytics_data = None
    firewall_data = None

    async with httpx.AsyncClient(timeout=10) as client:
        try:
            analytics_resp = await client.get(analytics_url, headers=headers)
            analytics_data = analytics_resp.json()
        except Exception as exc:
            logger.warning("Cloudflare analytics fetch failed: %s", exc)
            return {
                **fallback,
                "source": "fallback",
                "notes": ["Cloudflare analytics endpoint could not be reached. Showing safe fallback metrics."],
            }

        try:
            firewall_resp = await client.get(firewall_url, headers=headers)
            firewall_data = firewall_resp.json()
        except Exception:
            pass

    analytics_result = (analytics_data or {}).get("result") or analytics_data or {}
    totals = (
        analytics_result.get("totals")
        or analytics_result.get("summary")
        or (analytics_result.get("data") or {}).get("totals")
        or {}
    )

    requests_count = int(
        totals.get("requests")
        or (totals.get("all") or {}).get("requests")
        or analytics_result.get("requests")
        or 0
    )
    bandwidth_bytes = int(
        totals.get("bandwidth")
        or totals.get("bytes")
        or totals.get("bytes_proxied")
        or analytics_result.get("bandwidth")
        or 0
    )
    unique_visitors = int(
        totals.get("uniques")
        or totals.get("unique_visitors")
        or totals.get("uniqueVisitors")
        or analytics_result.get("uniqueVisitors")
        or 0
    )
    threats = int(
        totals.get("threats")
        or totals.get("bot_requests")
        or totals.get("attack_requests")
        or analytics_result.get("threats")
        or 0
    )

    events = (firewall_data or {}).get("result") if isinstance((firewall_data or {}).get("result"), list) else []
    blocked_requests = sum(
        1
        for e in events
        if str(e.get("action") or "").lower() in ("block", "challenge", "managed_challenge", "jschl")
    )
    critical_alerts = sum(
        1
        for e in events
        if str(e.get("severity") or "").lower() in ("high", "critical")
        or str(e.get("action") or "").lower() == "block"
    )

    return {
        "configured": True,
        "source": "cloudflare-api",
        "generatedAt": now_dt.isoformat(),
        "accountId": account_id or None,
        "zoneId": zone_id or None,
        "summary": {
            "requests": requests_count,
            "bandwidthBytes": bandwidth_bytes,
            "blockedRequests": blocked_requests,
            "uniqueVisitors": unique_visitors,
            "threats": threats,
        },
        "security": {
            "criticalAlerts": critical_alerts,
            "activeThreats": max(0, round(threats / 10)),
            "failedLogins": 0,
            "blockedRequests": blocked_requests,
            "systemHealth": max(88, 100 - min(20, round((blocked_requests + threats) / 50))),
        },
        "recentEvents": [
            {
                "action": e.get("action") or "unknown",
                "ruleId": e.get("rule_id") or e.get("ruleId") or None,
                "severity": e.get("severity") or "info",
                "source": e.get("source") or "cloudflare",
                "timestamp": e.get("timestamp") or e.get("created_at") or now_dt.isoformat(),
            }
            for e in events[:5]
        ],
    }


# ---------------------------------------------------------------------------
# FastAPI Router
# ---------------------------------------------------------------------------

router = APIRouter()


# ============ DASHBOARD STATS ============


@router.get("/api/developer/dashboard/stats")
async def dashboard_stats(auth: Dict = Depends(verify_developer_access)):
    logger.info("Dashboard request received")
    supabase = get_supabase_client()
    try:
        # Total users
        total_users = 0
        try:
            auth_result = supabase.auth.admin.list_users()
            total_users = len(auth_result) if isinstance(auth_result, list) else 0
        except Exception as exc:
            logger.warning("Failed to get auth users count, falling back to app_profiles: %s", exc)
            res = supabase.from_("app_profiles").select("*", count="exact", head=True).execute()
            total_users = res.count or 0

        # Active users (last 7 days)
        seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        active_logs_res = (
            supabase.from_("usage_logs")
            .select("user_id")
            .gt("created_at", seven_days_ago)
            .not_.is_("user_id", "null")
            .execute()
        )
        active_users = len({r["user_id"] for r in (active_logs_res.data or [])})

        # New users (last 7 days)
        new_users_res = (
            supabase.from_("app_profiles")
            .select("*", count="exact", head=True)
            .gt("created_at", seven_days_ago)
            .execute()
        )
        new_users = new_users_res.count or 0

        # Credits consumed
        credit_res = supabase.from_("usage_logs").select("credits_charged").execute()
        credits_consumed = sum(float(r.get("credits_charged") or 0) for r in (credit_res.data or []))

        # AI requests
        ai_res = (
            supabase.from_("usage_logs")
            .select("id")
            .eq("usage_type", "production")
            .execute()
        )
        ai_requests = len(ai_res.data or [])

        # Plan type counts
        free_users = pro_users = pro_max_users = 0
        plan_schema_missing = False
        plan_schema_sql = "ALTER TABLE app_profiles ADD COLUMN plan_type TEXT DEFAULT 'FREE';"
        try:
            plans_res = supabase.from_("app_profiles").select("id, plan_type").execute()
            for p in (plans_res.data or []):
                pt = str(p.get("plan_type") or "FREE").upper()
                if pt == "PRO":
                    pro_users += 1
                elif pt in ("PRO_MAX", "PROMAX"):
                    pro_max_users += 1
                else:
                    free_users += 1
        except Exception as exc:
            logger.warning("Error computing plan counts: %s", exc)
            plan_schema_missing = True

        return {
            "totalUsers": total_users,
            "activeUsers": active_users,
            "newUsers": new_users,
            "creditsConsumed": credits_consumed,
            "aiRequests": ai_requests,
            "freeUsers": free_users,
            "proUsers": pro_users,
            "proMaxUsers": pro_max_users,
            "planSchemaMissing": plan_schema_missing,
            "planSchemaSql": plan_schema_sql if plan_schema_missing else None,
            "revenue": credits_consumed * 0.001,
        }
    except Exception as exc:
        logger.exception("Dashboard stats error")
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/developer/cloudflare/overview")
async def cloudflare_overview(auth: Dict = Depends(verify_portal_access)):
    try:
        return await fetch_cloudflare_portal_overview()
    except Exception as exc:
        logger.exception("Cloudflare overview error")
        raise HTTPException(status_code=500, detail="Failed to fetch Cloudflare overview")


@router.get("/api/security/cloudflare/overview")
async def security_cloudflare_overview(auth: Dict = Depends(verify_portal_access)):
    try:
        return await fetch_cloudflare_portal_overview()
    except Exception as exc:
        logger.exception("Security Cloudflare overview error")
        raise HTTPException(status_code=500, detail="Failed to fetch Cloudflare overview")


# ============ USERS MANAGEMENT ============


@router.get("/api/developer/users")
async def list_users(
    page: int = Query(1),
    limit: int = Query(20),
    search: str = Query(""),
    auth: Dict = Depends(verify_developer_access),
):
    supabase = get_supabase_client()
    offset = (page - 1) * limit
    search_lower = search.strip().lower()
    try:
        try:
            auth_result = supabase.auth.admin.list_users(page=page, per_page=limit)
            auth_users = auth_result if isinstance(auth_result, list) else []
            user_ids = [u.id for u in auth_users]
            profiles = await select_app_profiles(ids=user_ids) if user_ids else []
            video_counts = await get_video_counts_for_users(user_ids) if user_ids else {}
            profile_by_id = {p["id"]: p for p in profiles}

            users = []
            for au in auth_users:
                au_dict = au.model_dump() if hasattr(au, "model_dump") else dict(au)
                profile = profile_by_id.get(au_dict["id"])
                email = (profile or {}).get("email") or au_dict.get("email") or ""
                name = (
                    (profile or {}).get("full_name")
                    or (au_dict.get("user_metadata") or {}).get("full_name")
                    or (au_dict.get("user_metadata") or {}).get("name")
                    or email.split("@")[0]
                    or "N/A"
                )
                entry = {
                    "id": au_dict["id"],
                    "email": email,
                    "name": name,
                    "role": (profile or {}).get("role") or "user",
                    "status": "suspended" if (profile or {}).get("subscription_status") == "suspended" else "active",
                    "credits": (profile or {}).get("user_credits") or 0,
                    "developerCredits": (profile or {}).get("developer_credits") or 0,
                    "portalAccess": (profile or {}).get("portal_access") or ["user"],
                    "videos": video_counts.get(au_dict["id"], 0),
                    "joinDate": (profile or {}).get("created_at") or au_dict.get("created_at") or "",
                    "lastLogin": au_dict.get("last_sign_in_at") or "Never",
                }
                if search_lower and not (search_lower in email.lower() or search_lower in name.lower()):
                    continue
                users.append(entry)

            total_count = len(users)
            return {
                "users": users,
                "totalCount": total_count,
                "page": page,
                "limit": limit,
                "totalPages": -(-total_count // limit),
            }
        except Exception as exc:
            logger.warning("Supabase auth users lookup failed, falling back to app_profiles: %s", exc)
            profile_users = await select_app_profiles(offset=offset, limit=limit)
            profile_user_ids = [u["id"] for u in profile_users]
            video_counts = await get_video_counts_for_users(profile_user_ids) if profile_user_ids else {}
            total_res = supabase.from_("app_profiles").select("*", count="exact", head=True).execute()
            total_count = total_res.count or len(profile_users)

            users = []
            for u in profile_users:
                email = u.get("email") or ""
                name = u.get("full_name") or email.split("@")[0] or "N/A"
                if search_lower and not (search_lower in email.lower() or search_lower in name.lower()):
                    continue
                users.append({
                    "id": u["id"],
                    "email": email,
                    "name": name,
                    "role": u.get("role") or "user",
                    "status": "suspended" if u.get("subscription_status") == "suspended" else "active",
                    "credits": u.get("user_credits") or 0,
                    "developerCredits": u.get("developer_credits") or 0,
                    "portalAccess": u.get("portal_access") or [],
                    "videos": video_counts.get(u["id"], 0),
                    "joinDate": u.get("created_at") or "",
                    "lastLogin": "N/A",
                })

            return {
                "users": users,
                "totalCount": total_count,
                "page": page,
                "limit": limit,
                "totalPages": -(-total_count // limit),
            }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Users list error")
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/developer/profile-users")
async def profile_users(
    page: int = Query(1),
    limit: int = Query(20),
    auth: Dict = Depends(verify_developer_access),
):
    supabase = get_supabase_client()
    offset = (page - 1) * limit
    try:
        res = (
            supabase.from_("app_profiles")
            .select("id, email, full_name, role, user_credits, developer_credits, created_at, subscription_status")
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        total_res = supabase.from_("app_profiles").select("*", count="exact", head=True).execute()
        total_count = total_res.count or 0

        users = [
            {
                "id": u["id"],
                "email": u.get("email"),
                "name": u.get("full_name") or "N/A",
                "role": u.get("role"),
                "status": "active" if u.get("subscription_status") == "active" else "suspended",
                "credits": u.get("user_credits") or 0,
                "videos": 0,
                "joinDate": u.get("created_at") or "",
            }
            for u in (res.data or [])
        ]

        return {
            "users": users,
            "totalCount": total_count,
            "page": page,
            "limit": limit,
            "totalPages": -(-total_count // limit),
        }
    except Exception as exc:
        logger.exception("Profile users list error")
        raise HTTPException(status_code=500, detail="Failed to fetch users")


@router.get("/api/developer/users/{user_id}")
async def get_user(user_id: str, auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    try:
        res = supabase.from_("app_profiles").select("*").eq("id", user_id).single().execute()
        user = res.data
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        total_req_res = (
            supabase.from_("usage_logs")
            .select("*", count="exact", head=True)
            .eq("user_id", user_id)
            .execute()
        )
        credit_res = (
            supabase.from_("usage_logs")
            .select("credits_charged")
            .eq("user_id", user_id)
            .execute()
        )
        total_credits_used = sum(float(r.get("credits_charged") or 0) for r in (credit_res.data or []))

        return {
            "id": user["id"],
            "email": user.get("email"),
            "name": user.get("full_name"),
            "role": user.get("role"),
            "status": "active" if user.get("subscription_status") == "active" else "inactive",
            "userCredits": user.get("user_credits"),
            "developerCredits": user.get("developer_credits"),
            "totalRequests": total_req_res.count or 0,
            "totalCreditsUsed": total_credits_used,
            "joinedDate": user.get("created_at") or "",
            "lastActive": user.get("updated_at"),
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("User detail error")
        raise HTTPException(status_code=500, detail="Failed to fetch user details")


# ============ USER CREDIT / STATUS ACTIONS ============


class AddCreditsBody(BaseModel):
    amount: float
    reason: Optional[str] = None


@router.post("/api/developer/users/{user_id}/credits/add")
async def add_credits(user_id: str, body: AddCreditsBody, auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    if not body.amount or body.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")
    try:
        fetch_res = (
            supabase.from_("app_profiles")
            .select("user_credits")
            .eq("id", user_id)
            .single()
            .execute()
        )
        user = fetch_res.data
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        new_balance = float(user.get("user_credits") or 0) + body.amount
        supabase.from_("app_profiles").update({"user_credits": new_balance}).eq("id", user_id).execute()

        supabase.from_("usage_logs").insert({
            "user_id": user_id,
            "actor_role": auth["profile"]["role"],
            "portal": "internal",
            "usage_type": "test",
            "wallet_type": "user_credits",
            "feature_key": "admin_credit_add",
            "credits_requested": body.amount,
            "credits_charged": 0,
            "status": "completed",
            "metadata": {"reason": body.reason, "admin_id": auth["user"]["id"]},
        }).execute()

        return {"success": True, "newBalance": new_balance}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Add credits error")
        raise HTTPException(status_code=500, detail="Failed to add credits")


class SuspendBody(BaseModel):
    reason: Optional[str] = None


@router.post("/api/developer/users/{user_id}/suspend")
async def suspend_user(user_id: str, body: SuspendBody, auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    try:
        supabase.from_("app_profiles").update({"subscription_status": "suspended"}).eq("id", user_id).execute()
        return {"success": True, "message": "User suspended"}
    except Exception as exc:
        logger.exception("Suspend user error")
        raise HTTPException(status_code=500, detail="Failed to suspend user")


@router.post("/api/developer/users/{user_id}/reactivate")
async def reactivate_user(user_id: str, auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    try:
        supabase.from_("app_profiles").update({"subscription_status": "active"}).eq("id", user_id).execute()
        return {"success": True, "message": "User reactivated"}
    except Exception as exc:
        logger.exception("Reactivate user error")
        raise HTTPException(status_code=500, detail="Failed to reactivate user")


# ============ CREDITS MANAGEMENT ============


@router.get("/api/developer/credits/stats")
async def credits_stats(auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    try:
        uc_res = supabase.from_("app_profiles").select("user_credits").execute()
        user_credits_total = sum(float(u.get("user_credits") or 0) for u in (uc_res.data or []))

        dc_res = supabase.from_("app_profiles").select("developer_credits").execute()
        developer_credits_total = sum(float(u.get("developer_credits") or 0) for u in (dc_res.data or []))

        one_day_ago = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        daily_res = (
            supabase.from_("usage_logs")
            .select("credits_charged")
            .gt("created_at", one_day_ago)
            .execute()
        )
        daily_consumption = sum(float(r.get("credits_charged") or 0) for r in (daily_res.data or []))

        active_res = (
            supabase.from_("usage_logs")
            .select("*", count="exact", head=True)
            .gt("created_at", one_day_ago)
            .execute()
        )
        active_users = active_res.count or 0
        average_per_user = round(daily_consumption / active_users) if active_users > 0 else 0

        return {
            "userCreditsTotal": user_credits_total,
            "developerCreditsTotal": developer_credits_total,
            "dailyConsumption": daily_consumption,
            "averagePerUser": average_per_user,
        }
    except Exception as exc:
        logger.exception("Credits stats error")
        raise HTTPException(status_code=500, detail="Failed to fetch credits stats")


# ============ LOGIN ACTIVITY ============


class LoginActivityBody(BaseModel):
    user_id: str
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_role: Optional[str] = "user"
    session_id: Optional[str] = None
    event: Optional[str] = "login"
    device_name: Optional[str] = None
    browser: Optional[str] = None
    operating_system: Optional[str] = None
    ip_address: Optional[str] = None
    metadata: Optional[Dict] = None


@router.post("/api/developer/login-activity/record")
async def record_login_activity(
    request: Request,
    body: LoginActivityBody,
    authorization: Optional[str] = Header(None),
):
    token = get_bearer_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Unauthorized")

    supabase = get_supabase_client()
    auth_response = supabase.auth.get_user(token)
    user = getattr(auth_response, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user_dict = user.model_dump() if hasattr(user, "model_dump") else dict(user)
    event = body.event or "login"

    if event == "login":
        ip = (
            body.ip_address
            or request.headers.get("x-forwarded-for")
            or str(request.client.host if request.client else "")
            or None
        )
        activity_row: Dict[str, Any] = {
            "user_id": body.user_id,
            "user_name": body.user_name or (user_dict.get("user_metadata") or {}).get("full_name") or user_dict.get("email"),
            "user_email": body.user_email or user_dict.get("email"),
            "user_role": body.user_role or "user",
            "session_id": body.session_id,
            "login_time": datetime.now(timezone.utc).isoformat(),
            "device_name": body.device_name,
            "browser": body.browser,
            "operating_system": body.operating_system,
            "ip_address": ip,
            "status": "active",
            "metadata": body.metadata or {},
        }
        try:
            supabase.from_("login_activity").insert(activity_row).execute()
        except Exception as exc:
            # retry without user_email on column missing error
            msg = str(exc).lower()
            if "42703" in str(getattr(exc, "code", "")) or ("column" in msg and "not found" in msg):
                row_retry = {k: v for k, v in activity_row.items() if k != "user_email"}
                supabase.from_("login_activity").insert(row_retry).execute()
            else:
                raise
        return {"success": True}

    if event == "logout":
        session_id = body.session_id
        match = {"session_id": session_id} if session_id else {"user_id": body.user_id, "status": "active"}
        sessions_res = supabase.from_("login_activity").select("id, login_time").match(match).execute()
        logout_time = datetime.now(timezone.utc).isoformat()
        updated = 0
        for s in (sessions_res.data or []):
            try:
                login_dt = datetime.fromisoformat(s["login_time"])
                logout_dt = datetime.fromisoformat(logout_time)
                duration = max(0, int((logout_dt - login_dt).total_seconds()))
                supabase.from_("login_activity").update({
                    "logout_time": logout_time,
                    "session_duration": duration,
                    "status": "logged_out",
                    "updated_at": logout_time,
                }).eq("id", s["id"]).execute()
                updated += 1
            except Exception as exc:
                logger.warning("Failed to update logout for session %s: %s", s["id"], exc)
        return {"success": True, "updated": updated}

    raise HTTPException(status_code=400, detail="Unknown event type")


@router.get("/api/developer/login-activity/active")
async def active_sessions(
    page: int = Query(1),
    limit: int = Query(50),
    auth: Dict = Depends(verify_developer_access),
):
    supabase = get_supabase_client()
    offset = (page - 1) * limit
    try:
        res = (
            supabase.from_("login_activity")
            .select("*")
            .eq("status", "active")
            .order("login_time", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        now_ms = datetime.now(timezone.utc).timestamp()
        sessions = []
        for s in (res.data or []):
            try:
                login_dt = datetime.fromisoformat(s["login_time"]).timestamp()
                current_duration = max(0, int(now_ms - login_dt))
            except Exception:
                current_duration = 0
            sessions.append({**s, "current_duration": current_duration})
        return {"sessions": sessions, "page": page, "limit": limit, "total": len(sessions)}
    except Exception as exc:
        logger.exception("Active sessions error")
        raise HTTPException(status_code=500, detail="Failed to fetch active sessions")


@router.get("/api/developer/login-activity/history")
async def login_history(
    user_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    from_: Optional[str] = Query(None, alias="from"),
    to: Optional[str] = Query(None),
    page: int = Query(1),
    limit: int = Query(50),
    auth: Dict = Depends(verify_developer_access),
):
    supabase = get_supabase_client()
    offset = (page - 1) * limit
    try:
        query = supabase.from_("login_activity").select("*").order("login_time", desc=True)
        if user_id:
            query = query.eq("user_id", user_id)
        if from_:
            query = query.gte("login_time", datetime.fromisoformat(from_).isoformat())
        if to:
            query = query.lte("login_time", datetime.fromisoformat(to).isoformat())
        if search:
            s = search.lower()
            query = query.or_(
                f"user_name.ilike.%{s}%,device_name.ilike.%{s}%,browser.ilike.%{s}%,operating_system.ilike.%{s}%"
            )
        res = query.range(offset, offset + limit - 1).execute()
        return {"history": res.data or [], "page": page, "limit": limit}
    except Exception as exc:
        logger.exception("Login history error")
        raise HTTPException(status_code=500, detail="Failed to fetch login history")


class LogoutDeviceBody(BaseModel):
    session_id: str


@router.post("/api/developer/login-activity/logout-device")
async def logout_device(body: LogoutDeviceBody, auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    try:
        res = (
            supabase.from_("login_activity")
            .select("id, login_time")
            .eq("session_id", body.session_id)
            .maybe_single()
            .execute()
        )
        data = res.data
        if not data:
            raise HTTPException(status_code=404, detail="Session not found")
        logout_time = datetime.now(timezone.utc).isoformat()
        login_dt = datetime.fromisoformat(data["login_time"])
        logout_dt = datetime.fromisoformat(logout_time)
        duration = max(0, int((logout_dt - login_dt).total_seconds()))
        supabase.from_("login_activity").update({
            "logout_time": logout_time,
            "session_duration": duration,
            "status": "logged_out",
            "updated_at": logout_time,
        }).eq("id", data["id"]).execute()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Logout device error")
        raise HTTPException(status_code=500, detail="Failed to logout device")


class LogoutAllBody(BaseModel):
    user_id: str


@router.post("/api/developer/login-activity/logout-all")
async def logout_all(body: LogoutAllBody, auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    try:
        sessions_res = (
            supabase.from_("login_activity")
            .select("id, login_time")
            .eq("user_id", body.user_id)
            .eq("status", "active")
            .execute()
        )
        logout_time = datetime.now(timezone.utc).isoformat()
        updated = 0
        for s in (sessions_res.data or []):
            try:
                duration = max(0, int((datetime.fromisoformat(logout_time) - datetime.fromisoformat(s["login_time"])).total_seconds()))
                supabase.from_("login_activity").update({
                    "logout_time": logout_time,
                    "session_duration": duration,
                    "status": "logged_out",
                    "updated_at": logout_time,
                }).eq("id", s["id"]).execute()
                updated += 1
            except Exception as exc:
                logger.warning("Failed to update session during logout-all %s: %s", s["id"], exc)
        return {"success": True, "updated": updated}
    except Exception as exc:
        logger.exception("Logout all devices error")
        raise HTTPException(status_code=500, detail="Failed to logout all devices")


@router.post("/api/developer/login-activity/force-logout")
async def force_logout(body: LogoutAllBody, auth: Dict = Depends(verify_developer_access)):
    if auth["profile"].get("role") not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Admin only")
    supabase = get_supabase_client()
    try:
        sessions_res = (
            supabase.from_("login_activity")
            .select("id, login_time")
            .eq("user_id", body.user_id)
            .eq("status", "active")
            .execute()
        )
        logout_time = datetime.now(timezone.utc).isoformat()
        updated = 0
        for s in (sessions_res.data or []):
            try:
                duration = max(0, int((datetime.fromisoformat(logout_time) - datetime.fromisoformat(s["login_time"])).total_seconds()))
                supabase.from_("login_activity").update({
                    "logout_time": logout_time,
                    "session_duration": duration,
                    "status": "logged_out",
                    "updated_at": logout_time,
                }).eq("id", s["id"]).execute()
                updated += 1
            except Exception as exc:
                logger.warning("Failed to update session during force-logout %s: %s", s["id"], exc)
        return {"success": True, "updated": updated}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Force logout error")
        raise HTTPException(status_code=500, detail="Failed to force logout user")


@router.get("/api/developer/login-activity/analytics")
async def login_analytics(auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    try:
        start_of_day = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        today_res = (
            supabase.from_("login_activity")
            .select("id, user_id, device_name")
            .gte("login_time", start_of_day)
            .execute()
        )
        today_logins = today_res.data or []
        total_logins_today = len(today_logins)

        active_res = supabase.from_("login_activity").select("user_id").eq("status", "active").execute()
        active_users = len({r["user_id"] for r in (active_res.data or [])})

        counts: Dict[str, int] = {}
        device_counts: Dict[str, int] = {}
        for r in today_logins:
            uid = r["user_id"]
            counts[uid] = counts.get(uid, 0) + 1
            dn = r.get("device_name")
            if dn:
                device_counts[dn] = device_counts.get(dn, 0) + 1

        most_active_user = max(counts, key=lambda k: counts[k]) if counts else None
        most_used_device = max(device_counts, key=lambda k: device_counts[k]) if device_counts else None

        return {
            "totalLoginsToday": total_logins_today,
            "activeUsers": active_users,
            "mostActiveUser": most_active_user,
            "mostUsedDevice": most_used_device,
        }
    except Exception as exc:
        logger.exception("Login analytics error")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics")


# ============ CREDITS SUMMARY ============


@router.get("/api/developer/credits/summary")
async def credits_summary(auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    total_distributed = total_used = credits_left = 0.0
    daily: List[Dict] = []
    monthly: List[Dict] = []
    lifetime: Dict = {}
    schema_missing = False
    create_usage_logs_sql = (
        "CREATE TABLE IF NOT EXISTS usage_logs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), "
        "user_id uuid, credits_requested numeric, credits_charged numeric, feature_key text, "
        "wallet_type text, created_at timestamptz DEFAULT now());"
    )
    create_wallets_sql = (
        "CREATE TABLE IF NOT EXISTS credit_wallets (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), "
        "user_id uuid, wallet_type text, balance numeric DEFAULT 0, updated_at timestamptz DEFAULT now());"
    )

    try:
        logs_res = (
            supabase.from_("usage_logs")
            .select("credits_requested, credits_charged, created_at")
            .order("created_at", desc=False)
            .execute()
        )
        logs = logs_res.data or []
        total_distributed = sum(float(r.get("credits_requested") or 0) for r in logs)
        total_used = sum(float(r.get("credits_charged") or 0) for r in logs)

        by_day: Dict[str, float] = {}
        by_month: Dict[str, float] = {}
        for r in logs:
            try:
                d = datetime.fromisoformat(r["created_at"])
            except Exception:
                d = datetime.now(timezone.utc)
            day_key = d.strftime("%Y-%m-%d")
            month_key = d.strftime("%Y-%m")
            given = float(r.get("credits_requested") or 0)
            by_day[day_key] = by_day.get(day_key, 0) + given
            by_month[month_key] = by_month.get(month_key, 0) + given

        daily = [{"date": k, "credits": v} for k, v in sorted(by_day.items())]
        monthly = [{"month": k, "credits": v} for k, v in sorted(by_month.items())]
        lifetime = {"totalDistributed": total_distributed, "totalUsed": total_used}
    except Exception as exc:
        logger.warning("Error aggregating usage_logs: %s", exc)
        schema_missing = True

    try:
        wallets_res = (
            supabase.from_("tester_credit_wallets")
            .select("balance")
            .eq("wallet_type", "tester_credits")
            .execute()
        )
        credits_left = sum(float(w.get("balance") or 0) for w in (wallets_res.data or []))
    except Exception as exc:
        logger.warning("Error querying tester_credit_wallets: %s", exc)
        schema_missing = True

    overall_unused = max(0.0, total_distributed - total_used)

    return {
        "totalDistributed": total_distributed,
        "daily": daily,
        "monthly": monthly,
        "lifetime": lifetime,
        "totalUsed": total_used,
        "creditsLeft": credits_left,
        "overallUnused": overall_unused,
        "savedCredits": credits_left,
        "schemaMissing": schema_missing,
        "createUsageLogsSql": create_usage_logs_sql if schema_missing else None,
        "createWalletsSql": create_wallets_sql if schema_missing else None,
    }


# ============ COSTS ============

CREATE_EXPENSES_SQL = (
    "CREATE TABLE IF NOT EXISTS expenses (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), "
    "amount numeric NOT NULL, category text NOT NULL, month int NOT NULL, year int NOT NULL, "
    "notes text, created_at timestamptz NOT NULL DEFAULT now());"
)


@router.get("/api/developer/costs")
async def get_costs(auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    now_dt = datetime.now(timezone.utc)
    current_year = now_dt.year
    current_month = now_dt.month
    schema_missing = False
    expenses: List[Dict] = []

    try:
        res = (
            supabase.from_("expenses")
            .select("id, amount, category, month, year, notes, created_at")
            .order("created_at", desc=True)
            .execute()
        )
        expenses = res.data or []
    except Exception as exc:
        logger.warning("Failed to read expenses: %s", exc)
        schema_missing = True

    totals: Dict[str, Any] = {
        "total": 0,
        "currentMonth": 0,
        "currentYear": 0,
        "previousMonths": [],
        "previousYears": [],
    }

    if not schema_missing:
        totals["total"] = sum(float(r.get("amount") or 0) for r in expenses)
        totals["currentMonth"] = sum(
            float(r.get("amount") or 0)
            for r in expenses
            if r.get("month") == current_month and r.get("year") == current_year
        )
        totals["currentYear"] = sum(
            float(r.get("amount") or 0) for r in expenses if r.get("year") == current_year
        )

        by_month: Dict[str, float] = {}
        for r in expenses:
            key = f"{r['year']}-{str(r['month']).zfill(2)}"
            by_month[key] = by_month.get(key, 0) + float(r.get("amount") or 0)

        current_month_key = f"{current_year}-{str(current_month).zfill(2)}"
        totals["previousMonths"] = [
            {"label": f"{k[5:]}/{k[:4]}", "amount": v}
            for k, v in sorted(by_month.items(), reverse=True)
            if k != current_month_key
        ][:6]

        by_year: Dict[int, float] = {}
        for r in expenses:
            yr = r["year"]
            by_year[yr] = by_year.get(yr, 0) + float(r.get("amount") or 0)

        totals["previousYears"] = [
            {"label": str(yr), "amount": amt}
            for yr, amt in sorted(by_year.items(), reverse=True)
            if yr != current_year
        ][:5]

    return {
        "schemaMissing": schema_missing,
        "createExpensesTableSql": CREATE_EXPENSES_SQL if schema_missing else None,
        "expenses": expenses,
        "totals": totals,
        "currentMonth": {"month": current_month, "year": current_year},
    }


class CreateExpenseBody(BaseModel):
    amount: float
    category: str
    month: int
    year: int
    notes: Optional[str] = ""


@router.post("/api/developer/costs")
async def create_cost(body: CreateExpenseBody, auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    payload = {
        "amount": body.amount,
        "category": body.category.upper(),
        "month": body.month,
        "year": body.year,
        "notes": body.notes or "",
    }
    try:
        res = supabase.from_("expenses").insert(payload).select("*").execute()
        return {"expense": (res.data or [None])[0]}
    except Exception as exc:
        msg = str(exc).lower()
        if "42p01" in str(getattr(exc, "code", "")).lower() or "does not exist" in msg:
            raise HTTPException(status_code=500, detail="Expenses table missing")
        logger.exception("Create expense error")
        raise HTTPException(status_code=500, detail="Failed to create expense")


class UpdateExpenseBody(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    month: Optional[int] = None
    year: Optional[int] = None
    notes: Optional[str] = None


@router.patch("/api/developer/costs/{expense_id}")
async def update_cost(expense_id: str, body: UpdateExpenseBody, auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    updates: Dict[str, Any] = {}
    if body.amount is not None:
        updates["amount"] = body.amount
    if body.category is not None:
        updates["category"] = body.category.upper()
    if body.month is not None:
        updates["month"] = body.month
    if body.year is not None:
        updates["year"] = body.year
    if body.notes is not None:
        updates["notes"] = body.notes
    try:
        res = supabase.from_("expenses").update(updates).eq("id", expense_id).select("*").execute()
        return {"expense": (res.data or [None])[0]}
    except Exception as exc:
        msg = str(exc).lower()
        if "42p01" in str(getattr(exc, "code", "")).lower() or "does not exist" in msg:
            raise HTTPException(status_code=500, detail="Expenses table missing")
        logger.exception("Update expense error")
        raise HTTPException(status_code=500, detail="Failed to update expense")


@router.delete("/api/developer/costs/{expense_id}")
async def delete_cost(expense_id: str, auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    try:
        supabase.from_("expenses").delete().eq("id", expense_id).execute()
        return {"success": True}
    except Exception as exc:
        msg = str(exc).lower()
        if "42p01" in str(getattr(exc, "code", "")).lower() or "does not exist" in msg:
            raise HTTPException(status_code=500, detail="Expenses table missing")
        logger.exception("Delete expense error")
        raise HTTPException(status_code=500, detail="Failed to delete expense")


# ============ REVENUE / PROFIT ============


@router.get("/api/developer/revenue-profit")
async def revenue_profit(auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    now_dt = datetime.now(timezone.utc)
    current_year = now_dt.year
    current_month = now_dt.month

    revenue_data: Dict[str, Any] = {
        "currentMonth": {"revenue": 0, "expenses": 0, "profit": 0},
        "currentYear": {"revenue": 0, "expenses": 0, "profit": 0},
        "all": {"revenue": 0, "expenses": 0, "profit": 0},
        "breakdown": {"revenue": {}, "expenses": {}},
    }

    try:
        payments_res = (
            supabase.from_("payments")
            .select("amount, payment_date, status")
            .eq("status", "completed")
            .execute()
        )
        payments = payments_res.data or []
    except Exception:
        payments = []

    try:
        expenses_res = supabase.from_("expenses").select("amount, category, month, year").execute()
        expenses = expenses_res.data or []
    except Exception:
        expenses = []

    revenue_by_month: Dict[str, float] = {}
    revenue_by_year: Dict[int, float] = {}
    total_revenue = 0.0

    for p in payments:
        try:
            dt = datetime.fromisoformat(p["payment_date"])
        except Exception:
            continue
        m = dt.month
        yr = dt.year
        amt = float(p.get("amount") or 0)
        total_revenue += amt
        mk = f"{yr}-{str(m).zfill(2)}"
        revenue_by_month[mk] = revenue_by_month.get(mk, 0) + amt
        revenue_by_year[yr] = revenue_by_year.get(yr, 0) + amt
        if m == current_month and yr == current_year:
            revenue_data["currentMonth"]["revenue"] += amt
        if yr == current_year:
            revenue_data["currentYear"]["revenue"] += amt

    expenses_by_month: Dict[str, float] = {}
    expenses_by_year: Dict[int, float] = {}
    expenses_by_category: Dict[str, float] = {}
    total_expenses = 0.0

    for e in expenses:
        amt = float(e.get("amount") or 0)
        cat = str(e.get("category") or "OTHER")
        total_expenses += amt
        expenses_by_category[cat] = expenses_by_category.get(cat, 0) + amt
        mk = f"{e['year']}-{str(e['month']).zfill(2)}"
        expenses_by_month[mk] = expenses_by_month.get(mk, 0) + amt
        expenses_by_year[e["year"]] = expenses_by_year.get(e["year"], 0) + amt
        if e["month"] == current_month and e["year"] == current_year:
            revenue_data["currentMonth"]["expenses"] += amt
        if e["year"] == current_year:
            revenue_data["currentYear"]["expenses"] += amt

    revenue_data["currentMonth"]["profit"] = (
        revenue_data["currentMonth"]["revenue"] - revenue_data["currentMonth"]["expenses"]
    )
    revenue_data["currentYear"]["profit"] = (
        revenue_data["currentYear"]["revenue"] - revenue_data["currentYear"]["expenses"]
    )
    revenue_data["all"] = {
        "revenue": total_revenue,
        "expenses": total_expenses,
        "profit": total_revenue - total_expenses,
    }

    all_months = sorted(set(list(revenue_by_month) + list(expenses_by_month)), reverse=True)[:12]
    historical = [
        {
            "label": mk,
            "revenue": revenue_by_month.get(mk, 0),
            "expenses": expenses_by_month.get(mk, 0),
            "profit": revenue_by_month.get(mk, 0) - expenses_by_month.get(mk, 0),
        }
        for mk in all_months
    ]

    yearly = [
        {
            "label": str(yr),
            "revenue": revenue_by_year.get(yr, 0),
            "expenses": expenses_by_year.get(yr, 0),
            "profit": revenue_by_year.get(yr, 0) - expenses_by_year.get(yr, 0),
        }
        for yr in sorted(revenue_by_year, reverse=True)
    ]

    revenue_data["breakdown"]["revenue"] = {
        "total": total_revenue,
        "byMonth": dict(sorted(revenue_by_month.items(), reverse=True)[:6]),
    }
    revenue_data["breakdown"]["expenses"] = {
        "total": total_expenses,
        "byCategory": expenses_by_category,
        "byMonth": dict(sorted(expenses_by_month.items(), reverse=True)[:6]),
    }

    return {
        "success": True,
        "data": revenue_data,
        "historical": historical,
        "yearly": yearly,
        "currentPeriod": {"month": current_month, "year": current_year},
    }


# ============ SNAPSHOTS ============


@router.get("/api/developer/snapshots")
async def get_snapshots(year: Optional[int] = Query(None), auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    try:
        query = (
            supabase.from_("monthly_snapshots")
            .select("*")
            .order("year", desc=True)
            .order("month", desc=True)
        )
        if year is not None:
            query = query.eq("year", year)
        res = query.limit(24).execute()
        data = res.data or []
        return {"snapshots": data, "total": len(data)}
    except Exception as exc:
        logger.exception("Snapshots fetch error")
        raise HTTPException(status_code=500, detail="Failed to fetch snapshots")


class StoreSnapshotBody(BaseModel):
    totalRevenue: Optional[float] = 0
    totalExpenses: Optional[float] = 0
    activeUsers: Optional[int] = 0


@router.post("/api/developer/snapshots/store")
async def store_snapshot(body: StoreSnapshotBody, auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    now_dt = datetime.now(timezone.utc)
    month = now_dt.month
    year = now_dt.year
    net_profit = (body.totalRevenue or 0) - (body.totalExpenses or 0)
    try:
        res = (
            supabase.from_("monthly_snapshots")
            .upsert(
                {
                    "month": month,
                    "year": year,
                    "total_revenue": float(body.totalRevenue or 0),
                    "total_expenses": float(body.totalExpenses or 0),
                    "net_profit": net_profit,
                    "active_users": int(body.activeUsers or 0),
                    "updated_at": now_dt.isoformat(),
                },
                on_conflict="month,year",
            )
            .select()
            .execute()
        )
        return {"success": True, "snapshot": (res.data or [None])[0]}
    except Exception as exc:
        logger.exception("Snapshot store error")
        raise HTTPException(status_code=500, detail="Failed to store snapshot")


# ============ CREDIT TRANSACTIONS ============


@router.get("/api/developer/credits/transactions")
async def credit_transactions(
    page: int = Query(1),
    limit: int = Query(50),
    auth: Dict = Depends(verify_developer_access),
):
    supabase = get_supabase_client()
    offset = (page - 1) * limit
    try:
        res = (
            supabase.from_("usage_logs")
            .select("id, user_id, wallet_type, credits_charged, feature_key, created_at")
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        transactions = res.data or []
        user_ids = list({t["user_id"] for t in transactions if t.get("user_id")})
        users_res = (
            supabase.from_("app_profiles").select("id, email").in_("id", user_ids).execute()
            if user_ids
            else None
        )
        user_map = {u["id"]: u.get("email") for u in ((users_res.data or []) if users_res else [])}

        return {
            "transactions": [
                {
                    "id": t["id"],
                    "user": user_map.get(t["user_id"]) or "Unknown",
                    "type": "usage" if t.get("wallet_type") == "user_credits" else "admin",
                    "amount": t.get("credits_charged"),
                    "reason": t.get("feature_key"),
                    "date": t.get("created_at") or "",
                }
                for t in transactions
            ],
            "page": page,
            "limit": limit,
        }
    except Exception as exc:
        logger.exception("Transactions error")
        raise HTTPException(status_code=500, detail="Failed to fetch transactions")


# ============ TESTER CREDITS ============


@router.get("/api/developer/testers")
async def list_testers(auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    try:
        auth_result = supabase.auth.admin.list_users()
        auth_users = auth_result if isinstance(auth_result, list) else []
        profiles = await select_app_profiles(ids=[u.id for u in auth_users]) if auth_users else []
        profile_by_id = {p["id"]: p for p in profiles}

        tester_users = [
            u for u in auth_users
            if is_tester_account(
                u.model_dump() if hasattr(u, "model_dump") else dict(u),
                profile_by_id.get(u.id),
            )
        ]

        testers = []
        for au in tester_users:
            au_dict = au.model_dump() if hasattr(au, "model_dump") else dict(au)
            profile = profile_by_id.get(au_dict["id"])
            total_used_res = (
                supabase.from_("usage_logs")
                .select("*", count="exact", head=True)
                .eq("user_id", au_dict["id"])
                .eq("wallet_type", "developer_credits")
                .execute()
            )
            email = (profile or {}).get("email") or au_dict.get("email") or ""
            name = (
                (profile or {}).get("full_name")
                or (au_dict.get("user_metadata") or {}).get("full_name")
                or (au_dict.get("user_metadata") or {}).get("name")
                or email.split("@")[0]
                or email
            )
            testers.append({
                "id": au_dict["id"],
                "email": email,
                "name": name,
                "currentCredits": await get_developer_credit_balance(au_dict["id"], profile),
                "weeklyAllocation": 500,
                "totalUsed": total_used_res.count or 0,
                "status": "inactive" if (profile or {}).get("subscription_status") == "suspended" else "active",
            })

        return {"testers": testers}
    except Exception as exc:
        logger.exception("Tester list error")
        raise HTTPException(status_code=500, detail="Failed to fetch testers")


class CreateTesterBody(BaseModel):
    email: str
    fullName: str


@router.post("/api/developer/testers")
async def create_tester(body: CreateTesterBody, auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    email = body.email.strip().lower()
    full_name = body.fullName.strip()

    if not email or not full_name:
        raise HTTPException(status_code=400, detail="Email and full name are required")

    email_re = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    if not email_re.match(email):
        raise HTTPException(status_code=400, detail="Enter a valid email address")

    try:
        existing_res = (
            supabase.from_("app_profiles")
            .select("id, email")
            .eq("email", email)
            .maybe_single()
            .execute()
        )
        existing = existing_res.data

        if existing:
            await upsert_tester_profile(
                profile_id=existing["id"], email=email, full_name=full_name, developer_credits=0
            )
            return {"success": True, "mode": "updated", "email": email}

        import random, string
        temporary_password = "".join(random.choices(string.ascii_lowercase + string.digits, k=8)) + "T9!"
        created = supabase.auth.admin.create_user({
            "email": email,
            "password": temporary_password,
            "email_confirm": True,
            "user_metadata": {"full_name": full_name},
        })
        created_user = getattr(created, "user", None)
        if not created_user:
            raise HTTPException(status_code=500, detail="Failed to create tester account")

        tester_id = created_user.id
        await upsert_tester_profile(
            profile_id=tester_id, email=email, full_name=full_name, developer_credits=0
        )
        supabase.from_("tester_credit_wallets").upsert(
            [{"user_id": tester_id, "wallet_type": "tester_credits", "balance": 0, "is_unlimited": False}],
            on_conflict="user_id,wallet_type",
        ).execute()

        return {"success": True, "mode": "created", "email": email, "temporaryPassword": temporary_password}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Create tester error")
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/developer/testers/{tester_id}/credits")
async def tester_credits(
    tester_id: str,
    authorization: Optional[str] = Header(None),
):
    auth = await verify_tester_or_developer_access(tester_id=tester_id, authorization=authorization)
    supabase = get_supabase_client()
    try:
        tester_res = (
            supabase.from_("app_profiles")
            .select("developer_credits")
            .eq("id", tester_id)
            .maybe_single()
            .execute()
        )
        tester = tester_res.data
        if not tester:
            raise HTTPException(status_code=404, detail="Tester not found")

        current_balance = await get_developer_credit_balance(tester_id, tester)
        now_dt = datetime.now(timezone.utc)
        week_ago = (now_dt - timedelta(days=7)).isoformat()
        month_ago = (now_dt - timedelta(days=30)).isoformat()

        weekly_res = (
            supabase.from_("usage_logs")
            .select("credits_charged")
            .eq("user_id", tester_id)
            .eq("wallet_type", "developer_credits")
            .gt("created_at", week_ago)
            .execute()
        )
        monthly_res = (
            supabase.from_("usage_logs")
            .select("credits_charged")
            .eq("user_id", tester_id)
            .eq("wallet_type", "developer_credits")
            .gt("created_at", month_ago)
            .execute()
        )
        weekly_used = sum(max(float(r.get("credits_charged") or 0), 0) for r in (weekly_res.data or []))
        monthly_used = sum(max(float(r.get("credits_charged") or 0), 0) for r in (monthly_res.data or []))

        return {
            "currentBalance": current_balance,
            "weeklyAllocation": 500,
            "weeklyUsed": weekly_used,
            "monthlyUsed": monthly_used,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Tester credits error")
        raise HTTPException(status_code=500, detail="Failed to fetch tester credits")


@router.get("/api/developer/testers/{tester_id}/credits/history")
async def tester_credit_history(
    tester_id: str,
    authorization: Optional[str] = Header(None),
):
    auth = await verify_tester_or_developer_access(tester_id=tester_id, authorization=authorization)
    supabase = get_supabase_client()
    try:
        res = (
            supabase.from_("usage_logs")
            .select("id, user_id, credits_charged, feature_key, created_at, metadata")
            .eq("user_id", tester_id)
            .eq("wallet_type", "developer_credits")
            .order("created_at", desc=True)
            .limit(50)
            .execute()
        )
        transactions = []
        for log in (res.data or []):
            amount = abs(float(log.get("credits_charged") or 0))
            fk = log.get("feature_key") or ""
            cc = float(log.get("credits_charged") or 0)
            if fk == "credit_refunded":
                tx_type = "refunded"
            elif cc > 0:
                tx_type = "used"
            else:
                tx_type = "assigned"
            meta = log.get("metadata") or {}
            transactions.append({
                "id": log["id"],
                "testerId": log["user_id"],
                "amount": amount,
                "reason": meta.get("reason") or fk,
                "assignedBy": meta.get("assignedBy") or meta.get("assigned_by") or "System",
                "timestamp": log.get("created_at") or "",
                "type": tx_type,
            })
        return {"transactions": transactions}
    except Exception as exc:
        logger.exception("Tester credit history error")
        raise HTTPException(status_code=500, detail="Failed to fetch tester credit history")


class AssignCreditsBody(BaseModel):
    amount: float
    reason: Optional[str] = None


@router.post("/api/developer/testers/{tester_id}/credits/assign")
async def assign_tester_credits(
    tester_id: str,
    body: AssignCreditsBody,
    auth: Dict = Depends(verify_developer_access),
):
    supabase = get_supabase_client()
    credit_amount = float(body.amount)
    if credit_amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")

    try:
        auth_user_res = supabase.auth.admin.get_user_by_id(tester_id)
        auth_user = getattr(auth_user_res, "user", None)
        if not auth_user:
            raise HTTPException(status_code=404, detail="Tester not found")

        auth_user_dict = auth_user.model_dump() if hasattr(auth_user, "model_dump") else dict(auth_user)
        existing_profile = await select_app_profile_by_id(tester_id)
        if not is_tester_account(auth_user_dict, existing_profile):
            raise HTTPException(status_code=404, detail="Tester not found")

        tester_email = (existing_profile or {}).get("email") or auth_user_dict.get("email") or ""
        tester_name = (
            (existing_profile or {}).get("full_name")
            or (auth_user_dict.get("user_metadata") or {}).get("full_name")
            or tester_email.split("@")[0]
            or tester_email
        )

        if not existing_profile:
            await upsert_tester_profile(
                profile_id=tester_id, email=tester_email, full_name=tester_name, developer_credits=0
            )

        wallet_res = (
            supabase.from_("tester_credit_wallets")
            .select("id")
            .eq("user_id", tester_id)
            .eq("wallet_type", "tester_credits")
            .maybe_single()
            .execute()
        )
        if not wallet_res.data:
            supabase.from_("tester_credit_wallets").insert({
                "user_id": tester_id,
                "wallet_type": "tester_credits",
                "balance": 0,
                "is_unlimited": False,
            }).execute()

        new_balance = (await get_developer_credit_balance(tester_id, existing_profile)) + credit_amount

        supabase.from_("tester_credit_wallets").upsert(
            {"user_id": tester_id, "wallet_type": "tester_credits", "balance": new_balance, "is_unlimited": False},
            on_conflict="user_id,wallet_type",
        ).execute()

        supabase.from_("usage_logs").insert({
            "user_id": tester_id,
            "actor_role": auth["profile"]["role"],
            "portal": "internal",
            "usage_type": "test",
            "wallet_type": "developer_credits",
            "feature_key": "credit_added",
            "credits_requested": 0,
            "credits_charged": -credit_amount,
            "status": "completed",
            "metadata": {
                "reason": body.reason or "Manual tester credit assignment",
                "assignedBy": auth["profile"].get("email") or auth["user"].get("email") or "Developer",
                "assigned_by": auth["user"]["id"],
            },
        }).execute()

        return {"success": True, "newBalance": new_balance}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Assign tester credits error")
        raise HTTPException(status_code=500, detail=str(exc))


# ============ ANALYTICS ============


@router.get("/api/developer/analytics")
async def analytics(
    timeRange: str = Query("7d"),
    auth: Dict = Depends(verify_developer_access),
):
    supabase = get_supabase_client()
    try:
        now_dt = datetime.now(timezone.utc)
        if timeRange == "today":
            start_date = now_dt.replace(hour=0, minute=0, second=0, microsecond=0)
        elif timeRange == "30d":
            start_date = now_dt - timedelta(days=30)
        else:
            start_date = now_dt - timedelta(days=7)
        start_date_iso = start_date.isoformat()

        dau_res = (
            supabase.from_("usage_logs")
            .select("*", count="exact", head=True)
            .gt("created_at", (now_dt - timedelta(days=1)).isoformat())
            .execute()
        )
        wau_res = (
            supabase.from_("usage_logs")
            .select("*", count="exact", head=True)
            .gt("created_at", (now_dt - timedelta(days=7)).isoformat())
            .execute()
        )
        mau_res = (
            supabase.from_("usage_logs")
            .select("*", count="exact", head=True)
            .gt("created_at", (now_dt - timedelta(days=30)).isoformat())
            .execute()
        )

        all_users_res = (
            supabase.from_("usage_logs")
            .select("user_id")
            .gt("created_at", start_date_iso)
            .execute()
        )
        user_counts: Dict[str, int] = {}
        for log in (all_users_res.data or []):
            uid = log["user_id"]
            user_counts[uid] = user_counts.get(uid, 0) + 1

        returning_users = sum(1 for c in user_counts.values() if c > 1)
        unique_users = len(user_counts)
        retention_rate = round((returning_users / unique_users) * 100) if unique_users > 0 else 0

        return {
            "dau": dau_res.count or 0,
            "wau": wau_res.count or 0,
            "mau": mau_res.count or 0,
            "retentionRate": retention_rate,
        }
    except Exception as exc:
        logger.exception("Analytics error")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics")


# ============ FEEDBACK ============


@router.get("/api/developer/feedback")
async def get_feedback(auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    try:
        res = supabase.from_("feedback_logs").select("*").order("created_at", desc=True).execute()
        return {"feedback": res.data or []}
    except Exception:
        return {"feedback": []}


# ============ ERROR LOGS ============


@router.get("/api/developer/error-logs")
async def error_logs(
    timeRange: str = Query("all"),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    auth: Dict = Depends(verify_developer_access),
):
    supabase = get_supabase_client()
    try:
        query = supabase.from_("error_logs").select("*")
        if timeRange != "all":
            now_dt = datetime.now(timezone.utc)
            if timeRange == "today":
                start_date = now_dt.replace(hour=0, minute=0, second=0, microsecond=0)
            elif timeRange == "last7days":
                start_date = now_dt - timedelta(days=7)
            else:
                start_date = now_dt
            query = query.gte("timestamp", start_date.isoformat())

        if severity:
            query = query.in_("severity", severity.split(","))
        if status:
            query = query.in_("status", status.split(","))

        res = query.order("timestamp", desc=True).execute()
        logs = res.data or []
        if search:
            search_lower = search.lower()
            logs = [
                log for log in logs
                if (
                    search_lower in str(log.get("error_message") or "").lower()
                    or search_lower in str(log.get("module") or "").lower()
                    or search_lower in str(log.get("route") or "").lower()
                )
            ]
        return {"errorLogs": logs}
    except Exception as exc:
        logger.exception("Error logs error")
        raise HTTPException(status_code=500, detail="Failed to fetch error logs")


# ============ SETTINGS ============


@router.get("/api/developer/settings")
async def get_settings(auth: Dict = Depends(verify_developer_access)):
    return {
        "aiModel": "gpt-4",
        "temperature": 0.7,
        "maxTokens": 2000,
        "creditMultiplier": 1.0,
        "dailyBudget": 100000,
        "enableBeta": True,
        "notifyOnErrors": True,
    }


@router.post("/api/developer/settings")
async def update_settings(request: Request, auth: Dict = Depends(verify_developer_access)):
    settings = await request.json()
    return {"success": True, "settings": settings}


# ============ PROFIT DISTRIBUTION ============


@router.get("/api/developer/profit-distribution/settings")
async def get_profit_distribution_settings(auth: Dict = Depends(verify_developer_access)):
    return {"success": True, "settings": _profit_distribution_settings}


class ProfitDistributionSettingsBody(BaseModel):
    reservePercentage: Optional[float] = None
    growthPercentage: Optional[float] = None
    workerPercentage: Optional[float] = None


@router.patch("/api/developer/profit-distribution/settings")
async def update_profit_distribution_settings(
    body: ProfitDistributionSettingsBody,
    auth: Dict = Depends(verify_developer_access),
):
    global _profit_distribution_settings
    reserve = float(body.reservePercentage if body.reservePercentage is not None else _profit_distribution_settings["reservePercentage"])
    growth = float(body.growthPercentage if body.growthPercentage is not None else _profit_distribution_settings["growthPercentage"])
    worker = float(body.workerPercentage if body.workerPercentage is not None else _profit_distribution_settings["workerPercentage"])

    if reserve < 0 or growth < 0 or worker < 0:
        raise HTTPException(status_code=400, detail="Percentages must be non-negative")
    if round(reserve + growth + worker) != 100:
        raise HTTPException(status_code=400, detail="Percentages must total 100")

    _profit_distribution_settings = {
        "reservePercentage": reserve,
        "growthPercentage": growth,
        "workerPercentage": worker,
    }
    return {"success": True, "settings": _profit_distribution_settings}


@router.get("/api/developer/profit-distribution")
async def profit_distribution(
    month: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    auth: Dict = Depends(verify_developer_access),
):
    supabase = get_supabase_client()
    now_dt = datetime.now(timezone.utc)
    current_month = now_dt.month
    current_year = now_dt.year

    try:
        payments_res = (
            supabase.from_("payments")
            .select("amount, payment_date, status")
            .eq("status", "completed")
            .execute()
        )
        payments = payments_res.data or []
    except Exception:
        payments = []

    try:
        expenses_res = supabase.from_("expenses").select("amount, month, year").execute()
        expenses = expenses_res.data or []
    except Exception:
        expenses = []

    revenue_by_month: Dict[str, float] = {}
    revenue_by_year: Dict[int, float] = {}
    expenses_by_month: Dict[str, float] = {}
    expenses_by_year: Dict[int, float] = {}

    for p in payments:
        try:
            dt = datetime.fromisoformat(p["payment_date"])
        except Exception:
            continue
        m = dt.month
        yr = dt.year
        amt = float(p.get("amount") or 0)
        mk = f"{yr}-{str(m).zfill(2)}"
        revenue_by_month[mk] = revenue_by_month.get(mk, 0) + amt
        revenue_by_year[yr] = revenue_by_year.get(yr, 0) + amt

    for e in expenses:
        amt = float(e.get("amount") or 0)
        mk = f"{e['year']}-{str(e['month']).zfill(2)}"
        expenses_by_month[mk] = expenses_by_month.get(mk, 0) + amt
        expenses_by_year[e["year"]] = expenses_by_year.get(e["year"], 0) + amt

    all_month_keys = sorted(set(list(revenue_by_month) + list(expenses_by_month)))
    monthly = [
        build_distribution_row(
            mk,
            revenue_by_month.get(mk, 0),
            expenses_by_month.get(mk, 0),
            revenue_by_month.get(mk, 0) - expenses_by_month.get(mk, 0),
            _profit_distribution_settings,
        )
        for mk in all_month_keys
    ]

    all_years = sorted(set(list(revenue_by_year) + list(expenses_by_year)))
    yearly = [
        build_distribution_row(
            str(yr),
            revenue_by_year.get(yr, 0),
            expenses_by_year.get(yr, 0),
            revenue_by_year.get(yr, 0) - expenses_by_year.get(yr, 0),
            _profit_distribution_settings,
        )
        for yr in all_years
    ]

    summary_month = month or current_month
    summary_year = year or current_year
    summary_mk = f"{summary_year}-{str(summary_month).zfill(2)}"
    summary_rev = revenue_by_month.get(summary_mk, 0)
    summary_exp = expenses_by_month.get(summary_mk, 0)
    summary = build_distribution_row(
        "Current Period", summary_rev, summary_exp, summary_rev - summary_exp, _profit_distribution_settings
    )

    return {
        "success": True,
        "settings": _profit_distribution_settings,
        "summary": summary,
        "monthly": monthly,
        "yearly": yearly,
        "currentPeriod": {"month": current_month, "year": current_year},
    }


# ============ GROWTH ANALYTICS ============


@router.get("/api/developer/analytics/monthly-revenue-growth")
async def monthly_revenue_growth(auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    try:
        res = (
            supabase.from_("payments")
            .select("amount, payment_date")
            .eq("status", "completed")
            .order("payment_date", desc=False)
            .execute()
        )
        by_month: Dict[str, float] = {}
        for p in (res.data or []):
            try:
                dt = datetime.fromisoformat(p["payment_date"])
                mk = f"{dt.year}-{str(dt.month).zfill(2)}"
                by_month[mk] = by_month.get(mk, 0) + float(p.get("amount") or 0)
            except Exception:
                continue
        entries = sorted(by_month.items())
        data = [
            {
                "month": mk,
                "revenue": rev,
                "growth": calculate_growth(rev, entries[idx - 1][1]) if idx > 0 else 0,
            }
            for idx, (mk, rev) in enumerate(entries)
        ]
        return {"data": data, "total": len(data)}
    except Exception as exc:
        logger.exception("Monthly revenue growth error")
        raise HTTPException(status_code=500, detail="Failed to fetch monthly revenue growth")


@router.get("/api/developer/analytics/yearly-revenue-growth")
async def yearly_revenue_growth(auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    try:
        res = (
            supabase.from_("payments")
            .select("amount, payment_date")
            .eq("status", "completed")
            .order("payment_date", desc=False)
            .execute()
        )
        by_year: Dict[int, float] = {}
        for p in (res.data or []):
            try:
                yr = datetime.fromisoformat(p["payment_date"]).year
                by_year[yr] = by_year.get(yr, 0) + float(p.get("amount") or 0)
            except Exception:
                continue
        entries = sorted(by_year.items())
        data = [
            {
                "year": str(yr),
                "revenue": rev,
                "growth": calculate_growth(rev, entries[idx - 1][1]) if idx > 0 else 0,
            }
            for idx, (yr, rev) in enumerate(entries)
        ]
        return {"data": data, "total": len(data)}
    except Exception as exc:
        logger.exception("Yearly revenue growth error")
        raise HTTPException(status_code=500, detail="Failed to fetch yearly revenue growth")


@router.get("/api/developer/analytics/monthly-profit-growth")
async def monthly_profit_growth(auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    try:
        pay_res = (
            supabase.from_("payments")
            .select("amount, payment_date")
            .eq("status", "completed")
            .execute()
        )
        exp_res = supabase.from_("expenses").select("amount, month, year").execute()

        revenue_by_month: Dict[str, float] = {}
        for p in (pay_res.data or []):
            try:
                dt = datetime.fromisoformat(p["payment_date"])
                mk = f"{dt.year}-{str(dt.month).zfill(2)}"
                revenue_by_month[mk] = revenue_by_month.get(mk, 0) + float(p.get("amount") or 0)
            except Exception:
                continue

        expenses_by_month: Dict[str, float] = {}
        for e in (exp_res.data or []):
            mk = f"{e['year']}-{str(e['month']).zfill(2)}"
            expenses_by_month[mk] = expenses_by_month.get(mk, 0) + float(e.get("amount") or 0)

        all_months = sorted(set(list(revenue_by_month) + list(expenses_by_month)))
        profits = [
            {"month": mk, "profit": revenue_by_month.get(mk, 0) - expenses_by_month.get(mk, 0)}
            for mk in all_months
        ]
        data = [
            {
                **item,
                "growth": calculate_growth(item["profit"], profits[idx - 1]["profit"]) if idx > 0 else 0,
            }
            for idx, item in enumerate(profits)
        ]
        return {"data": data, "total": len(data)}
    except Exception as exc:
        logger.exception("Monthly profit growth error")
        raise HTTPException(status_code=500, detail="Failed to fetch monthly profit growth")


@router.get("/api/developer/analytics/yearly-profit-growth")
async def yearly_profit_growth(auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    try:
        pay_res = (
            supabase.from_("payments")
            .select("amount, payment_date")
            .eq("status", "completed")
            .execute()
        )
        exp_res = supabase.from_("expenses").select("amount, month, year").execute()

        revenue_by_year: Dict[int, float] = {}
        for p in (pay_res.data or []):
            try:
                yr = datetime.fromisoformat(p["payment_date"]).year
                revenue_by_year[yr] = revenue_by_year.get(yr, 0) + float(p.get("amount") or 0)
            except Exception:
                continue

        expenses_by_year: Dict[int, float] = {}
        for e in (exp_res.data or []):
            expenses_by_year[e["year"]] = expenses_by_year.get(e["year"], 0) + float(e.get("amount") or 0)

        all_years = sorted(set(list(revenue_by_year) + list(expenses_by_year)))
        profits = [
            {"year": str(yr), "profit": revenue_by_year.get(yr, 0) - expenses_by_year.get(yr, 0)}
            for yr in all_years
        ]
        data = [
            {
                **item,
                "growth": calculate_growth(item["profit"], profits[idx - 1]["profit"]) if idx > 0 else 0,
            }
            for idx, item in enumerate(profits)
        ]
        return {"data": data, "total": len(data)}
    except Exception as exc:
        logger.exception("Yearly profit growth error")
        raise HTTPException(status_code=500, detail="Failed to fetch yearly profit growth")


@router.get("/api/developer/analytics/monthly-users")
async def monthly_users(auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    try:
        res = (
            supabase.from_("app_profiles")
            .select("created_at")
            .order("created_at", desc=False)
            .execute()
        )
        by_month: Dict[str, int] = {}
        for p in (res.data or []):
            try:
                dt = datetime.fromisoformat(p["created_at"])
                mk = f"{dt.year}-{str(dt.month).zfill(2)}"
                by_month[mk] = by_month.get(mk, 0) + 1
            except Exception:
                continue
        entries = sorted(by_month.items())
        cumulative = 0
        intermediate = []
        for mk, count in entries:
            cumulative += count
            intermediate.append({"month": mk, "newUsers": count, "totalUsers": cumulative})
        data = [
            {
                **item,
                "growth": calculate_growth(item["totalUsers"], intermediate[idx - 1]["totalUsers"]) if idx > 0 else 0,
            }
            for idx, item in enumerate(intermediate)
        ]
        return {"data": data, "total": len(data)}
    except Exception as exc:
        logger.exception("Monthly users error")
        raise HTTPException(status_code=500, detail="Failed to fetch monthly user growth")


@router.get("/api/developer/analytics/yearly-users")
async def yearly_users(auth: Dict = Depends(verify_developer_access)):
    supabase = get_supabase_client()
    try:
        res = (
            supabase.from_("app_profiles")
            .select("created_at")
            .order("created_at", desc=False)
            .execute()
        )
        by_year: Dict[int, int] = {}
        for p in (res.data or []):
            try:
                yr = datetime.fromisoformat(p["created_at"]).year
                by_year[yr] = by_year.get(yr, 0) + 1
            except Exception:
                continue
        entries = sorted(by_year.items())
        cumulative = 0
        intermediate = []
        for yr, count in entries:
            cumulative += count
            intermediate.append({"year": str(yr), "newUsers": count, "totalUsers": cumulative})
        data = [
            {
                **item,
                "growth": calculate_growth(item["totalUsers"], intermediate[idx - 1]["totalUsers"]) if idx > 0 else 0,
            }
            for idx, item in enumerate(intermediate)
        ]
        return {"data": data, "total": len(data)}
    except Exception as exc:
        logger.exception("Yearly users error")
        raise HTTPException(status_code=500, detail="Failed to fetch yearly user growth")


# ============ DEBUG ============


@router.get("/api/developer/debug/stats")
async def debug_stats():
    """No auth required — debug endpoint."""
    supabase = get_supabase_client()
    try:
        total_res = supabase.from_("app_profiles").select("*", count="exact", head=True).execute()
        total_users = total_res.count or 0

        seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        active_res = (
            supabase.from_("usage_logs")
            .select("*", count="exact", head=True)
            .gt("created_at", seven_days_ago)
            .execute()
        )
        active_users = active_res.count or 0

        one_day_ago = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        new_users_res = (
            supabase.from_("app_profiles")
            .select("*", count="exact", head=True)
            .gt("created_at", one_day_ago)
            .execute()
        )
        new_users = new_users_res.count or 0

        credit_res = supabase.from_("usage_logs").select("credits_charged").execute()
        credits_consumed = sum(float(r.get("credits_charged") or 0) for r in (credit_res.data or []))

        ai_res = (
            supabase.from_("usage_logs")
            .select("*", count="exact", head=True)
            .eq("usage_type", "production")
            .execute()
        )
        ai_requests = ai_res.count or 0

        return {
            "totalUsers": total_users,
            "activeUsers": active_users,
            "newUsers": new_users,
            "creditsConsumed": credits_consumed,
            "aiRequests": ai_requests,
            "revenue": credits_consumed * 0.001,
            "debug": {
                "message": "This is the debug stats endpoint (no auth required)",
                "creditData": credit_res.data,
            },
        }
    except Exception as exc:
        logger.exception("Dashboard debug stats error")
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/developer/debug/simulate-usage")
async def simulate_usage():
    """No auth required — debug endpoint."""
    supabase = get_supabase_client()
    try:
        profiles_res = (
            supabase.from_("app_profiles").select("id").eq("role", "user").limit(1).execute()
        )
        profiles = profiles_res.data or []
        if not profiles:
            any_res = supabase.from_("app_profiles").select("id").limit(1).execute()
            profiles = any_res.data or []
        if not profiles:
            raise HTTPException(status_code=400, detail="No users found in database")

        user_id = profiles[0]["id"]
        logs = [
            {
                "user_id": user_id,
                "portal": "user",
                "usage_type": "production",
                "wallet_type": "user_credits",
                "feature_key": "video_from_images",
                "credits_requested": 50,
                "credits_charged": 50,
                "status": "completed",
                "metadata": {"imageCount": 3, "videoDuration": 9, "test": True},
            },
            {
                "user_id": user_id,
                "portal": "user",
                "usage_type": "production",
                "wallet_type": "user_credits",
                "feature_key": "cinematic_video",
                "credits_requested": 75,
                "credits_charged": 75,
                "status": "completed",
                "metadata": {"imageCount": 4, "videoDuration": 18, "test": True},
            },
            {
                "user_id": user_id,
                "portal": "user",
                "usage_type": "production",
                "wallet_type": "user_credits",
                "feature_key": "video_from_images",
                "credits_requested": 40,
                "credits_charged": 40,
                "status": "completed",
                "metadata": {"imageCount": 2, "videoDuration": 8, "test": True},
            },
        ]
        supabase.from_("usage_logs").insert(logs).execute()
        return {
            "success": True,
            "message": f"Added {len(logs)} test usage logs for user: {user_id}",
            "userId": user_id,
            "logsAdded": len(logs),
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Simulate usage error")
        raise HTTPException(status_code=500, detail=str(exc))


# ============ TESTER PORTAL ROUTES ============


class ToggleTestingModeBody(BaseModel):
    enabled: Optional[bool] = True


@router.post("/api/tester/toggle-testing-mode")
async def toggle_testing_mode(
    body: ToggleTestingModeBody,
    authorization: Optional[str] = Header(None),
):
    token = get_bearer_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Unauthorized")

    supabase = get_supabase_client()
    auth_res = supabase.auth.get_user(token)
    user = getattr(auth_res, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_dict = user.model_dump() if hasattr(user, "model_dump") else dict(user)
    enabled = body.enabled if body.enabled is not None else True
    try:
        res = (
            supabase.from_("app_profiles")
            .update({"testing_mode_enabled": enabled})
            .eq("id", user_dict["id"])
            .select()
            .single()
            .execute()
        )
        profile = res.data
        return {
            "success": True,
            "testingModeEnabled": profile.get("testing_mode_enabled") if profile else enabled,
            "message": f"Testing mode {'enabled' if enabled else 'disabled'}",
        }
    except Exception as exc:
        logger.exception("Toggle testing mode error")
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/developer/tester/bug-reports")
async def tester_bug_reports(auth: Dict = Depends(verify_tester_or_developer_access)):
    supabase = get_supabase_client()
    try:
        res = (
            supabase.from_("bug_reports")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
        return res.data or []
    except Exception as exc:
        msg = str(exc).lower()
        if is_missing_table_error(exc):
            raise HTTPException(
                status_code=500,
                detail="Bug reports table not found. Apply supabase/sql/2026-06-10_bug_reports_table.sql to configure the schema.",
            )
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/developer/reports")
async def developer_reports(auth: Dict = Depends(verify_tester_or_developer_access)):
    supabase = get_supabase_client()
    try:
        res = (
            supabase.from_("bug_reports")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
        return res.data or []
    except Exception as exc:
        if is_missing_table_error(exc):
            raise HTTPException(
                status_code=500,
                detail="Bug reports table not found. Apply supabase/sql/2026-06-10_bug_reports_table.sql to configure the schema.",
            )
        raise HTTPException(status_code=500, detail=str(exc))


class UpdateReportBody(BaseModel):
    status: str
    comment: Optional[str] = None


@router.patch("/api/developer/reports/{report_id}")
async def update_report(
    report_id: str,
    body: UpdateReportBody,
    auth: Dict = Depends(verify_developer_access),
):
    if not report_id:
        raise HTTPException(status_code=400, detail="Report ID is required")
    allowed_statuses = ("fixed", "in-review", "open", "verified")
    if body.status not in allowed_statuses:
        raise HTTPException(status_code=400, detail="Invalid status provided")

    supabase = get_supabase_client()
    update_fields: Dict[str, Any] = {
        "status": body.status,
        "notes": body.comment.strip() if body.comment else None,
        "resolved_at": datetime.now(timezone.utc).isoformat() if body.status == "fixed" else None,
    }

    try:
        profile_name = str(auth["profile"].get("full_name") or auth["profile"].get("email") or "").lower()
        user_email = str(auth["user"].get("email") or "").lower()
        matched = next(
            (lbl for lbl in DEVELOPER_LABELS if lbl.lower() in profile_name or lbl.lower() in user_email),
            None,
        )
        if matched:
            update_fields["assigned_developer"] = matched
    except Exception as exc:
        logger.warning("Developer label mapping failed: %s", exc)

    try:
        supabase.from_("bug_reports").update(update_fields).eq("id", report_id).execute()
        return {"success": True}
    except Exception as exc:
        if is_missing_table_error(exc):
            raise HTTPException(
                status_code=500,
                detail="Bug reports table not found. Apply supabase/sql/2026-06-10_bug_reports_table.sql to configure the schema.",
            )
        raise HTTPException(status_code=500, detail=str(exc))


class SubmitBugReportBody(BaseModel):
    assignedDeveloper: str
    description: str
    screenshotUrl: Optional[str] = None
    testerName: str
    submittedBy: str


@router.post("/api/developer/tester/bug-reports")
async def submit_tester_bug_report(
    body: SubmitBugReportBody,
    auth: Dict = Depends(verify_tester_or_developer_access),
):
    supabase = get_supabase_client()
    title = body.description.strip()[:120] or "New Tester Bug Report"
    attachment_urls = [body.screenshotUrl] if body.screenshotUrl else []

    try:
        supabase.from_("bug_reports").insert({
            "title": title,
            "description": body.description,
            "severity": "medium",
            "component": "tester-reports",
            "status": "open",
            "os": "unknown",
            "browser": "unknown",
            "device": "desktop",
            "attachment_count": len(attachment_urls),
            "attachment_urls": attachment_urls,
            "tester_name": body.testerName,
            "assigned_developer": body.assignedDeveloper,
            "submitted_by": body.submittedBy,
        }).execute()
        return {"success": True}
    except Exception as exc:
        if is_missing_table_error(exc):
            raise HTTPException(
                status_code=500,
                detail="Bug reports table not found. Apply supabase/sql/2026-06-10_bug_reports_table.sql to configure the schema.",
            )
        raise HTTPException(status_code=500, detail=str(exc))


class TesterUpdateActionBody(BaseModel):
    action: str


@router.post("/api/tester/updates/{report_id}/action")
async def tester_update_action(
    report_id: str,
    body: TesterUpdateActionBody,
    auth: Dict = Depends(verify_tester_or_developer_access),
):
    if not report_id or not body.action:
        raise HTTPException(status_code=400, detail="Missing reportId or action")

    supabase = get_supabase_client()
    try:
        original_res = (
            supabase.from_("bug_reports")
            .select("*")
            .eq("id", report_id)
            .maybe_single()
            .execute()
        )
        original = original_res.data
        if not original:
            raise HTTPException(status_code=404, detail="Original report not found")
    except HTTPException:
        raise
    except Exception as exc:
        if is_missing_table_error(exc):
            raise HTTPException(status_code=500, detail="Bug reports table not found")
        raise HTTPException(status_code=500, detail=str(exc))

    tester_id = auth["profile"].get("id")

    if body.action == "closed":
        supabase.from_("bug_reports").update({
            "status": "fixed",
            "resolved_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", report_id).execute()
        return {"success": True}

    if body.action == "bug_report":
        new_title = f"Follow-up: {original.get('title') or 'Developer update'}"
        new_description = original.get("notes") or original.get("description") or "Follow-up reported by tester"
        insert_obj = {
            "title": new_title,
            "description": new_description,
            "severity": original.get("severity") or "medium",
            "component": original.get("component") or "tester-feedback",
            "status": "open",
            "os": original.get("os") or "unknown",
            "browser": original.get("browser") or "unknown",
            "device": original.get("device") or "unknown",
            "attachment_count": 0,
            "attachment_urls": [],
            "tester_name": auth["profile"].get("full_name") or auth["profile"].get("email") or "Tester",
            "assigned_developer": original.get("assigned_developer") or "RUDRIK",
            "submitted_by": tester_id,
        }
        supabase.from_("bug_reports").insert(insert_obj).execute()
        return {"success": True}

    if body.action == "resend":
        supabase.from_("bug_reports").update({"status": "open"}).eq("id", report_id).execute()
        return {"success": True}

    raise HTTPException(status_code=400, detail="Unknown action")
