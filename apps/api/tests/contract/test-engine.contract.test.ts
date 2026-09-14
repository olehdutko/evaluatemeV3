import {
  startTestRequestSchema,
  startTestResponseSchema,
  submitAnswerRequestSchema,
  submitAnswerResponseSchema,
  testSessionStateResponseSchema,
  startSessionRequestSchema,
} from '../../src/lib/schemas/test-engine.schema';

describe('Test engine endpoint contracts', () => {
  it('validates start test request', () => {
    expect(() => startTestRequestSchema.parse({ questionSetId: '550e8400-e29b-41d4-a716-446655440000' })).not.toThrow();
  });

  it('rejects empty start test request', () => {
    expect(() => startTestRequestSchema.parse({ questionSetId: '' })).toThrow();
  });

  it('validates start test response', () => {
    const payload = {
      success: true,
      data: {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        questionSet: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'C# Basics',
        },
        questions: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            questionSetId: '550e8400-e29b-41d4-a716-446655440001',
            content: 'What is 2+2?',
            type: 'single',
            orderIndex: 0,
            score: 1,
            createdAt: '2026-08-10T12:00:00Z',
            updatedAt: '2026-08-10T12:00:00Z',
          },
        ],
      },
    };
    expect(() => startTestResponseSchema.parse(payload)).not.toThrow();
  });

  it('validates submit answer request', () => {
    const payload = {
      questionId: '550e8400-e29b-41d4-a716-446655440002',
      answerId: '550e8400-e29b-41d4-a716-446655440003',
    };
    expect(() => submitAnswerRequestSchema.parse(payload)).not.toThrow();
  });

  it('validates submit answer response', () => {
    const payload = {
      success: true,
      data: {
        isCorrect: true,
        currentScore: 50,
        totalAnswered: 1,
        nextQuestionIndex: 1,
        isComplete: false,
      },
    };
    expect(() => submitAnswerResponseSchema.parse(payload)).not.toThrow();
  });

  it('validates completed submit answer response', () => {
    const payload = {
      success: true,
      data: {
        isCorrect: true,
        currentScore: 100,
        totalAnswered: 1,
        nextQuestionIndex: null,
        isComplete: true,
      },
    };
    expect(() => submitAnswerResponseSchema.parse(payload)).not.toThrow();
  });

  it('validates test session state response', () => {
    const payload = {
      success: true,
      data: {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        status: 'in_progress',
        currentQuestionIndex: 0,
        questions: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            content: 'What is 2+2?',
            type: 'single',
            orderIndex: 0,
            answers: [
              {
                id: '550e8400-e29b-41d4-a716-446655440003',
                content: '4',
                orderIndex: 0,
              },
            ],
          },
        ],
      },
    };
    expect(() => testSessionStateResponseSchema.parse(payload)).not.toThrow();
  });

  it('validates start session request', () => {
    expect(() => startSessionRequestSchema.parse({ accessCode: 'CODE-123' })).not.toThrow();
  });
});
