import { Entity } from './base.entity';
import { TestStatus, QuestionType } from './status.enums';

export interface Test extends Entity {
  title: string;
  technologyId: string;
  status: TestStatus;
  durationMinutes: number | null;
  passingScore: number | null;
  createdByUserId: string;
}

export interface Question extends Entity {
  testId: string;
  content: string;
  type: QuestionType;
  orderIndex: number;
  score: number;
}

export interface Answer extends Entity {
  questionId: string;
  content: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface FreeSampleQuestion extends Entity {
  technologyId: string;
  content: string;
  type: QuestionType;
  explanation: string | null;
}
