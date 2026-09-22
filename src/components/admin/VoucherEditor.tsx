import {
  X,
  RefreshCw,
  TicketPercent,
  Download,
} from "lucide-react";

import { useRef } from "react";

import * as htmlToImage from "html-to-image";

import { generateVoucherCode } from "@/lib/voucher-engine";
import VoucherGiftCard from "./VoucherGiftCard";

export interface VoucherForm {

 

  id?: string;

  code: string;

  title: string;

  description: string;

  type: string;

  value: number;

  min_order: number;

  max_discount: number;

  quantity: number;

  used: number;

  start_at: string;

  end_at: string;

  active: boolean;

  badge: string | null;

  badge_color: string | null;

  icon: string | null;

  apply_type:
    | "all"
    | "product"
    | "category";

  apply_id: string;

  manual_apply?: boolean;

  auto_apply?: boolean;

  usage_per_customer?: number;

  is_personal?: boolean;

  show_home: boolean;

}

interface VoucherEditorProps {

  open: boolean;

  voucher: VoucherForm;

  products: {

    id: string;

    name: string;

  }[];

  categories: {

    id: string;

    name: string;

  }[];

  onChange: (
    voucher: VoucherForm
  ) => void;

  onClose: () => void;

  onSave: () => void;

}

export default function VoucherEditor({

  open,

  voucher,

  products,

  categories,

  onChange,

  onClose,

  onSave,

}: VoucherEditorProps) {

  if (!open) return null;

  const voucherCardRef =
  useRef<HTMLDivElement>(null);

async function downloadPNG() {

  if (!voucherCardRef.current) return;

  const dataUrl =
    await htmlToImage.toPng(
      voucherCardRef.current,
      {
        pixelRatio: 4,
        cacheBust: true,
        backgroundColor: "#FBF8F3",
      }
    );

  const link =
    document.createElement("a");

  link.download =
    `${voucher.code || "voucher"}.png`;

  link.href = dataUrl;

  link.click();

}

  function update<K extends keyof VoucherForm>(
    key: K,
    value: VoucherForm[K]
  ) {

    onChange({

      ...voucher,

      [key]: value,

    });

  }

  function generateCode() {

    update(
      "code",
      generateVoucherCode()
    );

  }

  return (

<div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">

<div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

<div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-8 py-6">

<div>

<div className="flex items-center gap-3">

<div className="rounded-2xl bg-orange-100 p-3">

<TicketPercent className="h-6 w-6 text-orange-600"/>

</div>

<div>

<h2 className="text-2xl font-bold">

{voucher.id
? "Cập nhật Voucher"
: "Tạo Voucher"}

</h2>

<p className="mt-1 text-sm text-neutral-500">

Quản lý chương trình khuyến mãi của Olive Living

</p>

</div>

</div>

</div>

<button

onClick={onClose}

className="rounded-xl p-2 transition hover:bg-neutral-100"

>

<X className="h-5 w-5"/>

</button>

</div>

<div className="space-y-10 p-8">
  
  {/* ===========================================================
    THÔNG TIN VOUCHER
=========================================================== */}

<section className="rounded-3xl border border-neutral-200 p-6">

  <h3 className="mb-6 text-lg font-bold">
    Thông tin Voucher
  </h3>

  <div className="grid gap-5 md:grid-cols-2">

    {/* CODE */}

    <div>

      <label className="mb-2 block text-sm font-medium">
        Mã Voucher
      </label>

      <div className="flex gap-2">

        <input
          className="flex-1 rounded-xl border p-3"
          value={voucher.code}
          placeholder="OLIVE5"
          onChange={(e)=>
            update(
              "code",
              e.target.value.toUpperCase()
            )
          }
        />

        <button
          type="button"
          onClick={generateCode}
          className="
          flex
          items-center
          gap-2

          rounded-xl

          bg-orange-500

          px-4

          font-medium

          text-white

          transition

          hover:bg-orange-600
          "
        >

          <RefreshCw
            className="h-4 w-4"
          />

          Generate

        </button>

      </div>

    </div>

    {/* TITLE */}

    <div>

      <label className="mb-2 block text-sm font-medium">
        Tên Voucher
      </label>

      <input
        className="w-full rounded-xl border p-3"
        value={voucher.title}
        placeholder="Voucher thành viên"
        onChange={(e)=>
          update(
            "title",
            e.target.value
          )
        }
      />

    </div>

  </div>

  {/* DESCRIPTION */}

  <div className="mt-5">

    <label className="mb-2 block text-sm font-medium">
      Mô tả
    </label>

    <textarea
      rows={4}
      className="w-full rounded-xl border p-3"
      placeholder="Mô tả chương trình..."
      value={voucher.description}
      onChange={(e)=>
        update(
          "description",
          e.target.value
        )
      }
    />

  </div>

</section>

{/* ===========================================================
    GIÁ TRỊ VOUCHER
=========================================================== */}

<section className="rounded-3xl border border-neutral-200 p-6">

<h3 className="mb-6 text-lg font-bold">

Giá trị Voucher

</h3>

<div className="grid gap-5 md:grid-cols-2">

<div>

<label className="mb-2 block text-sm font-medium">

Loại Voucher

</label>

<select
className="w-full rounded-xl border p-3"
value={voucher.type}
onChange={(e)=>
update(
"type",
e.target.value
)
}
>

<option value="percent">

Giảm %

</option>

<option value="fixed">

Giảm tiền

</option>

<option value="shipping">

Miễn phí vận chuyển

</option>

<option value="gift">

Quà tặng

</option>

<option value="buy_x_get_y">

Mua X tặng Y

</option>

</select>

</div>

<div>

<label className="mb-2 block text-sm font-medium">

Giá trị

</label>

<input
type="number"
className="w-full rounded-xl border p-3"
value={voucher.value}
onChange={(e)=>
update(
"value",
Number(e.target.value)
)
}
/>

</div>

<div>

<label className="mb-2 block text-sm font-medium">

Đơn tối thiểu

</label>

<input
type="number"
className="w-full rounded-xl border p-3"
value={voucher.min_order}
onChange={(e)=>
update(
"min_order",
Number(e.target.value)
)
}
/>

</div>

<div>

<label className="mb-2 block text-sm font-medium">

Giảm tối đa

</label>

<input
type="number"
className="w-full rounded-xl border p-3"
disabled={
voucher.type !== "percent"
}
value={
voucher.max_discount
}
onChange={(e)=>
update(
"max_discount",
Number(e.target.value)
)
}
/>

</div>

<div>

<label className="mb-2 block text-sm font-medium">

Số lượng phát hành

</label>

<input
type="number"
className="w-full rounded-xl border p-3"
value={voucher.quantity}
onChange={(e)=>
update(
"quantity",
Number(e.target.value)
)
}
/>

</div>

</div>

</section>

{/* ===========================================================
    QUY TẮC ÁP DỤNG
=========================================================== */}

<section className="rounded-3xl border border-neutral-200 p-6">

  <div className="mb-6 flex items-center justify-between">

    <div>

      <h3 className="text-lg font-bold">
        Thiết lập Voucher
      </h3>

      <p className="mt-1 text-sm text-neutral-500">
        Cách voucher hoạt động trên website.
      </p>

    </div>

  </div>

  <div className="grid gap-4 md:grid-cols-2">

    {/* ACTIVE */}

    <label className="flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition hover:border-orange-300 hover:bg-orange-50">

      <div>

        <p className="font-semibold">
          🟢 Đang hoạt động
        </p>

        <p className="mt-1 text-sm text-neutral-500">
          Voucher có thể sử dụng.
        </p>

      </div>

      <input
        type="checkbox"
        checked={voucher.active}
        onChange={(e)=>
          update(
            "active",
            e.target.checked
          )
        }
        className="h-5 w-5 accent-orange-500"
      />

    </label>

    {/* HOME */}

    <label className="flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition hover:border-orange-300 hover:bg-orange-50">

      <div>

        <p className="font-semibold">
          🏠 Hiển thị Trang chủ
        </p>

        <p className="mt-1 text-sm text-neutral-500">
          Hiển thị tại Home.
        </p>

      </div>

      <input
        type="checkbox"
        checked={voucher.show_home}
        onChange={(e)=>
          update(
            "show_home",
            e.target.checked
          )
        }
        className="h-5 w-5 accent-orange-500"
      />

    </label>

    {/* MANUAL */}

    <label className="flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition hover:border-orange-300 hover:bg-orange-50">

      <div>

        <p className="font-semibold">
          🎟 Cho phép nhập mã
        </p>

        <p className="mt-1 text-sm text-neutral-500">
          Khách nhập mã ở Checkout.
        </p>

      </div>

      <input
        type="checkbox"
        checked={voucher.manual_apply ?? false}
        onChange={(e)=>
          update(
            "manual_apply",
            e.target.checked
          )
        }
        className="h-5 w-5 accent-orange-500"
      />

    </label>

    {/* AUTO */}

    <label className="flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition hover:border-orange-300 hover:bg-orange-50">

      <div>

        <p className="font-semibold">
          ⚡ Auto Apply
        </p>

        <p className="mt-1 text-sm text-neutral-500">
          Tự áp dụng nếu đủ điều kiện.
        </p>

      </div>

      <input
        type="checkbox"
        checked={voucher.auto_apply ?? false}
        onChange={(e)=>
          update(
            "auto_apply",
            e.target.checked
          )
        }
        className="h-5 w-5 accent-orange-500"
      />

    </label>

    {/* PERSONAL */}

    <label className="flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition hover:border-orange-300 hover:bg-orange-50">

      <div>

        <p className="font-semibold">
          👤 Voucher cá nhân
        </p>

        <p className="mt-1 text-sm text-neutral-500">
          Chỉ khách được chỉ định mới dùng.
        </p>

      </div>

      <input
        type="checkbox"
        checked={voucher.is_personal ?? false}
        onChange={(e)=>
          update(
            "is_personal",
            e.target.checked
          )
        }
        className="h-5 w-5 accent-orange-500"
      />

    </label>

    {/* LIMIT */}

    <div className="rounded-2xl border p-4">

      <label className="mb-2 block font-semibold">

        🔁 Giới hạn mỗi khách

      </label>

      <input
        type="number"
        min={1}
        className="w-full rounded-xl border p-3"
        value={voucher.usage_per_customer ?? 1}
        onChange={(e)=>
          update(
            "usage_per_customer",
            Number(e.target.value)
          )
        }
      />

      <p className="mt-2 text-sm text-neutral-500">

        Mỗi khách được sử dụng bao nhiêu lần.

      </p>

    </div>

  </div>

  <div className="mt-6">

    <label className="mb-2 block font-semibold">

      Áp dụng cho

    </label>

    <div className="grid gap-4 md:grid-cols-2">

     <select
  className="rounded-xl border p-3"
  value={voucher.apply_type}

  onChange={(e) => {
  onChange({
    ...voucher,
    apply_type: e.target.value as
      | "all"
      | "product"
      | "category",
    apply_id: "",
  });
}}
>

        <option value="all">
          Toàn website
        </option>

        <option value="product">
          Sản phẩm
        </option>

        <option value="category">
          Danh mục
        </option>

      </select>

      {voucher.apply_type !== "all" && (

        <select
          className="rounded-xl border p-3"
          value={voucher.apply_id}
          onChange={(e)=>
            update(
              "apply_id",
              e.target.value
            )
          }
        >

          <option value="">
            -- Chọn --
          </option>

          {(voucher.apply_type === "product"
            ? products
            : categories
          ).map((item)=>(
            <option
              key={item.id}
              value={item.id}
            >
              {item.name}
            </option>
          ))}

        </select>

      )}

    </div>

  </div>

</section>



{/* ===========================================================
    THỜI GIAN ÁP DỤNG
=========================================================== */}

<section className="rounded-3xl border border-neutral-200 p-6">

  <h3 className="mb-6 text-lg font-bold">

    Thời gian hiệu lực

  </h3>

  <div className="grid gap-5 md:grid-cols-2">

    <div>

      <label className="mb-2 block text-sm font-medium">

        Bắt đầu

      </label>

      <input
        type="datetime-local"
        className="w-full rounded-xl border p-3"
        value={voucher.start_at}
        onChange={(e)=>
          update(
            "start_at",
            e.target.value
          )
        }
      />

    </div>

    <div>

      <label className="mb-2 block text-sm font-medium">

        Kết thúc

      </label>

      <input
        type="datetime-local"
        className="w-full rounded-xl border p-3"
        value={voucher.end_at}
        onChange={(e)=>
          update(
            "end_at",
            e.target.value
          )
        }
      />

    </div>

  </div>

</section>

{/* ===========================================================
    PREVIEW
=========================================================== */}

<div className="space-y-5">

  <div>

    <h3 className="text-xl font-semibold">
      Xem trước Voucher
    </h3>

    <p className="mt-1 text-sm text-neutral-500">
      Đây là giao diện khách hàng sẽ nhận được sau khi bạn tạo voucher.
    </p>

  </div>

  <VoucherGiftCard
    ref={voucherCardRef}
    voucher={voucher}
/>

</div>

{/* ===========================================================
    FOOTER
=========================================================== */}

</div>

<div className="sticky bottom-0 flex justify-between border-t bg-white px-8 py-6">

  <button
    onClick={downloadPNG}
    className="
      inline-flex
      items-center
      gap-2

      rounded-xl

      bg-[#2E6B4E]

      px-6
      py-3

      font-semibold

      text-white

      transition

      hover:bg-[#25553F]
    "
  >
    <Download size={18} />

    Tải PNG

  </button>

  <div className="flex gap-3">

    <button
      onClick={onClose}
      className="
        rounded-xl
        border
        px-6
        py-3
        font-medium
      "
    >
      Hủy
    </button>

    <button
      onClick={onSave}
      className="
        rounded-xl

        bg-black

        px-8
        py-3

        font-semibold

        text-white
      "
    >
      Lưu Voucher
    </button>

  </div>

</div>

</div>

</div>

);
}