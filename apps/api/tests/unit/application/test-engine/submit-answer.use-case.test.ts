import { SubmitAnswerUseCase } from '../../../../src/application/test-engine/submit-answer.use-case';
import {
  ITestSessionRepository,
  IAnswerRepository,
  IQuestionRepository,
  TestSession,
  Answer,
  Question,
  UserAnswer,
} from '@evaluateme/domain';

const nowStr = new Date().toISOString();

const session: TestSession = {
  id: 'session-1',
  userId: 'user-1',
  testId: 'tech-1',
  status: 'in_progress',
  startedAt: new Date(),
  currentQuestionIndex: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const questions: Question[] = [
  {
    id: 'q-1',
    testId: 'tech-1',
    content: 'Q1',
    type: 'single',
    orderIndex: 0,
    score: 1,
    createdAt: nowStr,
    updatedAt: nowStr,
  },
];

class FakeTestSessionRepository implements ITestSessionRepository {
  answers: UserAnswer[] = [];

  async create(): Promise<never> {
    throw new Error('not implemented');
  }
  async findById(id: string): Promise<TestSession | null> {
    return id === session.id ? session : null;
  }
  async update(id: string, data: Partial<TestSession>): Promise<TestSession> {
    return { ...session, ...data, id };
  }
  async addAnswer(answer: Omit<UserAnswer, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserAnswer> {
    const created: UserAnswer = {
      id: 'ua-1',
      ...answer,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.answers.push(created);
    return created;
  }
  async findAnswersBySessionId(): Promise<UserAnswer[]> {
    return this.answers;
  }
}

class FakeAnswerRepository implements IAnswerRepository {
  async findByQuestionId(): Promise<Answer[]> {
    return [];
  }
  async findById(id: string): Promise<Answer | null> {
    return id === 'a-1'
      ? { id: 'a-1', questionId: 'q-1', content: 'Correct', isCorrect: true, orderIndex: 0, createdAt: nowStr, updatedAt: nowStr }
      : null;
  }
  async findByQuestionIds(): Promise<Answer[]> {
    return [];
  }
  async save(a: Answer): Promise<Answer> {
    return a;
  }
}

class FakeQuestionRepository implements IQuestionRepository {
  async findByTestId(): Promise<Question[]> {
    return questions;
  }
  async findById(): Promise<Question | null> {
    return null;
  }
  async findByTestIdRandomized(): Promise<Question[]> {
    return [];
  }
  async save(q: Question): Promise<Question> {
    return q;
  }
}

describe('SubmitAnswerUseCase', () => {
  const repo = new FakeTestSessionRepository();
  const useCase = new SubmitAnswerUseCase(repo, new FakeAnswerRepository(), new FakeQuestionRepository());

  it('records a correct answer and completes the test', async () => {
    const result = await useCase.execute('session-1', 'q-1', 'a-1');
    expect(result.data.isCorrect).toBe(true);
    expect(result.data.isComplete).toBe(true);
    expect(result.data.currentScore).toBe(100);
  });

  it('throws for unknown session', async () => {
    await expect(useCase.execute('missing', 'q-1', 'a-1')).rejects.toThrow('not found');
  });
});
