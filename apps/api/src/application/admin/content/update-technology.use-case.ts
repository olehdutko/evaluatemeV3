import { Inject, Injectable } from '@nestjs/common';
import { ITechnologyRepository } from '@evaluateme/domain';
import { BadRequestError, ConflictError, NotFoundError } from '../../../infrastructure/errors/app-error';

export interface UpdateTechnologyInput {
  id: string;
  name?: string;
  slug?: string;
  description?: string | null;
  quizQuestionCount?: number;
  quizDurationMinutes?: number;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class UpdateTechnologyUseCase {
  constructor(@Inject(ITechnologyRepository) private readonly repository: ITechnologyRepository) {}

  async execute(input: UpdateTechnologyInput): Promise<{
    success: true;
    data: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      quizQuestionCount: number;
      quizDurationMinutes: number;
      updatedAt: string;
    };
  }> {
    const existing = await this.repository.findById(input.id);
    if (!existing) {
      throw new NotFoundError('Technology', input.id);
    }

    const name = input.name !== undefined ? input.name.trim() : existing.name;
    const slug = input.slug !== undefined ? input.slug.trim() || generateSlug(name) : existing.slug;
    const description = input.description !== undefined ? input.description?.trim() ?? null : existing.description;
    const quizQuestionCount = input.quizQuestionCount ?? existing.quizQuestionCount;
    const quizDurationMinutes = input.quizDurationMinutes ?? existing.quizDurationMinutes;

    if (!name) {
      throw new BadRequestError({ name: ['Name is required'] });
    }
    if (!slug) {
      throw new BadRequestError({ slug: ['Slug is required'] });
    }

    if (name !== existing.name) {
      const nameConflict = await this.repository.findByName(name);
      if (nameConflict) {
        throw new ConflictError('A technology with this name already exists.');
      }
    }

    if (slug !== existing.slug) {
      const slugConflict = await this.repository.findBySlug(slug);
      if (slugConflict) {
        throw new ConflictError('A technology with this slug already exists.');
      }
    }

    const saved = await this.repository.save({
      ...existing,
      name,
      slug,
      description,
      quizQuestionCount,
      quizDurationMinutes,
      updatedAt: new Date(),
    });

    return {
      success: true,
      data: {
        id: saved.id,
        name: saved.name,
        slug: saved.slug,
        description: saved.description,
        quizQuestionCount: saved.quizQuestionCount,
        quizDurationMinutes: saved.quizDurationMinutes,
        updatedAt: saved.updatedAt.toISOString(),
      },
    };
  }
}
