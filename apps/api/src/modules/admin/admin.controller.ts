import { Controller, Get, Post, Put, Param, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/security/roles.guard';
import { Roles } from '../../infrastructure/security/roles.decorator';
import { GetAdminMeUseCase } from '../../application/admin/get-admin-me.use-case';
import { GetCreditSettingsUseCase } from '../../application/admin/credit-settings/get-credit-settings.use-case';
import { UpdateCreditSettingUseCase } from '../../application/admin/credit-settings/update-credit-setting.use-case';
import { ListEmailTemplatesUseCase } from '../../application/admin/email-templates/list-email-templates.use-case';
import { GetEmailTemplateUseCase } from '../../application/admin/email-templates/get-email-template.use-case';
import { UpdateEmailTemplateUseCase } from '../../application/admin/email-templates/update-email-template.use-case';
import { ListLandingAdsUseCase } from '../../application/admin/landing-ads/list-landing-ads.use-case';
import { CreateLandingAdUseCase } from '../../application/admin/landing-ads/create-landing-ad.use-case';
import { UpdateLandingAdUseCase } from '../../application/admin/landing-ads/update-landing-ad.use-case';
import { ListUsersUseCase } from '../../application/admin/users/list-users.use-case';
import { UpdateUserUseCase } from '../../application/admin/users/update-user.use-case';
import { AdminListTechnologiesUseCase } from '../../application/admin/content/list-technologies.use-case';
import { CreateTechnologyUseCase } from '../../application/admin/content/create-technology.use-case';
import { GetTechnologyWithQuestionsUseCase } from '../../application/admin/content/get-technology-with-questions.use-case';
import { SaveQuestionUseCase } from '../../application/admin/content/save-question.use-case';
import { ZodValidationPipe } from '../../infrastructure/validation/zod-validation.pipe';
import {
  updateCreditSettingRequestSchema,
  updateEmailTemplateRequestSchema,
  createUpdateLandingAdRequestSchema,
  updateUserRequestSchema,
} from '../../lib/schemas/admin.schema';
import {
  createTechnologyRequestSchema,
  saveQuestionRequestSchema,
} from '../../lib/schemas/content.schema';
import { UserRole, LandingAdPosition, ActivationStatus } from '@evaluateme/domain';

interface RequestWithUser extends Request {
  user?: { sub: string; email: string; role: string };
}

@Controller('/api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly getAdminMeUseCase: GetAdminMeUseCase,
    private readonly getCreditSettingsUseCase: GetCreditSettingsUseCase,
    private readonly updateCreditSettingUseCase: UpdateCreditSettingUseCase,
    private readonly listEmailTemplatesUseCase: ListEmailTemplatesUseCase,
    private readonly getEmailTemplateUseCase: GetEmailTemplateUseCase,
    private readonly updateEmailTemplateUseCase: UpdateEmailTemplateUseCase,
    private readonly listLandingAdsUseCase: ListLandingAdsUseCase,
    private readonly createLandingAdUseCase: CreateLandingAdUseCase,
    private readonly updateLandingAdUseCase: UpdateLandingAdUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly adminListTechnologiesUseCase: AdminListTechnologiesUseCase,
    private readonly createTechnologyUseCase: CreateTechnologyUseCase,
    private readonly getTechnologyWithQuestionsUseCase: GetTechnologyWithQuestionsUseCase,
    private readonly saveQuestionUseCase: SaveQuestionUseCase,
  ) {}

  @Get('me')
  async me(@Req() request: RequestWithUser): Promise<ReturnType<GetAdminMeUseCase['execute']>> {
    return this.getAdminMeUseCase.execute(request.user!.sub);
  }

  @Get('credit-settings')
  async creditSettings(): Promise<ReturnType<GetCreditSettingsUseCase['execute']>> {
    return this.getCreditSettingsUseCase.execute();
  }

  @Put('credit-settings/:key')
  async updateCreditSetting(
    @Param('key') key: string,
    @Body(new ZodValidationPipe(updateCreditSettingRequestSchema)) body: { value: string },
    @Req() request: RequestWithUser,
  ): Promise<ReturnType<UpdateCreditSettingUseCase['execute']>> {
    return this.updateCreditSettingUseCase.execute({ key, value: body.value, updatedByUserId: request.user!.sub });
  }

  @Get('email-templates')
  async emailTemplates(): Promise<ReturnType<ListEmailTemplatesUseCase['execute']>> {
    return this.listEmailTemplatesUseCase.execute();
  }

  @Get('email-templates/:id')
  async emailTemplate(@Param('id') id: string): Promise<ReturnType<GetEmailTemplateUseCase['execute']>> {
    return this.getEmailTemplateUseCase.execute(id);
  }

  @Put('email-templates/:id')
  async updateEmailTemplate(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateEmailTemplateRequestSchema)) body: {
      subject: string;
      bodyHtml: string;
      bodyText?: string | null;
      variables?: Record<string, string> | null;
    },
  ): Promise<ReturnType<UpdateEmailTemplateUseCase['execute']>> {
    return this.updateEmailTemplateUseCase.execute({ id, ...body });
  }

  @Get('landing-ads')
  async landingAds(): Promise<ReturnType<ListLandingAdsUseCase['execute']>> {
    return this.listLandingAdsUseCase.execute();
  }

  @Post('landing-ads')
  async createLandingAd(
    @Body(new ZodValidationPipe(createUpdateLandingAdRequestSchema)) body: {
      title: string;
      content?: string | null;
      imageUrl?: string | null;
      linkUrl?: string | null;
      position: LandingAdPosition;
      isActive: boolean;
    },
  ): Promise<ReturnType<CreateLandingAdUseCase['execute']>> {
    return this.createLandingAdUseCase.execute(body);
  }

  @Put('landing-ads/:id')
  async updateLandingAd(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(createUpdateLandingAdRequestSchema)) body: {
      title: string;
      content?: string | null;
      imageUrl?: string | null;
      linkUrl?: string | null;
      position: LandingAdPosition;
      isActive: boolean;
    },
  ): Promise<ReturnType<UpdateLandingAdUseCase['execute']>> {
    return this.updateLandingAdUseCase.execute({ id, ...body });
  }

  @Get('users')
  async users(): Promise<ReturnType<ListUsersUseCase['execute']>> {
    return this.listUsersUseCase.execute();
  }

  @Put('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateUserRequestSchema)) body: {
      role?: Exclude<UserRole, 'admin'>;
      activationStatus?: ActivationStatus;
    },
  ): Promise<ReturnType<UpdateUserUseCase['execute']>> {
    return this.updateUserUseCase.execute({ id, ...body });
  }

  @Get('technologies')
  async technologies(): Promise<ReturnType<AdminListTechnologiesUseCase['execute']>> {
    return this.adminListTechnologiesUseCase.execute();
  }

  @Post('technologies')
  async createTechnology(
    @Body(new ZodValidationPipe(createTechnologyRequestSchema)) body: { name: string; slug?: string; description?: string | null },
  ): Promise<ReturnType<CreateTechnologyUseCase['execute']>> {
    return this.createTechnologyUseCase.execute(body);
  }

  @Get('technologies/:id/questions')
  async technologyQuestions(@Param('id') id: string): Promise<ReturnType<GetTechnologyWithQuestionsUseCase['execute']>> {
    return this.getTechnologyWithQuestionsUseCase.execute(id);
  }

  @Put('questions')
  async saveQuestion(
    @Body(new ZodValidationPipe(saveQuestionRequestSchema)) body: {
      id?: string;
      testId: string;
      content: string;
      type: 'single' | 'multiple';
      orderIndex: number;
      score: number;
      answers: Array<{ id?: string; content: string; isCorrect: boolean; orderIndex: number }>;
    },
  ): Promise<ReturnType<SaveQuestionUseCase['execute']>> {
    return this.saveQuestionUseCase.execute(body);
  }
}
