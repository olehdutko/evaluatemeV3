import { createUnitTestModule } from '../../test-module.factory';
import { LoginUseCase } from '../../../../src/application/auth/login.use-case';
import { IUserRepository, IPasswordHasher, IJwtStrategy, UserRole, ActivationStatus } from '@evaluateme/domain';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
  let jwtStrategy: jest.Mocked<IJwtStrategy>;

  beforeEach(async () => {
    userRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
    passwordHasher = {
      hash: jest.fn(),
      verify: jest.fn().mockResolvedValue(true),
      isLegacyHash: jest.fn(),
    };
    jwtStrategy = {
      sign: jest.fn().mockResolvedValue('jwt-token'),
      verify: jest.fn(),
    };

    const module = await createUnitTestModule({
      providers: [
        LoginUseCase,
        { provide: IUserRepository, useValue: userRepository },
        { provide: IPasswordHasher, useValue: passwordHasher },
        { provide: IJwtStrategy, useValue: jwtStrategy },
      ],
    });

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  it('returns tokens for valid user credentials', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'hashed',
      role: UserRole.USER,
      activationStatus: ActivationStatus.ACTIVE,
    } as never);

    const result = await useCase.execute({ email: 'user@example.com', password: 'Password123' });

    expect(result.success).toBe(true);
    expect(result.data.accessToken).toBe('jwt-token');
    expect(result.data.refreshToken).toBe('jwt-token');
    expect(result.data.expiresInSeconds).toBe(15 * 60);
  });

  it('rejects invalid credentials', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'user@example.com', password: 'Password123' }),
    ).rejects.toThrow('Missing or invalid authentication.');
  });

  it('rejects suspended users', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'hashed',
      role: UserRole.USER,
      activationStatus: ActivationStatus.SUSPENDED,
    } as never);

    await expect(
      useCase.execute({ email: 'user@example.com', password: 'Password123' }),
    ).rejects.toThrow('Missing or invalid authentication.');
  });

  it('rejects admin on public login when allowAdmin is false', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      passwordHash: 'hashed',
      role: UserRole.ADMIN,
      activationStatus: ActivationStatus.ACTIVE,
    } as never);

    await expect(
      useCase.execute({ email: 'admin@example.com', password: 'Password123' }, { allowAdmin: false }),
    ).rejects.toThrow('Authenticated but not authorized.');
  });

  it('rejects non-admin on admin-only login', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'hashed',
      role: UserRole.USER,
      activationStatus: ActivationStatus.ACTIVE,
    } as never);

    await expect(
      useCase.execute({ email: 'user@example.com', password: 'Password123' }, { allowAdmin: true }),
    ).rejects.toThrow('Authenticated but not authorized.');
  });

  it('returns tokens for valid admin credentials on admin-only login', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      passwordHash: 'hashed',
      role: UserRole.ADMIN,
      activationStatus: ActivationStatus.ACTIVE,
    } as never);

    const result = await useCase.execute({ email: 'admin@example.com', password: 'Password123' }, { allowAdmin: true });

    expect(result.success).toBe(true);
    expect(result.data.accessToken).toBe('jwt-token');
  });
});
