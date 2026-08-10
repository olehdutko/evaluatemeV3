import { StartSessionUseCase } from '../../../../src/application/test-engine/start-session.use-case';
import {
  IAccessCodeRepository,
  IQuestionRepository,
  ITestSessionRepository,
  ISessionStrategy,
  AccessCode,
  Question,
  TestSession,
} from '@evaluateme/domain';

const now = new Date();

const accessCode: AccessCode = {
  id: 'ac-1',
  code: 'CODE-123',
  companyId: 'company-1',
  testId: 'test-1',
  status: 'active',
  expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
  usedAt: null,
  createdAt: now,
  updatedAt: now,
};

const question: Question = {
  id: 'q-1',
  testId: 'test-1',
  content: 'Q1',
  type: 'single',
  orderIndex: 0,
  score: 1,
  createdAt: now,
  updatedAt: now,
};

const session: TestSession = {
  id: 'session-1',
  userId: null,
  testId: 'test-1',
  accessCodeId: 'ac-1',
  status: 'in_progress',
  startedAt: now,
  currentQuestionIndex: 0,
  createdAt: now,
  updatedAt: now,
};

class FakeAccessCodeRepository implements IAccessCodeRepository {
  findById(): Promise<AccessCode | null> {
    return Promise.resolve(null);
  }
  findByCode(code: string): Promise<AccessCode | null> {
    return Promise.resolve(code === accessCode.code ? accessCode : null);
  }
  save(c: AccessCode): Promise<AccessCode> {
    return Promise.resolve(c);
  }
}

class FakeQuestionRepository implements IQuestionRepository {
  findByTestId(): Promise<Question[]> {
    return Promise.resolve([question]);
  }
  findById(): Promise<Question | null> {
    return Promise.resolve(null);
  }
  findByTestIdRandomized(): Promise<Question[]> {
    return Promise.resolve([question]);
  }
  save(q: Question): Promise<Question> {
    return Promise.resolve(q);
  }
}

class FakeTestSessionRepository implements ITestSessionRepository {
  create(s: Omit<TestSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<TestSession> {
    return Promise.resolve({ ...session, ...s });
  }
  findById(): Promise<TestSession | null> {
    return Promise.resolve(null);
  }
  update(id: string, data: Partial<TestSession>): Promise<TestSession> {
    return Promise.resolve({ ...session, ...data, id });
  }
  addAnswer(): Promise<never> {
    return Promise.reject(new Error('not implemented'));
  }
  findAnswersBySessionId(): Promise<never[]> {
    return Promise.resolve([]);
  }
}

class FakeSessionStrategy implements ISessionStrategy {
  issueSessionToken(): Promise<string> {
    return Promise.resolve('session-token-123');
  }
  verifySessionToken(): Promise<null> {
    return Promise.resolve(null);
  }
  revokeSessionToken(): Promise<void> {
    return Promise.resolve();
  }
}

describe('StartSessionUseCase', () => {
  const useCase = new StartSessionUseCase(
    new FakeAccessCodeRepository(),
    new FakeQuestionRepository(),
    new FakeTestSessionRepository(),
    new FakeSessionStrategy(),
  );

  it('starts a session for a valid access code', async () => {
    const result = await useCase.execute('CODE-123');
    expect(result.data.sessionToken).toBe('session-token-123');
    expect(result.data.sessionId).toBe('session-1');
    expect(result.data.questions).toHaveLength(1);
  });

  it('throws for unknown access code', async () => {
    await expect(useCase.execute('UNKNOWN')).rejects.toThrow('not found');
  });

  it('throws for expired access code', async () => {
    const expiredCode = { ...accessCode, expiresAt: new Date(now.getTime() - 1000) };
    const repo: IAccessCodeRepository = {
      findById: () => Promise.resolve(null),
      findByCode: () => Promise.resolve(expiredCode),
      save: (c) => Promise.resolve(c),
    };
    const expiredUseCase = new StartSessionUseCase(repo, new FakeQuestionRepository(), new FakeTestSessionRepository(), new FakeSessionStrategy());
    await expect(expiredUseCase.execute('CODE-123')).rejects.toThrow('expired');
  });
});
