import { Inject, Injectable } from '@nestjs/common';
import { ITestSessionRepository, IQuestionRepository, IAnswerRepository } from '@evaluateme/domain';
import { NotFoundError } from '../../infrastructure/errors/app-error';

export interface TestSessionState {
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
    @Inject(ITestSessionRepository) private readonly testSessionRepository: ITestSessionRepository,
    @Inject(IQuestionRepository) private readonly questionRepository: IQuestionRepository,
    @Inject(IAnswerRepository) private readonly answerRepository: IAnswerRepository,
  ) {}

  async execute(sessionId: string): Promise<{ success: true; data: TestSessionState }> {
    const session = await this.testSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError('test session');
    }

    const questions = await this.questionRepository.findByTestId(session.testId);
    const answers = await this.answerRepository.findByQuestionIds(questions.map((q) => q.id));

    return {
      success: true,
      data: {
        sessionId: session.id,
        status: session.status,
        currentQuestionIndex: session.currentQuestionIndex,
        score: session.score ?? null,
        questions: questions.map((q) => ({
          id: q.id,
          content: q.content,
          type: q.type,
          orderIndex: q.orderIndex,
          answers: answers
            .filter((a) => a.questionId === q.id)
            .map((a) => ({ id: a.id, content: a.content, orderIndex: a.orderIndex })),
        })),
      },
    };
  }
}
