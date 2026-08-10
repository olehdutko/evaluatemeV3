import { createTestApp } from '../test-app.factory';
import { PrismaService } from '../../../src/infrastructure/prisma/prisma.service';
import type { NestExpressApplication } from '@nestjs/platform-express';

describe('Legacy table read-only access', () => {
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

  it('can read from legacy tables without writing', async () => {
    if (!app) {
      return;
    }

    const prisma = app.get(PrismaService);

    const users = await prisma.legacyUser.findMany({ take: 1 });
    const companies = await prisma.legacyCompany.findMany({ take: 1 });
    const students = await prisma.legacyStudent.findMany({ take: 1 });
    const results = await prisma.legacyResult.findMany({ take: 1 });
    const candidates = await prisma.legacyCandidate.findMany({ take: 1 });
    const candidateResults = await prisma.legacyCandidateResult.findMany({ take: 1 });

    expect(Array.isArray(users)).toBe(true);
    expect(Array.isArray(companies)).toBe(true);
    expect(Array.isArray(students)).toBe(true);
    expect(Array.isArray(results)).toBe(true);
    expect(Array.isArray(candidates)).toBe(true);
    expect(Array.isArray(candidateResults)).toBe(true);
  });
});
