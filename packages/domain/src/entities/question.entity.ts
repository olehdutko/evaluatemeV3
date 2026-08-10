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
