import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, IPasswordHasher, ICreditSettingRepository, User, UserRole, ActivationStatus } from '@evaluateme/domain';
import { BadRequestError, ConflictError } from '../../infrastructure/errors/app-error';

const DEFAULT_BONUS_CREDITS = 10;
const BONUS_CREDITS_KEY = 'bonus_credits_new_user';

export interface RegisterInput {
  email: string;
  password: string;
  role: UserRole;
  username?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  birthDate?: string;
  country?: string;
  city?: string;
  phone?: string;
}

export interface RegisterOutput {
  id: string;
  email: string;
  username: string | null;
  role: UserRole;
  activationStatus: ActivationStatus;
  credits: number;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  birthDate: string | null;
  country: string | null;
  city: string | null;
  phone: string | null;
  createdAt: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject(IPasswordHasher) private readonly passwordHasher: IPasswordHasher,
    @Inject(ICreditSettingRepository) private readonly creditSettingRepository: ICreditSettingRepository,
  ) {}

  async execute(input: RegisterInput): Promise<{ success: true; data: RegisterOutput }> {
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

    const isCompany = input.role === UserRole.COMPANY;
    const companyName = isCompany ? input.companyName?.trim() ?? null : null;

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
      firstName: isCompany ? companyName : input.firstName?.trim() ?? null,
      lastName: isCompany ? null : input.lastName?.trim() ?? null,
      middleName: isCompany ? null : input.middleName?.trim() ?? null,
      birthDate: isCompany ? null : (input.birthDate ? new Date(input.birthDate) : null),
      country: input.country?.trim() ?? null,
      city: input.city?.trim() ?? null,
      phone: input.phone?.trim() ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.userRepository.save(user);

    return {
      success: true,
      data: this.toRegisterOutput(saved),
    };
  }

  private toRegisterOutput(saved: User): RegisterOutput {
    const isCompany = saved.role === UserRole.COMPANY;
    return {
      id: saved.id,
      email: saved.email,
      username: saved.username,
      role: saved.role,
      activationStatus: saved.activationStatus,
      credits: saved.credits,
      companyName: isCompany ? saved.firstName : null,
      firstName: isCompany ? null : saved.firstName,
      lastName: saved.lastName,
      middleName: saved.middleName,
      birthDate: saved.birthDate ? saved.birthDate.toISOString().split('T')[0] : null,
      country: saved.country,
      city: saved.city,
      phone: saved.phone,
      createdAt: saved.createdAt.toISOString(),
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
