"""
HealMyPaw — AI Council Intelligent Contract for GenLayer

This contract runs on GenLayer's blockchain. Each call to `evaluate()` is
executed by 5 independent validator nodes, each with its own LLM instance.
The "Optimistic Democracy" consensus mechanism ensures the result is trustless
and immutable — not even the platform can forge an approval.

Pitch: "Every campaign is evaluated by 5 independent AI validators on the
blockchain. The result is immutable and verifiable. Trust without intermediaries."
"""

from genlayer import *  # type: ignore[import]
import json


class CampaignCouncil(gl.Contract):  # type: ignore[name-defined]
    # campaign_id → JSON string with the council result
    decisions: TreeMap[str, str]  # type: ignore[name-defined]

    def __init__(self) -> None:
        self.decisions = TreeMap()  # type: ignore[name-defined]

    @gl.public.write  # type: ignore[attr-defined]
    def evaluate(
        self,
        campaign_id: str,
        title: str,
        story: str,
        diagnosis: str,
        goal_amount: str,
        vet_info: str,
    ) -> None:
        """
        Evaluate a pet medical crowdfunding campaign via the AI Council.

        Each of the 5 GenLayer validators runs this function independently
        with its own LLM, then the network reaches consensus via Optimistic Democracy.

        Fraud veto is absolute: if the Fraud Agent votes 'reject', the final
        decision is 'reject' regardless of the other two agents.
        """

        def nondet() -> str:
            prompt = f"""You are an AI Council evaluating a pet medical crowdfunding campaign.
You must evaluate from THREE independent perspectives simultaneously.

Campaign Title: {title}
Pet Story: {story}
Medical Diagnosis: {diagnosis}
Funding Goal: ${goal_amount}
Veterinary Info: {vet_info}

Evaluate from these three roles:

1. WELFARE AGENT: Is the animal in genuine medical need? Is the diagnosis credible and specific for this species? Is the treatment described appropriate?

2. FINANCE AGENT: Is the funding goal reasonable and proportional to the stated diagnosis and treatment? Are the financial details consistent and plausible?

3. FRAUD AGENT: Are there red flags suggesting a fraudulent campaign? Look for: generic/templated stories, inconsistencies between diagnosis and goal amount, vague medical details, implausible claims.

CRITICAL RULE: If the fraud agent votes "reject", the final decision MUST be "reject" regardless of what the other agents vote. The fraud veto is absolute.
For all other cases: if 2 or more agents vote "approve", final is "approve". Otherwise final is "reject".

Return ONLY this JSON object (no markdown, no explanation outside JSON):
{{"welfare": "approve" | "reject", "finance": "approve" | "reject", "fraud": "approve" | "reject", "final": "approve" | "reject", "reasoning": "brief 1-2 sentence explanation"}}"""
            return gl.nondet.exec_prompt(prompt)  # type: ignore[name-defined]

        result = gl.eq_principle.prompt_non_comparative(  # type: ignore[name-defined]
            nondet,
            criteria=(
                "The JSON must contain valid votes (approve or reject) for welfare, "
                "finance, fraud, and final fields. The final field must respect the "
                "fraud veto rule: if fraud is reject, final must be reject."
            ),
        )

        # Server-side safety: enforce fraud veto and majority rule
        parsed: dict[str, str] = json.loads(result)

        welfare = parsed.get("welfare", "reject")
        finance = parsed.get("finance", "reject")
        fraud = parsed.get("fraud", "reject")
        reasoning = parsed.get("reasoning", "")

        if fraud == "reject":
            final = "reject"
        else:
            approve_count = [welfare, finance, fraud].count("approve")
            final = "approve" if approve_count >= 2 else "reject"

        self.decisions[campaign_id] = json.dumps(
            {
                "welfare": welfare,
                "finance": finance,
                "fraud": fraud,
                "final": final,
                "reasoning": reasoning,
            }
        )

    @gl.public.view  # type: ignore[attr-defined]
    def get_decision(self, campaign_id: str) -> str:
        """Return the JSON-encoded council decision for a campaign, or empty string."""
        return self.decisions.get(campaign_id, "")  # type: ignore[return-value]
