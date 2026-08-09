import { Order } from '../entities/order.entity';

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  save(order: Order): Promise<Order>;
}
