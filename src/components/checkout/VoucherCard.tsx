import { motion } from "framer-motion";
import {
  Check,
  CircleDollarSign,
  Gift,
  Lock,
  Package,
  Percent,
  TicketPercent,
  Truck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { VoucherDisplay } from "./voucher.types";

interface VoucherCardProps {
  voucher: VoucherDisplay;
  selected: boolean;
  disabled: boolean;
  saving: number;
  remain: number;
  onSelect: (voucher: VoucherDisplay | null) => void;
  bestVoucher?: VoucherDisplay | null;
}

const ICONS = {
  gift: Gift,
  truck: Truck,
  percent: Percent,
  discount: CircleDollarSign,
  voucher: TicketPercent,
  default: Package,
} as const;

function getVoucherIcon(icon?: string) {
  if (!icon) return ICONS.default;

  switch (icon.toLowerCase()) {
    case "gift":
      return ICONS.gift;
    case "truck":
    case "shipping":
      return ICONS.truck;
    case "percent":
      return ICONS.percent;
    case "discount":
      return ICONS.discount;
    case "voucher":
      return ICONS.voucher;
    default:
      return ICONS.default;
  }
}

function formatPrice(value: number) {
  return `${Math.round(value).toLocaleString("vi-VN")}đ`;
}

export default function VoucherCard({
  voucher,
  selected,
  disabled,
  saving,
  remain,
  onSelect,
  bestVoucher,
}: VoucherCardProps) {
  const Icon = getVoucherIcon(voucher.icon);
  const badgeColor = voucher.badgeColor ?? "#5F6F5D";

  const handleClick = () => {
    if (disabled) return;
    onSelect(voucher);
  };

  return (
    <motion.div
      layout
      whileHover={!disabled ? { scale: 1.005 } : undefined}
      whileTap={!disabled ? { scale: 0.995 } : undefined}
      transition={{ duration: 0.14 }}
      className="h-full"
    >
      <Card
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-selected={selected}
        aria-disabled={disabled}
        onClick={handleClick}
        onKeyDown={(event) => {
          if (disabled) return;

          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick();
          }
        }}
        className={cn(
          "overflow-hidden rounded-xl border border-[#DEDED9] bg-white shadow-none transition-all",
          selected && "border-[#5F6F5D] ring-1 ring-[#5F6F5D]/20",
          disabled && "cursor-not-allowed opacity-70",
        )}
      >
        <div className="p-3.5 sm:p-4">
          <div className="flex items-start gap-3">
            {/* Lucide voucher icon */}
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                selected
                  ? "bg-[#5F6F5D] text-white"
                  : "bg-[#F1F3EF] text-[#4F604E]",
              )}
            >
              <Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
            </div>

            <div className="min-w-0 flex-1">
              {/* Title + badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="min-w-0 text-[14px] font-semibold leading-5 text-[#202020]">
                  {voucher.title}
                </h3>

                {voucher.id === bestVoucher?.id && (
                  <Badge className="shrink-0 rounded-full border-0 bg-[#F0F2EE] px-2 py-0.5 text-[10px] font-semibold text-[#4F604E] shadow-none">
                    <Percent
                      className="mr-1 h-2.5 w-2.5"
                      strokeWidth={2}
                    />
                    Tốt nhất
                  </Badge>
                )}

                {selected && (
                  <Badge className="shrink-0 rounded-full border-0 bg-[#E4ECE3] px-2 py-0.5 text-[10px] font-semibold text-[#425440] shadow-none">
                    <Check
                      className="mr-1 h-2.5 w-2.5"
                      strokeWidth={2.2}
                    />
                    Đang áp dụng
                  </Badge>
                )}

                {voucher.badge && (
                  <Badge
                    className="shrink-0 rounded-full border-0 px-2 py-0.5 text-[10px] font-semibold !text-white shadow-none"
                    style={{ backgroundColor: badgeColor }}
                  >
                    {voucher.badge}
                  </Badge>
                )}
              </div>

              {/* Code */}
              <p className="mt-1 font-mono text-[11px] font-medium tracking-[0.03em] text-[#555555]">
                {voucher.code}
              </p>

              {/* Description */}
              {!!voucher.description && (
                <p className="mt-1 text-[11px] leading-[1.45] text-[#555555]">
                  {voucher.description}
                </p>
              )}

              {/* Minimum order */}
              <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-[#555555]">
                <TicketPercent
                  className="h-3.5 w-3.5 shrink-0 text-[#6B6B6B]"
                  strokeWidth={1.7}
                />
                <span>
                  Đơn từ{" "}
                  <strong className="font-semibold text-[#333333]">
                    {formatPrice(voucher.min_order)}
                  </strong>
                </span>
              </div>

              {/* Saving / remaining */}
              {disabled ? (
                <div className="mt-2.5 flex items-center justify-between rounded-lg border border-[#E5E1D8] bg-[#FAF8F3] px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Lock
                      className="h-3.5 w-3.5 text-[#666666]"
                      strokeWidth={1.8}
                    />
                    <span className="text-[10.5px] font-medium text-[#555555]">
                      Còn thiếu
                    </span>
                  </div>

                  <span className="text-[11.5px] font-semibold text-[#333333]">
                    {formatPrice(remain)}
                  </span>
                </div>
              ) : (
                <div className="mt-2.5 flex items-center justify-between rounded-lg bg-[#F2F4F1] px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <CircleDollarSign
                      className="h-3.5 w-3.5 text-[#52624F]"
                      strokeWidth={1.8}
                    />
                    <span className="text-[10.5px] font-medium text-[#555555]">
                      Ưu đãi
                    </span>
                  </div>

                  <span className="text-[12px] font-bold text-[#465643]">
                    {formatPrice(saving)}
                  </span>
                </div>
              )}

              {/* Action */}
              <div className="mt-2.5">
                {selected ? (
                  <div className="space-y-1.5">
                    <Button
                      type="button"
                      disabled
                      className="!h-9 w-full rounded-lg border border-[#5F6F5D] !bg-[#5F6F5D] px-3 text-[11.5px] font-semibold !text-white opacity-100 shadow-none hover:!bg-[#5F6F5D] disabled:!opacity-100"
                    >
                      <Check
                        className="mr-1.5 h-3.5 w-3.5"
                        strokeWidth={2.2}
                      />
                      Đang áp dụng
                    </Button>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(null);
                      }}
                      className="flex h-7 w-full items-center justify-center rounded-md text-[10.5px] font-medium text-[#666666] transition-colors hover:bg-[#F5F5F3] hover:text-[#222222]"
                    >
                      Hủy áp dụng
                    </button>
                  </div>
                ) : disabled ? (
                  <Button
                    type="button"
                    disabled
                    className="!h-9 w-full rounded-lg border border-[#E0E0DC] !bg-[#F0F0ED] text-[10.5px] font-medium !text-[#777777] shadow-none disabled:!opacity-100"
                  >
                    <Lock
                      className="mr-1.5 h-3.5 w-3.5"
                      strokeWidth={1.8}
                    />
                    Chưa đủ điều kiện
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="!h-9 w-full rounded-lg !bg-[#111111] text-[11.5px] font-semibold !text-white shadow-none hover:!bg-[#222222]"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleClick();
                    }}
                  >
                    Áp dụng
                  </Button>
                )}
              </div>
            </div>
          </div>

          {voucher.type === "shipping" && (
            <div className="mt-3 flex items-center gap-1.5 border-t border-[#ECECE8] pt-2.5 text-[9.5px] font-medium text-[#707070]">
              <Truck
                className="h-3.5 w-3.5 shrink-0"
                strokeWidth={1.7}
              />
              Miễn phí / hỗ trợ phí vận chuyển
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
