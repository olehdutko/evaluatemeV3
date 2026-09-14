import { Entity } from './base.entity';

export interface Technology extends Entity {
  name: string;
  slug: string;
  description: string | null;
}

export interface QuestionSet extends Entity {
  title: string;
  technologyId: string;
  status: 'active' | 'suspended';
  description: string | null;
  quizQuestionCount: number;
  quizDurationMinutes: number;
  createdByUserId: string;
}
