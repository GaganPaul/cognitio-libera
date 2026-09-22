/**
 * Root Application Router & State Providers.
 *
 * WHAT IT IS:
 *   Configures React Router, TanStack QueryClientProvider, ThemeProvider,
 *   and AuthProvider for the entire single-page application.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './hooks/useAuth';
import { AppLayout } from './layouts/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { PracticePage } from './pages/PracticePage';
import { CodingWorkspacePage } from './pages/CodingWorkspacePage';
import { QuizWorkspacePage } from './pages/QuizWorkspacePage';
import { MentorPage } from './pages/MentorPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

import { ProtectedRoute } from './components/common/ProtectedRoute';

// Create TanStack Query Client with caching defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Landing & Auth Flow */}
              <Route path="/" element={<LandingPage />} />

              {/* Assessment Workspaces (Protected) */}
              <Route path="/practice/coding/:id" element={<ProtectedRoute><CodingWorkspacePage /></ProtectedRoute>} />
              <Route path="/coding/:id" element={<ProtectedRoute><CodingWorkspacePage /></ProtectedRoute>} />
              <Route path="/practice/quiz" element={<ProtectedRoute><QuizWorkspacePage /></ProtectedRoute>} />
              <Route path="/quiz" element={<ProtectedRoute><QuizWorkspacePage /></ProtectedRoute>} />

              {/* Authenticated Platform Layout (Protected) */}
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/practice" element={<PracticePage />} />
                <Route path="/mentor" element={<MentorPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
