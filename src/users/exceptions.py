from src.shared.exceptions import NotFoundError


class UserNotFoundError(NotFoundError):
    def __init__(self) -> None:
        super().__init__(detail="User not found")
