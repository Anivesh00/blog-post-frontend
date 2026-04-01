import { getAccessToken, refreshToken as refreshTokenAction } from '$lib/stores/auth.svelte';
import type { ErrorResponse } from './types';

const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'https://l3x9sj5t5l.execute-api.ap-south-1.amazonaws.com/dev';

// ─────────────────────────────────────────────────────────────────────────
// Token Refresh Queue — prevent concurrent refresh storms
// ─────────────────────────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function queueRefresh(callback: (token: string) => void) {
  refreshQueue.push(callback);
}

function processQueue(token: string) {
  for (const callback of refreshQueue) {
    callback(token);
  }
  refreshQueue = [];
}

// ─────────────────────────────────────────────────────────────────────────
// Central API Fetch Wrapper
// ─────────────────────────────────────────────────────────────────────────

export interface FetchOptions extends RequestInit {
  auth?: boolean; // inject Authorization header?
}

/**
 * Central fetch wrapper with:
 * - Automatic auth header injection
 * - 401 handling with token refresh + retry
 * - JSON response parsing
 * - Error normalization
 */
export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { auth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> || {})
  };

  // Inject access token if auth required
  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let response = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers
  });

  // ─────────────────────────────────────────────────────────────────────
  // 401 Handling: Try token refresh, then retry original request once
  // ─────────────────────────────────────────────────────────────────────
  if (response.status === 401 && auth) {
    if (!isRefreshing) {
      isRefreshing = true;

      try {
        // Attempt to refresh token
        const newToken = await refreshTokenAction();

        if (newToken) {
          // Update auth header with new token
          headers['Authorization'] = `Bearer ${newToken}`;

          // Process any queued requests with new token
          processQueue(newToken);

          // Retry original request
          response = await fetch(`${BASE_URL}${path}`, {
            ...fetchOptions,
            headers
          });
        } else {
          // Refresh failed, redirect to login (handled by refreshTokenAction)
          throw new Error('Session expired');
        }
      } finally {
        isRefreshing = false;
      }
    } else {
      // Already refreshing, queue this request
      return new Promise((resolve, reject) => {
        queueRefresh((token: string) => {
          headers['Authorization'] = `Bearer ${token}`;
          fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers })
            .then(res => {
              if (!res.ok) {
                throw normalizeError(res);
              }
              return res.json() as Promise<T>;
            })
            .then(resolve)
            .catch(reject);
        });
      });
    }
  }

  // Handle errors
  if (!response.ok) {
    throw await normalizeError(response);
  }

  // Parse and return JSON
  const data = await response.json() as T;
  return data;
}

// ─────────────────────────────────────────────────────────────────────────
// Error Normalization
// ─────────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function normalizeError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as ErrorResponse;
    return new ApiError(response.status, body.message || 'Unknown error', body);
  } catch {
    return new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Utility: JSON POST/PUT/DELETE
// ─────────────────────────────────────────────────────────────────────────

export async function apiPost<T>(
  path: string,
  body?: unknown,
  auth = true
): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    auth,
    body: body ? JSON.stringify(body) : undefined
  });
}

export async function apiPut<T>(
  path: string,
  body?: unknown,
  auth = true
): Promise<T> {
  return apiFetch<T>(path, {
    method: 'PUT',
    auth,
    body: body ? JSON.stringify(body) : undefined
  });
}

export async function apiDelete<T>(
  path: string,
  auth = true
): Promise<T> {
  return apiFetch<T>(path, {
    method: 'DELETE',
    auth
  });
}

export async function apiGet<T>(
  path: string,
  auth = false
): Promise<T> {
  return apiFetch<T>(path, {
    method: 'GET',
    auth
  });
}
