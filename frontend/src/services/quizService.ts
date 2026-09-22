/**
 * Quiz Assessment Service.
 *
 * WHAT IT IS:
 *   Handles fetching conceptual MCQs and submitting attempts for server-side evaluation.
 *
 * WHY WE USE IT:
 *   Ensures option correctness validation occurs on the server, maintaining integrity.
 */

import { apiRequest } from '../lib/apiClient';
import { QuizQuestion, QuizAttemptResponse } from '../types';

export const quizService = {
  /**
   * Fetches a set of multiple-choice questions for the quiz assessment.
   *
   * @param category - Optional category filter (e.g. 'DSA', 'Python', 'DBMS').
   * @param limit - Number of questions to retrieve.
   * @returns List of questions without 'is_correct' flags.
   */
  async getQuizQuestions(category?: string, limit: number = 10): Promise<QuizQuestion[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('limit', limit.toString());

    return apiRequest<QuizQuestion[]>(`/quiz/questions?${params.toString()}`);
  },

  /**
   * Submits a user's chosen option for a quiz question to be graded server-side.
   *
   * @param questionId - Question UUID.
   * @param selectedOptionId - Chosen Option UUID.
   * @param timeTakenSeconds - Optional time taken to answer.
   * @returns Grading response with correctness and explanation.
   */
  async submitQuizAttempt(
    questionId: string,
    selectedOptionId: string,
    timeTakenSeconds?: number
  ): Promise<QuizAttemptResponse> {
    return apiRequest<QuizAttemptResponse>('/quiz/attempt', {
      method: 'POST',
      body: JSON.stringify({
        question_id: questionId,
        selected_option_id: selectedOptionId,
        time_taken_seconds: timeTakenSeconds,
      }),
    });
  },

  /**
   * Generates new conceptual MCQs on-demand using Google Gemini.
   *
   * @param category - Category topic.
   * @param difficulty - 'Easy', 'Medium', or 'Hard'.
   * @param count - Question count.
   * @returns List of created questions.
   */
  async generateQuiz(category: string, difficulty: string = 'Medium', count: number = 5): Promise<QuizQuestion[]> {
    return apiRequest<QuizQuestion[]>('/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ category, difficulty, count }),
    });
  }
};

