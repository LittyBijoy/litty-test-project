import { apiRoot } from './client';
import { mapOrder } from '@/lib/mappers/order';
import type { Order } from '@/lib/types';

export async function getOrderById(orderId: string, locale: string): Promise<Order> {
  const { body } = await apiRoot.orders().withId({ ID: orderId }).get().execute();
  return mapOrder(body, locale);
}

export async function getCustomerOrders(customerId: string, locale: string): Promise<Order[]> {
  const { body } = await apiRoot
    .orders()
    .get({ queryArgs: { where: `customerId="${customerId}"`, sort: 'createdAt desc', limit: 50 } })
    .execute();
  return body.results.map((o) => mapOrder(o, locale));
}
