from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


@dataclass
class UserProfile:
    id: UUID
    display_name: str
    avatar_url: str | None
    bio: str | None
    phone: str | None
    is_verified: bool
    created_at: datetime
    updated_at: datetime


class UpdateUserSchema(BaseModel):
    display_name: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
    phone: str | None = None


class UserProfileResponseSchema(BaseModel):
    id: UUID
    display_name: str
    avatar_url: str | None
    bio: str | None
    is_verified: bool
    created_at: datetime
