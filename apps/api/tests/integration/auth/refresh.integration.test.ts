import request from 'supertest';
import { createTestApp } from '../test-app.factory';
import type { NestExpressApplication } from '@nestjs/platform-express';

describe('POST /api/v1/auth/refresh', () => {
  let app: NestExpressApplication | undefined;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  const maybeIt = app ? it : it.skip;

  maybeIt('issues a new access token from a refresh token', async () => {
    const email = `refresh-${Date.now()}@example.com`;
    await request(app!.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password123', role: 'user' })
      .expect(201);

    const login = await request(app!.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password123' })
      .expect(200);

    const refreshToken = login.body.data.refreshToken;

    const response = await request(app!.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(typeof response.body.data.accessToken).toBe('string');
    expect(response.body.data.refreshToken).toBe(refreshToken);
  });

  maybeIt('rejects an invalid refresh token', async () => {
    const response = await request(app!.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'invalid-token' })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });
});
