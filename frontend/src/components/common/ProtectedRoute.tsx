/**
 * Protected Route Guard Component.
 *
 * WHAT IT IS:
 *   Guards authenticated routes by checking the active user session.
 *
 * WHY WE USE IT:
 *   Ensures that only logged-in users can access Practice, Dashboard, Workspaces, etc.
 *   If unauthenticated, redirects to the landing page with the login modal triggered.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0c0e15] gap-3">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to landing page and preserve requested destination
    const target = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/?auth=login&redirect=${target}`} replace />;
  }

  return <>{children}</>;
};
