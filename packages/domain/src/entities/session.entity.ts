import { Entity } from './base.entity';
import { SessionStatus } from './status.enums';

export interface UserSession extends Entity {
  sessionId: string;
  questionId: string;
  userId: string;
  technologyId: string;
  answerId: string | null;
  status: SessionStatus;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface CandidateSession extends Entity {
  sessionId: string;
  questionId: string;
  candidateId: string | null;
  accessCodeId: string;
  technologyId: string;
  answerId: string | null;
  status: SessionStatus;
  startedAt: Date | null;
  completedAt: Date | null;
}
