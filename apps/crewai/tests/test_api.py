from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["service"] == "LifeOS CrewAI Service"

def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_dispatch_planner():
    payload = {
        "userId": "usr_test_123",
        "agentRole": "planner",
        "task": "Plan my schedule",
        "parameters": {
            "tasks": [{"priority": "URGENT_IMPORTANT", "title": "Finish report"}],
            "events": [{"title": "Team sync"}]
        }
    }
    response = client.post("/api/v1/dispatch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["result"]["crew"] == "PlannerCrew"

def test_dispatch_finance():
    payload = {
        "userId": "usr_test_456",
        "agentRole": "finance",
        "task": "Audit expenses",
        "parameters": {
            "expenses": [{"amount": 45.5, "category": "FOOD_DINING"}]
        }
    }
    response = client.post("/api/v1/dispatch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["result"]["crew"] == "FinanceCrew"

def test_dispatch_study():
    payload = {
        "userId": "usr_test_789",
        "agentRole": "study",
        "task": "Generate flashcards",
        "parameters": {
            "noteTitle": "OS Concepts",
            "content": "Process context switching and thread scheduling memory layouts."
        }
    }
    response = client.post("/api/v1/dispatch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["result"]["crew"] == "StudyCrew"
