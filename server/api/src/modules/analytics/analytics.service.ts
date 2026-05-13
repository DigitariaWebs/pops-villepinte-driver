import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../common/supabase/supabase.module';
import {
  KpisQueryDto,
  HourlyQueryDto,
  TopProductsQueryDto,
  SalesQueryDto,
} from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient,
  ) {}

  async getKpis(query: KpisQueryDto) {
    const date = query.date || new Date().toISOString().split('T')[0];
    const dayStart = `${date}T00:00:00.000Z`;
    const dayEnd = `${date}T23:59:59.999Z`;

    const { data: orders, error } = await this.supabase
      .from('orders')
      .select('total_eur, created_at, estimated_ready_at, picked_up_at, status')
      .gte('created_at', dayStart)
      .lte('created_at', dayEnd)
      .neq('status', 'cancelled');

    if (error) throw error;

    const count = orders.length;
    const revenue = orders.reduce((sum, o) => sum + (o.total_eur || 0), 0);
    const avgTicket = count > 0 ? revenue / count : 0;

    // Average prep time for completed orders
    const completedOrders = orders.filter((o) => o.picked_up_at);
    let avgPrepTime = 0;
    if (completedOrders.length > 0) {
      const totalPrepMs = completedOrders.reduce((sum, o) => {
        const created = new Date(o.created_at).getTime();
        const pickedUp = new Date(o.picked_up_at).getTime();
        return sum + (pickedUp - created);
      }, 0);
      avgPrepTime = Math.round(totalPrepMs / completedOrders.length / 60000);
    }

    return {
      date,
      order_count: count,
      revenue_eur: Math.round(revenue * 100) / 100,
      avg_ticket_eur: Math.round(avgTicket * 100) / 100,
      avg_prep_time_minutes: avgPrepTime,
    };
  }

  async getHourlySales(query: HourlyQueryDto) {
    const date = query.date || new Date().toISOString().split('T')[0];
    const dayStart = `${date}T00:00:00.000Z`;
    const dayEnd = `${date}T23:59:59.999Z`;

    const { data: orders, error } = await this.supabase
      .from('orders')
      .select('total_eur, created_at')
      .gte('created_at', dayStart)
      .lte('created_at', dayEnd)
      .neq('status', 'cancelled');

    if (error) throw error;

    // Group by hour
    const hourly: Record<number, { order_count: number; revenue_eur: number }> =
      {};
    for (let h = 0; h < 24; h++) {
      hourly[h] = { order_count: 0, revenue_eur: 0 };
    }

    for (const order of orders) {
      const hour = new Date(order.created_at).getUTCHours();
      hourly[hour].order_count++;
      hourly[hour].revenue_eur += order.total_eur || 0;
    }

    return Object.entries(hourly).map(([hour, data]) => ({
      hour: parseInt(hour),
      order_count: data.order_count,
      revenue_eur: Math.round(data.revenue_eur * 100) / 100,
    }));
  }

  async getTopProducts(query: TopProductsQueryDto) {
    const to = query.to || new Date().toISOString().split('T')[0];
    const from =
      query.from ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
    const limit = query.limit ?? 10;

    // Fetch order items with their orders for date filtering
    const { data: orders, error: ordersError } = await this.supabase
      .from('orders')
      .select('id')
      .gte('created_at', `${from}T00:00:00.000Z`)
      .lte('created_at', `${to}T23:59:59.999Z`)
      .neq('status', 'cancelled');

    if (ordersError) throw ordersError;
    if (!orders.length) return [];

    const orderIds = orders.map((o) => o.id);

    const { data: items, error: itemsError } = await this.supabase
      .from('order_items')
      .select('product_id, quantity, line_total_eur')
      .in('order_id', orderIds);

    if (itemsError) throw itemsError;

    // Aggregate by product
    const productStats: Record<
      string,
      { quantity: number; revenue: number }
    > = {};
    for (const item of items) {
      if (!productStats[item.product_id]) {
        productStats[item.product_id] = { quantity: 0, revenue: 0 };
      }
      productStats[item.product_id].quantity += item.quantity;
      productStats[item.product_id].revenue += item.line_total_eur || 0;
    }

    // Get product names
    const productIds = Object.keys(productStats);
    const { data: products } = await this.supabase
      .from('products')
      .select('id, name')
      .in('id', productIds);

    const productsMap = new Map(products?.map((p) => [p.id, p.name]) ?? []);

    // Sort and limit
    return Object.entries(productStats)
      .map(([productId, stats]) => ({
        product_id: productId,
        name: productsMap.get(productId) ?? 'Unknown',
        quantity_sold: stats.quantity,
        revenue_eur: Math.round(stats.revenue * 100) / 100,
      }))
      .sort((a, b) => b.quantity_sold - a.quantity_sold)
      .slice(0, limit);
  }

  async getSales(query: SalesQueryDto) {
    const to = query.to || new Date().toISOString().split('T')[0];
    const from =
      query.from ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

    const { data: orders, error } = await this.supabase
      .from('orders')
      .select('total_eur, created_at')
      .gte('created_at', `${from}T00:00:00.000Z`)
      .lte('created_at', `${to}T23:59:59.999Z`)
      .neq('status', 'cancelled');

    if (error) throw error;

    // Group by date
    const daily: Record<string, { order_count: number; revenue_eur: number }> =
      {};
    for (const order of orders) {
      const day = order.created_at.split('T')[0];
      if (!daily[day]) {
        daily[day] = { order_count: 0, revenue_eur: 0 };
      }
      daily[day].order_count++;
      daily[day].revenue_eur += order.total_eur || 0;
    }

    return Object.entries(daily)
      .map(([date, data]) => ({
        date,
        order_count: data.order_count,
        revenue_eur: Math.round(data.revenue_eur * 100) / 100,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getMenuPerformance(query: SalesQueryDto) {
    const to = query.to || new Date().toISOString().split('T')[0];
    const from =
      query.from ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

    const { data: orders, error: ordersError } = await this.supabase
      .from('orders')
      .select('id')
      .gte('created_at', `${from}T00:00:00.000Z`)
      .lte('created_at', `${to}T23:59:59.999Z`)
      .neq('status', 'cancelled');

    if (ordersError) throw ordersError;
    if (!orders.length) return [];

    const orderIds = orders.map((o) => o.id);

    const { data: items, error: itemsError } = await this.supabase
      .from('order_items')
      .select('product_id, quantity, line_total_eur')
      .in('order_id', orderIds);

    if (itemsError) throw itemsError;

    // Aggregate
    const stats: Record<
      string,
      { quantity: number; revenue: number; orders: Set<string> }
    > = {};
    for (const item of items) {
      if (!stats[item.product_id]) {
        stats[item.product_id] = { quantity: 0, revenue: 0, orders: new Set() };
      }
      stats[item.product_id].quantity += item.quantity;
      stats[item.product_id].revenue += item.line_total_eur || 0;
    }

    const productIds = Object.keys(stats);
    const { data: products } = await this.supabase
      .from('products')
      .select('id, name, category_id')
      .in('id', productIds);

    const productsMap = new Map(products?.map((p) => [p.id, p]) ?? []);

    return Object.entries(stats)
      .map(([productId, data]) => ({
        product_id: productId,
        name: productsMap.get(productId)?.name ?? 'Unknown',
        category_id: productsMap.get(productId)?.category_id ?? null,
        quantity_sold: data.quantity,
        revenue_eur: Math.round(data.revenue * 100) / 100,
      }))
      .sort((a, b) => b.revenue_eur - a.revenue_eur);
  }
}
