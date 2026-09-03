import { Controller, Get, Param, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { GetMyResultsUseCase } from '../../application/me/get-my-results.use-case';
import { GetMyResultDetailUseCase } from '../../application/me/get-my-result-detail.use-case';

interface RequestWithUser extends Request {
  user: { sub: string; email: string; role: string };
}

@Controller('/api/v1/me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(
    private readonly getMyResultsUseCase: GetMyResultsUseCase,
    private readonly getMyResultDetailUseCase: GetMyResultDetailUseCase,
  ) {}

  @Get('results')
  @HttpCode(HttpStatus.OK)
  async list(@Req() request: RequestWithUser) {
    return this.getMyResultsUseCase.execute(request.user.sub);
  }

  @Get('results/:resultCode')
  @HttpCode(HttpStatus.OK)
  async detail(@Param('resultCode') resultCode: string, @Req() request: RequestWithUser) {
    return this.getMyResultDetailUseCase.execute(request.user.sub, resultCode);
  }
}
