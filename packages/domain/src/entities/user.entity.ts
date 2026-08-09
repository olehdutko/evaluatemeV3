import { Entity } from './base.entity';
import { ActivationStatus, UserRole } from './status.enums';

export interface User extends Entity {
  email: string;
  passwordHash: string | null;
  legacyMd5Hash: string | null;
  role: UserRole;
  activationStatus: ActivationStatus;
  companyProfileId: string | null;
}
