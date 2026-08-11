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

export const createTechnologyRequestSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(5000).nullable().optional(),
});

export const answerInputSchema = z.object({
  id: z.string().uuid().optional(),
  content: z.string().min(1).max(500),
  isCorrect: z.boolean(),
  orderIndex: z.number().int().min(0),
});

export const saveQuestionRequestSchema = z.object({
  id: z.string().uuid().optional(),
  testId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  type: z.enum(['single', 'multiple']),
  orderIndex: z.number().int().min(0),
  score: z.number().int().min(1),
  answers: z.array(answerInputSchema).min(2),
});

export const updateUserRequestSchema = z.object({
  role: z.enum(['user', 'company']).optional(),
  activationStatus: z.enum(['pending', 'active', 'suspended']).optional(),
});

export const userListSchema = z.object({
  success: z.literal(true),
  data: z.array(
    z.object({
      id: z.string().uuid(),
      email: z.string().email(),
      role: z.enum(['user', 'company', 'admin']),
      activationStatus: z.enum(['pending', 'active', 'suspended']),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
    }),
  ),
});

export const userValueSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: z.enum(['user', 'company', 'admin']),
    activationStatus: z.enum(['pending', 'active', 'suspended']),
    updatedAt: z.string().datetime(),
  }),
});
