from decimal import Decimal
from typing import Any
from uuid import UUID

from supabase import AsyncClient

from src.campaigns.models import CampaignStatus
from src.campaigns import repository as campaigns_repo
from src.donations.exceptions import CampaignNotActiveError
from src.donations.models import (
    CreateDonationSchema,
    Donation,
    DonationResponseSchema,
    PublicDonationResponseSchema,
)
from src.donations import repository


async def donate(
    db: AsyncClient,
    donor_id: UUID,
    campaign_id: UUID,
    data: CreateDonationSchema,
) -> Donation:
    campaign = await campaigns_repo.get_by_id(db, campaign_id)
    if campaign is None or campaign.status != CampaignStatus.active:
        raise CampaignNotActiveError()

    donation = await repository.create(db, donor_id, campaign_id, data)

    # Actualizar total_raised en la campaña (MVP: sin atomicidad estricta)
    new_total = campaign.total_raised + data.amount
    await campaigns_repo.update(
        db, campaign_id, {"total_raised": float(new_total)}
    )

    return donation


async def list_campaign_donations(
    db: AsyncClient, campaign_id: UUID, page: int, page_size: int
) -> list[PublicDonationResponseSchema]:
    rows: list[dict[str, Any]] = await repository.list_by_campaign(
        db, campaign_id, page, page_size
    )
    result: list[PublicDonationResponseSchema] = []
    for row in rows:
        profile = row.get("user_profiles") or {}
        display_name: str | None = None
        if not row["is_anonymous"]:
            display_name = profile.get("display_name")

        result.append(
            PublicDonationResponseSchema(
                id=row["id"],
                amount=Decimal(str(row["amount"])),
                message=row.get("message"),
                is_anonymous=row["is_anonymous"],
                donor_display_name=display_name,
                created_at=row["created_at"],
            )
        )
    return result


async def list_my_donations(
    db: AsyncClient, donor_id: UUID
) -> list[Donation]:
    return await repository.list_by_donor(db, donor_id)
