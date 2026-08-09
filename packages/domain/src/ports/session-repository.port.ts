import { CandidateSession, UserSession } from '../entities/session.entity';

export interface IUserSessionRepository {
  findBySessionIdAndQuestionId(sessionId: string, questionId: string): Promise<UserSession | null>;
  save(session: UserSession): Promise<UserSession>;
}

export interface ICandidateSessionRepository {
  findBySessionIdAndQuestionId(sessionId: string, questionId: string): Promise<CandidateSession | null>;
  save(session: CandidateSession): Promise<CandidateSession>;
}
