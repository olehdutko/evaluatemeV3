import { EmailTemplate } from '../entities/email-template.entity';

export interface IEmailTemplateRepository {
  findByName(name: string): Promise<EmailTemplate | null>;
  save(template: EmailTemplate): Promise<EmailTemplate>;
}
