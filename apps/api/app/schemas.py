"""Pydantic request/response schemas and public redaction helpers."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class AppointmentCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=120)
    customer_phone: str = Field(min_length=7, max_length=32)
    service_type: str = Field(default="consultation", max_length=64)
    preferred_date: str = Field(default="", max_length=64)
    preferred_time: str = Field(default="", max_length=64)
    notes: str = Field(default="", max_length=2000)


class AppointmentUpdate(BaseModel):
    customer_name: str | None = Field(default=None, min_length=2, max_length=120)
    customer_phone: str | None = Field(default=None, min_length=7, max_length=32)
    service_type: str | None = Field(default=None, max_length=64)
    preferred_date: str | None = Field(default=None, max_length=64)
    preferred_time: str | None = Field(default=None, max_length=64)
    notes: str | None = Field(default=None, max_length=2000)
    status: str | None = Field(default=None, max_length=32)


class AppointmentOut(BaseModel):
    id: int
    customer_name: str
    customer_phone: str
    service_type: str
    preferred_date: str
    preferred_time: str
    notes: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class StitchOrderCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=120)
    customer_phone: str = Field(min_length=7, max_length=32)
    garment_type: str = Field(default="blouse", max_length=64)
    fabric_notes: str = Field(default="", max_length=255)
    occasion: str = Field(default="", max_length=120)
    preferred_date: str = Field(default="", max_length=64)
    notes: str = Field(default="", max_length=2000)


class StitchOrderUpdate(BaseModel):
    customer_name: str | None = Field(default=None, min_length=2, max_length=120)
    customer_phone: str | None = Field(default=None, min_length=7, max_length=32)
    garment_type: str | None = Field(default=None, max_length=64)
    fabric_notes: str | None = Field(default=None, max_length=255)
    occasion: str | None = Field(default=None, max_length=120)
    preferred_date: str | None = Field(default=None, max_length=64)
    notes: str | None = Field(default=None, max_length=2000)
    status: str | None = Field(default=None, max_length=32)


class StitchOrderOut(BaseModel):
    id: int
    customer_name: str
    customer_phone: str
    garment_type: str
    fabric_notes: str
    occasion: str
    preferred_date: str
    notes: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AdminLogin(BaseModel):
    pin: str = Field(min_length=4, max_length=64)


class AdminLoginOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AnalyticsHit(BaseModel):
    path: str = Field(default="home", max_length=64)


def redact_appointment(row: AppointmentOut | object) -> AppointmentOut:
    data = AppointmentOut.model_validate(row)
    return data.model_copy(
        update={
            "customer_name": "Customer",
            "customer_phone": "",
            "notes": "",
            "preferred_time": "",
        }
    )


def redact_stitch_order(row: StitchOrderOut | object) -> StitchOrderOut:
    data = StitchOrderOut.model_validate(row)
    return data.model_copy(
        update={
            "customer_name": "Customer",
            "customer_phone": "",
            "fabric_notes": "",
            "notes": "",
            "occasion": "",
        }
    )
