export const IHealthRepository = Symbol('IHealthRepository');

export interface HealthCheckResult {
  status: 'ok';
  database: 'ok' | 'error';
  latencyMs: number;
  timestamp: string;
}

export interface IHealthRepository {
  check(): Promise<HealthCheckResult>;
}
