import os
import logging
from typing import Optional
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("crewai.llm_factory")

class LlmProviderFactory:
    """Factory for initializing LLMs (Gemini / Groq) for CrewAI agents."""
    
    @staticmethod
    def get_llm(provider: str = "gemini", model_name: Optional[str] = None):
        provider = (provider or "gemini").lower()
        
        if provider == "groq":
            groq_key = os.getenv("GROQ_API_KEY")
            selected_model = model_name or "llama-3.3-70b-versatile"
            if groq_key:
                try:
                    from langchain_groq import ChatGroq
                    logger.info(f"Initializing Groq LLM: {selected_model}")
                    return ChatGroq(temperature=0.3, model_name=selected_model, api_key=groq_key)
                except Exception as e:
                    logger.warning(f"Failed to initialize Groq LLM: {e}. Falling back to mock/synthetic LLM.")
            return ResilientSyntheticLLM(provider="groq", model=selected_model)
            
        # Default: Gemini
        gemini_key = os.getenv("GEMINI_API_KEY")
        selected_model = model_name or "gemini-1.5-pro"
        if gemini_key:
            try:
                from langchain_google_genai import ChatGoogleGenerativeAI
                logger.info(f"Initializing Gemini LLM: {selected_model}")
                return ChatGoogleGenerativeAI(model=selected_model, google_api_key=gemini_key, temperature=0.3)
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini LLM: {e}. Falling back to mock/synthetic LLM.")
                
        return ResilientSyntheticLLM(provider="gemini", model=selected_model)


class ResilientSyntheticLLM:
    """Resilient fallback LLM wrapper for CrewAI offline or dev execution."""
    
    def __init__(self, provider: str, model: str):
        self.provider = provider
        self.model = model
        
    def invoke(self, prompt: str) -> str:
        return f"[CrewAI {self.provider.upper()} ({self.model})] Multi-agent analysis response for prompt: {prompt[:60]}..."
        
    def __call__(self, prompt: str) -> str:
        return self.invoke(prompt)
