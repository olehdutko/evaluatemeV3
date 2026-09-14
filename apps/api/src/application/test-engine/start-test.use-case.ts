import { Inject, Injectable } from '@nestjs/common';
import {
  IQuestionSetRepository,
  IQuestionRepository,
  IQuizSessionRepository,
  IUserRepository,
  Question,
  UserRole,
} from '@evaluateme/domain';
import { NotFoundError, ForbiddenError } from '../../infrastructure/errors/app-error';

export interface StartTestResult {
  sessionId: string;
  questionSet: { id: string; title: string };
  questions: Question[];
}

@Injectable()
export class StartTestUseCase {
  constructor(
    @Inject(IQuestionSetRepository) private readonly questionSetRepository: IQuestionSetRepository,
    @Inject(IQuestionRepository) private readonly questionRepository: IQuestionRepository,
    @Inject(IQuizSessionRepository) private readonly quizSessionRepository: IQuizSessionRepository,
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, questionSetId: string): Promise<{ success: true; data: StartTestResult }> {
    const [user, questionSet] = await Promise.all([
      this.userRepository.findById(userId),
      this.questionSetRepository.findById(questionSetId),
    ]);

    if (!user) {
      throw new NotFoundError('user');
    }

    if (!questionSet) {
      throw new NotFoundError('question set');
    }

    // Admin users configure the application and are not allowed to take tests.
    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenError('Admin users cannot take tests.');
    }

    if (user.credits < 1) {
      throw new ForbiddenError('Insufficient credits to start a test.');
    }

    const questions = await this.questionRepository.findByQuestionSetIdRandomized(
      questionSet.id,
      questionSet.quizQuestionCount,
    );
    if (questions.length === 0) {
      throw new NotFoundError('questions for question set');
    }

    const session = await this.quizSessionRepository.create({
      userId,
      questionSetId: questionSet.id,
      status: 'in_progress',
      startedAt: new Date(),
      currentQuestionIndex: 0,
      questionIdsSnapshot: questions.map((q) => q.id),
    });

    return {
      success: true,
      data: {
        sessionId: session.id,
        questionSet: { id: questionSet.id, title: questionSet.title },
        questions,
      },
    };
  }
}
