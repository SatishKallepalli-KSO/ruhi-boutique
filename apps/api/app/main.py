"""Ruhi's Boutique — appointments, stitch orders, and admin desk API."""

from __future__ import annotations

import os
import secrets
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from app.analytics import analytics_summary, record_hit
from app.auth import (
    get_admin_pin,
    issue_token,
    optional_admin,
    require_admin,
    revoke_token,
)
from app.db import get_db, init_db
from app.models import Appointment, StitchOrder, utcnow
from app.rate_limit import (
    clear_login_failures,
    client_ip,
    enforce_analytics_hit,
    enforce_login,
    enforce_public_write,
    login_failures_remaining,
    record_login_failure,
)
from app.schemas import (
    AdminLogin,
    AdminLoginOut,
    AnalyticsHit,
    AppointmentCreate,
    AppointmentOut,
    AppointmentUpdate,
    StitchOrderCreate,
    StitchOrderOut,
    StitchOrderUpdate,
    redact_appointment,
    redact_stitch_order,
)

load_dotenv()

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
APP_URL = (os.getenv("APP_URL") or "").rstrip("/")

app = FastAPI(
    title="Ruhi's Boutique API",
    version="0.1.0",
    description="Boutique website — appointments, custom stitching, and admin desk",
)

_cors_origins = [
    o.strip()
    for o in (os.getenv("CORS_ORIGINS") or "*").split(",")
    if o.strip()
]
_allow_credentials = "*" not in _cors_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/healthz")
def healthz() -> dict[str, str]:
    from app.db import DATABASE_URL

    backend = "postgres" if DATABASE_URL.startswith("postgresql") else "sqlite"
    return {
        "status": "ok",
        "service": "ruhi-boutique-api",
        "db": backend,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/v1/office")
def office_info() -> dict:
    return {
        "name": "Ruhi's Boutique",
        "owner": "Ruhi",
        "phone": "+919908185597",
        "phones": ["+919908185597"],
        "address": "Plot No. LIG-140, Opposite Basketball Ground, KPHB 7th Phase, Kukatpally, Hyderabad, Telangana 500072, India",
        "maps": "https://www.google.com/maps/search/?api=1&query=Ruhi%27s+Boutique+Opposite+Basketball+Ground+Kukatpally",
        "platform": "boutique",
        "version": "0.1.0",
        "app_url": APP_URL or None,
    }


@app.get("/v1/stats")
def platform_stats(db: Session = Depends(get_db)) -> dict:
    appointments = db.query(Appointment).count()
    open_appointments = (
        db.query(Appointment).filter(Appointment.status.in_(["new", "confirmed"])).count()
    )
    stitch_orders = db.query(StitchOrder).count()
    open_orders = (
        db.query(StitchOrder)
        .filter(StitchOrder.status.in_(["new", "measuring", "stitching"]))
        .count()
    )
    ready_orders = db.query(StitchOrder).filter(StitchOrder.status == "ready").count()
    return {
        "appointments": appointments,
        "open_appointments": open_appointments,
        "stitch_orders": stitch_orders,
        "open_orders": open_orders,
        "ready_orders": ready_orders,
    }


@app.post("/v1/analytics/hit")
def analytics_hit(
    body: AnalyticsHit,
    request: Request,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    enforce_analytics_hit(request)
    return record_hit(db, request, body.path)


@app.get("/v1/admin/analytics")
def admin_analytics(
    days: int = 14,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
) -> dict:
    return analytics_summary(db, days)


@app.get("/v1/activity")
def recent_activity(limit: int = 12, db: Session = Depends(get_db)) -> list[dict]:
    limit = max(1, min(limit, 30))
    items: list[dict] = []

    for row in (
        db.query(Appointment).order_by(Appointment.created_at.desc()).limit(limit).all()
    ):
        items.append(
            {
                "kind": "appointment",
                "id": row.id,
                "title": f"Visit · {row.service_type}",
                "detail": f"{row.status}",
                "at": row.created_at.isoformat(),
            }
        )

    for row in (
        db.query(StitchOrder).order_by(StitchOrder.created_at.desc()).limit(limit).all()
    ):
        items.append(
            {
                "kind": "stitch",
                "id": row.id,
                "title": f"Stitch · {row.garment_type}",
                "detail": f"{row.status}",
                "at": row.created_at.isoformat(),
            }
        )

    items.sort(key=lambda x: x["at"], reverse=True)
    return items[:limit]


@app.post("/v1/admin/login", response_model=AdminLoginOut)
def admin_login(body: AdminLogin, request: Request) -> AdminLoginOut:
    ip = client_ip(request)
    enforce_login(ip)
    submitted = body.pin.strip()
    if not secrets.compare_digest(submitted, get_admin_pin()):
        record_login_failure(ip)
        remaining = login_failures_remaining(ip)
        raise HTTPException(
            status_code=401,
            detail=f"Invalid PIN. {remaining} attempts left before lockout.",
        )
    clear_login_failures(ip)
    return AdminLoginOut(access_token=issue_token())


@app.post("/v1/admin/logout")
def admin_logout(token: str = Depends(require_admin)) -> dict[str, str]:
    revoke_token(token)
    return {"status": "ok"}


@app.post("/v1/appointments", response_model=AppointmentOut, status_code=201)
def create_appointment(
    body: AppointmentCreate,
    request: Request,
    db: Session = Depends(get_db),
) -> Appointment:
    enforce_public_write(request, "appointments")
    row = Appointment(
        customer_name=body.customer_name.strip(),
        customer_phone=body.customer_phone.strip(),
        service_type=body.service_type.strip() or "consultation",
        preferred_date=body.preferred_date.strip(),
        preferred_time=body.preferred_time.strip(),
        notes=body.notes.strip(),
        status="new",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@app.get("/v1/appointments", response_model=list[AppointmentOut])
def list_appointments(
    status: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: str | None = Depends(optional_admin),
) -> list[AppointmentOut]:
    limit = max(1, min(limit, 500))
    q = db.query(Appointment).order_by(Appointment.created_at.desc())
    if status:
        q = q.filter(Appointment.status == status.strip())
    rows = q.limit(limit).all()
    if admin:
        return [AppointmentOut.model_validate(r) for r in rows]
    return [redact_appointment(r) for r in rows]


@app.get("/v1/appointments/{appointment_id}", response_model=AppointmentOut)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    admin: str | None = Depends(optional_admin),
) -> AppointmentOut:
    row = db.get(Appointment, appointment_id)
    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found")
    out = AppointmentOut.model_validate(row)
    return out if admin else redact_appointment(out)


@app.patch("/v1/appointments/{appointment_id}", response_model=AppointmentOut)
def update_appointment(
    appointment_id: int,
    body: AppointmentUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
) -> Appointment:
    row = db.get(Appointment, appointment_id)
    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found")
    data = body.model_dump(exclude_unset=True)
    for key, value in data.items():
        if isinstance(value, str):
            value = value.strip()
        setattr(row, key, value)
    row.updated_at = utcnow()
    db.commit()
    db.refresh(row)
    return row


@app.delete("/v1/appointments/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
) -> dict[str, str]:
    row = db.get(Appointment, appointment_id)
    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db.delete(row)
    db.commit()
    return {"status": "ok"}


@app.post("/v1/stitch-orders", response_model=StitchOrderOut, status_code=201)
def create_stitch_order(
    body: StitchOrderCreate,
    request: Request,
    db: Session = Depends(get_db),
) -> StitchOrder:
    enforce_public_write(request, "stitch_orders")
    row = StitchOrder(
        customer_name=body.customer_name.strip(),
        customer_phone=body.customer_phone.strip(),
        garment_type=body.garment_type.strip() or "blouse",
        fabric_notes=body.fabric_notes.strip(),
        occasion=body.occasion.strip(),
        preferred_date=body.preferred_date.strip(),
        notes=body.notes.strip(),
        status="new",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@app.get("/v1/stitch-orders", response_model=list[StitchOrderOut])
def list_stitch_orders(
    status: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: str | None = Depends(optional_admin),
) -> list[StitchOrderOut]:
    limit = max(1, min(limit, 500))
    q = db.query(StitchOrder).order_by(StitchOrder.created_at.desc())
    if status:
        q = q.filter(StitchOrder.status == status.strip())
    rows = q.limit(limit).all()
    if admin:
        return [StitchOrderOut.model_validate(r) for r in rows]
    return [redact_stitch_order(r) for r in rows]


@app.get("/v1/stitch-orders/{order_id}", response_model=StitchOrderOut)
def get_stitch_order(
    order_id: int,
    db: Session = Depends(get_db),
    admin: str | None = Depends(optional_admin),
) -> StitchOrderOut:
    row = db.get(StitchOrder, order_id)
    if not row:
        raise HTTPException(status_code=404, detail="Stitch order not found")
    out = StitchOrderOut.model_validate(row)
    return out if admin else redact_stitch_order(out)


@app.patch("/v1/stitch-orders/{order_id}", response_model=StitchOrderOut)
def update_stitch_order(
    order_id: int,
    body: StitchOrderUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
) -> StitchOrder:
    row = db.get(StitchOrder, order_id)
    if not row:
        raise HTTPException(status_code=404, detail="Stitch order not found")
    data = body.model_dump(exclude_unset=True)
    for key, value in data.items():
        if isinstance(value, str):
            value = value.strip()
        setattr(row, key, value)
    row.updated_at = utcnow()
    db.commit()
    db.refresh(row)
    return row


@app.delete("/v1/stitch-orders/{order_id}")
def delete_stitch_order(
    order_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
) -> dict[str, str]:
    row = db.get(StitchOrder, order_id)
    if not row:
        raise HTTPException(status_code=404, detail="Stitch order not found")
    db.delete(row)
    db.commit()
    return {"status": "ok"}


if STATIC_DIR.exists():
    assets = STATIC_DIR / "assets"
    if assets.exists():
        app.mount("/assets", StaticFiles(directory=assets), name="assets")

    @app.get("/")
    def spa_index() -> FileResponse:
        return FileResponse(STATIC_DIR / "index.html")

    @app.get("/{full_path:path}")
    def spa_fallback(full_path: str) -> FileResponse:
        if full_path.startswith("v1/") or full_path == "healthz":
            raise HTTPException(status_code=404, detail="Not found")
        candidate = STATIC_DIR / full_path
        if candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(STATIC_DIR / "index.html")
