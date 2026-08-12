import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IQuizSessionRepository, QuizSession, QuizSessionStatus, UserAnswer } from '@evaluateme/domain';

@Injectable()
export class PrismaQuizSessionRepository implements IQuizSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(session: Omit<QuizSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuizSession> {
    const row = await this.prisma.quizSession.create({
      data: {
        userId: session.userId ?? null,
        technologyId: session.technologyId,
        accessCodeId: session.accessCodeId ?? null,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt ?? null,
        score: session.score ?? null,
        currentQuestionIndex: session.currentQuestionIndex,
        questionIdsSnapshot: session.questionIdsSnapshot ? JSON.stringify(session.questionIdsSnapshot) : null,
      },
    });
    return this.mapSession(row);
  }

  async findById(id: string): Promise<QuizSession | null> {
    const row = await this.prisma.quizSession.findUnique({ where: { id } });
    return row ? this.mapSession(row) : null;
  }

  async update(id: string, data: Partial<QuizSession>): Promise<QuizSession> {
    const row = await this.prisma.quizSession.update({
      where: { id },
      data: {
        ...(data.status ? { status: data.status } : {}),
        ...(data.completedAt ? { completedAt: data.completedAt } : {}),
        ...(data.score !== undefined ? { score: data.score } : {}),
        ...(data.currentQuestionIndex !== undefined ? { currentQuestionIndex: data.currentQuestionIndex } : {}),
        ...(data.questionIdsSnapshot ? { questionIdsSnapshot: JSON.stringify(data.questionIdsSnapshot) } : {}),
      },
    });
    return this.mapSession(row);
  }

  async addAnswer(answer: Omit<UserAnswer, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserAnswer> {
    const row = await this.prisma.userAnswer.create({
      data: {
        testSessionId: answer.testSessionId,
        questionId: answer.questionId,
        answerId: answer.answerId,
        isCorrect: answer.isCorrect,
        answeredAt: answer.answeredAt,
      },
    });
    return this.mapAnswer(row);
  }

  async findAnswersBySessionId(sessionId: string): Promise<UserAnswer[]> {
    const rows = await this.prisma.userAnswer.findMany({
      where: { testSessionId: sessionId },
      orderBy: { answeredAt: 'asc' },
    });
    return rows.map(this.mapAnswer);
  }

  private mapSession(row: {
    id: string;
    userId: string | null;
    technologyId: string;
    accessCodeId: string | null;
    status: string;
    startedAt: Date;
    completedAt: Date | null;
    score: number | null;
    currentQuestionIndex: number;
    questionIdsSnapshot: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): QuizSession {
    return {
      id: row.id,
      userId: row.userId ?? undefined,
      technologyId: row.technologyId,
      accessCodeId: row.accessCodeId ?? undefined,
      status: row.status as QuizSessionStatus,
      startedAt: row.startedAt,
      completedAt: row.completedAt ?? undefined,
      score: row.score ?? undefined,
      currentQuestionIndex: row.currentQuestionIndex,
      questionIdsSnapshot: row.questionIdsSnapshot ? JSON.parse(row.questionIdsSnapshot) as string[] : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapAnswer(row: {
    id: string;
    testSessionId: string;
    questionId: string;
    answerId: string;
    isCorrect: boolean;
    answeredAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }): UserAnswer {
    return {
      id: row.id,
      testSessionId: row.testSessionId,
      questionId: row.questionId,
      answerId: row.answerId,
      isCorrect: row.isCorrect,
      answeredAt: row.answeredAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
