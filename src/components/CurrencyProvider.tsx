'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { formatPriceNumber, CurrencyOptions, defaultCurrencyOptions } from '@/lib/formatPrice';

interface CurrencyContextType {
  options: CurrencyOptions;
  formatPrice: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  options: defaultCurrencyOptions,
  formatPrice: (amount: number) => formatPriceNumber(amount, defaultCurrencyOptions),
});

export const useCurrency = () => useContext(CurrencyContext);

export default function CurrencyProvider({
  children,
  options,
}: {
  children: ReactNode;
  options: CurrencyOptions;
}) {
  const formatPrice = (amount: number) => formatPriceNumber(amount, options);

  return (
    <CurrencyContext.Provider value={{ options, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}
