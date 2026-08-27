import logging
from typing import Dict, Any, Optional
from app.providers.llm_factory import LlmProviderFactory

logger = logging.getLogger("crewai.agents")

class AgentFactory:
    """Factory for creating domain-specific CrewAI agents."""

    @staticmethod
    def create_agent(agent_role: str, provider: str = "gemini", model: str = None) -> Dict[str, Any]:
        llm = LlmProviderFactory.get_llm(provider, model)
        role_lower = agent_role.lower()

        if "planner" in role_lower or "schedule" in role_lower:
            return {
                "role": "Chief Daily Planner Agent",
                "goal": "Optimize daily schedules, prioritize tasks using Eisenhower Matrix, and plan habit streaks.",
                "backstory": "An expert productivity engineer specializing in time-blocking, task priority, and cognitive load management.",
                "llm": llm,
            }
        elif "finance" in role_lower or "expense" in role_lower:
            return {
                "role": "Financial Auditor Agent",
                "goal": "Audit user transactions, categorize expenses, and generate actionable savings insights.",
                "backstory": "A detail-oriented financial advisor skilled at expense categorizations and budget optimization.",
                "llm": llm,
            }
        elif "study" in role_lower or "note" in role_lower:
            return {
                "role": "Knowledge & Learning Coach Agent",
                "goal": "Summarize complex notes, extract key concepts, and build SM-2 flashcard decks.",
                "backstory": "An educational scientist specializing in active recall, spaced repetition, and study synthesis.",
                "llm": llm,
            }
        else:
            return {
                "role": "Universal Intelligence Agent",
                "goal": "Provide high-precision reasoning and assistance for general user productivity queries.",
                "backstory": "An all-around AI strategist for personal productivity and goal execution.",
                "llm": llm,
            }
