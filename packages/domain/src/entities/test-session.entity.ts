import { Entity } from './base.entity';

export type TestSessionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface TestSession extends Entity {
  userId?: string | null;
  testId: string;
  accessCodeId?: string | null;
  status: TestSessionStatus;
  startedAt: Date;
  completedAt?: Date | null;
  score?: number | null;
  currentQuestionIndex: number;
}
