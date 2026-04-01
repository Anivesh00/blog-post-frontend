import { apiPost, ApiError } from '$lib/api/client';
import type { User, AuthResponse, LoginRequest, RegisterRequest, RefreshRequest } from '$lib/api/types';

// ─────────────────────────────────────────────────────────────────────────
// Backend response wrapper type
// ─────────────────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ─────────────────────────────────────────────────────────────────────────
// Auth State (Reactive object - only mutations, no reassignments)
// ─────────────────────────────────────────────────────────────────────────

export let authState = $state({
  user: null as User | null,
  accessToken: null as string | null,
  loading: false,
  error: null as string | null
});

// ─────────────────────────────────────────────────────────────────────────
// Getters for External Access
// ─────────────────────────────────────────────────────────────────────────

export function getUser(): User | null {
  return authState.user;
}

export function getAccessToken(): string | null {
  return authState.accessToken;
}

export function getIsAuthenticated(): boolean {
  return !!authState.user && !!authState.accessToken;
}

// ─────────────────────────────────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────────────────────────────────

export async function register(data: RegisterRequest): Promise<void> {
  authState.loading = true;
  authState.error = null;

  try {
    const raw = await apiPost<ApiResponse<AuthResponse>>('/auth/register', data, false);
    const response = raw.data;
    authState.user = response.user;
    authState.accessToken = response.accessToken;

    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
  } catch (err) {
    if (err instanceof ApiError) {
      authState.error = err.message;
    } else {
      authState.error = 'Registration failed';
    }
    throw err;
  } finally {
    authState.loading = false;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────────────────

export async function login(data: LoginRequest): Promise<void> {
  authState.loading = true;
  authState.error = null;

  try {
    const raw = await apiPost<ApiResponse<AuthResponse>>('/auth/login', data, false);
    const response = raw.data;
    authState.user = response.user;
    authState.accessToken = response.accessToken;

    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
  } catch (err) {
    if (err instanceof ApiError) {
      authState.error = err.message;
    } else {
      authState.error = 'Login failed';
    }
    throw err;
  } finally {
    authState.loading = false;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Refresh Token
// ─────────────────────────────────────────────────────────────────────────

export async function refreshToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const refreshTokenValue = localStorage.getItem('refreshToken');
  if (!refreshTokenValue) {
    logout();
    return null;
  }

  try {
    const raw = await apiPost<ApiResponse<AuthResponse>>(
      '/auth/refresh',
      { refreshToken: refreshTokenValue } as RefreshRequest,
      false
    );
    const response = raw.data;

    authState.user = response.user;
    authState.accessToken = response.accessToken;
    localStorage.setItem('refreshToken', response.refreshToken);
    return response.accessToken;
  } catch (err) {
    logout();
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  if (typeof window !== 'undefined') {
    const refreshTokenValue = localStorage.getItem('refreshToken');

    if (refreshTokenValue && authState.accessToken) {
      try {
        await apiPost('/auth/logout', { refreshToken: refreshTokenValue }, true);
      } catch {
        // Server logout failed, but clear local state anyway
      }
    }

    localStorage.removeItem('refreshToken');
  }

  authState.user = null;
  authState.accessToken = null;
  authState.error = null;
}

// ─────────────────────────────────────────────────────────────────────────
// Initialize Auth from localStorage
// ─────────────────────────────────────────────────────────────────────────

export async function initializeAuth(): Promise<void> {
  if (typeof window === 'undefined') return;

  const refreshTokenValue = localStorage.getItem('refreshToken');

  if (refreshTokenValue && !authState.accessToken) {
    try {
      const newToken = await refreshToken();
      if (!newToken) {
        logout();
      }
    } catch {
      logout();
    }
  }
}
