import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../common/supabase/supabase.module';
import { loyaltyTier, LoyaltyTier } from '../../common/utils/loyalty';
import { CustomersQueryDto } from './dto/customers-query.dto';

const TIER_RANGES: Record<string, { min: number; max: number }> = {
  BIENVENUE: { min: 0, max: 4 },
  HABITUE: { min: 5, max: 19 },
  VIP: { min: 20, max: 49 },
  LEGENDE: { min: 50, max: 999999 },
};

@Injectable()
export class AdminCustomersService {
  constructor(
    @Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient,
  ) {}

  async getCustomers(query: CustomersQueryDto) {
    let qb = this.supabase.from('profiles').select('*');

    if (query.search) {
      qb = qb.or(
        `name.ilike.%${query.search}%,phone.ilike.%${query.search}%`,
      );
    }

    if (query.tier) {
      const range = TIER_RANGES[query.tier];
      if (range) {
        qb = qb.gte('order_count', range.min).lte('order_count', range.max);
      }
    }

    qb = qb
      .order('created_at', { ascending: false })
      .range(query.offset, query.offset + (query.limit ?? 20) - 1);

    const { data, error } = await qb;
    if (error) throw error;

    return data.map((profile) => ({
      ...profile,
      loyalty_tier: loyaltyTier(profile.order_count),
    }));
  }

  async getCustomerDetail(id: string) {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !profile) throw new NotFoundException('Customer not found');

    const { data: orders } = await this.supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    return {
      ...profile,
      loyalty_tier: loyaltyTier(profile.order_count),
      recent_orders: orders ?? [],
    };
  }

  async blockCustomer(id: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({ is_blocked: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new NotFoundException('Customer not found');
    return data;
  }

  async unblockCustomer(id: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({ is_blocked: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new NotFoundException('Customer not found');
    return data;
  }
}
