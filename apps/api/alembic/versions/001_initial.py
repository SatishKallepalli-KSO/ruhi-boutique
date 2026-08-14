"""Initial schema for Ruhi's Boutique.

Revision ID: 001_initial
Revises:
Create Date: 2026-08-14
"""

from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "appointments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("customer_name", sa.String(length=120), nullable=False),
        sa.Column("customer_phone", sa.String(length=32), nullable=False),
        sa.Column("service_type", sa.String(length=64), nullable=False),
        sa.Column("preferred_date", sa.String(length=64), nullable=False),
        sa.Column("preferred_time", sa.String(length=64), nullable=False),
        sa.Column("notes", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        if_not_exists=True,
    )
    op.create_table(
        "stitch_orders",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("customer_name", sa.String(length=120), nullable=False),
        sa.Column("customer_phone", sa.String(length=32), nullable=False),
        sa.Column("garment_type", sa.String(length=64), nullable=False),
        sa.Column("fabric_notes", sa.String(length=255), nullable=False),
        sa.Column("occasion", sa.String(length=120), nullable=False),
        sa.Column("preferred_date", sa.String(length=64), nullable=False),
        sa.Column("notes", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        if_not_exists=True,
    )
    op.create_table(
        "visit_stats_daily",
        sa.Column("day", sa.Date(), nullable=False),
        sa.Column("hits", sa.Integer(), nullable=False),
        sa.Column("uniques", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("day"),
        if_not_exists=True,
    )
    op.create_table(
        "visit_stats_geo_daily",
        sa.Column("day", sa.Date(), nullable=False),
        sa.Column("country", sa.String(length=8), nullable=False),
        sa.Column("city", sa.String(length=80), nullable=False),
        sa.Column("hits", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("day", "country", "city"),
        if_not_exists=True,
    )
    op.create_table(
        "visit_stats_uniques",
        sa.Column("day", sa.Date(), nullable=False),
        sa.Column("visitor_hash", sa.String(length=64), nullable=False),
        sa.PrimaryKeyConstraint("day", "visitor_hash"),
        if_not_exists=True,
    )


def downgrade() -> None:
    op.drop_table("visit_stats_uniques")
    op.drop_table("visit_stats_geo_daily")
    op.drop_table("visit_stats_daily")
    op.drop_table("stitch_orders")
    op.drop_table("appointments")
