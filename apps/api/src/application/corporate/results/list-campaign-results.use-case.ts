import { Inject, Injectable } from '@nestjs/common';
import { ICampaignRepository, ICandidateResultRepository, ICompanyProfileRepository } from '@evaluateme/domain';
import { NotFoundError } from '../../../infrastructure/errors/app-error';

export interface CampaignResultListItem {
  id: string;
  resultCode: string;
  candidateId: string | null;
  technologyId: string | null;
  companyQuizId: string | null;
  score: number | null;
  maxScore: number | null;
  status: string;
  sessionId: string | null;
  createdAt: string;
}

export interface ListCampaignResultsInput {
  userId: string;
  companyId: string;
  campaignId: string;
}

@Injectable()
export class ListCampaignResultsUseCase {
  constructor(
    @Inject(ICampaignRepository) private readonly campaignRepository: ICampaignRepository,
    @Inject(ICandidateResultRepository) private readonly candidateResultRepository: ICandidateResultRepository,
    @Inject(ICompanyProfileRepository) private readonly companyProfileRepository: ICompanyProfileRepository,
  ) {}

  async execute(input: ListCampaignResultsInput): Promise<{ success: true; data: CampaignResultListItem[] }> {
    const profile = await this.companyProfileRepository.findById(input.companyId);
    if (!profile || profile.userId !== input.userId) {
      throw new NotFoundError('company profile');
    }

    const campaign = await this.campaignRepository.findById(input.campaignId);
    if (!campaign || campaign.companyId !== input.companyId) {
      throw new NotFoundError('campaign');
    }

    const results = await this.candidateResultRepository.findByCampaignId(input.campaignId);
    return {
      success: true,
      data: results.map((result) => ({
        id: result.id,
        resultCode: result.resultCode,
        candidateId: result.candidateId,
        technologyId: result.technologyId,
        companyQuizId: result.companyQuizId,
        score: result.score,
        maxScore: result.maxScore,
        status: result.status,
        sessionId: result.sessionId,
        createdAt: result.createdAt.toISOString(),
      })),
    };
  }
}
