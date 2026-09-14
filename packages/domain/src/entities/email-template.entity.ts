import { Entity } from './base.entity';

export interface EmailTemplate extends Entity {
  name: string;
  subject: string;
  bodyHtml: string;
  variables: Record<string, string> | null;
}
