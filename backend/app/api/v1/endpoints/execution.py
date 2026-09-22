"""
Code Execution and Official Submission Endpoints.

WHAT IT IS:
    This router provides endpoints for running custom/sample code and officially
    submitting coding solutions for grading.

WHY WE USE IT:
    Separating 'Run' (rapid iteration with custom stdin) from 'Submit' (formal grading
    against hidden test suites with progress tracking) reflects standard industry practice.

SECURITY GUARANTEES:
    - User code is evaluated and simulated via Google Gemini AI.
    - No dangerous eval() or exec() on the backend host.
    - Hidden test outputs and test data remain masked on the server.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_database_session
from app.core.security import get_current_authenticated_user, AuthenticatedUser
from app.execution.service import execution_service
from app.schemas.dto import (
    CodeRunRequestSchema,
    CodeRunResponseSchema,
    CodeSubmitRequestSchema,
    CodeSubmitResponseSchema,
    SingleTestResultSchema
)
from app.repositories.database_repository import (
    get_coding_problem_by_id,
    get_test_cases_for_execution,
    create_coding_submission,
    update_topic_progress
)

router = APIRouter(prefix="/execution", tags=["Execution & Submissions"])


@router.post("/run", response_model=CodeRunResponseSchema)
async def run_custom_code(
    run_request: CodeRunRequestSchema,
    db: Session = Depends(get_database_session)
):
    """
    Executes code against custom input or sample inputs using Google Gemini code evaluation.

    Args:
        run_request: Code, language, and optional custom input stdin.
        db: Database session.

    Returns:
        CodeRunResponseSchema: Execution outputs, errors, and performance metrics from Gemini.
    """
    response = await execution_service.run_custom_code(
        code=run_request.code,
        language=run_request.language,
        custom_input=run_request.custom_input or "",
        time_limit_ms=2000,
        memory_limit_mb=256
    )
    return response


@router.post("/submit", response_model=CodeSubmitResponseSchema)
async def submit_coding_solution(
    submit_request: CodeSubmitRequestSchema,
    current_user: AuthenticatedUser = Depends(get_current_authenticated_user),
    db: Session = Depends(get_database_session)
):
    """
    Evaluates a student's solution against the complete test suite (visible + hidden).
    Stores the official submission in the database and updates learning progress.

    Args:
        submit_request: Problem ID, language, and complete code solution.
        current_user: Authenticated student.
        db: Database session.

    Returns:
        CodeSubmitResponseSchema: Grading status (Accepted, Wrong Answer), test counts,
        runtime, memory, and masked test results.
    """
    problem = get_coding_problem_by_id(db, submit_request.problem_id)
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Coding problem with ID '{submit_request.problem_id}' does not exist."
        )

    # Retrieve all test cases (visible + hidden) for Gemini evaluation
    all_test_cases = get_test_cases_for_execution(db, problem.id)
    if not all_test_cases:
        # Fallback if no test cases defined
        all_test_cases = [{"input_data": "", "expected_output": "", "is_hidden": False}]

    # Dispatch to Google Gemini via ExecutionService
    eval_result = await execution_service.evaluate_submission(
        user_code=submit_request.code,
        language=submit_request.language,
        function_name=problem.function_name,
        test_cases=all_test_cases,
        problem_title=problem.title,
        problem_description=problem.description,
        time_limit_ms=problem.time_limit_ms,
        memory_limit_mb=problem.memory_limit_mb
    )

    # Persist the official submission record
    submission = create_coding_submission(
        db=db,
        user_id=current_user.id,
        problem_id=problem.id,
        language=submit_request.language,
        code=submit_request.code,
        status=eval_result["status"],
        runtime_ms=eval_result["runtime_ms"],
        memory_kb=eval_result["memory_kb"],
        passed_tests=eval_result["passed_tests"],
        total_tests=eval_result["total_tests"],
        error_output=eval_result.get("error_output")
    )

    # Update deterministic topic mastery progress
    if problem.topic_id:
        update_topic_progress(
            db=db,
            user_id=current_user.id,
            topic_id=problem.topic_id,
            is_coding=True,
            is_solved=(eval_result["status"] == "Accepted")
        )

    ai_feedback = eval_result.get("ai_feedback_summary") or (
        "Solution passes all test cases! Click 'Ask AI Mentor' for time/space complexity analysis."
        if submission.status == "Accepted"
        else "Some test cases failed. Ask the AI Mentor for a progressive hint to debug your approach."
    )

    return CodeSubmitResponseSchema(
        submission_id=submission.id,
        status=submission.status,
        passed_tests=submission.passed_tests,
        total_tests=submission.total_tests,
        runtime_ms=submission.runtime_ms,
        memory_kb=submission.memory_kb,
        error_output=submission.error_output,
        test_results=eval_result.get("test_results", []),
        ai_feedback_summary=ai_feedback
    )
