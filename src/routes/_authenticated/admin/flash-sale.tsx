import { createFileRoute } from "@tanstack/react-router";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import FlashSaleModal from "@/components/admin/FlashSaleModal";

export const Route = createFileRoute(
  "/_authenticated/admin/flash-sale"
)({
  component: FlashSalePage,
});

function FlashSalePage() {

    const [open, setOpen] = useState(false);

const [flashSales, setFlashSales] = useState<any[]>([]);

const [editingSale, setEditingSale] = useState<any>(null);

useEffect(() => {
  loadFlashSales();
}, []);

async function loadFlashSales() {

  const { data } = await supabase
    .from("flash_sales")
    .select(`
      *,
      flash_sale_products(count)
    `)
    .order("created_at", {
      ascending: false,
    });

  setFlashSales(data ?? []);

}



  return (
    <div className="container-x py-10">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="font-display text-4xl">
            Flash Sale
          </h1>

          <p className="mt-2 text-neutral-500">
            Quản lý chương trình Flash Sale
          </p>

        </div>

        <button
        onClick={() => setOpen(true)}
          className="
            rounded-xl
            bg-[#D97745]
            px-6
            py-3
            font-semibold
            text-white
          "
        >
          + Tạo Flash Sale
        </button>

      </div>

      <div className="mt-8 grid gap-5">

  {flashSales.map((sale) => (

    <div
      key={sale.id}
      className="
        rounded-3xl
        border
        border-neutral-200
        bg-white
        p-6
        shadow-sm
      "
    >

      <div className="flex items-start justify-between">

        <div>

          <h3 className="text-2xl font-semibold">

            🔥 {sale.title}

          </h3>

          <p className="mt-2 text-neutral-500">

            {sale.description}

          </p>

        </div>

        <div
          className="
            rounded-full
            bg-orange-100
            px-4
            py-2

            font-semibold

            text-orange-600
          "
        >
          {sale.discount_percent}%
        </div>

      </div>

      <div className="mt-5 flex flex-wrap gap-6 text-sm text-neutral-600">

        <span>

          📅 {sale.start_at?.slice(0,10)}

        </span>

        <span>

          ⏰ {sale.end_at?.slice(0,10)}

        </span>

        <span>

          📦 {(sale.flash_sale_products ?? []).length} sản phẩm

        </span>

        <span>

          {sale.active
            ? "🟢 Đang chạy"
            : "⚪ Tạm tắt"}

        </span>

      </div>

      <div className="mt-6 flex gap-3">

       <button
  onClick={() => {

    setEditingSale(sale);

    setOpen(true);

  }}
  className="
    rounded-xl
    border
    px-5
    py-2
  "
>
  ✏️ Sửa
</button>

        <button
  onClick={async () => {

    const ok = window.confirm(
      `Xóa Flash Sale "${sale.title}"?`
    );

    if (!ok) return;

    const { error: productError } =
      await supabase
        .from("flash_sale_products")
        .delete()
        .eq("flash_sale_id", sale.id);

    if (productError) {
      alert(productError.message);
      return;
    }

    const { error } = await supabase
      .from("flash_sales")
      .delete()
      .eq("id", sale.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadFlashSales();

  }}
  className="
    rounded-xl
    bg-red-500
    px-5
    py-2
    text-white
  "
>
  🗑 Xóa
</button>

      </div>

    </div>

  ))}

</div>

<FlashSaleModal
  open={open}
  flashSale={editingSale}
  onClose={() => {

    setEditingSale(null);

    setOpen(false);

  }}
  onSaved={loadFlashSales}
/>

    </div>
  );
}