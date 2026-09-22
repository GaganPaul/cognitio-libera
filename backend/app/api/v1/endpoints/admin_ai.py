"""
AI Content Generation and Administration Endpoints.

WHAT IT IS:
    This router exposes internal capabilities to generate, verify, and persist new
    coding challenges and quizzes using the Google Gemini pipeline.

WHY WE USE IT:
    Enables curriculum expansion while enforcing the mandatory verification pipeline:
    Gemini generates -> Schema validation -> Gemini verification -> Application validation -> Database.

HOW IT CONNECTS:
    Invoked by administrative workflows or background jobs.
"""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_database_session
from app.core.security import get_current_authenticated_user, AuthenticatedUser
from app.ai.generator import gemini_generator
from app.models.entities import CodingProblem, CodingTestCase, QuizQuestion, QuizOption, Topic

router = APIRouter(prefix="/ai", tags=["AI Content Generation"])


@router.post("/generate-problem")
async def generate_and_verify_problem(
    topic: str = Query("Binary Search", description="Focus topic"),
    difficulty: str = Query("Medium", description="'Easy', 'Medium', or 'Hard'"),
    save_to_db: bool = Query(False, description="Whether to persist to database if verified"),
    db: Session = Depends(get_database_session)
):
    """
    Executes the Gemini generation and verification pipeline for a new coding problem.

    Args:
        topic: Topic name.
        difficulty: Target difficulty.
        save_to_db: Boolean indicating whether to store in Supabase.
        db: Database session.

    Returns:
        Dict: Verified problem structure or validation error.
    """
    problem_dict = await gemini_generator.generate_problem(topic_name=topic, difficulty=difficulty)
    if not problem_dict:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Gemini generation or verification audit failed for the requested parameters."
        )

    if save_to_db:
        slug = problem_dict["title"].lower().replace(" ", "-").replace("'", "")
        # Find or use topic
        topic_entity = db.query(Topic).first()

        new_prob = CodingProblem(
            title=problem_dict["title"],
            slug=f"{slug}-{str(uuid.uuid4())[:4]}",
            difficulty=difficulty,
            topic_id=topic_entity.id if topic_entity else None,
            function_name=problem_dict.get("function_name", "solve"),
            starter_code=problem_dict.get("starter_code", {}),
            description=problem_dict.get("description", ""),
            constraints=problem_dict.get("constraints", []),
            examples=problem_dict.get("examples", [])
        )
        db.add(new_prob)
        db.flush()

        for idx, tc in enumerate(problem_dict.get("test_cases", [])):
            db.add(CodingTestCase(
                problem_id=new_prob.id,
                input_data=str(tc.get("input_data", "")),
                expected_output=str(tc.get("expected_output", "")),
                is_hidden=tc.get("is_hidden", False),
                order_index=idx
            ))

        db.commit()
        db.refresh(new_prob)
        problem_dict["saved_id"] = new_prob.id

    return problem_dict


@router.post("/generate-quiz")
async def generate_and_verify_quiz(
    category: str = Query("Python", description="Category"),
    difficulty: str = Query("Medium", description="'Easy', 'Medium', or 'Hard'"),
    save_to_db: bool = Query(False, description="Persist to DB if verified"),
    db: Session = Depends(get_database_session)
):
    """
    Generates and verifies an MCQ with 4 options and 1 verified correct answer.

    Args:
        category: Subject category.
        difficulty: Difficulty level.
        save_to_db: Whether to commit to database.
        db: Database session.

    Returns:
        Dict: Verified quiz question.
    """
    quiz_dict = await gemini_generator.generate_quiz_question(category=category, difficulty=difficulty)
    if not quiz_dict:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Gemini quiz generation or verification audit failed."
        )

    if save_to_db:
        new_q = QuizQuestion(
            question_text=quiz_dict["question_text"],
            explanation=quiz_dict["explanation"],
            difficulty=difficulty,
            category=category
        )
        db.add(new_q)
        db.flush()

        for idx, opt in enumerate(quiz_dict.get("options", [])):
            db.add(QuizOption(
                question_id=new_q.id,
                option_text=opt["option_text"],
                is_correct=opt["is_correct"],
                order_index=idx
            ))
        db.commit()
        db.refresh(new_q)
        quiz_dict["saved_id"] = new_q.id

    return quiz_dict
