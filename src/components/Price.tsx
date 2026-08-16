'use client';

import { useCurrency } from './CurrencyProvider';

export default function Price({ amount, className }: { amount: number; className?: string }) {
  const { formatPrice } = useCurrency();
  return <span className={className}>{formatPrice(amount)}</span>;
}
