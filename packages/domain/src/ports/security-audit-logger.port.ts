export interface SecurityAuditEvent {
  eventCode: string;
  outcome: 'success' | 'failure' | 'blocked';
  ip?: string;
  userId?: string;
  email?: string;
  path?: string;
  details?: Record<string, unknown>;
}

export const ISecurityAuditLogger = Symbol('ISecurityAuditLogger');

export interface ISecurityAuditLogger {
  log(event: SecurityAuditEvent): Promise<void>;
}
