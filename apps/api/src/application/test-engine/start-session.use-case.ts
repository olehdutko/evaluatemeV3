import { Inject, Injectable } from '@nestjs/common';
import {
  IAccessCodeRepository,
  IQuestionSetRepository,
  IQuestionRepository,
  IQuizSessionRepository,
  Question,
} from '@evaluateme/domain';
import { NotFoundError, BadRequestError } from '../../infrastructure/errors/app-error';

export interface StartSessionResult {
  sessionId: string;
  questionSet: { id: string; title: string };
  questions: Question[];
}

@Injectable()
export class StartSessionUseCase {
  constructor(
    @Inject(IAccessCodeRepository) private readonly accessCodeRepository: IAccessCodeRepository,
    @Inject(IQuestionSetRepository) private readonly questionSetRepository: IQuestionSetRepository,
    @Inject(IQuestionRepository) private readonly questionRepository: IQuestionRepository,
    @Inject(IQuizSessionRepository) private readonly quizSessionRepository: IQuizSessionRepository,
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

    const questionSet = await this.questionSetRepository.findById(code.questionSetId ?? '');
    if (!questionSet) {
      throw new NotFoundError('question set for access code');
    }
    const questionCount = questionSet.quizQuestionCount ?? 20;
    const questions = await this.questionRepository.findByQuestionSetIdRandomized(code.questionSetId ?? '', questionCount);
    if (questions.length === 0) {
      throw new NotFoundError('questions for question set');
    }

    const session = await this.quizSessionRepository.create({
      userId: null,
      questionSetId: code.questionSetId ?? '',
      accessCodeId: code.id,
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
