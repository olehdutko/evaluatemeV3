import { Injectable } from '@nestjs/common';
import { Logger, createLogger } from '../logging/logger';
import { ISecurityAuditLogger, SecurityAuditEvent } from '@evaluateme/domain';

@Injectable()
export class ConsoleSecurityAuditLogger implements ISecurityAuditLogger {
  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger('security');
  }

  async log(event: SecurityAuditEvent): Promise<void> {
    this.logger.warn(event.eventCode, {
      tag: 'security',
      ...event,
      timestamp: new Date().toISOString(),
    });
  }
}
