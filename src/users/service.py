from uuid import UUID

from supabase import AsyncClient

import src.campaigns.repository as campaigns_repo
from src.campaigns.models import Campaign
from src.users.exceptions import UserNotFoundError
from src.users.models import UpdateUserSchema, UserProfile
from src.users.repository import get_by_id, update


async def get_me(db: AsyncClient, user_id: UUID) -> UserProfile:
    user = await get_by_id(db, user_id)
    if user is None:
        raise UserNotFoundError()
    return user


async def update_me(
    db: AsyncClient, user_id: UUID, data: UpdateUserSchema
) -> UserProfile:
    user = await get_by_id(db, user_id)
    if user is None:
        raise UserNotFoundError()
    update_data = data.model_dump(exclude_none=True)
    if not update_data:
        return user
    return await update(db, user_id, update_data)


async def get_public_campaigns(
    db: AsyncClient, user_id: UUID, page: int, page_size: int
) -> list[Campaign]:
    return await campaigns_repo.list_by_owner_public(db, user_id, page, page_size)
