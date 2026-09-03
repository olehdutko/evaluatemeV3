import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITechnologyRepository, Technology } from '@evaluateme/domain';

@Injectable()
export class GetTechnologyUseCase {
  constructor(
    @Inject(ITechnologyRepository) private readonly technologyRepository: ITechnologyRepository,
  ) {}

  async execute(slug: string): Promise<{ success: true; data: Technology }> {
    const technology = await this.technologyRepository.findBySlug(slug);
    if (!technology) {
      throw new NotFoundException('Technology not found');
    }
    return {
      success: true,
      data: technology,
    };
  }
}
