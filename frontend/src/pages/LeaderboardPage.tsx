/**
 * Leaderboard Page Component.
 *
 * WHAT IT IS:
 *   Global rankings table featuring live scores, problems solved, and laurel badges.
 *
 * WHY WE USE IT:
 *   Fosters positive competition and tracks platform mastery using real database records.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Flame, Loader2, Sparkles } from 'lucide-react';
import { progressService } from '../services/progressService';
import { LeaderboardUser } from '../types';
import { formatDisplayName } from '../lib/formatters';

export const LeaderboardPage: React.FC = () => {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboardFull'],
    queryFn: () => progressService.getLeaderboard(25),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Calculating global rankings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="glass-card p-6 md:p-8 rounded-3xl bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-transparent border-purple-200/60 dark:border-purple-900/40">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Cognitio Libera Leaderboard
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Rankings computed in real time based on accepted problem submissions (50 pts) and correct quiz answers (10 pts).
        </p>
      </div>

      {/* Rankings Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80">
        {leaderboard && leaderboard.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                  <th className="py-4 px-6">Rank</th>
                  <th className="py-4 px-6">Developer</th>
                  <th className="py-4 px-6 text-center">Problems Solved</th>
                  <th className="py-4 px-6 text-center">Quiz Score</th>
                  <th className="py-4 px-6 text-center">Active Streak</th>
                  <th className="py-4 px-6 text-right">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {leaderboard.map((user) => {
                  const isTopThree = user.rank <= 3;
                  const laurelColors = [
                    'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300',
                    'bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
                    'bg-amber-50 text-amber-800 border-amber-400 dark:bg-amber-950/40 dark:text-amber-400',
                  ];

                  return (
                    <tr
                      key={user.user_id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Rank */}
                      <td className="py-4 px-6 font-bold">
                        {isTopThree ? (
                          <div
                            className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-black ${
                              laurelColors[user.rank - 1]
                            }`}
                          >
                            {user.rank}
                          </div>
                        ) : (
                          <span className="text-slate-500 pl-2">#{user.rank}</span>
                        )}
                      </td>

                      {/* User Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                            {formatDisplayName(user.full_name || user.username).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {formatDisplayName(user.full_name || user.username)}
                            </span>
                            <span className="text-xs text-slate-400">@{user.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Problems */}
                      <td className="py-4 px-6 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {user.problems_solved}
                      </td>

                      {/* Quiz Score */}
                      <td className="py-4 px-6 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {user.quiz_score} pts
                      </td>

                      {/* Streak */}
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                          <Flame className="w-3.5 h-3.5" />
                          <span>{user.streak_days}d</span>
                        </span>
                      </td>

                      {/* Total Score */}
                      <td className="py-4 px-6 text-right font-black text-purple-600 dark:text-purple-400 text-base">
                        {user.score}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            No rankings recorded yet. Solve a problem to claim the #1 spot!
          </div>
        )}
      </div>
    </div>
  );
};
