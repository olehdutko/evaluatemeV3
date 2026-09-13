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

export const landingAdPositionSchema = z.enum(['home_top', 'home_bottom', 'sidebar']);

export const landingAdSummarySchema = z.object({
  success: z.literal(true),
  data: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(255),
      position: landingAdPositionSchema,
      isActive: z.boolean(),
      updatedAt: z.string().datetime(),
    }),
  ),
});

export const landingAdValueSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(255),
    position: landingAdPositionSchema,
    isActive: z.boolean(),
    updatedAt: z.string().datetime(),
  }),
});

export const createUpdateLandingAdRequestSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().max(5000).nullable().optional(),
  imageUrl: z.string().max(500).nullable().optional(),
  linkUrl: z.string().max(500).nullable().optional(),
  position: landingAdPositionSchema,
  isActive: z.boolean(),
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

export const updateUserRequestSchema = z.object({
  role: z.enum(['user', 'company']).optional(),
  activationStatus: z.enum(['pending', 'active', 'suspended']).optional(),
});

export const emailServiceConfigSchema = z.object({
  success: z.literal(true),
  data: z.object({
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
  }).nullable(),
});

export const updateEmailServiceConfigRequestSchema = z.object({
  provider: z.string().min(1).max(50),
  smtpHost: z.string().min(1).max(255),
  smtpPort: z.number().int().min(1).max(65535),
  smtpUser: z.string().min(1).max(255),
  smtpPass: z.string().min(1).transform((v) => v.replace(/\s/g, '')),
  fromEmail: z.string().email().max(255),
  secure: z.boolean(),
  enabled: z.boolean(),
});

export const emailServiceTestRequestSchema = z.object({
  to: z.string().email().max(255),
});
