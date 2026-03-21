import logging
from uuid import UUID

from fastapi import BackgroundTasks
from supabase import AsyncClient

from src.ai.council.orchestrator import run_council
from src.campaigns.exceptions import (
    CampaignForbiddenError,
    CampaignNotEditableError,
    CampaignNotFoundError,
    CampaignNotResubmittableError,
    CampaignRateLimitError,
    ResubmitLimitReachedError,
)
from src.campaigns.models import (
    AIReviewData,
    Campaign,
    CampaignStatus,
    CampaignUpdate,
    CreateCampaignSchema,
    CreateCampaignUpdateSchema,
    PetSpecies,
    UpdateCampaignSchema,
)
from src.campaigns import repository
from src.shared.database import get_db

logger = logging.getLogger(__name__)

_EDITABLE_STATUSES = {
    CampaignStatus.pending_verification,
    CampaignStatus.rejected_auto,
    CampaignStatus.rejected_council,
}

MAX_CAMPAIGNS_PER_DAY = 3
MAX_RESUBMIT_COUNT = 2


async def _run_ai_pipeline(campaign_id: UUID) -> None:
    """Send campaign to GenLayer Council (5 on-chain LLM validators)."""
    db = await get_db()

    campaign = await repository.get_by_id(db, campaign_id)
    if campaign is None:
        logger.error("AI pipeline: campaign %s not found", campaign_id)
        return

    await repository.update(
        db, campaign_id, {"status": CampaignStatus.pending_council.value}
    )

    await run_council(
        db=db,
        campaign_id=campaign_id,
        title=campaign.title,
        pet_species=campaign.pet_species.value,
        story=campaign.story,
        diagnosis=campaign.diagnosis,
        goal_amount=float(campaign.goal_amount),
        vet_clinic=campaign.vet_clinic or "",
    )


async def create_campaign(
    db: AsyncClient,
    owner_id: UUID,
    data: CreateCampaignSchema,
    background_tasks: BackgroundTasks,
) -> Campaign:
    count = await repository.count_today_by_owner(db, owner_id)
    if count >= MAX_CAMPAIGNS_PER_DAY:
        raise CampaignRateLimitError()

    campaign = await repository.create(db, owner_id, data)
    background_tasks.add_task(_run_ai_pipeline, campaign.id)
    return campaign


async def get_campaign(db: AsyncClient, campaign_id: UUID) -> Campaign:
    campaign = await repository.get_by_id(db, campaign_id)
    if campaign is None or campaign.is_deleted:
        raise CampaignNotFoundError()
    return campaign


async def list_campaigns(
    db: AsyncClient,
    page: int,
    page_size: int,
    species: PetSpecies | None,
) -> list[Campaign]:
    return await repository.list_active(db, page, page_size, species)


async def get_my_campaigns(db: AsyncClient, owner_id: UUID) -> list[Campaign]:
    return await repository.list_by_owner(db, owner_id)


async def update_campaign(
    db: AsyncClient,
    campaign_id: UUID,
    owner_id: UUID,
    data: UpdateCampaignSchema,
) -> Campaign:
    campaign = await repository.get_by_id(db, campaign_id)
    if campaign is None:
        raise CampaignNotFoundError()
    if campaign.owner_id != owner_id:
        raise CampaignForbiddenError()
    if campaign.status not in _EDITABLE_STATUSES:
        raise CampaignNotEditableError()

    update_data = data.model_dump(exclude_none=True)
    # Convertir tipos no serializables directamente
    if "pet_species" in update_data:
        update_data["pet_species"] = update_data["pet_species"].value
    if "goal_amount" in update_data:
        update_data["goal_amount"] = float(update_data["goal_amount"])
    if "pet_age_years" in update_data:
        update_data["pet_age_years"] = float(update_data["pet_age_years"])
    if "deadline" in update_data:
        update_data["deadline"] = update_data["deadline"].isoformat()

    if not update_data:
        return campaign
    return await repository.update(db, campaign_id, update_data)


async def delete_campaign(
    db: AsyncClient, campaign_id: UUID, owner_id: UUID
) -> None:
    campaign = await repository.get_by_id(db, campaign_id)
    if campaign is None:
        raise CampaignNotFoundError()
    if campaign.owner_id != owner_id:
        raise CampaignForbiddenError()
    await repository.soft_delete(db, campaign_id)


async def create_campaign_update(
    db: AsyncClient,
    campaign_id: UUID,
    owner_id: UUID,
    data: CreateCampaignUpdateSchema,
) -> CampaignUpdate:
    campaign = await repository.get_by_id(db, campaign_id)
    if campaign is None:
        raise CampaignNotFoundError()
    if campaign.owner_id != owner_id:
        raise CampaignForbiddenError()
    if campaign.status != CampaignStatus.active:
        raise CampaignNotEditableError()
    return await repository.create_update(db, campaign_id, data)


async def get_campaign_updates(
    db: AsyncClient, campaign_id: UUID
) -> list[CampaignUpdate]:
    campaign = await repository.get_by_id(db, campaign_id)
    if campaign is None:
        raise CampaignNotFoundError()
    return await repository.get_updates(db, campaign_id)


async def get_ai_review(
    db: AsyncClient, campaign_id: UUID, owner_id: UUID
) -> AIReviewData:
    campaign = await repository.get_by_id(db, campaign_id)
    if campaign is None:
        raise CampaignNotFoundError()
    if campaign.owner_id != owner_id:
        raise CampaignForbiddenError()

    review = await repository.get_ai_review(db, campaign_id)
    if review is None:
        # Campaña recién creada, sin verificación todavía
        return AIReviewData(
            score=None,
            flags=[],
            summary=None,
            welfare_vote=None,
            finance_vote=None,
            fraud_vote=None,
            final_decision=None,
            decision_reason=None,
        )
    return review


async def resubmit_campaign(
    db: AsyncClient, campaign_id: UUID, owner_id: UUID, background_tasks: BackgroundTasks
) -> Campaign:
    campaign = await repository.get_by_id(db, campaign_id)
    if campaign is None:
        raise CampaignNotFoundError()
    if campaign.owner_id != owner_id:
        raise CampaignForbiddenError()
    if campaign.status != CampaignStatus.rejected_council:
        raise CampaignNotResubmittableError()
    if campaign.resubmit_count >= MAX_RESUBMIT_COUNT:
        raise ResubmitLimitReachedError()

    updated = await repository.update(
        db,
        campaign_id,
        {
            "status": CampaignStatus.pending_verification.value,
            "resubmit_count": campaign.resubmit_count + 1,
        },
    )
    background_tasks.add_task(_run_ai_pipeline, campaign_id)
    return updated
