import { createUnitTestModule } from '../../../test-module.factory';
import { ListUsersUseCase } from '../../../../../src/application/admin/users/list-users.use-case';
import { IUserRepository, UserRole, ActivationStatus } from '@evaluateme/domain';

describe('ListUsersUseCase', () => {
  let useCase: ListUsersUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    userRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      save: jest.fn(),
    };

    const module = await createUnitTestModule({
      providers: [ListUsersUseCase, { provide: IUserRepository, useValue: userRepository }],
    });

    useCase = module.get<ListUsersUseCase>(ListUsersUseCase);
  });

  it('returns a list of users', async () => {
    userRepository.findAll.mockResolvedValue([
      {
        id: 'user-1',
        email: 'user@example.com',
        role: UserRole.USER,
        activationStatus: ActivationStatus.ACTIVE,
        passwordHash: 'hashed',
        legacyMd5Hash: null,
        companyProfileId: null,
        createdAt: new Date('2026-08-01T00:00:00Z'),
        updatedAt: new Date('2026-08-10T00:00:00Z'),
      },
    ] as never);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: 'user-1',
      email: 'user@example.com',
      role: 'user',
      activationStatus: 'active',
    });
    expect(typeof result.data[0].createdAt).toBe('string');
  });

  it('returns an empty list when no users exist', async () => {
    userRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });
});
