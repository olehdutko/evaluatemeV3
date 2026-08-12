import { StartTestUseCase } from '../../../../src/application/test-engine/start-test.use-case';
import {
  ITechnologyRepository,
  IQuestionRepository,
  ITestSessionRepository,
  Technology,
  Question,
  TestSession,
} from '@evaluateme/domain';

const now = new Date();

const tech: Technology = {
  id: 'tech-1',
  name: 'C#',
  slug: 'csharp',
  description: null,
  createdAt: now,
  updatedAt: now,
};

const question: Question = {
  id: 'q-1',
  testId: 'tech-1',
  content: 'What is 2+2?',
  type: 'single',
  orderIndex: 0,
  score: 1,
  createdAt: now,
  updatedAt: now,
};

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

class FakeTechnologyRepository implements ITechnologyRepository {
  async findById(): Promise<Technology | null> {
    return null;
  }
  async findAll(): Promise<Technology[]> {
    return [];
  }
  async findBySlug(slug: string): Promise<Technology | null> {
    return slug === tech.slug ? tech : null;
  }
  async findByName(): Promise<Technology | null> {
    return null;
  }
  async save(t: Technology): Promise<Technology> {
    return t;
  }
  async delete(): Promise<void> {
    // no-op
  }
}

class FakeQuestionRepository implements IQuestionRepository {
  async findByTestId(): Promise<Question[]> {
    return [question];
  }
  async findById(): Promise<Question | null> {
    return null;
  }
  async findByTestIdRandomized(): Promise<Question[]> {
    return [question];
  }
  async save(q: Question): Promise<Question> {
    return q;
  }
}

class FakeTestSessionRepository implements ITestSessionRepository {
  async create(s: Omit<TestSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<TestSession> {
    return { ...session, ...s };
  }
  async findById(): Promise<TestSession | null> {
    return null;
  }
  async update(id: string, data: Partial<TestSession>): Promise<TestSession> {
    return { ...session, ...data, id };
  }
  async addAnswer(): Promise<never> {
    throw new Error('not implemented');
  }
  async findAnswersBySessionId(): Promise<never[]> {
    return [];
  }
}

describe('StartTestUseCase', () => {
  const useCase = new StartTestUseCase(
    new FakeTechnologyRepository(),
    new FakeQuestionRepository(),
    new FakeTestSessionRepository(),
  );

  it('creates a test session for an existing technology', async () => {
    const result = await useCase.execute('user-1', 'csharp');
    expect(result.data.sessionId).toBe('session-1');
    expect(result.data.technology.slug).toBe('csharp');
    expect(result.data.questions).toHaveLength(1);
  });

  it('throws for unknown technology', async () => {
    await expect(useCase.execute('user-1', 'unknown')).rejects.toThrow('not found');
  });
});
