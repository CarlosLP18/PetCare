from dataclasses import dataclass


@dataclass
class CouncilDecision:
    welfare: str
    finance: str
    fraud: str
    final: str
    reasoning: str
