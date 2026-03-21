from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Any
from uuid import UUID

from supabase import AsyncClient

from src.campaigns.models import (
    AIReviewData,
    Campaign,
    CampaignStatus,
    CampaignUpdate,
    CreateCampaignSchema,
    CreateCampaignUpdateSchema,
    PetSpecies,
)


def _row_to_campaign(row: dict[str, Any]) -> Campaign:
    return Campaign(
        id=UUID(row["id"]),
        owner_id=UUID(row["owner_id"]),
        title=row["title"],
        pet_name=row["pet_name"],
        pet_species=PetSpecies(row["pet_species"]),
        pet_age_years=Decimal(str(row["pet_age_years"])) if row.get("pet_age_years") is not None else None,
        pet_breed=row.get("pet_breed"),
        story=row["story"],
        diagnosis=row["diagnosis"],
        vet_name=row.get("vet_name"),
        vet_clinic=row.get("vet_clinic"),
        goal_amount=Decimal(str(row["goal_amount"])),
        total_raised=Decimal(str(row["total_raised"])),
        status=CampaignStatus(row["status"]),
        deadline=date.fromisoformat(row["deadline"]),
        images=row.get("images") or [],
        medical_documents=row.get("medical_documents") or [],
        resubmit_count=row["resubmit_count"],
        is_deleted=row["is_deleted"],
        created_at=datetime.fromisoformat(row["created_at"]),
        updated_at=datetime.fromisoformat(row["updated_at"]),
    )


def _row_to_campaign_update(row: dict[str, Any]) -> CampaignUpdate:
    return CampaignUpdate(
        id=UUID(row["id"]),
        campaign_id=UUID(row["campaign_id"]),
        content=row["content"],
        images=row.get("images") or [],
        created_at=datetime.fromisoformat(row["created_at"]),
    )


async def create(
    db: AsyncClient, owner_id: UUID, data: CreateCampaignSchema
) -> Campaign:
    payload: dict[str, Any] = {
        "owner_id": str(owner_id),
        "title": data.title,
        "pet_name": data.pet_name,
        "pet_species": data.pet_species.value,
        "story": data.story,
        "diagnosis": data.diagnosis,
        "goal_amount": float(data.goal_amount),
        "deadline": data.deadline.isoformat(),
        "images": data.images,
        "medical_documents": data.medical_documents,
        "status": CampaignStatus.pending_verification.value,
    }
    if data.pet_age_years is not None:
        payload["pet_age_years"] = float(data.pet_age_years)
    if data.pet_breed is not None:
        payload["pet_breed"] = data.pet_breed
    if data.vet_name is not None:
        payload["vet_name"] = data.vet_name
    if data.vet_clinic is not None:
        payload["vet_clinic"] = data.vet_clinic

    result = await db.table("campaigns").insert(payload).execute()
    return _row_to_campaign(result.data[0])


async def get_by_id(db: AsyncClient, campaign_id: UUID) -> Campaign | None:
    result = (
        await db.table("campaigns")
        .select("*")
        .eq("id", str(campaign_id))
        .eq("is_deleted", False)
        .execute()
    )
    if not result.data:
        return None
    return _row_to_campaign(result.data[0])


async def list_active(
    db: AsyncClient,
    page: int,
    page_size: int,
    species: PetSpecies | None = None,
) -> list[Campaign]:
    offset = (page - 1) * page_size
    query = (
        db.table("campaigns")
        .select("*")
        .eq("status", CampaignStatus.active.value)
        .eq("is_deleted", False)
    )
    if species is not None:
        query = query.eq("pet_species", species.value)
    result = await query.range(offset, offset + page_size - 1).execute()
    return [_row_to_campaign(row) for row in result.data]


async def list_by_owner(db: AsyncClient, owner_id: UUID) -> list[Campaign]:
    result = (
        await db.table("campaigns")
        .select("*")
        .eq("owner_id", str(owner_id))
        .eq("is_deleted", False)
        .order("created_at", desc=True)
        .execute()
    )
    return [_row_to_campaign(row) for row in result.data]


async def list_by_owner_public(
    db: AsyncClient, owner_id: UUID, page: int, page_size: int
) -> list[Campaign]:
    offset = (page - 1) * page_size
    result = (
        await db.table("campaigns")
        .select("*")
        .eq("owner_id", str(owner_id))
        .eq("status", CampaignStatus.active.value)
        .eq("is_deleted", False)
        .range(offset, offset + page_size - 1)
        .execute()
    )
    return [_row_to_campaign(row) for row in result.data]


async def update(
    db: AsyncClient, campaign_id: UUID, data: dict[str, Any]
) -> Campaign:
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = (
        await db.table("campaigns")
        .update(data)
        .eq("id", str(campaign_id))
        .execute()
    )
    return _row_to_campaign(result.data[0])


async def soft_delete(db: AsyncClient, campaign_id: UUID) -> None:
    await db.table("campaigns").update(
        {
            "is_deleted": True,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
    ).eq("id", str(campaign_id)).execute()


async def count_today_by_owner(db: AsyncClient, owner_id: UUID) -> int:
    today = date.today().isoformat()
    result = (
        await db.table("campaigns")
        .select("id", count="exact")
        .eq("owner_id", str(owner_id))
        .gte("created_at", f"{today}T00:00:00")
        .lt("created_at", f"{today}T23:59:59")
        .execute()
    )
    return result.count or 0


async def create_update(
    db: AsyncClient,
    campaign_id: UUID,
    data: CreateCampaignUpdateSchema,
) -> CampaignUpdate:
    payload = {
        "campaign_id": str(campaign_id),
        "content": data.content,
        "images": data.images,
    }
    result = await db.table("campaign_updates").insert(payload).execute()
    return _row_to_campaign_update(result.data[0])


async def get_updates(
    db: AsyncClient, campaign_id: UUID
) -> list[CampaignUpdate]:
    result = (
        await db.table("campaign_updates")
        .select("*")
        .eq("campaign_id", str(campaign_id))
        .order("created_at", desc=True)
        .execute()
    )
    return [_row_to_campaign_update(row) for row in result.data]


async def get_ai_review(
    db: AsyncClient, campaign_id: UUID
) -> AIReviewData | None:
    verification_result = (
        await db.table("ai_verifications")
        .select("*")
        .eq("campaign_id", str(campaign_id))
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    if not verification_result.data:
        return None

    verification = verification_result.data[0]

    decision_result = (
        await db.table("ai_council_decisions")
        .select("*")
        .eq("campaign_id", str(campaign_id))
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    decision = decision_result.data[0] if decision_result.data else None

    return AIReviewData(
        score=Decimal(str(verification["score"])),
        flags=verification.get("flags") or [],
        summary=verification.get("summary"),
        welfare_vote=decision["welfare_vote"] if decision else None,
        finance_vote=decision["finance_vote"] if decision else None,
        fraud_vote=decision["fraud_vote"] if decision else None,
        final_decision=decision["final_decision"] if decision else None,
        decision_reason=decision["decision_reason"] if decision else None,
    )
