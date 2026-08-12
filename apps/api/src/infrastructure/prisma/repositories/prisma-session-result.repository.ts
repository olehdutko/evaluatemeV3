import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  IUserSessionRepository,
  IUserResultRepository,
  ICandidateSessionRepository,
  ICandidateResultRepository,
  UserSession,
  UserResult,
  CandidateSession,
  CandidateResult,
  SessionStatus,
} from '@evaluateme/domain';
import { Logger, createLogger } from '../../logging/logger';

function toDomainSession(raw: unknown): UserSession {
  const data = raw as Record<string, unknown>;
  return {
    id: data.id as string,
    sessionId: data.sessionId as string,
    questionId: data.questionId as string,
    userId: data.userId as string,
    technologyId: data.technologyId as string,
    answerId: data.answerId as string | null,
    status: data.status as SessionStatus,
    startedAt: data.startedAt as Date | null,
    completedAt: data.completedAt as Date | null,
    createdAt: data.createdAt as Date,
    updatedAt: data.updatedAt as Date,
  };
}

function toDomainResult(raw: unknown): UserResult {
  const data = raw as Record<string, unknown>;
  return {
    id: data.id as string,
    resultCode: data.resultCode as string,
    userId: data.userId as string,
    technologyId: data.technologyId as string,
    score: data.score as number | null,
    maxScore: data.maxScore as number | null,
    status: data.status as SessionStatus,
    sessionId: data.sessionId as string | null,
    createdAt: data.createdAt as Date,
    updatedAt: data.updatedAt as Date,
  };
}

function toDomainCandidateSession(raw: unknown): CandidateSession {
  const data = raw as Record<string, unknown>;
  return {
    id: data.id as string,
    sessionId: data.sessionId as string,
    questionId: data.questionId as string,
    candidateId: data.candidateId as string | null,
    accessCodeId: data.accessCodeId as string,
    technologyId: data.technologyId as string,
    answerId: data.answerId as string | null,
    status: data.status as SessionStatus,
    startedAt: data.startedAt as Date | null,
    completedAt: data.completedAt as Date | null,
    createdAt: data.createdAt as Date,
    updatedAt: data.updatedAt as Date,
  };
}

function toDomainCandidateResult(raw: unknown): CandidateResult {
  const data = raw as Record<string, unknown>;
  return {
    id: data.id as string,
    resultCode: data.resultCode as string,
    candidateId: data.candidateId as string | null,
    technologyId: data.technologyId as string,
    score: data.score as number | null,
    maxScore: data.maxScore as number | null,
    status: data.status as SessionStatus,
    sessionId: data.sessionId as string | null,
    createdAt: data.createdAt as Date,
    updatedAt: data.updatedAt as Date,
  };
}

@Injectable()
export class PrismaUserSessionRepository implements IUserSessionRepository {
  private readonly logger: Logger;

  constructor(private readonly prisma: PrismaService) {
    this.logger = createLogger('PrismaUserSessionRepository');
  }

  async findBySessionId(sessionId: string): Promise<UserSession[]> {
    try {
      const sessions = await this.prisma.userSession.findMany({ where: { sessionId } });
      return sessions.map(toDomainSession);
    } catch (error: unknown) {
      this.logger.error('Failed to find user sessions by session id', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async findBySessionIdAndQuestionId(sessionId: string, questionId: string): Promise<UserSession | null> {
    try {
      const session = await this.prisma.userSession.findUnique({
        where: { sessionId_questionId: { sessionId, questionId } },
      });
      return session ? toDomainSession(session) : null;
    } catch (error: unknown) {
      this.logger.error('Failed to find user session by natural key', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async save(session: UserSession): Promise<UserSession> {
    const saved = await this.prisma.userSession.upsert({
      where: { sessionId_questionId: { sessionId: session.sessionId, questionId: session.questionId } },
      create: {
        id: session.id,
        sessionId: session.sessionId,
        questionId: session.questionId,
        userId: session.userId,
        technologyId: session.technologyId,
        answerId: session.answerId,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
      },
      update: {
        answerId: session.answerId,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
      },
    });
    return toDomainSession(saved);
  }
}

@Injectable()
export class PrismaUserResultRepository implements IUserResultRepository {
  private readonly logger: Logger;

  constructor(private readonly prisma: PrismaService) {
    this.logger = createLogger('PrismaUserResultRepository');
  }

  async findByResultCode(resultCode: string): Promise<UserResult | null> {
    try {
      const result = await this.prisma.userResult.findUnique({ where: { resultCode } });
      return result ? toDomainResult(result) : null;
    } catch (error: unknown) {
      this.logger.error('Failed to find user result by result code', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<UserResult[]> {
    try {
      const results = await this.prisma.userResult.findMany({ where: { userId } });
      return results.map(toDomainResult);
    } catch (error: unknown) {
      this.logger.error('Failed to find user results by user id', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async save(result: UserResult): Promise<UserResult> {
    const saved = await this.prisma.userResult.upsert({
      where: { resultCode: result.resultCode },
      create: {
        id: result.id,
        resultCode: result.resultCode,
        userId: result.userId,
        technologyId: result.technologyId,
        score: result.score,
        maxScore: result.maxScore,
        status: result.status,
        sessionId: result.sessionId,
      },
      update: {
        score: result.score,
        maxScore: result.maxScore,
        status: result.status,
        sessionId: result.sessionId,
      },
    });
    return toDomainResult(saved);
  }
}

@Injectable()
export class PrismaCandidateSessionRepository implements ICandidateSessionRepository {
  private readonly logger: Logger;

  constructor(private readonly prisma: PrismaService) {
    this.logger = createLogger('PrismaCandidateSessionRepository');
  }

  async findBySessionId(sessionId: string): Promise<CandidateSession[]> {
    try {
      const sessions = await this.prisma.candidateSession.findMany({ where: { sessionId } });
      return sessions.map(toDomainCandidateSession);
    } catch (error: unknown) {
      this.logger.error('Failed to find candidate sessions by session id', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async findBySessionIdAndQuestionId(sessionId: string, questionId: string): Promise<CandidateSession | null> {
    try {
      const session = await this.prisma.candidateSession.findUnique({
        where: { sessionId_questionId: { sessionId, questionId } },
      });
      return session ? toDomainCandidateSession(session) : null;
    } catch (error: unknown) {
      this.logger.error('Failed to find candidate session by natural key', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async save(session: CandidateSession): Promise<CandidateSession> {
    const saved = await this.prisma.candidateSession.upsert({
      where: { sessionId_questionId: { sessionId: session.sessionId, questionId: session.questionId } },
      create: {
        id: session.id,
        sessionId: session.sessionId,
        questionId: session.questionId,
        candidateId: session.candidateId,
        accessCodeId: session.accessCodeId,
        technologyId: session.technologyId,
        answerId: session.answerId,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
      },
      update: {
        candidateId: session.candidateId,
        answerId: session.answerId,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
      },
    });
    return toDomainCandidateSession(saved);
  }
}

@Injectable()
export class PrismaCandidateResultRepository implements ICandidateResultRepository {
  private readonly logger: Logger;

  constructor(private readonly prisma: PrismaService) {
    this.logger = createLogger('PrismaCandidateResultRepository');
  }

  async findByResultCode(resultCode: string): Promise<CandidateResult | null> {
    try {
      const result = await this.prisma.candidateResult.findUnique({ where: { resultCode } });
      return result ? toDomainCandidateResult(result) : null;
    } catch (error: unknown) {
      this.logger.error('Failed to find candidate result by result code', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async findByCandidateId(candidateId: string): Promise<CandidateResult[]> {
    try {
      const results = await this.prisma.candidateResult.findMany({ where: { candidateId } });
      return results.map(toDomainCandidateResult);
    } catch (error: unknown) {
      this.logger.error('Failed to find candidate results by candidate id', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async save(result: CandidateResult): Promise<CandidateResult> {
    const saved = await this.prisma.candidateResult.upsert({
      where: { resultCode: result.resultCode },
      create: {
        id: result.id,
        resultCode: result.resultCode,
        candidateId: result.candidateId,
        technologyId: result.technologyId,
        score: result.score,
        maxScore: result.maxScore,
        status: result.status,
        sessionId: result.sessionId,
      },
      update: {
        score: result.score,
        maxScore: result.maxScore,
        status: result.status,
        sessionId: result.sessionId,
      },
    });
    return toDomainCandidateResult(saved);
  }
}
