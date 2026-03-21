from uuid import UUID

from pydantic import BaseModel

# Demo user — auth disabled for demo purposes
_DEMO_USER_ID = UUID("a03190f7-3aa7-4a68-8be3-a1128807017f")
_DEMO_EMAIL = "test1@gmail.com"


class UserClaims(BaseModel):
    user_id: UUID
    email: str


async def get_current_user() -> UserClaims:
    return UserClaims(user_id=_DEMO_USER_ID, email=_DEMO_EMAIL)
