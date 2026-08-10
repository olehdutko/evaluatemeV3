import { Entity } from './base.entity';

export interface UserAnswer extends Entity {
  testSessionId: string;
  questionId: string;
  answerId: string;
  isCorrect: boolean;
  answeredAt: Date;
}
