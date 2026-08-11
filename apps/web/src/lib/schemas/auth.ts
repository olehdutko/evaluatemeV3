import { z } from 'zod';

export const userRoleSchema = z.enum(['user', 'company', 'admin']);

export const registerRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: userRoleSchema,
  username: z.string().min(2).max(100).optional(),
});

export const registerResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    username: z.string().min(1).max(100).nullable(),
    role: userRoleSchema,
    activationStatus: z.enum(['pending', 'active', 'suspended']),
    credits: z.number().int().min(0),
    createdAt: z.string().datetime(),
  }),
});

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(100),
});

export const loginResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    expiresInSeconds: z.number().int().positive(),
  }),
});

export const refreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const refreshResponseSchema = loginResponseSchema;

export const logoutRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const emptySuccessSchema = z.object({
  success: z.literal(true),
  data: z.object({}),
});

export const meResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    username: z.string().min(1).max(100).nullable(),
    role: userRoleSchema,
    credits: z.number().int().min(0),
  }),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;
export type RefreshResponse = z.infer<typeof refreshResponseSchema>;
export type LogoutRequest = z.infer<typeof logoutRequestSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;
