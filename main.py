from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.campaigns.router import router as campaigns_router
from src.donations.router import router as donations_router
from src.shared.config import settings
from src.shared.database import close_db, init_db
from src.users.router import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    await init_db()
    yield
    await close_db()


app = FastAPI(title="HealMyPaw", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(campaigns_router, prefix="/campaigns", tags=["campaigns"])
# donations router sin prefix — define rutas completas: /campaigns/{id}/donate y /donations/mine
app.include_router(donations_router, tags=["donations"])


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
