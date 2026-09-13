import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  IAccessCodeRepository,
  ICompanyProfileRepository,
  IEmailService,
  ICampaignRepository,
  CampaignHistory,
} from '@evaluateme/domain';
import { NotFoundError, BadRequestError } from '../../../infrastructure/errors/app-error';

export interface SendAccessCodeInput {
  userId: string;
  companyId: string;
  accessCodeId: string;
  email?: string;
}

export interface SendAccessCodeOutput {
  sentAt: string;
  activatedCount: number;
  remaining: number | null;
}

@Injectable()
export class SendAccessCodeUseCase {
  constructor(
    @Inject(IAccessCodeRepository) private readonly accessCodeRepository: IAccessCodeRepository,
    @Inject(ICompanyProfileRepository) private readonly companyProfileRepository: ICompanyProfileRepository,
    @Inject(IEmailService) private readonly emailService: IEmailService,
    @Inject(ICampaignRepository) private readonly campaignRepository: ICampaignRepository,
  ) {}

  async execute(input: SendAccessCodeInput): Promise<{ success: true; data: SendAccessCodeOutput }> {
    const profile = await this.companyProfileRepository.findById(input.companyId);
    if (!profile || profile.userId !== input.userId) {
      throw new NotFoundError('company profile');
    }

    const code = await this.accessCodeRepository.findById(input.accessCodeId);
    if (!code || code.companyId !== input.companyId) {
      throw new NotFoundError('access code');
    }
    if (code.status !== 'active') {
      throw new BadRequestError({ accessCode: ['Access code is not active'] });
    }
    if (code.sentAt) {
      throw new BadRequestError({ accessCode: ['Access code has already been sent'] });
    }

    const recipientEmail = input.email ?? code.testeeEmail ?? null;
    if (!recipientEmail) {
      throw new BadRequestError({ email: ['Recipient email is required'] });
    }

    const activatedCount = await this.accessCodeRepository.countSentByCompanyId(input.companyId);
    const limit = profile.availableAccessCodes;
    if (limit !== -1 && activatedCount >= limit) {
      throw new BadRequestError({
        accessCodes: [
          `Access code limit reached: ${activatedCount} of ${limit} activated`,
        ],
      });
    }

    const now = new Date();
    await this.emailService.send({
      to: recipientEmail,
      subject: 'Your EvaluateMe assessment access code',
      html: `<p>Use this access code to start your assessment: <strong>${code.code}</strong></p>`,
      text: `Use this access code to start your assessment: ${code.code}`,
    });

    // Deduct one access code credit only when the code is actually used (sent).
    if (limit !== -1) {
      await this.companyProfileRepository.save({
        ...profile,
        availableAccessCodes: Math.max(0, profile.availableAccessCodes - 1),
        updatedAt: now,
      });
    }

    const updated = await this.accessCodeRepository.save({
      ...code,
      sentAt: now,
      sentToEmail: recipientEmail,
      updatedAt: now,
    });

    const remaining = limit === -1
      ? null
      : Math.max(0, limit - (activatedCount + 1));

    if (code.campaignId) {
      const history: CampaignHistory = {
        id: randomUUID(),
        campaignId: code.campaignId,
        action: 'access_code_sent',
        status: null,
        changedByUserId: input.userId,
        metadata: JSON.stringify({ accessCodeId: code.id, recipientEmail }),
        changedAt: now,
        createdAt: now,
        updatedAt: now,
      };
      await this.campaignRepository.saveHistory(history);
    }

    return {
      success: true,
      data: {
        sentAt: updated.sentAt!.toISOString(),
        activatedCount: Number(activatedCount) + 1,
        remaining: Number(remaining),
      },
    };
  }
}
