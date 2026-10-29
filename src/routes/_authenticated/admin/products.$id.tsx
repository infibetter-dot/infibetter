import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductEditor from "@/components/admin/ProductEditor";

export const Route = createFileRoute("/_authenticated/admin/products/$id")({
  component: ProductEditPage,
});

function ProductEditPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-product-edit", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  async function handleSaved() {
    await Promise.all([
      refetch(),
      queryClient.invalidateQueries({ queryKey: ["admin-products-list"] }),
      queryClient.invalidateQueries({ queryKey: ["product", id] }),
    ]);
  }

  function goBackToProducts() {
    navigate({ to: "/admin/products" });
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F7F8FA] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-[1440px] rounded-2xl border border-neutral-200 bg-white p-8 text-sm text-neutral-500 shadow-sm">
          Đang tải thông tin sản phẩm...
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-[#F7F8FA] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-bold text-neutral-900">
            Không thể tải sản phẩm
          </h1>
          <p className="mt-2 break-words text-sm text-red-700">
            {error instanceof Error
              ? error.message
              : "Đã xảy ra lỗi khi tải dữ liệu sản phẩm."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="h-10 rounded-xl bg-[#2D6A4F] px-4 text-sm font-semibold text-white hover:bg-[#245640]"
            >
              Thử tải lại
            </button>
            <button
              type="button"
              onClick={goBackToProducts}
              className="h-10 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#F7F8FA] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-bold text-neutral-900">
            Không tìm thấy sản phẩm
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Sản phẩm có thể đã bị xóa hoặc ID trên đường dẫn không chính xác.
          </p>
          <button
            type="button"
            onClick={goBackToProducts}
            className="mt-5 h-10 rounded-xl bg-[#2D6A4F] px-4 text-sm font-semibold text-white hover:bg-[#245640]"
          >
            Quay lại danh sách sản phẩm
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              INFIBETTER · PRODUCT EDITOR
            </p>
            <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Chỉnh sửa sản phẩm
            </h1>
            <p className="mt-1 truncate text-sm text-neutral-500">
              {product.name || "Sản phẩm chưa đặt tên"}
            </p>
          </div>
          <button
            type="button"
            onClick={goBackToProducts}
            className="h-10 shrink-0 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            ← Quay lại danh sách
          </button>
        </div>

        <ProductEditor
          key={String(product.id)}
          product={product}
          onSaved={handleSaved}
          collapse={goBackToProducts}
        />
      </div>
    </main>
  );
}
