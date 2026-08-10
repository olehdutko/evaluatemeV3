import { z } from 'zod';

export const startTestRequestSchema = z.object({
  technologySlug: z.string().min(1),
});

export const startTestResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    sessionId: z.string().uuid(),
    technology: z.object({
      id: z.string().uuid(),
      name: z.string(),
      slug: z.string(),
    }),
    questions: z.array(
      z.object({
        id: z.string().uuid(),
        content: z.string(),
        type: z.enum(['single', 'multiple']),
        orderIndex: z.number().int(),
      }),
    ),
  }),
});

export const testSessionStateResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
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
});

export const submitAnswerRequestSchema = z.object({
  questionId: z.string().uuid(),
  answerId: z.string().uuid(),
});

export const submitAnswerResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    isCorrect: z.boolean(),
    currentScore: z.number().int(),
    totalAnswered: z.number().int(),
    nextQuestionIndex: z.number().int().nullable(),
    isComplete: z.boolean(),
  }),
});

export type StartTestRequest = z.infer<typeof startTestRequestSchema>;
export type StartTestResponse = z.infer<typeof startTestResponseSchema>;
export type TestSessionStateResponse = z.infer<typeof testSessionStateResponseSchema>;
export type SubmitAnswerRequest = z.infer<typeof submitAnswerRequestSchema>;
export type SubmitAnswerResponse = z.infer<typeof submitAnswerResponseSchema>;
