from uuid import UUID

from fastapi import APIRouter, Depends, Query
from supabase import AsyncClient

from src.campaigns.models import Campaign, CampaignResponseSchema
from src.shared.auth import UserClaims, get_current_user
from src.shared.database import get_db
from src.users.models import UpdateUserSchema, UserProfileResponseSchema
from src.users import service

router = APIRouter()


def _campaign_to_response(c: Campaign) -> CampaignResponseSchema:
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


@router.get("/me", response_model=UserProfileResponseSchema)
async def get_me(
    current_user: UserClaims = Depends(get_current_user),
    db: AsyncClient = Depends(get_db),
) -> UserProfileResponseSchema:
    user = await service.get_me(db, current_user.user_id)
    return UserProfileResponseSchema(
        id=user.id,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        bio=user.bio,
        is_verified=user.is_verified,
        created_at=user.created_at,
    )


@router.patch("/me", response_model=UserProfileResponseSchema)
async def update_me(
    data: UpdateUserSchema,
    current_user: UserClaims = Depends(get_current_user),
    db: AsyncClient = Depends(get_db),
) -> UserProfileResponseSchema:
    user = await service.update_me(db, current_user.user_id, data)
    return UserProfileResponseSchema(
        id=user.id,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        bio=user.bio,
        is_verified=user.is_verified,
        created_at=user.created_at,
    )


@router.get("/{user_id}/campaigns", response_model=list[CampaignResponseSchema])
async def get_user_campaigns(
    user_id: UUID,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncClient = Depends(get_db),
) -> list[CampaignResponseSchema]:
    campaigns = await service.get_public_campaigns(db, user_id, page, page_size)
    return [_campaign_to_response(c) for c in campaigns]
