export const UserRole = {
  USER: 'user',
  COMPANY: 'company',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ActivationStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
} as const;

export type ActivationStatus = (typeof ActivationStatus)[keyof typeof ActivationStatus];

export const SessionStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
  ARCHIVED: 'archived',
} as const;

export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];

export const CampaignStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  CLOSED: 'closed',
} as const;

export type CampaignStatus = (typeof CampaignStatus)[keyof typeof CampaignStatus];

export const AccessCodeStatus = {
  ACTIVE: 'active',
  USED: 'used',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
} as const;

export type AccessCodeStatus = (typeof AccessCodeStatus)[keyof typeof AccessCodeStatus];

export const TestStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type TestStatus = (typeof TestStatus)[keyof typeof TestStatus];

export const QuestionType = {
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice',
  TEXT: 'text',
} as const;

export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];
