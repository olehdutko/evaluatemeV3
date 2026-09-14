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

export const questionSetSummarySchema = z.object({
  success: z.literal(true),
  data: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(100),
      technologyId: z.string().uuid(),
      status: z.enum(['active', 'suspended']),
      quizQuestionCount: z.number().int().min(1).max(100),
      quizDurationMinutes: z.number().int().min(1).max(300),
      updatedAt: z.string().datetime(),
    }),
  ),
});

export const questionSetValueSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(100),
    technologyId: z.string().uuid(),
    status: z.enum(['active', 'suspended']),
    quizQuestionCount: z.number().int().min(1).max(100),
    quizDurationMinutes: z.number().int().min(1).max(300),
    updatedAt: z.string().datetime(),
  }),
});

export const createQuestionSetRequestSchema = z.object({
  technologyId: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().max(5000).nullable().optional(),
  quizQuestionCount: z.number().int().min(1).max(1000).optional(),
  quizDurationMinutes: z.number().int().min(1).max(300).optional(),
});

export const updateQuestionSetRequestSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  status: z.enum(['active', 'suspended']).optional(),
  description: z.string().max(5000).nullable().optional(),
  quizQuestionCount: z.number().int().min(1).max(1000).optional(),
  quizDurationMinutes: z.number().int().min(1).max(300).optional(),
});

export const questionSetWithQuestionsSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    title: z.string(),
    technologyId: z.string().uuid(),
    status: z.enum(['active', 'suspended']),
    quizQuestionCount: z.number().int(),
    quizDurationMinutes: z.number().int(),
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
  questionSetId: z.string().uuid(),
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
