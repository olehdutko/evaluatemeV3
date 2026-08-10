import { createUnitTestModule } from '../../test-module.factory';
import { HealthCheckUseCase } from '../../../../src/application/health/health-check.use-case';
import { IHealthRepository } from '@evaluateme/domain';

describe('HealthCheckUseCase', () => {
  let useCase: HealthCheckUseCase;
  let healthRepository: jest.Mocked<IHealthRepository>;

  beforeEach(async () => {
    healthRepository = {
      check: jest.fn().mockResolvedValue({
        status: 'ok',
        database: 'ok',
        latencyMs: 12,
        timestamp: '2026-08-10T12:00:00Z',
      }),
    };

    const module = await createUnitTestModule({
      providers: [
        HealthCheckUseCase,
        { provide: IHealthRepository, useValue: healthRepository },
      ],
    });

    useCase = module.get<HealthCheckUseCase>(HealthCheckUseCase);
  });

  it('returns ok when database is healthy', async () => {
    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.data.status).toBe('ok');
    expect(result.data.database).toBe('ok');
    expect(result.data.latencyMs).toBe(12);
    expect(typeof result.data.timestamp).toBe('string');
  });

  it('returns database error when database check fails', async () => {
    healthRepository.check.mockResolvedValue({
      status: 'ok',
      database: 'error',
      latencyMs: 5,
      timestamp: '2026-08-10T12:00:00Z',
    });

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.data.database).toBe('error');
  });
});
