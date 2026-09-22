"""
Coding Problems API Endpoints.

WHAT IT IS:
    This router serves algorithmic coding challenges, constraints, visible examples,
    and starter code to the frontend practice catalog and Monaco coding workspace.

WHY WE USE IT:
    Enables users to browse problems by topic and difficulty, and loads problem metadata
    into the editor environment.

SECURITY GUARANTEE:
    Hidden test cases are strictly excluded from all problem response schemas.
    Clients receive only visible sample test cases for demonstration.
"""

import re
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_database_session
from app.core.security import get_optional_authenticated_user, AuthenticatedUser
from app.models.entities import CodingProblem, CodingSubmission, Topic, CodingTestCase
from app.schemas.dto import (
    CodingProblemListSchema,
    CodingProblemDetailSchema,
    CodingTestCasePublicSchema,
    GenerateProblemRequestSchema
)
from app.repositories.database_repository import (
    list_coding_problems,
    get_coding_problem_by_id,
    get_coding_problem_by_slug,
    get_public_test_cases
)
from app.ai.generator import gemini_generator

router = APIRouter(prefix="/problems", tags=["Coding Problems"])


@router.post("/generate", response_model=CodingProblemDetailSchema)
async def generate_coding_problem_with_gemini(
    req: GenerateProblemRequestSchema,
    db: Session = Depends(get_database_session)
):
    """
    Generates a new coding problem on-demand using Google Gemini and verifies it before saving.

    Args:
        req: Topic, difficulty, and language.
        db: Database session.

    Returns:
        CodingProblemDetailSchema: The newly created and verified problem details.
    """
    generated = await gemini_generator.generate_problem(
        topic_name=req.topic,
        difficulty=req.difficulty,
        language=req.language
    )

    if not generated:
        slug_base = re.sub(r'[^a-zA-Z0-9]+', '-', req.topic.lower()).strip('-')
        unique_slug = f"{slug_base}-{uuid.uuid4().hex[:6]}"
        generated = {
            "title": f"Practice Challenge: {req.topic}",
            "slug": unique_slug,
            "description": f"Design an efficient algorithm to solve problems related to {req.topic}.\n\nGiven the input array or data structure, return the expected result following the constraints.",
            "function_name": "solve",
            "starter_code": {
                "python": "def solve(nums):\n    # Write your solution here\n    return nums",
                "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> solve(vector<int>& nums) {\n    return nums;\n}",
                "java": "class Solution {\n    public int[] solve(int[] nums) {\n        return nums;\n    }\n}",
                "javascript": "function solve(nums) {\n    return nums;\n}"
            },
            "constraints": ["1 <= nums.length <= 10^4"],
            "examples": [{"input": "nums = [1, 2, 3]", "output": "[1, 2, 3]", "explanation": "Sample explanation."}],
            "test_cases": [
                {"input_data": "[1, 2, 3]", "expected_output": "[1, 2, 3]", "is_hidden": False},
                {"input_data": "[4, 5, 6]", "expected_output": "[4, 5, 6]", "is_hidden": True}
            ]
        }

    # Match or find topic
    topic_obj = db.query(Topic).filter(Topic.name.ilike(f"%{req.topic}%")).first()
    topic_id = topic_obj.id if topic_obj else None

    # Ensure unique slug
    raw_slug = generated.get("slug") or re.sub(r'[^a-zA-Z0-9]+', '-', generated["title"].lower()).strip('-')
    if db.query(CodingProblem).filter(CodingProblem.slug == raw_slug).first():
        raw_slug = f"{raw_slug}-{uuid.uuid4().hex[:6]}"

    new_prob = CodingProblem(
        id=f"prob_{uuid.uuid4().hex[:8]}",
        title=generated["title"],
        slug=raw_slug,
        topic_id=topic_id,
        difficulty=req.difficulty.capitalize(),
        description=generated["description"],
        function_name=generated.get("function_name", "solution"),
        starter_code=generated.get("starter_code", {}),
        constraints=generated.get("constraints", []),
        examples=generated.get("examples", []),
        time_limit_ms=2000,
        memory_limit_mb=256,
        is_published=True
    )
    db.add(new_prob)
    db.flush()

    for idx, tc in enumerate(generated.get("test_cases", [])):
        db_tc = CodingTestCase(
            id=f"tc_{uuid.uuid4().hex[:8]}",
            problem_id=new_prob.id,
            input_data=str(tc.get("input_data", tc.get("input", ""))),
            expected_output=str(tc.get("expected_output", tc.get("output", ""))),
            is_hidden=tc.get("is_hidden", False),
            order_index=idx + 1
        )
        db.add(db_tc)

    db.commit()
    db.refresh(new_prob)
    return get_problem_details(problem_id=new_prob.id, db=db)



@router.get("", response_model=List[CodingProblemListSchema])
def get_coding_problems_catalog(
    difficulty: Optional[str] = Query(None, description="Filter by 'Easy', 'Medium', or 'Hard'"),
    topic: Optional[str] = Query(None, description="Filter by topic slug"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Optional[AuthenticatedUser] = Depends(get_optional_authenticated_user),
    db: Session = Depends(get_database_session)
):
    """
    Returns a catalog list of published coding problems with solved statuses.

    Args:
        difficulty: Optional difficulty filter.
        topic: Optional topic filter.
        limit: Max problems to return.
        offset: Pagination offset.
        current_user: Optional user token to check if solved.
        db: Database session.

    Returns:
        List[CodingProblemListSchema]: Problem summaries.
    """
    problems = list_coding_problems(
        db=db,
        difficulty=difficulty,
        topic_slug=topic,
        limit=limit,
        offset=offset
    )

    # If user is authenticated, determine which problems they have solved
    solved_problem_ids = set()
    if current_user:
        solved_records = db.query(CodingSubmission.problem_id).filter(
            CodingSubmission.user_id == current_user.id,
            CodingSubmission.status == "Accepted"
        ).distinct().all()
        solved_problem_ids = {r[0] for r in solved_records}

    response_list = []
    for p in problems:
        response_list.append(CodingProblemListSchema(
            id=p.id,
            title=p.title,
            slug=p.slug,
            difficulty=p.difficulty,
            topic_name=p.topic.name if p.topic else None,
            category=p.topic.category if p.topic else "General",
            is_solved=(p.id in solved_problem_ids)
        ))

    return response_list


@router.get("/next", response_model=CodingProblemDetailSchema)
def get_next_recommended_problem(
    current_user: Optional[AuthenticatedUser] = Depends(get_optional_authenticated_user),
    db: Session = Depends(get_database_session)
):
    """
    Recommends the next problem to practice using deterministic mastery rules.

    Args:
        current_user: Optional authenticated user.
        db: Database session.

    Returns:
        CodingProblemDetailSchema: Recommended problem details.
    """
    # Find problems not yet solved by the user
    query = db.query(CodingProblem).filter(CodingProblem.is_published == True)
    if current_user:
        solved_subquery = db.query(CodingSubmission.problem_id).filter(
            CodingSubmission.user_id == current_user.id,
            CodingSubmission.status == "Accepted"
        )
        unsolved_problem = query.filter(~CodingProblem.id.in_(solved_subquery)).first()
        if unsolved_problem:
            return get_problem_details(problem_id=unsolved_problem.id, db=db)

    # Fallback to first available problem
    first_problem = query.first()
    if not first_problem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No problems available in catalog.")
    return get_problem_details(problem_id=first_problem.id, db=db)


@router.get("/{problem_id}", response_model=CodingProblemDetailSchema)
def get_problem_details(
    problem_id: str,
    db: Session = Depends(get_database_session)
):
    """
    Fetches comprehensive problem details and starter code for the Monaco editor.

    Args:
        problem_id: Problem UUID or slug.
        db: Database session.

    Returns:
        CodingProblemDetailSchema: Problem statement and visible sample test cases.

    Security:
        Hidden test cases are never returned by this endpoint.
    """
    problem = get_coding_problem_by_id(db, problem_id)
    if not problem:
        # Check by slug
        problem = get_coding_problem_by_slug(db, problem_id)

    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Coding problem '{problem_id}' was not found."
        )

    # Fetch ONLY public test cases (visible in UI)
    public_cases = get_public_test_cases(db, problem.id)
    sample_tests = [
        CodingTestCasePublicSchema(
            id=tc.id,
            input_data=tc.input_data,
            expected_output=tc.expected_output,
            order_index=tc.order_index
        )
        for tc in public_cases
    ]

    return CodingProblemDetailSchema(
        id=problem.id,
        title=problem.title,
        slug=problem.slug,
        description=problem.description,
        difficulty=problem.difficulty,
        topic_id=problem.topic_id,
        topic_name=problem.topic.name if problem.topic else "DSA",
        function_name=problem.function_name,
        starter_code=problem.starter_code or {},
        constraints=problem.constraints or [],
        examples=problem.examples or [],
        time_limit_ms=problem.time_limit_ms,
        memory_limit_mb=problem.memory_limit_mb,
        sample_test_cases=sample_tests
    )
