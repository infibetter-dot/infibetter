type ProductInteractionEvent =
  | "product_gallery_change"
  | "product_image_zoom"
  | "product_video_play"
  | "specification_view"
  | "faq_expand"
  | "product_description_click"
  | "related_product_click";

interface ProductInteractionParams {
  product_id: string;
  product_name: string;
  product_category?: string;
  interaction_type: string;
  interaction_value?: string;
  gallery_image_index?: number;
  content_section?: string;
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}


export function trackRemoveFromCart(
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>,
) {
  if (typeof window === "undefined" || items.length === 0) return;

  window.dataLayer = window.dataLayer || [];

  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: "remove_from_cart",
    ecommerce: {
      currency: "USD",
      value: items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
      items: items.map((item) => ({
        item_id: String(item.id),
        item_name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
      })),
    },
  });
}
export function trackProductInteraction(
  eventName: ProductInteractionEvent,
  params: ProductInteractionParams,
) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];

  window.dataLayer.push({
    event: eventName,
    ...params,
    page_type: "product",
    page_location: window.location.href,
  });
}