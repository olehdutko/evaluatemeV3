import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ListTechnologiesUseCase } from '../../application/technologies/list-technologies.use-case';
import { GetTechnologyUseCase } from '../../application/technologies/get-technology.use-case';
import { GetTechnologyPreviewUseCase } from '../../application/technologies/get-technology-preview.use-case';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';

@Controller('/api/v1/technologies')
export class TechnologiesController {
  constructor(
    private readonly listTechnologiesUseCase: ListTechnologiesUseCase,
    private readonly getTechnologyUseCase: GetTechnologyUseCase,
    private readonly getTechnologyPreviewUseCase: GetTechnologyPreviewUseCase,
  ) {}

  @Get()
  async list(): Promise<ReturnType<ListTechnologiesUseCase['execute']>> {
    return this.listTechnologiesUseCase.execute();
  }

  @Get(':slug')
  async get(@Param('slug') slug: string): Promise<ReturnType<GetTechnologyUseCase['execute']>> {
    return this.getTechnologyUseCase.execute(slug);
  }

  @Get(':slug/preview')
  @UseGuards(JwtAuthGuard)
  async preview(
    @Param('slug') slug: string,
  ): Promise<ReturnType<GetTechnologyPreviewUseCase['execute']>> {
    return this.getTechnologyPreviewUseCase.execute(slug);
  }
}
