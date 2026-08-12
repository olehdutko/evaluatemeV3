import { Injectable } from '@nestjs/common';
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
import { Logger, createLogger } from '../logging/logger';

@Injectable()
export class LegacySessionsResultsMigration {
  private readonly logger: Logger = createLogger('LegacySessionsResultsMigration');

  constructor(
    private readonly userSessionRepository: IUserSessionRepository,
    private readonly candidateSessionRepository: ICandidateSessionRepository,
    private readonly userResultRepository: IUserResultRepository,
    private readonly candidateResultRepository: ICandidateResultRepository,
    private readonly queryRunner: { query: (sql: string) => Promise<unknown[]> | unknown[] },
  ) {}

  async run(options: { dryRun: boolean }): Promise<{
    userSessionsCreated: number;
    userResultsCreated: number;
    candidateSessionsCreated: number;
    candidateResultsCreated: number;
  }> {
    const stats = {
      userSessionsCreated: 0,
      userResultsCreated: 0,
      candidateSessionsCreated: 0,
      candidateResultsCreated: 0,
    };

    const legacyStudents = (await Promise.resolve(this.queryRunner.query(`
      SELECT session_id, question_id, user_id, test_id, answer_id, status, started_at, completed_at
      FROM Students
    `))) as Array<{
      session_id: string;
      question_id: string;
      user_id: string;
      test_id: string;
      answer_id: string | null;
      status: string;
      started_at: Date | null;
      completed_at: Date | null;
    }>;

    for (const legacy of legacyStudents) {
      const exists = await this.userSessionRepository.findBySessionIdAndQuestionId(
        legacy.session_id,
        legacy.question_id,
      );
      if (exists) continue;

      const session: UserSession = {
        id: crypto.randomUUID(),
        sessionId: legacy.session_id,
        questionId: legacy.question_id,
        userId: legacy.user_id,
        technologyId: legacy.test_id,
        answerId: legacy.answer_id,
        status: this.mapStatus(legacy.status),
        startedAt: legacy.started_at,
        completedAt: legacy.completed_at,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!options.dryRun) {
        await this.userSessionRepository.save(session);
      }
      stats.userSessionsCreated++;
    }

    const legacyResults = (await Promise.resolve(this.queryRunner.query(`
      SELECT result_code, user_id, test_id, score, max_score, status, session_id
      FROM Results
    `))) as Array<{
      result_code: string;
      user_id: string;
      test_id: string;
      score: number | null;
      max_score: number | null;
      status: string;
      session_id: string | null;
    }>;

    for (const legacy of legacyResults) {
      const exists = await this.userResultRepository.findByResultCode(legacy.result_code);
      if (exists) continue;

      const result: UserResult = {
        id: crypto.randomUUID(),
        resultCode: legacy.result_code,
        userId: legacy.user_id,
        technologyId: legacy.test_id,
        score: legacy.score,
        maxScore: legacy.max_score,
        status: this.mapStatus(legacy.status),
        sessionId: legacy.session_id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!options.dryRun) {
        await this.userResultRepository.save(result);
      }
      stats.userResultsCreated++;
    }

    const legacyCandidates = (await Promise.resolve(this.queryRunner.query(`
      SELECT session_id, question_id, candidate_id, access_code_id, answer_id, status, started_at, completed_at
      FROM Candidates
    `))) as Array<{
      session_id: string;
      question_id: string;
      candidate_id: string | null;
      access_code_id: string;
      answer_id: string | null;
      status: string;
      started_at: Date | null;
      completed_at: Date | null;
    }>;

    for (const legacy of legacyCandidates) {
      const exists = await this.candidateSessionRepository.findBySessionIdAndQuestionId(
        legacy.session_id,
        legacy.question_id,
      );
      if (exists) continue;

      const session: CandidateSession = {
        id: crypto.randomUUID(),
        sessionId: legacy.session_id,
        questionId: legacy.question_id,
        candidateId: legacy.candidate_id,
        accessCodeId: legacy.access_code_id,
        technologyId: '',
        answerId: legacy.answer_id,
        status: this.mapStatus(legacy.status),
        startedAt: legacy.started_at,
        completedAt: legacy.completed_at,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!options.dryRun) {
        await this.candidateSessionRepository.save(session);
      }
      stats.candidateSessionsCreated++;
    }

    const legacyCandidateResults = (await Promise.resolve(this.queryRunner.query(`
      SELECT result_code, candidate_id, test_id, score, max_score, status, session_id
      FROM Candidates_results
    `))) as Array<{
      result_code: string;
      candidate_id: string | null;
      test_id: string;
      score: number | null;
      max_score: number | null;
      status: string;
      session_id: string | null;
    }>;

    for (const legacy of legacyCandidateResults) {
      const exists = await this.candidateResultRepository.findByResultCode(legacy.result_code);
      if (exists) continue;

      const result: CandidateResult = {
        id: crypto.randomUUID(),
        resultCode: legacy.result_code,
        candidateId: legacy.candidate_id,
        technologyId: legacy.test_id,
        score: legacy.score,
        maxScore: legacy.max_score,
        status: this.mapStatus(legacy.status),
        sessionId: legacy.session_id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!options.dryRun) {
        await this.candidateResultRepository.save(result);
      }
      stats.candidateResultsCreated++;
    }

    this.logger.info('Legacy sessions/results migration completed', {
      dryRun: options.dryRun,
      ...stats,
    });

    return stats;
  }

  private mapStatus(legacyStatus: string): SessionStatus {
    switch (legacyStatus?.toLowerCase()) {
      case 'in_progress':
        return SessionStatus.IN_PROGRESS;
      case 'completed':
      case 'done':
        return SessionStatus.COMPLETED;
      case 'abandoned':
        return SessionStatus.ABANDONED;
      case 'archived':
        return SessionStatus.ARCHIVED;
      case 'pending':
      default:
        return SessionStatus.PENDING;
    }
  }
}
