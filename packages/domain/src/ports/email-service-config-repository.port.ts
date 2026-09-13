import { EmailServiceConfig } from '../entities/email-service-config.entity';

export const IEmailServiceConfigRepository = Symbol('IEmailServiceConfigRepository');

export interface IEmailServiceConfigRepository {
  findFirst(): Promise<EmailServiceConfig | null>;
  save(config: EmailServiceConfig): Promise<EmailServiceConfig>;
}
