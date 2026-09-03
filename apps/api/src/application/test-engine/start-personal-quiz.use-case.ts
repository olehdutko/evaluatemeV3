import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRepository,
  ICreditSettingRepository,
  UserRole,
} from '@evaluateme/domain';
import { NotFoundError, ForbiddenError, PaymentRequiredError } from '../../infrastructure/errors/app-error';

const DEFAULT_TEST_PRICE_CREDITS = 1;
const TEST_PRICE_KEY = 'test_price_credits';

export interface StartPersonalQuizResult {
  reserved: true;
  price: number;
  remainingCredits: number;
}

@Injectable()
export class StartPersonalQuizUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject(ICreditSettingRepository) private readonly creditSettingRepository: ICreditSettingRepository,
  ) {}

  async execute(userId: string): Promise<{ success: true; data: StartPersonalQuizResult }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('user');
    }

    if (user.role !== UserRole.USER) {
      throw new ForbiddenError('Only personal accounts can start this quiz.');
    }

    const price = await this.resolveTestPrice();

    if (price > 0 && user.credits < price) {
      throw new PaymentRequiredError('Insufficient credits to start a test. Please purchase more credits.');
    }

    let remainingCredits = user.credits;
    if (price > 0) {
      const updated = await this.userRepository.save({
        ...user,
        credits: user.credits - price,
        updatedAt: new Date(),
      });
      remainingCredits = updated.credits;
    }

    return {
      success: true,
      data: {
        reserved: true,
        price,
        remainingCredits,
      },
    };
  }

  private async resolveTestPrice(): Promise<number> {
    const setting = await this.creditSettingRepository.findByKey(TEST_PRICE_KEY);
    if (!setting) {
      return DEFAULT_TEST_PRICE_CREDITS;
    }
    const parsed = Number(setting.value);
    return Number.isNaN(parsed) || parsed < 0 ? DEFAULT_TEST_PRICE_CREDITS : parsed;
  }
}
