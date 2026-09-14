import { Inject, Injectable } from '@nestjs/common';
import { IQuestionSetRepository } from '@evaluateme/domain';

@Injectable()
export class ListQuestionSetsUseCase {
  constructor(@Inject(IQuestionSetRepository) private readonly questionSetRepository: IQuestionSetRepository) {}

  async execute(technologyId: string): Promise<{
    success: true;
    data: Array<{
      id: string;
      title: string;
      technologyId: string;
      status: 'active' | 'suspended';
      quizQuestionCount: number;
      quizDurationMinutes: number;
      updatedAt: string;
    }>;
  }> {
    const rows = await this.questionSetRepository.findByTechnologyId(technologyId);
    return {
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        title: row.title,
        technologyId: row.technologyId,
        status: row.status,
        quizQuestionCount: row.quizQuestionCount,
        quizDurationMinutes: row.quizDurationMinutes,
        updatedAt: row.updatedAt.toISOString(),
      })),
    };
  }
}
