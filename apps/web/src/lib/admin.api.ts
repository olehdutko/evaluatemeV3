import { z } from 'zod';
import { apiGet, apiPut } from './api-client';
import { updateCreditSettingRequestSchema } from './schemas/admin';

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
