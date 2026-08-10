import { LogSecurityEventUseCase } from '../../../../src/application/security/log-security-event.use-case';
import { ISecurityAuditLogger, SecurityAuditEvent } from '@evaluateme/domain';

class FakeSecurityAuditLogger implements ISecurityAuditLogger {
  events: SecurityAuditEvent[] = [];

  async log(event: SecurityAuditEvent): Promise<void> {
    this.events.push(event);
  }
}

describe('LogSecurityEventUseCase', () => {
  const logger = new FakeSecurityAuditLogger();
  const useCase = new LogSecurityEventUseCase(logger);

  beforeEach(() => {
    logger.events = [];
  });

  it('forwards events to the logger', async () => {
    const event: SecurityAuditEvent = {
      eventCode: 'AUTH_LOGIN_FAILURE',
      outcome: 'failure',
      ip: '127.0.0.1',
      email: 'a@b.com',
      path: '/api/v1/auth/login',
    };
    await useCase.execute(event);
    expect(logger.events).toHaveLength(1);
    expect(logger.events[0].eventCode).toBe('AUTH_LOGIN_FAILURE');
  });
});
