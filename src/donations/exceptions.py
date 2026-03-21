from src.shared.exceptions import NotFoundError, UnprocessableError


class CampaignNotActiveError(UnprocessableError):
    def __init__(self) -> None:
        super().__init__(detail="Campaign is not active and cannot receive donations")


class DonationNotFoundError(NotFoundError):
    def __init__(self) -> None:
        super().__init__(detail="Donation not found")
