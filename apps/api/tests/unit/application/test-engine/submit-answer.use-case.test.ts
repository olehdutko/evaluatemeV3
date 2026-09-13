import { SubmitAnswerUseCase } from '../../../../src/application/test-engine/submit-answer.use-case';
import {
  IQuizSessionRepository,
  IAnswerRepository,
  IUserResultRepository,
  ICandidateResultRepository,
  IAccessCodeRepository,
  QuizSession,
  Answer,
  UserAnswer,
  AccessCode,
} from '@evaluateme/domain';

const now = new Date();

const accessCode: AccessCode = {
  id: 'ac-1',
  code: 'CODE-123',
  companyId: 'company-1',
  campaignId: null,
  quizId: null,
  technologyId: 'tech-1',
  status: 'active',
  sentAt: null,
  sentToEmail: null,
  usedCount: 0,
  maxUses: 1,
  expiresAt: null,
  usedAt: null,
  testeeName: null,
  testeeEmail: null,
  questionCount: null,
  durationMinutes: null,
  createdAt: now,
  updatedAt: now,
};

const session: QuizSession = {
  id: 'session-1',
  userId: 'user-1',
  technologyId: 'tech-1',
  status: 'in_progress',
  startedAt: now,
  currentQuestionIndex: 0,
  questionIdsSnapshot: ['q-1'],
  createdAt: now,
  updatedAt: now,
};

class FakeQuizSessionRepository implements IQuizSessionRepository {
  answers: UserAnswer[] = [];

  async create(): Promise<never> {
    throw new Error('not implemented');
  }
  async findAll(): Promise<QuizSession[]> {
    return [];
  }
  async findById(id: string): Promise<QuizSession | null> {
    return id === session.id ? session : null;
  }
  async update(id: string, data: Partial<QuizSession>): Promise<QuizSession> {
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
      ? { id: 'a-1', questionId: 'q-1', content: 'Correct', isCorrect: true, orderIndex: 0, createdAt: now }
      : null;
  }
  async findByQuestionIds(): Promise<Answer[]> {
    return [];
  }
  async save(a: Answer): Promise<Answer> {
    return a;
  }
  async delete(): Promise<void> {
    // no-op
  }
}


class FakeUserResultRepository implements IUserResultRepository {
  async findByUserId(): Promise<never[]> {
    return [];
  }
  async save(): Promise<never> {
    throw new Error('not implemented');
  }
  async findByResultCode(): Promise<never> {
    throw new Error('not implemented');
  }
}

class FakeAccessCodeRepository implements IAccessCodeRepository {
  async findById(id: string): Promise<AccessCode | null> {
    return id === accessCode.id ? accessCode : null;
  }
  async findByCode(): Promise<AccessCode | null> {
    return null;
  }
  async findByCampaignId(): Promise<AccessCode[]> {
    return [];
  }
  async save(c: AccessCode): Promise<AccessCode> {
    return c;
  }
  async countByCompanyId(): Promise<number> {
    return 0;
  }
  async countSentByCompanyId(): Promise<number> {
    return 0;
  }
  async countByCampaignId(): Promise<number> {
    return 0;
  }
  async updateStatusByCampaignId(): Promise<number> {
    return 0;
  }
}

class FakeCandidateResultRepository implements ICandidateResultRepository {
  async findByCandidateId(): Promise<never[]> {
    return [];
  }
  async findByCampaignId(): Promise<never[]> {
    return [];
  }
  async save(): Promise<never> {
    throw new Error('not implemented');
  }
  async findByResultCode(): Promise<never> {
    throw new Error('not implemented');
  }
}

describe('SubmitAnswerUseCase', () => {
  const repo = new FakeQuizSessionRepository();
  const useCase = new SubmitAnswerUseCase(
    repo,
    new FakeAnswerRepository(),
    new FakeUserResultRepository(),
    new FakeCandidateResultRepository(),
    new FakeAccessCodeRepository(),
  );

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
