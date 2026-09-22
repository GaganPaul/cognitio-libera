-- ==============================================================================
-- COGNITIO LIBERA — COMPLETE SUPABASE POSTGRESQL SCHEMA & INITIAL DATA MIGRATION
-- Tagline: Practice. Understand. Improve.
-- ==============================================================================
-- INSTRUCTIONS FOR USE IN SUPABASE:
-- 1. Log into your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Open your project -> Navigate to "SQL Editor" in the left sidebar.
-- 3. Create a "New Query", paste this entire script, and click "Run".
-- 4. This script is fully idempotent (safe to run multiple times).
-- ==============================================================================

-- 1. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CREATE SCHEMA TABLES
-- ==============================================================================

-- 2.1 PROFILES (Synced with Supabase auth.users)
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

-- 2.2 USER PREFERENCES (IDE & Theme configurations)
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

-- 2.3 TOPICS (Curriculum categorization)
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

-- 2.4 CODING PROBLEMS
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

-- 2.5 CODING TEST CASES (Visible and Hidden)
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

-- 2.6 CODING SUBMISSIONS
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

-- 2.7 QUIZ QUESTIONS
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

-- 2.8 QUIZ OPTIONS
CREATE TABLE IF NOT EXISTS public.quiz_options (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    question_id VARCHAR(36) NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.9 QUIZ ATTEMPTS
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id VARCHAR(36) NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    selected_option_id VARCHAR(36) REFERENCES public.quiz_options(id) ON DELETE SET NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INTEGER DEFAULT 0,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.10 LEARNING PROGRESS (Topic mastery tracking)
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

-- 2.11 AI FEEDBACK & TUTORING LOGS
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

-- 2.12 PRACTICE SESSIONS
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

-- 2.13 BOOKMARKS
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

-- ==============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_coding_problems_slug ON public.coding_problems(slug);
CREATE INDEX IF NOT EXISTS idx_coding_problems_topic ON public.coding_problems(topic_id);
CREATE INDEX IF NOT EXISTS idx_coding_test_cases_problem ON public.coding_test_cases(problem_id);
CREATE INDEX IF NOT EXISTS idx_coding_submissions_user ON public.coding_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_coding_submissions_problem ON public.coding_submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_topic ON public.quiz_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_category ON public.quiz_questions(category);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question ON public.quiz_options(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user ON public.learning_progress(user_id);

-- ==============================================================================
-- 4. AUTOMATIC SUPABASE AUTH TRIGGER (Creates Profile on auth.users sign-up)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        username,
        full_name,
        avatar_url,
        role,
        total_points,
        current_streak,
        longest_streak,
        created_at,
        updated_at
    )
    VALUES (
        new.id::text,
        new.email,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || new.id::text),
        'student',
        0,
        1,
        1,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_preferences (
        user_id,
        preferred_language,
        theme,
        editor_font_size,
        tab_size
    )
    VALUES (
        new.id::text,
        'python',
        'light',
        14,
        4
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users if auth schema exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    END IF;
END $$;

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
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

-- 5.1 Public Read for Curriculum
CREATE POLICY "Public read topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Public read published problems" ON public.coding_problems FOR SELECT USING (is_published = true);
CREATE POLICY "Public read test cases" ON public.coding_test_cases FOR SELECT USING (true);
CREATE POLICY "Public read quiz questions" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Public read quiz options" ON public.quiz_options FOR SELECT USING (true);
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);

-- 5.2 User Self-Management Policies
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

-- 5.3 Service Role Full Bypass
CREATE POLICY "Service role full access profiles" ON public.profiles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access submissions" ON public.coding_submissions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access progress" ON public.learning_progress FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access feedback" ON public.ai_feedback FOR ALL USING (auth.role() = 'service_role');

-- ==============================================================================
-- 6. SEED DATA CURRICULUM (15 Topics, Problems, and Quizzes)
-- ==============================================================================

-- 6.1 Topics Seed
INSERT INTO public.topics (id, name, slug, category, icon, description, order_index) VALUES
('top_arrays', 'Arrays & Hashing', 'arrays-hashing', 'DSA', 'Layers', 'Contiguous memory arrays, hash tables, and frequency counts', 1),
('top_strings', 'Strings & Parsing', 'strings-parsing', 'DSA', 'Type', 'Two pointers, palindromes, substring indexing, and string manipulation', 2),
('top_binsearch', 'Binary Search', 'binary-search', 'DSA', 'Search', 'Logarithmic division of sorted spaces and boundary finding', 3),
('top_linkedlists', 'Linked Lists', 'linked-lists', 'DSA', 'Link', 'Singly, doubly, and circular pointer chains', 4),
('top_stacks', 'Stacks & Queues', 'stacks-queues', 'DSA', 'ListOrdered', 'LIFO and FIFO data structures, monotonic stacks', 5),
('top_trees', 'Trees & BST', 'trees-bst', 'DSA', 'GitBranch', 'Hierarchical nodes, traversals (inorder, preorder, postorder), and binary search trees', 6),
('top_graphs', 'Graphs & BFS/DFS', 'graphs', 'DSA', 'Network', 'Adjacency lists, breadth-first search, depth-first search, topological sort', 7),
('top_dp', 'Dynamic Programming', 'dynamic-programming', 'DSA', 'Cpu', 'Overlapping subproblems, memoization, and bottom-up tabulation', 8),
('top_dbms', 'Database Management (DBMS & SQL)', 'dbms-sql', 'Core CS', 'Database', 'Relational algebra, ACID properties, indexing, and SQL queries', 9),
('top_os', 'Operating Systems', 'operating-systems', 'Core CS', 'Terminal', 'Processes, threads, virtual memory, paging, scheduling, and deadlocks', 10),
('top_networks', 'Computer Networks', 'computer-networks', 'Core CS', 'Wifi', 'OSI and TCP/IP models, routing, DNS, HTTP, and transport protocols', 11),
('top_oop', 'Object-Oriented Programming (OOP)', 'oop', 'Core CS', 'Box', 'Encapsulation, inheritance, polymorphism, abstraction, and SOLID principles', 12),
('top_python', 'Python Mastery', 'python', 'Languages', 'Code', 'Generators, decorators, memory management, GIL, and idiomatic Python', 13),
('top_web', 'Modern Web & REST APIs', 'web-apis', 'Web Development', 'Globe', 'HTTP methods, status codes, authentication, CORS, and React architecture', 14),
('top_genai', 'Generative AI & LLMs', 'generative-ai', 'AI/ML', 'Sparkles', 'Transformers, attention mechanisms, tokenization, prompt engineering, and RAG', 15)
ON CONFLICT (slug) DO NOTHING;

-- 6.2 Key Coding Problems Seed
INSERT INTO public.coding_problems (id, title, slug, topic_id, difficulty, function_name, description, starter_code, constraints, examples, order_index) VALUES
(
    'prob_01',
    'First and Last Position of an Element in Sorted Array',
    'first-and-last-position',
    'top_binsearch',
    'Medium',
    'first_and_last_position',
    'You have been given a sorted array of ''N'' integers in non-decreasing order. Your task is to find the first and last occurrence of an integer ''target'' in the array.

If the target is not present in the array, return `[-1, -1]`.

You must write an algorithm with `O(log n)` runtime complexity.',
    '{"python": "def first_and_last_position(nums, target):\n    # Write your solution here\n    return [-1, -1]", "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> first_and_last_position(vector<int>& nums, int target) {\n    return {-1, -1};\n}", "java": "class Solution {\n    public int[] firstAndLastPosition(int[] nums, int target) {\n        return new int[]{-1, -1};\n    }\n}", "javascript": "function firstAndLastPosition(nums, target) {\n    return [-1, -1];\n}"}'::jsonb,
    '["0 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9", "nums is a non-decreasing array", "-10^9 <= target <= 10^9"]'::jsonb,
    '[{"input": "nums = [5,7,7,8,8,10], target = 8", "output": "[3, 4]", "explanation": "Target 8 appears starting at index 3 and ending at index 4."}, {"input": "nums = [5,7,7,8,8,10], target = 6", "output": "[-1, -1]", "explanation": "Target 6 is not present in the array."}]'::jsonb,
    1
),
(
    'prob_02',
    'Two Sum',
    'two-sum',
    'top_arrays',
    'Easy',
    'two_sum',
    'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.',
    '{"python": "def two_sum(nums, target):\n    # Write your solution here\n    return []", "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> two_sum(vector<int>& nums, int target) {\n    return {};\n}", "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}", "javascript": "function twoSum(nums, target) {\n    return [];\n}"}'::jsonb,
    '["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9", "Only one valid answer exists."]'::jsonb,
    '[{"input": "nums = [2,7,11,15], target = 9", "output": "[0, 1]", "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."}, {"input": "nums = [3,2,4], target = 6", "output": "[1, 2]", "explanation": "nums[1] + nums[2] == 6."}]'::jsonb,
    2
),
(
    'prob_03',
    'Valid Palindrome',
    'valid-palindrome',
    'top_strings',
    'Easy',
    'is_palindrome',
    'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string `s`, return `true` if it is a palindrome, or `false` otherwise.',
    '{"python": "def is_palindrome(s):\n    # Write your solution here\n    return False", "cpp": "#include <string>\nusing namespace std;\n\nbool is_palindrome(string s) {\n    return false;\n}", "java": "class Solution {\n    public boolean isPalindrome(String s) {\n        return false;\n    }\n}", "javascript": "function isPalindrome(s) {\n    return false;\n}"}'::jsonb,
    '["1 <= s.length <= 2 * 10^5", "s consists only of printable ASCII characters."]'::jsonb,
    '[{"input": "s = \"A man, a plan, a canal: Panama\"", "output": "true", "explanation": "\"amanaplanacanalpanama\" is a palindrome."}, {"input": "s = \"race a car\"", "output": "false", "explanation": "\"raceacar\" is not a palindrome."}]'::jsonb,
    3
)
ON CONFLICT (slug) DO NOTHING;

-- 6.3 Test Cases Seed
INSERT INTO public.coding_test_cases (id, problem_id, input_data, expected_output, is_hidden, order_index) VALUES
('tc_01_1', 'prob_01', '[5, 7, 7, 8, 8, 10], 8', '[3, 4]', FALSE, 1),
('tc_01_2', 'prob_01', '[5, 7, 7, 8, 8, 10], 6', '[-1, -1]', FALSE, 2),
('tc_01_3', 'prob_01', '[], 0', '[-1, -1]', TRUE, 3),
('tc_01_4', 'prob_01', '[1], 1', '[0, 0]', TRUE, 4),
('tc_01_5', 'prob_01', '[2, 2, 2, 2, 2], 2', '[0, 4]', TRUE, 5),

('tc_02_1', 'prob_02', '[2, 7, 11, 15], 9', '[0, 1]', FALSE, 1),
('tc_02_2', 'prob_02', '[3, 2, 4], 6', '[1, 2]', FALSE, 2),
('tc_02_3', 'prob_02', '[3, 3], 6', '[0, 1]', TRUE, 3),
('tc_02_4', 'prob_02', '[-1, -2, -3, -4, -5], -8', '[2, 4]', TRUE, 4),
('tc_02_5', 'prob_02', '[1000, 2000, 3000, 4000], 7000', '[2, 3]', TRUE, 5),

('tc_03_1', 'prob_03', '"A man, a plan, a canal: Panama"', 'true', FALSE, 1),
('tc_03_2', 'prob_03', '"race a car"', 'false', FALSE, 2),
('tc_03_3', 'prob_03', '" "', 'true', TRUE, 3),
('tc_03_4', 'prob_03', '"0P"', 'false', TRUE, 4),
('tc_03_5', 'prob_03', '"ab_a"', 'true', TRUE, 5)
ON CONFLICT (id) DO NOTHING;

-- 6.4 Sample MCQs Seed
INSERT INTO public.quiz_questions (id, topic_id, category, difficulty, question_text, explanation, order_index) VALUES
('q_01', 'top_python', 'Python', 'Easy', 'What is the average time complexity of searching for a key in a Python dictionary (dict)?', 'Python dictionaries are implemented using high-density hash tables with open addressing, providing expected average O(1) time complexity for lookups.', 1),
('q_02', 'top_arrays', 'DSA', 'Easy', 'What is the minimum number of comparisons needed to find the maximum element in an unsorted array of N elements?', 'Any comparison-based algorithm must inspect each element at least once, requiring at least N - 1 comparisons.', 2),
('q_03', 'top_dbms', 'DBMS', 'Medium', 'Which ACID property guarantees that once a transaction has committed, its changes will remain permanent even in the event of a crash?', 'Durability ensures that committed transactions survive subsequent failures through write-ahead logging (WAL).', 3),
('q_04', 'top_os', 'OS', 'Medium', 'What condition is NOT one of Coffman''s four necessary conditions for deadlock to occur?', 'Paging is a memory management scheme, not a condition for deadlock. The four conditions are Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait.', 4),
('q_05', 'top_trees', 'DSA', 'Medium', 'What traversal sequence of a Binary Search Tree (BST) produces nodes in strictly non-decreasing sorted order?', 'An in-order traversal visits the left subtree, the current node, and then the right subtree, producing strictly ascending order in a valid BST.', 5)
ON CONFLICT (id) DO NOTHING;

-- 6.5 Quiz Options Seed
INSERT INTO public.quiz_options (id, question_id, option_text, is_correct, order_index) VALUES
('opt_01_a', 'q_01', 'O(n)', FALSE, 1),
('opt_01_b', 'q_01', 'O(1)', TRUE, 2),
('opt_01_c', 'q_01', 'O(log n)', FALSE, 3),
('opt_01_d', 'q_01', 'O(n log n)', FALSE, 4),

('opt_02_a', 'q_02', 'N - 1', TRUE, 1),
('opt_02_b', 'q_02', 'N', FALSE, 2),
('opt_02_c', 'q_02', 'N / 2', FALSE, 3),
('opt_02_d', 'q_02', 'log N', FALSE, 4),

('opt_03_a', 'q_03', 'Atomicity', FALSE, 1),
('opt_03_b', 'q_03', 'Consistency', FALSE, 2),
('opt_03_c', 'q_03', 'Isolation', FALSE, 3),
('opt_03_d', 'q_03', 'Durability', TRUE, 4),

('opt_04_a', 'q_04', 'Mutual Exclusion', FALSE, 1),
('opt_04_b', 'q_04', 'Circular Wait', FALSE, 2),
('opt_04_c', 'q_04', 'Paging', TRUE, 3),
('opt_04_d', 'q_04', 'No Preemption', FALSE, 4),

('opt_05_a', 'q_05', 'Pre-order Traversal', FALSE, 1),
('opt_05_b', 'q_05', 'In-order Traversal', TRUE, 2),
('opt_05_c', 'q_05', 'Post-order Traversal', FALSE, 3),
('opt_05_d', 'q_05', 'Level-order Traversal', FALSE, 4)
ON CONFLICT (id) DO NOTHING;

-- 6.6 Demo Profile
INSERT INTO public.profiles (id, email, username, full_name, avatar_url, role, total_points, current_streak, longest_streak)
VALUES ('demo_user_01', 'developer@cognitiolibera.com', 'alex_coder', 'Alex Mercer', 'https://api.dicebear.com/7.x/bottts/svg?seed=alex', 'student', 450, 7, 14)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_preferences (id, user_id, preferred_language, theme, editor_font_size, tab_size)
VALUES ('demo_pref_01', 'demo_user_01', 'python', 'light', 14, 4)
ON CONFLICT (user_id) DO NOTHING;

-- ==============================================================================
-- END OF SUPABASE SCHEMA & CURRICULUM MIGRATION
-- ==============================================================================
