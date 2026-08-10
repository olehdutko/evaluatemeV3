import { technologyResponseSchema } from '../../src/lib/schemas/technology';

describe('Technologies endpoint contract', () => {
  it('validates a list of technologies', () => {
    const valid = {
      success: true,
      data: [
        {
          id: 'tech-1',
          name: 'TypeScript',
          slug: 'typescript',
          description: 'Typed JavaScript',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    expect(() => technologyResponseSchema.parse(valid)).not.toThrow();
  });

  it('rejects missing fields', () => {
    const invalid = {
      success: true,
      data: [{ id: 'tech-1', name: 'TypeScript' }],
    };

    expect(() => technologyResponseSchema.parse(invalid)).toThrow();
  });
});
