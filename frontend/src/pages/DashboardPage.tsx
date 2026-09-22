/**
 * Dashboard Page Component.
 *
 * WHAT IT IS:
 *   The primary authenticated home dashboard faithfully replicating reference Image 3.
 *
 * WHY WE USE IT:
 *   Displays real-time user statistics, recent tests with resume actions, upcoming quiz
 *   competition announcements, live leaderboard rankings, and weak topic progress.
 *
 * REPLACES:
 *   Replaces placeholder 'LeetCode' and 'John Leboo' identities with real Supabase data.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Percent,
  FolderKanban,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Trophy,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Loader2,
} from 'lucide-react';
import { progressService } from '../services/progressService';
import { problemService } from '../services/problemService';
import { useAuth } from '../hooks/useAuth';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Query aggregated stats from backend
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => progressService.getDashboardStats(),
    staleTime: 30000,
  });

  // Query global leaderboard
  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['dashboardLeaderboard'],
    queryFn: () => progressService.getLeaderboard(3),
    staleTime: 60000,
  });

  if (statsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading your profile dashboard...</p>
      </div>
    );
  }

  const recentTests = stats?.recent_tests || [];
  const testBreakdown = stats?.test_breakdown || {
    total_tests: 0,
    passed_tests: 0,
    failed_tests: 0,
    pending_tests: 0,
  };
  const weakTopics = stats?.weak_topics || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner Quick Motivation */}
      <div className="glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-transparent border-purple-200/60 dark:border-purple-900/40">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Streak: {stats?.current_streak_days || 0} Days 🔥</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Continue your learning journey
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Pick up where you left off or tackle your lowest mastery topics to prepare for upcoming technical assessments.
          </p>
        </div>

        <div className="mt-4 sm:mt-0 sm:absolute sm:right-8 sm:top-1/2 sm:-translate-y-1/2 flex items-center gap-3">
          <button
            onClick={() => navigate('/practice')}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-purple-500/20 hover:scale-105 transition-all flex items-center gap-2"
          >
            <span>Practice Arena</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid matching Image 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 Columns): Recent Tests & Upcoming Competition */}
        <div className="lg:col-span-8 space-y-8">
          {/* Recent Tests Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  Recent Tests
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label="Previous test"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label="Next test"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Test Cards (Image 3 layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {recentTests.length > 0 ? (
                recentTests.slice(0, 2).map((test) => (
                  <div
                    key={test.id}
                    className="relative overflow-hidden rounded-2xl h-52 bg-slate-900 shadow-md group transition-all"
                  >
                    {/* Background Code Thumbnail */}
                    <img
                      src="/assets/code_thumbnail.jpg"
                      alt={test.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    {/* Content */}
                    <div className="relative h-full p-5 flex flex-col justify-between">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-purple-500/30 text-purple-300 text-xs font-semibold backdrop-blur-sm mb-1.5">
                          {test.category || 'DSA'}
                        </span>
                        <h3 className="text-white font-bold text-lg leading-snug line-clamp-1">
                          {test.title}
                        </h3>
                        <p className="text-slate-300 text-xs mt-0.5">
                          {test.language} Programming
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <button
                          onClick={() => navigate(`/practice/coding/${test.id}`)}
                          className="px-4 py-1.5 rounded-full bg-black/60 hover:bg-purple-600 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 hover:border-transparent transition-all"
                        >
                          Resume
                        </button>

                        {/* Circular Progress Badge */}
                        <div className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-purple-500/40 flex items-center justify-center text-xs font-bold text-purple-300">
                          {test.progress_percentage}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 glass-card p-8 rounded-2xl text-center">
                  <p className="text-sm text-slate-500">No recent tests yet. Start your first practice session!</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Quiz Competition Card (Matches Image 3) */}
          <div className="glass-card p-8 rounded-3xl text-center relative overflow-hidden border-purple-200/80 dark:border-purple-900/40">
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4">
              Upcoming Quiz Competition
            </p>

            {/* 3D Calendar Asset */}
            <div className="w-24 h-24 mx-auto mb-4 relative flex items-center justify-center">
              <img
                src="/assets/calendar_3d.jpg"
                alt="3D Calendar"
                className="w-20 h-20 object-contain drop-shadow-md rounded-2xl"
              />
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              National Coding Olympiad
            </h3>
            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-6">
              Saturday, 12th Aug • 10:00 AM UTC
            </p>

            <button
              onClick={() => navigate('/practice/quiz')}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-purple-500/25 hover:opacity-95 hover:scale-105 transition-all"
            >
              Enter Competition Arena
            </button>
          </div>

          {/* Weak Topics Analysis */}
          <div className="glass-card p-6 md:p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Focus Areas (Weak Topics)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Auto-calculated mastery</span>
            </div>

            <div className="space-y-4">
              {weakTopics.map((topic, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{topic.topic_name}</span>
                    <span className="text-purple-600 dark:text-purple-400">{topic.mastery_percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${Math.max(5, topic.mastery_percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 Columns): Leaderboard Preview & Stats Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          {/* Leader Board Widget (Matches Image 3) */}
          <div className="glass-card p-6 rounded-3xl border-purple-200/60 dark:border-purple-900/40">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Leader Board
                </h3>
              </div>
              <button
                onClick={() => navigate('/leaderboard')}
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {leaderboard && leaderboard.length > 0 ? (
                leaderboard.map((leader) => {
                  const laurelColors = [
                    'text-amber-400 border-amber-300 bg-amber-50 dark:bg-amber-950/40', // 1st
                    'text-slate-400 border-slate-300 bg-slate-50 dark:bg-slate-800/40', // 2nd
                    'text-amber-700 border-amber-600 bg-amber-50/50 dark:bg-amber-950/20', // 3rd
                  ];
                  const wreathBadge = laurelColors[leader.rank - 1] || 'text-purple-400';

                  return (
                    <div
                      key={leader.user_id}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                          {leader.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                            {leader.full_name || leader.username}
                          </p>
                          <p className="text-xs text-slate-400">
                            {leader.problems_solved} Solved • {leader.score} Pts
                          </p>
                        </div>
                      </div>

                      {/* Laurel Rank Badge */}
                      <div
                        className={`w-8 h-8 rounded-full border flex items-center justify-center font-extrabold text-sm ${wreathBadge}`}
                      >
                        {leader.rank}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  Be the first to climb the leaderboard!
                </div>
              )}
            </div>
          </div>

          {/* Stat Cards (Matching Image 3) */}
          <div className="space-y-4">
            {/* Card 1: Tests Written */}
            <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                <Pencil className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  {testBreakdown.total_tests}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Tests Written
                </p>
              </div>
            </div>

            {/* Card 2: Overall Average */}
            <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  %{stats?.coding_accuracy_percentage || 0}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Overall Accuracy
                </p>
              </div>
            </div>

            {/* Card 3: Test Status Breakdown */}
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <FolderKanban className="w-4 h-4 text-purple-500" />
                  <span>No of Tests</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {testBreakdown.total_tests}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <ThumbsUp className="w-4 h-4 text-emerald-500" />
                  <span>Passed</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {testBreakdown.passed_tests}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <ThumbsDown className="w-4 h-4 text-rose-500" />
                  <span>Failed</span>
                </div>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {testBreakdown.failed_tests}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4 text-sky-500" />
                  <span>Waiting for result</span>
                </div>
                <span className="font-bold text-sky-600 dark:text-sky-400">
                  {testBreakdown.pending_tests}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
