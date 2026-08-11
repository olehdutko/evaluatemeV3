import { createUnitTestModule } from '../../../test-module.factory';
import { UpdateUserUseCase } from '../../../../../src/application/admin/users/update-user.use-case';
import { IUserRepository, UserRole, ActivationStatus } from '@evaluateme/domain';
import { NotFoundError, BadRequestError, ConflictError } from '../../../../../src/infrastructure/errors/app-error';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    userRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    };

    const module = await createUnitTestModule({
      providers: [UpdateUserUseCase, { provide: IUserRepository, useValue: userRepository }],
    });

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
  });

  it('updates role and activation status for a regular user', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      role: UserRole.USER,
      activationStatus: ActivationStatus.PENDING,
      passwordHash: 'hashed',
      legacyMd5Hash: null,
      companyProfileId: null,
      createdAt: new Date('2026-08-01T00:00:00Z'),
      updatedAt: new Date('2026-08-10T00:00:00Z'),
    } as never);

    const result = await useCase.execute({
      id: 'user-1',
      role: UserRole.COMPANY,
      activationStatus: ActivationStatus.ACTIVE,
    });

    expect(result.success).toBe(true);
    expect(result.data.role).toBe('company');
    expect(result.data.activationStatus).toBe('active');
  });

  it('throws NotFoundError for unknown user', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'missing', activationStatus: ActivationStatus.ACTIVE })).rejects.toThrow(NotFoundError);
  });

  it('prevents promoting a user to admin', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      role: UserRole.USER,
      activationStatus: ActivationStatus.ACTIVE,
      passwordHash: 'hashed',
      legacyMd5Hash: null,
      companyProfileId: null,
      createdAt: new Date('2026-08-01T00:00:00Z'),
      updatedAt: new Date('2026-08-10T00:00:00Z'),
    } as never);

    await expect(
      useCase.execute({ id: 'user-1', role: UserRole.ADMIN }),
    ).rejects.toThrow(ConflictError);
  });

  it('rejects invalid activation status', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      role: UserRole.USER,
      activationStatus: ActivationStatus.ACTIVE,
      passwordHash: 'hashed',
      legacyMd5Hash: null,
      companyProfileId: null,
      createdAt: new Date('2026-08-01T00:00:00Z'),
      updatedAt: new Date('2026-08-10T00:00:00Z'),
    } as never);

    await expect(
      useCase.execute({ id: 'user-1', activationStatus: 'banned' as ActivationStatus }),
    ).rejects.toThrow(BadRequestError);
  });
});
