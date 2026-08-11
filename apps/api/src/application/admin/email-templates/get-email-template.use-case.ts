import { Inject, Injectable } from '@nestjs/common';
import { IEmailTemplateRepository } from '@evaluateme/domain';
import { NotFoundError } from '../../../infrastructure/errors/app-error';

@Injectable()
export class GetEmailTemplateUseCase {
  constructor(@Inject(IEmailTemplateRepository) private readonly repository: IEmailTemplateRepository) {}

  async execute(id: string): Promise<{
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
    const template = await this.repository.findById(id);
    if (!template) {
      throw new NotFoundError('EmailTemplate', id);
    }
    return {
      success: true,
      data: {
        id: template.id,
        name: template.name,
        subject: template.subject,
        bodyHtml: template.bodyHtml,
        bodyText: template.bodyText,
        variables: template.variables,
        updatedAt: template.updatedAt.toISOString(),
      },
    };
  }
}
