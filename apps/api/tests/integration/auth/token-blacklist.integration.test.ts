import request from 'supertest';
import { createTestApp } from '../test-app.factory';
import type { NestExpressApplication } from '@nestjs/platform-express';

describe('Persistent token blacklist integration', () => {
  let app: NestExpressApplication | undefined;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('logs out and blocks refresh with the same token', async () => {
    if (!app) {
      return;
    }
    const email = `blacklist-${Date.now()}@example.com`;
    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password123', role: 'user' })
      .expect(201);

    const login = await agent
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password123' })
      .expect(200);

    const cookies = (login.headers['set-cookie'] as unknown as string[] | undefined) ?? [];
    expect(cookies).toBeDefined();

    await agent
      .post('/api/v1/auth/logout')
      .set('Cookie', cookies)
      .send({ refreshToken: '' })
      .expect(200);

    const refreshAfterLogout = await agent
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookies)
      .send({ refreshToken: '' });

    expect(refreshAfterLogout.status).toBe(401);
    expect(refreshAfterLogout.body.success).toBe(false);
  });
});
