from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from supabase import AsyncClient

from src.users.models import UserProfile


def _row_to_user(row: dict[str, Any]) -> UserProfile:
    return UserProfile(
        id=UUID(row["id"]),
        display_name=row["display_name"],
        avatar_url=row.get("avatar_url"),
        bio=row.get("bio"),
        phone=row.get("phone"),
        is_verified=row["is_verified"],
        created_at=datetime.fromisoformat(row["created_at"]),
        updated_at=datetime.fromisoformat(row["updated_at"]),
    )


async def get_by_id(db: AsyncClient, user_id: UUID) -> UserProfile | None:
    result = (
        await db.table("user_profiles")
        .select("*")
        .eq("id", str(user_id))
        .execute()
    )
    if not result.data:
        return None
    return _row_to_user(result.data[0])


async def update(db: AsyncClient, user_id: UUID, data: dict[str, Any]) -> UserProfile:
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = (
        await db.table("user_profiles")
        .update(data)
        .eq("id", str(user_id))
        .execute()
    )
    return _row_to_user(result.data[0])
