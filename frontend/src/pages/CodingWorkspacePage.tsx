/**
 * Coding Practice Workspace Page.
 *
 * WHAT IT IS:
 *   The core LeetCode-style algorithmic coding workspace faithfully replicating reference Image 1.
 *
 * WHY WE USE IT:
 *   Enables students to read problem requirements, write code in Monaco Editor, execute custom
 *   stdin via Google Gemini, submit against hidden test suites, and receive progressive hints from Google Gemini.
 *
 * REPLACES:
 *   Replaces 'TCS iON' and sample company test names with official Cognitio Libera branding.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import {
  Clock,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sparkles,
  Play,
  Pause,
  Send,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Flag,
  Award,
  Trophy,
  ArrowRight,
  Check,
  Timer,
  X,
} from 'lucide-react';
import { problemService } from '../services/problemService';
import { submissionService } from '../services/submissionService';
import { MentorDrawer } from '../components/mentor/MentorDrawer';
import { CodeRunResponse, CodeSubmitResponse } from '../types';
import { useTheme } from '../hooks/useTheme';

export const CodingWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Problem data
  const { data: problem, isLoading: problemLoading } = useQuery({
    queryKey: ['problemDetail', id],
    queryFn: () => problemService.getProblemById(id || 'first-and-last-position'),
    enabled: !!id,
  });

  // Workspace configuration
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>('');
  const [customInput, setCustomInput] = useState<string>('');
  const [consoleTab, setConsoleTab] = useState<'sample' | 'custom' | 'output'>('sample');

  // Execution & Submission state
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<CodeRunResponse | null>(null);
  const [submitResult, setSubmitResult] = useState<CodeSubmitResponse | null>(null);

  // UI Drawer & Details state
  const [showExplanation, setShowExplanation] = useState(false);
  const [mentorDrawerOpen, setMentorDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live assessment timer state
  // Default to 45-minute countdown standard assessment duration
  const [timerMode, setTimerMode] = useState<'countdown' | 'stopwatch'>('countdown');
  const [initialDuration, setInitialDuration] = useState<number>(2700); // 45 mins in seconds
  const [timeRemaining, setTimeRemaining] = useState<number>(2700);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [showTimerMenu, setShowTimerMenu] = useState<boolean>(false);

  // End Assessment & Session modals
  const [showEndTestModal, setShowEndTestModal] = useState<boolean>(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState<boolean>(false);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);

  // Timer Tick Effect
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);

      if (timerMode === 'countdown') {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimerRunning(false);
            setShowTimeUpModal(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, timerMode]);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatElapsedDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  // Timer control actions
  const handleToggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const handleResetTimer = () => {
    if (timerMode === 'countdown') {
      setTimeRemaining(initialDuration);
    } else {
      setElapsedSeconds(0);
    }
    setIsTimerRunning(true);
    setShowTimerMenu(false);
  };

  const handleSelectDuration = (minutes: number) => {
    const secs = minutes * 60;
    setTimerMode('countdown');
    setInitialDuration(secs);
    setTimeRemaining(secs);
    setIsTimerRunning(true);
    setShowTimerMenu(false);
  };

  const handleSwitchToStopwatch = () => {
    setTimerMode('stopwatch');
    setIsTimerRunning(true);
    setShowTimerMenu(false);
  };

  // End test handlers
  const handleOpenEndTest = () => {
    setIsTimerRunning(false);
    setShowEndTestModal(true);
  };

  const handleResumeTest = () => {
    setShowEndTestModal(false);
    setShowTimeUpModal(false);
    setIsTimerRunning(true);
  };

  const handleAddFiveMinutes = () => {
    setTimeRemaining((prev) => prev + 300);
    setShowTimeUpModal(false);
    setIsTimerRunning(true);
  };

  const handleConfirmEndTest = async (withSubmission: boolean) => {
    setShowEndTestModal(false);
    setShowTimeUpModal(false);
    setIsTimerRunning(false);

    if (withSubmission && !submitResult && problem) {
      await handleSubmitCode();
    }

    if (submitResult?.status === 'Accepted') {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.5 },
      });
    }

    setShowCompletionModal(true);
  };

  // Synchronize starter code when problem or language changes
  useEffect(() => {
    if (problem && problem.starter_code) {
      const starter =
        problem.starter_code[selectedLanguage] ||
        problem.starter_code['python'] ||
        '# Write your solution here\n';
      setCode(starter);
    }
  }, [problem, selectedLanguage]);

  // Language mapping for Monaco
  const getMonacoLanguage = (lang: string): string => {
    switch (lang) {
      case 'python':
        return 'python';
      case 'cpp':
        return 'cpp';
      case 'java':
        return 'java';
      case 'javascript':
        return 'javascript';
      default:
        return 'python';
    }
  };

  // Reset starter code
  const handleResetCode = () => {
    if (problem && problem.starter_code) {
      setCode(problem.starter_code[selectedLanguage] || '');
    }
  };

  // Handle Non-evaluative Run
  const handleRunCode = async () => {
    setIsRunning(true);
    setConsoleTab('output');
    try {
      const res = await submissionService.runCode(code, selectedLanguage, customInput);
      setRunResult(res);
      setSubmitResult(null);
    } catch {
      setRunResult({
        status: 'Execution Service Error',
        stdout: '',
        stderr: 'Unable to connect to execution service. Please check backend status.',
        compile_output: '',
        runtime_ms: 0,
        memory_kb: 0,
        test_results: [],
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Handle Official Graded Submission
  const handleSubmitCode = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setConsoleTab('output');

    try {
      const res = await submissionService.submitCode(problem.id, selectedLanguage, code);
      setSubmitResult(res);
      setRunResult(null);

      // Trigger Confetti on Accepted!
      if (res.status === 'Accepted') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch {
      setSubmitResult({
        submission_id: '',
        status: 'Submission Failed',
        passed_tests: 0,
        total_tests: 0,
        error_output: 'Failed to evaluate code against the test suite.',
        test_results: [],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (problemLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading problem workspace...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="p-12 text-center">
        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">Problem not found.</p>
        <button
          onClick={() => navigate('/practice')}
          className="mt-4 px-6 py-2 rounded-full bg-purple-600 text-white text-sm font-bold"
        >
          Return to Practice Arena
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#F8F9FE] dark:bg-[#0c0e15] flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 p-4' : ''}`}>
      {/* Assessment Header (Matching Reference Image 1) */}
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
                Cognitio Libera Coding Assessment
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">
                Official Algorithmic Challenge
              </span>
            </div>
          </div>
        </div>

        {/* Assessment Timer & Session Control Center */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Interactive Timer Pill */}
          <div className="relative">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all ${
                isTimerRunning
                  ? timerMode === 'countdown' && timeRemaining <= 300
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300'
                    : 'bg-slate-100/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200'
              }`}
            >
              <Clock
                className={`w-4 h-4 ${
                  isTimerRunning
                    ? timerMode === 'countdown' && timeRemaining <= 300
                      ? 'text-rose-600 animate-bounce'
                      : 'text-purple-600 dark:text-purple-400 animate-pulse'
                    : 'text-amber-500'
                }`}
              />

              {/* Formatted Digits */}
              <span className="font-mono font-bold text-sm tracking-wider">
                {formatTimer(timerMode === 'countdown' ? timeRemaining : elapsedSeconds)}
              </span>

              {/* Mode indicator */}
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 hidden md:inline">
                {timerMode === 'countdown' ? 'Remaining' : 'Elapsed'}
              </span>

              {/* Paused Badge */}
              {!isTimerRunning && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 uppercase tracking-wider">
                  Paused
                </span>
              )}

              {/* Vertical divider */}
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />

              {/* Play / Pause Toggle Button */}
              <button
                type="button"
                onClick={handleToggleTimer}
                title={isTimerRunning ? 'Pause timer' : 'Resume timer'}
                className="p-1 rounded-md text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
                aria-label={isTimerRunning ? 'Pause timer' : 'Resume timer'}
              >
                {isTimerRunning ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
              </button>

              {/* Reset Timer Button */}
              <button
                type="button"
                onClick={handleResetTimer}
                title="Reset timer"
                className="p-1 rounded-md text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
                aria-label="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Presets & Settings Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setShowTimerMenu((prev) => !prev)}
                title="Timer presets & modes"
                className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
                aria-label="Timer settings"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Presets Popover Menu */}
            {showTimerMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 text-xs space-y-1 backdrop-blur-md">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Timer Presets
                </div>
                <button
                  onClick={() => handleSelectDuration(30)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                    timerMode === 'countdown' && initialDuration === 1800
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>30 Minutes (Sprint)</span>
                  {timerMode === 'countdown' && initialDuration === 1800 && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleSelectDuration(45)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                    timerMode === 'countdown' && initialDuration === 2700
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>45 Minutes (Standard)</span>
                  {timerMode === 'countdown' && initialDuration === 2700 && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleSelectDuration(60)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                    timerMode === 'countdown' && initialDuration === 3600
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>60 Minutes (Deep Dive)</span>
                  {timerMode === 'countdown' && initialDuration === 3600 && <Check className="w-3.5 h-3.5" />}
                </button>
                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                <button
                  onClick={handleSwitchToStopwatch}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                    timerMode === 'stopwatch'
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Stopwatch (Count-up)</span>
                  {timerMode === 'stopwatch' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* End Test Button */}
          <button
            type="button"
            onClick={handleOpenEndTest}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full border border-rose-300 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            title="End assessment and conclude session"
          >
            <Flag className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>End Test</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Section Selector (Image 1 sidebar: MCQ / Programming) */}
        <div className="w-20 sm:w-28 flex-shrink-0 bg-[#1e212d] text-white flex flex-col py-6 border-r border-slate-800 items-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-6">
            Section
          </span>

          <button
            onClick={() => navigate('/practice/quiz')}
            className="w-full py-3 text-xs font-semibold text-slate-400 hover:text-white transition-colors text-center"
          >
            MCQ
          </button>

          <button
            className="w-full py-3 text-xs font-bold text-purple-400 border-l-4 border-purple-500 bg-purple-950/40 text-center transition-colors"
          >
            Programming
          </button>
        </div>

        {/* Workspace Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 space-y-4">
          {/* Top Card: Problem Statement (Matching Image 1) */}
          <div className="bg-white dark:bg-[#141622] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
                  1. {problem.title}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                  {problem.difficulty}
                </span>
              </div>

              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Problem Statement
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {problem.description}
              </p>
            </div>

            {/* Constraints */}
            {problem.constraints && problem.constraints.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Constraints:
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                  {problem.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Accordion: Detailed Explanation */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="flex items-center justify-between w-full text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600 transition-colors"
              >
                <span>Detailed Explanation (Input/Output Format, Notes, Examples)</span>
                {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showExplanation && (
                <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-300 space-y-3">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white">Sample Input Format:</span>
                    <p className="font-mono mt-0.5">{problem.examples?.[0]?.input || 'arr = [5, 7, 7, 8, 8, 10], target = 8'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white">Sample Output Format:</span>
                    <p className="font-mono mt-0.5">{problem.examples?.[0]?.output || '[3, 4]'}</p>
                  </div>
                  {problem.examples?.[0]?.explanation && (
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white">Explanation:</span>
                      <p className="mt-0.5">{problem.examples[0].explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Split: Code Editor & Console (Matching Image 1) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
            {/* Monaco Editor Panel (8 Columns) */}
            <div className="lg:col-span-8 flex flex-col bg-[#1e1e1e] rounded-2xl overflow-hidden border border-slate-800 shadow-md">
              {/* Editor Toolbar (Image 1 top of editor) */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#252526] border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-[#1e1e1e] text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-700 focus:outline-none"
                  >
                    <option value="python">Python 3</option>
                    <option value="cpp">C++ (GCC)</option>
                    <option value="java">Java (OpenJDK)</option>
                    <option value="javascript">JavaScript (Node.js)</option>
                  </select>

                  <button
                    onClick={handleResetCode}
                    title="Reset starter boilerplate"
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-zinc-700 rounded-md transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    title="Toggle Fullscreen"
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-zinc-700 rounded-md transition-colors"
                  >
                    {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Monaco Editor Container */}
              <div className="flex-1 min-h-[400px]">
                <Editor
                  height="100%"
                  language={getMonacoLanguage(selectedLanguage)}
                  value={code}
                  onChange={(val) => setCode(val || '')}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  options={{
                    fontSize: 13,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    lineNumbers: 'on',
                    tabSize: 4,
                  }}
                />
              </div>
            </div>

            {/* Console Panel (4 Columns - Matching Image 1 right panel) */}
            <div className="lg:col-span-4 flex flex-col bg-white dark:bg-[#141622] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
              {/* Console Header Tabs */}
              <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#181a29] px-2 text-xs font-bold">
                <button
                  onClick={() => setConsoleTab('sample')}
                  className={`py-3 px-4 border-b-2 transition-colors ${
                    consoleTab === 'sample'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Sample
                </button>

                <button
                  onClick={() => setConsoleTab('custom')}
                  className={`py-3 px-4 border-b-2 transition-colors ${
                    consoleTab === 'custom'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Custom
                </button>

                <button
                  onClick={() => setConsoleTab('output')}
                  className={`py-3 px-4 border-b-2 transition-colors ${
                    consoleTab === 'output'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Output / Results
                </button>
              </div>

              {/* Console Body */}
              <div className="p-4 flex-1 overflow-y-auto text-xs font-mono min-h-[300px]">
                {/* SAMPLE TAB */}
                {consoleTab === 'sample' && (
                  <div className="space-y-4">
                    <p className="text-[11px] font-sans text-slate-400">
                      Visible test cases configured for this problem:
                    </p>
                    {problem.sample_test_cases?.map((tc, idx) => (
                      <div key={tc.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Case #{idx + 1}:</span>
                        <div className="text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-slate-500">Input: </span>
                          <span>{tc.input_data}</span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-slate-500">Expected: </span>
                          <span className="text-purple-600 dark:text-purple-400">{tc.expected_output}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CUSTOM INPUT TAB (Image 1 placeholder: 'Write Your Input Cases Here Like 1234') */}
                {consoleTab === 'custom' && (
                  <div className="h-full flex flex-col space-y-2">
                    <label className="text-[11px] font-sans font-semibold text-slate-500">
                      Standard Input (stdin):
                    </label>
                    <textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Write Your Input Cases Here Like 1234"
                      className="w-full flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono resize-none"
                      rows={8}
                    />
                  </div>
                )}

                {/* OUTPUT / EXECUTION RESULTS TAB */}
                {consoleTab === 'output' && (
                  <div className="space-y-3">
                    {isRunning && (
                      <div className="p-6 text-center text-slate-500 flex flex-col items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                        <span className="text-xs font-semibold">Evaluating code with Google Gemini AI...</span>
                      </div>
                    )}

                    {isSubmitting && (
                      <div className="p-6 text-center text-slate-500 flex flex-col items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                        <span className="text-xs font-semibold">Grading visible + hidden test suites with Gemini AI...</span>
                      </div>
                    )}

                    {/* Non-evaluative Run Output */}
                    {runResult && !isRunning && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                          <span className="font-bold text-slate-700 dark:text-slate-300">Run Status:</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-300">
                            {runResult.status}
                          </span>
                        </div>

                        {runResult.stdout && (
                          <div>
                            <span className="font-semibold text-slate-500">Standard Output:</span>
                            <pre className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 overflow-x-auto mt-1">
                              {runResult.stdout}
                            </pre>
                          </div>
                        )}

                        {runResult.stderr && (
                          <div>
                            <span className="font-semibold text-rose-500">Errors:</span>
                            <pre className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 overflow-x-auto mt-1">
                              {runResult.stderr}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Graded Submit Output */}
                    {submitResult && !isSubmitting && (
                      <div className="space-y-3">
                        <div className="p-3 rounded-xl border flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
                          <div className="flex items-center gap-2">
                            {submitResult.status === 'Accepted' ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-rose-500" />
                            )}
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {submitResult.status}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                            {submitResult.passed_tests} / {submitResult.total_tests} Passed
                          </span>
                        </div>

                        {/* Test case breakdown */}
                        <div className="space-y-2">
                          {submitResult.test_results.map((tr) => (
                            <div
                              key={tr.test_case_index}
                              className={`p-2.5 rounded-lg border text-[11px] flex items-center justify-between ${
                                tr.status === 'Passed'
                                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              <span>
                                Case #{tr.test_case_index} {tr.is_hidden ? '(Hidden)' : '(Sample)'}
                              </span>
                              <span className="font-bold">{tr.status}</span>
                            </div>
                          ))}
                        </div>

                        {submitResult.ai_feedback_summary && (
                          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-xs text-purple-700 dark:text-purple-300 space-y-2">
                            <p>{submitResult.ai_feedback_summary}</p>
                            <button
                              onClick={() => setMentorDrawerOpen(true)}
                              className="w-full py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs"
                            >
                              Open AI Mentor Review
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {!runResult && !submitResult && !isRunning && !isSubmitting && (
                      <p className="text-slate-400 text-center pt-8">
                        Click 'Run' to test custom stdin, or 'Submit Test' to grade all test cases.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Action Bar (Matching Image 1: Run, Submit Test, and End Test buttons) */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              {/* Run Button (Pill outline matching Image 1) */}
              <button
                type="button"
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                className="px-8 py-3 rounded-full bg-white dark:bg-slate-800 border-2 border-purple-500 text-purple-600 dark:text-purple-400 font-bold text-sm hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isRunning ? 'Running...' : 'Run'}</span>
              </button>

              {/* End Assessment Session Button */}
              <button
                type="button"
                onClick={handleOpenEndTest}
                className="px-5 py-3 rounded-full border border-slate-300 dark:border-slate-700 hover:border-rose-400 dark:hover:border-rose-500 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="End assessment session"
              >
                <Flag className="w-3.5 h-3.5 text-rose-500" />
                <span>End Test</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Ask AI Mentor Button */}
              <button
                type="button"
                onClick={() => setMentorDrawerOpen(true)}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-md shadow-purple-500/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask AI Mentor</span>
              </button>

              {/* Submit Test Button (Vibrant Purple Pill matching Image 1) */}
              <button
                type="button"
                onClick={handleSubmitCode}
                disabled={isRunning || isSubmitting}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-500/30 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Evaluating...' : 'Submit Test'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Mentor Drawer */}
      <MentorDrawer
        isOpen={mentorDrawerOpen}
        onClose={() => setMentorDrawerOpen(false)}
        problemId={problem.id}
        problemTitle={problem.title}
        userCode={code}
        language={selectedLanguage}
        lastExecutionStatus={submitResult?.status || runResult?.status}
      />

      {/* 1. End Test Confirmation Modal */}
      {showEndTestModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleResumeTest();
          }}
        >
          <div className="relative w-full max-w-lg bg-white dark:bg-[#141622] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-slate-800 dark:text-slate-100">
            <button
              onClick={handleResumeTest}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0">
                <Flag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  End Coding Assessment?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Are you ready to conclude this assessment session? Review your progress below.
                </p>
              </div>
            </div>

            {/* Assessment Session Snapshot */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="font-semibold text-slate-500">Problem:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{problem.title}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="font-semibold text-slate-500">Time Spent:</span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                  {formatElapsedDuration(elapsedSeconds)}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="font-semibold text-slate-500">Code Written:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {code.split('\n').length} lines ({selectedLanguage.toUpperCase()})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Submission Status:</span>
                {submitResult?.status === 'Accepted' ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accepted (100% Passed)</span>
                  </span>
                ) : submitResult ? (
                  <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{submitResult.passed_tests}/{submitResult.total_tests} Tests Passed</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-rose-500">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Not Submitted Yet</span>
                  </span>
                )}
              </div>
            </div>

            {!submitResult && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  You have not officially submitted your code yet. Click <strong>Submit & End Test</strong> to evaluate your solution against all test cases.
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleResumeTest}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Resume Test
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
                <button
                  type="button"
                  onClick={() => handleConfirmEndTest(false)}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  End Without Grading
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmEndTest(true)}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-500/25 hover:scale-[1.02] transition-all"
                >
                  Submit & End Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Time Expired Modal */}
      {showTimeUpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#141622] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-center text-slate-800 dark:text-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto">
              <Timer className="w-7 h-7 animate-bounce" />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Time is Up!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                The allocated time for this coding assessment has ended. Please submit your solution now or add 5 more minutes if practicing.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              Total session time elapsed: <strong className="text-purple-600 dark:text-purple-400">{formatElapsedDuration(elapsedSeconds)}</strong>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddFiveMinutes}
                className="w-full sm:flex-1 py-3 rounded-full border border-purple-300 dark:border-purple-800 text-purple-600 dark:text-purple-400 font-bold text-xs hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
              >
                + 5 More Minutes
              </button>

              <button
                type="button"
                onClick={() => handleConfirmEndTest(true)}
                className="w-full sm:flex-1 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-500/25 hover:scale-[1.02] transition-all"
              >
                Submit Solution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Assessment Completion Summary Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#141622] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-slate-800 dark:text-slate-100">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-purple-500/30">
                {submitResult?.status === 'Accepted' ? (
                  <Trophy className="w-8 h-8 text-amber-300" />
                ) : (
                  <Award className="w-8 h-8 text-purple-200" />
                )}
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {submitResult?.status === 'Accepted'
                  ? 'Assessment Passed! 🎉'
                  : 'Assessment Concluded'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {submitResult?.status === 'Accepted'
                  ? 'Outstanding work! Your algorithmic solution passed all visible and hidden test suites.'
                  : 'Your assessment session is finished. Review your evaluation and AI mentor feedback below.'}
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verdict</span>
                <span className={`font-extrabold text-sm mt-1 block ${
                  submitResult?.status === 'Accepted'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-purple-600 dark:text-purple-400'
                }`}>
                  {submitResult?.status || 'Completed'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tests Passed</span>
                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mt-1 block">
                  {submitResult ? `${submitResult.passed_tests}/${submitResult.total_tests}` : 'N/A'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Time Taken</span>
                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mt-1 block">
                  {formatElapsedDuration(elapsedSeconds)}
                </span>
              </div>
            </div>

            {/* AI Feedback Preview */}
            {submitResult?.ai_feedback_summary && (
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-xs text-purple-700 dark:text-purple-300 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Gemini Socratic AI Review</span>
                </div>
                <p className="leading-relaxed">{submitResult.ai_feedback_summary}</p>
              </div>
            )}

            {/* Post-assessment navigation buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCompletionModal(false);
                  setMentorDrawerOpen(true);
                }}
                className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-500/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Review In-Depth with Gemini AI Mentor</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/practice')}
                  className="py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Practice Arena
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
