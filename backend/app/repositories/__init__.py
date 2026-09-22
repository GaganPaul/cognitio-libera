"""
Repositories module initialization.
"""

from app.repositories.database_repository import (
    get_or_create_user_profile,
    update_user_preferences,
    list_coding_problems,
    get_coding_problem_by_id,
    get_coding_problem_by_slug,
    get_test_cases_for_execution,
    get_public_test_cases,
    create_coding_submission,
    list_user_submissions,
    list_quiz_questions,
    record_quiz_attempt,
    update_topic_progress,
    get_user_dashboard_metrics,
    get_leaderboard_rankings,
)

__all__ = [
    "get_or_create_user_profile",
    "update_user_preferences",
    "list_coding_problems",
    "get_coding_problem_by_id",
    "get_coding_problem_by_slug",
    "get_test_cases_for_execution",
    "get_public_test_cases",
    "create_coding_submission",
    "list_user_submissions",
    "list_quiz_questions",
    "record_quiz_attempt",
    "update_topic_progress",
    "get_user_dashboard_metrics",
    "get_leaderboard_rankings",
]
