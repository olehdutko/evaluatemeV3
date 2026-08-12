import { Entity } from './base.entity';

export type QuizSessionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface QuizSession extends Entity {
  userId?: string | null;
  technologyId: string;
  accessCodeId?: string | null;
  status: QuizSessionStatus;
  startedAt: Date;
  completedAt?: Date | null;
  score?: number | null;
  currentQuestionIndex: number;
  questionIdsSnapshot?: string[] | null;
}
