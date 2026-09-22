import { ShoppingBag, Truck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

interface FlashSaleCardProps {
  product: any;
}

function formatPrice(price: number) {
  return Number(price).toLocaleString("vi-VN") + "đ";
}

export default function FlashSaleCard({
  product,
}: FlashSaleCardProps) {

  // ===============================
  // PRICE
  // ===============================

  const oldPrice = Number(product.price ?? 0);

  const percent = Number(
    product.discount_percent ?? 0
  );

  const salePrice = Math.round(
    oldPrice * (100 - percent) / 100
  );

  const saving = Math.max(
    0,
    oldPrice - salePrice
  );

  // ===============================
  // DEMO DATA
  // ===============================

  const sold =
    Math.floor(Math.random() * 180) + 80;

  const remain =
    Math.floor(Math.random() * 8) + 3;

  const progress = Math.min(
    100,
    Math.round((sold / 260) * 100)
  );

  // ===============================
  // BADGE
  // ===============================

  let badgeText = "FLASH SALE";

  if (percent >= 50) {

    badgeText = "HOT";

  } else if (percent >= 40) {

    badgeText = "SIÊU DEAL";

  } else if (percent >= 30) {

    badgeText = "GIÁ TỐT";

  }

  return (

    <div
      className="
        group
        overflow-hidden
        rounded-3xl
        border
        border-neutral-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >

      {/* IMAGE */}

      <div className="relative overflow-hidden">

        {!!percent && (

          <div className="absolute left-3 top-3 z-20">

            <div className="overflow-hidden rounded-xl shadow-lg">

              <div className="rounded-xl bg-red-600 px-2.5 py-1.5">

  <p className="text-lg font-black leading-none text-white">

    -{percent}%

  </p>

</div>

            </div>

          </div>

        )}

        <img
          src={product.image_url}
          alt={product.name}
          className="
            aspect-square
            w-full
            object-cover
            transition
            duration-500
            group-hover:scale-105
          "
        />
      </div>

      {/* CONTENT */}

      <div className="space-y-2.5 p-3.5">

        {/* PRODUCT NAME */}
<h3
  className="
    h-[48px]
    overflow-hidden
    text-[14px]
    font-medium
    leading-6
    text-neutral-800
    line-clamp-2
  "
>
  {product.name}
</h3>

{/* PRICE */}

<div className="space-y-3">

  {/* Giá gốc */}

  <div className="flex items-center gap-3">

    <span className="text-sm text-neutral-400 line-through">

      {formatPrice(oldPrice)}

    </span>

  

  </div>

  {/* Giá Flash */}

  <div className="flex items-end gap-2">

    <span className="text-[30px] leading-none font-black text-[#F97316]">

      {formatPrice(salePrice)}

    </span>

  </div>

</div>

{/* TIẾT KIỆM */}

{!!saving && (

<div className="flex items-center justify-between rounded-lg bg-orange-50 px-2.5 py-1">

   <p className="text-[9px] font-medium text-orange-500">

  Tiết kiệm

</p>

<p className="text-sm font-bold text-[#F97316]">

  {formatPrice(saving)}

</p>

   

  </div>

)}

{/* BADGES */}

<div className="mt-2 flex gap-2">

  <div className="flex-1 rounded-full bg-green-50 py-1 text-center">

    <span className="text-[10px] font-medium text-green-700">

      🚚 Freeship

    </span>

  </div>

  <div className="flex-1 rounded-full bg-blue-50 py-1 text-center">

    <span className="text-[10px] font-medium text-blue-700">

      ↩ 15 ngày

    </span>

  </div>

</div>

{/* TỒN KHO */}

<div className="mt-2 flex items-center justify-between text-xs">

  <span className="font-semibold text-orange-500">

    Còn {remain}

  </span>

  <span className="text-neutral-500">

    Đã bán {sold}

  </span>

</div>

{/* PROGRESS */}

<div className="mt-2 mb-4 h-1.5 overflow-hidden rounded-full bg-neutral-200">

  <div
    className="h-full rounded-full bg-[#F97316]"
    style={{
      width: `${progress}%`,
    }}
  />

</div>

{/* BUTTON */}

<Link
  to="/products/$slug"
  params={{
    slug: product.slug,
  }}
  className="block"
>

  <Button
    className="
      h-10
      w-full
      rounded-2xl
      bg-[#F97316]
      text-[13px]
      font-medium
      tracking-tight
      text-white
      transition-all
      duration-300
      hover:bg-[#EA580C]
      hover:shadow-lg
    "
  >

    <ShoppingBag className="mr-1.5 h-4 w-4 shrink-0" />

    <span>
      Mua Flash Sale
    </span>

  </Button>

</Link>

</div>

</div>

  );

}