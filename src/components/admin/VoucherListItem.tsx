import { CalendarDays, Edit2, Trash2 } from "lucide-react";

export interface VoucherItem {
  id: string;

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

  created_at: string;
}

interface VoucherListItemProps {
  voucher: VoucherItem;
  onEdit: (voucher: VoucherItem) => void;
  onDelete: (voucher: VoucherItem) => void;
}

export default function VoucherListItem({
  voucher,
  onEdit,
  onDelete,
}: VoucherListItemProps) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">
              {voucher.title}
            </h3>
           

          {(() => {
  const now = new Date();

  const start = voucher.start_at
    ? new Date(voucher.start_at)
    : null;

  const end = voucher.end_at
    ? new Date(voucher.end_at)
    : null;

  let text = "";
  let color = "";

  if (!voucher.active) {
    text = "Đã tắt";
    color = "bg-gray-100 text-gray-600";
  } else if (start && start > now) {
    text = "Sắp diễn ra";
    color = "bg-blue-100 text-blue-700";
  } else if (end && end < now) {
    text = "Đã hết hạn";
    color = "bg-red-100 text-red-700";
  } else {
    text = "Đang hoạt động";
    color = "bg-green-100 text-green-700";
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${color}`}
    >
      {text}
    </span>
  );
})()}
            
          </div>

          <p className="mt-1 font-mono text-sm text-primary">
            {voucher.code}
          </p>

          <div className="mt-3 flex flex-wrap gap-6 text-sm text-muted-foreground">\

            <span>
  Loại:{" "}
  <strong>
    {voucher.type === "percent"
      ? "Giảm %"
      : "Giảm tiền"}
  </strong>
</span>

            <span>
  Giá trị:{" "}
  <strong>
    {voucher.type === "percent"
      ? `${voucher.value}%`
      : `${Number(voucher.value).toLocaleString("vi-VN")}₫`}
  </strong>
</span>

            <span>
              Đã dùng:{" "}
              <strong>
                {voucher.used}/{voucher.quantity}
              </strong>
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />

            <span>
              {new Date(voucher.start_at).toLocaleDateString()} -{" "}
              {new Date(voucher.end_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(voucher)}
            className="rounded-lg border p-2 hover:bg-muted"
          >
            <Edit2 className="h-4 w-4" />
          </button>

          <button
            onClick={() => onDelete(voucher)}
            className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}