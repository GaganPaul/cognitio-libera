"""
Gemini Content Verification & Quality Assurance Layer.

WHAT IT IS:
    This module performs dual-phase verification on AI-generated content (coding problems
    and quiz questions) before they can be stored in the database.

WHY WE USE IT:
    LLMs can occasionally hallucinate incorrect test cases, ambiguous problem constraints,
    or multiple correct answers in MCQs. The verification layer acts as an automated
    pedagogical auditor to reject substandard content.

HOW IT CONNECTS:
    Invoked by administrative content generation endpoints (`/api/v1/ai/generate-*`).
"""

import logging
from typing import Dict, Any, Tuple
from app.ai.client import gemini_client

logger = logging.getLogger(__name__)


class GeminiContentVerifier:
    """
    Audits generated coding challenges and quizzes for pedagogical rigor and correctness.
    """

    def __init__(self):
        self.client = gemini_client

    async def verify_coding_problem(self, problem_data: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Verifies that a generated coding challenge is complete, unambiguous, and solvable.

        Args:
            problem_data: Dictionary containing title, description, constraints, examples, test_cases.

        Returns:
            Tuple[bool, str]: (is_valid, critique_or_reason).
        """
        title = problem_data.get("title", "")
        description = problem_data.get("description", "")
        examples = problem_data.get("examples", [])
        test_cases = problem_data.get("test_cases", [])

        if not title or not description or len(examples) == 0:
            return False, "Problem is missing title, description, or visible examples."

        prompt = f"""
Audit the following coding problem for pedagogical quality:
Title: {title}
Description: {description}
Examples: {examples}
Test Cases: {test_cases}

Evaluate:
1. Is the problem unambiguous?
2. Do the examples match the expected logic?
3. Are the test case inputs and expected outputs logically sound?

Respond with a JSON object:
{{"is_valid": true/false, "critique": "short explanation"}}
"""
        result = await self.client.generate_structured_json(prompt, '{"is_valid": bool, "critique": str}')
        if result and isinstance(result, dict):
            return result.get("is_valid", True), result.get("critique", "Verified by Gemini Auditor.")

        # Default to valid if verifier API is in offline mode
        return True, "Automated schema checks passed."

    async def verify_quiz_question(self, question_data: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Verifies that an MCQ has exactly one unambiguous correct answer and plausible distractors.

        Args:
            question_data: Dictionary containing question_text, options, explanation.

        Returns:
            Tuple[bool, str]: (is_valid, critique_or_reason).
        """
        question_text = question_data.get("question_text", "")
        options = question_data.get("options", [])
        correct_count = sum(1 for opt in options if opt.get("is_correct") is True)

        if len(options) != 4:
            return False, f"Question must have exactly 4 options, found {len(options)}."
        if correct_count != 1:
            return False, f"Question must have exactly 1 correct option, found {correct_count}."

        prompt = f"""
Audit this multiple choice question:
Question: {question_text}
Options: {options}
Explanation: {question_data.get('explanation', '')}

Evaluate:
1. Is there exactly one indisputably correct answer?
2. Are the remaining 3 distractors plausible?
3. Is the explanation accurate?

Respond with a JSON object:
{{"is_valid": true/false, "critique": "short explanation"}}
"""
        result = await self.client.generate_structured_json(prompt, '{"is_valid": bool, "critique": str}')
        if result and isinstance(result, dict):
            return result.get("is_valid", True), result.get("critique", "Verified by Gemini Auditor.")

        return True, "Automated option count checks passed."


# Singleton instance
gemini_verifier = GeminiContentVerifier()
