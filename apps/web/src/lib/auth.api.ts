import { apiGet, apiPost, apiPut } from './api-client';
import {
  registerRequestSchema,
  registerResponseSchema,
  loginRequestSchema,
  loginResponseSchema,
  refreshRequestSchema,
  refreshResponseSchema,
  logoutRequestSchema,
  emptySuccessSchema,
  meResponseSchema,
  updateProfileRequestSchema,
  updateProfileResponseSchema,
  changePasswordRequestSchema,
  changePasswordResponseSchema,
  forgotPasswordRequestSchema,
  forgotPasswordResponseSchema,
  resetPasswordRequestSchema,
  resetPasswordResponseSchema,
} from './schemas/auth';
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  LogoutRequest,
  MeResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from './schemas/auth';

export function register(input: RegisterRequest): Promise<RegisterResponse> {
  return apiPost('/api/v1/auth/register', input, registerRequestSchema, registerResponseSchema);
}

export function login(input: LoginRequest): Promise<LoginResponse> {
  return apiPost('/api/v1/auth/login', input, loginRequestSchema, loginResponseSchema);
}

export function adminLogin(input: LoginRequest): Promise<LoginResponse> {
  return apiPost('/api/v1/auth/admin-login', input, loginRequestSchema, loginResponseSchema);
}

export function refresh(input: RefreshRequest): Promise<RefreshResponse> {
  return apiPost('/api/v1/auth/refresh', input, refreshRequestSchema, refreshResponseSchema);
}

export function logout(input: LogoutRequest): Promise<void> {
  return apiPost('/api/v1/auth/logout', input, logoutRequestSchema, emptySuccessSchema).then(() => undefined);
}

export function getMe(): Promise<MeResponse> {
  return apiGet('/api/v1/auth/me', meResponseSchema);
}

export function updateProfile(input: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  return apiPut('/api/v1/auth/me', input, updateProfileRequestSchema, updateProfileResponseSchema);
}

export function changePassword(input: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  return apiPost('/api/v1/auth/change-password', input, changePasswordRequestSchema, changePasswordResponseSchema);
}

export function forgotPassword(input: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  return apiPost('/api/v1/auth/forgot-password', input, forgotPasswordRequestSchema, forgotPasswordResponseSchema);
}

export function resetPassword(input: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  return apiPost('/api/v1/auth/reset-password', input, resetPasswordRequestSchema, resetPasswordResponseSchema);
}
