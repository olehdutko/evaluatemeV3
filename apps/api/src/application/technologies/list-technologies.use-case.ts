import { Injectable, Inject } from '@nestjs/common';
import { ITechnologyRepository, ITechnologyRepositoryPort, Technology } from '@evaluateme/domain';

export interface ListTechnologiesResult {
  success: true;
  data: Technology[];
}

@Injectable()
export class ListTechnologiesUseCase {
  constructor(
    @Inject(ITechnologyRepository) private readonly repository: ITechnologyRepositoryPort,
  ) {}

  async execute(): Promise<ListTechnologiesResult> {
    const technologies = await this.repository.findAll();
    return { success: true, data: technologies };
  }
}
