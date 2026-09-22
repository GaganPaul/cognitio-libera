"""
SQLAlchemy ORM Entities Definition.

WHAT IT IS:
    This module defines the relational database schema for Cognitio Libera,
    including profiles, problems, test cases, quizzes, submissions, progress, and AI reviews.

WHY WE USE IT:
    SQLAlchemy ORM maps Python classes to database tables in Supabase PostgreSQL
    (and SQLite for local development), ensuring type safety, relational integrity,
    and automatic query generation.

HOW IT CONNECTS:
    Repositories and Services query these models to read and update user data,
    record code execution results, store quiz attempts, and compute mastery.
"""

import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime,
    ForeignKey, Text, JSON, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid_string() -> str:
    """
    Generates a RFC 4122 version 4 UUID string.

    Returns:
        str: 36-character hexadecimal UUID string.
    """
    return str(uuid.uuid4())


class UserProfile(Base):
    """
    Represents an authenticated user profile synchronized from Supabase Auth.
    """
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid_string)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    submissions = relationship("CodingSubmission", back_populates="user", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")
    progress_records = relationship("LearningProgress", back_populates="user", cascade="all, delete-orphan")
    ai_feedbacks = relationship("AiFeedback", back_populates="user", cascade="all, delete-orphan")


class UserPreference(Base):
    """
    User configuration preferences such as dark/light mode and default programming language.
    """
    __tablename__ = "user_preferences"

    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True)
    preferred_language = Column(String(50), default="python", nullable=False)
    preferred_difficulty = Column(String(50), default="Medium", nullable=False)
    theme = Column(String(20), default="light", nullable=False)
    notification_preferences = Column(JSON, default=lambda: {"email": False, "in_app": True})
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("UserProfile", back_populates="preferences")


class Topic(Base):
    """
    Categorization of programming topics (e.g. Arrays, Trees, Dynamic Programming, SQL).
    """
    __tablename__ = "topics"

    id = Column(String(36), primary_key=True, default=generate_uuid_string)
    name = Column(String(100), unique=True, nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    category = Column(String(100), nullable=False)  # 'DSA', 'Core CS', 'Web Development', 'AI/ML'

    # Relationships
    problems = relationship("CodingProblem", back_populates="topic")
    quiz_questions = relationship("QuizQuestion", back_populates="topic")
    progress_records = relationship("LearningProgress", back_populates="topic")


class CodingProblem(Base):
    """
    Algorithmic challenge containing problem statements, constraints, and starter templates.
    """
    __tablename__ = "coding_problems"

    id = Column(String(36), primary_key=True, default=generate_uuid_string)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    difficulty = Column(String(20), nullable=False)  # 'Easy', 'Medium', 'Hard'
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    function_name = Column(String(100), nullable=False)
    starter_code = Column(JSON, nullable=False)  # {"python": "...", "cpp": "...", "java": "...", "javascript": "..."}
    constraints = Column(JSON, default=list)      # ["1 <= n <= 10^5", ...]
    examples = Column(JSON, default=list)         # [{"input": "...", "output": "...", "explanation": "..."}]
    time_limit_ms = Column(Integer, default=2000)
    memory_limit_mb = Column(Integer, default=256)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    topic = relationship("Topic", back_populates="problems")
    test_cases = relationship("CodingTestCase", back_populates="problem", cascade="all, delete-orphan", order_by="CodingTestCase.order_index")
    submissions = relationship("CodingSubmission", back_populates="problem", cascade="all, delete-orphan")


class CodingTestCase(Base):
    """
    Individual test cases for verifying user-submitted code.
    Hidden test cases are NEVER exposed to the frontend browser.
    """
    __tablename__ = "coding_test_cases"

    id = Column(String(36), primary_key=True, default=generate_uuid_string)
    problem_id = Column(String(36), ForeignKey("coding_problems.id", ondelete="CASCADE"), nullable=False, index=True)
    input_data = Column(Text, nullable=False)
    expected_output = Column(Text, nullable=False)
    is_hidden = Column(Boolean, default=False, nullable=False)
    order_index = Column(Integer, default=0)

    problem = relationship("CodingProblem", back_populates="test_cases")


class CodingSubmission(Base):
    """
    Records an official user code submission evaluated against all test cases.
    """
    __tablename__ = "coding_submissions"

    id = Column(String(36), primary_key=True, default=generate_uuid_string)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    problem_id = Column(String(36), ForeignKey("coding_problems.id", ondelete="CASCADE"), nullable=False, index=True)
    language = Column(String(50), nullable=False)
    code = Column(Text, nullable=False)
    status = Column(String(50), nullable=False)  # 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', etc.
    runtime_ms = Column(Integer, nullable=True)
    memory_kb = Column(Integer, nullable=True)
    passed_tests = Column(Integer, default=0)
    total_tests = Column(Integer, default=0)
    error_output = Column(Text, nullable=True)
    execution_details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("UserProfile", back_populates="submissions")
    problem = relationship("CodingProblem", back_populates="submissions")
    ai_feedbacks = relationship("AiFeedback", back_populates="submission")


class QuizQuestion(Base):
    """
    Multiple choice question (MCQ) testing conceptual and technical knowledge.
    """
    __tablename__ = "quiz_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid_string)
    question_text = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    difficulty = Column(String(20), nullable=False)  # 'Easy', 'Medium', 'Hard'
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    category = Column(String(100), nullable=False)   # 'Python', 'DSA', 'OOP', 'SQL', etc.
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    topic = relationship("Topic", back_populates="quiz_questions")
    options = relationship("QuizOption", back_populates="question", cascade="all, delete-orphan", order_by="QuizOption.order_index")
    attempts = relationship("QuizAttempt", back_populates="question", cascade="all, delete-orphan")


class QuizOption(Base):
    """
    Individual answer option for a quiz question.
    Security: The `is_correct` field is stripped when transmitting questions to the client.
    """
    __tablename__ = "quiz_options"

    id = Column(String(36), primary_key=True, default=generate_uuid_string)
    question_id = Column(String(36), ForeignKey("quiz_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    option_text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False, nullable=False)
    order_index = Column(Integer, default=0)

    question = relationship("QuizQuestion", back_populates="options")


class QuizAttempt(Base):
    """
    Records a user's answer to a quiz question with evaluation status.
    """
    __tablename__ = "quiz_attempts"

    id = Column(String(36), primary_key=True, default=generate_uuid_string)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("quiz_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    selected_option_id = Column(String(36), ForeignKey("quiz_options.id", ondelete="CASCADE"), nullable=False)
    is_correct = Column(Boolean, nullable=False)
    time_taken_seconds = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("UserProfile", back_populates="quiz_attempts")
    question = relationship("QuizQuestion", back_populates="attempts")
    selected_option = relationship("QuizOption")


class LearningProgress(Base):
    """
    Aggregates learning mastery score and statistics per user and topic.
    """
    __tablename__ = "learning_progress"
    __table_args__ = (UniqueConstraint("user_id", "topic_id", name="uq_user_topic_progress"),)

    id = Column(String(36), primary_key=True, default=generate_uuid_string)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    problems_attempted = Column(Integer, default=0)
    problems_solved = Column(Integer, default=0)
    quiz_attempted = Column(Integer, default=0)
    quiz_correct = Column(Integer, default=0)
    mastery_score = Column(Float, default=0.0)  # Percentage 0.0 - 100.0
    last_practiced_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("UserProfile", back_populates="progress_records")
    topic = relationship("Topic", back_populates="progress_records")


class AiFeedback(Base):
    """
    Stores conversational interactions, progressive hints, and structured code reviews from Gemini.
    """
    __tablename__ = "ai_feedback"

    id = Column(String(36), primary_key=True, default=generate_uuid_string)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    submission_id = Column(String(36), ForeignKey("coding_submissions.id", ondelete="SET NULL"), nullable=True)
    problem_id = Column(String(36), ForeignKey("coding_problems.id", ondelete="CASCADE"), nullable=True)
    feedback_type = Column(String(50), nullable=False)  # 'hint', 'review', 'chat', 'complexity'
    content = Column(Text, nullable=False)
    structured_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("UserProfile", back_populates="ai_feedbacks")
    submission = relationship("CodingSubmission", back_populates="ai_feedbacks")
    problem = relationship("CodingProblem")


class PracticeSession(Base):
    """
    Represents an ongoing or completed timed session (Contest or Interview Mode).
    """
    __tablename__ = "practice_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid_string)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    mode = Column(String(50), nullable=False)  # 'interview', 'smart_practice', 'timed_contest'
    status = Column(String(50), default="in_progress")
    score = Column(Float, default=0.0)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    ended_at = Column(DateTime, nullable=True)

    user = relationship("UserProfile")


class Bookmark(Base):
    """
    Allows users to save favorite problems and quiz questions for later practice.
    """
    __tablename__ = "bookmarks"
    __table_args__ = (
        UniqueConstraint("user_id", "problem_id", name="uq_user_problem_bookmark"),
        UniqueConstraint("user_id", "quiz_question_id", name="uq_user_quiz_bookmark"),
    )

    id = Column(String(36), primary_key=True, default=generate_uuid_string)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    problem_id = Column(String(36), ForeignKey("coding_problems.id", ondelete="CASCADE"), nullable=True)
    quiz_question_id = Column(String(36), ForeignKey("quiz_questions.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("UserProfile")
    problem = relationship("CodingProblem")
    quiz_question = relationship("QuizQuestion")
