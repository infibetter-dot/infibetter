import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Search,
  Pencil,
  Eye,
  EyeOff,
  RefreshCw,
  Package,
  CircleDollarSign,
  Boxes,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Product = {
  id: string;
  name: string | null;
  slug: string | null;
  price: number | string | null;
  compare_at_price: number | string | null;
  stock: number | null;
  image_url: string | null;
  featured: boolean | null;
  best_seller: boolean | null;
  top_seller: boolean | null;
  is_active: boolean | null;
  status: string | null;
  category_id?: string | null;
  created_at?: string | null;
};

type Category = {
  id: string;
  name: string;
  slug: string | null;
  parent_id: string | null;
};

// These are the four collection links already used on the INFIBETTER homepage.
// The dropdown keeps these visible labels; filtering resolves them to real category
// records using slug first, then exact category-name aliases (never broad "contains"
// matching, which could incorrectly match a category such as "iPad Case").
const HOME_COLLECTIONS = [
  { slug: "iphone-cases", label: "Case", names: ["case", "cases", "iphone cases", "phone cases"] },
  { slug: "wireless-charging", label: "Wireless", names: ["wireless", "wireless charging", "wireless chargers", "wireless charger", "wireless charging accessories"] },
  { slug: "power-banks", label: "Power", names: ["power", "power banks", "power bank", "powerbank", "powerbanks", "portable chargers", "portable charger"] },
  { slug: "travel-power", label: "Travel", names: ["travel", "travel power", "travel charger", "travel chargers", "travel adapters", "travel adapter"] },
] as const;

function normalizeCategoryText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function resolveCollectionRoot(
  collectionSlug: string,
  categories: Category[],
) {
  const collection = HOME_COLLECTIONS.find((item) => item.slug === collectionSlug);
  if (!collection) return undefined;

  // Prefer the exact homepage/shop slug. If the database uses different slugs,
  // fall back only to exact known root names, excluding nested categories.
  return (
    categories.find((category) => normalizeCategoryText(category.slug) === normalizeCategoryText(collection.slug)) ??
    categories.find(
      (category) =>
        !category.parent_id &&
        collection.names.includes(normalizeCategoryText(category.name)),
    )
  );
}

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProductsPage,
});

function formatUSD(value: unknown) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function AdminProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const {
    data: categories = [],
    isError: categoriesError,
    error: categoryError,
  } = useQuery({
    queryKey: ["admin-product-categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, parent_id")
        .order("name", { ascending: true });

      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });

  const {
    data: products = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin-products-list"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, slug, price, compare_at_price, stock, image_url, featured, best_seller, top_seller, is_active, status, category_id, created_at",
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        (product.name ?? "").toLowerCase().includes(normalizedSearch) ||
        (product.slug ?? "").toLowerCase().includes(normalizedSearch) ||
        String(product.id).toLowerCase().includes(normalizedSearch);

      const isHidden =
        product.is_active !== true || product.status === "hidden";

      const matchesFilter =
        filter === "all" ||
        (filter === "visible" && !isHidden) ||
        (filter === "hidden" && isHidden);

      // Chỉ lọc theo 4 collection thật đã được homepage dùng qua slug.
      // Ví dụ "Case" dùng slug iphone-cases; không lấy nhầm root như iPad Case.
      const rootCategory = resolveCollectionRoot(categoryFilter, categories);

      const descendantIds = new Set<string>();
      if (rootCategory) {
        descendantIds.add(rootCategory.id);
        let parentIds = [rootCategory.id];

        while (parentIds.length > 0) {
          const children = categories.filter(
            (category) =>
              category.parent_id !== null &&
              parentIds.includes(category.parent_id) &&
              !descendantIds.has(category.id),
          );
          const childIds = children.map((category) => category.id);
          childIds.forEach((id) => descendantIds.add(id));
          parentIds = childIds;
        }
      }

      const matchesCategory =
        categoryFilter === "all" ||
        (rootCategory !== undefined &&
          descendantIds.has(product.category_id ?? ""));

      return matchesSearch && matchesFilter && matchesCategory;
    });
  }, [products, search, filter, categoryFilter, categories]);

  const visibleCount = products.filter(
    (product) => product.is_active === true && product.status !== "hidden",
  ).length;
  const hiddenCount = products.length - visibleCount;
  const totalStock = products.reduce(
    (sum, product) => sum + (Number(product.stock) || 0),
    0,
  );

  function openEditor(product: Product) {
    navigate({
      to: "/admin/products/$id",
      params: { id: String(product.id) },
    });
  }

  function previewProduct(product: Product) {
    if (!product.slug) return;
    window.open(`/products/${product.slug}`, "_blank", "noopener,noreferrer");
  }

  async function toggleProductVisibility(product: Product) {
    const currentlyHidden =
      product.is_active !== true || product.status === "hidden";

    const nextIsActive = currentlyHidden;
    const nextStatus = currentlyHidden ? "active" : "hidden";
    const actionLabel = currentlyHidden ? "hiển thị lại" : "ẩn";

    const confirmed = window.confirm(
      `Bạn có chắc muốn ${actionLabel} sản phẩm "${product.name || "Chưa đặt tên"}"?`,
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("products")
        .update({
          is_active: nextIsActive,
          status: nextStatus,
        })
        .eq("id", product.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["admin-products-list"] });
      await refetch();
    } catch (err) {
      console.error("Không thể cập nhật trạng thái sản phẩm:", err);
      window.alert(
        err instanceof Error
          ? `Không thể cập nhật trạng thái: ${err.message}`
          : "Không thể cập nhật trạng thái sản phẩm.",
      );
    }
  }

  async function refreshProducts() {
    await queryClient.invalidateQueries({ queryKey: ["admin-products-list"] });
    await refetch();
  }

  // TanStack Router treats $id as a child route of /admin/products.
  // The parent must render Outlet or the URL changes but the child editor never appears.
  // Keep the product list on the index URL and render the child editor on /admin/products/:id.
  const pathname = location.pathname.replace(/\/$/, "");
  if (pathname !== "/admin/products") {
    return <Outlet />;
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1440px] space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              INFIBETTER · ADMIN
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#202124] sm:text-3xl">
              Quản lý sản phẩm
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Chọn sản phẩm để mở trang chỉnh sửa thông tin.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshProducts}
            disabled={isFetching}
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
            Làm mới
          </button>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <StatCard
            icon={<Package size={18} />}
            label="Tổng sản phẩm"
            value={products.length.toLocaleString("en-US")}
          />
          <StatCard
            icon={<Eye size={18} />}
            label="Đang hiển thị"
            value={visibleCount.toLocaleString("en-US")}
          />
          <StatCard
            icon={<Boxes size={18} />}
            label="Tổng tồn kho"
            value={totalStock.toLocaleString("en-US")}
            hint={`${hiddenCount} sản phẩm đang ẩn/ngừng hoạt động`}
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-neutral-100 p-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo tên, slug hoặc ID sản phẩm..."
                className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  ["all", "Tất cả"],
                  ["visible", "Đang hiển thị"],
                  ["hidden", "Đang ẩn"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`h-9 rounded-lg px-3 text-xs font-semibold transition ${
                    filter === value
                      ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                      : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {label}
                </button>
              ))}
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                aria-label="Lọc theo danh mục"
                disabled={categoriesError}
                title={
                  categoriesError
                    ? "Không tải được danh mục từ Supabase"
                    : "Lọc theo danh mục chính trong database"
                }
                className="h-9 w-[112px] shrink-0 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="all">Tất cả danh mục</option>
                {HOME_COLLECTIONS.map((collection) => (
                  <option key={collection.slug} value={collection.slug}>
                    {collection.label}
                  </option>
                ))}
              </select>
            </div>
            {categoryFilter !== "all" &&
              !resolveCollectionRoot(categoryFilter, categories) &&
              !categoriesError && (
                <p className="mt-2 text-xs text-amber-700">
                  Chưa tìm thấy danh mục tương ứng trong database. Kiểm tra slug/tên danh mục trong Supabase.
                </p>
              )}
            {categoriesError && (
              <p className="mt-2 text-xs text-red-600">
                Không tải được danh mục từ Supabase:{" "}
                {categoryError instanceof Error
                  ? categoryError.message
                  : "Vui lòng kiểm tra bảng categories và quyền truy cập."}
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-neutral-500">
              <RefreshCw size={16} className="animate-spin" />
              Đang tải danh sách sản phẩm...
            </div>
          ) : isError ? (
            <div className="p-8 text-center">
              <p className="font-semibold text-red-600">
                Không thể tải danh sách sản phẩm.
              </p>
              <p className="mt-2 break-words text-sm text-neutral-500">
                {error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định."}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-lg bg-[#202124] px-4 py-2 text-sm font-semibold text-white hover:bg-black"
              >
                Thử lại
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-4 text-center">
              <Package size={28} className="text-neutral-300" />
              <p className="mt-3 font-semibold text-neutral-700">
                Không tìm thấy sản phẩm
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[820px] border-collapse text-left">
                  <thead className="bg-[#FAFAFA] text-[11px] uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Sản phẩm</th>
                      <th className="px-4 py-3 font-semibold">Giá bán</th>
                      <th className="px-4 py-3 font-semibold">Tồn kho</th>
                      <th className="px-4 py-3 font-semibold">Trạng thái</th>
                      <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredProducts.map((product) => {
                      const hidden =
                        product.is_active !== true || product.status === "hidden";
                      return (
                        <tr
                          key={product.id}
                          onClick={() => openEditor(product)}
                          className="cursor-pointer transition hover:bg-[#FAFCFA]"
                        >
                          <td className="px-5 py-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <img
                                src={product.image_url || "/placeholder.svg"}
                                alt={product.name || "Product"}
                                className="h-12 w-12 shrink-0 rounded-xl border border-neutral-200 bg-neutral-50 object-cover"
                                loading="lazy"
                              />
                              <div className="min-w-0">
                                <p className="max-w-[390px] truncate text-sm font-semibold text-neutral-900">
                                  {product.name || "Chưa đặt tên"}
                                </p>
                                <p className="mt-0.5 max-w-[390px] truncate text-xs text-neutral-400">
                                  /products/{product.slug || "no-slug"}
                                </p>
                                <p className="mt-0.5 text-[10px] text-neutral-400">
                                  ID: {product.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-neutral-900">
                              {formatUSD(product.price)}
                            </p>
                            {Number(product.compare_at_price) > Number(product.price) && (
                              <p className="mt-0.5 text-xs text-neutral-400 line-through">
                                {formatUSD(product.compare_at_price)}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-700">
                            {Number(product.stock) || 0}
                          </td>
                          <td className="px-4 py-3">
                            <StatusPill hidden={hidden} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  previewProduct(product);
                                }}
                                disabled={!product.slug}
                                title="Xem trang sản phẩm"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <ExternalLink size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleProductVisibility(product);
                                }}
                                className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition ${
                                  hidden
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                                    : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                                }`}
                              >
                                {hidden ? <Eye size={13} /> : <EyeOff size={13} />}
                                {hidden ? "Hiện lại" : "Ẩn"}
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openEditor(product);
                                }}
                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#2D6A4F] px-3 text-xs font-semibold text-white transition hover:bg-[#245640]"
                              >
                                <Pencil size={13} />
                                Chỉnh sửa
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="grid gap-3 p-3 md:hidden">
                {filteredProducts.map((product) => {
                  const hidden =
                    product.is_active !== true || product.status === "hidden";
                  return (
                    <article
                      key={product.id}
                      onClick={() => openEditor(product)}
                      className="cursor-pointer rounded-xl border border-neutral-200 p-3 transition active:bg-neutral-50"
                    >
                      <div className="flex gap-3">
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name || "Product"}
                          className="h-20 w-20 shrink-0 rounded-xl border border-neutral-200 bg-neutral-50 object-cover"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusPill hidden={hidden} />
                          </div>
                          <h2 className="mt-1 line-clamp-2 text-sm font-semibold text-neutral-900">
                            {product.name || "Chưa đặt tên"}
                          </h2>
                          <p className="mt-1 truncate text-xs text-neutral-400">
                            {product.slug || "Chưa có slug"}
                          </p>
                          <p className="mt-1 text-sm font-bold text-neutral-900">
                            {formatUSD(product.price)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
                        <span className="text-xs text-neutral-500">
                          Tồn kho: {Number(product.stock) || 0}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              previewProduct(product);
                            }}
                            disabled={!product.slug}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-700 disabled:opacity-40"
                          >
                            <Eye size={14} />
                            Xem
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleProductVisibility(product);
                            }}
                            className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold ${
                              hidden
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : "border-amber-200 bg-amber-50 text-amber-800"
                            }`}
                          >
                            {hidden ? <Eye size={13} /> : <EyeOff size={13} />}
                            {hidden ? "Hiện" : "Ẩn"}
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditor(product);
                            }}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#2D6A4F] px-3 text-xs font-semibold text-white hover:bg-[#245640]"
                          >
                            <Pencil size={13} />
                            Sửa
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {!isLoading && !isError && filteredProducts.length > 0 && (
            <div className="border-t border-neutral-100 px-4 py-3 text-xs text-neutral-500">
              Hiển thị {filteredProducts.length} / {products.length} sản phẩm · Bấm vào một sản phẩm để chỉnh sửa.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-900">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

function StatusPill({ hidden }: { hidden: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        hidden
          ? "bg-neutral-100 text-neutral-600"
          : "bg-emerald-50 text-emerald-700"
      }`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
          hidden ? "bg-neutral-400" : "bg-emerald-500"
        }`}
      />
      {hidden ? "Đang ẩn" : "Đang hiển thị"}
    </span>
  );
}
