import { createUnitTestModule } from '../../test-module.factory';
import { ResetPasswordUseCase } from '../../../../src/application/auth/reset-password.use-case';
import { IUserRepository, IPasswordHasher, IPasswordResetTokenRepository, IEmailService, IEmailTemplateRepository } from '@evaluateme/domain';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
  let tokenRepository: jest.Mocked<IPasswordResetTokenRepository>;
  let emailService: jest.Mocked<IEmailService>;
  let emailTemplateRepository: jest.Mocked<IEmailTemplateRepository>;

  beforeEach(async () => {
    userRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      save: jest.fn().mockImplementation((user) => Promise.resolve({ ...user, updatedAt: new Date() })),
    };
    passwordHasher = {
      hash: jest.fn().mockResolvedValue('new-hash'),
      verify: jest.fn(),
      isLegacyHash: jest.fn(),
    };
    tokenRepository = {
      findByTokenHash: jest.fn(),
      save: jest.fn().mockImplementation((token) => Promise.resolve(token)),
    };
    emailService = { send: jest.fn().mockResolvedValue(undefined) };
    emailTemplateRepository = {
      findAll: jest.fn(),
      findByName: jest.fn().mockResolvedValue(null),
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module = await createUnitTestModule({
      providers: [
        ResetPasswordUseCase,
        { provide: IUserRepository, useValue: userRepository },
        { provide: IPasswordHasher, useValue: passwordHasher },
        { provide: IPasswordResetTokenRepository, useValue: tokenRepository },
        { provide: IEmailService, useValue: emailService },
        { provide: IEmailTemplateRepository, useValue: emailTemplateRepository },
      ],
    });

    useCase = module.get<ResetPasswordUseCase>(ResetPasswordUseCase);
  });

  it('resets password with a valid token', async () => {
    const tokenHash = require('crypto').createHash('sha256').update('valid-token').digest('hex');
    tokenRepository.findByTokenHash.mockResolvedValue({
      id: 'token-1',
      userId: 'user-1',
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      usedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      username: 'User',
      passwordHash: 'old-hash',
    } as never);

    const result = await useCase.execute({
      token: 'valid-token',
      newPassword: 'NewStrong1!abc',
      confirmPassword: 'NewStrong1!abc',
    });

    expect(result.success).toBe(true);
    expect(passwordHasher.hash).toHaveBeenCalledWith('NewStrong1!abc');
    expect(tokenRepository.save).toHaveBeenCalledWith(expect.objectContaining({ usedAt: expect.any(Date) }));
    expect(emailService.send).toHaveBeenCalledTimes(1);
  });

  it('rejects weak passwords', async () => {
    await expect(
      useCase.execute({
        token: 'valid-token',
        newPassword: 'weak',
        confirmPassword: 'weak',
      }),
    ).rejects.toThrow('Request validation failed.');
  });

  it('rejects expired tokens', async () => {
    const { createHash } = await import('crypto');
    const rawToken = 'expired-token';
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    tokenRepository.findByTokenHash.mockResolvedValue({
      id: 'token-1',
      userId: 'user-1',
      tokenHash,
      expiresAt: new Date(Date.now() - 1000),
      usedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      useCase.execute({
        token: rawToken,
        newPassword: 'NewStrong1!abc',
        confirmPassword: 'NewStrong1!abc',
      }),
    ).rejects.toThrow('Request validation failed.');
  });
});
