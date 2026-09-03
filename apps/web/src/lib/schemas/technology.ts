import { z } from 'zod';

export const technologySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const technologyResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(technologySchema),
});

export type TechnologyResponse = z.infer<typeof technologyResponseSchema>;

export const technologyDetailResponseSchema = z.object({
  success: z.literal(true),
  data: technologySchema,
});

export type TechnologyDetailResponse = z.infer<typeof technologyDetailResponseSchema>;
