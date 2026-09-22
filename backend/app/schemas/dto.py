"""
Data Transfer Objects (DTOs) and Pydantic Schemas.

WHAT IT IS:
    This module defines the validation models for all incoming API requests and outgoing
    responses across authentication, coding problems, code execution, quizzes, progress, and AI.

WHY WE USE IT:
    Pydantic v2 guarantees strict type safety, automatic JSON serialization, and sanitization.
    Crucially, these schemas enforce security boundaries (e.g. stripping hidden test cases
    and quiz answers before data reaches the client).

HOW IT CONNECTS:
    FastAPI router endpoints use these schemas to parse request bodies, validate query
    parameters, and generate interactive OpenAPI documentation.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, ConfigDict


# ============================================================
# USER & PROFILE SCHEMAS
# ============================================================

class UserProfileSyncSchema(BaseModel):
    """
    Schema for syncing a newly registered or authenticated Supabase user profile.
    """
    email: EmailStr
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None


class UserPreferenceUpdateSchema(BaseModel):
    """
    Schema for updating user preferences.
    """
    preferred_language: Optional[str] = Field(None, description="Preferred language (python, cpp, java, javascript)")
    preferred_difficulty: Optional[str] = Field(None, description="Preferred problem difficulty (Easy, Medium, Hard)")
    theme: Optional[str] = Field(None, description="UI theme preference: 'light' or 'dark'")
    notification_preferences: Optional[Dict[str, Any]] = None


class UserProfileResponseSchema(BaseModel):
    """
    Complete user profile returned to the authenticated client.
    """
    id: str
    email: str
    username: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    preferred_language: str = "python"
    preferred_difficulty: str = "Medium"
    theme: str = "light"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# TOPIC SCHEMAS
# ============================================================

class TopicSchema(BaseModel):
    """
    Topic schema for curriculum categorization.
    """
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    category: str

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# CODING PROBLEM & TEST CASE SCHEMAS
# ============================================================

class CodingTestCasePublicSchema(BaseModel):
    """
    Public test case schema. Only visible examples are serialized to the frontend.
    """
    id: str
    input_data: str
    expected_output: str
    order_index: int

    model_config = ConfigDict(from_attributes=True)


class CodingProblemListSchema(BaseModel):
    """
    Summary view of a problem for the practice catalog list.
    """
    id: str
    title: str
    slug: str
    difficulty: str
    topic_name: Optional[str] = None
    category: Optional[str] = None
    is_solved: bool = False

    model_config = ConfigDict(from_attributes=True)


class CodingProblemDetailSchema(BaseModel):
    """
    Detailed problem definition sent to the Monaco code workspace.
    SECURITY NOTE: Hidden test cases are completely excluded from this schema.
    """
    id: str
    title: str
    slug: str
    description: str
    difficulty: str
    topic_id: Optional[str] = None
    topic_name: Optional[str] = None
    function_name: str
    starter_code: Dict[str, str]
    constraints: List[str]
    examples: List[Dict[str, Any]]
    time_limit_ms: int
    memory_limit_mb: int
    sample_test_cases: List[CodingTestCasePublicSchema] = []

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# EXECUTION & SUBMISSION SCHEMAS
# ============================================================

class CodeRunRequestSchema(BaseModel):
    """
    Request to execute code on custom or sample inputs (Non-evaluative Run).
    """
    code: str = Field(..., description="User source code to execute")
    language: str = Field(default="python", description="Language identifier: python, cpp, java, javascript")
    custom_input: Optional[str] = Field(default="", description="Optional standard input (stdin) for the program")
    problem_id: Optional[str] = Field(default=None, description="Associated problem ID if running within problem context")


class SingleTestResultSchema(BaseModel):
    """
    Execution outcome for a single test case.
    """
    test_case_index: int
    is_hidden: bool
    status: str  # 'Passed', 'Failed', 'Error'
    actual_output: Optional[str] = None
    expected_output: Optional[str] = None  # Masked if is_hidden is True
    runtime_ms: Optional[int] = None
    error_message: Optional[str] = None


class CodeRunResponseSchema(BaseModel):
    """
    Immediate result from executing code against sample or custom input.
    """
    status: str
    stdout: Optional[str] = ""
    stderr: Optional[str] = ""
    compile_output: Optional[str] = ""
    runtime_ms: Optional[int] = 0
    memory_kb: Optional[int] = 0
    test_results: List[SingleTestResultSchema] = []


class CodeSubmitRequestSchema(BaseModel):
    """
    Request to officially submit code against the full test suite (visible + hidden).
    """
    problem_id: str = Field(..., description="Problem identifier")
    language: str = Field(default="python", description="Programming language")
    code: str = Field(..., description="Complete user source code solution")


class CodeSubmitResponseSchema(BaseModel):
    """
    Official submission result stored in database and returned to user.
    """
    submission_id: str
    status: str  # 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', etc.
    passed_tests: int
    total_tests: int
    runtime_ms: Optional[int] = None
    memory_kb: Optional[int] = None
    error_output: Optional[str] = None
    test_results: List[SingleTestResultSchema] = []
    ai_feedback_summary: Optional[str] = None


# ============================================================
# QUIZ SCHEMAS
# ============================================================

class QuizOptionPublicSchema(BaseModel):
    """
    Option representation sent to the user.
    SECURITY NOTE: 'is_correct' is strictly omitted to prevent client-side answer cheating.
    """
    id: str
    option_text: str
    order_index: int

    model_config = ConfigDict(from_attributes=True)


class QuizQuestionPublicSchema(BaseModel):
    """
    Public MCQ question schema.
    """
    id: str
    question_text: str
    difficulty: str
    category: str
    options: List[QuizOptionPublicSchema]

    model_config = ConfigDict(from_attributes=True)


class QuizAttemptRequestSchema(BaseModel):
    """
    User answer submission for an MCQ.
    """
    question_id: str
    selected_option_id: str
    time_taken_seconds: Optional[int] = None


class QuizAttemptResponseSchema(BaseModel):
    """
    Server-side evaluation returned after an answer is submitted.
    """
    is_correct: bool
    explanation: str
    correct_option_id: str
    user_selected_option_id: str


# ============================================================
# DASHBOARD, PROGRESS & LEADERBOARD SCHEMAS
# ============================================================

class WeakTopicSchema(BaseModel):
    """
    Topic performance metric indicating areas needing improvement.
    """
    topic_name: str
    mastery_percentage: int


class RecentTestSchema(BaseModel):
    """
    Recent test activity card for the dashboard carousel.
    """
    id: str
    title: str
    language: str
    progress_percentage: int
    category: str


class TestBreakdownSchema(BaseModel):
    """
    Numerical breakdown of user test results.
    """
    total_tests: int
    passed_tests: int
    failed_tests: int
    pending_tests: int


class DashboardStatsSchema(BaseModel):
    """
    Aggregated dashboard statistics matching the reference UI kit design.
    """
    welcome_name: str
    problems_solved: int
    quiz_attempted: int
    coding_accuracy_percentage: int
    quiz_accuracy_percentage: int
    current_streak_days: int
    recent_tests: List[RecentTestSchema] = []
    weak_topics: List[WeakTopicSchema] = []
    test_breakdown: TestBreakdownSchema


class LeaderboardUserSchema(BaseModel):
    """
    Leaderboard entry representing real user rankings.
    """
    rank: int
    user_id: str
    username: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    score: int
    problems_solved: int
    quiz_score: int
    streak_days: int


# ============================================================
# AI MENTOR SCHEMAS (GOOGLE GEMINI ONLY)
# ============================================================

class AiMentorChatRequestSchema(BaseModel):
    """
    Request for conversational guidance with the Gemini AI Mentor.
    """
    problem_id: Optional[str] = None
    user_code: Optional[str] = None
    language: Optional[str] = "python"
    user_message: str = Field(..., description="User question or request to the AI mentor")
    chat_history: Optional[List[Dict[str, str]]] = Field(default=[], description="Previous conversation turns")


class AiMentorChatResponseSchema(BaseModel):
    """
    Response from the Gemini AI Mentor.
    """
    mentor_reply: str
    suggested_followups: List[str] = []


class AiMentorHintRequestSchema(BaseModel):
    """
    Request for a progressive hint on a specific problem without full spoilers.
    """
    problem_id: str
    user_code: Optional[str] = None
    language: Optional[str] = "python"
    hint_level: int = Field(default=1, ge=1, le=3, description="1: Conceptual intuition, 2: Data structure/approach, 3: Pseudocode logic")


class AiMentorHintResponseSchema(BaseModel):
    """
    Progressive hint response.
    """
    hint_level: int
    hint_title: str
    hint_text: str
    has_next_level: bool


class AiCodeReviewRequestSchema(BaseModel):
    """
    Request for automated educational code review by Gemini after execution.
    """
    problem_id: str
    language: str
    code: str
    submission_status: str


class AiCodeReviewResponseSchema(BaseModel):
    """
    Structured code quality review generated by Gemini.
    """
    summary: str
    time_complexity: str
    space_complexity: str
    strengths: List[str]
    improvements: List[str]
    edge_case_warnings: List[str]


# ============================================================
# CONTENT GENERATION SCHEMAS (GEMINI ONLY)
# ============================================================

class GenerateProblemRequestSchema(BaseModel):
    """
    Request payload to generate a new coding problem using Gemini.
    """
    topic: str = Field(..., description="Focus topic or concept name")
    difficulty: str = Field(default="Medium", description="'Easy', 'Medium', or 'Hard'")
    language: str = Field(default="python", description="Target starter code language")


class GenerateQuizRequestSchema(BaseModel):
    """
    Request payload to generate conceptual quiz questions using Gemini.
    """
    category: str = Field(..., description="Subject category (e.g. 'Python', 'SQL', 'OS', 'DSA')")
    difficulty: str = Field(default="Medium", description="'Easy', 'Medium', or 'Hard'")
    count: int = Field(default=5, ge=1, le=10, description="Number of questions to generate")

