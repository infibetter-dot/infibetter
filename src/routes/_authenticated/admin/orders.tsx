import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatUSDFromVND } from "@/lib/format";
import { useEffect, useMemo, useState } from "react";
import {
  Circle,
  Gift,
  Package,
  PackageCheck,
  Printer,
  Truck,
  XCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: OrdersAdminPage,
});

type DateFilter = "today" | "yesterday" | "7days" | "30days" | "thisMonth" | "all";

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  processing: "Đã xử lý",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "border-emerald-200 bg-emerald-50 text-emerald-700",
  processing: "border-sky-200 bg-sky-50 text-sky-700",
  shipping: "border-indigo-200 bg-indigo-50 text-indigo-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
};

function getVietnamDate(value: string | Date) {
  return new Date(
    new Date(value).toLocaleString("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
    }),
  );
}

function statusIcon(status: string) {
  if (status === "pending") return Circle;
  if (status === "processing") return Package;
  if (status === "shipping") return Truck;
  if (status === "completed") return PackageCheck;
  return XCircle;
}

function OrdersAdminPage() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const [{ data: orders, error: orderError }, { data: items, error: itemError }] =
        await Promise.all([
          supabase.from("orders").select("*").order("created_at", { ascending: false }),
          supabase.from("order_items").select("*"),
        ]);

      if (orderError) throw orderError;
      if (itemError) throw itemError;

      return Promise.all(
        (orders ?? []).map(async (order) => {
          let shippingVoucherValue = 0;

          if (order.shipping_voucher_code) {
            const { data: voucher } = await supabase
              .from("vouchers")
              .select("value")
              .eq("code", order.shipping_voucher_code)
              .maybeSingle();

            shippingVoucherValue = Number(voucher?.value ?? 0);
          }

          return {
            ...order,
            shipping_voucher_value: shippingVoucherValue,
            order_items: (items ?? []).filter((item) => item.order_id === order.id),
          };
        }),
      );
    },
  });

  const isMatchDate = (orderDate: string) => {
    if (dateFilter === "all") return true;

    const now = getVietnamDate(new Date());
    const created = getVietnamDate(orderDate);

    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);

    const endToday = new Date(now);
    endToday.setHours(23, 59, 59, 999);

    switch (dateFilter) {
      case "today":
        return created >= startToday && created <= endToday;
      case "yesterday": {
        const start = new Date(startToday);
        start.setDate(start.getDate() - 1);
        const end = new Date(endToday);
        end.setDate(end.getDate() - 1);
        return created >= start && created <= end;
      }
      case "7days": {
        const start = new Date(startToday);
        start.setDate(start.getDate() - 6);
        return created >= start;
      }
      case "30days": {
        const start = new Date(startToday);
        start.setDate(start.getDate() - 29);
        return created >= start;
      }
      case "thisMonth":
        return created >= new Date(now.getFullYear(), now.getMonth(), 1);
      default:
        return true;
    }
  };

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return (data ?? []).filter((order) => {
      if (!isMatchDate(order.created_at)) return false;
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (!keyword) return true;

      return [
        order.id,
        order.full_name,
        order.phone,
        order.email,
      ].some((value) => String(value ?? "").toLowerCase().includes(keyword));
    });
  }, [data, dateFilter, search, statusFilter]);

  const ORDERS_PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateFilter, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const totalRevenue = filteredOrders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total ?? 0), 0);

  const counts = {
    pending: filteredOrders.filter((o) => o.status === "pending").length,
    processing: filteredOrders.filter((o) => o.status === "processing").length,
    completed: filteredOrders.filter((o) => o.status === "completed").length,
    cancelled: filteredOrders.filter((o) => o.status === "cancelled").length,
  };

  async function updateOrderStatus(orderId: string, newStatus: string) {
    const order = (data ?? []).find((item) => item.id === orderId);
    if (!order) {
      alert("Không tìm thấy đơn hàng.");
      return;
    }

    const transitions: Record<string, string[]> = {
      pending: ["processing", "cancelled"],
      processing: ["shipping", "cancelled"],
      shipping: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };

    if (!(transitions[order.status] ?? []).includes(newStatus)) {
      alert(`Không thể chuyển đơn hàng từ "${order.status}" sang "${newStatus}".`);
      return;
    }

    try {
      setUpdatingOrderId(orderId);

      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId)
        .eq("status", order.status);

      if (updateError) throw updateError;
      await refetch();

      if (selectedOrder?.id === orderId) {
        setSelectedOrder((current: any) =>
          current ? { ...current, status: newStatus } : current,
        );
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Không thể cập nhật trạng thái.");
      await refetch();
    } finally {
      setUpdatingOrderId(null);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1120px] px-4 py-10 text-sm text-neutral-500">
        Đang tải đơn hàng...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-[1120px] px-4 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Không thể tải đơn hàng: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <main className="mx-auto w-full max-w-[1120px] px-4 pb-10 pt-6 sm:px-5 lg:px-0">
        {/* Compact admin header */}
        <div className="mb-5 flex items-end justify-between border-b border-neutral-100 pb-4">
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                INFIBETTER ADMIN
              </span>
            </div>
            <h1 className="text-[24px] font-semibold leading-none tracking-[-0.04em]">
              Đơn hàng
            </h1>
            <p className="mt-1.5 text-[10px] text-neutral-500">
              Quản lý và theo dõi đơn hàng từ website INFIBETTER
            </p>
          </div>

          <div className="pb-0.5 text-[10px] text-neutral-500">
            <span className="font-semibold text-neutral-800">{filteredOrders.length}</span> đơn hàng
          </div>
        </div>

        {/* KPI */}
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["Tổng đơn hàng", String(filteredOrders.length), Package],
            ["Doanh thu", formatUSDFromVND(totalRevenue), Gift],
            ["Chờ xác nhận", String(counts.pending), Circle],
            ["Đang xử lý", String(counts.processing), Package],
            ["Hoàn thành", String(counts.completed), PackageCheck],
            ["Đơn hủy", String(counts.cancelled), XCircle],
          ].map(([label, value, Icon]) => {
            const CardIcon = Icon as typeof Package;

            return (
              <div
                key={String(label)}
                className="relative min-w-0 rounded-lg border border-neutral-200 bg-white px-3 py-2.5"
              >
                <CardIcon className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                <p className="pr-5 text-[8px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                  {label}
                </p>
                <p className="mt-2 truncate text-[15px] font-bold leading-none tracking-tight">
                  {value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="mb-3 flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-2 sm:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã đơn, tên khách, SĐT hoặc email..."
            className="h-8 min-w-0 flex-1 rounded-md border border-neutral-200 bg-neutral-50 px-3 text-[10px] outline-none transition focus:border-emerald-400 focus:bg-white"
          />

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            className="h-8 rounded-md border border-neutral-200 bg-white px-2.5 text-[10px] outline-none focus:border-emerald-400"
          >
            <option value="today">Hôm nay</option>
            <option value="yesterday">Hôm qua</option>
            <option value="7days">7 ngày gần đây</option>
            <option value="30days">30 ngày gần đây</option>
            <option value="thisMonth">Tháng này</option>
            <option value="all">Tất cả thời gian</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded-md border border-neutral-200 bg-white px-2.5 text-[10px] outline-none focus:border-emerald-400"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="processing">Đã xử lý</option>
            <option value="shipping">Đang giao</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        {/* Desktop table */}
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-fixed border-collapse">
              <thead className="border-b border-neutral-200 bg-neutral-50">
                <tr className="text-left text-[8px] font-bold uppercase tracking-[0.07em] text-neutral-500">
                  <th className="w-[13%] px-3 py-2.5">Đơn hàng</th>
                  <th className="w-[16%] px-3 py-2.5">Khách hàng</th>
                  <th className="w-[11%] px-3 py-2.5">Thanh toán</th>
                  <th className="w-[15%] px-3 py-2.5">Voucher</th>
                  <th className="w-[11%] px-3 py-2.5 text-right">Tổng tiền</th>
                  <th className="w-[14%] px-3 py-2.5">Trạng thái</th>
                  <th className="w-[12%] px-3 py-2.5">Ghi chú</th>
                  <th className="w-[8%] px-3 py-2.5 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-[11px] text-neutral-500">
                      Không tìm thấy đơn hàng phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => {
                    const StatusIcon = statusIcon(order.status);

                    return (
                      <tr
                        key={order.id}
                        className={`border-b border-neutral-100 last:border-0 ${
                          order.status === "pending"
                            ? "bg-emerald-50/45"
                            : "hover:bg-neutral-50"
                        }`}
                      >
                        <td className="px-3 py-2.5 align-middle">
                          <div className="leading-tight">
                            <p className="font-mono text-[9px] font-bold text-neutral-900">
                              #{order.id.slice(0, 8)}
                            </p>
                            <p className="mt-1 text-[8px] text-neutral-400">
                              {new Date(order.created_at).toLocaleString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </td>

                        <td className="px-3 py-2.5 align-middle">
                          <p className="truncate text-[10px] font-semibold text-neutral-900">
                            {order.full_name || "-"}
                          </p>
                          <p className="mt-0.5 truncate text-[8px] text-neutral-500">
                            {order.phone || order.email || "-"}
                          </p>
                        </td>

                        <td className="px-3 py-2.5 align-middle">
                          <div className="flex flex-col items-start gap-1">
                            <span className="inline-flex rounded-md bg-neutral-100 px-2 py-1 text-[8px] font-bold uppercase text-neutral-700">
                              {order.payment_method || "-"}
                            </span>

                            {order.payment_method?.toLowerCase() === "paypal" ||
                            order.payment_status === "paid" ||
                            order.status === "completed" ? (
                              <span className="inline-flex items-center gap-1 text-[7px] font-medium text-neutral-500">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                Đã thanh toán
                              </span>
                            ) : order.payment_status === "partial" ? (
                              <span className="inline-flex items-center gap-1 text-[7px] font-medium text-amber-600">
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                Thanh toán một phần
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[7px] font-medium text-neutral-500">
                                <span className="h-2.5 w-2.5 rounded-full border border-neutral-400" />
                                Chưa thanh toán
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-2.5 align-middle">
                          <div className="flex max-w-[115px] flex-col gap-1">
                            {order.discount_voucher_code && (
                              <span className="inline-flex w-fit max-w-full items-center gap-1 truncate rounded-md bg-emerald-50 px-1.5 py-1 text-[7px] font-semibold text-emerald-700">
                                <Gift className="h-2.5 w-2.5 shrink-0" />
                                {order.discount_voucher_code}
                              </span>
                            )}
                            {order.shipping_voucher_code && (
                              <span className="inline-flex w-fit max-w-full items-center gap-1 truncate rounded-md bg-sky-50 px-1.5 py-1 text-[7px] font-semibold text-sky-700">
                                <Truck className="h-2.5 w-2.5 shrink-0" />
                                {order.shipping_voucher_code}
                              </span>
                            )}
                            {!order.discount_voucher_code && !order.shipping_voucher_code && (
                              <span className="text-[8px] text-neutral-400">Không có</span>
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-2.5 text-right align-middle">
                          <span className="whitespace-nowrap text-[10px] font-bold">
                            {formatUSDFromVND(Number(order.total ?? 0))}
                          </span>
                        </td>

                        <td className="px-3 py-2.5 align-middle">
                          <Select
                            value={order.status}
                            disabled={updatingOrderId === order.id}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                           <SelectTrigger
  className={`h-7 w-[145px] shrink-0 flex-nowrap rounded-md px-2 text-[8px] font-semibold shadow-none whitespace-nowrap ${STATUS_STYLES[order.status] ?? ""} [&>span]:flex [&>span]:min-w-0 [&>span]:items-center [&>span]:gap-1.5 [&>span]:whitespace-nowrap`}
>
  <StatusIcon className="h-3 w-3 shrink-0" />
  <SelectValue className="!m-0 !w-auto !whitespace-nowrap !text-left" />
</SelectTrigger>

                            <SelectContent>
                              {order.status === "pending" && (
                                <>
                                  <SelectItem value="pending" disabled>Chờ xác nhận</SelectItem>
                                  <SelectItem value="processing">Xử lý đơn hàng</SelectItem>
                                  <SelectItem value="cancelled">Hủy đơn</SelectItem>
                                </>
                              )}
                              {order.status === "processing" && (
                                <>
                                  <SelectItem value="processing" disabled>Đã xử lý</SelectItem>
                                  <SelectItem value="shipping">Đang giao</SelectItem>
                                  <SelectItem value="cancelled">Hủy đơn</SelectItem>
                                </>
                              )}
                              {order.status === "shipping" && (
                                <>
                                  <SelectItem value="shipping" disabled>Đang giao</SelectItem>
                                  <SelectItem value="completed">Hoàn thành</SelectItem>
                                  <SelectItem value="cancelled">Hủy đơn</SelectItem>
                                </>
                              )}
                              {order.status === "completed" && (
                                <SelectItem value="completed" disabled>Hoàn thành</SelectItem>
                              )}
                              {order.status === "cancelled" && (
                                <SelectItem value="cancelled" disabled>Đã hủy</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </td>

                        <td className="px-3 py-2.5 align-middle">
                          {order.admin_note ? (
                            <span
                              title={order.admin_note}
                              className="block max-w-[120px] truncate rounded-md border border-neutral-200 bg-white px-2 py-1 text-[7px] text-neutral-600"
                            >
                              {order.admin_note}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="rounded-md border border-dashed border-neutral-200 px-2 py-1 text-[7px] text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50"
                            >
                              + Thêm ghi chú
                            </button>
                          )}
                        </td>

                        <td className="px-3 py-2.5 text-right align-middle">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex h-7 items-center rounded-md border border-neutral-200 bg-white px-2.5 text-[8px] font-semibold text-neutral-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            Xem →
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="mt-2 flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2">
            <p className="text-[8px] text-neutral-500">
              Hiển thị{" "}
              <span className="font-semibold text-neutral-800">
                {(currentPage - 1) * ORDERS_PER_PAGE + 1}–
                {Math.min(currentPage * ORDERS_PER_PAGE, filteredOrders.length)}
              </span>{" "}
              trong{" "}
              <span className="font-semibold text-neutral-800">{filteredOrders.length}</span> đơn hàng
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="h-7 min-w-7 rounded-md border border-neutral-200 px-2 text-[9px] disabled:opacity-30"
              >
                ←
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-7 min-w-7 rounded-md px-2 text-[9px] font-semibold ${
                    currentPage === page
                      ? "bg-emerald-600 text-white"
                      : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="h-7 min-w-7 rounded-md border border-neutral-200 px-2 text-[9px] disabled:opacity-30"
              >
                →
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Order detail modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedOrder(null);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-[780px] overflow-y-auto rounded-xl bg-white shadow-2xl print:max-h-none print:max-w-[210mm] print:rounded-none print:shadow-none">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-5 py-3 print:hidden">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  INFIBETTER
                </p>
                <h2 className="mt-0.5 text-base font-semibold">
                  Order #{selectedOrder.id.slice(0, 8)}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-neutral-200 px-3 text-[9px] font-semibold hover:bg-neutral-50"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print invoice
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="h-8 w-8 rounded-md border border-neutral-200 text-sm text-neutral-500 hover:bg-neutral-50"
                >
                  ×
                </button>
              </div>
            </div>

            <div id="invoice-print" className="space-y-5 p-5 print:p-4">
              <div className="flex items-start justify-between border-b border-neutral-200 pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-[10px] font-black text-white">
                      IN
                    </div>
                    <div>
                      <h1 className="text-lg font-bold tracking-tight">INFIBETTER</h1>
                      <p className="text-[9px] text-neutral-500">
                        Apple-ready essentials • Everyday tech
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[8px] uppercase tracking-[0.16em] text-neutral-400">
                    Invoice
                  </p>
                  <p className="mt-1 font-mono text-sm font-bold">
                    #{selectedOrder.id.slice(0, 8)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-3 rounded-lg border border-neutral-200 p-4 text-[10px]">
                <div>
                  <span className="text-neutral-400">Khách hàng</span>
                  <p className="mt-0.5 font-semibold">{selectedOrder.full_name || "-"}</p>
                </div>
                <div>
                  <span className="text-neutral-400">SĐT</span>
                  <p className="mt-0.5">{selectedOrder.phone || "-"}</p>
                </div>
                <div>
                  <span className="text-neutral-400">Thanh toán</span>
                  <p className="mt-0.5 uppercase">{selectedOrder.payment_method || "-"}</p>
                </div>
                <div>
                  <span className="text-neutral-400">Email</span>
                  <p className="mt-0.5 break-all">{selectedOrder.email || "-"}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-neutral-400">Địa chỉ</span>
                  <p className="mt-0.5 leading-5">
                    {selectedOrder.address || "-"}
                    {selectedOrder.ward ? <><br />{selectedOrder.ward}</> : null}
                    {selectedOrder.district ? <><br />{selectedOrder.district}</> : null}
                    {selectedOrder.city ? <><br />{selectedOrder.city}</> : null}
                  </p>
                </div>
                {selectedOrder.notes && (
                  <div className="col-span-2">
                    <span className="text-neutral-400">Ghi chú</span>
                    <p className="mt-0.5">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  Products
                </h3>

                <div className="space-y-1.5">
                  {selectedOrder.order_items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 shrink-0 rounded-md bg-neutral-100" />
                        )}

                        <div className="min-w-0">
                          <p className="line-clamp-2 text-[10px] font-semibold">
                            {item.product_name || "-"}
                          </p>
                          <p className="mt-0.5 text-[8px] text-neutral-500">
                            {item.color_name || "-"} · x{item.quantity}
                          </p>
                        </div>
                      </div>

                      <p className="ml-4 shrink-0 text-[10px] font-semibold">
                        {formatUSDFromVND(Number(item.unit_price ?? 0))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t border-neutral-200 pt-4 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subtotal</span>
                  <span>{formatUSDFromVND(Number(selectedOrder.subtotal ?? 0))}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-500">Shipping</span>
                  <span>{formatUSDFromVND(Number(selectedOrder.shipping_fee ?? 0))}</span>
                </div>

                {selectedOrder.discount_voucher_code && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">
                      Discount · {selectedOrder.discount_voucher_code}
                    </span>
                    <span className="font-semibold text-emerald-600">
                      -{formatUSDFromVND(Number(selectedOrder.discount_amount ?? 0))}
                    </span>
                  </div>
                )}

                {selectedOrder.shipping_voucher_code && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">
                      Shipping · {selectedOrder.shipping_voucher_code}
                    </span>
                    <span className="font-semibold text-emerald-600">
                      -{formatUSDFromVND(Number(selectedOrder.shipping_voucher_value ?? 0))}
                    </span>
                  </div>
                )}

                <div className="mt-3 flex items-end justify-between rounded-lg bg-neutral-50 px-4 py-3">
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.14em] text-neutral-400">
                      Total
                    </p>
                    <p className="mt-1 text-[9px] text-neutral-500">
                      Shipping and discounts included
                    </p>
                  </div>
                  <p className="text-xl font-bold tracking-tight">
                    {formatUSDFromVND(Number(selectedOrder.total ?? 0))}
                  </p>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-4 text-center">
                <p className="text-[10px] font-semibold">
                  Thank you for shopping with INFIBETTER.
                </p>
                <p className="mt-1 text-[8px] text-neutral-500">
                  infibetter@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
