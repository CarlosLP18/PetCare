from supabase import AsyncClient, create_async_client

from src.shared.config import settings

_db: AsyncClient | None = None


async def init_db() -> None:
    global _db
    _db = await create_async_client(
        settings.supabase_url,
        settings.supabase_service_role_key,
    )


async def close_db() -> None:
    global _db
    _db = None


async def get_db() -> AsyncClient:
    if _db is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return _db
