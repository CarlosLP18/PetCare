from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field


class PetSpecies(str, Enum):
    dog = "dog"
    cat = "cat"
    bird = "bird"
    rabbit = "rabbit"
    reptile = "reptile"
    other = "other"


class CampaignStatus(str, Enum):
    pending_verification = "pending_verification"
    pending_council = "pending_council"
    active = "active"
    rejected_auto = "rejected_auto"
    rejected_council = "rejected_council"
    completed = "completed"
    expired = "expired"


@dataclass
class Campaign:
    id: UUID
    owner_id: UUID
    title: str
    pet_name: str
    pet_species: PetSpecies
    pet_age_years: Decimal | None
    pet_breed: str | None
    story: str
    diagnosis: str
    vet_name: str | None
    vet_clinic: str | None
    goal_amount: Decimal
    total_raised: Decimal
    status: CampaignStatus
    deadline: date
    images: list[str]
    medical_documents: list[str]
    resubmit_count: int
    is_deleted: bool
    created_at: datetime
    updated_at: datetime


@dataclass
class CampaignUpdate:
    id: UUID
    campaign_id: UUID
    content: str
    images: list[str]
    created_at: datetime


@dataclass
class AIReviewData:
    score: Decimal | None
    flags: list[str]
    summary: str | None
    welfare_vote: str | None
    finance_vote: str | None
    fraud_vote: str | None
    final_decision: str | None
    decision_reason: str | None


# ── Request schemas ───────────────────────────────────────────────────────────

class CreateCampaignSchema(BaseModel):
    title: str
    pet_name: str
    pet_species: PetSpecies
    pet_age_years: Decimal | None = None
    pet_breed: str | None = None
    story: str = Field(min_length=100)
    diagnosis: str = Field(min_length=50)
    vet_name: str | None = None
    vet_clinic: str | None = None
    goal_amount: Decimal = Field(gt=0)
    deadline: date
    images: list[str] = Field(default_factory=list)
    medical_documents: list[str] = Field(default_factory=list)


class UpdateCampaignSchema(BaseModel):
    title: str | None = None
    pet_name: str | None = None
    pet_species: PetSpecies | None = None
    pet_age_years: Decimal | None = None
    pet_breed: str | None = None
    story: str | None = None
    diagnosis: str | None = None
    vet_name: str | None = None
    vet_clinic: str | None = None
    goal_amount: Decimal | None = None
    deadline: date | None = None
    images: list[str] | None = None
    medical_documents: list[str] | None = None


class CreateCampaignUpdateSchema(BaseModel):
    content: str
    images: list[str] = []


# ── Response schemas ──────────────────────────────────────────────────────────

class CampaignResponseSchema(BaseModel):
    id: UUID
    owner_id: UUID
    title: str
    pet_name: str
    pet_species: PetSpecies
    pet_age_years: Decimal | None
    pet_breed: str | None
    story: str
    diagnosis: str
    vet_name: str | None
    vet_clinic: str | None
    goal_amount: Decimal
    total_raised: Decimal
    status: CampaignStatus
    deadline: date
    images: list[str]
    medical_documents: list[str]
    resubmit_count: int
    created_at: datetime
    updated_at: datetime


class CampaignDetailResponseSchema(CampaignResponseSchema):
    pass


class AIReviewResponseSchema(BaseModel):
    score: Decimal | None = None
    flags: list[str] = []
    summary: str | None = None
    welfare_vote: str | None = None
    finance_vote: str | None = None
    fraud_vote: str | None = None
    final_decision: str | None = None
    decision_reason: str | None = None


class CampaignUpdateResponseSchema(BaseModel):
    id: UUID
    content: str
    images: list[str]
    created_at: datetime
