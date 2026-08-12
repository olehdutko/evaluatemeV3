import { Inject, Injectable } from '@nestjs/common';
import {
  IQuizSessionRepository,
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
    @Inject(IQuizSessionRepository) private readonly quizSessionRepository: IQuizSessionRepository,
    @Inject(IAnswerRepository) private readonly answerRepository: IAnswerRepository,
    @Inject(IQuestionRepository) private readonly questionRepository: IQuestionRepository,
  ) {}

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

    const allQuestions = await this.questionRepository.findByTechnologyId(session.technologyId);
    const answers = await this.quizSessionRepository.findAnswersBySessionId(sessionId);
    const correctCount = answers.filter((a: { isCorrect: boolean }) => a.isCorrect).length;
    const totalAnswered = answers.length;
    const currentScore = Math.round((correctCount / allQuestions.length) * 100);
    const nextIndex = totalAnswered < allQuestions.length ? totalAnswered : null;
    const isComplete = nextIndex === null;

    if (isComplete) {
      await this.quizSessionRepository.update(sessionId, {
        status: 'completed',
        completedAt: new Date(),
        score: currentScore,
        currentQuestionIndex: totalAnswered,
      });
    } else {
      await this.quizSessionRepository.update(sessionId, {
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
