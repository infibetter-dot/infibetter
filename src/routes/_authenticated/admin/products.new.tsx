import { createFileRoute } from "@tanstack/react-router";
import ProductEditor from "@/components/admin/ProductEditor";

export const Route = createFileRoute(
  "/_authenticated/admin/products/new"
)({
  component: NewProductPage,
});

function NewProductPage() {
  const emptyProduct = {
    id: "",
    name: "",
    slug: "",
    category_id: "",
    short_description: "",
    description: "",

    seo_title: "",
    seo_description: "",
    seo_keywords: "",

    image_url: "",

    price: 0,
    compare_at_price: 0,

    stock: 0,

    warranty: "",
    material: "",
    dimensions: "",
    color: "",
    light_source: "",
    power_source: "",
  };

  return (
    <div className="container-x py-10">

      <h1 className="mb-8 text-4xl font-bold">
        Thêm sản phẩm
      </h1>

      <ProductEditor
  product={emptyProduct}
  onSaved={() => {}}
/>

    </div>
  );
}