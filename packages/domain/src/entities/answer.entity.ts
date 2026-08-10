export interface Answer {
  id: string;
  questionId: string;
  content: string;
  isCorrect: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}
