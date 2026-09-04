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

    const snapshotIds = session.questionIdsSnapshot ?? [];
    const [technologyQuestions, answers, minutesPerQuestion] = await Promise.all([
      this.questionRepository.findByTechnologyId(session.technologyId),
      this.answerRepository.findByQuestionIds(snapshotIds),
      this.resolveMinutesPerQuestion(),
    ]);

    const questionMap = new Map(technologyQuestions.map((q) => [q.id, q]));
    const orderedQuestions = snapshotIds
      .map((id) => questionMap.get(id))
      .filter((q): q is NonNullable<typeof q> => q !== undefined);

    const questions = orderedQuestions.map((q, index) => ({
      id: q.id,
      content: q.content,
      type: q.type,
      orderIndex: index,
      answers: answers
        .filter((a) => a.questionId === q.id)
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((a) => ({ id: a.id, content: a.content, orderIndex: a.orderIndex })),
    }));

    return {
      success: true,
      data: {
        sessionId: session.id,
        status: session.status,
        currentQuestionIndex: session.currentQuestionIndex,
        score: session.score ?? null,
        durationMinutes: Math.max(1, questions.length * minutesPerQuestion),
        questions,
      },
    };
  }

  private async resolveMinutesPerQuestion(): Promise<number> {
    const setting = await this.creditSettingRepository.findByKey(TEST_MINUTES_PER_QUESTION_KEY);
    const parsed = Number(setting?.value);
    return Number.isNaN(parsed) || parsed <= 0 ? DEFAULT_MINUTES_PER_QUESTION : parsed;
  }
}
