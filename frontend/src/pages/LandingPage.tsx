/**
 * Landing Page Component.
 *
 * WHAT IT IS:
 *   The public welcome page faithfully replicating the reference UI kit (Images 4 & 5).
 *
 * WHY WE USE IT:
 *   Introduces the product value proposition, showcases the student hero visual,
 *   embeds the quick-login / signup modal card, and outlines the platform features.
 *
 * REPLACES:
 *   Replaces all legacy branding with Cognitio Libera ("Practice. Understand. Improve.").
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, useSearchParams } from 'react-router-dom';
import {
  Code2,
  BookOpen,
  Sparkles,
  Trophy,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';

export interface LandingPageProps {
  defaultAuthMode?: 'login' | 'signup';
}

export const LandingPage: React.FC<LandingPageProps> = ({ defaultAuthMode }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, signOut } = useAuth();

  // Auth modal card state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const authParam = searchParams.get('auth');
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) {
      setRedirectPath(redirectParam);
    }
    if (defaultAuthMode === 'signup' || authParam === 'signup') {
      setIsSignUp(true);
      setShowAuthModal(true);
    } else if (defaultAuthMode === 'login' || authParam === 'login') {
      setIsSignUp(false);
      setShowAuthModal(true);
    }
  }, [defaultAuthMode, searchParams]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (isSignUp) {
        await signUp({
          email,
          password,
          fullName: fullName.trim() || undefined,
          username: fullName.trim() ? fullName.trim().toLowerCase().replace(/\s+/g, '_') : email.split('@')[0],
        });
      } else {
        await signIn(email, password);
      }
      setShowAuthModal(false);
      const target = redirectPath || '/dashboard';
      navigate(target);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Authentication failed. Please check credentials.';
      setAuthError(errorMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pastel-mesh text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-purple-500/20">
            CL
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-300 bg-clip-text text-transparent">
              Cognitio
            </span>
            <span className="block text-xs font-semibold text-slate-400 tracking-wider uppercase -mt-1">
              Libera
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-6">
          <button
            onClick={() => {
              if (user) {
                navigate('/practice');
              } else {
                setRedirectPath('/practice');
                setIsSignUp(false);
                setShowAuthModal(true);
              }
            }}
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors hidden sm:block"
          >
            Practice
          </button>
          <a
            href="#features"
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors hidden sm:block"
          >
            Explore
          </a>

          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm shadow-md shadow-purple-500/25 hover:opacity-95 hover:scale-[1.02] transition-all"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => signOut()}
                className="p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Log Out"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setRedirectPath('/practice');
                  setIsSignUp(false);
                  setShowAuthModal(true);
                }}
                className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline px-3 py-1.5"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setRedirectPath('/practice');
                  setIsSignUp(true);
                  setShowAuthModal(true);
                }}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm shadow-md shadow-purple-500/25 hover:opacity-95 hover:scale-[1.02] transition-all"
              >
                Sign Up
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section (Matching Reference Image 4) */}
      <section className="max-w-7xl mx-auto px-6 pt-6 pb-16 relative overflow-hidden">
        {/* Decorative background torus rings */}
        <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full border-[12px] border-purple-400/20 pointer-events-none -z-10 animate-pulse" />
        <div className="absolute bottom-10 right-1/4 w-40 h-40 rounded-full border-[16px] border-indigo-400/15 pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline and Call-to-Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Practice. Understand. Improve.
            </div>

            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              A <span className="bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">New Way</span> To Learn
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-xl font-normal leading-relaxed">
              Cognitio Libera is the AI-powered platform to help you enhance your skills, expand your computer science knowledge, and prepare for technical interviews.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {user ? (
                <button
                  onClick={() => navigate('/practice')}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-base shadow-lg shadow-purple-500/30 hover:scale-[1.02] transition-transform flex items-center gap-2"
                >
                  <span>Go to Practice Arena</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setRedirectPath('/practice');
                    setIsSignUp(true);
                    setShowAuthModal(true);
                  }}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-base shadow-lg shadow-purple-500/30 hover:scale-[1.02] transition-transform flex items-center gap-2"
                >
                  <span>Start Practicing Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => {
                  if (user) {
                    navigate('/practice');
                  } else {
                    setRedirectPath('/practice');
                    setIsSignUp(false);
                    setShowAuthModal(true);
                  }
                }}
                className="px-8 py-4 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-base hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Explore Curriculum
              </button>
            </div>

            {/* Quick Benefits Bullet points */}
            <div className="pt-6 grid grid-cols-2 gap-4 max-w-md text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Gemini AI Code Evaluator</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Google Gemini AI Mentor</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>20+ Algorithmic Challenges</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>50+ Conceptual MCQs</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with Student & Floating Badges (Matching Reference Image 4) */}
          <div className="lg:col-span-5 relative flex items-center justify-center pt-4 lg:pt-0">
            <div className="relative w-full max-w-md flex items-center justify-center">
              {/* Decorative Torus Rings around Student */}
              <div className="absolute -top-6 -left-6 w-36 h-36 rounded-full border-[14px] border-purple-400/30 dark:border-purple-600/20 pointer-events-none -z-10 animate-pulse" />
              <div className="absolute -bottom-8 -right-8 w-44 h-44 rounded-full border-[18px] border-indigo-400/25 dark:border-indigo-600/15 pointer-events-none -z-10" />

              {/* Floating Pill Badge: Top Left (Gemini AI Mentor) */}
              <div className="absolute -top-3 left-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-200/80 dark:border-slate-700/80 z-20 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="font-bold text-xs text-slate-800 dark:text-slate-100">Gemini Socratic AI</span>
              </div>

              {/* Floating Pill Badge: Mid-Right ("Test" in Figma / "CS Quizzes") */}
              <div className="absolute top-1/3 -right-4 sm:-right-8 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-xl border border-slate-200/80 dark:border-slate-700/80 z-20 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">CS Quizzes</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">50+ Conceptual MCQs</p>
                </div>
              </div>

              {/* Floating Pill Badge: Bottom-Left ("Courses" in Figma / "Coding Arena") */}
              <div className="absolute bottom-10 -left-4 sm:-left-8 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-xl border border-slate-200/80 dark:border-slate-700/80 z-20 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">Coding Arena</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">20+ Algorithmic Challenges</p>
                </div>
              </div>

              {/* Logged in Quick Status Pill */}
              {user && (
                <div
                  onClick={() => navigate('/dashboard')}
                  className="absolute -bottom-4 right-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2 rounded-full shadow-xl z-20 flex items-center gap-2 hover:scale-105 transition-transform text-xs font-bold cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-emerald-300" />
                  <span>Welcome back, {user.username || 'Student'}!</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Student Hero Visual Asset */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/60 dark:border-slate-800 max-w-sm sm:max-w-md bg-white/20 dark:bg-slate-900/30 backdrop-blur-xs">
                <img
                  src="/assets/student_hero.jpg"
                  alt="Student learning coding on Cognitio Libera"
                  className="w-full h-auto object-cover max-h-[500px] transition-transform duration-500 hover:scale-[1.02]"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Auth Modal (Matching Reference Image 5) */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAuthModal(false);
          }}
        >
          <div className="relative w-full max-w-md">
            <div className="glass-card p-8 rounded-3xl shadow-2xl w-full border border-purple-200/60 dark:border-purple-900/40 relative z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
              {/* Close Modal Button */}
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 mx-auto flex items-center justify-center text-white font-bold text-xl mb-3 shadow-md shadow-purple-500/25">
                  CL
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isSignUp ? 'Create your Account' : 'Welcome Back'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isSignUp
                    ? 'Start your journey with free interactive practice'
                    : 'Sign in to access your dashboard & streak'}
                </p>
              </div>

              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-purple-500/25 hover:opacity-95 hover:scale-[1.01] transition-all disabled:opacity-50"
                >
                  {authLoading ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Log In'}
                </button>
              </form>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                >
                  {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
                </button>
                {!isSignUp && (
                  <span
                    onClick={async () => {
                      if (!email.trim()) {
                        setAuthError('Please enter your email address above to receive a password reset link.');
                        return;
                      }
                      try {
                        const { error } = await supabase.auth.resetPasswordForEmail(email);
                        if (error) throw error;
                        setAuthError('Password reset link sent! Please check your email inbox.');
                      } catch (err: unknown) {
                        setAuthError(err instanceof Error ? err.message : 'Failed to send reset link.');
                      }
                    }}
                    className="hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Highlights Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Engineered for Deep Understanding
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-base">
            No mockups. Every button, execution sandbox, and AI mentor guidance works in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="glass-card p-8 rounded-3xl hover:border-purple-300 dark:hover:border-purple-800 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-6">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Gemini AI Code Evaluator
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Real-time code execution simulation and test suite grading powered by Google Gemini. Supports Python, C++, Java, and JavaScript with precise runtime and memory metrics.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card p-8 rounded-3xl hover:border-purple-300 dark:hover:border-purple-800 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Google Gemini AI Mentor
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Progressive hints ensure you never get stuck while preventing spoilers. Receive structured Big-O complexity analysis and educational suggestions.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card p-8 rounded-3xl hover:border-purple-300 dark:hover:border-purple-800 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 flex items-center justify-center mb-6">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Topic Mastery & Streaks
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Every solved problem and quiz attempt updates your Supabase PostgreSQL progress, tracking topic-by-topic mastery and streaks without fake statistics.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-10 text-center text-xs text-slate-500 dark:text-slate-400">
        <p className="font-semibold text-slate-700 dark:text-slate-300">Cognitio Libera</p>
        <p className="mt-1">Practice. Understand. Improve.</p>
        <p className="mt-4">Built with React, Vite, FastAPI, Supabase PostgreSQL, and Google Gemini.</p>
      </footer>
    </div>
  );
};
