import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IAccessCodeRepository, ICompanyProfileRepository, ICampaignRepository, ICompanyQuizRepository, AccessCode, AccessCodeStatus, CampaignHistory } from '@evaluateme/domain';
import { NotFoundError, BadRequestError, ConflictError } from '../../../infrastructure/errors/app-error';

export interface CreateAccessCodeInput {
  userId: string;
  companyId: string;
  campaignId: string;
  quizId: string;
  quizType: 'technology' | 'company_quiz';
  technologyId?: string;
}

@Injectable()
export class CreateAccessCodeUseCase {
  constructor(
    @Inject(IAccessCodeRepository) private readonly accessCodeRepository: IAccessCodeRepository,
    @Inject(ICompanyProfileRepository) private readonly companyProfileRepository: ICompanyProfileRepository,
    @Inject(ICampaignRepository) private readonly campaignRepository: ICampaignRepository,
    @Inject(ICompanyQuizRepository) private readonly companyQuizRepository: ICompanyQuizRepository,
  ) {}

  async execute(input: CreateAccessCodeInput): Promise<{ success: true; data: { id: string; code: string } }> {
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

    if (input.quizType === 'company_quiz') {
      const quiz = await this.companyQuizRepository.findById(input.quizId);
      if (!quiz || quiz.companyId !== input.companyId) {
        throw new NotFoundError('quiz');
      }
    }

    if (profile.availableAccessCodes > 0 && profile.availableAccessCodes <= 0) {
      // unreachable but keeps lint happy
    }
    if (profile.availableAccessCodes !== -1 && profile.availableAccessCodes <= 0) {
      throw new BadRequestError({ accessCodes: ['No access codes available for this company'] });
    }

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
      quizId: input.quizId,
      technologyId: input.technologyId ?? null,
      status: AccessCodeStatus.ACTIVE,
      sentAt: null,
      sentToEmail: null,
      usedCount: 0,
      maxUses: 1,
      expiresAt: null,
      usedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.accessCodeRepository.save(accessCode);

    if (profile.availableAccessCodes > 0) {
      await this.companyProfileRepository.save({
        ...profile,
        availableAccessCodes: profile.availableAccessCodes - 1,
      });
    }

    const historyNow = new Date();
    const history: CampaignHistory = {
      id: randomUUID(),
      campaignId: input.campaignId,
      action: 'access_code_created',
      status: null,
      changedByUserId: input.userId,
      metadata: JSON.stringify({ accessCodeId: saved.id, quizId: input.quizId, quizType: input.quizType }),
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
