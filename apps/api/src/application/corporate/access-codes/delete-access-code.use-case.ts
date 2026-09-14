import { Inject, Injectable } from '@nestjs/common';
import { IAccessCodeRepository, ICampaignRepository, ICompanyProfileRepository } from '@evaluateme/domain';
import { NotFoundError, ForbiddenError } from '../../../infrastructure/errors/app-error';

export interface DeleteAccessCodeInput {
  userId: string;
  companyId: string;
  accessCodeId: string;
}

@Injectable()
export class DeleteAccessCodeUseCase {
  constructor(
    @Inject(IAccessCodeRepository) private readonly accessCodeRepository: IAccessCodeRepository,
    @Inject(ICampaignRepository) private readonly campaignRepository: ICampaignRepository,
    @Inject(ICompanyProfileRepository) private readonly companyProfileRepository: ICompanyProfileRepository,
  ) {}

  async execute(input: DeleteAccessCodeInput): Promise<{ success: true }> {
    const accessCode = await this.accessCodeRepository.findById(input.accessCodeId);
    if (!accessCode) {
      throw new NotFoundError('Access code', input.accessCodeId);
    }

    if (accessCode.companyId !== input.companyId) {
      throw new ForbiddenError('Access code does not belong to your company.');
    }

    const campaign = accessCode.campaignId
      ? await this.campaignRepository.findById(accessCode.campaignId)
      : null;
    if (campaign && campaign.companyId !== input.companyId) {
      throw new ForbiddenError('Access code does not belong to your company.');
    }

    const profile = await this.companyProfileRepository.findByUserId(input.userId);
    if (!profile || profile.id !== input.companyId) {
      throw new ForbiddenError('You are not authorized to delete this access code.');
    }

    await this.accessCodeRepository.delete(input.accessCodeId);
    return { success: true };
  }
}
