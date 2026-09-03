import { Inject, Injectable } from '@nestjs/common';
import {
  ITechnologyRepository,
  IQuestionRepository,
  IAnswerRepository,
  ICreditSettingRepository,
} from '@evaluateme/domain';
import { NotFoundError } from '../../infrastructure/errors/app-error';

const DEFAULT_TEST_PRICE_CREDITS = 1;
const DEFAULT_QUESTION_COUNT = 20;
const DEFAULT_MINUTES_PER_QUESTION = 2;
const TEST_PRICE_KEY = 'test_price_credits';
const TEST_QUESTION_COUNT_KEY = 'test_question_count';
const TEST_MINUTES_PER_QUESTION_KEY = 'test_duration_minutes_per_question';

export interface TechnologyPreviewResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  questionCount: number;
  durationMinutes: number;
  price: number;
  sampleQuestion: {
    id: string;
    content: string;
    type: 'single' | 'multiple';
    answers: Array<{ id: string; content: string; orderIndex: number }>;
  } | null;
}

@Injectable()
export class GetTechnologyPreviewUseCase {
  constructor(
    @Inject(ITechnologyRepository) private readonly technologyRepository: ITechnologyRepository,
    @Inject(IQuestionRepository) private readonly questionRepository: IQuestionRepository,
    @Inject(IAnswerRepository) private readonly answerRepository: IAnswerRepository,
    @Inject(ICreditSettingRepository) private readonly creditSettingRepository: ICreditSettingRepository,
  ) {}

  async execute(slug: string): Promise<{ success: true; data: TechnologyPreviewResult }> {
    const technology = await this.technologyRepository.findBySlug(slug);
    if (!technology) {
      throw new NotFoundError('Technology');
    }

    const [questions, allAnswers, price, questionCount, minutesPerQuestion] = await Promise.all([
      this.questionRepository.findByTechnologyId(technology.id),
      this.questionRepository.findByTechnologyId(technology.id).then((q) =>
        this.answerRepository.findByQuestionIds(q.map((item) => item.id)),
      ),
      this.resolveTestPrice(),
      this.resolveQuestionCount(),
      this.resolveMinutesPerQuestion(),
    ]);

    const sampleQuestion = this.pickSampleQuestion(questions, allAnswers);
    const effectiveCount = Math.min(questionCount, questions.length || questionCount);
    const durationMinutes = effectiveCount * minutesPerQuestion;

    return {
      success: true,
      data: {
        id: technology.id,
        name: technology.name,
        slug: technology.slug,
        description: technology.description,
        questionCount: effectiveCount,
        durationMinutes,
        price,
        sampleQuestion,
      },
    };
  }

  private pickSampleQuestion(
    questions: Array<{ id: string; content: string; type: 'single' | 'multiple'; orderIndex: number }>,
    answers: Array<{ id: string; questionId: string; content: string; orderIndex: number }>,
  ) {
    if (questions.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * questions.length);
    const question = questions[randomIndex];
    const questionAnswers = answers
      .filter((a) => a.questionId === question.id)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    return {
      id: question.id,
      content: question.content,
      type: question.type,
      answers: questionAnswers.map((a) => ({ id: a.id, content: a.content, orderIndex: a.orderIndex })),
    };
  }

  private async resolveTestPrice(): Promise<number> {
    const setting = await this.creditSettingRepository.findByKey(TEST_PRICE_KEY);
    return this.parsePositiveNumber(setting?.value, DEFAULT_TEST_PRICE_CREDITS);
  }

  private async resolveQuestionCount(): Promise<number> {
    const setting = await this.creditSettingRepository.findByKey(TEST_QUESTION_COUNT_KEY);
    return this.parsePositiveNumber(setting?.value, DEFAULT_QUESTION_COUNT);
  }

  private async resolveMinutesPerQuestion(): Promise<number> {
    const setting = await this.creditSettingRepository.findByKey(TEST_MINUTES_PER_QUESTION_KEY);
    return this.parsePositiveNumber(setting?.value, DEFAULT_MINUTES_PER_QUESTION);
  }

  private parsePositiveNumber(value: string | undefined, fallback: number): number {
    const parsed = Number(value);
    return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
  }
}
