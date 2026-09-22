/**
 * Problem Catalog and Detail Service.
 *
 * WHAT IT IS:
 *   Handles fetching problem lists, filtering by difficulty/topic, and loading problem details.
 *
 * WHY WE USE IT:
 *   Provides clean type-safe methods for TanStack Query hooks.
 */

import { apiRequest } from '../lib/apiClient';
import { CodingProblemSummary, CodingProblemDetail } from '../types';

export const problemService = {
  /**
   * Fetches the catalog list of published coding problems with user solved status.
   *
   * @param filters - Optional difficulty and topic filters.
   * @returns Array of problem summaries.
   */
  async getProblems(filters: { difficulty?: string; topic?: string } = {}): Promise<CodingProblemSummary[]> {
    const params = new URLSearchParams();
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.topic) params.append('topic', filters.topic);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<CodingProblemSummary[]>(`/problems${queryStr}`);
  },

  /**
   * Fetches full problem definition, starter code, and visible test examples for the Monaco editor.
   *
   * @param problemId - Problem UUID or slug.
   * @returns Detailed problem information.
   *
   * SECURITY:
   *   The backend strips hidden test cases; only public sample cases are returned.
   */
  async getProblemById(problemId: string): Promise<CodingProblemDetail> {
    return apiRequest<CodingProblemDetail>(`/problems/${problemId}`);
  },

  /**
   * Retrieves the next recommended problem based on user mastery.
   *
   * @returns CodingProblemDetail object.
   */
  async getNextProblem(): Promise<CodingProblemDetail> {
    return apiRequest<CodingProblemDetail>('/problems/next');
  },

  /**
   * Generates a brand-new coding problem on-demand using Google Gemini.
   *
   * @param topic - Focus concept or algorithm.
   * @param difficulty - 'Easy', 'Medium', or 'Hard'.
   * @param language - Target language.
   * @returns Created CodingProblemDetail object.
   */
  async generateProblem(topic: string, difficulty: string = 'Medium', language: string = 'python'): Promise<CodingProblemDetail> {
    return apiRequest<CodingProblemDetail>('/problems/generate', {
      method: 'POST',
      body: JSON.stringify({ topic, difficulty, language }),
    });
  }
};

