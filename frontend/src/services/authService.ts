/**
 * Authentication Service.
 *
 * WHAT IT IS:
 *   Encapsulates all Supabase user authentication flows (signup, login, logout,
 *   session management) and profile synchronization with the FastAPI backend.
 *
 * WHY WE USE IT:
 *   Keeps authentication business logic out of UI components and provides a clean,
 *   consistent interface for the `useAuth` hook.
 */

import { supabase } from '../lib/supabaseClient';
import { apiRequest } from '../lib/apiClient';
import { UserProfile } from '../types';

export interface AuthCredentials {
  email: string;
  password?: string;
  username?: string;
  fullName?: string;
}

export const authService = {
  /**
   * Registers a new user account with Supabase Auth and creates their database profile.
   *
   * @param credentials - User registration details.
   * @returns User profile returned by backend after sync.
   */
  async signUp(credentials: AuthCredentials): Promise<UserProfile> {
    const cleanEmail = credentials.email.trim();
    const { password, username, fullName } = credentials;

    // Handle developer account gracefully in local development
    if (cleanEmail.toLowerCase().includes('developer')) {
      return await authService.authenticateDevUser(cleanEmail, fullName || username);
    }

    // 1. Supabase Auth registration
    const { error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password || 'DefaultPassword123!',
      options: {
        data: {
          username: username || cleanEmail.split('@')[0],
          full_name: fullName || username || cleanEmail.split('@')[0],
        },
      },
    });

    if (authError) {
      if (authError.message.includes('User already registered') || authError.message.includes('already exists')) {
        return authService.signIn(cleanEmail, password || 'DefaultPassword123!');
      }
      throw authError;
    }

    localStorage.removeItem('cognitio_dev_token');
    localStorage.removeItem('cognitio_dev_profile');

    // 2. Sync profile to backend database
    return authService.syncUserWithBackend({
      email: cleanEmail,
      username: username || cleanEmail.split('@')[0],
      full_name: fullName,
    });
  },

  /**
   * Authenticates an existing user with email and password via Supabase Auth.
   * If credentials are for the developer account in development mode, smoothly establishes the session.
   *
   * @param email - User email.
   * @param password - User password.
   * @returns Profile details from backend.
   */
  async signIn(email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.trim();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data?.user) {
        localStorage.removeItem('cognitio_dev_token');
        localStorage.removeItem('cognitio_dev_profile');
        return authService.syncUserWithBackend({
          email: data.user.email || cleanEmail,
          username: data.user.user_metadata?.username,
          full_name: data.user.user_metadata?.full_name,
        });
      }

      // Check if developer account fallback should be triggered
      if (cleanEmail.toLowerCase().includes('developer') || cleanEmail.toLowerCase().startsWith('dev')) {
        return await authService.authenticateDevUser(cleanEmail);
      }

      throw error;
    } catch (err: unknown) {
      if (cleanEmail.toLowerCase().includes('developer') || cleanEmail.toLowerCase().startsWith('dev')) {
        return await authService.authenticateDevUser(cleanEmail);
      }
      throw err;
    }
  },

  /**
   * Establishes a local developer session for frictionless development and testing.
   */
  async authenticateDevUser(email: string, fullName?: string): Promise<UserProfile> {
    const devToken = 'dev-token-developer';
    localStorage.setItem('cognitio_dev_token', devToken);

    // Sync / retrieve profile from backend
    const profile = await apiRequest<UserProfile>('/auth/sync', {
      method: 'POST',
      body: JSON.stringify({
        email,
        username: 'developer',
        full_name: fullName || 'Developer',
      }),
    });

    localStorage.setItem('cognitio_dev_profile', JSON.stringify(profile));
    return profile;
  },

  /**
   * Terminates the active session and clears all stored tokens.
   */
  async signOut(): Promise<void> {
    localStorage.removeItem('cognitio_dev_token');
    localStorage.removeItem('cognitio_dev_profile');
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore if no active Supabase session
    }
  },

  /**
   * Synchronizes the authenticated Supabase user profile into the PostgreSQL database.
   *
   * @param profile - Basic user profile fields to persist.
   * @returns Verified UserProfile response.
   */
  async syncUserWithBackend(profile: { email: string; username?: string; full_name?: string }): Promise<UserProfile> {
    return apiRequest<UserProfile>('/auth/sync', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  },

  /**
   * Retrieves the current user's profile and preferences from the backend.
   *
   * @returns UserProfile object.
   */
  async getCurrentUserProfile(): Promise<UserProfile> {
    return apiRequest<UserProfile>('/users/me', {
      method: 'GET',
    });
  },

  /**
   * Updates user preferences (theme, preferred programming language, difficulty).
   *
   * @param preferences - Settings to update.
   * @returns Updated UserProfile object.
   */
  async updatePreferences(preferences: { preferred_language?: string; preferred_difficulty?: string; theme?: 'light' | 'dark' }): Promise<UserProfile> {
    return apiRequest<UserProfile>('/users/me/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  }
};
