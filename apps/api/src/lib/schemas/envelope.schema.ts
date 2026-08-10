import { z } from 'zod';

export const offsetPaginationMetaSchema = z.object({
  page: z.number().int().positive(),
  perPage: z.number().int().positive().max(100),
  total: z.number().int().nonnegative(),
});

export const cursorPaginationMetaSchema = z.object({
  nextCursor: z.string(),
  hasMore: z.boolean(),
});

export const paginationMetaSchema = z.union([
  offsetPaginationMetaSchema,
  cursorPaginationMetaSchema,
]);

export const errorDetailsSchema = z.record(z.array(z.string()));

export const errorEnvelopeSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: errorDetailsSchema.optional(),
  }),
  meta: z.null(),
});

export function successEnvelopeSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z.union([paginationMetaSchema, z.null()]).optional(),
  });
}
