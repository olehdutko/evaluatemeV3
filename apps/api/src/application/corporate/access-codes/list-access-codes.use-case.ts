import { Inject, Injectable } from '@nestjs/common';
import { IAccessCodeRepository, ICampaignRepository, ICompanyProfileRepository } from '@evaluateme/domain';
import { NotFoundError } from '../../../infrastructure/errors/app-error';

export interface AccessCodeListItem {
  id: string;
  code: string;
  status: string;
  sentAt: string | null;
  sentToEmail: string | null;
  usedCount: number;
  maxUses: number;
  usedAt: string | null;
  createdAt: string;
}

export interface ListAccessCodesInput {
  userId: string;
  companyId: string;
  campaignId: string;
}

@Injectable()
export class ListAccessCodesUseCase {
  constructor(
    @Inject(IAccessCodeRepository) private readonly accessCodeRepository: IAccessCodeRepository,
    @Inject(ICampaignRepository) private readonly campaignRepository: ICampaignRepository,
    @Inject(ICompanyProfileRepository) private readonly companyProfileRepository: ICompanyProfileRepository,
  ) {}

  async execute(input: ListAccessCodesInput): Promise<{ success: true; data: AccessCodeListItem[] }> {
    const profile = await this.companyProfileRepository.findById(input.companyId);
    if (!profile || profile.userId !== input.userId) {
      throw new NotFoundError('company profile');
    }

    const campaign = await this.campaignRepository.findById(input.campaignId);
    if (!campaign || campaign.companyId !== input.companyId) {
      throw new NotFoundError('campaign');
    }

    const codes = await this.accessCodeRepository.findByCampaignId(input.campaignId);
    return {
      success: true,
      data: codes.map((code) => ({
        id: code.id,
        code: code.code,
        status: code.status,
        sentAt: code.sentAt ? code.sentAt.toISOString() : null,
        sentToEmail: code.sentToEmail,
        usedCount: code.usedCount,
        maxUses: code.maxUses,
        usedAt: code.usedAt ? code.usedAt.toISOString() : null,
        createdAt: code.createdAt.toISOString(),
      })),
    };
  }
}
