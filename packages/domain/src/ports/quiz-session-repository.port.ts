import { QuizSession } from '../entities/quiz-session.entity';
import { UserAnswer } from '../entities/user-answer.entity';

export interface IQuizSessionRepository {
  create(session: Omit<QuizSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuizSession>;
  findById(id: string): Promise<QuizSession | null>;
  update(id: string, data: Partial<QuizSession>): Promise<QuizSession>;
  addAnswer(answer: Omit<UserAnswer, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserAnswer>;
  findAnswersBySessionId(sessionId: string): Promise<UserAnswer[]>;
}

export const IQuizSessionRepository = Symbol('IQuizSessionRepository');
