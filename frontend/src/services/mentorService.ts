/**
 * Google Gemini AI Mentor Service.
 *
 * WHAT IT IS:
 *   Handles AI mentor interactions: interactive chat, progressive hints without spoilers,
 *   and structured post-execution code review.
 *
 * WHY WE USE IT:
 *   Exclusively interfaces with Google Gemini on the backend to provide educational guidance.
 */

import { apiRequest } from '../lib/apiClient';
import {
  AiMentorChatResponse,
  AiMentorHintResponse,
  AiCodeReviewResponse
} from '../types';

export const mentorService = {
  /**
   * Sends a user query to the Gemini AI Mentor within a problem and code context.
   *
   * @param params - Problem context, student code, message, and chat history.
   * @returns AI Mentor reply with suggested follow-up questions.
   */
  async chatWithMentor(params: {
    problemId?: string;
    userCode?: string;
    language?: string;
    userMessage: string;
    chatHistory?: Array<{ sender: string; text: string }>;
  }): Promise<AiMentorChatResponse> {
    return apiRequest<AiMentorChatResponse>('/mentor/chat', {
      method: 'POST',
      body: JSON.stringify({
        problem_id: params.problemId,
        user_code: params.userCode,
        language: params.language,
        user_message: params.userMessage,
        chat_history: params.chatHistory,
      }),
    });
  },

  /**
   * Requests a progressive hint without revealing the complete solution.
   *
   * @param problemId - Problem UUID.
   * @param hintLevel - 1 (Intuition), 2 (Strategy), 3 (Blueprint).
   * @param userCode - Current code in editor.
   * @param language - Programming language.
   * @returns Progressive hint details.
   */
  async getProgressiveHint(
    problemId: string,
    hintLevel: number,
    userCode?: string,
    language: string = 'python'
  ): Promise<AiMentorHintResponse> {
    return apiRequest<AiMentorHintResponse>('/mentor/hint', {
      method: 'POST',
      body: JSON.stringify({
        problem_id: problemId,
        hint_level: hintLevel,
        user_code: userCode,
        language: language,
      }),
    });
  },

  /**
   * Generates a structured educational code review after execution.
   *
   * @param params - Problem ID, language, code, and submission status.
   * @returns Structured review with time/space complexity analysis.
   */
  async reviewCode(params: {
    problemId: string;
    language: string;
    code: string;
    submissionStatus: string;
  }): Promise<AiCodeReviewResponse> {
    return apiRequest<AiCodeReviewResponse>('/mentor/review', {
      method: 'POST',
      body: JSON.stringify({
        problem_id: params.problemId,
        language: params.language,
        code: params.code,
        submission_status: params.submissionStatus,
      }),
    });
  }
};
