"""
Submissions History API Endpoints.

WHAT IT IS:
    This router allows students to view their past code submission attempts,
    reviewing execution status, recorded runtimes, and memory usage.

WHY WE USE IT:
    Tracking past solutions allows users to review their learning journey, compare
    historical attempts, and verify problem completion.

HOW IT CONNECTS:
    Invoked by frontend `submissionService` and profile history components.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_database_session
from app.core.security import get_current_authenticated_user, AuthenticatedUser
from app.models.entities import CodingSubmission
from app.repositories.database_repository import list_user_submissions

router = APIRouter(prefix="/submissions", tags=["Submissions"])


@router.get("")
def get_user_submission_history(
    problem_id: Optional[str] = Query(None, description="Optional filter by problem UUID"),
    limit: int = Query(20, ge=1, le=100),
    current_user: AuthenticatedUser = Depends(get_current_authenticated_user),
    db: Session = Depends(get_database_session)
):
    """
    Returns historical submissions for the current authenticated user.

    Args:
        problem_id: Optional problem UUID filter.
        limit: Max items.
        current_user: Authenticated user.
        db: Database session.

    Returns:
        List of submission records with problem titles and metrics.
    """
    submissions = list_user_submissions(
        db=db,
        user_id=current_user.id,
        problem_id=problem_id,
        limit=limit
    )

    return [
        {
            "id": s.id,
            "problem_id": s.problem_id,
            "problem_title": s.problem.title if s.problem else "Coding Challenge",
            "language": s.language,
            "status": s.status,
            "runtime_ms": s.runtime_ms,
            "memory_kb": s.memory_kb,
            "passed_tests": s.passed_tests,
            "total_tests": s.total_tests,
            "created_at": s.created_at
        }
        for s in submissions
    ]


@router.get("/{submission_id}")
def get_submission_detail(
    submission_id: str,
    current_user: AuthenticatedUser = Depends(get_current_authenticated_user),
    db: Session = Depends(get_database_session)
):
    """
    Retrieves the code and details of a specific submission.

    Args:
        submission_id: Submission UUID.
        current_user: Authenticated user.
        db: Database session.

    Returns:
        Complete submission entity with code.

    Security:
        Users can only view their own submissions.
    """
    submission = db.query(CodingSubmission).filter(
        CodingSubmission.id == submission_id,
        CodingSubmission.user_id == current_user.id
    ).first()

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found or access denied."
        )

    return {
        "id": submission.id,
        "problem_id": submission.problem_id,
        "problem_title": submission.problem.title if submission.problem else "Coding Challenge",
        "language": submission.language,
        "code": submission.code,
        "status": submission.status,
        "runtime_ms": submission.runtime_ms,
        "memory_kb": submission.memory_kb,
        "passed_tests": submission.passed_tests,
        "total_tests": submission.total_tests,
        "error_output": submission.error_output,
        "created_at": submission.created_at
    }
