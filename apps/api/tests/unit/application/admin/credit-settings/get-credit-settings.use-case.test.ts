import { createUnitTestModule } from '../../../test-module.factory';
import { GetCreditSettingsUseCase } from '../../../../../src/application/admin/credit-settings/get-credit-settings.use-case';
import { ICreditSettingRepository } from '@evaluateme/domain';

describe('GetCreditSettingsUseCase', () => {
  let useCase: GetCreditSettingsUseCase;
  let repository: jest.Mocked<ICreditSettingRepository>;

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(),
      findByKey: jest.fn(),
      save: jest.fn(),
    };

    const module = await createUnitTestModule({
      providers: [
        GetCreditSettingsUseCase,
        { provide: ICreditSettingRepository, useValue: repository },
      ],
    });

    useCase = module.get<GetCreditSettingsUseCase>(GetCreditSettingsUseCase);
  });

  it('returns a list of credit settings', async () => {
    repository.findAll.mockResolvedValue([
      {
        id: 'setting-1',
        key: 'test_price_usd',
        value: '19.99',
        updatedByUserId: 'admin-1',
        createdAt: new Date('2026-08-01T00:00:00Z'),
        updatedAt: new Date('2026-08-10T00:00:00Z'),
      },
    ]);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: 'setting-1',
      key: 'test_price_usd',
      value: '19.99',
      updatedByUserId: 'admin-1',
    });
    expect(typeof result.data[0].updatedAt).toBe('string');
  });

  it('returns an empty list when no settings exist', async () => {
    repository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });
});
