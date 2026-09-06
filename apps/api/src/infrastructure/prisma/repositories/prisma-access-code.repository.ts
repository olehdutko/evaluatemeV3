import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IAccessCodeRepository, AccessCode, AccessCodeStatus } from '@evaluateme/domain';

@Injectable()
export class PrismaAccessCodeRepository implements IAccessCodeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AccessCode | null> {
    const row = await this.prisma.accessCode.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByCode(code: string): Promise<AccessCode | null> {
    const row = await this.prisma.accessCode.findUnique({ where: { code } });
    return row ? this.toDomain(row) : null;
  }

  async findByCampaignId(campaignId: string): Promise<AccessCode[]> {
    const rows = await this.prisma.accessCode.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async save(accessCode: AccessCode): Promise<AccessCode> {
    const saved = await this.prisma.accessCode.upsert({
      where: { id: accessCode.id },
      create: {
        id: accessCode.id,
        code: accessCode.code,
        companyId: accessCode.companyId,
        campaignId: accessCode.campaignId,
        quizId: accessCode.quizId,
        technologyId: accessCode.technologyId,
        status: accessCode.status,
        sentAt: accessCode.sentAt,
        sentToEmail: accessCode.sentToEmail,
        usedCount: accessCode.usedCount,
        maxUses: accessCode.maxUses,
        expiresAt: accessCode.expiresAt,
        usedAt: accessCode.usedAt,
      },
      update: {
        companyId: accessCode.companyId,
        campaignId: accessCode.campaignId,
        quizId: accessCode.quizId,
        technologyId: accessCode.technologyId,
        status: accessCode.status,
        sentAt: accessCode.sentAt,
        sentToEmail: accessCode.sentToEmail,
        usedCount: accessCode.usedCount,
        maxUses: accessCode.maxUses,
        expiresAt: accessCode.expiresAt,
        usedAt: accessCode.usedAt,
      },
    });
    return this.toDomain(saved);
  }

  private toDomain(raw: unknown): AccessCode {
    const data = raw as Record<string, unknown>;
    return {
      id: data.id as string,
      code: data.code as string,
      companyId: data.companyId as string,
      campaignId: (data.campaignId as string | null) ?? null,
      quizId: (data.quizId as string | null) ?? null,
      technologyId: (data.technologyId as string | null) ?? null,
      status: data.status as AccessCodeStatus,
      sentAt: data.sentAt ? new Date(data.sentAt as string) : null,
      sentToEmail: (data.sentToEmail as string | null) ?? null,
      usedCount: typeof data.usedCount === 'number' ? data.usedCount : Number(data.usedCount ?? 0),
      maxUses: typeof data.maxUses === 'number' ? data.maxUses : Number(data.maxUses ?? 1),
      expiresAt: data.expiresAt ? new Date(data.expiresAt as string) : null,
      usedAt: data.usedAt ? new Date(data.usedAt as string) : null,
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
    };
  }
}
