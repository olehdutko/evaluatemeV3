import { CandidateSession, UserSession } from '../entities/session.entity';

export const IUserSessionRepository = Symbol('IUserSessionRepository');
export const ICandidateSessionRepository = Symbol('ICandidateSessionRepository');

export interface IUserSessionRepository {
  findBySessionId(sessionId: string): Promise<UserSession[]>;
  save(session: UserSession): Promise<UserSession>;
}

export interface ICandidateSessionRepository {
  findBySessionId(sessionId: string): Promise<CandidateSession[]>;
  save(session: CandidateSession): Promise<CandidateSession>;
}
