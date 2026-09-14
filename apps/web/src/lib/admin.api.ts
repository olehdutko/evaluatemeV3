import { z } from 'zod';
import { apiGet, apiPost, apiPut, apiDelete } from './api-client';
import {
  updateCreditSettingRequestSchema,
  updateEmailTemplateRequestSchema,
  emailServiceConfigSchema,
  updateEmailServiceConfigRequestSchema,
  emailServiceTestRequestSchema,
  emptySuccessMessageSchema,
  createUpdateLandingAdRequestSchema,
  updateUserRequestSchema,
  userListSchema,
  userValueSchema,
  createTechnologyRequestSchema,
  createQuestionSetRequestSchema,
  updateQuestionSetRequestSchema,
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

export function getEmailServiceConfig() {
  return apiGet('/api/v1/admin/email-service/config', emailServiceConfigSchema);
}

export function updateEmailServiceConfig(body: z.infer<typeof updateEmailServiceConfigRequestSchema>) {
  return apiPut('/api/v1/admin/email-service/config', body, updateEmailServiceConfigRequestSchema, emailServiceConfigSchema);
}

export function testEmailService(to: string) {
  return apiPost('/api/v1/admin/email-service/test', { to }, emailServiceTestRequestSchema, emptySuccessMessageSchema);
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

export const questionSetsSchema = z.object({
  success: z.literal(true),
  data: z.array(
    z.object({
      id: z.string().uuid(),
      technologyId: z.string().uuid(),
      name: z.string(),
      description: z.string().nullable(),
      questionCount: z.number().int(),
      durationMinutes: z.number().int(),
      status: z.enum(['active', 'suspended']),
      updatedAt: z.string().datetime(),
    }),
  ),
});

export const questionSetValueSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    technologyId: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable(),
    questionCount: z.number().int(),
    durationMinutes: z.number().int(),
    status: z.enum(['active', 'suspended']),
    updatedAt: z.string().datetime(),
  }),
});

export const questionSetWithQuestionsSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable(),
    technologyId: z.string().uuid(),
    status: z.enum(['active', 'suspended']),
    questionCount: z.number().int(),
    durationMinutes: z.number().int(),
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
});

export const emptySuccessSchema = z.object({
  success: z.literal(true),
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

export function updateTechnology(id: string, body: z.infer<typeof createTechnologyRequestSchema>) {
  return apiPut(`/api/v1/admin/technologies/${encodeURIComponent(id)}`, body, createTechnologyRequestSchema, technologyValueSchema);
}

export function deleteTechnology(id: string) {
  return apiDelete(`/api/v1/admin/technologies/${encodeURIComponent(id)}`, emptySuccessSchema);
}

export function getTechnologyQuestionSets(id: string) {
  return apiGet(`/api/v1/admin/technologies/${encodeURIComponent(id)}/question-sets`, questionSetsSchema);
}

export function createQuestionSet(body: z.infer<typeof createQuestionSetRequestSchema>) {
  return apiPost('/api/v1/admin/question-sets', body, createQuestionSetRequestSchema, questionSetValueSchema);
}

export function updateQuestionSet(id: string, body: z.infer<typeof updateQuestionSetRequestSchema>) {
  return apiPut(`/api/v1/admin/question-sets/${encodeURIComponent(id)}`, body, updateQuestionSetRequestSchema, questionSetValueSchema);
}

export function deleteQuestionSet(id: string) {
  return apiDelete(`/api/v1/admin/question-sets/${encodeURIComponent(id)}`, emptySuccessSchema);
}

export function getQuestionSetQuestions(id: string) {
  return apiGet(`/api/v1/admin/question-sets/${encodeURIComponent(id)}/questions`, questionSetWithQuestionsSchema);
}

export function saveQuestion(body: z.infer<typeof saveQuestionRequestSchema>) {
  return apiPut('/api/v1/admin/questions', body, saveQuestionRequestSchema, questionValueSchema);
}

export function deleteQuestion(id: string) {
  return apiDelete(`/api/v1/admin/questions/${encodeURIComponent(id)}`, emptySuccessSchema);
}

export function deleteAnswer(id: string) {
  return apiDelete(`/api/v1/admin/answers/${encodeURIComponent(id)}`, emptySuccessSchema);
}

