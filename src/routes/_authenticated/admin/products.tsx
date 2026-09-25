import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import { useQuery } from "@tanstack/react-query";

import {
  useMemo,
  useState,
} from "react";

import {
  Package,
  CircleCheck,
  CirclePause,
  CircleX,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

import ProductSearch from "@/components/admin/ProductSearch";
import ProductListItem from "@/components/admin/ProductListItem";

import { Accordion } from "@/components/ui/accordion";

export const Route = createFileRoute(
  "/_authenticated/admin/products"
)({
  component: ProductsAdminPage,
});

function ProductsAdminPage() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [openItem, setOpenItem] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 10;

  /* =========================================================
     CREATE PRODUCT
  ========================================================= */

  async function createProduct() {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: "Sản phẩm mới",
          slug: `product-${Date.now()}`,
          price: 0,
          compare_at_price: 0,
          stock: 0,
        })
        .select()
        .single();

      if (error) throw error;

      navigate({
        to: "/admin/products/$id",
        params: {
          id: data.id,
        },
      });
    } catch (error) {
      console.error("CREATE PRODUCT ERROR:", error);
    }
  }

  /* =========================================================
     PRODUCTS
  ========================================================= */

  const {
    data,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["admin-products"],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      return data;
    },
  });

  /* =========================================================
     CATEGORIES
  ========================================================= */

  const categories = useMemo(() => {
    return Array.from(
      new Map(
        (data ?? [])
          .filter(
            (item: any) =>
              item.categories?.id
          )
          .map((item: any) => [
            item.categories.id,
            item.categories.name,
          ])
      ).entries()
    ).map(([id, name]) => ({
      id,
      name,
    }));
  }, [data]);

  /* =========================================================
     FILTER
  ========================================================= */

  const products = useMemo(() => {
    const search = keyword
      .trim()
      .toLowerCase();

    return (data ?? []).filter(
      (item: any) => {
        const matchKeyword =
          !search ||
          item.name
            ?.toLowerCase()
            .includes(search);

        const matchCategory =
          categoryFilter === "all" ||
          item.category_id === categoryFilter;

        return (
          matchKeyword &&
          matchCategory
        );
      }
    );
  }, [
    data,
    keyword,
    categoryFilter,
  ]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {
    const allProducts = data ?? [];

    const total =
      allProducts.length;

    const active =
      allProducts.filter(
        (p: any) =>
          p.status === "active"
      ).length;

    const hidden =
      allProducts.filter(
        (p: any) =>
          p.status === "hidden"
      ).length;

    const outOfStock =
      allProducts.filter(
        (p: any) =>
          Number(p.stock) <= 0
      ).length;

    return {
      total,
      active,
      hidden,
      outOfStock,
    };
  }, [data]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      products.length / PAGE_SIZE
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedProducts =
    products.slice(
      (safeCurrentPage - 1) *
        PAGE_SIZE,
      safeCurrentPage * PAGE_SIZE
    );

  const start =
    products.length === 0
      ? 0
      : (safeCurrentPage - 1) *
          PAGE_SIZE +
        1;

  const end = Math.min(
    safeCurrentPage * PAGE_SIZE,
    products.length
  );

  /* =========================================================
     LOADING
  ========================================================= */

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-[#F8F7F3]"
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div className="mx-auto max-w-[1180px] px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 rounded-xl bg-white" />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({
                length: 4,
              }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 rounded-2xl bg-white"
                />
              ))}
            </div>

            <div className="h-[600px] rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
          className="min-h-screen bg-[#F8F7F3]"
          style={{
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
      <div className="mx-auto max-w-[1180px] px-4 py-3 sm:px-5">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <button
              type="button"
              onClick={() =>
  navigate({
    to: "/account",
  })
}
              className="mb-2 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[10px] font-medium text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50"
            >
              ← Quay lại dashboard
            </button>

            <div className="mb-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.20em] text-emerald-700">
                INFIBETTER Admin
              </span>
            </div>

            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-neutral-900 sm:text-5xl">
              Quản lý sản phẩm
            </h1>

            <p className="mt-1 text-[11px] text-neutral-500">
              Quản lý và cập nhật toàn bộ sản phẩm trong cửa hàng
            </p>
          </div>

          <button
            type="button"
            onClick={createProduct}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-neutral-900 px-3.5 text-[11px] font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black hover:shadow-lg active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />

            Thêm sản phẩm
          </button>
        </div>

        {/* =================================================
            KPI
        ================================================= */}

        <div className="mb-3 grid grid-cols-4 gap-0 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.025)]">

          {/* TOTAL */}

          <KpiCard
            label="Tổng sản phẩm"
            value={stats.total}
            icon={
              <Package className="h-5 w-5" />
            }
            iconClass="bg-blue-50 text-blue-600"
            badge={`${stats.total > 0 ? "+100" : "0"}%`}
            badgeClass="bg-blue-50 text-blue-600"
          />

          {/* ACTIVE */}

          <KpiCard
            label="Đang bán"
            value={stats.active}
            icon={
              <CircleCheck className="h-5 w-5" />
            }
            iconClass="bg-emerald-50 text-emerald-600"
            badge={
              stats.total > 0
                ? `${Math.round(
                    (stats.active /
                      stats.total) *
                      100
                  )}%`
                : "0%"
            }
            badgeClass="bg-emerald-50 text-emerald-600"
          />

          {/* HIDDEN */}

          <KpiCard
            label="Tạm ẩn"
            value={stats.hidden}
            icon={
              <CirclePause className="h-5 w-5" />
            }
            iconClass="bg-amber-50 text-amber-600"
            badge={
              stats.total > 0
                ? `${Math.round(
                    (stats.hidden /
                      stats.total) *
                      100
                  )}%`
                : "0%"
            }
            badgeClass="bg-amber-50 text-amber-600"
          />

          {/* OUT OF STOCK */}

          <KpiCard
            label="Hết hàng"
            value={stats.outOfStock}
            icon={
              <CircleX className="h-5 w-5" />
            }
            iconClass="bg-red-50 text-red-600"
            badge={
              stats.total > 0
                ? `${Math.round(
                    (stats.outOfStock /
                      stats.total) *
                      100
                  )}%`
                : "0%"
            }
            badgeClass="bg-red-50 text-red-600"
          />
        </div>

        {/* =================================================
            FILTER + SEARCH
        ================================================= */}

        <div className="mb-3 rounded-xl border border-neutral-200 bg-white p-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">

          <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">

            {/* CATEGORY */}

            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 xl:pb-0">

              <FilterButton
                active={
                  categoryFilter === "all"
                }
                onClick={() => {
                  setCategoryFilter(
                    "all"
                  );
                  setCurrentPage(1);
                }}
              >
                Tất cả
              </FilterButton>

              {categories.map(
                (category) => (
                  <FilterButton
                    key={category.id}
                    active={
                      categoryFilter ===
                      category.id
                    }
                    onClick={() => {
                      setCategoryFilter(
                        category.id
                      );
                      setCurrentPage(1);
                    }}
                  >
                    {category.name}
                  </FilterButton>
                )
              )}
            </div>

            {/* SEARCH */}

           <div className="w-full xl:max-w-[300px]">
  <ProductSearch
    value={keyword}
    onChange={(value) => {
      setKeyword(value);
      setCurrentPage(1);
    }}
  />
</div>
          </div>
        </div>

        {/* =================================================
            PRODUCT TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]">

          {/* TABLE HEADER */}

          <div className="hidden border-b border-neutral-200 bg-[#FBFBF9] px-4 py-3 lg:grid lg:grid-cols-[minmax(360px,1fr)_150px_100px_130px_80px] lg:items-center lg:gap-5">

            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Sản phẩm
            </div>

            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Giá
            </div>

            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Tồn kho
            </div>

            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Trạng thái
            </div>

            <div className="text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Xóa
            </div>
          </div>

          {/* PRODUCT LIST */}

          <Accordion
            type="single"
            collapsible
            value={openItem}
            onValueChange={setOpenItem}
          >
            {paginatedProducts.length ===
            0 ? (
              <div className="px-6 py-14 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
                  <Package className="h-7 w-7 text-neutral-400" />
                </div>

                <p className="mt-2.5 text-sm font-semibold text-neutral-800">
                  Không tìm thấy sản phẩm
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  Thử tìm kiếm hoặc chọn danh mục khác.
                </p>
              </div>
            ) : (
              paginatedProducts.map(
                (product: any) => (
                  <ProductListItem
                    key={product.id}
                    product={product}
                    onSaved={refetch}
                    collapse={() =>
                      setOpenItem("")
                    }
                  />
                )
              )
            )}
          </Accordion>

          {/* =================================================
              FOOTER / PAGINATION
          ================================================= */}

          {products.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-neutral-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-xs text-neutral-500">
                Hiển thị{" "}
                <span className="font-semibold text-neutral-700">
                  {start}-{end}
                </span>{" "}
                trong tổng{" "}
                <span className="font-semibold text-neutral-700">
                  {products.length}
                </span>{" "}
                sản phẩm
              </p>

              <div className="flex items-center gap-1.5">

                <PaginationButton
                  disabled={
                    safeCurrentPage ===
                    1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </PaginationButton>

                {Array.from({
                  length: totalPages,
                }).map((_, index) => {
                  const page =
                    index + 1;

                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() =>
                        setCurrentPage(
                          page
                        )
                      }
                      className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
                        safeCurrentPage ===
                        page
                          ? "bg-neutral-900 text-white"
                          : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <PaginationButton
                  disabled={
                    safeCurrentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </PaginationButton>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   KPI CARD
========================================================= */

function KpiCard({
  label,
  value,
  icon,
  iconClass,
  badge,
  badgeClass,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
  badge: string;
  badgeClass: string;
}) {
  return (
    <div className="group relative min-w-0 border-r border-neutral-100 bg-white px-4 py-2.5 last:border-r-0 transition-colors hover:bg-[#FAFAF8]">

      <div className="flex items-center justify-between gap-2">

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconClass}`}
          >
            {icon}
          </div>
        </div>

        <span
          className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${badgeClass}`}
        >
          {badge}
        </span>
      </div>

      <div className="mt-2.5">

        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
          {label}
        </p>

        <p className="mt-2 text-xl font-semibold leading-none tracking-tight text-neutral-900">
          {value}
        </p>

      </div>
    </div>
  );
}

/* =========================================================
   FILTER BUTTON
========================================================= */

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition ${
        active
          ? "bg-neutral-900 text-white shadow-sm"
          : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
      }`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   PAGINATION BUTTON
========================================================= */

function PaginationButton({
  disabled,
  onClick,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}