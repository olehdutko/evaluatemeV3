import request from 'supertest';
import { createTestApp } from './test-app.factory';
import type { NestExpressApplication } from '@nestjs/platform-express';

// Validates ADR-004: all routes are under /api/v1
describe('API versioning', () => {
  let app: NestExpressApplication | undefined;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('all registered controllers expose routes under /api/v1', async () => {
    if (!app) {
      return;
    }
    const server = app.getHttpServer();

    await request(server).get('/api/v1/health').expect(200);
    await request(server).get('/api/v1/technologies').expect(200);

    const unversionedHealth = await request(server).get('/health');
    expect(unversionedHealth.status).toBeGreaterThanOrEqual(300);
    expect(unversionedHealth.status).not.toBe(200);
  });
});
