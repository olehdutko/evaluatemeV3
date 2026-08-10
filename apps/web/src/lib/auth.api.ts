import { apiPost } from './api-client';
import {
  registerRequestSchema,
  registerResponseSchema,
  loginRequestSchema,
  loginResponseSchema,
  refreshRequestSchema,
  refreshResponseSchema,
  logoutRequestSchema,
  emptySuccessSchema,
} from './schemas/auth';
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  LogoutRequest,
} from './schemas/auth';

export function register(input: RegisterRequest): Promise<RegisterResponse> {
  return apiPost('/api/v1/auth/register', input, registerRequestSchema, registerResponseSchema);
}

export function login(input: LoginRequest): Promise<LoginResponse> {
  return apiPost('/api/v1/auth/login', input, loginRequestSchema, loginResponseSchema);
}

export function refresh(input: RefreshRequest): Promise<RefreshResponse> {
  return apiPost('/api/v1/auth/refresh', input, refreshRequestSchema, refreshResponseSchema);
}

export function logout(input: LogoutRequest): Promise<void> {
  return apiPost('/api/v1/auth/logout', input, logoutRequestSchema, emptySuccessSchema).then(() => undefined);
}
