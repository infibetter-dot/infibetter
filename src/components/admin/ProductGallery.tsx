import { useEffect, useState, type ChangeEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  GripVertical,
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
  const [activeFilter, setActiveFilter] = useState<"all" | "thumbnail" | "lifestyle">("all");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
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
  function getRetailGalleryImages(source: ProductImage[] = images) {
    return source
      .filter((item) => !isVideoMedia(item) && item.is_lifestyle !== true)
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));
  }

  async function persistOrder(ordered: ProductImage[]) {
    // Write temporary values first to avoid collisions when a unique
    // (product_id, sort_order) constraint exists.
    for (let index = 0; index < ordered.length; index++) {
      const { error } = await supabase
        .from("product_images")
        .update({ sort_order: 100000 + index })
        .eq("id", ordered[index].id);
      if (error) throw error;
    }
    for (let index = 0; index < ordered.length; index++) {
      const { error } = await supabase
        .from("product_images")
        .update({ sort_order: index })
        .eq("id", ordered[index].id);
      if (error) throw error;
    }
    setImages(ordered.map((item, index) => ({ ...item, sort_order: index })));
  }

  async function persistRetailGalleryOrder(orderedGallery: ProductImage[]) {
    const otherMedia = images
      .filter((item) => isVideoMedia(item) || item.is_lifestyle === true)
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));
    await persistOrder([...orderedGallery, ...otherMedia]);
  }

  async function makeFeatured(imageUrl: string) {
    const selected = images.find((item) => item.image_url === imageUrl);
    if (!selected || isVideoMedia(selected) || selected.is_lifestyle) return;
    try {
      const { error } = await supabase
        .from("products")
        .update({ image_url: imageUrl })
        .eq("id", productId);
      if (error) throw error;

      const orderedGallery = [
        selected,
        ...getRetailGalleryImages().filter((item) => item.id !== selected.id),
      ];
      await persistRetailGalleryOrder(orderedGallery);
      setFeaturedImage(imageUrl);
      onFeaturedChanged?.(imageUrl);
      onSaved?.();
      toast.success("Đã đặt ảnh đại diện và đưa ảnh lên đầu thư viện Retail.");
    } catch (error) {
      console.error("UPDATE FEATURED IMAGE / ORDER ERROR:", error);
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật ảnh đại diện.");
      await loadImages();
    }
  }

  async function reorderImages(sourceId: string, targetId: string) {
    if (!sourceId || sourceId === targetId) return;

    const isLifestyleSort = activeFilter === "lifestyle";
    const sortableImages = isLifestyleSort
      ? images
          .filter((item) => !isVideoMedia(item) && item.is_lifestyle === true)
          .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
      : getRetailGalleryImages();

    const from = sortableImages.findIndex((item) => item.id === sourceId);
    const to = sortableImages.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;

    const reordered = [...sortableImages];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);

    const nextImages = isLifestyleSort
      ? [
          ...images.filter((item) => !isVideoMedia(item) && item.is_lifestyle !== true),
          ...reordered,
          ...images.filter((item) => isVideoMedia(item)),
        ]
      : [
          ...reordered,
          ...images.filter((item) => isVideoMedia(item) || item.is_lifestyle === true),
        ];

    setImages(nextImages);

    try {
      if (isLifestyleSort) {
        // Persist lifestyle order independently; do not change Retail thumbnail order.
        const retailImages = getRetailGalleryImages().sort(
          (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0),
        );
        const videos = images.filter((item) => isVideoMedia(item));
        await persistOrder([...retailImages, ...reordered, ...videos]);
        toast.success("Đã lưu thứ tự ảnh Lifestyle.");
      } else {
        await persistRetailGalleryOrder(reordered);
        const firstImage = reordered[0];
        if (firstImage && featuredImage !== firstImage.image_url) {
          const { error } = await supabase
            .from("products")
            .update({ image_url: firstImage.image_url })
            .eq("id", productId);
          if (error) throw error;
          setFeaturedImage(firstImage.image_url);
          onFeaturedChanged?.(firstImage.image_url);
        }
        toast.success("Đã lưu thứ tự ảnh hiển thị trên Retail.");
      }
      onSaved?.();
    } catch (error) {
      console.error("REORDER MEDIA ERROR:", error);
      toast.error(error instanceof Error ? error.message : "Không thể sắp xếp media.");
      await loadImages();
    }
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
  const visibleImages = images.filter((img) => {
    if (activeFilter === "thumbnail") return !isVideoMedia(img) && img.is_lifestyle !== true;
    if (activeFilter === "lifestyle") return !isVideoMedia(img) && img.is_lifestyle === true;
    return true;
  }).sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));

return (
    <section className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
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
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-medium text-stone-500">
            {images.length} file
          </span>
          <label
            htmlFor="gallery-upload"
            className={`inline-flex h-7 cursor-pointer items-center gap-1 rounded-lg border border-stone-200 bg-white px-2 text-[10px] font-semibold text-stone-700 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 ${
              uploading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {uploading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <UploadCloud size={13} />
            )}
            {uploading ? "Đang tải..." : "Thêm ảnh"}
          </label>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Mở rộng thư viện media" : "Thu gọn thư viện media"}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 text-[10px] font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            {collapsed ? "Mở rộng" : "Thu gọn"}
            <ChevronDown size={13} className={`transition-transform ${collapsed ? "-rotate-90" : "rotate-180"}`} />
          </button>
        </div>
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
      {!collapsed && (
      <div className="min-w-0">
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
        <>
        <div className="mt-4 mb-2 flex flex-wrap gap-2" role="tablist" aria-label="Lọc thư viện media">
          {([
            ["all", "All Media", images.length],
            ["thumbnail", "Thumbnail", images.filter((img) => !isVideoMedia(img) && img.is_lifestyle !== true).length],
            ["lifestyle", "Lifestyle", images.filter((img) => !isVideoMedia(img) && img.is_lifestyle === true).length],
          ] as const).map(([filter, label, count]) => (
            <button
              key={filter}
              type="button"
              role="tab"
              aria-selected={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${activeFilter === filter ? "bg-stone-900 text-white" : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"}`}
            >
              {label} <span className="ml-1 opacity-70">{count}</span>
            </button>
          ))}
        </div>
        {activeFilter === "thumbnail" && (
          <p className="mb-2 text-[10px] text-stone-400">Kéo thả để sắp xếp toàn bộ ảnh sản phẩm. Thứ tự này sẽ đồng bộ với gallery trên Retail; ảnh đầu tiên là ảnh đại diện.</p>
        )}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visibleImages.map((img) => {
            const video = isVideoMedia(img);
            const isFeatured = !video && featuredImage === img.image_url;
            const r2 = isR2Url(img.image_url);
            const selectedColorName =
              colors.find((color) => color.id === img.color_id)?.name ?? "";
            return (
              <article
                key={img.id}
                draggable={activeFilter !== "all" && !video}
                onDragStart={() => setDraggingId(img.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggingId) void reorderImages(draggingId, img.id);
                  setDraggingId(null);
                }}
                onDragEnd={() => setDraggingId(null)}
                className={`group min-w-0 cursor-grab overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ${draggingId === img.id ? "opacity-40" : ""}`}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
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
                      className="h-full w-full object-contain bg-white p-1.5 transition duration-300 group-hover:scale-[1.02]"
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
                  {activeFilter !== "all" && !video && (
                    <div
                      className="absolute right-2 top-2 z-10 flex h-8 w-8 cursor-grab items-center justify-center rounded-md border border-white/80 bg-white text-stone-800 shadow-md active:cursor-grabbing"
                      title="Giữ và kéo để di chuyển vị trí ảnh"
                      aria-label={activeFilter === "lifestyle" ? "Giữ và kéo để sắp xếp ảnh Lifestyle" : "Giữ và kéo để sắp xếp ảnh sản phẩm"}
                    >
                      <GripVertical size={17} />
                    </div>
                  )}
                  {isFeatured && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-amber-400 px-2 py-1 text-[9px] font-semibold text-stone-900">
                      <Star size={10} fill="currentColor" />
                      Ảnh đại diện
                    </div>
                  )}
                  {!video && img.is_lifestyle && (
                    <div className="absolute bottom-2 right-2 rounded-md bg-white/95 px-2 py-1 text-[9px] font-semibold text-stone-700 shadow-sm">
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
                      <label
                          className="flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 transition hover:border-slate-300"
                          title="Bật để đánh dấu ảnh này là ảnh Lifestyle"
                        >
                          <span className="min-w-0">
                            <span className="block text-[11px] font-semibold text-slate-700">
                              Lifestyle
                            </span>
                            <span className="mt-0.5 block text-[9px] text-slate-400">
                              {img.is_lifestyle ? "Đang bật" : "Đang tắt"}
                            </span>
                          </span>
                          <span className="relative inline-flex h-[22px] w-[38px] shrink-0 items-center">
                            <input
                              type="checkbox"
                              role="switch"
                              aria-label="Bật/tắt ảnh Lifestyle"
                              checked={Boolean(img.is_lifestyle)}
                              onChange={(e) =>
                                updateLifestyle(img.id, e.target.checked)
                              }
                              className="peer sr-only"
                            />
                            <span className="absolute inset-0 rounded-full bg-slate-300 transition-colors duration-200 peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500/30 peer-focus-visible:ring-offset-2" />
                            <span className="absolute left-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-4" />
                          </span>
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
        {visibleImages.length === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-stone-200 px-4 py-6 text-center text-xs text-stone-400">
            Không có media trong danh mục này.
          </div>
        )}
        </>
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
            File media lưu trên Cloudflare R2 · Metadata và thứ tự lưu trong Supabase.
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
            <Check size={11} className="text-emerald-500" />
            Đã đồng bộ
          </div>
        </div>
      )}
      </div>
      )}
    </section>
  );
}
