import { z } from 'zod';

export const publicResultSchema = z.object({
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
        userAnswerContent: z.string(),
        isCorrect: z.boolean(),
      }),
    ),
  }),
});

export type PublicResultResponse = z.infer<typeof publicResultSchema>;
