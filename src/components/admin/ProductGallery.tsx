

import { useEffect, useState, type ChangeEvent } from "react";

import { supabase } from "@/integrations/supabase/client";

import { toast } from "sonner";

import {

  Check,

  ImagePlus,

  Loader2,

  Palette,

  Play,

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

interface ProductImage {

  id: string;

  product_id: string;

  color_id: string | null;

  image_type: string;

  is_lifestyle: boolean;

  image_url: string;

  sort_order: number;

}

interface ProductColor {

  id: string;

  name: string;

  hex?: string | null;

}

const R2_UPLOAD_URL = "/api/upload-r2";

const IMAGE_TYPES = [

  "image/jpeg",

  "image/png",

  "image/webp",

  "image/gif",

  "image/avif",

];

const VIDEO_TYPES = ["video/mp4", "video/webm"];

const IMAGE_MAX_SIZE = 10 * 1024 * 1024;

const VIDEO_MAX_SIZE = 100 * 1024 * 1024;

function isVideoMedia(item: ProductImage): boolean {

  return (

    item.image_type === "video" ||

    /\.(mp4|webm)(?:$|[?#])/i.test(item.image_url)

  );

}

function isR2Url(url: string): boolean {

  return (

    url.includes("r2.dev") ||

    url.includes("r2.cloudflarestorage.com")

  );

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

  const [imageType, setImageType] = useState<"variant" | "lifestyle">(

    "variant",

  );

  const [uploading, setUploading] = useState(false);

  useEffect(() => {

    void loadImages();

    void loadColors();

  }, [productId, refresh]);

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

  async function loadImages() {

    const { data, error } = await supabase

      .from("product_images")

      .select("*")

      .eq("product_id", productId)

      .order("sort_order");

    if (error) {

      console.error("LOAD MEDIA ERROR:", error);

      toast.error(error.message);

      return;

    }

    setImages((data ?? []) as ProductImage[]);

    const { data: product, error: productError } = await supabase

      .from("products")

      .select("image_url")

      .eq("id", productId)

      .single();

    if (productError) {

      console.error("LOAD FEATURED IMAGE ERROR:", productError);

      return;

    }

    setFeaturedImage(product?.image_url ?? "");

  }

  async function removeImage(id: string) {

    if (!confirm("Xóa media này khỏi thư viện?")) return;

    try {

      const { error } = await supabase

        .from("product_images")

        .delete()

        .eq("id", id);

      if (error) throw error;

      toast.success("Đã xóa media khỏi thư viện.");

      await loadImages();

      onSaved?.();

    } catch (error: unknown) {

      console.error("REMOVE MEDIA ERROR:", error);

      toast.error(

        error instanceof Error ? error.message : "Xóa media thất bại.",

      );

    }

  }

  async function updateColor(id: string, colorId: string) {

    const { error } = await supabase

      .from("product_images")

      .update({ color_id: colorId || null })

      .eq("id", id);

    if (error) {

      toast.error(error.message);

      return;

    }

    await loadImages();

    onSaved?.();

  }

  async function makeFeatured(imageUrl: string) {

    const { error } = await supabase

      .from("products")

      .update({ image_url: imageUrl })

      .eq("id", productId);

    if (error) {

      console.error("UPDATE FEATURED IMAGE ERROR:", error);

      toast.error(error.message);

      return;

    }

    setFeaturedImage(imageUrl);

    onFeaturedChanged?.(imageUrl);

    onSaved?.();

    toast.success("Đã cập nhật ảnh đại diện.");

    await loadImages();

  }

  async function updateLifestyle(id: string, value: boolean) {

    const item = images.find((image) => image.id === id);

    if (!item || isVideoMedia(item)) return;

    const { error } = await supabase

      .from("product_images")

      .update({

        is_lifestyle: value,

        image_type: value ? "lifestyle" : "variant",

        color_id: value ? null : item.color_id,

      })

      .eq("id", id);

    if (error) {

      toast.error(error.message);

      return;

    }

    await loadImages();

    onSaved?.();

  }

  async function upload(e: ChangeEvent<HTMLInputElement>) {

    const input = e.currentTarget;

    const files = Array.from(input.files ?? []);

    if (!files.length) return;

    setUploading(true);

    let uploadedCount = 0;

    const errors: string[] = [];

    try {

      for (const file of files) {

        // Some browsers/operating systems return an empty or unexpected MIME type.
// Fall back to the file extension so valid JPG/PNG/MP4/WebM files are accepted.
        const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

        const isImage =
          IMAGE_TYPES.includes(file.type) ||
          ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(extension);

        const isVideo =
          VIDEO_TYPES.includes(file.type) ||
          ["mp4", "webm"].includes(extension);

        if (!isImage && !isVideo) {

          errors.push(

            `${file.name}: chỉ hỗ trợ JPEG, PNG, WebP, GIF, AVIF, MP4 và WebM.`,

          );

          continue;

        }

        const maxSize = isVideo ? VIDEO_MAX_SIZE : IMAGE_MAX_SIZE;

        if (file.size === 0 || file.size > maxSize) {

          errors.push(

            `${file.name}: ${isVideo ? "video tối đa 100 MB" : "ảnh tối đa 10 MB"}.`,

          );

          continue;

        }

        try {

          const formData = new FormData();

          formData.append("file", file);

          formData.append("productId", productId);

          const response = await fetch(R2_UPLOAD_URL, {

            method: "POST",

            body: formData,

          });

          const result: {

            success?: boolean;

            url?: string;

            key?: string;

            error?: string;

            detail?: string;

            mediaType?: "image" | "video";

          } = await response.json().catch(() => ({}));

          if (!response.ok || !result.success || !result.url) {

            throw new Error(

              result.error ||

                result.detail ||

                `Upload thất bại (HTTP ${response.status}).`,

            );

          }

          const { data: existing, error: existingError } = await supabase

            .from("product_images")

            .select("sort_order")

            .eq("product_id", productId);

          if (existingError) throw existingError;

          const nextSortOrder =

            Math.max(-1, ...(existing ?? []).map((item) => item.sort_order ?? 0)) +

            1;

          const { error: insertError } = await supabase

            .from("product_images")

            .insert({

              product_id: productId,

              color_id:

                !isVideo && imageType === "variant"

                  ? selectedColor || null

                  : null,

              image_type: isVideo ? "video" : imageType,

              is_lifestyle: !isVideo && imageType === "lifestyle",

              image_url: result.url,

              sort_order: nextSortOrder,

            });

          if (insertError) throw insertError;

          uploadedCount++;

        } catch (error: unknown) {

          console.error("UPLOAD MEDIA ERROR:", file.name, error);

          errors.push(

            `${file.name}: ${

              error instanceof Error ? error.message : "Upload thất bại."

            }`,

          );

        }

      }

      if (uploadedCount > 0) {

        toast.success(`Đã tải lên ${uploadedCount} file thành công.`);

        await loadImages();

        onSaved?.();

      }

      if (errors.length) {

        toast.error(errors.slice(0, 3).join("\n"), {

          duration: 7000,

        });

        console.error("UPLOAD ERRORS:", errors);

      }

    } finally {

      input.value = "";

      setUploading(false);

    }

  }

  return (

    <section className="flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">

      <div className="mb-4 flex items-center justify-between gap-3">

        <div>

          <div className="flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-50 ring-1 ring-stone-200">

              <ImagePlus size={17} className="text-stone-700" />

            </div>

            <h3 className="text-sm font-semibold text-stone-900">

              Thư viện media

            </h3>

          </div>

          <p className="mt-1 pl-10 text-[11px] text-stone-400">

            Quản lý ảnh, video và ảnh đại diện sản phẩm.

          </p>

        </div>

        <span className="shrink-0 rounded-full bg-stone-100 px-3 py-1 text-[11px] font-medium text-stone-500">

          {images.length} file

        </span>

      </div>

      <input

        id="gallery-upload"

        type="file"

        multiple

        accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm"

        onChange={upload}

        disabled={uploading}

        className="hidden"

      />

      <div className="mb-3 flex flex-wrap gap-2">

        <button

          type="button"

          onClick={() => setImageType("variant")}

          className={`rounded-lg px-3 py-2 text-xs font-medium transition ${

            imageType === "variant"

              ? "bg-stone-900 text-white"

              : "border border-stone-200 bg-white text-stone-600"

          }`}

        >

          Ảnh sản phẩm

        </button>

        <button

          type="button"

          onClick={() => setImageType("lifestyle")}

          className={`rounded-lg px-3 py-2 text-xs font-medium transition ${

            imageType === "lifestyle"

              ? "bg-stone-900 text-white"

              : "border border-stone-200 bg-white text-stone-600"

          }`}

        >

          Ảnh Lifestyle

        </button>

      </div>

      <label

        htmlFor="gallery-upload"

        className={`group flex min-h-[76px] cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-stone-300 bg-stone-50/70 px-4 py-3 transition hover:border-stone-400 hover:bg-stone-50 ${

          uploading ? "pointer-events-none opacity-60" : ""

        }`}

      >

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-stone-700 shadow-sm ring-1 ring-stone-200">

          {uploading ? (

            <Loader2 size={19} className="animate-spin" />

          ) : (

            <UploadCloud size={19} />

          )}

        </div>

        <div className="min-w-0">

          <div className="text-xs font-semibold text-stone-800">

            {uploading ? "Đang tải file lên R2..." : "Chọn ảnh hoặc video"}

          </div>

          <p className="mt-1 text-[11px] text-stone-500">

            JPG · PNG · WebP · GIF · AVIF · MP4 · WebM

          </p>

          <p className="mt-1 text-[10px] text-stone-400">

            Ảnh tối đa 10 MB · Video tối đa 100 MB

          </p>

        </div>

      </label>

      {colors.length > 0 && (

        <div className="mt-3 flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50/60 px-3 py-2">

          <Palette size={15} className="shrink-0 text-stone-500" />

          <label

            htmlFor="gallery-color"

            className="shrink-0 text-[11px] text-stone-500"

          >

            Màu ảnh mới

          </label>

          <select

            id="gallery-color"

            value={selectedColor}

            onChange={(e) => setSelectedColor(e.target.value)}

            className="min-w-0 flex-1 bg-transparent text-xs text-stone-800 outline-none"

          >

            <option value="">Không thuộc màu</option>

            {colors.map((color) => (

              <option key={color.id} value={color.id}>

                {color.name}

              </option>

            ))}

          </select>

        </div>

      )}

      {images.length > 0 ? (

        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">

          {images.map((img) => {

            const video = isVideoMedia(img);

            const isFeatured = !video && featuredImage === img.image_url;

            const r2 = isR2Url(img.image_url);

            const selectedColorName =

              colors.find((color) => color.id === img.color_id)?.name ?? "";

            return (

              <article

                key={img.id}

                className="group min-w-0 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:border-stone-300 hover:shadow-md"

              >

                <div className="relative aspect-square overflow-hidden bg-stone-100">

                  {video ? (

                    <video

                      src={img.image_url}

                      controls

                      preload="metadata"

                      playsInline

                      className="h-full w-full object-contain"

                    />

                  ) : (

                    <img

                      src={img.image_url}

                      alt="Ảnh sản phẩm"

                      loading="lazy"

                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"

                      onError={() =>

                        console.error("GALLERY IMAGE LOAD ERROR:", img.image_url)

                      }

                    />

                  )}

                  <div className="absolute left-2 top-2 rounded-md bg-black/65 px-2 py-1 text-[9px] font-medium text-white">

                    {video ? (

                      <span className="flex items-center gap-1">

                        <Play size={10} /> VIDEO

                      </span>

                    ) : r2 ? (

                      "R2"

                    ) : (

                      "Storage cũ"

                    )}

                  </div>

                  {isFeatured && (

                    <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-amber-400 px-2 py-1 text-[9px] font-semibold text-stone-900">

                      <Star size={10} fill="currentColor" />

                      Ảnh đại diện

                    </div>

                  )}

                  {!video && img.is_lifestyle && (

                    <div className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-[9px] font-semibold text-stone-700">

                      Lifestyle

                    </div>

                  )}

                </div>

                <div className="space-y-2 p-2">

                  {!video && (

                    <>

                      <div>

                        <label

                          htmlFor={`color-${img.id}`}

                          className="mb-1 block text-[9px] font-medium uppercase tracking-wide text-stone-400"

                        >

                          Màu

                        </label>

                        <select

                          id={`color-${img.id}`}

                          value={img.color_id ?? ""}

                          onChange={(e) => updateColor(img.id, e.target.value)}

                          className="h-8 w-full rounded-lg border border-stone-200 bg-stone-50 px-2 text-[11px] text-stone-700 outline-none focus:border-stone-400"

                        >

                          <option value="">Không thuộc màu</option>

                          {colors.map((color) => (

                            <option key={color.id} value={color.id}>

                              {color.name}

                            </option>

                          ))}

                        </select>

                        {selectedColorName && (

                          <p className="mt-1 truncate text-[9px] text-stone-400">

                            {selectedColorName}

                          </p>

                        )}

                      </div>

                      <label className="flex cursor-pointer items-center justify-between rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-2">

                        <span className="text-[10px] font-medium text-stone-600">

                          Lifestyle

                        </span>

                        <input

                          type="checkbox"

                          checked={Boolean(img.is_lifestyle)}

                          onChange={(e) =>

                            updateLifestyle(img.id, e.target.checked)

                          }

                          className="h-4 w-4 accent-stone-800"

                        />

                      </label>

                    </>

                  )}

                  {video && (

                    <p className="rounded-lg bg-stone-50 px-2 py-2 text-[10px] text-stone-500">

                      Video sản phẩm · Không dùng làm ảnh đại diện

                    </p>

                  )}

                  <div className="grid grid-cols-[1fr_auto] gap-1.5">

                    <button

                      type="button"

                      onClick={() => makeFeatured(img.image_url)}

                      disabled={video || isFeatured}

                      title={

                        video

                          ? "Video không thể làm ảnh đại diện"

                          : "Đặt ảnh đại diện"

                      }

                      className={`flex h-8 items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-medium transition disabled:cursor-not-allowed ${

                        isFeatured

                          ? "bg-stone-100 text-stone-500"

                          : video

                            ? "border border-stone-200 bg-stone-50 text-stone-300"

                            : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"

                      }`}

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

                    <button

                      type="button"

                      onClick={() => removeImage(img.id)}

                      title="Xóa media"

                      aria-label="Xóa media"

                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"

                    >

                      <Trash2 size={14} />

                    </button>

                  </div>

                </div>

              </article>

            );

          })}

        </div>

      ) : (

        <div className="mt-5 rounded-xl border border-dashed border-stone-200 bg-stone-50/60 px-5 py-8 text-center">

          <ImagePlus size={22} className="mx-auto text-stone-400" />

          <p className="mt-3 text-xs font-medium text-stone-600">

            Chưa có ảnh hoặc video

          </p>

          <p className="mt-1 text-[10px] text-stone-400">

            Chọn file ở phía trên để thêm vào thư viện.

          </p>

        </div>

      )}

      {images.length > 0 && (

        <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">

          <p className="text-[10px] text-stone-400">

            Media được lưu trên Cloudflare R2.

          </p>

          <div className="flex items-center gap-1.5 text-[10px] text-stone-400">

            <Check size={11} className="text-emerald-500" />

            Đã đồng bộ

          </div>

        </div>

      )}

    </section>

  );

}
