import { supabase } from "@/integrations/supabase/client";

export type ProductColorPreview = Record<string, string[]>;

export async function getProductColorPreview(
  productIds: string[]
): Promise<ProductColorPreview> {

  if (productIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("products")
    .select("id,color_preview")
    .in("id", productIds);

  if (error) {
    throw error;
  }

  const result: ProductColorPreview = {};

  for (const item of data ?? []) {
    result[item.id] = Array.isArray(item.color_preview)
      ? (item.color_preview as string[])
      : [];
  }

  return result;
}
