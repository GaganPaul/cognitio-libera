/**
 * HTTP API Client Wrapper.
 *
 * WHAT IT IS:
 *   A centralized HTTP request utility that wraps `fetch` to automatically append
 *   Supabase authentication tokens, parse JSON responses, and normalize error states.
 *
 * WHY WE USE IT:
 *   Instead of writing raw `fetch()` calls with duplicated headers across components,
 *   all API communications flow through this typed client.
 *
 * SECURITY:
 *   Retrieves the current Supabase session token dynamically from storage and attaches
 *   it as a Bearer token.
 */

import { supabase } from './supabaseClient';

/**
 * Resolves the backend API base URL dynamically.
 * Handles Render deployment environments where VITE_API_BASE_URL might be
 * an internal Docker service name ('cognitio-backend') or absent.
 */
function resolveApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();

  // If set to Render's internal service name or incomplete hostname
  if (envUrl === 'cognitio-backend' || envUrl === 'cognitio-backend.onrender.com') {
    return 'https://cognitio-backend.onrender.com/api/v1';
  }

  // If a custom URL is provided in the environment
  if (envUrl) {
    let formatted = envUrl;
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = `https://${formatted}`;
    }
    formatted = formatted.replace(/\/+$/, '');
    if (!formatted.endsWith('/api/v1')) {
      formatted = `${formatted}/api/v1`;
    }
    return formatted;
  }

  // In production running on Render, automatically route to the public backend service
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.onrender.com')) {
    return 'https://cognitio-backend.onrender.com/api/v1';
  }

  // Local development default
  return 'http://localhost:8000/api/v1';
}

export const API_BASE_URL = resolveApiBaseUrl();

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Performs an authenticated HTTP request to the FastAPI backend.
 *
 * @param endpoint - Relative API endpoint path (e.g. '/problems' or '/auth/sync').
 * @param options - Standard fetch RequestInit options.
 * @returns Parsed JSON response.
 */
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  // Attach Supabase access token if session is active
  let token: string | null = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token || null;
  } catch {
    token = null;
  }

  // Support local developer mode session if active
  if (!token) {
    try {
      token = localStorage.getItem('cognitio_dev_token');
    } catch {
      token = null;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Read response as text first to safely inspect content before JSON parsing
  let text = '';
  try {
    text = await response.text();
  } catch {
    text = '';
  }

  if (!response.ok) {
    let errorDetail = response.statusText || `Request failed with status ${response.status}`;
    if (text) {
      try {
        const errJson = JSON.parse(text);
        errorDetail = errJson.detail || errJson.message || errJson.error || errorDetail;
      } catch {
        if (text.length < 200 && !text.includes('<!doctype') && !text.includes('<html')) {
          errorDetail = text.trim();
        }
      }
    }
    throw new ApiError(errorDetail, response.status);
  }

  // Handle empty 204 No Content responses or empty body
  if (response.status === 204 || !text.trim()) {
    return {} as T;
  }

  // If server returned HTML (e.g. Render SPA rewrite fallback or 502/504 gateway page)
  if (text.includes('<!doctype') || text.includes('<html')) {
    throw new ApiError(
      'Received an HTML page instead of API JSON. The backend service may still be spinning up or unreachable.',
      response.status
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError('Failed to parse API server response as JSON.', response.status);
  }
}
