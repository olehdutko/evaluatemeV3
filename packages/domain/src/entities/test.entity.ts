export function validateSingleChoice(answers: Answer[]): boolean {
  return answers.filter((a) => a.isCorrect).length === 1;
}

export interface Question {
  id: string;
  technologyId: string;
  content: string;
  type: 'single' | 'multiple';
  orderIndex: number;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  isCorrect: boolean;
  orderIndex: number;
  createdAt: Date;
}

export interface FreeSampleQuestion {
  id: string;
  technologyId: string;
  content: string;
  type: string;
  explanation?: string | null;
  createdAt: Date;
}
