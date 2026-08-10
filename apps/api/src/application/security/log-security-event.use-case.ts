import { Inject, Injectable } from '@nestjs/common';
import { ISecurityAuditLogger, SecurityAuditEvent } from '@evaluateme/domain';

@Injectable()
export class LogSecurityEventUseCase {
  constructor(
    @Inject(ISecurityAuditLogger)
    private readonly logger: ISecurityAuditLogger,
  ) {}

  async execute(event: SecurityAuditEvent): Promise<void> {
    await this.logger.log(event);
  }
}
