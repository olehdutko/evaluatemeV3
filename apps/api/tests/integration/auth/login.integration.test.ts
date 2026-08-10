import request from 'supertest';
import { createTestApp } from '../test-app.factory';
import type { NestExpressApplication } from '@nestjs/platform-express';

describe('POST /api/v1/auth/login', () => {
  let app: NestExpressApplication | undefined;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  const maybeIt = app ? it : it.skip;

  maybeIt('returns tokens for valid credentials', async () => {
    const email = `login-${Date.now()}@example.com`;
    await request(app!.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password123', role: 'user' })
      .expect(201);

    const response = await request(app!.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password123' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(typeof response.body.data.accessToken).toBe('string');
    expect(typeof response.body.data.refreshToken).toBe('string');
    expect(response.body.data.expiresInSeconds).toBe(15 * 60);
  });

  maybeIt('rejects invalid credentials', async () => {
    const response = await request(app!.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'noone@example.com', password: 'Password123' })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });
});
