import { Inject, Injectable } from '@nestjs/common';
import { IQuestionSetRepository, IQuestionSetRepository as IQuestionSetRepoType, QuestionSet } from '@evaluateme/domain';
import { BadRequestError, NotFoundError } from '../../../infrastructure/errors/app-error';

export interface UpdateQuestionSetInput {
  id: string;
  title?: string;
  status?: 'active' | 'suspended';
  description?: string | null;
  quizQuestionCount?: number;
  quizDurationMinutes?: number;
}

@Injectable()
export class UpdateQuestionSetUseCase {
  constructor(@Inject(IQuestionSetRepository) private readonly questionSetRepository: IQuestionSetRepoType) {}

  async execute(input: UpdateQuestionSetInput): Promise<{
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
    const existing = await this.questionSetRepository.findById(input.id);
    if (!existing) {
      throw new NotFoundError('QuestionSet', input.id);
    }

    const title = input.title !== undefined ? input.title.trim() : existing.title;
    const status = input.status ?? existing.status;
    const description = input.description !== undefined ? input.description : existing.description;
    const quizQuestionCount = input.quizQuestionCount ?? existing.quizQuestionCount;
    const quizDurationMinutes = input.quizDurationMinutes ?? existing.quizDurationMinutes;

    if (!title) {
      throw new BadRequestError({ title: ['Title is required'] });
    }
    if (quizQuestionCount <= 0) {
      throw new BadRequestError({ quizQuestionCount: ['Question count must be positive'] });
    }
    if (quizDurationMinutes <= 0) {
      throw new BadRequestError({ quizDurationMinutes: ['Duration must be positive'] });
    }

    const saved = await this.questionSetRepository.save({
      ...existing,
      title,
      status,
      description,
      quizQuestionCount,
      quizDurationMinutes,
      updatedAt: new Date(),
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
