import { Technology } from '../entities/technology.entity';

export interface ITechnologyRepositoryPort {
  findAll(): Promise<Technology[]>;
  findById(id: string): Promise<Technology | null>;
  findBySlug(slug: string): Promise<Technology | null>;
  save(technology: Technology): Promise<Technology>;
}

export const ITechnologyRepository = Symbol('ITechnologyRepository') as unknown as new () => ITechnologyRepositoryPort;
