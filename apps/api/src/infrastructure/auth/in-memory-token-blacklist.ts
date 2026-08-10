import { Injectable } from '@nestjs/common';
import { ITokenBlacklist } from '@evaluateme/domain';

@Injectable()
export class InMemoryTokenBlacklist implements ITokenBlacklist {
  private readonly tokens = new Set<string>();

  async add(token: string, _expiresAt?: number): Promise<void> {
    this.tokens.add(token);
  }

  async has(token: string): Promise<boolean> {
    return this.tokens.has(token);
  }
}
