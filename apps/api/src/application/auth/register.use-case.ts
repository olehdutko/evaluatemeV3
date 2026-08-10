import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, IPasswordHasher, User, UserRole, ActivationStatus } from '@evaluateme/domain';
import { BadRequestError, ConflictError } from '../../infrastructure/errors/app-error';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject(IPasswordHasher) private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: {
    email: string;
    password: string;
    role: UserRole;
  }): Promise<{ success: true; data: { id: string; email: string; role: UserRole; activationStatus: ActivationStatus; createdAt: string } }> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('A user with this email already exists.');
    }

    if (input.password.length < 8) {
      throw new BadRequestError({ password: ['Password must be at least 8 characters'] });
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const now = new Date();

    const user: User = {
      id: crypto.randomUUID(),
      email: input.email,
      passwordHash,
      legacyMd5Hash: null,
      role: input.role,
      activationStatus: ActivationStatus.PENDING,
      companyProfileId: null,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.userRepository.save(user);

    return {
      success: true,
      data: {
        id: saved.id,
        email: saved.email,
        role: saved.role,
        activationStatus: saved.activationStatus,
        createdAt: saved.createdAt.toISOString(),
      },
    };
  }
}
