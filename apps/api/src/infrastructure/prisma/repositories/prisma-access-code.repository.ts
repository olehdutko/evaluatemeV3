import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IAccessCodeRepository, AccessCode } from '@evaluateme/domain';

@Injectable()
export class PrismaAccessCodeRepository implements IAccessCodeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AccessCode | null> {
    const row = await this.prisma.accessCode.findUnique({ where: { id } });
    return row ? this.mapRow(row) : null;
  }

  async findByCode(code: string): Promise<AccessCode | null> {
    const row = await this.prisma.accessCode.findUnique({ where: { code } });
    return row ? this.mapRow(row) : null;
  }

  async save(accessCode: AccessCode): Promise<AccessCode> {
    const row = await this.prisma.accessCode.upsert({
      where: { id: accessCode.id },
      create: {
        id: accessCode.id,
        code: accessCode.code,
        companyId: accessCode.companyId,
        technologyId: accessCode.technologyId,
        status: accessCode.status,
        expiresAt: accessCode.expiresAt,
        usedAt: accessCode.usedAt,
      },
      update: {
        status: accessCode.status,
        usedAt: accessCode.usedAt,
      },
    });
    return this.mapRow(row);
  }

  private mapRow(row: {
    id: string;
    code: string;
    companyId: string;
    technologyId: string;
    status: string;
    expiresAt: Date | null;
    usedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): AccessCode {
    return {
      id: row.id,
      code: row.code,
      companyId: row.companyId,
      technologyId: row.technologyId,
      status: row.status as AccessCode['status'],
      expiresAt: row.expiresAt,
      usedAt: row.usedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
