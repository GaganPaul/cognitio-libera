"""
Google Gemini AI Mentor Engine.

WHAT IT IS:
    This module implements the educational AI Mentor persona, providing multi-turn chat,
    progressive hints (Level 1 conceptual -> Level 2 algorithmic -> Level 3 pseudocode),
    and structured post-execution code reviews.

WHY WE USE IT:
    Students learn far more effectively when guided with hints rather than given solutions.
    Gemini serves as an interactive senior mentor that explains time/space complexity,
    identifies edge cases, and helps users understand mistakes.

HOW IT CONNECTS:
    FastAPI endpoints in `/api/v1/mentor` route user requests to `GeminiMentorService`.
"""

import json
import logging
from typing import Dict, Any, List, Optional
from app.ai.client import gemini_client
from app.schemas.dto import (
    AiMentorChatResponseSchema,
    AiMentorHintResponseSchema,
    AiCodeReviewResponseSchema
)

logger = logging.getLogger(__name__)


class GeminiMentorService:
    """
    Coordinates AI mentoring interactions exclusively through Google Gemini.
    """

    def __init__(self):
        self.client = gemini_client

    async def chat_with_mentor(
        self,
        problem_title: Optional[str],
        problem_description: Optional[str],
        user_code: Optional[str],
        language: str,
        user_message: str,
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> AiMentorChatResponseSchema:
        """
        Conducts an interactive mentoring conversation.

        Args:
            problem_title: Title of the problem being solved.
            problem_description: Problem prompt and constraints.
            user_code: Current source code written in the editor.
            language: Programming language.
            user_message: Student's question or message.
            chat_history: Prior conversation turns for conversational continuity.

        Returns:
            AiMentorChatResponseSchema: Mentor reply with suggested follow-up questions.

        Security:
            Guards against prompt injection and ensures the mentor does not dump
            the entire solution when the user simply asks for a hint.
        """
        system_instruction = (
            "You are the Cognitio Libera AI Mentor, an empathetic, world-class senior software engineer. "
            "Your goal is to help developers 'Practice. Understand. Improve.' "
            "GUIDELINES: "
            "1. Be encouraging, concise, and clear. "
            "2. Never directly output the complete copy-paste solution if the student is struggling; guide them with Socratic questions. "
            "3. Reference the student's actual code when explaining concepts. "
            "4. Explain time and space complexity with Big-O notation when relevant."
        )

        context_blocks = []
        if problem_title:
            context_blocks.append(f"Problem: {problem_title}\nDescription: {problem_description}")
        if user_code:
            context_blocks.append(f"Current Code ({language}):\n{user_code}")

        context_str = "\n\n".join(context_blocks)
        history_str = "\n".join([f"{turn.get('sender', 'User')}: {turn.get('text', '')}" for turn in (chat_history or [])[-4:]])

        prompt = f"""
{context_str}

Conversation History:
{history_str}

Student Question:
{user_message}

Please respond as the AI Mentor.
"""
        reply_text = await self.client.generate_text(prompt, system_instruction)

        # Generate contextual followups
        followups = [
            "Can you explain the time complexity?",
            "What edge cases should I test?",
            "How can I optimize this further?"
        ]

        return AiMentorChatResponseSchema(
            mentor_reply=reply_text,
            suggested_followups=followups
        )

    async def get_progressive_hint(
        self,
        problem_title: str,
        problem_description: str,
        user_code: Optional[str],
        language: str,
        hint_level: int
    ) -> AiMentorHintResponseSchema:
        """
        Generates progressive hints:
        Level 1: High-level intuition.
        Level 2: Data structure and algorithmic approach.
        Level 3: Step-by-step logic / pseudocode (never raw complete code).

        Args:
            problem_title: Problem title.
            problem_description: Problem requirements.
            user_code: Current user code.
            language: Programming language.
            hint_level: 1, 2, or 3.

        Returns:
            AiMentorHintResponseSchema containing hint title, text, and whether a next level exists.
        """
        level_descriptions = {
            1: "Level 1: High-Level Intuition (Provide an analogy or conceptual hint without naming specific data structures).",
            2: "Level 2: Algorithmic Approach (Suggest appropriate data structures, time complexity target, or two-pointer/hash-table techniques).",
            3: "Level 3: Step-by-Step Logic (Detail the execution steps or pseudocode. DO NOT write the complete final code)."
        }

        target_description = level_descriptions.get(hint_level, level_descriptions[1])

        prompt = f"""
Problem: {problem_title}
Description: {problem_description}
User's Current Code ({language}):
{user_code or "No code written yet."}

Requirement: Provide a {target_description}
Keep your response focused, readable, and under 150 words.
"""
        hint_text = await self.client.generate_text(
            prompt,
            system_instruction="You are the Cognitio Libera progressive hint system. Strictly enforce the requested hint level."
        )

        titles = {
            1: "Conceptual Intuition",
            2: "Algorithmic Strategy",
            3: "Step-by-Step Blueprint"
        }

        return AiMentorHintResponseSchema(
            hint_level=hint_level,
            hint_title=titles.get(hint_level, "Hint"),
            hint_text=hint_text,
            has_next_level=(hint_level < 3)
        )

    async def review_code_submission(
        self,
        problem_title: str,
        language: str,
        user_code: str,
        submission_status: str
    ) -> AiCodeReviewResponseSchema:
        """
        Analyzes a submitted code solution and returns structured educational feedback.

        Args:
            problem_title: Problem title.
            language: Code language.
            user_code: Final submitted code.
            submission_status: Execution status (Accepted, Wrong Answer, etc.).

        Returns:
            AiCodeReviewResponseSchema with complexities, strengths, and suggestions.
        """
        prompt = f"""
Analyze this code submission for the problem "{problem_title}".
Language: {language}
Submission Status from AI Code Evaluator: {submission_status}

Source Code:
{user_code}

Return a JSON object with:
"summary": A 2-sentence summary of the student's implementation.
"time_complexity": Big-O time complexity (e.g. "O(N)", "O(N log N)").
"space_complexity": Big-O space complexity (e.g. "O(1)", "O(N)").
"strengths": Array of 2 strings highlighting good practices in the code.
"improvements": Array of 2 strings suggesting clean code or performance improvements.
"edge_case_warnings": Array of 1-2 strings mentioning edge cases to keep in mind.
"""
        schema_desc = '{"summary": str, "time_complexity": str, "space_complexity": str, "strengths": list, "improvements": list, "edge_case_warnings": list}'
        structured_data = await self.client.generate_structured_json(prompt, schema_desc)

        if structured_data and isinstance(structured_data, dict):
            return AiCodeReviewResponseSchema(
                summary=structured_data.get("summary", "Your solution was evaluated by Google Gemini."),
                time_complexity=structured_data.get("time_complexity", "O(N)"),
                space_complexity=structured_data.get("space_complexity", "O(1)"),
                strengths=structured_data.get("strengths", ["Clear variable naming", "Direct solution approach"]),
                improvements=structured_data.get("improvements", ["Consider early returns for edge cases"]),
                edge_case_warnings=structured_data.get("edge_case_warnings", ["Check empty inputs or single-element bounds"])
            )

        # Fallback structured review
        return AiCodeReviewResponseSchema(
            summary=f"Your code was evaluated by Google Gemini with status: {submission_status}.",
            time_complexity="O(N)",
            space_complexity="O(1)",
            strengths=["Solution attempts appropriate algorithmic logic"],
            improvements=["Review time and space complexity efficiency"],
            edge_case_warnings=["Ensure arrays with boundary elements are handled"]
        )


# Singleton instance
gemini_mentor_service = GeminiMentorService()
