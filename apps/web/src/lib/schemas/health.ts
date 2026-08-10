import { z } from 'zod';

export const healthResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    status: z.literal('ok'),
    database: z.enum(['ok', 'error']),
    latencyMs: z.number().int().nonnegative(),
    timestamp: z.string().datetime(),
  }),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
