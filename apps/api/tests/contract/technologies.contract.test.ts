import { technologyResponseSchema } from '../../src/lib/schemas/technology';

describe('Technologies endpoint contract', () => {
  it('validates a list of technologies', () => {
    const valid = {
      success: true,
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'TypeScript',
          slug: 'typescript',
          description: 'Typed JavaScript',
          createdAt: '2026-08-10T12:00:00Z',
        },
      ],
    };

    expect(() => technologyResponseSchema.parse(valid)).not.toThrow();
  });

  it('rejects missing fields', () => {
    const invalid = {
      success: true,
      data: [{ id: '550e8400-e29b-41d4-a716-446655440000', name: 'TypeScript' }],
    };

    expect(() => technologyResponseSchema.parse(invalid)).toThrow();
  });
});
