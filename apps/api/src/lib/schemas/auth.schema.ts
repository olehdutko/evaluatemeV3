import { z } from 'zod';
import { successEnvelopeSchema } from './envelope.schema';

export const userRoleSchema = z.enum(['user', 'company', 'admin']);

export const registerRequestSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  role: userRoleSchema,
});

export const registerResponseSchema = successEnvelopeSchema(
  z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: userRoleSchema,
    activationStatus: z.enum(['pending', 'active', 'suspended']),
    createdAt: z.string().datetime(),
  }),
);

export const loginRequestSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(100),
});

export const loginResponseSchema = successEnvelopeSchema(
  z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresInSeconds: z.number().int().positive(),
  }),
);

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
