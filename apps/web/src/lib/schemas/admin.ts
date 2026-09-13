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
  slug: z.string().min(1).max(100).optional().or(z.literal('')),
  description: z.string().max(5000).nullable().optional().or(z.literal('')),
  quizQuestionCount: z.number().int().min(1).max(100).optional(),
  quizDurationMinutes: z.number().int().min(1).max(300).optional(),
});

export const answerInputSchema = z.object({
  id: z.string().uuid().optional(),
  content: z.string().min(1).max(500),
  isCorrect: z.boolean(),
  orderIndex: z.number().int().min(0),
});

export const saveQuestionRequestSchema = z.object({
  id: z.string().uuid().optional(),
  technologyId: z.string().uuid(),
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

export const emailServiceConfigSchema = z.object({
  success: z.literal(true),
  data: z
    .object({
      id: z.string().uuid(),
      provider: z.string().min(1).max(50),
      smtpHost: z.string().min(1).max(255),
      smtpPort: z.number().int().min(1).max(65535),
      smtpUser: z.string().min(1).max(255),
      smtpPass: z.string().min(1),
      fromEmail: z.string().email().max(255),
      secure: z.boolean(),
      enabled: z.boolean(),
      updatedByUserId: z.string().uuid(),
      updatedAt: z.string().datetime(),
    })
    .nullable(),
});

export const updateEmailServiceConfigRequestSchema = z.object({
  provider: z.string().min(1).max(50),
  smtpHost: z.string().min(1).max(255),
  smtpPort: z.number().int().min(1).max(65535),
  smtpUser: z.string().min(1).max(255),
  smtpPass: z.string().min(1),
  fromEmail: z.string().email().max(255),
  secure: z.boolean(),
  enabled: z.boolean(),
});

export const emailServiceTestRequestSchema = z.object({
  to: z.string().email().max(255),
});

export const emptySuccessMessageSchema = z.object({
  success: z.literal(true),
  message: z.string(),
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
