import logging
from typing import Dict, Any, List
from app.agents.agent_factory import AgentFactory

logger = logging.getLogger("crewai.planner_crew")

class PlannerCrew:
    """Multi-Agent Crew for Daily Briefings & Schedule Optimization."""

    def __init__(self, provider: str = "gemini", model: str = None):
        self.agent = AgentFactory.create_agent("planner", provider, model)

    def run_daily_brief(self, user_id: str, tasks: List[Dict[str, Any]], events: List[Dict[str, Any]]) -> Dict[str, Any]:
        logger.info(f"Running Daily Brief Crew for User {user_id}")
        
        task_count = len(tasks)
        event_count = len(events)
        
        # Calculate Eisenhower Matrix distribution
        q1_tasks = [t for t in tasks if t.get("priority") == "URGENT_IMPORTANT"]
        q2_tasks = [t for t in tasks if t.get("priority") == "NOT_URGENT_IMPORTANT"]
        
        summary = (
            f"Daily Briefing for User {user_id}:\n"
            f"- Scheduled Events: {event_count}\n"
            f"- Total Tasks: {task_count} (Q1 Urgent: {len(q1_tasks)}, Q2 Focus: {len(q2_tasks)})\n"
            f"- Strategy: Focus on Q2 strategic goals first, execute Q1 tasks in morning time-blocks."
        )

        return {
            "crew": "PlannerCrew",
            "agent_role": self.agent["role"],
            "summary": summary,
            "recommendations": [
                "Complete top Q1 urgent task before 11:00 AM.",
                "Reserve a 90-minute deep work block for Q2 strategic goal.",
                "Review evening habits and complete daily check-in.",
            ],
            "metrics": {
                "tasksCount": task_count,
                "eventsCount": event_count,
                "q1UrgentCount": len(q1_tasks),
                "q2FocusCount": len(q2_tasks),
            },
        }
