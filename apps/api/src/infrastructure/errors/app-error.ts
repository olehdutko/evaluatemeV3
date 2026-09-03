export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      'RESOURCE_NOT_FOUND',
      `The requested ${resource} was not found.`,
      404,
      id ? { resource, id } : { resource },
    );
  }
}

export class BadRequestError extends AppError {
  constructor(details?: Record<string, unknown>) {
    super('BAD_REQUEST', 'Request validation failed.', 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Missing or invalid authentication.') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Authenticated but not authorized.') {
    super('FORBIDDEN', message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists or state conflict.') {
    super('CONFLICT', message, 409);
  }
}

export class UnprocessableError extends AppError {
  constructor(message = 'Business rule violation.') {
    super('UNPROCESSABLE_ENTITY', message, 422);
  }
}

export class PaymentRequiredError extends AppError {
  constructor(message = 'Payment required to proceed.') {
    super('PAYMENT_REQUIRED', message, 402);
  }
}
