import { useEffect, useState } from "react";

import {
  Sparkles,
  Lightbulb,
  ShieldCheck,
  Truck,
  BatteryCharging,
  Usb,
  Hand,
  Clock3,
  Leaf,
  Star,
  Palette,
  Award,
  Heart,
  Gift,
  House,
  LampDesk,
  Sofa,
  Check,
  Plus,
  Trash2,
  WandSparkles,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  productId: string;
}

interface USPItem {
  id?: string;
  title: string;
  icon: string;
  sort_order?: number;
}

const ICONS = [
  {
    name: "sparkles",
    icon: Sparkles,
    label: "Scandinavian",
  },
  {
    name: "lightbulb",
    icon: Lightbulb,
    label: "LED",
  },
  {
    name: "shield",
    icon: ShieldCheck,
    label: "Bảo hành",
  },
  {
    name: "truck",
    icon: Truck,
    label: "Miễn phí giao hàng",
  },
  {
    name: "battery",
    icon: BatteryCharging,
    label: "Pin",
  },
  {
    name: "usb",
    icon: Usb,
    label: "USB-C",
  },
  {
    name: "touch",
    icon: Hand,
    label: "Cảm ứng",
  },
  {
    name: "clock",
    icon: Clock3,
    label: "Thời lượng",
  },
  {
    name: "leaf",
    icon: Leaf,
    label: "Thân thiện môi trường",
  },
  {
    name: "star",
    icon: Star,
    label: "Cao cấp",
  },
  {
    name: "palette",
    icon: Palette,
    label: "Thiết kế",
  },
  {
    name: "award",
    icon: Award,
    label: "Chất lượng",
  },
  {
    name: "heart",
    icon: Heart,
    label: "Yêu thích",
  },
  {
    name: "gift",
    icon: Gift,
    label: "Quà tặng",
  },
  {
    name: "home",
    icon: House,
    label: "Trang trí",
  },
  {
    name: "lamp",
    icon: LampDesk,
    label: "Đèn Decor",
  },
  {
    name: "sofa",
    icon: Sofa,
    label: "Nội thất",
  },
];

export default function ProductUSP({
  productId,
}: Props) {
  const [items, setItems] = useState<USPItem[]>([]);
  const [loading, setLoading] = useState(false);

  /* =========================================================
     LOAD
  ========================================================= */

  useEffect(() => {
    loadData();
  }, [productId]);

  async function loadData() {
    const { data, error } = await supabase
      .from("product_usps")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order");

    if (error) {
      console.error("LOAD USP ERROR:", error);
      toast.error(error.message);
      return;
    }

    setItems((data ?? []) as USPItem[]);
  }

  /* =========================================================
     ADD
  ========================================================= */

  function addUSP() {
    setItems([
      ...items,
      {
        title: "",
        icon: "sparkles",
        sort_order: items.length + 1,
      },
    ]);
  }

  /* =========================================================
     REMOVE
  ========================================================= */

  function removeUSP(index: number) {
    setItems(
      items.filter((_, i) => i !== index),
    );
  }

  /* =========================================================
     UPDATE TITLE
  ========================================================= */

  function updateTitle(
    index: number,
    value: string,
  ) {
    const copy = [...items];

    copy[index] = {
      ...copy[index],
      title: value,
    };

    setItems(copy);
  }

  /* =========================================================
     UPDATE ICON
  ========================================================= */

  function updateIcon(
    index: number,
    value: string,
  ) {
    const copy = [...items];

    copy[index] = {
      ...copy[index],
      icon: value,
    };

    setItems(copy);
  }

  /* =========================================================
     SAVE
  ========================================================= */

  async function save() {
    try {
      setLoading(true);

      /* -----------------------------------------------------
         DELETE OLD
      ----------------------------------------------------- */

      const {
        data: deletedData,
        error: deleteError,
      } = await supabase
        .from("product_usps")
        .delete()
        .eq("product_id", productId)
        .select();

      console.log(
        "DELETE USP DATA:",
        deletedData,
      );

      console.log(
        "DELETE USP ERROR:",
        deleteError,
      );

      if (deleteError) {
        throw deleteError;
      }

      /* -----------------------------------------------------
         FILTER EMPTY USP
      ----------------------------------------------------- */

      const rows = items
        .filter(
          (item) =>
            item.title.trim() !== "",
        )
        .map((item, index) => ({
          product_id: productId,
          title: item.title.trim(),
          icon: item.icon || "sparkles",
          sort_order: index + 1,
        }));

      /* -----------------------------------------------------
         INSERT
      ----------------------------------------------------- */

      if (rows.length > 0) {
        const { error: insertError } =
          await supabase
            .from("product_usps")
            .insert(rows);

        if (insertError) {
          throw insertError;
        }
      }

      /* -----------------------------------------------------
         RELOAD
      ----------------------------------------------------- */

      await loadData();

      toast.success("Đã lưu USP");
    } catch (err: any) {
      console.error(
        "SAVE USP ERROR:",
        err,
      );

      toast.error(
        err?.message ||
          "Không thể lưu USP",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
  className="
    h-full
    flex
    flex-col
    overflow-hidden
    rounded-2xl
    border
    border-[#E7E2DA]
    bg-white
    shadow-sm
  "
>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          border-b
          border-[#EEEAE4]
          px-5
          py-4
        "
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#F5F3EE]
              text-neutral-700
            "
          >
            <WandSparkles className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-neutral-900">
                USP sản phẩm
              </h3>

              <span
                className="
                  rounded-full
                  bg-[#F5F3EE]
                  px-2
                  py-0.5
                  text-[10px]
                  font-semibold
                  text-neutral-500
                "
              >
                {items.length}
              </span>
            </div>

            <p className="mt-0.5 text-[11px] text-neutral-400">
              Những điểm nổi bật hiển thị trên sản phẩm
            </p>
          </div>
        </div>

        {/* ADD */}

        <button
          type="button"
          onClick={addUSP}
          className="
            flex
            h-9
            shrink-0
            items-center
            gap-1.5
            rounded-xl
            bg-neutral-900
            px-3
            text-xs
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-black
            active:scale-[0.98]
          "
        >
          <Plus className="h-3.5 w-3.5" />

          <span className="hidden sm:inline">
            Thêm USP
          </span>

          <span className="sm:hidden">
            Thêm
          </span>
        </button>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="flex-1 p-4">
        {items.length === 0 ? (
          /* =================================================
             EMPTY
          ================================================= */

          <div
            className="
              flex
              min-h-[120px]
              flex-col
              items-center
              justify-center
              rounded-xl
              border
              border-dashed
              border-neutral-200
              bg-neutral-50/60
              px-4
              text-center
            "
          >
            <div
              className="
                mb-2
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-white
                text-neutral-400
                shadow-sm
              "
            >
              <Sparkles className="h-4 w-4" />
            </div>

            <p className="text-xs font-medium text-neutral-600">
              Chưa có USP
            </p>

            <p className="mt-1 text-[11px] text-neutral-400">
              Bấm “Thêm USP” để tạo điểm nổi bật cho sản phẩm
            </p>
          </div>
        ) : (
          <>
            {/* ===============================================
                PREVIEW
            =============================================== */}

            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-neutral-700">
                    Xem trước
                  </p>

                  <p className="mt-0.5 text-[10px] text-neutral-400">
                    Hiển thị gần giống trên website
                  </p>
                </div>

                <span className="text-[10px] text-neutral-400">
                  {items.length} điểm nổi bật
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {items.map((item, index) => {
                  const Icon =
                    ICONS.find(
                      (icon) =>
                        icon.name ===
                        item.icon,
                    )?.icon ?? Sparkles;

                  return (
                    <div
                      key={
                        item.id ??
                        `preview-${index}`
                      }
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-2.5
                        rounded-xl
                        border
                        border-[#E8E4DD]
                        bg-[#FAF9F6]
                        px-3
                        py-2.5
                      "
                    >
                      <div
                        className="
                          flex
                          h-7
                          w-7
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-white
                          text-[#6F8B5E]
                          shadow-sm
                        "
                      >
                        <Icon
                          size={14}
                          strokeWidth={1.8}
                        />
                      </div>

                      <span
                        className="
                          min-w-0
                          truncate
                          text-[11px]
                          font-medium
                          text-neutral-700
                        "
                      >
                        {item.title ||
                          "Chưa nhập tiêu đề"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ===============================================
                DIVIDER
            =============================================== */}

            <div className="mb-3 border-t border-neutral-100" />

            {/* ===============================================
                EDITOR
            =============================================== */}

            <div className="space-y-2">
              {items.map((item, index) => {
                const SelectedIcon =
                  ICONS.find(
                    (icon) =>
                      icon.name ===
                      item.icon,
                  )?.icon ?? Sparkles;

                return (
                  <div
                    key={
                      item.id ??
                      `editor-${index}`
                    }
                    className="
                      group
                      grid
                      grid-cols-1
                      gap-2
                      rounded-xl
                      border
                      border-neutral-200
                      bg-[#FCFBF9]
                      p-2
                      transition
                      hover:border-neutral-300
                      hover:bg-white
                      sm:grid-cols-[36px_150px_minmax(0,1fr)_36px]
                      sm:items-center
                    "
                  >
                    {/* ICON PREVIEW */}

                    <div
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-neutral-200
                        bg-white
                        text-[#6F8B5E]
                      "
                    >
                      <SelectedIcon
                        size={15}
                        strokeWidth={1.8}
                      />
                    </div>

                    {/* ICON SELECT */}

                    <select
                      value={item.icon}
                      onChange={(e) =>
                        updateIcon(
                          index,
                          e.target.value,
                        )
                      }
                      className="
                        h-8
                        w-full
                        min-w-0
                        rounded-lg
                        border
                        border-neutral-200
                        bg-white
                        px-2.5
                        text-[11px]
                        font-medium
                        text-neutral-700
                        outline-none
                        transition
                        focus:border-[#6F8B5E]
                        focus:ring-2
                        focus:ring-[#6F8B5E]/15
                      "
                    >
                      {ICONS.map((icon) => (
                        <option
                          key={icon.name}
                          value={icon.name}
                        >
                          {icon.label}
                        </option>
                      ))}
                    </select>

                    {/* TITLE */}

                    <input
                      value={item.title}
                      onChange={(e) =>
                        updateTitle(
                          index,
                          e.target.value,
                        )
                      }
                      placeholder="Tiêu đề USP"
                      className="
                        h-8
                        w-full
                        min-w-0
                        rounded-lg
                        border
                        border-neutral-200
                        bg-white
                        px-3
                        text-[11px]
                        text-neutral-700
                        outline-none
                        transition
                        placeholder:text-neutral-400
                        focus:border-[#6F8B5E]
                        focus:ring-2
                        focus:ring-[#6F8B5E]/15
                      "
                    />

                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={() =>
                        removeUSP(index)
                      }
                      title="Xóa USP"
                      aria-label="Xóa USP"
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-transparent
                        text-neutral-400
                        transition
                        hover:border-red-100
                        hover:bg-red-50
                        hover:text-red-500
                        active:scale-95
                      "
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      {items.length > 0 && (
        <div
          className="
            mt-auto
            flex
            items-center
            justify-between
            border-t
            border-[#EEEAE4]
            bg-[#FCFBF9]
            px-5
            py-3
          "
        >
          <p className="hidden text-[11px] text-neutral-400 sm:block">
            Các USP không có tiêu đề sẽ được bỏ qua khi lưu
          </p>

          <button
            type="button"
            onClick={save}
            disabled={loading}
            className="
              ml-auto
              flex
              h-9
              items-center
              gap-1.5
              rounded-xl
              bg-[#6F8B5E]
              px-4
              text-xs
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-[#607A50]
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading ? (
              <>
                <span
                  className="
                    h-3
                    w-3
                    animate-spin
                    rounded-full
                    border-2
                    border-white/30
                    border-t-white
                  "
                />

                Đang lưu...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Lưu USP
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}