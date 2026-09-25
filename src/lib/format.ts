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