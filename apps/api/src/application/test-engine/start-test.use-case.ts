import { Inject, Injectable } from '@nestjs/common';
import {
  ITechnologyRepository,
  IQuestionRepository,
  ITestSessionRepository,
  Question,
} from '@evaluateme/domain';
import { NotFoundError } from '../../infrastructure/errors/app-error';

const DEFAULT_QUESTION_COUNT = 20;

export interface StartTestResult {
  sessionId: string;
  technology: { id: string; name: string; slug: string };
  questions: Question[];
}

@Injectable()
export class StartTestUseCase {
  constructor(
    @Inject(ITechnologyRepository) private readonly technologyRepository: ITechnologyRepository,
    @Inject(IQuestionRepository) private readonly questionRepository: IQuestionRepository,
    @Inject(ITestSessionRepository) private readonly testSessionRepository: ITestSessionRepository,
  ) {}

  async execute(userId: string, technologySlug: string): Promise<{ success: true; data: StartTestResult }> {
    const technology = await this.technologyRepository.findBySlug(technologySlug);
    if (!technology) {
      throw new NotFoundError('technology');
    }

    const questions = await this.questionRepository.findByTestIdRandomized(
      technology.id,
      DEFAULT_QUESTION_COUNT,
    );
    if (questions.length === 0) {
      throw new NotFoundError('questions for technology');
    }

    const session = await this.testSessionRepository.create({
      userId,
      testId: technology.id,
      status: 'in_progress',
      startedAt: new Date(),
      currentQuestionIndex: 0,
    });

    return {
      success: true,
      data: {
        sessionId: session.id,
        technology: { id: technology.id, name: technology.name, slug: technology.slug },
        questions,
      },
    };
  }
}
