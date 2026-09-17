import unittest
from fastapi.testclient import TestClient
from main import app

class TestCrewAIService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_root(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["service"], "LifeOS CrewAI Service")

    def test_health(self):
        response = self.client.get("/api/v1/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "healthy")

    def test_dispatch_planner(self):
        payload = {
            "userId": "usr_test_123",
            "agentRole": "planner",
            "task": "Plan my schedule",
            "parameters": {
                "tasks": [{"priority": "URGENT_IMPORTANT", "title": "Finish report"}],
                "events": [{"title": "Team sync"}]
            }
        }
        response = self.client.post("/api/v1/dispatch", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["result"]["crew"], "PlannerCrew")

    def test_dispatch_finance(self):
        payload = {
            "userId": "usr_test_456",
            "agentRole": "finance",
            "task": "Audit expenses",
            "parameters": {
                "expenses": [{"amount": 45.5, "category": "FOOD_DINING"}]
            }
        }
        response = self.client.post("/api/v1/dispatch", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["result"]["crew"], "FinanceCrew")

    def test_dispatch_notes(self):
        payload = {
            "userId": "usr_test_999",
            "agentRole": "notes_summarizer",
            "task": "Summarize lecture note",
            "parameters": {
                "title": "Machine Learning Foundations",
                "content": "Supervised learning algorithms map inputs to outputs. Unsupervised learning discovers hidden patterns in unlabeled data. Deep learning relies on neural network layers [[Deep Learning]]. #ai #ml"
            }
        }
        response = self.client.post("/api/v1/dispatch", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["result"]["crew"], "NotesCrew")
        self.assertEqual(len(data["result"]["extractedWikilinks"]), 1)
        self.assertIn("ai", data["result"]["extractedTags"])

    def test_crews_notes(self):
        payload = {
            "userId": "usr_test_999",
            "title": "Database Systems",
            "content": "Relational databases enforce ACID guarantees [[PostgreSQL]]. Indexing optimizes lookup performance. #db #postgres"
        }
        response = self.client.post("/api/v1/crews/notes", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["crew"], "NotesCrew")
        self.assertGreaterEqual(len(data["data"]["bulletPoints"]), 1)

if __name__ == '__main__':
    unittest.main()
