"""Ruhi's Boutique — appointments, stitch orders, and admin desk API."""

from __future__ import annotations

import os
import secrets
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
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
from app.models import Appointment, CollectionPiece, StitchOrder, utcnow
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
    CollectionPieceOut,
    CollectionPieceUpdate,
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
    title="Ruhi Trends API",
    version="0.1.0",
    description="Ruhi Trends boutique website — appointments, custom stitching, and admin desk",
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
        "service": "ruhitrends-api",
        "db": backend,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/v1/office")
def office_info() -> dict:
    return {
        "name": "Ruhi Trends",
        "boutique": "Ruhi's Boutique",
        "owner": "Ruhi",
        "phone": "+919908185597",
        "phones": ["+919908185597"],
        "address": "Plot No. LIG-140, Opposite Basketball Ground, KPHB 7th Phase, Kukatpally, Hyderabad, Telangana 500072, India",
        "maps": "https://www.google.com/maps/search/?api=1&query=Ruhi%27s+Boutique+Opposite+Basketball+Ground+Kukatpally",
        "platform": "boutique",
        "version": "0.1.0",
        "app_url": APP_URL or None,
        "domain": "ruhitrends.com",
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


ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
}
MAX_IMAGE_BYTES = 2_500_000


def _piece_out(row: CollectionPiece) -> CollectionPieceOut:
    return CollectionPieceOut(
        id=row.id,
        title=row.title,
        title_te=row.title_te,
        body=row.body,
        body_te=row.body_te,
        category=row.category,
        kind=row.kind,
        published=row.published,
        sort_order=row.sort_order,
        image_url=f"/v1/collections/{row.id}/image",
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


@app.get("/v1/collections", response_model=list[CollectionPieceOut])
def list_collections(
    kind: str | None = None,
    limit: int = 48,
    db: Session = Depends(get_db),
    admin: str | None = Depends(optional_admin),
) -> list[CollectionPieceOut]:
    limit = max(1, min(limit, 200))
    q = db.query(CollectionPiece).order_by(
        CollectionPiece.sort_order.asc(),
        CollectionPiece.created_at.desc(),
    )
    if not admin:
        q = q.filter(CollectionPiece.published == "yes")
    if kind:
        q = q.filter(CollectionPiece.kind == kind.strip())
    return [_piece_out(row) for row in q.limit(limit).all()]


@app.get("/v1/collections/{piece_id}/image")
def collection_image(piece_id: int, db: Session = Depends(get_db)) -> Response:
    row = db.get(CollectionPiece, piece_id)
    if not row:
        raise HTTPException(status_code=404, detail="Piece not found")
    return Response(content=row.image_data, media_type=row.image_mime or "image/jpeg")


@app.post("/v1/collections", response_model=CollectionPieceOut, status_code=201)
async def create_collection_piece(
    title: str = Form(...),
    body: str = Form(""),
    title_te: str = Form(""),
    body_te: str = Form(""),
    category: str = Form("saree"),
    kind: str = Form("design"),
    published: str = Form("yes"),
    sort_order: int = Form(0),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
) -> CollectionPieceOut:
    mime = (image.content_type or "").lower().strip()
    if mime not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Please upload a JPG, PNG, or WebP image.")
    data = await image.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty image upload.")
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="Image must be under 2.5 MB.")

    kind_norm = (kind or "design").strip().lower()
    if kind_norm not in {"stock", "design"}:
        kind_norm = "design"
    pub = "yes" if (published or "yes").strip().lower() in {"yes", "true", "1", "published"} else "no"

    row = CollectionPiece(
        title=title.strip(),
        title_te=(title_te or "").strip(),
        body=(body or "").strip(),
        body_te=(body_te or "").strip(),
        category=(category or "saree").strip() or "saree",
        kind=kind_norm,
        image_mime=mime if mime != "image/jpg" else "image/jpeg",
        image_data=data,
        published=pub,
        sort_order=int(sort_order or 0),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _piece_out(row)


@app.patch("/v1/collections/{piece_id}", response_model=CollectionPieceOut)
def update_collection_piece(
    piece_id: int,
    body: CollectionPieceUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
) -> CollectionPieceOut:
    row = db.get(CollectionPiece, piece_id)
    if not row:
        raise HTTPException(status_code=404, detail="Piece not found")
    data = body.model_dump(exclude_unset=True)
    for key, value in data.items():
        if isinstance(value, str):
            value = value.strip()
        setattr(row, key, value)
    row.updated_at = utcnow()
    db.commit()
    db.refresh(row)
    return _piece_out(row)


@app.delete("/v1/collections/{piece_id}")
def delete_collection_piece(
    piece_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
) -> dict[str, str]:
    row = db.get(CollectionPiece, piece_id)
    if not row:
        raise HTTPException(status_code=404, detail="Piece not found")
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
