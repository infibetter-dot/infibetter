import {
  convertFromVND,
  formatCurrency,
  getCurrency,
  type CurrencyCode,
} from "./currency-system";

export function formatVND(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(n)) return "0₫";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

export const VND_TO_USD = 25500;

export function formatUSDFromVND(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(n)) return "$0.00";

  const usd = n / VND_TO_USD;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usd);
}

/**
 * Format giá theo currency khách đang chọn.
 *
 * Database vẫn lưu giá gốc bằng VND.
 *
 * Ví dụ:
 * 1,290,000 VND
 *
 * VND -> 1.290.000 ₫
 * USD -> $50.59
 * CAD -> CA$69.35
 */
export function formatPrice(
  value: number | string,
  currency?: CurrencyCode,
): string {
  const n = typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(n)) {
    return currency === "VND" ? "0₫" : "$0.00";
  }

  return formatCurrency(n, currency ?? getCurrency());
}

/**
 * Convert giá VND sang currency đang chọn.
 *
 * Dùng khi cần số tiền để tính toán,
 * không phải để hiển thị.
 */
export function convertPrice(
  value: number | string,
  currency?: CurrencyCode,
): number {
  const n = typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(n)) {
    return 0;
  }

  return convertFromVND(n, currency ?? getCurrency());
}