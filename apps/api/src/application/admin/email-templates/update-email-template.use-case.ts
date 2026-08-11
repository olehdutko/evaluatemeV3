import { Inject, Injectable } from '@nestjs/common';
import { IEmailTemplateRepository } from '@evaluateme/domain';
import { NotFoundError, BadRequestError } from '../../../infrastructure/errors/app-error';

export interface UpdateEmailTemplateInput {
  id: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string | null;
  variables?: Record<string, string> | null;
}

@Injectable()
export class UpdateEmailTemplateUseCase {
  constructor(@Inject(IEmailTemplateRepository) private readonly repository: IEmailTemplateRepository) {}

  async execute(input: UpdateEmailTemplateInput): Promise<{
    success: true;
    data: {
      id: string;
      name: string;
      subject: string;
      bodyHtml: string;
      bodyText: string | null;
      variables: Record<string, string> | null;
      updatedAt: string;
    };
  }> {
    const existing = await this.repository.findById(input.id);
    if (!existing) {
      throw new NotFoundError('EmailTemplate', input.id);
    }
    if (!input.subject.trim() || !input.bodyHtml.trim()) {
      throw new BadRequestError({ subject: ['Subject is required'], bodyHtml: ['HTML body is required'] });
    }

    const saved = await this.repository.save({
      ...existing,
      subject: input.subject.trim(),
      bodyHtml: input.bodyHtml.trim(),
      bodyText: input.bodyText?.trim() ?? null,
      variables: input.variables ?? null,
      updatedAt: new Date(),
    });

    return {
      success: true,
      data: {
        id: saved.id,
        name: saved.name,
        subject: saved.subject,
        bodyHtml: saved.bodyHtml,
        bodyText: saved.bodyText,
        variables: saved.variables,
        updatedAt: saved.updatedAt.toISOString(),
      },
    };
  }
}
