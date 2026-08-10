import { z } from 'zod';
import { successEnvelopeSchema } from './envelope.schema';

export const startTestRequestSchema = z.object({
  technologySlug: z.string().min(1).max(100),
});

export const startTestResponseSchema = successEnvelopeSchema(
  z.object({
    sessionId: z.string().uuid(),
    technology: z.object({
      id: z.string().uuid(),
      name: z.string(),
      slug: z.string(),
    }),
    questions: z.array(
      z.object({
        id: z.string().uuid(),
        testId: z.string().uuid(),
        content: z.string(),
        type: z.enum(['single', 'multiple']),
        orderIndex: z.number().int(),
        score: z.number().int(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      }),
    ),
  }),
);

export const submitAnswerRequestSchema = z.object({
  questionId: z.string().uuid(),
  answerId: z.string().uuid(),
});

export const submitAnswerResponseSchema = successEnvelopeSchema(
  z.object({
    isCorrect: z.boolean(),
    currentScore: z.number().int().min(0).max(100),
    totalAnswered: z.number().int(),
    nextQuestionIndex: z.number().int().nullable(),
    isComplete: z.boolean(),
  }),
);

export const testSessionStateResponseSchema = successEnvelopeSchema(
  z.object({
    sessionId: z.string().uuid(),
    status: z.string(),
    currentQuestionIndex: z.number().int(),
    score: z.number().int().nullable().optional(),
    questions: z.array(
      z.object({
        id: z.string().uuid(),
        content: z.string(),
        type: z.string(),
        orderIndex: z.number().int(),
        answers: z.array(
          z.object({
            id: z.string().uuid(),
            content: z.string(),
            orderIndex: z.number().int(),
          }),
        ),
      }),
    ),
  }),
);

export type StartTestRequest = z.infer<typeof startTestRequestSchema>;
export type StartTestResponse = z.infer<typeof startTestResponseSchema>;
export type SubmitAnswerRequest = z.infer<typeof submitAnswerRequestSchema>;
export type SubmitAnswerResponse = z.infer<typeof submitAnswerResponseSchema>;
