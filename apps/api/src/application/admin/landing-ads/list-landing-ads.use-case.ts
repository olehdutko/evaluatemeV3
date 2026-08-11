import { Inject, Injectable } from '@nestjs/common';
import { ILandingAdRepository } from '@evaluateme/domain';

@Injectable()
export class ListLandingAdsUseCase {
  constructor(@Inject(ILandingAdRepository) private readonly repository: ILandingAdRepository) {}

  async execute(): Promise<{ success: true; data: Array<{ id: string; title: string; position: string; isActive: boolean; updatedAt: string }> }> {
    const rows = await this.repository.findAll();
    return {
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        title: row.title,
        position: row.position,
        isActive: row.isActive,
        updatedAt: row.updatedAt.toISOString(),
      })),
    };
  }
}
