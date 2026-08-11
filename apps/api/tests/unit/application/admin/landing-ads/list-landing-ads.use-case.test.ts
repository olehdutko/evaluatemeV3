import { createUnitTestModule } from '../../../test-module.factory';
import { ListLandingAdsUseCase } from '../../../../../src/application/admin/landing-ads/list-landing-ads.use-case';
import { ILandingAdRepository, LandingAdPosition } from '@evaluateme/domain';

describe('ListLandingAdsUseCase', () => {
  let useCase: ListLandingAdsUseCase;
  let repository: jest.Mocked<ILandingAdRepository>;

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(),
      findActiveByPosition: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module = await createUnitTestModule({
      providers: [ListLandingAdsUseCase, { provide: ILandingAdRepository, useValue: repository }],
    });

    useCase = module.get<ListLandingAdsUseCase>(ListLandingAdsUseCase);
  });

  it('returns all landing ads', async () => {
    repository.findAll.mockResolvedValue([
      {
        id: 'ad-1',
        title: 'Summer Promo',
        content: 'Get started today.',
        imageUrl: null,
        linkUrl: '/register',
        position: LandingAdPosition.HOME_TOP,
        isActive: true,
        createdAt: new Date('2026-08-01T00:00:00Z'),
        updatedAt: new Date('2026-08-10T00:00:00Z'),
      },
    ]);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: 'ad-1',
      title: 'Summer Promo',
      position: 'home_top',
      isActive: true,
    });
  });
});
