import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRepository,
  IPasswordHasher,
  IJwtStrategy,
  ITokenPayload,
  AuthTokens,
  ActivationStatus,
} from '@evaluateme/domain';
import { UnauthorizedError, BadRequestError } from '../../infrastructure/errors/app-error';

const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60;
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60;

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject(IPasswordHasher) private readonly passwordHasher: IPasswordHasher,
    @Inject(IJwtStrategy) private readonly jwtStrategy: IJwtStrategy,
  ) {}

  async execute(input: { email: string; password: string }): Promise<{ success: true; data: AuthTokens }> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError();
    }

    if (user.activationStatus === ActivationStatus.SUSPENDED) {
      throw new UnauthorizedError();
    }

    if (!user.passwordHash) {
      throw new BadRequestError({ password: ['Password must be reset after migration'] });
    }

    const valid = await this.passwordHasher.verify(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError();
    }

    const payload: ITokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const accessToken = await this.jwtStrategy.sign(payload, `${ACCESS_TOKEN_EXPIRY_SECONDS}s`);
    const refreshToken = await this.jwtStrategy.sign(
      { ...payload, type: 'refresh' },
      `${REFRESH_TOKEN_EXPIRY_SECONDS}s`,
    );

    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
        expiresInSeconds: ACCESS_TOKEN_EXPIRY_SECONDS,
      },
    };
  }
}
