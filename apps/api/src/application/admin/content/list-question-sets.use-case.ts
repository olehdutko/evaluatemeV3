import { Inject, Injectable } from '@nestjs/common';
import { IQuestionSetRepository } from '@evaluateme/domain';

@Injectable()
export class ListQuestionSetsUseCase {
  constructor(@Inject(IQuestionSetRepository) private readonly questionSetRepository: IQuestionSetRepository) {}

  async execute(technologyId: string): Promise<{
    success: true;
    data: Array<{
      id: string;
      name: string;
      description: string | null;
      technologyId: string;
      status: 'active' | 'suspended';
      questionCount: number;
      durationMinutes: number;
      updatedAt: string;
    }>;
  }> {
    const rows = await this.questionSetRepository.findByTechnologyId(technologyId);
    return {
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        name: row.title,
        description: row.description,
        technologyId: row.technologyId,
        status: row.status,
        questionCount: row.quizQuestionCount,
        durationMinutes: row.quizDurationMinutes,
        updatedAt: row.updatedAt.toISOString(),
      })),
    };
  }
}
