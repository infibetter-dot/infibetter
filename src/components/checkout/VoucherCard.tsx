
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
  return `$${Number(value || 0).toFixed(2)}`;
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
                    Best Value
                  </Badge>
                )}

                {selected && (
                  <Badge className="shrink-0 rounded-full border-0 bg-[#E4ECE3] px-2 py-0.5 text-[10px] font-semibold text-[#425440] shadow-none">
                    <Check
                      className="mr-1 h-2.5 w-2.5"
                      strokeWidth={2.2}
                    />
                    Applied
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

              <p className="mt-1 font-mono text-[11px] font-medium tracking-[0.03em] text-[#555555]">
                {voucher.code}
              </p>

              {!!voucher.description && (
                <p className="mt-1 text-[11px] leading-[1.45] text-[#555555]">
                  {voucher.description}
                </p>
              )}

              <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-[#555555]">
                <TicketPercent
                  className="h-3.5 w-3.5 shrink-0 text-[#6B6B6B]"
                  strokeWidth={1.7}
                />
                <span>
                  Min. order{" "}
                  <strong className="font-semibold text-[#333333]">
                    {formatPrice(voucher.min_order)}
                  </strong>
                </span>
              </div>

              {disabled ? (
                <div className="mt-2.5 flex items-center justify-between rounded-lg border border-[#E5E1D8] bg-[#FAF8F3] px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Lock
                      className="h-3.5 w-3.5 text-[#666666]"
                      strokeWidth={1.8}
                    />
                    <span className="text-[10.5px] font-medium text-[#555555]">
                      Spend more
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
                      Discount
                    </span>
                  </div>

                  <span className="text-[12px] font-bold text-[#465643]">
                    {formatPrice(saving)}
                  </span>
                </div>
              )}

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
                      Applied
                    </Button>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(null);
                      }}
                      className="flex h-7 w-full items-center justify-center rounded-md text-[10.5px] font-medium text-[#666666] transition-colors hover:bg-[#F5F5F3] hover:text-[#222222]"
                    >
                      Remove
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
                    Not eligible
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className={cn(
                      "relative isolate !h-9 w-full overflow-hidden rounded-lg",
                      "border border-white/80",
                      "bg-white/75 text-[11.5px] font-semibold text-[#303B2D]",
                      "shadow-[0_2px_8px_rgba(50,60,45,0.10),inset_0_1px_0_rgba(255,255,255,0.95)]",
                      "backdrop-blur-md",
                      "transition-all duration-200",
                      "hover:border-[#C8D2C3] hover:bg-[#F4F7F2]",
                      "hover:shadow-[0_4px_12px_rgba(50,60,45,0.14)]",
                      "active:scale-[0.98]",
                    )}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleClick();
                    }}
                  >
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-lg bg-gradient-to-b from-white/90 to-transparent" />
                    <span className="relative z-10">Apply</span>
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
              Free shipping / Shipping discount
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
