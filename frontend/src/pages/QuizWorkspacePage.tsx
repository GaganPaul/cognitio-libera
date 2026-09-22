/**
 * Quiz Assessment Workspace Page.
 *
 * WHAT IT IS:
 *   The conceptual MCQ assessment environment faithfully replicating reference Image 2.
 *
 * WHY WE USE IT:
 *   Delivers 10 conceptual computer science questions with radio option selection, countdown timer,
 *   server-side grading, and detailed explanations upon completion.
 *
 * REPLACES:
 *   Replaces 'TCS Quiz Competition Questions' with official Cognitio Libera branding.
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  HelpCircle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { quizService } from '../services/quizService';
import { QuizAttemptResponse } from '../types';

const CATEGORY_MAP: Record<string, string> = {
  python: 'Python Mastery',
  dsa: 'Data Structures & Algorithms',
  dbms: 'Database Systems & SQL',
  os: 'Operating Systems & Concurrency',
  networks: 'Computer Networks',
  'generative-ai': 'Generative AI & LLMs',
};

const getCategoryDisplayTitle = (cat?: string) => {
  if (!cat) return 'General Computer Science Assessment';
  const parts = cat.split(',').map((s) => s.trim().toLowerCase());
  const resolved = parts.map((p) => CATEGORY_MAP[p] || (p.charAt(0).toUpperCase() + p.slice(1)));
  return `${resolved.join(' & ')} Assessment`;
};

export const QuizWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || undefined;

  // Fetch questions for this category
  const { data: questions, isLoading, refetch } = useQuery({
    queryKey: ['quizQuestions', category],
    queryFn: () => quizService.getQuizQuestions(category, 10),
  });

  // Track selected options: { [questionId]: selectedOptionId }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  // Track graded results after submission: { [questionId]: QuizAttemptResponse }
  const [gradedResults, setGradedResults] = useState<Record<string, QuizAttemptResponse>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isGeneratingFresh, setIsGeneratingFresh] = useState(false);

  // Active 60-minute countdown timer
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isTimerActive, setIsTimerActive] = useState(true);

  React.useEffect(() => {
    // Reset answers when category changes
    setSelectedAnswers({});
    setGradedResults({});
    setIsCompleted(false);
    setTimeLeft(3600);
  }, [category]);

  React.useEffect(() => {
    if (!isTimerActive || isCompleted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerActive, isCompleted]);

  const formatCountdown = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Select an option
  const handleSelectOption = (questionId: string, optionId: string) => {
    if (isCompleted) return; // locked after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Reset current attempt
  const handleResetAttempt = () => {
    setSelectedAnswers({});
    setGradedResults({});
    setIsCompleted(false);
    setTimeLeft(3600);
  };

  // Switch category
  const handleSwitchCategory = (newCat?: string) => {
    if (newCat) {
      navigate(`/practice/quiz?category=${encodeURIComponent(newCat)}`);
    } else {
      navigate('/practice/quiz');
    }
  };

  // Generate fresh questions on demand with Gemini
  const handleGenerateFreshQuestions = async () => {
    setIsGeneratingFresh(true);
    try {
      const topicName = category ? getCategoryDisplayTitle(category).replace(' Assessment', '') : 'Computer Science';
      await quizService.generateQuiz(topicName, 'Medium', 5);
      await queryClient.invalidateQueries({ queryKey: ['quizQuestions'] });
      await refetch();
      handleResetAttempt();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to generate fresh questions.');
    } finally {
      setIsGeneratingFresh(false);
    }
  };

  // Submit all answers to backend for server-side evaluation
  const handleSubmitQuiz = async () => {
    if (!questions || questions.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    const resultsMap: Record<string, QuizAttemptResponse> = {};
    let correctCount = 0;

    try {
      // Evaluate each answered question server-side
      for (const q of questions) {
        const selectedOpt = selectedAnswers[q.id];
        if (selectedOpt) {
          const evalRes = await quizService.submitQuizAttempt(q.id, selectedOpt, 30);
          resultsMap[q.id] = evalRes;
          if (evalRes.is_correct) correctCount += 1;
        }
      }

      setGradedResults(resultsMap);
      setIsCompleted(true);

      // Celebrate if scored > 60%
      if (correctCount >= Math.ceil(questions.length * 0.6)) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Preparing assessment questions...</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6" />
        </div>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
          No questions found for {getCategoryDisplayTitle(category)}.
        </p>
        <p className="text-xs text-slate-500">
          Synthesize 5 brand-new non-repeating questions right now with Gemini.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleGenerateFreshQuestions}
            disabled={isGeneratingFresh}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-500/20 hover:scale-105 transition-all flex items-center gap-2"
          >
            {isGeneratingFresh ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Questions Now</span>
              </>
            )}
          </button>
          <button
            onClick={() => navigate('/practice')}
            className="px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold"
          >
            Return to Arena
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = Object.values(gradedResults).filter((r) => r.is_correct).length;

  return (
    <div className="min-h-screen bg-[#F8F9FE] dark:bg-[#0c0e15] flex flex-col">
      {/* Top Header matching Reference Image 2 */}
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#12141e] border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/practice')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            title="Back to catalog"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
              CL
            </div>
            <div>
              <h2 className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white leading-tight">
                {getCategoryDisplayTitle(category)}
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">
                {questions.length} Non-Repeating Conceptual Questions
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Generate Fresh Action */}
          <button
            onClick={handleGenerateFreshQuestions}
            disabled={isGeneratingFresh}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors disabled:opacity-50"
          >
            {isGeneratingFresh ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            )}
            <span>Generate Fresh</span>
          </button>

          {/* Quiz Timer matching Image 2 top-right */}
          <button
            onClick={() => setIsTimerActive(!isTimerActive)}
            title={isTimerActive ? 'Click to pause timer' : 'Click to resume timer'}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-mono font-bold text-sm tracking-wider border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
          >
            <Clock className={`w-4 h-4 ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-purple-600 dark:text-purple-400'}`} />
            <span className={timeLeft < 300 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : ''}>
              {formatCountdown(timeLeft)}
            </span>
          </button>
        </div>
      </header>

      {/* Main Section Layout matching Image 2 */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Vertical Section Selector */}
        <div className="w-20 sm:w-28 flex-shrink-0 bg-[#1e212d] text-white flex flex-col py-6 border-r border-slate-800 items-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-6">
            Section
          </span>

          <button className="w-full py-3 text-xs font-bold text-purple-400 border-l-4 border-purple-500 bg-purple-950/40 text-center transition-colors">
            MCQ
          </button>

          <button
            onClick={() => navigate('/practice/coding/first-and-last-position')}
            className="w-full py-3 text-xs font-semibold text-slate-400 hover:text-white transition-colors text-center"
          >
            Programming
          </button>
        </div>

        {/* Quiz Content Pane */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
          {/* Quick Topic Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pb-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
              Topic:
            </span>
            {[
              { slug: '', label: 'All Topics' },
              { slug: 'python', label: 'Python' },
              { slug: 'dsa', label: 'DSA' },
              { slug: 'dbms', label: 'DBMS' },
              { slug: 'os', label: 'OS' },
              { slug: 'networks', label: 'Networks' },
              { slug: 'generative-ai', label: 'GenAI' },
            ].map((t) => {
              const isActive = (!category && !t.slug) || (category?.toLowerCase() === t.slug);
              return (
                <button
                  key={t.slug}
                  onClick={() => handleSwitchCategory(t.slug)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-purple-300'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Assessment Title Banner */}
          <div className="text-center pb-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              {getCategoryDisplayTitle(category)}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Select one correct answer for each question. Answers are evaluated server-side upon submission.
            </p>
          </div>

          {/* Results Summary Box after Submission */}
          {isCompleted && (
            <div className="glass-card p-6 md:p-8 rounded-3xl border-purple-300 dark:border-purple-800 bg-gradient-to-r from-purple-50/80 to-indigo-50/50 dark:from-purple-950/30 dark:to-indigo-950/20 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Assessment Complete!
              </h3>
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                You scored {correctCount} out of {questions.length} ({Math.round((correctCount / questions.length) * 100)}%)
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Review your responses below. Detailed explanations have been unlocked for each question.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleResetAttempt}
                  className="px-5 py-2 rounded-full bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-50 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>
                <button
                  onClick={handleGenerateFreshQuestions}
                  disabled={isGeneratingFresh}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-500/25 hover:scale-105 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isGeneratingFresh ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Fresh Questions</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Question Cards (1 to 10 Questions matching Image 2) */}
          <div className="space-y-6">
            {questions.map((question, qIdx) => {
              const grading = gradedResults[question.id];
              const isAnswered = !!selectedAnswers[question.id];

              return (
                <div
                  key={question.id}
                  className={`glass-card p-6 rounded-2xl border transition-all ${
                    isCompleted
                      ? grading?.is_correct
                        ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20'
                        : 'border-rose-300 dark:border-rose-800/80 bg-rose-50/20'
                      : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="space-y-1.5">
                      {question.category && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold border border-purple-200/60 dark:border-purple-800/40">
                          {question.category}
                        </span>
                      )}
                      <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {qIdx + 1}. {question.question_text}
                      </h3>
                    </div>
                    {isCompleted && grading && (
                      <span className="flex-shrink-0">
                        {grading.is_correct ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-500" />
                        )}
                      </span>
                    )}
                  </div>

                  {/* 4 Options Grid (2x2 layout matching Image 2) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {question.options.map((opt) => {
                      const isSelected = selectedAnswers[question.id] === opt.id;
                      const isCorrectAnswer = isCompleted && grading?.correct_option_id === opt.id;
                      const isWrongSelection = isCompleted && isSelected && !grading?.is_correct;

                      let optStyles = 'border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 bg-white/70 dark:bg-slate-800/60';
                      if (isSelected && !isCompleted) {
                        optStyles = 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 shadow-sm';
                      } else if (isCorrectAnswer) {
                        optStyles = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold';
                      } else if (isWrongSelection) {
                        optStyles = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 line-through';
                      }

                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleSelectOption(question.id, opt.id)}
                          className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer text-xs md:text-sm transition-all ${optStyles}`}
                        >
                          {/* Custom Radio Icon */}
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? 'border-purple-600 bg-purple-600'
                                : 'border-slate-400 bg-transparent'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>

                          <span className="flex-1">{opt.option_text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Post-submission Detailed Explanation */}
                  {isCompleted && grading && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                        <span>Explanation:</span>
                      </span>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {grading.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Action Bar (Matching Image 2: Save Answers & Next Section / Submit) */}
          <div className="flex items-center justify-between pt-6 pb-12">
            <button
              onClick={() => {
                alert(`Saved ${answeredCount} answered questions locally.`);
              }}
              className="px-8 py-3 rounded-full bg-white dark:bg-slate-800 border-2 border-purple-500 text-purple-600 dark:text-purple-400 font-bold text-sm hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all shadow-sm"
            >
              Save Answers
            </button>

            {isCompleted ? (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleResetAttempt}
                  className="px-6 py-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-purple-600" />
                  <span>Retake Quiz</span>
                </button>
                <button
                  onClick={() => navigate('/practice/coding/first-and-last-position')}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-purple-500/25 hover:scale-105 transition-all flex items-center gap-2"
                >
                  <span>Proceed to Programming Section</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting || answeredCount === 0}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-purple-500/25 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Evaluating...' : 'Submit Assessment'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
