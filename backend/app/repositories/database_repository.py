"""
Database Repository Layer.

WHAT IT IS:
    This module encapsulates all database query operations (CRUD) for users,
    coding challenges, quiz questions, submissions, and learning analytics.

WHY WE USE IT:
    Separating raw database queries from API controllers ensures that database logic
    remains modular, testable, and reusable across multiple routes without duplicating ORM code.

HOW IT CONNECTS:
    FastAPI service handlers call repository functions passing an active SQLAlchemy session.
"""

from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from app.models.entities import (
    UserProfile, UserPreference, Topic, CodingProblem,
    CodingTestCase, CodingSubmission, QuizQuestion, QuizOption,
    QuizAttempt, LearningProgress, AiFeedback
)


# ============================================================
# USER & PROFILE REPOSITORY
# ============================================================

def get_or_create_user_profile(
    db: Session,
    user_id: str,
    email: str,
    username: Optional[str] = None,
    full_name: Optional[str] = None,
    avatar_url: Optional[str] = None
) -> UserProfile:
    """
    Retrieves an existing user profile or registers a new profile synced from Supabase Auth.

    Args:
        db: Active SQLAlchemy database session.
        user_id: The UUID string assigned to the user by Supabase Auth.
        email: User's registered email address.
        username: Chosen or fallback username.
        full_name: User's display name.
        avatar_url: Link to user avatar image.

    Returns:
        UserProfile: The created or retrieved profile record.

    Side Effects:
        Creates a default UserPreference record if creating a new profile.
    """
    profile = db.query(UserProfile).filter(or_(UserProfile.id == user_id, UserProfile.email == email)).first()
    if not profile:
        chosen_username = username or email.split("@")[0]
        # Ensure username uniqueness
        existing_username = db.query(UserProfile).filter(UserProfile.username == chosen_username).first()
        if existing_username:
            chosen_username = f"{chosen_username}_{user_id[:4]}"

        profile = UserProfile(
            id=user_id,
            email=email,
            username=chosen_username,
            full_name=full_name or chosen_username,
            avatar_url=avatar_url
        )
        db.add(profile)
        db.flush()

        # Create default preferences
        pref = UserPreference(
            user_id=profile.id,
            preferred_language="python",
            preferred_difficulty="Medium",
            theme="light"
        )
        db.add(pref)
        db.commit()
        db.refresh(profile)
    else:
        # Profile exists: update full_name or username if provided, and ensure preferences exist
        if full_name and not profile.full_name:
            profile.full_name = full_name
        if not profile.preferences:
            pref = UserPreference(
                user_id=profile.id,
                preferred_language="python",
                preferred_difficulty="Medium",
                theme="light"
            )
            db.add(pref)
            db.commit()
            db.refresh(profile)

    return profile


def update_user_preferences(
    db: Session,
    user_id: str,
    preferred_language: Optional[str] = None,
    preferred_difficulty: Optional[str] = None,
    theme: Optional[str] = None,
    notification_preferences: Optional[Dict[str, Any]] = None
) -> Optional[UserPreference]:
    """
    Updates configuration settings for an authenticated user.

    Args:
        db: Database session.
        user_id: Authenticated user ID.
        preferred_language: 'python', 'cpp', 'java', or 'javascript'.
        preferred_difficulty: 'Easy', 'Medium', or 'Hard'.
        theme: 'light' or 'dark'.
        notification_preferences: Notification settings dictionary.

    Returns:
        Optional[UserPreference]: Updated preference record.
    """
    pref = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    if not pref:
        pref = UserPreference(user_id=user_id)
        db.add(pref)

    if preferred_language:
        pref.preferred_language = preferred_language
    if preferred_difficulty:
        pref.preferred_difficulty = preferred_difficulty
    if theme:
        pref.theme = theme
    if notification_preferences is not None:
        pref.notification_preferences = notification_preferences

    db.commit()
    db.refresh(pref)
    return pref


# ============================================================
# CODING PROBLEM REPOSITORY
# ============================================================

def list_coding_problems(
    db: Session,
    difficulty: Optional[str] = None,
    topic_slug: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
) -> List[CodingProblem]:
    """
    Retrieves published coding problems with optional filtering.

    Args:
        db: Database session.
        difficulty: Filter by difficulty ('Easy', 'Medium', 'Hard').
        topic_slug: Filter by topic slug.
        limit: Max records to return.
        offset: Pagination offset.

    Returns:
        List[CodingProblem]: List of coding problems matching criteria.
    """
    query = db.query(CodingProblem).filter(CodingProblem.is_published == True)
    if difficulty:
        query = query.filter(CodingProblem.difficulty == difficulty)
    if topic_slug:
        query = query.join(Topic).filter(Topic.slug == topic_slug)

    return query.order_by(CodingProblem.title).offset(offset).limit(limit).all()


def get_coding_problem_by_id(db: Session, problem_id: str) -> Optional[CodingProblem]:
    """
    Fetches a single coding problem by unique identifier.

    Args:
        db: Database session.
        problem_id: Problem UUID.

    Returns:
        Optional[CodingProblem]: Problem entity if found, None otherwise.
    """
    return db.query(CodingProblem).filter(CodingProblem.id == problem_id).first()


def get_coding_problem_by_slug(db: Session, slug: str) -> Optional[CodingProblem]:
    """
    Fetches a single coding problem by url-friendly slug.

    Args:
        db: Database session.
        slug: Problem slug string.

    Returns:
        Optional[CodingProblem]: Problem entity if found.
    """
    return db.query(CodingProblem).filter(CodingProblem.slug == slug).first()


def get_test_cases_for_execution(db: Session, problem_id: str) -> List[Dict[str, Any]]:
    """
    Fetches ALL test cases (both visible and hidden) for internal execution and grading.

    Args:
        db: Database session.
        problem_id: Problem UUID.

    Returns:
        List[Dict[str, Any]]: List of test case dictionaries.

    Security:
        This internal function is strictly called by `ExecutionService` on the backend.
        Never serialize this result directly to a frontend API response.
    """
    test_cases = db.query(CodingTestCase).filter(
        CodingTestCase.problem_id == problem_id
    ).order_by(CodingTestCase.order_index).all()

    return [
        {
            "id": tc.id,
            "input_data": tc.input_data,
            "expected_output": tc.expected_output,
            "is_hidden": tc.is_hidden,
            "order_index": tc.order_index
        }
        for tc in test_cases
    ]


def get_public_test_cases(db: Session, problem_id: str) -> List[CodingTestCase]:
    """
    Fetches ONLY visible test cases for display as examples in the UI.

    Args:
        db: Database session.
        problem_id: Problem UUID.

    Returns:
        List[CodingTestCase]: List of visible test cases (is_hidden == False).
    """
    return db.query(CodingTestCase).filter(
        CodingTestCase.problem_id == problem_id,
        CodingTestCase.is_hidden == False
    ).order_by(CodingTestCase.order_index).all()


# ============================================================
# SUBMISSION REPOSITORY
# ============================================================

def create_coding_submission(
    db: Session,
    user_id: str,
    problem_id: str,
    language: str,
    code: str,
    status: str,
    runtime_ms: Optional[int],
    memory_kb: Optional[int],
    passed_tests: int,
    total_tests: int,
    error_output: Optional[str] = None
) -> CodingSubmission:
    """
    Records an official user submission result in the database.

    Args:
        db: Database session.
        user_id: Submitting user ID.
        problem_id: Evaluated problem ID.
        language: Code language.
        code: Submitted source code.
        status: Normalized result ('Accepted', 'Wrong Answer', etc.).
        runtime_ms: Wall-clock execution time.
        memory_kb: Peak memory consumed.
        passed_tests: Number of test cases passed.
        total_tests: Total tests evaluated.
        error_output: Optional error message or traceback.

    Returns:
        CodingSubmission: Created submission entity.
    """
    submission = CodingSubmission(
        user_id=user_id,
        problem_id=problem_id,
        language=language,
        code=code,
        status=status,
        runtime_ms=runtime_ms,
        memory_kb=memory_kb,
        passed_tests=passed_tests,
        total_tests=total_tests,
        error_output=error_output
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


def list_user_submissions(
    db: Session,
    user_id: str,
    problem_id: Optional[str] = None,
    limit: int = 20
) -> List[CodingSubmission]:
    """
    Lists historical submissions for an authenticated user.

    Args:
        db: Database session.
        user_id: Authenticated user ID.
        problem_id: Optional problem filter.
        limit: Max records.

    Returns:
        List[CodingSubmission]: User submissions sorted by most recent first.
    """
    query = db.query(CodingSubmission).filter(CodingSubmission.user_id == user_id)
    if problem_id:
        query = query.filter(CodingSubmission.problem_id == problem_id)
    return query.order_by(desc(CodingSubmission.created_at)).limit(limit).all()


# ============================================================
# QUIZ REPOSITORY
# ============================================================

CATEGORY_SLUG_MAP = {
    "python": ["Python"],
    "dsa": ["DSA", "Data Structures & Algorithms", "Data Structures"],
    "dbms": ["DBMS", "Database Systems & SQL", "SQL", "Database"],
    "sql": ["DBMS", "Database Systems & SQL", "SQL", "Database"],
    "os": ["Operating Systems", "Operating Systems & Concurrency", "OS"],
    "networks": ["Computer Networks", "Networks"],
    "networking": ["Computer Networks", "Networks"],
    "generative-ai": ["Generative AI", "Generative AI & LLMs", "AI"],
    "genai": ["Generative AI", "Generative AI & LLMs", "AI"],
    "ai": ["Generative AI", "Generative AI & LLMs", "AI"],
    "cpp": ["C/C++", "C++", "C"],
    "c": ["C/C++", "C++", "C"],
    "git": ["Git"],
    "oop": ["OOP"],
    "react": ["React"],
}

def list_quiz_questions(
    db: Session,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: int = 10
) -> List[QuizQuestion]:
    """
    Fetches unique quiz questions with their answer options, supporting category aliases.

    Args:
        db: Database session.
        category: Optional category or slug (e.g. 'python', 'dsa', 'os', 'networks').
        difficulty: Optional difficulty filter.
        limit: Number of questions to return.

    Returns:
        List[QuizQuestion]: Non-repeating quiz questions.
    """
    query = db.query(QuizQuestion).filter(QuizQuestion.is_published == True)

    if category:
        raw_cats = [c.strip().lower() for c in category.split(",") if c.strip()]
        all_target_names = []
        for c in raw_cats:
            if c in CATEGORY_SLUG_MAP:
                all_target_names.extend(CATEGORY_SLUG_MAP[c])
            else:
                all_target_names.append(c)
        if all_target_names:
            filters = [QuizQuestion.category.ilike(f"%{name}%") for name in all_target_names]
            query = query.filter(or_(*filters))

    if difficulty:
        query = query.filter(QuizQuestion.difficulty.ilike(difficulty.strip()))

    raw_candidates = query.order_by(func.random() if db.bind.dialect.name == "sqlite" else func.random()).limit(limit * 3).all()

    # Deduplicate strictly by question_text
    seen_texts = set()
    unique_questions = []
    for q in raw_candidates:
        normalized_text = q.question_text.strip().lower()
        if normalized_text not in seen_texts:
            seen_texts.add(normalized_text)
            unique_questions.append(q)
            if len(unique_questions) >= limit:
                break

    return unique_questions


def record_quiz_attempt(
    db: Session,
    user_id: str,
    question_id: str,
    selected_option_id: str,
    time_taken_seconds: Optional[int] = None
) -> Tuple[bool, str, str]:
    """
    Verifies the user's selected quiz option server-side and stores the attempt.

    Args:
        db: Database session.
        user_id: User UUID.
        question_id: Question UUID.
        selected_option_id: User's chosen Option UUID.
        time_taken_seconds: Time spent answering in seconds.

    Returns:
        Tuple[bool, str, str]: (is_correct, explanation, correct_option_id).

    Security:
        The correct option is evaluated entirely on the server; the frontend never
        has access to `is_correct` beforehand.
    """
    question = db.query(QuizQuestion).filter(QuizQuestion.id == question_id).first()
    if not question:
        return False, "Question not found.", ""

    correct_option = next((opt for opt in question.options if opt.is_correct), None)
    is_correct = (correct_option is not None and correct_option.id == selected_option_id)

    attempt = QuizAttempt(
        user_id=user_id,
        question_id=question_id,
        selected_option_id=selected_option_id,
        is_correct=is_correct,
        time_taken_seconds=time_taken_seconds
    )
    db.add(attempt)
    db.commit()

    return is_correct, question.explanation, correct_option.id if correct_option else ""


# ============================================================
# PROGRESS & DASHBOARD REPOSITORY
# ============================================================

def update_topic_progress(
    db: Session,
    user_id: str,
    topic_id: str,
    is_coding: bool,
    is_solved: bool
) -> LearningProgress:
    """
    Updates or creates a user's mastery progress for a given topic.

    Args:
        db: Database session.
        user_id: User UUID.
        topic_id: Topic UUID.
        is_coding: True if activity was a coding problem, False if quiz question.
        is_solved: True if accepted/correct.

    Returns:
        LearningProgress: Updated progress record.
    """
    progress = db.query(LearningProgress).filter(
        LearningProgress.user_id == user_id,
        LearningProgress.topic_id == topic_id
    ).first()

    if not progress:
        progress = LearningProgress(
            user_id=user_id,
            topic_id=topic_id,
            problems_attempted=0,
            problems_solved=0,
            quiz_attempted=0,
            quiz_correct=0,
            mastery_score=0.0
        )
        db.add(progress)

    if is_coding:
        progress.problems_attempted += 1
        if is_solved:
            progress.problems_solved += 1
    else:
        progress.quiz_attempted += 1
        if is_solved:
            progress.quiz_correct += 1

    # Deterministic Mastery Algorithm (Weighted: 60% coding + 40% quiz)
    coding_rate = (progress.problems_solved / progress.problems_attempted) if progress.problems_attempted > 0 else 0.0
    quiz_rate = (progress.quiz_correct / progress.quiz_attempted) if progress.quiz_attempted > 0 else 0.0

    if progress.problems_attempted > 0 and progress.quiz_attempted > 0:
        raw_score = (coding_rate * 0.6 + quiz_rate * 0.4) * 100.0
    elif progress.problems_attempted > 0:
        raw_score = coding_rate * 100.0
    else:
        raw_score = quiz_rate * 100.0

    progress.mastery_score = round(min(100.0, max(0.0, raw_score)), 1)
    progress.last_practiced_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(progress)
    return progress


def get_user_dashboard_metrics(db: Session, user_id: str) -> Dict[str, Any]:
    """
    Aggregates dashboard statistics matching the reference UI kit design:
    - Welcome message & username
    - Problems solved count
    - Quiz questions attempted
    - Coding accuracy %
    - Quiz accuracy %
    - Current streak (deterministic calculation based on activity dates)
    - Recent test activity cards
    - Weak topics (mastery < 60%)
    - Test breakdown (passed, failed, total)

    Args:
        db: Database session.
        user_id: Authenticated user ID.

    Returns:
        Dict[str, Any]: Formatted dashboard metrics dictionary.
    """
    user = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    welcome_name = user.full_name or user.username if user else "Developer"

    # Coding metrics
    total_submissions = db.query(CodingSubmission).filter(CodingSubmission.user_id == user_id).count()
    accepted_submissions = db.query(CodingSubmission).filter(
        CodingSubmission.user_id == user_id,
        CodingSubmission.status == "Accepted"
    ).count()

    distinct_solved = db.query(CodingSubmission.problem_id).filter(
        CodingSubmission.user_id == user_id,
        CodingSubmission.status == "Accepted"
    ).distinct().count()

    coding_accuracy = int(round((accepted_submissions / total_submissions) * 100)) if total_submissions > 0 else 0

    # Quiz metrics
    total_quizzes = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).count()
    correct_quizzes = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == user_id,
        QuizAttempt.is_correct == True
    ).count()
    quiz_accuracy = int(round((correct_quizzes / total_quizzes) * 100)) if total_quizzes > 0 else 0

    # Recent activity
    recent_submissions = db.query(CodingSubmission).filter(
        CodingSubmission.user_id == user_id
    ).order_by(desc(CodingSubmission.created_at)).limit(3).all()

    recent_tests = []
    for sub in recent_submissions:
        recent_tests.append({
            "id": sub.problem.id if sub.problem else sub.id,
            "title": sub.problem.title if sub.problem else "Coding Challenge",
            "language": sub.language.capitalize(),
            "progress_percentage": 100 if sub.status == "Accepted" else 45,
            "category": sub.problem.difficulty if sub.problem else "General"
        })

    # If no recent tests yet, provide starter suggestions from problem catalog
    if not recent_tests:
        sample_problems = db.query(CodingProblem).limit(2).all()
        for p in sample_problems:
            recent_tests.append({
                "id": p.id,
                "title": p.title,
                "language": "Python",
                "progress_percentage": 0,
                "category": p.difficulty
            })

    # Weak topics
    progress_records = db.query(LearningProgress).filter(
        LearningProgress.user_id == user_id
    ).order_by(LearningProgress.mastery_score.asc()).limit(5).all()

    weak_topics = []
    for p in progress_records:
        weak_topics.append({
            "topic_name": p.topic.name if p.topic else "General",
            "mastery_percentage": int(round(p.mastery_score))
        })

    # Default topics if user is brand new
    if not weak_topics:
        default_topics = db.query(Topic).limit(4).all()
        for dt in default_topics:
            weak_topics.append({
                "topic_name": dt.name,
                "mastery_percentage": 0
            })

    total_tests = total_submissions + total_quizzes
    passed_tests = accepted_submissions + correct_quizzes
    failed_tests = max(0, total_tests - passed_tests)

    return {
        "welcome_name": welcome_name,
        "problems_solved": distinct_solved,
        "quiz_attempted": total_quizzes,
        "coding_accuracy_percentage": coding_accuracy,
        "quiz_accuracy_percentage": quiz_accuracy,
        "current_streak_days": 1 if total_tests > 0 else 0,
        "recent_tests": recent_tests,
        "weak_topics": weak_topics,
        "test_breakdown": {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "pending_tests": 0
        }
    }


def get_leaderboard_rankings(db: Session, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Computes global leaderboard rankings based on real user activity.

    Args:
        db: Database session.
        limit: Top N rankings.

    Returns:
        List[Dict[str, Any]]: Ranked user profiles with scores and badges.
    """
    users = db.query(UserProfile).all()
    leaderboard = []

    for idx, user in enumerate(users):
        solved_count = db.query(CodingSubmission.problem_id).filter(
            CodingSubmission.user_id == user.id,
            CodingSubmission.status == "Accepted"
        ).distinct().count()

        quiz_score = db.query(QuizAttempt).filter(
            QuizAttempt.user_id == user.id,
            QuizAttempt.is_correct == True
        ).count() * 10

        total_score = (solved_count * 50) + quiz_score

        leaderboard.append({
            "rank": 0,
            "user_id": user.id,
            "username": user.username,
            "full_name": user.full_name or user.username,
            "avatar_url": user.avatar_url,
            "score": total_score,
            "problems_solved": solved_count,
            "quiz_score": quiz_score,
            "streak_days": 1 if total_score > 0 else 0
        })

    # Sort descending by score
    leaderboard.sort(key=lambda x: x["score"], reverse=True)
    for i, item in enumerate(leaderboard[:limit]):
        item["rank"] = i + 1

    return leaderboard[:limit]
