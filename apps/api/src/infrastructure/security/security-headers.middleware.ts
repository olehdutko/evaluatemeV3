import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(_request: Request, response: Response, next: NextFunction): void {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('X-XSS-Protection', '1; mode=block');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader(
      'Content-Security-Policy',
      "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
    );
    response.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  }
}
