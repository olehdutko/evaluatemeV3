import { Injectable, CanActivate, ExecutionContext, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { IRateLimitStore } from '@evaluateme/domain';

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  limit: 10,
  windowMs: 60 * 1000, // 1 minute
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(@Inject(IRateLimitStore) private readonly store: IRateLimitStore) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const options = this.getOptions(context) ?? DEFAULT_OPTIONS;
    const key = this.resolveKey(request);

    const record = await this.store.record(key, options.windowMs, options.limit);
    if (record.count > options.limit) {
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }

  private resolveKey(request: Request): string {
    return (request.ip ?? request.socket?.remoteAddress ?? 'unknown').toString();
  }

  private getOptions(context: ExecutionContext): RateLimitOptions | undefined {
    return Reflect.getMetadata('rateLimit', context.getHandler()) as RateLimitOptions | undefined;
  }
}

export const RateLimit = (options: Partial<RateLimitOptions> = {}) => {
  return (_target: object, _propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('rateLimit', { ...DEFAULT_OPTIONS, ...options }, descriptor.value);
    return descriptor;
  };
};
