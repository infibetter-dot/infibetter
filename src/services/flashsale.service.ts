import { supabase } from "@/integrations/supabase/client";

export async function getFlashSaleProducts() {

  const { data, error } = await supabase
    .from("flash_sale_products")
    .select(`
      *,
      product:products(*),
      flash_sale:flash_sales(*)
    `)
    .eq("flash_sale.active", true);

  if (error) {

    console.error(error);

    return [];

  }

  return data ?? [];

}

export async function getActiveFlashSale() {

  const now = new Date().toISOString();

  const { data, error } = await supabase

    .from("flash_sales")

    .select("*")

    .eq("active", true)

    .lte("start_at", now)

    .gte("end_at", now)

    .single();

  if (error) {

    console.error(error);

    return null;

  }

  return data;

}