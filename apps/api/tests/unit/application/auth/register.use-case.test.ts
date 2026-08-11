import { createUnitTestModule } from '../../test-module.factory';
import { RegisterUseCase } from '../../../../src/application/auth/register.use-case';
import { IUserRepository, IPasswordHasher, ICreditSettingRepository, UserRole, ActivationStatus } from '@evaluateme/domain';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
  let creditSettingRepository: jest.Mocked<ICreditSettingRepository>;

  beforeEach(async () => {
    userRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      save: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    };
    passwordHasher = {
      hash: jest.fn().mockResolvedValue('hashed-password'),
      verify: jest.fn(),
      isLegacyHash: jest.fn(),
    };
    creditSettingRepository = {
      findByKey: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
      findAll: jest.fn(),
    };

    const module = await createUnitTestModule({
      providers: [
        RegisterUseCase,
        { provide: IUserRepository, useValue: userRepository },
        { provide: IPasswordHasher, useValue: passwordHasher },
        { provide: ICreditSettingRepository, useValue: creditSettingRepository },
      ],
    });

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
  });

  it('creates a new user', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute({
      email: 'user@example.com',
      password: 'Password123',
      role: UserRole.USER,
    });

    expect(result.success).toBe(true);
    expect(result.data.email).toBe('user@example.com');
    expect(result.data.username).toBeNull();
    expect(result.data.role).toBe('user');
    expect(result.data.activationStatus).toBe(ActivationStatus.PENDING);
    expect(result.data.credits).toBe(10);
    expect(userRepository.save).toHaveBeenCalledTimes(1);
  });

  it('rejects duplicate emails', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'existing',
      email: 'user@example.com',
    } as never);

    await expect(
      useCase.execute({ email: 'user@example.com', password: 'Password123', role: UserRole.USER }),
    ).rejects.toThrow('A user with this email already exists.');
  });

  it('rejects short passwords', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'user@example.com', password: 'short', role: UserRole.USER }),
    ).rejects.toThrow('Request validation failed.');
  });
});
