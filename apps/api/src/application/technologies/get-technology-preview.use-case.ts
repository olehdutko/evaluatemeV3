import { Inject, Injectable } from '@nestjs/common';
import {
  ITechnologyRepository,
  IQuestionSetRepository,
  IQuestionRepository,
  ICreditSettingRepository,
  QuestionSet,
} from '@evaluateme/domain';
import { NotFoundError } from '../../infrastructure/errors/app-error';

const DEFAULT_TEST_PRICE_CREDITS = 1;
const TEST_PRICE_KEY = 'test_price_credits';

export interface TechnologyPreviewResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  questionSets: Array<{
    id: string;
    title: string;
    questionCount: number;
    actualQuestionCount: number;
    durationMinutes: number;
  }>;
  price: number;
}

@Injectable()
export class GetTechnologyPreviewUseCase {
  constructor(
    @Inject(ITechnologyRepository) private readonly technologyRepository: ITechnologyRepository,
    @Inject(IQuestionSetRepository) private readonly questionSetRepository: IQuestionSetRepository,
    @Inject(IQuestionRepository) private readonly questionRepository: IQuestionRepository,
    @Inject(ICreditSettingRepository) private readonly creditSettingRepository: ICreditSettingRepository,
  ) {}

  async execute(slug: string): Promise<{ success: true; data: TechnologyPreviewResult }> {
    const technology = await this.technologyRepository.findBySlug(slug);
    if (!technology) {
      throw new NotFoundError('Technology');
    }

    const [questionSets, price] = await Promise.all([
      this.questionSetRepository.findByTechnologyId(technology.id),
      this.resolveTestPrice(),
    ]);

    const questionSetsWithCounts = await Promise.all(
      questionSets.map(async (qs: QuestionSet) => {
        const actualQuestionCount = await this.questionRepository.countByQuestionSetId(qs.id);
        return {
          id: qs.id,
          title: qs.title,
          questionCount: qs.quizQuestionCount,
          actualQuestionCount,
          durationMinutes: qs.quizDurationMinutes,
        };
      }),
    );

    return {
      success: true,
      data: {
        id: technology.id,
        name: technology.name,
        slug: technology.slug,
        description: technology.description,
        questionSets: questionSetsWithCounts,
        price,
      },
    };
  }

  private async resolveTestPrice(): Promise<number> {
    const setting = await this.creditSettingRepository.findByKey(TEST_PRICE_KEY);
    return this.parsePositiveNumber(setting?.value, DEFAULT_TEST_PRICE_CREDITS);
  }

  private parsePositiveNumber(value: string | undefined, fallback: number): number {
    const parsed = Number(value);
    return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
  }
}
