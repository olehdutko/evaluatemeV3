import request from 'supertest';
import { createTestApp } from '../test-app.factory';
import type { NestExpressApplication } from '@nestjs/platform-express';

describe('POST /api/v1/auth/logout', () => {
  let app: NestExpressApplication | undefined;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  const maybeIt = app ? it : it.skip;

  maybeIt('logs out and revokes refresh token', async () => {
    const email = `logout-${Date.now()}@example.com`;
    await request(app!.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password123', role: 'user' })
      .expect(201);

    const login = await request(app!.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password123' })
      .expect(200);

    const refreshToken = login.body.data.refreshToken;

    await request(app!.getHttpServer())
      .post('/api/v1/auth/logout')
      .send({ refreshToken })
      .expect(200);

    const response = await request(app!.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });
});
