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
  Send,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ChevronLeft,
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

  // Active live timer state
  const [timerSeconds, setTimerSeconds] = useState(1230); // starts at 00:20:30
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

        {/* Assessment Timer (Active live stopwatch matching Image 1) */}
        <button
          onClick={() => setIsTimerRunning(!isTimerRunning)}
          title={isTimerRunning ? 'Click to pause timer' : 'Click to resume timer'}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-mono font-bold text-sm tracking-wider border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
        >
          <Clock className={`w-4 h-4 ${isTimerRunning ? 'text-purple-600 dark:text-purple-400 animate-pulse' : 'text-slate-400'}`} />
          <span>{formatTimer(timerSeconds)}</span>
        </button>
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

          {/* Bottom Action Bar (Matching Image 1: Run & Submit Test buttons) */}
          <div className="flex items-center justify-between pt-2">
            {/* Run Button (Pill outline matching Image 1) */}
            <button
              onClick={handleRunCode}
              disabled={isRunning || isSubmitting}
              className="px-8 py-3 rounded-full bg-white dark:bg-slate-800 border-2 border-purple-500 text-purple-600 dark:text-purple-400 font-bold text-sm hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isRunning ? 'Running...' : 'Run'}</span>
            </button>

            <div className="flex items-center gap-3">
              {/* Ask AI Mentor Button */}
              <button
                onClick={() => setMentorDrawerOpen(true)}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-md shadow-purple-500/20 hover:scale-105 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask AI Mentor</span>
              </button>

              {/* Submit Test Button (Vibrant Purple Pill matching Image 1) */}
              <button
                onClick={handleSubmitCode}
                disabled={isRunning || isSubmitting}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-500/30 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
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
    </div>
  );
};
