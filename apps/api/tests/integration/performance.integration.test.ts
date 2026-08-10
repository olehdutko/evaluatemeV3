import request from 'supertest';
import { createTestApp } from './test-app.factory';
import type { NestExpressApplication } from '@nestjs/platform-express';

const SAMPLES = 100;

describe('GET /api/v1/health performance', () => {
  let app: NestExpressApplication | undefined;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it(`responds within 200 ms for ${SAMPLES} sequential requests`, async () => {
    if (!app) {
      return;
    }
    const server = app.getHttpServer();
    const times: number[] = [];

    for (let i = 0; i < SAMPLES; i += 1) {
      const start = Date.now();
      await request(server).get('/api/v1/health').expect(200);
      times.push(Date.now() - start);
    }

    times.sort((a, b) => a - b);
    const p95Index = Math.ceil((SAMPLES * 95) / 100) - 1;
    const p95 = times[p95Index];

    expect(p95).toBeLessThan(200);
  });
});
