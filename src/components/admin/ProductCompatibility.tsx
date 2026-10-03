import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  productId: string;
  onSaved?: () => void;
}

interface DeviceModel {
  id: string;
  brand: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
}

interface ColorRow {
  id: string;
  name: string;
  hex: string;
  price?: number | null;
  stock?: number | null;
}

interface VariantRow {
  id?: string;
  product_id: string;
  device_model_id: string;
  color_id: string | null;
  sku: string;
  price: number | null;
  compare_at_price: number | null;
  stock: number;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

const USD_TO_VND = 25500;


function formatVND(value: number | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  return `${Math.round(Number(value) * USD_TO_VND).toLocaleString("vi-VN")} ₫`;
}

export default function ProductCompatibility({ productId, onSaved }: Props) {
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [colors, setColors] = useState<ColorRow[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, [productId]);

  async function load() {
    try {
      setLoading(true);

      const [modelsResult, colorsResult, variantsResult] = await Promise.all([
        supabase
          .from("device_models")
          .select("id, brand, name, slug, sort_order, is_active")
          .eq("is_active", true)
          .order("sort_order"),
        supabase
          .from("product_colors")
          .select("id, name, hex, price, stock")
          .eq("product_id", productId)
          .order("sort_order"),
        supabase
          .from("product_variants")
          .select(
            "id, product_id, device_model_id, color_id, sku, price, compare_at_price, stock, image_url, sort_order, is_active",
          )
          .eq("product_id", productId)
          .order("sort_order"),
      ]);

      if (modelsResult.error) throw modelsResult.error;
      if (colorsResult.error) throw colorsResult.error;
      if (variantsResult.error) throw variantsResult.error;

      const loadedModels = modelsResult.data ?? [];
      const loadedColors = colorsResult.data ?? [];
      const loadedVariants = variantsResult.data ?? [];

      setModels(loadedModels);
      setColors(loadedColors);
      setVariants(loadedVariants);
      setSelectedModelIds(
        Array.from(
          new Set(
            loadedVariants
              .filter((variant) => variant.is_active)
              .map((variant) => variant.device_model_id),
          ),
        ),
      );
    } catch (error: any) {
      console.error("LOAD PRODUCT COMPATIBILITY ERROR", error);
      toast.error(error?.message ?? "Không tải được dòng máy tương thích.");
    } finally {
      setLoading(false);
    }
  }

  const modelMap = useMemo(
    () => new Map(models.map((model) => [model.id, model])),
    [models],
  );

  const colorMap = useMemo(
    () => new Map(colors.map((color) => [color.id, color])),
    [colors],
  );

  function toggleModel(modelId: string) {
    setSelectedModelIds((current) => {
      if (current.includes(modelId)) {
        return current.filter((id) => id !== modelId);
      }
      return [...current, modelId];
    });
  }

  function generateCombinations() {
    const colorIds: (string | null)[] =
      colors.length > 0 ? colors.map((color) => color.id) : [null];

    setVariants((current) => {
      const next = [...current];

      for (const modelId of selectedModelIds) {
        for (const colorId of colorIds) {
          const exists = next.some(
            (variant) =>
              variant.device_model_id === modelId &&
              (variant.color_id ?? null) === (colorId ?? null),
          );

          if (exists) continue;

          const color = colorId ? colorMap.get(colorId) : null;

          next.push({
            product_id: productId,
            device_model_id: modelId,
            color_id: colorId,
            sku: "",
            price: color?.price ?? null,
            compare_at_price: null,
            stock: Number(color?.stock ?? 0),
            image_url: "",
            sort_order: next.length,
            is_active: true,
          });
        }
      }

      return next;
    });

    toast.success("Đã tạo các tổ hợp dòng máy / màu.");
  }

  function updateVariant(index: number, field: keyof VariantRow, value: any) {
    setVariants((current) => {
      const clone = [...current];
      clone[index] = { ...clone[index], [field]: value };
      return clone;
    });
  }

  async function save() {
    try {
      setSaving(true);

      const activeModelSet = new Set(selectedModelIds);
      const desiredVariants = variants.filter((variant) =>
        activeModelSet.has(variant.device_model_id),
      );

      // Remove combinations that no longer belong to the selected models.
      const existingResult = await supabase
        .from("product_variants")
        .select("id, device_model_id")
        .eq("product_id", productId);

      if (existingResult.error) throw existingResult.error;

      const selectedSet = new Set(selectedModelIds);
      const idsToDelete = (existingResult.data ?? [])
        .filter((variant) => !selectedSet.has(variant.device_model_id))
        .map((variant) => variant.id);

      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("product_variants")
          .delete()
          .in("id", idsToDelete);

        if (deleteError) throw deleteError;
      }

      if (selectedModelIds.length === 0) {
        await supabase.from("product_variants").delete().eq("product_id", productId);
        setVariants([]);
        toast.success("Đã bỏ toàn bộ dòng máy tương thích.");
        onSaved?.();
        return;
      }

      for (let index = 0; index < desiredVariants.length; index++) {
        const variant = desiredVariants[index];
        const payload = {
          product_id: productId,
          device_model_id: variant.device_model_id,
          color_id: variant.color_id,
          sku: variant.sku?.trim() || null,
          price:
            variant.price === null || variant.price === ""
              ? null
              : Number(variant.price),
          compare_at_price:
            variant.compare_at_price === null || variant.compare_at_price === ""
              ? null
              : Number(variant.compare_at_price),
          stock: Math.max(0, Number(variant.stock) || 0),
          image_url: variant.image_url?.trim() || null,
          sort_order: index,
          is_active: true,
        };

        if (variant.id) {
          const { error } = await supabase
            .from("product_variants")
            .update(payload)
            .eq("id", variant.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("product_variants")
            .insert(payload);
          if (error) throw error;
        }
      }

      await load();
      onSaved?.();
      toast.success("Đã lưu dòng máy tương thích.");
    } catch (error: any) {
      console.error("SAVE PRODUCT COMPATIBILITY ERROR", error);
      toast.error(error?.message ?? "Lưu dòng máy thất bại.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-[#DDD6CE] bg-white p-4 md:p-5">
        <p className="text-sm text-neutral-500">Đang tải dòng máy...</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#DDD6CE] bg-white p-4 shadow-sm md:p-5">
      <div className="mb-4 flex items-start justify-between gap-4 border-b border-[#E8E4DE] pb-3">
        <div>
          <h3 className="text-base font-bold text-[#2D2D2D]">
            Dòng máy tương thích
          </h3>
          <p className="mt-1 text-[11px] leading-5 text-neutral-500">
            Dùng cho case / phụ kiện có nhiều model như iPhone 17, 17 Pro, 17 Pro Max.
          </p>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="shrink-0 rounded-lg bg-[#111827] px-3 py-2 text-[11px] font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu"}
        </button>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-[11px] font-semibold text-stone-700">
          Chọn model
        </p>
        <div className="flex flex-wrap gap-2">
          {models.map((model) => {
            const active = selectedModelIds.includes(model.id);
            return (
              <button
                key={model.id}
                type="button"
                onClick={() => toggleModel(model.id)}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                  active
                    ? "border-[#111827] bg-[#111827] text-white"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"
                }`}
              >
                {model.name}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={generateCombinations}
        disabled={selectedModelIds.length === 0}
        className="mb-4 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] font-semibold text-stone-700 disabled:opacity-40"
      >
        + Tạo tổ hợp Model × Màu
      </button>

      {selectedModelIds.length > 0 && (
        <div className="space-y-2">
          {variants
            .filter((variant) => selectedModelIds.includes(variant.device_model_id))
            .map((variant) => {
              const index = variants.findIndex((item) => item === variant);
              const model = modelMap.get(variant.device_model_id);
              const color = variant.color_id ? colorMap.get(variant.color_id) : null;

              return (
                <div
                  key={variant.id ?? `${variant.device_model_id}-${variant.color_id ?? "none"}-${index}`}
                  className="grid gap-2 rounded-xl border border-stone-200 bg-stone-50/50 p-3 md:grid-cols-[1.1fr_.9fr_1fr_.7fr_.8fr]"
                >
                  <div>
                    <p className="text-[10px] text-stone-400">Model</p>
                    <p className="mt-0.5 text-xs font-semibold text-stone-900">
                      {model?.name ?? "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-stone-400">Màu</p>
                    <p className="mt-0.5 text-xs text-stone-700">
                      {color?.name ?? "Mặc định"}
                    </p>
                  </div>

                  <label className="min-w-0">
                    <span className="text-[10px] text-stone-400">SKU</span>
                    <input
                      value={variant.sku ?? ""}
                      onChange={(e) => updateVariant(index, "sku", e.target.value)}
                      className="mt-1 h-8 w-full rounded-lg border border-stone-200 bg-white px-2 text-xs outline-none focus:border-stone-500"
                      placeholder="CASE-17-PRO"
                    />
                  </label>

                  <label>
                    <span className="text-[10px] text-stone-400">Price USD</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.price ?? ""}
                      onChange={(e) => updateVariant(index, "price", e.target.value)}
                      className="mt-1 h-8 w-full rounded-lg border border-stone-200 bg-white px-2 text-xs outline-none focus:border-stone-500"
                    />
                    <span className="mt-0.5 block text-[9px] text-stone-400">
                      {formatVND(variant.price)}
                    </span>
                  </label>

                  <label>
                    <span className="text-[10px] text-stone-400">Stock</span>
                    <input
                      type="number"
                      min="0"
                      value={variant.stock ?? 0}
                      onChange={(e) => updateVariant(index, "stock", e.target.value)}
                      className="mt-1 h-8 w-full rounded-lg border border-stone-200 bg-white px-2 text-xs outline-none focus:border-stone-500"
                    />
                  </label>
                </div>
              );
            })}
        </div>
      )}

      {selectedModelIds.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 p-4 text-center text-[11px] text-stone-400">
          Chưa chọn dòng máy. Ví dụ: iPhone 17, iPhone 17 Pro, iPhone 17 Pro Max.
        </div>
      )}

      {selectedModelIds.length > 0 && (
        <div className="mt-3 text-[10px] text-stone-400">
          Giá variant để trống sẽ được xử lý theo giá sản phẩm. Hiện tại bảng cho phép bạn đặt SKU, giá và tồn kho riêng cho từng Model × Màu.
        </div>
      )}
    </section>
  );
}
