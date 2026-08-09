import { createUnitTestModule } from '../../test-module.factory';
import { HealthCheckUseCase } from '../../../../src/application/health/health-check.use-case';
import { IHealthRepository, IHealthRepositoryPort } from '@evaluateme/domain';

describe('HealthCheckUseCase', () => {
  let useCase: HealthCheckUseCase;
  let healthRepository: jest.Mocked<IHealthRepositoryPort>;

  beforeEach(async () => {
    healthRepository = {
      checkDatabase: jest.fn().mockResolvedValue({ ok: true, latencyMs: 12 }),
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
    healthRepository.checkDatabase.mockResolvedValue({ ok: false, latencyMs: 5 });

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.data.database).toBe('error');
  });
});
