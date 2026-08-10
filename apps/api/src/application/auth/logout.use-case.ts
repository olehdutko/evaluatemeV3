import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  IJwtStrategy,
  ITokenBlacklist,
  ITokenPayload,
} from '@evaluateme/domain';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(IJwtStrategy)
    private readonly jwtStrategy: IJwtStrategy,
    @Inject(ITokenBlacklist)
    private readonly blacklist: ITokenBlacklist,
  ) {}

  async execute(refreshToken: string): Promise<void> {
    let payload: ITokenPayload;
    try {
      payload = await this.jwtStrategy.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    await this.blacklist.add(refreshToken, payload.exp);
  }
}
