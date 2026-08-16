'use client';

import { useCurrency } from './CurrencyProvider';

export default function Price({ amount, className, showTax = true }: { amount: number; className?: string, showTax?: boolean }) {
  const { formatPrice, formatPriceWithTax } = useCurrency();
  return <span className={className}>{showTax ? formatPriceWithTax(amount) : formatPrice(amount)}</span>;
}
