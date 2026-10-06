import { useEffect, useMemo, useState } from "react";

import { Trash2 } from "lucide-react";







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
  const [colorModelSelections, setColorModelSelections] = useState<Record<string, string[]>>({});







  const [loading, setLoading] = useState(true);







  const [saving, setSaving] = useState(false);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");



  const [showAddModel, setShowAddModel] = useState(false);



  const [newModelBrand, setNewModelBrand] = useState("");



  const [newModelName, setNewModelName] = useState("");



  const [addingModel, setAddingModel] = useState(false);















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

      const loadedColorModelSelections: Record<string, string[]> = {};
      for (const variant of loadedVariants) {
        if (!variant.color_id || !variant.is_active) continue;
        const list = loadedColorModelSelections[variant.color_id] ?? [];
        if (!list.includes(variant.device_model_id)) list.push(variant.device_model_id);
        loadedColorModelSelections[variant.color_id] = list;
      }
      setColorModelSelections(loadedColorModelSelections);







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















  function slugifyModel(value: string) {



    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")



      .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");



  }







  async function addModel() {



    const name = newModelName.trim();



    const brand = newModelBrand.trim() || "Apple";



    if (!name) return toast.error("Vui lòng nhập tên model.");







    const slug = slugifyModel(name);



    if (models.some((m) => m.name.toLowerCase() === name.toLowerCase() || m.slug === slug)) {



      return toast.error("Model này đã tồn tại.");



    }







    try {



      setAddingModel(true);



      const nextSortOrder = models.length



        ? Math.max(...models.map((m) => Number(m.sort_order) || 0)) + 1



        : 0;







      const { data, error } = await supabase.from("device_models").insert({



        brand, name, slug, sort_order: nextSortOrder, is_active: true,



      }).select("id, brand, name, slug, sort_order, is_active").single();







      if (error) throw error;



      if (data) {



        setModels((current) => [...current, data].sort((a,b) => a.sort_order - b.sort_order));



        setSelectedModelIds((current) => [...new Set([...current, data.id])]);



      }



      setNewModelBrand("");



      setNewModelName("");



      setShowAddModel(false);



      toast.success(`Đã thêm model "${name}".`);



    } catch (error: any) {



      console.error("ADD DEVICE MODEL ERROR", error);



      toast.error(error?.message ?? "Không thể thêm model.");



    } finally {



      setAddingModel(false);



    }



  }







  function toggleModel(modelId: string) {







    setSelectedModelIds((current) => {







      if (current.includes(modelId)) {







        return current.filter((id) => id !== modelId);







      }







      return [...current, modelId];







    });







  }















  function getModelsForColor(colorId: string | null): string[] {
    if (!colorId) return selectedModelIds;
    return colorModelSelections[colorId] ?? selectedModelIds;
  }

  function toggleColorModel(colorId: string, modelId: string) {
    setColorModelSelections((current) => {
      const base = current[colorId] ?? selectedModelIds;
      const next = base.includes(modelId)
        ? base.filter((id) => id !== modelId)
        : [...base, modelId];
      return { ...current, [colorId]: next };
    });
  }

  function isVariantAllowed(modelId: string, colorId: string | null) {
    if (!selectedModelIds.includes(modelId)) return false;
    if (!colorId) return true;
    return getModelsForColor(colorId).includes(modelId);
  }

  function generateCombinations() {
    const colorIds: (string | null)[] =
      colors.length > 0 ? colors.map((color) => color.id) : [null];

    setVariants((current) => {
      const next = current.filter((variant) =>
        isVariantAllowed(variant.device_model_id, variant.color_id ?? null),
      );

      for (const colorId of colorIds) {
        for (const modelId of getModelsForColor(colorId)) {
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

      return next.map((variant, index) => ({ ...variant, sort_order: index }));
    });

    toast.success("Đã tạo các tổ hợp Model × Màu.");
  }

  function updateVariant(index: number, field: keyof VariantRow, value: any) {







    setVariants((current) => {







      const clone = [...current];







      clone[index] = { ...clone[index], [field]: value };







      return clone;







    });







  }















    function getVisibleVariantCount() {
    return variants.filter(
      (variant) =>
        selectedModelIds.includes(variant.device_model_id) &&
        isVariantAllowed(variant.device_model_id, variant.color_id ?? null),
    ).length;
  }

  function applyBulkPrice() {
    const value = Number(bulkPrice);
    if (bulkPrice.trim() === "" || !Number.isFinite(value) || value < 0) {
      toast.error("Vui lòng nhập giá USD hợp lệ.");
      return;
    }

    const count = getVisibleVariantCount();
    setVariants((current) =>
      current.map((variant) =>
        selectedModelIds.includes(variant.device_model_id) &&
        isVariantAllowed(variant.device_model_id, variant.color_id ?? null)
          ? { ...variant, price: value }
          : variant,
      ),
    );
    toast.success(`Đã áp dụng giá $${value.toFixed(2)} cho ${count} variant.`);
  }

  function applyBulkStock() {
    const value = Number(bulkStock);
    if (bulkStock.trim() === "" || !Number.isFinite(value) || value < 0) {
      toast.error("Vui lòng nhập tồn kho hợp lệ.");
      return;
    }

    const stock = Math.floor(value);
    const count = getVisibleVariantCount();
    setVariants((current) =>
      current.map((variant) =>
        selectedModelIds.includes(variant.device_model_id) &&
        isVariantAllowed(variant.device_model_id, variant.color_id ?? null)
          ? { ...variant, stock }
          : variant,
      ),
    );
    toast.success(`Đã áp dụng tồn kho ${stock} cho ${count} variant.`);
  }

async function deleteVariant(index: number) {

    const variant = variants[index];

    if (!variant) return;



    try {

      if (variant.id) {

        const { error } = await supabase

          .from("product_variants")

          .delete()

          .eq("id", variant.id);



        if (error) throw error;

      }



      setVariants((current) =>

        current.filter((_, itemIndex) => itemIndex !== index)

      );



      toast.success("Đã xóa tổ hợp Model × Màu.");

    } catch (error: any) {

      console.error("DELETE PRODUCT VARIANT ERROR", error);

      toast.error(error?.message ?? "Không thể xóa tổ hợp Model × Màu.");

    }

  }







  async function save() {







    try {







      setSaving(true);















      const activeModelSet = new Set(selectedModelIds);







      const desiredVariants = variants.filter(
        (variant) =>
          activeModelSet.has(variant.device_model_id) &&
          isVariantAllowed(variant.device_model_id, variant.color_id ?? null),
      );















      // Remove combinations that no longer belong to the selected models.







      const existingResult = await supabase







        .from("product_variants")







        .select("id, device_model_id, color_id")







        .eq("product_id", productId);















      if (existingResult.error) throw existingResult.error;















      const selectedSet = new Set(selectedModelIds);
      const desiredExistingIds = new Set(
        desiredVariants.map((variant) => variant.id).filter(Boolean),
      );

      const idsToDelete = (existingResult.data ?? [])
        .filter(
          (variant) =>
            !selectedSet.has(variant.device_model_id) ||
            (variant.id && !desiredExistingIds.has(variant.id)),
        )
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







          sku: String(variant.sku ?? "").trim() || null,







          price:







            variant.price === null || variant.price === ""







              ? null







              : Number(variant.price),







          compare_at_price:







            variant.compare_at_price === null || variant.compare_at_price === ""







              ? null







              : Number(variant.compare_at_price),







          stock: Math.max(0, Number(variant.stock) || 0),







          image_url: String(variant.image_url ?? "").trim() || null,







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







          <button



            type="button"



            onClick={() => setShowAddModel(true)}



            className="rounded-full border border-dashed border-stone-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-stone-600 hover:border-stone-500 hover:bg-stone-50"



          >



            + Thêm model



          </button>







        </div>







      </div>















      {selectedModelIds.length > 0 && colors.length > 0 && (
        <div className="mb-4 rounded-xl border border-stone-200 bg-stone-50/50 p-3">
          <p className="mb-1 text-[11px] font-semibold text-stone-700">Chọn model cho từng màu</p>
          <p className="mb-3 text-[10px] leading-4 text-stone-400">
            Mỗi màu có thể hỗ trợ model khác nhau. Ví dụ Cosmic Orange chỉ chọn iPhone 17 Pro và iPhone 17 Pro Max.
          </p>
          <div className="space-y-2">
            {colors.map((color) => {
              const selectedForColor = getModelsForColor(color.id);
              return (
                <div key={color.id} className="rounded-lg border border-stone-200 bg-white p-2.5">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="h-4 w-4 shrink-0 rounded-full border border-white shadow-sm ring-1 ring-stone-200"
                      style={{ backgroundColor: color.hex || "#FFFFFF" }}
                    />
                    <span className="text-[11px] font-semibold text-stone-800">{color.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedModelIds.map((modelId) => {
                      const model = modelMap.get(modelId);
                      const active = selectedForColor.includes(modelId);
                      return (
                        <button
                          key={`${color.id}-${modelId}`}
                          type="button"
                          onClick={() => toggleColorModel(color.id, modelId)}
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-medium transition ${
                            active
                              ? "border-[#111827] bg-[#111827] text-white"
                              : "border-stone-200 bg-white text-stone-500 hover:border-stone-400"
                          }`}
                        >
                          {model?.name ?? "Model"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button







        type="button"







        onClick={generateCombinations}







        disabled={selectedModelIds.length === 0}







        className="mb-4 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] font-semibold text-stone-700 disabled:opacity-40"







      >







        + Tạo tổ hợp Model × Màu







      </button>















      {selectedModelIds.length > 0 && variants.length > 0 && (
        <div className="mb-4 min-h-[86px] rounded-xl border border-[#E7EAF0] bg-white p-3 shadow-sm">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold text-stone-800">Áp dụng hàng loạt</p>
              <p className="mt-0.5 text-[9px] text-stone-400">
                Áp dụng cho {getVisibleVariantCount()} variant đang hiển thị.
              </p>
            </div>
            <span className="text-[9px] font-medium text-stone-400">Không thay đổi SKU</span>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="rounded-lg border border-stone-200 bg-stone-50/60 p-2.5">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label className="text-[10px] font-semibold text-stone-700">Giá bán</label>
                <span className="text-[9px] text-stone-400">USD</span>
              </div>
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-stone-400">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") applyBulkPrice(); }}
                    placeholder="60.00"
                    className="h-9 w-full rounded-lg border border-stone-200 bg-white pl-7 pr-2 text-xs font-medium outline-none transition focus:border-[#111827] focus:ring-2 focus:ring-stone-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyBulkPrice}
                  className="h-9 shrink-0 rounded-lg bg-[#111827] px-3 text-[10px] font-semibold text-white transition hover:bg-[#252525]"
                >
                  Áp dụng giá
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-stone-200 bg-stone-50/60 p-2.5">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label className="text-[10px] font-semibold text-stone-700">Tồn kho</label>
                <span className="text-[9px] text-stone-400">Sản phẩm</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={bulkStock}
                  onChange={(e) => setBulkStock(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") applyBulkStock(); }}
                  placeholder="20"
                  className="h-9 min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-2 text-xs font-medium outline-none transition focus:border-[#111827] focus:ring-2 focus:ring-stone-100"
                />
                <button
                  type="button"
                  onClick={applyBulkStock}
                  className="h-9 shrink-0 rounded-lg bg-[#111827] px-3 text-[10px] font-semibold text-white transition hover:bg-[#252525]"
                >
                  Áp dụng kho
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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







                  className="group grid items-center gap-x-4 gap-y-3 min-h-[86px] rounded-xl border border-[#E7EAF0] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-150 hover:border-[#CBD5E1] hover:shadow-[0_4px_14px_rgba(15,23,42,0.05)] md:grid-cols-[1.05fr_1.05fr_1.55fr_0.9fr_0.9fr_40px] md:items-center"







                >







                  <div className="min-w-0 self-center">
                    <p className="mb-1 flex h-3.5 items-center text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">Model</p>
                    <div className="flex h-9 items-center">
                      <p className="truncate text-[12px] font-semibold leading-4 text-slate-900">
                        {model?.name ?? "—"}
                      </p>
                    </div>
                  </div>















                  <div className="min-w-0 self-center">
                    <p className="mb-1 flex h-3.5 items-center text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">Màu</p>
                    <div className="flex h-9 min-w-0 items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full border border-black/10 shadow-sm"
                        style={{ backgroundColor: color?.hex ?? "#E5E7EB" }}
                        aria-hidden="true"
                      />
                      <p className="truncate text-[12px] font-medium leading-4 text-slate-700">
                        {color?.name ?? "Mặc định"}
                      </p>
                    </div>
                  </div>















                  <label className="min-w-0">







                    <span className="text-[10px] text-stone-400">SKU</span>







                    <input







                      value={variant.sku ?? ""}







                      onChange={(e) => updateVariant(index, "sku", e.target.value)}







                      className="h-9 w-full rounded-lg border border-[#DDE2E8] bg-[#FBFCFD] px-2.5 text-[12px] font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"







                      placeholder="CASE-17-PRO"







                    />







                  </label>















                  <label className="min-w-0 self-center">
                    <span className="mb-1 flex h-3.5 items-center text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">Price USD</span>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.price ?? ""}
                        onChange={(e) => updateVariant(index, "price", e.target.value)}
                        className="h-9 w-full rounded-lg border border-[#DDE2E8] bg-[#FBFCFD] pl-7 pr-2.5 text-[12px] font-semibold text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
                      />
                    </div>
                    <span className="mt-1 block h-3 text-[9px] leading-3 text-slate-400">
                      {formatVND(variant.price)}
                    </span>
                  </label>















                  <label className="min-w-0 self-center">
                    <span className="mb-1 flex h-3.5 items-center text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">Stock</span>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={variant.stock ?? 0}
                        onChange={(e) => updateVariant(index, "stock", e.target.value)}
                        className="h-9 w-full rounded-lg border border-[#DDE2E8] bg-[#FBFCFD] px-2.5 pr-10 text-[12px] font-semibold text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
                      />
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-medium uppercase tracking-wide text-slate-400">pcs</span>
                    </div>
                  </label>









                  <div className="flex h-full items-center justify-end">

                    <button

                      type="button"

                      onClick={() => void deleteVariant(index)}

                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-300 transition hover:border-red-100 hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"

                      title="Xóa variant"

                      aria-label={`Xóa ${model?.name ?? "model"} - ${color?.name ?? "Mặc định"}`}

                    >

                      <Trash2 size={14} strokeWidth={1.8} />

                    </button>

                  </div>







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















      {showAddModel && (



        <div



          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4"



          onMouseDown={(e) => {



            if (e.target === e.currentTarget && !addingModel) setShowAddModel(false);



          }}



        >



          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">



            <h4 className="text-sm font-bold text-[#2D2D2D]">Thêm model mới</h4>



            <p className="mt-1 text-[11px] text-stone-500">Model sẽ được lưu vào danh sách dùng chung.</p>







            <label className="mt-4 block">



              <span className="mb-1.5 block text-[11px] font-semibold text-stone-700">Brand</span>



              <input



                value={newModelBrand}



                onChange={(e) => setNewModelBrand(e.target.value)}



                placeholder="Apple"



                className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-stone-500"



              />



            </label>







            <label className="mt-4 block">



              <span className="mb-1.5 block text-[11px] font-semibold text-stone-700">Tên model</span>



              <input



                value={newModelName}



                onChange={(e) => setNewModelName(e.target.value)}



                onKeyDown={(e) => {



                  if (e.key === "Enter" && !addingModel) void addModel();



                }}



                placeholder="iPhone 18 Pro"



                autoFocus



                className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-stone-500"



              />



            </label>







            <div className="mt-5 flex justify-end gap-2">



              <button



                type="button"



                disabled={addingModel}



                onClick={() => setShowAddModel(false)}



                className="rounded-lg border border-stone-200 px-4 py-2 text-[11px] font-semibold text-stone-600"



              >



                Hủy



              </button>



              <button



                type="button"



                disabled={addingModel || !newModelName.trim()}



                onClick={() => void addModel()}



                className="rounded-lg bg-[#111827] px-4 py-2 text-[11px] font-semibold text-white disabled:opacity-40"



              >



                {addingModel ? "Đang thêm..." : "Thêm model"}



              </button>



            </div>



          </div>



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
