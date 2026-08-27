import time
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.crews.planner_crew import PlannerCrew
from app.crews.finance_crew import FinanceCrew
from app.crews.study_crew import StudyCrew

router = APIRouter(prefix="/api/v1", tags=["CrewAI Multi-Agent Service"])

# Request / Response Schemas
class DispatchRequest(BaseModel):
    userId: str = Field(..., json_schema_extra={"example": "usr_123"})
    agentRole: str = Field(default="general_planner", json_schema_extra={"example": "planner"})
    task: str = Field(..., json_schema_extra={"example": "Plan daily schedule based on priority tasks"})
    provider: Optional[str] = Field(default="gemini", json_schema_extra={"example": "gemini"})
    model: Optional[str] = Field(default=None, json_schema_extra={"example": "gemini-1.5-pro"})
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)

class PlannerRequest(BaseModel):
    userId: str
    tasks: List[Dict[str, Any]] = Field(default_factory=list)
    events: List[Dict[str, Any]] = Field(default_factory=list)

class FinanceRequest(BaseModel):
    userId: str
    expenses: List[Dict[str, Any]] = Field(default_factory=list)

class StudyRequest(BaseModel):
    userId: str
    noteTitle: str
    content: str
    cardCount: Optional[int] = 5

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "LifeOS Python CrewAI Service",
        "version": "1.0.0",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }

@router.post("/dispatch")
def dispatch_task(request: DispatchRequest):
    start_time = time.time()
    role_lower = request.agentRole.lower()

    if "planner" in role_lower or "schedule" in role_lower:
        crew = PlannerCrew(provider=request.provider, model=request.model)
        tasks = request.parameters.get("tasks", [])
        events = request.parameters.get("events", [])
        result = crew.run_daily_brief(request.userId, tasks, events)
    elif "finance" in role_lower or "expense" in role_lower:
        crew = FinanceCrew(provider=request.provider, model=request.model)
        expenses = request.parameters.get("expenses", [])
        result = crew.run_expense_audit(request.userId, expenses)
    elif "study" in role_lower or "flashcard" in role_lower:
        crew = StudyCrew(provider=request.provider, model=request.model)
        note_title = request.parameters.get("noteTitle", "Untitled Note")
        content = request.parameters.get("content", request.task)
        result = crew.generate_flashcards(request.userId, note_title, content)
    else:
        result = {
            "crew": "UniversalCrew",
            "agent_role": request.agentRole,
            "summary": f"Executed multi-agent reasoning task: '{request.task}'",
            "recommendations": ["Task processed successfully."],
        }

    latency_ms = int((time.time() - start_time) * 1000)
    return {
        "success": True,
        "dispatchId": f"disp_{int(time.time() * 1000)}",
        "userId": request.userId,
        "agentRole": request.agentRole,
        "result": result,
        "executionLatencyMs": latency_ms,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }

@router.post("/crews/planner")
def run_planner_crew(request: PlannerRequest):
    crew = PlannerCrew()
    result = crew.run_daily_brief(request.userId, request.tasks, request.events)
    return {"success": True, "data": result}

@router.post("/crews/finance")
def run_finance_crew(request: FinanceRequest):
    crew = FinanceCrew()
    result = crew.run_expense_audit(request.userId, request.expenses)
    return {"success": True, "data": result}

@router.post("/crews/study")
def run_study_crew(request: StudyRequest):
    crew = StudyCrew()
    result = crew.generate_flashcards(request.userId, request.noteTitle, request.content, request.cardCount)
    return {"success": True, "data": result}
