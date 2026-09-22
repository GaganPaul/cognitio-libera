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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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
 * @param endpoint - Relative API endpoint path (e.g. '/problems' or '/execution/submit').
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

  if (!response.ok) {
    let errorDetail = 'Request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = response.statusText;
    }
    throw new ApiError(errorDetail, response.status);
  }

  // Handle empty 204 No Content responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
