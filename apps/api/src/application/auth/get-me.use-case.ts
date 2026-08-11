import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '@evaluateme/domain';
import { UnauthorizedError } from '../../infrastructure/errors/app-error';

export interface AuthMeDto {
  id: string;
  email: string;
  username: string | null;
  role: string;
  credits: number;
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
      },
    };
  }
}
