"""Pytest suite for boutique API auth and redaction."""

from __future__ import annotations

import os
from pathlib import Path

_TEST_DIR = Path(__file__).resolve().parent
_TEST_DB = _TEST_DIR / "_pytest_ruhi.db"
if _TEST_DB.exists():
    _TEST_DB.unlink()

os.environ["ADMIN_PIN"] = "test-admin-pin-strong1"
os.environ["DATABASE_URL"] = f"sqlite:///{_TEST_DB}"
os.environ["PUBLIC_WRITE_BURST_MAX"] = "100"
os.environ["PUBLIC_WRITE_SHORT_MAX"] = "100"
os.environ["PUBLIC_WRITE_MAX_ATTEMPTS"] = "100"
os.environ.pop("RENDER", None)
os.environ.pop("RENDER_SERVICE_ID", None)
os.environ.pop("ALLOW_INSECURE_DEFAULT_PIN", None)

import app.auth as auth_mod  # noqa: E402

auth_mod._cached_pin = None

from fastapi.testclient import TestClient  # noqa: E402
from app.db import init_db  # noqa: E402
from app.main import app  # noqa: E402

init_db()
client = TestClient(app)


def _admin_token() -> str:
    res = client.post("/v1/admin/login", json={"pin": "test-admin-pin-strong1"})
    assert res.status_code == 200, res.text
    return res.json()["access_token"]


def test_healthz() -> None:
    res = client.get("/healthz")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    assert res.json()["service"] == "ruhitrends-api"


def test_office_info() -> None:
    res = client.get("/v1/office")
    assert res.status_code == 200
    data = res.json()
    assert "Ruhi" in data["name"]
    assert data["platform"] == "boutique"


def test_public_appointment_redacts_pii() -> None:
    create = client.post(
        "/v1/appointments",
        json={
            "customer_name": "Ananya Reddy",
            "customer_phone": "9876543210",
            "service_type": "bridal",
            "preferred_date": "2026-09-01",
            "preferred_time": "11:00",
            "notes": "secret note",
        },
    )
    assert create.status_code == 201, create.text

    public = client.get("/v1/appointments")
    assert public.status_code == 200
    rows = public.json()
    assert rows
    row = rows[0]
    assert row["customer_name"] == "Customer"
    assert row["customer_phone"] == ""
    assert row["notes"] == ""
    assert "9876543210" not in str(row)


def test_admin_sees_full_appointment() -> None:
    token = _admin_token()
    res = client.get("/v1/appointments", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    rows = res.json()
    assert any(r.get("customer_phone") == "9876543210" for r in rows)


def test_stitch_order_flow() -> None:
    create = client.post(
        "/v1/stitch-orders",
        json={
            "customer_name": "Priya Sharma",
            "customer_phone": "9123456780",
            "garment_type": "blouse",
            "fabric_notes": "Silk",
            "occasion": "Wedding",
            "preferred_date": "2026-09-10",
            "notes": "Need fitting",
        },
    )
    assert create.status_code == 201, create.text
    order_id = create.json()["id"]

    public = client.get("/v1/stitch-orders")
    assert public.status_code == 200
    pub = next(r for r in public.json() if r["id"] == order_id)
    assert pub["customer_phone"] == ""
    assert pub["notes"] == ""

    token = _admin_token()
    patched = client.patch(
        f"/v1/stitch-orders/{order_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={"status": "stitching"},
    )
    assert patched.status_code == 200
    assert patched.json()["status"] == "stitching"
    assert patched.json()["customer_phone"] == "9123456780"


def test_admin_login_rejects_bad_pin() -> None:
    res = client.post("/v1/admin/login", json={"pin": "wrong-pin-xxxx"})
    assert res.status_code == 401


def test_stats() -> None:
    res = client.get("/v1/stats")
    assert res.status_code == 200
    data = res.json()
    assert "appointments" in data
    assert "stitch_orders" in data


def test_update_appointment_requires_admin() -> None:
    listed = client.get("/v1/appointments").json()
    assert listed
    aid = listed[0]["id"]
    denied = client.patch(
        f"/v1/appointments/{aid}",
        json={"status": "confirmed"},
    )
    assert denied.status_code == 401

    token = _admin_token()
    ok = client.patch(
        f"/v1/appointments/{aid}",
        headers={"Authorization": f"Bearer {token}"},
        json={"status": "confirmed"},
    )
    assert ok.status_code == 200
    assert ok.json()["status"] == "confirmed"
