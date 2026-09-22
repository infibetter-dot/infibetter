import { useEffect, useState, type ChangeEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Check,
  ImagePlus,
  Loader2,
  Palette,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";

interface Props {
  onSaved?: () => void;
  productId: string;
  refresh?: number;
  onFeaturedChanged?: (url: string) => void;
}

/*
 * =========================================================
 * CLOUDFLARE R2 UPLOAD WORKER
 * =========================================================
 *
 * File thật sẽ được lưu trên Cloudflare R2.
 *
 * Không dùng:
 * supabase.storage.upload()
 *
 * Database chỉ lưu URL R2 vào product_images.image_url
 */
const R2_UPLOAD_URL = "/api/upload-r2";

interface ProductImage {
  id: string;
  product_id: string;
  color_id: string | null;
  image_type: "variant" | "lifestyle" | string;
  is_lifestyle: boolean;
  image_url: string;
  sort_order: number;
}

interface ProductColor {
  id: string;
  name: string;
  hex?: string | null;
}

export default function ProductGallery({
  productId,
  refresh,
  onFeaturedChanged,
  onSaved,
}: Props) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [colors, setColors] = useState<ProductColor[]>([]);

  const [featuredImage, setFeaturedImage] = useState("");

  const [selectedColor, setSelectedColor] = useState("");

  const [imageType, setImageType] = useState<
    "variant" | "lifestyle"
  >("variant");

  const [uploading, setUploading] = useState(false);

  /* =========================================================
     LOAD
  ========================================================= */

  useEffect(() => {
    loadImages();
    loadColors();
  }, [productId, refresh]);

  /* =========================================================
     LOAD COLORS
  ========================================================= */

  async function loadColors() {
    const { data, error } = await supabase
      .from("product_colors")
      .select("*")
      .eq("product_id", productId)
      .order("created_at");

    if (error) {
      console.error("LOAD COLORS ERROR:", error);
      toast.error(error.message);
      return;
    }

    const nextColors = (data ?? []) as ProductColor[];

    setColors(nextColors);

    if (nextColors.length && !selectedColor) {
      setSelectedColor(nextColors[0].id);
    }
  }

  /* =========================================================
     LOAD IMAGES
  ========================================================= */

  async function loadImages() {
    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order");

    if (error) {
      console.error("LOAD IMAGES ERROR:", error);
      toast.error(error.message);
      return;
    }

    setImages((data ?? []) as ProductImage[]);

    /*
     * Load ảnh đại diện từ products
     */
    const {
      data: product,
      error: productError,
    } = await supabase
      .from("products")
      .select("image_url")
      .eq("id", productId)
      .single();

    if (productError) {
      console.error(
        "LOAD FEATURED IMAGE ERROR:",
        productError,
      );
      return;
    }

    setFeaturedImage(product?.image_url ?? "");
  }

  /* =========================================================
     REMOVE IMAGE
  =========================================================
   
   LƯU Ý:
   File thật nằm trên Cloudflare R2.

   Worker hiện tại của bạn chỉ có endpoint /upload.
   Vì vậy KHÔNG gọi:

   supabase.storage.remove()

   Khi xóa:
   - Xóa record product_images
   - File R2 vẫn giữ nguyên

   Việc này giữ đúng logic của code cũ.
  ========================================================= */

  async function removeImage(id: string) {
    if (!confirm("Xóa ảnh này?")) return;

    try {
      const { error } = await supabase
        .from("product_images")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("Đã xóa ảnh khỏi thư viện.");

      await loadImages();

      onSaved?.();
    } catch (error: any) {
      console.error("REMOVE IMAGE ERROR:", error);

      toast.error(
        error?.message || "Xóa ảnh thất bại.",
      );
    }
  }

  /* =========================================================
     UPDATE COLOR
  ========================================================= */

  async function updateColor(
    id: string,
    colorId: string,
  ) {
    const { error } = await supabase
      .from("product_images")
      .update({
        color_id: colorId || null,
      })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    await loadImages();
  }

  /* =========================================================
     MAKE FEATURED
  ========================================================= */

  async function makeFeatured(imageUrl: string) {
    console.log("⭐ FEATURE CLICK");
    console.log("productId:", productId);
    console.log("imageUrl:", imageUrl);

    const { data, error } = await supabase
      .from("products")
      .update({
        image_url: imageUrl,
      })
      .eq("id", productId)
      .select();

    console.log("UPDATED PRODUCT:", data);
    console.log("ERROR:", error);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Đã cập nhật ảnh đại diện.");

    setFeaturedImage(imageUrl);

    onFeaturedChanged?.(imageUrl);
    onSaved?.();

    await loadImages();
  }

  /* =========================================================
     UPDATE LIFESTYLE
  ========================================================= */

  async function updateLifestyle(
    id: string,
    value: boolean,
  ) {
    const { error } = await supabase
      .from("product_images")
      .update({
        is_lifestyle: value,
      })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    await loadImages();
  }

  /* =========================================================
     UPLOAD TO CLOUDFLARE R2
  ========================================================= */

  async function upload(
    e: ChangeEvent<HTMLInputElement>,
  ) {
    const input = e.currentTarget;
    const files = input.files;

    if (!files || files.length === 0) {
      return;
    }

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        /* -------------------------------------------------
           CHECK IMAGE
        ------------------------------------------------- */

        if (!file.type.startsWith("image/")) {
          throw new Error(
            `File "${file.name}" không phải là hình ảnh.`,
          );
        }

        /* -------------------------------------------------
           MAX 10MB
        ------------------------------------------------- */

        if (file.size > 10 * 1024 * 1024) {
          throw new Error(
            `Ảnh "${file.name}" vượt quá giới hạn 10MB.`,
          );
        }

        console.log("=================================");
        console.log("☁️ R2 UPLOAD START");
        console.log("File:", file.name);
        console.log("Type:", file.type);
        console.log("Size:", file.size);
        console.log("Product ID:", productId);
        console.log("Image type:", imageType);
        console.log("Selected color:", selectedColor);

        /* -------------------------------------------------
           FORM DATA
        ------------------------------------------------- */

        const formData = new FormData();

        formData.append("file", file);
        formData.append("productId", productId);

        /* -------------------------------------------------
           SEND FILE TO CLOUDFLARE R2 WORKER
        ------------------------------------------------- */

        const response = await fetch(
          R2_UPLOAD_URL,
          {
            method: "POST",
            body: formData,
          },
        );

        /* -------------------------------------------------
           PARSE WORKER RESPONSE
        ------------------------------------------------- */

        let result: {
          success?: boolean;
          url?: string;
          key?: string;
          error?: string;
          detail?: string;
        };

        try {
          result = await response.json();
        } catch {
          throw new Error(
            `Worker R2 trả về dữ liệu không hợp lệ (HTTP ${response.status}).`,
          );
        }

        console.log("R2 RESPONSE:", result);

        /* -------------------------------------------------
           CHECK R2 RESULT
        ------------------------------------------------- */

        if (
          !response.ok ||
          !result.success ||
          !result.url
        ) {
          throw new Error(
            result.error ||
              result.detail ||
              `Upload R2 thất bại (HTTP ${response.status}).`,
          );
        }

        /* -------------------------------------------------
           R2 URL
        ------------------------------------------------- */

        const imageUrl = result.url;

        console.log("✅ R2 UPLOAD SUCCESS");
        console.log("📦 R2 KEY:", result.key);
        console.log("🖼️ R2 URL:", imageUrl);

        /*
         * -------------------------------------------------
         * CHECK URL
         * -------------------------------------------------
         *
         * Đảm bảo URL trả về thực sự là URL R2.
         */

        if (
          !imageUrl.includes(
            "r2.dev",
          ) &&
          !imageUrl.includes(
            "r2.cloudflarestorage.com",
          )
        ) {
          console.warn(
            "⚠️ URL không giống R2 URL:",
            imageUrl,
          );
        }

        /* -------------------------------------------------
           CALCULATE SORT ORDER
        ------------------------------------------------- */

        const nextSortOrder =
          images.length > 0
            ? Math.max(
                ...images.map(
                  (item) =>
                    item.sort_order ?? 0,
                ),
              ) + 1
            : 0;

        /* -------------------------------------------------
           SAVE R2 URL TO SUPABASE DATABASE
        -------------------------------------------------
           
           File thật:
           Cloudflare R2

           Database:
           product_images.image_url = R2 URL
        */

        const {
          error: insertError,
        } = await supabase
          .from("product_images")
          .insert({
            product_id: productId,

            color_id:
              imageType === "variant"
                ? selectedColor || null
                : null,

            image_type: imageType,

            is_lifestyle:
              imageType === "lifestyle",

            image_url: imageUrl,

            sort_order: nextSortOrder,
          });

        if (insertError) {
          console.error(
            "❌ PRODUCT_IMAGES INSERT ERROR:",
            insertError,
          );

          throw insertError;
        }

        console.log(
          "✅ product_images INSERT SUCCESS:",
          imageUrl,
        );
      }

      /* -------------------------------------------------
         SUCCESS
      ------------------------------------------------- */

      toast.success(
        "Đã upload ảnh lên Cloudflare R2 thành công.",
      );

      await loadImages();

      onSaved?.();

      /*
       * Cho phép chọn lại đúng file vừa upload
       */
      input.value = "";
    } catch (err: any) {
      console.error(
        "❌ CLOUDFLARE R2 UPLOAD ERROR:",
        err,
      );

      toast.error(
        err?.message ||
          "Upload ảnh lên Cloudflare R2 thất bại.",
      );

      input.value = "";
    } finally {
      setUploading(false);
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100">
              <ImagePlus
                size={17}
                strokeWidth={1.8}
                className="text-stone-700"
              />
            </div>

            <h3 className="text-[15px] font-semibold text-stone-900">
              Thư viện ảnh
            </h3>
          </div>

          <p className="mt-1 pl-10 text-[11px] text-stone-400">
            Quản lý hình ảnh sản phẩm và ảnh đại diện.
          </p>
        </div>

        {images.length > 0 && (
          <div className="shrink-0 rounded-full bg-stone-100 px-3 py-1 text-[11px] font-medium text-stone-500">
            {images.length} ảnh
          </div>
        )}
      </div>

      {/* =====================================================
          UPLOAD
      ===================================================== */}

      <input
        id="gallery-upload"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={upload}
        className="hidden"
      />
<label
  htmlFor="gallery-upload"
  className="
    group
    flex
    h-[68px]
    cursor-pointer
    items-center
    justify-center
    gap-3
    rounded-xl
    border
    border-dashed
    border-stone-300
    bg-stone-50/70
    px-4
    py-2
    transition
    hover:border-stone-400
    hover:bg-stone-50
  "
>
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-white
            text-stone-700
            shadow-sm
            ring-1
            ring-stone-200
            transition
            group-hover:scale-105
          "
        >
          {uploading ? (
            <Loader2
              size={19}
              className="animate-spin"
            />
          ) : (
            <UploadCloud
              size={19}
              strokeWidth={1.8}
            />
          )}
        </div>

        <div className="min-w-0">
          <div className="text-sm font-semibold text-stone-800">
            {uploading
              ? "Đang tải ảnh lên Cloudflare R2..."
              : "Chọn ảnh để tải lên"}
          </div>

          <div className="mt-0.5 text-[11px] text-stone-400">
            JPG · PNG · WEBP · GIF · AVIF · tối đa 10MB/ảnh
          </div>

          <div className="mt-1 text-[10px] font-medium text-emerald-600">
            ✓ File ảnh được lưu trên Cloudflare R2
          </div>
        </div>
      </label>

      {/* =====================================================
          COLOR FOR NEW UPLOAD
      ===================================================== */}

      {colors.length > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/60 px-3 py-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-stone-200">
            <Palette
              size={14}
              className="text-stone-500"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-stone-400">
              Màu áp dụng cho ảnh mới
            </div>

            <select
              value={selectedColor}
              onChange={(e) =>
                setSelectedColor(e.target.value)
              }
              className="
                h-8
                w-full
                cursor-pointer
                border-0
                bg-transparent
                p-0
                text-xs
                font-medium
                text-stone-800
                outline-none
                focus:ring-0
              "
            >
              <option value="">
                Không thuộc màu
              </option>

              {colors.map((color) => (
                <option
                  key={color.id}
                  value={color.id}
                >
                  {color.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* =====================================================
          IMAGE GRID
      ===================================================== */}

      {images.length > 0 ? (
        <div
  className="
    mt-4
    grid
    grid-cols-2
    gap-3
    md:grid-cols-4
  "
>
          {images.map((img) => {
            const isFeatured =
              featuredImage === img.image_url;

            const isR2Image =
              img.image_url?.includes(
                "r2.dev",
              ) ||
              img.image_url?.includes(
                "r2.cloudflarestorage.com",
              );

            const selectedColorName =
              colors.find(
                (color) =>
                  color.id === img.color_id,
              )?.name ?? "";

            return (
              <div
                key={img.id}
                className="
                  group
                  overflow-hidden
                  rounded-xl
                  border
                  border-stone-200
                  bg-white
                  shadow-sm
                  transition
                  hover:-translate-y-0.5
                  hover:border-stone-300
                  hover:shadow-md
                "
              >
                {/* =========================================
                    IMAGE
                ========================================== */}

                <div className="relative aspect-square overflow-hidden bg-stone-100">
                  <img
                    src={img.image_url}
                    alt="Ảnh sản phẩm"
                    className="
                      h-full
                      w-full
                      object-cover
                      transition
                      duration-500
                      group-hover:scale-[1.03]
                    "
                    loading="lazy"
                    onLoad={() => {
                      console.log(
                        "✅ GALLERY IMAGE LOADED:",
                        img.image_url,
                      );
                    }}
                    onError={() => {
                      console.error(
                        "❌ GALLERY IMAGE LOAD ERROR:",
                        img.image_url,
                      );
                    }}
                  />

                  {/* STORAGE BADGE */}

                  <div className="absolute left-2 top-2 rounded-md bg-black/65 px-2 py-1 text-[9px] font-medium text-white backdrop-blur-sm">
                    {isR2Image
                      ? "☁ R2"
                      : "⚠ Storage cũ"}
                  </div>

                  {/* FEATURED */}

                  {isFeatured && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-amber-400 px-2 py-1 text-[9px] font-semibold text-stone-900 shadow-sm">
                      <Star
                        size={10}
                        fill="currentColor"
                      />
                      Ảnh đại diện
                    </div>
                  )}

                  {/* LIFESTYLE */}

                  {img.is_lifestyle && (
                    <div className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-[9px] font-semibold text-stone-700 shadow-sm backdrop-blur">
                      Lifestyle
                    </div>
                  )}
                </div>

                {/* =========================================
                    CONTENT
                ========================================== */}

                <div className="p-2.5">
                  {/* COLOR */}

                  <div className="mb-2">
                    <label className="mb-1 block text-[9px] font-medium uppercase tracking-wide text-stone-400">
                      Màu
                    </label>

                    <select
                      value={img.color_id ?? ""}
                      onChange={(e) =>
                        updateColor(
                          img.id,
                          e.target.value,
                        )
                      }
                      className="
                        h-8
                        w-full
                        rounded-lg
                        border
                        border-stone-200
                        bg-stone-50
                        px-2
                        text-[11px]
                        text-stone-700
                        outline-none
                        transition
                        focus:border-stone-400
                        focus:bg-white
                        focus:ring-2
                        focus:ring-stone-100
                      "
                    >
                      <option value="">
                        Không thuộc màu
                      </option>

                      {colors.map((color) => (
                        <option
                          key={color.id}
                          value={color.id}
                        >
                          {color.name}
                        </option>
                      ))}
                    </select>

                    {selectedColorName && (
                      <div className="mt-1 truncate text-[9px] text-stone-400">
                        {selectedColorName}
                      </div>
                    )}
                  </div>

                  {/* LIFESTYLE */}

                  <label
                    className="
                      mb-2
                      flex
                      cursor-pointer
                      items-center
                      justify-between
                      rounded-lg
                      border
                      border-stone-200
                      bg-stone-50
                      px-2.5
                      py-1.5
                      transition
                      hover:bg-stone-100
                    "
                  >
                    <span className="text-[10px] font-medium text-stone-600">
                      Lifestyle
                    </span>

                    <span className="relative flex h-4 w-7">
                      <input
                        type="checkbox"
                        checked={Boolean(
                          img.is_lifestyle,
                        )}
                        onChange={(e) =>
                          updateLifestyle(
                            img.id,
                            e.target.checked,
                          )
                        }
                        className="
                          peer
                          h-4
                          w-7
                          cursor-pointer
                          appearance-none
                          rounded-full
                          bg-stone-300
                          transition
                          checked:bg-stone-800
                        "
                      />

                      <span
                        className="
                          pointer-events-none
                          absolute
                          left-[2px]
                          top-[2px]
                          h-3
                          w-3
                          rounded-full
                          bg-white
                          shadow-sm
                          transition
                          peer-checked:translate-x-3
                        "
                      />
                    </span>
                  </label>

                  {/* ACTIONS */}

                  <div className="grid grid-cols-[1fr_auto] gap-1.5">
                    {/* FEATURED */}

                    <button
                      type="button"
                      onClick={() =>
                        makeFeatured(
                          img.image_url,
                        )
                      }
                      disabled={isFeatured}
                      className={`
                        flex
                        h-8
                        items-center
                        justify-center
                        gap-1
                        rounded-lg
                        px-2
                        text-[10px]
                        font-medium
                        transition

                        ${
                          isFeatured
                            ? "cursor-default bg-stone-100 text-stone-500"
                            : "border border-stone-300 bg-white text-stone-700 hover:border-stone-500 hover:bg-stone-50"
                        }
                      `}
                    >
                      {isFeatured ? (
                        <>
                          <Check size={12} />
                          Đang dùng
                        </>
                      ) : (
                        <>
                          <Star size={12} />
                          Đặt đại diện
                        </>
                      )}
                    </button>

                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(img.id)
                      }
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-stone-200
                        bg-white
                        text-stone-400
                        transition
                        hover:border-red-200
                        hover:bg-red-50
                        hover:text-red-500
                      "
                      title="Xóa ảnh"
                      aria-label="Xóa ảnh"
                    >
                      <Trash2
                        size={14}
                        strokeWidth={1.8}
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ===================================================
           EMPTY STATE
        =================================================== */

        <div className="mt-5 rounded-xl border border-dashed border-stone-200 bg-stone-50/60 px-5 py-8 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-stone-400 shadow-sm ring-1 ring-stone-200">
            <ImagePlus
              size={18}
              strokeWidth={1.7}
            />
          </div>

          <p className="mt-3 text-xs font-medium text-stone-600">
            Chưa có hình ảnh
          </p>

          <p className="mt-1 text-[10px] text-stone-400">
            Chọn ảnh ở phía trên để thêm vào thư viện.
          </p>
        </div>
      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      {images.length > 0 && (
        <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
          <p className="text-[10px] text-stone-400">
            Ảnh được lưu trực tiếp trên Cloudflare R2.
          </p>

          <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
            <Check
              size={11}
              className="text-emerald-500"
            />
            Đã đồng bộ
          </div>
        </div>
      )}
    </section>
  );
}