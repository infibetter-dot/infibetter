/**
 * INFIBETTER Currency System
 *
 * Giá gốc của sản phẩm trong database: VND
 * Currency được khách chọn sẽ quyết định cách hiển thị giá.
 *
 * Lưu lựa chọn vào localStorage để reload trang vẫn giữ currency.
 */

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

  /**
   * Số VND tương đương với 1 đơn vị currency.
   *
   * Ví dụ:
   * 1 USD = 25,500 VND
   */
  vndPerUnit: number;
}

/**
 * Currency mặc định.
 *
 * INFIBETTER hiện mặc định USD cho khách quốc tế.
 * Nếu muốn mặc định VND chỉ cần đổi thành "VND".
 */
export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export const CURRENCY_STORAGE_KEY = "infibetter_currency";

/**
 * Tỷ giá hiển thị.
 *
 * Giá sản phẩm trong DB vẫn giữ nguyên VND.
 *
 * Có thể thay đổi các rate này sau khi bạn muốn dùng
 * tỷ giá riêng của INFIBETTER.
 */
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

/**
 * Kiểm tra currency có hợp lệ không.
 */
export function isCurrencyCode(
  value: string | null | undefined,
): value is CurrencyCode {
  return Boolean(value && value in CURRENCIES);
}

/**
 * Lấy currency hiện tại.
 *
 * SSR-safe:
 * nếu window chưa tồn tại thì dùng DEFAULT_CURRENCY.
 */
export function getCurrency(): CurrencyCode {
  if (typeof window === "undefined") {
    return DEFAULT_CURRENCY;
  }

  const saved = window.localStorage.getItem(CURRENCY_STORAGE_KEY);

  if (isCurrencyCode(saved)) {
    return saved;
  }

  return DEFAULT_CURRENCY;
}

/**
 * Đổi currency.
 *
 * Hàm này chỉ lưu lựa chọn.
 * Các component đang nghe event "infibetter:currency-change"
 * sẽ tự render lại.
 */
export function setCurrency(currency: CurrencyCode): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);

  window.dispatchEvent(
    new CustomEvent("infibetter:currency-change", {
      detail: {
        code: currency,
        config: CURRENCIES[currency],
      },
    }),
  );
}

/**
 * Lấy config currency hiện tại.
 */
export function getCurrencyConfig(
  currency: CurrencyCode = getCurrency(),
): CurrencyConfig {
  return CURRENCIES[currency];
}

/**
 * Convert VND -> currency đang chọn.
 */
export function convertFromVND(
  value: number | string | null | undefined,
  currency: CurrencyCode = getCurrency(),
): number {
  const vnd = Number(value);

  if (!Number.isFinite(vnd)) {
    return 0;
  }

  const config = CURRENCIES[currency];

  if (!config || config.vndPerUnit <= 0) {
    return 0;
  }

  return vnd / config.vndPerUnit;
}

/**
 * Format giá từ VND sang currency đang chọn.
 *
 * Ví dụ:
 *
 * formatCurrency(1290000, "VND")
 * -> 1.290.000 ₫
 *
 * formatCurrency(1290000, "USD")
 * -> $50.59
 *
 * formatCurrency(1290000, "CAD")
 * -> CA$69.35
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currency: CurrencyCode = getCurrency(),
): string {
  const config = CURRENCIES[currency];

  if (!config) {
    return "0";
  }

  const converted = convertFromVND(value, currency);

  /**
   * VND không cần số thập phân.
   */
  const maximumFractionDigits = currency === "VND" ? 0 : 2;

  const minimumFractionDigits = currency === "VND" ? 0 : 2;

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(converted);
}

/**
 * Convert trực tiếp VND -> một currency cụ thể.
 */
export function formatCurrencyFromVND(
  value: number | string | null | undefined,
  currency: CurrencyCode,
): string {
  return formatCurrency(value, currency);
}

/**
 * Hook-free event listener helper.
 *
 * Dùng trong React component:
 *
 * useCurrencyChange(() => {
 *   // refresh UI
 * });
 */
export function subscribeToCurrencyChange(
  callback: (currency: CurrencyCode) => void,
): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<{
      code?: CurrencyCode;
    }>;

    const code = customEvent.detail?.code;

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

/**
 * Danh sách currency dùng cho selector/footer.
 */
export const CURRENCY_LIST = Object.values(CURRENCIES);
