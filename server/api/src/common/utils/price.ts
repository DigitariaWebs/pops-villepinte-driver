interface PriceProduct {
  price_eur: number;
}

interface PriceVariant {
  price_eur: number;
}

interface PriceSupplement {
  price_eur: number;
}

export function recalculateLineUnitPrice(
  product: PriceProduct,
  variant: PriceVariant | null,
  supplements: PriceSupplement[],
): number {
  const base = variant ? variant.price_eur : product.price_eur;
  const supplementsTotal = supplements.reduce(
    (sum, s) => sum + s.price_eur,
    0,
  );
  return Math.round((base + supplementsTotal) * 100) / 100;
}

export function recalculateLineTotal(
  product: PriceProduct,
  variant: PriceVariant | null,
  supplements: PriceSupplement[],
  quantity: number,
): number {
  const unitPrice = recalculateLineUnitPrice(product, variant, supplements);
  return Math.round(unitPrice * quantity * 100) / 100;
}

export function recalculateOrderTotal(
  items: { unitPriceEur: number; quantity: number }[],
): number {
  return Math.round(
    items.reduce((sum, item) => sum + item.unitPriceEur * item.quantity, 0) *
      100,
  ) / 100;
}
