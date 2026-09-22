"""
Learning Progress, Analytics, and Leaderboard Endpoints.

WHAT IT IS:
    This router aggregates student performance data to power the Dashboard metrics cards,
    topic mastery radar charts, and global leaderboard rankings.

WHY WE USE IT:
    Real-time progress visualization provides positive feedback loops, highlights
    weak knowledge areas, and motivates consistent practice.

HOW IT CONNECTS:
    Invoked by frontend `DashboardPage.tsx`, `ProgressPage.tsx`, and `LeaderboardPage.tsx`.
"""

from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_database_session
from app.core.security import get_current_authenticated_user, get_optional_authenticated_user, AuthenticatedUser
from app.models.entities import LearningProgress
from app.schemas.dto import (
    DashboardStatsSchema,
    LeaderboardUserSchema,
    WeakTopicSchema
)
from app.repositories.database_repository import (
    get_user_dashboard_metrics,
    get_leaderboard_rankings
)

router = APIRouter(prefix="/progress", tags=["Progress & Analytics"])


@router.get("/dashboard/stats", response_model=DashboardStatsSchema)
def get_user_dashboard_statistics(
    current_user: AuthenticatedUser = Depends(get_current_authenticated_user),
    db: Session = Depends(get_database_session)
):
    """
    Returns aggregated metrics for the authenticated user's dashboard view:
    - Welcome banner greeting
    - Solved count and accuracy rates
    - Daily streak
    - Recent tests carousel
    - Weak topics list
    - Test outcome breakdown (Passed vs Failed)

    Args:
        current_user: Authenticated user.
        db: Database session.

    Returns:
        DashboardStatsSchema: Complete dashboard metrics matching reference UI.
    """
    stats = get_user_dashboard_metrics(db=db, user_id=current_user.id)
    return stats


@router.get("/leaderboard", response_model=List[LeaderboardUserSchema])
def get_global_leaderboard(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_database_session)
):
    """
    Returns global leaderboard rankings based on real user scores.

    Args:
        limit: Top N rankings.
        db: Database session.

    Returns:
        List[LeaderboardUserSchema]: Ranked users with laurels and scores.
    """
    rankings = get_leaderboard_rankings(db=db, limit=limit)
    return rankings


@router.get("/mastery")
def get_topic_mastery_breakdown(
    current_user: AuthenticatedUser = Depends(get_current_authenticated_user),
    db: Session = Depends(get_database_session)
):
    """
    Returns topic-by-topic mastery percentages for detailed progress tracking.

    Args:
        current_user: Authenticated user.
        db: Database session.

    Returns:
        List of topic mastery items.
    """
    records = db.query(LearningProgress).filter(
        LearningProgress.user_id == current_user.id
    ).all()

    return [
        {
            "topic_id": r.topic_id,
            "topic_name": r.topic.name if r.topic else "General",
            "category": r.topic.category if r.topic else "DSA",
            "problems_attempted": r.problems_attempted,
            "problems_solved": r.problems_solved,
            "quiz_attempted": r.quiz_attempted,
            "quiz_correct": r.quiz_correct,
            "mastery_score": r.mastery_score,
            "last_practiced_at": r.last_practiced_at
        }
        for r in records
    ]
