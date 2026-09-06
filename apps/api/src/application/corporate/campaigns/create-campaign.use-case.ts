import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ICampaignRepository, Campaign, CampaignStatus, CampaignHistory, ICompanyProfileRepository } from '@evaluateme/domain';
import { NotFoundError } from '../../../infrastructure/errors/app-error';

export interface CreateCampaignInput {
  userId: string;
  companyId: string;
  name: string;
  description?: string | null;
  notes?: string | null;
}

export interface CreateCampaignOutput {
  id: string;
  name: string;
  description: string | null;
  notes: string | null;
  status: CampaignStatus;
  createdByUserId: string;
  companyId: string;
  createdAt: string;
}

@Injectable()
export class CreateCampaignUseCase {
  constructor(
    @Inject(ICampaignRepository) private readonly campaignRepository: ICampaignRepository,
    @Inject(ICompanyProfileRepository) private readonly companyProfileRepository: ICompanyProfileRepository,
  ) {}

  async execute(input: CreateCampaignInput): Promise<{ success: true; data: CreateCampaignOutput }> {
    const profile = await this.companyProfileRepository.findById(input.companyId);
    if (!profile) {
      throw new NotFoundError('company profile');
    }
    if (profile.userId !== input.userId) {
      throw new NotFoundError('company profile');
    }

    const now = new Date();
    const campaign: Campaign = {
      id: randomUUID(),
      companyId: input.companyId,
      name: input.name.trim(),
      description: input.description?.trim() ?? null,
      notes: input.notes?.trim() ?? null,
      status: CampaignStatus.OPEN,
      createdByUserId: input.userId,
      startDate: null,
      endDate: null,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.campaignRepository.save(campaign);
    const history: CampaignHistory = {
      id: randomUUID(),
      campaignId: saved.id,
      action: 'created',
      status: saved.status,
      changedByUserId: input.userId,
      metadata: null,
      changedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    await this.campaignRepository.saveHistory(history);

    return {
      success: true,
      data: {
        id: saved.id,
        name: saved.name,
        description: saved.description,
        notes: saved.notes,
        status: saved.status,
        createdByUserId: saved.createdByUserId,
        companyId: saved.companyId ?? '',
        createdAt: saved.createdAt.toISOString(),
      },
    };
  }
}
