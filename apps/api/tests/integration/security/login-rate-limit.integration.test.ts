import request from 'supertest';
import { createTestApp } from '../test-app.factory';
import type { NestExpressApplication } from '@nestjs/platform-express';

describe('POST /api/v1/auth/login rate limiting', () => {
  let app: NestExpressApplication | undefined;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('blocks requests after the configured limit', async () => {
    if (!app) {
      return;
    }

    for (let i = 0; i < 5; i += 1) {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'rate-limit@test.com', password: 'wrong' })
        .expect(401);
    }

    const blocked = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'rate-limit@test.com', password: 'wrong' });

    expect(blocked.status).toBe(429);
    expect(blocked.body.success).toBe(false);
    expect(blocked.body.error.code).toBe('TOO_MANY_REQUESTS');
  });
});
