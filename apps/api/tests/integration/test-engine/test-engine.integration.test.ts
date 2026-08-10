import request from 'supertest';
import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';
import { createTestApp } from '../test-app.factory';
import type { NestExpressApplication } from '@nestjs/platform-express';
import {
  startTestResponseSchema,
  testSessionStateResponseSchema,
  submitAnswerResponseSchema,
} from '../../../src/lib/schemas/test-engine.schema';

describe('Test engine integration', () => {
  let app: NestExpressApplication | undefined;
  let prisma: PrismaClient;
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    app = await createTestApp();
    if (!app) {
      return;
    }
    prisma = new PrismaClient();
    agent = request.agent(app.getHttpServer());
  });

  afterAll(async () => {
    await prisma?.$disconnect();
    await app?.close();
  });

  it('skips when no test database is available', () => {
    if (!app) {
      return;
    }
    expect(true).toBe(true);
  });

  describe('authenticated test flow', () => {
    const userEmail = `test-engine-${Date.now()}@example.com`;
    let userId: string;
    let technologyId: string;
    let testId: string;
    let questionId: string;
    let correctAnswerId: string;

    beforeAll(async () => {
      if (!app) {
        return;
      }
      const register = await agent
        .post('/api/v1/auth/register')
        .send({ email: userEmail, password: 'Password123', role: 'user' })
        .expect(201);
      userId = register.body.data.id;

      await agent
        .post('/api/v1/auth/login')
        .send({ email: userEmail, password: 'Password123' })
        .expect(200);

      technologyId = randomUUID();
      testId = randomUUID();
      questionId = randomUUID();
      correctAnswerId = randomUUID();

      await prisma.technology.create({
        data: { id: technologyId, name: 'Test Engine Tech', slug: `test-engine-tech-${Date.now()}`, description: null },
      });
      await prisma.test.create({
        data: { id: testId, title: 'Test Engine Test', technologyId, status: 'published', createdByUserId: userId },
      });
      await prisma.question.create({
        data: { id: questionId, testId, content: 'What is 2+2?', type: 'single', orderIndex: 0, score: 1 },
      });
      await prisma.answer.createMany({
        data: [
          { id: correctAnswerId, questionId, content: '4', isCorrect: true, orderIndex: 0 },
          { id: randomUUID(), questionId, content: '5', isCorrect: false, orderIndex: 1 },
        ],
      });
    });

    afterAll(async () => {
      if (!app) {
        return;
      }
      await prisma.userAnswer.deleteMany({ where: { questionId } }).catch(() => null);
      await prisma.testSession.deleteMany({ where: { testId } }).catch(() => null);
      await prisma.answer.deleteMany({ where: { questionId } }).catch(() => null);
      await prisma.question.deleteMany({ where: { testId } }).catch(() => null);
      await prisma.test.deleteMany({ where: { id: testId } }).catch(() => null);
      await prisma.technology.deleteMany({ where: { id: technologyId } }).catch(() => null);
      await prisma.user.deleteMany({ where: { email: userEmail } }).catch(() => null);
    });

    it('starts a test, answers the question, and completes with a score', async () => {
      if (!app) {
        return;
      }
      const slug = await prisma.technology.findUnique({ where: { id: technologyId }, select: { slug: true } }).then((t) => t?.slug ?? '');

      const start = await agent
        .post('/api/v1/tests/start')
        .send({ technologySlug: slug })
        .expect(201);

      const parsedStart = startTestResponseSchema.safeParse(start.body);
      expect(parsedStart.success).toBe(true);
      const sessionId = start.body.data.sessionId as string;
      expect(start.body.data.questions).toHaveLength(1);

      const state = await agent.get(`/api/v1/tests/${sessionId}`).expect(200);
      const parsedState = testSessionStateResponseSchema.safeParse(state.body);
      expect(parsedState.success).toBe(true);
      const answer = state.body.data.questions[0].answers.find((a: { content: string }) => a.content === '4');
      expect(answer).toBeDefined();

      const submit = await agent
        .post(`/api/v1/tests/${sessionId}/answer`)
        .send({ questionId, answerId: answer.id })
        .expect(200);

      const parsedSubmit = submitAnswerResponseSchema.safeParse(submit.body);
      expect(parsedSubmit.success).toBe(true);
      expect(submit.body.data.isComplete).toBe(true);
      expect(submit.body.data.currentScore).toBe(100);
    });
  });

  describe('candidate session flow', () => {
    let accessCodeId: string;
    let technologyId: string;
    let testId: string;
    let questionId: string;

    beforeAll(async () => {
      if (!app) {
        return;
      }
      technologyId = randomUUID();
      testId = randomUUID();
      questionId = randomUUID();
      accessCodeId = randomUUID();

      await prisma.technology.create({
        data: { id: technologyId, name: 'Candidate Tech', slug: `candidate-tech-${Date.now()}`, description: null },
      });
      await prisma.test.create({
        data: { id: testId, title: 'Candidate Test', technologyId, status: 'published', createdByUserId: randomUUID() },
      });
      await prisma.question.create({
        data: { id: questionId, testId, content: 'Q1', type: 'single', orderIndex: 0, score: 1 },
      });
      await prisma.answer.createMany({
        data: [
          { id: randomUUID(), questionId, content: 'A1', isCorrect: true, orderIndex: 0 },
          { id: randomUUID(), questionId, content: 'A2', isCorrect: false, orderIndex: 1 },
        ],
      });
      await prisma.accessCode.create({
        data: { id: accessCodeId, code: `CODE-${Date.now()}`, companyId: randomUUID(), testId, status: 'active' },
      });
    });

    afterAll(async () => {
      if (!app) {
        return;
      }
      await prisma.accessCode.deleteMany({ where: { id: accessCodeId } }).catch(() => null);
      await prisma.testSession.deleteMany({ where: { accessCodeId } }).catch(() => null);
      await prisma.userAnswer.deleteMany({ where: { questionId } }).catch(() => null);
      await prisma.answer.deleteMany({ where: { questionId } }).catch(() => null);
      await prisma.question.deleteMany({ where: { testId } }).catch(() => null);
      await prisma.test.deleteMany({ where: { id: testId } }).catch(() => null);
      await prisma.technology.deleteMany({ where: { id: technologyId } }).catch(() => null);
    });

    it('starts a candidate session for a valid access code', async () => {
      if (!app) {
        return;
      }
      const code = await prisma.accessCode.findUnique({ where: { id: accessCodeId }, select: { code: true } }).then((c) => c?.code ?? '');

      const response = await request(app.getHttpServer())
        .post('/api/v1/sessions/start')
        .send({ accessCode: code })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(typeof response.body.data.sessionToken).toBe('string');
      expect(typeof response.body.data.sessionId).toBe('string');
      expect(response.body.data.questions).toHaveLength(1);
    });

    it('rejects an invalid access code', async () => {
      if (!app) {
        return;
      }
      const response = await request(app.getHttpServer())
        .post('/api/v1/sessions/start')
        .send({ accessCode: 'INVALID-CODE' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
