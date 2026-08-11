import { z } from 'zod';
import { successEnvelopeSchema } from './envelope.schema';

export const userRoleSchema = z.enum(['user', 'company', 'admin']);

export const publicUserRoleSchema = z.enum(['user', 'company']);

export const registerRequestSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  role: publicUserRoleSchema,
  username: z.string().min(2).max(100).optional(),
});

export const registerResponseSchema = successEnvelopeSchema(
  z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    username: z.string().min(1).max(100).nullable(),
    role: userRoleSchema,
    activationStatus: z.enum(['pending', 'active', 'suspended']),
    credits: z.number().int().min(0),
    createdAt: z.string().datetime(),
  }),
);

export const loginRequestSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(100),
});

export const loginResponseSchema = successEnvelopeSchema(
  z.object({
    expiresInSeconds: z.number().int().positive(),
  }),
);

export const refreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const refreshResponseSchema = loginResponseSchema;

export const logoutRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutResponseSchema = successEnvelopeSchema(z.object({}));

export const meResponseSchema = successEnvelopeSchema(
  z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    username: z.string().min(1).max(100).nullable(),
    role: userRoleSchema,
    credits: z.number().int().min(0),
  }),
);

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;
export type RefreshResponse = z.infer<typeof refreshResponseSchema>;
export type LogoutRequest = z.infer<typeof logoutRequestSchema>;
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;
