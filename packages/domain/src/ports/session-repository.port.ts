import { CandidateSession, UserSession } from '../entities/session.entity';

export const IUserSessionRepository = Symbol('IUserSessionRepository');
export const ICandidateSessionRepository = Symbol('ICandidateSessionRepository');

export interface IUserSessionRepository {
  findBySessionId(sessionId: string): Promise<UserSession[]>;
  findBySessionIdAndQuestionId(sessionId: string, questionId: string): Promise<UserSession | null>;
  save(session: UserSession): Promise<UserSession>;
}

export interface ICandidateSessionRepository {
  findBySessionId(sessionId: string): Promise<CandidateSession[]>;
  findBySessionIdAndQuestionId(sessionId: string, questionId: string): Promise<CandidateSession | null>;
  save(session: CandidateSession): Promise<CandidateSession>;
}
