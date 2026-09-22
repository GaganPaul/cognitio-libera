/**
 * Practice Arena & Curriculum Catalog Page.
 *
 * WHAT IT IS:
 *   The central hub for selecting coding challenges, conceptual quizzes,
 *   smart practice recommendations, and generating on-demand challenges with Google Gemini.
 *
 * WHY WE USE IT:
 *   Provides intuitive topic and difficulty filtering with live solved/unsolved status indicators.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Code2,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Circle,
  Filter,
  ArrowRight,
  Timer,
  ChevronRight,
  Search,
  Loader2,
  PlusCircle,
  X,
  Wand2,
} from 'lucide-react';
import { problemService } from '../services/problemService';
import { quizService } from '../services/quizService';
import { CodingProblemSummary } from '../types';

export const PracticePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'coding' | 'quiz' | 'smart' | 'interview'>('coding');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quiz Topic Selection & AI Generation State
  const [selectedQuizTopics, setSelectedQuizTopics] = useState<string[]>([]);
  const [generatingTopicSlug, setGeneratingTopicSlug] = useState<string | null>(null);
  const [isGeneratingCustomQuiz, setIsGeneratingCustomQuiz] = useState(false);

  // AI Generation Modal State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [genType, setGenType] = useState<'problem' | 'quiz'>('problem');
  const [genTopic, setGenTopic] = useState('');
  const [genDifficulty, setGenDifficulty] = useState('Medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Fetch coding problems
  const { data: problems, isLoading: problemsLoading } = useQuery({
    queryKey: ['codingProblems', selectedDifficulty],
    queryFn: () => problemService.getProblems({ difficulty: selectedDifficulty || undefined }),
  });

  const filteredProblems = (problems || []).filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.topic_name && p.topic_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const quizCategories = [
    { name: 'Python Mastery', slug: 'python', questions: '10 Questions', desc: 'GIL, generators, decorators, memory management' },
    { name: 'Data Structures & Algorithms', slug: 'dsa', questions: '15 Questions', desc: 'Stacks, Queues, Trees, Graphs, Complexity' },
    { name: 'Database Systems & SQL', slug: 'dbms', questions: '10 Questions', desc: 'ACID transactions, normalization, indexing' },
    { name: 'Operating Systems & Concurrency', slug: 'os', questions: '10 Questions', desc: 'Processes, threads, virtual memory, deadlocks' },
    { name: 'Computer Networks', slug: 'networks', questions: '10 Questions', desc: 'TCP/IP, OSI layers, routing, HTTP protocols' },
    { name: 'Generative AI & LLMs', slug: 'generative-ai', questions: '10 Questions', desc: 'Transformers, attention, RAG, prompt engineering' },
  ];

  const toggleQuizTopic = (slug: string) => {
    setSelectedQuizTopics((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleStartCustomTopicQuiz = () => {
    const catQuery = selectedQuizTopics.length > 0 ? selectedQuizTopics.join(',') : '';
    navigate(`/practice/quiz${catQuery ? `?category=${encodeURIComponent(catQuery)}` : ''}`);
  };

  const handleGenerateAndStartTopicQuiz = async (topicSlug?: string) => {
    const targetSlug = topicSlug || (selectedQuizTopics.length > 0 ? selectedQuizTopics.join(',') : 'General Computer Science');
    if (topicSlug) {
      setGeneratingTopicSlug(topicSlug);
    } else {
      setIsGeneratingCustomQuiz(true);
    }

    try {
      const found = quizCategories.find((c) => c.slug === targetSlug);
      const categoryName = found ? found.name : targetSlug;
      await quizService.generateQuiz(categoryName, 'Medium', 5);
      await queryClient.invalidateQueries({ queryKey: ['quizQuestions'] });
      navigate(`/practice/quiz?category=${encodeURIComponent(targetSlug)}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to generate quiz questions with Gemini.');
    } finally {
      setGeneratingTopicSlug(null);
      setIsGeneratingCustomQuiz(false);
    }
  };

  // Handle Gemini on-demand generation
  const handleGenerateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTopic.trim()) return;

    setIsGenerating(true);
    setGenError(null);

    try {
      if (genType === 'problem') {
        const created = await problemService.generateProblem(genTopic, genDifficulty);
        await queryClient.invalidateQueries({ queryKey: ['codingProblems'] });
        setIsGenerateModalOpen(false);
        setGenTopic('');
        navigate(`/practice/coding/${created.slug || created.id}`);
      } else {
        await quizService.generateQuiz(genTopic, genDifficulty, 5);
        await queryClient.invalidateQueries({ queryKey: ['quizQuestions'] });
        setIsGenerateModalOpen(false);
        setGenTopic('');
        navigate(`/practice/quiz?category=${encodeURIComponent(genTopic)}`);
      }
    } catch (err: unknown) {
      setGenError(err instanceof Error ? err.message : 'Failed to generate content with Gemini.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="glass-card p-6 md:p-8 rounded-3xl bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-transparent border-purple-200/60 dark:border-purple-900/40 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Practice Arena
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Master algorithms with real-time Google Gemini AI code evaluation or test your CS theory with conceptual quizzes.
            </p>
          </div>

          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="self-start md:self-center px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs md:text-sm shadow-md shadow-purple-500/25 hover:scale-105 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate with Gemini</span>
          </button>
        </div>

        {/* Practice Mode Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <button
            onClick={() => setActiveTab('coding')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all ${
              activeTab === 'coding'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 scale-[1.02]'
                : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Coding Challenges</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all ${
              activeTab === 'quiz'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 scale-[1.02]'
                : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Conceptual Quizzes</span>
          </button>

          <button
            onClick={() => setActiveTab('smart')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all ${
              activeTab === 'smart'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 scale-[1.02]'
                : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Smart Practice</span>
          </button>

          <button
            onClick={() => setActiveTab('interview')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all ${
              activeTab === 'interview'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 scale-[1.02]'
                : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>Interview Mode</span>
          </button>
        </div>
      </div>

      {/* CODING CHALLENGES TAB */}
      {activeTab === 'coding' && (
        <div className="space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search problem title or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Problem List */}
          {problemsLoading ? (
            <div className="p-12 text-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
              <p className="text-sm">Loading problem catalog...</p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProblems.map((problem, idx) => {
                  const diffColor =
                    problem.difficulty.toLowerCase() === 'easy'
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200'
                      : problem.difficulty.toLowerCase() === 'medium'
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200'
                      : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200';

                  return (
                    <div
                      key={problem.id}
                      onClick={() => navigate(`/practice/coding/${problem.slug || problem.id}`)}
                      className="p-5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-slate-400">
                          {problem.is_solved ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-semibold text-slate-400">
                              #{idx + 1}
                            </span>
                            <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {problem.title}
                            </h4>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 inline-block">
                            {problem.topic_name || 'DSA'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${diffColor}`}>
                          {problem.difficulty}
                        </span>

                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 group-hover:bg-purple-600 group-hover:text-white text-slate-400 transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* QUIZ TAB */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          {/* Interactive Multi-Topic Selector & Generator Banner */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-purple-200/80 dark:border-purple-900/40 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-transparent space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
                    Interactive Topic Builder
                  </span>
                  <span className="text-xs text-slate-400">Powered by Gemini 3.5 Flash Lite</span>
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
                  Select Topics for Your Custom Quiz
                </h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Select one or more topics below to launch a tailored assessment, or generate brand new non-repeating questions on-demand.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleStartCustomTopicQuiz}
                  className="px-5 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs md:text-sm shadow-md hover:scale-[1.02] transition-transform flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-purple-400 dark:text-purple-600" />
                  <span>
                    Start Quiz {selectedQuizTopics.length > 0 ? `(${selectedQuizTopics.length} Selected)` : '(All Topics)'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleGenerateAndStartTopicQuiz()}
                  disabled={isGeneratingCustomQuiz}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs md:text-sm shadow-md shadow-purple-500/25 hover:scale-[1.02] transition-transform flex items-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingCustomQuiz ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Fresh Questions</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Topic Selection Chips */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
                Filter Topics:
              </span>
              {quizCategories.map((cat) => {
                const isSelected = selectedQuizTopics.includes(cat.slug);
                return (
                  <button
                    key={cat.slug}
                    onClick={() => toggleQuizTopic(cat.slug)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20 scale-[1.03]'
                        : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-purple-500'
                      }`}
                    />
                    <span>{cat.name}</span>
                  </button>
                );
              })}

              {selectedQuizTopics.length > 0 && (
                <button
                  onClick={() => setSelectedQuizTopics([])}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>

          {/* Core Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizCategories.map((cat) => {
              const isSelected = selectedQuizTopics.includes(cat.slug);
              const isCatGenerating = generatingTopicSlug === cat.slug;

              return (
                <div
                  key={cat.slug}
                  className={`glass-card p-6 rounded-3xl flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/10'
                      : 'hover:border-purple-300 dark:hover:border-purple-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold">
                        {cat.questions}
                      </span>
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <button
                      onClick={() => navigate(`/practice/quiz?category=${cat.slug}`)}
                      className="w-full py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-1.5"
                    >
                      <span>Start Assessment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleGenerateAndStartTopicQuiz(cat.slug)}
                      disabled={isCatGenerating}
                      className="w-full py-2 rounded-full bg-white dark:bg-slate-800/80 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 font-semibold text-xs hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isCatGenerating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>Generate Fresh with Gemini</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SMART PRACTICE TAB */}
      {activeTab === 'smart' && (
        <div className="glass-card p-8 rounded-3xl text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            Smart Adaptive Practice
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Our recommendation engine analyzes your topic mastery percentages and recent submissions to serve challenges targeting your weak spots.
          </p>
          <button
            onClick={async () => {
              const nextProb = await problemService.getNextProblem();
              if (nextProb) navigate(`/practice/coding/${nextProb.slug || nextProb.id}`);
            }}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-purple-500/25 hover:scale-105 transition-all"
          >
            Launch Recommended Problem
          </button>
        </div>
      )}

      {/* INTERVIEW MODE TAB */}
      {activeTab === 'interview' && (
        <div className="glass-card p-8 rounded-3xl text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto">
            <Timer className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            Timed Technical Interview Mode
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Experience realistic technical interviews with 10 activities: 5 algorithmic challenges and 5 system design/CS quizzes within a 60-minute countdown timer.
          </p>
          <button
            onClick={() => navigate('/practice/quiz')}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-purple-500/25 hover:scale-105 transition-all"
          >
            Begin 60-Minute Assessment
          </button>
        </div>
      )}

      {/* GEMINI CONTENT GENERATION MODAL */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141622] w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border border-purple-200/80 dark:border-purple-900/40 relative animate-scaleUp">
            <button
              onClick={() => setIsGenerateModalOpen(false)}
              className="absolute top-6 right-6 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Generate with Gemini
                </h3>
                <p className="text-xs text-slate-400">
                  Synthesize new algorithmic problems or quiz sets on demand.
                </p>
              </div>
            </div>

            {genError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
                {genError}
              </div>
            )}

            <form onSubmit={handleGenerateContent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Content Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGenType('problem')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      genType === 'problem'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Coding Problem
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenType('quiz')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      genType === 'quiz'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Quiz Questions
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Concept / Topic
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sliding Window, Trie, System Design, SQL"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Difficulty Level
                </label>
                <select
                  value={genDifficulty}
                  onChange={(e) => setGenDifficulty(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isGenerating || !genTopic.trim()}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-purple-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gemini is synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Content</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
