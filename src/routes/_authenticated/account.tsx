import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  Star,
  FolderTree,
  Flame,
  Headset,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingBag,
  TicketPercent,
  Megaphone,
  UserRound,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatUSDFromVND } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [{ title: "Dashboard — INFIBETTER" }],
  }),
  component: AccountPage,
});

/* =========================================================
   TYPES
========================================================= */

type Period = "today" | "yesterday" | 7 | 14 | 30;

type Order = {
  id: string;
  status: string | null;
  total: number | null;
  created_at: string;
  full_name?: string | null;
  phone?: string | null;
};

type ChartPoint = {
  date: string;
  label: string;
  revenue: number;
  orders: number;
};

/* =========================================================
   SIDEBAR NAVIGATION
========================================================= */

const navigationGroups = [
{
  label: "CATALOG",
  items: [
    {
      label: "Sản phẩm",
      href: "/admin/products",
      icon: Package,
    },
    {
      label: "Danh mục",
      href: "/admin/categories",
      icon: FolderTree,
    },
    {
      label: "Mega Menu",
      href: "/admin/mega-menu",
      icon: Menu,
    },
    {
      label: "Homepage Categories",
      href: "/admin/homepage-categories",
      icon: LayoutDashboard,
    },
    {
      label: "Reviews",
      href: "/admin/reviews",
      icon: Star,
    },
    {
      label: "Phụ kiện",
      href: "/admin/accessories",
      icon: Boxes,
    },
  ],
},

  {
    label: "CUSTOMERS",
    items: [
      {
        label: "Khách hàng",
        href: "/admin/voucher-customers",
        icon: Users,
      },
      {
        label: "Khách tiềm năng",
        href: "/admin/potential-customers",
        icon: UserRound,
      },
      {
        label: "Support Requests",
        href: "/admin/support",
        icon: Headset,
      },
    ],
  },

  {
    label: "MARKETING",
    items: [
      {
        label: "Voucher",
        href: "/admin/vouchers",
        icon: TicketPercent,
      },
      {
        label: "Flash Sale",
        href: "/admin/flash-sale",
        icon: Flame,
      },
      {
        label: "Promotions",
        href: "/admin/promotions",
        icon: Megaphone,
      },
    ],
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function formatOrderDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function formatChartValue(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K`;
  }

  return String(value);
}

function getStatusLabel(status: string | null) {
  switch (status) {
    case "pending":
      return "Chờ xử lý";

    case "confirmed":
      return "Đã xác nhận";

    case "processing":
      return "Đang xử lý";

    case "shipping":
      return "Đang giao";

    case "completed":
      return "Hoàn thành";

    case "cancelled":
    case "cancel":
      return "Đã hủy";

    default:
      return status || "Không xác định";
  }
}

function getStatusClass(status: string | null) {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700";

    case "shipping":
      return "bg-blue-50 text-blue-700";

    case "processing":
    case "confirmed":
      return "bg-amber-50 text-amber-700";

    case "cancelled":
    case "cancel":
      return "bg-red-50 text-red-600";

    default:
      return "bg-neutral-100 text-neutral-600";
  }
}

function isCancelled(status: string | null) {
  return (
    status === "cancelled" ||
    status === "cancel"
  );
}

/* =========================================================
   PAGE
========================================================= */

function AccountPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [period, setPeriod] =
    useState<Period>(7);

  const [mobileSidebar, setMobileSidebar] =
    useState(false);

  /* =======================================================
     PROFILE
  ======================================================= */

  const profileQ = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,

    queryFn: async () => {
      const { data, error } =
        await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", user!.id)
          .maybeSingle();

      if (error) throw error;

      return data;
    },
  });

  /* =======================================================
     ORDERS ANALYTICS
  ======================================================= */

  const ordersQ = useQuery({
    queryKey: [
      "admin-dashboard-orders",
      period,
    ],

    enabled: !!user,

    queryFn: async () => {
      const now = new Date();

      let start: Date;
      let end: Date;

      /* =========================
         TODAY
      ========================= */

      if (period === "today") {
        start = new Date(now);
        start.setHours(0, 0, 0, 0);

        end = new Date(start);
        end.setDate(
          end.getDate() + 1,
        );
      }

      /* =========================
         YESTERDAY
      ========================= */

      else if (
        period === "yesterday"
      ) {
        end = new Date(now);
        end.setHours(0, 0, 0, 0);

        start = new Date(end);
        start.setDate(
          start.getDate() - 1,
        );
      }

      /* =========================
         7 / 14 / 30 DAYS
      ========================= */

      else {
        start = new Date(now);
        start.setHours(0, 0, 0, 0);

        start.setDate(
          start.getDate() -
            (period - 1),
        );

        end = new Date(now);
        end.setHours(0, 0, 0, 0);

        end.setDate(
          end.getDate() + 1,
        );
      }

      const { data, error } =
        await supabase
          .from("orders")
          .select(
            "id, status, total, created_at, is_hidden",
          )
          .eq("is_hidden", false)
          .gte(
            "created_at",
            start.toISOString(),
          )
          .lt(
            "created_at",
            end.toISOString(),
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(1000);

      if (error) throw error;

      return (data ?? []) as Order[];
    },
  });

  /* =======================================================
     RECENT ORDERS
  ======================================================= */

  const recentOrdersQ = useQuery({
    queryKey: [
      "admin-dashboard-recent-orders",
      period,
    ],

    enabled: !!user,

    queryFn: async () => {
      const now = new Date();

      let start: Date;
      let end: Date;

      if (period === "today") {
        start = new Date(now);
        start.setHours(0, 0, 0, 0);

        end = new Date(start);
        end.setDate(end.getDate() + 1);
      } else if (period === "yesterday") {
        end = new Date(now);
        end.setHours(0, 0, 0, 0);

        start = new Date(end);
        start.setDate(start.getDate() - 1);
      } else {
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - (period - 1));

        end = new Date(now);
        end.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() + 1);
      }

      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total, created_at, is_hidden, full_name, phone")
        .eq("is_hidden", false)
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString())
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      return (data ?? []) as Order[];
    },
  });

  /* =======================================================
     PRODUCTS COUNT
  ======================================================= */

  const productsQ = useQuery({
    queryKey: [
      "admin-dashboard-products-count",
    ],

    enabled: !!user,

    queryFn: async () => {
      const { count, error } =
        await supabase
          .from("products")
          .select("*", {
            count: "exact",
            head: true,
          });

      if (error) throw error;

      return count ?? 0;
    },
  });

  /* =======================================================
     CATEGORIES COUNT
  ======================================================= */

  const categoriesQ = useQuery({
    queryKey: [
      "admin-dashboard-categories-count",
    ],

    enabled: !!user,

    queryFn: async () => {
      const { count, error } =
        await supabase
          .from("categories")
          .select("*", {
            count: "exact",
            head: true,
          });

      if (error) throw error;

      return count ?? 0;
    },
  });

  /* =======================================================
     CUSTOMERS COUNT
  ======================================================= */

  const customersQ = useQuery({
    queryKey: [
      "admin-dashboard-customers-count",
    ],

    enabled: !!user,

    queryFn: async () => {
      const { count, error } =
        await supabase
          .from("profiles")
          .select("*", {
            count: "exact",
            head: true,
          });

      if (error) throw error;

      return count ?? 0;
    },
  });

  /* =======================================================
     ANALYTICS
  ======================================================= */

  const analytics = useMemo(() => {
    const orders =
      ordersQ.data ?? [];

    const validOrders =
      orders.filter(
        (order) =>
          !isCancelled(
            order.status,
          ),
      );

    const revenue =
      validOrders.reduce(
        (sum, order) =>
          sum +
          Number(
            order.total ?? 0,
          ),
        0,
      );

    const chartMap =
      new Map<
        string,
        ChartPoint
      >();

    /* =====================================================
       TODAY / YESTERDAY
       → HOURLY
    ===================================================== */

    if (
      period === "today" ||
      period === "yesterday"
    ) {
      const baseDate =
        new Date();

      baseDate.setHours(
        0,
        0,
        0,
        0,
      );

      if (
        period ===
        "yesterday"
      ) {
        baseDate.setDate(
          baseDate.getDate() -
            1,
        );
      }

      for (
        let hour = 0;
        hour < 24;
        hour++
      ) {
        const date =
          new Date(
            baseDate,
          );

        date.setHours(
          hour,
          0,
          0,
          0,
        );

        const key =
          `${date.getFullYear()}-${String(
            date.getMonth() + 1,
          ).padStart(
            2,
            "0",
          )}-${String(
            date.getDate(),
          ).padStart(
            2,
            "0",
          )}-${String(
            hour,
          ).padStart(
            2,
            "0",
          )}`;

        chartMap.set(
          key,
          {
            date: key,
            label: `${String(
              hour,
            ).padStart(
              2,
              "0",
            )}:00`,
            revenue: 0,
            orders: 0,
          },
        );
      }

      validOrders.forEach(
        (order) => {
          const date =
            new Date(
              order.created_at,
            );

          const key =
            `${date.getFullYear()}-${String(
              date.getMonth() + 1,
            ).padStart(
              2,
              "0",
            )}-${String(
              date.getDate(),
            ).padStart(
              2,
              "0",
            )}-${String(
              date.getHours(),
            ).padStart(
              2,
              "0",
            )}`;

          const point =
            chartMap.get(
              key,
            );

          if (!point) return;

          point.revenue +=
            Number(
              order.total ?? 0,
            );

          point.orders += 1;
        },
      );
    }

    /* =====================================================
       7 / 14 / 30 DAYS
       → DAILY
    ===================================================== */

    else {
      for (
        let i =
          period - 1;
        i >= 0;
        i--
      ) {
        const date =
          new Date();

        date.setHours(
          0,
          0,
          0,
          0,
        );

        date.setDate(
          date.getDate() -
            i,
        );

        const key =
          `${date.getFullYear()}-${String(
            date.getMonth() + 1,
          ).padStart(
            2,
            "0",
          )}-${String(
            date.getDate(),
          ).padStart(
            2,
            "0",
          )}`;

        chartMap.set(
          key,
          {
            date: key,

            label:
              new Intl.DateTimeFormat(
                "vi-VN",
                {
                  day: "2-digit",
                  month: "2-digit",
                },
              ).format(date),

            revenue: 0,
            orders: 0,
          },
        );
      }

      validOrders.forEach(
        (order) => {
          const date =
            new Date(
              order.created_at,
            );

          const key =
            `${date.getFullYear()}-${String(
              date.getMonth() + 1,
            ).padStart(
              2,
              "0",
            )}-${String(
              date.getDate(),
            ).padStart(
              2,
              "0",
            )}`;

          const point =
            chartMap.get(
              key,
            );

          if (!point) return;

          point.revenue +=
            Number(
              order.total ?? 0,
            );

          point.orders += 1;
        },
      );
    }

    return {
      revenue,
      orders:
        validOrders.length,
      chart:
        Array.from(
          chartMap.values(),
        ),
    };
  }, [
    ordersQ.data,
    period,
  ]);

  /* =======================================================
     SIGN OUT
  ======================================================= */

  async function signOut() {
    await qc.cancelQueries();

    qc.clear();

    await supabase.auth.signOut();

    navigate({
      to: "/auth",
      replace: true,
    });
  }

  /* =======================================================
     LOADING
  ======================================================= */

  const loading =
    ordersQ.isLoading ||
    recentOrdersQ.isLoading ||
    productsQ.isLoading ||
    categoriesQ.isLoading ||
    customersQ.isLoading;

  /* =======================================================
     SIDEBAR
  ======================================================= */

  function Sidebar() {
    return (
      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-[100]
          flex
          h-screen
          w-[250px]
          flex-col
          border-r
          border-[#E9E6DF]
          bg-[#FAF9F6]
          px-5
          py-7
          transition-transform
          duration-300
          lg:translate-x-0
          ${
            mobileSidebar
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* =================================================
            BRAND
        ================================================= */}

        <div className="shrink-0">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="
                font-display
                text-[21px]
                tracking-[0.14em]
                text-[#20251F]
              "
            >
              INFIBETTER
            </Link>

            <button
              type="button"
              onClick={() =>
                setMobileSidebar(
                  false,
                )
              }
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                text-neutral-500
                hover:bg-white
                lg:hidden
              "
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-2 text-[9px] uppercase tracking-[0.28em] text-neutral-400">
            Admin workspace
          </div>
        </div>

        {/* =================================================
            NAVIGATION

            flex-1 + min-h-0 + overflow-y-auto

            Đây là phần fix lỗi chính.
        ================================================= */}

        <nav
          className="
            mt-8
            min-h-0
            flex-1
            space-y-6
            overflow-y-auto
            overscroll-contain
            pb-4
            pr-1

            [&::-webkit-scrollbar]:w-1
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-[#D9DED4]
            [&::-webkit-scrollbar-track]:bg-transparent
          "
        >
          {navigationGroups.map(
            (group) => (
              <div
                key={
                  group.label
                }
              >
                <p className="mb-2 px-3 text-[9px] font-semibold tracking-[0.22em] text-neutral-400">
                  {group.label}
                </p>

                <div className="space-y-1">
                  {group.items.map(
                    (item) => {
                      const Icon =
                        item.icon;

                      const active =
                        item.href ===
                        "/account";

                      return (
                        <Link
                          key={
                            item.label
                          }
                          to={
                            item.href as never
                          }
                          onClick={() =>
                            setMobileSidebar(
                              false,
                            )
                          }
                          className={`
                            group
                            flex
                            h-10
                            shrink-0
                            items-center
                            gap-3
                            rounded-xl
                            px-3
                            text-[13px]
                            transition-all
                            duration-200

                            ${
                              active
                                ? "bg-[#E9F0E5] font-medium text-[#48633F]"
                                : "text-neutral-600 hover:bg-white hover:text-[#48633F]"
                            }
                          `}
                        >
                          <Icon
                            size={16}
                            strokeWidth={
                              1.7
                            }
                            className={
                              active
                                ? "text-[#6F8B5E]"
                                : "text-neutral-400 group-hover:text-[#6F8B5E]"
                            }
                          />

                          <span>
                            {
                              item.label
                            }
                          </span>
                        </Link>
                      );
                    },
                  )}
                </div>
              </div>
            ),
          )}
        </nav>

        {/* =================================================
            LOGOUT

            Không còn absolute.
            Luôn nằm dưới Sidebar.
        ================================================= */}

        <div className="mt-4 shrink-0 border-t border-[#E9E6DF] pt-4">
          <button
            type="button"
            onClick={signOut}
            className="
              flex
              h-10
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              text-[13px]
              text-neutral-500
              transition-colors
              hover:bg-white
              hover:text-red-600
            "
          >
            <LogOut
              size={16}
              strokeWidth={1.7}
            />

            Đăng xuất
          </button>
        </div>
      </aside>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <Sidebar />

      {/* MOBILE OVERLAY */}

      {mobileSidebar && (
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={() =>
            setMobileSidebar(
              false,
            )
          }
          className="
            fixed
            inset-0
            z-[90]
            bg-black/20
            backdrop-blur-[2px]
            lg:hidden
          "
        />
      )}

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <main className="min-h-screen lg:pl-[250px]">
        <div
          className="
            mx-auto
            max-w-[1500px]
            px-3
            pb-6
            pt-3
            sm:px-6
            sm:pb-8
            sm:pt-6
            lg:px-8
            lg:pt-8
          "
        >
          {/* =================================================
              TOP BAR
          ================================================= */}

          <header className="flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setMobileSidebar(
                  true,
                )
              }
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-[#E6E2DA]
                bg-white
                text-neutral-600
                lg:hidden
              "
            >
              <BarChart3 size={18} />
            </button>

            <div className="hidden lg:block">
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#6F8B5E]">
                INFIBETTER
              </p>

              <h1 className="mt-1 font-display text-[28px] text-[#252824]">
                Dashboard
              </h1>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                className="
                  hidden
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-[#E6E2DA]
                  bg-white
                  text-neutral-500
                  hover:text-[#48633F]
                  sm:flex
                "
              >
                <Search
                  size={14}
                  strokeWidth={1.7}
                />
              </button>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-full
                  border
                  border-[#E6E2DA]
                  bg-white
                  py-1.5
                  pl-2
                  pr-4
                "
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E9F0E5] text-[#58734F]">
                  <UserRound size={15} />
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-[11px] font-medium text-neutral-700">
                    {profileQ
                      .data
                      ?.full_name ||
                      "INFIBETTER Admin"}
                  </p>

                  <p className="text-[9px] text-neutral-400">
                    Administrator
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* MOBILE TITLE */}

          <div className="mt-2 lg:hidden">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6F8B5E]" />
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#6F8B5E]">
                INFIBETTER
              </p>
            </div>

            <h1 className="mt-0.5 font-display text-2xl font-medium leading-tight tracking-tight text-[#252824]">
              Dashboard
            </h1>
          </div>

          {/* =================================================
              WELCOME
          ================================================= */}

          <section className="mt-2.5 sm:mt-8">
            <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-neutral-400">
              Tổng quan
            </p>

            <h2 className="mt-0.5 text-base font-semibold leading-snug tracking-tight text-[#30332F] sm:mt-1 sm:text-xl sm:font-medium">
              Xin chào,{" "}
              {profileQ
                .data
                ?.full_name ||
                "INFIBETTER Admin"}
            </h2>

            <p className="mt-0.5 text-[10px] leading-4 text-neutral-500 sm:mt-1 sm:text-sm">
              Theo dõi hoạt động cửa hàng và đơn hàng của bạn.
            </p>
          </section>

          {/* =================================================
              KPI
          ================================================= */}

          <section className="mt-3 grid grid-cols-2 gap-1.5 sm:mt-7 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* DOANH THU */}

            <div className="min-w-0 rounded-xl border border-[#E7E4DD] bg-white p-2.5 sm:rounded-[22px] sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] leading-3 text-neutral-400 sm:text-[11px]">
                    Doanh thu
                  </p>

                  <p className="mt-1 text-base font-semibold leading-tight tracking-tight text-[#282B27] sm:mt-3 sm:text-2xl">
                    {loading
                      ? "..."
                      : formatUSDFromVND(
                          analytics.revenue,
                        )}
                  </p>
                </div>

                <div className="flex h-6 w-6 items-center justify-center rounded-md sm:h-9 sm:w-9 sm:rounded-xl bg-[#E9F0E5] text-[#58734F]">
                  <WalletCards
                    size={17}
                    strokeWidth={1.7}
                  />
                </div>
              </div>

              <p className="mt-1.5 text-[8px] leading-3 text-neutral-400 sm:mt-4 sm:text-[10px]">
                {period ===
                "today"
                  ? "Hôm nay"
                  : period ===
                      "yesterday"
                    ? "Hôm qua"
                    : `${period} ngày gần nhất`}
              </p>
            </div>

            {/* ĐƠN HÀNG */}

            <div className="min-w-0 rounded-xl border border-[#E7E4DD] bg-white p-2.5 sm:rounded-[22px] sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] leading-3 text-neutral-400 sm:text-[11px]">
                    Đơn hàng
                  </p>

                  <p className="mt-1 text-base font-semibold leading-tight tracking-tight text-[#282B27] sm:mt-3 sm:text-2xl">
                    {loading
                      ? "..."
                      : analytics.orders.toLocaleString(
                          "vi-VN",
                        )}
                  </p>
                </div>

                <div className="flex h-6 w-6 items-center justify-center rounded-md sm:h-9 sm:w-9 sm:rounded-xl bg-[#F4EEE5] text-[#9A7950]">
                  <ShoppingBag
                    size={17}
                    strokeWidth={1.7}
                  />
                </div>
              </div>

              <p className="mt-1.5 text-[8px] leading-3 text-neutral-400 sm:mt-4 sm:text-[10px]">
                Không tính đơn đã hủy
              </p>
            </div>

            {/* KHÁCH HÀNG */}

            <div className="min-w-0 rounded-xl border border-[#E7E4DD] bg-white p-2.5 sm:rounded-[22px] sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] leading-3 text-neutral-400 sm:text-[11px]">
                    Khách hàng
                  </p>

                  <p className="mt-1 text-base font-semibold leading-tight tracking-tight text-[#282B27] sm:mt-3 sm:text-2xl">
                    {loading
                      ? "..."
                      : customersQ.data?.toLocaleString(
                          "vi-VN",
                        )}
                  </p>
                </div>

                <div className="flex h-6 w-6 items-center justify-center rounded-md sm:h-9 sm:w-9 sm:rounded-xl bg-[#EDF2EF] text-[#5C786A]">
                  <Users
                    size={17}
                    strokeWidth={1.7}
                  />
                </div>
              </div>

              <p className="mt-1.5 text-[8px] leading-3 text-neutral-400 sm:mt-4 sm:text-[10px]">
                Hồ sơ khách hàng
              </p>
            </div>

            {/* SẢN PHẨM */}

            <div className="min-w-0 rounded-xl border border-[#E7E4DD] bg-white p-2.5 sm:rounded-[22px] sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] leading-3 text-neutral-400 sm:text-[11px]">
                    Sản phẩm
                  </p>

                  <p className="mt-1 text-base font-semibold leading-tight tracking-tight text-[#282B27] sm:mt-3 sm:text-2xl">
                    {loading
                      ? "..."
                      : productsQ.data?.toLocaleString(
                          "vi-VN",
                        )}
                  </p>
                </div>

                <div className="flex h-6 w-6 items-center justify-center rounded-md sm:h-9 sm:w-9 sm:rounded-xl bg-[#F0EEE9] text-[#706D63]">
                  <Package
                    size={17}
                    strokeWidth={1.7}
                  />
                </div>
              </div>

              <p className="mt-1.5 text-[8px] leading-3 text-neutral-400 sm:mt-4 sm:text-[10px]">
                {categoriesQ.data ??
                  0}{" "}
                danh mục
              </p>
            </div>
          </section>

          {/* =================================================
              ANALYTICS
          ================================================= */}

          <section className="mt-2.5 rounded-xl border border-[#E7E4DD] bg-white p-3 sm:mt-5 sm:rounded-[26px] sm:p-6 lg:p-7">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Analytics
                </p>

                <h2 className="mt-0.5 text-base font-semibold tracking-tight text-[#30332F] sm:text-lg">
                  Doanh thu & đơn hàng
                </h2>
              </div>

              {/* FILTER */}

              <div className="grid w-full grid-cols-5 gap-0.5 rounded-xl border border-[#E7E4DD] bg-[#FAF9F6] p-1 sm:flex sm:w-fit sm:gap-0 sm:rounded-full">
                {(
                  [
                    "today",
                    "yesterday",
                    7,
                    14,
                    30,
                  ] as Period[]
                ).map(
                  (item) => (
                    <button
                      key={String(
                        item,
                      )}
                      type="button"
                      onClick={() =>
                        setPeriod(
                          item,
                        )
                      }
                      className={`
                        min-w-0
                        rounded-lg
                        px-1
                        py-2
                        text-[9px]
                        leading-none
                        transition-all
                        sm:rounded-full
                        sm:px-4
                        sm:py-1.5
                        sm:text-[11px]

                        ${
                          period ===
                          item
                            ? "bg-[#2F3528] text-white shadow-sm"
                            : "text-neutral-500 hover:text-[#2F3528]"
                        }
                      `}
                    >
                      {item ===
                      "today"
                        ? "Hôm nay"
                        : item ===
                            "yesterday"
                          ? "Hôm qua"
                          : `${item} ngày`}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* CHART */}

            <div className="mt-2.5 h-[180px] w-full sm:mt-6 sm:h-[300px]">
              {ordersQ.isLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                  Đang tải dữ liệu...
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <AreaChart
                    data={
                      analytics.chart
                    }
                    margin={{
                      top: 6,
                      right: 2,
                      left: -22,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#6F8B5E"
                          stopOpacity={
                            0.22
                          }
                        />

                        <stop
                          offset="100%"
                          stopColor="#6F8B5E"
                          stopOpacity={
                            0
                          }
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="#ECEAE5"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="label"
                      tick={{
                        fontSize: 9,
                        fill: "#999",
                      }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={18}
                    />

                    <YAxis
                      tick={{
                        fontSize: 9,
                        fill: "#999",
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={
                        formatChartValue
                      }
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: 14,
                        border:
                          "1px solid #E7E4DD",
                        boxShadow:
                          "0 8px 30px rgba(0,0,0,0.08)",
                        fontSize: 12,
                      }}
                      formatter={(
                        value,
                        name,
                      ) => {
                        if (
                          name ===
                          "revenue"
                        ) {
                          return [
                            formatUSDFromVND(
                              Number(
                                value,
                              ),
                            ),
                            "Doanh thu",
                          ];
                        }

                        return [
                          Number(
                            value,
                          ),
                          "Đơn hàng",
                        ];
                      }}
                      labelFormatter={(
                        label,
                      ) => {
                        if (
                          period ===
                            "today" ||
                          period ===
                            "yesterday"
                        ) {
                          return `Khung giờ ${label}`;
                        }

                        return `Ngày ${label}`;
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6F8B5E"
                      strokeWidth={1.8}
                      fill="url(#revenueGradient)"
                      dot={false}
                      activeDot={{
                        r: 4,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="mt-1.5 flex items-center gap-3 text-[9px] text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6F8B5E]" />
                Doanh thu
              </div>

              <div>
                {period ===
                "today"
                  ? "Theo giờ hôm nay"
                  : period ===
                      "yesterday"
                    ? "Theo giờ hôm qua"
                    : "Theo ngày"}
              </div>
            </div>
          </section>

          {/* =================================================
              QUICK ACCESS
          ================================================= */}

          <section className="mt-2 grid grid-cols-2 gap-1.5 sm:mt-4 sm:gap-3">
            <QuickAccess
              icon={ClipboardList}
              title="Đơn hàng"
              description="Theo dõi và xử lý đơn"
              href="/admin/orders"
            />

            <QuickAccess
              icon={Headset}
              title="Support Requests"
              description="Quản lý yêu cầu hỗ trợ"
              href="/admin/support"
            />
          </section>

          {/* =================================================
              RECENT ORDERS
          ================================================= */}

          <section className="mt-3 rounded-2xl border border-[#E7E4DD] bg-white sm:mt-5 sm:rounded-[26px]">
            <div className="flex items-center justify-between gap-3 border-b border-[#ECEAE5] px-3 py-2.5 sm:px-5 sm:py-3">
              <h2 className="min-w-0 text-sm font-semibold tracking-tight text-[#30332F] sm:text-base">
                Đơn hàng gần đây
              </h2>

              <Link
                to="/admin/orders"
                className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-[#58734F] transition hover:text-[#2F3528] sm:text-xs"
              >
                Xem tất cả
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* DESKTOP */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#ECEAE5] text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                    <th className="px-6 py-4 font-medium">
                      Mã đơn
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Người mua
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Thời gian
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Giá trị
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Trạng thái
                    </th>

                    <th className="px-6 py-4 text-right font-medium">
                      Chi tiết
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrdersQ.isLoading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-10 text-center text-sm text-neutral-400"
                      >
                        Đang tải đơn
                        hàng...
                      </td>
                    </tr>
                  ) : recentOrdersQ
                      .data
                      ?.length ? (
                    recentOrdersQ.data.map(
                      (order) => (
                        <tr
                          key={
                            order.id
                          }
                          className="
                            border-b
                            border-[#F0EEE9]
                            last:border-0
                            hover:bg-[#FCFBF9]
                          "
                        >
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs font-medium text-[#30332F]">
                              #
                              {order.id.slice(
                                0,
                                8,
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <p className="text-xs font-medium text-[#30332F]">
                              {order.full_name || "-"}
                            </p>
                            {order.phone && (
                              <p className="mt-0.5 text-[10px] text-neutral-400">
                                {order.phone}
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-4 text-xs text-neutral-500">
                            {formatOrderDateTime(order.created_at)}
                          </td>

                          <td className="px-6 py-4 text-sm font-medium text-[#30332F]">
                            {formatUSDFromVND(
                              Number(
                                order.total ??
                                  0,
                              ),
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`
                                inline-flex
                                rounded-full
                                px-3
                                py-1
                                text-[10px]
                                font-medium
                                ${getStatusClass(
                                  order.status,
                                )}
                              `}
                            >
                              {getStatusLabel(
                                order.status,
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <Link
                              to="/admin/orders"
                              className="text-xs text-neutral-400 hover:text-[#58734F]"
                            >
                              Xem →
                            </Link>
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-sm text-neutral-400"
                      >
                        Chưa có đơn
                        hàng.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}

            <div className="divide-y divide-[#F0EEE9] md:hidden">
              {recentOrdersQ.data
                ?.length ? (
                recentOrdersQ.data.map(
                  (order) => (
                    <div
                      key={
                        order.id
                      }
                      className="p-3.5 sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-mono text-xs font-medium text-[#30332F]">
                            #
                            {order.id.slice(
                              0,
                              8,
                            )}
                          </p>

                          <p className="mt-0.5 text-[10px] text-neutral-400">
                            {formatOrderDateTime(order.created_at)}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-[#30332F]">
                            {order.full_name || "Khách hàng"}
                          </p>
                        </div>

                        <span
                          className={`
                            inline-flex
                            rounded-full
                            px-3
                            py-1
                            text-[10px]
                            font-medium
                            ${getStatusClass(
                              order.status,
                            )}
                          `}
                        >
                          {getStatusLabel(
                            order.status,
                          )}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-base font-semibold text-[#30332F]">
                          {formatUSDFromVND(
                            Number(
                              order.total ??
                                0,
                            ),
                          )}
                        </p>

                        <Link
                          to="/admin/orders"
                          className="text-xs font-medium text-[#58734F]"
                        >
                          Xem đơn →
                        </Link>
                      </div>
                    </div>
                  ),
                )
              ) : (
                <div className="px-5 py-12 text-center text-sm text-neutral-400">
                  Chưa có đơn
                  hàng.
                </div>
              )}
            </div>
          </section>

          {/* FOOTER */}

          <div className="py-5 text-center text-[9px] tracking-[0.12em] text-neutral-400 sm:py-8 sm:text-[10px]">
            INFIBETTER · ADMIN DASHBOARD
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   QUICK ACCESS
========================================================= */

function QuickAccess({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: typeof Package;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      to={href as never}
      className="
        group
        flex
        min-h-[44px]
        items-center
        rounded-lg
        border
        border-[#E7E4DD]
        bg-white
        px-2
        py-1.5
        sm:min-h-[60px]
        sm:rounded-xl
        sm:px-3
        sm:py-2.5
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-[#D9E2D4]
        hover:shadow-[0_12px_35px_rgba(40,45,35,0.06)]
      "
    >
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#EDF2EA] text-[#58734F] transition-transform duration-300 group-hover:scale-105 sm:h-8 sm:w-8 sm:rounded-lg">
          <Icon
            size={17}
            strokeWidth={1.7}
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold leading-tight text-[#30332F] sm:text-xs">
            {title}
          </p>

          <p className="mt-0.5 hidden truncate text-[10px] text-neutral-400 sm:block">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
