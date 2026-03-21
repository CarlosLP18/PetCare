from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field


class DonationStatus(str, Enum):
    pending = "pending"
    completed = "completed"
    refunded = "refunded"
    failed = "failed"


@dataclass
class Donation:
    id: UUID
    campaign_id: UUID
    donor_id: UUID
    amount: Decimal
    message: str | None
    is_anonymous: bool
    status: DonationStatus
    payment_ref: str | None
    created_at: datetime
    updated_at: datetime


# ── Request schemas ───────────────────────────────────────────────────────────

class CreateDonationSchema(BaseModel):
    amount: Decimal = Field(ge=1)
    message: str | None = None
    is_anonymous: bool = False


# ── Response schemas ──────────────────────────────────────────────────────────

class PublicDonationResponseSchema(BaseModel):
    id: UUID
    amount: Decimal
    message: str | None
    is_anonymous: bool
    donor_display_name: str | None  # None when is_anonymous=True
    created_at: datetime


class DonationResponseSchema(BaseModel):
    id: UUID
    campaign_id: UUID
    amount: Decimal
    message: str | None
    is_anonymous: bool
    status: DonationStatus
    created_at: datetime
