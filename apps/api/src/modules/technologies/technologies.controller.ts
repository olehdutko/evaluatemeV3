import { Controller, Get } from '@nestjs/common';
import { ListTechnologiesUseCase } from '../../application/technologies/list-technologies.use-case';

@Controller('/api/v1/technologies')
export class TechnologiesController {
  constructor(private readonly listTechnologiesUseCase: ListTechnologiesUseCase) {}

  @Get()
  async list(): Promise<ReturnType<ListTechnologiesUseCase['execute']>> {
    return this.listTechnologiesUseCase.execute();
  }
}
