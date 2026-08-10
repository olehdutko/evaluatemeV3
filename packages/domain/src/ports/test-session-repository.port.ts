import { TestSession } from '../entities/test-session.entity';
import { UserAnswer } from '../entities/user-answer.entity';

export interface ITestSessionRepository {
  create(session: Omit<TestSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<TestSession>;
  findById(id: string): Promise<TestSession | null>;
  update(id: string, data: Partial<TestSession>): Promise<TestSession>;
  addAnswer(answer: Omit<UserAnswer, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserAnswer>;
  findAnswersBySessionId(sessionId: string): Promise<UserAnswer[]>;
}

export const ITestSessionRepository = Symbol('ITestSessionRepository');
