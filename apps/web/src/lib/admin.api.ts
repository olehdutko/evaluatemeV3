import { z } from 'zod';
import { apiGet, apiPost, apiPut } from './api-client';
import {
  updateCreditSettingRequestSchema,
  updateEmailTemplateRequestSchema,
  createUpdateLandingAdRequestSchema,
  updateUserRequestSchema,
  userListSchema,
  userValueSchema,
  createTechnologyRequestSchema,
  saveQuestionRequestSchema,
} from './schemas/admin';

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

export const landingAdsSchema = z.object({
  success: z.literal(true),
  data: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      position: z.enum(['home_top', 'home_bottom', 'sidebar']),
      isActive: z.boolean(),
      updatedAt: z.string().datetime(),
    }),
  ),
});

export const landingAdValueSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    title: z.string(),
    position: z.enum(['home_top', 'home_bottom', 'sidebar']),
    isActive: z.boolean(),
    updatedAt: z.string().datetime(),
  }),
});

export function getLandingAds() {
  return apiGet('/api/v1/admin/landing-ads', landingAdsSchema);
}

export function createLandingAd(body: z.infer<typeof createUpdateLandingAdRequestSchema>) {
  return apiPost('/api/v1/admin/landing-ads', body, createUpdateLandingAdRequestSchema, landingAdValueSchema);
}

export function updateLandingAd(id: string, body: z.infer<typeof createUpdateLandingAdRequestSchema>) {
  return apiPut(`/api/v1/admin/landing-ads/${encodeURIComponent(id)}`, body, createUpdateLandingAdRequestSchema, landingAdValueSchema);
}

export function getUsers() {
  return apiGet('/api/v1/admin/users', userListSchema);
}

export function updateUser(id: string, body: z.infer<typeof updateUserRequestSchema>) {
  return apiPut(`/api/v1/admin/users/${encodeURIComponent(id)}`, body, updateUserRequestSchema, userValueSchema);
}

export const technologiesSchema = z.object({
  success: z.literal(true),
  data: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      slug: z.string(),
      description: z.string().nullable(),
      updatedAt: z.string().datetime(),
    }),
  ),
});

export const technologyValueSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    updatedAt: z.string().datetime(),
  }),
});

export const technologyWithQuestionsSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    tests: z.array(
      z.object({
        id: z.string().uuid(),
        title: z.string(),
        status: z.string(),
        durationMinutes: z.number().int().nullable(),
        passingScore: z.number().int().nullable(),
        questions: z.array(
          z.object({
            id: z.string().uuid(),
            content: z.string(),
            type: z.enum(['single', 'multiple']),
            orderIndex: z.number().int(),
            score: z.number().int(),
            answers: z.array(
              z.object({
                id: z.string().uuid(),
                content: z.string(),
                isCorrect: z.boolean(),
                orderIndex: z.number().int(),
              }),
            ),
          }),
        ),
      }),
    ),
  }),
});

export const questionValueSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    content: z.string(),
    updatedAt: z.string().datetime(),
  }),
});

export function getTechnologies() {
  return apiGet('/api/v1/admin/technologies', technologiesSchema);
}

export function createTechnology(body: z.infer<typeof createTechnologyRequestSchema>) {
  return apiPost('/api/v1/admin/technologies', body, createTechnologyRequestSchema, technologyValueSchema);
}

export function getTechnologyQuestions(id: string) {
  return apiGet(`/api/v1/admin/technologies/${encodeURIComponent(id)}/questions`, technologyWithQuestionsSchema);
}

export function saveQuestion(body: z.infer<typeof saveQuestionRequestSchema>) {
  return apiPut('/api/v1/admin/questions', body, saveQuestionRequestSchema, questionValueSchema);
}

