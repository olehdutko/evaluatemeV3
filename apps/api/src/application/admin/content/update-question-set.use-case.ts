import { Inject, Injectable } from '@nestjs/common';
import { IQuestionSetRepository, IQuestionSetRepository as IQuestionSetRepoType, QuestionSet } from '@evaluateme/domain';
import { BadRequestError, NotFoundError } from '../../../infrastructure/errors/app-error';

export interface UpdateQuestionSetInput {
  id: string;
  name?: string;
  status?: 'active' | 'suspended';
  description?: string | null;
  questionCount?: number;
  durationMinutes?: number;
}

@Injectable()
export class UpdateQuestionSetUseCase {
  constructor(@Inject(IQuestionSetRepository) private readonly questionSetRepository: IQuestionSetRepoType) {}

  async execute(input: UpdateQuestionSetInput): Promise<{
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
    const existing = await this.questionSetRepository.findById(input.id);
    if (!existing) {
      throw new NotFoundError('QuestionSet', input.id);
    }

    const name = input.name !== undefined ? input.name.trim() : existing.title;
    const status = input.status ?? existing.status;
    const description = input.description !== undefined ? input.description : existing.description;
    const questionCount = input.questionCount ?? existing.quizQuestionCount;
    const durationMinutes = input.durationMinutes ?? existing.quizDurationMinutes;

    if (!name) {
      throw new BadRequestError({ name: ['Name is required'] });
    }
    if (questionCount <= 0) {
      throw new BadRequestError({ questionCount: ['Question count must be positive'] });
    }
    if (durationMinutes <= 0) {
      throw new BadRequestError({ durationMinutes: ['Duration must be positive'] });
    }

    const saved = await this.questionSetRepository.save({
      ...existing,
      title: name,
      status,
      description,
      quizQuestionCount: questionCount,
      quizDurationMinutes: durationMinutes,
      updatedAt: new Date(),
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
