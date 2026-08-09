import request from 'supertest';
import { createTestApp } from './test-app.factory';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { HealthResponse } from '../../src/lib/schemas/health.schema';

describe('GET /api/v1/health', () => {
  let app: NestExpressApplication | undefined;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      return;
    }
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('returns 200 with valid health envelope', async () => {
    if (!app) {
      return;
    }
    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);

    const body = response.body as HealthResponse;
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('ok');
    expect(['ok', 'error']).toContain(body.data.database);
    expect(typeof body.data.latencyMs).toBe('number');
    expect(typeof body.data.timestamp).toBe('string');
  });

  it('responds within p95 <200 ms over 10 warm-up requests', async () => {
    if (!app) {
      return;
    }
    const latencies: number[] = [];
    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      await request(app.getHttpServer()).get('/api/v1/health');
      latencies.push(Date.now() - start);
    }
    latencies.sort((a, b) => a - b);
    const p95Index = Math.ceil(latencies.length * 0.95) - 1;
    expect(latencies[p95Index]).toBeLessThan(200);
  });
});
