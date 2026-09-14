import { Inject, Injectable } from '@nestjs/common';
import { IAccessCodeRepository, ICampaignRepository, CampaignHistory } from '@evaluateme/domain';
import { NotFoundError, ForbiddenError } from '../../../infrastructure/errors/app-error';
import { randomUUID } from 'crypto';

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
  ) {}

  async execute(input: DeleteAccessCodeInput): Promise<{ success: true }> {
    const accessCode = await this.accessCodeRepository.findById(input.accessCodeId);
    if (!accessCode) {
      throw new NotFoundError('Access code', input.accessCodeId);
    }

    if (accessCode.companyId !== input.companyId) {
      throw new ForbiddenError('Access code does not belong to your company.');
    }

    if (accessCode.campaignId) {
      const campaign = await this.campaignRepository.findById(accessCode.campaignId);
      if (campaign && campaign.companyId !== input.companyId) {
        throw new ForbiddenError('Access code does not belong to your company.');
      }
    }

    await this.accessCodeRepository.delete(input.accessCodeId);

    if (accessCode.campaignId) {
      const history: CampaignHistory = {
        id: randomUUID(),
        campaignId: accessCode.campaignId,
        action: 'access_code_deleted',
        status: null,
        changedByUserId: input.userId,
        metadata: JSON.stringify({
          accessCodeId: accessCode.id,
          code: accessCode.code,
          testeeEmail: accessCode.testeeEmail,
          testeeName: accessCode.testeeName,
        }),
        changedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await this.campaignRepository.saveHistory(history);
    }

    return { success: true };
  }
}
