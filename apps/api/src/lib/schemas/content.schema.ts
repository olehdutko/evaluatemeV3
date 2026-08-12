import { z } from 'zod';

export const technologySummarySchema = z.object({
  success: z.literal(true),
  data: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string().min(1).max(100),
      slug: z.string().min(1).max(100),
      description: z.string().max(5000).nullable(),
      updatedAt: z.string().datetime(),
    }),
  ),
});

export const technologyValueSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(100),
    description: z.string().max(5000).nullable(),
    updatedAt: z.string().datetime(),
  }),
});

export const createTechnologyRequestSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(5000).nullable().optional(),
});

export const technologyWithQuestionsSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    questions: z.array(
      z.object({
        id: z.string().uuid(),
        content: z.string(),
        type: z.enum(['single', 'multiple']),
        orderIndex: z.number().int(),
        score: z.number().int(),
        answers: z.array(
          z.object({
            id: z.string().uuid(),
            content: z.string(),
            isCorrect: z.boolean(),
            orderIndex: z.number().int(),
          }),
        ),
      }),
    ),
  }),
});

export const answerInputSchema = z.object({
  id: z.string().uuid().optional(),
  content: z.string().min(1).max(500),
  isCorrect: z.boolean(),
  orderIndex: z.number().int().min(0),
});

export const saveQuestionRequestSchema = z.object({
  id: z.string().uuid().optional(),
  technologyId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  type: z.enum(['single', 'multiple']),
  orderIndex: z.number().int().min(0),
  score: z.number().int().min(1),
  answers: z.array(answerInputSchema).min(2),
});

export const questionValueSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    content: z.string(),
    updatedAt: z.string().datetime(),
  }),
});
