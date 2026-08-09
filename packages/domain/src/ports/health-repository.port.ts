export interface IHealthRepositoryPort {
  checkDatabase(): Promise<{ ok: boolean; latencyMs: number }>;
}

export const IHealthRepository = Symbol('IHealthRepository') as unknown as new () => IHealthRepositoryPort;

export class HealthRepositoryToken {
  static readonly token = Symbol('IHealthRepository');
}
