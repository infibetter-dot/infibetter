export type CurrencyCode =
  | "VND"
  | "USD"
  | "CAD"
  | "AUD"
  | "EUR"
  | "GBP"
  | "SGD";

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  locale: string;

  // 1 currency = bao nhiêu VND
  vndPerUnit: number;
}

/**
 * INFIBETTER:
 *
 * DATABASE BASE CURRENCY = USD
 *
 * Ví dụ:
 * products.price = 42
 * => $42.00
 */
export const BASE_CURRENCY: CurrencyCode = "USD";

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export const CURRENCY_STORAGE_KEY = "infibetter_currency";

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  VND: {
    code: "VND",
    name: "Vietnamese Dong",
    symbol: "₫",
    locale: "vi-VN",
    vndPerUnit: 1,
  },

  USD: {
    code: "USD",
    name: "United States Dollar",
    symbol: "$",
    locale: "en-US",
    vndPerUnit: 25500,
  },

  CAD: {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "CA$",
    locale: "en-CA",
    vndPerUnit: 18600,
  },

  AUD: {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    locale: "en-AU",
    vndPerUnit: 16800,
  },

  EUR: {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    locale: "de-DE",
    vndPerUnit: 30000,
  },

  GBP: {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    locale: "en-GB",
    vndPerUnit: 34500,
  },

  SGD: {
    code: "SGD",
    name: "Singapore Dollar",
    symbol: "S$",
    locale: "en-SG",
    vndPerUnit: 20000,
  },
};

export function isCurrencyCode(
  value: string | null | undefined,
): value is CurrencyCode {
  return Boolean(value && value in CURRENCIES);
}

export function getCurrency(): CurrencyCode {
  if (typeof window === "undefined") {
    return DEFAULT_CURRENCY;
  }

  const saved = window.localStorage.getItem(
    CURRENCY_STORAGE_KEY,
  );

  if (isCurrencyCode(saved)) {
    return saved;
  }

  return DEFAULT_CURRENCY;
}

export function setCurrency(
  currency: CurrencyCode,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    CURRENCY_STORAGE_KEY,
    currency,
  );

  window.dispatchEvent(
    new CustomEvent("infibetter:currency-change", {
      detail: {
        code: currency,
        config: CURRENCIES[currency],
      },
    }),
  );
}

export function getCurrencyConfig(
  currency: CurrencyCode = getCurrency(),
): CurrencyConfig {
  return CURRENCIES[currency];
}

/**
 * USD -> currency đang chọn
 *
 * DATABASE = USD
 */
export function convertFromUSD(
  value: number | string | null | undefined,
  currency: CurrencyCode = getCurrency(),
): number {
  const usd = Number(value);

  if (!Number.isFinite(usd)) {
    return 0;
  }

  const target = CURRENCIES[currency];

  if (!target) {
    return 0;
  }

  const usdConfig = CURRENCIES.USD;

  // USD -> USD
  if (currency === "USD") {
    return usd;
  }

  // USD -> VND -> target currency
  const vnd = usd * usdConfig.vndPerUnit;

  return vnd / target.vndPerUnit;
}

/**
 * Format giá DATABASE USD
 * sang currency khách đang chọn.
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currency: CurrencyCode = getCurrency(),
): string {
  const config = CURRENCIES[currency];

  if (!config) {
    return "$0.00";
  }

  const converted = convertFromUSD(
    value,
    currency,
  );

  const digits =
    currency === "VND" ? 0 : 2;

  return new Intl.NumberFormat(
    config.locale,
    {
      style: "currency",
      currency: config.code,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    },
  ).format(converted);
}

/**
 * Alias tương thích với code cũ.
 */
export function formatCurrencyFromUSD(
  value: number | string | null | undefined,
  currency: CurrencyCode,
): string {
  return formatCurrency(value, currency);
}

/**
 * Alias cũ nếu project còn dùng.
 */
export function formatCurrencyFromVND(
  value: number | string | null | undefined,
  currency: CurrencyCode,
): string {
  // Giá sản phẩm INFIBETTER hiện tại là USD.
  return formatCurrency(value, currency);
}

export function subscribeToCurrencyChange(
  callback: (currency: CurrencyCode) => void,
): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = (event: Event) => {
    const customEvent =
      event as CustomEvent<{
        code?: CurrencyCode;
      }>;

    const code =
      customEvent.detail?.code;

    if (isCurrencyCode(code)) {
      callback(code);
    }
  };

  window.addEventListener(
    "infibetter:currency-change",
    handler as EventListener,
  );

  return () => {
    window.removeEventListener(
      "infibetter:currency-change",
      handler as EventListener,
    );
  };
}

export const CURRENCY_LIST =
  Object.values(CURRENCIES);