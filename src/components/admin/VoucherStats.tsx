import { Ticket, CheckCircle2, Clock3, Ban } from "lucide-react";

interface VoucherStatsProps {
  total: number;
  active: number;
  scheduled: number;
  expired: number;
}

function Card({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-bold">
            {value}
          </h3>
        </div>

        <div className="rounded-lg bg-muted p-3">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function VoucherStats({
  total,
  active,
  scheduled,
  expired,
}: VoucherStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card
        title="Tổng Voucher"
        value={total}
        icon={<Ticket className="h-6 w-6" />}
      />

      <Card
        title="Đang hoạt động"
        value={active}
        icon={<CheckCircle2 className="h-6 w-6 text-green-600" />}
      />

      <Card
        title="Sắp mở"
        value={scheduled}
        icon={<Clock3 className="h-6 w-6 text-orange-500" />}
      />

      <Card
        title="Đã hết hạn"
        value={expired}
        icon={<Ban className="h-6 w-6 text-red-500" />}
      />
    </div>
  );
}