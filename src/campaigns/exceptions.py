from src.shared.exceptions import (
    ConflictError,
    ForbiddenError,
    NotFoundError,
    RateLimitError,
    UnprocessableError,
)


class CampaignNotFoundError(NotFoundError):
    def __init__(self) -> None:
        super().__init__(detail="Campaign not found")


class CampaignForbiddenError(ForbiddenError):
    def __init__(self) -> None:
        super().__init__(detail="You don't have permission to modify this campaign")


class CampaignNotEditableError(UnprocessableError):
    def __init__(self) -> None:
        super().__init__(
            detail="Campaign can only be edited when in pending_verification or rejected status"
        )


class CampaignRateLimitError(RateLimitError):
    def __init__(self) -> None:
        super().__init__(detail="Maximum 20 campaigns per day allowed")


class ResubmitLimitReachedError(ConflictError):
    def __init__(self) -> None:
        super().__init__(detail="Campaign has reached maximum resubmit limit (2)")


class CampaignNotResubmittableError(UnprocessableError):
    def __init__(self) -> None:
        super().__init__(
            detail="Only rejected_council campaigns can be resubmitted"
        )
