import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ICompanyQuizRepository, CompanyQuiz, CompanyQuizStatus, CompanyQuizType, CustomQuizQuestion, ICompanyProfileRepository } from '@evaluateme/domain';
import { NotFoundError, BadRequestError } from '../../../infrastructure/errors/app-error';

export interface CreateCustomQuizInput {
  userId: string;
  companyId: string;
  name: string;
  description?: string | null;
  questionIds: string[];
}

@Injectable()
export class CreateCustomQuizUseCase {
  constructor(
    @Inject(ICompanyQuizRepository) private readonly companyQuizRepository: ICompanyQuizRepository,
    @Inject(ICompanyProfileRepository) private readonly companyProfileRepository: ICompanyProfileRepository,
  ) {}

  async execute(input: CreateCustomQuizInput): Promise<{ success: true; data: { id: string; name: string } }> {
    const profile = await this.companyProfileRepository.findById(input.companyId);
    if (!profile || profile.userId !== input.userId) {
      throw new NotFoundError('company profile');
    }
    if (input.questionIds.length === 0) {
      throw new BadRequestError({ questionIds: ['At least one question is required'] });
    }

    const now = new Date();
    const quiz: CompanyQuiz = {
      id: randomUUID(),
      companyId: input.companyId,
      type: CompanyQuizType.CUSTOM,
      name: input.name.trim(),
      description: input.description?.trim() ?? null,
      status: CompanyQuizStatus.PUBLISHED,
      createdByUserId: input.userId,
      createdAt: now,
      updatedAt: now,
    };

    const questions: CustomQuizQuestion[] = input.questionIds.map((questionId, index) => ({
      id: randomUUID(),
      companyQuizId: quiz.id,
      questionId,
      orderIndex: index,
      createdAt: now,
      updatedAt: now,
    }));

    const saved = await this.companyQuizRepository.save(quiz, questions);
    return {
      success: true,
      data: {
        id: saved.id,
        name: saved.name,
      },
    };
  }
}
