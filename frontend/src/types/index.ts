/**
 * TypeScript Data Contracts for Cognitio Libera.
 *
 * WHAT IT IS:
 *   Contains all typed interfaces for API models, requests, and UI state objects.
 *
 * WHY WE USE IT:
 *   Guarantees end-to-end type safety between the FastAPI schemas and the React components,
 *   preventing runtime null-pointer and property mismatch bugs.
 */

export type ThemeMode = 'light' | 'dark';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  preferred_language: string;
  preferred_difficulty: string;
  theme: ThemeMode;
  created_at: string;
}

export interface UserPreferencesUpdate {
  preferred_language?: string;
  preferred_difficulty?: string;
  theme?: ThemeMode;
  notification_preferences?: Record<string, unknown>;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  category: string;
}

export interface CodingTestCasePublic {
  id: string;
  input_data: string;
  expected_output: string;
  order_index: number;
}

export interface CodingProblemSummary {
  id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic_name?: string;
  category?: string;
  is_solved: boolean;
}

export interface CodingProblemDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic_id?: string;
  topic_name?: string;
  function_name: string;
  starter_code: Record<string, string>;
  constraints: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  time_limit_ms: number;
  memory_limit_mb: number;
  sample_test_cases: CodingTestCasePublic[];
}

export interface SingleTestResult {
  test_case_index: number;
  is_hidden: boolean;
  status: 'Passed' | 'Failed' | 'Error';
  actual_output?: string | null;
  expected_output?: string | null;
  runtime_ms?: number;
  error_message?: string | null;
}

export interface CodeRunResponse {
  status: string;
  stdout: string;
  stderr: string;
  compile_output: string;
  runtime_ms: number;
  memory_kb: number;
  test_results: SingleTestResult[];
}

export interface CodeSubmitResponse {
  submission_id: string;
  status: string;
  passed_tests: number;
  total_tests: number;
  runtime_ms?: number;
  memory_kb?: number;
  error_output?: string | null;
  test_results: SingleTestResult[];
  ai_feedback_summary?: string;
}

export interface QuizOption {
  id: string;
  option_text: string;
  order_index: number;
}

export interface QuizQuestion {
  id: string;
  question_text: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  options: QuizOption[];
}

export interface QuizAttemptResponse {
  is_correct: boolean;
  explanation: string;
  correct_option_id: string;
  user_selected_option_id: string;
}

export interface RecentTest {
  id: string;
  title: string;
  language: string;
  progress_percentage: number;
  category: string;
}

export interface WeakTopic {
  topic_name: string;
  mastery_percentage: number;
}

export interface TestBreakdown {
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  pending_tests: number;
}

export interface DashboardStats {
  welcome_name: string;
  problems_solved: number;
  quiz_attempted: number;
  coding_accuracy_percentage: number;
  quiz_accuracy_percentage: number;
  current_streak_days: number;
  recent_tests: RecentTest[];
  weak_topics: WeakTopic[];
  test_breakdown: TestBreakdown;
}

export interface LeaderboardUser {
  rank: number;
  user_id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  score: number;
  problems_solved: number;
  quiz_score: number;
  streak_days: number;
}

export interface AiMentorChatResponse {
  mentor_reply: string;
  suggested_followups: string[];
}

export interface AiMentorHintResponse {
  hint_level: number;
  hint_title: string;
  hint_text: string;
  has_next_level: boolean;
}

export interface AiCodeReviewResponse {
  summary: string;
  time_complexity: string;
  space_complexity: string;
  strengths: string[];
  improvements: string[];
  edge_case_warnings: string[];
}
