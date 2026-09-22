"""
Authentication and Profile Synchronization API Endpoints.

WHAT IT IS:
    This router handles identity synchronization between Supabase Auth and the application database.

WHY WE USE IT:
    Supabase Auth manages user credentials, OAuth providers, and JWT tokens. When a user
    signs up or logs in on the frontend, this endpoint ensures their record exists in the
    `profiles` table with default preferences initialized.

HOW IT CONNECTS:
    Invoked by the frontend `authService.syncUserWithBackend()` upon successful Supabase session creation.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_database_session
from app.core.security import get_current_authenticated_user, AuthenticatedUser
from app.schemas.dto import UserProfileSyncSchema, UserProfileResponseSchema
from app.repositories.database_repository import get_or_create_user_profile

router = APIRouter(prefix="/auth", tags=["Authentication & Profile"])


@router.post("/sync", response_model=UserProfileResponseSchema)
def sync_authenticated_user_profile(
    profile_data: UserProfileSyncSchema,
    current_user: AuthenticatedUser = Depends(get_current_authenticated_user),
    db: Session = Depends(get_database_session)
):
    """
    Synchronizes the authenticated Supabase user profile into the PostgreSQL database.

    Args:
        profile_data: User details from Supabase Auth payload.
        current_user: Verified user identity from Bearer JWT.
        db: Database session.

    Returns:
        UserProfileResponseSchema: Synchronized profile record with preferences.
    """
    user_record = get_or_create_user_profile(
        db=db,
        user_id=current_user.id,
        email=current_user.email,
        username=profile_data.username or current_user.username,
        full_name=profile_data.full_name,
        avatar_url=profile_data.avatar_url
    )

    preferred_lang = user_record.preferences.preferred_language if user_record.preferences else "python"
    preferred_diff = user_record.preferences.preferred_difficulty if user_record.preferences else "Medium"
    theme_pref = user_record.preferences.theme if user_record.preferences else "light"

    return UserProfileResponseSchema(
        id=user_record.id,
        email=user_record.email,
        username=user_record.username,
        full_name=user_record.full_name,
        avatar_url=user_record.avatar_url,
        preferred_language=preferred_lang,
        preferred_difficulty=preferred_diff,
        theme=theme_pref,
        created_at=user_record.created_at
    )
