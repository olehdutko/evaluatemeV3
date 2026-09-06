import { Inject, Injectable } from '@nestjs/common';
import { ICampaignRepository, CampaignStatus, ICompanyProfileRepository } from '@evaluateme/domain';
import { NotFoundError } from '../../../infrastructure/errors/app-error';

export interface CampaignHistoryItem {
  id: string;
  action: string;
  status: CampaignStatus | null;
  changedByUserId: string;
  metadata: string | null;
  changedAt: string;
}

export interface GetCampaignOutput {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  notes: string | null;
  status: CampaignStatus;
  createdByUserId: string;
  createdAt: string;
  history: CampaignHistoryItem[];
}

export interface GetCampaignInput {
  userId: string;
  companyId: string;
  campaignId: string;
}

@Injectable()
export class GetCampaignUseCase {
  constructor(
    @Inject(ICampaignRepository) private readonly campaignRepository: ICampaignRepository,
    @Inject(ICompanyProfileRepository) private readonly companyProfileRepository: ICompanyProfileRepository,
  ) {}

  async execute(input: GetCampaignInput): Promise<{ success: true; data: GetCampaignOutput }> {
    const profile = await this.companyProfileRepository.findById(input.companyId);
    if (!profile || profile.userId !== input.userId) {
      throw new NotFoundError('company profile');
    }

    const campaign = await this.campaignRepository.findById(input.campaignId);
    if (!campaign || campaign.companyId !== input.companyId) {
      throw new NotFoundError('campaign');
    }

    const history = await this.campaignRepository.findHistoryByCampaignId(campaign.id);

    return {
      success: true,
      data: {
        id: campaign.id,
        companyId: campaign.companyId ?? '',
        name: campaign.name,
        description: campaign.description,
        notes: campaign.notes,
        status: campaign.status,
        createdByUserId: campaign.createdByUserId,
        createdAt: campaign.createdAt.toISOString(),
        history: history.map((h) => ({
          id: h.id,
          action: h.action,
          status: h.status,
          changedByUserId: h.changedByUserId,
          metadata: h.metadata,
          changedAt: h.changedAt.toISOString(),
        })),
      },
    };
  }
}
