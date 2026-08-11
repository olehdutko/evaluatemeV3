import { createUnitTestModule } from '../../test-module.factory';
import { GetAdminMeUseCase } from '../../../../src/application/admin/get-admin-me.use-case';
import { IUserRepository, UserRole, ActivationStatus } from '@evaluateme/domain';
import { ForbiddenError, NotFoundError } from '../../../../src/infrastructure/errors/app-error';

describe('GetAdminMeUseCase', () => {
  let useCase: GetAdminMeUseCase;
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
      providers: [
        GetAdminMeUseCase,
        { provide: IUserRepository, useValue: userRepository },
      ],
    });

    useCase = module.get<GetAdminMeUseCase>(GetAdminMeUseCase);
  });

  it('returns admin profile for an admin user', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      activationStatus: ActivationStatus.ACTIVE,
      passwordHash: 'hashed',
    } as never);

    const result = await useCase.execute('admin-1');

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      id: 'admin-1',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    });
  });

  it('throws NotFoundError for unknown user', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toThrow(NotFoundError);
  });

  it('throws ForbiddenError for non-admin user', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      role: UserRole.USER,
      activationStatus: ActivationStatus.ACTIVE,
      passwordHash: 'hashed',
    } as never);

    await expect(useCase.execute('user-1')).rejects.toThrow(ForbiddenError);
  });
});
