import { z } from 'zod';

export const creditSettingValueSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    key: z.string().min(1).max(100),
    value: z.string().min(1),
    updatedByUserId: z.string().uuid(),
    updatedAt: z.string().datetime(),
  }),
});

export const creditSettingsListSchema = z.object({
  success: z.literal(true),
  data: z.array(
    z.object({
      id: z.string().uuid(),
      key: z.string().min(1).max(100),
      value: z.string().min(1),
      updatedByUserId: z.string().uuid(),
      updatedAt: z.string().datetime(),
    }),
  ),
});

export const updateCreditSettingRequestSchema = z.object({
  value: z.string().min(1).max(500),
});
