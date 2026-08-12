import { Inject, Injectable } from '@nestjs/common';
import {
  ITechnologyRepository,
  IQuestionRepository,
  IQuizSessionRepository,
  IUserRepository,
  Question,
  UserRole,
} from '@evaluateme/domain';
import { NotFoundError, ForbiddenError } from '../../infrastructure/errors/app-error';

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
    @Inject(IQuizSessionRepository) private readonly quizSessionRepository: IQuizSessionRepository,
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, technologySlug: string): Promise<{ success: true; data: StartTestResult }> {
    const [user, technology] = await Promise.all([
      this.userRepository.findById(userId),
      this.technologyRepository.findBySlug(technologySlug),
    ]);

    if (!user) {
      throw new NotFoundError('user');
    }

    if (!technology) {
      throw new NotFoundError('technology');
    }

    // Admin users can start tests for free for application testing purposes.
    if (user.role !== UserRole.ADMIN && user.credits < 1) {
      throw new ForbiddenError('Insufficient credits to start a test.');
    }

    const questions = await this.questionRepository.findByTechnologyIdRandomized(
      technology.id,
      DEFAULT_QUESTION_COUNT,
    );
    if (questions.length === 0) {
      throw new NotFoundError('questions for technology');
    }

    const session = await this.quizSessionRepository.create({
      userId,
      technologyId: technology.id,
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
