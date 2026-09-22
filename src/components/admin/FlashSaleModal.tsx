import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";



interface Props {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  flashSale?: any;
}

export default function FlashSaleModal({
  open,
  onClose,
  onSaved,
  flashSale,
}: Props) {

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [discount, setDiscount] = useState(8);

  const [startAt, setStartAt] = useState("");

  const [endAt, setEndAt] = useState("");

  const [showCountdown, setShowCountdown] = useState(true);

const [active, setActive] = useState(true);

const [bannerColor, setBannerColor] = useState("#D97745");

const [keyword, setKeyword] = useState("");

const [products, setProducts] = useState<any[]>([]);

const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

useEffect(() => {
  loadProducts();
}, []);

useEffect(() => {

  if (!flashSale) return;

  setTitle(flashSale.title || "");

  setDescription(flashSale.description || "");

  setDiscount(flashSale.discount_percent || 0);

  setStartAt(
    flashSale.start_at
      ? flashSale.start_at.slice(0,16)
      : ""
  );

  setEndAt(
    flashSale.end_at
      ? flashSale.end_at.slice(0,16)
      : ""
  );

  setBannerColor(
    flashSale.banner_color || "#D97745"
  );

  setActive(flashSale.active);

}, [flashSale]);

async function loadProducts() {

  const { data, error } = await supabase
    .from("products")
    .select(`
  id,
  name,
  price,

  product_images(
    image_url,
    sort_order
  )
`)
    .order("created_at", {
  ascending: false,
});

  console.log("FLASH SALE PRODUCTS", data);
  console.log("FLASH SALE ERROR", error);

  console.log(data);

  setProducts(data ?? []);
}

  if (!open) return null;


async function saveFlashSale() {

  if (!title.trim()) {
    alert("Nhập tên chương trình");
    return;
  }

  if (selectedProducts.length === 0) {
    alert("Chọn ít nhất 1 sản phẩm");
    return;
  }

 let data: any = null;
let error: any = null;

if (flashSale?.id) {

  const result = await supabase
    .from("flash_sales")
    .update({
      title,
      description,
      discount_percent: discount,
      banner_color: bannerColor,
      active,
      start_at: startAt || null,
      end_at: endAt || null,
    })
    .eq("id", flashSale.id)
    .select()
    .single();

  data = result.data;
  error = result.error;

} else {

  const result = await supabase
    .from("flash_sales")
    .insert({
      title,
      description,
      discount_percent: discount,
      banner_color: bannerColor,
      active,
      start_at: startAt || null,
      end_at: endAt || null,
    })
    .select()
    .single();

  data = result.data;
  error = result.error;

}

  const rows = selectedProducts.map((id) => ({
    flash_sale_id: data.id,
    product_id: id,
  }));

  const { error: errorProducts } = await supabase
    .from("flash_sale_products")
    .insert(rows);

  if (errorProducts) {
    alert(errorProducts.message);
    return;
  }

alert("Tạo Flash Sale thành công");

setTitle("");
setDescription("");
setDiscount(8);
setKeyword("");
setSelectedProducts([]);
setStartAt("");
setEndAt("");

onSaved?.();

onClose();

}

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

    

      <div
  className="
    relative
    w-full
    max-w-6xl

    max-h-[92vh]

    overflow-hidden

    rounded-3xl
    bg-white
  "
>

  <button
    onClick={onClose}
    className="
      absolute
      right-6
      top-6

      flex
      h-10
      w-10

      items-center
      justify-center

      rounded-full

      transition

      hover:bg-neutral-100
    "
  >
    ✕
  </button>

  <h2 className="text-3xl font-display">
    Tạo Flash Sale
  </h2>

    

        <div
  className="
    mt-8
    space-y-6

    max-h-[78vh]

    overflow-y-auto

    px-8
    pb-8
  "
>

  <input
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="Tên chương trình"
    className="w-full rounded-xl border px-4 py-3"
  />

  <textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Mô tả Flash Sale"
    className="h-28 w-full rounded-xl border px-4 py-3"
  />

  <div className="grid grid-cols-3 gap-4">

    <div>

      <label className="mb-2 block text-sm font-medium">
        Giảm %
      </label>

      <input
        type="number"
        value={discount}
        onChange={(e)=>setDiscount(Number(e.target.value))}
        className="w-full rounded-xl border px-4 py-3"
      />

    </div>

    <div>

      <label className="mb-2 block text-sm font-medium">
        Bắt đầu
      </label>

      <input
        type="datetime-local"
        value={startAt}
        onChange={(e)=>setStartAt(e.target.value)}
        className="w-full rounded-xl border px-4 py-3"
      />

    </div>

    <div>

      <label className="mb-2 block text-sm font-medium">
        Kết thúc
      </label>

      <input
        type="datetime-local"
        value={endAt}
        onChange={(e)=>setEndAt(e.target.value)}
        className="w-full rounded-xl border px-4 py-3"
      />

    </div>

  </div>

  <div>

    <label className="mb-2 block text-sm font-medium">
      Màu Banner
    </label>

    <select
      value={bannerColor}
      onChange={(e)=>setBannerColor(e.target.value)}
      className="w-full rounded-xl border px-4 py-3"
    >
      <option value="#D97745">🟧 Cam Olive</option>
      <option value="#DC2626">🟥 Đỏ</option>
      <option value="#2E3528">🟩 Olive</option>
      <option value="#111827">⚫ Đen</option>
    </select>

  </div>

  <div>

    <label className="mb-2 block text-sm font-medium">
      Tìm sản phẩm
    </label>

    <input
      value={keyword}
      onChange={(e)=>setKeyword(e.target.value)}
      placeholder="Nhập tên sản phẩm..."
      className="w-full rounded-xl border px-4 py-3"
    />

  </div>

  <div className="rounded-xl border p-4">

    <p className="mb-3 font-semibold">

      Sản phẩm Flash Sale

    </p>

    <div className="space-y-2 max-h-60 overflow-y-auto">

   {products
  .filter((p) =>
    p.name
      .toLowerCase()
      .includes(keyword.toLowerCase())
  )
  .map((item) => (

    <label
      key={item.id}
      className="
        flex
        items-center
        gap-4

        rounded-xl

        border

        p-3

        hover:bg-neutral-50
        cursor-pointer
      "
    >

      <input
        type="checkbox"
        checked={selectedProducts.includes(item.id)}
        onChange={(e) => {

          if (e.target.checked) {

            setSelectedProducts([
              ...selectedProducts,
              item.id,
            ]);

          } else {

            setSelectedProducts(
              selectedProducts.filter(
                (x) => x !== item.id
              )
            );

          }

        }}
      />

      <img
  src={
    item.product_images?.sort(
      (a: any, b: any) =>
        a.sort_order - b.sort_order
    )[0]?.image_url
  }
        className="
          h-14
          w-14
          rounded-lg
          object-cover
        "
      />

      <div className="flex-1">

        <p className="font-medium">
          {item.name}
        </p>

        <p className="text-sm text-neutral-500">
          {Number(item.price).toLocaleString("vi-VN")}đ
        </p>

      </div>

    </label>

))}

    </div>

  </div>

  <div className="grid grid-cols-2 gap-4">

    <label className="flex items-center gap-3 rounded-xl border p-4">

      <input
        type="checkbox"
        checked={showCountdown}
        onChange={(e)=>setShowCountdown(e.target.checked)}
      />

      Hiển thị Countdown

    </label>

    <label className="flex items-center gap-3 rounded-xl border p-4">

      <input
        type="checkbox"
        checked={active}
        onChange={(e)=>setActive(e.target.checked)}
      />

      Kích hoạt ngay

    </label>

  </div>

<div className="flex justify-end gap-3">

  <button
    onClick={onClose}
    className="rounded-xl border px-6 py-3"
  >
    Hủy
  </button>

 <button
  onClick={saveFlashSale}
  className="rounded-xl bg-[#D97745] px-8 py-3 font-semibold text-white"
>
    Lưu Flash Sale
  </button>

</div>

</div>

</div>

</div>
   
  );

}