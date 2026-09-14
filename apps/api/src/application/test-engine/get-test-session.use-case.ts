import { Inject, Injectable } from '@nestjs/common';
import {
  IQuizSessionRepository,
  IQuestionRepository,
  IAnswerRepository,
  IQuestionSetRepository,
  Question,
} from '@evaluateme/domain';
import { NotFoundError } from '../../infrastructure/errors/app-error';

export interface QuizSessionState {
  sessionId: string;
  status: string;
  currentQuestionIndex: number;
  score?: number | null;
  durationMinutes: number;
  userAnswers: Array<{ questionId: string; answerId: string; isCorrect: boolean }>;
  questionSet: { id: string; title: string } | null;
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
    @Inject(IQuestionSetRepository) private readonly questionSetRepository: IQuestionSetRepository,
  ) {}

  async execute(sessionId: string): Promise<{ success: true; data: QuizSessionState }> {
    const session = await this.quizSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError('quiz session');
    }

    const snapshotIds = session.questionIdsSnapshot ?? [];
    const [questionSetQuestions, answers, questionSet, userAnswers] = await Promise.all([
      this.questionRepository.findByQuestionSetId(session.questionSetId),
      this.answerRepository.findByQuestionIds(snapshotIds),
      this.questionSetRepository.findById(session.questionSetId),
      this.quizSessionRepository.findAnswersBySessionId(sessionId),
    ]);

    const questionMap = new Map(questionSetQuestions.map((q: Question) => [q.id, q]));
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
        durationMinutes: questionSet?.quizDurationMinutes ?? Math.max(1, questions.length * 2),
        userAnswers: userAnswers.map((a) => ({ questionId: a.questionId, answerId: a.answerId, isCorrect: a.isCorrect })),
        questionSet: questionSet ? { id: questionSet.id, title: questionSet.title } : null,
        questions,
      },
    };
  }
}
