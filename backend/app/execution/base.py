"""
Abstract Base Code Execution Interface.

WHAT IT IS:
    This module defines the abstract interface and data structures for isolated code execution.

WHY WE USE IT:
    Decoupling the execution engine from the rest of the application ensures that
    FastAPI and services never depend on backend-specific payload quirks.
    It allows switching or mocking execution backends cleanly without touching business logic.

HOW IT CONNECTS:
    `GeminiCodeExecutor` implements `AbstractCodeExecutor`. `ExecutionService` uses this
    interface to run sample inputs and full test suites.
"""

from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class ExecutionResult(BaseModel):
    """
    Standardized result structure returned by any code execution engine.
    """
    status: str = Field(..., description="Normalized execution status: Accepted, Failed, Compilation Error, Runtime Error, Time Limit Exceeded, Memory Limit Exceeded, Execution Service Unavailable")
    stdout: Optional[str] = Field(default="", description="Standard output stream from the executed program")
    stderr: Optional[str] = Field(default="", description="Standard error stream from the executed program")
    compile_output: Optional[str] = Field(default="", description="Compiler or build diagnostic messages")
    time_ms: Optional[int] = Field(default=0, description="Execution wall-clock time in milliseconds")
    memory_kb: Optional[int] = Field(default=0, description="Peak memory consumed in kilobytes")
    exit_code: Optional[int] = Field(default=0, description="Process exit code")
    raw_response: Optional[Dict[str, Any]] = Field(default=None, description="Raw metadata from the underlying engine for diagnostic auditing")


class AbstractCodeExecutor(ABC):
    """
    Abstract Base Class defining the contract for executing user code in an isolated environment.
    """

    @abstractmethod
    async def execute(
        self,
        source_code: str,
        language: str,
        stdin: str = "",
        time_limit_ms: int = 2000,
        memory_limit_mb: int = 256
    ) -> ExecutionResult:
        """
        Submits code to the isolated sandbox for execution.

        Args:
            source_code: Complete source code submitted by user.
            language: Programming language key ('python', 'cpp', 'java', 'javascript').
            stdin: Input passed to standard input (stdin) during execution.
            time_limit_ms: Hard wall-clock execution limit in milliseconds.
            memory_limit_mb: Maximum memory allowed in megabytes.

        Returns:
            ExecutionResult: Normalized execution results including status and output streams.

        Security:
            Implementations must never execute user code directly in the host process.
        """
        pass
