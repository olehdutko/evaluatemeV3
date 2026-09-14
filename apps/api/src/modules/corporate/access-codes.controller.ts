import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/security/roles.guard';
import { Roles } from '../../infrastructure/security/roles.decorator';
import { UserRole } from '@evaluateme/domain';
import { ZodValidationPipe } from '../../infrastructure/validation/zod-validation.pipe';
import { CreateAccessCodeUseCase } from '../../application/corporate/access-codes/create-access-code.use-case';
import { ListAccessCodesUseCase } from '../../application/corporate/access-codes/list-access-codes.use-case';
import { SendAccessCodeUseCase } from '../../application/corporate/access-codes/send-access-code.use-case';
import { PreviewAccessCodeEmailUseCase } from '../../application/corporate/access-codes/preview-access-code-email.use-case';
import {
  createAccessCodeSchema,
  CreateAccessCodeDto,
  listAccessCodesSchema,
  ListAccessCodesDto,
  sendAccessCodeSchema,
  SendAccessCodeDto,
} from '../../lib/schemas/corporate.schema';
import { GetUser } from '../../infrastructure/auth/get-user.decorator';

interface AuthenticatedUser {
  sub: string;
  email: string;
  role: string;
}

@Controller('/api/v1/corporate')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COMPANY)
export class AccessCodesController {
  constructor(
    private readonly createAccessCodeUseCase: CreateAccessCodeUseCase,
    private readonly listAccessCodesUseCase: ListAccessCodesUseCase,
    private readonly sendAccessCodeUseCase: SendAccessCodeUseCase,
    private readonly previewAccessCodeEmailUseCase: PreviewAccessCodeEmailUseCase,
  ) {}

  @Post('campaigns/:campaignId/access-codes')
  async create(
    @Param('campaignId') campaignId: string,
    @Body(new ZodValidationPipe(createAccessCodeSchema)) dto: CreateAccessCodeDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<ReturnType<CreateAccessCodeUseCase['execute']>> {
    return this.createAccessCodeUseCase.execute({
      userId: user.sub,
      companyId: dto.companyId,
      campaignId,
      testeeName: dto.testeeName,
      testeeEmail: dto.testeeEmail,
      questionCount: dto.questionCount,
      durationMinutes: dto.durationMinutes,
    });
  }

  @Get('campaigns/:campaignId/access-codes')
  async list(
    @Param('campaignId') campaignId: string,
    @Query(new ZodValidationPipe(listAccessCodesSchema)) query: ListAccessCodesDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<ReturnType<ListAccessCodesUseCase['execute']>> {
    return this.listAccessCodesUseCase.execute({
      userId: user.sub,
      companyId: query.companyId,
      campaignId,
    });
  }

  @Post('access-codes/:id/send')
  async send(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(sendAccessCodeSchema)) dto: SendAccessCodeDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<ReturnType<SendAccessCodeUseCase['execute']>> {
    return this.sendAccessCodeUseCase.execute({
      userId: user.sub,
      companyId: dto.companyId,
      accessCodeId: id,
      email: dto.email ?? undefined,
    });
  }

  @Get('access-codes/:id/email-preview')
  async preview(
    @Param('id') id: string,
    @Query(new ZodValidationPipe(sendAccessCodeSchema)) query: SendAccessCodeDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<ReturnType<PreviewAccessCodeEmailUseCase['execute']>> {
    return this.previewAccessCodeEmailUseCase.execute({
      userId: user.sub,
      companyId: query.companyId,
      accessCodeId: id,
      email: query.email ?? undefined,
    });
  }
}
