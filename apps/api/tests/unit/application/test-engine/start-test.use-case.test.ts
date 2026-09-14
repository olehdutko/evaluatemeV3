import { StartTestUseCase } from '../../../../src/application/test-engine/start-test.use-case';
import {
  IQuestionSetRepository,
  IQuestionRepository,
  IQuizSessionRepository,
  IUserRepository,
  QuestionSet,
  Question,
  QuizSession,
  User,
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

const question: Question = {
  id: 'q-1',
  questionSetId: questionSet.id,
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
  questionSetId: questionSet.id,
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

class FakeQuestionSetRepository implements IQuestionSetRepository {
  async findById(id: string): Promise<QuestionSet | null> {
    return id === questionSet.id ? questionSet : null;
  }
  async findByTechnologyId(): Promise<QuestionSet[]> {
    return [];
  }
  async findByTechnologyIdAndTitle(): Promise<QuestionSet | null> {
    return null;
  }
  async save(qs: QuestionSet): Promise<QuestionSet> {
    return qs;
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
  async findByQuestionSetId(): Promise<Question[]> {
    return [question];
  }
  async findByQuestionSetIdRandomized(): Promise<Question[]> {
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

describe('StartTestUseCase', () => {
  const useCase = new StartTestUseCase(
    new FakeQuestionSetRepository(),
    new FakeQuestionRepository(),
    new FakeQuizSessionRepository(),
    new FakeUserRepository(),
  );

  it('creates a test session for an existing question set', async () => {
    const result = await useCase.execute('user-1', questionSet.id);
    expect(result.data.sessionId).toBe('session-1');
    expect(result.data.questionSet.id).toBe(questionSet.id);
    expect(result.data.questions).toHaveLength(1);
  });

  it('throws for unknown question set', async () => {
    await expect(useCase.execute('user-1', 'unknown')).rejects.toThrow('not found');
  });

  it('rejects admin users', async () => {
    const adminRepository = new FakeUserRepository();
    const originalFindById = adminRepository.findById.bind(adminRepository);
    adminRepository.findById = async (id: string): Promise<User | null> => {
      const existing = await originalFindById(id);
      if (!existing) return null;
      return { ...existing, role: 'admin' };
    };
    const adminUseCase = new StartTestUseCase(
      new FakeQuestionSetRepository(),
      new FakeQuestionRepository(),
      new FakeQuizSessionRepository(),
      adminRepository,
    );
    await expect(adminUseCase.execute('user-1', questionSet.id)).rejects.toThrow('Admin users cannot take tests');
  });
});
