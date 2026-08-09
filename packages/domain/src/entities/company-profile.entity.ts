import { Entity } from './base.entity';

export interface CompanyProfile extends Entity {
  userId: string;
  companyName: string;
  address: string | null;
  phone: string | null;
  country: string | null;
  occupation: string | null;
  availableTests: number;
  availableAccessCodes: number;
}
