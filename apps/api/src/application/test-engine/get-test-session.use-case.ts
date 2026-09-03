import { Inject, Injectable } from '@nestjs/common';
import {
  IQuizSessionRepository,
  IQuestionRepository,
  IAnswerRepository,
  ICreditSettingRepository,
} from '@evaluateme/domain';
import { NotFoundError } from '../../infrastructure/errors/app-error';

const DEFAULT_MINUTES_PER_QUESTION = 2;
const TEST_MINUTES_PER_QUESTION_KEY = 'test_duration_minutes_per_question';

export interface QuizSessionState {
  sessionId: string;
  status: string;
  currentQuestionIndex: number;
  score?: number | null;
  durationMinutes: number;
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
    @Inject(ICreditSettingRepository) private readonly creditSettingRepository: ICreditSettingRepository,
  ) {}

  async execute(sessionId: string): Promise<{ success: true; data: QuizSessionState }> {
    const session = await this.quizSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError('quiz session');
    }

    const [questions, minutesPerQuestion] = await Promise.all([
      this.questionRepository.findByTechnologyId(session.technologyId),
      this.resolveMinutesPerQuestion(),
    ]);
    const answers = await this.answerRepository.findByQuestionIds(questions.map((q) => q.id));

    return {
      success: true,
      data: {
        sessionId: session.id,
        status: session.status,
        currentQuestionIndex: session.currentQuestionIndex,
        score: session.score ?? null,
        durationMinutes: questions.length * minutesPerQuestion,
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

  private async resolveMinutesPerQuestion(): Promise<number> {
    const setting = await this.creditSettingRepository.findByKey(TEST_MINUTES_PER_QUESTION_KEY);
    const parsed = Number(setting?.value);
    return Number.isNaN(parsed) || parsed <= 0 ? DEFAULT_MINUTES_PER_QUESTION : parsed;
  }
}
