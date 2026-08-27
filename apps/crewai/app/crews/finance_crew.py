import logging
from typing import Dict, Any, List
from app.agents.agent_factory import AgentFactory

logger = logging.getLogger("crewai.finance_crew")

class FinanceCrew:
    """Multi-Agent Crew for Financial Auditing & Expense Categorization."""

    def __init__(self, provider: str = "gemini", model: str = None):
        self.agent = AgentFactory.create_agent("finance", provider, model)

    def run_expense_audit(self, user_id: str, expenses: List[Dict[str, Any]]) -> Dict[str, Any]:
        logger.info(f"Running Financial Audit Crew for User {user_id}")
        
        total_spent = sum(float(e.get("amount", 0)) for e in expenses)
        categories = {}
        for e in expenses:
            cat = e.get("category", "MISCELLANEOUS")
            categories[cat] = categories.get(cat, 0) + float(e.get("amount", 0))

        top_category = max(categories.keys(), key=lambda k: categories[k]) if categories else "MISCELLANEOUS"

        return {
            "crew": "FinanceCrew",
            "agent_role": self.agent["role"],
            "summary": f"Audited {len(expenses)} transactions totalling ${total_spent:.2f}. Highest spend category: {top_category}.",
            "insights": [
                f"Total expenditure across {len(expenses)} items is ${total_spent:.2f}.",
                f"Largest spending driver is {top_category} at ${categories.get(top_category, 0):.2f}.",
                "Suggested budget allocation: Cap non-essential categories at 20% of monthly baseline.",
            ],
            "metrics": {
                "totalSpent": total_spent,
                "transactionCount": len(expenses),
                "categoryBreakdown": categories,
            },
        }
