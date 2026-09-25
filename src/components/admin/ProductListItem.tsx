import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getImageUrl } from "@/lib/storage";
import ProductEditor from "./ProductEditor";
import { ChevronDown, Package, Trash2 } from "lucide-react";

interface ProductListItemProps {
  product: any;
  onSaved: () => void;
  collapse: () => void;
}

function formatPrice(value: unknown) {
  const price = Number(value ?? 0);
  if (!Number.isFinite(price)) return "0 đ";
  return `${price.toLocaleString("vi-VN")} đ`;
}

export default function ProductListItem({
  product,
  onSaved,
  collapse,
}: ProductListItemProps) {
  async function deleteProduct() {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (error) throw error;

      toast.success("Đã xóa sản phẩm");
      onSaved();
    } catch (error: any) {
      toast.error(error?.message || "Không thể xóa sản phẩm");
    }
  }

  const imageUrl = product.image_url
    ? getImageUrl(product.image_url, "card")
    : null;

  const stock = Number(product.stock ?? 0);

  const status =
    stock <= 0
      ? {
          label: "Hết hàng",
          className: "bg-red-50 text-red-700",
          dot: "bg-red-500",
        }
      : product.status === "hidden"
        ? {
            label: "Tạm ẩn",
            className: "bg-amber-50 text-amber-700",
            dot: "bg-amber-500",
          }
        : {
            label: "Đang bán",
            className: "bg-emerald-50 text-emerald-700",
            dot: "bg-emerald-500",
          };

  const categoryName =
    product.categories?.name ||
    product.category?.name ||
    "Chưa phân loại";

  return (
    <AccordionItem
      value={product.id}
      className="border-b border-neutral-100 last:border-b-0"
    >
      <div className="grid min-h-[72px] grid-cols-[minmax(0,1fr)_130px_90px_110px_42px] items-center gap-4 px-4 py-2.5 hover:bg-[#FAFAF8]">
        <AccordionTrigger className="min-w-0 p-0 text-left hover:no-underline [&>svg]:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-[#F7F7F5]">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name || "Product"}
                  className="h-full w-full object-contain p-1.5"
                />
              ) : (
                <Package className="h-5 w-5 text-neutral-300" />
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-neutral-900">
                {product.name}
              </p>

              <div className="mt-0.5 flex items-center gap-2 text-[10px] text-neutral-400">
                <span className="truncate">{categoryName}</span>
                <span className="h-1 w-1 shrink-0 rounded-full bg-neutral-300" />
                <span className="shrink-0">
                  ID {String(product.id).slice(0, 8)}
                </span>
              </div>
            </div>
          </div>
        </AccordionTrigger>

        <div className="hidden lg:block">
          <span className="text-[12px] font-semibold tabular-nums text-neutral-900">
            {formatPrice(product.price)}
          </span>
        </div>

        <div className="hidden lg:block">
          <span
            className={`text-[12px] font-medium tabular-nums ${
              stock <= 0 ? "text-red-600" : "text-neutral-800"
            }`}
          >
            {stock}
          </span>
          <span className="ml-1 text-[9px] text-neutral-400">SP</span>
        </div>

        <div className="hidden lg:block">
          <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[9px] font-semibold ${status.className}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              deleteProduct();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white transition hover:bg-red-600"
            title="Xóa sản phẩm"
            aria-label="Xóa sản phẩm"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="pointer-events-none absolute right-3 hidden">
          <ChevronDown />
        </div>
      </div>

      <AccordionContent className="border-t border-neutral-100 bg-[#FAFAF8] px-4 py-5">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                Product editor
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">
                {product.name}
              </p>
            </div>

            <button
              type="button"
              onClick={collapse}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-[10px] text-neutral-600 hover:bg-neutral-50"
            >
              Đóng
            </button>
          </div>

          <ProductEditor
            product={product}
            onSaved={onSaved}
            collapse={collapse}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
