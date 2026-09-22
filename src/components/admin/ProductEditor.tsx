import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProductEditorRichText from "./ProductEditorRichText";
import ProductSeo from "./ProductSeo";
import ProductGallery from "./ProductGallery";
import ProductSpecification from "./ProductSpecification";
import ProductUSP from "./ProductUSP";
import ProductColors from "./ProductColors";

interface Props {
  product: any;
  onSaved: () => void;
  collapse?: () => void;
}

export default function ProductEditor({
  product,
  onSaved,
  collapse,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [colorVersion, setColorVersion] = useState(0);
  const [name, setName] = useState(product.name ?? "");
  const [shortDescription, setShortDescription] = useState(
  product.short_description ?? ""
);

const [description, setDescription] = useState(
  product.description ?? ""
);

  const [seoTitle, setSeoTitle] = useState(
    product.seo_title ?? ""
  );

  const [seoDescription, setSeoDescription] = useState(
    product.seo_description ?? ""
  );

  const [seoKeywords, setSeoKeywords] = useState(
    product.seo_keywords ?? ""
  );

  const [price, setPrice] = useState(product.price ?? 0);

  const [comparePrice, setComparePrice] = useState(
    product.compare_at_price ?? 0
  );

  const [stock, setStock] = useState(product.stock ?? 0);
  const [featured, setFeatured] = useState(
  product.featured ?? false
);

const [bestSeller, setBestSeller] = useState(
  product.best_seller ?? false
);

const [topSeller, setTopSeller] = useState(
  product.top_seller ?? false
);
  

  const [categoryId, setCategoryId] = useState(
  product.category_id ?? ""
);

const [categories, setCategories] = useState<any[]>([]);

const [imageUrl, setImageUrl] = useState(
  product.image_url ?? ""
);

useEffect(() => {
  
  loadCategories();
}, []);

async function uploadThumbnail(
  e: React.ChangeEvent<HTMLInputElement>
) {
  const file = e.target.files?.[0];

  if (!file) return;

  const ext = file.name.split(".").pop();

  const fileName =
    `thumbnail/${Date.now()}.${ext}`;

  const { error } =
    await supabase.storage
      .from("website OLive")
      .upload(fileName, file);

  if (error) {
    toast.error(error.message);
    return;
  }

const { data } = supabase.storage
  .from("website OLive")
  .getPublicUrl(fileName);

setImageUrl(data.publicUrl);
}

async function loadCategories() {

  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  setCategories(data ?? []);
}

function createSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function previewProduct() {
  window.open(
    `/products/${product.slug}`,
    "_blank"
  );
}
  
async function save() {
  try {
    if (!product?.id) {
      toast.error("Không tìm thấy ID sản phẩm.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("products")
      .update({
  featured,
  best_seller: bestSeller,
  top_seller: topSeller,
  name,
  slug: createSlug(name),

  image_url: imageUrl,



  short_description: shortDescription,

  compare_at_price: comparePrice,

  description,

  seo_title: seoTitle,
  seo_description: seoDescription,
  seo_keywords: seoKeywords,

  category_id:
  categoryId === ""
    ? null
    : categoryId,

  price,
  stock,
})

      .eq("id", product.id);

if (error) throw error;
    toast.success("Đã lưu sản phẩm");

    onSaved();

  } catch (err: any) {

    toast.error(err.message);

  } finally {

    setLoading(false);

  }
}

  
  return (
    <div className="space-y-5">
      {/* HEADER — gọn, giữ nguyên Xem sản phẩm / Thu gọn / Lưu */}
      <div className="sticky top-3 z-20 flex flex-col gap-3 rounded-2xl border border-[#DDD6CE] bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={imageUrl || "/placeholder.svg"}
            className="h-12 w-12 shrink-0 rounded-xl border border-stone-200 object-cover"
            alt={name || "Sản phẩm"}
          />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-[#262626]">
              {name || "Sản phẩm mới"}
            </h1>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-500">
              <span>{price.toLocaleString()} đ</span>
              <span>•</span>
              <span>Tồn: {stock}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={previewProduct}
            className="h-9 rounded-lg border border-[#D7D3CB] bg-white px-3 text-sm font-medium transition hover:bg-[#F7F4EF]"
          >
            👁 Xem
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              collapse?.();
            }}
            className="h-9 rounded-lg border border-[#D7D3CB] bg-white px-3 text-sm font-medium transition hover:bg-[#F7F4EF]"
          >
            ▲ Thu gọn
          </button>

          <button
            type="button"
            onClick={save}
            disabled={loading}
            className="h-9 rounded-lg bg-[#2D6A4F] px-4 text-sm font-semibold text-white transition hover:bg-[#245640] disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "💾 Lưu"}
          </button>
        </div>
      </div>

      {/* THÔNG TIN CƠ BẢN */}
      
      <section className="rounded-2xl border border-[#DDD6CE] bg-white p-4 shadow-sm">
  {/* HEADER */}
  <div className="mb-3 flex items-center justify-between border-b border-[#ECE7DF] pb-3">
    <div>
      <h2 className="text-base font-bold tracking-tight text-[#222]">
        Thông tin sản phẩm
      </h2>

      <p className="mt-0.5 text-[11px] text-neutral-500">
        Tên, slug, ảnh đại diện, danh mục và nội dung hiển thị.
      </p>
    </div>
  </div>

  <div className="grid gap-3 lg:grid-cols-2">

    {/* TÊN */}
    <div className="lg:col-span-2">
      <label className="mb-1 block text-xs font-semibold text-[#222]">
        Tên sản phẩm <span className="text-red-500">*</span>
      </label>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ví dụ: Đèn bàn Flowerpot VP9"
        className="
          h-9
          w-full
          rounded-lg
          border border-[#D9D4CC]
          px-3
          text-xs
          outline-none
          transition
          focus:border-[#9B7B5A]
          focus:ring-2
          focus:ring-[#F6EFE8]
        "
      />
    </div>

    {/* SLUG */}
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#222]">
        Slug
      </label>

      <div className="
        flex
        h-9
        items-center
        rounded-lg
        border
        border-[#E2DDD5]
        bg-[#FAF8F5]
        px-3
        text-[10px]
        text-neutral-500
      ">
        {createSlug(name)}
      </div>
    </div>

    {/* DANH MỤC */}
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#222]">
        Danh mục
      </label>

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="
          h-9
          w-full
          rounded-lg
          border border-[#D9D4CC]
          bg-white
          px-3
          text-xs
          outline-none
          transition
          focus:border-[#9B7B5A]
          focus:ring-2
          focus:ring-[#F6EFE8]
        "
      >
        <option value="">Chọn danh mục</option>

        {categories.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </div>

    {/* ẢNH ĐẠI DIỆN */}
    <div className="lg:col-span-2">
      <div className="
        flex
        items-center
        gap-3
        rounded-lg
        border border-dashed
        border-[#DDD5CC]
        bg-[#FCFAF8]
        px-3
        py-2
      ">
        <img
          src={imageUrl || "/placeholder.svg"}
          className="
            h-12
            w-12
            shrink-0
            rounded-lg
            border
            object-cover
          "
          alt={name || "Ảnh đại diện"}
        />

        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#2D2D2D]">
            Ảnh đại diện
          </p>

          <p className="mt-0.5 text-[10px] text-neutral-400">
            Chọn ảnh từ <strong>Thư viện ảnh</strong> →{" "}
            <strong>Đặt làm ảnh đại diện</strong>.
          </p>
        </div>
      </div>
    </div>

    {/* HIỂN THỊ WEBSITE */}
    <div className="lg:col-span-2">
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-xs font-semibold text-[#222]">
          Hiển thị Website
        </p>

        <span className="text-[10px] text-neutral-400">
          Trạng thái hiển thị
        </span>
      </div>

      <div className="grid gap-2 md:grid-cols-3">

        {/* NEW */}
        <label className="
          flex
          h-12
          cursor-pointer
          items-center
          justify-between
          rounded-lg
          border
          border-neutral-200
          bg-white
          px-3
          transition
          hover:bg-neutral-50
        ">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-neutral-800">
              Sản phẩm mới
            </p>

            <p className="text-[9px] text-neutral-400">
              New Arrival
            </p>
          </div>

          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 shrink-0 rounded accent-[#8C6B4D]"
          />
        </label>

        {/* BEST SELLER */}
        <label className="
          flex
          h-12
          cursor-pointer
          items-center
          justify-between
          rounded-lg
          border
          border-neutral-200
          bg-white
          px-3
          transition
          hover:bg-neutral-50
        ">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-neutral-800">
              Được yêu thích
            </p>

            <p className="text-[9px] text-neutral-400">
              Best Seller
            </p>
          </div>

          <input
            type="checkbox"
            checked={bestSeller}
            onChange={(e) => setBestSeller(e.target.checked)}
            className="h-4 w-4 shrink-0 rounded accent-[#8C6B4D]"
          />
        </label>

        {/* TOP SELLER */}
        <label className="
          flex
          h-12
          cursor-pointer
          items-center
          justify-between
          rounded-lg
          border
          border-neutral-200
          bg-white
          px-3
          transition
          hover:bg-neutral-50
        ">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-neutral-800">
              Top bán chạy
            </p>

            <p className="text-[9px] text-neutral-400">
              Top Seller
            </p>
          </div>

          <input
            type="checkbox"
            checked={topSeller}
            onChange={(e) => setTopSeller(e.target.checked)}
            className="h-4 w-4 shrink-0 rounded accent-[#8C6B4D]"
          />
        </label>

      </div>
    </div>

    {/* MÔ TẢ NGẮN */}
    <div className="lg:col-span-2">
      <div className="mb-1 flex items-center justify-between">
        <label className="text-xs font-semibold text-[#222]">
          Mô tả ngắn
        </label>

        <span className="text-[10px] text-neutral-400">
          {Math.min(shortDescription.length, 180)}/180
        </span>
      </div>

      <textarea
        rows={2}
        value={shortDescription.slice(0, 180)}
        onChange={(e) =>
          setShortDescription(e.target.value.slice(0, 180))
        }
        maxLength={180}
        placeholder="Hiển thị dưới giá sản phẩm..."
        className="
          h-16
          w-full
          resize-none
          rounded-lg
          border border-[#D9D4CC]
          px-3
          py-2
          text-xs
          outline-none
          transition
          focus:border-[#9B7B5A]
          focus:ring-2
          focus:ring-[#F6EFE8]
        "
      />

      <p className="mt-0.5 text-[10px] text-neutral-400">
        Hiển thị dưới tên sản phẩm.
      </p>
    </div>

    {/* NỘI DUNG SẢN PHẨM */}
    <div className="lg:col-span-2">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-semibold text-[#222]">
          Nội dung sản phẩm
        </label>

        <span className="text-[10px] text-neutral-400">
          Mô tả chi tiết
        </span>
      </div>

      <div className="w-full min-w-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <ProductEditorRichText
          value={description}
          onChange={setDescription}
        />
      </div>
    </div>

  </div>
</section>

      {/* GALLERY + MÀU SẮC / BIẾN THỂ */}
      {product.id && (
        <div className="grid items-start gap-5 xl:grid-cols-2">
          {/* GALLERY */}
          <section className="min-w-0 rounded-2xl border border-[#DDD6CE] bg-white p-4 shadow-sm md:p-5">
            <div className="mb-4 border-b border-[#E8E4DE] pb-3">
              
            </div>

            <div className="min-w-0">
              <ProductGallery
                key={imageUrl}
                productId={product.id}
                refresh={colorVersion}
                onFeaturedChanged={setImageUrl}
                onSaved={onSaved}
              />
            </div>
          </section>

          {/* MÀU SẮC / BIẾN THỂ */}
          <section className="min-w-0 rounded-2xl border border-[#DDD6CE] bg-white p-4 shadow-sm md:p-5">
            <div className="mb-4 border-b border-[#E8E4DE] pb-3">
              
            </div>

            <div className="min-w-0">
              <ProductColors
                productId={product.id}
                onSaved={() => setColorVersion((v) => v + 1)}
              />
            </div>
          </section>
        </div>
      )}

     {/* SPECIFICATION + USP */}
{product.id && (
  <div className="grid min-w-0 items-stretch gap-5 lg:grid-cols-2">
    <div className="min-w-0 h-full">
      <ProductSpecification productId={product.id} />
    </div>

    <div className="min-w-0 h-full">
      <ProductUSP productId={product.id} />
    </div>
  </div>
)}

     {/* SEO */}
<section className="rounded-2xl border border-[#DDD6CE] bg-white p-4 shadow-sm md:p-5">
  <ProductSeo
    name={name}
    seoTitle={seoTitle}
    setSeoTitle={setSeoTitle}
    seoDescription={seoDescription}
    setSeoDescription={setSeoDescription}
    seoKeywords={seoKeywords}
    setSeoKeywords={setSeoKeywords}
    createSlug={createSlug}
  />
</section>

      {/* GIÁ — 3 cột thay vì xếp dọc */}
      <section className="rounded-2xl border border-[#DDD6CE] bg-white p-4 shadow-sm md:p-5">
        <div className="mb-4 flex items-center justify-between border-b border-[#E8E4DE] pb-3">
          <div>
            <h3 className="text-xl font-bold text-[#2D2D2D]">Giá & tồn kho</h3>
            <p className="mt-0.5 text-xs text-neutral-500">
              Giá bán, giá gốc và số lượng sản phẩm.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {/* GIÁ BÁN */}
          <div className="rounded-xl border border-[#DDD] bg-[#FAFAFA] p-4">
            <label className="mb-1.5 block text-sm font-semibold">
              💰 Giá bán
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-500">
                ₫
              </span>

              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-8 pr-3 text-base font-bold focus:border-[#2D6A4F] focus:ring-4 focus:ring-[#EAF3EE]"
              />
            </div>

            <p className="mt-2 text-[11px] text-neutral-500">
              Giá khách thanh toán.
            </p>
          </div>

          {/* GIÁ GỐC */}
          <div className="rounded-xl border border-[#DDD] bg-[#FAFAFA] p-4">
            <label className="mb-1.5 block text-sm font-semibold">
              🏷 Giá gốc
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-500">
                ₫
              </span>

              <input
                type="number"
                value={comparePrice}
                onChange={(e) => setComparePrice(Number(e.target.value))}
                className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-8 pr-3 text-base font-bold focus:border-[#2D6A4F] focus:ring-4 focus:ring-[#EAF3EE]"
              />
            </div>

            <p className="mt-2 text-[11px] text-neutral-500">
              Giá hiển thị gạch ngang.
            </p>
          </div>

          {/* TỒN KHO */}
          <div className="rounded-xl border border-[#DDD] bg-[#FAFAFA] p-4">
            <label className="mb-1.5 block text-sm font-semibold">
              📦 Tồn kho
            </label>

            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-base font-semibold focus:border-[#2D6A4F] focus:ring-4 focus:ring-[#EAF3EE]"
            />

            <p className="mt-2 text-[11px] text-neutral-500">
              Số lượng còn trong kho.
            </p>
          </div>
        </div>

        {/* GIẢM GIÁ — giữ nguyên logic */}
        {comparePrice > price && (
          <div className="mt-3 flex flex-col gap-3 rounded-xl border border-[#CFE7D6] bg-[#F2FBF6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span>🎉</span>
              <span className="text-sm font-semibold text-[#2D6A4F]">
                Khách đang tiết kiệm
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-lg font-bold text-[#2D6A4F]">
                ₫ {(comparePrice - price).toLocaleString()}
              </div>

              <div className="rounded-full bg-[#2D6A4F] px-3 py-1 text-xs font-semibold text-white">
                Giảm {Math.round(((comparePrice - price) / comparePrice) * 100)}%
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ACTIONS — giữ đầy đủ */}
      <div className="flex flex-col-reverse gap-2 border-t border-[#E8E4DE] pt-4 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={previewProduct}
          className="h-10 rounded-xl border border-[#D7D3CB] bg-white px-5 text-sm font-semibold transition hover:bg-[#F7F4EF]"
        >
          👁 Xem sản phẩm
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            collapse?.();
          }}
          className="h-10 rounded-xl border border-[#D7D3CB] bg-white px-5 text-sm font-semibold transition hover:bg-[#F7F4EF]"
        >
          ▲ Thu gọn
        </button>

        <button
          type="button"
          onClick={save}
          disabled={loading}
          className="h-10 rounded-xl bg-[#2D6A4F] px-6 text-sm font-semibold text-white transition hover:bg-[#245640] disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : "💾 Lưu sản phẩm"}
        </button>
      </div>
    </div>
  );
}