import logging
from decimal import Decimal
from typing import Any
from uuid import UUID

from supabase import AsyncClient

from src.ai.exceptions import BlockchainError
from src.blockchain import client as blockchain
from src.campaigns import repository
from src.campaigns.models import CampaignStatus

logger = logging.getLogger(__name__)


async def run_council(
    db: AsyncClient,
    campaign_id: UUID,
    title: str,
    pet_species: str,
    story: str,
    diagnosis: str,
    goal_amount: float,
    vet_clinic: str,
) -> None:
    """Call the GenLayer contract and persist the full council result.

    The contract runs through 5 independent LLM validators on-chain.
    The result includes both the credibility score and the three agent votes.
    """
    try:
        decision = await blockchain.evaluate_campaign(
            title=title,
            pet_species=pet_species,
            story=story,
            diagnosis=diagnosis,
            goal_amount=goal_amount,
            vet_clinic=vet_clinic,
        )
        logger.info("Council decision received for campaign %s: %s", campaign_id, decision)

        welfare = str(decision.get("welfare_vote", "reject"))
        finance = str(decision.get("finance_vote", "reject"))
        fraud = str(decision.get("fraud_vote", "reject"))
        final = str(decision.get("final_decision", "reject"))
        reasoning = str(decision.get("reasoning", ""))
        score_raw = decision.get("score", 0.0)
        score = float(score_raw) if isinstance(score_raw, (int, float)) else 0.0

        # Persist score in ai_verifications (required by FK constraints)
        raw_response: dict[str, Any] = {k: str(v) for k, v in decision.items()}
        verification_result = await db.table("ai_verifications").insert(
            {
                "campaign_id": str(campaign_id),
                "score": score,
                "flags": [],
                "summary": reasoning,
                "raw_response": raw_response,
                "model_used": "genlayer-council",
                "tokens_used": None,
            }
        ).execute()
        verification_id = verification_result.data[0]["id"]

        # Persist individual agent votes
        for agent_type, vote in [
            ("welfare", welfare),
            ("finance", finance),
            ("fraud", fraud),
        ]:
            await db.table("ai_council_votes").insert(
                {
                    "campaign_id": str(campaign_id),
                    "verification_id": verification_id,
                    "agent_type": agent_type,
                    "vote": vote,
                    "reasoning": reasoning,
                    "metadata": {},
                }
            ).execute()

        # Persist final decision
        await db.table("ai_council_decisions").insert(
            {
                "campaign_id": str(campaign_id),
                "verification_id": verification_id,
                "final_decision": final,
                "decision_reason": reasoning,
                "welfare_vote": welfare,
                "finance_vote": finance,
                "fraud_vote": fraud,
            }
        ).execute()

        new_status = (
            CampaignStatus.active.value
            if final == "approve"
            else CampaignStatus.rejected_council.value
        )
        await repository.update(db, campaign_id, {"status": new_status})
        logger.info("Campaign %s → %s", campaign_id, new_status)

    except BlockchainError as e:
        logger.error("Blockchain error for campaign %s: %s", campaign_id, e)
