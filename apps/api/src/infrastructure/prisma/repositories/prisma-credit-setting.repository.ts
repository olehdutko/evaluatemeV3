import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ICreditSettingRepository, CreditSetting } from '@evaluateme/domain';

@Injectable()
export class PrismaCreditSettingRepository implements ICreditSettingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByKey(key: string): Promise<CreditSetting | null> {
    const row = await this.prisma.creditSetting.findUnique({ where: { key } });
    return row ? this.toDomain(row) : null;
  }

  async save(setting: CreditSetting): Promise<CreditSetting> {
    const row = await this.prisma.creditSetting.upsert({
      where: { id: setting.id },
      create: {
        id: setting.id,
        key: setting.key,
        value: setting.value,
        updatedByUserId: setting.updatedByUserId,
      },
      update: {
        value: setting.value,
        updatedByUserId: setting.updatedByUserId,
      },
    });
    return this.toDomain(row);
  }

  async findAll(): Promise<CreditSetting[]> {
    const rows = await this.prisma.creditSetting.findMany({ orderBy: { key: 'asc' } });
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(raw: unknown): CreditSetting {
    const data = raw as Record<string, unknown>;
    return {
      id: data.id as string,
      key: data.key as string,
      value: data.value as string,
      updatedByUserId: data.updatedByUserId as string,
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
    };
  }
}
