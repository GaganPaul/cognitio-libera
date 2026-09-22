"""
Google Gemini AI Mentor API Endpoints.

WHAT IT IS:
    This router exposes Gemini-powered educational guidance:
    1. Interactive Socratic chat within problem contexts.
    2. Progressive hints (Level 1 conceptual -> Level 2 algorithmic -> Level 3 pseudocode).
    3. Structured post-execution code review with Big-O complexity estimation.

WHY WE USE IT:
    Google Gemini serves as the dedicated AI mentor for Cognitio Libera. It provides
    personalized pedagogical support without giving away complete solutions immediately.

HOW IT CONNECTS:
    Invoked by frontend `mentorService` and the Monaco editor's [Ask AI Mentor] drawer.
"""

from typing import Optional, List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_database_session
from app.core.security import get_current_authenticated_user, get_optional_authenticated_user, AuthenticatedUser
from app.ai.mentor import gemini_mentor_service
from app.schemas.dto import (
    AiMentorChatRequestSchema,
    AiMentorChatResponseSchema,
    AiMentorHintRequestSchema,
    AiMentorHintResponseSchema,
    AiCodeReviewRequestSchema,
    AiCodeReviewResponseSchema
)
from app.repositories.database_repository import get_coding_problem_by_id

router = APIRouter(prefix="/mentor", tags=["AI Mentor (Google Gemini)"])


@router.post("/chat", response_model=AiMentorChatResponseSchema)
async def chat_with_ai_mentor(
    chat_request: AiMentorChatRequestSchema,
    current_user: Optional[AuthenticatedUser] = Depends(get_optional_authenticated_user),
    db: Session = Depends(get_database_session)
):
    """
    Interacts with the Google Gemini AI Mentor in the context of a problem and code.

    Args:
        chat_request: User question, problem ID, current code, and chat history.
        current_user: Optional authenticated user.
        db: Database session.

    Returns:
        AiMentorChatResponseSchema: Mentor answer and suggested followups.
    """
    problem_title = None
    problem_desc = None

    if chat_request.problem_id:
        problem = get_coding_problem_by_id(db, chat_request.problem_id)
        if problem:
            problem_title = problem.title
            problem_desc = problem.description

    reply = await gemini_mentor_service.chat_with_mentor(
        problem_title=problem_title,
        problem_description=problem_desc,
        user_code=chat_request.user_code,
        language=chat_request.language or "python",
        user_message=chat_request.user_message,
        chat_history=chat_request.chat_history
    )
    return reply


@router.post("/hint", response_model=AiMentorHintResponseSchema)
async def get_progressive_hint(
    hint_request: AiMentorHintRequestSchema,
    db: Session = Depends(get_database_session)
):
    """
    Generates a progressive hint at the requested level (1, 2, or 3) without revealing the solution.

    Args:
        hint_request: Problem ID, current code, and hint level.
        db: Database session.

    Returns:
        AiMentorHintResponseSchema: Progressive hint text and next-level indicator.
    """
    problem = get_coding_problem_by_id(db, hint_request.problem_id)
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Problem '{hint_request.problem_id}' not found."
        )

    hint = await gemini_mentor_service.get_progressive_hint(
        problem_title=problem.title,
        problem_description=problem.description,
        user_code=hint_request.user_code,
        language=hint_request.language or "python",
        hint_level=hint_request.hint_level
    )
    return hint


@router.post("/review", response_model=AiCodeReviewResponseSchema)
async def review_submitted_code(
    review_request: AiCodeReviewRequestSchema,
    db: Session = Depends(get_database_session)
):
    """
    Provides automated structured code review analyzing complexity, strengths, and edge cases.

    Args:
        review_request: Problem ID, submitted code, and execution status.
        db: Database session.

    Returns:
        AiCodeReviewResponseSchema: Big-O complexity, strengths, and improvement suggestions.
    """
    problem = get_coding_problem_by_id(db, review_request.problem_id)
    problem_title = problem.title if problem else "Algorithmic Problem"

    review = await gemini_mentor_service.review_code_submission(
        problem_title=problem_title,
        language=review_request.language,
        user_code=review_request.code,
        submission_status=review_request.submission_status
    )
    return review
