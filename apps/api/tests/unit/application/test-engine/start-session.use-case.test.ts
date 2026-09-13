import { StartSessionUseCase } from '../../../../src/application/test-engine/start-session.use-case';
import {
  IAccessCodeRepository,
  IQuestionRepository,
  IQuizSessionRepository,
  ISessionStrategy,
  ITechnologyRepository,
  AccessCode,
  Question,
  QuizSession,
  Technology,
} from '@evaluateme/domain';

const now = new Date();

const accessCode: AccessCode = {
  id: 'ac-1',
  code: 'CODE-123',
  companyId: 'company-1',
  technologyId: 'tech-1',
  campaignId: null,
  quizId: null,
  sentAt: null,
  sentToEmail: null,
  usedCount: 0,
  maxUses: 1,
  status: 'active',
  expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
  usedAt: null,
  testeeName: null,
  testeeEmail: null,
  questionCount: null,
  durationMinutes: null,
  createdAt: now,
  updatedAt: now,
};

const question: Question = {
  id: 'q-1',
  technologyId: 'tech-1',
  content: 'Q1',
  type: 'single',
  orderIndex: 0,
  score: 1,
  createdAt: now,
  updatedAt: now,
};

const session: QuizSession = {
  id: 'session-1',
  userId: null,
  technologyId: 'tech-1',
  accessCodeId: 'ac-1',
  status: 'in_progress',
  startedAt: now,
  currentQuestionIndex: 0,
  questionIdsSnapshot: ['q-1'],
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
  findByCampaignId(): Promise<AccessCode[]> {
    return Promise.resolve([]);
  }
  save(c: AccessCode): Promise<AccessCode> {
    return Promise.resolve(c);
  }
  countByCompanyId(): Promise<number> {
    return Promise.resolve(0);
  }
  countSentByCompanyId(): Promise<number> {
    return Promise.resolve(0);
  }
  countByCampaignId(): Promise<number> {
    return Promise.resolve(0);
  }
  updateStatusByCampaignId(): Promise<number> {
    return Promise.resolve(0);
  }
}

class FakeQuestionRepository implements IQuestionRepository {
  findAll(): Promise<Question[]> {
    return Promise.resolve([question]);
  }
  findById(): Promise<Question | null> {
    return Promise.resolve(null);
  }
  findByTechnologyId(): Promise<Question[]> {
    return Promise.resolve([question]);
  }
  findByTechnologyIdRandomized(): Promise<Question[]> {
    return Promise.resolve([question]);
  }
  save(q: Question): Promise<Question> {
    return Promise.resolve(q);
  }
  delete(): Promise<void> {
    return Promise.resolve();
  }
}

class FakeQuizSessionRepository implements IQuizSessionRepository {
  create(s: Omit<QuizSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuizSession> {
    return Promise.resolve({ ...session, ...s });
  }
  findAll(): Promise<QuizSession[]> {
    return Promise.resolve([]);
  }
  findById(): Promise<QuizSession | null> {
    return Promise.resolve(null);
  }
  update(id: string, data: Partial<QuizSession>): Promise<QuizSession> {
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

const technology: Technology = {
  id: 'tech-1',
  name: 'C#',
  slug: 'csharp',
  description: null,
  quizQuestionCount: 20,
  quizDurationMinutes: 40,
  createdAt: now,
  updatedAt: now,
};

class FakeTechnologyRepository implements ITechnologyRepository {
  findById(id: string): Promise<Technology | null> {
    return Promise.resolve(id === technology.id ? technology : null);
  }
  findAll(): Promise<Technology[]> {
    return Promise.resolve([]);
  }
  findBySlug(): Promise<Technology | null> {
    return Promise.resolve(null);
  }
  findByName(): Promise<Technology | null> {
    return Promise.resolve(null);
  }
  save(t: Technology): Promise<Technology> {
    return Promise.resolve(t);
  }
  delete(): Promise<void> {
    return Promise.resolve();
  }
}

describe('StartSessionUseCase', () => {
  const useCase = new StartSessionUseCase(
    new FakeAccessCodeRepository(),
    new FakeQuestionRepository(),
    new FakeQuizSessionRepository(),
    new FakeSessionStrategy(),
    new FakeTechnologyRepository(),
  );

  it('starts a session for a valid access code', async () => {
    const result = await useCase.execute('CODE-123');
    expect(result.data.sessionToken).toBe('session-token-123');
    expect(result.data.sessionId).toBe('session-1');
    expect(result.data.questions).toHaveLength(1);
  });

  it('throws for an unknown access code', async () => {
    await expect(useCase.execute('UNKNOWN')).rejects.toThrow('not found');
  });
});
