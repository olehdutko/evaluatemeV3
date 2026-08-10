import request from 'supertest';
import { createTestApp } from '../test-app.factory';
import type { NestExpressApplication } from '@nestjs/platform-express';

describe('POST /api/v1/auth/register', () => {
  let app: NestExpressApplication | undefined;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  const maybeIt = app ? it : it.skip;

  maybeIt('registers a new user', async () => {
    const email = `register-${Date.now()}@example.com`;
    const response = await request(app!.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password123', role: 'user' })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(email);
    expect(response.body.data.role).toBe('user');
  });

  maybeIt('rejects duplicate emails', async () => {
    const email = `dup-${Date.now()}@example.com`;
    await request(app!.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password123', role: 'user' })
      .expect(201);

    const response = await request(app!.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password123', role: 'user' })
      .expect(409);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('CONFLICT');
  });
});
