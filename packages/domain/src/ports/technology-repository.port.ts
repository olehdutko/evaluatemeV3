import { Technology } from '../entities/technology.entity';

export const ITechnologyRepository = Symbol('ITechnologyRepository');

export interface ITechnologyRepository {
  findById(id: string): Promise<Technology | null>;
  findAll(): Promise<Technology[]>;
  findBySlug(slug: string): Promise<Technology | null>;
  findByName(name: string): Promise<Technology | null>;
  save(technology: Technology): Promise<Technology>;
  delete(id: string): Promise<void>;
}
