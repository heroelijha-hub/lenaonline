export type CurrencyOptions = {
  currencySymbol: string;
  currencyPosition: 'left' | 'right' | 'left-space' | 'right-space';
  thousandSeparator: string;
  decimalSeparator: string;
  taxIncludedInPrice?: boolean;
  defaultVatRate?: number;
};

export const defaultCurrencyOptions: CurrencyOptions = {
  currencySymbol: '$',
  currencyPosition: 'left',
  thousandSeparator: ',',
  decimalSeparator: '.',
  taxIncludedInPrice: true,
  defaultVatRate: 20,
};

export function formatPriceNumber(
  amount: number,
  options: CurrencyOptions = defaultCurrencyOptions
): string {
  // Convert amount to string with 2 decimal places
  const amountStr = amount.toFixed(2);
  const [integerPart, decimalPart] = amountStr.split('.');

  // Format integer part with thousand separator
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, options.thousandSeparator);

  // Combine with decimal separator
  const formattedNumber = `${formattedInteger}${options.decimalSeparator}${decimalPart}`;

  // Apply currency symbol position
  switch (options.currencyPosition) {
    case 'left':
      return `${options.currencySymbol}${formattedNumber}`;
    case 'left-space':
      return `${options.currencySymbol} ${formattedNumber}`;
    case 'right':
      return `${formattedNumber}${options.currencySymbol}`;
    case 'right-space':
      return `${formattedNumber} ${options.currencySymbol}`;
    default:
      return `${options.currencySymbol}${formattedNumber}`;
  }
}

/**
 * Calculates the tax-inclusive price if the base price is tax-exclusive, and formats the complete string.
 * If 'taxIncludedInPrice' is true: simply displays the price (ex: 120€ incl. tax)
 * If false: the base price is tax exclusive, we display "Price excl. tax (Price incl. tax)" (ex: 100$ excl. tax (120$ incl. tax))
 */
export function formatPriceWithTax(
  amount: number,
  options: CurrencyOptions = defaultCurrencyOptions
): string {
  const isIncluded = options.taxIncludedInPrice !== false;
  const vatRate = options.defaultVatRate || 20;

  if (isIncluded) {
    return `${formatPriceNumber(amount, options)} incl. tax`;
  } else {
    const amountTTC = amount * (1 + vatRate / 100);
    const formattedHT = formatPriceNumber(amount, options);
    const formattedTTC = formatPriceNumber(amountTTC, options);
    return `${formattedHT} excl. tax (${formattedTTC} incl. tax)`;
  }
}
