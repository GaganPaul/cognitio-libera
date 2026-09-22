"""
V1 API Router Aggregator.

WHAT IT IS:
    This module bundles all v1 API sub-routers (auth, users, problems, execution,
    submissions, quiz, progress, mentor, and admin_ai) into a unified APIRouter.

WHY WE USE IT:
    Maintains a clean RESTful versioning hierarchy (`/api/v1/*`) and isolates
    route mounting logic from the main application initialization.

HOW IT CONNECTS:
    Included in `app.main:app` with prefix `/api/v1`.
"""

from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    problems,
    execution,
    submissions,
    quiz,
    progress,
    mentor,
    admin_ai
)

api_v1_router = APIRouter()

api_v1_router.include_router(auth.router)
api_v1_router.include_router(users.router)
api_v1_router.include_router(problems.router)
api_v1_router.include_router(execution.router)
api_v1_router.include_router(submissions.router)
api_v1_router.include_router(quiz.router)
api_v1_router.include_router(progress.router)
api_v1_router.include_router(mentor.router)
api_v1_router.include_router(admin_ai.router)
