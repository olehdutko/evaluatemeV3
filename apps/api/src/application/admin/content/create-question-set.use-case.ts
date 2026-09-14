import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IQuestionSetRepository, IQuestionSetRepository as IQuestionSetRepoType, QuestionSet } from '@evaluateme/domain';
import { BadRequestError, ConflictError } from '../../../infrastructure/errors/app-error';

export interface CreateQuestionSetInput {
  technologyId: string;
  title: string;
  quizQuestionCount?: number;
  quizDurationMinutes?: number;
  createdByUserId: string;
}

@Injectable()
export class CreateQuestionSetUseCase {
  constructor(@Inject(IQuestionSetRepository) private readonly questionSetRepository: IQuestionSetRepoType) {}

  async execute(input: CreateQuestionSetInput): Promise<{
    success: true;
    data: {
      id: string;
      title: string;
      technologyId: string;
      status: 'active' | 'suspended';
      quizQuestionCount: number;
      quizDurationMinutes: number;
      updatedAt: string;
    };
  }> {
    const title = input.title.trim();
    const technologyId = input.technologyId.trim();
    const quizQuestionCount = input.quizQuestionCount ?? 20;
    const quizDurationMinutes = input.quizDurationMinutes ?? 40;

    if (!title) {
      throw new BadRequestError({ title: ['Title is required'] });
    }
    if (!technologyId) {
      throw new BadRequestError({ technologyId: ['Technology id is required'] });
    }
    if (quizQuestionCount <= 0) {
      throw new BadRequestError({ quizQuestionCount: ['Question count must be positive'] });
    }
    if (quizDurationMinutes <= 0) {
      throw new BadRequestError({ quizDurationMinutes: ['Duration must be positive'] });
    }

    const existing = await this.questionSetRepository.findByTechnologyIdAndTitle(technologyId, title);
    if (existing) {
      throw new ConflictError('A question set with this title already exists for this technology.');
    }

    const now = new Date();
    const saved = await this.questionSetRepository.save({
      id: randomUUID(),
      title,
      technologyId,
      status: 'active',
      quizQuestionCount,
      quizDurationMinutes,
      createdByUserId: input.createdByUserId,
      createdAt: now,
      updatedAt: now,
    } as QuestionSet);

    return {
      success: true,
      data: {
        id: saved.id,
        title: saved.title,
        technologyId: saved.technologyId,
        status: saved.status,
        quizQuestionCount: saved.quizQuestionCount,
        quizDurationMinutes: saved.quizDurationMinutes,
        updatedAt: saved.updatedAt.toISOString(),
      },
    };
  }
}
