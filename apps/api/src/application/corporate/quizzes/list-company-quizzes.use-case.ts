import { Inject, Injectable } from '@nestjs/common';
import { ICompanyQuizRepository, ICompanyProfileRepository } from '@evaluateme/domain';
import { NotFoundError } from '../../../infrastructure/errors/app-error';

export interface CompanyQuizListItem {
  id: string;
  companyId: string;
  type: string;
  name: string;
  description: string | null;
  status: string;
  createdByUserId: string;
  createdAt: string;
}

export interface ListCompanyQuizzesInput {
  userId: string;
  companyId: string;
}

@Injectable()
export class ListCompanyQuizzesUseCase {
  constructor(
    @Inject(ICompanyQuizRepository) private readonly companyQuizRepository: ICompanyQuizRepository,
    @Inject(ICompanyProfileRepository) private readonly companyProfileRepository: ICompanyProfileRepository,
  ) {}

  async execute(input: ListCompanyQuizzesInput): Promise<{ success: true; data: CompanyQuizListItem[] }> {
    const profile = await this.companyProfileRepository.findById(input.companyId);
    if (!profile || profile.userId !== input.userId) {
      throw new NotFoundError('company profile');
    }

    const quizzes = await this.companyQuizRepository.findByCompanyId(input.companyId);
    return {
      success: true,
      data: quizzes.map((quiz) => ({
        id: quiz.id,
        companyId: quiz.companyId,
        type: quiz.type,
        name: quiz.name,
        description: quiz.description,
        status: quiz.status,
        createdByUserId: quiz.createdByUserId,
        createdAt: quiz.createdAt.toISOString(),
      })),
    };
  }
}
