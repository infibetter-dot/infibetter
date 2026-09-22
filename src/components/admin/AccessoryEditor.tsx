import {
  X,
  Upload,
  Gift,
  Truck,
  Ticket,
  Lightbulb,
  Plug,
  Sparkles,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

const ICONS = {
  gift: Gift,
  truck: Truck,
  ticket: Ticket,

  bulb: Lightbulb,
  plug: Plug,
  cloth: Sparkles,
};

export interface AccessoryForm {
  id?: string;

  name: string;

  description: string;

  image_url: string;

  price: number;

  stock: number;

  active: boolean;

  badge: string;

  badge_color: string;

  icon: string;
}

interface Props {
  open: boolean;

  accessory: AccessoryForm;

  onChange: (v: AccessoryForm) => void;

  onClose: () => void;

  onSave: () => void;
}

export default function AccessoryEditor({
  open,
  accessory,
  onChange,
  onClose,
  onSave,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">

        <div className="flex items-center justify-between border-b p-6">

          <h2 className="text-xl font-bold">
            {accessory.id
              ? "Cập nhật phụ kiện"
              : "Thêm phụ kiện"}
          </h2>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2">

          <input
            className="rounded-lg border p-3"
            placeholder="Tên phụ kiện"
            value={accessory.name}
            onChange={(e) =>
              onChange({
                ...accessory,
                name: e.target.value,
              })
            }
          />

          <input
            type="number"
            className="rounded-lg border p-3"
            placeholder="Giá bán"
            value={accessory.price || ""}
            onChange={(e) =>
              onChange({
                ...accessory,
                price: Number(e.target.value),
              })
            }
          />

          <input
            type="number"
            className="rounded-lg border p-3"
            placeholder="Tồn kho"
            value={accessory.stock || ""}
            onChange={(e) =>
              onChange({
                ...accessory,
                stock: Number(e.target.value),
              })
            }
          />

          <div className="space-y-3">

  <label className="block text-sm font-medium">
    Hình ảnh
  </label>

  {accessory.image_url && (

    <img
      src={accessory.image_url}
      className="h-36 w-36 rounded-xl border object-cover"
    />

  )}

  <label
    className="
      flex
      cursor-pointer
      items-center
      gap-3
      rounded-lg
      border
      border-dashed
      p-4
      hover:bg-neutral-50
    "
  >

    <Upload size={20} />

    <span>
      Chọn ảnh
    </span>

    <input
      type="file"
      accept="image/*"
      className="hidden"

      onChange={async (e) => {

        const file = e.target.files?.[0];

        if (!file) return;

        const fileName =
          `${Date.now()}-${file.name}`;

        const { error } =
          await supabase.storage

            .from("website OLive")

            .upload(
              `accessories/${fileName}`,
              file,
              {
                upsert: true,
              }
            );

        if (error) {
          alert(error.message);
          return;
        }

        const { data } =
          supabase.storage

            .from("website OLive")

            .getPublicUrl(
              `accessories/${fileName}`
            );

        onChange({

          ...accessory,

          image_url: data.publicUrl,

        });

      }}

    />

  </label>

</div>

          <select
  className="rounded-lg border p-3"
  value={accessory.badge || ""}
  onChange={(e)=>
    onChange({
      ...accessory,
      badge:e.target.value,
    })
  }
>
  <option value="">
    Không có Badge
  </option>

  <option value="HOT">
    🔥 HOT
  </option>

  <option value="NEW">
    ✨ NEW
  </option>

  <option value="SALE">
    💸 SALE
  </option>

  <option value="BEST">
    ⭐ BEST
  </option>

  <option value="FREE">
    🎁 FREE
  </option>

</select>

          <select
  className="rounded-lg border p-3"
  value={accessory.badge_color || "#D97745"}
  onChange={(e)=>
    onChange({
      ...accessory,
      badge_color:e.target.value,
    })
  }
>

<option value="#D97745">
🟠 Cam
</option>

<option value="#EF4444">
🔴 Đỏ
</option>

<option value="#16A34A">
🟢 Xanh lá
</option>

<option value="#2563EB">
🔵 Xanh dương
</option>

<option value="#111827">
⚫ Đen
</option>

</select>

        <select
  className="rounded-lg border p-3"
  value={accessory.icon || "gift"}
  onChange={(e) =>
    onChange({
      ...accessory,
      icon: e.target.value,
    })
  }
>
  <option value="gift">🎁 Quà tặng</option>

  <option value="truck">🚚 Giao hàng</option>

  <option value="ticket">🎫 Voucher</option>

  <option value="bulb">💡 Bóng LED E27</option>

  <option value="plug">🔌 Adapter</option>

  <option value="cloth">🧽 Khăn lau đèn</option>
</select>

          <label className="flex items-center gap-3 rounded-lg border p-3">

            <input
              type="checkbox"
              checked={accessory.active}
              onChange={(e) =>
                onChange({
                  ...accessory,
                  active: e.target.checked,
                })
              }
            />

            Hiển thị

          </label>

          <textarea
            className="col-span-2 rounded-lg border p-3"
            rows={4}
            placeholder="Mô tả"
            value={accessory.description}
            onChange={(e) =>
              onChange({
                ...accessory,
                description: e.target.value,
              })
            }
          />

        </div>

        <div className="flex justify-end gap-3 border-t p-6">

          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2"
          >
            Hủy
          </button>

          <button
            onClick={onSave}
            className="rounded-lg bg-black px-5 py-2 text-white"
          >
            Lưu
          </button>

        </div>

      </div>

    </div>
  );
}