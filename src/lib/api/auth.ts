import { apiPost } from './client';
import type { AuthResponse, LoginRequest, RegisterRequest, RefreshRequest, LogoutRequest } from './types';

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiPost<{ success: boolean; data: AuthResponse }>('/auth/login', data, false);
  return response.data;
}

export async function registerApi(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiPost<{ success: boolean; data: AuthResponse }>('/auth/register', data, false);
  return response.data;
}

export async function refreshTokenApi(data: RefreshRequest): Promise<AuthResponse> {
  const response = await apiPost<{ success: boolean; data: AuthResponse }>('/auth/refresh', data, false);
  return response.data;
}

export async function logoutApi(data: LogoutRequest): Promise<void> {
  await apiPost<{ success: boolean; data: void }>('/auth/logout', data, true);
}
