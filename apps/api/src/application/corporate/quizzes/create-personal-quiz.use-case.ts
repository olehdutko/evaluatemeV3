import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ICompanyQuizRepository, CompanyQuiz, CompanyQuizStatus, CompanyQuizType, CompanyQuizQuestion, CompanyQuizAnswer, ICompanyProfileRepository } from '@evaluateme/domain';
import { NotFoundError, BadRequestError } from '../../../infrastructure/errors/app-error';

export interface PersonalQuizQuestionInput {
  content: string;
  type: 'single_choice' | 'multiple_choice';
  score?: number;
  answers: { content: string; isCorrect: boolean }[];
}

export interface CreatePersonalQuizInput {
  userId: string;
  companyId: string;
  name: string;
  description?: string | null;
  questions: PersonalQuizQuestionInput[];
}

@Injectable()
export class CreatePersonalQuizUseCase {
  constructor(
    @Inject(ICompanyQuizRepository) private readonly companyQuizRepository: ICompanyQuizRepository,
    @Inject(ICompanyProfileRepository) private readonly companyProfileRepository: ICompanyProfileRepository,
  ) {}

  async execute(input: CreatePersonalQuizInput): Promise<{ success: true; data: { id: string; name: string } }> {
    const profile = await this.companyProfileRepository.findById(input.companyId);
    if (!profile || profile.userId !== input.userId) {
      throw new NotFoundError('company profile');
    }
    if (input.questions.length === 0) {
      throw new BadRequestError({ questions: ['At least one question is required'] });
    }

    const now = new Date();
    const quiz: CompanyQuiz = {
      id: randomUUID(),
      companyId: input.companyId,
      type: CompanyQuizType.PERSONAL,
      name: input.name.trim(),
      description: input.description?.trim() ?? null,
      status: CompanyQuizStatus.PUBLISHED,
      createdByUserId: input.userId,
      createdAt: now,
      updatedAt: now,
    };

    const questions: CompanyQuizQuestion[] = [];
    const answers: CompanyQuizAnswer[] = [];

    input.questions.forEach((q, qIndex) => {
      const questionId = randomUUID();
      questions.push({
        id: questionId,
        companyQuizId: quiz.id,
        content: q.content.trim(),
        type: q.type,
        orderIndex: qIndex,
        score: q.score ?? 1,
        createdAt: now,
        updatedAt: now,
      });
      q.answers.forEach((a, aIndex) => {
        answers.push({
          id: randomUUID(),
          companyQuizQuestionId: questionId,
          content: a.content.trim(),
          isCorrect: a.isCorrect,
          orderIndex: aIndex,
          createdAt: now,
          updatedAt: now,
        });
      });
    });

    const saved = await this.companyQuizRepository.save(quiz, questions, answers);
    return {
      success: true,
      data: {
        id: saved.id,
        name: saved.name,
      },
    };
  }
}
