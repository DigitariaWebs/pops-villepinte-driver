export type LoyaltyTier = 'BIENVENUE' | 'HABITUE' | 'VIP' | 'LEGENDE';

export function loyaltyTier(orderCount: number): LoyaltyTier {
  if (orderCount >= 50) return 'LEGENDE';
  if (orderCount >= 20) return 'VIP';
  if (orderCount >= 5) return 'HABITUE';
  return 'BIENVENUE';
}
