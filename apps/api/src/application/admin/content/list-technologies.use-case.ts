import { Inject, Injectable } from '@nestjs/common';
import { ITechnologyRepository } from '@evaluateme/domain';

@Injectable()
export class AdminListTechnologiesUseCase {
  constructor(@Inject(ITechnologyRepository) private readonly repository: ITechnologyRepository) {}

  async execute(): Promise<{
    success: true;
    data: Array<{ id: string; name: string; slug: string; description: string | null; updatedAt: string }>;
  }> {
    const rows = await this.repository.findAll();
    return {
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        updatedAt: row.updatedAt.toISOString(),
      })),
    };
  }
}
