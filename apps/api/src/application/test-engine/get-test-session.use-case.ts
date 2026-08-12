import { Inject, Injectable } from '@nestjs/common';
import { IQuizSessionRepository, IQuestionRepository, IAnswerRepository } from '@evaluateme/domain';
import { NotFoundError } from '../../infrastructure/errors/app-error';

export interface QuizSessionState {
  sessionId: string;
  status: string;
  currentQuestionIndex: number;
  score?: number | null;
  questions: Array<{
    id: string;
    content: string;
    type: string;
    orderIndex: number;
    answers: Array<{ id: string; content: string; orderIndex: number }>;
  }>;
}

@Injectable()
export class GetTestSessionUseCase {
  constructor(
    @Inject(IQuizSessionRepository) private readonly quizSessionRepository: IQuizSessionRepository,
    @Inject(IQuestionRepository) private readonly questionRepository: IQuestionRepository,
    @Inject(IAnswerRepository) private readonly answerRepository: IAnswerRepository,
  ) {}

  async execute(sessionId: string): Promise<{ success: true; data: QuizSessionState }> {
    const session = await this.quizSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError('quiz session');
    }

    const questions = await this.questionRepository.findByTechnologyId(session.technologyId);
    const answers = await this.answerRepository.findByQuestionIds(questions.map((q: { id: string }) => q.id));

    return {
      success: true,
      data: {
        sessionId: session.id,
        status: session.status,
        currentQuestionIndex: session.currentQuestionIndex,
        score: session.score ?? null,
        questions: questions.map((q: { id: string; content: string; type: string; orderIndex: number }) => ({
          id: q.id,
          content: q.content,
          type: q.type,
          orderIndex: q.orderIndex,
          answers: answers
            .filter((a: { questionId: string }) => a.questionId === q.id)
            .map((a: { id: string; content: string; orderIndex: number }) => ({ id: a.id, content: a.content, orderIndex: a.orderIndex })),
        })),
      },
    };
  }
}
