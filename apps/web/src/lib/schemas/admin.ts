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

export const landingAdPositionSchema = z.enum(['home_top', 'home_bottom', 'sidebar']);

export const createUpdateLandingAdRequestSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().max(5000).nullable().optional(),
  imageUrl: z.string().max(500).nullable().optional(),
  linkUrl: z.string().max(500).nullable().optional(),
  position: landingAdPositionSchema,
  isActive: z.boolean(),
});
