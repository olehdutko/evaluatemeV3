import { LegacySessionsResultsMigration } from '../../../../src/infrastructure/migrations/legacy-sessions-results.migration';
import {
  ICandidateResultRepository,
  ICandidateSessionRepository,
  IUserResultRepository,
  IUserSessionRepository,
} from '@evaluateme/domain';

function stubStudents(): unknown[] {
  return [
    {
      session_id: 's1',
      question_id: 10,
      user_id: 1,
      test_id: 2,
      answer: 'A',
      status: 'completed',
      started: new Date(),
      completed: new Date(),
    },
  ] as unknown[];
}

describe('LegacySessionsResultsMigration', () => {
  const mockUserSessionRepo: jest.Mocked<IUserSessionRepository> = {
    findBySessionId: jest.fn(),
    findBySessionIdAndQuestionId: jest.fn(),
    save: jest.fn(),
  };
  const mockCandidateSessionRepo: jest.Mocked<ICandidateSessionRepository> = {
    findBySessionId: jest.fn(),
    findBySessionIdAndQuestionId: jest.fn(),
    save: jest.fn(),
  };
  const mockUserResultRepo: jest.Mocked<IUserResultRepository> = {
    findByResultCode: jest.fn(),
    findByUserId: jest.fn(),
    save: jest.fn(),
  };
  const mockCandidateResultRepo: jest.Mocked<ICandidateResultRepository> = {
    findByResultCode: jest.fn(),
    findByCandidateId: jest.fn(),
    save: jest.fn(),
  };
  const mockQueryRunner = { query: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserSessionRepo.findBySessionIdAndQuestionId.mockResolvedValue(null);
    mockCandidateSessionRepo.findBySessionIdAndQuestionId.mockResolvedValue(null);
    mockUserResultRepo.findByResultCode.mockResolvedValue(null);
    mockCandidateResultRepo.findByResultCode.mockResolvedValue(null);
  });

  function createMigration(): LegacySessionsResultsMigration {
    return new LegacySessionsResultsMigration(
      mockUserSessionRepo,
      mockCandidateSessionRepo,
      mockUserResultRepo,
      mockCandidateResultRepo,
      mockQueryRunner as { query: (sql: string) => unknown[] | Promise<unknown[]> },
    );
  }

  it('inserts a new user session row when none exists', async () => {
    mockQueryRunner.query.mockReturnValue(stubStudents());
    mockUserSessionRepo.findBySessionIdAndQuestionId.mockResolvedValue(null);

    await createMigration().run({ dryRun: false });
    expect(mockUserSessionRepo.save).toHaveBeenCalledTimes(1);
  });

  it('does not duplicate a user session row when it already exists', async () => {
    mockQueryRunner.query.mockReturnValue(stubStudents());
    mockUserSessionRepo.findBySessionIdAndQuestionId.mockResolvedValue({ id: 'existing' } as never);

    await createMigration().run({ dryRun: false });
    expect(mockUserSessionRepo.save).not.toHaveBeenCalled();
  });

  it('does not save rows in dry-run mode', async () => {
    mockQueryRunner.query.mockReturnValue(stubStudents());
    mockUserSessionRepo.findBySessionIdAndQuestionId.mockResolvedValue(null);

    await createMigration().run({ dryRun: true });
    expect(mockUserSessionRepo.save).not.toHaveBeenCalled();
  });
});
