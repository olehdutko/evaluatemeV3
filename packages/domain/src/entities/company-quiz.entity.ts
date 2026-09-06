import { Entity } from './base.entity';

export const CompanyQuizType = {
  CUSTOM: 'custom',
  PERSONAL: 'personal',
} as const;
export type CompanyQuizType = (typeof CompanyQuizType)[keyof typeof CompanyQuizType];

export const CompanyQuizStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;
export type CompanyQuizStatus = (typeof CompanyQuizStatus)[keyof typeof CompanyQuizStatus];

export interface CompanyQuiz extends Entity {
  companyId: string;
  type: CompanyQuizType;
  name: string;
  description: string | null;
  status: CompanyQuizStatus;
  createdByUserId: string;
}

export interface CompanyQuizQuestion extends Entity {
  companyQuizId: string;
  content: string;
  type: 'single_choice' | 'multiple_choice' | 'text';
  orderIndex: number;
  score: number;
}

export interface CompanyQuizAnswer extends Entity {
  companyQuizQuestionId: string;
  content: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface CustomQuizQuestion extends Entity {
  companyQuizId: string;
  questionId: string;
  orderIndex: number;
}
