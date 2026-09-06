import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/security/roles.guard';
import { Roles } from '../../infrastructure/security/roles.decorator';
import { UserRole } from '@evaluateme/domain';
import { ZodValidationPipe } from '../../infrastructure/validation/zod-validation.pipe';
import { ListCampaignResultsUseCase } from '../../application/corporate/results/list-campaign-results.use-case';
import { GetCandidateResultDetailUseCase } from '../../application/corporate/results/get-candidate-result-detail.use-case';
import { listCampaignResultsSchema, ListCampaignResultsDto, getResultDetailSchema, GetResultDetailDto } from '../../lib/schemas/corporate.schema';
import { GetUser } from '../../infrastructure/auth/get-user.decorator';

interface AuthenticatedUser {
  sub: string;
  email: string;
  role: string;
}

@Controller('/api/v1/corporate')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COMPANY)
export class ResultsController {
  constructor(
    private readonly listCampaignResultsUseCase: ListCampaignResultsUseCase,
    private readonly getCandidateResultDetailUseCase: GetCandidateResultDetailUseCase,
  ) {}

  @Get('campaigns/:campaignId/results')
  async list(
    @Param('campaignId') campaignId: string,
    @Query(new ZodValidationPipe(listCampaignResultsSchema)) query: ListCampaignResultsDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<ReturnType<ListCampaignResultsUseCase['execute']>> {
    return this.listCampaignResultsUseCase.execute({
      userId: user.sub,
      companyId: query.companyId,
      campaignId,
    });
  }

  @Get('campaigns/:campaignId/results/:resultId')
  async getDetail(
    @Param('campaignId') campaignId: string,
    @Param('resultId') resultId: string,
    @Query(new ZodValidationPipe(getResultDetailSchema)) query: GetResultDetailDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<ReturnType<GetCandidateResultDetailUseCase['execute']>> {
    return this.getCandidateResultDetailUseCase.execute({
      userId: user.sub,
      companyId: query.companyId,
      campaignId,
      resultId,
    });
  }
}
