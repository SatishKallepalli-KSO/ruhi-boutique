"""ORM models for Ruhi's Boutique platform."""

from __future__ import annotations

from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Appointment(Base):
    """In-store visit / consultation booking request."""

    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    customer_name: Mapped[str] = mapped_column(String(120), nullable=False)
    customer_phone: Mapped[str] = mapped_column(String(32), nullable=False)
    service_type: Mapped[str] = mapped_column(String(64), nullable=False, default="consultation")
    # consultation | stitching | bridal | alteration | party_wear
    preferred_date: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    preferred_time: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="new")
    # new | confirmed | completed | cancelled
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utcnow,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utcnow,
        onupdate=utcnow,
    )


class StitchOrder(Base):
    """Custom stitching / alteration order request."""

    __tablename__ = "stitch_orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    customer_name: Mapped[str] = mapped_column(String(120), nullable=False)
    customer_phone: Mapped[str] = mapped_column(String(32), nullable=False)
    garment_type: Mapped[str] = mapped_column(String(64), nullable=False, default="blouse")
    # blouse | saree | lehenga | kurti | kids | alteration | other
    fabric_notes: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    occasion: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    preferred_date: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="new")
    # new | measuring | stitching | ready | delivered | cancelled
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utcnow,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utcnow,
        onupdate=utcnow,
    )


class VisitDaily(Base):
    """Aggregated site hits per IST calendar day. No personal data."""

    __tablename__ = "visit_stats_daily"

    day: Mapped[date] = mapped_column(Date, primary_key=True)
    hits: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    uniques: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class VisitGeoDaily(Base):
    """Aggregated hits by country/city per day. City may be blank."""

    __tablename__ = "visit_stats_geo_daily"

    day: Mapped[date] = mapped_column(Date, primary_key=True)
    country: Mapped[str] = mapped_column(String(8), primary_key=True, default="ZZ")
    city: Mapped[str] = mapped_column(String(80), primary_key=True, default="")
    hits: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class VisitUnique(Base):
    """Short-lived daily visitor fingerprints (hashed). Not an IP log."""

    __tablename__ = "visit_stats_uniques"

    day: Mapped[date] = mapped_column(Date, primary_key=True)
    visitor_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
