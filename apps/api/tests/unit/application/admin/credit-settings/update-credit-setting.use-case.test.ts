import { createUnitTestModule } from '../../../test-module.factory';
import { UpdateCreditSettingUseCase } from '../../../../../src/application/admin/credit-settings/update-credit-setting.use-case';
import { ICreditSettingRepository } from '@evaluateme/domain';
import { BadRequestError } from '../../../../../src/infrastructure/errors/app-error';

describe('UpdateCreditSettingUseCase', () => {
  let useCase: UpdateCreditSettingUseCase;
  let repository: jest.Mocked<ICreditSettingRepository>;

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(),
      findByKey: jest.fn(),
      save: jest.fn(),
    };

    const module = await createUnitTestModule({
      providers: [
        UpdateCreditSettingUseCase,
        { provide: ICreditSettingRepository, useValue: repository },
      ],
    });

    useCase = module.get<UpdateCreditSettingUseCase>(UpdateCreditSettingUseCase);
  });

  it('creates a new credit setting when none exists', async () => {
    repository.findByKey.mockResolvedValue(null);
    repository.save.mockImplementation(async (setting) => setting);

    const result = await useCase.execute({ key: 'test_price_usd', value: '  29.99  ', updatedByUserId: 'admin-1' });

    expect(result.success).toBe(true);
    expect(result.data.key).toBe('test_price_usd');
    expect(result.data.value).toBe('29.99');
    expect(typeof result.data.updatedAt).toBe('string');
  });

  it('updates an existing credit setting', async () => {
    repository.findByKey.mockResolvedValue({
      id: 'setting-1',
      key: 'test_price_usd',
      value: '19.99',
      updatedByUserId: 'admin-1',
      createdAt: new Date('2026-08-01T00:00:00Z'),
      updatedAt: new Date('2026-08-10T00:00:00Z'),
    });
    repository.save.mockImplementation(async (setting) => setting);

    const result = await useCase.execute({ key: 'test_price_usd', value: '24.99', updatedByUserId: 'admin-2' });

    expect(result.success).toBe(true);
    expect(result.data.value).toBe('24.99');
  });

  it('rejects unknown keys', async () => {
    await expect(
      useCase.execute({ key: 'unknown_key', value: '1', updatedByUserId: 'admin-1' }),
    ).rejects.toThrow(BadRequestError);
  });

  it('rejects empty values', async () => {
    await expect(
      useCase.execute({ key: 'test_price_usd', value: '   ', updatedByUserId: 'admin-1' }),
    ).rejects.toThrow(BadRequestError);
  });
});
