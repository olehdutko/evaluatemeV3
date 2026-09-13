import { Entity } from './base.entity';

export interface EmailServiceConfig extends Entity {
  provider: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  secure: boolean;
  enabled: boolean;
  updatedByUserId: string;
}
