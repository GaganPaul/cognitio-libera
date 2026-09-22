-- ==============================================================================
-- COGNITIO LIBERA — INITIAL SUPABASE MIGRATION
-- ==============================================================================
-- Run via: supabase db push or execute in Supabase SQL Editor
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url VARCHAR(512),
    role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'admin', 'moderator')),
    total_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER PREFERENCES
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    preferred_language VARCHAR(50) DEFAULT 'python',
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    editor_font_size INTEGER DEFAULT 14,
    tab_size INTEGER DEFAULT 4,
    vim_mode BOOLEAN DEFAULT FALSE,
    ai_verbosity VARCHAR(20) DEFAULT 'moderate' CHECK (ai_verbosity IN ('concise', 'moderate', 'detailed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TOPICS
CREATE TABLE IF NOT EXISTS public.topics (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'code',
    category VARCHAR(50) DEFAULT 'dsa',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CODING PROBLEMS
CREATE TABLE IF NOT EXISTS public.coding_problems (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    topic_id VARCHAR(36) REFERENCES public.topics(id) ON DELETE SET NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'easy', 'medium', 'hard')),
    description TEXT NOT NULL,
    function_name VARCHAR(100) NOT NULL DEFAULT 'solution',
    starter_code JSONB NOT NULL DEFAULT '{}'::jsonb,
    constraints JSONB DEFAULT '[]'::jsonb,
    examples JSONB DEFAULT '[]'::jsonb,
    time_limit_ms INTEGER DEFAULT 2000,
    memory_limit_kb INTEGER DEFAULT 256000,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CODING TEST CASES
CREATE TABLE IF NOT EXISTS public.coding_test_cases (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    problem_id VARCHAR(36) NOT NULL REFERENCES public.coding_problems(id) ON DELETE CASCADE,
    input_data TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CODING SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.coding_submissions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    problem_id VARCHAR(36) NOT NULL REFERENCES public.coding_problems(id) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL,
    code TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    runtime_ms FLOAT DEFAULT 0.0,
    memory_kb INTEGER DEFAULT 0,
    passed_test_cases INTEGER DEFAULT 0,
    total_test_cases INTEGER DEFAULT 0,
    error_message TEXT,
    ai_feedback_summary TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QUIZ QUESTIONS
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    topic_id VARCHAR(36) REFERENCES public.topics(id) ON DELETE SET NULL,
    category VARCHAR(100) DEFAULT 'General CS',
    difficulty VARCHAR(20) DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'easy', 'medium', 'hard')),
    question_text TEXT NOT NULL,
    code_snippet TEXT,
    explanation TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QUIZ OPTIONS
CREATE TABLE IF NOT EXISTS public.quiz_options (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    question_id VARCHAR(36) NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QUIZ ATTEMPTS
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id VARCHAR(36) NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    selected_option_id VARCHAR(36) REFERENCES public.quiz_options(id) ON DELETE SET NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INTEGER DEFAULT 0,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LEARNING PROGRESS
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id VARCHAR(36) NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    mastery_percentage FLOAT DEFAULT 0.0,
    problems_solved INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0,
    last_practiced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, topic_id)
);

-- AI FEEDBACK
CREATE TABLE IF NOT EXISTS public.ai_feedback (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    problem_id VARCHAR(36) REFERENCES public.coding_problems(id) ON DELETE CASCADE,
    feedback_type VARCHAR(50) NOT NULL,
    prompt_tokens INTEGER DEFAULT 0,
    response_tokens INTEGER DEFAULT 0,
    feedback_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PRACTICE SESSIONS
CREATE TABLE IF NOT EXISTS public.practice_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL DEFAULT 'coding',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER DEFAULT 0,
    items_attempted INTEGER DEFAULT 0,
    items_completed INTEGER DEFAULT 0
);

-- BOOKMARKS
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    problem_id VARCHAR(36) REFERENCES public.coding_problems(id) ON DELETE CASCADE,
    quiz_question_id VARCHAR(36) REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, problem_id),
    UNIQUE(user_id, quiz_question_id)
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Public read published problems" ON public.coding_problems FOR SELECT USING (is_published = true);
CREATE POLICY "Public read test cases" ON public.coding_test_cases FOR SELECT USING (true);
CREATE POLICY "Public read quiz questions" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Public read quiz options" ON public.quiz_options FOR SELECT USING (true);
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid()::text = id);
CREATE POLICY "Users can manage own preferences" ON public.user_preferences FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users can view own submissions" ON public.coding_submissions FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own submissions" ON public.coding_submissions FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can view own quiz attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own quiz attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can manage own progress" ON public.learning_progress FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users can view own AI feedback" ON public.ai_feedback FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can manage own practice sessions" ON public.practice_sessions FOR ALL USING (auth.uid()::text = user_id);
