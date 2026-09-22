import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import ProductEditor from "@/components/admin/ProductEditor";

export const Route = createFileRoute(
  "/_authenticated/admin/products/$id"
)({
  component: ProductEditPage,
});

function ProductEditPage() {
  const { id } = Route.useParams();

  const {
    data: product,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["product", id],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container-x py-10">
        Đang tải...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-x py-10">
        Không tìm thấy sản phẩm.
      </div>
    );
  }

  return (
    <div className="container-x py-10">

      <h1 className="mb-8 text-4xl font-bold">
        Chỉnh sửa sản phẩm
      </h1>

      <ProductEditor
    product={product}
    onSaved={refetch}
    collapse={() => navigate({ to: "/admin/products" })}
/>

    </div>
  );
}