import { apiPost } from './api-client';
import {
  registerRequestSchema,
  registerResponseSchema,
  loginRequestSchema,
  tokensResponseSchema,
  refreshRequestSchema,
  logoutRequestSchema,
  emptySuccessSchema,
} from './schemas/auth';
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  TokensResponse,
  RefreshRequest,
  LogoutRequest,
} from './schemas/auth';

export function register(input: RegisterRequest): Promise<RegisterResponse> {
  return apiPost('/api/v1/auth/register', input, registerRequestSchema, registerResponseSchema);
}

export function login(input: LoginRequest): Promise<TokensResponse> {
  return apiPost('/api/v1/auth/login', input, loginRequestSchema, tokensResponseSchema);
}

export function refresh(input: RefreshRequest): Promise<TokensResponse> {
  return apiPost('/api/v1/auth/refresh', input, refreshRequestSchema, tokensResponseSchema);
}

export function logout(input: LogoutRequest): Promise<void> {
  return apiPost('/api/v1/auth/logout', input, logoutRequestSchema, emptySuccessSchema).then(() => undefined);
}
