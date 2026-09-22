import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import ProductEditor from "./ProductEditor";

import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getImageUrl } from "@/lib/storage";

interface Props{
    product:any;
    onSaved:()=>void;
    collapse:()=>void;
}

export default function ProductListItem({
    product,
    onSaved,
    collapse,
}: Props) {

async function deleteProduct() {
  if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) throw error;

    toast.success("Đã xóa sản phẩm");

    onSaved();

  } catch (err: any) {
    toast.error(err.message);
  }
}

  return (
  <AccordionItem
    id={`product-${product.id}`}
    value={product.id}
  className="group mb-5 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-colors duration-200 hover:border-stone-300"
>

     <AccordionTrigger className="px-6 py-5 hover:no-underline">

  <div className="flex w-full items-center gap-5 pr-4">

 <img
  src={getImageUrl(product.image_url, "card")}
  className="ml-2 h-20 w-20 rounded-2xl border border-stone-200 object-cover shadow-sm"
/>

    <div className="flex-1 text-left">

      <div className="text-lg font-semibold text-stone-900 transition-colors duration-300 group-hover:text-black">
        {product.name}
      </div>

      <div className="mt-1 text-sm text-muted-foreground">
        {product.price?.toLocaleString()} đ
        {" • "}
        Tồn: {product.stock}
      </div>

    </div>

    <button
      onClick={(e) => {
        e.stopPropagation();
        deleteProduct();
      }}
      className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-md active:scale-95"
    >
      Xóa
    </button>

  </div>

</AccordionTrigger>

      <AccordionContent className="border-t border-stone-100 bg-stone-50/40 px-6 py-6">

      <ProductEditor
    product={product}
    onSaved={onSaved}
    collapse={collapse}
/>

      </AccordionContent>

    </AccordionItem>
  );
}