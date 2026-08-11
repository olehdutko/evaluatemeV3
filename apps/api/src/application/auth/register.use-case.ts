import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, IPasswordHasher, ICreditSettingRepository, User, UserRole, ActivationStatus } from '@evaluateme/domain';
import { BadRequestError, ConflictError } from '../../infrastructure/errors/app-error';

const DEFAULT_BONUS_CREDITS = 10;
const BONUS_CREDITS_KEY = 'bonus_credits_new_user';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject(IPasswordHasher) private readonly passwordHasher: IPasswordHasher,
    @Inject(ICreditSettingRepository) private readonly creditSettingRepository: ICreditSettingRepository,
  ) {}

  async execute(input: {
    email: string;
    password: string;
    role: UserRole;
    username?: string;
  }): Promise<{ success: true; data: { id: string; email: string; username: string | null; role: UserRole; activationStatus: ActivationStatus; credits: number; createdAt: string } }> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('A user with this email already exists.');
    }

    if (input.password.length < 8) {
      throw new BadRequestError({ password: ['Password must be at least 8 characters'] });
    }

    const normalizedUsername = input.username?.trim() || null;
    if (normalizedUsername) {
      const existingByUsername = await this.userRepository.findByUsername?.(normalizedUsername) ?? null;
      if (existingByUsername) {
        throw new ConflictError('A user with this username already exists.');
      }
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const initialCredits = await this.resolveInitialCredits();
    const now = new Date();

    const user: User = {
      id: crypto.randomUUID(),
      email: input.email,
      username: normalizedUsername,
      passwordHash,
      legacyMd5Hash: null,
      role: input.role,
      activationStatus: ActivationStatus.PENDING,
      companyProfileId: null,
      credits: initialCredits,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.userRepository.save(user);

    return {
      success: true,
      data: {
        id: saved.id,
        email: saved.email,
        username: saved.username,
        role: saved.role,
        activationStatus: saved.activationStatus,
        credits: saved.credits,
        createdAt: saved.createdAt.toISOString(),
      },
    };
  }

  private async resolveInitialCredits(): Promise<number> {
    const setting = await this.creditSettingRepository.findByKey(BONUS_CREDITS_KEY);
    if (!setting) {
      return DEFAULT_BONUS_CREDITS;
    }
    const parsed = Number(setting.value);
    return Number.isNaN(parsed) || parsed < 0 ? DEFAULT_BONUS_CREDITS : parsed;
  }
}
