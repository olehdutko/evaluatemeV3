import { Order } from '../entities/order.entity';

export const IOrderRepository = Symbol('IOrderRepository');

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  save(order: Order): Promise<Order>;
}
