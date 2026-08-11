import { createUnitTestModule } from '../../../test-module.factory';
import { CreateTechnologyUseCase } from '../../../../../src/application/admin/content/create-technology.use-case';
import { ITechnologyRepository } from '@evaluateme/domain';
import { ConflictError, BadRequestError } from '../../../../../src/infrastructure/errors/app-error';

describe('CreateTechnologyUseCase', () => {
  let useCase: CreateTechnologyUseCase;
  let repository: jest.Mocked<ITechnologyRepository>;

  beforeEach(async () => {
    repository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findBySlug: jest.fn(),
      save: jest.fn().mockImplementation((tech) => Promise.resolve(tech)),
    };

    const module = await createUnitTestModule({
      providers: [CreateTechnologyUseCase, { provide: ITechnologyRepository, useValue: repository }],
    });

    useCase = module.get<CreateTechnologyUseCase>(CreateTechnologyUseCase);
  });

  it('creates a technology and generates slug from name', async () => {
    repository.findBySlug.mockResolvedValue(null);

    const result = await useCase.execute({ name: '  React JS  ', description: 'A library' });

    expect(result.success).toBe(true);
    expect(result.data.name).toBe('React JS');
    expect(result.data.slug).toBe('react-js');
  });

  it('rejects duplicate slug', async () => {
    repository.findBySlug.mockResolvedValue({
      id: 'existing',
      name: 'React',
      slug: 'react-js',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(useCase.execute({ name: 'React JS', slug: 'react-js' })).rejects.toThrow(ConflictError);
  });

  it('rejects empty name', async () => {
    await expect(useCase.execute({ name: '   ' })).rejects.toThrow(BadRequestError);
  });
});
