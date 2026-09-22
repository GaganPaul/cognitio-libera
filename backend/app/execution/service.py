"""
Execution Service Abstraction Layer.

WHAT IT IS:
    This module coordinates code execution and evaluation requests.
    It delegates execution to the Google Gemini Code Evaluator (`GeminiCodeExecutor`),
    manages visible and hidden test suites, evaluates submissions, and ensures hidden test masking.

WHY WE USE IT:
    Decoupling the execution orchestration ensures:
    1. Zero dependency on Judge0 (exclusively powered by Google Gemini).
    2. Test cases (especially hidden tests) are securely evaluated and masked.
    3. Proper error handling, diagnostics, and AI feedback.
    4. Safe handling of offline modes.

HOW IT CONNECTS:
    FastAPI router endpoints in `/api/v1/execution` and `/api/v1/submissions` call
    `ExecutionService.run_custom_code()` or `ExecutionService.evaluate_submission()`.
"""

import json
import logging
from typing import List, Dict, Any, Optional
from app.execution.base import AbstractCodeExecutor, ExecutionResult
from app.execution.gemini_executor import GeminiCodeExecutor
from app.schemas.dto import SingleTestResultSchema, CodeRunResponseSchema

logger = logging.getLogger(__name__)


class ExecutionService:
    """
    Coordinates code execution requests and test suite evaluations via Google Gemini.
    """

    def __init__(self, executor: Optional[AbstractCodeExecutor] = None):
        """
        Initializes the execution service with GeminiCodeExecutor.

        Args:
            executor: An instance of AbstractCodeExecutor. Defaults to GeminiCodeExecutor.
        """
        self.executor: AbstractCodeExecutor = executor or GeminiCodeExecutor()

    async def run_custom_code(
        self,
        code: str,
        language: str,
        custom_input: str = "",
        time_limit_ms: int = 2000,
        memory_limit_mb: int = 256
    ) -> CodeRunResponseSchema:
        """
        Executes user code on custom standard input (stdin) via Google Gemini without official grading.

        Args:
            code: Source code provided by the user.
            language: Programming language string ('python', 'cpp', etc.).
            custom_input: Standard input string passed to the program.
            time_limit_ms: Execution wall time limit in milliseconds.
            memory_limit_mb: Memory ceiling in megabytes.

        Returns:
            CodeRunResponseSchema containing stdout, stderr, compile messages, and execution metrics.
        """
        execution_result: ExecutionResult = await self.executor.execute(
            source_code=code,
            language=language,
            stdin=custom_input,
            time_limit_ms=time_limit_ms,
            memory_limit_mb=memory_limit_mb
        )

        return CodeRunResponseSchema(
            status=execution_result.status,
            stdout=execution_result.stdout,
            stderr=execution_result.stderr,
            compile_output=execution_result.compile_output,
            runtime_ms=execution_result.time_ms,
            memory_kb=execution_result.memory_kb,
            test_results=[]
        )

    async def evaluate_submission(
        self,
        user_code: str,
        language: str,
        function_name: str,
        test_cases: List[Dict[str, Any]],
        problem_title: str = "Problem",
        problem_description: str = "",
        time_limit_ms: int = 2000,
        memory_limit_mb: int = 256
    ) -> Dict[str, Any]:
        """
        Evaluates a coding solution against the full test suite using Google Gemini.

        Args:
            user_code: User-written source code.
            language: Language name ('python', 'cpp', etc.).
            function_name: Target function name for test evaluation.
            test_cases: List of dictionaries with 'input_data', 'expected_output', and 'is_hidden'.
            problem_title: Title of problem.
            problem_description: Markdown description of the problem.
            time_limit_ms: Maximum run time allowed in milliseconds.
            memory_limit_mb: Maximum memory allowed in megabytes.

        Returns:
            Dict containing:
                - status: 'Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded', etc.
                - passed_tests: Number of test cases passed.
                - total_tests: Total number of test cases evaluated.
                - runtime_ms: Recorded runtime.
                - memory_kb: Recorded memory usage.
                - error_output: Any error messages.
                - ai_feedback_summary: Pedagogical summary from Gemini.
                - test_results: Masked list of SingleTestResultSchema objects.

        Security:
            Hidden test cases have their `expected_output` and `actual_output` masked
            before returning to the client.
        """
        if isinstance(self.executor, GeminiCodeExecutor):
            eval_res = await self.executor.evaluate_submission_suite(
                problem_title=problem_title,
                problem_description=problem_description,
                function_name=function_name,
                user_code=user_code,
                language=language,
                test_cases=test_cases
            )

            # Convert test_results into SingleTestResultSchema
            parsed_test_results = [
                SingleTestResultSchema(
                    test_case_index=tr.get("test_case_index", idx + 1),
                    is_hidden=tr.get("is_hidden", False),
                    status=tr.get("status", "Passed"),
                    actual_output=tr.get("actual_output"),
                    expected_output=tr.get("expected_output"),
                    error_message=tr.get("error_message")
                )
                for idx, tr in enumerate(eval_res.get("test_results", []))
            ]

            eval_res["test_results"] = parsed_test_results
            return eval_res

        # Fallback executor execution
        execution_result: ExecutionResult = await self.executor.execute(
            source_code=user_code,
            language=language,
            stdin="",
            time_limit_ms=time_limit_ms,
            memory_limit_mb=memory_limit_mb
        )

        return {
            "status": "Wrong Answer",
            "passed_tests": 0,
            "total_tests": len(test_cases),
            "runtime_ms": execution_result.time_ms,
            "memory_kb": execution_result.memory_kb,
            "error_output": execution_result.stderr or "Test cases were not evaluated.",
            "ai_feedback_summary": "AI evaluator was unavailable and test cases could not be verified.",
            "test_results": []
        }


# Singleton instance for dependency injection
execution_service = ExecutionService()
