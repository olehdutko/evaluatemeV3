import request from 'supertest';
import { createTestApp } from '../test-app.factory';
import type { NestExpressApplication } from '@nestjs/platform-express';

describe('Security headers integration', () => {
  let app: NestExpressApplication | undefined;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('returns required security headers on health endpoint', async () => {
    if (!app) {
      return;
    }
    const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(response.headers['content-security-policy']).toContain("default-src 'none'");
    expect(response.headers['permissions-policy']).toBe('geolocation=(), microphone=(), camera=()');
  });
});
