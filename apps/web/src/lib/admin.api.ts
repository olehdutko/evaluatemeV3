import { z } from 'zod';
import { apiGet, apiPut } from './api-client';
import { updateCreditSettingRequestSchema, updateEmailTemplateRequestSchema } from './schemas/admin';

export const adminMeSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: z.enum(['admin']),
  }),
});

export const creditSettingsSchema = z.object({
  success: z.literal(true),
  data: z.array(
    z.object({
      id: z.string().uuid(),
      key: z.string(),
      value: z.string(),
      updatedByUserId: z.string().uuid(),
      updatedAt: z.string().datetime(),
    }),
  ),
});

export const creditSettingValueSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    key: z.string(),
    value: z.string(),
    updatedAt: z.string().datetime(),
  }),
});

export function getAdminMe() {
  return apiGet('/api/v1/admin/me', adminMeSchema);
}

export function getCreditSettings() {
  return apiGet('/api/v1/admin/credit-settings', creditSettingsSchema);
}

export function updateCreditSetting(key: string, value: string) {
  return apiPut(`/api/v1/admin/credit-settings/${encodeURIComponent(key)}`, { value }, updateCreditSettingRequestSchema, creditSettingValueSchema);
}

export const emailTemplatesSchema = z.object({
  success: z.literal(true),
  data: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      subject: z.string(),
      updatedAt: z.string().datetime(),
    }),
  ),
});

export const emailTemplateDetailSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    name: z.string(),
    subject: z.string(),
    bodyHtml: z.string(),
    bodyText: z.string().nullable(),
    variables: z.record(z.string()).nullable(),
    updatedAt: z.string().datetime(),
  }),
});

export function getEmailTemplates() {
  return apiGet('/api/v1/admin/email-templates', emailTemplatesSchema);
}

export function getEmailTemplate(id: string) {
  return apiGet(`/api/v1/admin/email-templates/${encodeURIComponent(id)}`, emailTemplateDetailSchema);
}

export function updateEmailTemplate(
  id: string,
  body: z.infer<typeof updateEmailTemplateRequestSchema>,
) {
  return apiPut(`/api/v1/admin/email-templates/${encodeURIComponent(id)}`, body, updateEmailTemplateRequestSchema, emailTemplateDetailSchema);
}
