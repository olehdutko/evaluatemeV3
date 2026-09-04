import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  IQuizSessionRepository,
  IAnswerRepository,
  IQuestionRepository,
  IUserResultRepository,
  ICandidateResultRepository,
  SessionStatus,
} from '@evaluateme/domain';
import { NotFoundError, BadRequestError } from '../../infrastructure/errors/app-error';
import { Logger, createLogger } from '../../infrastructure/logging/logger';

function generateResultCode(): string {
  return randomUUID().slice(0, 8).toUpperCase();
}

export interface SubmitAnswerResult {
  isCorrect: boolean;
  currentScore: number;
  totalAnswered: number;
  nextQuestionIndex: number | null;
  isComplete: boolean;
  resultCode?: string | null;
}

@Injectable()
export class SubmitAnswerUseCase {
  private readonly logger: Logger;

  constructor(
    @Inject(IQuizSessionRepository) private readonly quizSessionRepository: IQuizSessionRepository,
    @Inject(IAnswerRepository) private readonly answerRepository: IAnswerRepository,
    @Inject(IQuestionRepository) private readonly questionRepository: IQuestionRepository,
    @Inject(IUserResultRepository) private readonly userResultRepository: IUserResultRepository,
    @Inject(ICandidateResultRepository) private readonly candidateResultRepository: ICandidateResultRepository,
  ) {
    this.logger = createLogger('SubmitAnswerUseCase');
  }

  async execute(
    sessionId: string,
    questionId: string,
    answerId: string,
  ): Promise<{ success: true; data: SubmitAnswerResult }> {
    const session = await this.quizSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError('quiz session');
    }
    if (session.status !== 'in_progress') {
      throw new BadRequestError({ session: ['Quiz session is not active'] });
    }

    const answer = await this.answerRepository.findById(answerId);
    if (!answer || answer.questionId !== questionId) {
      throw new BadRequestError({ answer: ['Invalid answer'] });
    }

    await this.quizSessionRepository.addAnswer({
      testSessionId: sessionId,
      questionId,
      answerId,
      isCorrect: answer.isCorrect,
      answeredAt: new Date(),
    });

    const totalQuestions = session.questionIdsSnapshot?.length ?? 0;
    if (totalQuestions === 0) {
      throw new BadRequestError({ session: ['Quiz session has no questions'] });
    }
    const answers = await this.quizSessionRepository.findAnswersBySessionId(sessionId);
    const correctCount = answers.filter((a: { isCorrect: boolean }) => a.isCorrect).length;
    const totalAnswered = answers.length;
    const currentScore = Math.round((correctCount / totalQuestions) * 100);
    const nextIndex = totalAnswered < totalQuestions ? totalAnswered : null;
    const isComplete = nextIndex === null;

    if (isComplete) {
      await this.quizSessionRepository.update(sessionId, {
        status: 'completed',
        completedAt: new Date(),
        score: currentScore,
        currentQuestionIndex: totalAnswered,
      });

      const resultCode = generateResultCode();
      try {
        if (session.userId) {
          await this.userResultRepository.save({
            id: randomUUID(),
            resultCode,
            userId: session.userId,
            technologyId: session.technologyId,
            score: currentScore,
            maxScore: 100,
            status: 'completed' as SessionStatus,
            sessionId,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else if (session.accessCodeId) {
          await this.candidateResultRepository.save({
            id: randomUUID(),
            resultCode,
            candidateId: null,
            technologyId: session.technologyId,
            score: currentScore,
            maxScore: 100,
            status: 'completed' as SessionStatus,
            sessionId,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } catch (error: unknown) {
        this.logger.error('Failed to save result after test completion', {
          error: error instanceof Error ? error.message : String(error),
          sessionId,
        });
      }

      return {
        success: true,
        data: {
          isCorrect: answer.isCorrect,
          currentScore,
          totalAnswered,
          nextQuestionIndex: null,
          isComplete: true,
          resultCode,
        },
      };
    }

    await this.quizSessionRepository.update(sessionId, {
      currentQuestionIndex: nextIndex,
    });

    return {
      success: true,
      data: {
        isCorrect: answer.isCorrect,
        currentScore,
        totalAnswered,
        nextQuestionIndex: nextIndex,
        isComplete,
      },
    };
  }
}
