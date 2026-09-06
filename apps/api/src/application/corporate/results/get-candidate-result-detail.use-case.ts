import { Inject, Injectable } from '@nestjs/common';
import { ICandidateResultRepository, ICompanyProfileRepository, ICampaignRepository, IQuizSessionRepository } from '@evaluateme/domain';
import { NotFoundError } from '../../../infrastructure/errors/app-error';

export interface QuestionResult {
  questionId: string;
  answerId: string | null;
  isCorrect: boolean;
}

export interface CandidateResultDetail {
  id: string;
  resultCode: string;
  campaignId: string | null;
  candidateId: string | null;
  accessCodeId: string | null;
  technologyId: string | null;
  companyQuizId: string | null;
  score: number | null;
  maxScore: number | null;
  status: string;
  sessionId: string | null;
  createdAt: string;
  questions: QuestionResult[];
}

export interface GetCandidateResultDetailInput {
  userId: string;
  companyId: string;
  campaignId: string;
  resultId: string;
}

@Injectable()
export class GetCandidateResultDetailUseCase {
  constructor(
    @Inject(ICandidateResultRepository) private readonly candidateResultRepository: ICandidateResultRepository,
    @Inject(ICompanyProfileRepository) private readonly companyProfileRepository: ICompanyProfileRepository,
    @Inject(ICampaignRepository) private readonly campaignRepository: ICampaignRepository,
    @Inject(IQuizSessionRepository) private readonly quizSessionRepository: IQuizSessionRepository,
  ) {}

  async execute(input: GetCandidateResultDetailInput): Promise<{ success: true; data: CandidateResultDetail }> {
    const profile = await this.companyProfileRepository.findById(input.companyId);
    if (!profile || profile.userId !== input.userId) {
      throw new NotFoundError('company profile');
    }

    const campaign = await this.campaignRepository.findById(input.campaignId);
    if (!campaign || campaign.companyId !== input.companyId) {
      throw new NotFoundError('campaign');
    }

    const result = await this.candidateResultRepository.findByResultCode(input.resultId);
    if (!result || result.campaignId !== input.campaignId) {
      throw new NotFoundError('result');
    }

    const sessionAnswers = result.sessionId
      ? await this.quizSessionRepository.findAnswersBySessionId(result.sessionId)
      : [];

    return {
      success: true,
      data: {
        id: result.id,
        resultCode: result.resultCode,
        campaignId: result.campaignId,
        candidateId: result.candidateId,
        accessCodeId: result.accessCodeId,
        technologyId: result.technologyId,
        companyQuizId: result.companyQuizId,
        score: result.score,
        maxScore: result.maxScore,
        status: result.status,
        sessionId: result.sessionId,
        createdAt: result.createdAt.toISOString(),
        questions: sessionAnswers.map((a) => ({
          questionId: a.questionId,
          answerId: a.answerId,
          isCorrect: a.isCorrect,
        })),
      },
    };
  }
}
