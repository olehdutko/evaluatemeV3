import { Inject, Injectable } from '@nestjs/common';
import { IQuestionSetRepository, ITechnologyRepository } from '@evaluateme/domain';
import { NotFoundError } from '../../../infrastructure/errors/app-error';

@Injectable()
export class ListQuestionSetsUseCase {
  constructor(
    @Inject(IQuestionSetRepository) private readonly questionSetRepository: IQuestionSetRepository,
    @Inject(ITechnologyRepository) private readonly technologyRepository: ITechnologyRepository,
  ) {}

  async execute(technologyId: string): Promise<{
    success: true;
    data: {
      technologyId: string;
      technologyName: string;
      questionSets: Array<{
        id: string;
        name: string;
        description: string | null;
        status: 'active' | 'suspended';
        questionCount: number;
        durationMinutes: number;
        updatedAt: string;
      }>;
    };
  }> {
    const technology = await this.technologyRepository.findById(technologyId);
    if (!technology) {
      throw new NotFoundError('Technology', technologyId);
    }

    const rows = await this.questionSetRepository.findByTechnologyId(technologyId);
    return {
      success: true,
      data: {
        technologyId: technology.id,
        technologyName: technology.name,
        questionSets: rows.map((row) => ({
          id: row.id,
          name: row.title,
          description: row.description,
          status: row.status,
          questionCount: row.quizQuestionCount,
          durationMinutes: row.quizDurationMinutes,
          updatedAt: row.updatedAt.toISOString(),
        })),
      },
    };
  }
}
