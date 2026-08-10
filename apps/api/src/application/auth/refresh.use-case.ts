import { Inject, Injectable } from '@nestjs/common';
import {
  IJwtStrategy,
  ITokenBlacklist,
  ITokenPayload,
  AuthTokens,
} from '@evaluateme/domain';
import { UnauthorizedError } from '../../infrastructure/errors/app-error';

const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60;

@Injectable()
export class RefreshUseCase {
  constructor(
    @Inject(IJwtStrategy) private readonly jwtStrategy: IJwtStrategy,
    @Inject(ITokenBlacklist) private readonly blacklist: ITokenBlacklist,
  ) {}

  async execute(refreshToken: string): Promise<{ success: true; data: AuthTokens }> {
    let payload: ITokenPayload;
    try {
      payload = await this.jwtStrategy.verify(refreshToken);
    } catch {
      throw new UnauthorizedError();
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedError();
    }

    const blacklisted = await this.blacklist.has(refreshToken);
    if (blacklisted) {
      throw new UnauthorizedError();
    }

    const accessToken = await this.jwtStrategy.sign(
      {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        type: 'access',
      },
      `${ACCESS_TOKEN_EXPIRY_SECONDS}s`,
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
