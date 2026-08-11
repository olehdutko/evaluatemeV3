import { Controller, Get, Put, Param, Body, Req, UseGuards } from '@nestjs/common';
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
import { ZodValidationPipe } from '../../infrastructure/validation/zod-validation.pipe';
import {
  updateCreditSettingRequestSchema,
  updateEmailTemplateRequestSchema,
} from '../../lib/schemas/admin.schema';
import { UserRole } from '@evaluateme/domain';

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
}
