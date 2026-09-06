import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/security/roles.guard';
import { Roles } from '../../infrastructure/security/roles.decorator';
import { UserRole } from '@evaluateme/domain';
import { ZodValidationPipe } from '../../infrastructure/validation/zod-validation.pipe';
import { CreateCampaignUseCase } from '../../application/corporate/campaigns/create-campaign.use-case';
import { ListCampaignsUseCase } from '../../application/corporate/campaigns/list-campaigns.use-case';
import { UpdateCampaignStatusUseCase } from '../../application/corporate/campaigns/update-campaign-status.use-case';
import { GetCampaignUseCase } from '../../application/corporate/campaigns/get-campaign.use-case';
import {
  createCampaignSchema,
  CreateCampaignDto,
  listCampaignsSchema,
  ListCampaignsDto,
  updateCampaignStatusSchema,
  UpdateCampaignStatusDto,
} from '../../lib/schemas/corporate.schema';
import { GetUser } from '../../infrastructure/auth/get-user.decorator';

interface AuthenticatedUser {
  sub: string;
  email: string;
  role: string;
}

@Controller('/api/v1/corporate/campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COMPANY)
export class CampaignsController {
  constructor(
    private readonly createCampaignUseCase: CreateCampaignUseCase,
    private readonly listCampaignsUseCase: ListCampaignsUseCase,
    private readonly updateCampaignStatusUseCase: UpdateCampaignStatusUseCase,
    private readonly getCampaignUseCase: GetCampaignUseCase,
  ) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(createCampaignSchema)) dto: CreateCampaignDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<ReturnType<CreateCampaignUseCase['execute']>> {
    return this.createCampaignUseCase.execute({
      userId: user.sub,
      companyId: dto.companyId,
      name: dto.name,
      description: dto.description ?? null,
      notes: dto.notes ?? null,
    });
  }

  @Get()
  async list(
    @Query(new ZodValidationPipe(listCampaignsSchema)) query: ListCampaignsDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<ReturnType<ListCampaignsUseCase['execute']>> {
    return this.listCampaignsUseCase.execute({
      userId: user.sub,
      companyId: query.companyId,
      status: query.status ?? null,
    });
  }

  @Get(':id')
  async get(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @GetUser() user: AuthenticatedUser,
  ): Promise<ReturnType<GetCampaignUseCase['execute']>> {
    return this.getCampaignUseCase.execute({
      userId: user.sub,
      companyId,
      campaignId: id,
    });
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCampaignStatusSchema)) dto: UpdateCampaignStatusDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<ReturnType<UpdateCampaignStatusUseCase['execute']>> {
    return this.updateCampaignStatusUseCase.execute({
      userId: user.sub,
      companyId: dto.companyId,
      campaignId: id,
      newStatus: dto.status,
    });
  }
}
