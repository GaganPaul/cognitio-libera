/**
 * Sidebar Navigation Component.
 *
 * WHAT IT IS:
 *   The primary vertical navigation sidebar matching the reference UI kit design (Image 3).
 *
 * WHY WE USE IT:
 *   Provides quick, persistent access to Dashboard, Tests, Courses, Profile, Leaderboard,
 *   Dark mode toggle, and Settings.
 *
 * REPLACES:
 *   Replaces placeholder 'LeetCode' branding with official 'Cognitio Libera' logo and typography.
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Code2,
  BookOpen,
  User,
  Trophy,
  Moon,
  Sun,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Tests', path: '/practice', icon: Code2 },
    { label: 'AI Mentor', path: '/mentor', icon: Sparkles },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col justify-between bg-white/80 dark:bg-[#11131c]/90 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 min-h-screen p-6 transition-colors duration-200">
      {/* Top Branding Section */}
      <div>
        <NavLink to="/dashboard" className="flex items-center gap-3 mb-10 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
            CL
          </div>
          <div>
            <span className="font-extrabold text-xl bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-300 bg-clip-text text-transparent">
              Cognitio
            </span>
            <span className="block text-xs font-semibold text-slate-400 tracking-wider uppercase -mt-1">
              Libera
            </span>
          </div>
        </NavLink>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-100/90 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-purple-600 dark:hover:text-purple-300'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-5 h-5 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-purple-600" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </nav>
      </div>

      {/* Bottom Actions Section */}
      <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 space-y-1.5">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
              isActive
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </NavLink>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
