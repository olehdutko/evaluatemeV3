import { z } from 'zod';
import { successEnvelopeSchema } from './envelope.schema';

export const technologySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const technologyResponseSchema = successEnvelopeSchema(
  z.array(technologySchema),
);

export type TechnologyResponse = z.infer<typeof technologyResponseSchema>;

export const technologyDetailResponseSchema = successEnvelopeSchema(
  technologySchema,
);

export type TechnologyDetailResponse = z.infer<typeof technologyDetailResponseSchema>;

export const sampleAnswerSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  orderIndex: z.number().int(),
});

export const sampleQuestionSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  type: z.enum(['single', 'multiple']),
  answers: z.array(sampleAnswerSchema),
});

export const technologyPreviewSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  questionCount: z.number().int().min(1),
  durationMinutes: z.number().int().min(1),
  price: z.number().int().min(0),
  sampleQuestion: sampleQuestionSchema.nullable(),
});

export const technologyPreviewResponseSchema = successEnvelopeSchema(
  technologyPreviewSchema,
);

export type TechnologyPreviewResponse = z.infer<typeof technologyPreviewResponseSchema>;
