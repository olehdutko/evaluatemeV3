import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  IAccessCodeRepository,
  ICompanyProfileRepository,
  ICampaignRepository,
  AccessCode,
  AccessCodeStatus,
  CampaignHistory,
} from '@evaluateme/domain';
import { NotFoundError, BadRequestError, ConflictError } from '../../../infrastructure/errors/app-error';

export interface CreateAccessCodeInput {
  userId: string;
  companyId: string;
  campaignId: string;
  testeeName: string;
  testeeEmail: string;
  questionCount: number;
  durationMinutes: number;
}

export interface CreateAccessCodeOutput {
  id: string;
  code: string;
  createdCount: number;
  activatedCount: number;
  limit: number | null;
}

@Injectable()
export class CreateAccessCodeUseCase {
  constructor(
    @Inject(IAccessCodeRepository) private readonly accessCodeRepository: IAccessCodeRepository,
    @Inject(ICompanyProfileRepository) private readonly companyProfileRepository: ICompanyProfileRepository,
    @Inject(ICampaignRepository) private readonly campaignRepository: ICampaignRepository,
  ) {}

  async execute(input: CreateAccessCodeInput): Promise<{ success: true; data: CreateAccessCodeOutput }> {
    const profile = await this.companyProfileRepository.findById(input.companyId);
    if (!profile || profile.userId !== input.userId) {
      throw new NotFoundError('company profile');
    }

    const campaign = await this.campaignRepository.findById(input.campaignId);
    if (!campaign || campaign.companyId !== input.companyId) {
      throw new NotFoundError('campaign');
    }
    if (campaign.status !== 'open') {
      throw new BadRequestError({ campaign: ['Access codes can only be created in open campaigns'] });
    }

    const createdCount = await this.accessCodeRepository.countByCompanyId(input.companyId);

    const code = this.generateCode();
    const existing = await this.accessCodeRepository.findByCode(code);
    if (existing) {
      throw new ConflictError('Generated access code already exists. Please retry.');
    }

    const now = new Date();
    const accessCode: AccessCode = {
      id: randomUUID(),
      code,
      companyId: input.companyId,
      campaignId: input.campaignId,
      quizId: null,
      questionSetId: null,
      status: AccessCodeStatus.ACTIVE,
      sentAt: null,
      sentToEmail: null,
      usedCount: 0,
      maxUses: 1,
      expiresAt: null,
      usedAt: null,
      testeeName: input.testeeName,
      testeeEmail: input.testeeEmail,
      questionCount: input.questionCount,
      durationMinutes: input.durationMinutes,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.accessCodeRepository.save(accessCode);

    const historyNow = new Date();
    const history: CampaignHistory = {
      id: randomUUID(),
      campaignId: input.campaignId,
      action: 'access_code_created',
      status: null,
      changedByUserId: input.userId,
      metadata: JSON.stringify({
        accessCodeId: saved.id,
        testeeName: input.testeeName,
        testeeEmail: input.testeeEmail,
        questionCount: input.questionCount,
        durationMinutes: input.durationMinutes,
      }),
      changedAt: historyNow,
      createdAt: historyNow,
      updatedAt: historyNow,
    };
    await this.campaignRepository.saveHistory(history);

    return {
      success: true,
      data: {
        id: saved.id,
        code: saved.code,
        createdCount: createdCount + 1,
        activatedCount: 0,
        limit: profile.availableAccessCodes === -1 ? null : profile.availableAccessCodes,
      },
    };
  }

  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i += 1) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
