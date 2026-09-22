/**
 * User Settings and Preferences Page.
 *
 * WHAT IT IS:
 *   Allows developers to customize their language preference, target difficulty,
 *   UI theme, and inspect connected service statuses.
 */

import React, { useState } from 'react';
import { Settings, Moon, Sun, Code, CheckCircle, ShieldCheck, Cpu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { authService } from '../services/authService';

export const SettingsPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [preferredLang, setPreferredLang] = useState<string>(user?.preferred_language || 'python');
  const [preferredDiff, setPreferredDiff] = useState<string>(user?.preferred_difficulty || 'Medium');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await authService.updatePreferences({
        preferred_language: preferredLang,
        preferred_difficulty: preferredDiff,
        theme: theme,
      });
      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="glass-card p-6 md:p-8 rounded-3xl bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-transparent border-purple-200/60 dark:border-purple-900/40 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Platform Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure your development environment, target curriculum difficulty, and themes.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      {/* Preferences Form */}
      <form onSubmit={handleSavePreferences} className="space-y-6">
        <div className="glass-card p-6 rounded-3xl space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Editor & Practice Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Preferred Language */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Default Programming Language
              </label>
              <select
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
              >
                <option value="python">Python 3 (Recommended)</option>
                <option value="cpp">C++ (GCC 9.2)</option>
                <option value="java">Java (OpenJDK 13)</option>
                <option value="javascript">JavaScript (Node.js 12)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Monaco Editor defaults to this language when opening new challenges.
              </p>
            </div>

            {/* Target Difficulty */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Target Difficulty Level
              </label>
              <select
                value={preferredDiff}
                onChange={(e) => setPreferredDiff(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
              >
                <option value="Easy">Easy (Foundations)</option>
                <option value="Medium">Medium (Interview Standard)</option>
                <option value="Hard">Hard (Advanced DSA)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Smart practice will prioritize problems matching this skill level.
              </p>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
              Interface Theme
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggleTheme}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-2 hover:border-purple-400 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
                <span>Toggle Current: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
              <span className="text-xs text-slate-400">
                Matches the light pastel UI kit aesthetic by default.
              </span>
            </div>
          </div>
        </div>

        {/* Connected Services Status */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            System & Infrastructure Status
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-700 dark:text-slate-200">Supabase Auth & DB</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-[11px] text-slate-400">PostgreSQL + JWT Verification Active</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-700 dark:text-slate-200">Gemini Code Evaluator</span>
                <Cpu className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-[11px] text-slate-400">AI Code & Test Simulation Active</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-700 dark:text-slate-200">Google Gemini AI</span>
                <Cpu className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-[11px] text-slate-400">Socratic Mentor Engine Active</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-purple-500/25 hover:scale-[1.02] transition-all disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};
