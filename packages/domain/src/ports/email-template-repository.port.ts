import { EmailTemplate } from '../entities/email-template.entity';

export const IEmailTemplateRepository = Symbol('IEmailTemplateRepository');

export interface IEmailTemplateRepository {
  findAll(): Promise<EmailTemplate[]>;
  findByName(name: string): Promise<EmailTemplate | null>;
  findById(id: string): Promise<EmailTemplate | null>;
  save(template: EmailTemplate): Promise<EmailTemplate>;
}
