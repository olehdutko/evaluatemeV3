import { Controller, Post, Get, Body, Param, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { StartPersonalQuizUseCase } from '../../application/test-engine/start-personal-quiz.use-case';
import { StartTestUseCase } from '../../application/test-engine/start-test.use-case';
import { SubmitAnswerUseCase } from '../../application/test-engine/submit-answer.use-case';
import { GetTestSessionUseCase } from '../../application/test-engine/get-test-session.use-case';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ZodValidationPipe } from '../../infrastructure/validation/zod-validation.pipe';
import {
  startPersonalQuizRequestSchema,
  startTestRequestSchema,
  submitAnswerRequestSchema,
} from '../../lib/schemas/test-engine.schema';

interface RequestWithUser extends Request {
  user: { sub: string; email: string; role: string };
}

@Controller('/api/v1/tests')
export class TestEngineController {
  constructor(
    private readonly startPersonalQuizUseCase: StartPersonalQuizUseCase,
    private readonly startTestUseCase: StartTestUseCase,
    private readonly submitAnswerUseCase: SubmitAnswerUseCase,
    private readonly getTestSessionUseCase: GetTestSessionUseCase,
  ) {}


  @Post('personal/start')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async startPersonal(
    @Body(new ZodValidationPipe(startPersonalQuizRequestSchema)) _body: Record<string, never>,
    @Req() request: RequestWithUser,
  ) {
    return this.startPersonalQuizUseCase.execute(request.user.sub);
  }

  @Post('start')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async start(
    @Body(new ZodValidationPipe(startTestRequestSchema)) body: { technologySlug: string },
    @Req() request: RequestWithUser,
  ) {
    return this.startTestUseCase.execute(request.user.sub, body.technologySlug);
  }

  @Get(':sessionId')
  @HttpCode(HttpStatus.OK)
  async get(@Param('sessionId') sessionId: string) {
    return this.getTestSessionUseCase.execute(sessionId);
  }

  @Post(':sessionId/answer')
  @HttpCode(HttpStatus.OK)
  async answer(
    @Param('sessionId') sessionId: string,
    @Body(new ZodValidationPipe(submitAnswerRequestSchema)) body: { questionId: string; answerId: string },
  ) {
    return this.submitAnswerUseCase.execute(sessionId, body.questionId, body.answerId);
  }
}
