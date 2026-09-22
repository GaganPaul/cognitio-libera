"""
Google Gemini AI Client Provider.

WHAT IT IS:
    This module encapsulates the Google Generative AI (Gemini) SDK client,
    configuring the API key, model version, and safety settings.

WHY WE USE IT:
    Google Gemini is the sole designated AI provider for Cognitio Libera.
    Centralizing the client prevents API key leakage and provides a unified interface
    for text generation, structured JSON extraction, and educational mentoring.

HOW IT CONNECTS:
    `GeminiProblemGenerator`, `GeminiContentVerifier`, and `GeminiMentorService`
    use this client to interact with Google Gemini models.
"""

import os
import json
import logging
from typing import Optional, Dict, Any
from google import genai
from google.genai import types
from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiClient:
    """
    Singleton client managing interactions with Google Gemini models using the modern google.genai SDK.
    """

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        """
        Configures the Gemini SDK.

        Args:
            api_key: Gemini API key (defaults to settings.GEMINI_API_KEY).
            model_name: Target model identifier (defaults to settings.GEMINI_MODEL_NAME).
        """
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL_NAME
        self.is_configured = False
        self.client: Optional[genai.Client] = None

        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
                self.is_configured = True
            except Exception as exc:
                logger.warning(f"Failed to configure Google GenAI client: {str(exc)}")
                self.is_configured = False
        else:
            logger.info("GEMINI_API_KEY not configured. Gemini services will use educational rule-based fallbacks.")

    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """
        Generates text using Google Gemini with error handling and fallback.

        Args:
            prompt: User prompt content.
            system_instruction: Optional high-priority system persona guidance.

        Returns:
            str: Generated text response.

        Security:
            API keys are never logged or echoed in responses.
        """
        if not self.is_configured or not self.client:
            return (
                "AI Mentor (Offline Mode): I am here to help you practice! "
                "To enable live Gemini AI guidance, please configure your GEMINI_API_KEY in the environment."
            )

        try:
            config = None
            if system_instruction:
                config = types.GenerateContentConfig(system_instruction=system_instruction)

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config
            )
            return response.text.strip() if response and response.text else "No response generated."
        except Exception as exc:
            logger.error(f"Error calling Gemini API: {str(exc)}")
            return "The AI Mentor is currently experiencing high load. Please try your request again in a moment."

    async def generate_structured_json(self, prompt: str, schema_description: str) -> Optional[Dict[str, Any]]:
        """
        Requests Gemini to return strictly valid JSON adhering to a specified schema.

        Args:
            prompt: Base instruction or question generation prompt.
            schema_description: Textual description of expected JSON keys.

        Returns:
            Optional[Dict[str, Any]]: Parsed Python dictionary or None if parsing fails.
        """
        if not self.is_configured or not self.client:
            return None

        enforced_prompt = (
            f"{prompt}\n\n"
            f"CRITICAL REQUIREMENT: Output strictly valid JSON conforming to this structure: {schema_description}. "
            f"Do not include markdown code block syntax (like ```json), commentary, or extra text."
        )

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=enforced_prompt
            )
            raw_text = response.text.strip() if response and response.text else ""

            # Remove markdown backticks if present
            if raw_text.startswith("```json"):
                raw_text = raw_text.replace("```json", "", 1)
            if raw_text.startswith("```"):
                raw_text = raw_text.replace("```", "", 1)
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]

            raw_text = raw_text.strip()

            # Robust JSON boundary extraction
            start_idx = raw_text.find("{")
            end_idx = raw_text.rfind("}")
            if start_idx != -1 and end_idx != -1:
                raw_text = raw_text[start_idx:end_idx + 1]

            return json.loads(raw_text, strict=False)
        except Exception as exc:
            logger.error(f"Error parsing Gemini JSON response: {str(exc)}")
            return None


# Singleton instance
gemini_client = GeminiClient()
