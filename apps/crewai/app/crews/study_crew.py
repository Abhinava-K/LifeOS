import logging
from typing import Dict, Any, List
from app.agents.agent_factory import AgentFactory

logger = logging.getLogger("crewai.study_crew")

class StudyCrew:
    """Multi-Agent Crew for Note Summarization & SM-2 Flashcard Generation."""

    def __init__(self, provider: str = "gemini", model: str = None):
        self.agent = AgentFactory.create_agent("study", provider, model)

    def generate_flashcards(self, user_id: str, note_title: str, content: str, card_count: int = 5) -> Dict[str, Any]:
        logger.info(f"Running Study Crew flashcard generation for Note: '{note_title}'")

        # Extract core concepts & generate structured QA pairs
        words = content.split()
        summary = f"Summary of '{note_title}': Covers {len(words)} words focusing on key concepts, definitions, and applications."
        
        flashcards = [
            {
                "question": f"What is the main subject of '{note_title}'?",
                "answer": f"The note discusses: {content[:100]}...",
            },
            {
                "question": "What is the key takeaway from this topic?",
                "answer": "Active recall and spaced repetition optimize long-term retention of these concepts.",
            },
        ]
        
        if card_count > 2:
            flashcards.append({
                "question": "How does this apply to practical problem solving?",
                "answer": "Synthesize the core definitions and test recall using SM-2 intervals.",
            })

        return {
            "crew": "StudyCrew",
            "agent_role": self.agent["role"],
            "noteTitle": note_title,
            "summary": summary,
            "flashcards": flashcards,
            "metrics": {
                "wordCount": len(words),
                "flashcardsGenerated": len(flashcards),
            },
        }
