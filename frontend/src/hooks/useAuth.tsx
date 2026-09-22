/**
 * Authentication Context and Hook.
 *
 * WHAT IT IS:
 *   Provides global authentication state, current user profile, and methods
 *   for signing in, signing up, and logging out.
 *
 * WHY WE USE IT:
 *   Components anywhere in the React tree can access the logged-in user, protect
 *   routes, and trigger auth state updates without prop drilling.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { authService, AuthCredentials } from '../services/authService';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (credentials: AuthCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Fetches user profile from the backend using the current active Supabase or dev session.
   */
  const loadActiveProfile = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Check if developer mode session is active
        const devToken = localStorage.getItem('cognitio_dev_token');
        if (devToken) {
          try {
            const profile = await authService.getCurrentUserProfile();
            setUser(profile);
            return;
          } catch {
            const cached = localStorage.getItem('cognitio_dev_profile');
            if (cached) {
              try {
                setUser(JSON.parse(cached));
                return;
              } catch {}
            }
          }
        }
        setUser(null);
        return;
      }
      let profile: UserProfile | null = null;
      try {
        profile = await authService.getCurrentUserProfile();
      } catch (profileErr) {
        console.warn('Could not fetch profile from backend, falling back to session user:', profileErr);
        const sUser = session.user;
        profile = {
          id: sUser.id,
          email: sUser.email || 'user@example.com',
          username: sUser.user_metadata?.username || sUser.email?.split('@')[0] || 'User',
          full_name: sUser.user_metadata?.full_name || sUser.email?.split('@')[0] || 'User',
          preferred_language: 'python',
          preferred_difficulty: 'Medium',
          theme: 'light',
          created_at: sUser.created_at || new Date().toISOString(),
        };
      }
      setUser(profile);
    } catch {
      const devToken = localStorage.getItem('cognitio_dev_token');
      const cached = localStorage.getItem('cognitio_dev_profile');
      if (devToken && cached) {
        try {
          setUser(JSON.parse(cached));
          return;
        } catch {}
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveProfile();

    // Listen to Supabase auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await loadActiveProfile();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const profile = await authService.signIn(email, password);
      setUser(profile);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (credentials: AuthCredentials) => {
    setLoading(true);
    try {
      const profile = await authService.signUp(credentials);
      setUser(profile);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await loadActiveProfile();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
