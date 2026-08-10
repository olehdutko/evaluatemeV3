import { Injectable } from '@nestjs/common';
import { sign, verify, SignOptions } from 'jsonwebtoken';
import { IJwtStrategy, ITokenPayload } from '@evaluateme/domain';
import { getAppConfig } from '../config/app-config';

type StringValue = `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`;

@Injectable()
export class JwtStrategyAdapter implements IJwtStrategy {
  async sign(payload: ITokenPayload, expiresIn?: string): Promise<string> {
    const options: SignOptions = {};
    if (expiresIn) {
      options.expiresIn = expiresIn as StringValue;
    }
    const config = getAppConfig();
    return sign(payload, this.secretForType(config, payload.type), options);
  }

  async verify(token: string): Promise<ITokenPayload> {
    const config = getAppConfig();
    let payload: ITokenPayload;
    try {
      payload = verify(token, config.jwtSecret) as ITokenPayload;
    } catch {
      payload = verify(token, config.jwtRefreshSecret) as ITokenPayload;
    }
    return payload;
  }

  private secretForType(config: ReturnType<typeof getAppConfig>, type: ITokenPayload['type']): string {
    return type === 'refresh' ? config.jwtRefreshSecret : config.jwtSecret;
  }
}
