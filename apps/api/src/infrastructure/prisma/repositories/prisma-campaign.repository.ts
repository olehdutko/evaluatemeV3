import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ICampaignRepository, Campaign, CampaignHistory, CampaignStatus } from '@evaluateme/domain';

@Injectable()
export class PrismaCampaignRepository implements ICampaignRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Campaign | null> {
    const row = await this.prisma.campaign.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByCompanyId(companyId: string): Promise<Campaign[]> {
    const rows = await this.prisma.campaign.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' } });
    return rows.map((row) => this.toDomain(row));
  }

  async findByCompanyIdAndStatus(companyId: string, status: string): Promise<Campaign[]> {
    const rows = await this.prisma.campaign.findMany({
      where: { companyId, status },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async save(campaign: Campaign): Promise<Campaign> {
    const saved = await this.prisma.campaign.upsert({
      where: { id: campaign.id },
      create: {
        id: campaign.id,
        companyId: campaign.companyId,
        name: campaign.name,
        description: campaign.description,
        notes: campaign.notes,
        status: campaign.status,
        createdByUserId: campaign.createdByUserId,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
      },
      update: {
        companyId: campaign.companyId,
        name: campaign.name,
        description: campaign.description,
        notes: campaign.notes,
        status: campaign.status,
        createdByUserId: campaign.createdByUserId,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
      },
    });
    return this.toDomain(saved);
  }

  async saveHistory(history: CampaignHistory): Promise<CampaignHistory> {
    const saved = await this.prisma.campaignHistory.create({
      data: {
        id: history.id,
        campaignId: history.campaignId,
        action: history.action,
        status: history.status,
        changedByUserId: history.changedByUserId,
        metadata: history.metadata,
        changedAt: history.changedAt,
      },
    });
    return this.toHistoryDomain(saved);
  }

  async findHistoryByCampaignId(campaignId: string): Promise<CampaignHistory[]> {
    const rows = await this.prisma.campaignHistory.findMany({
      where: { campaignId },
      orderBy: { changedAt: 'desc' },
    });
    return rows.map((row) => this.toHistoryDomain(row));
  }

  private toDomain(raw: unknown): Campaign {
    const data = raw as Record<string, unknown>;
    return {
      id: data.id as string,
      companyId: (data.companyId as string | null) ?? null,
      name: data.name as string,
      description: (data.description as string | null) ?? null,
      notes: (data.notes as string | null) ?? null,
      status: data.status as CampaignStatus,
      createdByUserId: data.createdByUserId as string,
      startDate: data.startDate ? new Date(data.startDate as string) : null,
      endDate: data.endDate ? new Date(data.endDate as string) : null,
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
    };
  }

  private toHistoryDomain(raw: unknown): CampaignHistory {
    const data = raw as Record<string, unknown>;
    return {
      id: data.id as string,
      campaignId: data.campaignId as string,
      action: data.action as string,
      status: (data.status as CampaignStatus | null) ?? null,
      changedByUserId: data.changedByUserId as string,
      metadata: (data.metadata as string | null) ?? null,
      changedAt: data.changedAt as Date,
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
    };
  }
}
