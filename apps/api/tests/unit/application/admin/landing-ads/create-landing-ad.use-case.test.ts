import { createUnitTestModule } from '../../../test-module.factory';
import { CreateLandingAdUseCase } from '../../../../../src/application/admin/landing-ads/create-landing-ad.use-case';
import { ILandingAdRepository, LandingAdPosition } from '@evaluateme/domain';
import { BadRequestError } from '../../../../../src/infrastructure/errors/app-error';

describe('CreateLandingAdUseCase', () => {
  let useCase: CreateLandingAdUseCase;
  let repository: jest.Mocked<ILandingAdRepository>;

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(),
      findActiveByPosition: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module = await createUnitTestModule({
      providers: [CreateLandingAdUseCase, { provide: ILandingAdRepository, useValue: repository }],
    });

    useCase = module.get<CreateLandingAdUseCase>(CreateLandingAdUseCase);
  });

  it('creates an ad with trimmed fields', async () => {
    repository.save.mockImplementation(async (ad) => ad);

    const result = await useCase.execute({
      title: '  New Promo  ',
      content: '  Sign up now  ',
      position: LandingAdPosition.SIDEBAR,
      isActive: true,
    });

    expect(result.success).toBe(true);
    expect(result.data.title).toBe('New Promo');
    expect(result.data.position).toBe('sidebar');
  });

  it('rejects empty title', async () => {
    await expect(
      useCase.execute({ title: '   ', position: LandingAdPosition.HOME_TOP, isActive: false }),
    ).rejects.toThrow(BadRequestError);
  });

  it('rejects invalid position', async () => {
    await expect(
      useCase.execute({ title: 'Bad', position: 'invalid' as LandingAdPosition, isActive: false }),
    ).rejects.toThrow(BadRequestError);
  });
});
