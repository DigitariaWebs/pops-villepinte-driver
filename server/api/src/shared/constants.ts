import { OrderStatus } from './types';

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  received: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['picked_up'],
  picked_up: [],
  cancelled: [],
};

export const CUSTOMER_CANCELLABLE_STATUSES: OrderStatus[] = ['received'];
export const ADMIN_CANCELLABLE_STATUSES: OrderStatus[] = [
  'received',
  'preparing',
];

export const MAX_ITEMS_PER_ORDER = 50;
export const DEFAULT_PREP_BUFFER_MINUTES = 2;
