import { Entity } from './base.entity';

export interface CreditSetting extends Entity {
  key: string;
  value: string;
  updatedByUserId: string;
}
