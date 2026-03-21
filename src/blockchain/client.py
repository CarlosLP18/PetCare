import json
import logging

import httpx

from src.ai.exceptions import BlockchainError
from src.shared.config import settings

logger = logging.getLogger(__name__)

# GenLayer consensus with 5 LLM validators takes time — be generous
_TIMEOUT_S = 120.0


async def _rpc(method: str, params: dict[str, object] | list[object]) -> object:
    async with httpx.AsyncClient(timeout=_TIMEOUT_S) as client:
        response = await client.post(
            settings.genlayer_node_url,
            json={"jsonrpc": "2.0", "method": method, "params": params, "id": 1},
        )
        response.raise_for_status()
        data: dict[str, object] = response.json()

    if "error" in data:
        raise BlockchainError(f"GenLayer RPC error: {data['error']}")

    return data.get("result")


async def evaluate_campaign(
    title: str,
    pet_species: str,
    story: str,
    diagnosis: str,
    goal_amount: float,
    vet_clinic: str,
) -> dict[str, object]:
    """Call the deployed GenLayer contract's evaluate_campaign function.

    This is a read call — GenLayer runs it through 5 independent LLM validators
    via Optimistic Democracy and returns the consensus result directly.

    Args match the deployed contract signature exactly:
        evaluate_campaign(title, pet_species, story, diagnosis, goal_amount, vet_clinic)

    Returns the parsed JSON with fields:
        score, welfare_vote, finance_vote, fraud_vote, final_decision, reasoning, ...
    """
    result = await _rpc(
        "gen_call",
        {
            "to": settings.genlayer_contract_address,
            "data": {
                "function": "evaluate_campaign",
                "args": [title, pet_species, story, diagnosis, goal_amount, vet_clinic],
            },
        },
    )

    if not isinstance(result, str):
        raise BlockchainError(f"Expected JSON string from contract, got: {result!r}")

    try:
        parsed: dict[str, object] = json.loads(result)
    except json.JSONDecodeError as e:
        raise BlockchainError(f"Contract returned invalid JSON: {result!r}") from e

    return parsed
