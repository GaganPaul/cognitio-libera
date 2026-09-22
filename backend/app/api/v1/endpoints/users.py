"""
User Profile and Preferences API Endpoints.

WHAT IT IS:
    This router provides read and update operations for the current user's profile and configuration.

WHY WE USE IT:
    Allows students to customize their learning environment (dark/light mode, target difficulty,
    and preferred programming language).

HOW IT CONNECTS:
    Invoked by frontend `profileService` and `SettingsPage.tsx`.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_database_session
from app.core.security import get_current_authenticated_user, AuthenticatedUser
from app.schemas.dto import UserProfileResponseSchema, UserPreferenceUpdateSchema
from app.repositories.database_repository import get_or_create_user_profile, update_user_preferences

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserProfileResponseSchema)
def get_current_user_profile(
    current_user: AuthenticatedUser = Depends(get_current_authenticated_user),
    db: Session = Depends(get_database_session)
):
    """
    Retrieves the authenticated user's profile, streak, and preferences.

    Args:
        current_user: Authenticated user from Bearer JWT.
        db: Database session.

    Returns:
        UserProfileResponseSchema: User profile details.
    """
    user_record = get_or_create_user_profile(
        db=db,
        user_id=current_user.id,
        email=current_user.email,
        username=current_user.username
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


@router.patch("/me/preferences", response_model=UserProfileResponseSchema)
def update_current_user_preferences(
    update_data: UserPreferenceUpdateSchema,
    current_user: AuthenticatedUser = Depends(get_current_authenticated_user),
    db: Session = Depends(get_database_session)
):
    """
    Updates preferences (preferred language, theme, difficulty) for the current user.

    Args:
        update_data: Fields to update.
        current_user: Authenticated user identity.
        db: Database session.

    Returns:
        UserProfileResponseSchema: Updated profile with new settings.
    """
    updated_pref = update_user_preferences(
        db=db,
        user_id=current_user.id,
        preferred_language=update_data.preferred_language,
        preferred_difficulty=update_data.preferred_difficulty,
        theme=update_data.theme,
        notification_preferences=update_data.notification_preferences
    )

    return get_current_user_profile(current_user=current_user, db=db)
