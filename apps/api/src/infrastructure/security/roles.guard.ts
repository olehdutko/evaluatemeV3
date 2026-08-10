import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserRole } from '@evaluateme/domain';
import { ROLES_KEY } from './roles.decorator';

interface RequestWithUser extends Request {
  user?: { sub: string; email: string; role: string };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userRole = request.user?.role;
    if (!userRole || !requiredRoles.includes(userRole as UserRole)) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
