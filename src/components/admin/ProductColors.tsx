import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import {
  Plus,
  Trash2,
  Save,
  Palette,
  Layers3,
  ImagePlus,
  Tag,
  CircleDollarSign,
  Package,
  Upload,
  Check,
  X,
} from "lucide-react";

interface Props {
  productId: string;
  onSaved?: () => void;
}

interface ColorRow {
  image_url: string;
  id?: string;
  name: string;
  hex: string;
  sku: string;
  price: number | null;
  stock: number;
  sort_order: number;
  material: string;
}

/* =========================================================
   MÀU CÓ SẴN
   - Chỉ dùng để chọn nhanh
   - KHÔNG giới hạn admin
========================================================= */

const COLOR_PRESETS = [
  { name: "Trắng", hex: "#FFFFFF" },
  { name: "Đen", hex: "#000000" },
  { name: "Kem", hex: "#F5E6D3" },
  { name: "Be", hex: "#D8C3A5" },
  { name: "Nâu", hex: "#8B5E3C" },
  { name: "Walnut", hex: "#6E4B3A" },
  { name: "Oak", hex: "#C8A97E" },
  { name: "Gỗ Sồi", hex: "#C89B6D" },
  { name: "Gỗ Tự Nhiên", hex: "#B88746" },
  { name: "Xám", hex: "#8A8A8A" },
  { name: "Xi Măng", hex: "#777777" },
  { name: "Xanh Olive", hex: "#6B8E23" },
  { name: "Xanh Lá", hex: "#4CAF50" },
  { name: "Xanh Navy", hex: "#1F3A5F" },
  { name: "Đỏ Rượu", hex: "#8A1538" },
  { name: "Cam", hex: "#E07A2D" },
  { name: "Vàng", hex: "#E9B949" },
  { name: "Hồng", hex: "#E8A4B8" },
];

/* =========================================================
   CHẤT LIỆU CÓ SẴN
   - Chỉ dùng để chọn nhanh
   - KHÔNG giới hạn admin
========================================================= */

const MATERIAL_PRESETS = [
  "Thép sơn đen",
  "Inox Silver",
  "Inox Gold",
  "Đồng",
  "Nhôm",
  "Gỗ",
  "Kính",
  "Đá",
];

/* =========================================================
   COMPONENT
========================================================= */

export default function ProductColors({
  productId,
  onSaved,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  const [colors, setColors] =
    useState<ColorRow[]>([]);

  /*
   * CHẤT LIỆU HIỆN CÓ
   * Bao gồm preset + các chất liệu tùy chỉnh đã có trong các variant.
   * Material đang được lưu trực tiếp trong product_colors.
   */
  const materialOptions = Array.from(
    new Set([
      ...MATERIAL_PRESETS,
      ...colors
        .map((item) => item.material?.trim())
        .filter(Boolean),
    ])
  );

  /*
   * State cho việc tạo màu mới
   */
  const [customColorOpen, setCustomColorOpen] =
    useState<Record<number, boolean>>({});

  const [customColorName, setCustomColorName] =
    useState<Record<number, string>>({});

  const [customColorHex, setCustomColorHex] =
    useState<Record<number, string>>({});

  /*
   * State cho việc tạo chất liệu mới
   */
  const [customMaterialOpen, setCustomMaterialOpen] =
    useState<Record<number, boolean>>({});

  const [customMaterial, setCustomMaterial] =
    useState<Record<number, string>>({});

  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(() => {
    loadColors();
  }, [productId]);

  async function loadColors() {
    const { data, error } =
      await supabase
        .from("product_colors")
        .select("*")
        .eq("product_id", productId)
        .order("sort_order");

    if (error) {
      console.error(
        "LOAD PRODUCT COLORS ERROR:",
        error
      );

      toast.error(error.message);
      return;
    }

    setColors(data ?? []);
  }

  /* =======================================================
     ADD VARIANT
  ======================================================= */

  function addColor() {
    setColors((prev) => [
      ...prev,
      {
        name: "Trắng",
        hex: "#FFFFFF",
        material: "Thép sơn đen",
        image_url: "",
        sku: "",
        price: null,
        stock: 0,
        sort_order: prev.length,
      },
    ]);
  }

  /* =======================================================
     UPDATE FIELD
  ======================================================= */

  function update(
    index: number,
    field: keyof ColorRow,
    value: any,
  ) {
    setColors((prev) => {
      const clone = [...prev];

      clone[index] = {
        ...clone[index],
        [field]: value,
      };

      return clone;
    });
  }

  /* =======================================================
     CHỌN MÀU CÓ SẴN
  ======================================================= */

  function updateColorPreset(
    index: number,
    hex: string,
  ) {
    const selected =
      COLOR_PRESETS.find(
        (item) =>
          item.hex === hex
      );

    if (!selected) return;

    update(
      index,
      "name",
      selected.name,
    );

    update(
      index,
      "hex",
      selected.hex,
    );

    setCustomColorOpen((prev) => ({
      ...prev,
      [index]: false,
    }));
  }

  /* =======================================================
     MỞ FORM THÊM MÀU TÙY CHỈNH
  ======================================================= */

  function openCustomColor(index: number) {
    setCustomColorName((prev) => ({
      ...prev,
      [index]: "",
    }));

    setCustomColorHex((prev) => ({
      ...prev,
      [index]: "#000000",
    }));

    setCustomColorOpen((prev) => ({
      ...prev,
      [index]: true,
    }));
  }

  /* =======================================================
     LƯU MÀU TÙY CHỈNH
  ======================================================= */

  function saveCustomColor(index: number) {
    const name =
      customColorName[index]?.trim();

    const hex =
      customColorHex[index]?.trim();

    if (!name) {
      toast.error(
        "Vui lòng nhập tên màu."
      );

      return;
    }

    if (
      !/^#[0-9A-Fa-f]{6}$/.test(hex)
    ) {
      toast.error(
        "Mã màu HEX không hợp lệ. Ví dụ: #D8C3A5"
      );

      return;
    }

    update(
      index,
      "name",
      name,
    );

    update(
      index,
      "hex",
      hex.toUpperCase(),
    );

    setCustomColorOpen((prev) => ({
      ...prev,
      [index]: false,
    }));

    toast.success(
      `Đã thêm màu "${name}"`
    );
  }

  /* =======================================================
     MỞ FORM THÊM CHẤT LIỆU
  ======================================================= */

  function openCustomMaterial(
    index: number,
  ) {
    setCustomMaterial((prev) => ({
      ...prev,
      [index]: "",
    }));

    setCustomMaterialOpen((prev) => ({
      ...prev,
      [index]: true,
    }));
  }

  /* =======================================================
     LƯU CHẤT LIỆU TÙY CHỈNH
  ======================================================= */

  function saveCustomMaterial(
    index: number,
  ) {
    const material =
      customMaterial[index]?.trim();

    if (!material) {
      toast.error(
        "Vui lòng nhập tên chất liệu."
      );

      return;
    }

    update(
      index,
      "material",
      material,
    );

    setCustomMaterialOpen((prev) => ({
      ...prev,
      [index]: false,
    }));

    toast.success(
      `Đã thêm chất liệu "${material}"`
    );
  }

  /* =======================================================
     UPLOAD IMAGE
  ======================================================= */

  async function uploadVariantImage(
    index: number,
    file: File,
  ) {
    if (!file.type.startsWith("image/")) {
      toast.error(
        "Vui lòng chọn file hình ảnh."
      );

      return;
    }

    try {
      const ext =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const fileName =
        `variants/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;

      const { error } =
        await supabase.storage
          .from("website OLive")
          .upload(
            fileName,
            file,
            {
              cacheControl: "3600",
              upsert: false,
            }
          );

      if (error) {
        throw error;
      }

      const { data } =
        supabase.storage
          .from("website OLive")
          .getPublicUrl(
            fileName
          );

      update(
        index,
        "image_url",
        data.publicUrl
      );

      toast.success(
        "Đã tải ảnh biến thể"
      );
    } catch (error: any) {
      console.error(
        "UPLOAD VARIANT IMAGE ERROR:",
        error
      );

      toast.error(
        error?.message ||
          "Không thể tải ảnh."
      );
    }
  }

  /* =======================================================
     REMOVE VARIANT
  ======================================================= */

  async function remove(
    index: number,
  ) {
    const color =
      colors[index];

    const confirmed =
      window.confirm(
        `Bạn có chắc muốn xóa Variant #${
          index + 1
        }?`
      );

    if (!confirmed) return;

    setColors((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );

    if (!color.id) {
      return;
    }

    try {
      const { error } =
        await supabase
          .from("product_colors")
          .delete()
          .eq(
            "id",
            color.id
          );

      if (error) {
        throw error;
      }

      toast.success(
        "Đã xóa biến thể"
      );
    } catch (error: any) {
      console.error(
        "DELETE VARIANT ERROR:",
        error
      );

      toast.error(
        error?.message ||
          "Không thể xóa biến thể."
      );

      loadColors();
    }
  }

  /* =======================================================
     SAVE
  ======================================================= */

  async function save() {
    try {
      setLoading(true);

      for (
        let i = 0;
        i < colors.length;
        i++
      ) {
        const c = colors[i];

        const payload = {
          image_url:
            c.image_url,
          product_id:
            productId,
          name:
            c.name.trim(),
          hex:
            c.hex.trim(),
          material:
            c.material.trim(),
          sku:
            c.sku.trim(),
          price:
            c.price,
          stock:
            c.stock,
          sort_order:
            i,
        };

        if (c.id) {
          const { error } =
            await supabase
              .from(
                "product_colors"
              )
              .update(payload)
              .eq(
                "id",
                c.id
              );

          if (error) {
            throw error;
          }
        } else {
          const { error } =
            await supabase
              .from(
                "product_colors"
              )
              .insert(payload);

          if (error) {
            throw error;
          }
        }
      }

      await loadColors();

      onSaved?.();

      toast.success(
        "Đã lưu màu sắc"
      );
    } catch (error: any) {
      console.error(
        "SAVE PRODUCT COLORS ERROR:",
        error
      );

      toast.error(
        error?.message ||
          "Lưu màu sắc thất bại"
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="w-full">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-4 flex items-center justify-between">

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-400">
            Biến thể sản phẩm
          </p>

          <p className="mt-1 text-[11px] text-neutral-400">
            Quản lý màu sắc, chất liệu, SKU,
            giá và tồn kho
          </p>
        </div>

        <button
          type="button"
          onClick={addColor}
          className="
            inline-flex
            h-9
            items-center
            gap-1.5
            rounded-lg
            border
            border-neutral-200
            bg-white
            px-3
            text-xs
            font-semibold
            text-neutral-700
            shadow-sm
            transition
            hover:border-neutral-300
            hover:bg-neutral-50
          "
        >
          <Plus className="h-3.5 w-3.5" />

          Thêm biến thể
        </button>
      </div>

      {/* =================================================
          EMPTY
      ================================================= */}

      {colors.length === 0 ? (
        <div
          className="
            rounded-xl
            border
            border-dashed
            border-neutral-300
            bg-neutral-50/60
            px-6
            py-10
            text-center
          "
        >
          <Palette className="mx-auto h-6 w-6 text-neutral-300" />

          <p className="mt-3 text-sm font-semibold text-neutral-700">
            Chưa có biến thể
          </p>

          <p className="mt-1 text-xs text-neutral-400">
            Thêm biến thể đầu tiên cho sản phẩm.
          </p>

          <button
            type="button"
            onClick={addColor}
            className="
              mt-4
              inline-flex
              h-9
              items-center
              gap-1.5
              rounded-lg
              bg-[#2D6A4F]
              px-4
              text-xs
              font-semibold
              text-white
              hover:bg-[#24583F]
            "
          >
            <Plus className="h-3.5 w-3.5" />

            Thêm biến thể
          </button>
        </div>
      ) : (
        <div className="space-y-3">

          {colors.map(
            (
              color,
              index,
            ) => (
              <div
                key={
                  color.id ??
                  `new-${index}`
                }
                className="
                  overflow-hidden
                  rounded-xl
                  border
                  border-neutral-200
                  bg-white
                "
              >

                {/* =======================================
                    HEADER VARIANT
                ======================================== */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-neutral-100
                    bg-[#FAFAF8]
                    px-4
                    py-3
                  "
                >
                  <div className="flex items-center gap-2.5">

                    <div
                      className="
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-lg
                        bg-white
                        text-neutral-500
                        shadow-sm
                      "
                    >
                      <Layers3 className="h-3.5 w-3.5" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-neutral-900">
                        Variant #{index + 1}
                      </p>

                      <p className="text-[10px] text-neutral-400">
                        {color.name ||
                          "Chưa đặt tên"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      remove(index)
                    }
                    className="
                      inline-flex
                      h-8
                      items-center
                      gap-1.5
                      rounded-lg
                      border
                      border-red-100
                      bg-red-50
                      px-2.5
                      text-[11px]
                      font-semibold
                      text-red-600
                      hover:bg-red-500
                      hover:text-white
                    "
                  >
                    <Trash2 className="h-3.5 w-3.5" />

                    Xóa
                  </button>
                </div>

                {/* =======================================
                    CONTENT
                ======================================== */}

                <div className="p-4">

                  {/* =====================================
                      COLOR / MATERIAL / IMAGE
                  ====================================== */}

                  <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.1fr]">

                    {/* =================================
                        COLOR
                    ================================== */}

                    <div>

                      <FieldLabel
                        icon={
                          <Palette className="h-3.5 w-3.5" />
                        }
                        label="Màu sắc"
                      />

                      {!customColorOpen[index] ? (
                        <>
                          <div className="flex gap-2">

                            <select
                              value={
                                COLOR_PRESETS.some(
                                  (item) =>
                                    item.hex ===
                                    color.hex
                                )
                                  ? color.hex
                                  : ""
                              }
                              onChange={(e) => {
                                if (
                                  e.target
                                    .value
                                ) {
                                  updateColorPreset(
                                    index,
                                    e.target
                                      .value,
                                  );
                                }
                              }}
                              className="
                                h-10
                                min-w-0
                                flex-1
                                rounded-lg
                                border
                                border-neutral-200
                                bg-white
                                px-3
                                text-xs
                                font-medium
                                outline-none
                                focus:border-[#2D6A4F]
                              "
                            >
                              <option value="">
                                {COLOR_PRESETS.some(
                                  (item) =>
                                    item.hex ===
                                    color.hex
                                )
                                  ? color.name
                                  : "Màu tùy chỉnh"}
                              </option>

                              {COLOR_PRESETS.map(
                                (
                                  item,
                                ) => (
                                  <option
                                    key={
                                      item.hex
                                    }
                                    value={
                                      item.hex
                                    }
                                  >
                                    {
                                      item.name
                                    }
                                  </option>
                                ),
                              )}
                            </select>

                            <button
                              type="button"
                              onClick={() =>
                                openCustomColor(
                                  index,
                                )
                              }
                              className="
                                inline-flex
                                h-10
                                shrink-0
                                items-center
                                gap-1
                                rounded-lg
                                border
                                border-[#2D6A4F]/30
                                bg-[#F3F8F5]
                                px-2.5
                                text-[10px]
                                font-semibold
                                text-[#2D6A4F]
                                hover:bg-[#E8F2EC]
                              "
                            >
                              <Plus className="h-3 w-3" />

                              Mới
                            </button>
                          </div>

                          {/* Current color */}

                          <div
                            className="
                              mt-2
                              flex
                              h-9
                              items-center
                              gap-2.5
                              rounded-lg
                              border
                              border-neutral-100
                              bg-neutral-50
                              px-3
                            "
                          >
                            <span
                              className="
                                h-5
                                w-5
                                shrink-0
                                rounded-full
                                border
                                border-neutral-200
                                shadow-sm
                              "
                              style={{
                                backgroundColor:
                                  color.hex,
                              }}
                            />

                            <span className="truncate text-xs font-medium text-neutral-700">
                              {color.name}
                            </span>

                            <span className="ml-auto text-[10px] uppercase text-neutral-400">
                              {color.hex}
                            </span>
                          </div>
                        </>
                      ) : (
                        /* =================================
                           CUSTOM COLOR FORM
                        ================================== */

                        <div
                          className="
                            rounded-lg
                            border
                            border-[#D7E8DD]
                            bg-[#F7FBF8]
                            p-3
                          "
                        >

                          <div className="mb-2 flex items-center justify-between">

                            <span className="text-[11px] font-semibold text-[#2D6A4F]">
                              Thêm màu mới
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                setCustomColorOpen(
                                  (prev) => ({
                                    ...prev,
                                    [index]:
                                      false,
                                  }),
                                )
                              }
                              className="text-neutral-400 hover:text-neutral-700"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <input
                            value={
                              customColorName[
                                index
                              ] ?? ""
                            }
                            onChange={(e) =>
                              setCustomColorName(
                                (prev) => ({
                                  ...prev,
                                  [index]:
                                    e.target
                                      .value,
                                }),
                              )
                            }
                            placeholder="Tên màu, ví dụ: Champagne"
                            className="
                              h-9
                              w-full
                              rounded-lg
                              border
                              border-neutral-200
                              bg-white
                              px-3
                              text-xs
                              outline-none
                              focus:border-[#2D6A4F]
                            "
                          />

                          <div className="mt-2 flex gap-2">

                            <input
                              type="color"
                              value={
                                customColorHex[
                                  index
                                ] ??
                                "#000000"
                              }
                              onChange={(e) =>
                                setCustomColorHex(
                                  (prev) => ({
                                    ...prev,
                                    [index]:
                                      e.target
                                        .value,
                                  }),
                                )
                              }
                              className="
                                h-9
                                w-12
                                cursor-pointer
                                rounded-lg
                                border
                                border-neutral-200
                                bg-white
                                p-1
                              "
                            />

                            <input
                              value={
                                customColorHex[
                                  index
                                ] ??
                                "#000000"
                              }
                              onChange={(e) =>
                                setCustomColorHex(
                                  (prev) => ({
                                    ...prev,
                                    [index]:
                                      e.target
                                        .value,
                                  }),
                                )
                              }
                              placeholder="#D8C3A5"
                              className="
                                h-9
                                min-w-0
                                flex-1
                                rounded-lg
                                border
                                border-neutral-200
                                bg-white
                                px-3
                                text-xs
                                font-mono
                                uppercase
                                outline-none
                                focus:border-[#2D6A4F]
                              "
                            />

                            <button
                              type="button"
                              onClick={() =>
                                saveCustomColor(
                                  index,
                                )
                              }
                              className="
                                inline-flex
                                h-9
                                items-center
                                gap-1
                                rounded-lg
                                bg-[#2D6A4F]
                                px-3
                                text-[10px]
                                font-semibold
                                text-white
                                hover:bg-[#24583F]
                              "
                            >
                              <Check className="h-3 w-3" />

                              Thêm
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* =================================
                        MATERIAL
                    ================================== */}

                    <div>

                      <FieldLabel
                        icon={
                          <Layers3 className="h-3.5 w-3.5" />
                        }
                        label="Chất liệu"
                      />

                      {!customMaterialOpen[index] ? (
                        <>
                          <div className="flex gap-2">

                            <select
                              value={
                                materialOptions.includes(
                                  color.material,
                                )
                                  ? color.material
                                  : ""
                              }
                              onChange={(e) => {
                                if (
                                  e.target
                                    .value
                                ) {
                                  update(
                                    index,
                                    "material",
                                    e.target
                                      .value,
                                  );
                                }
                              }}
                              className="
                                h-10
                                min-w-0
                                flex-1
                                rounded-lg
                                border
                                border-neutral-200
                                bg-white
                                px-3
                                text-xs
                                font-medium
                                outline-none
                                focus:border-[#2D6A4F]
                              "
                            >
                              <option value="">
                                Chọn chất liệu
                              </option>

                              {materialOptions.map(
                                (item) => (
                                  <option
                                    key={item}
                                    value={item}
                                  >
                                    {item}
                                  </option>
                                ),
                              )}

                            </select>

                            <button
                              type="button"
                              onClick={() =>
                                openCustomMaterial(
                                  index,
                                )
                              }
                              className="
                                inline-flex
                                h-10
                                shrink-0
                                items-center
                                gap-1
                                rounded-lg
                                border
                                border-[#2D6A4F]/30
                                bg-[#F3F8F5]
                                px-2.5
                                text-[10px]
                                font-semibold
                                text-[#2D6A4F]
                                hover:bg-[#E8F2EC]
                              "
                            >
                              <Plus className="h-3 w-3" />

                              Mới
                            </button>
                          </div>

                          {/* Current material */}

                          <div
                            className="
                              mt-2
                              flex
                              h-9
                              items-center
                              gap-2
                              rounded-lg
                              border
                              border-neutral-100
                              bg-neutral-50
                              px-3
                            "
                          >
                            <Layers3 className="h-3.5 w-3.5 shrink-0 text-neutral-400" />

                            <span className="truncate text-xs text-neutral-600">
                              {color.material}
                            </span>
                          </div>
                        </>
                      ) : (
                        /* =================================
                           CUSTOM MATERIAL FORM
                        ================================== */

                        <div
                          className="
                            rounded-lg
                            border
                            border-[#D7E8DD]
                            bg-[#F7FBF8]
                            p-3
                          "
                        >

                          <div className="mb-2 flex items-center justify-between">

                            <span className="text-[11px] font-semibold text-[#2D6A4F]">
                              Thêm chất liệu mới
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                setCustomMaterialOpen(
                                  (prev) => ({
                                    ...prev,
                                    [index]:
                                      false,
                                  }),
                                )
                              }
                              className="text-neutral-400 hover:text-neutral-700"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex gap-2">

                            <input
                              autoFocus
                              value={
                                customMaterial[
                                  index
                                ] ?? ""
                              }
                              onChange={(e) =>
                                setCustomMaterial(
                                  (prev) => ({
                                    ...prev,
                                    [index]:
                                      e.target
                                        .value,
                                  }),
                                )
                              }
                              placeholder="Ví dụ: Gỗ óc chó"
                              className="
                                h-9
                                min-w-0
                                flex-1
                                rounded-lg
                                border
                                border-neutral-200
                                bg-white
                                px-3
                                text-xs
                                outline-none
                                focus:border-[#2D6A4F]
                              "
                              onKeyDown={(e) => {
                                if (
                                  e.key ===
                                  "Enter"
                                ) {
                                  e.preventDefault();

                                  saveCustomMaterial(
                                    index,
                                  );
                                }
                              }}
                            />

                            <button
                              type="button"
                              onClick={() =>
                                saveCustomMaterial(
                                  index,
                                )
                              }
                              className="
                                inline-flex
                                h-9
                                items-center
                                gap-1
                                rounded-lg
                                bg-[#2D6A4F]
                                px-3
                                text-[10px]
                                font-semibold
                                text-white
                                hover:bg-[#24583F]
                              "
                            >
                              <Check className="h-3 w-3" />

                              Thêm
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* =================================
                        IMAGE
                    ================================== */}

                    <div>

                      <FieldLabel
                        icon={
                          <ImagePlus className="h-3.5 w-3.5" />
                        }
                        label="Ảnh biến thể"
                      />

                      <div className="flex items-center gap-3">

                        <div
                          className="
                            h-16
                            w-16
                            shrink-0
                            overflow-hidden
                            rounded-lg
                            border
                            border-neutral-200
                            bg-neutral-100
                          "
                        >
                          {color.image_url ? (
                            <img
                              src={
                                color.image_url
                              }
                              alt={
                                color.name
                              }
                              className="
                                h-full
                                w-full
                                object-cover
                              "
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-300">
                              <ImagePlus className="h-5 w-5" />
                            </div>
                          )}
                        </div>

                        <label
                          className="
                            inline-flex
                            h-9
                            cursor-pointer
                            items-center
                            gap-1.5
                            rounded-lg
                            border
                            border-neutral-200
                            bg-white
                            px-3
                            text-[11px]
                            font-semibold
                            text-neutral-700
                            hover:bg-neutral-50
                          "
                        >
                          <Upload className="h-3.5 w-3.5" />

                          Chọn ảnh

                          <input
                            hidden
                            type="file"
                            accept="image/*"
                            onChange={(
                              e,
                            ) => {
                              const file =
                                e.target
                                  .files?.[0];

                              if (
                                file
                              ) {
                                uploadVariantImage(
                                  index,
                                  file,
                                );
                              }

                              e.target.value =
                                "";
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* =====================================
                      DIVIDER
                  ====================================== */}

                  <div className="my-4 h-px bg-neutral-100" />

                  {/* =====================================
                      SKU / PRICE / STOCK
                  ====================================== */}

                  <div className="grid gap-3 md:grid-cols-3">

                    {/* SKU */}

                    <div
                      className="
                        rounded-lg
                        border
                        border-neutral-200
                        bg-[#FAFAF8]
                        p-3
                      "
                    >
                      <FieldLabel
                        icon={
                          <Tag className="h-3.5 w-3.5" />
                        }
                        label="SKU"
                      />

                      <input
                        value={
                          color.sku
                        }
                        placeholder="VD: BF-WAL-GOLD"
                        onChange={(e) =>
                          update(
                            index,
                            "sku",
                            e.target
                              .value,
                          )
                        }
                        className="
                          h-9
                          w-full
                          rounded-lg
                          border
                          border-neutral-200
                          bg-white
                          px-3
                          text-xs
                          outline-none
                          focus:border-[#2D6A4F]
                        "
                      />
                    </div>

                    {/* PRICE */}

                    <div
                      className="
                        rounded-lg
                        border
                        border-neutral-200
                        bg-[#FAFAF8]
                        p-3
                      "
                    >
                      <FieldLabel
                        icon={
                          <CircleDollarSign className="h-3.5 w-3.5" />
                        }
                        label="Giá bán"
                      />

                      <input
                        type="number"
                        min="0"
                        value={
                          color.price ??
                          ""
                        }
                        onChange={(e) =>
                          update(
                            index,
                            "price",
                            e.target
                              .value ===
                              ""
                              ? null
                              : Number(
                                  e
                                    .target
                                    .value,
                                ),
                          )
                        }
                        className="
                          h-9
                          w-full
                          rounded-lg
                          border
                          border-neutral-200
                          bg-white
                          px-3
                          text-sm
                          font-semibold
                          outline-none
                          focus:border-[#2D6A4F]
                        "
                      />

                      <p className="mt-1 text-[10px] text-neutral-400">
                        ₫{" "}
                        {Number(
                          color.price ||
                            0,
                        ).toLocaleString(
                          "vi-VN",
                        )}
                      </p>
                    </div>

                    {/* STOCK */}

                    <div
                      className="
                        rounded-lg
                        border
                        border-neutral-200
                        bg-[#FAFAF8]
                        p-3
                      "
                    >
                      <FieldLabel
                        icon={
                          <Package className="h-3.5 w-3.5" />
                        }
                        label="Tồn kho"
                      />

                      <input
                        type="number"
                        min="0"
                        value={
                          color.stock
                        }
                        onChange={(e) =>
                          update(
                            index,
                            "stock",
                            Math.max(
                              0,
                              Number(
                                e
                                  .target
                                  .value,
                              ),
                            ),
                          )
                        }
                        className="
                          h-9
                          w-full
                          rounded-lg
                          border
                          border-neutral-200
                          bg-white
                          px-3
                          text-sm
                          font-semibold
                          outline-none
                          focus:border-[#2D6A4F]
                        "
                      />

                      <p
                        className={`mt-1 text-[10px] ${
                          color.stock >
                          0
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {color.stock >
                        0
                          ? `Còn ${color.stock} sản phẩm`
                          : "Hết hàng"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {/* =================================================
          FOOTER SAVE
      ================================================= */}

      {colors.length > 0 && (
        <div
          className="
            mt-4
            flex
            items-center
            justify-between
            border-t
            border-neutral-200
            pt-4
          "
        >
          <p className="text-[11px] text-neutral-400">
            {colors.length} biến thể
          </p>

          <button
            type="button"
            onClick={save}
            disabled={loading}
            className="
              inline-flex
              h-10
              items-center
              gap-2
              rounded-lg
              bg-[#2D6A4F]
              px-4
              text-xs
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-[#24583F]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <Save className="h-3.5 w-3.5" />

            {loading
              ? "Đang lưu..."
              : "Lưu thay đổi"}
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   FIELD LABEL
========================================================= */

function FieldLabel({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5">
      <span className="text-neutral-400">
        {icon}
      </span>

      <label className="text-[11px] font-semibold text-neutral-700">
        {label}
      </label>
    </div>
  );
}