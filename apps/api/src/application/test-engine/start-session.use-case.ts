import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  IAccessCodeRepository,
  IQuestionRepository,
  IQuizSessionRepository,
  ISessionStrategy,
  Question,
} from '@evaluateme/domain';
import { NotFoundError, BadRequestError } from '../../infrastructure/errors/app-error';

const DEFAULT_QUESTION_COUNT = 20;

export interface StartSessionResult {
  sessionToken: string;
  sessionId: string;
  questions: Question[];
}

@Injectable()
export class StartSessionUseCase {
  constructor(
    @Inject(IAccessCodeRepository) private readonly accessCodeRepository: IAccessCodeRepository,
    @Inject(IQuestionRepository) private readonly questionRepository: IQuestionRepository,
    @Inject(IQuizSessionRepository) private readonly quizSessionRepository: IQuizSessionRepository,
    @Inject(ISessionStrategy) private readonly sessionStrategy: ISessionStrategy,
  ) {}

  async execute(accessCode: string): Promise<{ success: true; data: StartSessionResult }> {
    const code = await this.accessCodeRepository.findByCode(accessCode);
    if (!code) {
      throw new NotFoundError('access code');
    }
    if (code.status !== 'active') {
      throw new BadRequestError({ accessCode: ['Access code is not active'] });
    }
    if (code.expiresAt && code.expiresAt < new Date()) {
      throw new BadRequestError({ accessCode: ['Access code has expired'] });
    }

    const questions = await this.questionRepository.findByTechnologyIdRandomized(code.technologyId, DEFAULT_QUESTION_COUNT);
    if (questions.length === 0) {
      throw new NotFoundError('questions for technology');
    }

    const candidateId = `candidate-${randomUUID()}`;
    const session = await this.quizSessionRepository.create({
      userId: null,
      technologyId: code.technologyId,
      accessCodeId: code.id,
      status: 'in_progress',
      startedAt: new Date(),
      currentQuestionIndex: 0,
    });

    const sessionToken = await this.sessionStrategy.issueSessionToken(candidateId, code.id, 7 * 24 * 60);

    return {
      success: true,
      data: {
        sessionToken,
        sessionId: session.id,
        questions,
      },
    };
  }
}
