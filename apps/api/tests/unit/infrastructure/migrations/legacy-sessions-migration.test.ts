/* eslint-disable @typescript-eslint/unbound-method */
import { LegacySessionsResultsMigration } from '../../../../src/infrastructure/migrations/legacy-sessions-results.migration';
import type { IUserSessionRepository, IUserResultRepository, ICandidateSessionRepository, ICandidateResultRepository } from '@evaluateme/domain';

const stubStudents = (sql: string): unknown[] => {
  if (sql.includes('Students')) {
    return [
      {
        session_id: 's1',
        question_id: 'q1',
        user_id: 'u1',
        test_id: 't1',
        answer_id: null,
        status: 'pending',
        started_at: null,
        completed_at: null,
      },
    ];
  }
  return [];
};

describe('LegacySessionsResultsMigration idempotency', () => {
  const mockUserSessionRepo: jest.Mocked<IUserSessionRepository> = {
    findBySessionIdAndQuestionId: jest.fn(),
    save: jest.fn(),
  };

  const mockCandidateSessionRepo: jest.Mocked<ICandidateSessionRepository> = {
    findBySessionIdAndQuestionId: jest.fn(),
    save: jest.fn(),
  };

  const mockUserResultRepo: jest.Mocked<IUserResultRepository> = {
    findByResultCode: jest.fn(),
    save: jest.fn(),
  };

  const mockCandidateResultRepo: jest.Mocked<ICandidateResultRepository> = {
    findByResultCode: jest.fn(),
    save: jest.fn(),
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const mockQueryRunner: { query: jest.Mock } = {
    query: jest.fn().mockReturnValue([]),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryRunner.query.mockReturnValue([]);
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
    mockQueryRunner.query.mockReturnValue(stubStudents('Students'));
    mockUserSessionRepo.findBySessionIdAndQuestionId.mockResolvedValue(null);

    await createMigration().run({ dryRun: false });
    expect(mockUserSessionRepo.save).toHaveBeenCalledTimes(1);
  });

  it('does not duplicate a user session row when it already exists', async () => {
    mockQueryRunner.query.mockReturnValue(stubStudents('Students'));
    mockUserSessionRepo.findBySessionIdAndQuestionId.mockResolvedValue({ id: 'existing' } as never);

    await createMigration().run({ dryRun: false });
    expect(mockUserSessionRepo.save).not.toHaveBeenCalled();
  });

  it('does not save rows in dry-run mode', async () => {
    mockQueryRunner.query.mockReturnValue(stubStudents('Students'));
    mockUserSessionRepo.findBySessionIdAndQuestionId.mockResolvedValue(null);

    await createMigration().run({ dryRun: true });
    expect(mockUserSessionRepo.save).not.toHaveBeenCalled();
  });
});
