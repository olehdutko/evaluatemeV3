import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ICreditSettingRepository } from '@evaluateme/domain';
import { BadRequestError } from '../../../infrastructure/errors/app-error';

export interface UpdateCreditSettingInput {
  key: string;
  value: string;
  updatedByUserId: string;
}

const KNOWN_KEYS = new Set([
  'test_price_credits',
  'access_code_price_credits',
  'credit_to_usd_rate',
  'base_credits_per_user',
  'bonus_credits_new_user',
]);

@Injectable()
export class UpdateCreditSettingUseCase {
  constructor(@Inject(ICreditSettingRepository) private readonly repository: ICreditSettingRepository) {}

  async execute(input: UpdateCreditSettingInput): Promise<{ success: true; data: { id: string; key: string; value: string; updatedAt: string } }> {
    if (!KNOWN_KEYS.has(input.key)) {
      throw new BadRequestError({ key: ['Unknown credit setting key'] });
    }
    if (!input.value || input.value.trim().length === 0) {
      throw new BadRequestError({ value: ['Value is required'] });
    }

    const existing = await this.repository.findByKey(input.key);
    const now = new Date();
    const saved = await this.repository.save({
      id: existing?.id ?? randomUUID(),
      key: input.key,
      value: input.value.trim(),
      updatedByUserId: input.updatedByUserId,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });

    return {
      success: true,
      data: {
        id: saved.id,
        key: saved.key,
        value: saved.value,
        updatedAt: saved.updatedAt.toISOString(),
      },
    };
  }
}
