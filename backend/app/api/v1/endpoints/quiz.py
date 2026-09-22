"""
Multiple Choice Quiz API Endpoints.

WHAT IT IS:
    This router delivers conceptual quiz assessments, handles option submission,
    grades responses server-side, and records learning progress.

WHY WE USE IT:
    Reinforces theoretical computer science fundamentals (data structures, system design,
    languages, and databases).

SECURITY GUARANTEES:
    The `is_correct` boolean field is strictly stripped from option objects sent to the client.
    Evaluation is computed exclusively server-side upon receiving the user's choice.
"""

import logging
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_database_session
from app.core.security import get_current_authenticated_user, get_optional_authenticated_user, AuthenticatedUser
from app.models.entities import QuizQuestion, QuizOption, Topic
from app.schemas.dto import (
    QuizQuestionPublicSchema,
    QuizOptionPublicSchema,
    QuizAttemptRequestSchema,
    QuizAttemptResponseSchema,
    GenerateQuizRequestSchema
)
from app.repositories.database_repository import (
    list_quiz_questions,
    record_quiz_attempt,
    update_topic_progress,
    CATEGORY_SLUG_MAP
)
from app.ai.generator import gemini_generator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/quiz", tags=["Quiz"])


def resolve_category_label(category: Optional[str]) -> str:
    """Translates slugs and comma-separated slugs to clean display names."""
    if not category:
        return "General Computer Science"
    clean = category.strip().lower()
    if clean in CATEGORY_SLUG_MAP:
        return CATEGORY_SLUG_MAP[clean][0]
    if "," in category:
        parts = [c.strip() for c in category.split(",") if c.strip()]
        resolved = [CATEGORY_SLUG_MAP.get(p.lower(), [p])[0] for p in parts]
        return ", ".join(resolved)
    return category.strip()


@router.post("/generate", response_model=List[QuizQuestionPublicSchema])
async def generate_quiz_questions_with_gemini(
    req: GenerateQuizRequestSchema,
    db: Session = Depends(get_database_session)
):
    """
    Generates new multiple-choice quiz questions on-demand using Google Gemini without duplicates.

    Args:
        req: Category, difficulty, and count.
        db: Database session.

    Returns:
        List[QuizQuestionPublicSchema]: Newly created and verified non-repeating questions.
    """
    category_label = resolve_category_label(req.category)
    topic_obj = db.query(Topic).filter(Topic.name.ilike(f"%{category_label}%")).first()
    topic_id = topic_obj.id if topic_obj else None

    # Fetch existing questions in this category to guarantee zero repeats
    existing_records = list_quiz_questions(db=db, category=req.category, limit=100)
    existing_texts = [q.question_text for q in existing_records]

    # Generate batch with Gemini
    generated_batch = await gemini_generator.generate_quiz_batch(
        category=category_label,
        difficulty=req.difficulty,
        count=req.count,
        existing_questions=existing_texts
    )

    created_questions = []
    seen_in_batch = set()

    for raw_quiz in generated_batch:
        q_text = raw_quiz.get("question_text", "").strip()
        if not q_text or q_text.lower() in seen_in_batch:
            continue

        # Prevent duplicate insertion if already in database
        already_exists = db.query(QuizQuestion).filter(
            QuizQuestion.question_text.ilike(q_text)
        ).first()
        if already_exists:
            continue

        seen_in_batch.add(q_text.lower())

        new_q = QuizQuestion(
            id=f"q_{uuid.uuid4().hex[:8]}",
            topic_id=topic_id,
            category=category_label,
            difficulty=req.difficulty.capitalize(),
            question_text=q_text,
            explanation=raw_quiz.get("explanation", ""),
            is_published=True
        )
        db.add(new_q)
        db.flush()

        public_opts = []
        for idx, opt in enumerate(raw_quiz.get("options", [])):
            new_opt = QuizOption(
                id=f"opt_{uuid.uuid4().hex[:8]}",
                question_id=new_q.id,
                option_text=opt.get("option_text", ""),
                is_correct=opt.get("is_correct", False),
                order_index=idx + 1
            )
            db.add(new_opt)
            public_opts.append(QuizOptionPublicSchema(
                id=new_opt.id,
                option_text=new_opt.option_text,
                order_index=new_opt.order_index
            ))

        created_questions.append(QuizQuestionPublicSchema(
            id=new_q.id,
            question_text=new_q.question_text,
            difficulty=new_q.difficulty,
            category=new_q.category,
            options=public_opts
        ))

    db.commit()
    return created_questions



@router.get("/questions", response_model=List[QuizQuestionPublicSchema])
async def get_quiz_assessment_questions(
    category: Optional[str] = Query(None, description="Filter by category (e.g. 'DSA', 'Python', 'DBMS', 'OS')"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    limit: int = Query(10, ge=1, le=50),
    auto_generate: bool = Query(True, description="Automatically generate fresh questions if deficit exists"),
    db: Session = Depends(get_database_session)
):
    """
    Returns a distinct set of multiple-choice questions for the quiz mode assessment.
    Automatically synthesizes unique questions with Gemini if fewer questions than requested exist.

    Args:
        category: Optional topic/category.
        difficulty: Optional difficulty level.
        limit: Number of questions (default 10).
        auto_generate: Whether to dynamically generate questions if below limit.
        db: Database session.

    Returns:
        List[QuizQuestionPublicSchema]: Questions with answer options.
    """
    questions = list_quiz_questions(
        db=db,
        category=category,
        difficulty=difficulty,
        limit=limit
    )

    # If category specified and we need more unique questions to meet limit, generate on-demand
    if auto_generate and category and len(questions) < limit:
        deficit = limit - len(questions)
        try:
            category_label = resolve_category_label(category)
            existing_texts = [q.question_text for q in questions]
            new_batch = await gemini_generator.generate_quiz_batch(
                category=category_label,
                difficulty=difficulty or "Medium",
                count=min(deficit + 2, 8),
                existing_questions=existing_texts
            )

            for raw_quiz in new_batch:
                if len(questions) >= limit:
                    break

                q_text = raw_quiz.get("question_text", "").strip()
                if not q_text or any(q_text.lower() == existing.lower() for existing in existing_texts):
                    continue

                # Check database duplicate
                if db.query(QuizQuestion).filter(QuizQuestion.question_text.ilike(q_text)).first():
                    continue

                new_q = QuizQuestion(
                    id=f"q_{uuid.uuid4().hex[:8]}",
                    category=category_label,
                    difficulty=(difficulty or "Medium").capitalize(),
                    question_text=q_text,
                    explanation=raw_quiz.get("explanation", ""),
                    is_published=True
                )
                db.add(new_q)
                db.flush()

                for idx, opt in enumerate(raw_quiz.get("options", [])):
                    new_opt = QuizOption(
                        id=f"opt_{uuid.uuid4().hex[:8]}",
                        question_id=new_q.id,
                        option_text=opt.get("option_text", ""),
                        is_correct=opt.get("is_correct", False),
                        order_index=idx + 1
                    )
                    db.add(new_opt)

                db.commit()
                db.refresh(new_q)
                questions.append(new_q)
                existing_texts.append(q_text)
        except Exception as exc:
            logger.warning(f"On-demand quiz synthesis skipped: {str(exc)}")

    result = []
    for q in questions[:limit]:
        public_options = [
            QuizOptionPublicSchema(
                id=opt.id,
                option_text=opt.option_text,
                order_index=opt.order_index
            )
            for opt in q.options
        ]
        result.append(QuizQuestionPublicSchema(
            id=q.id,
            question_text=q.question_text,
            difficulty=q.difficulty,
            category=q.category,
            options=public_options
        ))

    return result


@router.post("/attempt", response_model=QuizAttemptResponseSchema)
def submit_quiz_question_attempt(
    attempt_data: QuizAttemptRequestSchema,
    current_user: AuthenticatedUser = Depends(get_current_authenticated_user),
    db: Session = Depends(get_database_session)
):
    """
    Evaluates a user's chosen option server-side, records the attempt, and updates progress.

    Args:
        attempt_data: Question ID, selected option ID, and optional time taken.
        current_user: Authenticated user.
        db: Database session.

    Returns:
        QuizAttemptResponseSchema: Whether the choice was correct, detailed explanation,
        and the correct option ID.
    """
    is_correct, explanation, correct_option_id = record_quiz_attempt(
        db=db,
        user_id=current_user.id,
        question_id=attempt_data.question_id,
        selected_option_id=attempt_data.selected_option_id,
        time_taken_seconds=attempt_data.time_taken_seconds
    )

    # If question has an associated topic, update progress
    question = db.query(QuizQuestion).filter(QuizQuestion.id == attempt_data.question_id).first()
    if question and question.topic_id:
        update_topic_progress(
            db=db,
            user_id=current_user.id,
            topic_id=question.topic_id,
            is_coding=False,
            is_solved=is_correct
        )

    return QuizAttemptResponseSchema(
        is_correct=is_correct,
        explanation=explanation,
        correct_option_id=correct_option_id,
        user_selected_option_id=attempt_data.selected_option_id
    )
