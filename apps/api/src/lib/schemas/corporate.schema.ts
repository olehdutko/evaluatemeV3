import { z } from 'zod';
import { CampaignStatus } from '@evaluateme/domain';

export const createCampaignSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(5000).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export type CreateCampaignDto = z.infer<typeof createCampaignSchema>;

export const listCampaignsSchema = z.object({
  companyId: z.string().uuid(),
  status: z.enum([CampaignStatus.OPEN, CampaignStatus.CLOSED, CampaignStatus.ARCHIVED]).optional().nullable(),
});

export type ListCampaignsDto = z.infer<typeof listCampaignsSchema>;

export const updateCampaignStatusSchema = z.object({
  companyId: z.string().uuid(),
  status: z.enum([CampaignStatus.OPEN, CampaignStatus.CLOSED, CampaignStatus.ARCHIVED]),
});

export type UpdateCampaignStatusDto = z.infer<typeof updateCampaignStatusSchema>;

export const createCustomQuizSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(5000).optional().nullable(),
  questionIds: z.array(z.string().uuid()).min(1),
});

export type CreateCustomQuizDto = z.infer<typeof createCustomQuizSchema>;

export const quizAnswerSchema = z.object({
  content: z.string().min(1).max(1000),
  isCorrect: z.boolean(),
});

export const quizQuestionSchema = z.object({
  content: z.string().min(1).max(5000),
  type: z.enum(['single_choice', 'multiple_choice']),
  score: z.number().int().min(1).optional(),
  answers: z.array(quizAnswerSchema).min(2),
});

export const createPersonalQuizSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(5000).optional().nullable(),
  questions: z.array(quizQuestionSchema).min(1),
});

export type CreatePersonalQuizDto = z.infer<typeof createPersonalQuizSchema>;

export const listCompanyQuizzesSchema = z.object({
  companyId: z.string().uuid(),
});

export type ListCompanyQuizzesDto = z.infer<typeof listCompanyQuizzesSchema>;

export const getCompanyQuizQuestionsSchema = z.object({
  companyId: z.string().uuid(),
});

export type GetCompanyQuizQuestionsDto = z.infer<typeof getCompanyQuizQuestionsSchema>;

export const createAccessCodeResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    code: z.string(),
    createdCount: z.number().int().min(0),
    activatedCount: z.number().int().min(0),
    limit: z.number().int().min(0).nullable(),
  }),
});

export type CreateAccessCodeResponseDto = z.infer<typeof createAccessCodeResponseSchema>;

export const createAccessCodeSchema = z.object({
  companyId: z.string().uuid(),
  testeeName: z.string().min(1).max(255),
  testeeEmail: z.string().email().max(255),
  questionCount: z.number().int().min(1),
  durationMinutes: z.number().int().min(1),
});

export type CreateAccessCodeDto = z.infer<typeof createAccessCodeSchema>;

export const listAccessCodesSchema = z.object({
  companyId: z.string().uuid(),
  campaignId: z.string().uuid(),
});

export type ListAccessCodesDto = z.infer<typeof listAccessCodesSchema>;

export const sendAccessCodeSchema = z.object({
  companyId: z.string().uuid(),
  email: z.string().email().max(255).optional().nullable(),
});

export type SendAccessCodeDto = z.infer<typeof sendAccessCodeSchema>;

export const previewAccessCodeEmailResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    to: z.string().email(),
    subject: z.string(),
    html: z.string(),
    text: z.string(),
  }),
});

export type PreviewAccessCodeEmailResponseDto = z.infer<typeof previewAccessCodeEmailResponseSchema>;

export const listCampaignResultsSchema = z.object({
  companyId: z.string().uuid(),
});

export type ListCampaignResultsDto = z.infer<typeof listCampaignResultsSchema>;

export const getResultDetailSchema = z.object({
  companyId: z.string().uuid(),
});

export type GetResultDetailDto = z.infer<typeof getResultDetailSchema>;
