import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ITestSessionRepository, TestSession, TestSessionStatus, UserAnswer } from '@evaluateme/domain';

@Injectable()
export class PrismaTestSessionRepository implements ITestSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(session: Omit<TestSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<TestSession> {
    const row = await this.prisma.testSession.create({
      data: {
        userId: session.userId ?? null,
        testId: session.testId,
        accessCodeId: session.accessCodeId ?? null,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt ?? null,
        score: session.score ?? null,
        currentQuestionIndex: session.currentQuestionIndex,
      },
    });
    return this.mapSession(row);
  }

  async findById(id: string): Promise<TestSession | null> {
    const row = await this.prisma.testSession.findUnique({ where: { id } });
    return row ? this.mapSession(row) : null;
  }

  async update(id: string, data: Partial<TestSession>): Promise<TestSession> {
    const row = await this.prisma.testSession.update({
      where: { id },
      data: {
        ...(data.status ? { status: data.status } : {}),
        ...(data.completedAt ? { completedAt: data.completedAt } : {}),
        ...(data.score !== undefined ? { score: data.score } : {}),
        ...(data.currentQuestionIndex !== undefined ? { currentQuestionIndex: data.currentQuestionIndex } : {}),
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
    testId: string;
    accessCodeId: string | null;
    status: string;
    startedAt: Date;
    completedAt: Date | null;
    score: number | null;
    currentQuestionIndex: number;
    createdAt: Date;
    updatedAt: Date;
  }): TestSession {
    return {
      id: row.id,
      userId: row.userId ?? undefined,
      testId: row.testId,
      accessCodeId: row.accessCodeId ?? undefined,
      status: row.status as TestSessionStatus,
      startedAt: row.startedAt,
      completedAt: row.completedAt ?? undefined,
      score: row.score ?? undefined,
      currentQuestionIndex: row.currentQuestionIndex,
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
