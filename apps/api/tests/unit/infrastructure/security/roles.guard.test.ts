import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { RolesGuard } from '../../../../src/infrastructure/security/roles.guard';
import { Roles } from '../../../../src/infrastructure/security/roles.decorator';

function createContext(role?: string): ExecutionContext {
  const request = { user: role ? { sub: '1', email: 'a@b.com', role } : undefined } as unknown as Request;
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() } as never;
  const guard = new RolesGuard(reflector);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows access when no roles are required', () => {
    (reflector as { getAllAndOverride: jest.Mock }).getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(createContext('user'))).toBe(true);
  });

  it('allows access for users with required role', () => {
    (reflector as { getAllAndOverride: jest.Mock }).getAllAndOverride.mockReturnValue(['admin']);
    expect(guard.canActivate(createContext('admin'))).toBe(true);
  });

  it('denies access for users without required role', () => {
    (reflector as { getAllAndOverride: jest.Mock }).getAllAndOverride.mockReturnValue(['admin']);
    expect(() => guard.canActivate(createContext('user'))).toThrow('Insufficient permissions');
  });

  it('denies access for unauthenticated users', () => {
    (reflector as { getAllAndOverride: jest.Mock }).getAllAndOverride.mockReturnValue(['admin']);
    expect(() => guard.canActivate(createContext())).toThrow('Insufficient permissions');
  });

  it('@Roles decorator sets metadata', () => {
    class TestController {
      @Roles('admin')
      action() {
        return 'ok';
      }
    }
    const instance = new TestController();
    const meta = Reflect.getMetadata('roles', instance.action);
    expect(meta).toEqual(['admin']);
  });
});
