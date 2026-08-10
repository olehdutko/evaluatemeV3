import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { StartSessionUseCase } from '../../application/test-engine/start-session.use-case';
import { ZodValidationPipe } from '../../infrastructure/validation/zod-validation.pipe';
import { startSessionRequestSchema } from '../../lib/schemas/test-engine.schema';

@Controller('/api/v1/sessions')
export class SessionsController {
  constructor(private readonly startSessionUseCase: StartSessionUseCase) {}

  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  async start(
    @Body(new ZodValidationPipe(startSessionRequestSchema)) body: { accessCode: string },
  ) {
    return this.startSessionUseCase.execute(body.accessCode);
  }
}
