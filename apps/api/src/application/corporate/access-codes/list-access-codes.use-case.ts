import { Inject, Injectable } from '@nestjs/common';
import { IAccessCodeRepository, ICampaignRepository, ICompanyProfileRepository, ICandidateResultRepository } from '@evaluateme/domain';
import { NotFoundError } from '../../../infrastructure/errors/app-error';

export interface AccessCodeResultSummary {
  id: string;
  resultCode: string;
  status: string;
  score: number | null;
  maxScore: number | null;
}

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
  testeeName: string | null;
  testeeEmail: string | null;
  questionCount: number | null;
  durationMinutes: number | null;
  result: AccessCodeResultSummary | null;
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
    @Inject(ICandidateResultRepository) private readonly candidateResultRepository: ICandidateResultRepository,
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

    const [codes, results] = await Promise.all([
      this.accessCodeRepository.findByCampaignId(input.campaignId),
      this.candidateResultRepository.findByCampaignId(input.campaignId),
    ]);

    const resultByAccessCodeId = new Map<string, AccessCodeResultSummary>();
    for (const result of results) {
      if (result.accessCodeId) {
        resultByAccessCodeId.set(result.accessCodeId, {
          id: result.id,
          resultCode: result.resultCode,
          status: result.status,
          score: result.score,
          maxScore: result.maxScore,
        });
      }
    }

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
        testeeName: code.testeeName,
        testeeEmail: code.testeeEmail,
        questionCount: code.questionCount,
        durationMinutes: code.durationMinutes,
        result: resultByAccessCodeId.get(code.id) ?? null,
      })),
    };
  }
}
