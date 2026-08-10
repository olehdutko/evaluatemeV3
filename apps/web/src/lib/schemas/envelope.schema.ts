import { z, ZodTypeAny } from 'zod';

export function successEnvelopeSchema<T extends ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
  });
}
