import { z } from 'zod';

export const apiErrorDetailsSchema = z.record(z.array(z.string())).optional();

export const apiErrorEnvelopeSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: apiErrorDetailsSchema,
  }),
  meta: z.null(),
});

export type ApiErrorEnvelope = z.infer<typeof apiErrorEnvelopeSchema>;
