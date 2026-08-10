import { Inject, Injectable } from '@nestjs/common';
import {
  ITestSessionRepository,
  IAnswerRepository,
  IQuestionRepository,
} from '@evaluateme/domain';
import { NotFoundError, BadRequestError } from '../../infrastructure/errors/app-error';

export interface SubmitAnswerResult {
  isCorrect: boolean;
  currentScore: number;
  totalAnswered: number;
  nextQuestionIndex: number | null;
  isComplete: boolean;
}

@Injectable()
export class SubmitAnswerUseCase {
  constructor(
    @Inject(ITestSessionRepository) private readonly testSessionRepository: ITestSessionRepository,
    @Inject(IAnswerRepository) private readonly answerRepository: IAnswerRepository,
    @Inject(IQuestionRepository) private readonly questionRepository: IQuestionRepository,
  ) {}

  async execute(
    sessionId: string,
    questionId: string,
    answerId: string,
  ): Promise<{ success: true; data: SubmitAnswerResult }> {
    const session = await this.testSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError('test session');
    }
    if (session.status !== 'in_progress') {
      throw new BadRequestError({ session: ['Test session is not active'] });
    }

    const answer = await this.answerRepository.findById(answerId);
    if (!answer || answer.questionId !== questionId) {
      throw new BadRequestError({ answer: ['Invalid answer'] });
    }

    await this.testSessionRepository.addAnswer({
      testSessionId: sessionId,
      questionId,
      answerId,
      isCorrect: answer.isCorrect,
      answeredAt: new Date(),
    });

    const allQuestions = await this.questionRepository.findByTestId(session.testId);
    const answers = await this.testSessionRepository.findAnswersBySessionId(sessionId);
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const totalAnswered = answers.length;
    const currentScore = Math.round((correctCount / allQuestions.length) * 100);
    const nextIndex = totalAnswered < allQuestions.length ? totalAnswered : null;
    const isComplete = nextIndex === null;

    if (isComplete) {
      await this.testSessionRepository.update(sessionId, {
        status: 'completed',
        completedAt: new Date(),
        score: currentScore,
        currentQuestionIndex: totalAnswered,
      });
    } else {
      await this.testSessionRepository.update(sessionId, {
        currentQuestionIndex: nextIndex,
      });
    }

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
