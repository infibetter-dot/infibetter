import { createFileRoute } from "@tanstack/react-router";

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

const formatUSD = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

import { useEffect, useMemo, useState } from "react";

import {

  ArrowLeft,
  Circle,

  Gift,
  Eye,
  EyeOff,
  ExternalLink,
  Package,

  PackageCheck,

  Printer,

  Search,
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

  pending: "border-amber-200 bg-amber-50 text-amber-700",

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

  const [showHiddenOrders, setShowHiddenOrders] = useState(false);



  const { data, isLoading, error, refetch } = useQuery({

    queryKey: ["admin-orders"],
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 0,

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

      if (Boolean(order.is_hidden) !== showHiddenOrders) return false;

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

  }, [data, dateFilter, search, statusFilter, showHiddenOrders]);



  const ORDERS_PER_PAGE = 10;

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));

  const paginatedOrders = filteredOrders.slice(

    (currentPage - 1) * ORDERS_PER_PAGE,

    currentPage * ORDERS_PER_PAGE,

  );



  useEffect(() => {

    setCurrentPage(1);

  }, [search, dateFilter, statusFilter, showHiddenOrders]);



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



  async function toggleOrderVisibility(order: any) {
    const nextHidden = !Boolean(order.is_hidden);
    const actionLabel = nextHidden ? "ẩn" : "khôi phục";
    const confirmed = window.confirm(
      nextHidden
        ? `Ẩn đơn hàng #${String(order.id).slice(0, 8)} khỏi danh sách chính? Bạn có thể khôi phục sau.`
        : `Khôi phục đơn hàng #${String(order.id).slice(0, 8)} vào danh sách chính?`,
    );

    if (!confirmed) return;

    try {
      setUpdatingOrderId(order.id);

      const { error: updateError } = await supabase
        .from("orders")
        .update({ is_hidden: nextHidden })
        .eq("id", order.id);

      if (updateError) throw updateError;

      if (selectedOrder?.id === order.id) {
        setSelectedOrder(null);
      }

      await refetch();
    } catch (err) {
      console.error(`Order ${actionLabel} failed:`, err);
      alert(
        err instanceof Error
          ? err.message
          : `Không thể ${actionLabel} đơn hàng. Vui lòng thử lại.`,
      );
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

    <div className="min-h-screen overflow-x-hidden bg-slate-50 font-sans text-slate-900">

      <main className="mx-auto w-full max-w-[1440px] px-3 pb-8 pt-4 sm:px-6 sm:pb-12 sm:pt-6 lg:px-8">

        {/* Page heading */}
        <section className="mb-3 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.045)] sm:mb-6 sm:rounded-2xl">
          <div className="p-3 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
              <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/80 px-2 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shadow-[0_0_0_2px_rgba(16,185,129,0.12)]" />
                <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-emerald-800 sm:text-[9px]">
                  INFIBETTER ADMIN
                </span>
              </div>
              <h1 className="text-xl font-bold leading-tight tracking-[-0.045em] text-slate-950 sm:text-3xl">
                Quản lý đơn hàng
              </h1>
              <p className="mt-1 max-w-xl text-[10px] leading-[1.45] text-slate-500 sm:mt-2 sm:text-sm sm:leading-6">
                Theo dõi đơn hàng, trạng thái thanh toán và xử lý đơn từ website INFIBETTER.
              </p>
              </div>

              <a
                href="/account"
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:h-9 sm:gap-2 sm:px-3 sm:text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden min-[360px]:inline">Dashboard</span>
              </a>
            </div>
          </div>
        </section>

        {/* KPI summary */}
        <section className="mb-3 grid grid-cols-3 gap-1.5 sm:mb-6 sm:grid-cols-3 sm:gap-3 xl:grid-cols-6">
          {[
            ["Tổng đơn hàng", String(filteredOrders.length), Package, "bg-slate-100 text-slate-700"],
            ["Doanh thu", formatUSD(totalRevenue), Gift, "bg-emerald-50 text-emerald-700"],
            ["Chờ xác nhận", String(counts.pending), Circle, "bg-amber-50 text-amber-700"],
            ["Đang xử lý", String(counts.processing), Package, "bg-sky-50 text-sky-700"],
            ["Hoàn thành", String(counts.completed), PackageCheck, "bg-emerald-50 text-emerald-700"],
            ["Đơn hủy", String(counts.cancelled), XCircle, "bg-rose-50 text-rose-700"],
          ].map(([label, value, Icon, iconStyle]) => {
            const CardIcon = Icon as typeof Package;
            return (
              <div
                key={String(label)}
                className="flex min-h-[68px] min-w-0 flex-col justify-between rounded-lg border border-slate-200/80 bg-white p-2 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:min-h-[124px] sm:rounded-2xl sm:p-4"
              >
                <div className="flex items-center justify-between gap-1 sm:items-start sm:gap-2">
                  <p className="min-w-0 text-[8px] font-semibold leading-3 text-slate-500 sm:text-xs sm:leading-4">
                    {label}
                  </p>
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md sm:h-8 sm:w-8 sm:rounded-xl ${iconStyle}`}>
                    <CardIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </span>
                </div>
                <p className="mt-1 truncate text-sm font-bold leading-tight tracking-[-0.035em] text-slate-950 sm:mt-2 sm:text-2xl">
                  {value}
                </p>
              </div>
            );
          })}
        </section>

        {/* Search and filters */}
        <section className="mb-2 rounded-xl border border-slate-200/80 bg-white p-2 shadow-sm sm:mb-5 sm:rounded-2xl sm:p-5">
          <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
            <div className="min-w-0">
              <h2 className="text-xs font-bold leading-4 text-slate-900 sm:text-base">Danh sách đơn hàng</h2>
              <p className="mt-0.5 text-[9px] leading-3 text-slate-500 sm:mt-1 sm:text-xs sm:leading-4">
                Tìm kiếm và lọc theo thời gian hoặc trạng thái
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                <button
                  type="button"
                  onClick={() => setShowHiddenOrders(false)}
                  className={`rounded-md px-2 py-1 text-[9px] font-semibold transition sm:text-[11px] ${
                    !showHiddenOrders
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Đang hoạt động
                </button>
                <button
                  type="button"
                  onClick={() => setShowHiddenOrders(true)}
                  className={`rounded-md px-2 py-1 text-[9px] font-semibold transition sm:text-[11px] ${
                    showHiddenOrders
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Đã ẩn
                </button>
              </div>
              <span className="hidden shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-semibold text-blue-700 sm:inline-flex sm:text-xs">
                {filteredOrders.length} kết quả
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-[minmax(0,1fr)_190px_190px] sm:gap-2.5">
            <div className="relative col-span-2 min-w-0 sm:col-span-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400 sm:left-3 sm:h-4 sm:w-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mã đơn, tên khách, SĐT hoặc email..."
                className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-2 text-[10px] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 sm:h-11 sm:rounded-xl sm:pl-10 sm:pr-3 sm:text-sm sm:focus:ring-4"
              />
            </div>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              aria-label="Lọc theo thời gian"
              className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-[10px] text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 sm:h-11 sm:rounded-xl sm:px-3 sm:text-sm sm:focus:ring-4"
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
              aria-label="Lọc theo trạng thái"
              className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-[10px] text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 sm:h-11 sm:rounded-xl sm:px-3 sm:text-sm sm:focus:ring-4"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="processing">Đã xử lý</option>
              <option value="shipping">Đang giao</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </section>

        {/* Mobile order cards */}
        <div className="space-y-1.5 xl:hidden">
          {paginatedOrders.length === 0 ? (
            <div className="rounded-xl border border-neutral-200 bg-white px-4 py-12 text-center text-sm text-neutral-500">
              Không tìm thấy đơn hàng phù hợp.
            </div>
          ) : (
            paginatedOrders.map((order) => {
              const StatusIcon = statusIcon(order.status);
              return (
                <article
                  key={order.id}
                  className={`overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.035)] ${
                    order.status === "pending"
                      ? "border-amber-200"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-2.5 py-2">
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] font-bold text-slate-900">
                        #{order.id.slice(0, 8)}
                      </p>
                      <p className="mt-0.5 text-[9px] text-slate-500">
                        {new Date(order.created_at).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-semibold uppercase text-blue-700">
                        {order.payment_method || "Payment"}
                      </span>
                      <button
                        type="button"
                        aria-label={order.is_hidden ? "Khôi phục đơn hàng" : "Ẩn đơn hàng"}
                        title={order.is_hidden ? "Khôi phục đơn hàng" : "Ẩn đơn hàng"}
                        disabled={updatingOrderId === order.id}
                        onClick={() => toggleOrderVisibility(order)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                      >
                        {order.is_hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 px-2.5 py-2">
                    <div className="min-w-0">
                      <p className="text-[8px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                        Khách hàng
                      </p>
                      <p className="mt-0.5 break-words text-[11px] font-semibold text-slate-900">
                        {order.full_name || "-"}
                      </p>
                      <p className="mt-0.5 break-all text-[9px] text-slate-500">
                        {order.phone || order.email || "-"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                      <div className="min-w-0">
                        <p className="text-[8px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                          Thanh toán
                        </p>
                        <p className={`mt-0.5 text-[10px] font-medium ${
                          order.payment_status === "paid"
                            ? "text-emerald-700"
                            : order.payment_status === "partial" ||
                                (order.payment_status === "pending" && order.payment_method === "paypal")
                              ? "text-amber-700"
                              : "text-neutral-500"
                        }`}>
                          {order.payment_status === "paid"
                            ? "Đã thanh toán"
                            : order.payment_status === "pending" && order.payment_method === "paypal"
                              ? "PayPal đang chờ xác nhận"
                              : order.payment_status === "partial"
                                ? "Thanh toán một phần"
                                : "Chưa thanh toán"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                          Tổng tiền
                        </p>
                        <p className="mt-0 text-sm font-bold leading-tight text-slate-950">
                          {formatUSD(Number(order.total ?? 0))}
                        </p>
                      </div>
                    </div>

                    {(order.discount_voucher_code || order.shipping_voucher_code) && (
                      <div className="flex flex-wrap gap-1.5">
                        {order.discount_voucher_code && (
                          <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                            <Gift className="h-3 w-3 shrink-0" />
                            <span className="break-all">{order.discount_voucher_code}</span>
                          </span>
                        )}
                        {order.shipping_voucher_code && (
                          <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-sky-50 px-2 py-1 text-[10px] font-semibold text-sky-700">
                            <Truck className="h-3 w-3 shrink-0" />
                            <span className="break-all">{order.shipping_voucher_code}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {order.admin_note && (
                      <p className="line-clamp-1 rounded bg-slate-50 px-2 py-1 text-[8px] leading-3 text-slate-600">
                        <span className="font-semibold">Ghi chú: </span>
                        {order.admin_note}
                      </p>
                    )}

                    <div className="grid grid-cols-2 items-stretch gap-1 pt-0">
                      <Select
                        value={order.status}
                        disabled={updatingOrderId === order.id}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger
                          aria-label="Cập nhật trạng thái đơn hàng"
                          className={`h-8 min-w-0 w-full justify-between rounded-md px-2 text-[9px] font-semibold shadow-none [&>svg:last-child]:h-3 [&>svg:last-child]:w-3 ${STATUS_STYLES[order.status] ?? ""}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                          <SelectValue />
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

                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex min-w-0 min-h-8 items-center justify-center rounded-md bg-blue-600 px-1 text-[8px] font-semibold leading-tight text-white transition hover:bg-blue-700"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm xl:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] table-fixed border-collapse">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-center text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  <th className="w-[12%] px-3 py-3 text-center">Đơn hàng</th>
                  <th className="w-[15%] px-3 py-3 text-center">Khách hàng</th>
                  <th className="w-[12%] px-3 py-3 text-center">Thanh toán</th>
                  <th className="w-[12%] px-3 py-3 text-center">Voucher</th>
                  <th className="w-[12%] px-3 py-3 text-center">Tổng tiền</th>
                  <th className="w-[15%] px-3 py-3 text-center">Trạng thái</th>
                  <th className="w-[13%] px-3 py-3 text-center">Ghi chú</th>
                  <th className="w-[9%] px-3 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-neutral-500">
                      {showHiddenOrders
                        ? "Chưa có đơn hàng nào được ẩn."
                        : "Không tìm thấy đơn hàng phù hợp."}
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => {
                    const StatusIcon = statusIcon(order.status);
                    return (
                      <tr
                        key={order.id}
                        className={`border-b border-slate-100 last:border-0 ${
                          order.status === "pending" ? "bg-amber-50/50" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-3 py-3 align-middle text-center">
                          <p className="font-mono text-[11px] font-bold text-slate-900">#{order.id.slice(0, 8)}</p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {new Date(order.created_at).toLocaleString("vi-VN", {
                              hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric",
                            })}
                          </p>
                        </td>
                        <td className="px-3 py-3 align-middle text-center">
                          <p className="truncate text-sm font-semibold text-slate-900">{order.full_name || "-"}</p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">{order.phone || order.email || "-"}</p>
                        </td>
                        <td className="px-3 py-3 align-middle text-center">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className="inline-flex rounded-md bg-neutral-100 px-2 py-1 text-[9px] font-bold uppercase text-neutral-700">{order.payment_method || "-"}</span>
                            {order.payment_status === "paid" ? (
                              <span className="text-[9px] font-medium text-emerald-700">● Đã thanh toán</span>
                            ) : order.payment_status === "pending" && order.payment_method === "paypal" ? (
                              <span className="text-[9px] font-medium text-amber-600">● PayPal đang chờ xác nhận</span>
                            ) : order.payment_status === "partial" ? (
                              <span className="text-[9px] font-medium text-amber-600">● Thanh toán một phần</span>
                            ) : (
                              <span className="text-[9px] font-medium text-neutral-500">○ Chưa thanh toán</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 align-middle text-center">
                          <div className="mx-auto flex max-w-[130px] flex-col items-center justify-center gap-1">
                            {order.discount_voucher_code && (
                              <span className="inline-flex w-fit max-w-full items-center gap-1 truncate rounded-md bg-emerald-50 px-1.5 py-1 text-[8px] font-semibold text-emerald-700">
                                <Gift className="h-3 w-3 shrink-0" />{order.discount_voucher_code}
                              </span>
                            )}
                            {order.shipping_voucher_code && (
                              <span className="inline-flex w-fit max-w-full items-center gap-1 truncate rounded-md bg-sky-50 px-1.5 py-1 text-[8px] font-semibold text-sky-700">
                                <Truck className="h-3 w-3 shrink-0" />{order.shipping_voucher_code}
                              </span>
                            )}
                            {!order.discount_voucher_code && !order.shipping_voucher_code && (
                              <span className="text-center text-[10px] text-slate-400">Không có</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center align-middle">
                          <span className="whitespace-nowrap text-xs font-bold">{formatUSD(Number(order.total ?? 0))}</span>
                        </td>
                        <td className="px-3 py-3 align-middle text-center">
                          <Select
                            value={order.status}
                            disabled={updatingOrderId === order.id}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className={`mx-auto flex h-9 w-[120px] justify-center rounded-lg px-2 text-[11px] font-semibold shadow-none [&>span]:flex-1 [&>span]:text-center ${STATUS_STYLES[order.status] ?? ""}`}>
                              <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                              <SelectValue />
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
                              {order.status === "completed" && <SelectItem value="completed" disabled>Hoàn thành</SelectItem>}
                              {order.status === "cancelled" && <SelectItem value="cancelled" disabled>Đã hủy</SelectItem>}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-4 align-middle">
                          {order.admin_note ? (
                            <span title={order.admin_note} className="mx-auto block max-w-[130px] truncate rounded-md border border-neutral-200 bg-white px-2 py-1 text-center text-[9px] text-neutral-600">{order.admin_note}</span>
                          ) : (
                            <button type="button" onClick={() => setSelectedOrder(order)} className="mx-auto rounded-lg border border-dashed border-slate-200 px-2.5 py-2 text-[10px] text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
                              + Thêm ghi chú
                            </button>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center align-middle">
                          <div className="mx-auto inline-flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              title={order.is_hidden ? "Khôi phục đơn hàng" : "Ẩn đơn hàng"}
                              aria-label={order.is_hidden ? "Khôi phục đơn hàng" : "Ẩn đơn hàng"}
                              disabled={updatingOrderId === order.id}
                              onClick={() => toggleOrderVisibility(order)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                            >
                              {order.is_hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              type="button"
                              title="Xem chi tiết đơn hàng"
                              aria-label="Xem chi tiết đơn hàng"
                              onClick={() => setSelectedOrder(order)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          </div>
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

          <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-slate-200/70 bg-white px-2.5 py-1.5 sm:mt-4 sm:rounded-xl sm:px-3 sm:py-2">

            <p className="min-w-0 text-[9px] leading-3.5 text-slate-500 sm:text-[11px] sm:leading-4">

              Hiển thị{" "}

              <span className="font-semibold text-slate-800">

                {(currentPage - 1) * ORDERS_PER_PAGE + 1}–

                {Math.min(currentPage * ORDERS_PER_PAGE, filteredOrders.length)}

              </span>{" "}

              /{" "}

              <span className="font-semibold text-slate-800">{filteredOrders.length}</span>

              <span className="hidden sm:inline"> đơn hàng</span>

            </p>



            <div className="flex shrink-0 items-center gap-1">

              <button

                type="button"

                aria-label="Trang trước"

                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}

                disabled={currentPage === 1}

                className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-[10px] text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35 sm:h-8 sm:w-8 sm:rounded-lg sm:text-xs"

              >

                ‹

              </button>



              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (

                <button

                  key={page}

                  type="button"

                  aria-current={currentPage === page ? "page" : undefined}

                  onClick={() => setCurrentPage(page)}

                  className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-[9px] font-semibold transition sm:h-8 sm:min-w-8 sm:rounded-lg sm:px-2 sm:text-xs ${

                    currentPage === page

                      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"

                      : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"

                  }`}

                >

                  {page}

                </button>

              ))}



              <button

                type="button"

                aria-label="Trang tiếp theo"

                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}

                disabled={currentPage === totalPages}

                className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-[10px] text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35 sm:h-8 sm:w-8 sm:rounded-lg sm:text-xs"

              >

                ›

              </button>

            </div>

          </div>

        )}

      </main>



      {/* Order detail modal */}

      {selectedOrder && (

        <div

          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"

          onMouseDown={(event) => {

            if (event.target === event.currentTarget) setSelectedOrder(null);

          }}

        >

          <div className="max-h-[94dvh] w-full max-w-[780px] overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-xl print:max-h-none print:max-w-[210mm] print:rounded-none print:shadow-none">

            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3 sm:px-5 print:hidden">

              <div className="flex min-w-0 items-center gap-3">

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                  aria-label="Quay lại danh sách đơn hàng"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Quay lại</span>
                </button>

                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    INFIBETTER
                  </p>
                  <h2 className="mt-0.5 truncate text-sm font-semibold sm:text-base">
                    Order #{selectedOrder.id.slice(0, 8)}
                  </h2>
                </div>

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



            <div className="print:hidden px-4 pt-4 sm:px-5">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại danh sách đơn hàng
              </button>
            </div>

            <div id="invoice-print" className="space-y-5 p-4 sm:p-5 print:p-4">

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



              <div className="grid grid-cols-1 gap-x-8 gap-y-3 rounded-xl border border-neutral-200 p-3.5 text-xs sm:grid-cols-2 sm:p-4 sm:text-[11px]">

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

                <div className="sm:col-span-2">

                  <span className="text-neutral-400">Địa chỉ</span>

                  <p className="mt-0.5 leading-5">

                    {selectedOrder.address || "-"}

                    {selectedOrder.ward ? <><br />{selectedOrder.ward}</> : null}

                    {selectedOrder.district ? <><br />{selectedOrder.district}</> : null}

                    {selectedOrder.city ? <><br />{selectedOrder.city}</> : null}

                  </p>

                </div>

                {selectedOrder.notes && (

                  <div className="sm:col-span-2">

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

                        {formatUSD(Number(item.unit_price ?? 0))}

                      </p>

                    </div>

                  ))}

                </div>

              </div>



              <div className="space-y-2 border-t border-neutral-200 pt-4 text-[10px]">

                <div className="flex justify-between">

                  <span className="text-neutral-500">Subtotal</span>

                  <span>{formatUSD(Number(selectedOrder.subtotal ?? 0))}</span>

                </div>



                <div className="flex justify-between">

                  <span className="text-neutral-500">Shipping</span>

                  <span>{formatUSD(Number(selectedOrder.shipping_fee ?? 0))}</span>

                </div>



                {selectedOrder.discount_voucher_code && (

                  <div className="flex justify-between">

                    <span className="text-neutral-500">

                      Discount · {selectedOrder.discount_voucher_code}

                    </span>

                    <span className="font-semibold text-emerald-600">

                      -{formatUSD(Number(selectedOrder.discount_amount ?? 0))}

                    </span>

                  </div>

                )}



                {selectedOrder.shipping_voucher_code && (

                  <div className="flex justify-between">

                    <span className="text-neutral-500">

                      Shipping · {selectedOrder.shipping_voucher_code}

                    </span>

                    <span className="font-semibold text-emerald-600">

                      -{formatUSD(Number(selectedOrder.shipping_voucher_value ?? 0))}

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

                    {formatUSD(Number(selectedOrder.total ?? 0))}

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
