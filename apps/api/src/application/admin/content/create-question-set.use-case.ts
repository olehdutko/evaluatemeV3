import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IQuestionSetRepository, IQuestionSetRepository as IQuestionSetRepoType, QuestionSet } from '@evaluateme/domain';
import { BadRequestError, ConflictError } from '../../../infrastructure/errors/app-error';

export interface CreateQuestionSetInput {
  technologyId: string;
  name: string;
  description?: string | null;
  questionCount?: number;
  durationMinutes?: number;
  createdByUserId: string;
}

@Injectable()
export class CreateQuestionSetUseCase {
  constructor(@Inject(IQuestionSetRepository) private readonly questionSetRepository: IQuestionSetRepoType) {}

  async execute(input: CreateQuestionSetInput): Promise<{
    success: true;
    data: {
      id: string;
      name: string;
      description: string | null;
      technologyId: string;
      status: 'active' | 'suspended';
      questionCount: number;
      durationMinutes: number;
      updatedAt: string;
    };
  }> {
    const name = input.name.trim();
    const technologyId = input.technologyId.trim();
    const questionCount = input.questionCount ?? 20;
    const durationMinutes = input.durationMinutes ?? 40;

    if (!name) {
      throw new BadRequestError({ name: ['Name is required'] });
    }
    if (!technologyId) {
      throw new BadRequestError({ technologyId: ['Technology id is required'] });
    }
    if (questionCount <= 0) {
      throw new BadRequestError({ questionCount: ['Question count must be positive'] });
    }
    if (durationMinutes <= 0) {
      throw new BadRequestError({ durationMinutes: ['Duration must be positive'] });
    }

    const existing = await this.questionSetRepository.findByTechnologyIdAndTitle(technologyId, name);
    if (existing) {
      throw new ConflictError('A question set with this name already exists for this technology.');
    }

    const now = new Date();
    const saved = await this.questionSetRepository.save({
      id: randomUUID(),
      title: name,
      technologyId,
      status: 'active',
      description: input.description ?? null,
      quizQuestionCount: questionCount,
      quizDurationMinutes: durationMinutes,
      createdByUserId: input.createdByUserId,
      createdAt: now,
      updatedAt: now,
    } as QuestionSet);

    return {
      success: true,
      data: {
        id: saved.id,
        name: saved.title,
        description: saved.description,
        technologyId: saved.technologyId,
        status: saved.status,
        questionCount: saved.quizQuestionCount,
        durationMinutes: saved.quizDurationMinutes,
        updatedAt: saved.updatedAt.toISOString(),
      },
    };
  }
}
