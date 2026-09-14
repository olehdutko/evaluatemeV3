import { Entity } from './base.entity';
import { AccessCodeStatus } from './status.enums';

export { AccessCodeStatus };

export interface AccessCode extends Entity {
  code: string;
  companyId: string;
  campaignId: string | null;
  quizId: string | null;
  questionSetId: string | null;
  status: AccessCodeStatus;
  sentAt: Date | null;
  sentToEmail: string | null;
  usedCount: number;
  maxUses: number;
  expiresAt: Date | null;
  usedAt: Date | null;
  testeeName: string | null;
  testeeEmail: string | null;
  questionCount: number | null;
  durationMinutes: number | null;
}
