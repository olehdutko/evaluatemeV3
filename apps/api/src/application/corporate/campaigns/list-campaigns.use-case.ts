import { Inject, Injectable } from '@nestjs/common';
import { ICampaignRepository, CampaignStatus, ICompanyProfileRepository, IAccessCodeRepository } from '@evaluateme/domain';
import { NotFoundError } from '../../../infrastructure/errors/app-error';

export interface CampaignListItem {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  status: CampaignStatus;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  accessCodeCount: number;
}

export interface ListCampaignsInput {
  userId: string;
  companyId: string;
  status?: CampaignStatus | null;
}

@Injectable()
export class ListCampaignsUseCase {
  constructor(
    @Inject(ICampaignRepository) private readonly campaignRepository: ICampaignRepository,
    @Inject(ICompanyProfileRepository) private readonly companyProfileRepository: ICompanyProfileRepository,
    @Inject(IAccessCodeRepository) private readonly accessCodeRepository: IAccessCodeRepository,
  ) {}

  async execute(input: ListCampaignsInput): Promise<{ success: true; data: CampaignListItem[] }> {
    const profile = await this.companyProfileRepository.findById(input.companyId);
    if (!profile || profile.userId !== input.userId) {
      throw new NotFoundError('company profile');
    }

    const campaigns = input.status
      ? await this.campaignRepository.findByCompanyIdAndStatus(input.companyId, input.status)
      : await this.campaignRepository.findByCompanyId(input.companyId);

    const counts = await Promise.all(
      campaigns.map((campaign) => this.accessCodeRepository.countByCampaignId(campaign.id)),
    );

    return {
      success: true,
      data: campaigns.map((campaign, index) => ({
        id: campaign.id,
        companyId: campaign.companyId ?? '',
        name: campaign.name,
        description: campaign.description,
        status: campaign.status,
        createdByUserId: campaign.createdByUserId,
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString(),
        accessCodeCount: counts[index] ?? 0,
      })),
    };
  }
}
