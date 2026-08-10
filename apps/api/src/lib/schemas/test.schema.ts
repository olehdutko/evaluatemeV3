import { z } from 'zod';
import { successEnvelopeSchema } from './envelope.schema';
import { offsetPaginationMetaSchema } from './envelope.schema';

export const testStatusSchema = z.enum(['draft', 'published', 'archived']);

export const testSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  technologyId: z.string().uuid(),
  status: testStatusSchema,
  durationMinutes: z.number().int().nonnegative().nullable(),
  passingScore: z.number().int().nonnegative().nullable(),
  createdByUserId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createTestRequestSchema = z.object({
  title: z.string().min(1).max(255),
  technologyId: z.string().uuid(),
  durationMinutes: z.number().int().nonnegative().optional(),
  passingScore: z.number().int().nonnegative().optional(),
});

export const listTestsResponseSchema = successEnvelopeSchema(
  z.array(testSchema),
).extend({
  meta: z.union([offsetPaginationMetaSchema, z.null()]),
});

export const singleTestResponseSchema = successEnvelopeSchema(testSchema);

export type TestDto = z.infer<typeof testSchema>;
export type CreateTestRequest = z.infer<typeof createTestRequestSchema>;
export type ListTestsResponse = z.infer<typeof listTestsResponseSchema>;
export type SingleTestResponse = z.infer<typeof singleTestResponseSchema>;
