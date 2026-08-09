import { Entity } from './base.entity';

export interface Technology extends Entity {
  name: string;
  slug: string;
  description: string | null;
}
