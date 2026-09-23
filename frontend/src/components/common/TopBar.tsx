/**
 * TopBar Header Component.
 *
 * WHAT IT IS:
 *   The persistent top navigation bar matching the reference UI kit design (Image 3).
 *
 * WHY WE USE IT:
 *   Hosts global search, notification alerts, user profile dropdown, and mobile navigation toggles.
 */

import React, { useState } from 'react';
import { Search, Bell, Menu, Sparkles, CheckCircle2, Flame, Award } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { NavLink, useNavigate } from 'react-router-dom';
import { formatUserName } from '../../lib/formatters';

interface TopBarProps {
  onMobileMenuToggle?: () => void;
  greeting?: string;
  subtitle?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onMobileMenuToggle,
  greeting,
  subtitle
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { firstName, fullName, greeting: defaultGreeting } = formatUserName(user);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/practice?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const sampleNotifications = [
    { id: 1, title: 'Streak Active!', desc: 'You are on a 3-day practice streak. Keep going!', icon: Flame, color: 'text-amber-500' },
    { id: 2, title: 'National Coding Olympiad', desc: 'Upcoming contest this Saturday at 10:00 AM UTC.', icon: Award, color: 'text-purple-500' },
    { id: 3, title: 'Gemini Code Evaluator', desc: 'Real-time AI validation is active for all programming challenges.', icon: CheckCircle2, color: 'text-emerald-500' },
  ];

  return (
    <header className="w-full flex items-center justify-between gap-4 py-4 px-6 md:px-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-[#11131c]/60 backdrop-blur-md sticky top-0 z-30 transition-colors">
      {/* Left: Greeting or Mobile Hamburger */}
      <div className="flex items-center gap-4">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {greeting || defaultGreeting}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            {subtitle || 'Here is your Profile Dashboard'}
          </p>
        </div>
      </div>

      {/* Right: Search, Notifications, Avatar */}
      <div className="flex items-center gap-3 md:gap-5 relative">
        {/* Search Bar matching UI Kit */}
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search problems, topics (Enter)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-48 lg:w-64 pl-9 pr-4 py-2 text-sm bg-slate-100/90 dark:bg-slate-800/80 border border-transparent focus:border-purple-500 dark:focus:border-purple-400 rounded-full text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>

        {/* Notifications Icon & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-white dark:ring-[#11131c]" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#151724] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3 z-50 animate-scaleUp">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-500">Notifications</span>
                <span className="text-[11px] text-purple-600 font-semibold cursor-pointer" onClick={() => setNotificationsOpen(false)}>
                  Close
                </span>
              </div>
              <div className="space-y-2">
                {sampleNotifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-start gap-3 transition-colors">
                      <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 ${n.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{n.title}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{n.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* AI Mentor Quick Link */}
        <NavLink
          to="/mentor"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Mentor</span>
        </NavLink>

        {/* User Profile Avatar */}
        <NavLink
          to="/profile"
          className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 hover:opacity-90 transition-opacity"
          title={fullName}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-purple-500/20">
            {firstName.charAt(0).toUpperCase()}
          </div>
        </NavLink>
      </div>
    </header>
  );
};
