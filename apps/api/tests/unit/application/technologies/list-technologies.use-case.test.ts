import { createUnitTestModule } from '../../test-module.factory';
import { ListTechnologiesUseCase } from '../../../../src/application/technologies/list-technologies.use-case';
import { ITechnologyRepository, ITechnologyRepositoryPort, Technology } from '@evaluateme/domain';

describe('ListTechnologiesUseCase', () => {
  let useCase: ListTechnologiesUseCase;
  let repository: jest.Mocked<ITechnologyRepositoryPort>;

  beforeEach(async () => {
    repository = {
      findAll: jest.fn().mockResolvedValue([
        {
          id: '1',
          name: 'TypeScript',
          slug: 'typescript',
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Technology,
      ]),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      save: jest.fn(),
    };

    const module = await createUnitTestModule({
      providers: [
        ListTechnologiesUseCase,
        { provide: ITechnologyRepository, useValue: repository },
      ],
    });

    useCase = module.get<ListTechnologiesUseCase>(ListTechnologiesUseCase);
  });

  it('returns a list of technologies', async () => {
    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].slug).toBe('typescript');
  });
});
