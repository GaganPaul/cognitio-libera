/**
 * User Profile Page Component.
 *
 * WHAT IT IS:
 *   Displays user identity, aggregate practice statistics, and past submission history.
 *
 * WHY WE USE IT:
 *   Allows developers to inspect their progress, verify solved challenges, and review code attempts.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Code2, BookOpen, Flame, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { progressService } from '../services/progressService';
import { submissionService } from '../services/submissionService';
import { formatUserName } from '../lib/formatters';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['profileStats'],
    queryFn: () => progressService.getDashboardStats(),
  });

  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['userSubmissions'],
    queryFn: () => submissionService.getSubmissions(),
  });

  const { fullName, firstName } = formatUserName(user);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Profile Header Card */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-purple-200/60 dark:border-purple-900/40 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-purple-500/20 ring-4 ring-purple-500/20">
          {firstName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {fullName}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {user?.email || 'student@cognitiolibera.com'}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
              Language: {user?.preferred_language?.toUpperCase() || 'PYTHON'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              Difficulty: {user?.preferred_difficulty || 'Medium'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              <span>{stats?.current_streak_days || 0} Day Streak</span>
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl text-center">
          <Code2 className="w-5 h-5 text-purple-600 mx-auto mb-2" />
          <span className="text-2xl font-black text-slate-900 dark:text-white block">
            {stats?.problems_solved || 0}
          </span>
          <span className="text-xs text-slate-400 font-medium">Problems Solved</span>
        </div>

        <div className="glass-card p-5 rounded-2xl text-center">
          <BookOpen className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
          <span className="text-2xl font-black text-slate-900 dark:text-white block">
            {stats?.quiz_attempted || 0}
          </span>
          <span className="text-xs text-slate-400 font-medium">Quizzes Attempted</span>
        </div>

        <div className="glass-card p-5 rounded-2xl text-center">
          <span className="text-2xl font-black text-purple-600 dark:text-purple-400 block pt-1">
            %{stats?.coding_accuracy_percentage || 0}
          </span>
          <span className="text-xs text-slate-400 font-medium">Coding Accuracy</span>
        </div>

        <div className="glass-card p-5 rounded-2xl text-center">
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block pt-1">
            %{stats?.quiz_accuracy_percentage || 0}
          </span>
          <span className="text-xs text-slate-400 font-medium">Quiz Accuracy</span>
        </div>
      </div>

      {/* Historical Submissions Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Submission History
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Your recent official code evaluations via Google Gemini.
          </p>
        </div>

        {submissionsLoading ? (
          <div className="p-12 text-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
            <p className="text-xs">Loading submissions...</p>
          </div>
        ) : submissions && (submissions as any[]).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                  <th className="py-3 px-6">Problem</th>
                  <th className="py-3 px-6">Language</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-center">Passed</th>
                  <th className="py-3 px-6 text-center">Runtime</th>
                  <th className="py-3 px-6 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {(submissions as any[]).map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-6 font-bold text-slate-800 dark:text-slate-200">
                      {sub.problem_title}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-500 uppercase">
                      {sub.language}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold ${
                          sub.status === 'Accepted'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}
                      >
                        {sub.status === 'Accepted' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        <span>{sub.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center text-slate-600 dark:text-slate-300 font-semibold">
                      {sub.passed_tests} / {sub.total_tests}
                    </td>
                    <td className="py-3.5 px-6 text-center font-mono text-slate-500">
                      {sub.runtime_ms || 0} ms
                    </td>
                    <td className="py-3.5 px-6 text-right text-slate-400">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-400">
            No code submissions recorded yet. Try solving an algorithmic challenge!
          </div>
        )}
      </div>
    </div>
  );
};
