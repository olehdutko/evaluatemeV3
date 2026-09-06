import { Entity } from './base.entity';
import { AccessCodeStatus } from './status.enums';

export interface AccessCode extends Entity {
  code: string;
  companyId: string;
  campaignId: string | null;
  quizId: string | null;
  technologyId: string | null;
  status: AccessCodeStatus;
  sentAt: Date | null;
  sentToEmail: string | null;
  usedCount: number;
  maxUses: number;
  expiresAt: Date | null;
  usedAt: Date | null;
}
