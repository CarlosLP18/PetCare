from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from supabase import AsyncClient

from src.donations.models import (
    CreateDonationSchema,
    Donation,
    DonationResponseSchema,
    PublicDonationResponseSchema,
)
from src.donations import service
from src.shared.auth import UserClaims, get_current_user
from src.shared.database import get_db

router = APIRouter()


def _to_response(d: Donation) -> DonationResponseSchema:
    return DonationResponseSchema(
        id=d.id,
        campaign_id=d.campaign_id,
        amount=d.amount,
        message=d.message,
        is_anonymous=d.is_anonymous,
        status=d.status,
        created_at=d.created_at,
    )


@router.post(
    "/campaigns/{campaign_id}/donate",
    response_model=DonationResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
async def donate(
    campaign_id: UUID,
    data: CreateDonationSchema,
    current_user: UserClaims = Depends(get_current_user),
    db: AsyncClient = Depends(get_db),
) -> DonationResponseSchema:
    donation = await service.donate(db, current_user.user_id, campaign_id, data)
    return _to_response(donation)


@router.get(
    "/campaigns/{campaign_id}/donations",
    response_model=list[PublicDonationResponseSchema],
)
async def list_campaign_donations(
    campaign_id: UUID,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncClient = Depends(get_db),
) -> list[PublicDonationResponseSchema]:
    return await service.list_campaign_donations(db, campaign_id, page, page_size)


@router.get("/donations/mine", response_model=list[DonationResponseSchema])
async def list_my_donations(
    current_user: UserClaims = Depends(get_current_user),
    db: AsyncClient = Depends(get_db),
) -> list[DonationResponseSchema]:
    donations = await service.list_my_donations(db, current_user.user_id)
    return [_to_response(d) for d in donations]
