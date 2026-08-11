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

export const emailTemplateListSchema = z.object({
  success: z.literal(true),
  data: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string().min(1).max(100),
      subject: z.string().min(1).max(255),
      updatedAt: z.string().datetime(),
    }),
  ),
});

export const emailTemplateDetailSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    subject: z.string().min(1).max(255),
    bodyHtml: z.string().min(1),
    bodyText: z.string().nullable(),
    variables: z.record(z.string()).nullable(),
    updatedAt: z.string().datetime(),
  }),
});

export const updateEmailTemplateRequestSchema = z.object({
  subject: z.string().min(1).max(255),
  bodyHtml: z.string().min(1),
  bodyText: z.string().max(10000).nullable().optional(),
  variables: z.record(z.string()).nullable().optional(),
});
