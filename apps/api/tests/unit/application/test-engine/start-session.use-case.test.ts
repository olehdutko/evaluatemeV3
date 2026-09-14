import { StartSessionUseCase } from '../../../../src/application/test-engine/start-session.use-case';
import {
  IAccessCodeRepository,
  IQuestionRepository,
  IQuizSessionRepository,
  ISessionStrategy,
  IQuestionSetRepository,
  AccessCode,
  Question,
  QuizSession,
  QuestionSet,
} from '@evaluateme/domain';

const now = new Date();

const questionSet: QuestionSet = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  title: 'C# Basics',
  technologyId: 'tech-1',
  status: 'active',
  quizQuestionCount: 20,
  quizDurationMinutes: 40,
  createdByUserId: 'user-1',
  createdAt: now,
  updatedAt: now,
};

const accessCode: AccessCode = {
  id: 'ac-1',
  code: 'CODE-123',
  companyId: 'company-1',
  questionSetId: questionSet.id,
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
  questionSetId: questionSet.id,
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
  questionSetId: questionSet.id,
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
  findByQuestionSetId(): Promise<Question[]> {
    return Promise.resolve([question]);
  }
  findByQuestionSetIdRandomized(): Promise<Question[]> {
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

class FakeQuestionSetRepository implements IQuestionSetRepository {
  findById(id: string): Promise<QuestionSet | null> {
    return Promise.resolve(id === questionSet.id ? questionSet : null);
  }
  findByTechnologyId(): Promise<QuestionSet[]> {
    return Promise.resolve([]);
  }
  findByTechnologyIdAndTitle(): Promise<QuestionSet | null> {
    return Promise.resolve(null);
  }
  save(qs: QuestionSet): Promise<QuestionSet> {
    return Promise.resolve(qs);
  }
  delete(): Promise<void> {
    return Promise.resolve();
  }
}

describe('StartSessionUseCase', () => {
  const useCase = new StartSessionUseCase(
    new FakeAccessCodeRepository(),
    new FakeQuestionSetRepository(),
    new FakeQuestionRepository(),
    new FakeQuizSessionRepository(),
    new FakeSessionStrategy(),
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
