import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '@evaluateme/domain';
import { ConflictError, NotFoundError } from '../../infrastructure/errors/app-error';

export interface UpdateProfileInput {
  userId: string;
  email?: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  birthDate?: string | null;
  country?: string | null;
  city?: string | null;
  phone?: string | null;
}

export interface UpdateProfileOutput {
  id: string;
  email: string;
  username: string | null;
  role: string;
  credits: number;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  birthDate: string | null;
  country: string | null;
  city: string | null;
  phone: string | null;
  updatedAt: string;
}

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: UpdateProfileInput): Promise<{ success: true; data: UpdateProfileOutput }> {
    const existing = await this.userRepository.findById(input.userId);
    if (!existing) {
      throw new NotFoundError('User', input.userId);
    }

    const normalizedEmail = input.email?.trim().toLowerCase();
    const normalizedUsername = input.username?.trim() || null;

    if (normalizedEmail && normalizedEmail !== existing.email) {
      const duplicate = await this.userRepository.findByEmail(normalizedEmail);
      if (duplicate && duplicate.id !== existing.id) {
        throw new ConflictError('A user with this email already exists.');
      }
    }

    if (normalizedUsername && normalizedUsername !== existing.username) {
      const duplicate = await this.userRepository.findByUsername?.(normalizedUsername) ?? null;
      if (duplicate && duplicate.id !== existing.id) {
        throw new ConflictError('A user with this username already exists.');
      }
    }

    const saved = await this.userRepository.save({
      ...existing,
      email: normalizedEmail ?? existing.email,
      username: normalizedUsername ?? existing.username,
      firstName: input.firstName === undefined ? existing.firstName : input.firstName?.trim() || null,
      lastName: input.lastName === undefined ? existing.lastName : input.lastName?.trim() || null,
      middleName: input.middleName === undefined ? existing.middleName : input.middleName?.trim() || null,
      birthDate: input.birthDate === undefined ? existing.birthDate : (input.birthDate ? new Date(input.birthDate) : null),
      country: input.country === undefined ? existing.country : input.country?.trim() || null,
      city: input.city === undefined ? existing.city : input.city?.trim() || null,
      phone: input.phone === undefined ? existing.phone : input.phone?.trim() || null,
      updatedAt: new Date(),
    });

    return {
      success: true,
      data: {
        id: saved.id,
        email: saved.email,
        username: saved.username,
        role: saved.role,
        credits: saved.credits,
        firstName: saved.firstName,
        lastName: saved.lastName,
        middleName: saved.middleName,
        birthDate: saved.birthDate ? saved.birthDate.toISOString().split('T')[0] : null,
        country: saved.country,
        city: saved.city,
        phone: saved.phone,
        updatedAt: saved.updatedAt.toISOString(),
      },
    };
  }
}
