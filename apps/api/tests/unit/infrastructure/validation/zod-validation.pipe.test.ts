import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../../src/infrastructure/validation/zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const schema = z.object({ email: z.string().email() });
  const pipe = new ZodValidationPipe(schema);

  it('returns parsed data for valid input', () => {
    const input = { email: 'hello@example.com' };
    expect(pipe.transform(input)).toEqual(input);
  });

  it('throws BadRequestException for invalid input', () => {
    expect(() => pipe.transform({ email: 'not-an-email' })).toThrow(BadRequestException);
  });
});
