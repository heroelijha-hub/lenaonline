export type CurrencyOptions = {
  currencySymbol: string;
  currencyPosition: 'left' | 'right' | 'left-space' | 'right-space';
  thousandSeparator: string;
  decimalSeparator: string;
};

export const defaultCurrencyOptions: CurrencyOptions = {
  currencySymbol: '$',
  currencyPosition: 'left',
  thousandSeparator: ',',
  decimalSeparator: '.',
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
