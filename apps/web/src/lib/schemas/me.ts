import { z } from 'zod';

export const myResultListSchema = z.object({
  success: z.literal(true),
  data: z.array(
    z.object({
      resultCode: z.string(),
      technologyId: z.string().uuid(),
      technologyName: z.string(),
      score: z.number().int().nullable(),
      maxScore: z.number().int().nullable(),
      status: z.string(),
      createdAt: z.string().datetime(),
    }),
  ),
});

export const myResultDetailSchema = z.object({
  success: z.literal(true),
  data: z.object({
    resultCode: z.string(),
    technologyId: z.string().uuid(),
    technologyName: z.string(),
    score: z.number().int().nullable(),
    maxScore: z.number().int().nullable(),
    status: z.string(),
    createdAt: z.string().datetime(),
    questions: z.array(
      z.object({
        questionId: z.string().uuid(),
        content: z.string(),
        type: z.string(),
        score: z.number().int(),
        userAnswerId: z.string().uuid(),
        userAnswerContent: z.string(),
        correctAnswerIds: z.array(z.string().uuid()),
        isCorrect: z.boolean(),
      }),
    ),
  }),
});

export type MyResultListResponse = z.infer<typeof myResultListSchema>;
export type MyResultDetailResponse = z.infer<typeof myResultDetailSchema>;
