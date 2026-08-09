import { Entity } from './base.entity';

export interface EmailTemplate extends Entity {
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string | null;
  variables: Record<string, string> | null;
}
