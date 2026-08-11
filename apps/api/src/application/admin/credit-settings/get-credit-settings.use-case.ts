import { Inject, Injectable } from '@nestjs/common';
import { ICreditSettingRepository } from '@evaluateme/domain';

@Injectable()
export class GetCreditSettingsUseCase {
  constructor(@Inject(ICreditSettingRepository) private readonly repository: ICreditSettingRepository) {}

  async execute(): Promise<{ success: true; data: Array<{ id: string; key: string; value: string; updatedByUserId: string; updatedAt: string }> }> {
    const rows = await this.repository.findAll();
    return {
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        key: row.key,
        value: row.value,
        updatedByUserId: row.updatedByUserId,
        updatedAt: row.updatedAt.toISOString(),
      })),
    };
  }
}
