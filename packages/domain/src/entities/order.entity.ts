import { Entity } from './base.entity';

export interface Order extends Entity {
  orderNumber: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
}
