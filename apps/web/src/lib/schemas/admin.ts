import { z } from 'zod';

export const updateCreditSettingRequestSchema = z.object({
  value: z.string().min(1).max(500),
});
