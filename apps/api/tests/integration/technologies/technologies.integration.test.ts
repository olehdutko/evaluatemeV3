import request from 'supertest';
import { createTestApp } from '../test-app.factory';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { technologyResponseSchema } from '../../../src/lib/schemas/technology';

describe('GET /api/v1/technologies', () => {
  let app: NestExpressApplication | undefined;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('returns a list of technologies', async () => {
    if (!app) {
      return;
    }
    const response = await request(app.getHttpServer())
      .get('/api/v1/technologies')
      .expect(200);

    const parsed = technologyResponseSchema.safeParse(response.body);
    expect(parsed.success).toBe(true);
  });
});
