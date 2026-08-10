import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { ZodError } from 'zod';
import { AppError } from '../../../../src/infrastructure/errors/app-error';
import { ErrorHandler } from '../../../../src/infrastructure/errors/error-handler';

function createMockResponse(): { status: jest.Mock; json: jest.Mock } {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

function createMockHost(response: unknown): ArgumentsHost {
  return {
    switchToHttp: jest.fn().mockReturnValue({
      getResponse: jest.fn().mockReturnValue(response),
    }),
  } as unknown as ArgumentsHost;
}

describe('ErrorHandler', () => {
  const handler = new ErrorHandler();

  it('maps AppError to the correct envelope', () => {
    const response = createMockResponse();
    const error = new AppError('RESOURCE_NOT_FOUND', 'Not found', 404, { resource: 'User' });
    handler.catch(error, createMockHost(response));

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Not found',
          details: { resource: 'User' },
        },
        meta: null,
      }),
    );
  });

  it('maps ZodError to BAD_REQUEST envelope', () => {
    const response = createMockResponse();
    const zodError = new ZodError([
      { message: 'Required', path: ['email'], code: 'invalid_type', expected: 'string', received: 'undefined' },
    ]);
    handler.catch(zodError, createMockHost(response));

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Request validation failed.',
          details: { email: ['Required'] },
        },
        meta: null,
      }),
    );
  });

  it('maps unexpected errors to INTERNAL_ERROR', () => {
    const response = createMockResponse();
    handler.catch(new Error('boom'), createMockHost(response));

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred.',
        },
        meta: null,
      }),
    );
  });

  it('maps HttpException to the correct status', () => {
    const response = createMockResponse();
    const httpError = new HttpException('Forbidden resource', HttpStatus.FORBIDDEN);
    handler.catch(httpError, createMockHost(response));

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Forbidden resource',
        },
        meta: null,
      }),
    );
  });
});
