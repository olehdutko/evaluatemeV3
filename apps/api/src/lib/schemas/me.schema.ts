import { z } from 'zod';
import { successEnvelopeSchema } from './envelope.schema';

export const myResultListSchema = successEnvelopeSchema(
  z.array(
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
);

export const myResultDetailSchema = successEnvelopeSchema(
  z.object({
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
);

export type MyResultListResponse = z.infer<typeof myResultListSchema>;
export type MyResultDetailResponse = z.infer<typeof myResultDetailSchema>;
