/**
 * Execution and Code Submission Service.
 *
 * WHAT IT IS:
 *   Handles executing custom inputs and officially submitting code solutions evaluated via Google Gemini.
 *
 * WHY WE USE IT:
 *   Separates non-evaluative test runs from graded submissions and submission history.
 */

import { apiRequest } from '../lib/apiClient';
import { CodeRunResponse, CodeSubmitResponse } from '../types';

export const submissionService = {
  /**
   * Executes source code with custom standard input (stdin) via Google Gemini without saving a submission.
   *
   * @param code - Source code string.
   * @param language - Target language (python, cpp, java, javascript).
   * @param customInput - Standard input string.
   * @returns Immediate execution results from Google Gemini.
   */
  async runCode(code: string, language: string, customInput: string = ''): Promise<CodeRunResponse> {
    return apiRequest<CodeRunResponse>('/execution/run', {
      method: 'POST',
      body: JSON.stringify({
        code,
        language,
        custom_input: customInput,
      }),
    });
  },

  /**
   * Submits code to be evaluated against the complete test suite (visible + hidden) via Google Gemini.
   *
   * @param problemId - Problem UUID.
   * @param language - Programming language.
   * @param code - Complete student solution.
   * @returns Official submission evaluation and test case results.
   */
  async submitCode(problemId: string, language: string, code: string): Promise<CodeSubmitResponse> {
    return apiRequest<CodeSubmitResponse>('/execution/submit', {
      method: 'POST',
      body: JSON.stringify({
        problem_id: problemId,
        language,
        code,
      }),
    });
  },

  /**
   * Retrieves past submissions for the current user.
   *
   * @param problemId - Optional problem filter.
   * @returns List of submissions.
   */
  async getSubmissions(problemId?: string): Promise<unknown[]> {
    const endpoint = problemId ? `/submissions?problem_id=${problemId}` : '/submissions';
    return apiRequest<unknown[]>(endpoint);
  }
};
