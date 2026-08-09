import { Technology } from '../entities/technology.entity';

export interface ITechnologyRepository {
  findAll(): Promise<Technology[]>;
  findById(id: string): Promise<Technology | null>;
  findBySlug(slug: string): Promise<Technology | null>;
  save(technology: Technology): Promise<Technology>;
}
