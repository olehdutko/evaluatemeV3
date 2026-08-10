import { Entity } from './base.entity';

export const OrderStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface Order extends Entity {
  orderNumber: string;
  userId: string;
  amount: number;
  currency: string;
  status: OrderStatus;
}
