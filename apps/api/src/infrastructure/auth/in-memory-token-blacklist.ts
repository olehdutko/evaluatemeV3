import { Injectable } from '@nestjs/common';
import { ITokenBlacklist } from '@evaluateme/domain';

@Injectable()
export class InMemoryTokenBlacklist implements ITokenBlacklist {
  private readonly tokens = new Set<string>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  add(token: string, _expiresAt?: number): Promise<void> {
    this.tokens.add(token);
    return Promise.resolve();
  }

  has(token: string): Promise<boolean> {
    return Promise.resolve(this.tokens.has(token));
  }
}
