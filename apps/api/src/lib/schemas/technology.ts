import { z } from 'zod';

export const technologySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().nullable(),
  quizQuestionCount: z.number().int().min(1).max(100).default(20),
  quizDurationMinutes: z.number().int().min(1).max(300).default(40),
  createdAt: z.string().datetime(),
});

export const technologyResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(technologySchema),
});

export type TechnologyResponse = z.infer<typeof technologyResponseSchema>;
