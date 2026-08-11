import { z } from 'zod';

export const updateCreditSettingRequestSchema = z.object({
  value: z.string().min(1).max(500),
});

export const updateEmailTemplateRequestSchema = z.object({
  subject: z.string().min(1).max(255),
  bodyHtml: z.string().min(1),
  bodyText: z.string().max(10000).nullable().optional(),
  variables: z.record(z.string()).nullable().optional(),
});
