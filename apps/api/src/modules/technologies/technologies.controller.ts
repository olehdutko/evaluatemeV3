import { Controller, Get, Param } from '@nestjs/common';
import { ListTechnologiesUseCase } from '../../application/technologies/list-technologies.use-case';
import { GetTechnologyUseCase } from '../../application/technologies/get-technology.use-case';

@Controller('/api/v1/technologies')
export class TechnologiesController {
  constructor(
    private readonly listTechnologiesUseCase: ListTechnologiesUseCase,
    private readonly getTechnologyUseCase: GetTechnologyUseCase,
  ) {}

  @Get()
  async list(): Promise<ReturnType<ListTechnologiesUseCase['execute']>> {
    return this.listTechnologiesUseCase.execute();
  }

  @Get(':slug')
  async get(@Param('slug') slug: string): Promise<ReturnType<GetTechnologyUseCase['execute']>> {
    return this.getTechnologyUseCase.execute(slug);
  }
}
