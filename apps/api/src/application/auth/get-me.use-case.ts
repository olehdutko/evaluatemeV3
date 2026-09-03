import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '@evaluateme/domain';
import { UnauthorizedError } from '../../infrastructure/errors/app-error';

export interface AuthMeDto {
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
}

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<{ success: true; data: AuthMeDto }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError();
    }

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        credits: user.credits,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : null,
        country: user.country,
        city: user.city,
        phone: user.phone,
      },
    };
  }
}
