# Cognitio Libera — REST API Specification 📡

> **Practice. Understand. Improve.**  
> Complete documentation of all REST endpoints, request payloads, response schemas, and authentication headers.

---

## 1. Global Conventions & Authentication

- **Base URL**: `http://127.0.0.1:8000/api/v1` (Local) or `https://cognitio-libera-api.onrender.com/api/v1` (Production)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (Supabase JWT or `dev-token-<user-id>`)
- **Status Codes**:
  - `200 OK`: Request succeeded.
  - `201 Created`: Resource created.
  - `400 Bad Request`: Validation failure.
  - `401 Unauthorized`: Missing or invalid Bearer token.
  - `404 Not Found`: Resource does not exist.
  - `500 Internal Server Error`: Unhandled server exception.

---

## 2. Authentication & User Profile Endpoints

### 2.1. Sync User Session
**`POST /api/v1/auth/sync`**  
Synchronizes the authenticated Supabase user with the internal database profile. Creates the profile on first login.

- **Request Body**:
```json
{
  "email": "student@cognitiolibera.com",
  "username": "alex_coder",
  "full_name": "Alex Mercer",
  "avatar_url": "https://api.dicebear.com/7.x/bottts/svg?seed=alex"
}
```
- **Response `200 OK`**:
```json
{
  "id": "usr_94e21a8d-1903-4f93-8b74-893dca6a4b12",
  "email": "student@cognitiolibera.com",
  "username": "alex_coder",
  "full_name": "Alex Mercer",
  "avatar_url": "https://api.dicebear.com/7.x/bottts/svg?seed=alex",
  "role": "student",
  "total_points": 250,
  "current_streak": 3,
  "longest_streak": 5
}
```

### 2.2. Get Current User Profile
**`GET /api/v1/auth/me`**  
Returns the authenticated profile, streak metrics, and current rank.

---

## 3. Coding Problems Endpoints

### 3.1. List Coding Problems
**`GET /api/v1/problems/`**  
Retrieves paginated coding problems with filtering by topic, difficulty, or keyword.

- **Query Parameters**:
  - `topic` (string, optional): Topic slug (e.g. `arrays-and-hashing`).
  - `difficulty` (string, optional): `easy`, `medium`, or `hard`.
  - `search` (string, optional): Search keyword.
  - `skip` (integer, default `0`): Pagination offset.
  - `limit` (integer, default `50`): Results per page.

- **Response `200 OK`**:
```json
[
  {
    "id": "prob_29f8c12a",
    "title": "Two Sum",
    "slug": "two-sum",
    "difficulty": "easy",
    "topic_id": "top_arrays",
    "acceptance_rate": 84.5,
    "created_at": "2026-09-20T12:00:00Z"
  }
]
```

### 3.2. Get Problem by Slug (with Test Masking)
**`GET /api/v1/problems/{slug}`**  
Retrieves problem statement, constraints, starter codes, and **public test cases only**. Hidden test cases are strictly filtered out to prevent cheating.

- **Response `200 OK`**:
```json
{
  "id": "prob_29f8c12a",
  "title": "Two Sum",
  "slug": "two-sum",
  "difficulty": "easy",
  "description": "Given an array of integers `nums` and an integer `target`...",
  "starter_code": {
    "python": "def two_sum(nums: list[int], target: int) -> list[int]:\n    pass",
    "javascript": "function twoSum(nums, target) {\n    // Implementation\n}"
  },
  "time_limit_ms": 2000,
  "memory_limit_kb": 256000,
  "test_cases": [
    {
      "id": "tc_1",
      "input": "[2,7,11,15]\n9",
      "expected_output": "[0,1]",
      "is_hidden": false
    }
  ]
}
```

### 3.3. Generate Coding Problem On-Demand (Gemini)
**`POST /api/v1/problems/generate`**  
Generates a complete, verified algorithmic coding problem using Google Gemini, complete with constraints, multi-language starter codes, and test cases.

- **Request Body**:
```json
{
  "topic": "Dynamic Programming",
  "difficulty": "medium"
}
```
- **Response `200 OK`**:
```json
{
  "id": "prob_gen_123",
  "title": "House Robber II",
  "slug": "house-robber-ii",
  "difficulty": "medium",
  "description": "...",
  "test_cases": [...]
}
```

---

## 4. Code Execution & Submissions (Google Gemini AI Evaluator)

### 4.1. Run Code Interactively
**`POST /api/v1/execution/run`**  
Executes user code against custom or sample standard input via Google Gemini simulated environment.

- **Request Body**:
```json
{
  "language": "python",
  "code": "nums = [2, 7, 11, 15]\nprint([0, 1])",
  "custom_input": ""
}
```
- **Response `200 OK`**:
```json
{
  "status": "Accepted",
  "stdout": "[0, 1]\n",
  "stderr": "",
  "runtime_ms": 24.0,
  "memory_kb": 7240
}
```

### 4.2. Submit Problem Solution
**`POST /api/v1/execution/submit`**  
Submits solution code against the complete test suite (both visible and hidden). Evaluates on Google Gemini, records the submission, awards points, and masks hidden test details.

- **Request Body**:
```json
{
  "problem_id": "prob_29f8c12a",
  "language": "python",
  "code": "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in seen:\n            return [seen[comp], i]\n        seen[num] = i\n    return []"
}
```
- **Response `200 OK`**:
```json
{
  "id": "sub_883a91bf",
  "status": "Accepted",
  "passed_test_cases": 5,
  "total_test_cases": 5,
  "runtime_ms": 32.0,
  "memory_kb": 8192,
  "points_earned": 50,
  "test_results": [
    {
      "test_case_id": "tc_1",
      "status": "Passed",
      "is_hidden": false,
      "input": "[2,7,11,15]\n9",
      "expected_output": "[0,1]",
      "actual_output": "[0,1]"
    },
    {
      "test_case_id": "tc_5",
      "status": "Passed",
      "is_hidden": true,
      "input": "[HIDDEN]",
      "expected_output": "[HIDDEN]",
      "actual_output": "[HIDDEN]"
    }
  ]
}
```

---

## 5. Quiz & Assessment Endpoints

### 5.1. Fetch Quiz Questions (Masked)
**`GET /api/v1/quiz/questions?topic_id={topic_id}&limit=10`**  
Retrieves randomized topic questions. `is_correct` and `explanation` properties are masked to prevent client-side inspection.

### 5.2. Submit Quiz Answers
**`POST /api/v1/quiz/submit`**  
Evaluates student answers on the server, commits attempt history, updates topic mastery, and returns full explanations.

- **Request Body**:
```json
{
  "topic_id": "top_arrays",
  "answers": [
    {
      "question_id": "q_01",
      "selected_option_id": "opt_01_b"
    }
  ]
}
```
- **Response `200 OK`**:
```json
{
  "score": 10,
  "total": 10,
  "percentage": 100.0,
  "points_earned": 100,
  "topic_mastery": 85.0,
  "results": [
    {
      "question_id": "q_01",
      "selected_option_id": "opt_01_b",
      "correct_option_id": "opt_01_b",
      "is_correct": true,
      "explanation": "Hash tables offer average O(1) time complexity for lookups due to hash function indexing."
    }
  ]
}
```

### 5.3. Generate Quiz Set On-Demand (Gemini)
**`POST /api/v1/quiz/generate`**  
Generates a set of conceptual multiple choice questions on any computer science topic using Google Gemini.

- **Request Body**:
```json
{
  "topic": "System Design & Caching",
  "difficulty": "medium",
  "count": 5
}
```
- **Response `200 OK`**:
```json
[
  {
    "id": "q_gen_1",
    "question_text": "What is the primary trade-off when using a write-through cache policy?",
    "options": [...]
  }
]
```

---

## 6. AI Mentor & Tutoring Endpoints

### 6.1. Get Progressive Hint
**`POST /api/v1/mentor/hint`**  
Generates a structured, non-spoiler hint powered by Google Gemini.

- **Request Body**:
```json
{
  "problem_id": "prob_29f8c12a",
  "current_code": "def two_sum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):...",
  "hint_level": 2
}
```
- **Response `200 OK`**:
```json
{
  "hint_level": 2,
  "title": "Algorithmic Strategy: Hash Map Complement",
  "content": "Notice how your nested loops take O(n²) time checking every pair. Instead of scanning repeatedly, can you use a Hash Map (dictionary) to remember numbers you have already visited and their indices? For each number `x`, what single value do you need to check exists in your map?"
}
```

### 6.2. Request Code Review
**`POST /api/v1/mentor/review`**  
Returns a comprehensive review covering Time/Space Complexity, Cleanliness, Edge Cases, and Refactoring suggestions.

### 6.3. Interactive Socratic Chat
**`POST /api/v1/mentor/chat`**  
Context-aware Socratic conversation guiding the student through algorithmic reasoning.

---

## 7. Progress & Analytics

### 7.1. Get Dashboard Analytics
**`GET /api/v1/progress/dashboard`**  
Returns dynamic counts of problems solved by difficulty, quiz completion, current streak, focus areas, and recent activity.

### 7.2. Global Leaderboard
**`GET /api/v1/progress/leaderboard?limit=25`**  
Returns global rank, points, streak, and problems solved for top learners.
