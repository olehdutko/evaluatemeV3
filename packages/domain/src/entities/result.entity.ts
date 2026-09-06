import { Entity } from './base.entity';
import { SessionStatus } from './status.enums';

export interface UserResult extends Entity {
  resultCode: string;
  userId: string;
  technologyId: string;
  score: number | null;
  maxScore: number | null;
  status: SessionStatus;
  sessionId: string | null;
}

export interface CandidateResult extends Entity {
  resultCode: string;
  campaignId: string | null;
  candidateId: string | null;
  accessCodeId: string | null;
  technologyId: string | null;
  companyQuizId: string | null;
  score: number | null;
  maxScore: number | null;
  status: SessionStatus;
  sessionId: string | null;
}
