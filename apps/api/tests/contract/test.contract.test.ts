import {
  createTestRequestSchema,
  listTestsResponseSchema,
  singleTestResponseSchema,
} from '../../src/lib/schemas/test.schema';

describe('Test endpoint contracts', () => {
  it('validates a create test request', () => {
    const payload = {
      title: 'TypeScript Basics',
      technologyId: '550e8400-e29b-41d4-a716-446655440000',
      durationMinutes: 30,
      passingScore: 70,
    };
    expect(() => createTestRequestSchema.parse(payload)).not.toThrow();
  });

  it('validates a list tests response', () => {
    const payload = {
      success: true,
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'TypeScript Basics',
          technologyId: '550e8400-e29b-41d4-a716-446655440000',
          status: 'published',
          durationMinutes: 30,
          passingScore: 70,
          createdByUserId: '550e8400-e29b-41d4-a716-446655440002',
          createdAt: '2026-08-10T12:00:00Z',
          updatedAt: '2026-08-10T12:00:00Z',
        },
      ],
      meta: { page: 1, perPage: 20, total: 1 },
    };
    expect(() => listTestsResponseSchema.parse(payload)).not.toThrow();
  });

  it('validates a single test response', () => {
    const payload = {
      success: true,
      data: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'TypeScript Basics',
        technologyId: '550e8400-e29b-41d4-a716-446655440000',
        status: 'published',
        durationMinutes: null,
        passingScore: null,
        createdByUserId: '550e8400-e29b-41d4-a716-446655440002',
        createdAt: '2026-08-10T12:00:00Z',
        updatedAt: '2026-08-10T12:00:00Z',
      },
    };
    expect(() => singleTestResponseSchema.parse(payload)).not.toThrow();
  });
});
