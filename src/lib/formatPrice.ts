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
 * Calcule le prix TTC si le prix de base est HT, et formate la chaîne complète.
 * Si le paramètre 'taxIncludedInPrice' est vrai : affiche simplement "Prix TTC" (ex: 120€ TTC)
 * S'il est faux : le prix en base est HT, on affiche "Prix HT (Prix TTC TTC)" (ex: 100€ HT (120€ TTC))
 */
export function formatPriceWithTax(
  amount: number,
  options: CurrencyOptions = defaultCurrencyOptions
): string {
  const isIncluded = options.taxIncludedInPrice !== false;
  const vatRate = options.defaultVatRate || 20;

  if (isIncluded) {
    return `${formatPriceNumber(amount, options)} TTC`;
  } else {
    const amountTTC = amount * (1 + vatRate / 100);
    const formattedHT = formatPriceNumber(amount, options);
    const formattedTTC = formatPriceNumber(amountTTC, options);
    return `${formattedHT} HT (${formattedTTC} TTC)`;
  }
}
