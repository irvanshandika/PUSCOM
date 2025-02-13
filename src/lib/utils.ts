/* eslint-disable @typescript-eslint/no-unused-vars */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number,
  currency: string = "IDR",
  locale: string = "id-ID"
): string {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    return formatter.format(amount);
  } catch (error) {
    return `${currency} ${amount.toLocaleString(locale)}`;
  }
}

export function formatCurrencyCustom(
  amount: number,
  options: {
    currency?: string;
    locale?: string;
    compact?: boolean;
    showDecimal?: boolean;
  } = {}
): string {
  const {
    currency = "IDR",
    locale = "id-ID",
    compact = false,
    showDecimal = false,
  } = options;

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: showDecimal ? 2 : 0,
      maximumFractionDigits: showDecimal ? 2 : 0,
      notation: compact ? "compact" : "standard",
    });

    return formatter.format(amount);
  } catch (error) {
    return `${currency} ${amount.toLocaleString(locale)}`;
  }
}