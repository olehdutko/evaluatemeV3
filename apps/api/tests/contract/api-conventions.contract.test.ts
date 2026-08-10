import { z } from 'zod';
import {
  errorEnvelopeSchema,
  offsetPaginationMetaSchema,
  successEnvelopeSchema,
} from '../../src/lib/schemas/envelope.schema';

describe('API conventions envelope contract', () => {
  it('validates a success envelope', () => {
    const payload = {
      success: true,
      data: { status: 'ok' },
      meta: { page: 1, perPage: 20, total: 100 },
    };
    const schema = successEnvelopeSchema(z.object({ status: z.literal('ok') }));
    expect(() => schema.parse(payload)).not.toThrow();
  });

  it('validates an error envelope', () => {
    const payload = {
      success: false,
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Not found',
        details: { id: ['Invalid'] },
      },
      meta: null,
    };
    expect(() => errorEnvelopeSchema.parse(payload)).not.toThrow();
  });

  it('rejects a success envelope with missing meta when required', () => {
    const payload = {
      success: true,
      data: [],
    };
    const schema = z.object({
      success: z.literal(true),
      data: z.array(z.any()),
      meta: z.union([offsetPaginationMetaSchema, z.null()]),
    });
    expect(() => schema.parse(payload)).toThrow();
  });
});
