import os
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.core.config import settings
import google.generativeai as genai
from google.api_core.exceptions import GoogleAPIError, RetryError

logger = logging.getLogger(__name__)
router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Message]] = []
    language: Optional[str] = "en"

class ChatResponse(BaseModel):
    reply: str

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

LANGUAGE_INSTRUCTIONS = {
    "ta": (
        "You are the MetronIQ Copilot, an AI assistant for a Legal Metrology compliance suite used in India. "
        "You help officers handle and interpret dashboard data. "
        "CRITICAL: You MUST respond ENTIRELY in Tamil (தமிழ்) language. Do not mix English and Tamil. "
        "Use proper Tamil script throughout. If technical terms (like OCR, MRP, PCR) have no Tamil equivalent, "
        "you may use the abbreviation but explain it in Tamil. "
        "Remember: Do not modify legal compliance decisions, and warn the user that "
        "AI-generated advice is NOT an official legal determination."
    ),
    "hi": (
        "You are the MetronIQ Copilot, an AI assistant for a Legal Metrology compliance suite used in India. "
        "You help officers handle and interpret dashboard data. "
        "CRITICAL: You MUST respond ENTIRELY in Hindi (हिन्दी) language. Do not mix English and Hindi. "
        "Use proper Devanagari script throughout. If technical terms (like OCR, MRP, PCR) have no Hindi equivalent, "
        "you may use the abbreviation but explain it in Hindi. "
        "Remember: Do not modify legal compliance decisions, and warn the user that "
        "AI-generated advice is NOT an official legal determination."
    ),
    "en": (
        "You are the MetronIQ Copilot, an AI assistant for a Legal Metrology compliance suite. "
        "You help officers handle and interpret dashboard data. "
        "Respond in clear, professional English. "
        "Remember: Do not modify legal compliance decisions, and warn the user that "
        "AI-generated advice is NOT an official legal determination."
    ),
}

@router.post("/chat", response_model=ChatResponse)
def copilot_chat(req: ChatRequest, db: Session = Depends(get_db)):
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=503, 
            detail="AI service is not configured. (Missing GEMINI_API_KEY in environment variables)"
        )
    
    try:
        # Normalize language to supported values
        lang = req.language if req.language in ("ta", "hi") else "en"
        system_instruction = LANGUAGE_INSTRUCTIONS[lang]
        
        model = genai.GenerativeModel(
            'gemini-2.5-flash',
            system_instruction=system_instruction
        )
        
        contents = []
        for msg in (req.history or []):
            mapped_role = "model" if msg.role == "assistant" else "user"
            contents.append({"role": mapped_role, "parts": [msg.content]})
            
        contents.append({"role": "user", "parts": [req.message]})
        
        response = model.generate_content(contents)
        
        if not response or not hasattr(response, "text"):
             raise HTTPException(status_code=500, detail="Received an empty response from AI provider.")
             
        return {"reply": response.text}
    except (GoogleAPIError, RetryError) as e:
        logger.error(f"Gemini API Exception: {str(e)}")
        raise HTTPException(status_code=503, detail="AI provider is currently unavailable, ratelimited, or the request timed out.")
    except Exception as e:
        logger.error(f"Unexpected Copilot Error: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your AI request.")
