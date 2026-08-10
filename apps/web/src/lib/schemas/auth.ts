import { z } from 'zod';

export const userRoleSchema = z.enum(['user', 'company', 'admin']);

export const registerRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: userRoleSchema,
});

export const registerResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: userRoleSchema,
    activationStatus: z.enum(['pending', 'active', 'suspended']),
    createdAt: z.string().datetime(),
  }),
});

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(100),
});

export const tokensResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresInSeconds: z.number().int().positive(),
  }),
});

export const refreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const emptySuccessSchema = z.object({
  success: z.literal(true),
  data: z.object({}),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type TokensResponse = z.infer<typeof tokensResponseSchema>;
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;
export type LogoutRequest = z.infer<typeof logoutRequestSchema>;
