import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Check,
  Layers3,
  Plus,
  Trash2,
} from "lucide-react";

interface Props {
  productId: string;
}

interface Specification {
  id?: string;
  label: string;
  value: string;
  sort_order: number;
}

export default function ProductSpecification({
  productId,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Specification[]>([]);

  useEffect(() => {
    loadSpecifications();
  }, [productId]);

  async function loadSpecifications() {
    const { data, error } = await supabase
      .from("product_specifications")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order");

    if (error) {
      toast.error(error.message);
      return;
    }

    setItems(data ?? []);
  }

  function addRow() {
    setItems([
      ...items,
      {
        label: "",
        value: "",
        sort_order: items.length,
      },
    ]);
  }

  function removeRow(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateLabel(index: number, value: string) {
    const clone = [...items];

    clone[index] = {
      ...clone[index],
      label: value,
    };

    setItems(clone);
  }

  function updateValue(index: number, value: string) {
    const clone = [...items];

    clone[index] = {
      ...clone[index],
      value,
    };

    setItems(clone);
  }

  async function saveSpecifications() {
    try {
      setLoading(true);

      // ============================================
      // XÓA TOÀN BỘ THÔNG SỐ CŨ
      // ============================================

      const { error: deleteError } = await supabase
        .from("product_specifications")
        .delete()
        .eq("product_id", productId);

      if (deleteError) {
        throw deleteError;
      }

      // ============================================
      // LỌC CÁC DÒNG HỢP LỆ
      // ============================================

      const rows = items
        .filter(
          (item) =>
            item.label.trim() !== "" &&
            item.value.trim() !== "",
        )
        .map((item, index) => ({
          product_id: productId,
          label: item.label.trim(),
          value: item.value.trim(),
          sort_order: index,
        }));

      // ============================================
      // INSERT LẠI
      // ============================================

      if (rows.length > 0) {
        const { error } = await supabase
          .from("product_specifications")
          .insert(rows);

        if (error) {
          throw error;
        }
      }

      // Đồng bộ lại dữ liệu từ database
      await loadSpecifications();

      toast.success("Đã lưu thông số kỹ thuật");
    } catch (err: any) {
      console.error("FULL ERROR:", err);

      toast.error(
        err?.message || "Không thể lưu thông số kỹ thuật",
      );

      if (err) {
        console.log("CODE:", err.code);
        console.log("DETAILS:", err.details);
        console.log("HINT:", err.hint);
        console.log("MESSAGE:", err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E7E2DA] bg-white shadow-sm">
      {/* ============================================
          HEADER
      ============================================ */}

      <div className="flex items-center justify-between gap-4 border-b border-[#EEEAE4] px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5F3EE] text-neutral-700">
            <Layers3 className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-neutral-900">
                Thông số kỹ thuật
              </h2>

              <span className="rounded-full bg-[#F5F3EE] px-2 py-0.5 text-[10px] font-semibold text-neutral-500">
                {items.length}
              </span>
            </div>

            <p className="mt-0.5 text-[11px] text-neutral-400">
              Thông tin hiển thị trên trang sản phẩm
            </p>
          </div>
        </div>

        {/* ADD */}

        <button
          type="button"
          onClick={addRow}
          className="
            flex
            h-9
            shrink-0
            items-center
            gap-1.5
            rounded-xl
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
            active:scale-[0.98]
          "
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            Thêm thông số
          </span>
          <span className="sm:hidden">
            Thêm
          </span>
        </button>
      </div>

      {/* ============================================
          CONTENT
      ============================================ */}

      <div className="flex-1 p-4">
        {items.length === 0 ? (
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
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-400 shadow-sm">
              <Layers3 className="h-4 w-4" />
            </div>

            <p className="text-xs font-medium text-neutral-600">
              Chưa có thông số kỹ thuật
            </p>

            <p className="mt-1 text-[11px] text-neutral-400">
              Bấm “Thêm thông số” để bắt đầu
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={item.id ?? `new-${index}`}
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
                  sm:grid-cols-[minmax(150px,0.38fr)_minmax(0,1fr)_36px]
                  sm:items-center
                "
              >
                {/* NUMBER */}

                <div className="flex items-center gap-2 sm:contents">
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
                      text-[10px]
                      font-semibold
                      text-neutral-400
                      shadow-sm
                      sm:hidden
                    "
                  >
                    {index + 1}
                  </div>

                  {/* LABEL */}

                  <input
                    value={item.label}
                    onChange={(e) =>
                      updateLabel(
                        index,
                        e.target.value,
                      )
                    }
                    placeholder="Tên thông số"
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
                      font-medium
                      text-neutral-800
                      outline-none
                      transition
                      placeholder:text-neutral-400
                      focus:border-neutral-400
                      focus:ring-2
                      focus:ring-neutral-100
                      sm:w-auto
                    "
                  />
                </div>

                {/* VALUE */}

                <input
                  value={item.value}
                  onChange={(e) =>
                    updateValue(
                      index,
                      e.target.value,
                    )
                  }
                  placeholder="Giá trị thông số"
                  className="
                    h-9
                    w-full
                    rounded-lg
                    border
                    border-neutral-200
                    bg-white
                    px-3
                    text-xs
                    text-neutral-700
                    outline-none
                    transition
                    placeholder:text-neutral-400
                    focus:border-neutral-400
                    focus:ring-2
                    focus:ring-neutral-100
                  "
                />

                {/* DELETE */}

                <button
                  type="button"
                  onClick={() =>
                    removeRow(index)
                  }
                  title="Xóa thông số"
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
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
            ))}
          </div>
        )}
      </div>

      {/* ============================================
          FOOTER
      ============================================ */}

      {items.length > 0 && (
        <div className="mt-auto flex items-center justify-between border-t border-[#EEEAE4] bg-[#FCFBF9] px-5 py-3">
          <p className="hidden text-[11px] text-neutral-400 sm:block">
            Các dòng trống sẽ được bỏ qua khi lưu
          </p>

          <button
            type="button"
            onClick={saveSpecifications}
            disabled={loading}
            className="
              ml-auto
              flex
              h-9
              items-center
              gap-1.5
              rounded-xl
              bg-neutral-900
              px-4
              text-xs
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-black
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
                Lưu thông số
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}