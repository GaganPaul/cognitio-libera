/**
 * Standalone AI Mentor Page.
 *
 * WHAT IT IS:
 *   A dedicated chat and interactive learning portal with the Google Gemini AI Mentor.
 *
 * WHY WE USE IT:
 *   Provides algorithmic explanations, time/space complexity advice, and mock interview guidance.
 */

import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, Loader2, Lightbulb, Code2 } from 'lucide-react';
import { mentorService } from '../services/mentorService';
import { useAuth } from '../hooks/useAuth';

export const MentorPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'mentor'; text: string }>>([
    {
      sender: 'mentor',
      text: `Welcome ${user?.full_name || 'Developer'}! I am your Cognitio Libera AI Mentor, powered exclusively by Google Gemini. You can ask me to explain any algorithmic concept (Binary Search, DP, Graph traversals), review code patterns, or discuss software engineering interview questions. What would you like to explore today?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage;
    setInputMessage('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const resp = await mentorService.chatWithMentor({
        userMessage: userText,
        chatHistory: messages.map((m) => ({ sender: m.sender, text: m.text })),
      });
      setMessages((prev) => [...prev, { sender: 'mentor', text: resp.mentor_reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'mentor', text: 'Sorry, I had trouble reaching the AI Mentor. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Mentor Welcome Banner */}
      <div className="glass-card p-6 rounded-3xl bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-transparent border-purple-200/60 dark:border-purple-900/40 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Google Gemini Socratic Mentor
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Trained to guide your problem-solving step-by-step with progressive hints, never spoiling solutions.
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 flex flex-col h-[65vh]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'mentor' && (
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-purple-600 text-white rounded-br-none shadow-sm'
                    : 'bg-slate-100/90 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                {m.text}
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-1">
                  U
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span>Formulating personalized guidance...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 bg-slate-50 dark:bg-[#131520] border-t border-slate-200 dark:border-slate-800 flex gap-3">
          <input
            type="text"
            placeholder="Ask the AI mentor anything about DSA, complexity, or interview questions..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-purple-500/20 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask Mentor</span>
          </button>
        </form>
      </div>
    </div>
  );
};
