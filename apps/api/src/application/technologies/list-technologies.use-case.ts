import { Injectable, Inject } from '@nestjs/common';
import { ITechnologyRepository, Technology } from '@evaluateme/domain';

@Injectable()
export class ListTechnologiesUseCase {
  constructor(
    @Inject(ITechnologyRepository) private readonly technologyRepository: ITechnologyRepository,
  ) {}

  async execute(): Promise<{ success: true; data: Technology[] }> {
    const technologies = await this.technologyRepository.findAll();
    return {
      success: true,
      data: technologies,
    };
  }
}
