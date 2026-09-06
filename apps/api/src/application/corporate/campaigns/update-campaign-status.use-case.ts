import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ICampaignRepository, CampaignStatus, CampaignHistory, ICompanyProfileRepository } from '@evaluateme/domain';
import { NotFoundError, BadRequestError } from '../../../infrastructure/errors/app-error';

export interface UpdateCampaignStatusInput {
  userId: string;
  companyId: string;
  campaignId: string;
  newStatus: CampaignStatus;
}

const ALLOWED_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  [CampaignStatus.OPEN]: [CampaignStatus.CLOSED],
  [CampaignStatus.CLOSED]: [CampaignStatus.ARCHIVED, CampaignStatus.OPEN],
  [CampaignStatus.ARCHIVED]: [CampaignStatus.OPEN],
};

@Injectable()
export class UpdateCampaignStatusUseCase {
  constructor(
    @Inject(ICampaignRepository) private readonly campaignRepository: ICampaignRepository,
    @Inject(ICompanyProfileRepository) private readonly companyProfileRepository: ICompanyProfileRepository,
  ) {}

  async execute(input: UpdateCampaignStatusInput): Promise<{ success: true; data: { id: string; status: CampaignStatus } }> {
    const profile = await this.companyProfileRepository.findById(input.companyId);
    if (!profile || profile.userId !== input.userId) {
      throw new NotFoundError('company profile');
    }

    const campaign = await this.campaignRepository.findById(input.campaignId);
    if (!campaign || campaign.companyId !== input.companyId) {
      throw new NotFoundError('campaign');
    }

    if (!ALLOWED_TRANSITIONS[campaign.status].includes(input.newStatus)) {
      throw new BadRequestError({ status: [`Cannot transition from ${campaign.status} to ${input.newStatus}`] });
    }

    const updated = await this.campaignRepository.save({
      ...campaign,
      status: input.newStatus,
      updatedAt: new Date(),
    });

    const now = new Date();
    const history: CampaignHistory = {
      id: randomUUID(),
      campaignId: updated.id,
      action: 'status_changed',
      status: updated.status,
      changedByUserId: input.userId,
      metadata: JSON.stringify({ previousStatus: campaign.status }),
      changedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    await this.campaignRepository.saveHistory(history);

    return {
      success: true,
      data: {
        id: updated.id,
        status: updated.status,
      },
    };
  }
}
