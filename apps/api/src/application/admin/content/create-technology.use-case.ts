import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ITechnologyRepository } from '@evaluateme/domain';
import { BadRequestError, ConflictError } from '../../../infrastructure/errors/app-error';

export interface CreateTechnologyInput {
  name: string;
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
export class CreateTechnologyUseCase {
  constructor(@Inject(ITechnologyRepository) private readonly repository: ITechnologyRepository) {}

  async execute(input: CreateTechnologyInput): Promise<{ success: true; data: { id: string; name: string; slug: string; description: string | null; quizQuestionCount: number; quizDurationMinutes: number; updatedAt: string } }> {
    const name = input.name.trim();
    const slug = input.slug?.trim() || generateSlug(name);
    const description = input.description?.trim() ?? null;
    const quizQuestionCount = input.quizQuestionCount ?? 20;
    const quizDurationMinutes = input.quizDurationMinutes ?? 40;

    if (!name) {
      throw new BadRequestError({ name: ['Name is required'] });
    }
    if (!slug) {
      throw new BadRequestError({ slug: ['Slug is required'] });
    }

    const existingSlug = await this.repository.findBySlug(slug);
    if (existingSlug) {
      throw new ConflictError('A technology with this slug already exists.');
    }

    const existingName = await this.repository.findByName(name);
    if (existingName) {
      throw new ConflictError('A technology with this name already exists.');
    }

    const saved = await this.repository.save({
      id: randomUUID(),
      name,
      slug,
      description,
      quizQuestionCount,
      quizDurationMinutes,
      createdAt: new Date(),
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
