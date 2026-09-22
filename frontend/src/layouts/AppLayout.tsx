/**
 * Main Application Layout Wrapper.
 *
 * WHAT IT IS:
 *   Wraps authenticated pages (Dashboard, Practice, Leaderboard, Profile, Settings)
 *   with the persistent Sidebar, TopBar, and responsive mobile navigation.
 *
 * WHY WE USE IT:
 *   Maintains consistent navigation state and background pastel styling across all sub-views.
 */

import React, { useState } from 'react';
import { Outlet, useLocation, NavLink, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { TopBar } from '../components/common/TopBar';
import {
  LayoutDashboard,
  Code2,
  Sparkles,
  Trophy,
  User,
  Settings,
  LogOut,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Dynamic greetings depending on route
  const getHeaderDetails = () => {
    switch (location.pathname) {
      case '/dashboard':
        return { greeting: undefined, subtitle: 'Here is your Profile Dashboard' };
      case '/practice':
        return { greeting: 'Practice Arena', subtitle: 'Sharpen your algorithmic and conceptual skills' };
      case '/mentor':
        return { greeting: 'AI Mentor', subtitle: 'Interactive guidance powered exclusively by Google Gemini' };
      case '/leaderboard':
        return { greeting: 'Leaderboard', subtitle: 'Global developer rankings and performance stats' };
      case '/profile':
        return { greeting: 'My Profile', subtitle: 'Your learning metrics, streak, and preferences' };
      case '/settings':
        return { greeting: 'Settings', subtitle: 'Customize your platform experience and themes' };
      default:
        return { greeting: undefined, subtitle: undefined };
    }
  };

  const { greeting, subtitle } = getHeaderDetails();

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-pastel-mesh transition-colors duration-200">
      {/* Desktop Persistent Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#11131c] z-50 p-6 flex flex-col justify-between transform transition-transform duration-300 md:hidden shadow-2xl ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                CL
              </div>
              <span className="font-extrabold text-lg bg-gradient-to-r from-purple-700 to-indigo-600 dark:from-purple-400 dark:to-indigo-300 bg-clip-text text-transparent">
                Cognitio Libera
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-2">
            {[
              { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
              { label: 'Practice', path: '/practice', icon: Code2 },
              { label: 'AI Mentor', path: '/mentor', icon: Sparkles },
              { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
              { label: 'Profile', path: '/profile', icon: User },
              { label: 'Settings', path: '/settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                      isActive
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-purple-600" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <TopBar
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
          greeting={greeting}
          subtitle={subtitle}
        />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
