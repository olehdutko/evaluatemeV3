import { createUnitTestModule } from '../../test-module.factory';
import { ChangePasswordUseCase } from '../../../../src/application/auth/change-password.use-case';
import { IUserRepository, IPasswordHasher, IEmailService, IEmailTemplateRepository } from '@evaluateme/domain';

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
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
      verify: jest.fn().mockResolvedValue(true),
      isLegacyHash: jest.fn(),
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
        ChangePasswordUseCase,
        { provide: IUserRepository, useValue: userRepository },
        { provide: IPasswordHasher, useValue: passwordHasher },
        { provide: IEmailService, useValue: emailService },
        { provide: IEmailTemplateRepository, useValue: emailTemplateRepository },
      ],
    });

    useCase = module.get<ChangePasswordUseCase>(ChangePasswordUseCase);
  });

  it('changes password and sends email notification', async () => {
    const user = {
      id: 'user-1',
      email: 'user@example.com',
      username: 'User',
      passwordHash: 'old-hash',
    };
    userRepository.findById.mockResolvedValue(user as never);

    const result = await useCase.execute({
      userId: 'user-1',
      currentPassword: 'OldPass1!',
      newPassword: 'NewStrong1!abc',
      confirmPassword: 'NewStrong1!abc',
    });

    expect(result.success).toBe(true);
    expect(passwordHasher.hash).toHaveBeenCalledWith('NewStrong1!abc');
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(emailService.send).toHaveBeenCalledTimes(1);
    expect(emailService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Your EvaluateMe.IT password was changed',
      }),
    );
  });

  it('rejects weak passwords', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        currentPassword: 'OldPass1!',
        newPassword: 'weak',
        confirmPassword: 'weak',
      }),
    ).rejects.toThrow('Request validation failed.');
  });

  it('rejects mismatched confirmation', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        currentPassword: 'OldPass1!',
        newPassword: 'NewStrong1!abc',
        confirmPassword: 'Different1!abc',
      }),
    ).rejects.toThrow('Request validation failed.');
  });

  it('rejects incorrect current password', async () => {
    passwordHasher.verify.mockResolvedValue(false);
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'old-hash',
    } as never);

    await expect(
      useCase.execute({
        userId: 'user-1',
        currentPassword: 'WrongPass1!',
        newPassword: 'NewStrong1!abc',
        confirmPassword: 'NewStrong1!abc',
      }),
    ).rejects.toThrow('Current password is incorrect.');
  });
});
