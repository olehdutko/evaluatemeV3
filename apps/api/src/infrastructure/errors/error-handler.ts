import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from './app-error';

interface ErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: null;
}

function statusToCode(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'BAD_REQUEST';
    case HttpStatus.UNAUTHORIZED:
      return 'UNAUTHORIZED';
    case HttpStatus.FORBIDDEN:
      return 'FORBIDDEN';
    case HttpStatus.NOT_FOUND:
      return 'RESOURCE_NOT_FOUND';
    case HttpStatus.CONFLICT:
      return 'CONFLICT';
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return 'UNPROCESSABLE_ENTITY';
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'TOO_MANY_REQUESTS';
    default:
      return 'INTERNAL_ERROR';
  }
}

@Catch()
export class ErrorHandler implements ExceptionFilter {
  private readonly logger = new Logger(ErrorHandler.name);

  catch(error: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred.';
    let details: Record<string, unknown> | undefined;

    if (error instanceof AppError) {
      status = error.statusCode;
      code = error.code;
      message = error.message;
      details = error.details;
    } else if (error instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'BAD_REQUEST';
      message = 'Request validation failed.';
      details = error.flatten().fieldErrors;
    } else if (error instanceof HttpException) {
      status = error.getStatus();
      const responseBody = error.getResponse();
      code = statusToCode(status);
      if (typeof responseBody === 'string') {
        message = responseBody;
      } else if (typeof responseBody === 'object' && responseBody !== null) {
        const body = responseBody as Record<string, unknown>;
        code = typeof body.code === 'string' ? body.code : code;
        message = typeof body.message === 'string' ? body.message : message;
        details =
          typeof body.details === 'object' && body.details !== null
            ? (body.details as Record<string, unknown>)
            : details;
      }
    }

    if (status >= 500) {
      this.logger.error(
        message,
        error instanceof Error ? error.stack : String(error),
      );
    } else {
      this.logger.warn({ code, status, message, details });
    }

    const envelope: ErrorEnvelope = {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
      meta: null,
    };

    response.status(status).json(envelope);
  }
}
