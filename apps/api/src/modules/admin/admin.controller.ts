import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/security/roles.guard';
import { Roles } from '../../infrastructure/security/roles.decorator';
import { GetAdminMeUseCase } from '../../application/admin/get-admin-me.use-case';
import { UserRole } from '@evaluateme/domain';

interface RequestWithUser extends Request {
  user?: { sub: string; email: string; role: string };
}

@Controller('/api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly getAdminMeUseCase: GetAdminMeUseCase) {}

  @Get('me')
  async me(@Req() request: RequestWithUser): Promise<ReturnType<GetAdminMeUseCase['execute']>> {
    return this.getAdminMeUseCase.execute(request.user!.sub);
  }
}
