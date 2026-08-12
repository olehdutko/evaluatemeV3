import { Entity } from './base.entity';
import { AccessCodeStatus } from './status.enums';

export interface AccessCode extends Entity {
  code: string;
  companyId: string;
  technologyId: string;
  status: AccessCodeStatus;
  expiresAt: Date | null;
  usedAt: Date | null;
}
