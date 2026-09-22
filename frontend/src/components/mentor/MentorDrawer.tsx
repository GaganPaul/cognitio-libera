/**
 * Google Gemini AI Mentor Drawer Component.
 *
 * WHAT IT IS:
 *   An interactive slide-over drawer embedded into the coding workspace providing:
 *   1. Socratic chat with problem/code context.
 *   2. Progressive hints (Level 1 Intuition -> Level 2 Strategy -> Level 3 Blueprint).
 *   3. Structured Big-O code review.
 *
 * WHY WE USE IT:
 *   Students receive live, personalized guidance from Google Gemini without leaving the editor.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Lightbulb,
  FileCode,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  HardDrive,
} from 'lucide-react';
import { mentorService } from '../../services/mentorService';
import { AiCodeReviewResponse } from '../../types';

interface MentorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  problemId: string;
  problemTitle: string;
  userCode: string;
  language: string;
  lastExecutionStatus?: string;
}

export const MentorDrawer: React.FC<MentorDrawerProps> = ({
  isOpen,
  onClose,
  problemId,
  problemTitle,
  userCode,
  language,
  lastExecutionStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'hint' | 'review'>('hint');

  // Chat state
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'mentor'; text: string }>>([
    {
      sender: 'mentor',
      text: `Hello! I am your Cognitio Libera AI Mentor. I can help guide your approach for "${problemTitle}", explain mistakes, or provide progressive hints without spoiling the solution. How can I help?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Progressive Hint state
  const [currentHintLevel, setCurrentHintLevel] = useState<number>(1);
  const [hints, setHints] = useState<Record<number, { title: string; text: string }>>({});
  const [hintLoading, setHintLoading] = useState(false);

  // Code Review state
  const [review, setReview] = useState<AiCodeReviewResponse | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  if (!isOpen) return null;

  // Handler for Chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || chatLoading) return;

    const userText = inputMessage;
    setInputMessage('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatLoading(true);

    try {
      const response = await mentorService.chatWithMentor({
        problemId,
        userCode,
        language,
        userMessage: userText,
        chatHistory: messages.map((m) => ({ sender: m.sender, text: m.text })),
      });
      setMessages((prev) => [...prev, { sender: 'mentor', text: response.mentor_reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'mentor', text: 'Sorry, I had trouble reaching the AI Mentor. Please try again.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Handler for Progressive Hint
  const handleRequestHint = async (level: number) => {
    if (hints[level] || hintLoading) {
      setCurrentHintLevel(level);
      return;
    }

    setHintLoading(true);
    try {
      const resp = await mentorService.getProgressiveHint(problemId, level, userCode, language);
      setHints((prev) => ({
        ...prev,
        [level]: { title: resp.hint_title, text: resp.hint_text },
      }));
      setCurrentHintLevel(level);
    } catch {
      // Fallback hint
      setHints((prev) => ({
        ...prev,
        [level]: {
          title: `Level ${level} Guidance`,
          text: 'Consider how sorting or indexing can reduce search time. Try writing out two test cases by hand.',
        },
      }));
      setCurrentHintLevel(level);
    } finally {
      setHintLoading(false);
    }
  };

  // Handler for Code Review
  const handleRequestReview = async () => {
    setReviewLoading(true);
    try {
      const reviewData = await mentorService.reviewCode({
        problemId,
        language,
        code: userCode,
        submissionStatus: lastExecutionStatus || 'In Progress',
      });
      setReview(reviewData);
    } catch {
      setReview(null);
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-white dark:bg-[#13151f] shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slideLeft">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-purple-50/50 dark:bg-purple-950/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
              Gemini AI Mentor
            </h3>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
              Practice. Understand. Improve.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close mentor drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button
          onClick={() => {
            setActiveTab('hint');
            if (!hints[1]) handleRequestHint(1);
          }}
          className={`flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'hint'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/30 dark:bg-purple-950/10'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Progressive Hints</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'chat'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/30 dark:bg-purple-950/10'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Mentor</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('review');
            if (!review) handleRequestReview();
          }}
          className={`flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'review'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/30 dark:bg-purple-950/10'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Code Review</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
        {/* PROGRESSIVE HINTS TAB */}
        {activeTab === 'hint' && (
          <div className="space-y-5">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Select a hint tier. Progressive hints provide conceptual intuition without spoiling the full solution code.
              </p>

              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => handleRequestHint(lvl)}
                    disabled={hintLoading}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                      currentHintLevel === lvl
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                    }`}
                  >
                    Level {lvl} {lvl === 1 ? '💡' : lvl === 2 ? '🧩' : '📐'}
                  </button>
                ))}
              </div>
            </div>

            {hintLoading ? (
              <div className="p-8 text-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                <p className="text-xs font-semibold">Consulting Gemini Mentor...</p>
              </div>
            ) : hints[currentHintLevel] ? (
              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/60 space-y-2">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-sm">
                  <Lightbulb className="w-4 h-4" />
                  <span>{hints[currentHintLevel].title}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {hints[currentHintLevel].text}
                </p>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-2xl">
                Click a hint tier above to request guidance.
              </div>
            )}
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col justify-between">
            <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none text-xs text-slate-500 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                    <span>Gemini is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Ask about edge cases or mistakes..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              <button
                type="submit"
                disabled={chatLoading || !inputMessage.trim()}
                className="p-2 rounded-xl bg-purple-600 text-white disabled:opacity-40 hover:bg-purple-700 transition-colors"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* CODE REVIEW TAB */}
        {activeTab === 'review' && (
          <div className="space-y-4">
            {reviewLoading ? (
              <div className="p-8 text-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                <p className="text-xs font-semibold">Analyzing your solution complexity...</p>
              </div>
            ) : review ? (
              <div className="space-y-4">
                {/* Complexity Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Clock className="w-3.5 h-3.5 text-purple-500" />
                      <span>Time Complexity</span>
                    </div>
                    <span className="font-extrabold text-sm text-purple-600 dark:text-purple-400">
                      {review.time_complexity}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Space Complexity</span>
                    </div>
                    <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                      {review.space_complexity}
                    </span>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {review.summary}
                </div>

                {/* Strengths */}
                <div>
                  <h4 className="font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Strengths</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {review.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div>
                  <h4 className="font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Suggestions for Optimization</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {review.improvements.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 space-y-3">
                <p className="text-xs text-slate-500">Run or submit your code first to generate a structured AI review.</p>
                <button
                  onClick={handleRequestReview}
                  className="px-4 py-2 rounded-full bg-purple-600 text-white text-xs font-bold"
                >
                  Generate Code Review
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
