from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from src.shared.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class UserClaims(BaseModel):
    user_id: UUID
    email: str


async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserClaims:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            settings.supabase_anon_key,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        user_id: str | None = payload.get("sub")
        email: str | None = payload.get("email")
        if user_id is None or email is None:
            raise credentials_exception
        return UserClaims(user_id=UUID(user_id), email=email)
    except (JWTError, ValueError):
        raise credentials_exception
