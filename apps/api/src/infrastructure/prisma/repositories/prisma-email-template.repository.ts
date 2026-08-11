import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IEmailTemplateRepository, EmailTemplate } from '@evaluateme/domain';

@Injectable()
export class PrismaEmailTemplateRepository implements IEmailTemplateRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<EmailTemplate[]> {
    const rows = await this.prisma.emailTemplate.findMany({ orderBy: { name: 'asc' } });
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<EmailTemplate | null> {
    const row = await this.prisma.emailTemplate.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByName(name: string): Promise<EmailTemplate | null> {
    const row = await this.prisma.emailTemplate.findUnique({ where: { name } });
    return row ? this.toDomain(row) : null;
  }

  async save(template: EmailTemplate): Promise<EmailTemplate> {
    const row = await this.prisma.emailTemplate.upsert({
      where: { id: template.id },
      create: {
        id: template.id,
        name: template.name,
        subject: template.subject,
        bodyHtml: template.bodyHtml,
        bodyText: template.bodyText,
        variables: template.variables ? JSON.stringify(template.variables) : null,
      },
      update: {
        name: template.name,
        subject: template.subject,
        bodyHtml: template.bodyHtml,
        bodyText: template.bodyText,
        variables: template.variables ? JSON.stringify(template.variables) : null,
      },
    });
    return this.toDomain(row);
  }

  private toDomain(raw: unknown): EmailTemplate {
    const data = raw as Record<string, unknown>;
    let variables: Record<string, string> | null = null;
    if (typeof data.variables === 'string' && data.variables.length > 0) {
      try {
        variables = JSON.parse(data.variables) as Record<string, string>;
      } catch {
        variables = null;
      }
    }
    return {
      id: data.id as string,
      name: data.name as string,
      subject: data.subject as string,
      bodyHtml: data.bodyHtml as string,
      bodyText: (data.bodyText as string | null) ?? null,
      variables,
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
    };
  }
}
