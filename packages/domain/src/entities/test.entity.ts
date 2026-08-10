import { Entity } from './base.entity';

export interface Test extends Entity {
  title: string;
  technologyId: string;
  status: string;
  durationMinutes?: number | null;
  passingScore?: number | null;
  createdByUserId?: string | null;
}

export interface Question {
  id: string;
  testId: string;
  content: string;
  type: 'single' | 'multiple';
  orderIndex: number;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  isCorrect: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface FreeSampleQuestion {
  id: string;
  technologyId: string;
  content: string;
  type: string;
  explanation?: string | null;
  createdAt: string;
}
