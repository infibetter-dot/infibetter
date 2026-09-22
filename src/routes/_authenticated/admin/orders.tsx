import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatVND } from "@/lib/format";
import { useEffect, useState } from "react";
import {
  Gift,
  Truck,
  Printer,
  Circle,
  Package,
  PackageCheck,
  XCircle,
  ChevronDown,
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

function OrdersAdminPage() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const ORDERS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const [dateFilter, setDateFilter] = useState<
  "today" |
  "yesterday" |
  "7days" |
  "30days" |
  "thisMonth" |
  "all"
>("all");

const [search, setSearch] = useState("");

const [statusFilter, setStatusFilter] = useState("all");

  const handlePrint = () => {
  window.print();
};

async function updateOrderStatus(
  orderId: string,
  newStatus: string
) {
  const order = (data ?? []).find(
    (item) => item.id === orderId
  );

  if (!order) {
    alert("Không tìm thấy đơn hàng.");
    return;
  }

  const currentStatus = order.status;

  /*
   * =====================================================
   * CHỈ CHO PHÉP ĐI THEO ĐÚNG LUỒNG
   *
   * pending
   *    ↓
   * processing
   *    ↓
   * shipping
   *    ↓
   * completed
   *
   * cancelled là trạng thái kết thúc riêng.
   * =====================================================
   */

  const allowedTransitions: Record<string, string[]> = {
    pending: ["processing", "cancelled"],
    processing: ["shipping", "cancelled"],
    shipping: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };

  const allowed = allowedTransitions[currentStatus] ?? [];

  if (!allowed.includes(newStatus)) {
    alert(
      `Không thể chuyển đơn hàng từ "${currentStatus}" sang "${newStatus}".`
    );
    return;
  }

  try {
    setUpdatingOrderId(orderId);

    /*
     * =====================================================
     * PROCESSING / COMPLETED
     *
     * Hai trạng thái này PHẢI đi qua Edge Function.
     *
     * processing:
     * - đổi status
     * - gửi email xác nhận đơn hàng
     *
     * completed:
     * - đổi status
     * - tạo voucher 5%
     * - gửi email giao hàng thành công
     * =====================================================
     */

    if (
      newStatus === "processing" ||
      newStatus === "completed"
    ) {
      const {
        data: functionResult,
        error: functionError,
      } = await supabase.functions.invoke(
        "admin-update-order-status",
        {
          body: {
            order_id: orderId,
            status: newStatus,
          },
        }
      );

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (
        functionResult &&
        functionResult.success === false
      ) {
        throw new Error(
          functionResult.message ||
          "Không thể cập nhật trạng thái đơn hàng."
        );
      }

      console.log(
        "ADMIN UPDATE ORDER RESULT:",
        functionResult
      );
    }

    /*
     * =====================================================
     * SHIPPING / CANCELLED
     *
     * Hai trạng thái này chưa cần gửi email tự động
     * nên vẫn update trực tiếp.
     *
     * Có thêm điều kiện status hiện tại để tránh:
     * tab A + tab B cùng sửa một đơn.
     * =====================================================
     */

    else {
      const {
        error: updateError,
      } = await supabase
        .from("orders")
        .update({
          status: newStatus,
        })
        .eq("id", orderId)
        .eq("status", currentStatus);

      if (updateError) {
        throw updateError;
      }
    }

    await refetch();

  } catch (error) {
    console.error(
      "UPDATE ORDER STATUS ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Không thể cập nhật trạng thái đơn hàng.";

    alert(message);

    await refetch();

  } finally {
    setUpdatingOrderId(null);
  }
}

  const {
  data,
  isLoading,
  refetch,
} = useQuery({
    queryKey: ["admin-orders"],

queryFn: async () => {

  const { data: orders, error: orderError } =
    await supabase
      .from("orders")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  if (orderError) throw orderError;

  const { data: items, error: itemError } =
    await supabase
      .from("order_items")
      .select("*");

  if (itemError) throw itemError;

  const result = await Promise.all(
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

      order_items: (items ?? []).filter(
        item => item.order_id === order.id
      ),
    };
  })
);

  console.log(result);

  return result;
},

  });

const keyword = search.trim().toLowerCase();

const filteredOrders = (data ?? []).filter((order) => {

  // Lọc theo ngày
  if (!isMatchDate(order.created_at)) {
    return false;
  }

  // Lọc theo trạng thái
  if (
    statusFilter !== "all" &&
    order.status !== statusFilter
  ) {
    return false;
  }

  // Không nhập từ khóa
  if (!keyword) {
    return true;
  }

  // Search
  return (
    order.id.toLowerCase().includes(keyword) ||
    order.full_name?.toLowerCase().includes(keyword) ||
    order.phone?.toLowerCase().includes(keyword) ||
    order.email?.toLowerCase().includes(keyword)
  );

});

const totalOrders = filteredOrders.length;

const totalPages = Math.max(1, Math.ceil(totalOrders / ORDERS_PER_PAGE));

useEffect(() => {
  setCurrentPage(1);
}, [search, dateFilter, statusFilter]);

useEffect(() => {
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }
}, [currentPage, totalPages]);

const paginatedOrders = filteredOrders.slice(
  (currentPage - 1) * ORDERS_PER_PAGE,
  currentPage * ORDERS_PER_PAGE
);

// Loading state is rendered only AFTER all hooks above have executed.
if (isLoading) {
  return (
    <div className="container-x min-w-0 max-w-full overflow-x-hidden py-10">
      Đang tải...
    </div>
  );
}

const revenueOrders = filteredOrders.filter(
  (order) => order.status !== "cancelled"
);

const totalRevenue = revenueOrders.reduce(
  (sum, order) => sum + Number(order.total ?? 0),
  0
);

const pendingOrders = filteredOrders.filter(
  order => order.status === "pending"
).length;

const processingOrders = filteredOrders.filter(
  order => order.status === "processing"
).length;

const completedOrders = filteredOrders.filter(
  order => order.status === "completed"
).length;

const cancelledOrders = filteredOrders.filter(
  order => order.status === "cancelled"
).length;


function getVietnamDate(date: string | Date) {
  return new Date(
    new Date(date).toLocaleString("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
    })
  );
}

function isMatchDate(orderDate: string) {
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

    case "thisMonth": {

      const start = new Date(now.getFullYear(), now.getMonth(), 1);

      return created >= start;
    }

    default:
      return true;
  }
}

  return (
    <div
      className="container-x py-10"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      {/* ================= PAGE HEADER ================= */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Olive Living Admin
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Đơn hàng
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Quản lý và theo dõi toàn bộ đơn hàng từ website Olive Living
          </p>
        </div>

        <div className="text-sm text-neutral-500">
          {filteredOrders.length} đơn hàng
        </div>
      </div>

      {/* ================= KPI ================= */}
      <div className="mb-7 grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {[
          {
            label: "Tổng đơn hàng",
            value: filteredOrders.length,
            icon: Package,
          },
          {
            label: "Doanh thu",
            value: formatVND(totalRevenue),
            icon: Gift,
          },
          {
            label: "Chờ xác nhận",
            value: pendingOrders,
            icon: Circle,
          },
          {
            label: "Đang xử lý",
            value: processingOrders,
            icon: PackageCheck,
          },
          {
            label: "Hoàn thành",
            value: completedOrders,
            icon: PackageCheck,
          },
          {
            label: "Đơn hủy",
            value: cancelledOrders,
            icon: XCircle,
          },
        ].map((kpi) => {
          const Icon = kpi.icon;

          return (
            <div
              key={kpi.label}
              className="group relative min-w-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* Icon stays in its own layer so long KPI values never collide with it. */}
              <div className="absolute right-4 top-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition-transform duration-200 group-hover:scale-105">
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 pr-1">
                <p className="max-w-[75%] text-xs font-medium uppercase tracking-wide text-neutral-500">
                  {kpi.label}
                </p>

                <p
                  className={
                    kpi.label === "Doanh thu"
                      ? "mt-4 whitespace-nowrap text-[18px] font-bold leading-none tracking-tight text-neutral-900 sm:text-xl"
                      : "mt-4 whitespace-nowrap text-xl font-bold leading-none tracking-tight text-neutral-900 sm:text-2xl"
                  }
                >
                  {kpi.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= FILTER TOOLBAR ================= */}
      <div className="mb-5 w-full max-w-full rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã đơn, tên khách, SĐT hoặc email..."
              className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(e.target.value as any)
              }
              className="h-11 rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
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
              className="h-11 rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="processing">Đã xử lý</option>
              <option value="shipping">Đang giao</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= ORDERS TABLE ================= */}
      <div className="w-full max-w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="w-full max-w-full overflow-x-auto">
          <table className="w-full min-w-[1160px] table-fixed">
            <thead className="border-b border-neutral-200 bg-neutral-50/80">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <th className="w-[125px] px-4 py-4">Đơn hàng</th>
                <th className="w-[180px] px-4 py-4">Khách hàng</th>
                <th className="w-[105px] px-4 py-4">Thanh toán</th>
                <th className="w-[145px] px-4 py-4">TT thanh toán</th>
                <th className="w-[140px] px-4 py-4">Voucher</th>
                <th className="w-[125px] px-4 py-4 text-right">Tổng tiền</th>
                <th className="w-[175px] px-4 py-4">Trạng thái</th>
                <th className="w-[110px] px-4 py-4">Ngày đặt</th>
                <th className="w-[90px] px-4 py-4 text-right">Chi tiết</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-14 text-center text-sm text-neutral-500"
                  >
                    Không tìm thấy đơn hàng phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className={
                      `border-b transition-colors last:border-0 ${
                        order.status === "pending"
                          ? "border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50"
                          : "border-neutral-100 hover:bg-neutral-50/70"
                      }`
                    }
                  >
                    {/* Order */}
                    <td className="px-4 py-4 align-middle">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-semibold text-neutral-900">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span className="mt-1 text-xs text-neutral-400">
                          {new Date(order.created_at).toLocaleString()}
                        </span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-4 align-middle">
                      <div className="min-w-0 max-w-[180px]">
                        <p className="truncate font-semibold text-neutral-900">
                          {order.full_name}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {order.phone}
                        </p>
                      </div>
                    </td>

                    {/* Payment */}
                    <td className="px-4 py-4 align-middle">
                      <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-semibold uppercase text-neutral-700">
                        {order.payment_method}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td className="px-4 py-4 align-middle">
                      {order.payment_method?.toLowerCase() === "paypal" ||
                       order.status === "completed" ||
                       order.payment_status === "paid" ? (
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                            ✓
                          </span>
                          Đã thanh toán
                        </span>
                      ) : order.payment_status === "partial" ? (
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                            ◐
                          </span>
                          Thanh toán một phần
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-[11px] font-semibold text-neutral-600">
                          <span className="h-4 w-4 rounded-full border-2 border-neutral-400" />
                          Chưa thanh toán
                        </span>
                      )}
                    </td>

                    {/* Voucher */}
                    <td className="px-4 py-4 align-middle">
                      <div className="flex max-w-[150px] flex-col gap-1.5">
                        {order.discount_voucher_code && (
                          <span className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700">
                            <Gift className="h-3.5 w-3.5 shrink-0" />
                            {order.discount_voucher_code}
                          </span>
                        )}

                        {order.shipping_voucher_code && (
                          <span className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-[11px] font-semibold text-sky-700">
                            <Truck className="h-3.5 w-3.5 shrink-0" />
                            {order.shipping_voucher_code}
                          </span>
                        )}

                        {!order.discount_voucher_code &&
                          !order.shipping_voucher_code && (
                            <span className="text-sm text-neutral-400">
                              Không có
                            </span>
                          )}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="px-5 py-4 text-right">
                      <span className="whitespace-nowrap text-sm font-bold text-neutral-900">
                        {formatVND(Number(order.total))}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 align-middle">
                      <Select
  value={order.status}
  disabled={updatingOrderId === order.id}
  onValueChange={(value) =>
    updateOrderStatus(order.id, value)
  }
>
                        <SelectTrigger className={
                          `h-9 w-[165px] rounded-xl text-xs font-semibold shadow-none transition-all focus:ring-4 focus:ring-emerald-500/10 ${
                            order.status === "pending"
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-[0_0_0_2px_rgba(16,185,129,0.08)] hover:bg-emerald-100"
                              : order.status === "processing"
                              ? "border-sky-200 bg-sky-50 text-sky-700"
                              : order.status === "shipping"
                              ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                              : order.status === "completed"
                              ? "border-emerald-200 bg-emerald-50/70 text-emerald-700"
                              : "border-red-200 bg-red-50 text-red-700"
                          }`
                        }>
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>

  {/* ================= PENDING ================= */}

  {order.status === "pending" && (
    <>
      <SelectItem value="pending" disabled>
        <div className="flex items-center gap-2">
          <Circle className="h-3.5 w-3.5 fill-emerald-500 text-emerald-600" />
          Chờ xác nhận
        </div>
      </SelectItem>

      <SelectItem value="processing">
        <div className="flex items-center gap-2">
          <Package className="h-3.5 w-3.5 text-sky-500" />
          Xử lý đơn hàng
        </div>
      </SelectItem>

      <SelectItem value="cancelled">
        <div className="flex items-center gap-2">
          <XCircle className="h-3.5 w-3.5 text-red-500" />
          Hủy đơn
        </div>
      </SelectItem>
    </>
  )}


  {/* ================= PROCESSING ================= */}

  {order.status === "processing" && (
    <>
      <SelectItem value="processing" disabled>
        <div className="flex items-center gap-2">
          <Package className="h-3.5 w-3.5 text-sky-500" />
          Đã xử lý
        </div>
      </SelectItem>

      <SelectItem value="shipping">
        <div className="flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 text-indigo-500" />
          Đang giao
        </div>
      </SelectItem>

      <SelectItem value="cancelled">
        <div className="flex items-center gap-2">
          <XCircle className="h-3.5 w-3.5 text-red-500" />
          Hủy đơn
        </div>
      </SelectItem>
    </>
  )}


  {/* ================= SHIPPING ================= */}

  {order.status === "shipping" && (
    <>
      <SelectItem value="shipping" disabled>
        <div className="flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 text-indigo-500" />
          Đang giao
        </div>
      </SelectItem>

      <SelectItem value="completed">
        <div className="flex items-center gap-2">
          <PackageCheck className="h-3.5 w-3.5 text-emerald-600" />
          Hoàn thành
        </div>
      </SelectItem>

      <SelectItem value="cancelled">
        <div className="flex items-center gap-2">
          <XCircle className="h-3.5 w-3.5 text-red-500" />
          Hủy đơn
        </div>
      </SelectItem>
    </>
  )}


  {/* ================= COMPLETED ================= */}

  {order.status === "completed" && (
    <SelectItem value="completed" disabled>
      <div className="flex items-center gap-2">
        <PackageCheck className="h-3.5 w-3.5 text-emerald-600" />
        Hoàn thành
      </div>
    </SelectItem>
  )}


  {/* ================= CANCELLED ================= */}

  {order.status === "cancelled" && (
    <SelectItem value="cancelled" disabled>
      <div className="flex items-center gap-2">
        <XCircle className="h-3.5 w-3.5 text-red-500" />
        Đã hủy
      </div>
    </SelectItem>
  )}

</SelectContent>

                      </Select>
                    </td>

                    {/* Details */}
                    <td className="px-4 py-4 align-middle">
                      <span className="whitespace-nowrap text-xs text-neutral-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-xs font-semibold text-neutral-800 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        Chi tiết →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= PAGINATION ================= */}
      {filteredOrders.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-500">
            Hiển thị <span className="font-semibold text-neutral-800">
              {(currentPage - 1) * ORDERS_PER_PAGE + 1}
            </span>
            –
            <span className="font-semibold text-neutral-800">
              {Math.min(currentPage * ORDERS_PER_PAGE, filteredOrders.length)}
            </span>
            trong <span className="font-semibold text-neutral-800">{filteredOrders.length}</span> đơn hàng
          </p>

          <div className="flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ←
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={
                  `inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
                    currentPage === page
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "border border-neutral-200 bg-white text-neutral-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                  }`
                }
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>
      )}

      {selectedOrder && (

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

<div
  className="
    w-full
    max-w-[820px]
    max-h-[90vh]
    overflow-y-auto
    rounded-2xl
    bg-white
    p-6
    shadow-2xl
    print:max-w-[210mm]
    print:max-h-none
    print:overflow-visible
    print:rounded-none
    print:p-5
    print:shadow-none
  "
>
   <div className="mb-6 flex items-center justify-between">

  <h2 className="text-2xl font-semibold">
    Chi tiết đơn hàng
  </h2>

  <div className="flex items-center gap-3">

    <button
      onClick={handlePrint}
      className="flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
    >
      <Printer className="h-4 w-4" />
      In hóa đơn
    </button>

    <button
      onClick={() => setSelectedOrder(null)}
      className="text-xl"
    >
      ✕
    </button>

  </div>

</div>

    <div
  id="invoice-print"
  className="space-y-8"
>

  {/* ================= HEADER ================= */}

<div className="rounded-xl border p-5">

  <div className="flex items-center justify-between">

    <div className="flex items-center gap-4">

      {/* Logo */}

      <img
        src="/branding/olive-logo.png"
        alt="Olive Living"
        className="h-12 w-auto"
      />

      <div>

        <h1 className="text-xl font-bold tracking-wide">

          OLIVE LIVING

        </h1>

        <p className="text-sm text-neutral-500">

          Modern Living • Premium Decor

        </p>

      </div>

    </div>

    <div className="text-right">

      <p className="text-xs uppercase tracking-wider text-neutral-500">

        Invoice

      </p>

      <p className="mt-1 font-mono text-lg font-bold">

        #{selectedOrder.id.slice(0,8)}

      </p>

    

    </div>

  </div>

</div>

 <div className="rounded-xl border p-4">

  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">

    <div>

      <span className="text-neutral-500">

        Khách hàng

      </span>

      <p className="font-semibold">

        {selectedOrder.full_name}

      </p>

    </div>

    <div>

      <span className="text-neutral-500">

        SĐT

      </span>

      <p>

        {selectedOrder.phone}

      </p>

    </div>

    <div>

      <span className="text-neutral-500">

        Thanh toán

      </span>

      <p className="uppercase">

        {selectedOrder.payment_method}

      </p>

    </div>

    <div>

      <span className="text-neutral-500">

        Email

      </span>

      <p>

        {selectedOrder.email || "-"}

      </p>

    </div>

    <div className="col-span-2">

      <span className="text-neutral-500">

        Địa chỉ

      </span>

      <p className="mt-1 leading-7">
  {selectedOrder.address}
  <br />
  {selectedOrder.ward && (
    <>
      {selectedOrder.ward}
      <br />
    </>
  )}
  {selectedOrder.district && (
    <>
      {selectedOrder.district}
      <br />
    </>
  )}
  {selectedOrder.city}
</p>

    </div>

    {selectedOrder.notes && (

      <div className="col-span-2">

        <span className="text-neutral-500">

          Ghi chú

        </span>

        <p>

          {selectedOrder.notes}

        </p>

      </div>

    )}

  </div>

</div>

  {/* Voucher */}



  {/* Danh sách sản phẩm */}

  <div>

    <h3 className="mb-4 text-lg font-semibold">
      Sản phẩm
    </h3>

    <div className="space-y-4">

      {selectedOrder.order_items?.map((item: any) => (
  <div
    key={item.id}
    className="
      flex
      items-center
      justify-between

      rounded-lg
      border

      px-3
      py-2

      print:py-1.5

      break-inside-avoid
      page-break-inside-avoid
    "
  >
    <div className="flex items-center gap-3 min-w-0">

      <img
        src={item.product_image}
        className="
          h-10
          w-10
          rounded-md
          object-cover
          shrink-0
        "
      />

      <div className="min-w-0">

        <p className="line-clamp-2 text-sm font-medium leading-5">
          {item.product_name}
        </p>

        <p className="mt-0.5 text-xs text-neutral-500">
          {item.color_name ?? "-"} • x{item.quantity}
        </p>

      </div>

    </div>

    <div className="ml-4 shrink-0 text-right">

      <p className="text-sm font-semibold">
        {formatVND(item.unit_price)}
      </p>

    </div>

  </div>
))}

    </div>

  </div>

  {/* Thanh toán */}

  
<div className="space-y-4">

  <div className="flex justify-between">
    <span>Tạm tính</span>
    <span>{formatVND(Number(selectedOrder.subtotal ?? 0))}</span>
  </div>

  <div className="flex justify-between">
    <span>Phí vận chuyển</span>
    <span>{formatVND(Number(selectedOrder.shipping_fee ?? 0))}</span>
  </div>

  {selectedOrder.discount_voucher_code && (
    <div className="flex items-center justify-between border-t pt-4">

      <div>
        <p className="text-sm text-neutral-500">
          Voucher giảm giá
        </p>

        <p className="font-semibold">
          {selectedOrder.discount_voucher_code}
        </p>
      </div>

      <span className="font-semibold text-emerald-600">
        -{formatVND(Number(selectedOrder.discount_amount ?? 0))}
      </span>

    </div>
  )}

  {selectedOrder.shipping_voucher_code && (
    
    <div className="flex items-center justify-between">

      <div>
        <p className="text-sm text-neutral-500">
          Voucher Freeship
        </p>

        <p className="font-semibold">
          {selectedOrder.shipping_voucher_code}
      </p>
      </div>

      <span className="font-semibold text-emerald-600">
        -{formatVND(Number(selectedOrder.shipping_voucher_value ?? 0))}
      </span>

    </div>
  )}

  <div className="mt-4 rounded-xl border border-primary/10 bg-primary/5 px-5 py-4">

    
<div className="flex items-center justify-between">

  <div className="text-left text-xs leading-5 text-muted-foreground">
    Đã gồm phí ship
    <br />
    và ưu đãi
  </div>

  <div className="text-right">

    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      Tổng cần thanh toán
    </p>

    <p className="mt-1 text-3xl font-bold text-primary">
      {formatVND(Number(selectedOrder.total))}
    </p>

  </div>

  

</div>
    

  </div>


  <p className="mt-10 border-t pt-6 text-center text-lg font-semibold text-neutral-800">
  Cảm ơn Quý khách đã mua sắm tại Olive Living 💚
</p>

<p className="mt-2 text-center text-sm leading-6 text-neutral-500">
  Chúng tôi sẽ liên hệ xác nhận đơn hàng trong thời gian sớm nhất.
  <br />
  Cảm ơn Quý khách đã tin tưởng và lựa chọn Olive Living.
</p>

<div className="mt-5 text-center text-sm text-neutral-600 space-y-1">
  <p>🌐 www.olivelivingvn.com</p>
  <p>📞 0934 643 451</p>
  <p>✉️ support@olivelivingvn.com</p>
</div>

<p className="mt-5 text-center text-xs tracking-[0.2em] text-neutral-400">
  OLIVE LIVING • MODERN LIVING • PREMIUM DECOR
</p>

</div>
 

</div>

 </div> 
 

 </div> 
       )}

    </div>
  );
}