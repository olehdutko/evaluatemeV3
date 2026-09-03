import { Entity } from './base.entity';
import { ActivationStatus, UserRole } from './status.enums';

export interface User extends Entity {
  email: string;
  username: string | null;
  passwordHash: string | null;
  legacyMd5Hash: string | null;
  role: UserRole;
  activationStatus: ActivationStatus;
  companyProfileId: string | null;
  credits: number;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  birthDate: Date | null;
  country: string | null;
  city: string | null;
  phone: string | null;
}
