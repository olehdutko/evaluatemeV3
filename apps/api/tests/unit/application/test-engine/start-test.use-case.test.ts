import { StartTestUseCase } from '../../../../src/application/test-engine/start-test.use-case';
import {
  ITechnologyRepository,
  IQuestionRepository,
  IQuizSessionRepository,
  IUserRepository,
  ICreditSettingRepository,
  Technology,
  Question,
  QuizSession,
  User,
  CreditSetting,
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
  technologyId: 'tech-1',
  content: 'What is 2+2?',
  type: 'single',
  orderIndex: 0,
  score: 1,
  createdAt: now,
  updatedAt: now,
};

const session: QuizSession = {
  id: 'session-1',
  userId: 'user-1',
  technologyId: 'tech-1',
  status: 'in_progress',
  startedAt: new Date(),
  currentQuestionIndex: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const user: User = {
  id: 'user-1',
  email: 'test@example.com',
  username: null,
  passwordHash: 'hash',
  legacyMd5Hash: null,
  role: 'user',
  activationStatus: 'active',
  companyProfileId: null,
  credits: 10,
  firstName: null,
  lastName: null,
  middleName: null,
  birthDate: null,
  country: null,
  city: null,
  phone: null,
  createdAt: now,
  updatedAt: now,
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
  async findAll(): Promise<Question[]> {
    return [question];
  }
  async findById(): Promise<Question | null> {
    return null;
  }
  async findByTechnologyId(): Promise<Question[]> {
    return [question];
  }
  async findByTechnologyIdRandomized(): Promise<Question[]> {
    return [question];
  }
  async save(q: Question): Promise<Question> {
    return q;
  }
  async delete(): Promise<void> {
    // no-op
  }
}

class FakeQuizSessionRepository implements IQuizSessionRepository {
  async create(s: Omit<QuizSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuizSession> {
    return { ...session, ...s };
  }
  async findAll(): Promise<QuizSession[]> {
    return [];
  }
  async findById(): Promise<QuizSession | null> {
    return null;
  }
  async update(id: string, data: Partial<QuizSession>): Promise<QuizSession> {
    return { ...session, ...data, id };
  }
  async addAnswer(): Promise<never> {
    throw new Error('not implemented');
  }
  async findAnswersBySessionId(): Promise<never[]> {
    return [];
  }
}

class FakeUserRepository implements IUserRepository {
  async findAll(): Promise<User[]> {
    return [];
  }
  async findById(id: string): Promise<User | null> {
    return id === user.id ? user : null;
  }
  async findByEmail(): Promise<User | null> {
    return null;
  }
  async findByUsername(): Promise<User | null> {
    return null;
  }
  async save(u: User): Promise<User> {
    return u;
  }
  async delete(): Promise<void> {
    // no-op
  }
}

class FakeCreditSettingRepository implements ICreditSettingRepository {
  async findByKey(key: string): Promise<CreditSetting | null> {
    if (key === 'test_question_count') {
      return { id: 'cs-1', key, value: '20', updatedByUserId: 'admin-1', createdAt: now, updatedAt: now };
    }
    return null;
  }
  async findAll(): Promise<CreditSetting[]> {
    return [];
  }
  async save(s: CreditSetting): Promise<CreditSetting> {
    return s;
  }
}

describe('StartTestUseCase', () => {
  const useCase = new StartTestUseCase(
    new FakeTechnologyRepository(),
    new FakeQuestionRepository(),
    new FakeQuizSessionRepository(),
    new FakeUserRepository(),
    new FakeCreditSettingRepository(),
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
