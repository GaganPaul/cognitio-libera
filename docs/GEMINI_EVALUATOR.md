# Cognitio Libera — Google Gemini AI Code Evaluator ⚡

## 1. Architectural Philosophy

Cognitio Libera uses **Google Gemini exclusively** for all code execution simulations, automated test suite evaluation, syntax validation, and dynamic question generation.

```
┌─────────────────────────────────────────────────────────┐
│              Cognitio Libera Web Client                 │
│      Monaco Editor + Dynamic Theme + Live Timer         │
└───────────────────────────┬─────────────────────────────┘
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────┐
│            FastAPI Execution & AI Service               │
│            (Safe Sandbox Framing + Prompt Eng)          │
└───────────────────────────┬─────────────────────────────┘
                            │ Structured JSON Execution
                            ▼
┌─────────────────────────────────────────────────────────┐
│           Google Gemini 1.5 Flash / Pro API             │
│   • Deterministic Compiler & Interpreter Simulation     │
│   • Test Case Evaluation (Visible & Hidden Cases)       │
│   • Dynamic Algorithmic & MCQ Question Generation       │
│   • Multi-level Socratic Mentorship & Hints             │
└─────────────────────────────────────────────────────────┘
```

By eliminating external sandbox containers (such as Judge0, RapidAPI, or dangerous local `eval()`/`exec()` calls):
- **Zero Third-Party Sandbox Dependencies**: No RapidAPI rate-limits, external queue delays, or vulnerable local subshells.
- **Pedagogical Feedback**: Gemini not only evaluates code output against expected test cases, but also provides rich pedagogical error analysis explaining *why* an output differed or *where* an algorithm failed edge cases.
- **Robust Anti-Cheat Protection**: Hidden test cases are verified internally on the server and are never leaked to client DevTools.

---

## 2. Supported Languages

| Language | Target Interpreter / Compiler Mode | Memory Simulation Cap | Execution Timeout |
| :--- | :--- | :--- | :--- |
| **Python** | Python 3.11+ / CPython standard library | 256 MB | 2.0s |
| **JavaScript** | Node.js v20+ / V8 Engine | 256 MB | 2.0s |
| **C++** | GCC / Clang (C++17 / C++20) | 256 MB | 2.0s |
| **Java** | OpenJDK 21 (HotSpot VM) | 256 MB | 2.0s |

---

## 3. Execution Pipeline

### A. Non-Evaluative Code Runs (`POST /api/v1/execution/run`)
- Executes code on custom standard input (`stdin`).
- Gemini behaves as a deterministic, sandboxed terminal runner.
- Emits stdout, stderr, execution wall-clock time estimate, and memory estimation.
- In offline development mode (when `GEMINI_API_KEY` is not provided), a safe local AST syntax verifier validates Python code structure.

### B. Evaluative Submissions (`POST /api/v1/execution/submit`)
- Evaluates code against the full suite of test cases (both visible and hidden).
- Computes pass/fail verdicts for each individual test case:
  - `Accepted`
  - `Wrong Answer`
  - `Time Limit Exceeded`
  - `Memory Limit Exceeded`
  - `Compilation Error`
  - `Runtime Error`
- Hidden test cases are marked with `is_hidden: true` and their input/output payloads are masked from the client response.
- Awards topic points and user XP upon 100% acceptance.

---

## 4. Dynamic Question Generation Pipeline

Cognitio Libera leverages Gemini to generate infinite practice content on demand:

### Algorithmic Coding Problems (`POST /api/v1/problems/generate`)
- **Parameters**: `topic` (e.g., Arrays, Dynamic Programming), `difficulty` (Easy, Medium, Hard).
- **Gemini Outputs**: Complete problem statement, constraints, starter templates for Python, C++, Java, JS, visible sample test cases, and hidden stress-test cases.
- Validated via `GeminiContentVerifier` before persistence into Supabase PostgreSQL.

### Conceptual MCQs (`POST /api/v1/quiz/generate`)
- **Parameters**: `topic` (e.g., SQL, System Design, Concurrency), `difficulty`, `question_count`.
- **Gemini Outputs**: High-quality multiple-choice questions with 4 options, balanced distractors, and pedagogical answer explanations.
- Correct answer indices are masked when queried by students to prevent cheating.
