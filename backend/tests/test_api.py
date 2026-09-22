"""
Automated Backend API Integration Tests.

WHAT IT TESTS:
    1. Health check endpoint (`/health`)
    2. Profile sync and retrieval (`/api/v1/users/me`, `/api/v1/auth/sync`)
    3. Coding problem retrieval and mandatory hidden test case masking
    4. Code execution run endpoint (`/api/v1/execution/run`)
    5. Code submission grading and progress tracking (`/api/v1/execution/submit`)
    6. Quiz retrieval with answer masking and server-side attempt evaluation (`/api/v1/quiz/*`)
    7. Aggregated dashboard metrics and leaderboard calculations (`/api/v1/progress/*`)
    8. Progressive AI Mentor hints (`/api/v1/mentor/hint`)
"""

import pytest


def test_health_check(client):
    """
    Verifies that the health check endpoint reports a healthy status.
    """
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Cognitio Libera"


def test_user_sync_and_profile(client):
    """
    Tests synchronizing a user profile and retrieving updated preferences.
    """
    sync_payload = {
        "email": "teststudent@cognitiolibera.com",
        "username": "TestStudent",
        "full_name": "Test Student"
    }
    response = client.post("/api/v1/auth/sync", json=sync_payload)
    assert response.status_code == 200
    profile = response.json()
    assert profile["email"] == "teststudent@cognitiolibera.com"
    assert profile["username"] == "TestStudent"

    # Fetch profile via /users/me
    me_resp = client.get("/api/v1/users/me")
    assert me_resp.status_code == 200
    assert me_resp.json()["username"] == "TestStudent"

    # Update preferences
    pref_payload = {"theme": "dark", "preferred_language": "python"}
    patch_resp = client.patch("/api/v1/users/me/preferences", json=pref_payload)
    assert patch_resp.status_code == 200
    assert patch_resp.json()["theme"] == "dark"


def test_problem_retrieval_masks_hidden_test_cases(client):
    """
    SECURITY TEST: Ensures that problem endpoints NEVER leak hidden test cases to the browser.
    """
    # 1. Fetch problem catalog
    catalog_resp = client.get("/api/v1/problems")
    assert catalog_resp.status_code == 200
    problems = catalog_resp.json()
    assert len(problems) > 0

    first_problem = problems[0]
    problem_id = first_problem["id"]

    # 2. Fetch problem details
    detail_resp = client.get(f"/api/v1/problems/{problem_id}")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()

    assert "description" in detail
    assert "starter_code" in detail
    assert "sample_test_cases" in detail

    # Verify that every test case in sample_test_cases is public
    for sample in detail["sample_test_cases"]:
        assert "input_data" in sample
        assert "expected_output" in sample
        # Crucially: no hidden test cases are present
        assert "is_hidden" not in sample or sample.get("is_hidden") is False


def test_code_run_custom_input(client):
    """
    Verifies that the /execution/run endpoint executes standard code without grading.
    """
    payload = {
        "code": "print('Hello from Cognitio Libera!')",
        "language": "python",
        "custom_input": ""
    }
    response = client.post("/api/v1/execution/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "stdout" in data


def test_code_submit_evaluation(client):
    """
    Tests submitting a solution to an algorithmic problem, evaluating test cases,
    and persisting the submission.
    """
    # Get Two Sum problem
    detail_resp = client.get("/api/v1/problems/two-sum")
    assert detail_resp.status_code == 200
    problem = detail_resp.json()

    # Solution code
    solution_code = """
def two_sum(nums, target):
    lookup = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in lookup:
            return [lookup[diff], i]
        lookup[num] = i
    return []
"""
    payload = {
        "problem_id": problem["id"],
        "language": "python",
        "code": solution_code
    }
    response = client.post("/api/v1/execution/submit", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "submission_id" in data
    assert "status" in data
    assert data["total_tests"] >= 2


def test_quiz_answer_masking_and_attempt(client):
    """
    SECURITY TEST: Confirms that quiz question options do NOT reveal 'is_correct' before submission,
    and server-side grading computes the correct answer.
    """
    # 1. Fetch questions
    questions_resp = client.get("/api/v1/quiz/questions?limit=5")
    assert questions_resp.status_code == 200
    questions = questions_resp.json()
    assert len(questions) > 0

    first_q = questions[0]
    # Verify no option exposes is_correct
    for opt in first_q["options"]:
        assert "is_correct" not in opt
        assert "option_text" in opt
        assert "id" in opt

    # 2. Submit an attempt
    attempt_payload = {
        "question_id": first_q["id"],
        "selected_option_id": first_q["options"][0]["id"],
        "time_taken_seconds": 15
    }
    attempt_resp = client.post("/api/v1/quiz/attempt", json=attempt_payload)
    assert attempt_resp.status_code == 200
    attempt_data = attempt_resp.json()

    assert "is_correct" in attempt_data
    assert "explanation" in attempt_data
    assert "correct_option_id" in attempt_data


def test_dashboard_statistics(client):
    """
    Verifies that dashboard statistics return structured numbers, recent tests, and weak topics.
    """
    response = client.get("/api/v1/progress/dashboard/stats")
    assert response.status_code == 200
    stats = response.json()

    assert "welcome_name" in stats
    assert "problems_solved" in stats
    assert "coding_accuracy_percentage" in stats
    assert "quiz_accuracy_percentage" in stats
    assert "test_breakdown" in stats
    assert "recent_tests" in stats
    assert "weak_topics" in stats


def test_leaderboard_rankings(client):
    """
    Verifies global leaderboard rankings calculation.
    """
    response = client.get("/api/v1/progress/leaderboard")
    assert response.status_code == 200
    rankings = response.json()
    assert isinstance(rankings, list)


def test_ai_mentor_progressive_hint(client):
    """
    Verifies that the AI Mentor progressive hint returns Level 1 guidance without crashing.
    """
    # Get problem ID
    detail_resp = client.get("/api/v1/problems/first-and-last-position")
    assert detail_resp.status_code == 200
    problem = detail_resp.json()

    payload = {
        "problem_id": problem["id"],
        "user_code": "def first_and_last_position(nums, target): pass",
        "language": "python",
        "hint_level": 1
    }
    response = client.post("/api/v1/mentor/hint", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["hint_level"] == 1
    assert "hint_title" in data
    assert "hint_text" in data
    assert len(data["hint_text"]) > 10
    assert data["has_next_level"] is True


def test_problem_generation_with_gemini(client):
    """
    Validates on-demand problem generation endpoint.
    """
    payload = {
        "topic": "Dynamic Programming",
        "difficulty": "Medium",
        "language": "python"
    }
    response = client.post("/api/v1/problems/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "title" in data
    assert "starter_code" in data
    assert len(data["sample_test_cases"]) > 0


def test_quiz_generation_with_gemini(client):
    """
    Validates on-demand quiz question generation endpoint.
    """
    payload = {
        "category": "Computer Networks",
        "difficulty": "Easy",
        "count": 2
    }
    response = client.post("/api/v1/quiz/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    for q in data:
        assert "question_text" in q
        assert len(q["options"]) == 4
