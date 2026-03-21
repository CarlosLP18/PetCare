from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, Query, status
from supabase import AsyncClient

from src.campaigns.models import (
    AIReviewResponseSchema,
    Campaign,
    CampaignDetailResponseSchema,
    CampaignResponseSchema,
    CampaignUpdate,
    CampaignUpdateResponseSchema,
    CreateCampaignSchema,
    CreateCampaignUpdateSchema,
    PetSpecies,
    UpdateCampaignSchema,
)
from src.campaigns import service
from src.shared.auth import UserClaims, get_current_user
from src.shared.database import get_db

router = APIRouter()


def _to_response(c: Campaign) -> CampaignResponseSchema:
    return CampaignResponseSchema(
        id=c.id,
        owner_id=c.owner_id,
        title=c.title,
        pet_name=c.pet_name,
        pet_species=c.pet_species,
        pet_age_years=c.pet_age_years,
        pet_breed=c.pet_breed,
        story=c.story,
        diagnosis=c.diagnosis,
        vet_name=c.vet_name,
        vet_clinic=c.vet_clinic,
        goal_amount=c.goal_amount,
        total_raised=c.total_raised,
        status=c.status,
        deadline=c.deadline,
        images=c.images,
        medical_documents=c.medical_documents,
        resubmit_count=c.resubmit_count,
        created_at=c.created_at,
        updated_at=c.updated_at,
    )


def _to_update_response(u: CampaignUpdate) -> CampaignUpdateResponseSchema:
    return CampaignUpdateResponseSchema(
        id=u.id,
        content=u.content,
        images=u.images,
        created_at=u.created_at,
    )


# ── CRÍTICO: /mine ANTES de /{id} para evitar que FastAPI capture "mine" como UUID ──

@router.get("/mine", response_model=list[CampaignResponseSchema])
async def get_my_campaigns(
    current_user: UserClaims = Depends(get_current_user),
    db: AsyncClient = Depends(get_db),
) -> list[CampaignResponseSchema]:
    campaigns = await service.get_my_campaigns(db, current_user.user_id)
    return [_to_response(c) for c in campaigns]


@router.post("", response_model=CampaignResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    data: CreateCampaignSchema,
    background_tasks: BackgroundTasks,
    current_user: UserClaims = Depends(get_current_user),
    db: AsyncClient = Depends(get_db),
) -> CampaignResponseSchema:
    campaign = await service.create_campaign(
        db, current_user.user_id, data, background_tasks
    )
    return _to_response(campaign)


@router.get("", response_model=list[CampaignResponseSchema])
async def list_campaigns(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    species: PetSpecies | None = Query(default=None),
    db: AsyncClient = Depends(get_db),
) -> list[CampaignResponseSchema]:
    campaigns = await service.list_campaigns(db, page, page_size, species)
    return [_to_response(c) for c in campaigns]


@router.get("/{campaign_id}", response_model=CampaignDetailResponseSchema)
async def get_campaign(
    campaign_id: UUID,
    db: AsyncClient = Depends(get_db),
) -> CampaignDetailResponseSchema:
    campaign = await service.get_campaign(db, campaign_id)
    return CampaignDetailResponseSchema(**_to_response(campaign).model_dump())


@router.patch("/{campaign_id}", response_model=CampaignResponseSchema)
async def update_campaign(
    campaign_id: UUID,
    data: UpdateCampaignSchema,
    current_user: UserClaims = Depends(get_current_user),
    db: AsyncClient = Depends(get_db),
) -> CampaignResponseSchema:
    campaign = await service.update_campaign(
        db, campaign_id, current_user.user_id, data
    )
    return _to_response(campaign)


@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_campaign(
    campaign_id: UUID,
    current_user: UserClaims = Depends(get_current_user),
    db: AsyncClient = Depends(get_db),
) -> None:
    await service.delete_campaign(db, campaign_id, current_user.user_id)


@router.post(
    "/{campaign_id}/updates",
    response_model=CampaignUpdateResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
async def create_campaign_update(
    campaign_id: UUID,
    data: CreateCampaignUpdateSchema,
    current_user: UserClaims = Depends(get_current_user),
    db: AsyncClient = Depends(get_db),
) -> CampaignUpdateResponseSchema:
    update = await service.create_campaign_update(
        db, campaign_id, current_user.user_id, data
    )
    return _to_update_response(update)


@router.get("/{campaign_id}/updates", response_model=list[CampaignUpdateResponseSchema])
async def get_campaign_updates(
    campaign_id: UUID,
    db: AsyncClient = Depends(get_db),
) -> list[CampaignUpdateResponseSchema]:
    updates = await service.get_campaign_updates(db, campaign_id)
    return [_to_update_response(u) for u in updates]


@router.get("/{campaign_id}/ai-review", response_model=AIReviewResponseSchema)
async def get_ai_review(
    campaign_id: UUID,
    current_user: UserClaims = Depends(get_current_user),
    db: AsyncClient = Depends(get_db),
) -> AIReviewResponseSchema:
    review = await service.get_ai_review(db, campaign_id, current_user.user_id)
    return AIReviewResponseSchema(
        score=review.score,
        flags=review.flags,
        summary=review.summary,
        welfare_vote=review.welfare_vote,
        finance_vote=review.finance_vote,
        fraud_vote=review.fraud_vote,
        final_decision=review.final_decision,
        decision_reason=review.decision_reason,
    )


@router.post("/{campaign_id}/resubmit", response_model=CampaignResponseSchema)
async def resubmit_campaign(
    campaign_id: UUID,
    background_tasks: BackgroundTasks,
    current_user: UserClaims = Depends(get_current_user),
    db: AsyncClient = Depends(get_db),
) -> CampaignResponseSchema:
    campaign = await service.resubmit_campaign(
        db, campaign_id, current_user.user_id, background_tasks
    )
    return _to_response(campaign)
