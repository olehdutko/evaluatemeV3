import { Inject, Injectable } from '@nestjs/common';
import { ILandingAdRepository, LandingAdPosition } from '@evaluateme/domain';
import { NotFoundError, BadRequestError } from '../../../infrastructure/errors/app-error';

export interface UpdateLandingAdInput {
  id: string;
  title: string;
  content?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  position: LandingAdPosition;
  isActive: boolean;
}

@Injectable()
export class UpdateLandingAdUseCase {
  constructor(@Inject(ILandingAdRepository) private readonly repository: ILandingAdRepository) {}

  async execute(input: UpdateLandingAdInput): Promise<{ success: true; data: { id: string; title: string; position: string; isActive: boolean; updatedAt: string } }> {
    const existing = await this.repository.findById(input.id);
    if (!existing) {
      throw new NotFoundError('LandingAd', input.id);
    }
    if (!input.title.trim()) {
      throw new BadRequestError({ title: ['Title is required'] });
    }
    if (!Object.values(LandingAdPosition).includes(input.position)) {
      throw new BadRequestError({ position: ['Invalid ad position'] });
    }

    const saved = await this.repository.save({
      ...existing,
      title: input.title.trim(),
      content: input.content?.trim() ?? null,
      imageUrl: input.imageUrl?.trim() ?? null,
      linkUrl: input.linkUrl?.trim() ?? null,
      position: input.position,
      isActive: input.isActive,
      updatedAt: new Date(),
    });

    return {
      success: true,
      data: {
        id: saved.id,
        title: saved.title,
        position: saved.position,
        isActive: saved.isActive,
        updatedAt: saved.updatedAt.toISOString(),
      },
    };
  }
}
