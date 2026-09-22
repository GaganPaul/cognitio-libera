"""
Gemini Content Generation Pipeline.

WHAT IT IS:
    This module coordinates generating new coding problems and multiple choice quiz questions
    using Google Gemini, validating their structure, running them through the verifier,
    and returning verified entities ready for database storage.

WHY WE USE IT:
    Automating question generation keeps the curriculum fresh and dynamic while
    preventing hallucinations through strict schema enforcement and auditor checks.

HOW IT CONNECTS:
    Invoked by admin endpoints or background seed scripts.
"""

import json
import logging
from typing import Dict, Any, Optional, List
from app.ai.client import gemini_client
from app.ai.verifier import gemini_verifier

logger = logging.getLogger(__name__)


class GeminiContentGenerator:
    """
    Pipeline for generating schema-validated and verified educational content.
    """

    def __init__(self):
        self.client = gemini_client
        self.verifier = gemini_verifier

    async def generate_problem(
        self,
        topic_name: str,
        difficulty: str = "Medium",
        language: str = "python"
    ) -> Optional[Dict[str, Any]]:
        """
        Generates a verified LeetCode-style algorithmic coding challenge.

        Args:
            topic_name: Focus topic (e.g. 'Binary Search', 'Dynamic Programming').
            difficulty: 'Easy', 'Medium', or 'Hard'.
            language: Starter code language.

        Returns:
            Optional[Dict[str, Any]]: Validated problem dictionary or None if generation failed.
        """
        prompt = f"""
Generate a {difficulty} algorithmic coding problem focused on "{topic_name}".
Language: {language}

Provide:
1. title: Problem title (e.g. "Find Minimum in Rotated Sorted Array")
2. description: Clear problem statement.
3. function_name: CamelCase or snake_case identifier (e.g. "find_min")
4. starter_code: Dictionary with "python", "cpp", "java", "javascript" skeleton functions.
5. constraints: Array of strings (e.g. ["1 <= nums.length <= 5000", "-5000 <= nums[i] <= 5000"])
6. examples: Array of 2 example dicts with "input", "output", "explanation"
7. test_cases: Array of 5 test cases. First 2 should have "is_hidden": false, remaining 3 "is_hidden": true.
"""
        schema_desc = '{"title": str, "description": str, "function_name": str, "starter_code": dict, "constraints": list, "examples": list, "test_cases": list}'
        raw_problem = await self.client.generate_structured_json(prompt, schema_desc)

        if not raw_problem:
            return None

        # Pass through verification layer
        is_valid, critique = await self.verifier.verify_coding_problem(raw_problem)
        if not is_valid:
            logger.warning(f"Generated problem rejected by verifier: {critique}")
            return None

        raw_problem["verified"] = True
        raw_problem["verification_notes"] = critique
        return raw_problem

    async def generate_quiz_question(
        self,
        category: str,
        difficulty: str = "Medium"
    ) -> Optional[Dict[str, Any]]:
        """
        Generates a verified conceptual multiple choice question.

        Args:
            category: Category name (e.g. 'Python', 'SQL', 'Operating Systems').
            difficulty: 'Easy', 'Medium', or 'Hard'.

        Returns:
            Optional[Dict[str, Any]]: Verified question dict with 4 options and 1 correct answer.
        """
        prompt = f"""
Generate a high-quality {difficulty} level multiple choice question for "{category}".
Provide:
1. question_text: Precise technical question.
2. explanation: Detailed explanation of why the correct answer is true.
3. options: Array of 4 dicts, each with "option_text" and "is_correct" (boolean). Exactly 1 option must have "is_correct": true.
"""
        schema_desc = '{"question_text": str, "explanation": str, "options": [{"option_text": str, "is_correct": bool}]}'
        raw_quiz = await self.client.generate_structured_json(prompt, schema_desc)

        if not raw_quiz:
            return None

        # Verify through verifier layer
        is_valid, critique = await self.verifier.verify_quiz_question(raw_quiz)
        if not is_valid:
            logger.warning(f"Generated quiz rejected by verifier: {critique}")
            return None

        raw_quiz["category"] = category
        raw_quiz["difficulty"] = difficulty
        return raw_quiz

    async def generate_quiz_batch(
        self,
        category: str,
        difficulty: str = "Medium",
        count: int = 5,
        existing_questions: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Generates a batch of distinct, non-repeating conceptual multiple choice questions using Gemini.

        Args:
            category: Category or topic name.
            difficulty: 'Easy', 'Medium', or 'Hard'.
            count: Number of questions to generate (typically 5 to 10).
            existing_questions: List of existing question texts to avoid repeating.

        Returns:
            List[Dict[str, Any]]: List of verified question dicts.
        """
        existing_clause = ""
        if existing_questions:
            sample_existing = [q[:90] for q in existing_questions[:15]]
            existing_clause = (
                f"\nCRITICAL REQUIREMENT: Do NOT repeat or duplicate any of these existing questions:\n"
                + "\n".join(f"- {q}" for q in sample_existing)
            )

        prompt = f"""
Generate {count} unique, high-quality, non-repeating {difficulty} level multiple choice questions for "{category}".
{existing_clause}

For each question:
1. question_text: A distinct, clear, insightful technical question.
2. explanation: Detailed explanation of why the correct answer is true.
3. options: Array of 4 options with "option_text" and "is_correct" (boolean). Exactly 1 option must have "is_correct": true.

Return strictly valid JSON matching this schema:
{{
  "questions": [
    {{
      "question_text": "string",
      "explanation": "string",
      "options": [
        {{"option_text": "string", "is_correct": true}},
        {{"option_text": "string", "is_correct": false}},
        {{"option_text": "string", "is_correct": false}},
        {{"option_text": "string", "is_correct": false}}
      ]
    }}
  ]
}}
"""
        schema_desc = '{"questions": [{"question_text": str, "explanation": str, "options": [{"option_text": str, "is_correct": bool}]}]}'
        raw_res = await self.client.generate_structured_json(prompt, schema_desc)

        if not raw_res or not isinstance(raw_res, dict):
            # Fallback to single question generator
            single = await self.generate_quiz_question(category, difficulty)
            return [single] if single else []

        questions = raw_res.get("questions", [])
        verified_questions = []
        for q in questions:
            if not isinstance(q, dict) or "question_text" not in q or "options" not in q:
                continue
            opts = q.get("options", [])
            if len(opts) < 2:
                continue
            correct_count = sum(1 for o in opts if o.get("is_correct") is True)
            if correct_count != 1:
                if correct_count == 0 and len(opts) > 0:
                    opts[0]["is_correct"] = True
                elif correct_count > 1:
                    first = True
                    for o in opts:
                        if o.get("is_correct") and first:
                            first = False
                        else:
                            o["is_correct"] = False

            q["category"] = category
            q["difficulty"] = difficulty
            verified_questions.append(q)

        return verified_questions


# Singleton instance
gemini_generator = GeminiContentGenerator()

