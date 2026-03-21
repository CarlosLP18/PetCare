from datetime import datetime, timezone
from decimal import Decimal
from typing import Any
from uuid import UUID

from supabase import AsyncClient

from src.donations.models import CreateDonationSchema, Donation, DonationStatus


def _row_to_donation(row: dict[str, Any]) -> Donation:
    return Donation(
        id=UUID(row["id"]),
        campaign_id=UUID(row["campaign_id"]),
        donor_id=UUID(row["donor_id"]),
        amount=Decimal(str(row["amount"])),
        message=row.get("message"),
        is_anonymous=row["is_anonymous"],
        status=DonationStatus(row["status"]),
        payment_ref=row.get("payment_ref"),
        created_at=datetime.fromisoformat(row["created_at"]),
        updated_at=datetime.fromisoformat(row["updated_at"]),
    )


async def create(
    db: AsyncClient,
    donor_id: UUID,
    campaign_id: UUID,
    data: CreateDonationSchema,
) -> Donation:
    payload: dict[str, Any] = {
        "donor_id": str(donor_id),
        "campaign_id": str(campaign_id),
        "amount": float(data.amount),
        "is_anonymous": data.is_anonymous,
        "status": DonationStatus.completed.value,  # MVP: simula pago exitoso
    }
    if data.message is not None:
        payload["message"] = data.message

    result = await db.table("donations").insert(payload).execute()
    return _row_to_donation(result.data[0])


async def list_by_campaign(
    db: AsyncClient, campaign_id: UUID, page: int, page_size: int
) -> list[dict[str, Any]]:
    """Returns raw rows with user_profiles joined for display_name."""
    offset = (page - 1) * page_size
    result = (
        await db.table("donations")
        .select("*, user_profiles(display_name)")
        .eq("campaign_id", str(campaign_id))
        .eq("status", DonationStatus.completed.value)
        .order("created_at", desc=True)
        .range(offset, offset + page_size - 1)
        .execute()
    )
    return result.data  # type: ignore[return-value]


async def list_by_donor(db: AsyncClient, donor_id: UUID) -> list[Donation]:
    result = (
        await db.table("donations")
        .select("*")
        .eq("donor_id", str(donor_id))
        .order("created_at", desc=True)
        .execute()
    )
    return [_row_to_donation(row) for row in result.data]


async def update_status(
    db: AsyncClient, donation_id: UUID, status: DonationStatus
) -> Donation:
    result = (
        await db.table("donations")
        .update(
            {
                "status": status.value,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        .eq("id", str(donation_id))
        .execute()
    )
    return _row_to_donation(result.data[0])
