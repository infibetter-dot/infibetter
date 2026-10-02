import {
  convertFromUSD,
  formatCurrency,
  getCurrency,
  type CurrencyCode,
} from "./currency-system";

/**
 * ============================================================
 * INFIBETTER PRICE FORMAT
 * ============================================================
 *
 * DATABASE:
 * Product price được lưu bằng USD.
 *
 * Ví dụ:
 * price = 42
 *
 * USD -> $42.00
 * VND -> ₫1,071,000
 * CAD -> CA$57.96
 * AUD -> A$63.84
 * EUR -> €36.96
 * GBP -> £31.50
 * SGD -> S$53.76
 *
 * KHÔNG convert từ VND nữa.
 * ============================================================
 */

export const BASE_CURRENCY: CurrencyCode = "USD";

/**
 * Format trực tiếp giá USD.
 *
 * Dùng khi chắc chắn giá truyền vào là USD.
 */
export function formatUSD(
  value: number | string,
): string {
  const n =
    typeof value === "string"
      ? Number(value)
      : value;

  if (!Number.isFinite(n)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/**
 * Legacy helper.
 *
 * Giữ tên function cũ để tránh các component cũ bị lỗi import.
 *
 * IMPORTANT:
 * INFIBETTER DB hiện lưu USD.
 *
 * Vì vậy function này KHÔNG còn chia 25,500.
 * Nó chỉ format giá USD.
 */
export function formatUSDFromVND(
  value: number | string,
): string {
  return formatUSD(value);
}

/**
 * ============================================================
 * FORMAT PRICE
 * ============================================================
 *
 * Giá trong database = USD.
 *
 * currency:
 * - USD
 * - VND
 * - CAD
 * - AUD
 * - EUR
 * - GBP
 * - SGD
 *
 * Nếu không truyền currency:
 * → lấy currency khách đang chọn.
 */
export function formatPrice(
  value: number | string,
  currency?: CurrencyCode,
): string {
  const n =
    typeof value === "string"
      ? Number(value)
      : value;

  if (!Number.isFinite(n)) {
    const activeCurrency =
      currency ?? getCurrency();

    return activeCurrency === "VND"
      ? "₫0"
      : formatCurrency(
          0,
          activeCurrency,
        );
  }

  const activeCurrency =
    currency ?? getCurrency();

  return formatCurrency(
    n,
    activeCurrency,
  );
}

/**
 * ============================================================
 * CONVERT PRICE
 * ============================================================
 *
 * Convert giá từ USD trong database
 * sang currency khách đang chọn.
 *
 * Đây là số dùng cho:
 * - tính toán
 * - checkout
 * - cart
 * - shipping
 * - payment
 *
 * Không dùng function này để hiển thị trực tiếp.
 */
export function convertPrice(
  value: number | string,
  currency?: CurrencyCode,
): number {
  const n =
    typeof value === "string"
      ? Number(value)
      : value;

  if (!Number.isFinite(n)) {
    return 0;
  }

  const activeCurrency =
    currency ?? getCurrency();

  return convertFromUSD(
    n,
    activeCurrency,
  );
}

/**
 * ============================================================
 * FORMAT VND
 * ============================================================
 *
 * Helper riêng khi cần format một số đã là VND.
 *
 * Lưu ý:
 * Function này KHÔNG dùng cho product.price
 * vì product.price trong INFIBETTER là USD.
 */
export function formatVND(
  value: number | string,
): string {
  const n =
    typeof value === "string"
      ? Number(value)
      : value;

  if (!Number.isFinite(n)) {
    return "₫0";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}