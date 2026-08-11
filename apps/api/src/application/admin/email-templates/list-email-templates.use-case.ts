import { Inject, Injectable } from '@nestjs/common';
import { IEmailTemplateRepository } from '@evaluateme/domain';

@Injectable()
export class ListEmailTemplatesUseCase {
  constructor(@Inject(IEmailTemplateRepository) private readonly repository: IEmailTemplateRepository) {}

  async execute(): Promise<{ success: true; data: Array<{ id: string; name: string; subject: string; updatedAt: string }> }> {
    const rows = await this.repository.findAll();
    return {
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        name: row.name,
        subject: row.subject,
        updatedAt: row.updatedAt.toISOString(),
      })),
    };
  }
}
